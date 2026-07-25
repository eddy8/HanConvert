import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPageContext, loadLocalizationData, localizeConverterHtml } from "./static-localization-lib.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://jianfan.app";
const localizationData = await loadLocalizationData(projectRoot);
const documentLanguages = { "zh-CN": "zh-CN", "zh-TW": "zh-Hant", en: "en", ja: "ja", ko: "ko" };

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

function requireMatch(html, pattern, label, file) {
  const value = html.match(pattern)?.[1];
  if (!value) throw new Error(`${file}: missing ${label}`);
  return value;
}

const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueSitemapUrls = new Set(sitemapUrls);
if (uniqueSitemapUrls.size !== sitemapUrls.length) throw new Error("sitemap.xml contains duplicate URLs");

for (const entryFile of ["app.js", "app-download.js", "japanese-tools.js", "pinyin-tool.js", "stroke-order-tool.js", "word-to-txt-tool.js", "character-counter.js", "han-character-worksheet.js", "webmcp.js"]) {
  const source = await readFile(path.join(projectRoot, entryFile), "utf8");
  if (/from\s+["']\/[^"']+\.mjs["']/.test(source)) {
    throw new Error(`${entryFile}: local .mjs modules are not portable across hosting providers`);
  }
  if (entryFile === "app.js" && /querySelectorAll\([^\n]*data-i18n|document\.title\s*=|document\.documentElement\.lang\s*=/.test(source)) {
    throw new Error(`${entryFile}: static localization must not be rendered by JavaScript`);
  }
}

let converterPages = 0;
let standaloneToolPages = 0;
let infoPages = 0;
const canonicalUrls = new Set();
const localizedHomePages = new Set(["index.html", "zh-tw/index.html", "en/index.html", "ja/index.html", "ko/index.html"]);
const localizedKanjiKeywords = new Map([
  ["japanese-chinese-kanji-converter/index.html", [
    "日中汉字转换",
    "中日汉字转换工具",
    "中文繁体字、简体字、日文汉字相互转换",
    "中日汉字比较",
    "日文汉字转换",
    "中文汉字转日文汉字"
  ]],
  ["zh-tw/japanese-chinese-kanji-converter/index.html", [
    "日中漢字轉換",
    "中日漢字轉換工具",
    "中文繁體字、簡體字、日文漢字相互轉換",
    "中日漢字比較",
    "日文漢字轉換",
    "中文漢字轉日文漢字"
  ]],
  ["ja/japanese-chinese-kanji-converter/index.html", [
    "日中（簡・繁）漢字変換ツール",
    "簡体字に変換",
    "日本語漢字 簡体字 変換",
    "日中漢字変換",
    "中国語の漢字を日本の漢字に変換",
    "日本語漢字への変換",
    "日本の漢字と中国語の簡体字・繁体字を比較"
  ]],
  ["ko/japanese-chinese-kanji-converter/index.html", [
    "일본 한자 변환",
    "일본 한자로 변환",
    "중국 한자를 일본 한자로 변환",
    "중국어 간체·번체 변환",
    "일본 한자·간체·번체 비교"
  ]]
]);
const localizedRomajiKeywords = new Map([
  ["kanji-to-romaji/index.html", ["日文汉字转罗马字", "日语罗马音转换", "日文转罗马音", "日文汉字转平假名", "日语假名标注", "Kanji to alphabet"]],
  ["zh-tw/kanji-to-romaji/index.html", ["日文漢字轉羅馬字", "日語羅馬拼音轉換", "日文轉羅馬音", "日文漢字轉平假名", "日語假名標註", "Kanji to alphabet"]],
  ["en/kanji-to-romaji/index.html", ["Kanji to Romaji", "Japanese to Romaji", "Kanji to alphabet", "Kanji to Hiragana", "Furigana"]],
  ["ja/kanji-to-romaji/index.html", ["漢字をローマ字に変換", "日本語をローマ字に変換", "漢字をひらがなに変換", "ふりがな変換ツール", "漢字にふりがなを自動付与"]],
  ["ko/kanji-to-romaji/index.html", ["일본어 한자 로마자 변환", "한자 히라가나 변환", "일본어 발음 변환", "후리가나 변환"]]
]);

for (const htmlPath of await findHtmlFiles(projectRoot)) {
  const relativePath = path.relative(projectRoot, htmlPath);
  const html = await readFile(htmlPath, "utf8");
  const { locale } = getPageContext(relativePath);
  const documentLanguage = requireMatch(html, /<html lang="([^"]+)">/, "document language", relativePath);
  const canonical = requireMatch(html, /<link rel="canonical" href="([^"]+)" \/>/, "canonical", relativePath);

  if (documentLanguage !== documentLanguages[locale]) {
    throw new Error(`${relativePath}: expected document language ${documentLanguages[locale]}, found ${documentLanguage}`);
  }

  if (!canonical.startsWith(`${siteOrigin}/`)) throw new Error(`${relativePath}: canonical is not absolute`);
  if (canonicalUrls.has(canonical)) throw new Error(`${relativePath}: duplicate canonical ${canonical}`);
  canonicalUrls.add(canonical);
  if (!uniqueSitemapUrls.has(canonical)) throw new Error(`${relativePath}: canonical is missing from sitemap.xml`);
  if (/(?:src|href)="\/[^"]+\?(?:v|version)=/i.test(html)) {
    throw new Error(`${relativePath}: static asset URL contains a version query`);
  }
  for (const slug of ["about", "contact", "privacy"]) {
    if (!new RegExp(`href="/[^"]*${slug}/"`).test(html)) {
      throw new Error(`${relativePath}: missing ${slug} footer link`);
    }
  }

  const isConverterPage = html.includes('id="converterTitle"');
  const isStandaloneToolPage = html.includes('data-tool-page=');
  const isInfoPage = html.includes('data-info-page=');
  const isPinyinPage = html.includes('data-tool-page="pinyin-converter"');
  const isStrokeOrderPage = html.includes('data-tool-page="stroke-order"');
  const isWordToTxtPage = html.includes('data-tool-page="word-to-txt"');
  const isCharacterCounterPage = html.includes('data-tool-page="character-counter"');
  const isWorksheetPage = html.includes('data-tool-page="han-character-worksheet"');
  const isKanjiRomajiPage = html.includes('data-tool-page="kanji-to-romaji"');
  if (localizedHomePages.has(relativePath) && !html.includes('src="/app-download.js"')) {
    throw new Error(`${relativePath}: missing platform-specific app download navigation`);
  }
  if (localizedHomePages.has(relativePath) && !html.includes('data-i18n="seoAppTitle"')) {
    throw new Error(`${relativePath}: missing static desktop app SEO copy`);
  }
  if (relativePath === "index.html") {
    for (const keyword of ["简体转繁体 APP", "繁体转简体 APP"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (!isConverterPage && !isStandaloneToolPage && !isInfoPage) continue;
  if (isConverterPage) {
    converterPages += 1;
    if (!html.includes('src="/webmcp.js"')) {
      throw new Error(`${relativePath}: missing WebMCP browser tool registration`);
    }
    if (localizeConverterHtml(html, relativePath, localizationData) !== html) {
      throw new Error(`${relativePath}: static localized content is out of sync with app.js`);
    }
  }
  if (isStandaloneToolPage) standaloneToolPages += 1;
  if (isInfoPage) infoPages += 1;

  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)" \/>/g)];
  if (alternates.length !== 6) throw new Error(`${relativePath}: expected 6 hreflang links`);
  if (alternates.some(([, , href]) => !href.startsWith(`${siteOrigin}/`))) {
    throw new Error(`${relativePath}: hreflang URL is not absolute`);
  }

  const schemaText = requireMatch(
    html,
    /<!-- seo-schema:start -->[\s\S]*?<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    "JSON-LD",
    relativePath
  );
  const schema = JSON.parse(schemaText);
  if (isInfoPage) {
    const expectedType = html.includes('data-info-page="about"') ? "AboutPage" : "ContactPage";
    const infoPage = schema["@graph"]?.find((item) => item["@type"] === expectedType);
    const organization = schema["@graph"]?.find((item) => item["@type"] === "Organization");
    if (!infoPage || infoPage.url !== canonical || organization?.email !== "admin@jianfan.app") {
      throw new Error(`${relativePath}: invalid ${expectedType} or Organization schema`);
    }
  } else {
    const webApplication = schema["@graph"]?.find((item) => item["@type"] === "WebApplication");
    if (!webApplication || webApplication.url !== canonical) {
      throw new Error(`${relativePath}: invalid WebApplication schema`);
    }
    if ((isPinyinPage || isStrokeOrderPage || isWordToTxtPage || isCharacterCounterPage || isWorksheetPage || isKanjiRomajiPage) && !schema["@graph"]?.some((item) => item["@type"] === "FAQPage")) {
      throw new Error(`${relativePath}: missing tool FAQPage schema`);
    }
    if ((isWordToTxtPage || isCharacterCounterPage || isWorksheetPage) && !schema["@graph"]?.some((item) => item["@type"] === "HowTo")) {
      throw new Error(`${relativePath}: missing tool HowTo schema`);
    }
  }
  if (isConverterPage && (!html.includes('data-route="simplified-to-traditional"') || !html.includes('data-route="traditional-to-simplified"'))) {
    throw new Error(`${relativePath}: missing direction-page links`);
  }
  if (isConverterPage && (!html.includes('data-route="japanese-chinese-kanji-converter"') || !html.includes('data-route="japanese-characters"'))) {
    throw new Error(`${relativePath}: missing Japanese tool links`);
  }
  if (relativePath === path.join("en", "japanese-chinese-kanji-converter", "index.html")) {
    for (const keyword of [
      "Chinese to Kanji Converter",
      "Chinese to Kanji translator",
      "Chinese characters to Japanese Kanji",
      "Chinese-Japanese Kanji converter and comparator",
      "Simplified Chinese to Japanese kanji",
      "Traditional Chinese to Japanese kanji",
      "Compare Japanese and Chinese kanji",
      "Japanese and Chinese Kanji Converter",
      "Japanese, Simplified and Traditional Chinese Kanji Converter",
      "modern Japanese Kanji (Shinjitai)",
      "orthographic differences",
      "Japanese-to-Simplified conversion",
      "Japanese-Chinese kanji comparison"
    ]) {
      if (!html.toLowerCase().includes(keyword.toLowerCase())) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
    if (!/data-source-type="simplified"[^>]+aria-checked="true"[^>]+class="is-active"/.test(html)) {
      throw new Error(`${relativePath}: Simplified Chinese must be the default input type`);
    }
  }
  const competitorKeywords = localizedKanjiKeywords.get(relativePath);
  if (competitorKeywords) {
    for (const keyword of competitorKeywords) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing localized competitor keyword ${keyword}`);
    }
  }
  if (isConverterPage && !html.includes('data-route="chinese-to-pinyin"')) {
    throw new Error(`${relativePath}: missing Chinese-to-Pinyin link`);
  }
  if (isConverterPage && !html.includes('data-route="chinese-stroke-order"')) {
    throw new Error(`${relativePath}: missing Chinese stroke-order link`);
  }
  if (isConverterPage && !html.includes('data-route="word-to-txt"')) {
    throw new Error(`${relativePath}: missing Word-to-TXT link`);
  }
  if (isConverterPage && !html.includes('data-route="character-counter"')) {
    throw new Error(`${relativePath}: missing character-counter link`);
  }
  if (isConverterPage && !html.includes('data-route="han-character-worksheet"')) {
    throw new Error(`${relativePath}: missing Han character worksheet link`);
  }
  if (isConverterPage && !html.includes('data-route="kanji-to-romaji"')) {
    throw new Error(`${relativePath}: missing Kanji-to-Romaji link`);
  }
  if (isStandaloneToolPage && (!html.includes("japanese-chinese-kanji-converter/") || !html.includes("japanese-characters/") || !html.includes("chinese-to-pinyin/") || !html.includes("chinese-stroke-order/") || !html.includes("word-to-txt/") || !html.includes("han-character-worksheet/") || !html.includes("kanji-to-romaji/"))) {
    throw new Error(`${relativePath}: missing related tool links`);
  }
  if (isKanjiRomajiPage) {
    for (const asset of [
      'src="/kanji-romaji-core.js"',
      "cdn.jsdelivr.net/npm/kuroshiro@1.2.0/dist/kuroshiro.min.js",
      "cdn.jsdelivr.net/npm/kuroshiro-analyzer-kuromoji@1.1.0/dist/kuroshiro-analyzer-kuromoji.min.js",
      'src="/kanji-to-romaji.js"',
      "data-dictionary-path=",
      "data-dictionary-fallback-path="
    ]) {
      if (!html.includes(asset)) throw new Error(`${relativePath}: missing Kanji-to-Romaji asset ${asset}`);
    }
    const targetKeywords = localizedRomajiKeywords.get(relativePath) || [];
    for (const keyword of targetKeywords) {
      if (!html.toLowerCase().includes(keyword.toLowerCase())) {
        throw new Error(`${relativePath}: missing localized Romaji keyword ${keyword}`);
      }
    }
  }
  if (isPinyinPage) {
    if (!html.includes('src="/vendor/pinyin-pro.js"') || !html.includes('src="/pinyin-tool.js"')) {
      throw new Error(`${relativePath}: Pinyin assets must be served locally`);
    }
  }
  if (relativePath === path.join("chinese-to-pinyin", "index.html")) {
    for (const keyword of ["汉字转拼音", "汉字拼音在线转换", "汉字拼音查询"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (isStrokeOrderPage) {
    if (!html.includes("cdn.jsdmirror.cn/npm/hanzi-writer/dist/hanzi-writer.min.js") || !html.includes('src="/stroke-order-tool.js"')) {
      throw new Error(`${relativePath}: missing Hanzi Writer CDN or stroke-order script`);
    }
  }
  if (relativePath === path.join("chinese-stroke-order", "index.html")) {
    for (const keyword of ["汉字笔顺查询", "汉字笔画顺序查询", "汉字笔顺动画"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (isWordToTxtPage) {
    if (!html.includes("cdn.jsdmirror.cn/npm/mammoth/mammoth.browser.min.js") || !html.includes("cdn.jsdmirror.cn/npm/jszip/dist/jszip.min.js") || !html.includes('src="/word-to-txt-tool.js"')) {
      throw new Error(`${relativePath}: missing Word-to-TXT browser assets`);
    }
  }
  if (relativePath === path.join("word-to-txt", "index.html")) {
    for (const keyword of ["Word转TXT", "Word文档转TXT", "DOCX转TXT"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (relativePath === path.join("ja", "word-to-txt", "index.html")) {
    for (const keyword of ["Word TXT 変換", "Word テキスト変換", "DOCX TXT 変換"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (isCharacterCounterPage && (!html.includes('src="/character-counter.js"') || !html.includes('id="counterInput"'))) {
    throw new Error(`${relativePath}: missing character-counter assets or input`);
  }
  if (isCharacterCounterPage && !html.includes('src="/webmcp.js"')) {
    throw new Error(`${relativePath}: missing character-counter WebMCP registration`);
  }
  if (relativePath === path.join("character-counter", "index.html")) {
    for (const keyword of ["在线字数统计", "汉字字数统计", "字符数统计"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (relativePath === path.join("ja", "character-counter", "index.html")) {
    for (const keyword of ["文字数カウント", "文字数カウンター", "空白なし"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (relativePath === path.join("ko", "character-counter", "index.html")) {
    for (const keyword of ["글자수 세기", "글자수 계산기", "공백 제외"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (isWorksheetPage) {
    if (
      !html.includes("cdn.jsdmirror.cn/npm/hanzi-writer/dist/hanzi-writer.min.js") ||
      !html.includes('src="/vendor/pinyin-pro.js"') ||
      !html.includes('src="/han-character-worksheet.js"') ||
      !html.includes('id="worksheetInput"')
    ) {
      throw new Error(`${relativePath}: missing worksheet browser assets or input`);
    }
  }
  if (relativePath === path.join("han-character-worksheet", "index.html")) {
    for (const keyword of ["田字格字帖生成器", "汉字练习纸", "在线字帖生成器"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (relativePath === path.join("zh-tw", "han-character-worksheet", "index.html")) {
    for (const keyword of ["國字練習紙", "田字格", "描紅"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (relativePath === path.join("en", "han-character-worksheet", "index.html")) {
    for (const keyword of ["Chinese Character Worksheet Generator", "Chinese writing practice", "Tian Zi Ge"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (relativePath === path.join("ja", "han-character-worksheet", "index.html")) {
    for (const keyword of ["漢字練習プリント", "なぞり書き", "印刷"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
  if (relativePath === path.join("ko", "han-character-worksheet", "index.html")) {
    for (const keyword of ["한자 쓰기 연습장", "따라쓰기 학습지", "인쇄"]) {
      if (!html.includes(keyword)) throw new Error(`${relativePath}: missing target keyword ${keyword}`);
    }
  }
}

const agentIndexText = await readFile(
  path.join(projectRoot, ".well-known", "agent-skills", "index.json"),
  "utf8"
);
const agentIndex = JSON.parse(agentIndexText);
if (agentIndex.$schema !== "https://schemas.agentskills.io/discovery/0.2.0/schema.json") {
  throw new Error("agent skills index uses an unsupported schema");
}
if (!Array.isArray(agentIndex.skills) || agentIndex.skills.length !== 1) {
  throw new Error("agent skills index must contain one browser-tool skill");
}
const [agentSkill] = agentIndex.skills;
if (
  agentSkill.name !== "jianfan-browser-tools" ||
  agentSkill.type !== "skill-md" ||
  !/^sha256:[a-f0-9]{64}$/.test(agentSkill.digest)
) {
  throw new Error("agent skills index contains invalid skill metadata");
}
const agentSkillPath = path.join(projectRoot, agentSkill.url.replace(/^\//, ""));
const agentSkillBytes = await readFile(agentSkillPath);
const agentSkillDigest = `sha256:${createHash("sha256").update(agentSkillBytes).digest("hex")}`;
if (agentSkill.digest !== agentSkillDigest) {
  throw new Error("agent skill digest is out of sync; run scripts/sync-agent-discovery.mjs");
}

const headers = await readFile(path.join(projectRoot, "_headers"), "utf8");
if (
  !headers.includes("Content-Signal: ai-train=no, search=yes, ai-input=yes") ||
  !headers.includes('rel="service-desc"') ||
  !headers.includes('rel="service-doc"')
) {
  throw new Error("_headers is missing agent discovery or Content Signals");
}
const robots = await readFile(path.join(projectRoot, "robots.txt"), "utf8");
if (!robots.includes("Content-Signal: ai-train=no, search=yes, ai-input=yes")) {
  throw new Error("robots.txt is missing Content Signals");
}
const notFound = await readFile(path.join(projectRoot, "404.html"), "utf8");
if (!notFound.includes('name="robots" content="noindex, follow"')) {
  throw new Error("404.html must prevent unsupported discovery URLs from being indexed");
}

if (converterPages !== 35) throw new Error(`expected 35 converter pages, found ${converterPages}`);
if (standaloneToolPages !== 40) throw new Error(`expected 40 standalone tool pages, found ${standaloneToolPages}`);
if (infoPages !== 10) throw new Error(`expected 10 information pages, found ${infoPages}`);
if (sitemapUrls.length !== 90) throw new Error(`expected 90 sitemap URLs, found ${sitemapUrls.length}`);

console.log(`Validated ${converterPages} converter pages, ${standaloneToolPages} standalone tools, ${infoPages} information pages, and ${sitemapUrls.length} sitemap URLs.`);
