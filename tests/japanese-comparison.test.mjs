import assert from "node:assert/strict";
import test from "node:test";

import { analyzeCharacterChanges } from "../japanese-comparison.js";

test("finds changed Japanese glyphs and counts repeated pairs", () => {
  const result = analyzeCharacterChanges("国学会国", "國學會國");

  assert.equal(result.totalChanges, 4);
  assert.equal(result.uniqueChanges, 3);
  assert.deepEqual(result.pairs, [
    { source: "国", target: "國", count: 2 },
    { source: "学", target: "學", count: 1 },
    { source: "会", target: "會", count: 1 }
  ]);
  assert.deepEqual(result.segments, [{ text: "國學會國", changed: true }]);
});

test("keeps unchanged text outside highlighted segments", () => {
  const result = analyzeCharacterChanges("日本の国語", "日本の國語");

  assert.deepEqual(result.segments, [
    { text: "日本の", changed: false },
    { text: "國", changed: true },
    { text: "語", changed: false }
  ]);
});

test("does not split supplementary Unicode characters", () => {
  const result = analyzeCharacterChanges("𠮷国", "𠮷國", { previewLimit: 2 });

  assert.deepEqual(result.segments, [
    { text: "𠮷", changed: false },
    { text: "國", changed: true }
  ]);
  assert.equal(result.previewTruncated, false);
});

test("aligns short insertions without marking the remaining text", () => {
  const result = analyzeCharacterChanges("旧字体", "旧字體表記");

  assert.deepEqual(result.segments, [
    { text: "旧字", changed: false },
    { text: "體表記", changed: true }
  ]);
  assert.deepEqual(result.pairs, [{ source: "体", target: "體表記", count: 1 }]);
});

test("limits preview and table output while retaining full counts", () => {
  const result = analyzeCharacterChanges("国学会", "國學會", { previewLimit: 2, pairLimit: 2 });

  assert.equal(result.totalChanges, 3);
  assert.equal(result.uniqueChanges, 3);
  assert.equal(result.previewTruncated, true);
  assert.equal(result.pairsTruncated, true);
  assert.equal(result.pairs.length, 2);
  assert.equal(result.segments.map((segment) => segment.text).join(""), "國學");
});
