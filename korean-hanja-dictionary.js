(function () {
  "use strict";

  if (typeof document === "undefined" || document.body.dataset.toolPage !== "korean-hanja-dictionary") return;
  const core = globalThis.KoreanHanjaData;
  const body = document.body;
  const elements = {
    locale: document.querySelector("#localeSelect"),
    form: document.querySelector("#koreanHanjaForm"),
    query: document.querySelector("#koreanHanjaQuery"),
    radical: document.querySelector("#koreanHanjaRadical"),
    strokes: document.querySelector("#koreanHanjaStrokes"),
    nameOnly: document.querySelector("#koreanHanjaNameOnly"),
    clear: document.querySelector("#koreanHanjaClear"),
    status: document.querySelector("#koreanHanjaStatus"),
    progress: document.querySelector("#koreanHanjaProgress"),
    progressBar: document.querySelector("#koreanHanjaProgressBar"),
    progressText: document.querySelector("#koreanHanjaProgressText"),
    results: document.querySelector("#koreanHanjaResults"),
    empty: document.querySelector("#koreanHanjaEmpty"),
    summary: document.querySelector("#koreanHanjaSummary"),
    detail: document.querySelector("#koreanHanjaDetail"),
    detailEmpty: document.querySelector("#koreanHanjaDetailEmpty"),
    character: document.querySelector("#koreanHanjaCharacter"),
    readings: document.querySelector("#koreanHanjaReadings"),
    meanings: document.querySelector("#koreanHanjaMeanings"),
    radicalDetail: document.querySelector("#koreanHanjaRadicalDetail"),
    strokesDetail: document.querySelector("#koreanHanjaStrokesDetail"),
    nameStatus: document.querySelector("#koreanHanjaNameStatus"),
    structureLink: document.querySelector("#koreanHanjaStructureLink"),
    nameLink: document.querySelector("#koreanHanjaNameLink")
  };
  let payload;
  let selectedCharacter = "";

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
    payload = await core.loadCharacters({
      onProgress(progress) {
        elements.progressBar.style.width = `${progress.percent}%`;
        elements.progressText.textContent = progress.total
          ? message("loadingProgress", { percent: progress.percent })
          : message("loading");
      }
    });
    populateRadicals(payload.records);
    elements.progressBar.style.width = "100%";
    elements.progressText.textContent = message("loaded", { count: payload.meta.recordCount.toLocaleString(body.dataset.locale) });
    window.setTimeout(() => { elements.progress.hidden = true; }, 450);
    return payload;
  }

  function populateRadicals(records) {
    if (elements.radical.options.length > 1) return;
    const radicals = [...new Set(records.map((record) => record.radical).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, "ko"));
    const fragment = document.createDocumentFragment();
    for (const radical of radicals) {
      const option = document.createElement("option");
      option.value = radical;
      option.textContent = radical;
      fragment.append(option);
    }
    elements.radical.append(fragment);
  }

  function renderResults(records) {
    elements.results.replaceChildren();
    elements.empty.hidden = records.length > 0;
    elements.summary.textContent = message("results", { count: records.length.toLocaleString(body.dataset.locale) });
    const fragment = document.createDocumentFragment();
    for (const record of records) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "kanji-dictionary-result korean-hanja-result";
      button.dataset.character = record.character;
      button.setAttribute("aria-pressed", String(record.character === selectedCharacter));
      const character = document.createElement("strong");
      character.textContent = record.character;
      const text = document.createElement("span");
      const reading = document.createElement("b");
      reading.textContent = record.readings.slice(0, 5).join(" · ") || body.dataset.emptyValue;
      const meta = document.createElement("small");
      meta.textContent = message("resultMeta", {
        radical: record.radical || body.dataset.emptyValue,
        strokes: record.strokes || body.dataset.emptyValue
      });
      text.append(reading, meta);
      button.append(character, text);
      button.addEventListener("click", () => showDetail(record));
      fragment.append(button);
    }
    elements.results.append(fragment);
  }

  function showDetail(record) {
    selectedCharacter = record.character;
    elements.detailEmpty.hidden = true;
    elements.detail.hidden = false;
    elements.character.textContent = record.character;
    elements.readings.textContent = record.readings.join(" · ") || body.dataset.emptyValue;
    elements.meanings.textContent = record.glosses.join("; ") || record.definition || body.dataset.emptyValue;
    elements.radicalDetail.textContent = record.radical || body.dataset.emptyValue;
    elements.strokesDetail.textContent = record.strokes?.toLocaleString(body.dataset.locale) || body.dataset.emptyValue;
    elements.nameStatus.textContent = record.nameUse ? message("nameAllowed") : message("nameNotConfirmed");
    const query = `?character=${encodeURIComponent(record.character)}`;
    const prefix = body.dataset.localePrefix || "/";
    elements.structureLink.href = `${prefix}chinese-character-lookup/${query}`;
    elements.nameLink.href = `${prefix}korean-name-hanja/${query}`;
    elements.results.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.character === record.character));
    });
  }

  async function search() {
    const filters = {
      query: elements.query.value,
      radical: elements.radical.value,
      strokes: elements.strokes.value,
      nameOnly: elements.nameOnly.checked,
      limit: 100
    };
    if (!filters.query.trim() && !filters.radical && !filters.strokes && !filters.nameOnly) {
      setStatus("invalid", "error");
      elements.query.focus();
      return;
    }
    try {
      const data = await ensureData();
      const records = core.searchRecords(data.records, filters);
      selectedCharacter = records[0]?.character || "";
      renderResults(records);
      if (records.length) showDetail(records[0]);
      else {
        elements.detail.hidden = true;
        elements.detailEmpty.hidden = false;
      }
      setStatus(records.length ? "ready" : "noResults", records.length ? "ready" : "idle", { count: records.length });
      const params = new URLSearchParams();
      if (filters.query.trim()) params.set("q", filters.query.trim());
      if (filters.radical) params.set("radical", filters.radical);
      if (filters.strokes) params.set("strokes", filters.strokes);
      if (filters.nameOnly) params.set("name", "1");
      history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
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
  elements.clear.addEventListener("click", () => {
    elements.form.reset();
    elements.results.replaceChildren();
    elements.empty.hidden = false;
    elements.detail.hidden = true;
    elements.detailEmpty.hidden = false;
    elements.summary.textContent = "";
    history.replaceState(null, "", location.pathname);
    setStatus("idle");
    elements.query.focus();
  });
  elements.locale.addEventListener("change", () => {
    localStorage.setItem("jianfan-locale", elements.locale.value);
    localStorage.setItem("jianfan-locale-manual", "1");
    location.href = `${body.dataset.localePaths.split("|").find((item) => item.startsWith(`${elements.locale.value}:`))?.split(":")[1] || "/"}korean-hanja-dictionary/${location.search}`;
  });

  const params = new URLSearchParams(location.search);
  elements.query.value = params.get("q") || params.get("character") || "";
  elements.strokes.value = params.get("strokes") || "";
  elements.nameOnly.checked = params.get("name") === "1";
  if (elements.query.value || elements.strokes.value || elements.nameOnly.checked) search();
})();
