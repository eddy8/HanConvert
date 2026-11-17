import assert from "node:assert/strict";
import test from "node:test";

import {
  applySitemapLastmods,
  indexableContentHash,
  locToFile,
  preserveExistingLastmods,
  readSitemapLastmods
} from "../scripts/sitemap-lastmod.mjs";

const page = (main, { title = "简体转繁体 | JianFan.app", description = "免费简体转繁体", footer = "" } = {}) =>
  `<html><head><title>${title}</title><meta name="description" content="${description}" /></head>` +
  `<body><nav><a href="/">首页</a></nav><main><h1>标题</h1><p>${main}</p><script>var x = 1;</script></main>${footer}</body></html>`;

test("content hash changes with title, description, or main text", () => {
  const base = indexableContentHash(page("正文"));
  assert.notEqual(indexableContentHash(page("新正文")), base);
  assert.notEqual(indexableContentHash(page("正文", { title: "繁体转简体 | JianFan.app" })), base);
  assert.notEqual(indexableContentHash(page("正文", { description: "新的描述" })), base);
});

test("content hash ignores footer, scripts, and markup-only changes", () => {
  const base = indexableContentHash(page("正文"));
  assert.equal(indexableContentHash(page("正文", { footer: "<footer><a href=\"/about/\">关于</a></footer>" })), base);
  assert.equal(indexableContentHash(page("正文").replace("var x = 1;", "var x = 2;")), base);
  assert.equal(indexableContentHash(page("正文").replace("<p>正文</p>", "<p class=\"lead\">\n  正文\n</p>")), base);
});

test("maps sitemap URLs to their static files", () => {
  assert.equal(locToFile("https://jianfan.app/"), "index.html");
  assert.equal(locToFile("https://jianfan.app/zh-tw/simplified-to-traditional/"), "zh-tw/simplified-to-traditional/index.html");
  assert.throws(() => locToFile("https://example.com/"));
});

test("regenerated sitemap sections keep the published lastmod", () => {
  const published = "<url>\n  <loc>https://jianfan.app/blog/</loc>\n  <lastmod>2026-11-17</lastmod>\n</url>";
  const regenerated = "<url>\n  <loc>https://jianfan.app/blog/</loc>\n  <lastmod>2026-08-29</lastmod>\n</url>\n<url>\n  <loc>https://jianfan.app/new/</loc>\n  <lastmod>2026-12-01</lastmod>\n</url>";
  const result = readSitemapLastmods(preserveExistingLastmods(published, regenerated));
  assert.equal(result.get("https://jianfan.app/blog/"), "2026-11-17");
  assert.equal(result.get("https://jianfan.app/new/"), "2026-12-01");
  assert.equal(readSitemapLastmods(applySitemapLastmods(published, () => "2026-01-02")).get("https://jianfan.app/blog/"), "2026-01-02");
});
