(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KanjiRomajiCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_INPUT_CHARACTERS = 20000;
  const CONVERSION_CHUNK_CHARACTERS = 2000;
  const FORMATS = new Set(["romaji", "hiragana", "katakana", "furigana", "okurigana"]);
  const ROMAJI_SYSTEMS = new Set(["hepburn", "kunrei", "nippon"]);
  const NATURAL_BREAK = /[\n。！？!?]/u;
  const JAPANESE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
  const LATIN_OR_NUMBER_RUN = /(?:\p{Script=Latin}\p{Mark}*|\p{Number})+/gu;
  const PLACEHOLDER_START = 0xf0000;
  const PLACEHOLDER_END = 0xffffd;

  function countCharacters(value) {
    return Array.from(String(value)).length;
  }

  function containsJapaneseScript(value) {
    return JAPANESE_SCRIPT.test(String(value));
  }

  function splitJapaneseText(value, chunkSize = CONVERSION_CHUNK_CHARACTERS) {
    if (!Number.isSafeInteger(chunkSize) || chunkSize < 50) {
      throw new RangeError("chunkSize must be an integer of at least 50");
    }

    const characters = Array.from(String(value));
    const chunks = [];
    let start = 0;

    while (start < characters.length) {
      let end = Math.min(start + chunkSize, characters.length);
      if (end < characters.length) {
        const earliestBreak = start + Math.floor(chunkSize * 0.55);
        for (let index = end; index > earliestBreak; index -= 1) {
          if (NATURAL_BREAK.test(characters[index - 1])) {
            end = index;
            break;
          }
        }
      }
      chunks.push(characters.slice(start, end).join(""));
      start = end;
    }

    return chunks;
  }

  function buildConversionOptions(format, romajiSystem = "hepburn") {
    const normalizedFormat = FORMATS.has(format) ? format : "romaji";
    const normalizedSystem = ROMAJI_SYSTEMS.has(romajiSystem) ? romajiSystem : "hepburn";

    if (normalizedFormat === "furigana") {
      return { to: "hiragana", mode: "furigana" };
    }
    if (normalizedFormat === "okurigana") {
      return { to: "hiragana", mode: "okurigana" };
    }
    if (normalizedFormat === "romaji") {
      const engineSystem = normalizedSystem === "kunrei" ? "nippon" : normalizedSystem;
      return { to: "romaji", mode: "spaced", romajiSystem: engineSystem };
    }
    return { to: normalizedFormat, mode: "normal" };
  }

  function protectLatinAndNumberRuns(value) {
    const source = String(value);
    const usedCharacters = new Set(Array.from(source));
    const replacements = [];
    let nextCodePoint = PLACEHOLDER_START;

    const text = source.replace(LATIN_OR_NUMBER_RUN, (original) => {
      let placeholder = String.fromCodePoint(nextCodePoint);
      while (usedCharacters.has(placeholder) && nextCodePoint <= PLACEHOLDER_END) {
        nextCodePoint += 1;
        placeholder = String.fromCodePoint(nextCodePoint);
      }
      if (nextCodePoint > PLACEHOLDER_END) {
        throw new RangeError("No private-use placeholder is available");
      }
      usedCharacters.add(placeholder);
      replacements.push([placeholder, original]);
      nextCodePoint += 1;
      return placeholder;
    });

    return { text, replacements };
  }

  function convertNipponToKunrei(value) {
    return String(value)
      .replaceAll("dya", "zya")
      .replaceAll("dyu", "zyu")
      .replaceAll("dyo", "zyo")
      .replaceAll("di", "zi")
      .replaceAll("du", "zu");
  }

  function restoreProtectedRuns(value, replacements) {
    return replacements.reduce(
      (result, [placeholder, original]) => result.replaceAll(placeholder, original),
      String(value)
    );
  }

  return Object.freeze({
    MAX_INPUT_CHARACTERS,
    CONVERSION_CHUNK_CHARACTERS,
    buildConversionOptions,
    containsJapaneseScript,
    convertNipponToKunrei,
    countCharacters,
    protectLatinAndNumberRuns,
    restoreProtectedRuns,
    splitJapaneseText
  });
});
