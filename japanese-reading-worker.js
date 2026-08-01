"use strict";

const COMPONENT_SOURCES = [
  [
    "https://cdn.jsdelivr.net/npm/kuroshiro@1.2.0/dist/kuroshiro.min.js",
    "https://cdn.jsdelivr.net/npm/kuroshiro-analyzer-kuromoji@1.1.0/dist/kuroshiro-analyzer-kuromoji.min.js"
  ],
  [
    "https://cdn.jsdmirror.cn/npm/kuroshiro@1.2.0/dist/kuroshiro.min.js",
    "https://cdn.jsdmirror.cn/npm/kuroshiro-analyzer-kuromoji@1.1.0/dist/kuroshiro-analyzer-kuromoji.min.js"
  ]
];
const DICTIONARY_FILES = Object.freeze([
  "base.dat.gz",
  "cc.dat.gz",
  "check.dat.gz",
  "tid.dat.gz",
  "tid_map.dat.gz",
  "tid_pos.dat.gz",
  "unk.dat.gz",
  "unk_char.dat.gz",
  "unk_compat.dat.gz",
  "unk_invoke.dat.gz",
  "unk_map.dat.gz",
  "unk_pos.dat.gz"
]);
const warmedPaths = new Set();
let componentsPromise;
let enginePromise;
let activeDictionaryPath = "";

importScripts("/kanji-romaji-core.js");

self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type !== "convert") return;
  convertRequest(message).catch((error) => {
    self.postMessage({
      type: "error",
      id: message.id,
      code: error.code || "CONVERSION_FAILED",
      message: error.message || "Japanese reading conversion failed"
    });
  });
});

async function convertRequest(message) {
  const core = self.KanjiRomajiCore;
  const value = String(message.value || "");
  if (!core || !value) {
    self.postMessage({ type: "result", id: message.id, result: "" });
    return;
  }

  const engine = await getEngine(message.id, message.dictionaryPaths || []);
  const chunks = core.splitJapaneseText(value);
  const options = core.buildConversionOptions(message.format, message.system);
  const useKunrei = message.format === "romaji" && message.system === "kunrei";
  const results = [];

  for (let index = 0; index < chunks.length; index += 1) {
    postProgress(message.id, "converting", index, chunks.length);
    const protectedInput = useKunrei
      ? core.protectLatinAndNumberRuns(chunks[index])
      : { text: chunks[index], replacements: [] };
    const converted = await engine.convert(protectedInput.text, options);
    results.push(
      useKunrei
        ? core.restoreProtectedRuns(
          core.convertNipponToKunrei(converted),
          protectedInput.replacements
        )
        : converted
    );
  }

  postProgress(message.id, "complete", chunks.length, chunks.length);
  self.postMessage({ type: "result", id: message.id, result: results.join("") });
}

async function getEngine(id, dictionaryPaths) {
  const paths = dictionaryPaths.filter(Boolean);
  if (!paths.length) {
    const error = new Error("No Japanese dictionary path is configured");
    error.code = "DICTIONARY_UNAVAILABLE";
    throw error;
  }
  if (enginePromise && paths.includes(activeDictionaryPath)) return enginePromise;

  enginePromise = initializeEngine(id, paths).catch((error) => {
    enginePromise = undefined;
    activeDictionaryPath = "";
    throw error;
  });
  return enginePromise;
}

async function initializeEngine(id, dictionaryPaths) {
  postProgress(id, "components", 0, COMPONENT_SOURCES.length);
  await loadComponents(id);
  const Kuroshiro = self.Kuroshiro?.default || self.Kuroshiro;
  const KuromojiAnalyzer = self.KuromojiAnalyzer?.default || self.KuromojiAnalyzer;
  if (typeof Kuroshiro !== "function" || typeof KuromojiAnalyzer !== "function") {
    const error = new Error("Kuroshiro browser components are unavailable");
    error.code = "COMPONENT_UNAVAILABLE";
    throw error;
  }

  let lastError;
  for (const path of dictionaryPaths) {
    try {
      await warmDictionary(path, id);
      postProgress(id, "initializing", 0, 1);
      const engine = new Kuroshiro();
      await engine.init(new KuromojiAnalyzer({ dictPath: path }));
      activeDictionaryPath = path;
      postProgress(id, "initializing", 1, 1);
      return engine;
    } catch (error) {
      lastError = error;
    }
  }

  const error = lastError || new Error("Japanese dictionary initialization failed");
  error.code = "DICTIONARY_UNAVAILABLE";
  throw error;
}

async function loadComponents(id) {
  if (componentsPromise) return componentsPromise;
  componentsPromise = (async () => {
    let lastError;
    for (let index = 0; index < COMPONENT_SOURCES.length; index += 1) {
      try {
        importScripts(...COMPONENT_SOURCES[index]);
        postProgress(id, "components", index + 1, COMPONENT_SOURCES.length);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Japanese reading components failed to load");
  })().catch((error) => {
    componentsPromise = undefined;
    throw error;
  });
  return componentsPromise;
}

async function warmDictionary(path, id) {
  if (warmedPaths.has(path)) {
    postProgress(id, "dictionary", DICTIONARY_FILES.length, DICTIONARY_FILES.length);
    return;
  }

  let completed = 0;
  postProgress(id, "dictionary", completed, DICTIONARY_FILES.length);
  for (const filename of DICTIONARY_FILES) {
    const response = await fetch(`${path}${filename}`, { cache: "force-cache", mode: "cors" });
    if (!response.ok) throw new Error(`Dictionary request failed: ${response.status}`);
    await response.arrayBuffer();
    completed += 1;
    postProgress(id, "dictionary", completed, DICTIONARY_FILES.length);
  }
  warmedPaths.add(path);
}

function postProgress(id, stage, completed, total) {
  self.postMessage({ type: "progress", id, progress: { stage, completed, total } });
}
