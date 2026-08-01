(function () {
  "use strict";

  if (typeof document === "undefined") return;
  const body = document.body;
  if (body.dataset.toolPage !== "japanese-kanji-dictionary") return;

  const core = globalThis.JapaneseKanjiData;
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  const elements = {
    locale: document.querySelector("#localeSelect"),
    form: document.querySelector("#kanjiDictionaryForm"),
    query: document.querySelector("#kanjiDictionaryQuery"),
    radical: document.querySelector("#kanjiDictionaryRadical"),
    strokes: document.querySelector("#kanjiDictionaryStrokes"),
    grade: document.querySelector("#kanjiDictionaryGrade"),
    clear: document.querySelector("#kanjiDictionaryClear"),
    status: document.querySelector("#kanjiDictionaryStatus"),
    progress: document.querySelector("#kanjiDictionaryProgress"),
    progressBar: document.querySelector("#kanjiDictionaryProgressBar"),
    progressText: document.querySelector("#kanjiDictionaryProgressText"),
    results: document.querySelector("#kanjiDictionaryResults"),
    resultsEmpty: document.querySelector("#kanjiDictionaryEmpty"),
    resultsSummary: document.querySelector("#kanjiDictionaryResultSummary"),
    detail: document.querySelector("#kanjiDictionaryDetail"),
    detailEmpty: document.querySelector("#kanjiDictionaryDetailEmpty"),
    detailCharacter: document.querySelector("#kanjiDetailCharacter"),
    detailOn: document.querySelector("#kanjiDetailOn"),
    detailKun: document.querySelector("#kanjiDetailKun"),
    detailNanori: document.querySelector("#kanjiDetailNanori"),
    detailRadical: document.querySelector("#kanjiDetailRadical"),
    detailStrokes: document.querySelector("#kanjiDetailStrokes"),
    detailGrade: document.querySelector("#kanjiDetailGrade"),
    detailMeanings: document.querySelector("#kanjiDetailMeanings"),
    detailComponents: document.querySelector("#kanjiDetailComponents"),
    strokeLink: document.querySelector("#kanjiDetailStrokeLink"),
    worksheetLink: document.querySelector("#kanjiDetailWorksheetLink")
  };

  let payload;
  let selectedCharacter = "";

  function message(key, values = {}) {
    const name = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[name] || key).replace(/\{(\w+)\}/gu, (_, token) => values[token] ?? "");
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
    try {
      payload = await core.load({
        onProgress(progress) {
          const percent = progress.total ? progress.percent : 0;
          elements.progressBar.style.width = `${percent}%`;
          elements.progressText.textContent = progress.total
            ? message("loadingProgress", { percent })
            : message("loading");
        }
      });
      populateRadicals(payload.radicals);
      elements.progressBar.style.width = "100%";
      elements.progressText.textContent = message("loaded", { count: payload.meta.recordCount.toLocaleString(body.dataset.locale) });
      window.setTimeout(() => { elements.progress.hidden = true; }, 500);
      return payload;
    } catch (error) {
      console.error(error);
      elements.progress.hidden = true;
      setStatus("error", "error");
      throw error;
    }
  }

  function populateRadicals(radicals) {
    if (elements.radical.options.length > 1) return;
    const fragment = document.createDocumentFragment();
    radicals.forEach((radical) => {
      const option = document.createElement("option");
      option.value = String(radical.number);
      option.textContent = `${radical.character} · ${radical.number}`;
      fragment.append(option);
    });
    elements.radical.append(fragment);
  }

  function formatReadings(record) {
    return [...(record.onReadings || []), ...(record.kunReadings || [])].slice(0, 4).join(" · ") || body.dataset.emptyValue;
  }

  function gradeLabel(grade) {
    if (grade >= 1 && grade <= 6) return body.dataset.gradePrimary.replace("{grade}", String(grade));
    if (grade === 8) return body.dataset.gradeSecondary;
    if (grade === 9 || grade === 10) return body.dataset.gradeName;
    return body.dataset.gradeOther;
  }

  function renderResults(records) {
    elements.results.replaceChildren();
    elements.resultsEmpty.hidden = records.length > 0;
    elements.resultsSummary.textContent = message("results", { count: records.length.toLocaleString(body.dataset.locale) });
    const fragment = document.createDocumentFragment();
    records.forEach((record) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "kanji-dictionary-result";
      button.dataset.character = record.character;
      button.setAttribute("aria-pressed", String(record.character === selectedCharacter));
      const character = document.createElement("strong");
      character.textContent = record.character;
      const text = document.createElement("span");
      const reading = document.createElement("b");
      reading.textContent = formatReadings(record);
      const meta = document.createElement("small");
      meta.textContent = message("resultMeta", {
        radical: record.radicalCharacter || body.dataset.emptyValue,
        strokes: record.strokeCounts?.[0] || body.dataset.emptyValue
      });
      text.append(reading, meta);
      button.append(character, text);
      button.addEventListener("click", () => showDetail(record));
      fragment.append(button);
    });
    elements.results.append(fragment);
  }

  function setText(element, values) {
    element.textContent = values?.length ? values.join(" · ") : body.dataset.emptyValue;
  }

  function showDetail(record) {
    selectedCharacter = record.character;
    elements.detailEmpty.hidden = true;
    elements.detail.hidden = false;
    elements.detailCharacter.textContent = record.character;
    setText(elements.detailOn, record.onReadings);
    setText(elements.detailKun, record.kunReadings);
    setText(elements.detailNanori, record.nanori);
    elements.detailRadical.textContent = `${record.radicalCharacter || body.dataset.emptyValue} (${record.radical || body.dataset.emptyValue})`;
    elements.detailStrokes.textContent = record.strokeCounts?.join(" / ") || body.dataset.emptyValue;
    elements.detailGrade.textContent = gradeLabel(record.grade);
    setText(elements.detailMeanings, record.meanings);
    elements.detailComponents.replaceChildren();
    (record.components || []).forEach((component) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = component;
      button.title = body.dataset.componentTitle.replace("{component}", component);
      button.addEventListener("click", () => {
        elements.query.value = component;
        elements.form.requestSubmit();
      });
      elements.detailComponents.append(button);
    });
    if (!record.components?.length) elements.detailComponents.textContent = body.dataset.emptyValue;
    const query = `?character=${encodeURIComponent(record.character)}`;
    elements.strokeLink.href = `/${localePrefixes[body.dataset.locale]}japanese-stroke-order/${query}`;
    elements.worksheetLink.href = `/${localePrefixes[body.dataset.locale]}han-character-worksheet/${query}`;
    elements.results.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.character === record.character));
    });
  }

  async function search() {
    const query = elements.query.value.trim();
    const filters = {
      query,
      radical: elements.radical.value,
      strokes: elements.strokes.value,
      grade: elements.grade.value,
      limit: 80
    };
    if (!query && !filters.radical && !filters.strokes && !filters.grade) {
      setStatus("invalid", "error");
      elements.query.focus();
      return;
    }
    try {
      const data = await ensureData();
      const records = core.searchRecords(data.records, filters);
      setStatus(records.length ? "ready" : "noResults", records.length ? "ready" : "idle", { count: records.length });
      selectedCharacter = records[0]?.character || "";
      renderResults(records);
      if (records.length) showDetail(records[0]);
      else {
        elements.detail.hidden = true;
        elements.detailEmpty.hidden = false;
      }
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filters.radical) params.set("radical", filters.radical);
      if (filters.strokes) params.set("strokes", filters.strokes);
      if (filters.grade) params.set("grade", filters.grade);
      history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    } catch {
      // ensureData reports the actionable error.
    }
  }

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    search();
  });
  elements.clear.addEventListener("click", () => {
    elements.form.reset();
    selectedCharacter = "";
    elements.results.replaceChildren();
    elements.resultsSummary.textContent = "";
    elements.resultsEmpty.hidden = false;
    elements.detail.hidden = true;
    elements.detailEmpty.hidden = false;
    setStatus("idle");
    history.replaceState(null, "", window.location.pathname);
    elements.query.focus();
  });
  elements.radical.addEventListener("focus", () => ensureData().catch(() => undefined), { once: true });
  elements.locale.addEventListener("change", () => {
    const locale = elements.locale.value;
    localStorage.setItem("jianfan-locale", locale);
    localStorage.setItem("jianfan-locale-manual", "1");
    window.location.assign(`/${localePrefixes[locale]}japanese-kanji-dictionary/${window.location.search}`);
  });

  const params = new URLSearchParams(window.location.search);
  elements.query.value = params.get("q") || "";
  elements.strokes.value = params.get("strokes") || "";
  elements.grade.value = params.get("grade") || "";
  if (params.has("radical")) {
    ensureData().then(() => {
      elements.radical.value = params.get("radical") || "";
      search();
    }).catch(() => undefined);
  } else if (elements.query.value || elements.strokes.value || elements.grade.value) {
    search();
  }
})();
