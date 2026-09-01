import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

const privacyPages = [
  "privacy/index.html",
  "zh-tw/privacy/index.html",
  "en/privacy/index.html",
  "ja/privacy/index.html",
  "ko/privacy/index.html"
];

const replacementsByPage = new Map([
  ...privacyPages.map((relativePath) => [relativePath, [
    [
      '<div class="language-picker privacy-language-links" aria-label=',
      '<div class="language-picker privacy-language-links" role="group" aria-label='
    ]
  ]]),
  ["word-spelling/index.html", [
    ['inputmode="latin"', 'inputmode="text"'],
    [
      '<div id="word-map" class="word-map" aria-label=',
      '<div id="word-map" class="word-map" role="group" aria-label='
    ]
  ]]
]);

let updatedCount = 0;

for (const [relativePath, replacements] of replacementsByPage) {
  const filePath = path.join(projectRoot, relativePath);
  const source = await readFile(filePath, "utf8");
  let updated = source;

  for (const [before, after] of replacements) {
    if (updated.includes(after)) continue;
    if (!updated.includes(before)) throw new Error(`${relativePath}: expected generated markup was not found`);
    updated = updated.replace(before, after);
  }

  if (updated === source) continue;
  if (checkOnly) throw new Error(`${relativePath} is out of sync with standalone page semantics`);
  await writeFile(filePath, updated);
  updatedCount += 1;
}

console.log(`Synchronized standalone page semantics on ${updatedCount} pages.`);
