import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../character-counter.js", import.meta.url), "utf8");
const context = {
  Intl,
  TextEncoder
};
context.globalThis = context;
vm.runInNewContext(source, context);

const {
  MAX_FILE_SIZE_BYTES,
  analyzeText,
  classifyGrapheme,
  countKoreanFormBytes,
  filterFrequency,
  validateFileDescriptor
} = context.CharacterCounterCore;

test("counts Unicode graphemes, whitespace, lines and UTF-8 bytes", () => {
  const result = analyzeText("汉字 A\n한국", "zh-CN");
  assert.equal(result.characters, 7);
  assert.equal(result.charactersNoWhitespace, 5);
  assert.equal(result.lines, 2);
  assert.equal(result.bytes, new TextEncoder().encode("汉字 A\n한국").length);
  assert.equal(result.categories.han, 2);
  assert.equal(result.categories.hangul, 2);
  assert.equal(result.categories.latin, 1);
});

test("keeps emoji sequences as one grapheme", () => {
  const result = analyzeText("A👨‍👩‍👧‍👦B", "en");
  assert.equal(result.characters, 3);
  assert.equal(result.charactersNoWhitespace, 3);
  assert.equal(result.uniqueCharacters, 3);
});

test("calculates Korean two-byte form limits separately from UTF-8", () => {
  assert.equal(countKoreanFormBytes("ABC 123"), 7);
  assert.equal(countKoreanFormBytes("한글漢字"), 8);

  const result = analyzeText("한글 A", "ko");
  assert.equal(result.bytesKorean2, 6);
  assert.equal(result.bytes, new TextEncoder().encode("한글 A").length);
});

test("counts paragraphs, sentences and words", () => {
  const result = analyzeText("Hello world. Next sentence!\n\nFinal paragraph.", "en");
  assert.equal(result.paragraphs, 2);
  assert.equal(result.sentences, 3);
  assert.equal(result.words, 6);
});

test("classifies CJK scripts and punctuation", () => {
  assert.equal(classifyGrapheme("漢"), "han");
  assert.equal(classifyGrapheme("あ"), "hiragana");
  assert.equal(classifyGrapheme("カ"), "katakana");
  assert.equal(classifyGrapheme("한"), "hangul");
  assert.equal(classifyGrapheme("。"), "punctuationSymbol");
});

test("sorts frequency and optionally removes punctuation", () => {
  const result = analyzeText("字字文。。A", "zh-CN");
  const filtered = filterFrequency(result.frequency, { excludePunctuation: true, limit: 4 });
  assert.deepEqual(Array.from(filtered, (item) => item.character).sort(), ["A", "字", "文"].sort());
  assert.equal(filtered.find((item) => item.character === "字").count, 2);
  assert.equal(filtered.some((item) => item.character === "。"), false);
});

test("validates supported text and DOCX files", () => {
  assert.equal(validateFileDescriptor("notes.txt", 1024), "");
  assert.equal(validateFileDescriptor("draft.DOCX", 1024), "");
  assert.equal(validateFileDescriptor("sheet.xlsx", 1024), "unsupported");
  assert.equal(validateFileDescriptor("large.txt", MAX_FILE_SIZE_BYTES + 1), "tooLarge");
});

test("converts non-whitespace characters to 400-cell manuscript sheets", () => {
  const empty = analyzeText("", "ja");
  const partial = analyzeText("日".repeat(401), "ja");
  const exact = analyzeText("日".repeat(800), "ja");

  assert.equal(empty.manuscriptSheets, 0);
  assert.equal(empty.manuscriptLastSheetCharacters, 0);
  assert.equal(partial.manuscriptSheets, 2);
  assert.equal(partial.manuscriptLastSheetCharacters, 1);
  assert.equal(exact.manuscriptSheets, 2);
  assert.equal(exact.manuscriptLastSheetCharacters, 400);
});
