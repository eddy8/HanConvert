(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.JapaneseHandwritingCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const WORKER_PATH = "/japanese-handwriting-worker.js";
  const MAX_TEXT_LENGTH = 40;

  function uniqueCandidates(value, limit = 10) {
    const candidates = Array.from(Array.isArray(value) ? value.join("") : String(value || ""))
      .filter((character) => /\p{Script=Han}/u.test(character));
    return [...new Set(candidates)].slice(0, Math.max(1, limit));
  }

  function hasKanji(value) {
    return /\p{Script=Han}/u.test(String(value || ""));
  }

  function appendCharacter(text, character, limit = MAX_TEXT_LENGTH) {
    return Array.from(`${text || ""}${character || ""}`).slice(-limit).join("");
  }

  // A stroke signature changes only when the drawing changes, so pointer events that do not add a
  // stroke (hover out, a tap outside) do not trigger another recognition pass.
  function strokeSignature(strokes) {
    return (strokes || []).map((stroke) => `${stroke.length}:${stroke.at?.(-1)?.join(",") || ""}`).join("|");
  }

  return { MAX_TEXT_LENGTH, WORKER_PATH, appendCharacter, hasKanji, strokeSignature, uniqueCandidates };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;
  const body = document.body;
  if (body.dataset.toolPage !== "japanese-handwriting-recognition") return;

  const CANVAS_ID = "japaneseHandwritingCanvas";
  const RECOGNITION_DELAY = 60;
  const READING_DELAY = 350;
  const core = globalThis.JapaneseHandwritingCore;
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  const $ = (id) => document.querySelector(`#${id}`);
  const elements = {
    locale: $("localeSelect"),
    canvas: $(CANVAS_ID),
    status: $("japaneseHandwritingStatus"),
    append: $("japaneseHandwritingAppend"),
    undo: $("japaneseHandwritingUndo"),
    clear: $("japaneseHandwritingClear"),
    progress: $("japaneseHandwritingProgress"),
    progressBar: $("japaneseHandwritingProgressBar"),
    progressText: $("japaneseHandwritingProgressText"),
    candidates: $("japaneseHandwritingCandidates"),
    candidateEmpty: $("japaneseHandwritingCandidateEmpty"),
    detail: $("japaneseHandwritingDetail"),
    detailEmpty: $("japaneseHandwritingDetailEmpty"),
    character: $("japaneseHandwritingCharacter"),
    on: $("japaneseHandwritingOn"),
    kun: $("japaneseHandwritingKun"),
    radical: $("japaneseHandwritingRadical"),
    strokes: $("japaneseHandwritingStrokes"),
    meanings: $("japaneseHandwritingMeanings"),
    copy: $("japaneseHandwritingCopy"),
    dictionaryLink: $("japaneseHandwritingDictionaryLink"),
    strokeLink: $("japaneseHandwritingStrokeLink"),
    text: $("japaneseHandwritingText"),
    textCopy: $("japaneseHandwritingTextCopy"),
    textClear: $("japaneseHandwritingTextClear"),
    reading: $("japaneseHandwritingReading"),
    readingValue: $("japaneseHandwritingReadingValue")
  };

  let worker;
  let workerReady = false;
  let recognitionId = 0;
  let recognitionTimer;
  let lastSignature = "";
  let recordMapPromise;
  let initialized = false;
  let selectedCharacter = "";
  let readingClient;
  let readingTimer;
  let readingToken = 0;

  function message(key, values = {}) {
    const name = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[name] || key).replace(/\{(\w+)\}/gu, (_, token) => values[token] ?? "");
  }

  function setStatus(key, type = "idle", values = {}) {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = message(key, values);
  }

  function strokes() {
    return globalThis.KanjiCanvas?.[`recordedPattern_${CANVAS_ID}`] || [];
  }

  function showProgress(percent) {
    elements.progress.hidden = false;
    elements.progressBar.style.transform = `scaleX(${percent >= 0 ? percent / 100 : 0.35})`;
    elements.progressText.textContent = percent >= 0
      ? message("loadingProgress", { percent })
      : message("loadingPatterns");
  }

  function startWorker() {
    if (worker) return;
    try {
      worker = new Worker(core.WORKER_PATH);
    } catch (error) {
      console.error(error);
      setStatus("engineError", "error");
      return;
    }
    worker.addEventListener("message", (event) => {
      const data = event.data || {};
      if (data.type === "progress") {
        showProgress(data.percent);
      } else if (data.type === "ready") {
        workerReady = true;
        elements.progressBar.style.transform = "scaleX(1)";
        elements.progressText.textContent = message("patternsReady");
        window.setTimeout(() => { elements.progress.hidden = true; }, 500);
        if (strokes().length) scheduleRecognition(0, true);
        else setStatus("idle");
      } else if (data.type === "result") {
        if (data.id !== recognitionId) return;
        renderCandidates(data.candidates);
      } else if (data.type === "error") {
        console.error(data.message);
        elements.progress.hidden = true;
        if (data.id === undefined || data.id === recognitionId) setStatus("loadError", "error");
      }
    });
    worker.addEventListener("error", (event) => {
      console.error(event.message);
      elements.progress.hidden = true;
      setStatus("loadError", "error");
    });
    showProgress(-1);
    worker.postMessage({ type: "load" });
  }

  function scheduleRecognition(delay = RECOGNITION_DELAY, force = false) {
    window.clearTimeout(recognitionTimer);
    recognitionTimer = window.setTimeout(() => {
      const current = strokes();
      const signature = core.strokeSignature(current);
      if (!force && signature === lastSignature) return;
      lastSignature = signature;
      if (!current.length) {
        clearResults();
        setStatus("idle");
        return;
      }
      startWorker();
      recognitionId += 1;
      setStatus(workerReady ? "recognizing" : "loadingPatterns");
      worker?.postMessage({ type: "recognize", id: recognitionId, strokes: current.map((stroke) => stroke.map(([x, y]) => [x, y])) });
    }, delay);
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
    if (candidates.length) {
      showCandidate(candidates[0]);
      setStatus("recognized", "ready");
    } else {
      clearDetail();
      setStatus("noCandidates");
    }
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
    elements.append.disabled = false;
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

  function clearDetail() {
    selectedCharacter = "";
    elements.append.disabled = true;
    elements.detail.hidden = true;
    elements.detailEmpty.hidden = false;
  }

  function clearResults() {
    recognitionId += 1;
    elements.candidates.replaceChildren();
    elements.candidateEmpty.hidden = false;
    clearDetail();
  }

  function clearCanvas() {
    if (initialized) globalThis.KanjiCanvas.erase(CANVAS_ID);
    lastSignature = "";
    clearResults();
  }

  async function copyText(value) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setStatus("copied", "ready");
  }

  function appendSelected() {
    if (!selectedCharacter) return;
    elements.text.value = core.appendCharacter(elements.text.value, selectedCharacter);
    clearCanvas();
    setStatus("appended", "ready", { character: elements.text.value });
    updateTextControls();
    scheduleReading();
    elements.canvas.focus();
  }

  function updateTextControls() {
    const hasText = Boolean(elements.text.value);
    elements.textCopy.disabled = !hasText;
    elements.textClear.disabled = !hasText;
  }

  function scheduleReading() {
    window.clearTimeout(readingTimer);
    const value = elements.text.value.trim();
    if (!core.hasKanji(value)) {
      readingToken += 1;
      elements.reading.hidden = true;
      return;
    }
    elements.reading.hidden = false;
    elements.readingValue.textContent = readingClient ? message("readingLoading") : message("readingDictionary");
    readingTimer = window.setTimeout(() => readText(value), READING_DELAY);
  }

  async function readText(value) {
    const token = ++readingToken;
    try {
      if (!readingClient) readingClient = globalThis.JapaneseReadingClient.createClient();
      const dictionaryPaths = [body.dataset.dictionaryPath, body.dataset.dictionaryFallbackPath].filter(Boolean);
      const result = await readingClient.convert({ value, format: "hiragana", dictionaryPaths });
      if (token === readingToken) elements.readingValue.textContent = result || body.dataset.emptyValue;
    } catch (error) {
      console.error(error);
      if (token === readingToken) elements.readingValue.textContent = message("readingError");
    }
  }

  function initializeCanvas() {
    if (!globalThis.KanjiCanvas) {
      setStatus("engineError", "error");
      elements.undo.disabled = true;
      elements.clear.disabled = true;
      return;
    }
    const size = Math.max(240, Math.round(elements.canvas.getBoundingClientRect().width));
    elements.canvas.width = size;
    elements.canvas.height = size;
    globalThis.KanjiCanvas.init(CANVAS_ID);
    // Recognition runs in the worker; the page copy of KanjiCanvas only draws. Its Ctrl+F shortcut
    // would otherwise call recognize() without reference patterns.
    globalThis.KanjiCanvas.recognize = () => "";
    initialized = true;
  }

  for (const type of ["mouseup", "mouseout", "touchend", "touchcancel"]) {
    elements.canvas.addEventListener(type, () => scheduleRecognition());
  }
  elements.canvas.addEventListener("pointerdown", startWorker, { once: true });
  elements.undo.addEventListener("click", () => {
    if (!initialized || !strokes().length) return;
    globalThis.KanjiCanvas.deleteLast(CANVAS_ID);
    scheduleRecognition(0);
  });
  elements.clear.addEventListener("click", () => {
    clearCanvas();
    setStatus("idle");
    elements.canvas.focus();
  });
  elements.append.addEventListener("click", appendSelected);
  elements.copy.addEventListener("click", () => copyText(selectedCharacter));
  elements.textCopy.addEventListener("click", () => copyText(elements.text.value));
  elements.textClear.addEventListener("click", () => {
    elements.text.value = "";
    updateTextControls();
    scheduleReading();
  });
  elements.text.addEventListener("input", () => {
    updateTextControls();
    scheduleReading();
  });
  elements.locale.addEventListener("change", () => {
    const locale = elements.locale.value;
    try {
      localStorage.setItem("jianfan-locale", locale);
      localStorage.setItem("jianfan-locale-manual", "1");
    } catch {
      // Language choice still works for this navigation.
    }
    window.location.assign(`/${localePrefixes[locale]}japanese-handwriting-recognition/`);
  });

  updateTextControls();
  requestAnimationFrame(initializeCanvas);
  // Load the recognizer while the visitor reads the page, so the first stroke gets candidates quickly.
  const preload = () => startWorker();
  if ("requestIdleCallback" in window) window.requestIdleCallback(preload, { timeout: 2500 });
  else window.setTimeout(preload, 1200);
})();
