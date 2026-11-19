// Context-aware Pinyin for Traditional Chinese, shared by the Pinyin and photo OCR tools.
//
// pinyin-pro ships an empty Traditional dictionary, so `traditional: true` alone reads many
// Traditional polyphones wrongly (還是 as huán, 銀行 as xíng, 重慶 as zhòng). The official
// @pinyin-pro/data table (vendor/pinyin-pro-traditional.json) maps each Traditional character to
// exactly one Simplified character. Reading the mapped Simplified text gives the word context
// pinyin-pro needs; for `type: "all"` results the original characters are put back by position.
(function (root, factory) {
  "use strict";

  const api = factory();
  root.JianfanTraditionalPinyin = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";

  const MAP_URL = "/vendor/pinyin-pro-traditional.json";
  let table = null;
  let loading = null;

  function setTable(value) {
    table = value && typeof value === "object" ? value : null;
    return table;
  }

  function load() {
    if (table) return Promise.resolve(table);
    if (!loading && typeof fetch === "function") {
      loading = fetch(MAP_URL)
        .then((response) => (response.ok ? response.json() : null))
        .then(setTable)
        .catch(() => null);
    }
    return loading || Promise.resolve(null);
  }

  function simplify(text, map = table) {
    if (!map) return text;
    return [...text].map((character) => map[character] || character).join("");
  }

  // Same signature and result shape as pinyinPro.pinyin(text, options).
  function pinyin(pinyinPro, text, options = {}, map = table) {
    if (!map) return pinyinPro.pinyin(text, { ...options, traditional: true });
    const simplifiedOptions = { ...options, traditional: false };
    const simplified = simplify(text, map);
    if (options.type !== "all") return pinyinPro.pinyin(simplified, simplifiedOptions);

    const characters = [...text];
    let index = 0;
    return pinyinPro.pinyin(simplified, simplifiedOptions).map((item) => {
      const length = [...item.origin].length;
      const origin = characters.slice(index, index + length).join("");
      index += length;
      return { ...item, origin };
    });
  }

  return { MAP_URL, load, setTable, simplify, pinyin };
});
