import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..");

const REQUIREMENTS = {
  converter: { h1: 1, h2: 3, paragraphs: 15, details: 2, links: 15 },
  standalone: { h1: 1, h2: 3, paragraphs: 12, details: 3, links: 6 },
  scenario: { h1: 1, h2: 4, paragraphs: 10, details: 3, links: 5 },
  hanzi: { h1: 1, h2: 4, paragraphs: 8, details: 3, links: 5 },
  info: { h1: 1, h2: 3, paragraphs: 6, links: 4 },
  privacy: { h1: 1, h2: 7, paragraphs: 9, links: 3 },
  "word-spelling": { h1: 1, h2: 4, paragraphs: 18, details: 1, links: 3 },
  "blog-index": { h1: 1, h2: 5, paragraphs: 20, articles: 10, links: 20 },
  "blog-article": { h1: 1, h2: 7, paragraphs: 20, details: 3, articles: 3, links: 20 }
};

async function findIndexPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...await findIndexPages(entryPath));
    if (entry.isFile() && entry.name === "index.html") pages.push(entryPath);
  }

  return pages;
}

function count(source, pattern) {
  return source.match(pattern)?.length || 0;
}

function contentMetrics(source) {
  return {
    h1: count(source, /<h1\b/gi),
    h2: count(source, /<h2\b/gi),
    h3: count(source, /<h3\b/gi),
    paragraphs: count(source, /<p\b/gi),
    details: count(source, /<details\b/gi),
    articles: count(source, /<article\b/gi),
    links: count(source, /<a\b[^>]*\bhref=["'][^"']+["']/gi)
  };
}

function classify(relativePath, html) {
  if (relativePath === path.join("word-spelling", "index.html")) return "word-spelling";
  if (html.includes('data-blog-page="index"')) return "blog-index";
  if (html.includes('data-blog-page="article"')) return "blog-article";
  if (/(^|\/)privacy\/index\.html$/.test(relativePath)) return "privacy";
  if (html.includes('data-pseo-page="scenario"')) return "scenario";
  if (html.includes('data-pseo-page="hanzi-')) return "hanzi";
  if (html.includes("data-info-page=")) return "info";
  if (html.includes("data-tool-page=")) return "standalone";
  if (html.includes('id="converterTitle"')) return "converter";
  return "unknown";
}

function findDeficiencies(metrics, requirements) {
  return Object.entries(requirements).flatMap(([metric, minimum]) => {
    const actual = metrics[metric] || 0;
    return actual < minimum ? [`${metric} ${actual}/${minimum}`] : [];
  });
}

export async function auditStaticContent(projectRoot = DEFAULT_PROJECT_ROOT) {
  const pages = await findIndexPages(projectRoot);
  const results = [];

  for (const pagePath of pages) {
    const relativePath = path.relative(projectRoot, pagePath);
    const html = await readFile(pagePath, "utf8");
    const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
    const category = classify(relativePath, html);
    const bodyMetrics = contentMetrics(body);
    const metrics = category === "word-spelling"
      ? bodyMetrics
      : { ...contentMetrics(main), links: bodyMetrics.links };
    const deficiencies = category === "unknown"
      ? ["unclassified page"]
      : findDeficiencies(metrics, REQUIREMENTS[category]);

    results.push({ relativePath, category, metrics, deficiencies });
  }

  return {
    results,
    findings: results.filter((result) => result.deficiencies.length > 0)
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const { results, findings } = await auditStaticContent();
  const categoryCounts = Object.groupBy(results, (result) => result.category);
  const summary = Object.entries(categoryCounts)
    .map(([category, pages]) => `${category}: ${pages.length}`)
    .join(", ");

  if (findings.length) {
    console.error(`Static content audit found ${findings.length} weak or unclassified pages.`);
    for (const finding of findings) {
      console.error(`- ${finding.relativePath}: ${finding.deficiencies.join(", ")}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Static content audit passed for ${results.length} pages (${summary}).`);
  }
}
