import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../kanji-romaji-core.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);

const {
  MAX_INPUT_CHARACTERS,
  buildConversionOptions,
  containsJapaneseScript,
  convertNipponToKunrei,
  countCharacters,
  protectLatinAndNumberRuns,
  restoreProtectedRuns,
  splitJapaneseText
} = context.KanjiRomajiCore;

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("counts Unicode code points without splitting surrogate pairs", () => {
  assert.equal(countCharacters("漢😀A"), 3);
  assert.equal(MAX_INPUT_CHARACTERS, 20000);
});

test("recognizes Japanese kanji and kana while rejecting Latin-only text", () => {
  assert.equal(containsJapaneseScript("明日は東京です"), true);
  assert.equal(containsJapaneseScript("にほんご"), true);
  assert.equal(containsJapaneseScript("カタカナ"), true);
  assert.equal(containsJapaneseScript("Japanese text only"), false);
});

test("splits long input at natural sentence boundaries and preserves content", () => {
  const value = `${"日".repeat(75)}。${"本".repeat(90)}！${"語".repeat(110)}`;
  const chunks = splitJapaneseText(value, 100);
  assert.equal(chunks.join(""), value);
  assert.equal(chunks[0], `${"日".repeat(75)}。`);
  assert.ok(chunks.every((chunk) => countCharacters(chunk) <= 100));
});

test("builds Kuroshiro options for each supported output", () => {
  assert.deepEqual(plain(buildConversionOptions("romaji", "hepburn")), {
    to: "romaji",
    mode: "spaced",
    romajiSystem: "hepburn"
  });
  assert.deepEqual(plain(buildConversionOptions("romaji", "kunrei")), {
    to: "romaji",
    mode: "spaced",
    romajiSystem: "nippon"
  });
  assert.deepEqual(plain(buildConversionOptions("hiragana")), {
    to: "hiragana",
    mode: "normal"
  });
  assert.deepEqual(plain(buildConversionOptions("katakana")), {
    to: "katakana",
    mode: "normal"
  });
  assert.deepEqual(plain(buildConversionOptions("furigana")), {
    to: "hiragana",
    mode: "furigana"
  });
  assert.deepEqual(plain(buildConversionOptions("okurigana")), {
    to: "hiragana",
    mode: "okurigana"
  });
});

test("falls back to Hepburn Romaji for unsupported settings", () => {
  assert.deepEqual(plain(buildConversionOptions("unknown", "unknown")), {
    to: "romaji",
    mode: "spaced",
    romajiSystem: "hepburn"
  });
});

test("normalizes Nippon-shiki distinctions to Kunrei-shiki", () => {
  assert.equal(
    convertNipponToKunrei("didudyadyudyo tôkyô"),
    "zizuzyazyuzyo tôkyô"
  );
});

test("protects original Latin text and numbers during Kunrei conversion", () => {
  const privateUseCharacter = String.fromCodePoint(0xf0000);
  const source = `ぢづ ABC dinner 123 ${privateUseCharacter}`;
  const protectedInput = protectLatinAndNumberRuns(source);
  const simulatedNippon = protectedInput.text
    .replace("ぢ", "di")
    .replace("づ", "du");
  const result = restoreProtectedRuns(
    convertNipponToKunrei(simulatedNippon),
    protectedInput.replacements
  );

  assert.equal(result, `zizu ABC dinner 123 ${privateUseCharacter}`);
  assert.equal(protectedInput.text.includes("dinner"), false);
  assert.equal(protectedInput.replacements.length, 3);
});

test("does not separate Japanese combining marks from kana", () => {
  const decomposedGa = "か\u3099";
  const protectedInput = protectLatinAndNumberRuns(`${decomposedGa} cafe\u0301`);

  assert.equal(protectedInput.text.startsWith(decomposedGa), true);
  assert.deepEqual(plain(protectedInput.replacements).map(([, value]) => value), ["cafe\u0301"]);
});
