import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { visibleMetadataLength } from "../scripts/seo-metadata-rules.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const maxTitleLength = 90;

async function findIndexPages(directory) {
  const pages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...(await findIndexPages(entryPath)));
    if (entry.isFile() && entry.name === "index.html") pages.push(entryPath);
  }
  return pages;
}

test("keeps every complete static page title within 90 characters", async () => {
  for (const pagePath of await findIndexPages(projectRoot)) {
    const html = await readFile(pagePath, "utf8");
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const relativePath = path.relative(projectRoot, pagePath);
    assert.ok(title, `${relativePath} is missing a title`);
    const titleLength = visibleMetadataLength(title);
    assert.ok(
      titleLength <= maxTitleLength,
      `${relativePath} title has ${titleLength} characters`
    );
  }
});
