import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { HANZI_LOCALES, HANZI_PROFILES, HANZI_UI } from "./hanzi-profile-data.mjs";
import { getMetadataLengthRange, visibleMetadataLength } from "./seo-metadata-rules.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const sitemapMarkerStart = "  <!-- hanzi-profile-pseo:start -->";
const sitemapMarkerEnd = "  <!-- hanzi-profile-pseo:end -->";
const lastModified = "2026-08-27";

const structureOperators = Object.freeze({
  "⿰": "leftRight",
  "⿱": "topBottom",
  "⿲": "leftMiddleRight",
  "⿳": "topMiddleBottom",
  "⿴": "enclosure",
  "⿵": "enclosure",
  "⿶": "enclosure",
  "⿷": "enclosure",
  "⿸": "enclosure",
  "⿹": "enclosure",
  "⿺": "enclosure",
  "⿻": "overlaid"
});

const records = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fill(template, values) {
  return template.replace(/\{([a-zA-Z]+)\}/g, (_, key) => String(values[key] ?? ""));
}

function formForLocale(profile, locale) {
  if (locale === "zh-TW") return profile.forms.traditional;
  if (locale === "ja") return profile.forms.japanese;
  if (locale === "ko") return profile.forms.korean;
  return profile.forms.simplified;
}

function route(locale, suffix = "") {
  const prefix = HANZI_LOCALES[locale].prefix;
  return `/${prefix}hanzi/${suffix ? `${suffix}/` : ""}`;
}

function canonicalUrl(locale, suffix = "") {
  return `${origin}${route(locale, suffix)}`;
}

function localizedToolPath(locale, slug, character) {
  const prefix = HANZI_LOCALES[locale].prefix;
  return `/${prefix}${slug}/?character=${encodeURIComponent(character)}`;
}

async function loadCharacterRecord(character) {
  if (records.has(character)) return records.get(character);
  const shard = character.codePointAt(0).toString(16).slice(0, 2);
  const source = await readFile(path.join(projectRoot, "data", "han-character-lookup", `${shard}.json`), "utf8");
  const record = JSON.parse(source)[character];
  if (!record) throw new Error(`Missing Han-character record for ${character}`);
  records.set(character, record);
  return record;
}

function structureName(ui, ids) {
  return ui.structureNames[structureOperators[Array.from(ids || "")[0]] || "single"];
}

function componentList(ids) {
  if (!ids || ids === "？") return [];
  const components = Array.from(ids).filter((character) => /[\p{Script=Han}⺀-⻿]/u.test(character));
  return [...new Set(components)];
}

