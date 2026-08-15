import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function normalizeInitialSoundLaw(word) {
  const characters = Array.from(String(word || ""));
  if (!characters.length) return "";
  const codePoint = characters[0].codePointAt(0);
  if (codePoint < 0xac00 || codePoint > 0xd7a3) return characters.join("");
  const syllableIndex = codePoint - 0xac00;
  const initial = Math.floor(syllableIndex / 588);
  const vowel = Math.floor((syllableIndex % 588) / 28);
  const iOrYVowels = new Set([2, 3, 6, 7, 12, 17, 20]);
  let normalizedInitial = initial;
  if (initial === 5) normalizedInitial = iOrYVowels.has(vowel) ? 11 : 2;
  if (initial === 2 && iOrYVowels.has(vowel)) normalizedInitial = 11;
  if (normalizedInitial === initial) return characters.join("");
  characters[0] = String.fromCodePoint(0xac00 + normalizedInitial * 588 + (syllableIndex % 588));
  return characters.join("");
}

export function buildReverseWordObject(words) {
  const reverse = new Map();
  for (const [hangul, candidates] of Object.entries(words || {})) {
    const reading = normalizeInitialSoundLaw(hangul);
    for (const hanja of candidates) {
      const readings = reverse.get(hanja) || [];
      if (!readings.includes(reading)) readings.push(reading);
      reverse.set(hanja, readings);
    }
  }
  return Object.fromEntries(reverse);
}

export async function generateReverseWordFile(sourcePath, outputPath) {
  const source = JSON.parse(await readFile(sourcePath, "utf8"));
  const words = buildReverseWordObject(source.words);
  const payload = {
    meta: {
      generatedAt: source.meta?.generatedAt || new Date().toISOString(),
      entries: Object.keys(words).length,
      source: "/data/korean-hanja/words.json"
    },
    words
  };
  await writeFile(outputPath, `${JSON.stringify(payload)}\n`);
  return payload.meta;
}

const currentPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentPath) {
  const projectRoot = path.resolve(path.dirname(currentPath), "..");
  const sourcePath = process.argv[2] || path.join(projectRoot, "data", "korean-hanja", "words.json");
  const outputPath = process.argv[3] || path.join(projectRoot, "data", "korean-hanja", "reverse-words.json");
  const meta = await generateReverseWordFile(sourcePath, outputPath);
  console.log(`Generated ${meta.entries} reverse Korean Hanja word keys.`);
}
