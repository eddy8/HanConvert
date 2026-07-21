import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPageContext, loadLocalizationData, localizeConverterHtml } from "./static-localization-lib.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://jianfan.app";
const localizationData = await loadLocalizationData(projectRoot);
const documentLanguages = { "zh-CN": "zh-CN", "zh-TW": "zh-Hant", en: "en", ja: "ja", ko: "ko" };

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(entryPath)));
    if (entry.isFile() && entry.name === "index.html") files.push(entryPath);
  }
  return files;
}

function requireMatch(html, pattern, label, file) {
  const value = html.match(pattern)?.[1];
  if (!value) throw new Error(`${file}: missing ${label}`);
  return value;
}

const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueSitemapUrls = new Set(sitemapUrls);
if (uniqueSitemapUrls.size !== sitemapUrls.length) throw new Error("sitemap.xml contains duplicate URLs");

for (const entryFile of ["app.js", "japanese-tools.js"]) {
  const source = await readFile(path.join(projectRoot, entryFile), "utf8");
  if (/from\s+["']\/[^"']+\.mjs["']/.test(source)) {
    throw new Error(`${entryFile}: local .mjs modules are not portable across hosting providers`);
  }
  if (entryFile === "app.js" && /querySelectorAll\([^\n]*data-i18n|document\.title\s*=|document\.documentElement\.lang\s*=/.test(source)) {
    throw new Error(`${entryFile}: static localization must not be rendered by JavaScript`);
  }
}

let converterPages = 0;
let standaloneToolPages = 0;
let infoPages = 0;
const canonicalUrls = new Set();

for (const htmlPath of await findHtmlFiles(projectRoot)) {
  const relativePath = path.relative(projectRoot, htmlPath);
  const html = await readFile(htmlPath, "utf8");
  const { locale } = getPageContext(relativePath);
  const documentLanguage = requireMatch(html, /<html lang="([^"]+)">/, "document language", relativePath);
  const canonical = requireMatch(html, /<link rel="canonical" href="([^"]+)" \/>/, "canonical", relativePath);

  if (documentLanguage !== documentLanguages[locale]) {
    throw new Error(`${relativePath}: expected document language ${documentLanguages[locale]}, found ${documentLanguage}`);
  }

  if (!canonical.startsWith(`${siteOrigin}/`)) throw new Error(`${relativePath}: canonical is not absolute`);
  if (canonicalUrls.has(canonical)) throw new Error(`${relativePath}: duplicate canonical ${canonical}`);
  canonicalUrls.add(canonical);
  if (!uniqueSitemapUrls.has(canonical)) throw new Error(`${relativePath}: canonical is missing from sitemap.xml`);
  if (/(?:src|href)="\/[^"]+\?(?:v|version)=/i.test(html)) {
    throw new Error(`${relativePath}: static asset URL contains a version query`);
  }
  for (const slug of ["about", "contact", "privacy"]) {
    if (!new RegExp(`href="/[^"]*${slug}/"`).test(html)) {
      throw new Error(`${relativePath}: missing ${slug} footer link`);
    }
  }

  const isConverterPage = html.includes('id="converterTitle"');
  const isStandaloneToolPage = html.includes('data-tool-page=');
  const isInfoPage = html.includes('data-info-page=');
  if (!isConverterPage && !isStandaloneToolPage && !isInfoPage) continue;
  if (isConverterPage) {
    converterPages += 1;
    if (localizeConverterHtml(html, relativePath, localizationData) !== html) {
      throw new Error(`${relativePath}: static localized content is out of sync with app.js`);
    }
  }
  if (isStandaloneToolPage) standaloneToolPages += 1;
  if (isInfoPage) infoPages += 1;

  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)" \/>/g)];
  if (alternates.length !== 6) throw new Error(`${relativePath}: expected 6 hreflang links`);
  if (alternates.some(([, , href]) => !href.startsWith(`${siteOrigin}/`))) {
    throw new Error(`${relativePath}: hreflang URL is not absolute`);
  }

  const schemaText = requireMatch(
    html,
    /<!-- seo-schema:start -->[\s\S]*?<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    "JSON-LD",
    relativePath
  );
  const schema = JSON.parse(schemaText);
  if (isInfoPage) {
    const expectedType = html.includes('data-info-page="about"') ? "AboutPage" : "ContactPage";
    const infoPage = schema["@graph"]?.find((item) => item["@type"] === expectedType);
    const organization = schema["@graph"]?.find((item) => item["@type"] === "Organization");
    if (!infoPage || infoPage.url !== canonical || organization?.email !== "admin@jianfan.app") {
      throw new Error(`${relativePath}: invalid ${expectedType} or Organization schema`);
    }
  } else {
    const webApplication = schema["@graph"]?.find((item) => item["@type"] === "WebApplication");
    if (!webApplication || webApplication.url !== canonical) {
      throw new Error(`${relativePath}: invalid WebApplication schema`);
    }
  }
  if (isConverterPage && (!html.includes('data-route="simplified-to-traditional"') || !html.includes('data-route="traditional-to-simplified"'))) {
    throw new Error(`${relativePath}: missing direction-page links`);
  }
  if (isConverterPage && (!html.includes('data-route="japanese-chinese-kanji-converter"') || !html.includes('data-route="japanese-characters"'))) {
    throw new Error(`${relativePath}: missing Japanese tool links`);
  }
  if (isStandaloneToolPage && (!html.includes("japanese-chinese-kanji-converter/") || !html.includes("japanese-characters/"))) {
    throw new Error(`${relativePath}: missing related Japanese tool links`);
  }
}

if (converterPages !== 35) throw new Error(`expected 35 converter pages, found ${converterPages}`);
if (standaloneToolPages !== 10) throw new Error(`expected 10 standalone tool pages, found ${standaloneToolPages}`);
if (infoPages !== 10) throw new Error(`expected 10 information pages, found ${infoPages}`);
if (sitemapUrls.length !== 60) throw new Error(`expected 60 sitemap URLs, found ${sitemapUrls.length}`);

console.log(`Validated ${converterPages} converter pages, ${standaloneToolPages} standalone tools, ${infoPages} information pages, and ${sitemapUrls.length} sitemap URLs.`);
