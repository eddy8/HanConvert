import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
require("../text-formatter.js");
const core = globalThis.TextFormatterCore;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("collapses horizontal whitespace without destroying line breaks", () => {
  const result = core.formatText("first   line\nsecond\t\tline");
  assert.equal(result.text, "first line\nsecond line");
});

test("removes every space in a sequence of Han characters", () => {
  const result = core.formatText("中 文 字 格", { removeHanSpaces: true });
  assert.equal(result.text, "中文字格");
});

test("protects URLs, email addresses, inline code and decimal numbers from CJK punctuation rules", () => {
  const input = "地址 https://example.com/a,b?x=1.2 邮箱 a.b@example.com 数值 3.14 `a,b` 中文,好吗?";
  const result = core.formatText(input, { useCjkPunctuation: true });
  assert.match(result.text, /https:\/\/example\.com\/a,b\?x=1\.2/u);
  assert.match(result.text, /a\.b@example\.com/u);
  assert.match(result.text, /3\.14/u);
  assert.match(result.text, /`a,b`/u);
  assert.match(result.text, /中文，好吗？/u);
});

test("leaves malformed percent-encoded URLs unchanged instead of throwing", () => {
  assert.doesNotThrow(() => core.decodeUrlsSafely("https://example.com/%E0%A4%A"));
  assert.equal(core.decodeUrlsSafely("https://example.com/%E0%A4%A"), "https://example.com/%E0%A4%A");
});

test("removes repeated high-confidence hidden characters and normalizes special spaces", () => {
  const result = core.formatText("A\u200B\u200BB\u00A0C");
  assert.equal(result.text, "AB C");
  assert.equal(result.scanBefore.categories.basicInvisible.count, 2);
  assert.equal(result.scanBefore.categories.specialSpaces.count, 1);
  assert.equal(result.scanAfter.total, 0);
});

test("preserves joiners and variation selectors by default", () => {
  const family = "👨‍👩‍👧‍👦";
  const heart = "❤️";
  const result = core.formatText(`${family} ${heart}`);
  assert.equal(result.text, `${family} ${heart}`);
  assert.equal(result.scanAfter.categories.joiners.count, 3);
  assert.equal(result.scanAfter.categories.variationSelectors.count, 1);
});

test("removes joiners and variation selectors only when explicitly selected", () => {
  const result = core.formatText("A\u200CB\u200DC\uFE0F", {
    removeJoiners: true,
    removeVariationSelectors: true
  });
  assert.equal(result.text, "ABC");
  assert.equal(result.scanAfter.total, 0);
});

test("normalizes mixed-script lookalikes without changing a pure Cyrillic word", () => {
  assert.equal(core.normalizeMixedScriptConfusables("pаypal привет ＡI"), "paypal привет AI");
  assert.equal(core.scanSuspiciousUnicode("привет").categories.confusables.count, 0);
  assert.equal(core.scanSuspiciousUnicode("pаypal").categories.confusables.count, 1);
});

test("does not apply broad compatibility normalization", () => {
  const result = core.formatText("① ㍿ ²");
  assert.equal(result.text, "① ㍿ ²");
});

test("joins wrapped paragraphs and repairs only explicit Latin line-end hyphenation", () => {
  const result = core.formatText("A para-\ngraph wraps here.\n\n中\n文", {
    lineMode: "join",
    repairHyphenation: true
  });
  assert.equal(result.text, "A paragraph wraps here.\n\n中文");
});

test("uses sentence segmentation without changing decimal punctuation", () => {
  const result = core.formatText("Version 3.14 is stable. Next sentence.", {
    lineMode: "sentence",
    locale: "en"
  });
  assert.equal(result.text, "Version 3.14 is stable.\nNext sentence.");
});

test("ships five localized static pages with canonical, hreflang, schema and tool controls", async () => {
  const pages = [
    "text-formatter/index.html",
    "zh-tw/text-formatter/index.html",
    "en/text-formatter/index.html",
    "ja/text-formatter/index.html",
    "ko/text-formatter/index.html"
  ];

  for (const relativePath of pages) {
    const html = await readFile(path.join(projectRoot, relativePath), "utf8");
    assert.match(html, /data-tool-page="text-formatter"/u);
    assert.match(html, /src="\/text-formatter\.js"/u);
    assert.match(html, /id="formatterInput"/u);
    assert.match(html, /id="formatterOutput"/u);
    assert.equal(html.match(/hreflang=/gu)?.length, 6);
    assert.match(html, /"@type": "WebApplication"/u);
    assert.match(html, /"@type": "HowTo"/u);
    assert.match(html, /"@type": "FAQPage"/u);
  }
});

test("links the formatter from every localized homepage and sitemap", async () => {
  for (const relativePath of ["index.html", "zh-tw/index.html", "en/index.html", "ja/index.html", "ko/index.html"]) {
    const html = await readFile(path.join(projectRoot, relativePath), "utf8");
    assert.match(html, /data-route="text-formatter"/u);
  }
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  assert.equal((sitemap.match(/<loc>https:\/\/jianfan\.app\/(?:zh-tw\/|en\/|ja\/|ko\/)?text-formatter\/<\/loc>/gu) || []).length, 5);
});
