import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  BLOG_ARTICLE_MAP,
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  BLOG_INDEX,
  BLOG_PUBLISHED_DATE
} from "./blog-data.mjs";
import {
  getMetadataLengthRange,
  SEO_TITLE_SUFFIX,
  visibleMetadataLength,
  visibleTitleContentLength
} from "./seo-metadata-rules.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const checkOnly = process.argv.includes("--check");
const blogDirectory = path.join(projectRoot, "blog");
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const sitemapMarkerStart = "  <!-- blog:start -->";
const sitemapMarkerEnd = "  <!-- blog:end -->";
const guideMarkerPattern = /\s*<!-- blog-guide-links:start -->[\s\S]*?<!-- blog-guide-links:end -->\s*/u;
const homeMarkerPattern = /\s*<!-- blog-home-link:start -->[\s\S]*?<!-- blog-home-link:end -->\s*/u;

const guideTargets = Object.freeze([
  Object.freeze({
    path: "simplified-to-traditional/index.html",
    slug: "simplified-traditional-chinese-differences",
    title: "简体、繁体、台湾与香港用词怎么选",
    description: "了解通用繁体、台湾正体和香港繁体的区别，再根据目标读者选择转换模式。"
  }),
  Object.freeze({
    path: "file-text-converter/index.html",
    slug: "convert-word-pdf-excel-txt-chinese",
    title: "文件简繁转换与格式处理指南",
    description: "比较 Word、PDF、Excel、TXT 的文字提取方式，以及转换后需要人工恢复的格式。"
  }),
  Object.freeze({
    path: "chinese-character-lookup/index.html",
    slug: "find-chinese-character-methods",
    title: "不认识的汉字应该怎么查",
    description: "根据现有线索选择部件查字、手写识别或拍照识字，并学会核对形近字。"
  }),
  Object.freeze({
    path: "photo-chinese-character-recognition/index.html",
    slug: "photo-vs-handwriting-chinese-recognition",
    title: "拍照识字还是手写汉字识别",
    description: "比较图片 OCR 和笔画轨迹识别的适用场景、隐私处理与提高成功率的方法。"
  }),
  Object.freeze({
    path: "chinese-stroke-order/index.html",
    slug: "chinese-japanese-stroke-order-differences",
    title: "中文与日本汉字笔顺不能直接混用",
    description: "了解不同地区字形和笔顺资料的差别，为中文或日语学习选择正确页面。"
  }),
  Object.freeze({
    path: "han-character-worksheet/index.html",
    slug: "chinese-character-worksheet-guide",
    title: "田字格、米字格和描红练习怎么选",
    description: "按学习阶段设置示范格、描红、拼音、笔顺和空白练习，并正确打印练习纸。"
  }),
  Object.freeze({
    path: "japanese-chinese-kanji-converter/index.html",
    slug: "chinese-japanese-kanji-differences",
    title: "中文汉字与日本汉字有什么区别",
    description: "通过简体、繁体和日本新字体三栏对照，理解字形转换的能力与限制。"
  }),
  Object.freeze({
    path: "kanji-to-hiragana/index.html",
    slug: "kanji-reading-hiragana-romaji-furigana",
    title: "平假名、罗马字和振假名怎么选",
    description: "了解四种日文读音输出、上下文读音、多音词校对和罗马字体系选择。"
  })
]);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function publicPath(slug = "") {
  return slug ? `/blog/${slug}/` : "/blog/";
}

function canonicalUrl(slug = "") {
  return `${origin}${publicPath(slug)}`;
}

