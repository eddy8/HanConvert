import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const origin = "https://jianfan.app";
const markerStart = "  <!-- korean-hanja-tools:start -->";
const markerEnd = "  <!-- korean-hanja-tools:end -->";
const slugs = [
  "korean-hanja-dictionary",
  "korean-hanja-handwriting-recognition",
  "hangul-hanja-converter",
  "korean-name-hanja"
];
const locales = [
  { hreflang: "zh-Hans", prefix: "", priority: "0.8" },
  { hreflang: "zh-Hant", prefix: "zh-tw/", priority: "0.8" },
  { hreflang: "en", prefix: "en/", priority: "0.8" },
  { hreflang: "ja", prefix: "ja/", priority: "0.8" },
  { hreflang: "ko", prefix: "ko/", priority: "0.9" }
];

function absolutePath(prefix, slug) {
  return `${origin}/${prefix}${slug}/`;
}

function buildUrl(slug, locale) {
  const alternates = locales.map(
    (item) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${absolutePath(item.prefix, slug)}" />`
  );
  alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absolutePath("", slug)}" />`);
  return `  <url>
    <loc>${absolutePath(locale.prefix, slug)}</loc>
    <lastmod>2026-08-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${locale.priority}</priority>
${alternates.join("\n")}
  </url>`;
}

const section = `${markerStart}\n${slugs.flatMap((slug) => locales.map((locale) => buildUrl(slug, locale))).join("\n")}\n${markerEnd}`;
const source = await readFile(sitemapPath, "utf8");
const updated = source.includes(markerStart)
  ? source.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), section)
  : source.replace("</urlset>", `${section}\n</urlset>`);

await writeFile(sitemapPath, updated);
console.log("Added 20 Korean Hanja tool URLs to sitemap.xml.");
