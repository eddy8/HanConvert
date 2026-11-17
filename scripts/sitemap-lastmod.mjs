import { createHash } from "node:crypto";

// Hash only what search engines treat as page content: title, meta description,
// and the visible text inside <main>. Navigation, footer, scripts, and markup-only
// edits do not change the hash, so they never move <lastmod>.
export function indexableContentHash(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/u)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/u)?.[1] ?? "";
  const main = html.match(/<main[\s\S]*?<\/main>/u)?.[0] ?? html.match(/<body[\s\S]*?<\/body>/u)?.[0] ?? "";
  const text = main
    .replace(/<script[\s\S]*?<\/script>/gu, " ")
    .replace(/<style[\s\S]*?<\/style>/gu, " ")
    .replace(/<template[\s\S]*?<\/template>/gu, " ")
    .replace(/<!--[\s\S]*?-->/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
  return createHash("sha256").update(`${title}\n${description}\n${text}`).digest("hex").slice(0, 16);
}

export function sitemapLocs(sitemap) {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
}

export function locToFile(loc, origin = "https://jianfan.app") {
  if (!loc.startsWith(`${origin}/`)) throw new Error(`Unexpected sitemap URL: ${loc}`);
  return `${loc.slice(origin.length + 1)}index.html`;
}

export function readSitemapLastmods(sitemap) {
  const lastmods = new Map();
  for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/gu)) {
    lastmods.set(match[1], match[2]);
  }
  return lastmods;
}

export function applySitemapLastmods(sitemap, lastmodForLoc) {
  return sitemap.replace(/(<loc>([^<]+)<\/loc>\s*<lastmod>)(\d{4}-\d{2}-\d{2})(<\/lastmod>)/gu, (whole, prefix, loc, current, suffix) => {
    const next = lastmodForLoc(loc, current);
    return next ? `${prefix}${next}${suffix}` : whole;
  });
}

// Generators rebuild their sitemap sections with a fixed date. Keep the date that
// sync-sitemap-lastmod.mjs already published so regenerating never fakes freshness.
export function preserveExistingLastmods(previousSitemap, nextSitemap) {
  const previous = readSitemapLastmods(previousSitemap);
  return applySitemapLastmods(nextSitemap, (loc, current) => previous.get(loc) ?? current);
}

export function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
