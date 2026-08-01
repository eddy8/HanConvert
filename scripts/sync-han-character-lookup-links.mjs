import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "chinese-character-lookup";
const markerStart = "          <!-- han-character-lookup-link:start -->";
const markerEnd = "          <!-- han-character-lookup-link:end -->";
const localeMeta = {
  "zh-CN": { prefix: "", label: "汉字查询与结构拆解" },
  "zh-TW": { prefix: "zh-tw/", label: "漢字查詢與結構拆解" },
  en: { prefix: "en/", label: "Chinese character lookup" },
  ja: { prefix: "ja/", label: "漢字の構成・部首検索" },
  ko: { prefix: "ko/", label: "한자 부수·구성요소 검색" }
};

async function findIndexFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules", "data"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findIndexFiles(entryPath)));
    if (entry.isFile() && entry.name === "index.html") files.push(entryPath);
  }
  return files;
}

function localeFor(relativePath) {
  if (relativePath.startsWith("zh-tw/")) return "zh-TW";
  if (relativePath.startsWith("en/")) return "en";
  if (relativePath.startsWith("ja/")) return "ja";
  if (relativePath.startsWith("ko/")) return "ko";
  return "zh-CN";
}

let changed = 0;
for (const filePath of await findIndexFiles(projectRoot)) {
  const relativePath = path.relative(projectRoot, filePath);
  if (relativePath.endsWith(`${slug}/index.html`)) continue;
  const source = await readFile(filePath, "utf8");
  if (!source.includes('class="landing-links"')) continue;

  const locale = localeFor(relativePath);
  const meta = localeMeta[locale];
  const href = `/${meta.prefix}${slug}/`;
  const block = `${markerStart}\n          <a href="${href}" data-route="${slug}">${meta.label}</a>\n${markerEnd}`;
  const withoutOldBlock = source.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}\\n?`, "g"), "");
  if (withoutOldBlock.includes(`href="${href}"`)) continue;
  const updated = withoutOldBlock.replace(
    /(<nav class="landing-links"[^>]*>)([\s\S]*?)(\s*<\/nav>)/,
    `$1$2\n${block}$3`
  );
  if (updated === source) continue;
  await writeFile(filePath, updated);
  changed += 1;
}

console.log(`Added Han-character lookup links to ${changed} pages.`);
