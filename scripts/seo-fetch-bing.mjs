// Pulls Bing Webmaster Tools traffic data into .seo-data/<date>/ for seo-import-snapshot.mjs.
// The API key is read from BING_WEBMASTER_API_KEY or the git-ignored .seo-data/bing-api-key file.
// Bing documents only an `apikey` query parameter for key-based JSON access, so never log request URLs.
//
//   node scripts/seo-fetch-bing.mjs                 last 12 weeks into .seo-data/<today>/
//   node scripts/seo-fetch-bing.mjs --weeks 4       a shorter window
//
// Writes bing-pages.tsv, bing-queries.tsv, bing-weekly.json (per-page weekly series, used for
// before/after attribution) and merges bing totals into meta.json.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { localDate } from "./sitemap-lastmod.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://jianfan.app/";
const endpoint = "https://ssl.bing.com/webmaster/api.svc/json";
const args = process.argv.slice(2);
const weeksIndex = args.indexOf("--weeks");
const weeks = weeksIndex >= 0 ? Number(args[weeksIndex + 1]) : 12;
if (!Number.isInteger(weeks) || weeks < 1) throw new Error("--weeks needs a positive integer");

const apiKey = (process.env.BING_WEBMASTER_API_KEY || (await readFile(path.join(projectRoot, ".seo-data", "bing-api-key"), "utf8").catch(() => ""))).trim();
if (!apiKey) throw new Error("Set BING_WEBMASTER_API_KEY or save the key to .seo-data/bing-api-key");

async function call(method) {
  const url = `${endpoint}/${method}?siteUrl=${encodeURIComponent(siteUrl)}&apikey=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  const body = await response.text();
  if (!response.ok) throw new Error(`${method} failed with HTTP ${response.status}: ${body.slice(0, 200)}`);
  return JSON.parse(body).d ?? [];
}

// WCF JSON dates look like /Date(1784851200000)/ or /Date(1316156400000-0700)/.
const parseDate = (value) => new Date(Number(String(value).match(/\/Date\((-?\d+)/)[1]));
const isoDay = (date) => date.toISOString().slice(0, 10);

function aggregate(rows, since) {
  const totals = new Map();
  for (const row of rows) {
    if (parseDate(row.Date) < since) continue;
    const entry = totals.get(row.Query) ?? { impressions: 0, clicks: 0, positionWeight: 0, positionImpressions: 0 };
    entry.impressions += row.Impressions;
    entry.clicks += row.Clicks;
    if (row.AvgImpressionPosition > 0) {
      entry.positionWeight += row.AvgImpressionPosition * row.Impressions;
      entry.positionImpressions += row.Impressions;
    }
    totals.set(row.Query, entry);
  }
  return [...totals]
    .map(([key, entry]) => [key, entry.impressions, entry.clicks, entry.positionImpressions ? (entry.positionWeight / entry.positionImpressions).toFixed(2) : "0"])
    .sort((a, b) => b[1] - a[1]);
}

const [pageRows, queryRows, dailyRows] = await Promise.all([call("GetPageStats"), call("GetQueryStats"), call("GetRankAndTrafficStats")]);
const latest = new Date(Math.max(...pageRows.map((row) => parseDate(row.Date).getTime())));
const since = new Date(latest.getTime() - (weeks - 1) * 7 * 86_400_000);

const pages = aggregate(pageRows, since);
const queries = aggregate(queryRows, since);
const daily = dailyRows.filter((row) => parseDate(row.Date) >= since);
const totals = daily.reduce((sum, row) => ({ clicks: sum.clicks + row.Clicks, impressions: sum.impressions + row.Impressions }), { clicks: 0, impressions: 0 });

const weekly = {};
for (const row of pageRows) {
  (weekly[row.Query] ??= []).push({ week: isoDay(parseDate(row.Date)), impressions: row.Impressions, clicks: row.Clicks, position: row.AvgImpressionPosition });
}
for (const series of Object.values(weekly)) series.sort((a, b) => a.week.localeCompare(b.week));

const date = localDate();
const folder = path.join(projectRoot, ".seo-data", date);
await mkdir(folder, { recursive: true });
const tsv = (rows) => `${rows.map((row) => row.join("\t")).join("\n")}\n`;
await writeFile(path.join(folder, "bing-pages.tsv"), tsv(pages));
await writeFile(path.join(folder, "bing-queries.tsv"), tsv(queries));
await writeFile(path.join(folder, "bing-weekly.json"), `${JSON.stringify(weekly, null, 1)}\n`);

const metaPath = path.join(folder, "meta.json");
const meta = JSON.parse(await readFile(metaPath, "utf8").catch(() => "{}"));
meta.date = date;
meta.window = `${weeks}W`;
meta.bing = { totals, source: "api", weeks: { from: isoDay(since), to: isoDay(latest) } };
await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

console.log(`Bing ${isoDay(since)}..${isoDay(latest)}: ${totals.clicks} clicks, ${totals.impressions} impressions; ${pages.length} pages, ${queries.length} queries -> ${path.relative(projectRoot, folder)}`);
