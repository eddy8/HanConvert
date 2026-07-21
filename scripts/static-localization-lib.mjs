import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const localePrefixes = {
  "zh-CN": "",
  "zh-TW": "zh-tw/",
  en: "en/",
  ja: "ja/",
  ko: "ko/"
};

const documentLanguages = {
  "zh-CN": "zh-CN",
  "zh-TW": "zh-Hant",
  en: "en",
  ja: "ja",
  ko: "ko"
};

const accessibilityLabels = {
  "zh-CN": { siteHeader: "网站页眉", primary: "主要导航", language: "界面语言", direction: "转换方向", actions: "转换操作", related: "相关转换页面", footer: "页脚" },
  "zh-TW": { siteHeader: "網站頁首", primary: "主要導覽", language: "介面語言", direction: "轉換方向", actions: "轉換操作", related: "相關轉換頁面", footer: "頁尾" },
  en: { siteHeader: "Site header", primary: "Primary navigation", language: "Interface language", direction: "Conversion direction", actions: "Conversion actions", related: "Related conversion pages", footer: "Footer" },
  ja: { siteHeader: "サイトヘッダー", primary: "メインナビゲーション", language: "表示言語", direction: "変換方向", actions: "変換操作", related: "関連変換ページ", footer: "フッター" },
  ko: { siteHeader: "사이트 헤더", primary: "주요 탐색", language: "인터페이스 언어", direction: "변환 방향", actions: "변환 작업", related: "관련 변환 페이지", footer: "바닥글" }
};

function extractObject(source, name, nextName) {
  const declaration = `const ${name} = `;
  const start = source.indexOf(declaration);
  const end = source.indexOf(`\n\nconst ${nextName}`, start + declaration.length);
  if (start < 0 || end < 0) throw new Error(`Could not extract ${name} from app.js`);
  const expression = source.slice(start + declaration.length, end).trim().replace(/;$/, "");
  return vm.runInNewContext(`(${expression})`, Object.create(null), { timeout: 1000 });
}

export async function loadLocalizationData(projectRoot) {
  const source = await readFile(path.join(projectRoot, "app.js"), "utf8");
  return {
    translations: extractObject(source, "translations", "landingPages"),
    landingPages: extractObject(source, "landingPages", "localePaths")
  };
}

export function getPageContext(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  let locale = "zh-CN";
  let route = normalized;
  for (const [candidate, prefix] of Object.entries(localePrefixes)) {
    if (prefix && normalized.startsWith(prefix)) {
      locale = candidate;
      route = normalized.slice(prefix.length);
      break;
    }
  }
  const slug = route === "index.html" ? "" : route.replace(/\/index\.html$/, "").split("/")[0];
  return { locale, slug };
}

function escapeText(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeText(value).replaceAll('"', "&quot;");
}

function formatMessage(template, values) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function setAttribute(openingTag, name, value) {
  const escaped = escapeAttribute(value);
  const pattern = new RegExp(`(\\s${name}=")[^"]*(")`);
  if (pattern.test(openingTag)) return openingTag.replace(pattern, `$1${escaped}$2`);
  const close = openingTag.endsWith("/>") ? "/>" : ">";
  return `${openingTag.slice(0, -close.length)} ${name}="${escaped}"${close}`;
}

function removeAttribute(openingTag, name) {
  return openingTag.replace(new RegExp(`\\s${name}="[^"]*"`, "g"), "");
}

function setClassState(openingTag, className, enabled) {
  const classMatch = openingTag.match(/\sclass="([^"]*)"/);
  if (!classMatch) return openingTag;
  const classes = new Set(classMatch[1].split(/\s+/).filter(Boolean));
  if (enabled) classes.add(className);
  else classes.delete(className);
  return openingTag.replace(classMatch[0], ` class="${[...classes].join(" ")}"`);
}

function setAttributeById(html, id, name, value) {
  const pattern = new RegExp(`<([a-z][\\w-]*)\\b([^>]*\\bid="${id}"[^>]*)>`, "i");
  return html.replace(pattern, (opening) => setAttribute(opening, name, value));
}

function setAriaLabelByClass(html, className, value) {
  const pattern = new RegExp(`<([a-z][\\w-]*)\\b([^>]*\\bclass="[^"]*\\b${className}\\b[^"]*"[^>]*)>`, "i");
  return html.replace(pattern, (opening) => setAttribute(opening, "aria-label", value));
}

