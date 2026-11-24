// Builds the Japanese handwriting reference patterns from KanjiVG stroke data.
//
// KanjiCanvas ships about 2,200 hand-drawn reference patterns, mostly Joyo kanji, so many kanji
// people actually look up (嘘, 苺, 檸檬, 鰻, 牡蠣, 込, 畑 ...) can never be recognized. KanjiVG has
// Japanese-form stroke paths for about 6,400 kanji. This script samples each stroke path and runs the
// same moment normalization and feature extraction as KanjiCanvas (scripts/vendor/kanji-canvas.min.js, the same build the pages load from jsDelivr), so
// the output can replace the hand-drawn set. Mixing both sets lowers accuracy (clean synthetic
// patterns outrank hand-drawn ones), so every pattern comes from KanjiVG.
//
// Usage:
//   1. Download and unzip https://github.com/KanjiVG/kanjivg/releases/download/r20250816/kanjivg-20250816-main.zip
//   2. node scripts/generate-japanese-handwriting-patterns.mjs <path to the unzipped kanji/ folder>
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const KANJIVG_RELEASE = "r20250816";
const outputDirectory = path.join(root, "data", "japanese-handwriting");

// Coordinates are rounded to integers and written as two base64url digits each (offset 512), so a
// point costs four characters. Strokes are separated by spaces.
const DIGITS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const OFFSET = 512;

export function encodeValue(value) {
  const number = Math.max(0, Math.min(4095, Math.round(value) + OFFSET));
  return DIGITS[number >> 6] + DIGITS[number & 63];
}

export function encodeStrokes(strokes) {
  return strokes.map((stroke) => stroke.map(([x, y]) => encodeValue(x) + encodeValue(y)).join("")).join(" ");
}

// Samples an SVG path made of the commands KanjiVG uses (M, C, S, L and their relative forms).
export function samplePath(d, scale = 256 / 109) {
  const tokens = d.match(/[MmCcSsLlZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
  const points = [];
  let index = 0;
  let command = "";
  let x = 0;
  let y = 0;
  let controlX = 0;
  let controlY = 0;
  const next = () => Number.parseFloat(tokens[index++]);
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    const length = Math.hypot(x3 - x, y3 - y) + Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x3, y2 - y3);
    const steps = Math.max(4, Math.ceil(length / 2));
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      const u = 1 - t;
      points.push([
        u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3
      ]);
    }
    controlX = x2;
    controlY = y2;
    x = x3;
    y = y3;
  };
  while (index < tokens.length) {
    if (/[A-Za-z]/.test(tokens[index])) command = tokens[index++];
    const relative = command === command.toLowerCase();
    const baseX = relative ? x : 0;
    const baseY = relative ? y : 0;
    switch (command.toUpperCase()) {
      case "M":
        x = baseX + next();
        y = baseY + next();
        points.push([x, y]);
        command = relative ? "l" : "L";
        break;
      case "C": {
        const values = [next(), next(), next(), next(), next(), next()];
        cubic(baseX + values[0], baseY + values[1], baseX + values[2], baseY + values[3], baseX + values[4], baseY + values[5]);
        break;
      }
      case "S": {
        const values = [next(), next(), next(), next()];
        cubic(2 * x - controlX, 2 * y - controlY, baseX + values[0], baseY + values[1], baseX + values[2], baseY + values[3]);
        break;
      }
      case "L": {
        const targetX = baseX + next();
        const targetY = baseY + next();
        cubic(x, y, targetX, targetY, targetX, targetY);
        break;
      }
      case "Z":
        break;
      default:
        throw new Error(`Unsupported SVG path command ${command} in ${d}`);
    }
  }
  return points.map(([pointX, pointY]) => [pointX * scale, pointY * scale]);
}

// KanjiVG also draws radical forms (⻏, ⻖, ⺅ ...). They are not characters people look up, so only
// CJK Unified Ideographs (with extensions) and compatibility ideographs become patterns.
export function isIdeograph(codePoint) {
  return (codePoint >= 0x3400 && codePoint <= 0x9fff) || (codePoint >= 0xf900 && codePoint <= 0xfaff) || codePoint >= 0x20000;
}

export function strokesFromSvg(svg) {
  return [...svg.matchAll(/<path\b[^>]*\bid="kvg:[0-9a-f]+(?:-[A-Za-z0-9]+)?-s(\d+)"[^>]*\bd="([^"]+)"/g)]
    .sort((left, right) => Number(left[1]) - Number(right[1]))
    .map((match) => samplePath(match[2]));
}

export async function loadKanjiCanvas() {
  const context = { document: { getElementById() { return null; }, addEventListener() {} }, console: { log() {} } };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(await readFile(path.join(root, "scripts", "vendor", "kanji-canvas.min.js"), "utf8"), context);
  return context.KanjiCanvas;
}

export function buildPattern(kanjiCanvas, strokes) {
  kanjiCanvas.recordedPattern_generator = strokes;
  return kanjiCanvas.extractFeatures(kanjiCanvas.momentNormalize("generator"), 20);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const kanjiDirectory = process.argv[2];
  if (!kanjiDirectory) throw new Error("Pass the path of the unzipped KanjiVG kanji/ folder");
  const kanjiCanvas = await loadKanjiCanvas();
  const patterns = [];
  for (const file of (await readdir(kanjiDirectory)).sort()) {
    if (!/^[0-9a-f]{5}\.svg$/.test(file)) continue;
    const codePoint = Number.parseInt(file.slice(0, 5), 16);
    if (!isIdeograph(codePoint)) continue;
    const character = String.fromCodePoint(codePoint);
    const strokes = strokesFromSvg(await readFile(path.join(kanjiDirectory, file), "utf8"));
    if (!strokes.length) continue;
    patterns.push([character, strokes.length, encodeStrokes(buildPattern(kanjiCanvas, strokes))]);
  }
  await mkdir(outputDirectory, { recursive: true });
  const payload = { source: `KanjiVG ${KANJIVG_RELEASE}`, license: "CC BY-SA 3.0", encoding: "base64url-offset-512", patterns };
  await writeFile(path.join(outputDirectory, "patterns.json"), `${JSON.stringify(payload)}\n`);
  console.log(`Wrote ${patterns.length} Japanese handwriting patterns from KanjiVG ${KANJIVG_RELEASE}.`);
}
