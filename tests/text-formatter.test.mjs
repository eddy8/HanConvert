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

function rebuild(diff, skippedType) {
  return diff.ops.filter((op) => op.type !== skippedType).map((op) => op.text).join("");
}

test("reports how many places each applied rule changed", () => {
  const result = core.formatText("A​​B C  d   \nx");
  assert.deepEqual(result.steps, [
    { rule: "removeBasicInvisible", count: 2 },
    { rule: "normalizeSpecialSpaces", count: 1 },
    { rule: "trimLines", count: 1 },
    { rule: "collapseSpaces", count: 1 }
  ]);
  assert.deepEqual(core.formatText("already clean").steps, []);
});

test("diffs the original and formatted text character by character", () => {
  const diff = core.diffText("中 文​字", "中文字");
  assert.deepEqual(diff.ops, [
    { type: "equal", text: "中" },
    { type: "delete", text: " " },
    { type: "equal", text: "文" },
    { type: "delete", text: "​" },
    { type: "equal", text: "字" }
  ]);
  assert.equal(diff.removed, 2);
  assert.equal(diff.added, 0);
  assert.equal(diff.changes, 2);
});

test("shows replacements as a removal followed by an insertion", () => {
  const diff = core.diffText("中文,好吗", "中文，好吗");
  assert.deepEqual(diff.ops.map((op) => op.type), ["equal", "delete", "insert", "equal"]);
  assert.equal(diff.changes, 1);
  assert.deepEqual(core.diffText("same", "same"), { ops: [{ type: "equal", text: "same" }], removed: 0, added: 0, changes: 0 });
});

test("diff output always rebuilds both texts and never splits surrogate pairs", () => {
  const samples = [
    ["tag\u{E0041}\u{E0042}😀x 😀\u{E0100}y", { removeTags: true, removeVariationSelectors: true }],
    ["A para-\r\ngraph  wraps here.\r\n\r\n\r\n中\n文 字,好吗? https://example.com/%E4%B8%AD%E6%96%87 “quoted” text", { lineMode: "join", repairHyphenation: true, removeHanSpaces: true, addHanLatinSpaces: true, useCjkPunctuation: true, decodeUrls: true }],
    ["One. Two!  Three?\tpаypal ＡＢＣ ‮end", { lineMode: "sentence", normalizeConfusables: true, removeBidiControls: true }],
    ["", {}],
    ["​​​", {}]
  ];
  for (const [input, options] of samples) {
    const before = core.normalizeLineEndings(input);
    const after = core.formatText(input, options).text;
    const diff = core.diffText(before, after);
    assert.equal(rebuild(diff, "insert"), before);
    assert.equal(rebuild(diff, "delete"), after);
    for (const op of diff.ops) assert.equal(op.text.isWellFormed(), true);
    assert.equal(diff.removed, Array.from(rebuild(diff, "insert")).length - Array.from(diff.ops.filter((op) => op.type === "equal").map((op) => op.text).join("")).length);
  }
});

test("joins and diffs a very long wrapped document in bounded time", () => {
  const input = "这是一段 很长的文本​，with  spaces and\nline breaks. ".repeat(20000);
  const started = Date.now();
  const result = core.formatText(input, { lineMode: "join" });
  const diff = core.diffText(input, result.text);
  assert.ok(Date.now() - started < 5000);
  assert.equal(rebuild(diff, "delete"), result.text);
  assert.equal(result.text.includes("\n"), false);
});

test("ships the before-and-after comparison panel in every locale", async () => {
  for (const relativePath of ["text-formatter/index.html", "zh-tw/text-formatter/index.html", "en/text-formatter/index.html", "ja/text-formatter/index.html", "ko/text-formatter/index.html"]) {
    const html = await readFile(path.join(projectRoot, relativePath), "utf8");
    for (const id of ["formatterDiff", "formatterDiffSummary", "formatterDiffRules", "formatterDiffTitle", "formatterViewResult", "formatterViewDiff"]) {
      assert.match(html, new RegExp(`id="${id}"`, "u"));
    }
    for (const attribute of ["data-message-diff-summary", "data-message-diff-same", "data-message-diff-gap", "data-message-diff-truncated"]) {
      assert.match(html, new RegExp(`${attribute}="[^"]+"`, "u"));
    }
  }
});
