import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const script of [
  "scripts/generate-direction-pages.mjs",
  "scripts/generate-kanji-to-romaji-pages.mjs",
  "scripts/generate-word-to-txt-pages.mjs",
  "scripts/generate-text-formatter-pages.mjs",
  "scripts/generate-image-redaction-pages.mjs",
  "scripts/generate-image-splitter-pages.mjs",
  "scripts/generate-chinese-to-zhuyin-pages.mjs",
  "scripts/generate-password-generator-pages.mjs",
  "scripts/generate-blog-pages.mjs",
  "scripts/sync-standalone-page-semantics.mjs",
  "scripts/sync-sitemap-lastmod.mjs",
  "scripts/generate-llms-txt.mjs",
  "scripts/sync-converter-faq.mjs"
]) {
  test(`${script} preserves current canonical URLs, structured data, and navigation`, async () => {
    const result = await execFileAsync(process.execPath, [script, "--check"], { cwd: projectRoot });
    assert.equal(result.stderr, "");
  });
}
