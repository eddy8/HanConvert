// Turns a search-data snapshot into a prioritized SEO action list, and attributes
// metric changes to pages whose content changed between two snapshots.
//
// Snapshots live outside the published site in .seo-data/<YYYY-MM-DD>/snapshot.json (git-ignored):
// {
//   "date": "2026-11-17", "window": "3M",
//   "bing":   { "totals": { "clicks": 0, "impressions": 0 }, "pages": [Row], "queries": [Row] },
//   "google": { "totals": { "clicks": 0, "impressions": 0 }, "pages": [Row], "queries": [Row],
//               "index": { "indexed": 0, "notIndexed": { "<reason>": ["https://jianfan.app/..."] } } }
// }
// Row = { "url" | "query", "impressions", "clicks", "ctr" (0-1), "position" }
//
//   node scripts/seo-report.mjs                 latest snapshot, compared with the previous one
//   node scripts/seo-report.mjs 2026-12-15      a specific snapshot
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { locToFile, readSitemapLastmods } from "./sitemap-lastmod.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(projectRoot, ".seo-data");
const origin = "https://jianfan.app";

const SNIPPET_MIN_IMPRESSIONS = 1000;
const SNIPPET_MAX_CTR = 0.01;
const STRIKING_MIN_IMPRESSIONS = 200;
const STRIKING_POSITIONS = [4, 15];

async function loadSnapshots() {
  const dirs = (await readdir(dataRoot, { withFileTypes: true }).catch(() => []))
    .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const requested = process.argv[2];
  const currentIndex = requested ? dirs.indexOf(requested) : dirs.length - 1;
  if (currentIndex < 0) throw new Error(requested ? `No snapshot for ${requested}` : `No snapshots in ${dataRoot}`);
  const read = async (date) => JSON.parse(await readFile(path.join(dataRoot, date, "snapshot.json"), "utf8"));
  return {
    current: await read(dirs[currentIndex]),
    previous: currentIndex > 0 ? await read(dirs[currentIndex - 1]) : null
  };
}

const pct = (value) => `${(value * 100).toFixed(2)}%`;
const num = (value) => Number(value ?? 0).toLocaleString("en-US");
const short = (url) => url.replace(origin, "") || "/";
const delta = (now, before) => (before == null ? "" : ` (${now - before >= 0 ? "+" : ""}${num(now - before)})`);
const byUrl = (rows = []) => new Map(rows.map((row) => [row.url, row]));

function table(headers, rows) {
  if (!rows.length) return "_None._\n";
  return [`| ${headers.join(" | ")} |`, `|${headers.map(() => "---").join("|")}|`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n") + "\n";
}

const { current, previous } = await loadSnapshots();
const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
const lastmods = readSitemapLastmods(sitemap);
const sitemapUrls = [...lastmods.keys()];
const bingPages = byUrl(current.bing?.pages);
const googlePages = byUrl(current.google?.pages);
const notIndexed = current.google?.index?.notIndexed ?? {};
const notIndexedReason = new Map(Object.entries(notIndexed).flatMap(([reason, urls]) => urls.map((url) => [url, reason])));
const out = [];

out.push(`# SEO report ${current.date}${previous ? ` (vs ${previous.date})` : ""}\n`);
for (const engine of ["bing", "google"]) {
  const totals = current[engine]?.totals;
  if (!totals) continue;
  const before = previous?.[engine]?.totals;
  out.push(`- **${engine}** (${current.window ?? "?"}): ${num(totals.clicks)} clicks${delta(totals.clicks, before?.clicks)}, ${num(totals.impressions)} impressions${delta(totals.impressions, before?.impressions)}`);
}
const index = current.google?.index;
if (index) {
  const missing = Object.values(notIndexed).reduce((sum, urls) => sum + urls.length, 0);
  out.push(`- **google index**: ${index.indexed} indexed${delta(index.indexed, previous?.google?.index?.indexed)}, ${missing} listed as not indexed, ${sitemapUrls.length} in sitemap`);
}
out.push("");

// 1. Snippet problems: shown often, rarely clicked.
const snippet = (current.bing?.pages ?? [])
  .filter((row) => row.impressions >= SNIPPET_MIN_IMPRESSIONS && row.ctr < SNIPPET_MAX_CTR)
  .sort((a, b) => b.impressions - a.impressions);
out.push("## 1. Fix the snippet (high impressions, CTR < 1%)\n");
out.push("Rewrite title/description around the queries that page ranks for; check the SERP for what competitors promise.\n");
out.push(table(["page", "impr.", "CTR", "pos.", "lastmod"], snippet.map((row) => [short(row.url), num(row.impressions), pct(row.ctr), row.position.toFixed(1), lastmods.get(row.url) ?? "-"])));

// 2. Striking distance: queries just off the top 3.
const striking = (current.bing?.queries ?? [])
  .filter((row) => row.impressions >= STRIKING_MIN_IMPRESSIONS && row.position >= STRIKING_POSITIONS[0] && row.position <= STRIKING_POSITIONS[1])
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 40);
out.push(`## 2. Striking-distance queries (Bing position ${STRIKING_POSITIONS.join("-")})\n`);
out.push("Answer the query directly in the matching page's overview/FAQ and strengthen internal links before creating new pages.\n");
out.push(table(["query", "impr.", "clicks", "CTR", "pos."], striking.map((row) => [row.query, num(row.impressions), num(row.clicks), pct(row.ctr), row.position.toFixed(1)])));

