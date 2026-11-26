import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const context = {};
context.globalThis = context;
for (const file of ["vendor/pinyin-pro.js", "traditional-pinyin.js", "zhuyin-core.js"]) {
  vm.runInNewContext(await readFile(new URL(file, root), "utf8"), context);
}
context.JianfanTraditionalPinyin.setTable(JSON.parse(await readFile(new URL("vendor/pinyin-pro-traditional.json", root), "utf8")));
const { pinyinPro, JianfanTraditionalPinyin: traditional, JianfanZhuyin: zhuyin } = context;

// Minimal stand-in for the pinyin-to-zhuyin library (loaded from the CDN in the browser):
// enough syllables to check how zhuyin-core places tones and joins output.
const syllables = { zhu: "ㄓㄨ", yin: "ㄧㄣ", ma: "ㄇㄚ", xing: "ㄒㄧㄥ", qi: "ㄑㄧ", wo: "ㄨㄛ", men: "ㄇㄣ" };
const toneMarks = { 1: "", 2: "ˊ", 3: "ˇ", 4: "ˋ" };
function fakeP2z(value) {
  const [, base, tone] = value.match(/^([a-zü]+)([1-5])$/u);
  if (!syllables[base]) return value;
  return tone === "5" ? `˙${syllables[base]}` : `${syllables[base]}${toneMarks[tone]}`;
}

function readings(text, standard = "taiwan", toneSandhi = false) {
  const items = traditional.pinyin(pinyinPro, text, { type: "all", toneType: "num", toneSandhi, nonZh: "consecutive" });
  return zhuyin.buildUnits(items, { standard }).filter((unit) => unit.isHan).map((unit) => unit.reading.replace(/5$/u, "0")).join(" ");
}

test("every Taiwan example on the page matches both reading standards", () => {
  assert.ok(zhuyin.TAIWAN_EXAMPLES.length >= 6);
  for (const [traditionalWord, simplifiedWord, mainland, taiwan] of zhuyin.TAIWAN_EXAMPLES) {
    assert.equal(readings(traditionalWord, "mainland"), mainland, `${traditionalWord} mainland`);
    assert.equal(readings(traditionalWord, "taiwan"), taiwan, `${traditionalWord} taiwan`);
    assert.equal(readings(simplifiedWord, "taiwan"), taiwan, `${simplifiedWord} simplified taiwan`);
  }
});

test("Taiwan rules only replace the Mainland reading they target", () => {
  assert.equal(readings("人質"), "ren2 zhi4");
  assert.equal(readings("銀行"), "yin2 hang2");
  assert.equal(readings("行走"), "xing2 zou3");
  assert.equal(readings("星期", "mainland"), "xing1 qi1");
});

test("一 and 不 keep dictionary tones unless tone change is requested", () => {
  assert.equal(readings("一個不對"), "yi1 ge4 bu4 dui4");
  assert.equal(readings("一個不對", "taiwan", true), "yi2 ge4 bu2 dui4");
});

test("converts readings to zhuyin with tone marks and neutral-tone dots", () => {
  assert.equal(zhuyin.readingToZhuyin("zhu4", fakeP2z), "ㄓㄨˋ");
  assert.equal(zhuyin.readingToZhuyin("yin1", fakeP2z), "ㄧㄣ");
  assert.equal(zhuyin.readingToZhuyin("ma0", fakeP2z), "˙ㄇㄚ");
  assert.equal(zhuyin.readingToZhuyin("ng4", fakeP2z), "ㄣˋ");
  assert.equal(zhuyin.readingToZhuyin("m2", fakeP2z), "ㄇˊ");
  assert.deepEqual(JSON.parse(JSON.stringify(zhuyin.parseZhuyin("˙ㄇㄚ"))), { symbols: ["ㄇ", "ㄚ"], tone: "˙", neutral: true });
  assert.deepEqual(JSON.parse(JSON.stringify(zhuyin.parseZhuyin("ㄒㄧㄥˊ"))), { symbols: ["ㄒ", "ㄧ", "ㄥ"], tone: "ˊ", neutral: false });
});

test("formats zhuyin, inline and pinyin output", () => {
  const items = traditional.pinyin(pinyinPro, "注音，我們", { type: "all", toneType: "num", nonZh: "consecutive" });
  const units = zhuyin.buildUnits(items, { standard: "taiwan" });
  const helpers = { p2z: fakeP2z, convert: pinyinPro.convert };
  assert.equal(zhuyin.formatUnits(units, "zhuyin", helpers), "ㄓㄨˋ ㄧㄣ，ㄨㄛˇ ˙ㄇㄣ");
  assert.equal(zhuyin.formatUnits(units, "inline", helpers), "注(ㄓㄨˋ)音(ㄧㄣ)，我(ㄨㄛˇ)們(˙ㄇㄣ)");
  assert.equal(zhuyin.formatUnits(units, "pinyin", helpers), "zhù yīn，wǒ men");
  assert.equal(zhuyin.formatUnits(units, "zhuyin", { ...helpers, preserveNonChinese: false }), "ㄓㄨˋ ㄧㄣ ㄨㄛˇ ˙ㄇㄣ");
});

test("detects romanised Pinyin input but not English or Chinese", () => {
  assert.equal(zhuyin.isPinyinInput("zhù yīn fú hào"), true);
  assert.equal(zhuyin.isPinyinInput("zhu4 yin1"), true);
  assert.equal(zhuyin.isPinyinInput("hello world"), false);
  assert.equal(zhuyin.isPinyinInput("注音 zhu4"), false);
});

test("localized pages load the pinned zhuyin library with SRI and match their FAQ schema", async () => {
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    const html = await readFile(new URL(`${prefix}chinese-to-zhuyin/index.html`, root), "utf8");
    assert.match(html, /"pinyin-to-zhuyin":"https:\/\/cdn\.jsdmirror\.cn\/npm\/pinyin-to-zhuyin@1\.1\.0\/dist\/pinyin-to-zhuyin\.esm\.js"/u);
    assert.match(html, /<link rel="modulepreload" href="https:\/\/cdn\.jsdmirror\.cn\/npm\/pinyin-to-zhuyin@1\.1\.0\/[^"]+" integrity="sha384-[^"]+" crossorigin="anonymous" \/>/u);
    assert.match(html, /<script type="module" src="\/chinese-to-zhuyin\.js"><\/script>/u);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)[1]);
    const faq = schema["@graph"].find((entry) => entry["@type"] === "FAQPage");
    const visibleQuestions = [...html.matchAll(/<details><summary>/gu)].length;
    assert.equal(faq.mainEntity.length, visibleQuestions + 1, `${prefix} FAQ schema covers the answer block and every visible question`);
    assert.ok(visibleQuestions >= 6);
    for (const [word] of zhuyin.TAIWAN_EXAMPLES.slice(0, 3)) assert.ok(html.includes(word) || html.includes(traditional.simplify(word)));
  }
});
