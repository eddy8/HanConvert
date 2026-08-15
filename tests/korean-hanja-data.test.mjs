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

test("selects repeated Hangul homophones independently by occurrence", () => {
  const input = "서울은 수도이고 건물에는 수도가 있다";
  const pending = core.convertHangulToHanja(input, wordPayload.words);
  const repeated = pending.choices.filter((choice) => choice.source === "수도");
  assert.equal(repeated.length, 2);
  assert.notEqual(repeated[0].id, repeated[1].id);
  assert.deepEqual(Array.from(repeated, (choice) => [choice.start, choice.end]), [[4, 6], [14, 16]]);

  const selected = core.convertHangulToHanja(input, wordPayload.words, {
    selections: {
      [repeated[0].id]: "首都",
      [repeated[1].id]: "水道"
    }
  });
  assert.equal(selected.output, "서울은 首都이고 건물에는 水道가 있다");
  assert.equal(selected.choices.find((choice) => choice.id === repeated[0].id)?.resolved, true);
  assert.equal(selected.choices.find((choice) => choice.id === repeated[1].id)?.resolved, true);
});

test("still offers Hanja candidates for one Hangul syllable", () => {
  const result = core.convertHangulToHanja("한", wordPayload.words, { selections: { 한: "韓" } });
  assert.equal(result.output, "韓");
  assert.ok(result.choices[0].candidates.includes("韓"));
});

test("keeps an ambiguous source or splits it into character choices on request", () => {
  const words = { 역사: ["歷史", "驛舍"], 역: ["驛", "役"], 사: ["史", "事"] };
  const pending = core.convertHangulToHanja("역사", words);
  const choice = pending.choices[0];
  const kept = core.convertHangulToHanja("역사", words, {
    selections: { [choice.id]: "역사" }
  });
  assert.equal(kept.output, "역사");
  assert.equal(kept.choices[0].resolved, true);

  const split = core.convertHangulToHanja("역사", words, {
    splitRanges: { [choice.id]: { start: choice.start, end: choice.end, source: choice.source } }
  });
  assert.deepEqual(Array.from(split.choices, (item) => item.source), ["역", "사"]);
  assert.deepEqual(Array.from(split.choices, (item) => [item.start, item.end]), [[0, 1], [1, 2]]);
});

test("converts Hanja words to Hangul using the reverse dictionary", () => {
  const reverse = core.buildReverseWords({ 대한민국: ["大韓民國"], 한국: ["韓國"] });
  assert.equal(core.convertHanjaToHangul("大韓民國과 韓國", reverse).output, "대한민국과 한국");
});

test("preserves polyphonic Hanja until its Korean reading is selected", () => {
  const reverse = core.buildReverseWords({ 낙: ["樂"], 락: ["樂"], 악: ["樂"], 요: ["樂"] });
  const pending = core.convertHanjaToHangul("樂", reverse);
  assert.equal(pending.output, "樂");
  assert.deepEqual([...pending.choices[0].candidates], ["낙", "악", "요"]);
  assert.equal(pending.choices[0].resolved, false);

  const selected = core.convertHanjaToHangul("樂", reverse, {
    selections: { [pending.choices[0].id]: "악" }
  });
  assert.equal(selected.output, "악");
  assert.equal(selected.choices[0].resolved, true);
});

test("selects repeated Hanja readings independently by occurrence", () => {
  const reverse = core.buildReverseWords({ 낙: ["樂"], 악: ["樂"] });
  const pending = core.convertHanjaToHangul("樂과 樂", reverse);
  const repeated = pending.choices.filter((choice) => choice.source === "樂");
  const selected = core.convertHanjaToHangul("樂과 樂", reverse, {
    selections: { [repeated[0].id]: "낙", [repeated[1].id]: "악" }
  });
  assert.equal(selected.output, "낙과 악");
});

test("prefers South Korean initial-sound-law readings in reverse conversion", () => {
  assert.equal(core.normalizeInitialSoundLaw("력사"), "역사");
  assert.equal(core.normalizeInitialSoundLaw("녀자"), "여자");
  assert.equal(core.normalizeInitialSoundLaw("로동"), "노동");
  const reverse = core.buildReverseWords({ 력사: ["歷史"], 역사: ["歷史"] });
  assert.deepEqual([...reverse.get("歷史")], ["역사"]);
  assert.equal(core.convertHanjaToHangul("歷史", reverse).output, "역사");
});
