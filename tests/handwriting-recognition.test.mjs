import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../handwriting-recognition.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);

const {
  cloneStrokes,
  encodeRemoteStrokes,
  formatUnicode,
  normalizeMatches,
  normalizeRemoteMatches,
  shouldAppendPoint,
  toBoardPoint
} = context.HandwritingRecognitionCore;

test("maps pointer coordinates into the recognizer board", () => {
  assert.deepEqual(
    Array.from(toBoardPoint({ left: 100, top: 50, width: 400, height: 200 }, 300, 150)),
    [128, 128]
  );
  assert.deepEqual(
    Array.from(toBoardPoint({ left: 100, top: 50, width: 400, height: 200 }, 10, 500)),
    [0, 256]
  );
});

test("filters pointer samples that are too close together", () => {
  assert.equal(shouldAppendPoint([], [10, 10]), true);
  assert.equal(shouldAppendPoint([[10, 10]], [10.5, 10.5]), false);
  assert.equal(shouldAppendPoint([[10, 10]], [13, 14]), true);
});

test("clones stroke arrays before sending them to the worker", () => {
  const original = [[[1, 2], [3, 4]]];
  const copy = cloneStrokes(original);
  assert.deepEqual(JSON.parse(JSON.stringify(copy)), original);
  copy[0][0][0] = 99;
  assert.equal(original[0][0][0], 1);
});

test("normalizes unique Hanzi candidates and preserves score order", () => {
  const matches = normalizeMatches([
    { hanzi: "漢", score: 9 },
    { hanzi: "漢", score: 8 },
    { hanzi: "A", score: 7 },
    { hanzi: "汉", score: 6 }
  ]);
  assert.deepEqual(
    JSON.parse(JSON.stringify(matches)),
    [{ character: "漢", score: 9 }, { character: "汉", score: 6 }]
  );
});

test("encodes browser strokes for the remote fallback protocol", () => {
  assert.equal(
    encodeRemoteStrokes([[[0, 0], [128, 256]], [[256, 128]]]),
    "zh-cn0a0a130a260as260a130as"
  );
  assert.equal(encodeRemoteStrokes([[[Number.NaN, 2]]]), "");
});

test("normalizes remote fallback text into unique Hanzi candidates", () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(normalizeRemoteMatches("孙 孙 A 称\u0000承", 3))),
    [
      { character: "孙", score: 3 },
      { character: "称", score: 2 },
      { character: "承", score: 1 }
    ]
  );
});

test("formats supplementary Han characters without splitting surrogate pairs", () => {
  assert.equal(formatUnicode("漢"), "U+6F22");
  assert.equal(formatUnicode("𠮷"), "U+20BB7");
});

test("pins the official HanziLookup commit in the browser worker", async () => {
  const workerSource = await readFile(new URL("../handwriting-recognition-worker.js", import.meta.url), "utf8");
  assert.match(workerSource, /01f90c3ab99a8fadf0696c28e5eb097223c500db/);
  assert.match(workerSource, /wasm_bindgen\.lookup\(event\.data\.strokes, event\.data\.limit\)/);
});

test("uses DrawChinese only after an empty local result", () => {
  assert.match(source, /supportsRemoteFallback && !matches\.length/);
  assert.match(source, /https:\/\/www\.drawchinese\.com\/hwr\//);
  assert.match(source, /credentials: "omit"/);
  assert.match(source, /referrerPolicy: "no-referrer"/);
});
