import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../kanji-to-hiragana.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);

test("normalizes the four reading outputs exposed by the page", () => {
  const core = context.KanjiHiraganaCore;
  assert.equal(core.normalizeFormat("hiragana"), "hiragana");
  assert.equal(core.normalizeFormat("furigana"), "furigana");
  assert.equal(core.normalizeFormat("okurigana"), "okurigana");
  assert.equal(core.normalizeFormat("ruby"), "ruby");
  assert.equal(core.normalizeFormat("unknown"), "hiragana");
});

test("uses Kuroshiro furigana output when Ruby HTML is requested", () => {
  assert.equal(context.KanjiHiraganaCore.workerFormat("ruby"), "furigana");
  assert.equal(context.KanjiHiraganaCore.workerFormat("okurigana"), "okurigana");
});

const pages = [
  ["../kanji-to-hiragana/index.html", "zh-CN", "日文汉字转平假名与振假名"],
  ["../zh-tw/kanji-to-hiragana/index.html", "zh-Hant", "日文漢字轉平假名與振假名"],
  ["../en/kanji-to-hiragana/index.html", "en", "Kanji to Hiragana &amp; Furigana Converter"],
  ["../ja/kanji-to-hiragana/index.html", "ja", "漢字をひらがなに変換・ふりがなを自動作成"],
  ["../ko/kanji-to-hiragana/index.html", "ko", "일본어 한자를 히라가나와 후리가나로 변환"]
];

for (const [path, lang, heading] of pages) {
  test(`${lang} page ships localized static SEO and interface copy`, async () => {
    const html = await readFile(new URL(path, import.meta.url), "utf8");
    const description = html.match(/<meta name="description" content="([^"]+)"/u)?.[1] || "";

    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.ok(html.includes(`>${heading}</h1>`));
    assert.ok(html.includes('data-sample="明日は東京で日本語を勉強します。"'));
    assert.ok(html.includes('rel="canonical"'));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok(html.includes('"@type": "WebApplication"'));
    assert.ok([...description].length >= 150 && [...description].length <= 160);
    assert.doesNotMatch(html, /(?:src|href)="[^"]+\?v=/u);
  });
}
