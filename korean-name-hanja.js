(function () {
  "use strict";

  if (typeof document === "undefined" || document.body.dataset.toolPage !== "korean-name-hanja") return;
  const core = globalThis.KoreanHanjaData;
  const body = document.body;
  const elements = {
    locale: document.querySelector("#localeSelect"),
    form: document.querySelector("#koreanNameForm"),
    query: document.querySelector("#koreanNameQuery"),
    clear: document.querySelector("#koreanNameClear"),
    status: document.querySelector("#koreanNameStatus"),
    progress: document.querySelector("#koreanNameProgress"),
    progressBar: document.querySelector("#koreanNameProgressBar"),
    progressText: document.querySelector("#koreanNameProgressText"),
    summary: document.querySelector("#koreanNameSummary"),
    results: document.querySelector("#koreanNameResults"),
    empty: document.querySelector("#koreanNameEmpty"),
    quickSearches: [...document.querySelectorAll("[data-korean-name-query]")]
  };
  let payload;

  function message(key, values = {}) {
    const source = body.dataset[`message${key[0].toUpperCase()}${key.slice(1)}`] || key;
    return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), source);
  }

  function setStatus(key, type = "idle", values = {}) {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = message(key, values);
  }

  async function ensureData() {
    if (payload) return payload;
    elements.progress.hidden = false;
    setStatus("loading");
    payload = await core.loadNames({
      onProgress(progress) {
        elements.progressBar.style.width = `${progress.percent}%`;
        elements.progressText.textContent = progress.total
          ? message("loadingProgress", { percent: progress.percent })
          : message("loading");
      }
    });
    elements.progress.hidden = true;
    return payload;
  }

  function render(records) {
    elements.results.replaceChildren();
    elements.empty.hidden = records.length > 0;
    elements.summary.textContent = message("results", { count: records.length.toLocaleString(body.dataset.locale) });
    const fragment = document.createDocumentFragment();
    for (const record of records) {
      const article = document.createElement("article");
      article.className = "korean-name-result";
      const character = document.createElement("strong");
      character.textContent = record.character;
      const content = document.createElement("div");
      const reading = document.createElement("b");
      reading.textContent = record.readings.join(" · ");
      const description = document.createElement("p");
      description.textContent = record.descriptions.join("; ") || message("descriptionUnavailable");
      const actions = document.createElement("nav");
      const dictionary = document.createElement("a");
      dictionary.href = `${body.dataset.localePrefix}korean-hanja-dictionary/?character=${encodeURIComponent(record.character)}`;
      dictionary.textContent = body.dataset.dictionaryLabel;
      const copy = document.createElement("button");
      copy.type = "button";
      copy.textContent = body.dataset.copyLabel;
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(record.character);
          setStatus("copied", "ready", { character: record.character });
        } catch {
          setStatus("copyFailed", "error");
        }
      });
      actions.append(dictionary, copy);
      content.append(reading, description, actions);
      article.append(character, content);
      fragment.append(article);
    }
    elements.results.append(fragment);
  }

  async function search() {
    const query = core.normalizeKorean(elements.query.value);
    if (!query) {
      setStatus("invalid", "error");
      elements.query.focus();
      return;
    }
    try {
      const data = await ensureData();
      const records = data.records
        .filter((record) => record.browserCompatible && (
          record.character === query ||
          record.readings.some((reading) => reading.includes(query)) ||
          record.descriptions.some((description) => core.normalizeKorean(description).includes(query))
        ))
        .sort((left, right) => {
          const leftExact = left.character === query || left.readings.includes(query) ? 0 : 1;
          const rightExact = right.character === query || right.readings.includes(query) ? 0 : 1;
          return leftExact - rightExact || (left.strokes || 99) - (right.strokes || 99) || left.code.localeCompare(right.code);
        })
        .slice(0, 120);
      render(records);
      setStatus(records.length ? "ready" : "noResults", records.length ? "ready" : "idle", { count: records.length });
      history.replaceState(null, "", `${location.pathname}?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error(error);
      elements.progress.hidden = true;
      setStatus("error", "error");
    }
  }

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    search();
  });
  elements.quickSearches.forEach((button) => button.addEventListener("click", () => {
    elements.query.value = button.dataset.koreanNameQuery || "";
    search();
  }));
  elements.clear.addEventListener("click", () => {
    elements.form.reset();
    elements.results.replaceChildren();
    elements.empty.hidden = false;
    elements.summary.textContent = "";
    history.replaceState(null, "", location.pathname);
    setStatus("idle");
    elements.query.focus();
  });
  elements.locale.addEventListener("change", () => {
    localStorage.setItem("jianfan-locale", elements.locale.value);
    localStorage.setItem("jianfan-locale-manual", "1");
    location.href = `${body.dataset.localePaths.split("|").find((item) => item.startsWith(`${elements.locale.value}:`))?.split(":")[1] || "/"}korean-name-hanja/${location.search}`;
  });

  const params = new URLSearchParams(location.search);
  elements.query.value = params.get("q") || params.get("character") || "";
  if (elements.query.value) search();
})();
