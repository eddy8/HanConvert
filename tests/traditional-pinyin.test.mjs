import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(await read("../vendor/pinyin-pro.js"), context);
vm.runInNewContext(await read("../traditional-pinyin.js"), context);
const { pinyinPro, JianfanTraditionalPinyin: traditionalPinyin } = context;
const table = JSON.parse(await read("../vendor/pinyin-pro-traditional.json"));
const allOptions = { type: "all", toneType: "symbol", traditional: true, nonZh: "consecutive" };
const readings = (text) =>
  traditionalPinyin.pinyin(pinyinPro, text, allOptions, table).filter((item) => item.isZh).map((item) => item.pinyin).join(" ");

test("the vendored table is the official one-to-one Traditional-to-Simplified map", () => {
  assert.ok(Object.keys(table).length > 1500);
  assert.ok(Object.entries(table).every(([from, to]) => [...from].length === 1 && [...to].length === 1 && from !== to));
  assert.equal(traditionalPinyin.MAP_URL, "/vendor/pinyin-pro-traditional.json");
});

test("pinyin-pro alone misreads Traditional polyphones that the table fixes", () => {
  const plain = (text) => pinyinPro.pinyin(text, { traditional: true, toneType: "symbol" });
  assert.equal(plain("銀行"), "yín xíng");
  assert.equal(plain("還是"), "huán shì");

  assert.equal(readings("重慶的天氣很重要"), "chóng qìng de tiān qì hěn zhòng yào");
  assert.equal(readings("我還是想去"), "wǒ hái shì xiǎng qù");
  assert.equal(readings("調皮"), "tiáo pí");
  assert.equal(readings("銀行"), "yín háng");
  assert.equal(readings("睡覺"), "shuì jiào");
  assert.equal(readings("音樂"), "yīn yuè");
  assert.equal(readings("長大"), "zhǎng dà");
  // Characters the table leaves out keep their own reading instead of a wrong Simplified merge.
  assert.equal(readings("乾坤"), "qián kūn");
  assert.equal(readings("著名"), "zhù míng");
});

test("type all results keep the original Traditional characters in place", () => {
  const mixed = "ABC 還是，頭髮很長。\n𠀋字";
  const items = traditionalPinyin.pinyin(pinyinPro, mixed, allOptions, table);
  assert.equal(items.map((item) => item.origin).join(""), mixed);
  assert.equal(traditionalPinyin.pinyin(pinyinPro, "頭髮", allOptions, table).map((item) => item.origin).join("|"), "頭|髮");
});

test("string output matches what the Pinyin tool shows for Simplified input", () => {
  const options = { type: "string", pattern: "pinyin", toneType: "symbol", nonZh: "consecutive", surname: "off", traditional: true, separator: " " };
  assert.equal(traditionalPinyin.pinyin(pinyinPro, "我還是覺得銀行很重要", options, table), pinyinPro.pinyin("我还是觉得银行很重要", options));
  const numbered = { ...options, toneType: "num" };
  assert.equal(traditionalPinyin.pinyin(pinyinPro, "還是 OK", numbered, table), pinyinPro.pinyin("还是 OK", numbered));
});

test("without the table the module falls back to pinyin-pro's own Traditional option", () => {
  assert.equal(traditionalPinyin.pinyin(pinyinPro, "還是", { toneType: "symbol" }, null), pinyinPro.pinyin("還是", { toneType: "symbol", traditional: true }));
  assert.equal(traditionalPinyin.simplify("還是", null), "還是");
  assert.equal(traditionalPinyin.simplify("還是乾坤", table), "还是乾坤");
});

test("both Pinyin tools load the shared module before their own scripts", async () => {
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    for (const [slug, script] of [["chinese-to-pinyin", "pinyin-tool"], ["photo-chinese-character-recognition", "photo-chinese-character-recognition"]]) {
      const html = await read(`../${prefix}${slug}/index.html`);
      assert.match(html, new RegExp(`<script defer src="/vendor/pinyin-pro\\.js"></script>\\n    <script defer src="/traditional-pinyin\\.js"></script>\\n    <script defer src="/${script}\\.js"></script>`), `${prefix}${slug}`);
    }
  }
  const tool = await read("../pinyin-tool.js");
  assert.match(tool, /window\.JianfanTraditionalPinyin\.pinyin\(window\.pinyinPro, text, options\)/);
  assert.match(tool, /window\.JianfanTraditionalPinyin\?\.load\(\)\.then/);
});
