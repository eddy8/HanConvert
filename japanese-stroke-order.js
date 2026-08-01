(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.JapaneseStrokeCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const KANJIVG_RELEASE = "r20250816";
  const KANJIVG_BASE = `https://cdn.jsdmirror.cn/gh/KanjiVG/kanjivg@${KANJIVG_RELEASE}/kanji`;

  function extractKanji(value, limit = 8) {
    const matches = [...String(value).matchAll(/\p{Script=Han}/gu)].map((match) => match[0]);
    return [...new Set(matches)].slice(0, limit);
  }

  function filenameForKanji(character) {
    const codePoint = String(character || "").codePointAt(0);
    if (!Number.isInteger(codePoint)) return "";
    return `${codePoint.toString(16).padStart(5, "0")}.svg`;
  }

  function dataUrlForKanji(character) {
    const filename = filenameForKanji(character);
    return filename ? `${KANJIVG_BASE}/${filename}` : "";
  }

  function parseKanjiVgSource(source, Parser = globalThis.DOMParser) {
    if (typeof Parser !== "function") throw new Error("DOMParser is unavailable");
    const doc = new Parser().parseFromString(String(source || ""), "image/svg+xml");
    if (doc.querySelector("parsererror")) throw new Error("Invalid KanjiVG SVG");

    const strokes = [...doc.querySelectorAll("path[d]")]
      .filter((node) => /^kvg:[0-9a-f]+-s\d+$/iu.test(node.id))
      .map((node) => ({
        order: Number(node.id.match(/-s(\d+)$/u)?.[1]),
        d: node.getAttribute("d") || ""
      }))
      .filter((stroke) => stroke.order > 0 && /^[MmLlHhVvCcSsQqTtAaZz0-9eE+.,\-\s]+$/u.test(stroke.d))
      .sort((left, right) => left.order - right.order);

    if (!strokes.length) throw new Error("KanjiVG SVG contains no strokes");
    const numbers = [...doc.querySelectorAll("text")].map((node) => {
      const value = node.textContent?.trim() || "";
      const transform = node.getAttribute("transform") || "";
      if (!/^\d{1,2}$/u.test(value) || !/^matrix\([0-9eE+.,\-\s]+\)$/u.test(transform)) return null;
      return { value, transform };
    }).filter(Boolean);
    return { strokes, numbers };
  }

  return { KANJIVG_RELEASE, extractKanji, filenameForKanji, dataUrlForKanji, parseKanjiVgSource };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const MAX_CHARACTERS = 8;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const localePaths = { "zh-CN": "/", "zh-TW": "/zh-tw/", en: "/en/", ja: "/ja/", ko: "/ko/" };
  const body = document.body;
  if (body.dataset.toolPage !== "japanese-stroke-order") return;
  const core = window.JapaneseStrokeCore;
  const cache = new Map();

  const form = document.querySelector("#jpStrokeSearchForm");
  const input = document.querySelector("#jpStrokeInput");
  const status = document.querySelector("#jpStrokeStatus");
  const tabs = document.querySelector("#jpStrokeCharacterTabs");
  const target = document.querySelector("#kanjiVgTarget");
  const currentCharacter = document.querySelector("#jpStrokeCurrentCharacter");
  const countValue = document.querySelector("#jpStrokeCount");
  const positionValue = document.querySelector("#jpStrokePosition");
  const unicodeValue = document.querySelector("#jpStrokeUnicode");
  const previousButton = document.querySelector("#jpStrokePrevious");
  const nextButton = document.querySelector("#jpStrokeNext");
  const playButton = document.querySelector("#jpStrokePlay");
  const pauseButton = document.querySelector("#jpStrokePause");
  const pauseLabel = document.querySelector("#jpStrokePauseLabel");
  const stepButton = document.querySelector("#jpStrokeStep");
  const resetButton = document.querySelector("#jpStrokeReset");
  const outlineToggle = document.querySelector("#jpStrokeOutline");
  const numbersToggle = document.querySelector("#jpStrokeNumbers");
  const speedSelect = document.querySelector("#jpStrokeSpeed");

  let characters = [];
  let currentIndex = 0;
  let currentData;
  let drawnPaths = [];
  let stepIndex = 0;
  let animationToken = 0;
  let currentAnimation;
  let isPaused = false;

  setupLocaleSelector();
  setupControls();
  initialize();

  function setupLocaleSelector() {
    const selector = document.querySelector("#localeSelect");
    if (!selector) return;
    selector.addEventListener("change", () => {
      const nextLocale = selector.value;
      localStorage.setItem("jianfan-locale", nextLocale);
      localStorage.setItem("jianfan-locale-manual", "1");
      const base = localePaths[nextLocale] || "/";
      window.location.href = `${base}${body.dataset.pageSlug}/`.replace("//", "/") + window.location.search;
    });
  }

  function setupControls() {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nextCharacters = core.extractKanji(input.value, MAX_CHARACTERS);
      if (!nextCharacters.length) {
        setStatus("invalid", "error");
        input.focus();
        return;
      }
      input.value = nextCharacters.join("");
      setCharacters(nextCharacters);
    });

    document.querySelectorAll("[data-jp-stroke-sample]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.jpStrokeSample || "";
        form.requestSubmit();
      });
    });

    previousButton.addEventListener("click", () => selectCharacter(currentIndex - 1));
    nextButton.addEventListener("click", () => selectCharacter(currentIndex + 1));
    playButton.addEventListener("click", playAll);
    pauseButton.addEventListener("click", togglePause);
    stepButton.addEventListener("click", playNextStroke);
    resetButton.addEventListener("click", resetDrawing);
    outlineToggle.addEventListener("change", updateDisplayOptions);
    numbersToggle.addEventListener("change", updateDisplayOptions);
  }

  async function initialize() {
    const queryCharacter = new URLSearchParams(window.location.search).get("character");
    const initial = core.extractKanji(queryCharacter || body.dataset.initialCharacter || "永", 1)[0] || "永";
    input.value = initial;
    await setCharacters([initial]);
  }

  async function setCharacters(nextCharacters) {
    characters = nextCharacters;
    currentIndex = 0;
    renderTabs();
    await showCharacter();
  }

  async function selectCharacter(index) {
    if (index < 0 || index >= characters.length || index === currentIndex) return;
    currentIndex = index;
    renderTabs();
    await showCharacter();
  }

  async function showCharacter() {
    const character = characters[currentIndex];
    cancelAnimation();
    setControlsDisabled(true);
    setStatus("loading");
    target.replaceChildren();
    currentData = undefined;

    try {
      currentData = await loadKanji(character);
      renderKanji(currentData);
      updateSummary(character);
      setControlsDisabled(false);
      setStatus("ready", "ready", { character });
    } catch (error) {
      console.error(error);
      updateSummary(character);
      target.replaceChildren(createMissingGlyph(character));
      setControlsDisabled(true, true);
      setStatus("missing", "error", { character });
    }
  }

  async function loadKanji(character) {
    if (cache.has(character)) return cache.get(character);
    const request = fetch(core.dataUrlForKanji(character), { mode: "cors", cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`KanjiVG data unavailable for ${character}`);
        return response.text();
      })
      .then((source) => core.parseKanjiVgSource(source));
    cache.set(character, request);
    try {
      return await request;
    } catch (error) {
      cache.delete(character);
      throw error;
    }
  }

  function renderKanji(data) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 109 109");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", body.dataset.svgLabel.replace("{character}", characters[currentIndex]));
    svg.classList.add("kanjivg-canvas");

    const outlines = document.createElementNS(SVG_NS, "g");
    outlines.classList.add("kanjivg-outlines");
    const drawing = document.createElementNS(SVG_NS, "g");
    drawing.classList.add("kanjivg-drawing");
    const numbers = document.createElementNS(SVG_NS, "g");
    numbers.classList.add("kanjivg-numbers");

    data.strokes.forEach((stroke) => {
      const outline = document.createElementNS(SVG_NS, "path");
      outline.setAttribute("d", stroke.d);
      outlines.append(outline);
      const drawn = outline.cloneNode();
      drawn.dataset.stroke = String(stroke.order);
      drawing.append(drawn);
    });

    data.numbers.forEach((number) => {
      const label = document.createElementNS(SVG_NS, "text");
      label.textContent = number.value;
      label.setAttribute("transform", number.transform);
      numbers.append(label);
    });

    svg.append(outlines, drawing, numbers);
    target.replaceChildren(svg);
    drawnPaths = [...drawing.querySelectorAll("path")];
    drawnPaths.forEach((path) => {
      const length = Math.ceil(path.getTotalLength());
      path.dataset.length = String(length);
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    });
    stepIndex = 0;
    updateDisplayOptions();
  }

  function createMissingGlyph(character) {
    const fallback = document.createElement("span");
    fallback.className = "kanjivg-missing-glyph";
    fallback.textContent = character;
    return fallback;
  }

  function renderTabs() {
    tabs.replaceChildren();
    characters.forEach((character, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = character;
      button.className = index === currentIndex ? "is-active" : "";
      button.setAttribute("aria-pressed", String(index === currentIndex));
      button.addEventListener("click", () => selectCharacter(index));
      tabs.append(button);
    });
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex >= characters.length - 1;
  }

  function updateSummary(character) {
    currentCharacter.textContent = character;
    countValue.textContent = currentData ? String(currentData.strokes.length) : "-";
    positionValue.textContent = `${currentIndex + 1} / ${characters.length}`;
    unicodeValue.textContent = `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
    renderTabs();
  }

  async function playAll() {
    if (!drawnPaths.length) return;
    cancelAnimation();
    resetPathOffsets();
    const token = animationToken;
    stepIndex = 0;
    isPaused = false;
    pauseButton.disabled = false;
    updatePauseButton();
    setStatus("playing");
    for (let index = 0; index < drawnPaths.length; index += 1) {
      if (token !== animationToken) return;
      stepIndex = index + 1;
      await animatePath(drawnPaths[index]);
    }
    if (token !== animationToken) return;
    currentAnimation = undefined;
    pauseButton.disabled = true;
    setStatus("ready", "ready", { character: characters[currentIndex] });
  }

  async function playNextStroke() {
    if (!drawnPaths.length) return;
    cancelAnimation();
    if (stepIndex >= drawnPaths.length) {
      resetPathOffsets();
      stepIndex = 0;
    }
    const index = stepIndex;
    stepIndex += 1;
    setStatus("step", "ready", { current: stepIndex, total: drawnPaths.length });
    await animatePath(drawnPaths[index]);
    currentAnimation = undefined;
  }

  function animatePath(path) {
    const length = Number(path.dataset.length);
    const speed = Number(speedSelect.value) || 1;
    const animation = path.animate(
      [{ strokeDashoffset: String(length) }, { strokeDashoffset: "0" }],
      { duration: Math.max(220, 720 / speed), easing: "ease-in-out", fill: "forwards" }
    );
    currentAnimation = animation;
    return animation.finished.then(() => {
      path.style.strokeDashoffset = "0";
    }).catch(() => undefined);
  }

  function togglePause() {
    if (!currentAnimation) return;
    if (isPaused) {
      currentAnimation.play();
      isPaused = false;
      setStatus("playing");
    } else {
      currentAnimation.pause();
      isPaused = true;
      setStatus("paused");
    }
    updatePauseButton();
  }

  function resetDrawing() {
    cancelAnimation();
    resetPathOffsets();
    stepIndex = 0;
    setStatus("ready", "ready", { character: characters[currentIndex] });
  }

  function cancelAnimation() {
    animationToken += 1;
    currentAnimation?.cancel();
    currentAnimation = undefined;
    isPaused = false;
    pauseButton.disabled = true;
    updatePauseButton();
  }

  function resetPathOffsets() {
    drawnPaths.forEach((path) => {
      path.getAnimations().forEach((animation) => animation.cancel());
      path.style.strokeDashoffset = path.dataset.length;
    });
  }

  function updatePauseButton() {
    pauseLabel.textContent = body.dataset[isPaused ? "labelResume" : "labelPause"];
    pauseButton.setAttribute("aria-pressed", String(isPaused));
  }

  function updateDisplayOptions() {
    target.classList.toggle("hide-outline", !outlineToggle.checked);
    target.classList.toggle("hide-numbers", !numbersToggle.checked);
  }

  function setControlsDisabled(disabled, keepNavigation = false) {
    [playButton, pauseButton, stepButton, resetButton, outlineToggle, numbersToggle, speedSelect].forEach((control) => {
      control.disabled = disabled;
    });
    if (!keepNavigation) renderTabs();
    if (!disabled) pauseButton.disabled = true;
  }

  function setStatus(key, state = "", values = {}) {
    let message = body.dataset[`message${key[0].toUpperCase()}${key.slice(1)}`] || "";
    Object.entries(values).forEach(([name, value]) => {
      message = message.replaceAll(`{${name}}`, String(value));
    });
    status.className = `status-pill${state ? ` ${state}` : ""}`;
    status.querySelector("span:last-child").textContent = message;
  }
})();
