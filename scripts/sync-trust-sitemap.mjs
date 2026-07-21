import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const origin = "https://jianfan.app";
const markerStart = "  <!-- trust-pages:start -->";
const markerEnd = "  <!-- trust-pages:end -->";
const locales = [
  { hreflang: "zh-CN", prefix: "" },
  { hreflang: "zh-Hant", prefix: "zh-tw/" },
  { hreflang: "en", prefix: "en/" },
  { hreflang: "ja", prefix: "ja/" },
  { hreflang: "ko", prefix: "ko/" }
];

function url(prefix, slug) {
  return `${origin}/${prefix}${slug}/`;
}

function buildEntry(slug, locale) {
  const links = locales.map((item) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${url(item.prefix, slug)}" />`);
  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${url("", slug)}" />`);
  return `  <url>
    <loc>${url(locale.prefix, slug)}</loc>
    <lastmod>2026-07-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
${links.join("\n")}
  </url>`;
}

const entries = ["about", "contact"].flatMap((slug) => locales.map((locale) => buildEntry(slug, locale)));
const section = `${markerStart}\n${entries.join("\n")}\n${markerEnd}`;
const source = await readFile(sitemapPath, "utf8");
const updated = source.includes(markerStart)
  ? source.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), section)
  : source.replace("</urlset>", `${section}\n</urlset>`);
await writeFile(sitemapPath, updated);
console.log("Added 10 About and Contact URLs to sitemap.xml.");
