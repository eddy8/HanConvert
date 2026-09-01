import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SCENARIO_CATEGORY_PARENTS,
  SCENARIO_LOCALES,
  SCENARIO_PAGES,
  SCENARIO_UI
} from "./scenario-pseo-data.mjs";
import { buildScenarioCluster } from "./scenario-pseo-links.mjs";
import { getMetadataLengthRange, visibleMetadataLength } from "./seo-metadata-rules.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const sitemapMarkerStart = "  <!-- scenario-pseo:start -->";
const sitemapMarkerEnd = "  <!-- scenario-pseo:end -->";
const parentMarkerPattern = /\s*<!-- scenario-pseo-links:start -->[\s\S]*?<!-- scenario-pseo-links:end -->\s*/u;
const lastModified = "2026-08-27";

const categoryLabels = Object.freeze({
  "zh-CN": Object.freeze({ file: "文件处理", kanji: "中日字形转换", worksheet: "练习纸制作", specific: "场景要点" }),
  "zh-TW": Object.freeze({ file: "檔案處理", kanji: "日中字形轉換", worksheet: "練習紙製作", specific: "情境重點" }),
  en: Object.freeze({ file: "File processing", kanji: "Chinese-Japanese glyph conversion", worksheet: "Worksheet creation", specific: "Task-specific guidance" }),
  ja: Object.freeze({ file: "ファイル処理", kanji: "日中漢字の字形変換", worksheet: "練習プリント作成", specific: "用途別のポイント" }),
  ko: Object.freeze({ file: "파일 처리", kanji: "일본·중국 한자 변환", worksheet: "연습지 만들기", specific: "작업별 핵심 안내" })
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function route(locale, slug) {
  return `/${SCENARIO_LOCALES[locale].prefix}${slug}/`;
}

function canonicalUrl(locale, slug) {
  return `${origin}${route(locale, slug)}`;
}

function toolUrl(locale, scenario) {
  return `/${SCENARIO_LOCALES[locale].prefix}${scenario.tool}/${scenario.query}`;
}

function assertSeoLength(locale, page, scenario) {
  const descriptionLength = visibleMetadataLength(page.description);
  const [descriptionMin, descriptionMax] = getMetadataLengthRange(locale, "description");
  if (descriptionLength < descriptionMin || descriptionLength > descriptionMax) {
    throw new Error(`${locale}/${scenario.slug}: description length ${descriptionLength} is outside ${descriptionMin}-${descriptionMax}`);
  }
}

function alternates(slug, tagName = "link") {
  const attribute = tagName === "link" ? "href" : "href";
  const indent = tagName === "link" ? "    " : "    ";
  const lines = Object.entries(SCENARIO_LOCALES).map(([locale, metadata]) => (
    `${indent}<${tagName} rel="alternate" hreflang="${metadata.hreflang}" ${attribute}="${canonicalUrl(locale, slug)}" />`
  ));
  lines.push(`${indent}<${tagName} rel="alternate" hreflang="x-default" ${attribute}="${canonicalUrl("zh-CN", slug)}" />`);
  return lines.join("\n");
}

function faqItems(locale, scenario) {
  const ui = SCENARIO_UI[locale];
  const page = scenario.localized[locale];
  return [
    [page.question, page.answer],
    [ui.privacyQ, ui.privacyA],
    [ui.toolQ, ui.toolA]
  ];
}

function buildSchema(locale, scenario) {
  const page = scenario.localized[locale];
  const ui = SCENARIO_UI[locale];
  const url = canonicalUrl(locale, scenario.slug);
  const parentUrl = `${origin}/${SCENARIO_LOCALES[locale].prefix}${SCENARIO_CATEGORY_PARENTS[scenario.category]}/`;
  const faqs = faqItems(locale, scenario);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        name: page.title,
        url,
        description: page.description,
        inLanguage: SCENARIO_LOCALES[locale].lang,
        isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` },
        primaryImageOfPage: undefined
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.home, item: `${origin}/${SCENARIO_LOCALES[locale].prefix}` },
          { "@type": "ListItem", position: 2, name: categoryLabels[locale][scenario.category], item: parentUrl },
          { "@type": "ListItem", position: 3, name: page.name, item: url }
        ]
      },
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: page.name,
        description: page.lede,
        step: ui.steps[scenario.category].map((text, index) => ({ "@type": "HowToStep", position: index + 1, text }))
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer }
        }))
      }
    ]
  };
}

function buildLanguageMenu(locale, scenario) {
  const ui = SCENARIO_UI[locale];
  const links = Object.entries(SCENARIO_LOCALES).map(([targetLocale, metadata]) => {
    const current = targetLocale === locale ? ' aria-current="page"' : "";
    return `<a href="${route(targetLocale, scenario.slug)}" hreflang="${metadata.hreflang}"${current}>${metadata.label}</a>`;
  }).join("");
  return `<details class="hanzi-language-menu"><summary>${ui.language}: ${SCENARIO_LOCALES[locale].label}</summary><div>${links}</div></details>`;
}

function buildSiblingLinks(locale, scenario) {
  const prefix = SCENARIO_LOCALES[locale].prefix;
  return SCENARIO_PAGES.filter((item) => item.category === scenario.category && item.slug !== scenario.slug).map((item) => (
    `          <a href="/${prefix}${item.slug}/"><span>${escapeHtml(item.localized[locale].name)}</span><small>${escapeHtml(item.badge)}</small></a>`
  )).join("\n");
}

function buildPage(locale, scenario) {
  const metadata = SCENARIO_LOCALES[locale];
  const ui = SCENARIO_UI[locale];
  const page = scenario.localized[locale];
  const canonical = canonicalUrl(locale, scenario.slug);
  const parentRoute = `/${metadata.prefix}${SCENARIO_CATEGORY_PARENTS[scenario.category]}/`;
  const faqs = faqItems(locale, scenario);
  const schema = JSON.stringify(buildSchema(locale, scenario), (key, value) => value === undefined ? undefined : value, 2);
  const toolLink = escapeHtml(toolUrl(locale, scenario));
  return `<!doctype html>
<html lang="${metadata.lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
${alternates(scenario.slug)}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="JianFan.app" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/styles.min.css" />
    <!-- seo-schema:start -->
    <script type="application/ld+json">${schema}</script>
    <!-- seo-schema:end -->
  </head>
  <body data-pseo-page="scenario" data-scenario-category="${scenario.category}" data-scenario-slug="${scenario.slug}" data-locale="${locale}">
    <a class="skip-nav" href="#main">${ui.skip}</a>
    <header class="site-header" aria-label="${ui.nav}">
      <a class="brand" href="/${metadata.prefix}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">字</span><span class="brand-text">JianFan.app</span></a>
      <nav class="top-actions" aria-label="${ui.nav}"><a class="nav-link" href="/${metadata.prefix}">${ui.home}</a>${buildLanguageMenu(locale, scenario)}</nav>
    </header>
    <main id="main" class="scenario-page-main">
      <nav class="hanzi-breadcrumb" aria-label="${ui.breadcrumb}"><a href="/${metadata.prefix}">${ui.home}</a><span aria-hidden="true">/</span><a href="${parentRoute}">${categoryLabels[locale][scenario.category]}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(page.name)}</span></nav>
      <section class="scenario-hero" aria-labelledby="pageTitle">
        <div class="scenario-hero-copy"><p class="section-kicker">${categoryLabels[locale][scenario.category]}</p><h1 id="pageTitle">${escapeHtml(page.name)}</h1><p>${escapeHtml(page.lede)}</p><div class="scenario-hero-actions"><a class="primary-action" href="${toolLink}">${ui.openTool}</a><a class="text-button" href="#scenarioGuide">${ui.overview}</a></div></div>
        <div class="scenario-format-mark" aria-hidden="true"><span>${escapeHtml(scenario.badge)}</span><i></i><i></i><i></i></div>
      </section>
      <section class="scenario-guide" id="scenarioGuide" aria-labelledby="scenarioGuideTitle">
        <div class="section-heading"><p class="section-kicker">${categoryLabels[locale].specific}</p><h2 id="scenarioGuideTitle">${ui.overview}</h2></div>
        <div class="scenario-fact-grid">
          <article><span>01</span><h3>${escapeHtml(page.name)}</h3><p>${escapeHtml(page.specific)}</p></article>
          <article><span>02</span><h3>${ui.localTitle}</h3><p>${ui.localBody}</p></article>
          <article><span>03</span><h3>${ui.boundaryTitle}</h3><p>${escapeHtml(page.limit)}</p></article>
        </div>
        <a class="scenario-tool-banner" href="${toolLink}"><span>${escapeHtml(page.name)}</span><strong>${ui.openTool} →</strong></a>
      </section>
      <section class="scenario-how" aria-labelledby="scenarioHowTitle"><div class="section-heading"><p class="section-kicker">01 / 02 / 03</p><h2 id="scenarioHowTitle">${ui.howTitle}</h2></div><ol>
${ui.steps[scenario.category].map((step) => `          <li>${escapeHtml(step)}</li>`).join("\n")}
        </ol></section>
      <section class="scenario-faq" aria-labelledby="scenarioFaqTitle"><div class="section-heading"><p class="section-kicker">FAQ</p><h2 id="scenarioFaqTitle">${ui.faqTitle}</h2></div>
${faqs.map(([question, answer]) => `        <details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("\n")}
      </section>
      <section class="scenario-related" aria-labelledby="scenarioRelatedTitle"><div class="section-heading"><p class="section-kicker">MORE</p><h2 id="scenarioRelatedTitle">${ui.related}</h2></div><nav class="scenario-cluster-links" aria-label="${ui.related}">
${buildSiblingLinks(locale, scenario)}
        </nav></section>
    </main>
    <footer class="site-footer"><p>${ui.footerText}</p><nav class="footer-links" aria-label="${ui.footer}"><a href="/${metadata.prefix}about/">${ui.about}</a><a href="/${metadata.prefix}contact/">${ui.contact}</a><a href="/${metadata.prefix}privacy/">${ui.privacy}</a></nav></footer>
  </body>
</html>
`;
}

function sitemapAlternates(scenario) {
  const lines = Object.entries(SCENARIO_LOCALES).map(([locale, metadata]) => (
    `    <xhtml:link rel="alternate" hreflang="${metadata.hreflang}" href="${canonicalUrl(locale, scenario.slug)}" />`
  ));
  lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl("zh-CN", scenario.slug)}" />`);
  return lines.join("\n");
}

function buildSitemapSection() {
  const entries = [];
  for (const scenario of SCENARIO_PAGES) {
    for (const locale of Object.keys(SCENARIO_LOCALES)) {
      entries.push(`  <url>
    <loc>${canonicalUrl(locale, scenario.slug)}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${sitemapAlternates(scenario)}
  </url>`);
    }
  }
  return `${sitemapMarkerStart}\n${entries.join("\n")}\n${sitemapMarkerEnd}`;
}

async function syncSitemap() {
  let sitemap = await readFile(sitemapPath, "utf8");
  const section = buildSitemapSection();
  if (sitemap.includes(sitemapMarkerStart)) {
    sitemap = sitemap.replace(new RegExp(`${sitemapMarkerStart}[\\s\\S]*?${sitemapMarkerEnd}`, "u"), section);
  } else {
    sitemap = sitemap.replace("</urlset>", `${section}\n</urlset>`);
  }
  await writeFile(sitemapPath, sitemap, "utf8");
}

async function syncParentPages() {
  for (const [locale, metadata] of Object.entries(SCENARIO_LOCALES)) {
    for (const category of Object.keys(SCENARIO_CATEGORY_PARENTS)) {
      const parentPath = path.join(projectRoot, metadata.prefix, SCENARIO_CATEGORY_PARENTS[category], "index.html");
      let html = await readFile(parentPath, "utf8");
      html = html.replace(parentMarkerPattern, "\n");
      html = html.replace("</main>", `${buildScenarioCluster(locale, category)}\n    </main>`);
      await writeFile(parentPath, html, "utf8");
    }
  }
}

for (const scenario of SCENARIO_PAGES) {
  for (const [locale, metadata] of Object.entries(SCENARIO_LOCALES)) {
    const page = scenario.localized[locale];
    assertSeoLength(locale, page, scenario);
    const outputDirectory = path.join(projectRoot, metadata.prefix, scenario.slug);
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(path.join(outputDirectory, "index.html"), buildPage(locale, scenario), "utf8");
  }
}

await syncParentPages();
await syncSitemap();

console.log(`Generated ${SCENARIO_PAGES.length * Object.keys(SCENARIO_LOCALES).length} localized scenario pages.`);
