(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.JapaneseHandwritingCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const COMMIT = "e036ef26dc307d897653f5b8750a8cb048f042b3";
  const PATTERN_URL = `https://cdn.jsdelivr.net/gh/barionleg/okanjirec@${COMMIT}/docs/resources/javascript/ref-patterns.js`;
  const PATTERN_SHA256 = "e1770a3f32ce18cc1c0eff67c539e663a3e2b0437172bde66abc3336aedf06c7";

  function uniqueCandidates(value, limit = 10) {
    const candidates = Array.from(String(value || "")).filter((character) => /\p{Script=Han}/u.test(character));
    return [...new Set(candidates)].slice(0, Math.max(1, limit));
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  return { COMMIT, PATTERN_SHA256, PATTERN_URL, bytesToHex, uniqueCandidates };
});

(function () {
  "use strict";
  if (typeof document === "undefined") return;
  const body = document.body;
  if (body.dataset.toolPage !== "japanese-handwriting-recognition") return;

  const CANVAS_ID = "japaneseHandwritingCanvas";
  const core = globalThis.JapaneseHandwritingCore;
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  const elements = {
    locale: document.querySelector("#localeSelect"),
    canvas: document.querySelector(`#${CANVAS_ID}`),
    status: document.querySelector("#japaneseHandwritingStatus"),
    recognize: document.querySelector("#japaneseHandwritingRecognize"),
    undo: document.querySelector("#japaneseHandwritingUndo"),
    clear: document.querySelector("#japaneseHandwritingClear"),
    progress: document.querySelector("#japaneseHandwritingProgress"),
    progressBar: document.querySelector("#japaneseHandwritingProgressBar"),
    progressText: document.querySelector("#japaneseHandwritingProgressText"),
    candidates: document.querySelector("#japaneseHandwritingCandidates"),
    candidateEmpty: document.querySelector("#japaneseHandwritingCandidateEmpty"),
    detail: document.querySelector("#japaneseHandwritingDetail"),
    detailEmpty: document.querySelector("#japaneseHandwritingDetailEmpty"),
    character: document.querySelector("#japaneseHandwritingCharacter"),
    on: document.querySelector("#japaneseHandwritingOn"),
    kun: document.querySelector("#japaneseHandwritingKun"),
    radical: document.querySelector("#japaneseHandwritingRadical"),
    strokes: document.querySelector("#japaneseHandwritingStrokes"),
    meanings: document.querySelector("#japaneseHandwritingMeanings"),
    copy: document.querySelector("#japaneseHandwritingCopy"),
    dictionaryLink: document.querySelector("#japaneseHandwritingDictionaryLink"),
    strokeLink: document.querySelector("#japaneseHandwritingStrokeLink")
  };

  let patternPromise;
  let recordMapPromise;
  let initialized = false;
  let selectedCharacter = "";

  function message(key, values = {}) {
    const name = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[name] || key).replace(/\{(\w+)\}/gu, (_, token) => values[token] ?? "");
  }

  function setStatus(key, type = "idle", values = {}) {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = message(key, values);
  }

  async function readResponse(response) {
    if (!response.ok) throw new Error(`Pattern request failed: ${response.status}`);
    const total = Number(response.headers.get("content-length")) || 0;
    const reader = response.body?.getReader();
    if (!reader) return new Uint8Array(await response.arrayBuffer());
    const chunks = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      const percent = total ? Math.min(99, Math.round((loaded / total) * 100)) : 0;
      elements.progressBar.style.width = `${percent}%`;
      elements.progressText.textContent = total
        ? message("loadingProgress", { percent })
        : message("loadingPatterns");
    }
    const output = new Uint8Array(loaded);
    let offset = 0;
    chunks.forEach((chunk) => {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return output;
  }

  function executePatternScript(bytes) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(new Blob([bytes], { type: "text/javascript" }));
      const script = document.createElement("script");
      script.src = url;
      script.onload = () => {
        URL.revokeObjectURL(url);
        script.remove();
        resolve();
      };
      script.onerror = () => {
        URL.revokeObjectURL(url);
        script.remove();
        reject(new Error("Pattern script execution failed"));
      };
      document.head.append(script);
    });
  }

  function loadPatterns() {
    if (globalThis.KanjiCanvas?.refPatterns?.length) return Promise.resolve();
    if (patternPromise) return patternPromise;
    elements.progress.hidden = false;
    setStatus("loadingPatterns");
    patternPromise = fetch(core.PATTERN_URL, { mode: "cors", cache: "force-cache" })
      .then(readResponse)
      .then(async (bytes) => {
        if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is unavailable");
        const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
        if (core.bytesToHex(digest) !== core.PATTERN_SHA256) throw new Error("Pattern integrity check failed");
        await executePatternScript(bytes);
        if (!globalThis.KanjiCanvas?.refPatterns?.length) throw new Error("Pattern data is empty");
        elements.progressBar.style.width = "100%";
        elements.progressText.textContent = message("patternsReady");
        window.setTimeout(() => { elements.progress.hidden = true; }, 500);
        setStatus("drawReady", "ready");
      })
      .catch((error) => {
        console.error(error);
        patternPromise = undefined;
        elements.progress.hidden = true;
        setStatus("loadError", "error");
        throw error;
      });
    return patternPromise;
  }

  function initializeCanvas() {
    if (!globalThis.KanjiCanvas) {
      setStatus("engineError", "error");
      elements.recognize.disabled = true;
      elements.undo.disabled = true;
      elements.clear.disabled = true;
      return;
    }
    const size = Math.max(240, Math.round(elements.canvas.getBoundingClientRect().width));
    elements.canvas.width = size;
    elements.canvas.height = size;
    globalThis.KanjiCanvas.init(CANVAS_ID);
    initialized = true;
  }

  function strokeCount() {
    return globalThis.KanjiCanvas?.[`recordedPattern_${CANVAS_ID}`]?.length || 0;
  }

  function renderCandidates(value) {
    const candidates = core.uniqueCandidates(value);
    elements.candidates.replaceChildren();
    elements.candidateEmpty.hidden = candidates.length > 0;
    candidates.forEach((character, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "handwriting-candidate";
      button.textContent = character;
      button.dataset.character = character;
      button.setAttribute("aria-label", message("candidateLabel", { character, position: index + 1 }));
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => showCandidate(character));
      elements.candidates.append(button);
    });
    if (candidates.length) showCandidate(candidates[0]);
  }

  async function getRecordMap() {
    if (!recordMapPromise) {
      recordMapPromise = globalThis.JapaneseKanjiData.load().then(globalThis.JapaneseKanjiData.buildRecordMap);
    }
    return recordMapPromise;
  }

  function setText(element, values) {
    element.textContent = values?.length ? values.join(" · ") : body.dataset.emptyValue;
  }

  async function showCandidate(character) {
    selectedCharacter = character;
    elements.candidates.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.character === character));
      button.classList.toggle("is-active", button.dataset.character === character);
    });
    elements.detailEmpty.hidden = true;
    elements.detail.hidden = false;
    elements.character.textContent = character;
    elements.on.textContent = message("loadingDetails");
    elements.kun.textContent = body.dataset.emptyValue;
    elements.radical.textContent = body.dataset.emptyValue;
    elements.strokes.textContent = body.dataset.emptyValue;
    elements.meanings.textContent = body.dataset.emptyValue;
    const prefix = localePrefixes[body.dataset.locale];
    elements.dictionaryLink.href = `/${prefix}japanese-kanji-dictionary/?q=${encodeURIComponent(character)}`;
    elements.strokeLink.href = `/${prefix}japanese-stroke-order/?character=${encodeURIComponent(character)}`;
    try {
      const records = await getRecordMap();
      if (selectedCharacter !== character) return;
      const record = records.get(character);
      setText(elements.on, record?.onReadings);
      setText(elements.kun, record?.kunReadings);
      elements.radical.textContent = record ? `${record.radicalCharacter || body.dataset.emptyValue} (${record.radical || body.dataset.emptyValue})` : body.dataset.emptyValue;
      elements.strokes.textContent = record?.strokeCounts?.join(" / ") || body.dataset.emptyValue;
      setText(elements.meanings, record?.meanings);
    } catch (error) {
      console.error(error);
      elements.on.textContent = body.dataset.emptyValue;
    }
  }

  async function recognize() {
    if (!initialized || !strokeCount()) {
      setStatus("noStrokes", "error");
      elements.canvas.focus();
      return;
    }
    try {
      await loadPatterns();
      setStatus("recognizing");
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const candidates = globalThis.KanjiCanvas.recognize(CANVAS_ID);
      renderCandidates(candidates);
      setStatus(candidates ? "recognized" : "noCandidates", candidates ? "ready" : "idle");
    } catch {
      // loadPatterns reports the actionable error.
    }
  }

  async function copyCandidate() {
    if (!selectedCharacter) return;
    try {
      await navigator.clipboard.writeText(selectedCharacter);
      setStatus("copied", "ready");
    } catch {
      const input = document.createElement("textarea");
      input.value = selectedCharacter;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      setStatus("copied", "ready");
    }
  }

  function clearResults() {
    elements.candidates.replaceChildren();
    elements.candidateEmpty.hidden = false;
    elements.detail.hidden = true;
    elements.detailEmpty.hidden = false;
    selectedCharacter = "";
  }

  elements.canvas.addEventListener("pointerdown", () => loadPatterns().catch(() => undefined), { once: true });
  elements.recognize.addEventListener("click", recognize);
  elements.undo.addEventListener("click", () => {
    if (!initialized || !strokeCount()) return;
    globalThis.KanjiCanvas.deleteLast(CANVAS_ID);
    clearResults();
    setStatus(strokeCount() ? "drawReady" : "idle");
  });
  elements.clear.addEventListener("click", () => {
    if (initialized) globalThis.KanjiCanvas.erase(CANVAS_ID);
    clearResults();
    setStatus("idle");
    elements.canvas.focus();
  });
  elements.copy.addEventListener("click", copyCandidate);
  elements.locale.addEventListener("change", () => {
    const locale = elements.locale.value;
    localStorage.setItem("jianfan-locale", locale);
    localStorage.setItem("jianfan-locale-manual", "1");
    window.location.assign(`/${localePrefixes[locale]}japanese-handwriting-recognition/`);
  });

  requestAnimationFrame(initializeCanvas);
})();
