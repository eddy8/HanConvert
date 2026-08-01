import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../japanese-handwriting-recognition.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);
const core = context.JapaneseHandwritingCore;

test("pins the documented okanjirec commit and verified pattern file", () => {
  assert.equal(core.COMMIT, "e036ef26dc307d897653f5b8750a8cb048f042b3");
  assert.equal(core.PATTERN_SHA256, "e1770a3f32ce18cc1c0eff67c539e663a3e2b0437172bde66abc3336aedf06c7");
  assert.match(core.PATTERN_URL, new RegExp(core.COMMIT));
  assert.doesNotMatch(core.PATTERN_URL, /\?v=/u);
});

test("deduplicates recognition candidates without splitting supplementary characters", () => {
  assert.deepEqual(Array.from(core.uniqueCandidates("永 永A学𠮷日", 4)), ["永", "学", "𠮷", "日"]);
});

test("formats digest bytes as lowercase hexadecimal", () => {
  assert.equal(core.bytesToHex(new Uint8Array([0, 15, 255])), "000fff");
});

const pages = [
  ["../japanese-handwriting-recognition/index.html", "zh-CN", "日文手写汉字识别与查字"],
  ["../zh-tw/japanese-handwriting-recognition/index.html", "zh-Hant", "日文手寫漢字辨識與查字"],
  ["../en/japanese-handwriting-recognition/index.html", "en", "Japanese Kanji Handwriting Recognition"],
  ["../ja/japanese-handwriting-recognition/index.html", "ja", "手書き漢字検索・手書き入力"],
  ["../ko/japanese-handwriting-recognition/index.html", "ko", "일본 한자 손글씨 인식·검색"]
];

for (const [path, lang, heading] of pages) {
  test(`${lang} Japanese handwriting page has static localized SEO copy`, async () => {
    const html = await readFile(new URL(path, import.meta.url), "utf8");
    const description = html.match(/<meta name="description" content="([^"]+)"/u)?.[1] || "";
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.ok(html.includes(`>${heading}</h1>`));
    assert.ok(html.includes('id="japaneseHandwritingCanvas"'));
    assert.ok(html.includes(`okanjirec@${core.COMMIT}`));
    assert.ok(html.includes('integrity="sha384-'));
    assert.ok(html.includes('href="https://github.com/barionleg/okanjirec"'));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok([...description].length >= 150 && [...description].length <= 160);
    assert.doesNotMatch(html, /(?:src|href)="[^"]+\?v=/u);
  });
}
