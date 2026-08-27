import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { HANZI_LOCALES, HANZI_PROFILES } from "../scripts/hanzi-profile-data.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const titleRanges = { "zh-CN": [22, 30], "zh-TW": [22, 30], en: [50, 65], ja: [22, 30], ko: [22, 30] };
const descriptionRanges = { "zh-CN": [65, 80], "zh-TW": [65, 80], en: [150, 160], ja: [65, 80], ko: [65, 80] };

function relativePage(locale, slug = "") {
  return path.join(HANZI_LOCALES[locale].prefix, "hanzi", slug, "index.html");
}

function publicPath(locale, slug = "") {
  return `/${HANZI_LOCALES[locale].prefix}hanzi/${slug ? `${slug}/` : ""}`;
}

function formForLocale(profile, locale) {
  if (locale === "zh-TW") return profile.forms.traditional;
  if (locale === "ja") return profile.forms.japanese;
  if (locale === "ko") return profile.forms.korean;
  return profile.forms.simplified;
}

function requireCapture(html, pattern, label) {
  const value = html.match(pattern)?.[1];
  assert.ok(value, `missing ${label}`);
  return value;
}

function schemaFromHtml(html) {
  return JSON.parse(requireCapture(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/u, "JSON-LD"));
}

test("generates a five-locale Hanzi directory and five static character profiles", async () => {
  const canonicals = new Set();
  const titles = new Set();
  let pageCount = 0;

  for (const locale of Object.keys(HANZI_LOCALES)) {
    for (const slug of ["", ...HANZI_PROFILES.map((profile) => profile.slug)]) {
      const html = await readFile(path.join(projectRoot, relativePage(locale, slug)), "utf8");
      const title = requireCapture(html, /<title>([\s\S]*?)<\/title>/u, "title").trim();
      const description = requireCapture(html, /<meta name="description" content="([^"]+)"/u, "description");
      const canonical = requireCapture(html, /<link rel="canonical" href="([^"]+)"/u, "canonical");
      const [titleMin, titleMax] = titleRanges[locale];
      const [descriptionMin, descriptionMax] = descriptionRanges[locale];
      assert.ok([...title].length >= titleMin && [...title].length <= titleMax, `${relativePage(locale, slug)} title length`);
      assert.ok([...description].length >= descriptionMin && [...description].length <= descriptionMax, `${relativePage(locale, slug)} description length`);
      assert.equal(canonical, `${origin}${publicPath(locale, slug)}`);
      assert.equal((html.match(/rel="alternate" hreflang=/gu) || []).length, 6);
      assert.equal(html.includes("?v="), false);
      assert.equal(html.includes("?version="), false);
      assert.ok(!canonicals.has(canonical), `duplicate canonical ${canonical}`);
      assert.ok(!titles.has(title), `duplicate title ${title}`);
      canonicals.add(canonical);
      titles.add(title);
      pageCount += 1;
    }
  }

  assert.equal(pageCount, 30);
});

test("writes character-specific facts, words, tools and schema into every profile", async () => {
  for (const locale of Object.keys(HANZI_LOCALES)) {
    for (const profile of HANZI_PROFILES) {
      const html = await readFile(path.join(projectRoot, relativePage(locale, profile.slug)), "utf8");
      const visibleTextSource = html.replaceAll("&#39;", "'").replaceAll("&quot;", '"').replaceAll("&amp;", "&");
      const character = formForLocale(profile, locale);
      assert.ok(html.includes(`data-pseo-page="hanzi-profile"`));
      assert.ok(html.includes(`data-character="${character}"`));
      assert.ok(html.includes(profile.localized[locale].meaning));
      for (const [word, reading, meaning] of profile.localized[locale].words) {
        assert.ok(visibleTextSource.includes(word), `${locale}/${profile.slug} missing word ${word}`);
        assert.ok(visibleTextSource.includes(reading), `${locale}/${profile.slug} missing reading ${reading}`);
        assert.ok(visibleTextSource.includes(meaning), `${locale}/${profile.slug} missing meaning ${meaning}`);
      }
      assert.ok(html.includes("chinese-character-lookup/?character="));
      assert.ok(html.includes("chinese-to-pinyin/?character="));
      assert.ok(html.includes("han-character-worksheet/?character="));
      assert.equal((html.match(/<details>/gu) || []).length, 4);

      const graph = schemaFromHtml(html)["@graph"];
      assert.ok(graph.some((item) => item["@type"] === "WebPage"));
      assert.ok(graph.some((item) => item["@type"] === "DefinedTerm" && item.name === character));
      assert.equal(graph.find((item) => item["@type"] === "FAQPage")?.mainEntity.length, 4);
      assert.equal(graph.find((item) => item["@type"] === "BreadcrumbList")?.itemListElement.length, 3);
    }
  }
});

test("keeps every Hanzi directory crawlable through hubs and the full lookup tool", async () => {
  for (const locale of Object.keys(HANZI_LOCALES)) {
    const hub = await readFile(path.join(projectRoot, relativePage(locale)), "utf8");
    assert.ok(hub.includes('data-pseo-page="hanzi-index"'));
    assert.equal((hub.match(/<details>/gu) || []).length, 3);
    for (const profile of HANZI_PROFILES) assert.ok(hub.includes(`href="${publicPath(locale, profile.slug)}"`));

    const hubGraph = schemaFromHtml(hub)["@graph"];
    assert.equal(hubGraph.find((item) => item["@type"] === "ItemList")?.numberOfItems, HANZI_PROFILES.length);

    const lookup = await readFile(path.join(projectRoot, HANZI_LOCALES[locale].prefix, "chinese-character-lookup", "index.html"), "utf8");
    assert.ok(lookup.includes(`href="${publicPath(locale)}"`));
    for (const profile of HANZI_PROFILES) assert.ok(lookup.includes(`href="${publicPath(locale, profile.slug)}"`));
  }
});

test("includes exactly 30 controlled Hanzi pSEO URLs in the sitemap", async () => {
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  const section = requireCapture(sitemap, /<!-- hanzi-profile-pseo:start -->([\s\S]*?)<!-- hanzi-profile-pseo:end -->/u, "Hanzi sitemap section");
  const locations = [...section.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
  assert.equal(locations.length, 30);
  assert.equal(new Set(locations).size, 30);
  for (const locale of Object.keys(HANZI_LOCALES)) {
    assert.ok(locations.includes(`${origin}${publicPath(locale)}`));
    for (const profile of HANZI_PROFILES) assert.ok(locations.includes(`${origin}${publicPath(locale, profile.slug)}`));
  }
});
