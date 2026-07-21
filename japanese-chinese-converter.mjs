export const JAPANESE_CHINESE_SOURCE_TYPES = ["japanese", "simplified", "traditional"];
export const DEFAULT_THREE_WAY_COMPARISON_LIMIT = 200;

export async function convertJapaneseChineseText(inputValue, sourceType, convert) {
  const input = String(inputValue ?? "");
  if (!JAPANESE_CHINESE_SOURCE_TYPES.includes(sourceType)) {
    throw new TypeError(`Unsupported source type: ${sourceType}`);
  }
  if (typeof convert !== "function") throw new TypeError("convert must be a function");

  if (sourceType === "japanese") {
    const traditional = await convert("jp2t", input);
    return {
      japanese: input,
      simplified: await convert("t2s", traditional),
      traditional
    };
  }

  if (sourceType === "simplified") {
    const traditional = await convert("s2t", input);
    return {
      japanese: await convert("t2jp", traditional),
      simplified: input,
      traditional
    };
  }

  return {
    japanese: await convert("t2jp", input),
    simplified: await convert("t2s", input),
    traditional: input
  };
}

export function buildThreeWayComparison(results, options = {}) {
  const japanese = [...String(results?.japanese ?? "")];
  const simplified = [...String(results?.simplified ?? "")];
  const traditional = [...String(results?.traditional ?? "")];
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : DEFAULT_THREE_WAY_COMPARISON_LIMIT;

  if (japanese.length !== simplified.length || japanese.length !== traditional.length) {
    return {
      rows: [],
      totalChanges: 0,
      uniqueChanges: 0,
      truncated: false,
      alignmentLimited: true
    };
  }

  const rowsByKey = new Map();
  let totalChanges = 0;

  for (let index = 0; index < japanese.length; index += 1) {
    const row = {
      japanese: japanese[index],
      simplified: simplified[index],
      traditional: traditional[index],
      count: 1
    };

    if (row.japanese === row.simplified && row.japanese === row.traditional) continue;
    totalChanges += 1;
    const key = `${row.japanese}\u0000${row.simplified}\u0000${row.traditional}`;
    const existing = rowsByKey.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      rowsByKey.set(key, row);
    }
  }

  return {
    rows: [...rowsByKey.values()].slice(0, limit),
    totalChanges,
    uniqueChanges: rowsByKey.size,
    truncated: rowsByKey.size > limit,
    alignmentLimited: false
  };
}
