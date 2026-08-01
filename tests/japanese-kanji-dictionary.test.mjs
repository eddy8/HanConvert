import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  ["../japanese-kanji-dictionary/index.html", "zh-CN", "日本汉字查询与在线字典"],
  ["../zh-tw/japanese-kanji-dictionary/index.html", "zh-Hant", "日本漢字查詢與線上字典"],
  ["../en/japanese-kanji-dictionary/index.html", "en", "Japanese Kanji Dictionary"],
  ["../ja/japanese-kanji-dictionary/index.html", "ja", "漢字検索・オンライン漢字辞典"],
  ["../ko/japanese-kanji-dictionary/index.html", "ko", "일본 한자 검색·온라인 사전"]
];

for (const [path, lang, heading] of pages) {
  test(`${lang} Kanji dictionary page has localized static search copy`, async () => {
    const html = await readFile(new URL(path, import.meta.url), "utf8");
    const description = html.match(/<meta name="description" content="([^"]+)"/u)?.[1] || "";
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.ok(html.includes(`>${heading}</h1>`));
    assert.ok(html.includes('id="kanjiDictionaryRadical"'));
    assert.ok(html.includes('id="kanjiDictionaryStrokes"'));
    assert.ok(html.includes('href="https://www.edrdg.org/edrdg/licence.html"'));
    assert.ok(html.includes('"@type":"WebApplication"'));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok([...description].length >= 150 && [...description].length <= 160);
    assert.doesNotMatch(html, /(?:src|href)="[^"]+\?v=/u);
  });
}
