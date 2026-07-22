import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const origin = "https://jianfan.app";
const slug = "chinese-stroke-order";
const markerStart = "  <!-- stroke-order-tool:start -->";
const markerEnd = "  <!-- stroke-order-tool:end -->";
const locales = [
  { hreflang: "zh-CN", prefix: "", priority: "0.9" },
  { hreflang: "zh-Hant", prefix: "zh-tw/", priority: "0.9" },
  { hreflang: "en", prefix: "en/", priority: "0.9" },
  { hreflang: "ja", prefix: "ja/", priority: "0.8" },
  { hreflang: "ko", prefix: "ko/", priority: "0.8" }
];

function absolutePath(prefix) {
  return `${origin}/${prefix}${slug}/`;
}

function buildUrl(locale) {
  const alternates = locales.map((item) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${absolutePath(item.prefix)}" />`);
  alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absolutePath("")}" />`);
  return `  <url>
    <loc>${absolutePath(locale.prefix)}</loc>
    <lastmod>2026-07-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${locale.priority}</priority>
${alternates.join("\n")}
  </url>`;
}

const section = `${markerStart}\n${locales.map(buildUrl).join("\n")}\n${markerEnd}`;
const source = await readFile(sitemapPath, "utf8");
const updated = source.includes(markerStart)
  ? source.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), section)
  : source.replace("</urlset>", `${section}\n</urlset>`);

await writeFile(sitemapPath, updated);
console.log("Added 5 Chinese stroke-order URLs to sitemap.xml.");
