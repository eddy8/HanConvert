import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markerStart = "          <!-- korean-hanja-tool-links:start -->";
const markerEnd = "          <!-- korean-hanja-tool-links:end -->";
const labels = {
  "zh-CN": { prefix: "", dictionary: "韩国汉字查询", handwriting: "韩国汉字手写查字", converter: "韩文汉字转换", names: "韩国人名用汉字" },
  "zh-TW": { prefix: "zh-tw/", dictionary: "韓國漢字查詢", handwriting: "韓國漢字手寫查字", converter: "韓文漢字轉換", names: "韓國人名用漢字" },
  en: { prefix: "en/", dictionary: "Korean Hanja dictionary", handwriting: "Korean Hanja handwriting", converter: "Hangul Hanja converter", names: "Korean name Hanja" },
  ja: { prefix: "ja/", dictionary: "韓国漢字検索", handwriting: "韓国漢字の手書き検索", converter: "ハングル・漢字変換", names: "韓国の人名用漢字" },
  ko: { prefix: "ko/", dictionary: "한자 찾기·옥편", handwriting: "한자 필기인식", converter: "한글 한자 변환", names: "인명용 한자" }
};

async function findIndexPages(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findIndexPages(entryPath)));
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
for (const filePath of await findIndexPages(projectRoot)) {
  const source = await readFile(filePath, "utf8");
  if (!source.includes('id="converterTitle"')) continue;
  const relativePath = path.relative(projectRoot, filePath).split(path.sep).join("/");
  const locale = labels[getLocale(relativePath)];
  const prefix = `/${locale.prefix}`;
  const block = `${markerStart}
          <a href="${prefix}korean-hanja-dictionary/" data-route="korean-hanja-dictionary">${locale.dictionary}</a>
          <a href="${prefix}korean-hanja-handwriting-recognition/" data-route="korean-hanja-handwriting-recognition">${locale.handwriting}</a>
          <a href="${prefix}hangul-hanja-converter/" data-route="hangul-hanja-converter">${locale.converter}</a>
          <a href="${prefix}korean-name-hanja/" data-route="korean-name-hanja">${locale.names}</a>
${markerEnd}`;
  let updated;
  if (source.includes(markerStart)) {
    updated = source.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block);
  } else {
    const navigation = /(<nav class="landing-links"[^>]*>[\s\S]*?)(\s*<\/nav>)/;
    if (!navigation.test(source)) throw new Error(`Missing related navigation in ${relativePath}`);
    updated = source.replace(navigation, `$1\n${block}$2`);
  }
  if (updated !== source) {
    await writeFile(filePath, updated);
    updatedCount += 1;
  }
}

console.log(`Synchronized Korean Hanja tool links on ${updatedCount} converter pages.`);
