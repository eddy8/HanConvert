import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dictionaryPath = process.argv[2];
const unihanDirectory = process.argv[3];
const outputDirectory = path.join(projectRoot, "data", "han-character-lookup");

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

function addUnihanValue(records, codePoint, property, value) {
  const character = String.fromCodePoint(codePoint);
  const record = records.get(character);
  if (!record) return;

  if (property === "kDefinition") setIfPresent(record, "g", value);
  if (property === "kJapaneseOn") setIfPresent(record, "jo", value);
  if (property === "kJapaneseKun") setIfPresent(record, "jk", value);
  if (property === "kCantonese") setIfPresent(record, "c", value);
  if (property === "kMandarin" && !record.p?.length) record.p = [value];
  if (property === "kHangul") {
    const readings = [...new Set(value.split(/\s+/).map((item) => item.split(":")[0]).filter(Boolean))];
    if (readings.length) record.ko = readings;
  }
  if (property === "kTotalStrokes") setIfPresent(record, "s", value);
  if (property === "kSimplifiedVariant") record.vs = parseVariantCharacters(value);
  if (property === "kTraditionalVariant") record.vt = parseVariantCharacters(value);
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
  "kJapaneseKun",
  "kJapaneseOn",
  "kMandarin"
]));
await mergeUnihanFile(records, "Unihan_IRGSources.txt", new Set(["kTotalStrokes"]));
await mergeUnihanFile(records, "Unihan_Variants.txt", new Set(["kSimplifiedVariant", "kTraditionalVariant"]));

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
await writeFile(
  path.join(outputDirectory, "manifest.json"),
  `${JSON.stringify({ records: records.size, shards: [...shards.keys()], sources }, null, 2)}\n`
);

console.log(`Generated ${records.size} Han-character records in ${shards.size} shards.`);
