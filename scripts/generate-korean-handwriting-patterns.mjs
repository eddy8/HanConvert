// Builds the Hangul handwriting reference patterns used by /korean-handwriting-recognition/.
//
// No open stroke dataset covers Hangul syllables, but Hangul is regular: every syllable places an
// initial consonant, a vowel and an optional final consonant in a fixed layout. This script draws
// each jamo with its standard stroke order, composes the 2,350 common syllables of KS X 1001 plus
// the 51 compatibility jamo, and runs the same Kanji Canvas normalization as the Japanese patterns.
// Rare syllables outside KS X 1001 are left to the page's online recognition fallback.
//
// Usage: node scripts/generate-korean-handwriting-patterns.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPattern, encodeStrokes, loadKanjiCanvas } from "./generate-japanese-handwriting-patterns.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "data", "korean-handwriting");

function circle(cx, cy, r, steps = 16) {
  // Starts at the top and runs counter-clockwise, the usual way ㅇ is written.
  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = Math.PI / 2 + (index / steps) * Math.PI * 2;
    return [cx + r * Math.cos(angle), cy - r * Math.sin(angle)];
  });
}

// Basic jamo in a 0..100 box, one array of points per stroke, in standard stroke order.
export const JAMO_STROKES = {
  "ㄱ": [[[12, 18], [85, 18], [82, 92]]],
  "ㄴ": [[[16, 10], [16, 84], [90, 84]]],
  "ㄷ": [[[16, 16], [86, 16]], [[16, 16], [16, 84], [90, 84]]],
  "ㄹ": [[[14, 12], [84, 12], [84, 48]], [[14, 48], [84, 48]], [[14, 48], [14, 88], [90, 88]]],
  "ㅁ": [[[16, 14], [16, 86]], [[16, 14], [84, 14], [84, 86]], [[16, 86], [84, 86]]],
  "ㅂ": [[[18, 10], [18, 88]], [[82, 10], [82, 88]], [[18, 48], [82, 48]], [[18, 88], [82, 88]]],
  "ㅅ": [[[50, 10], [12, 90]], [[46, 46], [90, 90]]],
  "ㅇ": [circle(50, 52, 38)],
  "ㅈ": [[[14, 16], [82, 16], [14, 90]], [[50, 50], [90, 90]]],
  "ㅊ": [[[50, 2], [50, 16]], [[14, 24], [82, 24], [14, 92]], [[50, 56], [90, 92]]],
  "ㅋ": [[[12, 16], [85, 16], [82, 92]], [[14, 52], [82, 52]]],
  "ㅌ": [[[16, 14], [86, 14]], [[16, 48], [86, 48]], [[16, 14], [16, 86], [90, 86]]],
  "ㅍ": [[[10, 16], [90, 16]], [[34, 16], [30, 84]], [[66, 16], [70, 84]], [[8, 86], [92, 86]]],
  "ㅎ": [[[50, 2], [50, 14]], [[14, 24], [86, 24]], circle(50, 64, 28)],
  "ㅏ": [[[50, 4], [50, 96]], [[50, 50], [84, 50]]],
  "ㅐ": [[[36, 4], [36, 96]], [[36, 50], [64, 50]], [[72, 4], [72, 96]]],
  "ㅑ": [[[50, 4], [50, 96]], [[50, 38], [84, 38]], [[50, 62], [84, 62]]],
  "ㅒ": [[[36, 4], [36, 96]], [[36, 38], [64, 38]], [[36, 62], [64, 62]], [[72, 4], [72, 96]]],
  "ㅓ": [[[16, 50], [52, 50]], [[52, 4], [52, 96]]],
  "ㅔ": [[[10, 50], [40, 50]], [[40, 4], [40, 96]], [[74, 4], [74, 96]]],
  "ㅕ": [[[16, 38], [52, 38]], [[16, 62], [52, 62]], [[52, 4], [52, 96]]],
  "ㅖ": [[[10, 38], [40, 38]], [[10, 62], [40, 62]], [[40, 4], [40, 96]], [[74, 4], [74, 96]]],
  "ㅗ": [[[50, 20], [50, 56]], [[6, 58], [94, 58]]],
  "ㅛ": [[[36, 20], [36, 56]], [[64, 20], [64, 56]], [[6, 58], [94, 58]]],
  "ㅜ": [[[6, 42], [94, 42]], [[50, 42], [50, 84]]],
  "ㅠ": [[[6, 42], [94, 42]], [[36, 42], [36, 84]], [[64, 42], [64, 84]]],
  "ㅡ": [[[6, 50], [94, 50]]],
  "ㅣ": [[[50, 4], [50, 96]]]
};

