export const CUSTOM_DICTIONARY_STORAGE_KEY = "jianfan-custom-dictionary-v1";
export const MAX_CUSTOM_DICTIONARY_ENTRIES = 200;
export const MAX_CUSTOM_DICTIONARY_TERM_LENGTH = 200;

const TOKEN_RANGES = [
  [0xe000, 0xf8ff],
  [0xf0000, 0xffffd]
];
const PRIVATE_USE_PATTERN = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}]/gu;

export function normalizeCustomDictionaryEntries(value) {
  if (!Array.isArray(value)) return [];

  const entries = [];
  const sourceIndexes = new Map();

  for (const rawEntry of value) {
    if (!rawEntry || typeof rawEntry !== "object") continue;

    const source = typeof rawEntry.source === "string" ? rawEntry.source.trim() : "";
    const target = typeof rawEntry.target === "string" ? rawEntry.target.trim() : "";
    if (!source || !target) continue;
    if (source.length > MAX_CUSTOM_DICTIONARY_TERM_LENGTH || target.length > MAX_CUSTOM_DICTIONARY_TERM_LENGTH) {
      continue;
    }

    const entry = {
      id: typeof rawEntry.id === "string" && rawEntry.id ? rawEntry.id : `dictionary-${entries.length + 1}`,
      source,
      target,
      enabled: rawEntry.enabled !== false
    };

    if (sourceIndexes.has(source)) {
      entries[sourceIndexes.get(source)] = entry;
      continue;
    }

    sourceIndexes.set(source, entries.length);
    entries.push(entry);
    if (entries.length >= MAX_CUSTOM_DICTIONARY_ENTRIES) break;
  }

  return entries;
}

export function prepareCustomDictionaryConversion(OpenCC, entries, input) {
  const enabledEntries = normalizeCustomDictionaryEntries(entries)
    .filter((entry) => entry.enabled)
    .sort((left, right) => right.source.length - left.source.length);

  if (!enabledEntries.length || !input) {
    return { text: input, restore: (value) => value };
  }

  const usedTokens = new Set(input.match(PRIVATE_USE_PATTERN) || []);
  const protectionPairs = [];
  const restorationPairs = [];
  const tokenIterator = createTokenIterator(usedTokens);

  for (const entry of enabledEntries) {
    const token = tokenIterator.next().value;
    if (!token) throw new Error("No private-use characters remain for custom dictionary protection.");
    usedTokens.add(token);
    protectionPairs.push([entry.source, token]);
    restorationPairs.push([token, entry.target]);
  }

  const protect = OpenCC.CustomConverter(protectionPairs);
  const restore = OpenCC.CustomConverter(restorationPairs);
  return { text: protect(input), restore };
}

function* createTokenIterator(usedTokens) {
  for (const [start, end] of TOKEN_RANGES) {
    for (let codePoint = start; codePoint <= end; codePoint += 1) {
      const token = String.fromCodePoint(codePoint);
      if (!usedTokens.has(token)) yield token;
    }
  }
}

