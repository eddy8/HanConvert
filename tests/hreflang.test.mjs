import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptsDirectory = path.join(projectRoot, "scripts");

test("keeps Simplified Chinese hreflang generation on zh-Hans", async () => {
  const scriptNames = (await readdir(scriptsDirectory)).filter(
    (name) => /^(?:generate|sync)-.+\.mjs$/.test(name)
  );

  for (const name of scriptNames) {
    const source = await readFile(path.join(scriptsDirectory, name), "utf8");
    assert.doesNotMatch(source, /hreflang:\s*"zh-CN"|"zh-CN"\s*:\s*"zh-CN"/, name);
  }
});

test("uses zh-Hans in the generated sitemap artifact", async () => {
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  assert.match(sitemap, /hreflang="zh-Hans"/);
  assert.doesNotMatch(sitemap, /hreflang="zh-CN"/);
});
