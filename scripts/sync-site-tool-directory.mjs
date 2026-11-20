// Writes site-wide internal links into every page:
// - the categorized tool directory (scripts/site-tool-directory-data.mjs): at the top of the site
//   footer on tool pages, and as a section right below the converter on the five home pages;
// - in-copy links where a page's text sends the reader to another tool
//   (scripts/contextual-tool-links-data.mjs).
// Usage: node scripts/sync-site-tool-directory.mjs [--check]
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contextualToolLinks } from "./contextual-tool-links-data.mjs";
import { directoryLocales, directoryMarkerEnd, directoryMarkerStart } from "./site-tool-directory-data.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const localePrefixes = { "zh-tw": "zh-TW", en: "en", ja: "ja", ko: "ko" };
const blockPattern = /[ \t]*<!-- site-tool-directory:start -->[\s\S]*?<!-- site-tool-directory:end -->\n?/g;

async function findPages(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "scripts", "tests", "vendor", ".seo-data", ".claude"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findPages(entryPath)));
    else if (entry.name === "index.html") files.push(entryPath);
  }
  return files;
}

export function pageContext(relativePath) {
  const segments = relativePath.split(/[\\/]/);
  const locale = localePrefixes[segments[0]] || "zh-CN";
  if (locale !== "zh-CN") segments.shift();
  segments.pop();
  return { locale, slug: segments.join("/"), isHome: segments.length === 0 };
}

export function buildDirectory(locale, currentSlug, indent) {
  const content = directoryLocales[locale];
  const pad = (depth) => indent + "  ".repeat(depth);
  const groups = content.groups.map(([title, links]) => [
    `${pad(1)}<div class="site-directory-group">`,
    `${pad(2)}<p class="site-directory-title">${title}</p>`,
    `${pad(2)}<ul>`,
    ...links.map(([slug, label]) => {
      const current = slug === currentSlug ? ' aria-current="page"' : "";
      return `${pad(3)}<li><a href="/${content.prefix}${slug}${slug ? "/" : ""}"${current}>${label}</a></li>`;
    }),
    `${pad(2)}</ul>`,
    `${pad(1)}</div>`
  ].join("\n"));
  return [
    `${indent}${directoryMarkerStart}`,
    `${indent}<nav class="site-directory" aria-label="${content.label}">`,
    ...groups,
    `${indent}</nav>`,
    `${indent}${directoryMarkerEnd}`
  ].join("\n");
}

function buildHomeSection(locale) {
  const content = directoryLocales[locale];
  const indent = "      ";
  return [
    `${indent}${directoryMarkerStart}`,
    `${indent}<section class="site-directory-band" aria-labelledby="siteDirectoryTitle">`,
    `${indent}  <h2 id="siteDirectoryTitle">${content.homeHeading}</h2>`,
    buildDirectory(locale, "", `${indent}  `).split("\n").slice(1, -1).join("\n"),
    `${indent}</section>`,
    `${indent}${directoryMarkerEnd}`
  ].join("\n");
}

export function applyDirectory(source, relativePath) {
  const { locale, slug, isHome } = pageContext(relativePath);
  const html = source.replace(blockPattern, "");
  if (isHome) {
    const anchor = /(\n[ \t]*<\/section>\n)(\n[ \t]*<section class="feature-band")/;
    if (!anchor.test(html)) throw new Error(`Missing converter section end in ${relativePath}`);
    return html.replace(anchor, `$1${buildHomeSection(locale)}\n$2`);
  }
  // Some generators write the whole footer on one line; the directory then opens its own lines.
  const footer = /^([ \t]*)(.*?<footer class="site-footer">)(\n?)/m;
  if (!footer.test(html)) return null;
  return html.replace(footer, (match, indent, opening, newline) => {
    const block = buildDirectory(locale, slug, `${indent}  `);
    return `${indent}${opening}\n${block}\n${newline ? "" : `${indent}  `}`;
  });
}

