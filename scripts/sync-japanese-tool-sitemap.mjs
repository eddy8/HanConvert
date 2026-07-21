import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const origin = "https://jianfan.app";
const markerStart = "  <!-- japanese-tools:start -->";
const markerEnd = "  <!-- japanese-tools:end -->";
const locales = [
  { hreflang: "zh-CN", prefix: "" },
  { hreflang: "zh-Hant", prefix: "zh-tw/" },
  { hreflang: "en", prefix: "en/" },
  { hreflang: "ja", prefix: "ja/" },
  { hreflang: "ko", prefix: "ko/" }
];

function absolutePath(prefix, slug) {
  return `${origin}/${prefix}${slug}/`;
}

function buildUrl(slug, locale, priority) {
  const alternates = locales.map((item) => (
    `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${absolutePath(item.prefix, slug)}" />`
  ));
  alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absolutePath("", slug)}" />`);
  return `  <url>
    <loc>${absolutePath(locale.prefix, slug)}</loc>
    <lastmod>2026-07-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
${alternates.join("\n")}
  </url>`;
}

const blocks = [];
for (const locale of locales) {
  blocks.push(buildUrl("japanese-chinese-kanji-converter", locale, locale.hreflang === "ja" ? "0.9" : "0.8"));
}
for (const locale of locales) {
  const priority = ["zh-Hant", "ja"].includes(locale.hreflang) ? "0.9" : "0.8";
  blocks.push(buildUrl("japanese-characters", locale, priority));
}
const section = `${markerStart}\n${blocks.join("\n")}\n${markerEnd}`;

const source = await readFile(sitemapPath, "utf8");
let updated;
if (source.includes(markerStart)) {
  updated = source.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), section);
} else {
  updated = source.replace("</urlset>", `${section}\n</urlset>`);
}
await writeFile(sitemapPath, updated);
console.log("Added 10 Japanese tool URLs to sitemap.xml.");
