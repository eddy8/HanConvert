(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HandwritingRecognitionCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const HAN_PATTERN = /^\p{Script=Han}$/u;

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function toBoardPoint(rect, clientX, clientY, boardSize = 256) {
    const width = Math.max(1, Number(rect?.width) || 1);
    const height = Math.max(1, Number(rect?.height) || 1);
    return [
      clamp(((Number(clientX) - (Number(rect?.left) || 0)) / width) * boardSize, 0, boardSize),
      clamp(((Number(clientY) - (Number(rect?.top) || 0)) / height) * boardSize, 0, boardSize)
    ];
  }

  function shouldAppendPoint(stroke, point, minimumDistance = 1.5) {
    const previous = stroke?.[stroke.length - 1];
    if (!previous) return true;
    return Math.hypot(point[0] - previous[0], point[1] - previous[1]) >= minimumDistance;
  }

  function cloneStrokes(strokes) {
    return (Array.isArray(strokes) ? strokes : []).map((stroke) =>
      (Array.isArray(stroke) ? stroke : []).map((point) => [Number(point[0]), Number(point[1])])
    );
  }

  function normalizeMatches(matches, limit = 10) {
    const result = [];
    const seen = new Set();
    for (const match of Array.isArray(matches) ? matches : []) {
      const character = String(match?.hanzi || "");
      if (!HAN_PATTERN.test(character) || seen.has(character)) continue;
      seen.add(character);
      result.push({ character, score: Number(match?.score) || 0 });
      if (result.length >= limit) break;
    }
    return result;
  }

  function encodeRemoteStrokes(strokes, options = {}) {
    const language = String(options.language || "zh-cn");
    const sourceSize = Math.max(1, Number(options.sourceSize) || 256);
    const targetSize = Math.max(1, Number(options.targetSize) || 260);
    const scale = targetSize / sourceSize;
    const encoded = [];

    for (const stroke of Array.isArray(strokes) ? strokes : []) {
      const points = [];
      for (const point of Array.isArray(stroke) ? stroke : []) {
        const x = Number(point?.[0]);
        const y = Number(point?.[1]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        points.push(`${Math.round(clamp(x * scale, 0, targetSize))}a${Math.round(clamp(y * scale, 0, targetSize))}a`);
      }
      if (points.length) encoded.push(`${points.join("")}s`);
    }

    return encoded.length ? `${language}${encoded.join("")}` : "";
  }

  function normalizeRemoteMatches(payload, limit = 10) {
    const result = [];
    const seen = new Set();
    for (const character of Array.from(String(payload || ""))) {
      if (!HAN_PATTERN.test(character) || seen.has(character)) continue;
      seen.add(character);
      result.push({ character, score: Math.max(1, limit - result.length) });
      if (result.length >= limit) break;
    }
    return result;
  }

  function formatUnicode(character) {
    const value = Array.from(String(character || ""))[0];
    if (!value) return "";
    return `U+${value.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
  }

  return {
    cloneStrokes,
    encodeRemoteStrokes,
    formatUnicode,
    normalizeMatches,
    normalizeRemoteMatches,
    shouldAppendPoint,
    toBoardPoint
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const BOARD_SIZE = 256;
  const CANDIDATE_LIMIT = 10;
  const REMOTE_LOOKUP_TIMEOUT = 4500;
  const REMOTE_LOOKUP_URL = "https://jianfan.app/api/hwr/";
  const STROKE_DATA_ORIGIN = "https://cdn.jsdmirror.cn/npm/hanzi-writer-data";
  const localePaths = {
    "zh-CN": "/",
    "zh-TW": "/zh-tw/",
    en: "/en/",
    ja: "/ja/",
    ko: "/ko/"
  };
  const sampleStrokes = {
    "人": [
      [[151, 38], [145, 61], [135, 88], [121, 120], [105, 153], [85, 185], [60, 216]],
      [[145, 73], [155, 99], [169, 130], [184, 160], [202, 188], [226, 214]]
    ],
    "大": [
      [[48, 101], [88, 101], [130, 101], [172, 100], [215, 98]],
      [[141, 39], [139, 69], [136, 100], [127, 132], [113, 162], [92, 190], [61, 215]],
      [[135, 111], [151, 136], [168, 161], [190, 186], [219, 207]]
    ],
    "木": [
      [[45, 103], [83, 103], [124, 103], [168, 102], [216, 101]],
      [[132, 36], [132, 74], [132, 115], [131, 157], [131, 217]],
      [[127, 111], [109, 134], [89, 157], [66, 180], [42, 197]],
      [[137, 113], [157, 137], [180, 162], [205, 184], [226, 197]]
    ],
    "中": [
      [[69, 75], [72, 106], [75, 139], [78, 170]],
      [[72, 78], [111, 75], [151, 73], [190, 72], [187, 104], [184, 136], [181, 166]],
      [[78, 161], [112, 160], [146, 159], [181, 158]],
      [[130, 34], [130, 72], [130, 110], [130, 153], [130, 198], [130, 226]]
    ]
  };

  const core = window.HandwritingRecognitionCore;
  const body = document.body;
  const locale = body.dataset.locale || "zh-CN";
  const pageSlug = body.dataset.pageSlug || "chinese-handwriting-recognition";
  const supportsRemoteFallback = pageSlug === "chinese-handwriting-recognition";
  const usesKoreanReadings = body.dataset.readingSource === "korean";
  const canvas = document.querySelector("#handwritingCanvas");
  const board = document.querySelector("#handwritingBoard");
  const status = document.querySelector("#handwritingStatus");
  const loader = document.querySelector("#handwritingLoader");
  const strokeCount = document.querySelector("#handwritingStrokeCount");
  const undoButton = document.querySelector("#handwritingUndo");
  const clearButton = document.querySelector("#handwritingClear");
  const candidates = document.querySelector("#handwritingCandidates");
  const candidateEmpty = document.querySelector("#handwritingCandidateEmpty");
  const result = document.querySelector("#handwritingResult");
  const resultCharacter = document.querySelector("#handwritingResultCharacter");
  const resultPinyin = document.querySelector("#handwritingResultPinyin");
  const resultStrokes = document.querySelector("#handwritingResultStrokes");
  const resultUnicode = document.querySelector("#handwritingResultUnicode");
  const copyButton = document.querySelector("#handwritingCopy");
  const strokeLink = document.querySelector("#handwritingStrokeLink");
  const pinyinLink = document.querySelector("#handwritingPinyinLink");
  const structureLink = document.querySelector("#handwritingStructureLink");
  const context = canvas?.getContext("2d");

  if (!canvas || !board || !context || !core) return;

  let strokes = [];
  let currentStroke;
  let activePointerId;
  let worker;
  let workerReady = false;
  let lookupRequestId = 0;
  let detailRequestId = 0;
  let selectedCharacter = "";
  let lookupTimer;
  let remoteLookupController;

  setupLocaleSelector();
  setupCanvas();
  setupControls();
  resizeCanvas();
  updateStrokeControls();
  startWorker();

  function setupLocaleSelector() {
    const selector = document.querySelector("#localeSelect");
    if (!selector) return;
    selector.addEventListener("change", () => {
      const nextLocale = selector.value;
      localStorage.setItem("jianfan-locale", nextLocale);
      localStorage.setItem("jianfan-locale-manual", "1");
      const base = localePaths[nextLocale] || "/";
      window.location.href = `${base}${pageSlug}/`.replace("//", "/") + window.location.search;
    });
  }

  function setupCanvas() {
    canvas.addEventListener("pointerdown", beginStroke);
    canvas.addEventListener("pointermove", continueStroke);
    canvas.addEventListener("pointerup", finishStroke);
    canvas.addEventListener("pointercancel", cancelStroke);
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    if (typeof ResizeObserver === "function") {
      new ResizeObserver(resizeCanvas).observe(board);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }
  }

  function setupControls() {
    undoButton.addEventListener("click", () => {
      strokes.pop();
      redrawCanvas();
      updateStrokeControls();
      scheduleLookup(0);
    });

    clearButton.addEventListener("click", clearDrawing);
    copyButton.addEventListener("click", copyCharacter);

    document.querySelectorAll("[data-handwriting-sample]").forEach((button) => {
      button.addEventListener("click", () => {
        const character = button.dataset.handwritingSample;
        strokes = core.cloneStrokes(sampleStrokes[character] || []);
        redrawCanvas();
        updateStrokeControls();
        scheduleLookup(0);
      });
    });
  }

  function startWorker() {
    setStatus("loading");
    loader.hidden = false;
    try {
      worker = new Worker("/handwriting-recognition-worker.js");
      worker.addEventListener("message", handleWorkerMessage);
      worker.addEventListener("error", (event) => {
        console.error(event);
        showWorkerError();
      });
    } catch (error) {
      console.error(error);
      showWorkerError();
    }
  }

  function handleWorkerMessage(event) {
    const message = event.data || {};
    if (message.type === "ready") {
      workerReady = true;
      loader.hidden = true;
      if (strokes.length) requestLookup();
      else setStatus("ready", "ready");
      return;
    }
    if (message.type === "error") {
      console.error(message.message || "Handwriting recognition failed");
      showWorkerError();
      return;
    }
    if (message.type !== "results" || message.requestId !== lookupRequestId) return;
    const limit = usesKoreanReadings ? 30 : CANDIDATE_LIMIT;
    const matches = core.normalizeMatches(message.matches, limit);
    if (supportsRemoteFallback && !matches.length) {
      requestRemoteLookup(message.requestId, core.cloneStrokes(strokes));
      return;
    }
    if (usesKoreanReadings) {
      rankKoreanCandidates(matches).then(renderCandidates).catch(() => renderCandidates(matches.slice(0, CANDIDATE_LIMIT)));
    } else {
      renderCandidates(matches);
    }
  }

  function showWorkerError() {
    workerReady = false;
    loader.hidden = true;
    setStatus("error", "error");
    canvas.classList.add("is-disabled");
  }

  function beginStroke(event) {
    if (canvas.classList.contains("is-disabled") || activePointerId !== undefined) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    canvas.setPointerCapture?.(event.pointerId);
    currentStroke = [];
    appendPointerEvent(event);
  }

  function continueStroke(event) {
    if (event.pointerId !== activePointerId || !currentStroke) return;
    event.preventDefault();
    const events = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [event];
    for (const pointerEvent of events) appendPointerEvent(pointerEvent);
    redrawCanvas();
  }

  function finishStroke(event) {
    if (event.pointerId !== activePointerId || !currentStroke) return;
    event.preventDefault();
    appendPointerEvent(event);
    if (currentStroke.length === 1) {
      currentStroke.push([currentStroke[0][0] + 0.1, currentStroke[0][1] + 0.1]);
    }
    if (currentStroke.length) strokes.push(currentStroke);
    currentStroke = undefined;
    activePointerId = undefined;
    canvas.releasePointerCapture?.(event.pointerId);
    redrawCanvas();
    updateStrokeControls();
    scheduleLookup();
  }

  function cancelStroke(event) {
    if (event.pointerId !== activePointerId) return;
    currentStroke = undefined;
    activePointerId = undefined;
    redrawCanvas();
  }

  function appendPointerEvent(event) {
    const point = core.toBoardPoint(canvas.getBoundingClientRect(), event.clientX, event.clientY, BOARD_SIZE);
    if (core.shouldAppendPoint(currentStroke, point)) currentStroke.push(point);
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    redrawCanvas();
  }

  function redrawCanvas() {
    const scaleX = canvas.width / BOARD_SIZE;
    const scaleY = canvas.height / BOARD_SIZE;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    context.strokeStyle = "#eefcf5";
    context.lineWidth = 7;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = "rgba(64, 242, 176, 0.28)";
    context.shadowBlur = 4;
    for (const stroke of currentStroke ? [...strokes, currentStroke] : strokes) drawStroke(stroke);
  }

  function drawStroke(stroke) {
    if (!stroke?.length) return;
    context.beginPath();
    context.moveTo(stroke[0][0], stroke[0][1]);
    for (let index = 1; index < stroke.length; index += 1) {
      context.lineTo(stroke[index][0], stroke[index][1]);
    }
    context.stroke();
  }

  function updateStrokeControls() {
    const count = strokes.length;
    strokeCount.textContent = formatMessage("strokeCount", { count: count.toLocaleString(locale) });
    undoButton.disabled = count === 0;
    clearButton.disabled = count === 0;
  }

  function clearDrawing() {
    window.clearTimeout(lookupTimer);
    remoteLookupController?.abort();
    remoteLookupController = undefined;
    strokes = [];
    currentStroke = undefined;
    selectedCharacter = "";
    redrawCanvas();
    updateStrokeControls();
    candidates.replaceChildren();
    candidateEmpty.hidden = false;
    result.hidden = true;
    if (workerReady) setStatus("ready", "ready");
  }

  function scheduleLookup(delay = 90) {
    window.clearTimeout(lookupTimer);
    if (!strokes.length) {
      clearDrawing();
      return;
    }
    setStatus(workerReady ? "recognizing" : "loading");
    if (!workerReady) return;
    lookupTimer = window.setTimeout(requestLookup, delay);
  }

  function requestLookup() {
    if (!workerReady || !strokes.length) return;
    remoteLookupController?.abort();
    remoteLookupController = undefined;
    lookupRequestId += 1;
    setStatus("recognizing");
    worker.postMessage({
      type: "lookup",
      requestId: lookupRequestId,
      strokes: core.cloneStrokes(strokes),
      limit: usesKoreanReadings ? 30 : CANDIDATE_LIMIT
    });
  }

  async function requestRemoteLookup(requestId, lookupStrokes) {
    const encodedStrokes = core.encodeRemoteStrokes(lookupStrokes);
    if (!encodedStrokes) {
      renderCandidates([]);
      return;
    }

    const controller = new AbortController();
    remoteLookupController?.abort();
    remoteLookupController = controller;
    const timeout = window.setTimeout(() => controller.abort(), REMOTE_LOOKUP_TIMEOUT);

    try {
      const response = await fetch(REMOTE_LOOKUP_URL, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        body: new URLSearchParams({ bh: encodedStrokes }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Remote handwriting recognition returned ${response.status}`);
      const matches = core.normalizeRemoteMatches(await response.text(), CANDIDATE_LIMIT);
      if (requestId === lookupRequestId && remoteLookupController === controller) renderCandidates(matches);
    } catch {
      if (requestId === lookupRequestId && remoteLookupController === controller) renderCandidates([]);
    } finally {
      window.clearTimeout(timeout);
      if (remoteLookupController === controller) remoteLookupController = undefined;
    }
  }

  function renderCandidates(matches) {
    matches = matches.slice(0, CANDIDATE_LIMIT);
    candidates.replaceChildren();
    if (!matches.length) {
      candidateEmpty.hidden = false;
      result.hidden = true;
      setStatus("noMatch", "error");
      return;
    }

    candidateEmpty.hidden = true;
    for (const [index, match] of matches.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "handwriting-candidate";
      button.textContent = match.character;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.setAttribute("aria-label", formatMessage("candidateLabel", { character: match.character }));
      button.addEventListener("click", () => selectCandidate(match.character, button));
      candidates.append(button);
      if (index === 0) selectCandidate(match.character, button);
    }
    setStatus("matched", "ready", { count: matches.length.toLocaleString(locale) });
  }

  async function selectCandidate(character, button) {
    selectedCharacter = character;
    candidates.querySelectorAll("button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    result.hidden = false;
    resultCharacter.textContent = character;
    resultPinyin.textContent = usesKoreanReadings ? "…" : (getReadings(character) || "-");
    resultStrokes.textContent = "…";
    resultUnicode.textContent = core.formatUnicode(character);
    strokeLink.href = `${localePaths[locale]}${usesKoreanReadings ? "korean-hanja-dictionary" : "chinese-stroke-order"}/?character=${encodeURIComponent(character)}`;
    pinyinLink.href = `${localePaths[locale]}${usesKoreanReadings ? "korean-name-hanja" : "chinese-to-pinyin"}/?character=${encodeURIComponent(character)}`;
    structureLink.href = `${localePaths[locale]}chinese-character-lookup/?character=${encodeURIComponent(character)}`;

    if (usesKoreanReadings) {
      try {
        const payload = await window.KoreanHanjaData.loadCharacters();
        const record = payload.records.find((item) => item.character === character);
        if (selectedCharacter === character) {
          resultPinyin.textContent = record?.readings?.join(" / ") || "-";
          if (record?.strokes) resultStrokes.textContent = record.strokes.toLocaleString(locale);
        }
      } catch {
        if (selectedCharacter === character) resultPinyin.textContent = "-";
      }
    }

    const requestId = ++detailRequestId;
    try {
      const response = await fetch(`${STROKE_DATA_ORIGIN}/${encodeURIComponent(character)}.json`, { mode: "cors" });
      if (!response.ok) throw new Error("Stroke data unavailable");
      const data = await response.json();
      if (requestId === detailRequestId && selectedCharacter === character) {
        resultStrokes.textContent = Array.isArray(data.strokes) ? data.strokes.length.toLocaleString(locale) : "-";
      }
    } catch {
      if (requestId === detailRequestId && selectedCharacter === character) resultStrokes.textContent = "-";
    }
  }

  function getReadings(character) {
    try {
      const readings = window.pinyinPro
        ?.polyphonic(character, { type: "array", toneType: "symbol", traditional: true })
        ?.flat(Infinity)
        .flatMap((item) => String(item).split(/\s+/u))
        .filter(Boolean);
      return [...new Set(readings || [])].join(" / ");
    } catch {
      return "";
    }
  }

  async function rankKoreanCandidates(matches) {
    const payload = await window.KoreanHanjaData.loadCharacters();
    const records = window.KoreanHanjaData.buildRecordMap(payload);
    return [...matches].sort((left, right) => {
      const leftRecord = records.get(left.character);
      const rightRecord = records.get(right.character);
      const leftRank = leftRecord?.nameUse ? 0 : leftRecord?.readings?.length ? 1 : 2;
      const rightRank = rightRecord?.nameUse ? 0 : rightRecord?.readings?.length ? 1 : 2;
      return leftRank - rightRank || right.score - left.score;
    });
  }

  async function copyCharacter() {
    if (!selectedCharacter) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(selectedCharacter);
      } else {
        const helper = document.createElement("textarea");
        helper.value = selectedCharacter;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.append(helper);
        helper.select();
        if (!document.execCommand("copy")) throw new Error("Copy command failed");
        helper.remove();
      }
      setStatus("copied", "ready");
    } catch (error) {
      console.error(error);
      setStatus("copyFailed", "error");
    }
  }

  function formatMessage(key, values = {}) {
    const name = `message${key[0].toUpperCase()}${key.slice(1)}`;
    const template = body.dataset[name] || key;
    return Object.entries(values).reduce(
      (text, [variable, value]) => text.replaceAll(`{${variable}}`, value),
      template
    );
  }

  function setStatus(key, type = "idle", values = {}) {
    status.classList.toggle("is-ready", type === "ready");
    status.classList.toggle("is-error", type === "error");
    status.lastElementChild.textContent = formatMessage(key, values);
  }
})();