function localizedPath(locale, slug = "") {
  const prefix = localePrefixes[locale];
  return `/${prefix}${slug ? `${slug}/` : ""}`;
}

export function localizeConverterHtml(source, relativePath, data) {
  const { locale, slug } = getPageContext(relativePath);
  const base = data.translations[locale];
  if (!base) throw new Error(`${relativePath}: unsupported locale ${locale}`);
  const landing = slug ? data.landingPages[slug] : null;
  if (slug && !landing) return source;
  const dictionary = { ...base, ...(landing?.content?.[locale] || {}) };
  const defaultConfig = landing?.defaultConfig || "s2t";
  let html = source;

  html = html.replace(/<html lang="[^"]+">/, `<html lang="${documentLanguages[locale]}">`);

  html = html.replace(
    /<([a-z][\w-]*)([^>]*\bdata-i18n="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/gi,
    (_, tag, attributes, key) => {
      if (!(key in dictionary)) throw new Error(`${relativePath}: missing translation key ${key}`);
      return `<${tag}${attributes}>${escapeText(dictionary[key])}</${tag}>`;
    }
  );

  html = html.replace(
    /<([a-z][\w-]*)([^>]*\bdata-i18n-attr="([^"]+)"[^>]*)>/gi,
    (_, tag, attributes, specification) => {
      let opening = `<${tag}${attributes}>`;
      for (const pair of specification.split(",")) {
        const [attribute, key] = pair.split(":");
        if (!(key in dictionary)) throw new Error(`${relativePath}: missing attribute translation key ${key}`);
        opening = setAttribute(opening, attribute, dictionary[key]);
      }
      return opening;
    }
  );

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeText(dictionary.pageTitle)}</title>`);
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeAttribute(dictionary.pageDescription)}$2`);
  html = setAttributeById(html, "homeBrand", "href", localizedPath(locale));
  html = setAttributeById(html, "homeLink", "href", localizedPath(locale));
  html = setAttributeById(html, "localeSelect", "aria-label", accessibilityLabels[locale].language);

  html = html.replace(/<option\s+value="(zh-CN|zh-TW|en|ja|ko)"([^>]*)>/g, (opening, value) => {
    const cleaned = removeAttribute(opening, "selected");
    return value === locale ? setAttribute(cleaned, "selected", "selected") : cleaned;
  });
  html = html.replace(/<option\s+value="(s2t|t2s|s2tw|s2twp|s2hk|s2hkp|tw2s|tw2sp|hk2s|hk2sp|t2tw|tw2t|t2hk|hk2t|jp2t|t2jp)"([^>]*)>/g, (opening, value) => {
    const cleaned = removeAttribute(opening, "selected");
    return value === defaultConfig ? setAttribute(cleaned, "selected", "selected") : cleaned;
  });
  html = html.replace(/<button\b([^>]*\bdata-config="([^"]+)"[^>]*)>/g, (opening, _attributes, config) => {
    let updated = setClassState(opening, "is-active", config === defaultConfig);
    updated = setAttribute(updated, "aria-checked", String(config === defaultConfig));
    return updated;
  });
  html = html.replace(/<a\b([^>]*\bdata-route="([^"]+)"[^>]*)>/g, (opening, _attributes, route) => {
    let updated = setAttribute(opening, "href", localizedPath(locale, route));
    updated = removeAttribute(updated, "aria-current");
    return route === slug ? setAttribute(updated, "aria-current", "page") : updated;
  });
  html = html.replace(/(<span\b[^>]*\bid="customDictionaryCount"[^>]*>)[\s\S]*?(<\/span>)/, `$1${escapeText(formatMessage(dictionary.customDictionaryCount, { enabled: 0, total: 0 }))}$2`);

  html = setAriaLabelByClass(html, "site-header", accessibilityLabels[locale].siteHeader);
  html = setAriaLabelByClass(html, "top-actions", accessibilityLabels[locale].primary);
  html = setAriaLabelByClass(html, "mode-strip", accessibilityLabels[locale].direction);
  html = setAriaLabelByClass(html, "center-controls", accessibilityLabels[locale].actions);
  html = setAriaLabelByClass(html, "landing-links", accessibilityLabels[locale].related);
  html = setAriaLabelByClass(html, "footer-links", accessibilityLabels[locale].footer);
  return html;
}
