import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dictionaryPath = process.argv[2];
const unihanDirectory = process.argv[3];
const outputDirectory = path.join(projectRoot, "data", "han-character-lookup");
const hanPattern = /^\p{Script=Han}$/u;
const rankingFlags = Object.freeze({
  mainlandStandard: 1,
  joyo: 2,
  jinmeiyo: 4,
  koreanEducation: 8,
  koreanName: 16
});

const sources = {
  makeMeAHanzi: {
    commit: "bddc96d41bef78427ed0e034e9f7e31d71fd1b92",
    url: "https://github.com/skishore/makemeahanzi"
  },
  unihan: {
    version: "17.0.0",
    url: "https://www.unicode.org/reports/tr38/"
  }
};

if (!dictionaryPath || !unihanDirectory) {
  throw new Error("Usage: node scripts/generate-han-character-data.mjs <dictionary.txt> <Unihan directory>");
}

function encodeMatches(matches) {
  return matches
    .map((match) => {
      if (match === null) return "x";
      if (!match.length) return "r";
      return match.join("");
    })
    .join(",");
}

function parseVariantCharacters(value) {
  return [...new Set(
    [...value.matchAll(/U\+([0-9A-F]{4,6})/g)].map((match) => String.fromCodePoint(Number.parseInt(match[1], 16)))
  )];
}

function shardName(character) {
  return (character.codePointAt(0) >> 8).toString(16).padStart(2, "0");
}

function setIfPresent(target, key, value) {
  if (value !== undefined && value !== null && value !== "") target[key] = value;
}

function parseFrequency(value) {
  return [...String(value).matchAll(/\((\d+)\)/g)].reduce((total, match) => total + Number.parseInt(match[1], 10), 0);
}

function addRankingFlag(record, flag) {
  record.x = (record.x || 0) | flag;
}

function addUnihanValue(records, codePoint, property, value) {
  const character = String.fromCodePoint(codePoint);
  const record = records.get(character);
  if (!record) return;

  if (property === "kDefinition") setIfPresent(record, "g", value);
  if (property === "kHanyuPinlu") setIfPresent(record, "f", parseFrequency(value));
  if (property === "kJapaneseOn") setIfPresent(record, "jo", value);
  if (property === "kJapaneseKun") setIfPresent(record, "jk", value);
  if (property === "kCantonese") setIfPresent(record, "c", value);
  if (property === "kMandarin" && !record.p?.length) record.p = [value];
  if (property === "kHangul") {
    const readings = [...new Set(value.split(/\s+/).map((item) => item.split(":")[0]).filter(Boolean))];
    if (readings.length) record.ko = readings;
  }
  if (property === "kTotalStrokes") setIfPresent(record, "s", value);
  if (property === "kGradeLevel") setIfPresent(record, "q", Number.parseInt(value, 10));
  if (property === "kSimplifiedVariant") record.vs = parseVariantCharacters(value);
  if (property === "kTraditionalVariant") record.vt = parseVariantCharacters(value);
  if (property === "kTGH") addRankingFlag(record, rankingFlags.mainlandStandard);
  if (property === "kJoyoKanji") addRankingFlag(record, rankingFlags.joyo);
  if (property === "kJinmeiyoKanji") addRankingFlag(record, rankingFlags.jinmeiyo);
  if (property === "kKoreanEducationHanja") addRankingFlag(record, rankingFlags.koreanEducation);
  if (property === "kKoreanName") addRankingFlag(record, rankingFlags.koreanName);
}

async function mergeUnihanFile(records, filename, properties) {
  const text = await readFile(path.join(unihanDirectory, filename), "utf8");
  for (const line of text.split("\n")) {
    if (!line.startsWith("U+")) continue;
    const [code, property, value] = line.split("\t");
    if (!properties.has(property) || !value) continue;
    addUnihanValue(records, Number.parseInt(code.slice(2), 16), property, value);
  }
}

const dictionaryText = await readFile(dictionaryPath, "utf8");
const records = new Map();

