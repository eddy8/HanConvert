import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import { isDescriptionLengthInRange } from "../scripts/seo-metadata-rules.mjs";
import { commonSyllables, syllableStrokes } from "../scripts/generate-korean-handwriting-patterns.mjs";

const source = await readFile(new URL("../korean-handwriting-recognition.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);
const core = context.KoreanHandwritingCore;

const engine = { document: { getElementById() { return null; }, addEventListener() {} }, console: { log() {} } };
engine.window = engine;
vm.runInNewContext(await readFile(new URL("../scripts/vendor/kanji-canvas.min.js", import.meta.url), "utf8"), engine);
vm.runInNewContext(await readFile(new URL("../japanese-handwriting-worker.js", import.meta.url), "utf8"), engine);
const worker = engine.JapaneseHandwritingWorker;
const payload = JSON.parse(await readFile(new URL("../data/korean-handwriting/patterns.json", import.meta.url), "utf8"));

test("splits a syllable into jamo and romanizes it on its own", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(core.decomposeSyllable("한"))), { initial: "ㅎ", medial: "ㅏ", final: "ㄴ" });
  assert.deepEqual(JSON.parse(JSON.stringify(core.decomposeSyllable("과"))), { initial: "ㄱ", medial: "ㅘ", final: "" });
  assert.equal(core.decomposeSyllable("ㄱ"), null);
  const cases = { 한: "han", 글: "geul", 국: "guk", 어: "eo", 쌍: "ssang", 읽: "ik", 꽃: "kkot", 뷁: "bwek" };
  for (const [syllable, roman] of Object.entries(cases)) assert.equal(core.romanizeSyllable(syllable), roman, syllable);
});

test("keeps only Hangul candidates and builds text", () => {
  assert.deepEqual(Array.from(core.uniqueHangul("가 과 자 가 Ⅱ ㅐ 中")), ["가", "과", "자", "ㅐ"]);
  assert.equal(core.appendCharacter("한", "글"), "한글");
});

test("encodes strokes for the online fallback with the Korean language code", () => {
  const encoded = core.encodeRemoteStrokes([[[0, 0], [130, 260]]], 260);
  assert.equal(encoded, "ko-kr0a0a130a260as");
  assert.equal(core.encodeRemoteStrokes([], 260), "");
  assert.equal(core.REMOTE_LANGUAGE, "ko-kr");
});

test("ships patterns for the 2,350 common syllables and 51 single jamo", () => {
  assert.equal(commonSyllables().length, 2350);
  const characters = new Set(payload.patterns.map(([character]) => character));
  assert.equal(characters.size, 2401);
  for (const character of "한글사랑읽가ㄱㅏㅘㄳ") assert.ok(characters.has(character), character);
  assert.ok(!characters.has("뷁"), "rare syllables are left to online recognition");
});

test("composes syllables with the expected stroke counts", () => {
  assert.equal(syllableStrokes("가").length, 3);
  assert.equal(syllableStrokes("한").length, 6);
  assert.equal(syllableStrokes("꽃").length, 7);
});

test("recognizes each syllable's own reference shape first", () => {
  const kanjiCanvas = engine.KanjiCanvas;
  kanjiCanvas.refPatterns = worker.decodePatterns(payload);
  for (const character of ["한", "글", "사", "랑", "ㅎ"]) {
    const [, , strokes] = kanjiCanvas.refPatterns.find(([entry]) => entry === character);
    assert.equal(worker.recognize(kanjiCanvas, strokes)[0], character, character);
  }
});

const pages = [
  ["../korean-handwriting-recognition/index.html", "zh-CN", "韩语手写识别与韩文手写输入"],
  ["../zh-tw/korean-handwriting-recognition/index.html", "zh-Hant", "韓文手寫辨識與線上輸入"],
  ["../en/korean-handwriting-recognition/index.html", "en", "Korean Handwriting Input"],
  ["../ja/korean-handwriting-recognition/index.html", "ja", "韓国語の手書き入力・ハングル手書き検索"],
  ["../ko/korean-handwriting-recognition/index.html", "ko", "한글 필기 인식·손글씨 입력"]
];

for (const [path, lang, heading] of pages) {
  test(`${lang} Korean handwriting page ships static SEO copy, the tool and a remote disclosure`, async () => {
    const html = await readFile(new URL(path, import.meta.url), "utf8");
    const description = html.match(/<meta name="description" content="([^"]+)"/u)?.[1] || "";
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.ok(html.includes(`>${heading}</h1>`));
    assert.ok(isDescriptionLengthInRange(html, description));
    for (const id of ["koreanHandwritingCanvas", "koreanHandwritingAppend", "koreanHandwritingText", "koreanHandwritingRemote"]) {
      assert.ok(html.includes(`id="${id}"`), id);
    }
    assert.ok(html.includes('src="https://cdn.jsdelivr.net/gh/barionleg/okanjirec@e036ef26dc307d897653f5b8750a8cb048f042b3/docs/resources/javascript/kanji-canvas.min.js" integrity="sha384-'));
    assert.ok(html.includes('src="/korean-handwriting-recognition.js"'));
    assert.ok(html.includes('"@type":"FAQPage"') && html.includes('"@type":"HowTo"'));
    assert.match(html, /class="handwriting-hint">[^<]*(远程|遠端|online|オンライン|온라인)/u);
    assert.match(html, /href="\/(?:zh-tw\/|en\/|ja\/|ko\/)?korean-hanja-handwriting-recognition\/"/u);
    assert.doesNotMatch(html, /(?:src|href)="[^"]+\?v=/u);
  });
}

test("the site directory and the Korean Hanja handwriting page link to the new tool", async () => {
  const hanja = await readFile(new URL("../korean-hanja-handwriting-recognition/index.html", import.meta.url), "utf8");
  assert.match(hanja, /<a href="\/korean-handwriting-recognition\/">韩语手写识别<\/a>/u);
  const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    assert.ok(sitemap.includes(`<loc>https://jianfan.app/${prefix}korean-handwriting-recognition/</loc>`), prefix || "zh-CN");
  }
});