function validateMetadata(item, label) {
  const [titleMin, titleMax] = getMetadataLengthRange("zh-CN", "title");
  const [descriptionMin, descriptionMax] = getMetadataLengthRange("zh-CN", "description");
  const titleLength = visibleTitleContentLength(item.title);
  const descriptionLength = visibleMetadataLength(item.description);
  if (!item.title.endsWith(SEO_TITLE_SUFFIX)) throw new Error(`${label}: title must end with ${SEO_TITLE_SUFFIX}`);
  if (titleLength < titleMin || titleLength > titleMax) {
    throw new Error(`${label}: title content length ${titleLength} is outside ${titleMin}-${titleMax}`);
  }
  if (descriptionLength < descriptionMin || descriptionLength > descriptionMax) {
    throw new Error(`${label}: description length ${descriptionLength} is outside ${descriptionMin}-${descriptionMax}`);
  }
}

function alternateLinks(slug = "") {
  const url = canonicalUrl(slug);
  return `    <link rel="alternate" hreflang="zh-Hans" href="${url}" />
    <link rel="alternate" hreflang="x-default" href="${url}" />`;
}

function formatSchema(schema) {
  return JSON.stringify(schema, null, 2).split("\n").map((line) => `      ${line}`).join("\n");
}

function breadcrumbSchema(items, url) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function indexSchema() {
  const url = canonicalUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: BLOG_INDEX.heading,
        description: BLOG_INDEX.description,
        inLanguage: "zh-CN",
        isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` },
        mainEntity: { "@id": `${url}#articles` }
      },
      {
        "@type": "ItemList",
        "@id": `${url}#articles`,
        name: "JianFan.app 文字工具使用指南",
        numberOfItems: BLOG_ARTICLES.length,
        itemListElement: BLOG_ARTICLES.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: article.heading,
          url: canonicalUrl(article.slug)
        }))
      },
      breadcrumbSchema([
        { name: "网站首页", url: `${origin}/` },
        { name: BLOG_INDEX.heading, url }
      ], url)
    ]
  };
}

function articleSchema(article) {
  const url = canonicalUrl(article.slug);
  const blogPosting = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    headline: article.heading,
    description: article.description,
    datePublished: BLOG_PUBLISHED_DATE,
    dateModified: BLOG_PUBLISHED_DATE,
    inLanguage: "zh-CN",
    author: { "@type": "Organization", name: "JianFan.app 编辑", url: `${origin}/about/` },
    publisher: { "@type": "Organization", "@id": `${origin}/#organization`, name: "JianFan.app", url: `${origin}/`, logo: { "@type": "ImageObject", url: `${origin}/apple-touch-icon.png` } },
    isPartOf: { "@id": `${origin}/blog/#webpage` },
    keywords: [article.eyebrow, ...article.tools.map((tool) => tool.label)].join(", ")
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: article.heading,
        description: article.description,
        inLanguage: "zh-CN",
        isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` },
        mainEntity: { "@id": `${url}#article` }
      },
      blogPosting,
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: article.faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer }
        }))
      },
      breadcrumbSchema([
        { name: "网站首页", url: `${origin}/` },
        { name: BLOG_INDEX.heading, url: canonicalUrl() },
        { name: article.heading, url }
      ], url)
    ]
  };
}

function renderHeader() {
  return `    <a class="skip-nav" href="#main">跳到主要内容</a>
    <header class="site-header" aria-label="网站页眉">
      <a class="brand" href="/" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">字</span><span class="brand-text">JianFan.app</span></a>
      <nav class="top-actions" aria-label="主要导航">
        <a class="nav-link" href="/">网站首页</a>
        <a class="nav-link" href="/blog/" aria-current="page">使用指南</a>
      </nav>
    </header>`;
}

function renderFooter() {
  return `    <footer class="site-footer">
      <p>JianFan.app 提供中文、日文和韩文的在线文字工具，并通过使用指南说明适用场景、处理方式和功能边界。</p>
      <nav class="footer-links" aria-label="页脚">
        <a href="/blog/">使用指南</a>
        <a href="/about/">关于我们</a>
        <a href="/contact/">联系我们</a>
        <a href="/privacy/">隐私声明</a>
      </nav>
    </footer>`;
}