// 3. Pages that earn Bing traffic but Google has not indexed: strongest re-indexing candidates.
const indexCandidates = [...notIndexedReason]
  .map(([url, reason]) => ({ url, reason, bing: bingPages.get(url) }))
  .filter((row) => row.bing)
  .sort((a, b) => b.bing.impressions - a.bing.impressions);
out.push("## 3. Proven on Bing but not indexed by Google\n");
out.push("Request indexing in Search Console, add contextual internal links from indexed pages, and make the page's unique value obvious above the fold.\n");
out.push(table(["page", "Google status", "Bing impr.", "Bing clicks"], indexCandidates.map((row) => [short(row.url), row.reason, num(row.bing.impressions), num(row.bing.clicks)])));

// 4. Zero visibility anywhere: improve, merge, or noindex.
const invisible = sitemapUrls.filter((url) => !bingPages.has(url) && !googlePages.has(url));
const invisibleByType = new Map();
for (const url of invisible) {
  const file = locToFile(url);
  const type = file.split("/").filter((part) => !["zh-tw", "en", "ja", "ko", "index.html"].includes(part))[0] ?? "(home)";
  invisibleByType.set(type, [...(invisibleByType.get(type) ?? []), short(url)]);
}
out.push(`## 4. No impressions on either engine (${invisible.length} of ${sitemapUrls.length} sitemap URLs)\n`);
out.push("Groups with many invisible pages are thin or duplicated: improve them, merge them into a stronger page, or noindex them before adding more pages of that kind.\n");
out.push(table(["section", "pages", "examples"], [...invisibleByType].sort((a, b) => b[1].length - a[1].length).map(([type, urls]) => [type, urls.length, urls.slice(0, 3).join(" ")])));

// 5. Attribution: pages whose content changed between the two snapshots.
if (previous) {
  const previousBing = byUrl(previous.bing?.pages);
  const changed = sitemapUrls.filter((url) => {
    const lastmod = lastmods.get(url);
    return lastmod > previous.date && lastmod <= current.date;
  });
  out.push(`## 5. Attribution: pages changed between ${previous.date} and ${current.date}\n`);
  out.push("Windows overlap, so read these as directional. Re-check once the full window postdates the change.\n");
  out.push(table(["page", "changed", "impr. before → now", "CTR before → now", "pos. before → now"], changed.map((url) => {
    const before = previousBing.get(url);
    const now = bingPages.get(url);
    const fmt = (row, key, f) => (row ? f(row[key]) : "-");
    return [short(url), lastmods.get(url), `${fmt(before, "impressions", num)} → ${fmt(now, "impressions", num)}`, `${fmt(before, "ctr", pct)} → ${fmt(now, "ctr", pct)}`, `${fmt(before, "position", (v) => v.toFixed(1))} → ${fmt(now, "position", (v) => v.toFixed(1))}`];
  })));
}

const report = out.join("\n");
const reportPath = path.join(dataRoot, current.date, "report.md");
await writeFile(reportPath, report);
console.log(report);
console.log(`\nSaved ${path.relative(projectRoot, reportPath)}`);
