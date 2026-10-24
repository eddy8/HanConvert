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

  return { DEFAULT_SYMBOLS, SIMILAR_CHARACTERS, DEFAULTS, LIMITS, prepareOptions, randomBelow, createGenerator };
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
  let passwords = [];
  let hidden = false;
  let revision = 0;

  const format = (message, values = {}) => Object.entries(values).reduce((value, [key, entry]) => value.replaceAll(`{${key}}`, String(entry)), message || "");
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
  function invalidate() {
    syncFields();
    errorBox.hidden = true;
    clearResults(messages.changed);
  }
  function renderResults() {
    list.replaceChildren();
    for (const [index, password] of passwords.entries()) {
      const row = resultTemplate.content.cloneNode(true);
      row.querySelector(".password-result-index").textContent = String(index + 1).padStart(2, "0");
      const value = row.querySelector("input");
      value.type = hidden ? "password" : "text";
      value.value = password;
      value.setAttribute("aria-label", format(messages.resultLabel, { index: index + 1 }));
      const copy = row.querySelector("button");
      copy.setAttribute("aria-label", format(messages.copyOne, { index: index + 1 }));
      copy.title = copy.getAttribute("aria-label");
      copy.addEventListener("click", () => copyText(password, index));
      list.append(row);
    }
    empty.hidden = passwords.length > 0;
    visibility.setAttribute("aria-pressed", String(hidden));
    visibility.setAttribute("aria-label", hidden ? messages.show : messages.hide);
    visibility.title = hidden ? messages.show : messages.hide;
    visibility.querySelector("[data-icon='eye']").hidden = !hidden;
    visibility.querySelector("[data-icon='eye-off']").hidden = hidden;
  }
  function generate() {
    errorBox.hidden = true;
    syncFields();
    try {
      const generator = core.createGenerator(options());
      passwords = generator.generate();
      revision += 1;
      renderResults();
      summary.textContent = format(messages.summary, { count: passwords.length, length: generator.config.length, pool: generator.config.poolSize });
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
  async function copyText(value, index) {
    const currentRevision = revision;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboardUnavailable");
      await navigator.clipboard.writeText(value);
      if (currentRevision === revision) status.textContent = index === undefined ? messages.copiedAll : format(messages.copiedOne, { index: index + 1 });
    } catch {
      if (currentRevision !== revision) return;
      status.textContent = messages.copyFailed;
      if (index !== undefined) {
        hidden = false;
        renderResults();
        const input = list.querySelectorAll("input")[index];
        input.focus();
        input.select();
      }
    }
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
    if (event.target === lengthRange) field("length").value = lengthRange.value;
    invalidate();
  });
  document.querySelector("#passwordDefaultSymbols").addEventListener("click", () => {
    field("specialCharacters").value = core.DEFAULT_SYMBOLS;
    invalidate();
  });
  document.querySelectorAll("[data-password-preset]").forEach((button) => button.addEventListener("click", () => {
    const preset = button.dataset.passwordPreset;
    for (const key of ["uppercase", "lowercase", "numbers", "symbols", "excludeSimilar", "noAdjacentRepeat"]) field(key).checked = core.DEFAULTS[key];
    field("specialCharacters").value = core.DEFAULT_SYMBOLS;
    field("excludedCharacters").value = "";
    field("length").value = preset === "long" ? "32" : "20";
    if (preset === "readable") { field("excludeSimilar").checked = true; field("symbols").checked = false; }
    generate();
  }));
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
  window.addEventListener("pagehide", () => clearResults(messages.cleared));
  window.addEventListener("pageshow", (event) => { if (event.persisted) generate(); });
  generate();
})();
