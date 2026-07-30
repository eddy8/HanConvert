import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "chinese-handwriting-recognition";
const labels = {
  "zh-CN": { prefix: "", label: "手写汉字识别" },
  "zh-TW": { prefix: "zh-tw/", label: "手寫漢字辨識" },
  en: { prefix: "en/", label: "Chinese handwriting recognition" },
  ja: { prefix: "ja/", label: "漢字手書き検索" },
  ko: { prefix: "ko/", label: "한자 필기 인식" }
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
  if (!source.includes('class="landing-links"') || source.includes(`data-tool-page="handwriting-recognition"`)) continue;

  const relativePath = path.relative(projectRoot, filePath).split(path.sep).join("/");
  const locale = labels[getLocale(relativePath)];
  const href = `/${locale.prefix}${slug}/`;
  if (source.includes(`href="${href}"`)) continue;

  const navPattern = /(<nav class="landing-links"[^>]*>)([\s\S]*?)(\s*<\/nav>)/;
  const match = source.match(navPattern);
  if (!match) throw new Error(`Missing related links navigation in ${relativePath}`);

  const isConverterPage = source.includes('id="converterTitle"');
  const attributes = isConverterPage
    ? ` data-route="${slug}" data-i18n="linkHandwriting"`
    : "";
  const link = `          <a href="${href}"${attributes}>${locale.label}</a>`;
  const updatedNav = `${match[1]}${match[2]}\n${link}${match[3]}`;
  await writeFile(filePath, source.replace(navPattern, updatedNav));
  updatedCount += 1;
}

console.log(`Added handwriting-recognition links to ${updatedCount} pages.`);
