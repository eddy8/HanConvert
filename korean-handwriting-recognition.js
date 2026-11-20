(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KoreanHandwritingCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PATTERN_URL = "/data/korean-handwriting/patterns.json";
  const WORKER_PATH = "/japanese-handwriting-worker.js";
  const REMOTE_URL = "https://jianfan.app/api/hwr/";
  const REMOTE_LANGUAGE = "ko-kr";
  const MAX_TEXT_LENGTH = 200;
  const HANGUL_PATTERN = /^[가-힣ㄱ-ㅣ]$/u;
  const INITIALS = [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
  const MEDIALS = [..."ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"];
  const FINALS = ["", ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"];
  // Revised Romanization of a syllable on its own (no sound changes across syllables).
  const ROMAN_INITIALS = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
  const ROMAN_MEDIALS = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
  const ROMAN_FINALS = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];

  function isSyllable(character) {
    const codePoint = String(character || "").codePointAt(0);
    return codePoint >= 0xac00 && codePoint <= 0xd7a3;
  }

  function decomposeSyllable(character) {
    if (!isSyllable(character)) return null;
    const index = character.codePointAt(0) - 0xac00;
    return {
      initial: INITIALS[Math.floor(index / 588)],
      medial: MEDIALS[Math.floor((index % 588) / 28)],
      final: FINALS[index % 28]
    };
  }

  function romanizeSyllable(character) {
    if (!isSyllable(character)) return "";
    const index = character.codePointAt(0) - 0xac00;
    return `${ROMAN_INITIALS[Math.floor(index / 588)]}${ROMAN_MEDIALS[Math.floor((index % 588) / 28)]}${ROMAN_FINALS[index % 28]}`;
  }

  function uniqueHangul(value, limit = 10) {
    const characters = Array.from(String(value || "")).filter((character) => HANGUL_PATTERN.test(character));
    return [...new Set(characters)].slice(0, limit);
  }

  function appendCharacter(text, character, limit = MAX_TEXT_LENGTH) {
    return Array.from(`${text || ""}${character || ""}`).slice(-limit).join("");
  }

  function strokeSignature(strokes) {
    return (strokes || []).map((stroke) => `${stroke.length}:${stroke.at?.(-1)?.join(",") || ""}`).join("|");
  }

  // Same wire format as the Chinese page's online fallback: "<language>x1ay1a...s" per stroke.
  function encodeRemoteStrokes(strokes, sourceSize, targetSize = 260) {
    const scale = targetSize / Math.max(1, Number(sourceSize) || targetSize);
    const clamp = (value) => Math.min(targetSize, Math.max(0, value));
    const encoded = (Array.isArray(strokes) ? strokes : [])
      .map((stroke) => (Array.isArray(stroke) ? stroke : [])
        .filter((point) => Number.isFinite(point?.[0]) && Number.isFinite(point?.[1]))
        .map(([x, y]) => `${Math.round(clamp(x * scale))}a${Math.round(clamp(y * scale))}a`)
        .join(""))
      .filter(Boolean)
      .map((stroke) => `${stroke}s`);
    return encoded.length ? `${REMOTE_LANGUAGE}${encoded.join("")}` : "";
  }

  return {
    MAX_TEXT_LENGTH,
    PATTERN_URL,
    REMOTE_LANGUAGE,
    REMOTE_URL,
    WORKER_PATH,
    appendCharacter,
    decomposeSyllable,
    encodeRemoteStrokes,
    isSyllable,
    romanizeSyllable,
    strokeSignature,
    uniqueHangul
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;
  const body = document.body;
  if (body.dataset.toolPage !== "korean-handwriting-recognition") return;

  const CANVAS_ID = "koreanHandwritingCanvas";
  const RECOGNITION_DELAY = 60;
  const REMOTE_TIMEOUT = 4500;
  const core = globalThis.KoreanHandwritingCore;
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  const $ = (id) => document.getElementById(id);
  const elements = {
    locale: $("localeSelect"),
    canvas: $(CANVAS_ID),
    status: $("koreanHandwritingStatus"),
    append: $("koreanHandwritingAppend"),
    undo: $("koreanHandwritingUndo"),
    clear: $("koreanHandwritingClear"),
    candidates: $("koreanHandwritingCandidates"),
    candidateEmpty: $("koreanHandwritingCandidateEmpty"),
    remoteAction: $("koreanHandwritingRemoteAction"),
    remoteButton: $("koreanHandwritingRemote"),
    detail: $("koreanHandwritingDetail"),
    detailEmpty: $("koreanHandwritingDetailEmpty"),
    character: $("koreanHandwritingCharacter"),
    jamo: $("koreanHandwritingJamo"),
    roman: $("koreanHandwritingRoman"),
    unicode: $("koreanHandwritingUnicode"),
    copy: $("koreanHandwritingCopy"),
    text: $("koreanHandwritingText"),
    textCopy: $("koreanHandwritingTextCopy"),
    textClear: $("koreanHandwritingTextClear")
  };

  let worker;
  let workerReady = false;
  let recognitionId = 0;
  let recognitionTimer;
  let lastSignature = "";
  let initialized = false;
  let selectedCharacter = "";
  let remoteController;

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

  function copyStrokes() {
    return strokes().map((stroke) => stroke.map(([x, y]) => [x, y]));
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
      if (data.type === "ready") {
        workerReady = true;
        if (strokes().length) scheduleRecognition(0, true);
        else setStatus("idle");
      } else if (data.type === "result") {
        if (data.id !== recognitionId) return;
        const candidates = core.uniqueHangul(data.candidates);
        if (candidates.length) {
          renderCandidates(candidates);
          elements.remoteAction.hidden = false;
        } else {
          requestRemote(recognitionId, copyStrokes(), false);
        }
      } else if (data.type === "error") {
        console.error(data.message);
        if (data.id === undefined || data.id === recognitionId) setStatus("loadError", "error");
      }
    });
    worker.addEventListener("error", (event) => {
      console.error(event.message);
      setStatus("loadError", "error");
    });
    worker.postMessage({ type: "load", url: core.PATTERN_URL });
  }

  function scheduleRecognition(delay = RECOGNITION_DELAY, force = false) {
    window.clearTimeout(recognitionTimer);
    recognitionTimer = window.setTimeout(() => {
      const current = strokes();
      const signature = core.strokeSignature(current);
      if (!force && signature === lastSignature) return;
      lastSignature = signature;
      remoteController?.abort();
      if (!current.length) {
        clearCandidates();
        setStatus("idle");
        return;
      }
      startWorker();
      recognitionId += 1;
      elements.remoteAction.hidden = true;
      setStatus(workerReady ? "recognizing" : "loading");
      worker?.postMessage({ type: "recognize", id: recognitionId, strokes: copyStrokes() });
    }, delay);
  }

  // Online recognition: used automatically when local matching finds nothing, or on request.
  async function requestRemote(requestId, lookupStrokes, manual) {
    const encoded = core.encodeRemoteStrokes(lookupStrokes, elements.canvas.width);
    if (!encoded) return;
    remoteController?.abort();
    const controller = new AbortController();
    remoteController = controller;
    elements.remoteButton.disabled = true;
    setStatus("remoteRecognizing");
    const timeout = window.setTimeout(() => controller.abort(), REMOTE_TIMEOUT);
    try {
      const response = await fetch(core.REMOTE_URL, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        body: new URLSearchParams({ bh: encoded }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Remote recognition returned ${response.status}`);
      const candidates = core.uniqueHangul(await response.text());
      if (requestId !== recognitionId || remoteController !== controller) return;
      if (candidates.length) {
        renderCandidates(candidates);
        elements.remoteAction.hidden = true;
      } else {
        if (!manual) renderCandidates([]);
        setStatus("remoteNoMatch", "error");
      }
    } catch {
      if (requestId !== recognitionId || remoteController !== controller) return;
      if (!manual) renderCandidates([]);
      setStatus("remoteError", "error");
    } finally {
      window.clearTimeout(timeout);
      if (remoteController === controller) {
        remoteController = undefined;
        elements.remoteButton.disabled = false;
      }
    }
  }

  function renderCandidates(candidates) {
    elements.candidates.replaceChildren();
    elements.candidateEmpty.hidden = candidates.length > 0;
    candidates.forEach((character, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "handwriting-candidate";
      button.lang = "ko";
      button.textContent = character;
      button.dataset.character = character;
      button.setAttribute("aria-label", message("candidateLabel", { character, position: index + 1 }));
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => showCandidate(character));
      elements.candidates.append(button);
    });
    if (candidates.length) {
      showCandidate(candidates[0]);
      setStatus("recognized", "ready", { count: candidates.length });
    } else {
      setStatus("noCandidates");
    }
  }

  function showCandidate(character) {
    selectedCharacter = character;
    elements.append.disabled = false;
    elements.candidates.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.character === character;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
    elements.detailEmpty.hidden = true;
    elements.detail.hidden = false;
    elements.character.textContent = character;
    const parts = core.decomposeSyllable(character);
    elements.jamo.textContent = parts ? [parts.initial, parts.medial, parts.final].filter(Boolean).join(" + ") : character;
    elements.roman.textContent = core.romanizeSyllable(character) || body.dataset.emptyValue;
    elements.unicode.textContent = `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
  }

  function clearCandidates() {
    recognitionId += 1;
    elements.candidates.replaceChildren();
    elements.candidateEmpty.hidden = false;
    elements.remoteAction.hidden = true;
    elements.append.disabled = true;
  }

  function clearCanvas({ keepDetail = false } = {}) {
    if (initialized) globalThis.KanjiCanvas.erase(CANVAS_ID);
    lastSignature = "";
    remoteController?.abort();
    clearCandidates();
    if (!keepDetail) {
      selectedCharacter = "";
      elements.detail.hidden = true;
      elements.detailEmpty.hidden = false;
    }
  }

  async function copyText(value, key) {
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
    setStatus(key, "ready");
  }

  function updateTextControls() {
    const hasText = Boolean(elements.text.value);
    elements.textCopy.disabled = !hasText;
    elements.textClear.disabled = !hasText;
  }

  function appendSelected() {
    if (!selectedCharacter) return;
    const added = selectedCharacter;
    elements.text.value = core.appendCharacter(elements.text.value, added);
    // Keep the added character's details; only the square and candidates reset.
    clearCanvas({ keepDetail: true });
    elements.text.classList.remove("is-updated");
    void elements.text.offsetWidth;
    elements.text.classList.add("is-updated");
    updateTextControls();
    setStatus("appended", "ready", { character: added });
    elements.canvas.focus();
  }

  function initializeCanvas() {
    if (!globalThis.KanjiCanvas) {
      setStatus("engineError", "error");
      return;
    }
    const size = Math.max(240, Math.round(elements.canvas.getBoundingClientRect().width));
    elements.canvas.width = size;
    elements.canvas.height = size;
    globalThis.KanjiCanvas.init(CANVAS_ID);
    globalThis.KanjiCanvas.recognize = () => "";
    const draw = globalThis.KanjiCanvas.draw;
    globalThis.KanjiCanvas.draw = (id, color) => draw(id, color || getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#333");
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
  elements.remoteButton.addEventListener("click", () => {
    if (!strokes().length || remoteController) return;
    requestRemote(recognitionId, copyStrokes(), true);
  });
  elements.append.addEventListener("click", appendSelected);
  elements.copy.addEventListener("click", () => copyText(selectedCharacter, "copied"));
  elements.textCopy.addEventListener("click", () => copyText(elements.text.value, "copiedText"));
  elements.textClear.addEventListener("click", () => {
    elements.text.value = "";
    updateTextControls();
  });
  elements.text.addEventListener("input", updateTextControls);
  elements.text.addEventListener("animationend", () => elements.text.classList.remove("is-updated"));
  elements.locale.addEventListener("change", () => {
    const locale = elements.locale.value;
    try {
      localStorage.setItem("jianfan-locale", locale);
      localStorage.setItem("jianfan-locale-manual", "1");
    } catch {
      // The language choice still applies to this navigation.
    }
    window.location.assign(`/${localePrefixes[locale]}korean-handwriting-recognition/`);
  });

  updateTextControls();
  requestAnimationFrame(initializeCanvas);
  const preload = () => startWorker();
  if ("requestIdleCallback" in window) window.requestIdleCallback(preload, { timeout: 2500 });
  else window.setTimeout(preload, 1200);
})();
