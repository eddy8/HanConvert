import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageSlugs = [
  "",
  "file-text-converter",
  "hong-kong-traditional",
  "japanese-kanji-converter",
  "simplified-to-traditional",
  "taiwan-traditional",
  "traditional-to-simplified"
];
const locales = [
  ["", "JianFan.app 提供面向中文、日文和韩文的在线汉字工具，涵盖简繁转换、读音、笔顺、查字、手写与图片识别等功能。"],
  ["zh-tw", "JianFan.app 提供面向中文、日文與韓文的線上漢字工具，涵蓋簡繁轉換、讀音、筆順、查字、手寫與圖片辨識等功能。"],
  ["en", "JianFan.app provides online character tools for Chinese, Japanese, and Korean, including script conversion, readings, stroke order, dictionaries, handwriting, and image recognition."],
  ["ja", "JianFan.app は、中国語・日本語・韓国語の漢字ツールを提供しています。簡繁変換、読み方、筆順、漢字検索、手書き・画像認識などをオンラインで利用できます。"],
  ["ko", "JianFan.app는 중국어·일본어·한국어 한자 온라인 도구를 제공합니다. 간체·번체 변환, 읽기, 필순, 한자 찾기, 필기·사진 인식 등을 이용할 수 있습니다."]
];

test("uses a complete localized site description in shared static footers", async () => {
  for (const [prefix, footerText] of locales) {
    for (const slug of pageSlugs) {
      const htmlPath = path.join(projectRoot, prefix, slug, "index.html");
      const html = await readFile(htmlPath, "utf8");
      assert.ok(
        html.includes(`<p data-i18n="footerText">${footerText}</p>`),
        `${prefix || "zh-CN"}/${slug || "home"} footer`
      );
    }
  }
});

test("keeps runtime footer translations aligned with static HTML", async () => {
  const appSource = await readFile(path.join(projectRoot, "app.js"), "utf8");
  for (const [, footerText] of locales) {
    assert.ok(appSource.includes(`footerText: "${footerText}"`));
  }
});