function unicodeLabel(character) {
  return `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
}

function formationName(ui, record) {
  return ui.formationNames[record.e?.t] || ui.formationNames.unknown;
}

function japaneseReading(profile) {
  return profile.japaneseReading;
}

function mandarinReading(record) {
  return record.p?.join("、") || "-";
}

function currentReading(locale, profile, record) {
  if (locale === "ja") return japaneseReading(profile);
  if (locale === "ko") return profile.koreanReading;
  return mandarinReading(record);
}

function assertSeoLength(locale, description, label) {
  const descriptionLength = visibleMetadataLength(description);
  const [descriptionMin, descriptionMax] = getMetadataLengthRange(locale, "description");
  if (descriptionLength < descriptionMin || descriptionLength > descriptionMax) {
    throw new Error(`${label}: ${locale} description length ${descriptionLength} is outside ${descriptionMin}-${descriptionMax}`);
  }
}

function buildAlternateLinks(suffix = "") {
  const links = Object.entries(HANZI_LOCALES).map(
    ([locale, metadata]) => `    <link rel="alternate" hreflang="${metadata.hreflang}" href="${canonicalUrl(locale, suffix)}" />`
  );
  links.push(`    <link rel="alternate" hreflang="x-default" href="${canonicalUrl("zh-CN", suffix)}" />`);
  return links.join("\n");
}

function buildHead({ locale, suffix = "", title, description, schema }) {
  const canonical = canonicalUrl(locale, suffix);
  return `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
${buildAlternateLinks(suffix)}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="JianFan.app" />
    <meta property="og:locale" content="${HANZI_LOCALES[locale].lang}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/styles.css" />
    <!-- seo-schema:start -->
    <script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
    <!-- seo-schema:end -->
  </head>`;
}

function buildLanguageMenu(locale, suffix = "") {
  const ui = HANZI_UI[locale];
  const links = Object.entries(HANZI_LOCALES).map(([targetLocale, metadata]) => {
    const current = targetLocale === locale ? ' aria-current="page"' : "";
    return `<a href="${route(targetLocale, suffix)}" hreflang="${metadata.hreflang}"${current}>${metadata.label}</a>`;
  });
  return `<details class="hanzi-language-menu"><summary>${ui.language}: ${HANZI_LOCALES[locale].label}</summary><div>${links.join("")}</div></details>`;
}

function buildHeader(locale, suffix = "") {
  const ui = HANZI_UI[locale];
  const prefix = HANZI_LOCALES[locale].prefix;
  return `    <a class="skip-nav" href="#main">${ui.skip}</a>
    <header class="site-header" aria-label="${ui.header}">
      <a class="brand" href="/${prefix}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">字</span><span class="brand-text">JianFan.app</span></a>
      <nav class="top-actions" aria-label="${ui.nav}">
        <a class="nav-link" href="/${prefix}">${ui.home}</a>
        <a class="nav-link" href="${route(locale)}">${ui.dictionary}</a>
        ${buildLanguageMenu(locale, suffix)}
      </nav>
    </header>`;
}

function buildFooter(locale) {
  const ui = HANZI_UI[locale];
  const prefix = HANZI_LOCALES[locale].prefix;
  return `    <footer class="site-footer"><p>${ui.footerText}</p><nav class="footer-links" aria-label="${ui.footer}"><a href="/${prefix}about/">${ui.about}</a><a href="/${prefix}contact/">${ui.contact}</a><a href="/${prefix}privacy/">${ui.privacy}</a></nav></footer>`;
}

function buildSearchForm(locale, character = "") {
  const ui = HANZI_UI[locale];
  const prefix = HANZI_LOCALES[locale].prefix;
  return `<form class="hanzi-directory-search" action="/${prefix}chinese-character-lookup/" method="get">
            <div><label for="hanziDirectorySearch">${ui.searchLabel}</label><input id="hanziDirectorySearch" name="character" type="text" inputmode="text" autocomplete="off" maxlength="12" value="${escapeHtml(character)}" placeholder="${ui.searchPlaceholder}" /></div>
            <button class="primary-action" type="submit">${ui.searchSubmit}</button>
          </form>`;
}

function buildBreadcrumb(locale, profile = null) {
  const ui = HANZI_UI[locale];
  const prefix = HANZI_LOCALES[locale].prefix;
  const profileLink = profile ? `<span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(formForLocale(profile, locale))}</span>` : "";
  return `<nav class="hanzi-breadcrumb" aria-label="Breadcrumb"><a href="/${prefix}">${ui.home}</a><span aria-hidden="true">/</span><a href="${route(locale)}">${ui.dictionary}</a>${profileLink}</nav>`;
}

function buildHubSchema(locale, title, description) {
  const ui = HANZI_UI[locale];
  const url = canonicalUrl(locale);
  const prefix = HANZI_LOCALES[locale].prefix;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: title,
        description,
        inLanguage: HANZI_LOCALES[locale].lang,
        isPartOf: { "@type": "WebSite", name: "JianFan.app", url: `${origin}/` },
        mainEntity: { "@id": `${url}#characters` }
      },
      {
        "@type": "ItemList",
        "@id": `${url}#characters`,
        name: ui.listTitle,
        numberOfItems: HANZI_PROFILES.length,
        itemListElement: HANZI_PROFILES.map((profile, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: formForLocale(profile, locale),
          url: canonicalUrl(locale, profile.slug)
        }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.home, item: `${origin}/${prefix}` },
          { "@type": "ListItem", position: 2, name: ui.dictionary, item: url }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: ui.hubFaqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer }
        }))
      }
    ]
  };
}

