import assert from "node:assert/strict";
import test from "node:test";

import {
  SEO_DESCRIPTIONS,
  TARGET_META_DESCRIPTION_LENGTH
} from "../scripts/seo-descriptions.mjs";
import {
  getMetadataLengthRange,
  LOCALIZED_SEO_DESCRIPTION_SLUGS,
  visibleMetadataLength
} from "../scripts/seo-metadata-rules.mjs";

const expectedSlugs = [
  "photo-chinese-character-recognition",
  "file-text-converter",
  "japanese-chinese-kanji-converter",
  "simplified-to-traditional",
  "hong-kong-traditional",
  "traditional-to-simplified",
  "japanese-kanji-converter",
  "character-counter",
  "chinese-stroke-order",
  "chinese-character-lookup",
  "han-character-worksheet"
];
const expectedLocales = ["zh-CN", "zh-TW", "en", "ja", "ko"];

test("keeps targeted multilingual meta descriptions within their managed length ranges", () => {
  assert.deepEqual(Object.keys(SEO_DESCRIPTIONS), expectedSlugs);
  for (const slug of expectedSlugs) {
    assert.deepEqual(Object.keys(SEO_DESCRIPTIONS[slug]), expectedLocales);
    for (const [locale, description] of Object.entries(SEO_DESCRIPTIONS[slug])) {
      const length = visibleMetadataLength(description);
      const [min, max] = LOCALIZED_SEO_DESCRIPTION_SLUGS.has(slug)
        ? getMetadataLengthRange(locale, "description")
        : [TARGET_META_DESCRIPTION_LENGTH.min, TARGET_META_DESCRIPTION_LENGTH.max];
      assert.ok(
        length >= min && length <= max,
        `${slug}/${locale} has ${length} characters`
      );
    }
  }
});

test("preserves the primary search intent in Chinese and English descriptions", () => {
  const terms = {
    "photo-chinese-character-recognition": ["在线拍照汉字识别", "Recognize Chinese characters from photos"],
    "file-text-converter": ["Word", "Word"],
    "japanese-chinese-kanji-converter": ["日中汉字转换", "Chinese to Japanese kanji"],
    "simplified-to-traditional": ["简体转繁体", "Simplified Chinese"],
    "hong-kong-traditional": ["香港繁体", "Hong Kong"],
    "traditional-to-simplified": ["繁体转简体", "Traditional Chinese"],
    "japanese-kanji-converter": ["新字体旧字体", "Shinjitai"],
    "character-counter": ["字数统计", "character counter"],
    "chinese-stroke-order": ["汉字笔顺", "stroke order"],
    "chinese-character-lookup": ["汉字查询", "Chinese character"],
    "han-character-worksheet": ["Chinese practice sheet generator", "Chinese practice sheet generator"]
  };

  for (const [slug, [chineseTerm, englishTerm]] of Object.entries(terms)) {
    assert.ok(SEO_DESCRIPTIONS[slug]["zh-CN"].includes(chineseTerm), `${slug}/zh-CN is missing ${chineseTerm}`);
    assert.ok(SEO_DESCRIPTIONS[slug].en.includes(englishTerm), `${slug}/en is missing ${englishTerm}`);
  }
});
