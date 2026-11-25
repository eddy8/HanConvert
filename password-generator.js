(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PasswordGeneratorCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?";
  const SIMILAR_CHARACTERS = "Il1O0o|";
  const DEFAULTS = Object.freeze({ length: 20, count: 3, uppercase: true, lowercase: true, numbers: true, symbols: true, specialCharacters: DEFAULT_SYMBOLS, excludedCharacters: "", excludeSimilar: false, noAdjacentRepeat: false });
  const LIMITS = Object.freeze({ length: 128, count: 100, customCharacters: 256 });

  function fail(code, details = {}) {
    const error = new Error(code);
    error.code = code;
    Object.assign(error, details);
    throw error;
  }

  function prepareOptions(input = {}) {
    const options = { ...DEFAULTS, ...input };
    const length = Number(options.length);
    const count = Number(options.count);
    if (!Number.isInteger(length) || length < 1 || length > LIMITS.length) fail("invalidLength");
    if (!Number.isInteger(count) || count < 1 || count > LIMITS.count) fail("invalidCount");
    const symbols = [...new Set(String(options.specialCharacters))];
    if (options.symbols && (symbols.length > LIMITS.customCharacters || symbols.some((char) => !/^[\p{P}\p{S}]$/u.test(char)))) fail("invalidSymbols");
    const excluded = new Set([...String(options.excludedCharacters), ...(options.excludeSimilar ? SIMILAR_CHARACTERS : "")]);
    const groups = [
      ["uppercase", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"], ["lowercase", "abcdefghijklmnopqrstuvwxyz"],
      ["numbers", "0123456789"], ["symbols", symbols]
    ].filter(([key]) => options[key]).map(([key, chars]) => ({ key, chars: [...chars].filter((char) => !excluded.has(char)) }));
    if (!groups.length) fail("noGroups");
    for (const group of groups) if (!group.chars.length) fail("emptyGroup", { group: group.key });
    if (length < groups.length) fail("tooShort", { minimum: groups.length });
    const poolSize = groups.reduce((sum, group) => sum + group.chars.length, 0);
    if (options.noAdjacentRepeat && length > 1 && poolSize < 2) fail("impossibleRepeat");
    return { length, count, groups, poolSize, noAdjacentRepeat: Boolean(options.noAdjacentRepeat) };
  }

  function randomBelow(limit, cryptoSource = globalThis.crypto) {
    if (typeof limit !== "bigint" || limit < 1n) fail("invalidRandomLimit");
    if (!cryptoSource || typeof cryptoSource.getRandomValues !== "function") fail("cryptoUnavailable");
    if (limit === 1n) return 0n;
    const bits = (limit - 1n).toString(2).length;
    const bytes = new Uint8Array(Math.ceil(bits / 8));
    const mask = 255 >>> (bytes.length * 8 - bits);
    // Rejection sampling avoids giving some outcomes more probability than others.
    for (let attempt = 0; attempt < 1024; attempt += 1) {
      cryptoSource.getRandomValues(bytes);
      bytes[0] &= mask;
      let value = 0n;
      for (const byte of bytes) value = (value << 8n) | BigInt(byte);
      if (value < limit) return value;
    }
    fail("randomFailed");
  }

  function createGenerator(input = {}) {
    const config = prepareOptions(input);
    const { groups, length, noAdjacentRepeat } = config;
    const fullMask = (1 << groups.length) - 1;
    const memo = new Map();

    // Characters in one group have identical suffix counts. Track the previous
    // group to exclude its one previously used character without enumerating strings.
    function completions(remaining, missing, previousGroup) {
      if (remaining === 0) return missing === 0 ? 1n : 0n;
      const key = `${remaining}:${missing}:${previousGroup}`;
      if (memo.has(key)) return memo.get(key);
      let total = 0n;
      for (let group = 0; group < groups.length; group += 1) {
        const available = groups[group].chars.length - Number(noAdjacentRepeat && group === previousGroup);
        if (available) total += BigInt(available) * completions(remaining - 1, missing & ~(1 << group), noAdjacentRepeat ? group : -1);
      }
      memo.set(key, total);
      return total;
    }

    const total = completions(length, fullMask, -1);
    if (!total) fail("impossibleRepeat");

    function at(rank) {
      if (typeof rank !== "bigint" || rank < 0n || rank >= total) fail("invalidRank");
      let missing = fullMask;
      let previousCharacter = "";
      const output = [];
      for (let remaining = length; remaining > 0; remaining -= 1) {
        for (let group = 0; group < groups.length; group += 1) {
          const available = groups[group].chars.filter((char) => !noAdjacentRepeat || char !== previousCharacter);
          const nextMissing = missing & ~(1 << group);
          const suffixCount = completions(remaining - 1, nextMissing, noAdjacentRepeat ? group : -1);
          const weight = BigInt(available.length) * suffixCount;
          if (rank >= weight) { rank -= weight; continue; }
          const character = available[Number(rank / suffixCount)];
          rank %= suffixCount;
          output.push(character);
          previousCharacter = character;
          missing = nextMissing;
          break;
        }
      }
      return output.join("");
    }

    function generate(cryptoSource = globalThis.crypto) {
      if (BigInt(config.count) > total) fail("notEnoughCombinations", { available: total.toString() });
      if (!cryptoSource || typeof cryptoSource.getRandomValues !== "function") fail("cryptoUnavailable");
      const passwords = [];
      const swaps = new Map();
      let remaining = total;
      // A sparse Fisher-Yates draw samples unique ranks without retry loops.
      for (let index = 0; index < config.count; index += 1) {
        const draw = randomBelow(remaining, cryptoSource);
        const rank = swaps.get(draw) ?? draw;
        remaining -= 1n;
        swaps.set(draw, swaps.get(remaining) ?? remaining);
        swaps.delete(remaining);
        passwords.push(at(rank));
      }
      return passwords;
    }

    const bits = total.toString(2).length;
    const shift = Math.max(0, bits - 53);
    const entropy = Math.log2(Number(total >> BigInt(shift))) + shift;
    return { config, total, entropy, at, generate };
  }

  // Memorable passwords: words drawn from the EFF long wordlist (7,776 words, about 12.9 bits each).
  const WORDLIST = Object.freeze({
    url: "https://cdn.jsdmirror.cn/npm/@wordlist/english-eff@1.0.1/dist/data/long.json",
    integrity: "sha384-uLayHskc1q0oZVhv8+6Aei1qad3/sxnDVB4BGXE7csvQI4R/ZeEfOBXsx3o19bNM",
    size: 7776
  });
  const PASSPHRASE_DEFAULTS = Object.freeze({ words: 5, count: 3, separator: "-", capitalize: true, includeNumber: true });
  const PASSPHRASE_LIMITS = Object.freeze({ minWords: 3, maxWords: 12 });
  const SEPARATORS = Object.freeze(["-", ".", "_", " "]);

  function validateWordlist(list) {
    if (!Array.isArray(list) || list.length < 1024 || list.some((word) => typeof word !== "string" || !/^[a-z][a-z-]*$/u.test(word))) fail("wordlistFailed");
    return list;
  }

  function createPassphraseGenerator(input = {}, wordlist = []) {
    const options = { ...PASSPHRASE_DEFAULTS, ...input };
    const words = Number(options.words);
    const count = Number(options.count);
    if (!Number.isInteger(words) || words < PASSPHRASE_LIMITS.minWords || words > PASSPHRASE_LIMITS.maxWords) fail("invalidWords");
    if (!Number.isInteger(count) || count < 1 || count > LIMITS.count) fail("invalidCount");
    if (!SEPARATORS.includes(options.separator)) fail("invalidSeparator");
    const list = validateWordlist(wordlist);
    const size = BigInt(list.length);
    const capitalize = Boolean(options.capitalize);
    const includeNumber = Boolean(options.includeNumber);
    // One digit appended to one randomly chosen word adds words × 10 equally likely variants.
    const total = size ** BigInt(words) * (includeNumber ? BigInt(words * 10) : 1n);
    const config = { words, count, separator: options.separator, capitalize, includeNumber, poolSize: list.length };

    function generate(cryptoSource = globalThis.crypto) {
      if (BigInt(count) > total) fail("notEnoughCombinations", { available: total.toString() });
      const results = new Set();
      for (let attempt = 0; results.size < count; attempt += 1) {
        if (attempt > count * 16) fail("randomFailed");
        const picked = Array.from({ length: words }, () => list[Number(randomBelow(size, cryptoSource))]);
        const output = picked.map((word) => capitalize ? word[0].toUpperCase() + word.slice(1) : word);
        if (includeNumber) {
          const position = Number(randomBelow(BigInt(words), cryptoSource));
          output[position] += String(randomBelow(10n, cryptoSource));
        }
        results.add(output.join(options.separator));
      }
      return [...results];
    }

    const bits = total.toString(2).length;
    const shift = Math.max(0, bits - 53);
    const entropy = Math.log2(Number(total >> BigInt(shift))) + shift;
    return { config, total, entropy, generate };
  }

  // Reads a pasted password policy ("6-16位，须包含字母和数字", "8+ characters with a symbol", ...) into settings.
  const UNIT = String.raw`(?:位|碼|码|個字元|个字符|個字符|字元|字符|个字|個字|字|文字|桁|자리|자|characters?|chars?|digits?)`;
  const TYPE_PATTERNS = {
    bothCases: /大小写|大小寫|大\s*[/、・·]\s*小写|upper\s*(?:and|&|\/|-)\s*lower|mixed[\s-]*case|大文字(?:と|・|、)?小文字|英大小文字|대소문자|대\s*[·/]\s*소문자/iu,
    uppercase: /大写|大寫|upper\s*-?case|capital|英大文字|大文字|대문자/iu,
    lowercase: /小写|小寫|lower\s*-?case|英小文字|小文字|소문자/iu,
    letters: /字母|英文|letters?|alphabe|英字|英数|アルファベット|영문|영어|알파벳/iu,
    numbers: /数字|數字|numbers?|numeric|digits?|숫자/iu,
    symbols: /特殊|符号|符號|symbols?|special|punctuation|記号|기호|특수/iu
  };
  const NEGATION_BEFORE = /(?:不能|不可|不得|不允许|不允許|不支持|不包含|不含|不要|禁止|无需|無需|无|無|勿|\bno|\bnot|without|cannot|can't|must not|excluding)\s*(?:使用|包含|含有|输入|輸入|use|include|contain|any)?\s*$/iu;
  const NEGATION_AFTER = /^\s*(?:字符|字元|符号|符號|characters?|文字)?\s*(?:不可|不能|不允许|不允許|禁止|除外|は使用できません|は使えません|不可用|not allowed|are not allowed|is not allowed|불가|제외|사용 불가|사용할 수 없)/iu;
  const ONLY_NEAR = /(?:纯|純|仅|僅|只|only|のみ|だけ|만)/iu;

  function mentions(text, pattern) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    let positive = false;
    let negative = false;
    for (const match of text.matchAll(new RegExp(pattern.source, flags))) {
      const before = text.slice(Math.max(0, match.index - 10), match.index);
      const after = text.slice(match.index + match[0].length, match.index + match[0].length + 16);
      if (NEGATION_BEFORE.test(before) || NEGATION_AFTER.test(after)) negative = true;
      else positive = true;
    }
    return positive ? true : negative ? false : undefined;
  }

  function parseRequirements(input) {
    const raw = String(input || "").slice(0, 2000);
    const text = raw.normalize("NFKC");
    const number = (value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 1 && parsed <= LIMITS.length ? parsed : undefined;
    };
    let min;
    let max;
    let exact;
    const range = text.match(new RegExp(String.raw`(\d{1,3})\s*${UNIT}?\s*(?:-|–|—|~|〜|至|到|to)\s*(\d{1,3})\s*${UNIT}?`, "iu"));
    if (range) [min, max] = [number(range[1]), number(range[2])];
    min ??= number(text.match(/(?:至少|最少|不少于|不少於|不低于|不低於|at\s+least|minimum(?:\s+of)?|min\.?)\s*(\d{1,3})/iu)?.[1]
      ?? text.match(new RegExp(String.raw`(\d{1,3})\s*${UNIT}?\s*(?:以上|或以上|or\s+more|or\s+longer|\+|이상)`, "iu"))?.[1]);
    max ??= number(text.match(/(?:最多|最长|最長|不超过|不超過|不多于|at\s+most|maximum(?:\s+of)?|max\.?|up\s+to|no\s+more\s+than)\s*(\d{1,3})/iu)?.[1]
      ?? text.match(new RegExp(String.raw`(\d{1,3})\s*${UNIT}?\s*(?:以内|以內|以下|or\s+fewer|or\s+less|이하|이내)`, "iu"))?.[1]);
    if (min === undefined && max === undefined) exact = number(text.match(new RegExp(String.raw`(\d{1,3})\s*${UNIT}`, "iu"))?.[1]);
    if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];

    const found = {};
    for (const key of Object.keys(TYPE_PATTERNS)) found[key] = mentions(text, TYPE_PATTERNS[key]);
    const numbersOnly = found.numbers && new RegExp(String.raw`${ONLY_NEAR.source}\s*(?:限|能|能是|可|输入|輸入|為|为)?\s*(?:${TYPE_PATTERNS.numbers.source})|(?:${TYPE_PATTERNS.numbers.source})\s*(?:${ONLY_NEAR.source})`, "iu").test(text);
    let types;
    if (numbersOnly) {
      types = { uppercase: false, lowercase: false, numbers: true, symbols: false };
    } else if ([found.bothCases, found.uppercase, found.lowercase, found.letters, found.numbers].every((value) => value !== true) && found.symbols !== undefined) {
      // A rule that only talks about symbols ("allowed symbols: ...") leaves letters and numbers as they are.
      types = { symbols: found.symbols };
    } else if ([found.bothCases, found.uppercase, found.lowercase, found.letters, found.numbers].some((value) => value === true)) {
      const upper = found.bothCases === true || found.uppercase === true;
      const lower = found.bothCases === true || found.lowercase === true;
      const genericLetters = found.letters === true && !upper && !lower;
      types = { uppercase: upper || genericLetters, lowercase: lower || genericLetters, numbers: found.numbers === true, symbols: found.symbols === true };
    }

    // Explicit symbol lists such as "特殊字符仅限 !@#$%^&*" become the custom symbol set.
    let specialCharacters;
    if (types?.symbols) {
      // Use the text as pasted: NFKC would turn full-width punctuation such as "，" into ASCII symbols.
      const runs = raw.match(/[!-/:-@[-`{-~]{3,}/gu) || [];
      let run = runs.sort((a, b) => b.length - a.length)[0] || "";
      // "(!@#$%^&*)" lists the symbols inside the brackets; the brackets themselves are not part of the set.
      if (run.length > 4 && ["()", "[]", "{}", "<>"].includes(run[0] + run.at(-1))) run = run.slice(1, -1);
      const symbols = [...new Set(run)].join("");
      if (symbols.length >= 3) specialCharacters = symbols;
    }

    let length;
    if (exact !== undefined) length = exact;
    else if (min !== undefined || max !== undefined) {
      length = Math.max(min ?? 1, 20);
      if (max !== undefined) length = Math.min(length, max);
    }
    if (length === undefined && !types) return null;
    return { length, min, max, ...(types || {}), ...(specialCharacters ? { specialCharacters } : {}) };
  }

  return {
    DEFAULT_SYMBOLS, SIMILAR_CHARACTERS, DEFAULTS, LIMITS, WORDLIST, PASSPHRASE_DEFAULTS, PASSPHRASE_LIMITS, SEPARATORS,
    prepareOptions, randomBelow, createGenerator, createPassphraseGenerator, validateWordlist, parseRequirements
  };
});

(function () {
  "use strict";
  if (typeof document === "undefined" || document.body?.dataset.toolPage !== "password-generator") return;
  const core = globalThis.PasswordGeneratorCore;
  const messages = JSON.parse(document.querySelector("#passwordMessages").textContent);
  const form = document.querySelector("#passwordForm");
  const field = (name) => form.elements.namedItem(name);
  const list = document.querySelector("#passwordResults");
  const status = document.querySelector("#passwordStatus");
  const errorBox = document.querySelector("#passwordError");
  const empty = document.querySelector("#passwordEmpty");
  const summary = document.querySelector("#passwordSummary");
  const meter = document.querySelector("#passwordStrength");
  const strengthLabel = document.querySelector("#passwordStrengthLabel");
  const copyAll = document.querySelector("#passwordCopyAll");
  const download = document.querySelector("#passwordDownload");
  const visibility = document.querySelector("#passwordVisibility");
  const clear = document.querySelector("#passwordClear");
  const lengthRange = document.querySelector("#passwordLengthRange");
  const resultTemplate = document.querySelector("#passwordResultTemplate");
  const modeButtons = document.querySelectorAll("[data-password-mode]");
  const rulesInput = document.querySelector("#passwordRules");
  const rulesResult = document.querySelector("#passwordRulesResult");
  let passwords = [];
  let hidden = false;
  let revision = 0;
  let mode = "characters";
  let wordlist = null;
  let wordlistRequest = null;

  // The word list is public data from the CDN, checked with SRI; nothing about the user is sent.
  function loadWordlist() {
    wordlistRequest ??= fetch(core.WORDLIST.url, { integrity: core.WORDLIST.integrity, mode: "cors", credentials: "omit" })
      .then((response) => {
        if (!response.ok) throw new Error("wordlistFailed");
        return response.json();
      })
      .then((list) => { wordlist = Object.freeze(core.validateWordlist(list)); return wordlist; })
      .catch((error) => {
        wordlistRequest = null;
        const failure = new Error("wordlistFailed");
        failure.code = "wordlistFailed";
        failure.cause = error;
        throw failure;
      });
    return wordlistRequest;
  }

  const format = (message, values = {}) => Object.entries(values).reduce((value, [key, entry]) => value.replaceAll(`{${key}}`, String(entry)), message || "");
  function wordOptions() {
    return { words: field("words").value, count: field("count").value, separator: field("separator").value,
      capitalize: field("capitalize").checked, includeNumber: field("includeNumber").checked };
  }
  function setMode(next) {
    mode = next === "words" ? "words" : "characters";
    modeButtons.forEach((button) => {
      const active = button.dataset.passwordMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
    document.querySelectorAll("[data-password-panel]").forEach((panel) => { panel.hidden = panel.dataset.passwordPanel !== mode; });
  }
  function options() {
    return { length: field("length").value, count: field("count").value, uppercase: field("uppercase").checked,
      lowercase: field("lowercase").checked, numbers: field("numbers").checked, symbols: field("symbols").checked,
      specialCharacters: field("specialCharacters").value, excludedCharacters: field("excludedCharacters").value,
      excludeSimilar: field("excludeSimilar").checked, noAdjacentRepeat: field("noAdjacentRepeat").checked };
  }
  function messageFor(error) {
    return format(messages.errors[error.code] || messages.errors.unexpected, { minimum: error.minimum, available: error.available, group: messages.groups[error.group] || "" });
  }
  function showError(error) { errorBox.textContent = messageFor(error); errorBox.hidden = false; }
  function syncFields() {
    field("specialCharacters").disabled = !field("symbols").checked;
    document.querySelector("#passwordDefaultSymbols").disabled = !field("symbols").checked;
    const length = Number(field("length").value);
    if (Number.isInteger(length) && length >= 1 && length <= 128) lengthRange.value = String(length);
  }
  function clearResults(message) {
    cancelScheduled();
    revision += 1;
    passwords = [];
    list.replaceChildren();
    empty.hidden = false;
    summary.textContent = messages.noResults;
    meter.hidden = true;
    strengthLabel.textContent = "";
    for (const button of [copyAll, download, visibility, clear]) button.disabled = true;
    status.textContent = message;
  }
  // Settings regenerate automatically: toggles at once, the slider once per frame, typed fields after a pause.
  const TYPING_DELAY = 300;
  const TYPED_FIELDS = new Set(["length", "count", "words", "specialCharacters", "excludedCharacters"]);
  let typingTimer = 0;
  let frameRequest = 0;
  function cancelScheduled() {
    clearTimeout(typingTimer);
    typingTimer = 0;
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
  }
  function scheduleAfterTyping() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(generate, TYPING_DELAY);
  }
  function scheduleNextFrame() {
    if (!frameRequest) frameRequest = requestAnimationFrame(generate);
  }
  function renderResults() {
    list.replaceChildren();
    for (const [index, password] of passwords.entries()) {
      const row = resultTemplate.content.cloneNode(true);
      row.querySelector(".password-result-index").textContent = String(index + 1).padStart(2, "0");
      let value = row.querySelector("input");
      if (mode === "words") {
        // Passphrases are meant to be read and typed, so let them wrap instead of scrolling sideways.
        const area = document.createElement("textarea");
        for (const name of ["readonly", "autocomplete", "spellcheck", "data-lpignore", "data-1p-ignore"]) if (value.hasAttribute(name)) area.setAttribute(name, value.getAttribute(name));
        area.rows = 1;
        area.dataset.masked = String(hidden);
        value.replaceWith(area);
        value = area;
      } else {
        value.type = hidden ? "password" : "text";
      }
      value.value = mode === "words" && hidden ? "•".repeat(password.length) : password;
      value.setAttribute("aria-label", format(messages.resultLabel, { index: index + 1 }));
      const copy = row.querySelector("button");
      copy.setAttribute("aria-label", format(messages.copyOne, { index: index + 1 }));
      copy.title = copy.getAttribute("aria-label");
      copy.addEventListener("click", () => copyText(password, index));
      list.append(row);
    }
    fitResultAreas();
    empty.hidden = passwords.length > 0;
    visibility.setAttribute("aria-pressed", String(hidden));
    visibility.setAttribute("aria-label", hidden ? messages.show : messages.hide);
    visibility.title = hidden ? messages.show : messages.hide;
    // SVG elements have no `hidden` property, so toggle the attribute that the CSS targets.
    visibility.querySelector("[data-icon='eye']").toggleAttribute("hidden", !hidden);
    visibility.querySelector("[data-icon='eye-off']").toggleAttribute("hidden", hidden);
  }
  function fitResultAreas() {
    for (const area of list.querySelectorAll("textarea")) {
      area.style.height = "auto";
      area.style.height = `${area.scrollHeight}px`;
    }
  }
  function generate() {
    cancelScheduled();
    errorBox.hidden = true;
    syncFields();
    if (mode === "words" && !wordlist) {
      const request = ++revision;
      status.textContent = messages.wordlistLoading;
      loadWordlist().then(() => { if (request === revision && mode === "words") generate(); }, (error) => {
        if (request !== revision) return;
        clearResults(messages.failed);
        showError(error);
      });
      return;
    }
    try {
      const generator = mode === "words" ? core.createPassphraseGenerator(wordOptions(), wordlist) : core.createGenerator(options());
      passwords = generator.generate();
      revision += 1;
      renderResults();
      summary.textContent = mode === "words"
        ? format(messages.wordsSummary, { count: passwords.length, words: generator.config.words, pool: generator.config.poolSize.toLocaleString() })
        : format(messages.summary, { count: passwords.length, length: generator.config.length, pool: generator.config.poolSize });
      const level = generator.entropy < 50 ? 0 : generator.entropy < 80 ? 1 : generator.entropy < 110 ? 2 : 3;
      meter.hidden = false;
      meter.value = Math.min(128, generator.entropy);
      meter.setAttribute("aria-valuetext", messages.strength[level]);
      strengthLabel.textContent = format(messages.strengthLabel, { level: messages.strength[level] });
      for (const button of [copyAll, download, visibility, clear]) button.disabled = false;
      status.textContent = format(messages.generated, { count: passwords.length });
    } catch (error) {
      clearResults(messages.failed);
      showError(error);
    }
  }
  // Fallback for browsers or non-secure pages without the async Clipboard API.
  function legacyCopy(value) {
    const previousFocus = document.activeElement;
    const area = document.createElement("textarea");
    area.value = value;
    area.readOnly = true;
    area.setAttribute("aria-hidden", "true");
    area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.append(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    area.remove();
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
    return copied;
  }
  async function copyText(value, index) {
    const currentRevision = revision;
    let copied = false;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboardUnavailable");
      await navigator.clipboard.writeText(value);
      copied = true;
    } catch {
      if (currentRevision !== revision) return;
      copied = legacyCopy(value);
    }
    if (currentRevision !== revision) return;
    if (copied) {
      status.textContent = index === undefined ? messages.copiedAll : format(messages.copiedOne, { index: index + 1 });
      return;
    }
    if (index === undefined) {
      status.textContent = messages.copyAllFailed;
      return;
    }
    // Reveal only the row being copied so the user can select it; the other rows keep their visibility.
    status.textContent = messages.copyFailed;
    const input = list.querySelectorAll("input, textarea")[index];
    if (input instanceof HTMLTextAreaElement) { input.value = passwords[index]; input.dataset.masked = "false"; fitResultAreas(); }
    else input.type = "text";
    input.focus();
    input.select();
  }
  function exportPasswords() {
    if (!passwords.length) return;
    const url = URL.createObjectURL(new Blob([passwords.join("\n") + "\n"], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "jianfan-passwords.txt";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = messages.downloaded;
  }
  form.addEventListener("submit", (event) => { event.preventDefault(); generate(); });
  form.addEventListener("input", (event) => {
    if (event.target === rulesInput) return;
    if (event.target === lengthRange) {
      field("length").value = lengthRange.value;
      scheduleNextFrame();
    } else if (TYPED_FIELDS.has(event.target.name)) {
      syncFields();
      scheduleAfterTyping();
    } else {
      generate();
    }
  });
  // Leaving a typed field (or using a number spinner) applies a pending edit at once. Without a pending
  // edit nothing happens, so moving focus to a copy button does not replace the passwords being copied.
  form.addEventListener("change", (event) => {
    if (TYPED_FIELDS.has(event.target.name) && typingTimer) generate();
  });
  document.querySelector("#passwordDefaultSymbols").addEventListener("click", () => {
    field("specialCharacters").value = core.DEFAULT_SYMBOLS;
    generate();
  });
  document.querySelectorAll("[data-password-preset]").forEach((button) => button.addEventListener("click", () => {
    const preset = button.dataset.passwordPreset;
    for (const key of ["uppercase", "lowercase", "numbers", "symbols", "excludeSimilar", "noAdjacentRepeat"]) field(key).checked = core.DEFAULTS[key];
    field("specialCharacters").value = core.DEFAULT_SYMBOLS;
    field("excludedCharacters").value = "";
    field("length").value = preset === "long" ? "32" : preset === "pin" ? "6" : "20";
    if (preset === "readable") { field("excludeSimilar").checked = true; field("symbols").checked = false; }
    if (preset === "pin") for (const key of ["uppercase", "lowercase", "symbols"]) field(key).checked = false;
    generate();
  }));
  modeButtons.forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.passwordMode === mode) return;
    setMode(button.dataset.passwordMode);
    generate();
  }));

  // Paste a site's password policy to set length and character types in one step.
  let rulesTimer = 0;
  function applyRules() {
    clearTimeout(rulesTimer);
    const text = rulesInput.value.trim();
    if (!text) { rulesResult.textContent = messages.rulesHint; return; }
    const rules = core.parseRequirements(text);
    if (!rules) { rulesResult.textContent = messages.rulesNotFound; return; }
    for (const key of ["uppercase", "lowercase", "numbers", "symbols"]) if (typeof rules[key] === "boolean") field(key).checked = rules[key];
    if (rules.specialCharacters) field("specialCharacters").value = rules.specialCharacters;
    else if (rules.symbols && !field("specialCharacters").value.trim()) field("specialCharacters").value = core.DEFAULT_SYMBOLS;
    const selected = ["uppercase", "lowercase", "numbers", "symbols"].filter((key) => field(key).checked);
    if (rules.length) field("length").value = String(Math.min(core.LIMITS.length, Math.max(rules.length, selected.length)));
    const parts = [];
    if (rules.length) parts.push(format(rules.min || rules.max ? messages.rulesLengthRange : messages.rulesLength, { length: field("length").value, min: rules.min ?? 1, max: rules.max ?? core.LIMITS.length }));
    if (selected.length) parts.push(selected.map((key) => messages.groups[key]).join(messages.listSeparator));
    rulesResult.textContent = format(messages.rulesApplied, { rules: parts.join(messages.partSeparator) });
    if (mode !== "characters") setMode("characters");
    generate();
  }
  rulesInput.addEventListener("paste", () => setTimeout(applyRules, 0));
  rulesInput.addEventListener("input", (event) => {
    clearTimeout(rulesTimer);
    if (event.inputType !== "insertFromPaste") rulesTimer = setTimeout(applyRules, 600);
  });
  rulesInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); applyRules(); } });
  document.querySelector("#passwordRulesApply").addEventListener("click", applyRules);
  copyAll.addEventListener("click", () => copyText(passwords.join("\n")));
  download.addEventListener("click", exportPasswords);
  clear.addEventListener("click", () => clearResults(messages.cleared));
  visibility.addEventListener("click", () => { hidden = !hidden; renderResults(); });
  document.querySelector("#localeSelect").addEventListener("change", (event) => {
    const prefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
    const prefix = prefixes[event.target.value];
    if (prefix === undefined) return;
    try { localStorage.setItem("jianfan-locale-manual", "1"); } catch { /* Navigation still works when storage is unavailable. */ }
    window.location.assign(`/${prefix}password-generator/`);
  });
  window.addEventListener("resize", fitResultAreas);
  window.addEventListener("pagehide", () => clearResults(messages.cleared));
  window.addEventListener("pageshow", (event) => { if (event.persisted) generate(); });
  generate();
})();
