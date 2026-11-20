import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import { isDescriptionLengthInRange } from "../scripts/seo-metadata-rules.mjs";

const source = await readFile(new URL("../japanese-handwriting-recognition.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);
const core = context.JapaneseHandwritingCore;

const workerSource = await readFile(new URL("../japanese-handwriting-worker.js", import.meta.url), "utf8");
const workerContext = { console };
workerContext.globalThis = workerContext;
vm.runInNewContext(workerSource, workerContext);
const worker = workerContext.JapaneseHandwritingWorker;
const kanjiCanvasContext = { document: { getElementById() { return null; }, addEventListener() {} }, console: { log() {} } };
kanjiCanvasContext.window = kanjiCanvasContext;
vm.runInNewContext(await readFile(new URL("../vendor/kanji-canvas.min.js", import.meta.url), "utf8"), kanjiCanvasContext);
const patternPayload = JSON.parse(await readFile(new URL("../data/japanese-handwriting/patterns.json", import.meta.url), "utf8"));

test("deduplicates recognition candidates without splitting supplementary characters", () => {
  assert.deepEqual(Array.from(core.uniqueCandidates("永 永A学𠮷日", 4)), ["永", "学", "𠮷", "日"]);
  assert.deepEqual(Array.from(core.uniqueCandidates(["木", "木", "本"])), ["木", "本"]);
});

test("builds words in the text box and detects kanji for the reading lookup", () => {
  assert.equal(core.appendCharacter("躊", "躇"), "躊躇");
  assert.equal(Array.from(core.appendCharacter("あ".repeat(core.MAX_TEXT_LENGTH), "漢")).length, core.MAX_TEXT_LENGTH);
  assert.equal(core.hasKanji("ちゅうちょ"), false);
  assert.equal(core.hasKanji("躊躇"), true);
  assert.notEqual(core.strokeSignature([[[0, 0], [1, 1]]]), core.strokeSignature([[[0, 0], [1, 1]], [[2, 2], [3, 3]]]));
});

test("ships KanjiVG reference patterns for about 6,400 kanji, including non-Joyo and Japanese-made kanji", () => {
  assert.match(patternPayload.source, /^KanjiVG r\d{8}$/u);
  assert.equal(patternPayload.license, "CC BY-SA 3.0");
  assert.ok(patternPayload.patterns.length > 6000, `${patternPayload.patterns.length} patterns`);
  const characters = new Set(patternPayload.patterns.map(([character]) => character));
  for (const character of "木学嘘噂苺檸檬鰻蕎麦饂飩躊躇牡蠣狼狐狸込畑峠匂鰯躾榊栃辻") assert.ok(characters.has(character), character);
});

test("decodes patterns with the stroke count each entry declares", () => {
  const patterns = worker.decodePatterns(patternPayload);
  const wood = patterns.find(([character]) => character === "木");
  assert.equal(wood[1], 4);
  assert.equal(wood[2].length, 4);
  assert.ok(wood[2].every((stroke) => stroke.length >= 2 && stroke.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))));
});

test("recognizes the reference shape of a non-Joyo kanji as its first candidate", () => {
  const kanjiCanvas = kanjiCanvasContext.KanjiCanvas;
  kanjiCanvas.refPatterns = worker.decodePatterns(patternPayload);
  for (const character of ["木", "嘘", "苺"]) {
    const [, , strokes] = kanjiCanvas.refPatterns.find(([entry]) => entry === character);
    assert.equal(worker.recognize(kanjiCanvas, strokes)[0], character);
  }
  assert.deepEqual(Array.from(worker.recognize(kanjiCanvas, [])), []);
});

test("compares only patterns within one stroke of the drawing", () => {
  assert.equal(worker.STROKE_WINDOW, 1);
  assert.equal(worker.PATTERN_URL, "/data/japanese-handwriting/patterns.json");
});

test("vendored Kanji Canvas keeps its MIT licence with the required backlink", async () => {
  const licence = await readFile(new URL("../vendor/kanji-canvas-LICENSE.txt", import.meta.url), "utf8");
  assert.match(licence, /http:\/\/github\.com\/asdfjkl\/kanjicanvas/u);
  const notice = await readFile(new URL("../data/japanese-handwriting/NOTICE.md", import.meta.url), "utf8");
  assert.match(notice, /Creative Commons Attribution-Share Alike 3\.0/u);
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
    assert.ok(html.includes('src="/vendor/kanji-canvas.min.js"'));
    assert.ok(html.includes('src="/japanese-reading-client.js"'));
    assert.ok(html.includes('id="japaneseHandwritingAppend"'));
    assert.ok(html.includes('id="japaneseHandwritingText"'));
    assert.ok(html.includes("KanjiVG（CC BY-SA 3.0）") || html.includes("KanjiVG (CC BY-SA 3.0)") || html.includes("KanjiVG(CC BY-SA 3.0)"));
    assert.doesNotMatch(html, /okanjirec@|japaneseHandwritingRecognize|handwriting-source-note/u);
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok(isDescriptionLengthInRange(html, description));
    assert.doesNotMatch(html, /(?:src|href)="[^"]+\?v=/u);
  });
}
