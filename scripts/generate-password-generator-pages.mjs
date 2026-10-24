import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PASSWORD_CONTENT as content, PASSWORD_LOCALES as locales } from "./password-generator-content.mjs";
import { getMetadataLengthRange, visibleMetadataLength, visibleTitleContentLength } from "./seo-metadata-rules.mjs";

const require = createRequire(import.meta.url);
require("../password-generator.js");
const { DEFAULTS } = globalThis.PasswordGeneratorCore;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "password-generator";
const check = process.argv.includes("--check");
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const localPath = (locale, target = "") => `/${locales[locale].prefix}${target ? `${target}/` : ""}`;
const icon = (name, hidden = false) => `<svg class="password-icon" data-icon="${name}" aria-hidden="true"${hidden ? " hidden" : ""}><use href="/password-icons.svg#${name}" /></svg>`;

function schema(locale, page) {
  const url = origin + localPath(locale, slug);
  const name = page.title.replace(/ \| JianFan\.app$/u, "");
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", "@id": `${url}#webapp`, name: page.title.replace(/ \| JianFan\.app$/u, ""), url, description: page.description, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript and Web Crypto", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` } },
    { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: origin + localPath(locale) }, { "@type": "ListItem", position: 2, name, item: url }] },
    { "@type": "HowTo", "@id": `${url}#howto`, name: page.howTitle, step: page.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text })) },
    { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: page.faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }
  ] };
}