function buildProfileCards(locale, profileRecords, currentSlug = "") {
  const ui = HANZI_UI[locale];
  return profileRecords.map(({ profile, recordsByLocale }) => {
    const record = recordsByLocale[locale];
    const character = formForLocale(profile, locale);
    const localized = profile.localized[locale];
    const current = profile.slug === currentSlug ? ' aria-current="page"' : "";
    return `<article class="hanzi-directory-card">
              <a href="${route(locale, profile.slug)}"${current}>
                <span class="hanzi-directory-glyph" lang="${HANZI_LOCALES[locale].lang}" aria-hidden="true">${character}</span>
                <span class="hanzi-directory-card-copy"><strong>${character}</strong><small>${escapeHtml(currentReading(locale, profile, record))} · ${record.s}</small><span>${escapeHtml(localized.meaning)}</span></span>
              </a>
            </article>`;
  }).join("\n");
}

function buildHubPage(locale, profileRecords) {
  const ui = HANZI_UI[locale];
  const title = ui.hubTitle;
  const description = ui.hubDescription;
  assertSeoLength(locale, description, "hanzi hub");
  const schema = buildHubSchema(locale, title, description);
  const faq = ui.hubFaqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("\n");
  return `<!doctype html>
<html lang="${HANZI_LOCALES[locale].lang}">
${buildHead({ locale, title, description, schema })}
  <body data-pseo-page="hanzi-index" data-locale="${locale}">
${buildHeader(locale)}
    <main id="main">
      <section class="tool-hero hanzi-directory-hero" aria-labelledby="pageTitle">
        <div>${buildBreadcrumb(locale)}<p class="section-kicker">${ui.hubKicker}</p><h1 id="pageTitle">${ui.hubHeading}</h1><p class="lede">${ui.hubIntro}</p></div>
        <div class="hanzi-directory-signal" aria-hidden="true"><span>学</span><span>學</span><span>国</span><span>國</span></div>
      </section>
      <section class="standalone-tool hanzi-directory-tool" aria-labelledby="hanziSearchTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">SEARCH / READ / WRITE</p><h2 id="hanziSearchTitle">${ui.searchTitle}</h2></div></div>
${buildSearchForm(locale)}
      </section>
      <section class="seo-band hanzi-directory-band" aria-labelledby="hanziListTitle">
        <div class="section-heading"><p class="section-kicker">CHARACTER DIRECTORY</p><h2 id="hanziListTitle">${ui.listTitle}</h2><p class="seo-intro">${ui.listIntro}</p></div>
        <div class="hanzi-directory-grid">${buildProfileCards(locale, profileRecords)}</div>
        <section class="hanzi-directory-explainer" aria-labelledby="hanziHubInfoTitle"><h2 id="hanziHubInfoTitle">${ui.hubInfoTitle}</h2><p>${ui.hubInfo}</p></section>
        <section class="pinyin-faq" aria-labelledby="hanziHubFaqTitle"><h2 id="hanziHubFaqTitle">${ui.hubFaqTitle}</h2>${faq}</section>
      </section>
    </main>
${buildFooter(locale)}
  </body>
</html>`;
}

