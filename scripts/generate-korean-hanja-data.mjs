import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildReverseWordObject } from "./korean-hanja-reverse-build.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libhangulPath = process.argv[2];
const courtCacheDirectory = process.argv[3] || path.join("/private/tmp", "korean-court-hanja-cache");
const outputDirectory = path.join(projectRoot, "data", "korean-hanja");
const courtEndpoint = "https://efamily.scourt.go.kr/webhanja/whjsearch";
const hanPattern = /^\p{Script=Han}+$/u;
const hangulPattern = /^[가-힣]+$/u;

if (!libhangulPath) {
  throw new Error("Usage: node scripts/generate-korean-hanja-data.mjs <libhangul hanja.txt> [court cache directory]");
}

function parseLine(line) {
  const firstSeparator = line.indexOf(":");
  const secondSeparator = line.indexOf(":", firstSeparator + 1);
  if (firstSeparator <= 0 || secondSeparator < 0) return null;
  return {
    hangul: line.slice(0, firstSeparator).trim(),
    hanja: line.slice(firstSeparator + 1, secondSeparator).trim(),
    gloss: line.slice(secondSeparator + 1).trim()
  };
}

function addUnique(target, value) {
  if (value && !target.includes(value)) target.push(value);
}

function codePointKey(character) {
  return character.codePointAt(0).toString(16).padStart(5, "0");
}

async function loadHanLookupRecords() {
  const directory = path.join(projectRoot, "data", "han-character-lookup");
  const records = new Map();
  for (const filename of await readdir(directory)) {
    if (!/^[0-9a-f]+\.json$/u.test(filename)) continue;
    const shard = JSON.parse(await readFile(path.join(directory, filename), "utf8"));
    for (const [character, record] of Object.entries(shard)) records.set(character, record);
  }
  return records;
}

async function fetchCourtReading(reading) {
  const cachePath = path.join(courtCacheDirectory, `${reading.codePointAt(0).toString(16)}.json`);
  try {
    return JSON.parse(await readFile(cachePath, "utf8"));
  } catch {
    // Populate the local cache from the public query used by the court page.
  }

  const url = new URL(courtEndpoint);
  url.search = new URLSearchParams({
    mode: "listUnicodeByKsnd",
    ksnd: reading.codePointAt(0).toString(16),
    ext: "0",
    pgmode: "1",
    pgno: "1",
    pgsize: "10000"
  });

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload.errno !== 0 || !Array.isArray(payload.resultlist)) {
        throw new Error(payload.message || "Unexpected court response");
      }
      await writeFile(cachePath, `${JSON.stringify(payload)}\n`);
      return payload;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  throw new Error(`Court lookup failed for ${reading}: ${lastError?.message || lastError}`);
}

