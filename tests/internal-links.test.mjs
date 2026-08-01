import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function findHtmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(entryPath)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(entryPath);
  }
  return files;
}

function extractInternalReferences(source) {
  const references = [];
  const attributePattern = /\b(href|src|action|poster)\s*=\s*(["'])(.*?)\2/giu;
  for (const match of source.matchAll(attributePattern)) {
    const value = match[3];
    if (!isFirstPartyReference(value)) continue;
    references.push({
      attribute: match[1],
      line: source.slice(0, match.index).split("\n").length,
      value
    });
  }
  return references;
}

function isFirstPartyReference(value) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).hostname === "jianfan.app";
  } catch {
    return false;
  }
}

function pathnameFromReference(value) {
  if (value.startsWith("/")) return value.split(/[?#]/u, 1)[0] || "/";
  return new URL(value).pathname;
}

async function targetExists(value) {
  const encodedPath = pathnameFromReference(value);
  let pathname;
  try {
    pathname = decodeURIComponent(encodedPath);
  } catch {
    return false;
  }
  const target = path.resolve(projectRoot, `.${pathname}`);
  if (target !== projectRoot && !target.startsWith(`${projectRoot}${path.sep}`)) return false;
  const candidates = pathname.endsWith("/")
    ? [path.join(target, "index.html")]
    : [target, path.join(target, "index.html")];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return true;
    } catch {
      // Try the directory-index form next.
    }
  }
  return false;
}

function collectFirstPartyUrls(value, output) {
  if (typeof value === "string") {
    if (isFirstPartyReference(value)) output.add(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectFirstPartyUrls(item, output));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectFirstPartyUrls(item, output));
  }
}

test("essential site icon assets exist", async () => {
  const iconPaths = ["favicon.svg", "favicon.ico", "apple-touch-icon.png"];
  await Promise.all(iconPaths.map((iconPath) => access(path.join(projectRoot, iconPath))));

  const ico = await readFile(path.join(projectRoot, "favicon.ico"));
  assert.deepEqual([...ico.subarray(0, 6)], [0, 0, 1, 0, 1, 0]);
  assert.equal(ico.subarray(22, 30).toString("hex"), "89504e470d0a1a0a");
});

test("every static internal link and asset target exists", async () => {
  const missing = [];
  for (const filePath of await findHtmlFiles(projectRoot)) {
    const source = await readFile(filePath, "utf8");
    for (const reference of extractInternalReferences(source)) {
      if (await targetExists(reference.value)) continue;
      missing.push(
        `${path.relative(projectRoot, filePath)}:${reference.line} ${reference.attribute}="${reference.value}"`
      );
    }
  }
  assert.deepEqual(missing, [], `Missing internal targets:\n${missing.join("\n")}`);
});

test("every sitemap URL resolves to a generated page", async () => {
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  const values = [
    ...Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/gu), (match) => match[1]),
    ...Array.from(sitemap.matchAll(/<xhtml:link\b[^>]*\bhref="([^"]+)"/gu), (match) => match[1])
  ];
  const missing = [];
  for (const value of new Set(values)) {
    if (await targetExists(value)) continue;
    missing.push(value);
  }
  assert.deepEqual(missing, [], `Missing sitemap targets:\n${missing.join("\n")}`);
});

test("every first-party structured-data URL resolves to a generated target", async () => {
  const missing = [];
  for (const filePath of await findHtmlFiles(projectRoot)) {
    const source = await readFile(filePath, "utf8");
    const urls = new Set();
    for (const match of source.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/giu)) {
      collectFirstPartyUrls(JSON.parse(match[1]), urls);
    }
    for (const value of urls) {
      if (await targetExists(value)) continue;
      missing.push(`${path.relative(projectRoot, filePath)} ${value}`);
    }
  }
  assert.deepEqual(missing, [], `Missing structured-data targets:\n${missing.join("\n")}`);
});
