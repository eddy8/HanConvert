import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../japanese-kanji-data.js", import.meta.url), "utf8");
const context = { TextDecoder };
context.globalThis = context;
vm.runInNewContext(source, context);
const core = context.JapaneseKanjiData;
const payload = JSON.parse(await readFile(new URL("../data/japanese-kanji/index.json", import.meta.url), "utf8"));

test("ships a current KANJIDIC2 index with source and licence metadata", () => {
  assert.ok(payload.records.length > 13000);
  assert.match(payload.meta.dateOfCreation, /^\d{4}-\d{2}-\d{2}$/u);
  assert.equal(payload.meta.licence, "CC BY-SA 4.0");
  assert.match(payload.meta.licenceUrl, /edrdg\.org/u);
});

test("normalizes Katakana and dotted Kun readings for search", () => {
  assert.equal(core.normalizeReading("まな.ぶ"), "まなぶ");
  assert.equal(core.normalizeReading("ガク"), "がく");
});

test("finds Kanji by character, reading, radical, strokes, and component", () => {
  const records = payload.records;
  assert.equal(core.searchRecords(records, { query: "永", limit: 1 })[0].character, "永");
  assert.ok(core.searchRecords(records, { query: "ながい" }).some((record) => record.character === "永"));
  assert.ok(core.searchRecords(records, { radical: 85, strokes: 5 }).some((record) => record.character === "永"));
  assert.ok(core.searchRecords(records, { query: "尚" }).some((record) => record.character === "学"));
});

test("formats all standard On and Kun readings for a worksheet", () => {
  const record = payload.records.find((item) => item.character === "永");
  assert.deepEqual(Array.from(core.worksheetReadings(record)), ["音 エイ", "訓 なが.い"]);
});
