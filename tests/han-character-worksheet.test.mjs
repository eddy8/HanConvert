import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../han-character-worksheet.js", import.meta.url), "utf8");
const pinyinSource = await readFile(new URL("../vendor/pinyin-pro.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);
vm.runInNewContext(pinyinSource, context);

const {
  MAX_CHARACTERS,
  buildCharacterEntries,
  buildWorksheetPlan,
  extractHanCharacters,
  getContextualReadings,
  normalizeSettings,
  selectStrokeSteps
} = context.HanCharacterWorksheetCore;

test("extracts Han characters in source order and removes duplicates", () => {
  assert.deepEqual(Array.from(extractHanCharacters("A汉字，漢字。한글")), ["汉", "字", "漢"]);
});

test("keeps repeated Han characters when deduplication is disabled", () => {
  assert.deepEqual(Array.from(extractHanCharacters("学学习", { dedupe: false })), ["学", "学", "习"]);
});

test("uses phrase context for polyphonic characters", () => {
  const readings = getContextualReadings(
    "重庆银行音乐",
    context.pinyinPro.pinyin,
    context.pinyinPro.polyphonic
  );
  assert.deepEqual(
    Array.from(readings, (item) => Array.from(item)),
    [["chóng"], ["qìng"], ["yín"], ["háng"], ["yīn"], ["yuè"]]
  );
});

test("shows every pronunciation when only one Han character is entered", () => {
  const readings = getContextualReadings(
    "行",
    context.pinyinPro.pinyin,
    context.pinyinPro.polyphonic
  );
  assert.ok(readings[0].includes("xíng"));
  assert.ok(readings[0].includes("háng"));
  assert.ok(readings[0].length > 1);
});

test("merges contextual readings when duplicate characters are grouped", () => {
  const readings = getContextualReadings(
    "快乐音乐",
    context.pinyinPro.pinyin,
    context.pinyinPro.polyphonic
  );
  const entries = buildCharacterEntries("快乐音乐", {
    contextualReadings: readings,
    dedupe: true
  });
  const music = entries.find((entry) => entry.character === "乐");
  assert.deepEqual(Array.from(music.readings), ["lè", "yuè"]);
});

test("keeps each contextual reading when duplicate characters are not grouped", () => {
  const readings = getContextualReadings(
    "快乐音乐",
    context.pinyinPro.pinyin,
    context.pinyinPro.polyphonic
  );
  const entries = buildCharacterEntries("快乐音乐", {
    contextualReadings: readings,
    dedupe: false
  });
  assert.deepEqual(
    Array.from(
      entries.filter((entry) => entry.character === "乐"),
      (entry) => entry.readings[0]
    ),
    ["lè", "yuè"]
  );
});

test("limits worksheets to the supported character count", () => {
  const input = Array.from({ length: MAX_CHARACTERS + 5 }, (_, index) =>
    String.fromCodePoint(0x4e00 + index)
  ).join("");
  assert.equal(extractHanCharacters(input).length, MAX_CHARACTERS);
});

test("normalizes layout controls to printable bounds", () => {
  const settings = normalizeSettings({
    columns: 99,
    rowsPerCharacter: 0,
    traceCells: 99,
    traceOpacity: 1,
    gridStyle: "unknown",
    paperSize: "legal"
  });
  assert.equal(settings.columns, 12);
  assert.equal(settings.rowsPerCharacter, 1);
  assert.equal(settings.traceCells, 11);
  assert.equal(settings.traceOpacity, 0.5);
  assert.equal(settings.gridStyle, "tian");
  assert.equal(settings.paperSize, "a4");
});

test("builds model, tracing and blank writing cells across pages", () => {
  const plan = buildWorksheetPlan(
    "天地玄黄宇宙",
    {
      columns: 8,
      rowsPerCharacter: 2,
      traceCells: 3,
      showStrokeOrder: false
    },
    [["tiān"], ["dì"], ["xuán"], ["huáng"], ["yǔ"], ["zhòu"]]
  );
  assert.equal(plan.charactersPerPage, 4);
  assert.equal(plan.pages.length, 2);
  assert.deepEqual(Array.from(plan.pages[0][0].readings), ["tiān"]);
  assert.deepEqual(
    Array.from(plan.pages[0][0].rows[0], (cell) => cell.kind),
    ["model", "trace", "trace", "trace", "blank", "blank", "blank", "blank"]
  );
  assert.ok(plan.pages[0][0].rows[1].every((cell) => cell.kind === "blank"));
});

test("keeps the first and final stroke when reducing long stroke sequences", () => {
  const steps = selectStrokeSteps(25, 18);
  assert.equal(steps.length, 18);
  assert.equal(steps[0], 0);
  assert.equal(steps.at(-1), 24);
  assert.deepEqual(Array.from(selectStrokeSteps(5)), [0, 1, 2, 3, 4]);
});
