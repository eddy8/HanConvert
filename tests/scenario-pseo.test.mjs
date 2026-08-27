import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  SCENARIO_CATEGORY_PARENTS,
  SCENARIO_LOCALES,
  SCENARIO_PAGES
} from "../scripts/scenario-pseo-data.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const titleRanges = { "zh-CN": [22, 30], "zh-TW": [22, 30], en: [50, 65], ja: [22, 30], ko: [22, 30] };
const descriptionRanges = { "zh-CN": [65, 80], "zh-TW": [65, 80], en: [150, 160], ja: [65, 80], ko: [65, 80] };

function pagePath(locale, slug) {
  return path.join(projectRoot, SCENARIO_LOCALES[locale].prefix, slug, "index.html");
}

function publicPath(locale, slug) {
  return `/${SCENARIO_LOCALES[locale].prefix}${slug}/`;
}

function capture(html, pattern, label) {
  const value = html.match(pattern)?.[1];
  assert.ok(value, `missing ${label}`);
  return value;
}

function schemaFromHtml(html) {
  return JSON.parse(capture(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/u, "JSON-LD"));
}

test("generates 75 localized scenario pages with unique metadata and complete alternates", async () => {
  const canonicals = new Set();
  const titles = new Set();
  let count = 0;
  for (const scenario of SCENARIO_PAGES) {
    for (const locale of Object.keys(SCENARIO_LOCALES)) {
      const html = await readFile(pagePath(locale, scenario.slug), "utf8");
      const title = capture(html, /<title>([^<]+)<\/title>/u, "title");
      const description = capture(html, /<meta name="description" content="([^"]+)"/u, "description");
      const canonical = capture(html, /<link rel="canonical" href="([^"]+)"/u, "canonical");
      const [titleMin, titleMax] = titleRanges[locale];
      const [descriptionMin, descriptionMax] = descriptionRanges[locale];
      assert.ok([...title].length >= titleMin && [...title].length <= titleMax, `${scenario.slug}/${locale} title length`);
      assert.ok([...description].length >= descriptionMin && [...description].length <= descriptionMax, `${scenario.slug}/${locale} description length`);
      assert.equal(canonical, `${origin}${publicPath(locale, scenario.slug)}`);
      assert.equal((html.match(/rel="alternate" hreflang=/gu) || []).length, 6);
      assert.equal(html.includes("?v="), false);
      assert.equal(html.includes("?version="), false);
      assert.ok(!canonicals.has(canonical), `duplicate canonical ${canonical}`);
      assert.ok(!titles.has(title), `duplicate title ${title}`);
      canonicals.add(canonical);
      titles.add(title);
      count += 1;
    }
  }
  assert.equal(count, 75);
});

test("writes useful static guidance, tool presets, sibling links, and schema", async () => {
  for (const scenario of SCENARIO_PAGES) {
    for (const locale of Object.keys(SCENARIO_LOCALES)) {
      const html = await readFile(pagePath(locale, scenario.slug), "utf8");
      const page = scenario.localized[locale];
      assert.ok(html.includes('data-pseo-page="scenario"'));
      assert.ok(html.includes(`data-scenario-category="${scenario.category}"`));
      assert.ok(html.includes(page.name));
      assert.ok(html.includes(page.specific.replaceAll("&", "&amp;").replaceAll("'", "&#39;")));
      assert.ok(html.includes(`${scenario.tool}/${scenario.query.split("#")[0].replaceAll("&", "&amp;")}`));
      assert.equal((html.match(/<details(?:\s|>)/gu) || []).length, 4);
      for (const sibling of SCENARIO_PAGES.filter((item) => item.category === scenario.category && item.slug !== scenario.slug)) {
        assert.ok(html.includes(`href="${publicPath(locale, sibling.slug)}"`));
      }
      const graph = schemaFromHtml(html)["@graph"];
      assert.ok(graph.some((item) => item["@type"] === "WebPage"));
      assert.equal(graph.find((item) => item["@type"] === "BreadcrumbList")?.itemListElement.length, 3);
      assert.equal(graph.find((item) => item["@type"] === "HowTo")?.step.length, 3);
      assert.equal(graph.find((item) => item["@type"] === "FAQPage")?.mainEntity.length, 3);
    }
  }
});

test("keeps every scenario crawlable from its localized parent tool page", async () => {
  for (const [locale, metadata] of Object.entries(SCENARIO_LOCALES)) {
    for (const [category, parent] of Object.entries(SCENARIO_CATEGORY_PARENTS)) {
      const html = await readFile(path.join(projectRoot, metadata.prefix, parent, "index.html"), "utf8");
      assert.equal((html.match(/<!-- scenario-pseo-links:start -->/gu) || []).length, 1);
      for (const scenario of SCENARIO_PAGES.filter((item) => item.category === category)) {
        assert.ok(html.includes(`href="${publicPath(locale, scenario.slug)}"`));
      }
    }
  }
});

test("adds exactly 75 scenario URLs to the sitemap", async () => {
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  const section = capture(sitemap, /<!-- scenario-pseo:start -->([\s\S]*?)<!-- scenario-pseo:end -->/u, "scenario sitemap section");
  const locations = [...section.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
  assert.equal(locations.length, 75);
  assert.equal(new Set(locations).size, 75);
  for (const scenario of SCENARIO_PAGES) {
    for (const locale of Object.keys(SCENARIO_LOCALES)) {
      assert.ok(locations.includes(`${origin}${publicPath(locale, scenario.slug)}`));
    }
  }
});

test("supports scenario query presets in the shared tools", async () => {
  const worksheet = await readFile(path.join(projectRoot, "han-character-worksheet.js"), "utf8");
  const japanese = await readFile(path.join(projectRoot, "japanese-tools.js"), "utf8");
  for (const key of ["grid", "trace", "pinyin", "strokes"]) assert.ok(worksheet.includes(`get("${key}")`));
  assert.ok(japanese.includes('get("source")'));
  assert.ok(japanese.includes("requestedButton"));
});
