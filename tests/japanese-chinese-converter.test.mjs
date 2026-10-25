import assert from "node:assert/strict";
import test from "node:test";

import {
  buildThreeWayComparison,
  convertJapaneseChineseText,
  createConversionQueue
} from "../japanese-chinese-converter.js";

const characterMaps = {
  jp2t: { 国: "國", 学: "學", 会: "會" },
  s2t: { 国: "國", 学: "學", 会: "會" },
  t2s: { 國: "国", 學: "学", 會: "会" },
  t2jp: { 國: "国", 學: "学", 會: "会" }
};

function convert(config, input) {
  const map = characterMaps[config];
  return [...input].map((character) => map?.[character] ?? character).join("");
}

test("converts Japanese input into Simplified and Traditional Chinese forms", async () => {
  assert.deepEqual(await convertJapaneseChineseText("国学会", "japanese", convert), {
    japanese: "国学会",
    simplified: "国学会",
    traditional: "國學會"
  });
});

test("converts Simplified Chinese input into Japanese and Traditional forms", async () => {
  assert.deepEqual(await convertJapaneseChineseText("国学会", "simplified", convert), {
    japanese: "国学会",
    simplified: "国学会",
    traditional: "國學會"
  });
});

test("converts Traditional Chinese input into Japanese and Simplified forms", async () => {
  assert.deepEqual(await convertJapaneseChineseText("國學會", "traditional", convert), {
    japanese: "国学会",
    simplified: "国学会",
    traditional: "國學會"
  });
});

test("builds a deduplicated three-way comparison with occurrence counts", () => {
  const comparison = buildThreeWayComparison({
    japanese: "国学国",
    simplified: "国学国",
    traditional: "國學國"
  });

  assert.equal(comparison.totalChanges, 3);
  assert.equal(comparison.uniqueChanges, 2);
  assert.deepEqual(comparison.rows, [
    { japanese: "国", simplified: "国", traditional: "國", count: 2 },
    { japanese: "学", simplified: "学", traditional: "學", count: 1 }
  ]);
});

test("reports alignment limits when a conversion changes character count", () => {
  const comparison = buildThreeWayComparison({
    japanese: "芸術",
    simplified: "艺术",
    traditional: "藝術"
  });

  assert.equal(comparison.alignmentLimited, false);
  assert.equal(comparison.totalChanges, 2);

  const unequal = buildThreeWayComparison({ japanese: "一", simplified: "一个", traditional: "一" });
  assert.equal(unequal.alignmentLimited, true);
  assert.deepEqual(unequal.rows, []);
});


test("serializes overlapping conversion requests during lazy WASM initialization", async () => {
  const enqueue = createConversionQueue();
  const events = [];
  let releaseFirst;
  const firstReady = new Promise((resolve) => { releaseFirst = resolve; });
  const first = enqueue(async () => {
    events.push("first start");
    await firstReady;
    events.push("first end");
    return "first";
  });
  const second = enqueue(async () => { events.push("second"); return "second"; });
  await Promise.resolve();
  assert.deepEqual(events, ["first start"]);
  releaseFirst();
  assert.deepEqual(await Promise.all([first, second]), ["first", "second"]);
  assert.deepEqual(events, ["first start", "first end", "second"]);
});

test("a failed conversion does not block later requests", async () => {
  const enqueue = createConversionQueue();
  const failed = enqueue(() => { throw new Error("dictionary unavailable"); });
  const retry = enqueue(() => "converted");
  await assert.rejects(failed, /dictionary unavailable/);
  assert.equal(await retry, "converted");
});