function renderSignal(items, className = "blog-signal") {
  return `<div class="${className}" aria-hidden="true">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function renderIndexCard(article) {
  const category = BLOG_CATEGORIES.find((item) => item.id === article.category);
  return `          <article class="blog-card">
            <div class="blog-card-meta"><span>${escapeHtml(category.label)}</span><span>${escapeHtml(article.readingTime)}</span></div>
            <h3><a href="${publicPath(article.slug)}">${escapeHtml(article.heading)}</a></h3>
            <p>${escapeHtml(article.summary)}</p>
            <a class="blog-card-link" href="${publicPath(article.slug)}" aria-label="阅读：${escapeHtml(article.heading)}">阅读指南 <span aria-hidden="true">→</span></a>
          </article>`;
}

function renderIndexPage() {
  const url = canonicalUrl();
  const schema = formatSchema(indexSchema());
  const categorySections = BLOG_CATEGORIES.map((category) => {
    const articles = BLOG_ARTICLES.filter((article) => article.category === category.id);
    return `      <section class="blog-category" id="${category.id}" aria-labelledby="${category.id}Title">
        <div class="blog-section-heading"><div><p class="section-kicker">${escapeHtml(category.label)}</p><h2 id="${category.id}Title">${escapeHtml(category.label)}指南</h2></div><p>${escapeHtml(category.description)}</p></div>
        <div class="blog-grid">
${articles.map(renderIndexCard).join("\n")}
        </div>
      </section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(BLOG_INDEX.description)}" />
    <title>${escapeHtml(BLOG_INDEX.title)}</title>
    <link rel="canonical" href="${url}" />
${alternateLinks()}
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${schema}
    </script>
    <!-- seo-schema:end -->
  </head>
  <body data-blog-page="index">
${renderHeader()}
    <main id="main" class="blog-main">
      <nav class="blog-breadcrumb" aria-label="面包屑"><a href="/">网站首页</a><span aria-hidden="true">/</span><span aria-current="page">使用指南</span></nav>
      <section class="blog-hero" aria-labelledby="pageTitle">
        <div><p class="eyebrow">JIANFAN EDITORIAL</p><h1 id="pageTitle">${escapeHtml(BLOG_INDEX.heading)}</h1><p class="lede">${escapeHtml(BLOG_INDEX.lede)}</p></div>
        ${renderSignal(["简⇄繁", "部件查字", "笔顺", "かな"])}
      </section>
      <nav class="blog-category-nav" aria-label="文章分类">
${BLOG_CATEGORIES.map((category) => `        <a href="#${category.id}"><strong>${escapeHtml(category.label)}</strong><span>${escapeHtml(category.description)}</span></a>`).join("\n")}
      </nav>
${categorySections}
      <section class="blog-editorial-note" aria-labelledby="editorialTitle">
        <div><p class="section-kicker">编辑原则</p><h2 id="editorialTitle">文章如何帮助你使用工具</h2></div>
        <div class="blog-editorial-points">
          <article><h3>从实际任务出发</h3><p>每篇指南先回答该用哪个工具，再说明具体操作，不把工具页已有文案换一种说法重复发布。</p></article>
          <article><h3>明确能力边界</h3><p>涉及文件格式、自动读音、OCR 和地区用词时，会说明哪些内容需要上传、哪些结果仍要人工核对。</p></article>
          <article><h3>持续按真实问题更新</h3><p>当功能、数据来源或用户常见问题发生变化时，文章会同步修改，并保留真实的更新时间。</p></article>
        </div>
      </section>
    </main>
${renderFooter()}
  </body>
