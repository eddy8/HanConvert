import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../vendor/pinyin-pro.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);

const { pinyin, polyphonic } = context.pinyinPro;

test("converts Simplified and Traditional Chinese with contextual pronunciation", () => {
  assert.equal(pinyin("汉字拼音"), "hàn zì pīn yīn");
  assert.equal(pinyin("漢字拼音", { traditional: true }), "hàn zì pīn yīn");
  assert.equal(pinyin("重庆银行音乐"), "chóng qìng yín háng yīn yuè");
});

test("supports the four output formats used by the page", () => {
  assert.equal(pinyin("汉字", { toneType: "symbol" }), "hàn zì");
  assert.equal(pinyin("汉字", { toneType: "num" }), "han4 zi4");
  assert.equal(pinyin("汉字", { toneType: "none" }), "han zi");
  assert.equal(pinyin("汉字", { pattern: "first", toneType: "none" }), "h z");
});

test("handles surname mode and single-character polyphonic lookup", () => {
  assert.equal(pinyin("单田芳", { surname: "head" }), "shàn tián fāng");
  const readings = polyphonic("行", { type: "array", toneType: "symbol" }).flat(Infinity);
  assert.ok(readings.includes("xíng"));
  assert.ok(readings.includes("háng"));
});