function buildProfileFaqs(locale, profile, record) {
  const character = formForLocale(profile, locale);
  const pinyin = mandarinReading(record);
  const strokes = record.s;
  const radical = record.r;
  const simplified = profile.forms.simplified;
  const traditional = profile.forms.traditional;
  const localized = profile.localized[locale];
  if (locale === "zh-CN") return [
    [`“${character}”字怎么读？`, `“${character}”的普通话拼音是 ${pinyin}。${localized.meaning}`],
    [`“${character}”的部首和笔画是多少？`, `“${character}”的部首是“${radical}”，按当前字形共 ${strokes} 画。`],
    [`“${character}”的繁体字是什么？`, simplified === traditional ? `“${character}”的常用简体和繁体字形相同。` : `简体字写作“${simplified}”，对应的繁体字写作“${traditional}”。`],
    [`怎样查看“${character}”的笔顺并练习？`, `使用本页的动态笔顺入口可逐画播放，再打开田字格字帖生成器进行描红和空格练习。`]
  ];
  if (locale === "zh-TW") return [
    [`「${character}」字怎麼讀？`, `「${character}」的漢語拼音是 ${pinyin}。${localized.meaning}`],
    [`「${character}」的部首和筆畫是多少？`, `「${character}」的部首是「${radical}」，依目前字形共 ${strokes} 畫。`],
    [`「${character}」的簡體字是什麼？`, simplified === traditional ? `「${character}」的常用簡體與繁體字形相同。` : `繁體字寫作「${traditional}」，對應的簡體字寫作「${simplified}」。`],
    [`如何查看「${character}」的筆順並練習？`, `使用本頁的動態筆順入口逐畫播放，再開啟國字練習紙製作描紅與空格練習。`]
  ];
  if (locale === "en") return [
    [`How is ${character} pronounced in Mandarin?`, `${character} is pronounced ${pinyin} in Mandarin. It means ${localized.meaning}.`],
    [`What are the radical and stroke count for ${character}?`, `${character} uses the ${radical} radical and has ${strokes} strokes in the form shown on this page.`],
    [`What are the Simplified and Traditional forms of ${character}?`, simplified === traditional ? `${character} has the same common Simplified and Traditional form.` : `The common Simplified form is ${simplified}; the Traditional form is ${traditional}.`],
    [`How can I practise writing ${character}?`, `Open the animated stroke-order tool, then make a printable Tian Zi Ge or Mi Zi Ge worksheet from the practice-sheet link.`]
  ];
  if (locale === "ja") return [
    [`「${character}」の読み方は？`, `「${character}」は${profile.japaneseReading}です。${localized.meaning}`],
    [`「${character}」の部首と画数は？`, `部首は「${radical}」、日本で使う字形の画数は ${strokes} 画です。`],
    [`「${character}」の中国語の読み方は？`, `中国語普通話のピンインは ${pinyin} です。簡体字は「${simplified}」、繁体字は「${traditional}」です。`],
    [`「${character}」の書き順を練習できますか？`, `日本の学校字形に対応する筆順ページを開き、漢字練習プリントで見本・なぞり書き・空欄を印刷できます。`]
  ];
  return [
    [`${character} 한자의 뜻과 음은 무엇인가요?`, `${character}의 한자음은 ${profile.koreanReading}이며, ${localized.meaning}`],
    [`${character} 한자의 부수와 획수는 무엇인가요?`, `부수는 ${radical}, 현재 글자 모양의 총획수는 ${strokes}획입니다.`],
    [`${character}의 간체자와 번체자는 어떻게 다른가요?`, simplified === traditional ? `${character}은 일반적인 간체자와 번체자 모양이 같습니다.` : `중국어 간체자는 ${simplified}, 번체자는 ${traditional}으로 씁니다.`],
    [`${character} 쓰기를 연습할 수 있나요?`, `필순 도구를 확인한 뒤 한자 쓰기 연습장에서 흐린 글자와 빈칸이 있는 인쇄용 학습지를 만들 수 있습니다.`]
  ];
}

function buildStructureText(locale, profile, record) {
  const ui = HANZI_UI[locale];
  const character = formForLocale(profile, locale);
  const structure = structureName(ui, record.d);
  const components = componentList(record.d);
  if (!components.length) {
    const missing = {
      "zh-CN": `“${character}”的部首是“${record.r}”，共 ${record.s} 画，属于${structure}。当前资料没有提供可继续拆分的可靠 IDS 结构。`,
      "zh-TW": `「${character}」的部首是「${record.r}」，共 ${record.s} 畫，屬於${structure}。目前資料沒有提供可繼續拆分的可靠 IDS 結構。`,
      en: `${character} uses the ${record.r} radical, has ${record.s} strokes and a ${structure}. The current dataset does not provide a reliable IDS decomposition beyond the whole character.`,
      ja: `「${character}」の部首は「${record.r}」、画数は ${record.s} 画、構成は${structure}です。現在のデータには、さらに分解できる信頼性の高い IDS がありません。`,
      ko: `${character}의 부수는 ${record.r}, 총획수는 ${record.s}획이며 ${structure}입니다. 현재 자료에는 더 나눌 수 있는 신뢰도 높은 IDS 구조가 없습니다.`
    };
    return missing[locale];
  }
  return fill(ui.structureText, {
    character,
    radical: record.r,
    strokes: record.s,
    structure,
    ids: record.d,
    components: components.join(locale === "en" ? ", " : "、")
  });
}

