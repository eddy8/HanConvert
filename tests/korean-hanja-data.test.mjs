import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { buildReverseWordObject } from "../scripts/korean-hanja-reverse-build.mjs";

const source = await readFile(new URL("../korean-hanja-data.js", import.meta.url), "utf8");
const context = { TextDecoder };
context.globalThis = context;
vm.runInNewContext(source, context);
const core = context.KoreanHanjaData;
const characters = JSON.parse(await readFile(new URL("../data/korean-hanja/index.json", import.meta.url), "utf8"));
const wordPayload = JSON.parse(await readFile(new URL("../data/korean-hanja/words.json", import.meta.url), "utf8"));
const reverseWordPayload = JSON.parse(await readFile(new URL("../data/korean-hanja/reverse-words.json", import.meta.url), "utf8"));

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

test("converts with the pre-generated reverse dictionary without building a Map", () => {
  assert.equal(reverseWordPayload.meta.entries, 258282);
  assert.ok(reverseWordPayload.words["大韓民國"].includes("대한민국"));
  assert.equal(core.convertHanjaToHangul("大韓民國", reverseWordPayload.words).output, "대한민국");
});

test("keeps build-time and browser reverse normalization aligned", () => {
  const words = { 력사: ["歷史"], 역사: ["歷史"], 녀자: ["女子"] };
  const browserResult = Object.fromEntries(core.buildReverseWords(words));
  assert.deepEqual(buildReverseWordObject(words), JSON.parse(JSON.stringify(browserResult)));
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

test("formats annotations in a stable Hangul-Hanja order in both directions", () => {
  const words = { 국가: ["國家"] };
  const reverse = core.buildReverseWords(words);
  assert.equal(core.convertHangulToHanja("국가", words, { mode: "hangul-hanja" }).output, "국가(國家)");
  assert.equal(core.convertHanjaToHangul("國家", reverse, { mode: "hangul-hanja" }).output, "국가(國家)");
  assert.equal(core.convertHangulToHanja("국가", words, { mode: "hanja-hangul" }).output, "國家(국가)");
  assert.equal(core.convertHanjaToHangul("國家", reverse, { mode: "hanja-hangul" }).output, "國家(국가)");
});

test("normalizes and limits Korean personal dictionary entries", () => {
  const entries = core.normalizePersonalDictionaryEntries([
    { id: "old", hangul: " 수도 ", hanja: " 首都 ", enabled: false },
    { id: "new", hangul: "수도", hanja: "水道" },
    { hangul: "plain latin", hanja: "水道" },
    { hangul: "수도", hanja: "plain latin" }
  ]);
  assert.equal(entries.length, 1);
  assert.deepEqual({ ...entries[0] }, { id: "new", hangul: "수도", hanja: "水道", enabled: true });
});

test("prioritizes the personal dictionary for Hangul and Hanja conversion", () => {
  const entries = [{ hangul: "수도", hanja: "水道", enabled: true }];
  const personalWords = core.buildPersonalWords(entries);
  const personalReverseWords = core.buildPersonalReverseWords(entries);
  const words = { 수도: ["首都", "水道"] };
  const reverse = core.buildReverseWords({ 수도: ["首都"], 물길: ["水道"] });

  const toHanja = core.convertHangulToHanja("수도", words, { personalWords });
  assert.equal(toHanja.output, "水道");
  assert.equal(toHanja.choices[0].resolved, true);

  const toHangul = core.convertHanjaToHangul("水道", reverse, { personalReverseWords });
  assert.equal(toHangul.output, "수도");
  assert.equal(toHangul.choices[0].resolved, true);
});

test("builds concise Korean glosses and expandable character details for candidates", () => {
  const recordMap = core.buildRecordMap(characters);
  const toHanja = core.buildCandidateDetails(
    { direction: "hangul-to-hanja", source: "수도" },
    "首都",
    recordMap
  );
  assert.equal(toHanja.summary, "首 머리 수 · 都 도읍 도");
  assert.deepEqual(
    Array.from(toHanja.items, ({ character, radical, strokes }) => ({ character, radical, strokes })),
    [{ character: "首", radical: "首", strokes: 9 }, { character: "都", radical: "阝", strokes: 10 }]
  );

  const toHangul = core.buildCandidateDetails(
    { direction: "hanja-to-hangul", source: "樂" },
    "악",
    recordMap
  );
  assert.equal(toHangul.summary, "樂 풍류 악");
});
