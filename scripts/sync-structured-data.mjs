import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://jianfan.app";
const appAsset = "/app.js?v=20260719-seo1";
const schemaStart = "    <!-- seo-schema:start -->";
const schemaEnd = "    <!-- seo-schema:end -->";

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(entryPath)));
    if (entry.isFile() && entry.name === "index.html") files.push(entryPath);
  }
  return files;
}

function match(html, pattern, label) {
  const value = html.match(pattern)?.[1];
  if (!value) throw new Error(`Missing ${label}`);
  return value.trim();
}

function absoluteSeoLinks(html) {
  return html.replace(
    /(<link rel="(?:canonical|alternate)"[^>]+href=")\/(?!\/)([^"]*)(" \/>)/g,
    `$1${siteOrigin}/$2$3`
  );
}

function homeForLanguage(language) {
  if (language === "zh-Hant") return { name: "網站首頁", url: `${siteOrigin}/zh-tw/` };
  if (language === "en") return { name: "Home", url: `${siteOrigin}/en/` };
  if (language === "ja") return { name: "ホーム", url: `${siteOrigin}/ja/` };
  if (language === "ko") return { name: "홈", url: `${siteOrigin}/ko/` };
  return { name: "网站首页", url: `${siteOrigin}/` };
}

function buildSchema(html) {
  const language = match(html, /<html lang="([^"]+)"/, "html language");
  const title = match(html, /<title>([\s\S]*?)<\/title>/, "title");
  const name = title.replace(/\s*\|\s*JianFan\.app\s*$/, "");
  const description = match(
    html,
    /<meta\s+name="description"\s+content="([^"]+)"\s*\/>/,
    "meta description"
  );
  const canonical = match(html, /<link rel="canonical" href="([^"]+)" \/>/, "canonical URL");
  const home = homeForLanguage(language);
  const graph = [
    {
      "@type": "WebApplication",
      "@id": `${canonical}#webapp`,
      name,
      url: canonical,
      description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      inLanguage: language,
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        name: "JianFan.app",
        url: `${siteOrigin}/`
      }
    }
  ];

  if (canonical !== home.url) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: home.name,
          item: home.url
        },
        {
          "@type": "ListItem",
          position: 2,
          name,
          item: canonical
        }
      ]
    });
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");

  return `${schemaStart}\n    <script type="application/ld+json">\n${json}\n    </script>\n${schemaEnd}`;
}

for (const htmlPath of await findHtmlFiles(projectRoot)) {
  let html = await readFile(htmlPath, "utf8");
  html = absoluteSeoLinks(html);

  if (!html.includes('id="converterTitle"')) {
    await writeFile(htmlPath, html);
    continue;
  }

  html = html.replace(
    /\n    <!-- seo-schema:start -->[\s\S]*?    <!-- seo-schema:end -->/,
    ""
  );
  html = html.replace(/\/app\.js(?:\?[^"']*)?/, appAsset);
  html = html.replace("  </head>", `${buildSchema(html)}\n  </head>`);
  await writeFile(htmlPath, html);
}
