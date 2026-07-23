(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CharacterCounterCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_INPUT_CHARACTERS = 3000000;
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
  const SCRIPT_TESTS = {
    han: /^\p{Script=Han}$/u,
    hiragana: /^\p{Script=Hiragana}$/u,
    katakana: /^\p{Script=Katakana}$/u,
    hangul: /^\p{Script=Hangul}$/u,
    latin: /^\p{Script=Latin}$/u,
    number: /^\p{N}$/u,
    punctuationSymbol: /^[\p{P}\p{S}]$/u
  };

  function segmentText(text, locale, granularity) {
    if (typeof Intl?.Segmenter !== "function") return null;
    try {
      return new Intl.Segmenter(locale || "en", { granularity }).segment(text);
    } catch {
      return new Intl.Segmenter("en", { granularity }).segment(text);
    }
  }

  function forEachGrapheme(text, locale, callback) {
    const segments = segmentText(text, locale, "grapheme");
    if (segments) {
      for (const item of segments) callback(item.segment);
      return;
    }
    for (const character of Array.from(text)) callback(character);
  }

  function countWords(text, locale) {
    const segments = segmentText(text, locale, "word");
    if (segments) {
      let count = 0;
      for (const item of segments) {
        if (item.isWordLike) count += 1;
      }
      return count;
    }
    return (text.match(/[\p{L}\p{N}]+/gu) || []).length;
  }

  function countSentences(text, locale) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const segments = segmentText(trimmed, locale, "sentence");
    if (segments) {
      let count = 0;
      for (const item of segments) {
        if (item.segment.trim()) count += 1;
      }
      return count;
    }
    return trimmed.split(/(?<=[.!?。！？])(?:\s+|$)|\n+/u).filter((item) => item.trim()).length;
  }

  function classifyGrapheme(grapheme) {
    if (SCRIPT_TESTS.han.test(grapheme)) return "han";
    if (SCRIPT_TESTS.hiragana.test(grapheme)) return "hiragana";
    if (SCRIPT_TESTS.katakana.test(grapheme)) return "katakana";
    if (SCRIPT_TESTS.hangul.test(grapheme)) return "hangul";
    if (SCRIPT_TESTS.latin.test(grapheme)) return "latin";
    if (SCRIPT_TESTS.number.test(grapheme)) return "number";
    if (SCRIPT_TESTS.punctuationSymbol.test(grapheme)) return "punctuationSymbol";
    return "other";
  }

  function analyzeText(value, locale) {
    const text = String(value || "");
    const categories = {
      han: 0,
      hiragana: 0,
      katakana: 0,
      hangul: 0,
      latin: 0,
      number: 0,
      punctuationSymbol: 0,
      other: 0
    };
    const frequencies = new Map();
    let characters = 0;
    let charactersNoWhitespace = 0;

    forEachGrapheme(text, locale, (grapheme) => {
      characters += 1;
      if (/^\s+$/u.test(grapheme)) return;
      charactersNoWhitespace += 1;
      categories[classifyGrapheme(grapheme)] += 1;
      frequencies.set(grapheme, (frequencies.get(grapheme) || 0) + 1);
    });

    const frequency = Array.from(frequencies, ([character, count]) => ({
      character,
      count,
      category: classifyGrapheme(character)
    })).sort((left, right) => right.count - left.count || left.character.localeCompare(right.character, locale));

    return {
      characters,
      charactersNoWhitespace,
      words: countWords(text, locale),
      sentences: countSentences(text, locale),
      paragraphs: text.trim() ? text.trim().split(/\n[ \t]*\n+/u).filter((item) => item.trim()).length : 0,
      lines: text ? text.split(/\r\n?|\n/u).length : 0,
      bytes: new TextEncoder().encode(text).length,
      uniqueCharacters: frequencies.size,
      categories,
      frequency
    };
  }

  function filterFrequency(frequency, options = {}) {
    const limit = Math.max(1, Number(options.limit) || 12);
    return frequency
      .filter((item) => !options.excludePunctuation || item.category !== "punctuationSymbol")
      .slice(0, limit);
  }

  function validateFileDescriptor(filename, size) {
    if (!/\.(txt|md|csv|json|docx)$/i.test(String(filename || ""))) return "unsupported";
    if (Number(size) > MAX_FILE_SIZE_BYTES) return "tooLarge";
    return "";
  }

  return {
    MAX_FILE_SIZE_BYTES,
    MAX_INPUT_CHARACTERS,
    analyzeText,
    classifyGrapheme,
    filterFrequency,
    validateFileDescriptor
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const core = globalThis.CharacterCounterCore;
  const body = document.body;
  const elements = {
    localeSelect: document.querySelector("#localeSelect"),
    input: document.querySelector("#counterInput"),
    inputCount: document.querySelector("#counterInputCount"),
    status: document.querySelector("#counterStatus"),
    sample: document.querySelector("#counterSample"),
    clear: document.querySelector("#counterClear"),
    fileInput: document.querySelector("#counterFileInput"),
    fileLabel: document.querySelector("#counterFileLabel"),
    fileName: document.querySelector("#counterFileName"),
    target: document.querySelector("#counterTarget"),
    targetValue: document.querySelector("#counterTargetValue"),
    targetBar: document.querySelector("#counterTargetBar"),
    targetPercent: document.querySelector("#counterTargetPercent"),
    frequency: document.querySelector("#counterFrequency"),
    frequencyEmpty: document.querySelector("#counterFrequencyEmpty"),
    excludePunctuation: document.querySelector("#counterExcludePunctuation"),
    metrics: document.querySelectorAll("[data-counter-metric]"),
    categories: document.querySelectorAll("[data-counter-category]")
  };
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  let result = core.analyzeText("", body.dataset.locale);
  let analysisToken = 0;
  let frameId = 0;
  let worker = null;
  let mammothPromise = null;

  function message(key, values = {}) {
    const attribute = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[attribute] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(body.dataset.locale || "en").format(value);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${formatNumber(bytes)} B`;
    if (bytes < 1024 * 1024) return `${new Intl.NumberFormat(body.dataset.locale || "en", { maximumFractionDigits: 1 }).format(bytes / 1024)} KB`;
    return `${new Intl.NumberFormat(body.dataset.locale || "en", { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024)} MB`;
  }

  function setStatus(key, type = "idle", values = {}) {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = message(key, values);
  }

  function renderMetrics() {
    const values = { ...result, bytes: formatBytes(result.bytes) };
    for (const element of elements.metrics) {
      const value = values[element.dataset.counterMetric] ?? 0;
      element.textContent = typeof value === "number" ? formatNumber(value) : value;
    }

    const classifiedTotal = Object.values(result.categories).reduce((sum, count) => sum + count, 0);
    for (const element of elements.categories) {
      const count = result.categories[element.dataset.counterCategory] || 0;
      const percent = classifiedTotal ? Math.round((count / classifiedTotal) * 100) : 0;
      element.querySelector("strong").textContent = formatNumber(count);
      element.querySelector(".counter-category-bar span").style.width = `${percent}%`;
      element.querySelector("small").textContent = `${percent}%`;
    }

    const target = Math.max(1, Number(elements.target.value) || 1);
    const progress = Math.min(100, Math.round((result.charactersNoWhitespace / target) * 100));
    elements.targetValue.textContent = formatNumber(target);
    elements.targetPercent.textContent = `${progress}%`;
    elements.targetBar.style.width = `${progress}%`;
    elements.target.setAttribute("aria-valuetext", `${progress}%`);
    renderFrequency();
  }

  function renderFrequency() {
    const items = core.filterFrequency(result.frequency, {
      excludePunctuation: elements.excludePunctuation.checked,
      limit: 12
    });
    elements.frequency.replaceChildren();
    elements.frequencyEmpty.hidden = items.length > 0;
    if (!items.length) return;
    const maximum = items[0].count;

    for (const item of items) {
      const row = document.createElement("li");
      const character = document.createElement("span");
      character.className = "counter-frequency-character";
      character.textContent = item.character;
      const track = document.createElement("span");
      track.className = "counter-frequency-track";
      const bar = document.createElement("span");
      bar.style.width = `${Math.max(4, (item.count / maximum) * 100)}%`;
      track.append(bar);
      const count = document.createElement("strong");
      count.textContent = formatNumber(item.count);
      row.append(character, track, count);
      elements.frequency.append(row);
    }
  }

  function finishAnalysis(token, nextResult) {
    if (token !== analysisToken) return;
    result = nextResult;
    renderMetrics();
    setStatus(elements.input.value ? "ready" : "idle", elements.input.value ? "ready" : "idle");
  }

  function ensureWorker() {
    if (worker || typeof Worker !== "function") return worker;
    worker = new Worker("/character-counter-worker.js");
    worker.addEventListener("message", (event) => {
      finishAnalysis(event.data.token, event.data.result);
    });
    worker.addEventListener("error", () => {
      worker?.terminate();
      worker = null;
      setStatus("error", "error");
    });
    return worker;
  }

  function analyze() {
    const text = elements.input.value;
    elements.inputCount.textContent = `${formatNumber(text.length)} / ${formatNumber(core.MAX_INPUT_CHARACTERS)}`;
    const token = ++analysisToken;

    if (text.length > core.MAX_INPUT_CHARACTERS) {
      setStatus("tooLong", "error", { limit: formatNumber(core.MAX_INPUT_CHARACTERS) });
      return;
    }

    setStatus(text ? "analyzing" : "idle");
    const availableWorker = ensureWorker();
    if (availableWorker && text.length > 50000) {
      availableWorker.postMessage({ token, text, locale: body.dataset.locale });
      return;
    }

    window.setTimeout(() => {
      try {
        finishAnalysis(token, core.analyzeText(text, body.dataset.locale));
      } catch (error) {
        console.error(error);
        if (token === analysisToken) setStatus("error", "error");
      }
    }, 0);
  }

  function queueAnalysis() {
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(analyze);
  }

  function loadMammoth() {
    if (globalThis.mammoth) return Promise.resolve(globalThis.mammoth);
    if (mammothPromise) return mammothPromise;
    mammothPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdmirror.cn/npm/mammoth/mammoth.browser.min.js";
      script.onload = () => resolve(globalThis.mammoth);
      script.onerror = reject;
      document.head.append(script);
    });
    return mammothPromise;
  }

  async function importFile(file) {
    if (!file) return;
    const validation = core.validateFileDescriptor(file.name, file.size);
    if (validation === "unsupported") {
      setStatus("unsupported", "error");
      return;
    }
    if (validation === "tooLarge") {
      setStatus("fileTooLarge", "error", { limit: formatBytes(core.MAX_FILE_SIZE_BYTES) });
      return;
    }

    setStatus("reading");
    try {
      let text;
      if (/\.docx$/i.test(file.name)) {
        const mammoth = await loadMammoth();
        if (!mammoth) throw new Error("Mammoth did not initialize");
        const output = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = String(output.value || "").replace(/\r\n?/g, "\n");
      } else {
        text = await file.text();
      }
      if (text.length > core.MAX_INPUT_CHARACTERS) {
        setStatus("tooLong", "error", { limit: formatNumber(core.MAX_INPUT_CHARACTERS) });
        return;
      }
      elements.input.value = text;
      elements.fileName.textContent = file.name;
      queueAnalysis();
    } catch (error) {
      console.error(error);
      setStatus(/\.docx$/i.test(file.name) ? "libraryError" : "fileError", "error");
    } finally {
      elements.fileInput.value = "";
    }
  }

  elements.input.addEventListener("input", queueAnalysis);
  elements.sample.addEventListener("click", () => {
    elements.input.value = elements.sample.dataset.sample || "";
    elements.fileName.textContent = "";
    queueAnalysis();
    elements.input.focus();
  });
  elements.clear.addEventListener("click", () => {
    elements.input.value = "";
    elements.fileName.textContent = "";
    queueAnalysis();
    elements.input.focus();
  });
  elements.fileInput.addEventListener("change", () => importFile(elements.fileInput.files[0]));
  elements.fileLabel.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.fileLabel.classList.add("is-dragging");
  });
  elements.fileLabel.addEventListener("dragleave", () => elements.fileLabel.classList.remove("is-dragging"));
  elements.fileLabel.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.fileLabel.classList.remove("is-dragging");
    importFile(event.dataTransfer.files[0]);
  });
  elements.target.addEventListener("input", renderMetrics);
  elements.excludePunctuation.addEventListener("change", renderFrequency);
  elements.localeSelect.addEventListener("change", () => {
    const locale = elements.localeSelect.value;
    localStorage.setItem("jianfan-locale", locale);
    localStorage.setItem("jianfan-locale-manual", "1");
    window.location.assign(`/${localePrefixes[locale] || ""}character-counter/`);
  });

  renderMetrics();
  queueAnalysis();
})();
