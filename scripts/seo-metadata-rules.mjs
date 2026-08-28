export const SEO_METADATA_LENGTH_RANGES = Object.freeze({
  "zh-CN": Object.freeze({ title: Object.freeze([22, 35]), description: Object.freeze([65, 90]) }),
  "zh-TW": Object.freeze({ title: Object.freeze([22, 35]), description: Object.freeze([65, 90]) }),
  en: Object.freeze({ title: Object.freeze([50, 65]), description: Object.freeze([120, 160]) }),
  ja: Object.freeze({ title: Object.freeze([22, 35]), description: Object.freeze([65, 90]) }),
  ko: Object.freeze({ title: Object.freeze([22, 35]), description: Object.freeze([65, 90]) })
});

export const SEO_TITLE_SUFFIX = " | JianFan.app";

const managedSlugs = [
  "traditional-to-simplified",
  "chinese-handwriting-recognition",
  "taiwan-traditional"
];

const localePrefixes = ["", "zh-tw/", "en/", "ja/", "ko/"];

export const LOCALIZED_METADATA_PATHS = new Set([
  ...managedSlugs.flatMap((slug) => localePrefixes.map((prefix) => `${prefix}${slug}/index.html`)),
  "zh-tw/about/index.html",
  "zh-tw/contact/index.html",
  "ja/about/index.html",
  "ja/contact/index.html",
  "privacy/index.html",
  "zh-tw/kanji-to-romaji/index.html",
  "ko/word-to-txt/index.html",
  "en/japanese-characters/index.html"
]);

export const LOCALIZED_SEO_DESCRIPTION_SLUGS = new Set(["traditional-to-simplified"]);

export function decodeHtmlText(value) {
  const namedEntities = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"' };
  return String(value).replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi, (entity, decimal, hexadecimal, named) => {
    if (decimal) return String.fromCodePoint(Number(decimal));
    if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
    return namedEntities[named.toLowerCase()] ?? entity;
  });
}

export function visibleMetadataLength(value) {
  return [...decodeHtmlText(value)].length;
}

export function getTitleContent(value) {
  const title = decodeHtmlText(value).trim();
  return title.endsWith(SEO_TITLE_SUFFIX)
    ? title.slice(0, -SEO_TITLE_SUFFIX.length).trimEnd()
    : title;
}

export function visibleTitleContentLength(value) {
  return [...getTitleContent(value)].length;
}

export function getMetadataLengthRange(locale, field) {
  const range = SEO_METADATA_LENGTH_RANGES[locale]?.[field];
  if (!range) throw new Error(`Missing SEO metadata length range for ${locale}/${field}`);
  return range;
}