for (const line of dictionaryText.split("\n")) {
  if (!line.trim()) continue;
  const source = JSON.parse(line);
  const record = {
    p: source.pinyin || [],
    d: source.decomposition,
    r: source.radical,
    m: encodeMatches(source.matches || [])
  };
  if (source.definition) record.g = source.definition;
  if (source.etymology?.type) {
    record.e = { t: source.etymology.type };
    setIfPresent(record.e, "s", source.etymology.semantic);
    setIfPresent(record.e, "p", source.etymology.phonetic);
  }
  records.set(source.character, record);
}

await mergeUnihanFile(records, "Unihan_Readings.txt", new Set([
  "kCantonese",
  "kDefinition",
  "kHangul",
  "kHanyuPinlu",
  "kJapaneseKun",
  "kJapaneseOn",
  "kMandarin"
]));
await mergeUnihanFile(records, "Unihan_IRGSources.txt", new Set(["kTotalStrokes"]));
await mergeUnihanFile(records, "Unihan_Variants.txt", new Set(["kSimplifiedVariant", "kTraditionalVariant"]));
await mergeUnihanFile(records, "Unihan_DictionaryLikeData.txt", new Set(["kGradeLevel"]));
await mergeUnihanFile(records, "Unihan_OtherMappings.txt", new Set([
  "kJinmeiyoKanji",
  "kJoyoKanji",
  "kKoreanEducationHanja",
  "kKoreanName",
  "kTGH"
]));

const componentCandidates = new Map();
const ranking = new Map();

for (const [character, record] of records) {
  ranking.set(character, { f: record.f || 0, q: record.q || 0, x: record.x || 0 });
}

for (const [, record] of records) {
  for (const variant of [...(record.vs || []), ...(record.vt || [])]) {
    const target = ranking.get(variant);
    if (!target) continue;
    target.f = Math.max(target.f, record.f || 0);
    if (record.q && (!target.q || record.q < target.q)) target.q = record.q;
  }
}

for (const [character, record] of records) {
  const counts = new Map();
  for (const component of Array.from(record.d || "")) {
    if (hanPattern.test(component)) counts.set(component, (counts.get(component) || 0) + 1);
  }
  if (hanPattern.test(record.r || "") && !counts.has(record.r)) counts.set(record.r, 1);
  if (!counts.has(character)) counts.set(character, 1);

  for (const [component, count] of counts) {
    if (!componentCandidates.has(component)) componentCandidates.set(component, new Map());
    componentCandidates.get(component).set(character, count);
  }
}

const componentIndex = { version: 1, records: records.size, components: {}, repeated: {}, meta: {} };
for (const [component, candidates] of [...componentCandidates].sort(([left], [right]) => left.codePointAt(0) - right.codePointAt(0))) {
  const ordered = [...candidates].sort(([left], [right]) => left.codePointAt(0) - right.codePointAt(0));
  componentIndex.components[component] = ordered.map(([character]) => character).join("");
  const repeated = Object.fromEntries(ordered.filter(([, count]) => count > 1));
  if (Object.keys(repeated).length) componentIndex.repeated[component] = repeated;
}

for (const [character, record] of [...records].sort(([left], [right]) => left.codePointAt(0) - right.codePointAt(0))) {
  const rank = ranking.get(character);
  componentIndex.meta[character] = [
    Number.parseInt(record.s, 10) || (record.m ? record.m.split(",").length : 0),
    rank.f,
    rank.q,
    rank.x,
    record.p?.[0] || ""
  ];
}

const shards = new Map();
for (const [character, record] of [...records.entries()].sort(([left], [right]) => left.codePointAt(0) - right.codePointAt(0))) {
  const name = shardName(character);
  if (!shards.has(name)) shards.set(name, {});
  shards.get(name)[character] = record;
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
for (const [name, data] of shards) {
  await writeFile(path.join(outputDirectory, `${name}.json`), `${JSON.stringify(data)}\n`);
}
await writeFile(path.join(outputDirectory, "components.json"), `${JSON.stringify(componentIndex)}\n`);
await writeFile(
  path.join(outputDirectory, "manifest.json"),
  `${JSON.stringify({ records: records.size, shards: [...shards.keys()], components: componentCandidates.size, sources }, null, 2)}\n`
);

console.log(`Generated ${records.size} Han-character records in ${shards.size} shards with ${componentCandidates.size} searchable components.`);
