import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../japanese-stroke-order.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);
const core = context.JapaneseStrokeCore;

test("extracts unique Han characters for Japanese stroke lookup", () => {
  assert.deepEqual(Array.from(core.extractKanji("日本語を学ぶ日本 123")), ["日", "本", "語", "学"]);
});

test("builds the documented five-digit KanjiVG filename", () => {
  assert.equal(core.filenameForKanji("永"), "06c38.svg");
  assert.equal(core.filenameForKanji("𠮷"), "20bb7.svg");
});

test("pins the official KanjiVG release without a version query", () => {
  assert.equal(core.KANJIVG_RELEASE, "r20250816");
  assert.equal(core.dataUrlForKanji("永"), "https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@r20250816/kanji/06c38.svg");
  assert.doesNotMatch(core.dataUrlForKanji("永"), /\?v=/u);
});

const pages = [
  ["../japanese-stroke-order/index.html", "zh-CN", "日本汉字笔顺与书写顺序查询"],
  ["../zh-tw/japanese-stroke-order/index.html", "zh-Hant", "日本漢字筆順與書寫順序查詢"],
  ["../en/japanese-stroke-order/index.html", "en", "Japanese Kanji Stroke Order"],
  ["../ja/japanese-stroke-order/index.html", "ja", "漢字の書き順・筆順検索"],
  ["../ko/japanese-stroke-order/index.html", "ko", "일본 한자 필순·획순 조회"]
];

for (const [path, lang, heading] of pages) {
  test(`${lang} Japanese stroke page has static localized SEO copy`, async () => {
    const html = await readFile(new URL(path, import.meta.url), "utf8");
    const description = html.match(/<meta name="description" content="([^"]+)"/u)?.[1] || "";
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.ok(html.includes(`>${heading}</h1>`));
    assert.ok(html.includes('data-jp-stroke-sample="永"'));
    assert.ok(html.includes('href="https://kanjivg.tagaini.net/"'));
    assert.ok(html.includes('"@type":"WebApplication"'));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok([...description].length >= 150 && [...description].length <= 160);
    assert.doesNotMatch(html, /(?:src|href)="[^"]+\?v=/u);
  });
}
