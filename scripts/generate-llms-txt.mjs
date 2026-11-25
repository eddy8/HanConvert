// Generates /llms.txt: a curated, link-first map of JianFan.app for AI search and answer engines
// (https://llmstxt.org). Titles and descriptions come from each page's own static English metadata,
// so the file cannot drift from the pages. Run with --check to verify without writing.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { decodeHtmlText, SEO_TITLE_SUFFIX } from "./seo-metadata-rules.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const outputPath = path.join(projectRoot, "llms.txt");
const checkOnly = process.argv.includes("--check");

const sections = [
  ["Chinese conversion", ["simplified-to-traditional", "traditional-to-simplified", "taiwan-traditional", "hong-kong-traditional", "file-text-converter", "word-chinese-converter", "pdf-chinese-converter", "excel-chinese-converter", "csv-chinese-converter", "txt-chinese-converter"]],
  ["Chinese characters", ["chinese-handwriting-recognition", "photo-chinese-character-recognition", "chinese-character-lookup", "chinese-stroke-order", "chinese-to-pinyin", "character-counter", "hanzi"]],
  ["Printable worksheets", ["han-character-worksheet", "tian-zi-ge-worksheet", "mi-zi-ge-worksheet", "hanzi-tracing-worksheet", "pinyin-hanzi-worksheet", "stroke-order-worksheet"]],
  ["Japanese", ["japanese-handwriting-recognition", "japanese-kanji-dictionary", "japanese-stroke-order", "kanji-to-hiragana", "kanji-to-romaji", "japanese-chinese-kanji-converter", "chinese-japanese-kanji-comparison", "japanese-kanji-converter", "simplified-chinese-to-japanese-kanji", "traditional-chinese-to-japanese-kanji", "japanese-kanji-to-simplified-chinese", "japanese-kanji-to-traditional-chinese", "japanese-characters"]],
  ["Korean", ["korean-handwriting-recognition", "hangul-hanja-converter", "korean-hanja-dictionary", "korean-hanja-handwriting-recognition", "korean-name-hanja"]],
  ["Text and privacy utilities", ["text-formatter", "word-to-txt", "image-redaction", "image-splitter", "password-generator"]]
];

async function pageMeta(relativeFile) {
  const html = await readFile(path.join(projectRoot, relativeFile), "utf8");
  const title = decodeHtmlText(html.match(/<title>([^<]*)<\/title>/u)?.[1] ?? "").replace(SEO_TITLE_SUFFIX, "").replace(/ \| JianFan$/u, "").trim();
  const description = decodeHtmlText(html.match(/<meta\s+name="description"\s+content="([^"]*)"/u)?.[1] ?? "").trim();
  if (!title || !description) throw new Error(`${relativeFile}: missing title or description`);
  return { title, description };
}

const lines = [
  "# JianFan.app",
  "",
  "> Free browser-based tools for Chinese, Japanese, and Korean characters: Simplified ↔ Traditional Chinese conversion (including Taiwan and Hong Kong forms and regional vocabulary, based on OpenCC), handwriting and photo character recognition, Pinyin, stroke order, character lookup, kanji readings, Korean Hanja, and printable practice worksheets.",
  "",
  "Every tool is available in five languages with the same path: Simplified Chinese at the site root (/<tool>/), Traditional Chinese at /zh-tw/<tool>/, English at /en/<tool>/, Japanese at /ja/<tool>/, and Korean at /ko/<tool>/. Links below use the English pages.",
  "",
  "Text conversion, counting, formatting, and most lookups run locally in the browser. Photo OCR uploads the processed image to the JianFan.app OCR service, and Korean Hanja handwriting falls back to online recognition only when local matching finds no result. Each tool page states how it processes data.",
  ""
];

for (const [heading, slugs] of sections) {
  lines.push(`## ${heading}`, "");
  for (const slug of slugs) {
    const { title, description } = await pageMeta(`en/${slug}/index.html`);
    lines.push(`- [${title}](${origin}/en/${slug}/): ${description}`);
  }
  lines.push("");
}

const blogIndex = await readFile(path.join(projectRoot, "blog", "index.html"), "utf8");
const blogSlugs = [...new Set([...blogIndex.matchAll(/href="\/blog\/([a-z0-9-]+)\/"/gu)].map((match) => match[1]))];
lines.push("## Guides (Simplified Chinese)", "");
for (const slug of blogSlugs) {
  const { title, description } = await pageMeta(`blog/${slug}/index.html`);
  lines.push(`- [${title}](${origin}/blog/${slug}/): ${description}`);
}
lines.push("");

lines.push("## Optional", "");
for (const slug of ["about", "privacy", "contact"]) {
  const { title, description } = await pageMeta(`en/${slug}/index.html`);
  lines.push(`- [${title}](${origin}/en/${slug}/): ${description}`);
}
lines.push(`- [Sitemap](${origin}/sitemap.xml): Every canonical URL with hreflang alternates and last-modified dates.`, "");

const output = lines.join("\n");
if (checkOnly) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== output) throw new Error("llms.txt is out of sync; run node scripts/generate-llms-txt.mjs");
  console.log("Checked llms.txt.");
} else {
  await writeFile(outputPath, output);
  console.log(`Generated llms.txt with ${sections.reduce((sum, [, slugs]) => sum + slugs.length, 0)} tools and ${blogSlugs.length} guides.`);
}
