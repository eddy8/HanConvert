// Chinese → Zhuyin (Bopomofo) helpers shared by the /chinese-to-zhuyin/ page and its tests.
//
// Readings come from pinyin-pro (numbered tones). Taiwan's Ministry of Education standard reads a
// set of common characters differently from Mainland Putonghua (星期 qí, 危險 wéi, 垃圾 lèsè …), so
// the "taiwan" standard rewrites those readings before the pinyin → zhuyin step. Each rule only
// fires when pinyin-pro returned the Mainland reading, so rare readings of the same character
// (期年 jī, 人質 zhì) are left alone. The pinyin → zhuyin syllable step is injected (`p2z` from the
// pinyin-to-zhuyin library) so this file has no dependencies and runs in Node tests.
(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.JianfanZhuyin = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_INPUT_CHARACTERS = 100000;
  const PREVIEW_CHARACTERS = 1500;
  const TONE_MARKS = { 1: "", 2: "ˊ", 3: "ˇ", 4: "ˋ", 5: "˙" };

  // [characters, Mainland readings that trigger the rule, Taiwan reading]
  const TAIWAN_CHARACTER_RULES = [
    ["期", ["qi1"], "qi2"],
    ["危", ["wei1"], "wei2"],
    ["微", ["wei1"], "wei2"],
    ["息", ["xi1", "xi0"], "xi2"],
    ["惜", ["xi1"], "xi2"],
    ["昔", ["xi1"], "xi2"],
    ["夕", ["xi1"], "xi4"],
    ["擊击", ["ji1"], "ji2"],
    ["寂", ["ji4"], "ji2"],
    ["液", ["ye4"], "yi4"],
    ["攜携", ["xie2"], "xi1"],
    ["質质", ["zhi4"], "zhi2"],
    ["檔档", ["dang4"], "dang3"],
    ["暫暂", ["zan4"], "zhan4"],
    ["癌", ["ai2"], "yan2"],
    ["綜综", ["zong1"], "zong4"],
    ["蝸蜗", ["wo1"], "gua1"],
    ["企", ["qi3"], "qi4"],
    ["究", ["jiu1"], "jiu4"],
    ["髮", ["fa4", "fa0"], "fa3"],
    ["突", ["tu1"], "tu2"],
    ["擁拥", ["yong1"], "yong3"],
    ["淆", ["xiao2"], "yao2"],
    ["錫锡", ["xi1"], "xi2"],
    ["播", ["bo1"], "bo4"]
  ];

  // Whole words whose Taiwan reading differs from Mainland.
  const TAIWAN_WORD_RULES = [
    ["垃圾", ["le4", "se4"]],
    ["說服", ["shui4", "fu2"]],
    ["说服", ["shui4", "fu2"]]
  ];

  // Words that keep the Mainland reading even though one character has a Taiwan rule.
  const TAIWAN_WORD_EXCEPTIONS = ["人質", "人质"];

  // Examples shown on the page: [Traditional, Simplified, Mainland pinyin, Taiwan pinyin, Taiwan zhuyin].
  // tests/chinese-to-zhuyin.test.mjs checks the pinyin columns against the rules above.
  const TAIWAN_EXAMPLES = [
    ["星期", "星期", "xing1 qi1", "xing1 qi2", "ㄒㄧㄥ ㄑㄧˊ"],
    ["危險", "危险", "wei1 xian3", "wei2 xian3", "ㄨㄟˊ ㄒㄧㄢˇ"],
    ["垃圾", "垃圾", "la1 ji1", "le4 se4", "ㄌㄜˋ ㄙㄜˋ"],
    ["研究", "研究", "yan2 jiu1", "yan2 jiu4", "ㄧㄢˊ ㄐㄧㄡˋ"],
    ["企業", "企业", "qi3 ye4", "qi4 ye4", "ㄑㄧˋ ㄧㄝˋ"],
    ["品質", "品质", "pin3 zhi4", "pin3 zhi2", "ㄆㄧㄣˇ ㄓˊ"],
    ["休息", "休息", "xiu1 xi0", "xiu1 xi2", "ㄒㄧㄡ ㄒㄧˊ"],
    ["攻擊", "攻击", "gong1 ji1", "gong1 ji2", "ㄍㄨㄥ ㄐㄧˊ"]
  ];

  const characterRules = new Map();
  for (const [characters, from, to] of TAIWAN_CHARACTER_RULES) {
    for (const character of characters) characterRules.set(character, { from: new Set(from), to });
  }

  // pinyin-pro writes the neutral tone as 0; the zhuyin library expects 5.
  function normalizeReading(reading) {
    const value = String(reading || "").trim().toLowerCase().replace(/v/gu, "ü");
    if (!value) return "";
    const match = value.match(/^([a-zü]+?)([0-5])?$/u);
    if (!match) return value;
    const tone = !match[2] || match[2] === "0" ? "5" : match[2];
    return `${match[1]}${tone}`;
  }

  function splitReading(reading) {
    const normalized = normalizeReading(reading);
    const match = normalized.match(/^([a-zü]+)([1-5])$/u);
    return match ? { base: match[1], tone: Number(match[2]) } : { base: normalized, tone: 5 };
  }

  // Syllables the zhuyin library does not cover: syllabic nasals and ê.
  const SPECIAL_BASES = { n: "ㄣ", ng: "ㄣ", m: "ㄇ", hm: "ㄏㄇ", hng: "ㄏㄣ", "ê": "ㄝ" };

  function readingToZhuyin(reading, p2z) {
    const { base, tone } = splitReading(reading);
    if (!base) return "";
    if (SPECIAL_BASES[base]) return decorate(SPECIAL_BASES[base], tone);
    if (typeof p2z !== "function") throw new TypeError("p2z converter is required");
    const converted = String(p2z(`${base}${tone}`) || "").replace(/\s+/gu, "");
    const symbols = converted.replace(/[˙ˊˇˋ0-5]/gu, "");
    if (!symbols || /[a-zü]/iu.test(symbols)) return "";
    return decorate(symbols, tone);
  }

  function decorate(symbols, tone) {
    if (tone === 5) return `˙${symbols}`;
    return `${symbols}${TONE_MARKS[tone] || ""}`;
  }

  // Splits a zhuyin syllable into its parts for vertical rendering.
  function parseZhuyin(zhuyin) {
    const value = String(zhuyin || "");
    const neutral = value.startsWith("˙");
    const toneMatch = value.match(/[ˊˇˋ]$/u);
    const symbols = [...value.replace(/[˙ˊˇˋ]/gu, "")];
    return { symbols, tone: neutral ? "˙" : toneMatch ? toneMatch[0] : "", neutral };
  }

  // items: pinyin-pro `type: "all"` results read with toneType "num".
  // Returns units { text, isHan, reading, mainland, adjusted, candidates }.
  function buildUnits(items, options = {}) {
    const standard = options.standard === "mainland" ? "mainland" : "taiwan";
    const units = items.map((item) => {
      const isHan = Boolean(item.isZh);
      const reading = isHan ? normalizeReading(item.pinyin) : "";
      const candidates = isHan
        ? [...new Set([item.pinyin, ...(item.polyphonic || [])].map(normalizeReading).filter((value) => /[1-5]$/u.test(value)))]
        : [];
      return { text: item.origin, isHan, reading, mainland: reading, adjusted: false, candidates };
    });
    if (standard !== "taiwan") return units;

    const exceptionIndexes = new Set();
    forEachWordMatch(units, TAIWAN_WORD_EXCEPTIONS.map((word) => [word, null]), (start, length) => {
      for (let index = start; index < start + length; index += 1) exceptionIndexes.add(index);
    });
    const wordIndexes = new Set();
    forEachWordMatch(units, TAIWAN_WORD_RULES, (start, length, readings) => {
      for (let offset = 0; offset < length; offset += 1) {
        const unit = units[start + offset];
        const next = normalizeReading(readings[offset]);
        if (unit.reading !== next) {
          unit.reading = next;
          unit.adjusted = true;
        }
        if (!unit.candidates.includes(next)) unit.candidates.push(next);
        wordIndexes.add(start + offset);
      }
    });
    units.forEach((unit, index) => {
      if (!unit.isHan || wordIndexes.has(index) || exceptionIndexes.has(index)) return;
      const rule = characterRules.get(unit.text);
      if (!rule) return;
      const raw = unit.mainland.replace(/5$/u, "0");
      if (!rule.from.has(raw) && !rule.from.has(unit.mainland)) return;
      unit.reading = normalizeReading(rule.to);
      unit.adjusted = true;
      if (!unit.candidates.includes(unit.reading)) unit.candidates.unshift(unit.reading);
    });
    return units;
  }

  function forEachWordMatch(units, rules, callback) {
    const characters = units.map((unit) => (unit.isHan ? unit.text : "\u0000"));
    for (let index = 0; index < characters.length; index += 1) {
      for (const [word, readings] of rules) {
        const parts = [...word];
        if (parts.every((part, offset) => characters[index + offset] === part)) {
          callback(index, parts.length, readings);
        }
      }
    }
  }

  function readingToPinyinMark(reading, convert) {
    const { base, tone } = splitReading(reading);
    if (!base) return "";
    const numbered = `${base.replace(/ü/gu, "v")}${tone === 5 ? 0 : tone}`;
    if (typeof convert !== "function") return numbered;
    return String(convert(numbered, { format: "numToSymbol" }) || numbered);
  }

  // mode: "zhuyin" (ㄓㄨˋ ㄧㄣ), "inline" (注(ㄓㄨˋ)音(ㄧㄣ)) or "pinyin" (zhù yīn).
  function formatUnits(units, mode, helpers = {}) {
    const preserve = helpers.preserveNonChinese !== false;
    let output = "";
    let previousWasReading = false;
    for (const unit of units) {
      if (!unit.isHan) {
        if (preserve) output += unit.text;
        else if (/\n/u.test(unit.text)) output += "\n";
        previousWasReading = false;
        continue;
      }
      if (mode === "inline") {
        output += `${unit.text}(${readingToZhuyin(unit.reading, helpers.p2z)})`;
        continue;
      }
      const value = mode === "pinyin"
        ? readingToPinyinMark(unit.reading, helpers.convert)
        : readingToZhuyin(unit.reading, helpers.p2z);
      if (previousWasReading || /[\p{L}\p{N}]$/u.test(output)) output += " ";
      output += value;
      previousWasReading = true;
    }
    return tidySeparators(output);
  }

  function tidySeparators(value) {
    return value
      .replace(/[ \t]+([,.;:!?，。！？；：、）】》」』”’])/gu, "$1")
      .replace(/([（【《「『“‘])[ \t]+/gu, "$1")
      .replace(/[ \t]*\n[ \t]*/gu, "\n");
  }

  // True when the input is romanised Pinyin (no Han characters), e.g. "zhù yīn" or "zhu4 yin1".
  function isPinyinInput(text) {
    const value = String(text || "");
    if (!value.trim() || /\p{Script=Han}/u.test(value)) return false;
    const words = value.toLowerCase().match(/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüê]+[0-5]?/gu) || [];
    if (!words.length) return false;
    const toned = words.filter((word) => /[0-5]$|[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/u.test(word)).length;
    return toned / words.length >= 0.5;
  }

  function countCharacters(value) {
    return [...String(value || "")].length;
  }

  return Object.freeze({
    MAX_INPUT_CHARACTERS,
    PREVIEW_CHARACTERS,
    TAIWAN_CHARACTER_RULES,
    TAIWAN_WORD_RULES,
    TAIWAN_EXAMPLES,
    buildUnits,
    countCharacters,
    formatUnits,
    isPinyinInput,
    normalizeReading,
    parseZhuyin,
    readingToPinyinMark,
    readingToZhuyin
  });
});
