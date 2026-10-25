import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { auditStaticContent } from "../scripts/audit-static-content.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("keeps every static page above its page-type content floor", async () => {
  const { results, findings } = await auditStaticContent();

  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  const indexedPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, url]) => `${new URL(url).pathname.slice(1)}index.html`)
    .sort();
  assert.deepEqual(
    results.filter(({ category }) => category !== "experiment").map(({ relativePath }) => relativePath).sort(),
    indexedPaths,
    "Every indexed page must be audited; explicitly non-indexed experiments have their own requirements."
  );
  assert.deepEqual(
    findings.map(({ relativePath, deficiencies }) => ({ relativePath, deficiencies })),
    []
  );
});

test("keeps the strengthened character-copy and spelling guidance visible and structured", async () => {
  const localizedCharacterPages = [
    "japanese-characters/index.html",
    "zh-tw/japanese-characters/index.html",
    "en/japanese-characters/index.html",
    "ja/japanese-characters/index.html",
    "ko/japanese-characters/index.html"
  ];

  for (const relativePath of localizedCharacterPages) {
    const html = await readFile(path.join(projectRoot, relativePath), "utf8");
    assert.match(html, /class="word-howto"/);
    assert.match(html, /class="pinyin-faq"/);
    assert.match(html, /"@type": "HowTo"/);
    assert.match(html, /"@type": "FAQPage"/);
    assert.equal(html.match(/<details>/g)?.length, 4);
  }

  const spellingHtml = await readFile(path.join(projectRoot, "word-spelling/index.html"), "utf8");
  assert.match(spellingHtml, /class="footer-guide"/);
  assert.match(spellingHtml, /"@type": "HowTo"/);
  assert.match(spellingHtml, /"@type": "FAQPage"/);
});
