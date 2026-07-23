import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markerStart = "          <!-- japanese-tool-links:start -->";
const markerEnd = "          <!-- japanese-tool-links:end -->";

const localeData = {
  "zh-CN": { prefix: "", chinese: "日中汉字三体转换", characters: "日文字符复制", pinyin: "汉字转拼音", strokeOrder: "汉字笔顺查询", wordToTxt: "Word 转 TXT" },
  "zh-TW": { prefix: "zh-tw/", chinese: "日中漢字三體轉換", characters: "日文字元複製", pinyin: "漢字轉拼音", strokeOrder: "漢字筆順查詢", wordToTxt: "DOCX 轉 TXT" },
  en: { prefix: "en/", chinese: "Japanese and Chinese Kanji", characters: "Japanese character copy", pinyin: "Chinese to Pinyin", strokeOrder: "Chinese stroke order", wordToTxt: "Word to text" },
  ja: { prefix: "ja/", chinese: "日本語漢字・簡体字・繁体字変換", characters: "日本語文字コピー", pinyin: "中国語ピンイン変換", strokeOrder: "中国語漢字の筆順", wordToTxt: "Word TXT 変換" },
  ko: { prefix: "ko/", chinese: "일본·중국 한자 변환", characters: "일본어 문자 복사", pinyin: "중국어 병음 변환", strokeOrder: "중국어 한자 필순", wordToTxt: "DOCX TXT 변환" }
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
  if (!source.includes('id="converterTitle"')) continue;

  const relativePath = path.relative(projectRoot, filePath);
  const content = localeData[getLocale(relativePath)];
  const prefix = `/${content.prefix}`;
  const block = `${markerStart}\n          <a href="${prefix}japanese-chinese-kanji-converter/" data-route="japanese-chinese-kanji-converter" data-i18n="linkJapaneseChinese">${content.chinese}</a>\n          <a href="${prefix}japanese-characters/" data-route="japanese-characters" data-i18n="linkJapaneseCharacters">${content.characters}</a>\n          <a href="${prefix}chinese-to-pinyin/" data-route="chinese-to-pinyin" data-i18n="linkPinyin">${content.pinyin}</a>\n          <a href="${prefix}chinese-stroke-order/" data-route="chinese-stroke-order" data-i18n="linkStrokeOrder">${content.strokeOrder}</a>\n          <a href="${prefix}word-to-txt/" data-route="word-to-txt" data-i18n="linkWordToTxt">${content.wordToTxt}</a>\n${markerEnd}`;
  let updated = source;

  if (source.includes(markerStart)) {
    updated = source.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block);
  } else {
    const japaneseLink = /^(\s*<a[^>]+data-route="japanese-kanji-converter"[^>]*>[^<]*<\/a>)$/m;
    if (!japaneseLink.test(source)) throw new Error(`Missing Japanese converter link in ${relativePath}`);
    updated = source.replace(japaneseLink, `$1\n${block}`);
  }

  await writeFile(filePath, updated);
  updatedCount += 1;
}

console.log(`Updated related links on ${updatedCount} converter pages.`);
