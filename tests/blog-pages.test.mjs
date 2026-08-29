import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { BLOG_ARTICLES, BLOG_INDEX, BLOG_PUBLISHED_DATE } from "../scripts/blog-data.mjs";
import {
  getMetadataLengthRange,
  SEO_TITLE_SUFFIX,
  visibleMetadataLength,
  visibleTitleContentLength
} from "../scripts/seo-metadata-rules.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";

function capture(html, pattern, label) {
  const value = html.match(pattern)?.[1];
  assert.ok(value, `missing ${label}`);
  return value;
}

function schemaFromHtml(html) {
  return JSON.parse(capture(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/u, "JSON-LD"));
}

function articlePath(slug) {
  return path.join(projectRoot, "blog", slug, "index.html");
}

test("generates a crawlable blog index with eight editorial guides", async () => {
  const html = await readFile(path.join(projectRoot, "blog", "index.html"), "utf8");
  const graph = schemaFromHtml(html)["@graph"];
  const collectionPage = graph.find((item) => item["@type"] === "CollectionPage");
  const itemList = graph.find((item) => item["@type"] === "ItemList");

  assert.ok(html.includes('data-blog-page="index"'));
  assert.ok(html.includes(`<h1 id="pageTitle">${BLOG_INDEX.heading}</h1>`));
  assert.equal(collectionPage?.url, `${origin}/blog/`);
  assert.equal(collectionPage?.description, BLOG_INDEX.description);
  assert.equal(itemList?.numberOfItems, BLOG_ARTICLES.length);
  assert.equal(itemList?.itemListElement.length, BLOG_ARTICLES.length);

  for (const article of BLOG_ARTICLES) {
    assert.ok(html.includes(`href="/blog/${article.slug}/"`), `blog index link to ${article.slug}`);
  }
});

test("keeps every article metadata, visible copy and structured data aligned", async () => {
  const [titleMin, titleMax] = getMetadataLengthRange("zh-CN", "title");
  const [descriptionMin, descriptionMax] = getMetadataLengthRange("zh-CN", "description");

  for (const article of BLOG_ARTICLES) {
    const html = await readFile(articlePath(article.slug), "utf8");
    const title = capture(html, /<title>([^<]+)<\/title>/u, `${article.slug} title`);
    const description = capture(html, /<meta name="description" content="([^"]+)"/u, `${article.slug} description`);
    const canonical = `${origin}/blog/${article.slug}/`;
    const graph = schemaFromHtml(html)["@graph"];
    const webPage = graph.find((item) => item["@type"] === "WebPage");
    const blogPosting = graph.find((item) => item["@type"] === "BlogPosting");
    const faqPage = graph.find((item) => item["@type"] === "FAQPage");
    const breadcrumb = graph.find((item) => item["@type"] === "BreadcrumbList");

    assert.equal(title, article.title);
    assert.ok(title.endsWith(SEO_TITLE_SUFFIX));
    assert.ok(visibleTitleContentLength(title) >= titleMin && visibleTitleContentLength(title) <= titleMax);
    assert.ok(visibleMetadataLength(title) <= 90);
    assert.equal(description, article.description);
    assert.ok(visibleMetadataLength(description) >= descriptionMin && visibleMetadataLength(description) <= descriptionMax);
    assert.ok(html.includes(`<h1 id="pageTitle">${article.heading}</h1>`));
    assert.ok(html.includes(`<time datetime="${BLOG_PUBLISHED_DATE}">`));
    assert.equal((html.match(/rel="alternate" hreflang=/gu) || []).length, 2);
    assert.ok(html.includes(`<link rel="alternate" hreflang="zh-Hans" href="${canonical}" />`));
    assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${canonical}" />`));
    assert.equal(html.includes("?v="), false);
    assert.equal(html.includes("?version="), false);

    assert.equal(webPage?.url, canonical);
    assert.equal(webPage?.name, article.heading);
    assert.equal(webPage?.description, article.description);
    assert.equal(blogPosting?.url, canonical);
    assert.equal(blogPosting?.headline, article.heading);
    assert.equal(blogPosting?.datePublished, BLOG_PUBLISHED_DATE);
    assert.equal(blogPosting?.dateModified, BLOG_PUBLISHED_DATE);
    assert.equal(faqPage?.mainEntity.length, article.faqs.length);
    assert.equal(breadcrumb?.itemListElement.at(-1)?.name, article.heading);

    for (const tool of article.tools) assert.ok(html.includes(`href="${tool.href}"`), `${article.slug} tool ${tool.href}`);
    for (const relatedSlug of article.related) {
      assert.ok(html.includes(`href="/blog/${relatedSlug}/"`), `${article.slug} related article ${relatedSlug}`);
    }
    for (const [question] of article.faqs) assert.ok(html.includes(`<summary>${question}</summary>`));
  }
});

test("adds bidirectional tool links without duplicating generated markers", async () => {
  for (const article of BLOG_ARTICLES) {
    const primaryToolPath = article.tools[0].href.replace(/^\//u, "");
    const html = await readFile(path.join(projectRoot, primaryToolPath, "index.html"), "utf8");
    assert.equal((html.match(/<!-- blog-guide-links:start -->/gu) || []).length, 1, primaryToolPath);
    assert.equal((html.match(/<!-- blog-guide-links:end -->/gu) || []).length, 1, primaryToolPath);
    assert.ok(html.includes(`href="/blog/${article.slug}/"`), `${primaryToolPath} guide link`);
  }

  const home = await readFile(path.join(projectRoot, "index.html"), "utf8");
  assert.equal((home.match(/<!-- blog-home-link:start -->/gu) || []).length, 1);
  assert.ok(home.includes('href="/blog/"'));
});

test("adds exactly nine unique blog URLs to the sitemap", async () => {
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  const section = capture(sitemap, /<!-- blog:start -->([\s\S]*?)<!-- blog:end -->/u, "blog sitemap section");
  const locations = [...section.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
  const expected = [`${origin}/blog/`, ...BLOG_ARTICLES.map((article) => `${origin}/blog/${article.slug}/`)];

  assert.deepEqual(locations, expected);
  assert.equal(new Set(locations).size, 9);
  assert.equal((section.match(/hreflang="zh-Hans"/gu) || []).length, 9);
  assert.equal((section.match(/hreflang="x-default"/gu) || []).length, 9);
});