function buildProfileSchema(locale, profile, record, title, description, faqs) {
  const ui = HANZI_UI[locale];
  const character = formForLocale(profile, locale);
  const url = canonicalUrl(locale, profile.slug);
  const hubUrl = canonicalUrl(locale);
  const prefix = HANZI_LOCALES[locale].prefix;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: title,
        description,
        inLanguage: HANZI_LOCALES[locale].lang,
        isPartOf: { "@type": "WebSite", name: "JianFan.app", url: `${origin}/` },
        mainEntity: { "@id": `${url}#term` }
      },
      {
        "@type": "DefinedTerm",
        "@id": `${url}#term`,
        name: character,
        termCode: unicodeLabel(character),
        description: profile.localized[locale].meaning,
        inDefinedTermSet: { "@type": "DefinedTermSet", name: ui.dictionary, url: hubUrl }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.home, item: `${origin}/${prefix}` },
          { "@type": "ListItem", position: 2, name: ui.dictionary, item: hubUrl },
          { "@type": "ListItem", position: 3, name: character, item: url }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer }
        }))
      }
    ]
  };
}

function buildFormsTable(locale, profile, recordsByForm) {
  const ui = HANZI_UI[locale];
  const rows = [
    ["simplified", profile.forms.simplified, mandarinReading(recordsByForm.simplified), "zh-Hans"],
    ["traditional", profile.forms.traditional, mandarinReading(recordsByForm.traditional), "zh-Hant"],
    ["japanese", profile.forms.japanese, profile.japaneseReading, "ja"],
    ["korean", profile.forms.korean, profile.koreanReading, "ko"]
  ];
  return `<div class="hanzi-profile-table-scroll"><table class="hanzi-profile-table"><thead><tr>${ui.formHeaders.map((header) => `<th scope="col">${header}</th>`).join("")}</tr></thead><tbody>${rows.map(([key, form, reading, language]) => `<tr><th scope="row">${ui.formLabels[key]}</th><td class="hanzi-profile-table-glyph" lang="${language}">${form}</td><td>${escapeHtml(reading)}</td></tr>`).join("")}</tbody></table></div>`;
}

function buildWordsTable(locale, profile) {
  const ui = HANZI_UI[locale];
  const words = profile.localized[locale].words;
  return `<div class="hanzi-profile-table-scroll"><table class="hanzi-profile-table"><thead><tr>${ui.wordHeaders.map((header) => `<th scope="col">${header}</th>`).join("")}</tr></thead><tbody>${words.map(([word, reading, meaning]) => `<tr><th scope="row">${escapeHtml(word)}</th><td>${escapeHtml(reading)}</td><td>${escapeHtml(meaning)}</td></tr>`).join("")}</tbody></table></div>`;
}

