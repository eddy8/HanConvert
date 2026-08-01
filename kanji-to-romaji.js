(function () {
  "use strict";

  const localePaths = {
    "zh-CN": "/",
    "zh-TW": "/zh-tw/",
    en: "/en/",
    ja: "/ja/",
    ko: "/ko/"
  };
  const core = window.KanjiRomajiCore;
  const readingApi = window.JapaneseReadingClient;
  const body = document.body;
  const dictionaryPaths = [
    body.dataset.dictionaryPath,
    body.dataset.dictionaryFallbackPath
  ].filter(Boolean);
  const locale = body.dataset.locale || "zh-CN";
  const pageSlug = body.dataset.pageSlug || "kanji-to-romaji";
  const input = document.querySelector("#romajiInput");
  const plainOutput = document.querySelector("#romajiOutput");
  const furiganaOutput = document.querySelector("#furiganaOutput");
  const furiganaEmpty = document.querySelector("#furiganaOutputEmpty");
  const inputCount = document.querySelector("#romajiInputCount");
  const outputCount = document.querySelector("#romajiOutputCount");
  const outputTitle = document.querySelector("#romajiOutputTitle");
  const status = document.querySelector("#romajiStatus");
  const convertButton = document.querySelector("#romajiConvert");
  const copyButton = document.querySelector("#romajiCopy");
  const retryButton = document.querySelector("#romajiRetry");
  const formatButtons = [...document.querySelectorAll("[data-romaji-format]")];
  const systemButtons = [...document.querySelectorAll("[data-romaji-system]")];
  const systemFieldset = document.querySelector("#romajiSystemFieldset");
  let activeFormat = "romaji";
  let activeSystem = "hepburn";
  let readingClient;
  let conversionToken = 0;
  let copyValue = "";

  setupLocaleSelector();
  setupControls();
  updateCounts();
  setStatus("idle");

  if (!core || !readingApi) {
    setStatus("componentError", "error");
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
      conversionToken += 1;
      clearOutput();
      updateCounts();
      setStatus("idle");
    });

    formatButtons.forEach((button) => button.addEventListener("click", () => {
      activeFormat = button.dataset.romajiFormat;
      updateButtonGroup(formatButtons, button);
      systemFieldset.disabled = activeFormat !== "romaji";
      systemFieldset.classList.toggle("is-disabled", activeFormat !== "romaji");
      updateOutputPresentation(button);
      if (input.value && readingClient) convert();
    }));

    systemButtons.forEach((button) => button.addEventListener("click", () => {
      activeSystem = button.dataset.romajiSystem;
      updateButtonGroup(systemButtons, button);
      if (input.value && readingClient && activeFormat === "romaji") convert();
    }));

    document.querySelector("#romajiSample").addEventListener("click", (event) => {
      input.value = event.currentTarget.dataset.sample || "";
      updateCounts();
      convert();
      input.focus();
    });

    document.querySelector("#romajiClear").addEventListener("click", () => {
      conversionToken += 1;
      input.value = "";
      clearOutput();
      updateCounts();
      setStatus("idle");
      input.focus();
    });

    convertButton.addEventListener("click", convert);
    retryButton.addEventListener("click", convert);
    copyButton.addEventListener("click", copyResult);
  }

  function updateButtonGroup(buttons, activeButton) {
    buttons.forEach((button) => {
      const active = button === activeButton;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
  }

  function updateOutputPresentation(button) {
    outputTitle.textContent = button.dataset.outputTitle || button.textContent.trim();
    plainOutput.placeholder = button.dataset.outputPlaceholder || "";
    const showFurigana = activeFormat === "furigana";
    plainOutput.hidden = showFurigana;
    furiganaOutput.hidden = !showFurigana;
    clearOutput();
    updateCounts();
  }

  function getReadingClient() {
    if (!readingClient) readingClient = readingApi.createClient();
    return readingClient;
  }

  async function convert() {
    if (!core) return;
    const value = input.value;
    const characterCount = core.countCharacters(value);
    const currentToken = ++conversionToken;
    retryButton.hidden = true;

    if (!value) {
      clearOutput();
      updateCounts();
      setStatus("idle");
      return;
    }
    if (!core.containsJapaneseScript(value)) {
      clearOutput();
      updateCounts();
      setStatus("notJapanese", "error");
      return;
    }
    if (characterCount > core.MAX_INPUT_CHARACTERS) {
      clearOutput();
      updateCounts();
      setStatus("tooLong", "error", { limit: core.MAX_INPUT_CHARACTERS.toLocaleString(locale) });
      return;
    }

    setBusy(true);
    try {
      const result = await getReadingClient().convert({
        value,
        format: activeFormat,
        system: activeSystem,
        dictionaryPaths
      }, (progress) => {
        if (currentToken !== conversionToken) return;
        if (progress.stage !== "converting") {
          setStatus("loading");
          return;
        }
        setStatus("converting", "idle", {
          current: Math.min(progress.total, progress.completed + 1).toLocaleString(locale),
          total: progress.total.toLocaleString(locale)
        });
      });
      if (currentToken !== conversionToken) return;
      if (activeFormat === "furigana") {
        copyValue = renderSafeFurigana(result);
      } else {
        plainOutput.value = result;
        copyValue = result;
      }
      updateCounts();
      setStatus("ready", "ready");
    } catch (error) {
      if (currentToken !== conversionToken) return;
      console.error(error);
      clearOutput();
      updateCounts();
      retryButton.hidden = false;
      const componentCodes = new Set(["COMPONENT_UNAVAILABLE", "WORKER_UNAVAILABLE", "WORKER_FAILED"]);
      setStatus(componentCodes.has(error.code) ? "componentError" : "dictionaryError", "error");
    } finally {
      setBusy(false);
    }
  }

  function renderSafeFurigana(source) {
    const parsed = new DOMParser().parseFromString(source, "text/html");
    const fragment = document.createDocumentFragment();
    const plainParts = [];

    for (const child of [...parsed.body.childNodes]) {
      appendSafeNode(child, fragment, plainParts);
    }

    furiganaOutput.replaceChildren(fragment);
    furiganaEmpty.hidden = furiganaOutput.textContent.trim().length > 0;
    return plainParts.join("");
  }

  function appendSafeNode(sourceNode, target, plainParts) {
    if (sourceNode.nodeType === Node.TEXT_NODE) {
      const text = sourceNode.textContent || "";
      target.append(document.createTextNode(text));
      plainParts.push(text);
      return;
    }

    const tagName = sourceNode.nodeName.toLowerCase();
    if (tagName !== "ruby") {
      for (const child of [...sourceNode.childNodes]) appendSafeNode(child, target, plainParts);
      return;
    }

    const ruby = document.createElement("ruby");
    const reading = sourceNode.querySelector("rt")?.textContent || "";
    let base = "";
    for (const child of [...sourceNode.childNodes]) {
      const childTag = child.nodeName.toLowerCase();
      if (["rt", "rp"].includes(childTag)) continue;
      base += child.textContent || "";
    }
    ruby.append(document.createTextNode(base));
    if (reading) {
      const rpOpen = document.createElement("rp");
      const rt = document.createElement("rt");
      const rpClose = document.createElement("rp");
      rpOpen.textContent = "(";
      rt.textContent = reading;
      rpClose.textContent = ")";
      ruby.append(rpOpen, rt, rpClose);
      plainParts.push(`${base}(${reading})`);
    } else {
      plainParts.push(base);
    }
    target.append(ruby);
  }

  function clearOutput() {
    plainOutput.value = "";
    furiganaOutput.replaceChildren(furiganaEmpty);
    furiganaEmpty.hidden = false;
    copyValue = "";
  }

  async function copyResult() {
    if (!copyValue) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyValue);
      } else {
        const helper = document.createElement("textarea");
        helper.value = copyValue;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.append(helper);
        helper.select();
        if (!document.execCommand("copy")) throw new Error("copy command failed");
        helper.remove();
      }
      setStatus("copied", "ready");
    } catch (error) {
      console.error(error);
      setStatus("copyFailed", "error");
    }
  }

  function setBusy(busy) {
    convertButton.disabled = busy;
    formatButtons.forEach((button) => { button.disabled = busy; });
    systemButtons.forEach((button) => { button.disabled = busy; });
    input.setAttribute("aria-busy", String(busy));
  }

  function updateCounts() {
    inputCount.textContent = (core ? core.countCharacters(input.value) : input.value.length).toLocaleString(locale);
    outputCount.textContent = (core ? core.countCharacters(copyValue) : copyValue.length).toLocaleString(locale);
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
    document.querySelectorAll(".romaji-tool button, .romaji-tool textarea").forEach((element) => {
      element.disabled = true;
    });
  }
})();
