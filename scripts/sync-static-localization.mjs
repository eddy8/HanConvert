import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadLocalizationData, localizeConverterHtml } from "./static-localization-lib.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(entryPath)));
    if (entry.isFile() && entry.name === "index.html") files.push(entryPath);
  }
  return files;
}

const data = await loadLocalizationData(projectRoot);
let updatedCount = 0;

for (const filePath of await findHtmlFiles(projectRoot)) {
  const source = await readFile(filePath, "utf8");
  if (!source.includes('id="converterTitle"')) continue;
  const relativePath = path.relative(projectRoot, filePath);
  const updated = localizeConverterHtml(source, relativePath, data);
  if (updated !== source) {
    await writeFile(filePath, updated);
    updatedCount += 1;
  }
}

console.log(`Synchronized static localization on ${updatedCount} converter pages.`);
