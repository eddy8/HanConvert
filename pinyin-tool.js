(function () {
  "use strict";

  const MAX_INPUT_CHARACTERS = 100000;
  const ANNOTATION_PREVIEW_CHARACTERS = 500;
  const localePaths = {
    "zh-CN": "/",
    "zh-TW": "/zh-tw/",
    en: "/en/",
    ja: "/ja/",
    ko: "/ko/"
  };

  const body = document.body;
  const locale = body.dataset.locale || "zh-CN";
  const pageSlug = body.dataset.pageSlug || "chinese-to-pinyin";
  const status = document.querySelector("#pinyinStatus");
  const input = document.querySelector("#pinyinInput");
  const output = document.querySelector("#pinyinOutput");
  const inputCount = document.querySelector("#pinyinInputCount");
  const outputCount = document.querySelector("#pinyinOutputCount");
  const annotation = document.querySelector("#pinyinAnnotation");
  const annotationEmpty = document.querySelector("#pinyinAnnotationEmpty");
  const lookupCharacter = document.querySelector("#pinyinLookupCharacter");
  const lookupReadings = document.querySelector("#pinyinLookupReadings");
  const lookupEmpty = document.querySelector("#pinyinLookupEmpty");
  const preserveNonChinese = document.querySelector("#preserveNonChinese");
  const surnameMode = document.querySelector("#surnameMode");
  const formatButtons = [...document.querySelectorAll("[data-pinyin-format]")];
  const caseButtons = [...document.querySelectorAll("[data-pinyin-case]")];
  let activeFormat = "symbol";
  let activeCase = "lower";
  let timer;

  setupLocaleSelector();
  setupControls();
  updateCounts();
  setStatus("idle");

  if (!window.pinyinPro?.pinyin || !window.pinyinPro?.polyphonic) {
    setStatus("error", "error");
    disableTool();
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
    input.addEventListener("input", () => {
      updateCounts();
      scheduleConversion();
    });
    preserveNonChinese.addEventListener("change", convert);
    surnameMode.addEventListener("change", convert);

    formatButtons.forEach((button) => button.addEventListener("click", () => {
      activeFormat = button.dataset.pinyinFormat;
      updateButtonGroup(formatButtons, button, "aria-checked");
      convert();
    }));
    caseButtons.forEach((button) => button.addEventListener("click", () => {
      activeCase = button.dataset.pinyinCase;
      updateButtonGroup(caseButtons, button, "aria-checked");
      convert();
    }));

    document.querySelector("#pinyinSample").addEventListener("click", (event) => {
      input.value = event.currentTarget.dataset.sample || "";
      updateCounts();
      convert();
      input.focus();
    });
    document.querySelector("#pinyinClear").addEventListener("click", () => {
      window.clearTimeout(timer);
      input.value = "";
      output.value = "";
      clearAnnotation();
      clearLookup();
      updateCounts();
      setStatus("idle");
      input.focus();
    });
    document.querySelector("#pinyinConvert").addEventListener("click", convert);
    document.querySelector("#pinyinCopy").addEventListener("click", copyOutput);
  }

  function updateButtonGroup(buttons, activeButton, stateAttribute) {
    buttons.forEach((button) => {
      const active = button === activeButton;
      button.classList.toggle("is-active", active);
      button.setAttribute(stateAttribute, String(active));
    });
  }

  function scheduleConversion() {
    window.clearTimeout(timer);
    timer = window.setTimeout(convert, 180);
  }

  function convert() {
    window.clearTimeout(timer);
    const value = input.value;
    if (!value) {
      output.value = "";
      clearAnnotation();
      clearLookup();
      updateCounts();
      setStatus("idle");
      return;
    }
    if (value.length > MAX_INPUT_CHARACTERS) {
      output.value = "";
      clearAnnotation();
      clearLookup();
      updateCounts();
      setStatus("tooLong", "error", { limit: MAX_INPUT_CHARACTERS.toLocaleString(locale) });
      return;
    }

    setStatus("converting");
    try {
      const options = buildOptions(activeFormat);
      output.value = applyLetterCase(normalizeSeparators(window.pinyinPro.pinyin(value, options)), activeCase);
      renderAnnotation(value, options);
      renderLookup(value);
      updateCounts();
      setStatus("ready", "ready");
    } catch (error) {
      console.error(error);
      output.value = "";
      clearAnnotation();
      clearLookup();
      updateCounts();
      setStatus("error", "error");
    }
  }

  function buildOptions(format) {
    return {
      type: "string",
      pattern: format === "initials" ? "first" : "pinyin",
      toneType: format === "number" ? "num" : format === "none" || format === "initials" ? "none" : "symbol",
      nonZh: preserveNonChinese.checked ? "consecutive" : "removed",
      surname: surnameMode.checked ? "head" : "off",
      traditional: true,
      separator: " "
    };
  }

  function applyLetterCase(value, mode) {
    if (mode === "upper") return value.toLocaleUpperCase("en");
    if (mode !== "title") return value;
    return value.replace(/[\p{Script=Latin}\p{M}]+[0-5]?/gu, (word) => {
      const letters = [...word];
      return `${letters.shift()?.toLocaleUpperCase("en") || ""}${letters.join("")}`;
    });
  }

  function normalizeSeparators(value) {
    return value
      .replace(/[ \t]+([,.;:!?，。！？；：、）】》”’])/gu, "$1")
      .replace(/([（【《“‘])[ \t]+/gu, "$1")
      .replace(/[ \t]*\n[ \t]*/gu, "\n");
  }

  function renderAnnotation(value, options) {
    annotation.replaceChildren();
    const preview = [...value].slice(0, ANNOTATION_PREVIEW_CHARACTERS).join("");
    const items = window.pinyinPro.pinyin(preview, {
      ...options,
      type: "all",
      pattern: "pinyin",
      toneType: activeFormat === "number" ? "num" : activeFormat === "none" ? "none" : "symbol",
      nonZh: "consecutive"
    });

    for (const item of items) {
      if (!item.isZh) {
        annotation.append(document.createTextNode(item.origin));
        continue;
      }
      const wrapper = document.createElement("span");
      const ruby = document.createElement("ruby");
      const character = document.createElement("span");
      const reading = document.createElement("rt");
      wrapper.className = "pinyin-ruby-item";
      character.textContent = item.origin;
      reading.textContent = applyLetterCase(item.pinyin, activeCase);
      ruby.append(character, reading);
      wrapper.append(ruby);
      annotation.append(wrapper);
    }
    annotation.hidden = false;
    annotationEmpty.hidden = true;
  }

  function clearAnnotation() {
    annotation.replaceChildren();
    annotation.hidden = true;
    annotationEmpty.hidden = false;
  }

  function renderLookup(value) {
    const characters = [...value.trim()];
    if (characters.length !== 1 || !/^\p{Script=Han}$/u.test(characters[0])) {
      clearLookup();
      return;
    }
    const character = characters[0];
    const readings = window.pinyinPro
      .polyphonic(character, { type: "array", toneType: "symbol" })
      .flat(Infinity)
      .flatMap((item) => String(item).split(/\s+/u))
      .filter(Boolean);
    lookupCharacter.textContent = character;
    lookupReadings.replaceChildren();
    for (const reading of [...new Set(readings)]) {
      const item = document.createElement("span");
      item.textContent = reading;
      lookupReadings.append(item);
    }
    lookupCharacter.hidden = false;
    lookupReadings.hidden = false;
    lookupEmpty.hidden = true;
  }

  function clearLookup() {
    lookupCharacter.textContent = "";
    lookupReadings.replaceChildren();
    lookupCharacter.hidden = true;
    lookupReadings.hidden = true;
    lookupEmpty.hidden = false;
  }

  async function copyOutput() {
    if (!output.value) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(output.value);
      } else {
        output.select();
        if (!document.execCommand("copy")) throw new Error("copy command failed");
      }
      setStatus("copied", "ready");
    } catch (error) {
      console.error(error);
      setStatus("copyFailed", "error");
    }
  }

  function updateCounts() {
    inputCount.textContent = input.value.length.toLocaleString(locale);
    outputCount.textContent = output.value.length.toLocaleString(locale);
  }

  function setStatus(key, type = "idle", values = {}) {
    const template = body.dataset[`message${key[0].toUpperCase()}${key.slice(1)}`] || key;
    status.classList.toggle("is-ready", type === "ready");
    status.classList.toggle("is-error", type === "error");
    status.lastElementChild.textContent = Object.entries(values).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, value),
      template
    );
  }

  function disableTool() {
    document.querySelectorAll(".pinyin-tool button, .pinyin-tool input, .pinyin-tool textarea").forEach((element) => {
      element.disabled = true;
    });
  }
})();