const contextualRules = new Map();
for (const [page, fragment, words, target] of contextualToolLinks) {
  const key = `${page ? `${page}/` : ""}index.html`;
  if (!contextualRules.has(key)) contextualRules.set(key, new Map());
  const fragments = contextualRules.get(key);
  if (!fragments.has(fragment)) fragments.set(fragment, []);
  fragments.get(fragment).push([words, target]);
}

function countOccurrences(text, value) {
  return text.split(value).length - 1;
}

// Links the first occurrence of each listed fragment inside <main>. Throws when a fragment is missing or sits in
// copy that app.js re-renders (data-i18n), so a stale rule is caught instead of silently skipped.
export function applyContextualLinks(source, relativePath) {
  const fragments = contextualRules.get(relativePath.split(path.sep).join("/"));
  if (!fragments) return source;
  const { locale } = pageContext(relativePath);
  const prefix = directoryLocales[locale].prefix;
  let html = source;
  for (const [fragment, links] of fragments) {
    let linked = fragment;
    for (const [words, target] of links) {
      if (countOccurrences(linked, words) !== 1) throw new Error(`${relativePath}: "${words}" must appear once in "${fragment}"`);
      linked = linked.replace(words, `<a href="/${prefix}${target}/">${words}</a>`);
    }
    const start = html.indexOf("<main");
    const end = html.indexOf("</main>");
    const main = html.slice(start, end).replace(/<script[\s\S]*?<\/script>/g, (script) => " ".repeat(script.length));
    if (main.includes(linked)) continue;
    if (!main.includes(fragment)) throw new Error(`${relativePath}: "${fragment}" is missing from <main>`);
    const index = start + main.indexOf(fragment);
    const before = html.slice(Math.max(0, index - 4000), index);
    const block = [...before.matchAll(/<(p|li|summary|dd|td|h[1-6])\b[^>]*>/g)].at(-1);
    if (!block) throw new Error(`${relativePath}: "${fragment}" is not inside a text block`);
    if (/data-i18n/.test(block[0])) throw new Error(`${relativePath}: "${fragment}" is in data-i18n copy`);
    const blockText = before.slice(block.index);
    if (countOccurrences(blockText, "<a ") > countOccurrences(blockText, "</a>")) {
      throw new Error(`${relativePath}: "${fragment}" is already inside a link`);
    }
    html = html.slice(0, index) + linked + html.slice(index + fragment.length);
  }
  return html;
}

export function applySiteLinks(source, relativePath) {
  const withDirectory = applyDirectory(source, relativePath);
  return withDirectory === null ? null : applyContextualLinks(withDirectory, relativePath);
}

// For generators: adds the site links to a page they are about to write or check. Other files pass through.
export function withSiteDirectory(html, filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  if (path.basename(relativePath) !== "index.html" || relativePath.startsWith("..")) return html;
  return applySiteLinks(html, relativePath) ?? html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const stale = [];
  let updated = 0;
  const pages = [...(await findPages(projectRoot)), path.join(projectRoot, "404.html")];
  for (const filePath of pages) {
    const relativePath = path.relative(projectRoot, filePath);
    const source = await readFile(filePath, "utf8");
    const next = applySiteLinks(source, relativePath === "404.html" ? "404/index.html" : relativePath);
    if (next === null || next === source) continue;
    if (checkOnly) stale.push(path.relative(projectRoot, filePath));
    else {
      await writeFile(filePath, next);
      updated += 1;
    }
  }
  if (checkOnly) {
    if (stale.length) {
      console.error(`Site tool directory is missing or stale on ${stale.length} pages, e.g. ${stale.slice(0, 5).join(", ")}. Run node scripts/sync-site-tool-directory.mjs.`);
      process.exit(1);
    }
    console.log("Site tool directory is up to date.");
  } else {
    console.log(`Updated the site tool directory on ${updated} pages.`);
  }
}
