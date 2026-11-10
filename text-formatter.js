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
  const DIFF_SEARCH_WINDOW = 4096;
  const DIFF_SYNC_LENGTH = 6;
  const JOIN_TAIL_LENGTH = 32;
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

  function classifyCharacter(character) {
    if (matchesCharacter(BASIC_INVISIBLE, character)) return "basicInvisible";
    if (matchesCharacter(SPECIAL_SPACES, character)) return "specialSpaces";
    if (matchesCharacter(JOINERS, character)) return "joiners";
    if (matchesCharacter(VARIATION_SELECTORS, character)) return "variationSelectors";
    if (matchesCharacter(BIDI_CONTROLS, character)) return "bidiControls";
    if (matchesCharacter(TAG_CHARACTERS, character)) return "tags";
    if (isFullwidthAscii(character)) return "confusables";
    return "";
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
      const key = classifyCharacter(character);
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

  // Only the tail of the joined text decides how the next line attaches, so
  // settled text is moved aside to keep very long paragraphs linear.
  function joinLines(lines, repairHyphenation) {
    const settled = [];
    let tail = "";
    for (const line of lines) {
      const current = tail.trimEnd();
      if (current.length > JOIN_TAIL_LENGTH * 8) {
        settled.push(current.slice(0, -JOIN_TAIL_LENGTH));
        tail = joinLinePair(current.slice(-JOIN_TAIL_LENGTH), line, repairHyphenation);
      } else {
        tail = joinLinePair(tail, line, repairHyphenation);
      }
    }
    settled.push(tail);
    return settled.join("");
  }

  function joinWrappedLines(text, repairHyphenation, preserveParagraphs = true) {
    const groups = preserveParagraphs ? text.split(/\n[ \t]*\n+/u) : [text];
    return groups
      .map((group) => joinLines(group.split(/\n/u), repairHyphenation))
      .join(preserveParagraphs ? "\n\n" : "");
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

  function countMatches(text, pattern) {
    pattern.lastIndex = 0;
    let count = 0;
    while (pattern.exec(text)) count += 1;
    pattern.lastIndex = 0;
    return count;
  }

  function countLineBreaks(text) {
    let count = 0;
    for (let index = text.indexOf("\n"); index !== -1; index = text.indexOf("\n", index + 1)) count += 1;
    return count;
  }

  function countDifferentPositions(before, after) {
    if (before.length !== after.length) return Math.abs(before.length - after.length);
    let count = 0;
    for (let index = 0; index < before.length; index += 1) {
      if (before.charCodeAt(index) !== after.charCodeAt(index)) count += 1;
    }
    return count;
  }

  function countChangedLines(before, after) {
    const beforeLines = before.split("\n");
    const afterLines = after.split("\n");
    let count = 0;
    for (let index = 0; index < beforeLines.length; index += 1) {
      if (beforeLines[index] !== afterLines[index]) count += 1;
    }
    return count;
  }

  function countChangedUrls(before) {
    let count = 0;
    before.replace(/(?:https?:\/\/|www\.)[^\s<>"']+/giu, (url) => {
      if (decodeUrlsSafely(url) !== url) count += 1;
      return url;
    });
    return count;
  }

  function normalizeLineEndings(value) {
    return String(value || "").replace(/\r\n?/gu, "\n");
  }

  function formatText(value, rawOptions = {}) {
    const options = { ...DEFAULT_OPTIONS, ...rawOptions };
    const input = String(value || "");
    const scanBefore = scanSuspiciousUnicode(input);
    const steps = [];
    let text = input.replace(/\r\n?|\u2028|\u2029/gu, "\n");

    // Each rule reports how many places it touched so the UI can explain the result.
    const apply = (rule, next, count) => {
      if (next === text) return;
      steps.push({ rule, count: Math.max(1, count(text, next)) });
      text = next;
    };
    const removalRules = [
      ["removeBasicInvisible", BASIC_INVISIBLE, ""],
      ["normalizeSpecialSpaces", SPECIAL_SPACES, " "],
      ["removeJoiners", JOINERS, ""],
      ["removeVariationSelectors", VARIATION_SELECTORS, ""],
      ["removeBidiControls", BIDI_CONTROLS, ""],
      ["removeTags", TAG_CHARACTERS, ""]
    ];
    for (const [rule, pattern, replacement] of removalRules) {
      if (options[rule]) apply(rule, replacePattern(text, pattern, replacement), (before) => countMatches(before, pattern));
    }
    if (options.normalizeConfusables) apply("normalizeConfusables", normalizeMixedScriptConfusables(text), countDifferentPositions);

    if (options.trimLines) apply("trimLines", text.split("\n").map((line) => line.trim()).join("\n"), countChangedLines);
    if (options.collapseSpaces) {
      apply("collapseSpaces", text.replace(/[^\S\r\n]+/gu, " "), (before) => {
        let count = 0;
        for (const match of before.matchAll(/[^\S\r\n]+/gu)) if (match[0] !== " ") count += 1;
        return count;
      });
    }
    if (options.reduceBlankLines) {
      const blankLines = /\n[ \t]*\n(?:[ \t]*\n)+/gu;
      apply("reduceBlankLines", text.replace(blankLines, "\n\n"), (before) => countMatches(before, blankLines));
    }
    const countLineChange = (before, after) => Math.abs(countLineBreaks(before) - countLineBreaks(after));
    apply("lineMode", applyLineMode(text, options), countLineChange);
    if (options.removeHanSpaces) apply("removeHanSpaces", removeSpacesBetweenHan(text), countDifferentPositions);
    if (options.addHanLatinSpaces) apply("addHanLatinSpaces", addSpacesBetweenHanAndLatin(text), countDifferentPositions);
    if (options.fixEnglishQuotes) apply("fixEnglishQuotes", fixEnglishQuotes(text), countDifferentPositions);
    if (options.useCjkPunctuation) apply("useCjkPunctuation", useCjkPunctuation(text), countDifferentPositions);
    if (options.decodeUrls) apply("decodeUrls", decodeUrlsSafely(text), countChangedUrls);
    if (options.lineMode === "sentence") apply("lineMode", splitSentences(text, options.locale), countLineChange);

    return {
      text,
      changed: text !== input,
      steps,
      scanBefore,
      scanAfter: scanSuspiciousUnicode(text)
    };
  }

  function isHighSurrogate(code) {
    return code >= 0xd800 && code <= 0xdbff;
  }

  function splitsSurrogatePair(text, index) {
    if (index <= 0 || index >= text.length) return false;
    const code = text.charCodeAt(index);
    return code >= 0xdc00 && code <= 0xdfff && isHighSurrogate(text.charCodeAt(index - 1));
  }

  function countCodePoints(text) {
    let count = text.length;
    for (let index = 0; index < text.length; index += 1) {
      if (isHighSurrogate(text.charCodeAt(index))) count -= 1;
    }
    return count;
  }

  function matchLength(before, beforeIndex, after, afterIndex, limit) {
    let length = 0;
    while (length < limit) {
      const beforeEnded = beforeIndex + length >= before.length;
      const afterEnded = afterIndex + length >= after.length;
      if (beforeEnded || afterEnded) return beforeEnded && afterEnded ? limit : length;
      if (before.charCodeAt(beforeIndex + length) !== after.charCodeAt(afterIndex + length)) return length;
      length += 1;
    }
    return length;
  }

  // Formatting edits are local, so the nearest point where both texts agree
  // again is found with a bounded search instead of a quadratic full diff.
  function findResync(before, beforeIndex, after, afterIndex) {
    const beforeLeft = before.length - beforeIndex;
    const afterLeft = after.length - afterIndex;
    const maxSum = Math.min(DIFF_SEARCH_WINDOW, beforeLeft + afterLeft);
    for (let sum = 1; sum <= maxSum; sum += 1) {
      let best = null;
      let bestLength = 0;
      for (let skipBefore = Math.min(sum, beforeLeft); skipBefore >= 0; skipBefore -= 1) {
        const skipAfter = sum - skipBefore;
        if (skipAfter > afterLeft) break;
        if (splitsSurrogatePair(before, beforeIndex + skipBefore) || splitsSurrogatePair(after, afterIndex + skipAfter)) continue;
        const length = matchLength(before, beforeIndex + skipBefore, after, afterIndex + skipAfter, DIFF_SYNC_LENGTH);
        if (length > bestLength) {
          best = { skipBefore, skipAfter };
          bestLength = length;
          if (length === DIFF_SYNC_LENGTH) break;
        }
      }
      if (best) return best;
    }
    return { skipBefore: beforeLeft, skipAfter: afterLeft };
  }

  function diffText(beforeValue, afterValue) {
    const before = String(beforeValue || "");
    const after = String(afterValue || "");
    const ops = [];
    let removed = 0;
    let added = 0;
    let changes = 0;
    let beforeIndex = 0;
    let afterIndex = 0;

    const push = (type, text) => {
      if (!text) return;
      const last = ops[ops.length - 1];
      if (last?.type === type) last.text += text;
      else ops.push({ type, text });
    };

    while (beforeIndex < before.length || afterIndex < after.length) {
      const start = beforeIndex;
      while (beforeIndex < before.length && afterIndex < after.length) {
        const code = before.charCodeAt(beforeIndex);
        if (code !== after.charCodeAt(afterIndex)) break;
        if (isHighSurrogate(code)) {
          if (before.charCodeAt(beforeIndex + 1) !== after.charCodeAt(afterIndex + 1)) break;
          beforeIndex += 1;
          afterIndex += 1;
        }
        beforeIndex += 1;
        afterIndex += 1;
      }
      push("equal", before.slice(start, beforeIndex));
      if (beforeIndex >= before.length && afterIndex >= after.length) break;

      const { skipBefore, skipAfter } = findResync(before, beforeIndex, after, afterIndex);
      const deleted = before.slice(beforeIndex, beforeIndex + skipBefore);
      const inserted = after.slice(afterIndex, afterIndex + skipAfter);
      if (ops[ops.length - 1]?.type === "equal" || ops.length === 0) changes += 1;
      removed += countCodePoints(deleted);
      added += countCodePoints(inserted);
      push("delete", deleted);
      push("insert", inserted);
      beforeIndex += skipBefore;
      afterIndex += skipAfter;
    }

    return { ops, removed, added, changes };
  }

  return {
    DEFAULT_OPTIONS,
    MAX_FILE_SIZE_BYTES,
    MAX_INPUT_CHARACTERS,
    addSpacesBetweenHanAndLatin,
    classifyCharacter,
    decodeUrlsSafely,
    diffText,
    formatText,
    joinWrappedLines,
    normalizeLineEndings,
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
    reportEmpty: document.querySelector("#formatterReportEmpty"),
    diff: document.querySelector("#formatterDiff"),
    diffSummary: document.querySelector("#formatterDiffSummary"),
    diffRules: document.querySelector("#formatterDiffRules"),
    viewResult: document.querySelector("#formatterViewResult"),
    viewDiff: document.querySelector("#formatterViewDiff")
  };
  const viewKey = "jianfan.textFormatter.view.v1";
  const AUTO_RUN_LIMIT = 200000;
  const AUTO_RUN_DELAY = 250;
  const DIFF_CONTEXT_LENGTH = 160;
  const DIFF_MAX_RENDERED_CHANGES = 2000;
  const INVISIBLE_CATEGORIES = new Set(["basicInvisible", "specialSpaces", "joiners", "variationSelectors", "bidiControls", "tags"]);
  const OTHER_INVISIBLE = /[\p{Cc}\p{Cf}\p{Zs}\p{Zl}\p{Zp}]/u;
  const diffHint = elements.diffSummary.textContent;
  let autoRunTimer = 0;
  let preferredView = "diff";
  let hasDiff = false;
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

  function categoryLabel(category) {
    return body.dataset[`category${category[0].toUpperCase()}${category.slice(1)}`] || "";
  }

  function ruleLabel(rule) {
    if (rule === "lineMode") return elements.lineMode.selectedOptions[0]?.textContent || rule;
    return document.getElementById(rule)?.nextElementSibling?.textContent || rule;
  }

  // Changed text keeps whitespace and invisible characters readable: spaces,
  // tabs and line breaks get a visible glyph, hidden characters a code point chip.
  function appendChangedText(parent, text, keepLineBreaks) {
    let buffer = "";
    const flush = () => {
      if (buffer) parent.append(buffer);
      buffer = "";
    };
    for (const character of text) {
      if (character === " ") buffer += "·";
      else if (character === "\t") buffer += "→";
      else if (character === "\n") buffer += keepLineBreaks ? "↵\n" : "↵";
      else {
        const category = core.classifyCharacter(character);
        if (INVISIBLE_CATEGORIES.has(category) || OTHER_INVISIBLE.test(character)) {
          flush();
          const chip = document.createElement("span");
          chip.className = "formatter-diff-code";
          chip.textContent = `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
          if (categoryLabel(category)) chip.title = categoryLabel(category);
          parent.append(chip);
        } else {
          buffer += character;
        }
      }
    }
    flush();
  }

  function sliceAtCharacterBoundary(text, index) {
    const code = text.charCodeAt(index);
    return code >= 0xdc00 && code <= 0xdfff ? index + 1 : index;
  }

  function appendUnchangedText(parent, text, isFirst, isLast) {
    if (text.length <= DIFF_CONTEXT_LENGTH * 2 + 80) {
      parent.append(text);
      return;
    }
    const headEnd = isFirst ? 0 : sliceAtCharacterBoundary(text, DIFF_CONTEXT_LENGTH);
    const tailStart = isLast ? text.length : sliceAtCharacterBoundary(text, text.length - DIFF_CONTEXT_LENGTH);
    const gap = document.createElement("span");
    gap.className = "formatter-diff-gap";
    gap.textContent = message("diffGap", { count: formatNumber(Array.from(text.slice(headEnd, tailStart)).length) });
    parent.append(text.slice(0, headEnd), gap, text.slice(tailStart));
  }

  // The comparison replaces the plain result in place, next to the original,
  // whenever there is something to compare and the user has not opted out.
  function syncView() {
    const showDiff = hasDiff && preferredView === "diff";
    elements.diff.hidden = !showDiff;
    elements.output.hidden = showDiff;
    elements.viewDiff.disabled = !hasDiff;
    elements.viewDiff.setAttribute("aria-pressed", String(showDiff));
    elements.viewResult.setAttribute("aria-pressed", String(!showDiff));
  }

  function chooseView(view) {
    preferredView = view;
    try {
      localStorage.setItem(viewKey, view);
    } catch {
      // The choice simply lasts for this visit when storage is unavailable.
    }
    syncView();
  }

  function clearDiff() {
    elements.diff.replaceChildren();
    elements.diffRules.replaceChildren();
    elements.diffSummary.textContent = diffHint;
    hasDiff = false;
    syncView();
  }

  function renderDiff(result) {
    const diff = core.diffText(core.normalizeLineEndings(elements.input.value), result.text);
    elements.diff.replaceChildren();
    elements.diffRules.replaceChildren();
    hasDiff = diff.changes > 0;
    if (!hasDiff) {
      elements.diffSummary.textContent = message("diffSame");
      syncView();
      return;
    }

    elements.diffSummary.textContent = message("diffSummary", {
      changes: formatNumber(diff.changes),
      removed: formatNumber(diff.removed),
      added: formatNumber(diff.added)
    });
    for (const step of result.steps) {
      const item = document.createElement("li");
      const count = document.createElement("b");
      count.textContent = `× ${formatNumber(step.count)}`;
      item.append(ruleLabel(step.rule), count);
      elements.diffRules.append(item);
    }

    const fragment = document.createDocumentFragment();
    let renderedChanges = 0;
    let truncated = false;
    diff.ops.forEach((op, index) => {
      if (truncated) return;
      if (op.type === "equal") {
        if (renderedChanges >= DIFF_MAX_RENDERED_CHANGES) {
          truncated = true;
          return;
        }
        appendUnchangedText(fragment, op.text, index === 0, index === diff.ops.length - 1);
        return;
      }
      if (diff.ops[index - 1]?.type === "equal" || index === 0) renderedChanges += 1;
      const mark = document.createElement(op.type === "delete" ? "del" : "ins");
      appendChangedText(mark, op.text, op.type === "insert");
      fragment.append(mark);
    });
    if (truncated) {
      const note = document.createElement("span");
      note.className = "formatter-diff-gap";
      note.textContent = message("diffTruncated", { count: formatNumber(diff.changes - renderedChanges) });
      fragment.append(note);
    }
    elements.diff.append(fragment);
    syncView();
    elements.diff.scrollTop = 0;
  }

  function clearResults() {
    elements.output.value = "";
    elements.report.replaceChildren();
    elements.reportEmpty.hidden = false;
    clearDiff();
    renderCounts();
  }

  function runFormatter() {
    clearTimeout(autoRunTimer);
    const length = Array.from(elements.input.value).length;
    if (length > core.MAX_INPUT_CHARACTERS) {
      setStatus("tooLong", "error", { limit: formatNumber(core.MAX_INPUT_CHARACTERS) });
      return;
    }
    if (length === 0) {
      clearResults();
      setStatus("idle");
      return;
    }
    const result = core.formatText(elements.input.value, readOptions());
    elements.output.value = result.text;
    renderCounts(result);
    renderReport(result);
    renderDiff(result);
    setStatus(result.changed ? "ready" : "unchanged", "ready");
  }

  // Short text is formatted as it changes; long text waits for the button so
  // typing and rule changes never block on a multi-megabyte pass.
  function scheduleFormatter(delay = AUTO_RUN_DELAY) {
    clearTimeout(autoRunTimer);
    if (elements.input.value.length > AUTO_RUN_LIMIT) {
      setStatus("pending");
      return;
    }
    autoRunTimer = setTimeout(runFormatter, delay);
  }

  async function copyOutput() {
    if (!elements.output.value) return;
    try {
      await navigator.clipboard.writeText(elements.output.value);
      setStatus("copied", "ready");
    } catch {
      chooseView("result");
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
  try {
    if (localStorage.getItem(viewKey) === "result") preferredView = "result";
  } catch {
    // Storage may be blocked; the comparison stays the default view.
  }
  elements.viewResult.addEventListener("click", () => chooseView("result"));
  elements.viewDiff.addEventListener("click", () => chooseView("diff"));
  syncHyphenationState();
  renderCounts();
  elements.format.addEventListener("click", runFormatter);
  elements.sample.addEventListener("click", () => {
    elements.input.value = elements.sample.dataset.sample || "";
    runFormatter();
  });
  elements.clear.addEventListener("click", () => {
    clearTimeout(autoRunTimer);
    elements.input.value = "";
    clearResults();
    setStatus("idle");
    elements.input.focus();
  });
  elements.copy.addEventListener("click", copyOutput);
  elements.reuse.addEventListener("click", () => {
    if (!elements.output.value) return;
    clearTimeout(autoRunTimer);
    elements.input.value = elements.output.value;
    clearResults();
    setStatus("pending");
    elements.input.focus();
  });
  elements.download.addEventListener("click", downloadOutput);
  elements.file.addEventListener("change", () => readFile(elements.file.files?.[0]));
  elements.input.addEventListener("input", () => {
    elements.inputCount.textContent = formatNumber(Array.from(elements.input.value).length);
    setStatus("pending");
    scheduleFormatter();
  });
  const onOptionChange = () => {
    syncHyphenationState();
    saveOptions();
    if (elements.input.value) scheduleFormatter(0);
  };
  elements.lineMode.addEventListener("change", onOptionChange);
  for (const input of elements.optionInputs) input.addEventListener("change", onOptionChange);
  elements.localeSelect.addEventListener("change", () => {
    const prefix = localePrefixes[elements.localeSelect.value] ?? "";
    window.location.href = `/${prefix}${body.dataset.pageSlug}/`;
  });
})();
