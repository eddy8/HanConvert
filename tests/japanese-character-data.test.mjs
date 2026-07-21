import assert from "node:assert/strict";
import test from "node:test";

import {
  JAPANESE_CHARACTER_CATEGORIES,
  filterJapaneseCharacters
} from "../japanese-character-data.mjs";

test("provides comprehensive, unique character lists for every category", () => {
  const categoryIds = JAPANESE_CHARACTER_CATEGORIES.map((category) => category.id);
  assert.deepEqual(categoryIds, ["hiragana", "katakana", "halfwidth", "symbols"]);

  const totalEntries = JAPANESE_CHARACTER_CATEGORIES.reduce((total, category) => {
    assert.equal(new Set(category.entries.map((entry) => entry.character)).size, category.entries.length, category.id);
    return total + category.entries.length;
  }, 0);

  assert.ok(totalEntries >= 240);
});

test("derives matching hiragana and katakana readings", () => {
  const hiragana = JAPANESE_CHARACTER_CATEGORIES.find((category) => category.id === "hiragana");
  const katakana = JAPANESE_CHARACTER_CATEGORIES.find((category) => category.id === "katakana");
  assert.equal(hiragana.entries.length, katakana.entries.length);
  assert.deepEqual(katakana.entries.find((entry) => entry.character === "ガ"), { character: "ガ", reading: "ga" });
  assert.deepEqual(katakana.entries.find((entry) => entry.character === "ッ"), { character: "ッ", reading: "xtsu" });
});

test("filters by character, normalized width, or reading", () => {
  const halfwidth = JAPANESE_CHARACTER_CATEGORIES.find((category) => category.id === "halfwidth").entries;
  assert.deepEqual(filterJapaneseCharacters(halfwidth, "ﾌ").map((entry) => entry.character), ["ﾌ"]);
  assert.ok(filterJapaneseCharacters(halfwidth, "fu").some((entry) => entry.character === "ﾌ"));
  assert.ok(filterJapaneseCharacters(halfwidth, "フ").some((entry) => entry.character === "ﾌ"));
});
