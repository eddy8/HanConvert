// Recognizes handwriting off the main thread with KanjiCanvas. The Japanese page loads the
// KanjiVG-derived kanji patterns (/data/japanese-handwriting/patterns.json, about 6,400 kanji); the
// Korean page passes /data/korean-handwriting/patterns.json (Hangul syllables) in its load message.
// Matching takes up to a second for the larger pattern set, so it must not block drawing.
"use strict";

(function (root) {
  const DIGITS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const OFFSET = 512;
  const PATTERN_URL = "/data/japanese-handwriting/patterns.json";
  // KanjiCanvas compares patterns whose stroke count is within -1..+2 of the input. ±1 keeps the
  // same accuracy on hand-drawn samples while comparing about a quarter fewer patterns.
  const STROKE_WINDOW = 1;
  const CANDIDATE_LIMIT = 10;

  const digitValues = new Map([...DIGITS].map((digit, index) => [digit, index]));

  function decodeStrokes(encoded) {
    return String(encoded || "").split(" ").filter(Boolean).map((stroke) => {
      const points = [];
      for (let index = 0; index + 3 < stroke.length; index += 4) {
        const x = digitValues.get(stroke[index]) * 64 + digitValues.get(stroke[index + 1]) - OFFSET;
        const y = digitValues.get(stroke[index + 2]) * 64 + digitValues.get(stroke[index + 3]) - OFFSET;
        points.push([x, y]);
      }
      return points;
    });
  }

  function decodePatterns(payload) {
    return (payload?.patterns || []).map(([character, strokeCount, strokes]) => [character, strokeCount, decodeStrokes(strokes)]);
  }

  // Keeps only characters that have a reference pattern (or Han characters when none are known).
  function parseCandidates(value, limit = CANDIDATE_LIMIT, known) {
    const characters = Array.from(String(value || "")).filter((character) =>
      known ? known.has(character) : /\p{Script=Han}/u.test(character)
    );
    return [...new Set(characters)].slice(0, limit);
  }

  const knownCharacters = new WeakMap();
  function patternCharacters(patterns) {
    if (!knownCharacters.has(patterns)) knownCharacters.set(patterns, new Set(patterns.map(([character]) => character)));
    return knownCharacters.get(patterns);
  }

  // Same scoring as KanjiCanvas.coarseClassification, limited to patterns within ±STROKE_WINDOW strokes.
  function coarseClassification(kanjiCanvas, features) {
    const strokeCount = features.length;
    const scores = [];
    const patterns = kanjiCanvas.refPatterns;
    for (let index = 0; index < patterns.length; index += 1) {
      const patternStrokes = patterns[index][1];
      if (Math.abs(strokeCount - patternStrokes) > STROKE_WINDOW) continue;
      const pattern = patterns[index][2];
      let map = kanjiCanvas.getMap(pattern, features, kanjiCanvas.endPointDistance);
      map = kanjiCanvas.completeMap(pattern, features, kanjiCanvas.endPointDistance, map);
      const distance = kanjiCanvas.computeDistance(pattern, features, kanjiCanvas.endPointDistance, map);
      const smaller = Math.min(patternStrokes, pattern.length);
      const larger = Math.max(patternStrokes, pattern.length);
      scores.push([index, distance * (smaller / larger)]);
    }
    return scores.sort((left, right) => left[1] - right[1]);
  }

  function recognize(kanjiCanvas, strokes) {
    const usable = (Array.isArray(strokes) ? strokes : []).filter((stroke) => Array.isArray(stroke) && stroke.length);
    if (!usable.length || !kanjiCanvas.refPatterns.length) return [];
    kanjiCanvas.recordedPattern_worker = usable;
    const features = kanjiCanvas.extractFeatures(kanjiCanvas.momentNormalize("worker"), 20);
    return parseCandidates(
      kanjiCanvas.fineClassification(features, coarseClassification(kanjiCanvas, features)),
      CANDIDATE_LIMIT,
      patternCharacters(kanjiCanvas.refPatterns)
    );
  }

  const api = { PATTERN_URL, STROKE_WINDOW, coarseClassification, decodePatterns, decodeStrokes, parseCandidates, recognize };
  root.JapaneseHandwritingWorker = api;
  if (typeof module === "object" && module.exports) module.exports = api;

  if (typeof importScripts !== "function") return;

  // KanjiCanvas expects a page; it only touches these two globals while loading.
  root.window = root;
  root.document = { getElementById() { return null; }, addEventListener() {} };
  // fineClassification logs debug output for one character.
  console.log = () => {};
  importScripts("/vendor/kanji-canvas.min.js");

  let loading;

  async function readWithProgress(response) {
    if (!response.ok) throw new Error(`Pattern request failed: ${response.status}`);
    const total = Number(response.headers.get("content-length")) || 0;
    const reader = response.body?.getReader();
    if (!reader) return new Uint8Array(await response.arrayBuffer());
    const chunks = [];
    let loaded = 0;
    let lastPercent = -1;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      const percent = total ? Math.min(99, Math.round((loaded / total) * 100)) : -1;
      if (percent !== lastPercent) {
        lastPercent = percent;
        root.postMessage({ type: "progress", percent });
      }
    }
    const bytes = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes;
  }

  function load(url = PATTERN_URL) {
    if (!loading) {
      loading = fetch(url)
        .then(readWithProgress)
        .then((bytes) => {
          root.KanjiCanvas.refPatterns = decodePatterns(JSON.parse(new TextDecoder().decode(bytes)));
          if (!root.KanjiCanvas.refPatterns.length) throw new Error("Pattern data is empty");
          return root.KanjiCanvas.refPatterns.length;
        })
        .catch((error) => {
          loading = undefined;
          throw error;
        });
    }
    return loading;
  }

  root.addEventListener("message", async (event) => {
    const message = event.data || {};
    try {
      if (message.type === "load") {
        const count = await load(message.url);
        root.postMessage({ type: "ready", count });
      } else if (message.type === "recognize") {
        await load();
        root.postMessage({ type: "result", id: message.id, candidates: recognize(root.KanjiCanvas, message.strokes) });
      }
    } catch (error) {
      root.postMessage({ type: "error", id: message.id, message: String(error?.message || error) });
    }
  });
})(typeof self !== "undefined" ? self : globalThis);