export const INITIALS = [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
export const MEDIALS = [..."ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"];
export const FINALS = ["", ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"];
// Double consonants and final clusters are two basic jamo side by side.
const PAIRS = {
  "ㄲ": "ㄱㄱ", "ㄸ": "ㄷㄷ", "ㅃ": "ㅂㅂ", "ㅆ": "ㅅㅅ", "ㅉ": "ㅈㅈ", "ㄳ": "ㄱㅅ", "ㄵ": "ㄴㅈ", "ㄶ": "ㄴㅎ",
  "ㄺ": "ㄹㄱ", "ㄻ": "ㄹㅁ", "ㄼ": "ㄹㅂ", "ㄽ": "ㄹㅅ", "ㄾ": "ㄹㅌ", "ㄿ": "ㄹㅍ", "ㅀ": "ㄹㅎ", "ㅄ": "ㅂㅅ"
};
// Compound vowels write a horizontal vowel followed by a vertical one.
const COMPOUND_VOWELS = { "ㅘ": "ㅗㅏ", "ㅙ": "ㅗㅐ", "ㅚ": "ㅗㅣ", "ㅝ": "ㅜㅓ", "ㅞ": "ㅜㅔ", "ㅟ": "ㅜㅣ", "ㅢ": "ㅡㅣ" };
const VERTICAL_VOWELS = new Set([..."ㅏㅐㅑㅒㅓㅔㅕㅖㅣ"]);

function place(strokes, [x0, y0, x1, y1]) {
  return strokes.map((stroke) => stroke.map(([x, y]) => [x0 + (x / 100) * (x1 - x0), y0 + (y / 100) * (y1 - y0)]));
}

function jamoStrokes(jamo, box) {
  if (PAIRS[jamo]) {
    const [left, right] = PAIRS[jamo];
    const [x0, y0, x1, y1] = box;
    const middle = (x0 + x1) / 2;
    return [...place(JAMO_STROKES[left], [x0, y0, middle + 2, y1]), ...place(JAMO_STROKES[right], [middle - 2, y0, x1, y1])];
  }
  if (COMPOUND_VOWELS[jamo]) {
    const [horizontal, vertical] = COMPOUND_VOWELS[jamo];
    const [x0, y0, x1, y1] = box;
    const split = x0 + (x1 - x0) * 0.62;
    return [...place(JAMO_STROKES[horizontal], [x0, y0 + (y1 - y0) * 0.3, split, y1]), ...place(JAMO_STROKES[vertical], [split - 4, y0, x1, y1])];
  }
  return place(JAMO_STROKES[jamo], box);
}

// Stroke layout of one precomposed syllable in a 256 box.
export function syllableStrokes(syllable) {
  const index = syllable.codePointAt(0) - 0xac00;
  const initial = INITIALS[Math.floor(index / 588)];
  const medial = MEDIALS[Math.floor((index % 588) / 28)];
  const final = FINALS[index % 28];
  const strokes = [];
  if (COMPOUND_VOWELS[medial]) {
    const [horizontal, vertical] = COMPOUND_VOWELS[medial];
    strokes.push(...jamoStrokes(initial, final ? [14, 6, 140, 82] : [14, 8, 140, 112]));
    strokes.push(...jamoStrokes(horizontal, final ? [6, 64, 184, 148] : [6, 92, 184, 218]));
    strokes.push(...jamoStrokes(vertical, final ? [168, 4, 250, 168] : [168, 4, 250, 250]));
  } else if (VERTICAL_VOWELS.has(medial)) {
    strokes.push(...jamoStrokes(initial, final ? [10, 18, 138, 128] : [10, 36, 138, 220]));
    strokes.push(...jamoStrokes(medial, final ? [122, 4, 248, 152] : [122, 6, 248, 250]));
  } else {
    strokes.push(...jamoStrokes(initial, final ? [52, 4, 204, 92] : [52, 6, 204, 128]));
    strokes.push(...jamoStrokes(medial, final ? [6, 72, 250, 168] : [6, 96, 250, 250]));
  }
  if (final) {
    const box = COMPOUND_VOWELS[medial] ? [36, 170, 220, 250] : VERTICAL_VOWELS.has(medial) ? [28, 158, 228, 250] : [40, 164, 216, 250];
    strokes.push(...jamoStrokes(final, box));
  }
  return strokes;
}

// The 2,350 Hangul syllables of KS X 1001, in code order.
export function commonSyllables() {
  const decoder = new TextDecoder("euc-kr");
  const syllables = [];
  for (let high = 0xb0; high <= 0xc8; high += 1) {
    for (let low = 0xa1; low <= 0xfe; low += 1) {
      const character = decoder.decode(new Uint8Array([high, low]));
      if (/^[가-힣]$/u.test(character)) syllables.push(character);
    }
  }
  return syllables;
}

// Compatibility jamo (ㄱ ... ㅣ) written alone, for learners who look up a single letter.
export function standaloneJamo() {
  return [...new Set([...INITIALS, ...FINALS.filter(Boolean), ...MEDIALS])];
}

function densify(strokes, step = 3) {
  return strokes.map((stroke) => {
    const points = [stroke[0]];
    for (let index = 1; index < stroke.length; index += 1) {
      const [x0, y0] = stroke[index - 1];
      const [x1, y1] = stroke[index];
      const count = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
      for (let part = 1; part <= count; part += 1) points.push([x0 + ((x1 - x0) * part) / count, y0 + ((y1 - y0) * part) / count]);
    }
    return points;
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const kanjiCanvas = await loadKanjiCanvas();
  const patterns = [];
  for (const syllable of commonSyllables()) {
    const strokes = densify(syllableStrokes(syllable));
    patterns.push([syllable, strokes.length, encodeStrokes(buildPattern(kanjiCanvas, strokes))]);
  }
  for (const jamo of standaloneJamo()) {
    const strokes = densify(jamoStrokes(jamo, [28, 20, 228, 236]));
    patterns.push([jamo, strokes.length, encodeStrokes(buildPattern(kanjiCanvas, strokes))]);
  }
  await mkdir(outputDirectory, { recursive: true });
  const payload = { source: "Composed from standard jamo stroke order (KS X 1001 syllables)", encoding: "base64url-offset-512", patterns };
  await writeFile(path.join(outputDirectory, "patterns.json"), `${JSON.stringify(payload)}\n`);
  console.log(`Wrote ${patterns.length} Hangul handwriting patterns.`);
}
