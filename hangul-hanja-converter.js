(function () {
  "use strict";

  if (typeof document === "undefined" || document.body.dataset.toolPage !== "hangul-hanja-converter") return;
  const core = globalThis.KoreanHanjaData;
  const body = document.body;
  const elements = {
    locale: document.querySelector("#localeSelect"),
    directions: [...document.querySelectorAll("[data-korean-direction]")],
    input: document.querySelector("#koreanConverterInput"),
    output: document.querySelector("#koreanConverterOutput"),
    mode: document.querySelector("#koreanConverterMode"),
    convert: document.querySelector("#koreanConverterSubmit"),
    sample: document.querySelector("#koreanConverterSample"),
    clear: document.querySelector("#koreanConverterClear"),
    copy: document.querySelector("#koreanConverterCopy"),
    status: document.querySelector("#koreanConverterStatus"),
    progress: document.querySelector("#koreanConverterProgress"),
    progressBar: document.querySelector("#koreanConverterProgressBar"),
    progressText: document.querySelector("#koreanConverterProgressText"),
    choices: document.querySelector("#koreanConverterChoices"),
    choicesEmpty: document.querySelector("#koreanConverterChoicesEmpty")
  };
  let direction = "hangul-to-hanja";
  let payload;
  let reverseWords;
  const selections = {};
  let inputTimer;

  function message(key, values = {}) {
    const source = body.dataset[`message${key[0].toUpperCase()}${key.slice(1)}`] || key;
    return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), source);
  }

  function setStatus(key, type = "idle", values = {}) {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = message(key, values);
  }

  async function ensureWords() {
    if (payload) return payload;
    elements.progress.hidden = false;
    setStatus("loading");
    payload = await core.loadWords({
      onProgress(progress) {
        elements.progressBar.style.width = `${progress.percent}%`;
        elements.progressText.textContent = progress.total
          ? message("loadingProgress", { percent: progress.percent })
          : message("loading");
      }
    });
    elements.progressBar.style.width = "100%";
    elements.progressText.textContent = message("loaded", { count: payload.meta.entries.toLocaleString(body.dataset.locale) });
    window.setTimeout(() => { elements.progress.hidden = true; }, 450);
    return payload;
  }

  function renderChoices(choices) {
    elements.choices.replaceChildren();
    const ambiguous = choices.filter((choice) => choice.candidates.length > 1).slice(0, 20);
    elements.choicesEmpty.hidden = ambiguous.length > 0;
    const fragment = document.createDocumentFragment();
    for (const choice of ambiguous) {
      const group = document.createElement("section");
      group.className = "korean-converter-choice";
      const title = document.createElement("strong");
      title.textContent = choice.source;
      const buttons = document.createElement("div");
      for (const candidate of choice.candidates.slice(0, 12)) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = candidate;
        button.classList.toggle("is-active", (selections[choice.source] || choice.selected) === candidate);
        button.setAttribute("aria-pressed", String((selections[choice.source] || choice.selected) === candidate));
        button.addEventListener("click", () => {
          selections[choice.source] = candidate;
          convert();
        });
        buttons.append(button);
      }
      group.append(title, buttons);
      fragment.append(group);
    }
    elements.choices.append(fragment);
  }

  async function convert() {
    const input = elements.input.value;
    if (!input.trim()) {
      elements.output.value = "";
      elements.choices.replaceChildren();
      elements.choicesEmpty.hidden = false;
      setStatus("idle");
      return;
    }
    try {
      const data = await ensureWords();
      let pending = 0;
      if (direction === "hangul-to-hanja") {
        const result = core.convertHangulToHanja(input, data.words, {
          mode: elements.mode.value,
          selections
        });
        elements.output.value = result.output;
        renderChoices(result.choices);
        pending = new Set(result.choices
          .filter((choice) => choice.candidates.length > 1 && !selections[choice.source])
          .map((choice) => choice.source)).size;
      } else {
        if (!reverseWords) reverseWords = core.buildReverseWords(data.words);
        elements.output.value = core.convertHanjaToHangul(input, reverseWords, { mode: elements.mode.value });
        elements.choices.replaceChildren();
        elements.choicesEmpty.hidden = false;
      }
      setStatus(pending ? "pending" : "ready", pending ? "idle" : "ready", {
        count: [...elements.output.value].length.toLocaleString(body.dataset.locale),
        pending: pending.toLocaleString(body.dataset.locale)
      });
    } catch (error) {
      console.error(error);
      elements.progress.hidden = true;
      setStatus("error", "error");
    }
  }

  function setDirection(nextDirection) {
    if (direction === nextDirection) return;
    direction = nextDirection;
    Object.keys(selections).forEach((key) => delete selections[key]);
    elements.directions.forEach((button) => {
      const active = button.dataset.koreanDirection === direction;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
    const current = elements.input.value;
    elements.input.value = elements.output.value;
    elements.output.value = current;
    convert();
  }

  elements.directions.forEach((button) => button.addEventListener("click", () => setDirection(button.dataset.koreanDirection)));
  elements.convert.addEventListener("click", convert);
  elements.mode.addEventListener("change", convert);
  elements.input.addEventListener("input", () => {
    window.clearTimeout(inputTimer);
    inputTimer = window.setTimeout(convert, 350);
  });
  elements.sample.addEventListener("click", () => {
    elements.input.value = direction === "hangul-to-hanja" ? "대한민국의 역사와 문화" : "大韓民國의 歷史와 文化";
    convert();
  });
  elements.clear.addEventListener("click", () => {
    elements.input.value = "";
    elements.output.value = "";
    elements.choices.replaceChildren();
    elements.choicesEmpty.hidden = false;
    setStatus("idle");
    elements.input.focus();
  });
  elements.copy.addEventListener("click", async () => {
    if (!elements.output.value) return;
    try {
      await navigator.clipboard.writeText(elements.output.value);
      setStatus("copied", "ready");
    } catch {
      elements.output.select();
      setStatus("copyFailed", "error");
    }
  });
  elements.locale.addEventListener("change", () => {
    localStorage.setItem("jianfan-locale", elements.locale.value);
    localStorage.setItem("jianfan-locale-manual", "1");
    location.href = `${body.dataset.localePaths.split("|").find((item) => item.startsWith(`${elements.locale.value}:`))?.split(":")[1] || "/"}hangul-hanja-converter/`;
  });
})();
