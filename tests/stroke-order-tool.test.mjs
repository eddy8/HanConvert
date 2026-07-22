import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../stroke-order-tool.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);
const { extractStrokeCharacters } = context.StrokeOrderCore;

test("keeps Han characters while removing other input", () => {
  assert.deepEqual(Array.from(extractStrokeCharacters("学习 Hanzi 123，漢字！")), ["学", "习", "漢", "字"]);
});

test("deduplicates characters and preserves their first-seen order", () => {
  assert.deepEqual(Array.from(extractStrokeCharacters("学习学習習")), ["学", "习", "習"]);
});

test("limits multi-character stroke lookups", () => {
  assert.deepEqual(Array.from(extractStrokeCharacters("一二三四五六七八九十", 8)), ["一", "二", "三", "四", "五", "六", "七", "八"]);
});