</html>
`;
}

function renderTable(table) {
  if (!table) return "";
  return `        <div class="blog-table-wrap"><table><caption>${escapeHtml(table.caption)}</caption><thead><tr>${table.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderSection(section) {
  const paragraphs = section.paragraphs.map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`).join("\n");
  const steps = section.steps?.length
    ? `        <ol class="blog-steps">${section.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`
    : "";
  const note = section.note
    ? `        <aside class="blog-note"><strong>${escapeHtml(section.note.title)}</strong><p>${escapeHtml(section.note.body)}</p></aside>`
    : "";
  return `      <section id="${escapeHtml(section.id)}">
        <h2>${escapeHtml(section.title)}</h2>
${paragraphs}
${renderTable(section.table)}
${steps}
${note}
      </section>`;
}

function renderToolRail(article) {
  return `      <aside class="blog-tool-rail" aria-labelledby="articleToolsTitle">
        <p class="section-kicker">对应工具</p>
        <h2 id="articleToolsTitle">边看边操作</h2>
        <p>${escapeHtml(article.tools[0].note)}</p>
        <nav aria-label="本文对应工具">
${article.tools.map((tool, index) => `          <a href="${tool.href}"${index === 0 ? ' class="is-primary"' : ""}><strong>${escapeHtml(tool.label)}</strong><span>${escapeHtml(tool.note)}</span></a>`).join("\n")}
        </nav>
      </aside>`;
}

function renderArticlePage(article) {
  const url = canonicalUrl(article.slug);
  const category = BLOG_CATEGORIES.find((item) => item.id === article.category);
  const schema = formatSchema(articleSchema(article));
  const relatedArticles = article.related.map((slug) => BLOG_ARTICLE_MAP.get(slug)).filter(Boolean);
  const sources = article.sources.length
    ? `      <section class="blog-sources" aria-labelledby="sourcesTitle"><h2 id="sourcesTitle">相关资料</h2><p>本文结合本站工具的实际处理流程撰写，涉及的主要开源资料如下。</p><ul>${article.sources.map((source) => `<li><a href="${source.href}" rel="noopener noreferrer">${escapeHtml(source.label)}</a><span>${escapeHtml(source.note)}</span></li>`).join("")}</ul></section>`
    : "";

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(article.description)}" />
    <title>${escapeHtml(article.title)}</title>
    <link rel="canonical" href="${url}" />
${alternateLinks(article.slug)}
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${schema}
    </script>
    <!-- seo-schema:end -->
  </head>
  <body data-blog-page="article" data-article-slug="${escapeHtml(article.slug)}">
${renderHeader()}
    <main id="main" class="blog-main blog-article-main">
      <nav class="blog-breadcrumb" aria-label="面包屑"><a href="/">网站首页</a><span aria-hidden="true">/</span><a href="/blog/">使用指南</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(category.label)}</span></nav>
      <article class="blog-article">
        <header class="blog-article-hero">
          <div><p class="eyebrow">${escapeHtml(article.eyebrow)}</p><h1 id="pageTitle">${escapeHtml(article.heading)}</h1><p class="lede">${escapeHtml(article.summary)}</p><div class="blog-article-meta"><span>JianFan.app 编辑</span><time datetime="${BLOG_PUBLISHED_DATE}">2026 年 8 月 29 日</time><span>${escapeHtml(article.readingTime)}</span></div></div>
          ${renderSignal(article.signal, "blog-article-signal")}
        </header>
        <div class="blog-article-layout">
          <aside class="blog-toc"><p class="section-kicker">本文目录</p><nav aria-label="本文目录">${article.sections.map((section) => `<a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a>`).join("")}<a href="#faq">常见问题</a></nav></aside>
          <div class="blog-article-body">
${article.intro.map((paragraph) => `      <p class="blog-intro">${escapeHtml(paragraph)}</p>`).join("\n")}
${article.sections.map(renderSection).join("\n")}
      <section id="faq" class="blog-faq"><h2>常见问题</h2>${article.faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("")}</section>
${sources}
          </div>
${renderToolRail(article)}
        </div>
      </article>
      <section class="blog-related" aria-labelledby="relatedTitle"><div class="blog-section-heading"><div><p class="section-kicker">继续阅读</p><h2 id="relatedTitle">相关使用指南</h2></div><a href="/blog/">查看全部文章</a></div><div class="blog-grid">${relatedArticles.map(renderIndexCard).join("")}</div></section>
    </main>
${renderFooter()}
  </body>
</html>
`;
}

function buildToolGuide(target) {
  return `      <!-- blog-guide-links:start -->
      <section class="tool-guide-strip" aria-labelledby="blogGuideTitle">
        <div><p class="section-kicker">使用指南</p><h2 id="blogGuideTitle">${escapeHtml(target.title)}</h2><p>${escapeHtml(target.description)}</p></div>
        <a href="${publicPath(target.slug)}">阅读完整指南 <span aria-hidden="true">→</span></a>
      </section>
      <!-- blog-guide-links:end -->`;
}

async function writeOrCheck(filePath, output) {
  if (checkOnly) {
    const current = await readFile(filePath, "utf8");
    if (current !== output) throw new Error(`${path.relative(projectRoot, filePath)} is out of sync with the blog generator`);
    return;
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, output, "utf8");
}

async function syncToolGuides() {
  for (const target of guideTargets) {
    const filePath = path.join(projectRoot, target.path);
    const source = await readFile(filePath, "utf8");
    const withoutGuide = source.replace(guideMarkerPattern, "\n");
    const output = withoutGuide.replace(/^\s*<\/main>/mu, `${buildToolGuide(target)}\n    </main>`);
    if (output === withoutGuide) throw new Error(`${target.path}: missing </main> for blog guide link`);
    await writeOrCheck(filePath, output);
  }
}

async function syncHomeLink() {
  const filePath = path.join(projectRoot, "index.html");
  const source = await readFile(filePath, "utf8");
  const withoutLink = source
    .replace(homeMarkerPattern, "\n")
    .replace(/(<nav class="footer-links" aria-label="页脚">\n)\s*(<a href="\/about\/">)/u, "$1        $2");
  const footerPattern = /(<nav class="footer-links" aria-label="页脚">)/u;
  const output = withoutLink.replace(footerPattern, `$1\n        <!-- blog-home-link:start -->\n        <a href="/blog/">使用指南</a>\n        <!-- blog-home-link:end -->`);
  if (output === withoutLink) throw new Error("index.html: missing Simplified Chinese footer navigation");
  await writeOrCheck(filePath, output);
}

function sitemapBlock(slug = "") {
  const url = canonicalUrl(slug);
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${BLOG_PUBLISHED_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${slug ? "0.7" : "0.8"}</priority>
    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${url}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />
  </url>`;
}

async function syncSitemap() {
  const source = await readFile(sitemapPath, "utf8");
  const section = `${sitemapMarkerStart}\n${[sitemapBlock(), ...BLOG_ARTICLES.map((article) => sitemapBlock(article.slug))].join("\n")}\n${sitemapMarkerEnd}`;
  const output = source.includes(sitemapMarkerStart)
    ? source.replace(new RegExp(`${sitemapMarkerStart}[\\s\\S]*?${sitemapMarkerEnd}`, "u"), section)
    : source.replace("</urlset>", `${section}\n</urlset>`);
  await writeOrCheck(sitemapPath, output);
}

validateMetadata(BLOG_INDEX, "blog index");
for (const article of BLOG_ARTICLES) validateMetadata(article, `blog/${article.slug}`);

await writeOrCheck(path.join(blogDirectory, "index.html"), renderIndexPage());
for (const article of BLOG_ARTICLES) {
  await writeOrCheck(path.join(blogDirectory, article.slug, "index.html"), renderArticlePage(article));
}
await syncToolGuides();
await syncHomeLink();
await syncSitemap();

console.log(`${checkOnly ? "Checked" : "Generated"} 1 blog index, ${BLOG_ARTICLES.length} articles, ${guideTargets.length} tool guide links, and sitemap entries.`);
