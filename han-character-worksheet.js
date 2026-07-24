(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanCharacterWorksheetCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_CHARACTERS = 40;
  const GRID_STYLES = new Set(["tian", "mi", "square"]);
  const PAPER_SIZES = new Set(["a4", "letter"]);
  const HAN_PATTERN = /^\p{Script=Han}$/u;

  function clampInteger(value, minimum, maximum, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Math.min(maximum, Math.max(minimum, Number.isFinite(parsed) ? parsed : fallback));
  }

  function clampNumber(value, minimum, maximum, fallback) {
    const parsed = Number(value);
    return Math.min(maximum, Math.max(minimum, Number.isFinite(parsed) ? parsed : fallback));
  }

  function normalizeReadings(value) {
    const values = Array.isArray(value) ? value.flat(Infinity) : [value];
    return [...new Set(
      values
        .flatMap((item) => String(item || "").trim().split(/\s+/u))
        .filter(Boolean)
    )];
  }

  function buildCharacterEntries(value, options = {}) {
    const dedupe = options.dedupe !== false;
    const limit = clampInteger(options.limit, 1, MAX_CHARACTERS, MAX_CHARACTERS);
    const contextualReadings = Array.isArray(options.contextualReadings)
      ? options.contextualReadings
      : [];
    const entries = [];
    const byCharacter = new Map();
    let hanIndex = 0;

    for (const character of Array.from(String(value || ""))) {
      if (!HAN_PATTERN.test(character)) continue;
      const readings = normalizeReadings(contextualReadings[hanIndex]);
      hanIndex += 1;

      if (!dedupe) {
        if (entries.length >= limit) break;
        entries.push({ character, readings });
        continue;
      }

      const existing = byCharacter.get(character);
      if (existing) {
        for (const reading of readings) {
          if (!existing.readings.includes(reading)) existing.readings.push(reading);
        }
        continue;
      }
      if (entries.length >= limit) continue;
      const entry = { character, readings };
      byCharacter.set(character, entry);
      entries.push(entry);
    }
    return entries;
  }

  function extractHanCharacters(value, options = {}) {
    return buildCharacterEntries(value, options).map((entry) => entry.character);
  }

  function getContextualReadings(value, pinyinFn, polyphonicFn) {
    const source = String(value || "");
    const characters = Array.from(source).filter((character) => HAN_PATTERN.test(character));
    if (!characters.length) return [];

    if (characters.length === 1 && typeof polyphonicFn === "function") {
      try {
        const readings = normalizeReadings(
          polyphonicFn(characters[0], {
            type: "array",
            toneType: "symbol",
            traditional: true
          })
        );
        if (readings.length) return [readings];
      } catch {
        // Fall through to the normal Pinyin resolver.
      }
    }

    if (typeof pinyinFn !== "function") return [];
    try {
      const items = pinyinFn(source, {
        type: "all",
        toneType: "symbol",
        traditional: true,
        nonZh: "consecutive"
      });
      if (!Array.isArray(items)) return [];
      const readings = [];
      for (const item of items) {
        const itemCharacters = Array.from(String(item?.origin || ""));
        const itemReadings = normalizeReadings(item?.pinyin || item?.result);
        let readingIndex = 0;
        for (const character of itemCharacters) {
          if (!HAN_PATTERN.test(character)) continue;
          readings.push(itemReadings[readingIndex] ? [itemReadings[readingIndex]] : []);
          readingIndex += 1;
        }
      }
      return readings.length === characters.length ? readings : [];
    } catch {
      return [];
    }
  }

  function normalizeSettings(settings = {}) {
    const columns = clampInteger(settings.columns, 6, 12, 10);
    return {
      paperSize: PAPER_SIZES.has(settings.paperSize) ? settings.paperSize : "a4",
      gridStyle: GRID_STYLES.has(settings.gridStyle) ? settings.gridStyle : "tian",
      columns,
      rowsPerCharacter: clampInteger(settings.rowsPerCharacter, 1, 3, 2),
      traceCells: clampInteger(settings.traceCells, 0, columns - 1, 3),
      traceOpacity: clampNumber(settings.traceOpacity, 0.08, 0.5, 0.2),
      dedupe: settings.dedupe !== false,
      showPinyin: settings.showPinyin !== false,
      showStrokeOrder: settings.showStrokeOrder !== false
    };
  }

  function getCharactersPerPage(settings) {
    const blockUnits = settings.rowsPerCharacter * 2 + (settings.showStrokeOrder ? 2 : 0) + 1;
    return Math.max(1, Math.min(6, Math.floor(24 / blockUnits)));
  }

  function buildPracticeRows(character, settings) {
    return Array.from({ length: settings.rowsPerCharacter }, (_, rowIndex) =>
      Array.from({ length: settings.columns }, (_, columnIndex) => {
        if (rowIndex !== 0) return { kind: "blank", character: "" };
        if (columnIndex === 0) return { kind: "model", character };
        if (columnIndex <= settings.traceCells) return { kind: "trace", character };
        return { kind: "blank", character: "" };
      })
    );
  }

  function buildWorksheetPlan(value, rawSettings = {}, contextualReadings = []) {
    const settings = normalizeSettings(rawSettings);
    const entries = buildCharacterEntries(value, {
      dedupe: settings.dedupe,
      limit: MAX_CHARACTERS,
      contextualReadings
    });
    const characters = entries.map((entry) => entry.character);
    const charactersPerPage = getCharactersPerPage(settings);
    const blocks = entries.map((entry) => ({
      character: entry.character,
      readings: entry.readings,
      rows: buildPracticeRows(entry.character, settings)
    }));
    const pages = [];
    for (let index = 0; index < blocks.length; index += charactersPerPage) {
      pages.push(blocks.slice(index, index + charactersPerPage));
    }
    return { characters, charactersPerPage, pages, settings };
  }

  function selectStrokeSteps(strokeCount, limit = 18) {
    const count = Math.max(0, Number(strokeCount) || 0);
    const maximum = Math.max(2, Number(limit) || 18);
    if (count <= maximum) return Array.from({ length: count }, (_, index) => index);
    return [...Array.from({ length: maximum - 1 }, (_, index) => index), count - 1];
  }

  return {
    GRID_STYLES,
    MAX_CHARACTERS,
    PAPER_SIZES,
    buildCharacterEntries,
    buildWorksheetPlan,
    extractHanCharacters,
    getContextualReadings,
    normalizeSettings,
    selectStrokeSteps
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const core = globalThis.HanCharacterWorksheetCore;
  const body = document.body;
  if (body.dataset.toolPage !== "han-character-worksheet") return;

  const elements = {
    localeSelect: document.querySelector("#localeSelect"),
    form: document.querySelector("#worksheetControls"),
    input: document.querySelector("#worksheetInput"),
    title: document.querySelector("#worksheetTitle"),
    sample: document.querySelector("#worksheetSample"),
    clear: document.querySelector("#worksheetClear"),
    print: document.querySelector("#worksheetPrint"),
    paperSize: document.querySelector("#worksheetPaperSize"),
    gridStyle: document.querySelector("#worksheetGridStyle"),
    columns: document.querySelector("#worksheetColumns"),
    columnsValue: document.querySelector("#worksheetColumnsValue"),
    rows: document.querySelector("#worksheetRows"),
    rowsValue: document.querySelector("#worksheetRowsValue"),
    traceCells: document.querySelector("#worksheetTraceCells"),
    traceCellsValue: document.querySelector("#worksheetTraceCellsValue"),
    traceOpacity: document.querySelector("#worksheetTraceOpacity"),
    traceOpacityValue: document.querySelector("#worksheetTraceOpacityValue"),
    dedupe: document.querySelector("#worksheetDedupe"),
    showPinyin: document.querySelector("#worksheetShowPinyin"),
    showStrokeOrder: document.querySelector("#worksheetShowStrokeOrder"),
    count: document.querySelector("#worksheetCharacterCount"),
    status: document.querySelector("#worksheetStatus"),
    preview: document.querySelector("#worksheetPreview")
  };
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  const strokeDataCache = new Map();
  let renderToken = 0;
  let renderTimer = 0;

  function message(key, values = {}) {
    const attribute = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[attribute] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  function setStatus(key, type = "idle", values = {}) {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = message(key, values);
  }

  function getSettings() {
    return {
      paperSize: elements.paperSize.value,
      gridStyle: elements.gridStyle.value,
      columns: elements.columns.value,
      rowsPerCharacter: elements.rows.value,
      traceCells: elements.traceCells.value,
      traceOpacity: Number(elements.traceOpacity.value) / 100,
      dedupe: elements.dedupe.checked,
      showPinyin: elements.showPinyin.checked,
      showStrokeOrder: elements.showStrokeOrder.checked
    };
  }

  function updateControlReadouts() {
    const columns = Number(elements.columns.value);
    const traceMaximum = Math.max(0, columns - 1);
    elements.traceCells.max = String(traceMaximum);
    if (Number(elements.traceCells.value) > traceMaximum) {
      elements.traceCells.value = String(traceMaximum);
    }
    elements.columnsValue.textContent = elements.columns.value;
    elements.rowsValue.textContent = elements.rows.value;
    elements.traceCellsValue.textContent = elements.traceCells.value;
    elements.traceOpacityValue.textContent = `${elements.traceOpacity.value}%`;
  }

  function scheduleRender(delay = 80) {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderWorksheet, delay);
  }

  function getPinyin(character) {
    try {
      const value = globalThis.pinyinPro?.pinyin(character, {
        toneType: "symbol",
        type: "array",
        traditional: true
      });
      return Array.isArray(value) ? value.join(" ") : String(value || "");
    } catch {
      return "";
    }
  }

  function createGridCell(cell, settings) {
    const element = document.createElement("span");
    element.className = `worksheet-grid-cell is-${settings.gridStyle} is-${cell.kind}`;
    element.setAttribute("aria-hidden", "true");
    if (cell.character) {
      const character = document.createElement("span");
      character.className = "worksheet-grid-character";
      character.textContent = cell.character;
      if (cell.kind === "trace") character.style.opacity = String(settings.traceOpacity);
      element.append(character);
    }
    return element;
  }

  function createPracticeRow(row, settings) {
    const element = document.createElement("div");
    element.className = "worksheet-practice-row";
    element.style.setProperty("--worksheet-columns", String(settings.columns));
    for (const cell of row) element.append(createGridCell(cell, settings));
    return element;
  }

  function createCharacterBlock(block, settings) {
    const section = document.createElement("section");
    section.className = "worksheet-character-block";
    section.dataset.character = block.character;

    const heading = document.createElement("div");
    heading.className = "worksheet-character-heading";
    const character = document.createElement("strong");
    character.textContent = block.character;
    const pronunciation = document.createElement("span");
    pronunciation.className = "worksheet-character-pinyin";
    pronunciation.textContent = settings.showPinyin
      ? block.readings.join(" / ") || getPinyin(block.character)
      : "";
    pronunciation.hidden = !settings.showPinyin;
    const strokeCount = document.createElement("small");
    strokeCount.className = "worksheet-stroke-count";
    heading.append(character, pronunciation, strokeCount);
    section.append(heading);

    if (settings.showStrokeOrder) {
      const strokeOrder = document.createElement("div");
      strokeOrder.className = "worksheet-stroke-order";
      strokeOrder.dataset.strokeCharacter = block.character;
      strokeOrder.setAttribute("aria-label", message("strokeOrderLabel", { character: block.character }));
      const loading = document.createElement("span");
      loading.className = "worksheet-stroke-loading";
      loading.textContent = message("strokeLoading");
      strokeOrder.append(loading);
      section.append(strokeOrder);
    }

    const rows = document.createElement("div");
    rows.className = "worksheet-practice-rows";
    for (const row of block.rows) rows.append(createPracticeRow(row, settings));
    section.append(rows);
    return section;
  }

  function createSheet(blocks, pageIndex, pageCount, settings) {
    const sheet = document.createElement("article");
    sheet.className = `worksheet-sheet is-${settings.paperSize}`;

    const header = document.createElement("header");
    header.className = "worksheet-sheet-header";
    const title = document.createElement("div");
    title.className = "worksheet-sheet-title";
    title.textContent = elements.title.value.trim() || body.dataset.defaultWorksheetTitle;
    const fields = document.createElement("div");
    fields.className = "worksheet-sheet-fields";
    fields.innerHTML = `<span>${body.dataset.nameLabel}</span><i></i><span>${body.dataset.dateLabel}</span><i></i>`;
    header.append(title, fields);
    sheet.append(header);

    const content = document.createElement("div");
    content.className = "worksheet-sheet-content";
    for (const block of blocks) content.append(createCharacterBlock(block, settings));
    sheet.append(content);

    const footer = document.createElement("footer");
    footer.className = "worksheet-sheet-footer";
    footer.innerHTML = `<span>JianFan.app</span><span>${pageIndex + 1} / ${pageCount}</span>`;
    sheet.append(footer);
    return sheet;
  }

  async function getStrokeData(character) {
    if (!strokeDataCache.has(character)) {
      const promise =
        typeof globalThis.HanziWriter?.loadCharacterData === "function"
          ? globalThis.HanziWriter.loadCharacterData(character).catch(() => null)
          : Promise.resolve(null);
      strokeDataCache.set(character, promise);
    }
    return strokeDataCache.get(character);
  }

  function createStrokeDiagram(strokes, stepIndex) {
    const item = document.createElement("span");
    item.className = "worksheet-stroke-step";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 48 48");
    svg.setAttribute("aria-hidden", "true");
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const transform = globalThis.HanziWriter.getScalingTransform(48, 48, 3);
    group.setAttribute("transform", transform.transform);
    for (let index = 0; index <= stepIndex; index += 1) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", strokes[index]);
      path.setAttribute("fill", index === stepIndex ? "#111827" : "#9ca3af");
      group.append(path);
    }
    svg.append(group);
    const label = document.createElement("small");
    label.textContent = String(stepIndex + 1);
    item.append(svg, label);
    return item;
  }

  async function renderStrokeOrders(characters, token) {
    const uniqueCharacters = Array.from(new Set(characters));
    let missing = 0;
    await Promise.all(
      uniqueCharacters.map(async (character) => {
        const data = await getStrokeData(character);
        if (token !== renderToken) return;
        const targets = Array.from(
          elements.preview.querySelectorAll("[data-stroke-character]")
        ).filter((target) => target.dataset.strokeCharacter === character);
        for (const target of targets) {
          target.replaceChildren();
          const countTarget = target.parentElement.querySelector(".worksheet-stroke-count");
          if (!data?.strokes?.length) {
            missing += 1;
            target.textContent = message("strokeMissing");
            target.classList.add("is-missing");
            continue;
          }
          countTarget.textContent = message("strokeCount", { count: data.strokes.length });
          const steps = core.selectStrokeSteps(data.strokes.length);
          steps.forEach((stepIndex, index) => {
            if (index === steps.length - 1 && stepIndex > index) {
              const ellipsis = document.createElement("span");
              ellipsis.className = "worksheet-stroke-ellipsis";
              ellipsis.textContent = "…";
              target.append(ellipsis);
            }
            target.append(createStrokeDiagram(data.strokes, stepIndex));
          });
        }
      })
    );
    if (token === renderToken) {
      setStatus(missing ? "readyWithoutStrokes" : "ready", "ready", {
        count: characters.length
      });
    }
  }

  function renderEmptyState() {
    const empty = document.createElement("div");
    empty.className = "worksheet-preview-empty";
    const glyph = document.createElement("span");
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = "田";
    const text = document.createElement("p");
    text.textContent = message("empty");
    empty.append(glyph, text);
    elements.preview.replaceChildren(empty);
  }

  function renderWorksheet() {
    const token = ++renderToken;
    updateControlReadouts();
    const settings = getSettings();
    const contextualReadings = settings.showPinyin
      ? core.getContextualReadings(
          elements.input.value,
          globalThis.pinyinPro?.pinyin,
          globalThis.pinyinPro?.polyphonic
        )
      : [];
    const plan = core.buildWorksheetPlan(elements.input.value, settings, contextualReadings);
    elements.count.textContent = `${plan.characters.length} / ${core.MAX_CHARACTERS}`;

    if (!plan.characters.length) {
      renderEmptyState();
      setStatus("idle");
      return;
    }

    const fragment = document.createDocumentFragment();
    plan.pages.forEach((blocks, index) => {
      fragment.append(createSheet(blocks, index, plan.pages.length, plan.settings));
    });
    elements.preview.replaceChildren(fragment);
    setStatus(plan.settings.showStrokeOrder ? "loadingStrokes" : "ready", plan.settings.showStrokeOrder ? "idle" : "ready", {
      count: plan.characters.length
    });
    if (plan.settings.showStrokeOrder) renderStrokeOrders(plan.characters, token);
  }

  elements.form.addEventListener("input", () => scheduleRender());
  elements.form.addEventListener("change", () => scheduleRender(0));
  elements.sample.addEventListener("click", () => {
    elements.input.value = body.dataset.sampleText;
    scheduleRender(0);
  });
  elements.clear.addEventListener("click", () => {
    elements.input.value = "";
    scheduleRender(0);
    elements.input.focus();
  });
  elements.print.addEventListener("click", () => {
    const characters = core.extractHanCharacters(elements.input.value, {
      dedupe: elements.dedupe.checked
    });
    if (!characters.length) {
      setStatus("invalid", "error");
      elements.input.focus();
      return;
    }
    window.print();
  });
  elements.localeSelect.addEventListener("change", () => {
    const locale = elements.localeSelect.value;
    localStorage.setItem("jianfan-locale", locale);
    localStorage.setItem("jianfan-locale-manual", "1");
    window.location.assign(`/${localePrefixes[locale]}han-character-worksheet/`);
  });

  updateControlReadouts();
  elements.input.value = body.dataset.sampleText;
  renderWorksheet();
})();