function buildProfilePage(locale, profile, record, recordsByForm, profileRecords) {
  const ui = HANZI_UI[locale];
  const metadata = HANZI_LOCALES[locale];
  const character = formForLocale(profile, locale);
  const localized = profile.localized[locale];
  const pinyin = mandarinReading(record);
  const reading = currentReading(locale, profile, record);
  const title = fill(ui.profileTitle, { character });
  const description = fill(ui.profileDescription, { character, pinyin, strokes: record.s, koreanReading: profile.koreanReading });
  assertSeoLength(locale, description, `hanzi/${profile.slug}`);
  const faqs = buildProfileFaqs(locale, profile, record);
  const schema = buildProfileSchema(locale, profile, record, title, description, faqs);
  const variants = [...new Set(Object.values(profile.forms))].join(" / ");
  const facts = [
    [ui.labels.reading, reading],
    [ui.labels.meaning, localized.meaning],
    [ui.labels.radical, record.r],
    [ui.labels.strokes, record.s],
    [ui.labels.structure, structureName(ui, record.d)],
    [ui.labels.formation, formationName(ui, record)],
    [ui.labels.unicode, unicodeLabel(character)],
    [ui.labels.variants, variants],
    [ui.labels.cantonese, record.c || "-"],
    [ui.labels.japanese, profile.japaneseReading],
    [ui.labels.korean, profile.koreanReading]
  ];
  const strokeSlug = locale === "ja" ? "japanese-stroke-order" : "chinese-stroke-order";
  const faqHtml = faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("\n");
  return `<!doctype html>
<html lang="${metadata.lang}">
${buildHead({ locale, suffix: profile.slug, title, description, schema })}
  <body data-pseo-page="hanzi-profile" data-locale="${locale}" data-character="${character}" data-profile-slug="${profile.slug}">
${buildHeader(locale, profile.slug)}
    <main id="main">
      <section class="tool-hero hanzi-profile-hero" aria-labelledby="pageTitle">
        <div>${buildBreadcrumb(locale, profile)}<p class="section-kicker">${ui.profileKicker}</p><h1 id="pageTitle">${fill(ui.profileHeading, { character })}</h1><p class="lede">${fill(ui.profileIntro, { character, reading, meaning: localized.meaning })}</p></div>
        <div class="hanzi-profile-hero-glyph" lang="${metadata.lang}" aria-hidden="true">${character}</div>
      </section>
      <section class="standalone-tool hanzi-profile-tool" aria-labelledby="hanziQuickTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">CHARACTER / READING / STRUCTURE</p><h2 id="hanziQuickTitle">${fill(ui.quickTitle, { character })}</h2></div><span class="hanzi-profile-code">${unicodeLabel(character)}</span></div>
        <div class="hanzi-profile-workspace">
          <div class="hanzi-profile-primary"><span class="hanzi-profile-glyph" lang="${metadata.lang}">${character}</span><strong>${escapeHtml(reading)}</strong><p>${escapeHtml(localized.meaning)}</p></div>
          <dl class="hanzi-profile-facts">${facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
          <nav class="hanzi-profile-actions" aria-label="${fill(ui.practiceTitle, { character })}">
            <a class="primary-action" href="${localizedToolPath(locale, strokeSlug, character)}">${ui.actions.stroke}</a>
            <a href="${localizedToolPath(locale, "chinese-to-pinyin", character)}">${ui.actions.pinyin}</a>
            <a href="${localizedToolPath(locale, "han-character-worksheet", character)}">${ui.actions.worksheet}</a>
            <a href="${localizedToolPath(locale, "chinese-character-lookup", character)}">${ui.actions.lookup}</a>
          </nav>
        </div>
        <div class="hanzi-profile-search"><h3>${ui.searchTitle}</h3>${buildSearchForm(locale, character)}</div>
      </section>
      <section class="seo-band hanzi-profile-band" aria-labelledby="hanziFormsTitle">
        <section class="hanzi-profile-section" aria-labelledby="hanziFormsTitle"><div class="section-heading"><p class="section-kicker">REGIONAL FORMS</p><h2 id="hanziFormsTitle">${fill(ui.formsTitle, { character })}</h2><p class="seo-intro">${ui.formsIntro}</p></div>${buildFormsTable(locale, profile, recordsByForm)}</section>
        <section class="hanzi-profile-section" aria-labelledby="hanziWordsTitle"><div class="section-heading"><p class="section-kicker">COMMON WORDS</p><h2 id="hanziWordsTitle">${fill(ui.wordsTitle, { character })}</h2><p class="seo-intro">${ui.wordsIntro}</p></div>${buildWordsTable(locale, profile)}</section>
        <section class="hanzi-profile-copy-grid">
          <article><p class="section-kicker">RADICAL / COMPONENTS</p><h2>${fill(ui.structureTitle, { character })}</h2><p>${escapeHtml(buildStructureText(locale, profile, record))}</p></article>
          <article><p class="section-kicker">STROKE ORDER / PRACTICE</p><h2>${fill(ui.practiceTitle, { character })}</h2><p>${ui.practiceText}</p><a href="${localizedToolPath(locale, strokeSlug, character)}">${ui.actions.stroke}</a></article>
        </section>
        <section class="pinyin-faq" aria-labelledby="hanziFaqTitle"><h2 id="hanziFaqTitle">${fill(ui.faqTitle, { character })}</h2>${faqHtml}</section>
        <section class="hanzi-related-section" aria-labelledby="hanziRelatedTitle"><div class="section-heading"><p class="section-kicker">RELATED CHARACTERS</p><h2 id="hanziRelatedTitle">${ui.relatedTitle}</h2></div><div class="hanzi-directory-grid">${buildProfileCards(locale, profileRecords, profile.slug)}</div></section>
        <p class="hanzi-profile-source"><strong>${ui.sourceTitle}：</strong>${ui.sourceText} <a href="https://github.com/skishore/makemeahanzi">Make Me a Hanzi</a> · <a href="https://www.unicode.org/reports/tr38/">Unicode Unihan</a></p>
      </section>
    </main>
${buildFooter(locale)}
  </body>
</html>`;
}

