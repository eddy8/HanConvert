import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markerStart = "          <!-- japanese-tool-links:start -->";
const markerEnd = "          <!-- japanese-tool-links:end -->";

const localeData = {
  "zh-CN": { prefix: "", chinese: "日中汉字三体转换", characters: "日文字符复制", romaji: "日文汉字转罗马字", hiragana: "汉字转平假名与振假名", japaneseStrokeOrder: "日本汉字笔顺", dictionary: "日本汉字字典", japaneseHandwriting: "日文手写查字", pinyin: "汉字转拼音", strokeOrder: "汉字笔顺查询", worksheet: "汉字练习纸", wordToTxt: "Word 转 TXT", characterCounter: "在线字数统计" },
  "zh-TW": { prefix: "zh-tw/", chinese: "日中漢字三體轉換", characters: "日文字元複製", romaji: "日文漢字轉羅馬字", hiragana: "漢字轉平假名與振假名", japaneseStrokeOrder: "日本漢字筆順", dictionary: "日本漢字字典", japaneseHandwriting: "日文手寫查字", pinyin: "漢字轉拼音", strokeOrder: "漢字筆順查詢", worksheet: "國字練習紙", wordToTxt: "DOCX 轉 TXT", characterCounter: "線上字數統計" },
  en: { prefix: "en/", chinese: "Japanese and Chinese Kanji", characters: "Japanese character copy", romaji: "Kanji to Romaji", hiragana: "Kanji to Hiragana & Furigana", japaneseStrokeOrder: "Japanese Kanji stroke order", dictionary: "Japanese Kanji dictionary", japaneseHandwriting: "Japanese handwriting lookup", pinyin: "Chinese to Pinyin", strokeOrder: "Chinese stroke order", worksheet: "Chinese worksheet generator", wordToTxt: "Word to text", characterCounter: "CJK character counter" },
  ja: { prefix: "ja/", chinese: "日本語漢字・簡体字・繁体字変換", characters: "日本語文字コピー", romaji: "漢字・ローマ字変換", hiragana: "漢字をひらがな・ふりがなに変換", japaneseStrokeOrder: "漢字の書き順・筆順", dictionary: "漢字検索・漢字辞典", japaneseHandwriting: "手書き漢字検索", pinyin: "中国語ピンイン変換", strokeOrder: "中国語漢字の筆順", worksheet: "漢字練習プリント", wordToTxt: "Word TXT 変換", characterCounter: "文字数カウント" },
  ko: { prefix: "ko/", chinese: "일본·중국 한자 변환", characters: "일본어 문자 복사", romaji: "일본어 한자 로마자 변환", hiragana: "한자를 히라가나·후리가나로", japaneseStrokeOrder: "일본 한자 필순", dictionary: "일본 한자 사전", japaneseHandwriting: "일본 한자 손글씨 검색", pinyin: "중국어 병음 변환", strokeOrder: "중국어 한자 필순", worksheet: "한자 쓰기 연습장", wordToTxt: "DOCX TXT 변환", characterCounter: "글자수 세기" }
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
  const block = `${markerStart}\n          <a href="${prefix}japanese-chinese-kanji-converter/" data-route="japanese-chinese-kanji-converter" data-i18n="linkJapaneseChinese">${content.chinese}</a>\n          <a href="${prefix}japanese-characters/" data-route="japanese-characters" data-i18n="linkJapaneseCharacters">${content.characters}</a>\n          <a href="${prefix}kanji-to-romaji/" data-route="kanji-to-romaji" data-i18n="linkKanjiRomaji">${content.romaji}</a>\n          <a href="${prefix}kanji-to-hiragana/" data-route="kanji-to-hiragana" data-i18n="linkKanjiHiragana">${content.hiragana}</a>\n          <a href="${prefix}japanese-stroke-order/" data-route="japanese-stroke-order" data-i18n="linkJapaneseStrokeOrder">${content.japaneseStrokeOrder}</a>\n          <a href="${prefix}japanese-kanji-dictionary/" data-route="japanese-kanji-dictionary" data-i18n="linkJapaneseKanjiDictionary">${content.dictionary}</a>\n          <a href="${prefix}japanese-handwriting-recognition/" data-route="japanese-handwriting-recognition" data-i18n="linkJapaneseHandwriting">${content.japaneseHandwriting}</a>\n          <a href="${prefix}chinese-to-pinyin/" data-route="chinese-to-pinyin" data-i18n="linkPinyin">${content.pinyin}</a>\n          <a href="${prefix}chinese-stroke-order/" data-route="chinese-stroke-order" data-i18n="linkStrokeOrder">${content.strokeOrder}</a>\n          <a href="${prefix}han-character-worksheet/" data-route="han-character-worksheet" data-i18n="linkWorksheet">${content.worksheet}</a>\n          <a href="${prefix}word-to-txt/" data-route="word-to-txt" data-i18n="linkWordToTxt">${content.wordToTxt}</a>\n          <a href="${prefix}character-counter/" data-route="character-counter" data-i18n="linkCharacterCounter">${content.characterCounter}</a>\n${markerEnd}`;
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
