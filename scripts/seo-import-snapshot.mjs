// Builds .seo-data/<date>/snapshot.json from the raw files collected from Bing Webmaster Tools
// and Google Search Console (copied from their reports, for example with Claude in Chrome).
//
// Files in the snapshot folder (paths may be site-relative, such as /ja/ or /blog/x/):
//   meta.json                        { date, window, bing.totals, google.totals, google.indexed }
//   bing-pages.tsv / google-pages.tsv      path  impressions  clicks  position
//   bing-weekly.json                       optional per-page weekly series from seo-fetch-bing.mjs
//   bing-queries.tsv                       query impressions  clicks  position
//   bing-ai-queries.tsv                    grounding query  citations  share%   (Bing AI Performance)
//   bing-ai-pages.tsv                      path  citations
//   google-indexed.txt                     one path per line
//   google-crawled-not-indexed.txt, google-redirect.txt, google-duplicate-canonical.txt, ...
//                                          one path per line; the file name becomes the reason
//   google-discovered-not-indexed.txt      optional; when missing it is derived as
//                                          sitemap URLs minus every other listed URL
//
//   node scripts/seo-import-snapshot.mjs 2026-11-17
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readSitemapLastmods } from "./sitemap-lastmod.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) throw new Error("Usage: node scripts/seo-import-snapshot.mjs YYYY-MM-DD");
const folder = path.join(projectRoot, ".seo-data", date);

const absolute = (value) => (value.startsWith("http") ? value : `${origin}${value}`);
const lines = async (file) => (await readFile(path.join(folder, file), "utf8").catch(() => "")).split("\n").map((line) => line.trim()).filter(Boolean);

async function rows(file, key) {
  return (await lines(file)).map((line) => {
    const [label, impressions, clicks, position] = line.split("\t");
    const row = { impressions: Number(impressions), clicks: Number(clicks), position: Number(position) };
    row.ctr = row.impressions ? row.clicks / row.impressions : 0;
    return { [key]: key === "url" ? absolute(label) : label, ...row };
  });
}

const meta = JSON.parse(await readFile(path.join(folder, "meta.json"), "utf8"));
const files = await readdir(folder);
const indexed = new Set((await lines("google-indexed.txt")).map(absolute));
const notIndexed = {};
for (const file of files.filter((name) => /^google-.+\.txt$/.test(name) && name !== "google-indexed.txt")) {
  const reason = file.replace(/^google-|\.txt$/g, "");
  notIndexed[reason] = (await lines(file)).map(absolute);
}

if (!notIndexed["discovered-not-indexed"]) {
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  const listed = new Set([...indexed, ...Object.values(notIndexed).flat()]);
  notIndexed["discovered-not-indexed (derived)"] = [...readSitemapLastmods(sitemap).keys()].filter((url) => !listed.has(url));
}

const snapshot = {
  date: meta.date ?? date,
  window: meta.window,
  bing: {
    totals: meta.bing?.totals,
    pages: await rows("bing-pages.tsv", "url"),
    queries: await rows("bing-queries.tsv", "query"),
    weekly: JSON.parse(await readFile(path.join(folder, "bing-weekly.json"), "utf8").catch(() => "null"))
  },
  // Bing Webmaster "AI Performance": citations of this site in Microsoft Copilot and partner answers.
  ai: {
    totals: meta.bingAi ?? null,
    queries: (await lines("bing-ai-queries.tsv")).map((line) => {
      const [query, citations, share] = line.split("\t");
      return { query, citations: Number(citations), share: Number.parseFloat(share) / 100 };
    }),
    pages: (await lines("bing-ai-pages.tsv")).map((line) => {
      const [label, citations] = line.split("\t");
      return { url: absolute(label), citations: Number(citations) };
    })
  },
  google: {
    totals: meta.google?.totals,
    pages: await rows("google-pages.tsv", "url"),
    queries: await rows("google-queries.tsv", "query"),
    index: { indexed: meta.google?.indexed ?? indexed.size, indexedUrls: [...indexed], notIndexed, reportedCounts: meta.google?.notIndexedCounts }
  }
};

await writeFile(path.join(folder, "snapshot.json"), `${JSON.stringify(snapshot, null, 2)}\n`);
const counts = Object.entries(notIndexed).map(([reason, urls]) => `${reason}: ${urls.length}`).join(", ");
console.log(`Wrote ${path.relative(projectRoot, path.join(folder, "snapshot.json"))}: ${snapshot.bing.pages.length} Bing pages, ${snapshot.bing.queries.length} Bing queries, ${snapshot.google.pages.length} Google pages, ${indexed.size} indexed; ${counts}`);
