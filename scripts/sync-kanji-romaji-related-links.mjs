import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "kanji-to-romaji";
const labels = {
  "zh-CN": { prefix: "", label: "日文汉字转罗马字" },
  "zh-TW": { prefix: "zh-tw/", label: "日文漢字轉羅馬字" },
  en: { prefix: "en/", label: "Kanji to Romaji" },
  ja: { prefix: "ja/", label: "漢字・ローマ字変換" },
  ko: { prefix: "ko/", label: "일본어 한자 로마자 변환" }
};

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

function getLocale(relativePath) {
  if (relativePath.startsWith("zh-tw/")) return "zh-TW";
  if (relativePath.startsWith("en/")) return "en";
  if (relativePath.startsWith("ja/")) return "ja";
  if (relativePath.startsWith("ko/")) return "ko";
  return "zh-CN";
}

let updatedCount = 0;
for (const filePath of await findHtmlFiles(projectRoot)) {
  const source = await readFile(filePath, "utf8");
  if (!source.includes("data-tool-page=") || source.includes(`data-tool-page="${slug}"`)) continue;

  const relativePath = path.relative(projectRoot, filePath).split(path.sep).join("/");
  const locale = labels[getLocale(relativePath)];
  const href = `/${locale.prefix}${slug}/`;
  const navPattern = /(<nav class="landing-links"[^>]*>)([\s\S]*?)(\s*<\/nav>)/;
  const match = source.match(navPattern);
  if (!match) throw new Error(`Missing related links navigation in ${relativePath}`);
  if (match[2].includes(`href="${href}"`)) continue;

  const link = `          <a href="${href}">${locale.label}</a>`;
  const updatedNav = `${match[1]}${match[2]}\n${link}${match[3]}`;
  await writeFile(filePath, source.replace(navPattern, updatedNav));
  updatedCount += 1;
}

console.log(`Added Kanji-to-Romaji links to ${updatedCount} standalone tool pages.`);
