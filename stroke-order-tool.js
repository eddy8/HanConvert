(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.StrokeOrderCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function extractStrokeCharacters(value, limit = 8) {
    const matches = [...String(value).matchAll(/\p{Script=Han}/gu)].map((match) => match[0]);
    return [...new Set(matches)].slice(0, limit);
  }

  return { extractStrokeCharacters };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const MAX_CHARACTERS = 8;
  const DATA_ORIGIN = "https://cdn.jsdelivr.net/npm/hanzi-writer-data";
  const localePaths = {
    "zh-CN": "/",
    "zh-TW": "/zh-tw/",
    en: "/en/",
    ja: "/ja/",
    ko: "/ko/"
  };

  const body = document.body;
  const locale = body.dataset.locale || "zh-CN";
  const pageSlug = body.dataset.pageSlug || "chinese-stroke-order";
  const form = document.querySelector("#strokeSearchForm");
  const input = document.querySelector("#strokeInput");
  const status = document.querySelector("#strokeStatus");
  const characterTabs = document.querySelector("#strokeCharacterTabs");
  const writerTarget = document.querySelector("#strokeWriterTarget");
  const currentCharacter = document.querySelector("#strokeCurrentCharacter");
  const pinyinValue = document.querySelector("#strokePinyin");
  const countValue = document.querySelector("#strokeCount");
  const positionValue = document.querySelector("#strokePosition");
  const unicodeValue = document.querySelector("#strokeUnicode");
  const previousButton = document.querySelector("#strokePrevious");
  const nextButton = document.querySelector("#strokeNext");
  const animateButton = document.querySelector("#strokeAnimate");
  const pauseButton = document.querySelector("#strokePause");
  const pauseLabel = document.querySelector("#strokePauseLabel");
  const stepButton = document.querySelector("#strokeStep");
  const quizButton = document.querySelector("#strokeQuiz");
  const resetButton = document.querySelector("#strokeReset");
  const outlineToggle = document.querySelector("#strokeOutline");
  const dataCache = new Map();
  const { extractStrokeCharacters } = window.StrokeOrderCore;

  let writer;
  let characters = [];
  let currentIndex = 0;
  let currentData;
  let stepIndex = 0;
  let activity = "idle";
  let isPaused = false;

  setupLocaleSelector();
  setupControls();
  initialize();

  async function initialize() {
    if (!window.HanziWriter) {
      setStatus("componentError", "error");
      disableTool();
      return;
    }
    const initial = extractStrokeCharacters(body.dataset.initialCharacter || "永", MAX_CHARACTERS)[0] || "永";
    input.value = initial;
    await setCharacters([initial]);
    setupResizeObserver();
  }

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

  function setupControls() {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nextCharacters = extractStrokeCharacters(input.value, MAX_CHARACTERS);
      if (!nextCharacters.length) {
        setStatus("invalid", "error");
        input.focus();
        return;
      }
      input.value = nextCharacters.join("");
      setCharacters(nextCharacters);
    });

    document.querySelectorAll("[data-stroke-sample]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.strokeSample || "";
        form.requestSubmit();
      });
    });

    previousButton.addEventListener("click", () => selectCharacter(currentIndex - 1));
    nextButton.addEventListener("click", () => selectCharacter(currentIndex + 1));
    animateButton.addEventListener("click", playAnimation);
    pauseButton.addEventListener("click", togglePause);
    stepButton.addEventListener("click", playNextStroke);
    quizButton.addEventListener("click", startQuiz);
    resetButton.addEventListener("click", resetWriter);
    outlineToggle.addEventListener("change", () => {
      if (!writer) return;
      if (outlineToggle.checked) writer.showOutline({ duration: 180 });
      else writer.hideOutline({ duration: 180 });
    });
  }

  async function setCharacters(nextCharacters) {
    characters = nextCharacters;
    currentIndex = 0;
    renderCharacterTabs();
    await showCharacter();
  }

  async function selectCharacter(index) {
    if (index < 0 || index >= characters.length || index === currentIndex) return;
    currentIndex = index;
    renderCharacterTabs();
    await showCharacter();
  }

  async function showCharacter() {
    const character = characters[currentIndex];
    setControlsDisabled(true);
    setStatus("loading");
    activity = "loading";
    stepIndex = 0;
    isPaused = false;
    updatePauseButton();

    try {
      if (writer) {
        writer.cancelQuiz();
        await writer.pauseAnimation();
      }
      currentData = await loadCharacterData(character);
      if (!writer) {
        const size = getWriterSize();
        writer = window.HanziWriter.create(writerTarget, character, {
          width: size,
          height: size,
          padding: 24,
          charDataLoader: loadCharacterData,
          showOutline: outlineToggle.checked,
          showCharacter: true,
          strokeColor: "#f2f6f4",
          outlineColor: "#31574d",
          highlightColor: "#ffcc66",
          drawingColor: "#40f2b0",
          strokeAnimationSpeed: 1.15,
          strokeHighlightSpeed: 1.4,
          drawingWidth: 18,
          strokeWidth: 5,
          outlineWidth: 2
        });
        await writer.getCharacterData();
      } else {
        await writer.setCharacter(character);
      }
      updateCharacterInfo(character);
      activity = "ready";
      setStatus("ready", "ready", { character });
      setControlsDisabled(false);
    } catch (error) {
      console.error(error);
      currentData = undefined;
      updateCharacterInfo(character);
      activity = "error";
      setStatus("missing", "error", { character });
      setControlsDisabled(true, true);
    }
  }

  async function loadCharacterData(character) {
    if (dataCache.has(character)) return dataCache.get(character);
    const request = fetch(`${DATA_ORIGIN}/${encodeURIComponent(character)}.json`, { mode: "cors" }).then((response) => {
      if (!response.ok) throw new Error(`Character data unavailable: ${character}`);
      return response.json();
    });
    dataCache.set(character, request);
    try {
      return await request;
    } catch (error) {
      dataCache.delete(character);
      throw error;
    }
  }

  function renderCharacterTabs() {
    characterTabs.replaceChildren();
    characters.forEach((character, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = character;
      button.className = index === currentIndex ? "is-active" : "";
      button.setAttribute("aria-pressed", String(index === currentIndex));
      button.addEventListener("click", () => selectCharacter(index));
      characterTabs.append(button);
    });
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex >= characters.length - 1;
  }

  function updateCharacterInfo(character) {
    currentCharacter.textContent = character;
    pinyinValue.textContent = getPinyin(character);
    countValue.textContent = currentData?.strokes?.length?.toLocaleString(locale) || "-";
    positionValue.textContent = `${currentIndex + 1} / ${characters.length}`;
    unicodeValue.textContent = `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
    renderCharacterTabs();
  }

  function getPinyin(character) {
    if (!window.pinyinPro?.pinyin) return "-";
    try {
      return window.pinyinPro.pinyin(character, { traditional: true, type: "string" });
    } catch {
      return "-";
    }
  }

  function playAnimation() {
    if (!writer || !currentData) return;
    writer.cancelQuiz();
    activity = "animation";
    isPaused = false;
    stepIndex = 0;
    pauseButton.disabled = false;
    updatePauseButton();
    setStatus("playing");
    writer.animateCharacter({
      onComplete: () => {
        activity = "ready";
        pauseButton.disabled = true;
        setStatus("ready", "ready", { character: characters[currentIndex] });
      }
    });
  }

  async function togglePause() {
    if (!writer || activity !== "animation") return;
    if (isPaused) {
      await writer.resumeAnimation();
      isPaused = false;
      setStatus("playing");
    } else {
      await writer.pauseAnimation();
      isPaused = true;
      setStatus("paused");
    }
    updatePauseButton();
  }

  function playNextStroke() {
    if (!writer || !currentData?.strokes?.length) return;
    writer.cancelQuiz();
    writer.pauseAnimation();
    activity = "step";
    const strokeNumber = stepIndex % currentData.strokes.length;
    stepIndex = strokeNumber + 1;
    setStatus("step", "ready", { current: strokeNumber + 1, total: currentData.strokes.length });
    writer.animateStroke(strokeNumber);
  }

  function startQuiz() {
    if (!writer || !currentData) return;
    writer.pauseAnimation();
    writer.cancelQuiz();
    activity = "quiz";
    stepIndex = 0;
    pauseButton.disabled = true;
    setStatus("quiz");
    writer.quiz({
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onComplete: (summary) => {
        activity = "ready";
        setStatus("quizComplete", "ready", { mistakes: summary.totalMistakes.toLocaleString(locale) });
      }
    });
  }

  async function resetWriter() {
    if (!writer || !currentData) return;
    writer.cancelQuiz();
    await writer.pauseAnimation();
    await writer.setCharacter(characters[currentIndex]);
    activity = "ready";
    stepIndex = 0;
    isPaused = false;
    pauseButton.disabled = true;
    updatePauseButton();
    setStatus("ready", "ready", { character: characters[currentIndex] });
  }

  function updatePauseButton() {
    pauseLabel.textContent = body.dataset[isPaused ? "labelResume" : "labelPause"];
    pauseButton.setAttribute("aria-pressed", String(isPaused));
  }

  function setControlsDisabled(disabled, keepNavigation = false) {
    [animateButton, pauseButton, stepButton, quizButton, resetButton, outlineToggle].forEach((control) => {
      control.disabled = disabled;
    });
    if (!disabled) pauseButton.disabled = activity !== "animation";
    renderCharacterTabs();
    if (disabled && !keepNavigation) {
      previousButton.disabled = true;
      nextButton.disabled = true;
      characterTabs.querySelectorAll("button").forEach((button) => {
        button.disabled = true;
      });
    }
  }

  function setStatus(key, type = "idle", values = {}) {
    const datasetKey = `message${key[0].toUpperCase()}${key.slice(1)}`;
    const template = body.dataset[datasetKey] || key;
    status.classList.toggle("is-ready", type === "ready");
    status.classList.toggle("is-error", type === "error");
    status.lastElementChild.textContent = Object.entries(values).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, value),
      template
    );
  }

  function getWriterSize() {
    return Math.max(260, Math.min(writerTarget.parentElement.clientWidth, 390));
  }

  function setupResizeObserver() {
    if (!window.ResizeObserver) return;
    const observer = new ResizeObserver(() => {
      if (!writer) return;
      const size = getWriterSize();
      writer.updateDimensions({ width: size, height: size, padding: 24 });
    });
    observer.observe(writerTarget.parentElement);
  }

  function disableTool() {
    form.querySelectorAll("input, button").forEach((element) => {
      element.disabled = true;
    });
    setControlsDisabled(true);
  }
})();
