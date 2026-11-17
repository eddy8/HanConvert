// Notifies IndexNow (Bing, Yandex, Naver, Seznam, and others) about recently changed pages.
// Run it only after the changes are deployed, because search engines fetch the URLs right away.
//
//   node scripts/submit-indexnow.mjs --dry-run            list URLs with lastmod >= today
//   node scripts/submit-indexnow.mjs --since 2026-11-17   submit URLs changed on or after a date
//   node scripts/submit-indexnow.mjs --all                submit every sitemap URL (use rarely)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { localDate, readSitemapLastmods } from "./sitemap-lastmod.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "jianfan.app";
const origin = `https://${host}`;
const endpoint = "https://api.indexnow.org/indexnow";
const maxUrlsPerRequest = 10_000;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const all = args.includes("--all");
const sinceIndex = args.indexOf("--since");
const since = sinceIndex >= 0 ? args[sinceIndex + 1] : localDate();
if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error(`--since needs a YYYY-MM-DD date, got ${since}`);

const keyFiles = (await readdir(projectRoot)).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (keyFiles.length !== 1) throw new Error(`Expected exactly one IndexNow key file at the site root, found ${keyFiles.length}`);
const key = (await readFile(path.join(projectRoot, keyFiles[0]), "utf8")).trim();
if (`${key}.txt` !== keyFiles[0]) throw new Error("IndexNow key file content must match its file name");
const keyLocation = `${origin}/${keyFiles[0]}`;

const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
const urls = [...readSitemapLastmods(sitemap)]
  .filter(([, lastmod]) => all || lastmod >= since)
  .map(([loc]) => loc);

console.log(`${urls.length} URL(s) ${all ? "in the sitemap" : `with lastmod >= ${since}`}.`);
if (!urls.length) process.exit(0);
if (dryRun) {
  console.log(urls.join("\n"));
  process.exit(0);
}

const live = await fetch(keyLocation);
if (!live.ok || (await live.text()).trim() !== key) {
  throw new Error(`${keyLocation} is not live yet; deploy the key file before submitting.`);
}

for (let start = 0; start < urls.length; start += maxUrlsPerRequest) {
  const urlList = urls.slice(start, start + maxUrlsPerRequest);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList })
  });
  // 200 = accepted, 202 = accepted and the key is still being verified.
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow returned ${response.status}: ${await response.text()}`);
  }
  console.log(`Submitted ${urlList.length} URL(s): HTTP ${response.status}`);
}