function buildPage(locale) {
  const page = content[locale];
  const meta = locales[locale];
  for (const field of ["title", "description"]) {
    const length = field === "title" ? visibleTitleContentLength(page[field]) : visibleMetadataLength(page[field]);
    const [min, max] = getMetadataLengthRange(locale, field);
    if (length < min || length > max) throw new Error(`${locale} ${field}: ${length} characters, expected ${min}-${max}`);
  }
  const options = Object.entries(locales).map(([key, item]) => `<option value="${key}"${key === locale ? " selected" : ""}>${item.label}</option>`).join("");
  const alternates = Object.entries(locales).map(([key, item]) => `    <link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localPath(key, slug)}" />`).join("\n");
  const messages = JSON.stringify({ ...page.messages, groups: page.groups }).replaceAll("<", "\\u003c");
  const groups = Object.entries(page.groups).map(([key, label], index) => `<label class="password-check"><input type="checkbox" name="${key}" checked /><span>${label}</span><code>${["A–Z", "a–z", "0–9", "!@#$"][index]}</code></label>`).join("");
  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <title>${escape(page.title)}</title>
    <meta name="description" content="${escape(page.description)}" />
    <link rel="canonical" href="${origin}${localPath(locale, slug)}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${origin}/${slug}/" />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.min.css" />
    <link rel="stylesheet" href="/password-generator.css" />
    <script src="/theme.js"></script>
    <script defer src="/password-generator.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">${JSON.stringify(schema(locale, page), null, 2)}</script>
    <!-- seo-schema:end -->
  </head>
  <body data-tool-page="password-generator" data-page-slug="${slug}" data-locale="${locale}">
    <script type="application/json" id="passwordMessages">${messages}</script>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header"><a class="brand" href="${localPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">${icon("key")}</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${options}</select></label><button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false"></button></nav></header>
    <main id="main" class="password-main">
      <section class="password-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><span class="password-local">${icon("shield")}${page.local}</span></section>
      <div class="password-workspace">
        <form id="passwordForm" class="password-settings" novalidate autocomplete="off" aria-labelledby="passwordSettingsTitle">
          <div class="password-section-head"><h2 id="passwordSettingsTitle">${page.settings}</h2><span class="password-step" aria-hidden="true">01</span></div>
          <div class="password-numbers"><div><label for="passwordLength">${page.length}</label><input id="passwordLength" name="length" type="number" min="1" max="128" value="${DEFAULTS.length}" inputmode="numeric" aria-describedby="passwordLengthHint" /><small id="passwordLengthHint">${page.lengthHint}</small></div><div><label for="passwordCount">${page.count}</label><input id="passwordCount" name="count" type="number" min="1" max="100" value="${DEFAULTS.count}" inputmode="numeric" aria-describedby="passwordCountHint" /><small id="passwordCountHint">${page.countHint}</small></div></div>
          <input id="passwordLengthRange" type="range" min="1" max="128" value="${DEFAULTS.length}" aria-label="${page.lengthRange}" />
          <div class="password-presets" role="group" aria-label="${page.presets}">${["standard", "long", "readable"].map((preset, index) => `<button type="button" data-password-preset="${preset}">${page.presetLabels[index]}</button>`).join("")}</div>
          <fieldset class="password-types"><legend>${page.characterTypes}</legend><div>${groups}</div><p>${page.coverage}</p></fieldset>
          <div class="password-custom-fields"><div class="password-field"><div class="password-field-label"><label for="passwordSymbols">${page.symbolsLabel}</label><button id="passwordDefaultSymbols" class="password-icon-button" type="button" title="${page.defaultSymbols}" aria-label="${page.defaultSymbols}">${icon("refresh")}</button></div><input id="passwordSymbols" name="specialCharacters" type="text" value="${escape(DEFAULTS.specialCharacters)}" maxlength="512" spellcheck="false" autocapitalize="off" aria-describedby="passwordSymbolsHint" /><small id="passwordSymbolsHint">${page.symbolsHint}</small></div>
          <div class="password-field"><label for="passwordExcluded">${page.excludeLabel}</label><input id="passwordExcluded" name="excludedCharacters" type="text" placeholder="${escape(page.excludePlaceholder)}" maxlength="512" spellcheck="false" autocapitalize="off" aria-describedby="passwordExcludedHint" /><small id="passwordExcludedHint">${page.excludeHint}</small></div></div>
          <div class="password-filters"><label><input type="checkbox" name="excludeSimilar" /><span>${page.similar}<small><code>${page.similarHint}</code></small></span></label><label><input type="checkbox" name="noAdjacentRepeat" /><span>${page.adjacent}<small>${page.adjacentHint}</small></span></label></div>
          <p id="passwordError" class="password-error" role="alert" hidden></p>
          <button class="password-generate" type="submit">${icon("refresh")}<span>${page.generate}</span></button>
        </form>
        <section class="password-output" aria-labelledby="passwordResultsTitle">
          <div class="password-section-head"><h2 id="passwordResultsTitle">${page.results}</h2><div class="password-output-actions"><button class="password-icon-button" id="passwordVisibility" type="button" aria-pressed="false" title="${page.hide}" aria-label="${page.hide}" disabled>${icon("eye", true)}${icon("eye-off")}</button><button id="passwordClear" class="password-text-button" type="button" disabled>${page.clear}</button></div></div>
          <p id="passwordSummary" class="password-summary">${page.noResults}</p>
          <div class="password-strength-row"><span id="passwordStrengthLabel"></span><meter id="passwordStrength" min="0" max="128" low="50" high="80" optimum="128" value="0" aria-label="${escape(page.messages.strengthLabel.replace(": {level}", "").replace("：{level}", ""))}" hidden></meter></div>
          <div id="passwordResults" class="password-results"></div><p id="passwordEmpty" class="password-empty">${icon("key")}${page.empty}</p>
          <div class="password-export"><button id="passwordCopyAll" type="button" disabled>${icon("copy")}${page.copyAll}</button><button id="passwordDownload" type="button" disabled>${icon("download")}${page.download}</button></div>
          <p id="passwordStatus" class="password-status" role="status" aria-live="polite">${page.waiting}</p>
          <div class="password-local-note">${icon("shield")}<p>${page.privacyNote}<small>${page.downloadNote}</small></p></div>
          <noscript><p class="password-error">${page.noScript}</p></noscript>
        </section>
      </div>
      <template id="passwordResultTemplate"><div class="password-result"><span class="password-result-index" aria-hidden="true"></span><input type="text" readonly autocomplete="off" spellcheck="false" data-lpignore="true" data-1p-ignore /><button type="button" class="password-icon-button" title="${page.copy}" aria-label="${page.copy}">${icon("copy")}</button></div></template>
      <section class="seo-band standalone-info password-info" aria-labelledby="passwordFeatureTitle"><div class="section-heading"><h2 id="passwordFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">${page.cards.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div><section class="pinyin-howto" aria-labelledby="passwordHowTitle"><h2 id="passwordHowTitle">${page.howTitle}</h2><ol>${page.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section><section class="pinyin-faq" aria-labelledby="passwordFaqTitle"><h2 id="passwordFaqTitle">${page.faqTitle}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.related}">${page.links.map(([target, label]) => `<a href="${localPath(locale, target)}">${label}</a>`).join("")}</nav></section>
    </main>
    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localPath(locale, "about")}">${meta.about}</a><a href="${localPath(locale, "contact")}">${meta.contact}</a><a href="${localPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>
`;
}

async function writeOrCheck(target, output) {
  if (check) {
    if (await readFile(target, "utf8") !== output) throw new Error(`${path.relative(root, target)} is out of sync with password generator`);
  } else {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, output);
  }
}

for (const locale of Object.keys(locales)) {
  await writeOrCheck(path.join(root, locales[locale].prefix, slug, "index.html"), buildPage(locale));
  const homepagePath = path.join(root, locales[locale].prefix, "index.html");
  const source = await readFile(homepagePath, "utf8");
  const block = `          <!-- password-generator-link:start -->\n          <a href="${localPath(locale, slug)}" data-route="${slug}">${content[locale].heading}</a>\n          <!-- password-generator-link:end -->`;
  const marker = "          <!-- image-redaction-link:end -->";
  if (!source.includes(marker)) throw new Error(`${locale}: homepage anchor missing`);
  const output = source.includes("<!-- password-generator-link:start -->") ? source.replace(/          <!-- password-generator-link:start -->[\s\S]*?          <!-- password-generator-link:end -->/u, block) : source.replace(marker, `${marker}\n${block}`);
  await writeOrCheck(homepagePath, output);
}
const sitemapPath = path.join(root, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
const alternates = Object.entries(locales).map(([locale, meta]) => `    <xhtml:link rel="alternate" hreflang="${meta.hreflang}" href="${origin}${localPath(locale, slug)}" />`).join("\n");
const section = `  <!-- password-generator-tool:start -->\n${Object.keys(locales).map((locale) => `  <url>\n    <loc>${origin}${localPath(locale, slug)}</loc>\n    <lastmod>2026-10-24</lastmod>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/${slug}/" />\n  </url>`).join("\n")}\n  <!-- password-generator-tool:end -->`;
if (!sitemap.includes("  <!-- blog:start -->")) throw new Error("Sitemap anchor missing");
await writeOrCheck(sitemapPath, sitemap.includes("<!-- password-generator-tool:start -->") ? sitemap.replace(/  <!-- password-generator-tool:start -->[\s\S]*?  <!-- password-generator-tool:end -->/u, section) : sitemap.replace("  <!-- blog:start -->", `${section}\n  <!-- blog:start -->`));
console.log(`${check ? "Checked" : "Generated"} five password generator pages, homepage links and sitemap entries.`);
