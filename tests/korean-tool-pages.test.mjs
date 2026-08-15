import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugs = [
  "korean-hanja-dictionary",
  "korean-hanja-handwriting-recognition",
  "hangul-hanja-converter",
  "korean-name-hanja"
];
const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", headings: ["韩国汉字查询与在线字典", "韩国汉字手写识别与查字", "韩文与韩国汉字在线转换", "韩国人名用汉字与姓名汉字查询"] },
  "zh-TW": { prefix: "zh-tw", lang: "zh-Hant", headings: ["韓國漢字查詢與線上字典", "韓國漢字手寫辨識與查字", "韓文與韓國漢字線上轉換", "韓國人名用漢字與姓名漢字查詢"] },
  en: { prefix: "en", lang: "en", headings: ["Korean Hanja Dictionary & Lookup", "Korean Hanja Handwriting Recognition", "Hangul Hanja Converter", "Korean Personal-Name Hanja Search"] },
  ja: { prefix: "ja", lang: "ja", headings: ["韓国漢字検索・オンライン辞典", "韓国漢字の手書き検索", "ハングル・韓国漢字変換", "韓国の人名用漢字・名前漢字検索"] },
  ko: { prefix: "ko", lang: "ko", headings: ["한자 찾기·온라인 옥편", "한자 필기인식·써서 찾기", "한자 변환기·한글 한자 변환", "인명용 한자·이름 한자 찾기"] }
};

function pagePath(prefix, slug) {
  return path.join(projectRoot, prefix, slug, "index.html");
}

test("generates all Korean tools with localized static HTML and SEO metadata", async () => {
  for (const [locale, config] of Object.entries(locales)) {
    for (const [index, slug] of slugs.entries()) {
      const html = await readFile(pagePath(config.prefix, slug), "utf8");
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
      const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
      assert.match(html, new RegExp(`<html lang="${config.lang}">`), `${locale}/${slug} language`);
      assert.ok(html.includes(`<h1 id="pageTitle">${config.headings[index]}</h1>`), `${locale}/${slug} static heading`);
      assert.ok(title && [...title].length <= 70, `${locale}/${slug} title length`);
      assert.ok(description && [...description].length >= 150 && [...description].length <= 160, `${locale}/${slug} description length`);
      assert.equal((html.match(/hreflang=/g) || []).length, 6, `${locale}/${slug} hreflang count`);
      assert.ok(html.includes('"@type":"HowTo"') && html.includes('"@type":"FAQPage"'), `${locale}/${slug} structured data`);
      assert.doesNotMatch(html, /(?:src|href)="\/[^"]+\?(?:v|version)=/i, `${locale}/${slug} versioned asset`);
      for (const relatedSlug of slugs) assert.ok(html.includes(`${relatedSlug}/`), `${locale}/${slug} link to ${relatedSlug}`);
    }
  }
});

test("uses the expected browser scripts for each Korean tool", async () => {
  const expectedAssets = {
    "korean-hanja-dictionary": ["/korean-hanja-data.js", "/korean-hanja-dictionary.js"],
    "korean-hanja-handwriting-recognition": ["/korean-hanja-data.js", "/handwriting-recognition.js"],
    "hangul-hanja-converter": ["/korean-hanja-data.js", "/hangul-hanja-converter.js"],
    "korean-name-hanja": ["/korean-hanja-data.js", "/korean-name-hanja.js"]
  };
  for (const [slug, assets] of Object.entries(expectedAssets)) {
    const html = await readFile(pagePath("ko", slug), "utf8");
    for (const asset of assets) assert.ok(html.includes(`src="${asset}"`), `${slug} includes ${asset}`);
  }
});

test("ships localized bidirectional conversion-review controls", async () => {
  const labels = {
    "zh-CN": ["转换候选", "保留原文", "逐字选择", "相同词全部使用此项"],
    "zh-TW": ["轉換候選", "保留原文", "逐字選擇", "相同詞全部使用此項"],
    en: ["Conversion choices", "Keep original", "Choose one character at a time", "Use for every matching occurrence"],
    ja: ["変換候補", "原文のまま", "1文字ずつ選ぶ", "同じ語のすべてに適用"],
    ko: ["변환 후보", "원문 유지", "한 자씩 선택", "같은 낱말에 모두 적용"]
  };
  for (const [locale, config] of Object.entries(locales)) {
    const html = await readFile(pagePath(config.prefix, "hangul-hanja-converter"), "utf8");
    assert.ok(html.includes(`<h3 id="koreanConverterChoicesTitle">${labels[locale][0]}</h3>`), `${locale} review heading`);
    for (const label of labels[locale].slice(1)) assert.ok(html.includes(label), `${locale} includes ${label}`);
    assert.ok(html.includes("data-message-previous-choice="), `${locale} previous occurrence control`);
    assert.ok(html.includes("data-message-next-choice="), `${locale} next occurrence control`);
  }
});

test("ships localized Korean Hanja remote-recognition controls and accurate data-use copy", async () => {
  const prompts = {
    "zh-CN": ["候选不准确？", "试试远程识别"],
    "zh-TW": ["候選不準確？", "試試遠端辨識"],
    en: ["Matches not right?", "Try online recognition"],
    ja: ["候補が合いませんか？", "オンライン認識を試す"],
    ko: ["후보가 정확하지 않나요?", "온라인 인식 시도"]
  };
  const obsoleteClaims = /无需上传笔迹|不需上傳筆跡|Drawing coordinates are not uploaded|筆跡はサーバーへ送信しません|필기 좌표는 서버로 보내지 않습니다/u;

  for (const [locale, config] of Object.entries(locales)) {
    const html = await readFile(pagePath(config.prefix, "korean-hanja-handwriting-recognition"), "utf8");
    assert.match(html, /<div class="handwriting-remote-action" id="handwritingRemoteAction" hidden>/);
    assert.ok(html.includes(prompts[locale][0]), `${locale} remote hint`);
    assert.ok(html.includes(prompts[locale][1]), `${locale} remote action`);
    assert.ok(html.includes("data-message-remote-recognizing="), `${locale} remote status`);
    assert.doesNotMatch(html, obsoleteClaims, `${locale} accurate upload disclosure`);
  }
});

test("records reproducible Korean Hanja data provenance and counts", async () => {
  const index = JSON.parse(await readFile(path.join(projectRoot, "data", "korean-hanja", "index.json"), "utf8"));
  const words = JSON.parse(await readFile(path.join(projectRoot, "data", "korean-hanja", "words.json"), "utf8"));
  const names = JSON.parse(await readFile(path.join(projectRoot, "data", "korean-hanja", "name-use.json"), "utf8"));
  assert.equal(index.meta.recordCount, 27581);
  assert.equal(index.meta.sources.libhangul.license, "BSD-3-Clause");
  assert.match(index.meta.sources.libhangul.sha256, /^[a-f0-9]{64}$/);
  assert.equal(words.meta.entries, 186847);
  assert.equal(names.meta.uniqueCodes, 9495);
  assert.equal(names.meta.browserCompatible, 9118);
  assert.equal(names.records.find((record) => record.character === "民")?.strokes, 5);
});
