// Keeps every sitemap <lastmod> equal to the date the page's indexable content last changed.
//
//   node scripts/sync-sitemap-lastmod.mjs              update changed pages to today
//   node scripts/sync-sitemap-lastmod.mjs --check      fail if a page changed without a new lastmod
//   node scripts/sync-sitemap-lastmod.mjs --seed-from-git
//       rebuild the manifest from git history (the last commit that changed each page's content)
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  applySitemapLastmods,
  indexableContentHash,
  localDate,
  locToFile,
  readSitemapLastmods,
  sitemapLocs
} from "./sitemap-lastmod.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const manifestPath = path.join(projectRoot, "scripts", "sitemap-lastmod.json");
const checkOnly = process.argv.includes("--check");
const seedFromGit = process.argv.includes("--seed-from-git");
const today = localDate();

function git(args) {
  return execFileSync("git", args, { cwd: projectRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function contentHistory(file) {
  const commits = git(["log", "--reverse", "--format=%H %cs", "--", file]).trim().split("\n").filter(Boolean);
  let hash = null;
  let lastmod = null;
  for (const line of commits) {
    const [commit, date] = line.split(" ");
    let html;
    try {
      html = git(["show", `${commit}:${file}`]);
    } catch {
      continue;
    }
    const next = indexableContentHash(html);
    if (next !== hash) {
      hash = next;
      lastmod = date;
    }
  }
  return { hash, lastmod };
}

const sitemap = await readFile(sitemapPath, "utf8");
const manifest = seedFromGit ? {} : JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));
const published = readSitemapLastmods(sitemap);
const nextManifest = {};
const problems = [];

for (const loc of sitemapLocs(sitemap)) {
  const file = locToFile(loc);
  const html = await readFile(path.join(projectRoot, file), "utf8");
  const hash = indexableContentHash(html);
  let entry = manifest[file];

  if (seedFromGit) {
    const history = contentHistory(file);
    entry = history.hash === hash ? history : { hash, lastmod: today };
  } else if (!entry) {
    if (checkOnly) problems.push(`${file}: missing from sitemap-lastmod.json`);
    entry = { hash, lastmod: today };
  } else if (entry.hash !== hash) {
    if (checkOnly) problems.push(`${file}: content changed since ${entry.lastmod}`);
    entry = { hash, lastmod: today };
  }

  if (checkOnly && published.get(loc) !== entry.lastmod) {
    problems.push(`${file}: sitemap lastmod ${published.get(loc)} should be ${entry.lastmod}`);
  }
  nextManifest[file] = entry;
}

if (checkOnly) {
  if (problems.length) {
    throw new Error(`Sitemap lastmod is out of sync; run node scripts/sync-sitemap-lastmod.mjs\n${problems.slice(0, 20).join("\n")}`);
  }
  console.log(`Checked lastmod for ${Object.keys(nextManifest).length} sitemap URLs.`);
} else {
  const sorted = Object.fromEntries(Object.entries(nextManifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
  const updated = applySitemapLastmods(sitemap, (loc) => nextManifest[locToFile(loc)].lastmod);
  await writeFile(sitemapPath, updated);
  const changed = [...published].filter(([loc, date]) => nextManifest[locToFile(loc)].lastmod !== date).length;
  console.log(`Synced lastmod for ${Object.keys(nextManifest).length} sitemap URLs (${changed} changed).`);
}
