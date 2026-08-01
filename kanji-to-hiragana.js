(function (root, factory) {
  "use strict";

  const core = factory();
  if (typeof module === "object" && module.exports) module.exports = core;
  if (root) root.KanjiHiraganaCore = core;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const FORMATS = new Set(["hiragana", "furigana", "okurigana", "ruby"]);

  function normalizeFormat(value) {
    return FORMATS.has(value) ? value : "hiragana";
  }

  function workerFormat(value) {
    const format = normalizeFormat(value);
    return format === "ruby" ? "furigana" : format;
  }

  return Object.freeze({ FORMATS, normalizeFormat, workerFormat });
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;
  const body = document.body;
  if (body.dataset.toolPage !== "kanji-to-hiragana") return;

  const core = globalThis.KanjiHiraganaCore;
  const readingCore = globalThis.KanjiRomajiCore;
  const readingApi = globalThis.JapaneseReadingClient;
  const locale = body.dataset.locale || "zh-CN";
  const pageSlug = body.dataset.pageSlug || "kanji-to-hiragana";
  const localePaths = { "zh-CN": "/", "zh-TW": "/zh-tw/", en: "/en/", ja: "/ja/", ko: "/ko/" };
  const dictionaryPaths = [body.dataset.dictionaryPath, body.dataset.dictionaryFallbackPath].filter(Boolean);
  const elements = {
    input: document.querySelector("#hiraganaInput"),
    inputCount: document.querySelector("#hiraganaInputCount"),
    outputCount: document.querySelector("#hiraganaOutputCount"),
    plainOutput: document.querySelector("#hiraganaPlainOutput"),
    visualOutput: document.querySelector("#hiraganaVisualOutput"),
    visualEmpty: document.querySelector("#hiraganaVisualEmpty"),
    outputTitle: document.querySelector("#hiraganaOutputTitle"),
    status: document.querySelector("#hiraganaStatus"),
    progress: document.querySelector("#hiraganaProgress"),
    convert: document.querySelector("#hiraganaConvert"),
    retry: document.querySelector("#hiraganaRetry"),
    copyText: document.querySelector("#hiraganaCopyText"),
    copyHtml: document.querySelector("#hiraganaCopyHtml"),
    formats: [...document.querySelectorAll("[data-hiragana-format]")]
  };
  let activeFormat = "hiragana";
  let client;
  let token = 0;
  let textCopyValue = "";
  let htmlCopyValue = "";

  setupLocaleSelector();
  setupControls();
  updateCounts();
  setStatus("idle");
  if (!core || !readingCore || !readingApi) disableTool();

  function setupLocaleSelector() {
    const selector = document.querySelector("#localeSelect");
    if (!selector) return;
    selector.addEventListener("change", () => {
      const nextLocale = selector.value;
      localStorage.setItem("jianfan-locale", nextLocale);
      localStorage.setItem("jianfan-locale-manual", "1");
      window.location.href = `${localePaths[nextLocale] || "/"}${pageSlug}/${window.location.search}`.replace("//", "/");
    });
  }

  function setupControls() {
    elements.input.addEventListener("input", () => {
      token += 1;
      clearOutput();
      updateCounts();
      setStatus("idle");
    });
    elements.formats.forEach((button) => button.addEventListener("click", () => {
      activeFormat = core.normalizeFormat(button.dataset.hiraganaFormat);
      elements.formats.forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle("is-active", active);
        candidate.setAttribute("aria-checked", String(active));
      });
      updateOutputPresentation(button);
      if (elements.input.value && client) convert();
    }));
    document.querySelector("#hiraganaSample").addEventListener("click", (event) => {
      elements.input.value = event.currentTarget.dataset.sample || "";
      updateCounts();
      convert();
      elements.input.focus();
    });
    document.querySelector("#hiraganaClear").addEventListener("click", () => {
      token += 1;
      elements.input.value = "";
      clearOutput();
      updateCounts();
      setStatus("idle");
      elements.input.focus();
    });
    elements.convert.addEventListener("click", convert);
    elements.retry.addEventListener("click", convert);
    elements.copyText.addEventListener("click", () => copy(textCopyValue, "copiedText"));
    elements.copyHtml.addEventListener("click", () => copy(htmlCopyValue, "copiedHtml"));
  }

  function getClient() {
    if (!client) client = readingApi.createClient();
    return client;
  }

  async function convert() {
    if (!core || !readingCore || !readingApi) return;
    const value = elements.input.value;
    const count = readingCore.countCharacters(value);
    const currentToken = ++token;
    elements.retry.hidden = true;

    if (!value) {
      clearOutput();
      setStatus("idle");
      return;
    }
    if (!readingCore.containsJapaneseScript(value)) {
      clearOutput();
      setStatus("notJapanese", "error");
      return;
    }
    if (count > readingCore.MAX_INPUT_CHARACTERS) {
      clearOutput();
      setStatus("tooLong", "error", { limit: readingCore.MAX_INPUT_CHARACTERS.toLocaleString(locale) });
      return;
    }

    setBusy(true);
    try {
      const result = await getClient().convert({
        value,
        format: core.workerFormat(activeFormat),
        dictionaryPaths
      }, (progress) => {
        if (currentToken !== token) return;
        renderProgress(progress);
      });
      if (currentToken !== token) return;
      renderResult(result);
      setStatus("ready", "ready");
    } catch (error) {
      if (currentToken !== token) return;
      console.error(error);
      clearOutput();
      elements.retry.hidden = false;
      const componentCodes = new Set(["COMPONENT_UNAVAILABLE", "WORKER_UNAVAILABLE", "WORKER_FAILED"]);
      setStatus(componentCodes.has(error.code) ? "componentError" : "dictionaryError", "error");
    } finally {
      setBusy(false);
      hideProgress();
    }
  }

  function renderProgress(progress) {
    const stage = progress.stage || "components";
    const values = {
      current: Math.min(progress.total || 1, (progress.completed || 0) + (stage === "converting" ? 1 : 0)).toLocaleString(locale),
      total: (progress.total || 1).toLocaleString(locale)
    };
    setStatus(stage, "idle", values);
    if (["dictionary", "components", "initializing", "converting"].includes(stage)) {
      elements.progress.hidden = false;
      elements.progress.max = Math.max(1, progress.total || 1);
      elements.progress.value = Math.min(elements.progress.max, progress.completed || 0);
    }
  }

  function renderResult(result) {
    clearOutput();
    if (["furigana", "ruby"].includes(activeFormat)) {
      const safe = createSafeRuby(result);
      textCopyValue = safe.text;
      htmlCopyValue = safe.html;
      if (activeFormat === "furigana") {
        elements.visualOutput.replaceChildren(safe.fragment);
        elements.visualOutput.hidden = false;
        elements.plainOutput.hidden = true;
      } else {
        elements.plainOutput.value = safe.html;
        elements.plainOutput.hidden = false;
        elements.visualOutput.hidden = true;
      }
    } else {
      textCopyValue = result;
      elements.plainOutput.value = result;
      elements.plainOutput.hidden = false;
      elements.visualOutput.hidden = true;
    }
    elements.copyText.disabled = !textCopyValue;
    elements.copyHtml.disabled = !htmlCopyValue;
    updateCounts();
  }

  function createSafeRuby(source) {
    const parsed = new DOMParser().parseFromString(String(source), "text/html");
    const fragment = document.createDocumentFragment();
    const container = document.createElement("div");
    const textParts = [];

    for (const node of [...parsed.body.childNodes]) appendSafeNode(node, fragment, container, textParts);
    return { fragment, html: container.innerHTML, text: textParts.join("") };
  }

  function appendSafeNode(source, fragment, container, textParts) {
    if (source.nodeType === Node.TEXT_NODE) {
      const value = source.textContent || "";
      fragment.append(document.createTextNode(value));
      container.append(document.createTextNode(value));
      textParts.push(value);
      return;
    }
    if (source.nodeName.toLowerCase() !== "ruby") {
      for (const child of [...source.childNodes]) appendSafeNode(child, fragment, container, textParts);
      return;
    }

    const base = [...source.childNodes]
      .filter((node) => !["rt", "rp"].includes(node.nodeName.toLowerCase()))
      .map((node) => node.textContent || "")
      .join("");
    const reading = source.querySelector("rt")?.textContent || "";
    const ruby = document.createElement("ruby");
    ruby.append(document.createTextNode(base));
    if (reading) {
      const rpOpen = document.createElement("rp");
      const rt = document.createElement("rt");
      const rpClose = document.createElement("rp");
      rpOpen.textContent = "(";
      rt.textContent = reading;
      rpClose.textContent = ")";
      ruby.append(rpOpen, rt, rpClose);
      textParts.push(`${base}(${reading})`);
    } else {
      textParts.push(base);
    }
    fragment.append(ruby.cloneNode(true));
    container.append(ruby);
  }

  function updateOutputPresentation(button) {
    elements.outputTitle.textContent = button.dataset.outputTitle || button.textContent.trim();
    elements.plainOutput.placeholder = button.dataset.outputPlaceholder || "";
    clearOutput();
    updateCounts();
  }

  function clearOutput() {
    elements.plainOutput.value = "";
    elements.plainOutput.hidden = false;
    elements.visualOutput.replaceChildren(elements.visualEmpty);
    elements.visualOutput.hidden = true;
    textCopyValue = "";
    htmlCopyValue = "";
    elements.copyText.disabled = true;
    elements.copyHtml.disabled = true;
  }

  async function copy(value, statusKey) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setStatus(statusKey, "ready");
    } catch (error) {
      console.error(error);
      setStatus("copyFailed", "error");
    }
  }

  function updateCounts() {
    elements.inputCount.textContent = readingCore
      ? readingCore.countCharacters(elements.input.value).toLocaleString(locale)
      : elements.input.value.length.toLocaleString(locale);
    elements.outputCount.textContent = readingCore
      ? readingCore.countCharacters(textCopyValue || elements.plainOutput.value).toLocaleString(locale)
      : (textCopyValue || elements.plainOutput.value).length.toLocaleString(locale);
  }

  function setBusy(busy) {
    elements.convert.disabled = busy;
    elements.formats.forEach((button) => { button.disabled = busy; });
    elements.input.setAttribute("aria-busy", String(busy));
  }

  function setStatus(key, type = "idle", values = {}) {
    const template = body.dataset[`message${key[0].toUpperCase()}${key.slice(1)}`] || key;
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = Object.entries(values).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, value),
      template
    );
  }

  function hideProgress() {
    elements.progress.hidden = true;
    elements.progress.value = 0;
  }

  function disableTool() {
    document.querySelectorAll(".hiragana-tool button, .hiragana-tool textarea").forEach((element) => {
      element.disabled = true;
    });
    setStatus("componentError", "error");
  }
})();
