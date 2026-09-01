import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validInputModes = new Set(["none", "text", "decimal", "numeric", "tel", "search", "email", "url"]);

async function findIndexPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...(await findIndexPages(entryPath)));
    if (entry.isFile() && entry.name === "index.html") pages.push(entryPath);
  }

  return pages;
}

test("generated pages do not name generic div elements without a role", async () => {
  for (const filePath of await findIndexPages(projectRoot)) {
    const html = await readFile(filePath, "utf8");
    const relativePath = path.relative(projectRoot, filePath);

    for (const match of html.matchAll(/<div\b[^>]*\baria-label=(?:"[^"]*"|'[^']*')[^>]*>/giu)) {
      assert.match(match[0], /\brole=(?:"[^"]+"|'[^']+')/iu, `${relativePath}: ${match[0]}`);
    }
  }
});

test("generated pages use valid inputmode values", async () => {
  for (const filePath of await findIndexPages(projectRoot)) {
    const html = await readFile(filePath, "utf8");
    const relativePath = path.relative(projectRoot, filePath);

    for (const match of html.matchAll(/\binputmode=(?:"([^"]+)"|'([^']+)')/giu)) {
      const value = (match[1] || match[2]).toLowerCase();
      assert.ok(validInputModes.has(value), `${relativePath}: invalid inputmode="${value}"`);
    }
  }
});

test("generated pages do not emit duplicate selected attributes", async () => {
  for (const filePath of await findIndexPages(projectRoot)) {
    const html = await readFile(filePath, "utf8");
    const relativePath = path.relative(projectRoot, filePath);

    for (const match of html.matchAll(/<option\b[^>]*>/giu)) {
      const selectedAttributes = match[0].match(/\sselected(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/giu) || [];
      assert.ok(selectedAttributes.length <= 1, `${relativePath}: ${match[0]}`);
    }
  }
});

test("active tabs reference an existing tab panel", async () => {
  for (const filePath of await findIndexPages(projectRoot)) {
    const html = await readFile(filePath, "utf8");
    const relativePath = path.relative(projectRoot, filePath);

    for (const match of html.matchAll(/<[^>]+\brole=(?:"tab"|'tab')[^>]*\baria-selected=(?:"true"|'true')[^>]*>/giu)) {
      const controls = match[0].match(/\baria-controls=(?:"([^"]+)"|'([^']+)')/iu);
      assert.ok(controls, `${relativePath}: active tab has no aria-controls: ${match[0]}`);
      const panelId = controls?.[1] || controls?.[2];
      const panelPattern = new RegExp(`<[^>]+\\bid=(?:"${panelId}"|'${panelId}')[^>]+\\brole=(?:"tabpanel"|'tabpanel')`, "iu");
      assert.match(html, panelPattern, `${relativePath}: missing tab panel #${panelId}`);
    }
  }
});

test("labels do not contain both an output and another form control", async () => {
  for (const filePath of await findIndexPages(projectRoot)) {
    const html = await readFile(filePath, "utf8");
    const relativePath = path.relative(projectRoot, filePath);

    for (const match of html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/giu)) {
      const controls = match[1].match(/<(?:button|input|meter|output|progress|select|textarea)\b/giu) || [];
      assert.ok(controls.length <= 1, `${relativePath}: label contains ${controls.length} form controls`);
    }
  }
});
