import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "han-character-worksheet";
const labels = {
  "zh-CN": { prefix: "", label: "汉字练习纸" },
  "zh-TW": { prefix: "zh-tw/", label: "國字練習紙" },
  en: { prefix: "en/", label: "Chinese worksheet generator" },
  ja: { prefix: "ja/", label: "漢字練習プリント" },
  ko: { prefix: "ko/", label: "한자 쓰기 연습장" }
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

console.log(`Added worksheet links to ${updatedCount} standalone tool pages.`);