async function mapWithConcurrency(values, limit, operation) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await operation(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

const libhangulText = await readFile(libhangulPath, "utf8");
const libhangulHash = createHash("sha256").update(libhangulText).digest("hex");
const characterRecords = new Map();
const wordCandidates = new Map();
const courtReadings = new Set();

for (const line of libhangulText.split(/\r?\n/u)) {
  if (!line || line.startsWith("#")) continue;
  const parsed = parseLine(line);
  if (!parsed || !hangulPattern.test(parsed.hangul) || !hanPattern.test(parsed.hanja)) continue;

  if ([...parsed.hangul].length === 1 && [...parsed.hanja].length === 1) {
    courtReadings.add(parsed.hangul);
    if (!characterRecords.has(parsed.hanja)) {
      characterRecords.set(parsed.hanja, { character: parsed.hanja, readings: [], glosses: [] });
    }
    const record = characterRecords.get(parsed.hanja);
    addUnique(record.readings, parsed.hangul);
    addUnique(record.glosses, parsed.gloss);
  }

  const hangulLength = [...parsed.hangul].length;
  if (hangulLength > 8 || hangulLength !== [...parsed.hanja].length) continue;
  if (!wordCandidates.has(parsed.hangul)) wordCandidates.set(parsed.hangul, []);
  const candidates = wordCandidates.get(parsed.hangul);
  const candidateLimit = hangulLength === 1 ? 120 : 24;
  if (candidates.length < candidateLimit) addUnique(candidates, parsed.hanja);
}

const lookupRecords = await loadHanLookupRecords();
for (const [character, record] of characterRecords) {
  const lookup = lookupRecords.get(character);
  if (!lookup) continue;
  if (lookup.r) record.radical = lookup.r;
  if (lookup.s) record.strokes = Number.parseInt(lookup.s, 10) || undefined;
  if (lookup.g) record.definition = lookup.g;
  if (lookup.d && lookup.d !== "？") record.decomposition = lookup.d;
  if (lookup.ko?.length) {
    for (const reading of lookup.ko) addUnique(record.readings, reading);
  }
}

await mkdir(courtCacheDirectory, { recursive: true });
const orderedReadings = [...courtReadings].sort((left, right) => left.localeCompare(right, "ko"));
let completed = 0;
const courtPayloads = await mapWithConcurrency(orderedReadings, 12, async (reading) => {
  const payload = await fetchCourtReading(reading);
  completed += 1;
  if (completed % 50 === 0 || completed === orderedReadings.length) {
    console.log(`Fetched ${completed}/${orderedReadings.length} court readings.`);
  }
  return payload;
});

const courtCodes = new Map();
let courtResultRows = 0;
for (const payload of courtPayloads) {
  courtResultRows += Number(payload.resultcount) || 0;
  for (const item of payload.resultlist) {
    const key = String(item.cd || "").toLowerCase();
    if (!key) continue;
    if (!courtCodes.has(key)) {
      courtCodes.set(key, {
        code: key,
        character: item.type === "A" ? "" : String.fromCodePoint(Number.parseInt(key, 16)),
        readings: [],
        descriptions: [],
        browserCompatible: item.type !== "A"
      });
    }
    const legal = courtCodes.get(key);
    for (const reading of String(item.ineum || payload.ksnd || "").split(/[,\s]+/u)) addUnique(legal.readings, reading);
    addUnique(legal.descriptions, String(item.in || "").trim());
  }
}

for (const legal of courtCodes.values()) {
  if (!legal.browserCompatible || !legal.character) continue;
  const lookup = lookupRecords.get(legal.character);
  if (lookup?.s) legal.strokes = Number.parseInt(lookup.s, 10) || undefined;
  if (!characterRecords.has(legal.character)) {
    characterRecords.set(legal.character, { character: legal.character, readings: [], glosses: [] });
  }
  const record = characterRecords.get(legal.character);
  record.nameUse = true;
  record.nameReadings = legal.readings;
  record.nameDescriptions = legal.descriptions;
}

const records = [...characterRecords.values()]
  .sort((left, right) => left.character.codePointAt(0) - right.character.codePointAt(0));
const words = Object.fromEntries(
  [...wordCandidates]
    .sort(([left], [right]) => left.localeCompare(right, "ko"))
    .map(([hangul, candidates]) => [hangul, candidates])
);
const reverseWords = buildReverseWordObject(words);
const browserCompatibleNameCount = [...courtCodes.values()].filter((record) => record.browserCompatible).length;
const generatedAt = new Date().toISOString();

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  path.join(outputDirectory, "index.json"),
  `${JSON.stringify({
    meta: {
      generatedAt,
      recordCount: records.length,
      nameUseCount: courtCodes.size,
      browserCompatibleNameCount,
      courtResultRows,
      sources: {
        libhangul: {
          url: "https://github.com/libhangul/libhangul/blob/main/data/hanja/hanja.txt",
          license: "BSD-3-Clause",
          sha256: libhangulHash
        },
        koreanCourt: {
          url: "https://efamily.scourt.go.kr/cs/CsBltnWrtList.do?bltnbordId=0000010",
          pdf: "https://efamily.scourt.go.kr/downloads/etc/hanja.pdf",
          queriedReadings: orderedReadings.length
        },
        hanCharacterLookup: "/data/han-character-lookup/manifest.json"
      }
    },
    records
  })}\n`
);
await writeFile(
  path.join(outputDirectory, "words.json"),
  `${JSON.stringify({ meta: { generatedAt, entries: wordCandidates.size }, words })}\n`
);
await writeFile(
  path.join(outputDirectory, "reverse-words.json"),
  `${JSON.stringify({
    meta: {
      generatedAt,
      entries: Object.keys(reverseWords).length,
      source: "/data/korean-hanja/words.json"
    },
    words: reverseWords
  })}\n`
);
await writeFile(
  path.join(outputDirectory, "name-use.json"),
  `${JSON.stringify({
    meta: {
      generatedAt,
      uniqueCodes: courtCodes.size,
      browserCompatible: browserCompatibleNameCount,
      resultRows: courtResultRows,
      officialPage: "https://efamily.scourt.go.kr/cs/CsBltnWrtList.do?bltnbordId=0000010"
    },
    records: [...courtCodes.values()].sort((left, right) => left.code.localeCompare(right.code))
  })}\n`
);
await writeFile(
  path.join(outputDirectory, "NOTICE.md"),
  `# Korean Hanja data sources\n\n- Korean readings, glosses, and Hanja word mappings are generated from libhangul's \`hanja.txt\` under the BSD 3-Clause license.\n- Current personal-name Hanja status and designated readings are queried from the Supreme Court of Korea's public Electronic Family Relations Registration System.\n- Radicals, stroke counts, definitions, and decompositions reuse JianFan.app's generated Han-character lookup data. See \`../han-character-lookup/manifest.json\` for pinned upstream versions.\n\nGenerated: ${generatedAt}\nlibhangul SHA-256: ${libhangulHash}\n`
);

console.log(`Generated ${records.length} Korean Hanja records, ${wordCandidates.size} word keys, and ${courtCodes.size} current name-use codes (${browserCompatibleNameCount} browser-compatible).`);
