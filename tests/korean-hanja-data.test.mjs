import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../korean-hanja-data.js", import.meta.url), "utf8");
const context = { TextDecoder };
context.globalThis = context;
vm.runInNewContext(source, context);
const core = context.KoreanHanjaData;
const characters = JSON.parse(await readFile(new URL("../data/korean-hanja/index.json", import.meta.url), "utf8"));
const wordPayload = JSON.parse(await readFile(new URL("../data/korean-hanja/words.json", import.meta.url), "utf8"));

test("contains Korean readings and current name-use status", () => {
  const record = characters.records.find((item) => item.character === "韓");
  assert.deepEqual(record.readings, ["한"]);
  assert.equal(record.nameUse, true);
  assert.ok(characters.meta.nameUseCount >= 9_000);
});

test("searches by Korean reading, radical, and name-use status", () => {
  const result = core.searchRecords(characters.records, { query: "한", radical: "韋", nameOnly: true });
  assert.equal(result[0].character, "韓");
});

test("converts Hangul words to Hanja with alternatives", () => {
  const result = core.convertHangulToHanja("대한민국", wordPayload.words);
  assert.equal(result.output, "大韓民國");
  assert.equal(result.choices[0].source, "대한민국");
  assert.equal(result.choices[0].selected, "大韓民國");
  assert.deepEqual([...result.choices[0].candidates], ["大韓民國"]);
});

test("preserves Korean particles and ambiguous words until a candidate is selected", () => {
  const pending = core.convertHangulToHanja("대한민국의 역사와 문화", wordPayload.words);
  assert.equal(pending.output, "大韓民國의 역사와 문화");
  assert.equal(pending.choices.find((choice) => choice.source === "역사")?.selected, "역사");
  assert.equal(
    core.convertHangulToHanja("역사", wordPayload.words, { mode: "parentheses" }).output,
    "역사"
  );

  const selected = core.convertHangulToHanja("대한민국의 역사와 문화", wordPayload.words, {
    selections: { 역사: "歷史", 문화: "文化" }
  });
  assert.equal(selected.output, "大韓民國의 歷史와 文化");
});

test("still offers Hanja candidates for one Hangul syllable", () => {
  const result = core.convertHangulToHanja("한", wordPayload.words, { selections: { 한: "韓" } });
  assert.equal(result.output, "韓");
  assert.ok(result.choices[0].candidates.includes("韓"));
});

test("converts Hanja words to Hangul using the reverse dictionary", () => {
  const reverse = core.buildReverseWords({ 대한민국: ["大韓民國"], 한국: ["韓國"] });
  assert.equal(core.convertHanjaToHangul("大韓民國과 韓國", reverse), "대한민국과 한국");
});

test("prefers South Korean initial-sound-law readings in reverse conversion", () => {
  assert.equal(core.normalizeInitialSoundLaw("력사"), "역사");
  assert.equal(core.normalizeInitialSoundLaw("녀자"), "여자");
  assert.equal(core.normalizeInitialSoundLaw("로동"), "노동");
  const reverse = core.buildReverseWords({ 력사: ["歷史"], 역사: ["歷史"] });
  assert.equal(core.convertHanjaToHangul("歷史", reverse), "역사");
});
