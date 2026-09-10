(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.TextFormatterCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_INPUT_CHARACTERS = 3000000;
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
  const HAN = "\\p{Script=Han}";
  const LATIN_OR_NUMBER = "[\\p{Script=Latin}\\p{N}]";
  const BASIC_INVISIBLE = /[\u00ad\u200b\u2060\ufeff]/gu;
  const SPECIAL_SPACES = /[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/gu;
  const JOINERS = /[\u200c\u200d]/gu;
  const BIDI_CONTROLS = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu;
  const VARIATION_SELECTORS = /[\ufe00-\ufe0f]|[\u{e0100}-\u{e01ef}]/gu;
  const TAG_CHARACTERS = /[\u{e0000}-\u{e007f}]/gu;
  const URL_OR_LITERAL = /(?:https?:\/\/|www\.)[^\s<>"']+|[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}|`[^`\n]*`|\b\d+(?:[.,]\d+)+\b/giu;

  const CONFUSABLES = new Map(Object.entries({
    "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I", "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X",
    "ο": "o", "ρ": "p", "ν": "v", "χ": "x",
    "А": "A", "В": "B", "С": "C", "Е": "E", "Н": "H", "І": "I", "Ј": "J", "К": "K", "М": "M", "О": "O", "Р": "P", "Ѕ": "S", "Т": "T", "Х": "X",
    "а": "a", "с": "c", "е": "e", "і": "i", "ј": "j", "о": "o", "р": "p", "ѕ": "s", "х": "x", "у": "y"
  }));

  const DEFAULT_OPTIONS = Object.freeze({
    trimLines: true,
    collapseSpaces: true,
    reduceBlankLines: true,
    lineMode: "keep",
    repairHyphenation: false,
    removeHanSpaces: false,
    addHanLatinSpaces: false,
    useCjkPunctuation: false,
    decodeUrls: false,
    fixEnglishQuotes: true,
    removeBasicInvisible: true,
    normalizeSpecialSpaces: true,
    removeJoiners: false,
    removeVariationSelectors: false,
    removeBidiControls: false,
    removeTags: false,
    normalizeConfusables: false,
    locale: "en"
  });

  function isFullwidthAscii(character) {
    const codePoint = character.codePointAt(0);
    return codePoint >= 0xff01 && codePoint <= 0xff5e;
  }

  function isConfusable(character) {
    return CONFUSABLES.has(character) || isFullwidthAscii(character);
  }

  function codePointLabel(character) {
    return `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
  }

  function matchesCharacter(pattern, character) {
    pattern.lastIndex = 0;
    const matches = pattern.test(character);
    pattern.lastIndex = 0;
    return matches;
  }

  function scanSuspiciousUnicode(value) {
    const text = String(value || "");
    const categories = {
      basicInvisible: { count: 0, characters: new Map() },
      specialSpaces: { count: 0, characters: new Map() },
      joiners: { count: 0, characters: new Map() },
      variationSelectors: { count: 0, characters: new Map() },
      bidiControls: { count: 0, characters: new Map() },
      tags: { count: 0, characters: new Map() },
      confusables: { count: 0, characters: new Map() }
    };

    for (const character of text) {
      let key = "";
      if (matchesCharacter(BASIC_INVISIBLE, character)) key = "basicInvisible";
      else if (matchesCharacter(SPECIAL_SPACES, character)) key = "specialSpaces";
      else if (matchesCharacter(JOINERS, character)) key = "joiners";
      else if (matchesCharacter(VARIATION_SELECTORS, character)) key = "variationSelectors";
      else if (matchesCharacter(BIDI_CONTROLS, character)) key = "bidiControls";
      else if (matchesCharacter(TAG_CHARACTERS, character)) key = "tags";
      else if (isFullwidthAscii(character)) key = "confusables";
      if (!key) continue;
      const item = categories[key];
      item.count += 1;
      const label = codePointLabel(character);
      item.characters.set(label, (item.characters.get(label) || 0) + 1);
    }

    for (const match of text.matchAll(/[\p{L}\p{N}_]+/gu)) {
      if (!/[A-Za-z]/u.test(match[0])) continue;
      for (const character of match[0]) {
        if (!CONFUSABLES.has(character)) continue;
        const item = categories.confusables;
        item.count += 1;
        const label = codePointLabel(character);
        item.characters.set(label, (item.characters.get(label) || 0) + 1);
      }
    }

    let total = 0;
    for (const item of Object.values(categories)) {
      total += item.count;
      item.characters = Array.from(item.characters, ([codePoint, count]) => ({ codePoint, count }));
    }
    return { total, categories };
  }

  function replacePattern(text, pattern, replacement) {
    pattern.lastIndex = 0;
    const result = text.replace(pattern, replacement);
    pattern.lastIndex = 0;
    return result;
  }

  function mapOutsideProtectedText(text, transform) {
    let output = "";
    let cursor = 0;
    URL_OR_LITERAL.lastIndex = 0;
    for (const match of text.matchAll(URL_OR_LITERAL)) {
      output += transform(text.slice(cursor, match.index));
      output += match[0];
      cursor = match.index + match[0].length;
    }
    URL_OR_LITERAL.lastIndex = 0;
    return output + transform(text.slice(cursor));
  }

  function normalizeMixedScriptConfusables(text) {
    const widthNormalized = Array.from(text, (character) => {
      if (!isFullwidthAscii(character)) return character;
      return String.fromCodePoint(character.codePointAt(0) - 0xfee0);
    }).join("");

    return widthNormalized.replace(/[\p{L}\p{N}_]+/gu, (token) => {
      if (!/[A-Za-z]/u.test(token) || !Array.from(token).some((character) => CONFUSABLES.has(character))) {
        return token;
      }
      return Array.from(token, (character) => CONFUSABLES.get(character) || character).join("");
    });
  }

  function removeSpacesBetweenHan(text) {
    return mapOutsideProtectedText(
      text,
      (part) => part.replace(new RegExp(`(${HAN})[ \\t]+(?=${HAN})`, "gu"), "$1")
    );
  }

  function addSpacesBetweenHanAndLatin(text) {
    return mapOutsideProtectedText(text, (part) => part
      .replace(new RegExp(`(${HAN})(?=${LATIN_OR_NUMBER})`, "gu"), "$1 ")
      .replace(new RegExp(`(${LATIN_OR_NUMBER})(?=${HAN})`, "gu"), "$1 "));
  }

  function fixEnglishQuotes(text) {
    return mapOutsideProtectedText(text, (part) => part
      .replace(/([\p{Script=Latin}])’(?=[\p{Script=Latin}])/gu, "$1'")
      .replace(/[“”](?=[\p{Script=Latin}])/gu, '"')
      .replace(/(?<=[\p{Script=Latin}])[“”]/gu, '"'));
  }

  function useCjkPunctuation(text) {
    return mapOutsideProtectedText(text, (part) => {
      let output = part
        .replace(new RegExp(`(?<=${HAN})\\.(?!\\d)`, "gu"), "。")
        .replace(new RegExp(`(?<=${HAN}),|,(?=${HAN})`, "gu"), "，")
        .replace(new RegExp(`(?<=${HAN});|;(?=${HAN})`, "gu"), "；")
        .replace(new RegExp(`(?<=${HAN}):|:(?=${HAN})`, "gu"), "：")
        .replace(new RegExp(`(?<=${HAN})!|!(?=${HAN})`, "gu"), "！")
        .replace(new RegExp(`(?<=${HAN})\\?|\\?(?=${HAN})`, "gu"), "？");
      output = output.replace(/\(([^()\n]*\p{Script=Han}[^()\n]*)\)/gu, "（$1）");
      output = output.replace(/"([^"\n]*\p{Script=Han}[^"\n]*)"/gu, "「$1」");
      output = output.replace(/“([^”\n]*\p{Script=Han}[^”\n]*)”/gu, "「$1」");
      return output;
    });
  }

  function decodeUrlsSafely(text) {
    return text.replace(/(?:https?:\/\/|www\.)[^\s<>"']+/giu, (url) => {
      try {
        return decodeURI(url);
      } catch {
        return url;
      }
    });
  }

  function shouldJoinWithoutSpace(left, right) {
    if (!left || !right) return true;
    if (/\s$/u.test(left) || /^\s/u.test(right)) return true;
    if (/[（([{「『“‘]$/u.test(left) || /^[，。！？；：、,.!?;:)\]}」』”’]/u.test(right)) return true;
    return new RegExp(`${HAN}$`, "u").test(left) && new RegExp(`^${HAN}`, "u").test(right);
  }

  function joinLinePair(left, right, repairHyphenation) {
    const current = left.trimEnd();
    const next = right.trimStart();
    if (!current) return next;
    if (!next) return current;
    if (repairHyphenation && /\p{Script=Latin}-$/u.test(current) && /^\p{Ll}/u.test(next)) {
      return current.slice(0, -1) + next;
    }
    return `${current}${shouldJoinWithoutSpace(current, next) ? "" : " "}${next}`;
  }

  function joinWrappedLines(text, repairHyphenation, preserveParagraphs = true) {
    const groups = preserveParagraphs ? text.split(/\n[ \t]*\n+/u) : [text];
    return groups.map((group) => {
      const lines = group.split(/\n/u);
      return lines.reduce((output, line) => joinLinePair(output, line, repairHyphenation), "");
    }).join(preserveParagraphs ? "\n\n" : "");
  }

  function splitSentences(text, locale) {
    return text.split(/\n[ \t]*\n+/u).map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";
      if (typeof Intl?.Segmenter === "function") {
        try {
          return Array.from(
            new Intl.Segmenter(locale || "en", { granularity: "sentence" }).segment(trimmed),
            (item) => item.segment.trim()
          ).filter(Boolean).join("\n");
        } catch {
          // Fall through to the punctuation boundary fallback.
        }
      }
      return trimmed.replace(/([。！？!?]|\.(?!\d))\s+/gu, "$1\n");
    }).join("\n\n");
  }

  function applyLineMode(text, options) {
    if (options.lineMode === "join") return joinWrappedLines(text, options.repairHyphenation, true);
    if (options.lineMode === "remove") return joinWrappedLines(text, options.repairHyphenation, false);
    return text;
  }

  function formatText(value, rawOptions = {}) {
    const options = { ...DEFAULT_OPTIONS, ...rawOptions };
    const input = String(value || "");
    const scanBefore = scanSuspiciousUnicode(input);
    let text = input.replace(/\r\n?|\u2028|\u2029/gu, "\n");

    if (options.removeBasicInvisible) text = replacePattern(text, BASIC_INVISIBLE, "");
    if (options.normalizeSpecialSpaces) text = replacePattern(text, SPECIAL_SPACES, " ");
    if (options.removeJoiners) text = replacePattern(text, JOINERS, "");
    if (options.removeVariationSelectors) text = replacePattern(text, VARIATION_SELECTORS, "");
    if (options.removeBidiControls) text = replacePattern(text, BIDI_CONTROLS, "");
    if (options.removeTags) text = replacePattern(text, TAG_CHARACTERS, "");
    if (options.normalizeConfusables) text = normalizeMixedScriptConfusables(text);

    if (options.trimLines) text = text.split("\n").map((line) => line.trim()).join("\n");
    if (options.collapseSpaces) text = text.replace(/[^\S\r\n]+/gu, " ");
    if (options.reduceBlankLines) text = text.replace(/\n[ \t]*\n(?:[ \t]*\n)+/gu, "\n\n");
    text = applyLineMode(text, options);
    if (options.removeHanSpaces) text = removeSpacesBetweenHan(text);
    if (options.addHanLatinSpaces) text = addSpacesBetweenHanAndLatin(text);
    if (options.fixEnglishQuotes) text = fixEnglishQuotes(text);
    if (options.useCjkPunctuation) text = useCjkPunctuation(text);
    if (options.decodeUrls) text = decodeUrlsSafely(text);
    if (options.lineMode === "sentence") text = splitSentences(text, options.locale);

    return {
      text,
      changed: text !== input,
      scanBefore,
      scanAfter: scanSuspiciousUnicode(text)
    };
  }

  return {
    DEFAULT_OPTIONS,
    MAX_FILE_SIZE_BYTES,
    MAX_INPUT_CHARACTERS,
    addSpacesBetweenHanAndLatin,
    decodeUrlsSafely,
    formatText,
    joinWrappedLines,
    normalizeMixedScriptConfusables,
    removeSpacesBetweenHan,
    scanSuspiciousUnicode,
    splitSentences,
    useCjkPunctuation
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const core = globalThis.TextFormatterCore;
  const body = document.body;
  if (!core || body?.dataset.toolPage !== "text-formatter") return;

  const elements = {
    localeSelect: document.querySelector("#localeSelect"),
    input: document.querySelector("#formatterInput"),
    output: document.querySelector("#formatterOutput"),
    format: document.querySelector("#formatterRun"),
    sample: document.querySelector("#formatterSample"),
    clear: document.querySelector("#formatterClear"),
    copy: document.querySelector("#formatterCopy"),
    reuse: document.querySelector("#formatterReuse"),
    download: document.querySelector("#formatterDownload"),
    file: document.querySelector("#formatterFile"),
    status: document.querySelector("#formatterStatus"),
    lineMode: document.querySelector("#formatterLineMode"),
    repairHyphenation: document.querySelector("#repairHyphenation"),
    optionInputs: document.querySelectorAll("[data-formatter-option]"),
    inputCount: document.querySelector("#formatterInputCount"),
    outputCount: document.querySelector("#formatterOutputCount"),
    inputMetric: document.querySelector("#formatterInputMetric"),
    outputMetric: document.querySelector("#formatterOutputMetric"),
    hiddenBefore: document.querySelector("#formatterHiddenBefore"),
    hiddenAfter: document.querySelector("#formatterHiddenAfter"),
    report: document.querySelector("#formatterReport"),
    reportEmpty: document.querySelector("#formatterReportEmpty")
  };
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  const settingsKey = "jianfan.textFormatter.settings.v1";

  function message(key, values = {}) {
    const attribute = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[attribute] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(body.dataset.locale || "en").format(value);
  }

  function setStatus(key, type = "idle", values = {}) {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = message(key, values);
  }

  function readOptions() {
    const options = { lineMode: elements.lineMode.value, locale: body.dataset.locale };
    for (const input of elements.optionInputs) options[input.dataset.formatterOption] = input.checked;
    return options;
  }

  function saveOptions() {
    try {
      localStorage.setItem(settingsKey, JSON.stringify(readOptions()));
    } catch {
      // Private browsing or storage policies may block persistence; formatting still works.
    }
  }

  function loadOptions() {
    try {
      const saved = JSON.parse(localStorage.getItem(settingsKey) || "null");
      if (!saved || typeof saved !== "object") return;
      if (["keep", "join", "remove", "sentence"].includes(saved.lineMode)) elements.lineMode.value = saved.lineMode;
      for (const input of elements.optionInputs) {
        if (typeof saved[input.dataset.formatterOption] === "boolean") {
          input.checked = saved[input.dataset.formatterOption];
        }
      }
    } catch {
      try { localStorage.removeItem(settingsKey); } catch {}
    }
  }

  function syncHyphenationState() {
    elements.repairHyphenation.disabled = !["join", "remove"].includes(elements.lineMode.value);
  }

  function renderCounts(result) {
    const inputLength = Array.from(elements.input.value).length;
    const outputLength = Array.from(elements.output.value).length;
    elements.inputCount.textContent = formatNumber(inputLength);
    elements.outputCount.textContent = formatNumber(outputLength);
    elements.inputMetric.textContent = formatNumber(inputLength);
    elements.outputMetric.textContent = formatNumber(outputLength);
    elements.hiddenBefore.textContent = formatNumber(result?.scanBefore.total || 0);
    elements.hiddenAfter.textContent = formatNumber(result?.scanAfter.total || 0);
  }

  function renderReport(result) {
    elements.report.replaceChildren();
    const items = Object.entries(result.scanBefore.categories).filter(([, item]) => item.count > 0);
    elements.reportEmpty.hidden = items.length > 0;
    for (const [category, before] of items) {
      const afterCount = result.scanAfter.categories[category].count;
      const row = document.createElement("li");
      const details = before.characters.slice(0, 5).map((item) => `${item.codePoint} × ${item.count}`).join(" · ");
      row.innerHTML = `<span><strong>${body.dataset[`category${category[0].toUpperCase()}${category.slice(1)}`] || category}</strong><small>${details}</small></span><b>${formatNumber(before.count)} → ${formatNumber(afterCount)}</b>`;
      elements.report.append(row);
    }
  }

  function runFormatter() {
    const length = Array.from(elements.input.value).length;
    if (length > core.MAX_INPUT_CHARACTERS) {
      setStatus("tooLong", "error", { limit: formatNumber(core.MAX_INPUT_CHARACTERS) });
      return;
    }
    const result = core.formatText(elements.input.value, readOptions());
    elements.output.value = result.text;
    renderCounts(result);
    renderReport(result);
    setStatus(result.changed ? "ready" : "unchanged", "ready");
  }

  async function copyOutput() {
    if (!elements.output.value) return;
    try {
      await navigator.clipboard.writeText(elements.output.value);
      setStatus("copied", "ready");
    } catch {
      elements.output.focus();
      elements.output.select();
      setStatus("copyFailed", "error");
    }
  }

  function downloadOutput() {
    if (!elements.output.value) return;
    const blob = new Blob([elements.output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted-text.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function readFile(file) {
    if (!file) return;
    if (file.size > core.MAX_FILE_SIZE_BYTES) {
      setStatus("fileTooLarge", "error");
      return;
    }
    try {
      elements.input.value = await file.text();
      runFormatter();
    } catch {
      setStatus("fileError", "error");
    } finally {
      elements.file.value = "";
    }
  }

  loadOptions();
  syncHyphenationState();
  renderCounts();
  elements.format.addEventListener("click", runFormatter);
  elements.sample.addEventListener("click", () => {
    elements.input.value = elements.sample.dataset.sample || "";
    runFormatter();
  });
  elements.clear.addEventListener("click", () => {
    elements.input.value = "";
    elements.output.value = "";
    elements.report.replaceChildren();
    elements.reportEmpty.hidden = false;
    renderCounts();
    setStatus("idle");
    elements.input.focus();
  });
  elements.copy.addEventListener("click", copyOutput);
  elements.reuse.addEventListener("click", () => {
    elements.input.value = elements.output.value;
    elements.output.value = "";
    renderCounts();
    elements.input.focus();
  });
  elements.download.addEventListener("click", downloadOutput);
  elements.file.addEventListener("change", () => readFile(elements.file.files?.[0]));
  elements.input.addEventListener("input", () => {
    elements.inputCount.textContent = formatNumber(Array.from(elements.input.value).length);
    setStatus("pending");
  });
  elements.lineMode.addEventListener("change", () => {
    syncHyphenationState();
    saveOptions();
  });
  for (const input of elements.optionInputs) input.addEventListener("change", saveOptions);
  elements.localeSelect.addEventListener("change", () => {
    const prefix = localePrefixes[elements.localeSelect.value] ?? "";
    window.location.href = `/${prefix}${body.dataset.pageSlug}/`;
  });
})();
