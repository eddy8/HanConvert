import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";
import { directoryLocales } from "../scripts/site-tool-directory-data.mjs";
import { applyDirectory, pageContext } from "../scripts/sync-site-tool-directory.mjs";

const run = promisify(execFile);
const root = new URL("../", import.meta.url);

test("every page carries the current site tool directory", async () => {
  const { stdout } = await run(process.execPath, ["scripts/sync-site-tool-directory.mjs", "--check"], { cwd: root });
  assert.match(stdout, /up to date/);
});

test("directory links point to existing pages in the same locale", async () => {
  for (const [locale, content] of Object.entries(directoryLocales)) {
    const slugs = content.groups.flatMap(([, links]) => links.map(([slug]) => slug));
    assert.equal(new Set(slugs).size, slugs.length, `${locale} has duplicate links`);
    assert.equal(slugs[0], "", `${locale} must link the home page first`);
    for (const slug of slugs) {
      await access(new URL(`${content.prefix}${slug}${slug ? "/" : ""}index.html`, root));
    }
  }
});

test("every locale lists the same tools", () => {
  const sets = Object.values(directoryLocales).map((content) =>
    content.groups.flatMap(([, links]) => links.map(([slug]) => slug)).sort().join(",")
  );
  assert.equal(new Set(sets).size, 1);
});

test("home pages show the directory below the converter, not in the footer", async () => {
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    const html = await readFile(new URL(`${prefix}index.html`, root), "utf8");
    const directory = html.indexOf('<section class="site-directory-band"');
    assert.ok(directory > html.indexOf('id="converterTitle"'), prefix || "zh-CN");
    assert.ok(directory < html.indexOf('<section class="feature-band"'), prefix || "zh-CN");
    assert.doesNotMatch(html.slice(html.indexOf('<footer class="site-footer">')), /site-directory/);
    assert.match(html, new RegExp(`<a href="/${prefix}" aria-current="page">`));
  }
});

test("tool pages link the home page with the converter keyword and mark the current tool", async () => {
  const html = await readFile(new URL("ja/japanese-handwriting-recognition/index.html", root), "utf8");
  const footer = html.slice(html.indexOf('<footer class="site-footer">'));
  assert.match(footer, /<a href="\/ja\/">簡体字 繁体字 変換<\/a>/);
  assert.match(footer, /<a href="\/ja\/japanese-handwriting-recognition\/" aria-current="page">手書き漢字検索<\/a>/);
});

test("the sync is idempotent and splits one-line footers", () => {
  const page = '<main></main>\n    <footer class="site-footer"><p>x</p></footer>\n';
  const once = applyDirectory(page, "en/kanji-to-romaji/index.html");
  assert.equal(applyDirectory(once, "en/kanji-to-romaji/index.html"), once);
  assert.match(once, /<footer class="site-footer">\n      <!-- site-tool-directory:start -->/);
  assert.match(once, /aria-current="page">Kanji to Romaji</);
  assert.deepEqual(pageContext("zh-tw/index.html"), { locale: "zh-TW", slug: "", isHome: true });
});

test("in-copy tool mentions link to the tool they name", async () => {
  const { contextualToolLinks } = await import("../scripts/contextual-tool-links-data.mjs");
  for (const [page, , words, target] of contextualToolLinks) {
    const prefix = page.match(/^(zh-tw|en|ja|ko)\//)?.[0] ?? "";
    await access(new URL(`${prefix}${target}/index.html`, root));
    const html = await readFile(new URL(`${page}/index.html`, root), "utf8");
    assert.ok(html.includes(`<a href="/${prefix}${target}/">${words}</a>`), `${page} → ${target}`);
  }
});

test("adding an in-copy link does not move the sitemap lastmod", async () => {
  const { indexableContentHash } = await import("../scripts/sitemap-lastmod.mjs");
  const plain = "<main><p>粘贴到繁体转简体工具即可。</p></main>";
  const linked = '<main><p>粘贴到<a href="/traditional-to-simplified/">繁体转简体工具</a>即可。</p></main>';
  assert.equal(indexableContentHash(linked), indexableContentHash(plain));
});
