import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const projectRoot = path.resolve(import.meta.dirname, "..");
const coreSource = await readFile(path.join(projectRoot, "han-character-lookup-core.js"), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(coreSource, context);
const core = context.HanCharacterLookupCore;

const localizedPages = [
  ["zh-CN", "chinese-character-lookup/index.html", "汉字查询与结构拆解", "按部件反查汉字"],
  ["zh-TW", "zh-tw/chinese-character-lookup/index.html", "漢字查詢與結構拆解", "依部件反查漢字"],
  ["en", "en/chinese-character-lookup/index.html", "Chinese Character Lookup & Decomposition", "Find a Chinese character by components"],
  ["ja", "ja/chinese-character-lookup/index.html", "漢字の構成・部首検索", "構成検索（パーツ検索）"],
  ["ko", "ko/chinese-character-lookup/index.html", "한자 부수·구성요소 검색", "구성요소로 한자 찾기"]
];

test("extractHanCharacters keeps unique Han characters in input order", () => {
  assert.deepEqual(Array.from(core.extractHanCharacters("A明，清明 123森")), ["明", "清", "森"]);
});

test("extractHanComponents preserves repeated parts and enforces the four-part limit", () => {
  assert.deepEqual(Array.from(core.extractHanComponents("A 木 木 木 日 月")), ["木", "木", "木", "日"]);
});

test("parseIds creates paths for binary and nested ternary structures", () => {
  const tree = core.parseIds("⿱亡⿳口月⿲贝月凡");
  assert.equal(tree.value, "⿱");
  assert.equal(tree.children[0].value, "亡");
  assert.equal(tree.children[1].value, "⿳");
  assert.deepEqual(Array.from(tree.children[1].children[2].path), [1, 2]);
  assert.equal(tree.children[1].children[2].value, "⿲");
  assert.deepEqual(Array.from(tree.children[1].children[2].children[2].path), [1, 2, 2]);
});

test("decodeMatches preserves unknown, root and nested component paths", () => {
  assert.deepEqual(
    Array.from(core.decodeMatches("0,10,x,r,122"), (match) => match === null ? null : Array.from(match)),
    [[0], [1, 0], null, [], [1, 2, 2]]
  );
  assert.equal(core.strokeBelongsToPath([1, 2, 2], [1, 2]), true);
  assert.equal(core.strokeBelongsToPath([1, 1], [1, 2]), false);
  assert.equal(core.strokeBelongsToPath(null, []), true);
});

test("shard and Unicode helpers support supplementary-plane Han characters", () => {
  assert.equal(core.shardName("明"), "66");
  assert.equal(core.shardName("𠀀"), "200");
  assert.equal(core.formatCodePoint("𠀀"), "U+20000");
});

test("generated data contains structure and localized readings for a common character", async () => {
  const data = JSON.parse(await readFile(path.join(projectRoot, "data/han-character-lookup/66.json"), "utf8"));
  assert.deepEqual(data.明.p, ["míng"]);
  assert.equal(data.明.d, "⿰日月");
  assert.equal(data.明.r, "日");
  assert.equal(data.明.s, "8");
  assert.deepEqual(data.明.ko, ["명"]);
  assert.match(data.明.jo, /MEI/);
});

test("component index supports intersections, repeated parts, stroke filters and localized ranking", async () => {
  const index = JSON.parse(await readFile(path.join(projectRoot, "data/han-character-lookup/components.json"), "utf8"));
  assert.equal(index.version, 1);
  assert.equal(index.records, 9574);
  assert.deepEqual(Array.from(core.findCharactersByComponents(index, ["日", "月"], { locale: "zh-CN" })), ["明"]);
  assert.deepEqual(Array.from(core.findCharactersByComponents(index, ["木", "木", "木"], { locale: "zh-CN" })), ["森"]);
  assert.deepEqual(Array.from(core.findCharactersByComponents(index, ["車", "車", "車"], { locale: "ja" })), ["轟"]);
  assert.ok(core.findCharactersByComponents(index, ["木"], { locale: "zh-CN", strokes: "12" }).includes("森"));
  assert.equal(core.findCharactersByComponents(index, ["木"], { locale: "zh-CN", strokes: "11" }).includes("森"), false);
  assert.equal(core.findCharactersByComponents(index, ["木"], { locale: "ja" })[0], "来");
});

test("all localized pages contain static copy, hreflang, schemas and browser assets", async () => {
  for (const [locale, relativePath, heading, componentHeading] of localizedPages) {
    const html = await readFile(path.join(projectRoot, relativePath), "utf8");
    const description = html.match(/<meta name="description" content="([^"]+)"/u)?.[1] || "";
    assert.ok([...description].length >= 150 && [...description].length <= 160, `${locale} description length`);
    assert.match(html, new RegExp(`<h1 id="pageTitle">${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`));
    assert.match(html, /data-tool-page="han-character-lookup"/);
    assert.match(html, /src="\/han-character-lookup-core\.js"/);
    assert.match(html, /src="\/han-character-lookup\.js"/);
    assert.match(html, new RegExp(componentHeading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, /id="hanComponentLookupPanel"/);
    assert.match(html, /id="hanComponentResults"/);
    assert.match(html, /data-han-lookup-mode="component"/);
    assert.match(html, /"@type": "FAQPage"/);
    assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 6);
  }
});