function buildSitemapAlternates(suffix = "") {
  const links = Object.entries(HANZI_LOCALES).map(([locale, metadata]) => `    <xhtml:link rel="alternate" hreflang="${metadata.hreflang}" href="${canonicalUrl(locale, suffix)}" />`);
  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl("zh-CN", suffix)}" />`);
  return links.join("\n");
}

function buildSitemapUrl(locale, suffix = "", priority = "0.7") {
  return `  <url>
    <loc>${canonicalUrl(locale, suffix)}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
${buildSitemapAlternates(suffix)}
  </url>`;
}

async function updateSitemap() {
  const entries = [];
  for (const locale of Object.keys(HANZI_LOCALES)) entries.push(buildSitemapUrl(locale, "", "0.8"));
  for (const profile of HANZI_PROFILES) {
    for (const locale of Object.keys(HANZI_LOCALES)) entries.push(buildSitemapUrl(locale, profile.slug));
  }
  const section = `${sitemapMarkerStart}\n${entries.join("\n")}\n${sitemapMarkerEnd}`;
  const source = await readFile(sitemapPath, "utf8");
  const updated = source.includes(sitemapMarkerStart)
    ? source.replace(new RegExp(`${sitemapMarkerStart}[\\s\\S]*?${sitemapMarkerEnd}`), section)
    : source.replace("</urlset>", `${section}\n</urlset>`);
  await writeFile(sitemapPath, updated);
}

const profileRecords = [];
for (const profile of HANZI_PROFILES) {
  const recordsByLocale = {};
  for (const locale of Object.keys(HANZI_LOCALES)) {
    recordsByLocale[locale] = await loadCharacterRecord(formForLocale(profile, locale));
  }
  profileRecords.push({ profile, recordsByLocale });
}

for (const locale of Object.keys(HANZI_LOCALES)) {
  const hubDirectory = path.join(projectRoot, HANZI_LOCALES[locale].prefix, "hanzi");
  await mkdir(hubDirectory, { recursive: true });
  await writeFile(path.join(hubDirectory, "index.html"), `${buildHubPage(locale, profileRecords)}\n`);

  for (const profile of HANZI_PROFILES) {
    const character = formForLocale(profile, locale);
    const record = await loadCharacterRecord(character);
    const recordsByForm = {
      simplified: await loadCharacterRecord(profile.forms.simplified),
      traditional: await loadCharacterRecord(profile.forms.traditional)
    };
    const directory = path.join(hubDirectory, profile.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), `${buildProfilePage(locale, profile, record, recordsByForm, profileRecords)}\n`);
  }
}

await updateSitemap();
console.log(`Generated ${HANZI_PROFILES.length * Object.keys(HANZI_LOCALES).length} Hanzi profile pages, 5 directory pages and sitemap entries.`);
