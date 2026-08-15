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
  const splitRanges = {};
  const expandedChoices = new Set();
  let currentChoices = [];
  let activeChoiceId = "";
  let focusRequest = "";
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

  function resetChoiceState() {
    Object.keys(selections).forEach((key) => delete selections[key]);
    Object.keys(splitRanges).forEach((key) => delete splitRanges[key]);
    expandedChoices.clear();
    currentChoices = [];
    activeChoiceId = "";
    focusRequest = "";
  }

  function buildContext(choice) {
    const characters = Array.from(elements.input.value);
    const start = Math.max(0, choice.start - 18);
    const end = Math.min(characters.length, choice.end + 18);
    const context = document.createElement("p");
    context.className = "korean-converter-choice-context";
    if (start > 0) context.append("…");
    context.append(characters.slice(start, choice.start).join(""));
    const mark = document.createElement("mark");
    mark.textContent = characters.slice(choice.start, choice.end).join("");
    context.append(mark, characters.slice(choice.end, end).join(""));
    if (end < characters.length) context.append("…");
    return context;
  }

  function moveChoice(offset) {
    if (currentChoices.length < 2) return;
    const currentIndex = Math.max(0, currentChoices.findIndex((choice) => choice.id === activeChoiceId));
    activeChoiceId = currentChoices[(currentIndex + offset + currentChoices.length) % currentChoices.length].id;
    focusRequest = offset < 0 ? "previous" : "next";
    renderChoices(currentChoices, true);
  }

  function renderChoices(choices, preserveFiltered = false) {
    elements.choices.replaceChildren();
    if (!preserveFiltered) currentChoices = choices.filter((choice) => choice.candidates.length > 1);
    elements.choicesEmpty.hidden = currentChoices.length > 0;
    if (!currentChoices.length) return;

    let currentIndex = currentChoices.findIndex((choice) => choice.id === activeChoiceId);
    if (currentIndex < 0) {
      currentIndex = currentChoices.findIndex((choice) => !choice.resolved);
      if (currentIndex < 0) currentIndex = 0;
    }
    const choice = currentChoices[currentIndex];
    activeChoiceId = choice.id;
    let focusTarget;
    function trackFocus(button, key) {
      if (focusRequest === key || (focusRequest === "firstCandidate" && key.startsWith("candidate:"))) {
        focusTarget ||= button;
      }
    }

    const group = document.createElement("section");
    group.className = "korean-converter-choice";
    group.setAttribute("aria-label", `${choice.source} ${message("choicePosition", { current: currentIndex + 1, total: currentChoices.length })}`);

    const header = document.createElement("div");
    header.className = "korean-converter-choice-header";
    const title = document.createElement("strong");
    title.textContent = choice.source;
    const counter = document.createElement("span");
    counter.textContent = message("choicePosition", { current: currentIndex + 1, total: currentChoices.length });
    const navigation = document.createElement("div");
    navigation.className = "korean-converter-choice-navigation";
    for (const [offset, symbol, label, key] of [[-1, "←", message("previousChoice"), "previous"], [1, "→", message("nextChoice"), "next"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = symbol;
      button.title = label;
      button.setAttribute("aria-label", label);
      button.disabled = currentChoices.length < 2;
      button.addEventListener("click", () => moveChoice(offset));
      trackFocus(button, key);
      navigation.append(button);
    }
    header.append(title, counter, navigation);

    const candidates = document.createElement("div");
    candidates.className = "korean-converter-choice-candidates";
    const expanded = expandedChoices.has(choice.id);
    const visibleCandidates = expanded ? choice.candidates : choice.candidates.slice(0, 24);
    for (const candidate of visibleCandidates) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = candidate;
      button.classList.toggle("is-active", choice.selected === candidate);
      button.setAttribute("aria-pressed", String(choice.selected === candidate));
      button.addEventListener("click", () => {
        selections[choice.id] = candidate;
        activeChoiceId = choice.id;
        focusRequest = `candidate:${candidate}`;
        convert();
      });
      trackFocus(button, `candidate:${candidate}`);
      candidates.append(button);
    }
    if (choice.candidates.length > 24) {
      const expand = document.createElement("button");
      expand.type = "button";
      expand.className = "korean-converter-choice-expand";
      expand.textContent = expanded
        ? message("showLess")
        : message("showAll", { count: choice.candidates.length.toLocaleString(body.dataset.locale) });
      expand.setAttribute("aria-expanded", String(expanded));
      expand.addEventListener("click", () => {
        if (expanded) expandedChoices.delete(choice.id);
        else expandedChoices.add(choice.id);
        focusRequest = "expand";
        renderChoices(currentChoices, true);
      });
      trackFocus(expand, "expand");
      candidates.append(expand);
    }

    const actions = document.createElement("div");
    actions.className = "korean-converter-choice-actions";
    const keep = document.createElement("button");
    keep.type = "button";
    keep.textContent = message("keepOriginal");
    keep.classList.toggle("is-active", choice.resolved && choice.selected === choice.source);
    keep.setAttribute("aria-pressed", String(choice.resolved && choice.selected === choice.source));
    keep.addEventListener("click", () => {
      selections[choice.id] = choice.source;
      activeChoiceId = choice.id;
      focusRequest = "keep";
      convert();
    });
    trackFocus(keep, "keep");
    actions.append(keep);

    if (Array.from(choice.source).length > 1) {
      const split = document.createElement("button");
      split.type = "button";
      split.textContent = message("splitCharacters");
      split.addEventListener("click", () => {
        splitRanges[choice.id] = { start: choice.start, end: choice.end, source: choice.source };
        delete selections[choice.id];
        activeChoiceId = "";
        focusRequest = "firstCandidate";
        convert();
      });
      trackFocus(split, "split");
      actions.append(split);
    }

    const matchingOccurrences = currentChoices.filter((item) => item.source === choice.source && item.candidates.includes(choice.selected));
    if (choice.selected !== choice.source && matchingOccurrences.length > 1) {
      const applyAll = document.createElement("button");
      applyAll.type = "button";
      applyAll.textContent = message("applyAll");
      applyAll.addEventListener("click", () => {
        for (const item of matchingOccurrences) selections[item.id] = choice.selected;
        activeChoiceId = choice.id;
        focusRequest = "applyAll";
        convert();
      });
      trackFocus(applyAll, "applyAll");
      actions.append(applyAll);
    }

    group.append(header, buildContext(choice), candidates, actions);
    elements.choices.append(group);
    if (focusTarget) {
      focusRequest = "";
      window.setTimeout(() => {
        if (focusTarget.isConnected) focusTarget.focus();
      }, 0);
    }
  }

  async function convert() {
    const input = elements.input.value;
    if (!input.trim()) {
      elements.output.value = "";
      elements.choices.replaceChildren();
      elements.choicesEmpty.hidden = false;
      currentChoices = [];
      activeChoiceId = "";
      setStatus("idle");
      return;
    }
    try {
      const data = await ensureWords();
      let pending = 0;
      let result;
      if (direction === "hangul-to-hanja") {
        result = core.convertHangulToHanja(input, data.words, {
          mode: elements.mode.value,
          selections,
          splitRanges
        });
      } else {
        if (!reverseWords) reverseWords = core.buildReverseWords(data.words);
        result = core.convertHanjaToHangul(input, reverseWords, {
          mode: elements.mode.value,
          selections,
          splitRanges
        });
      }
      elements.output.value = result.output;
      renderChoices(result.choices);
      pending = result.choices.filter((choice) => choice.candidates.length > 1 && !choice.resolved).length;
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
    resetChoiceState();
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
    resetChoiceState();
    elements.input.value = direction === "hangul-to-hanja" ? "대한민국의 역사와 문화" : "大韓民國의 歷史와 文化";
    convert();
  });
  elements.clear.addEventListener("click", () => {
    resetChoiceState();
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
