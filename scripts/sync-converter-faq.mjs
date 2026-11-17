// Renders the answer-first FAQ (scripts/converter-faq-data.mjs) into the Simplified/Traditional converter
// pages and keeps a matching FAQPage node in each page's seo-schema JSON-LD block.
//   node scripts/sync-converter-faq.mjs           write pages
//   node scripts/sync-converter-faq.mjs --check   fail if any page is out of sync
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildFaqSchemaNode, buildFaqSection, converterFaqPages, FAQ_MARKER_END, FAQ_MARKER_START } from "./converter-faq-lib.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const schemaPattern = /(<!-- seo-schema:start -->\n    <script type="application\/ld\+json">\n)([\s\S]*?)(\n    <\/script>\n    <!-- seo-schema:end -->)/;
const blockPattern = new RegExp(`${FAQ_MARKER_START.trim()}[\\s\\S]*?${FAQ_MARKER_END.trim()}`);

function syncSection(html, section, file) {
  if (blockPattern.test(html)) return html.replace(new RegExp(`      ${blockPattern.source}`), section);
  const anchor = html.includes("      <!-- blog-guide-links:start -->") ? "      <!-- blog-guide-links:start -->" : "    </main>";
  if (!html.includes(anchor)) throw new Error(`${file}: no FAQ insertion point`);
  return html.replace(anchor, `${section}\n${anchor}`);
}

function syncSchema(html, node, file) {
  const match = html.match(schemaPattern);
  if (!match) throw new Error(`${file}: missing seo-schema block`);
  const schema = JSON.parse(match[2]);
  const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : null;
  if (!graph) throw new Error(`${file}: seo-schema block has no @graph`);
  schema["@graph"] = [...graph.filter((entry) => entry["@type"] !== "FAQPage"), node];
  const formatted = JSON.stringify(schema, null, 2)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
  return html.replace(schemaPattern, `$1${formatted}$3`);
}

const stale = [];
for (const page of converterFaqPages()) {
  const filePath = path.join(projectRoot, page.file);
  const html = await readFile(filePath, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== page.canonical) throw new Error(`${page.file}: canonical ${canonical} does not match ${page.canonical}`);
  if (!page.faq) throw new Error(`${page.file}: missing FAQ content for ${page.locale}`);
  const output = syncSchema(syncSection(html, buildFaqSection(page.faq), page.file), buildFaqSchemaNode(page.canonical, page.faq), page.file);
  if (output === html) continue;
  if (checkOnly) stale.push(page.file);
  else await writeFile(filePath, output);
}

if (checkOnly && stale.length) throw new Error(`Converter FAQ is out of sync; run node scripts/sync-converter-faq.mjs\n${stale.join("\n")}`);
console.log(`${checkOnly ? "Checked" : "Synced"} converter FAQ on ${converterFaqPages().length} pages.`);
