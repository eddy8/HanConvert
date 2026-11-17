import { CONVERTER_FAQ, CONVERTER_FAQ_SLUGS } from "./converter-faq-data.mjs";

export const SITE_ORIGIN = "https://jianfan.app";
export const FAQ_MARKER_START = "      <!-- converter-faq:start -->";
export const FAQ_MARKER_END = "      <!-- converter-faq:end -->";
export const LOCALE_PREFIXES = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };

export function converterFaqPages() {
  return CONVERTER_FAQ_SLUGS.flatMap((slug) =>
    Object.entries(LOCALE_PREFIXES).map(([locale, prefix]) => ({
      slug,
      locale,
      file: `${prefix}${slug ? `${slug}/` : ""}index.html`,
      canonical: `${SITE_ORIGIN}/${prefix}${slug ? `${slug}/` : ""}`,
      faq: CONVERTER_FAQ[slug][locale]
    }))
  );
}

export function converterFaqForCanonical(canonical) {
  return converterFaqPages().find((page) => page.canonical === canonical) ?? null;
}

const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildFaqSection(faq) {
  const items = faq.items.map(([question, answer]) => `        <details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`);
  return [
    FAQ_MARKER_START,
    '      <section class="pinyin-faq converter-faq" aria-labelledby="converterFaqTitle">',
    `        <h2 id="converterFaqTitle">${escapeHtml(faq.title)}</h2>`,
    `        <p class="converter-faq-lead">${escapeHtml(faq.lead)}</p>`,
    ...items,
    "      </section>",
    FAQ_MARKER_END
  ].join("\n");
}

export function buildFaqSchemaNode(canonical, faq) {
  return {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: faq.items.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  };
}
