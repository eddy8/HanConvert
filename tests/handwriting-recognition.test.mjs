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

test("uses the remote endpoint automatically after an empty local result", () => {
  assert.match(source, /supportsRemoteFallback && !matches\.length/);
  assert.match(source, /requestRemoteLookup\(message\.requestId, core\.cloneStrokes\(strokes\)\)/);
  assert.match(source, /"korean-hanja-handwriting-recognition"/);
  assert.match(source, /https:\/\/jianfan\.app\/api\/hwr\//);
  assert.match(source, /credentials: "omit"/);
  assert.match(source, /referrerPolicy: "no-referrer"/);
});

test("offers manual remote recognition only for non-empty local matches", () => {
  assert.match(source, /setRemoteActionVisible\(supportsRemoteFallback && rankedMatches\.length > 0\)/);
  assert.match(source, /requestRemoteLookup\(lookupRequestId, core\.cloneStrokes\(strokes\), true\)/);
});

test("uses Traditional Chinese recognition and Korean reranking for Hanja pages", () => {
  assert.match(source, /language: usesKoreanReadings \? "zh-tw" : "zh-cn"/);
  assert.match(source, /if \(matches\.length && usesKoreanReadings\)/);
  assert.match(source, /matches = await rankKoreanCandidates\(matches\)/);
});

test("ships localized manual remote-recognition prompts", async () => {
  const pages = [
    ["../chinese-handwriting-recognition/index.html", "识别结果有误？", "试试远程识别"],
    ["../zh-tw/chinese-handwriting-recognition/index.html", "辨識結果不理想？", "試試遠端辨識"],
    ["../en/chinese-handwriting-recognition/index.html", "Results not right?", "Try remote recognition"],
    ["../ja/chinese-handwriting-recognition/index.html", "候補が合いませんか？", "オンライン認識を試す"],
    ["../ko/chinese-handwriting-recognition/index.html", "인식 결과가 정확하지 않나요?", "온라인 인식 시도"]
  ];

  for (const [path, hint, action] of pages) {
    const html = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(html, new RegExp(`<div class="handwriting-remote-action"[^>]*hidden>`));
    assert.ok(html.includes(hint));
    assert.ok(html.includes(action));
  }
});

test("converts Pinyin syllables with tone marks to Zhuyin", () => {
  const { pinyinToZhuyin } = context.HandwritingRecognitionCore;
  const cases = {
    xíng: "ㄒㄧㄥˊ", háng: "ㄏㄤˊ", lǜ: "ㄌㄩˋ", jué: "ㄐㄩㄝˊ", yuán: "ㄩㄢˊ", yǔ: "ㄩˇ", wǒ: "ㄨㄛˇ",
    zhī: "ㄓ", shì: "ㄕˋ", zǐ: "ㄗˇ", de: "˙ㄉㄜ", ér: "ㄦˊ", you: "˙ㄧㄡ", duì: "ㄉㄨㄟˋ", liù: "ㄌㄧㄡˋ"
  };
  for (const [pinyin, zhuyin] of Object.entries(cases)) assert.equal(pinyinToZhuyin(pinyin), zhuyin, pinyin);
  assert.equal(pinyinToZhuyin("hm"), "");
});

test("reads the layout and components of an ideographic description sequence", () => {
  const { describeStructure } = context.HandwritingRecognitionCore;
  assert.deepEqual(JSON.parse(JSON.stringify(describeStructure("⿰女子"))), { type: "leftRight", parts: ["女", "子"] });
  assert.deepEqual(JSON.parse(JSON.stringify(describeStructure("⿴囗或"))), { type: "surround", parts: ["囗", "或"] });
  assert.equal(describeStructure("？").type, "single");
  assert.deepEqual(JSON.parse(JSON.stringify(describeStructure("⿻十八"))), { type: "single", parts: [] });
});

test("Chinese handwriting pages add the text box, radical and structure rows, Zhuyin on zh-TW and meaning on English", async () => {
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    const html = await readFile(new URL(`../${prefix}chinese-handwriting-recognition/index.html`, import.meta.url), "utf8");
    for (const id of ["handwritingAppend", "handwritingText", "handwritingTextCopy", "handwritingResultRadical", "handwritingResultStructure", "handwritingStructureLabels"]) {
      assert.ok(html.includes(`id="${id}"`), `${prefix || "zh-CN"} ${id}`);
    }
    assert.equal(html.includes('id="handwritingResultZhuyin"'), prefix === "zh-tw/", `${prefix} zhuyin row`);
    assert.equal(html.includes('id="handwritingResultMeaning"'), prefix === "en/", `${prefix} meaning row`);
  }
  const korean = await readFile(new URL("../korean-hanja-handwriting-recognition/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(korean, /id="handwritingAppend"/);
});
