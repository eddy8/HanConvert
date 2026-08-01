(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const body = document.body;
  if (body.dataset.toolPage !== "han-character-lookup") return;

  const core = globalThis.HanCharacterLookupCore;
  const labels = JSON.parse(document.querySelector("#hanLookupLabels").textContent);
  const componentLabels = labels.componentSearch;
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  const dataCache = new Map();
  const strokeCache = new Map();
  const componentColors = ["#40f2b0", "#ffcc66", "#ff7d8b"];
  const componentPageSize = 72;
  const svgNamespace = "http://www.w3.org/2000/svg";
  const elements = {
    tool: document.querySelector(".han-lookup-tool"),
    locale: document.querySelector("#localeSelect"),
    modeButtons: document.querySelectorAll("[data-han-lookup-mode]"),
    characterPanel: document.querySelector("#hanCharacterLookupPanel"),
    componentPanel: document.querySelector("#hanComponentLookupPanel"),
    form: document.querySelector("#hanLookupForm"),
    input: document.querySelector("#hanLookupInput"),
    submit: document.querySelector("#hanLookupSubmit"),
    status: document.querySelector("#hanLookupStatus"),
    characterTabs: document.querySelector("#hanLookupCharacterTabs"),
    glyph: document.querySelector("#hanLookupGlyph"),
    glyphFallback: document.querySelector("#hanLookupGlyphFallback"),
    structureTree: document.querySelector("#hanLookupStructureTree"),
    structureEmpty: document.querySelector("#hanLookupStructureEmpty"),
    selectedText: document.querySelector("#hanLookupSelectedText"),
    selectedQuery: document.querySelector("#hanLookupSelectedQuery"),
    selectedFind: document.querySelector("#hanLookupSelectedFind"),
    currentCharacter: document.querySelector("#hanLookupCurrentCharacter"),
    pinyin: document.querySelector("#hanLookupPinyin"),
    radical: document.querySelector("#hanLookupRadical"),
    strokes: document.querySelector("#hanLookupStrokes"),
    structure: document.querySelector("#hanLookupStructure"),
    unicode: document.querySelector("#hanLookupUnicode"),
    definitionRow: document.querySelector("#hanLookupDefinitionRow"),
    definition: document.querySelector("#hanLookupDefinition"),
    cantoneseRow: document.querySelector("#hanLookupCantoneseRow"),
    cantonese: document.querySelector("#hanLookupCantonese"),
    japaneseRow: document.querySelector("#hanLookupJapaneseRow"),
    japanese: document.querySelector("#hanLookupJapanese"),
    koreanRow: document.querySelector("#hanLookupKoreanRow"),
    korean: document.querySelector("#hanLookupKorean"),
    variantsRow: document.querySelector("#hanLookupVariantsRow"),
    variants: document.querySelector("#hanLookupVariants"),
    formation: document.querySelector("#hanLookupFormation"),
    formationType: document.querySelector("#hanLookupFormationType"),
    formationDetail: document.querySelector("#hanLookupFormationDetail"),
    copy: document.querySelector("#hanLookupCopy"),
    strokeLink: document.querySelector("#hanLookupStrokeLink"),
    pinyinLink: document.querySelector("#hanLookupPinyinLink"),
    worksheetLink: document.querySelector("#hanLookupWorksheetLink"),
    componentForm: document.querySelector("#hanComponentForm"),
    componentInput: document.querySelector("#hanComponentInput"),
    componentSubmit: document.querySelector("#hanComponentSubmit"),
    componentClear: document.querySelector("#hanComponentClear"),
    componentSelected: document.querySelector("#hanComponentSelected"),
    componentStrokes: document.querySelector("#hanComponentStrokes"),
    componentSort: document.querySelector("#hanComponentSort"),
    componentSummary: document.querySelector("#hanComponentSummary"),
    componentResults: document.querySelector("#hanComponentResults"),
    componentEmpty: document.querySelector("#hanComponentEmpty"),
    componentMore: document.querySelector("#hanComponentMore")
  };

  let activeMode = "character";
  let characters = [];
  let currentCharacter = "";
  let currentRecord = null;
  let currentTree = null;
  let currentMatches = [];
  let selectedPath = [];
  let componentIndexPromise = null;
  let componentIndex = null;
  let selectedComponents = [];
  let componentResults = [];
  let componentVisibleCount = componentPageSize;
  let componentSearchToken = 0;
  const statusByMode = {
    character: { text: message("loading"), type: "idle" },
    component: { text: componentLabels.initialHint, type: "idle" }
  };

  setupEvents();
  initialize();

  function message(key, values = {}) {
    const attribute = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[attribute] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  function setupEvents() {
    elements.modeButtons.forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.hanLookupMode));
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const nextMode = button.dataset.hanLookupMode === "character" ? "component" : "character";
        setMode(nextMode);
        [...elements.modeButtons].find((item) => item.dataset.hanLookupMode === nextMode)?.focus();
      });
    });

    elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nextCharacters = core.extractHanCharacters(elements.input.value);
      if (!nextCharacters.length) {
        setStatus("invalid", "error");
        elements.input.focus();
        return;
      }
      setCharacters(nextCharacters);
    });

    document.querySelectorAll("[data-han-lookup-sample]").forEach((button) => {
      button.addEventListener("click", () => {
        elements.input.value = button.dataset.hanLookupSample || "";
        elements.form.requestSubmit();
      });
    });

    elements.locale.addEventListener("change", () => {
      const locale = elements.locale.value;
      localStorage.setItem("jianfan-locale", locale);
      localStorage.setItem("jianfan-locale-manual", "1");
      const query = activeMode === "component" ? buildComponentQuery() : currentCharacter ? `?character=${encodeURIComponent(currentCharacter)}` : "";
      window.location.assign(`/${localePrefixes[locale]}chinese-character-lookup/${query}`);
    });

    elements.copy.addEventListener("click", copyCurrentCharacter);
    elements.selectedQuery.addEventListener("click", () => {
      const node = core.findNode(currentTree, selectedPath);
      if (node && isHan(node.value)) setCharacters([node.value]);
    });
    elements.selectedFind.addEventListener("click", () => {
      const node = core.findNode(currentTree, selectedPath);
      if (node && isHan(node.value)) startComponentSearch([node.value]);
    });

    elements.componentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const nextComponents = core.extractHanComponents(elements.componentInput.value);
      if (!nextComponents.length) {
        setComponentStatus("invalid", "error");
        elements.componentInput.focus();
        return;
      }
      startComponentSearch(nextComponents);
    });

    document.querySelectorAll("[data-han-component]").forEach((button) => {
      button.addEventListener("click", () => {
        const inputComponents = core.extractHanComponents(elements.componentInput.value);
        const current = inputComponents.length ? inputComponents : selectedComponents;
        if (current.length >= 4) return;
        startComponentSearch([...current, button.dataset.hanComponent]);
      });
    });

    elements.componentClear.addEventListener("click", clearComponentSearch);
    elements.componentStrokes.addEventListener("change", () => {
      if (selectedComponents.length) searchByComponents();
      else updateComponentHistory();
    });
    elements.componentSort.addEventListener("change", () => {
      if (selectedComponents.length) searchByComponents();
      else updateComponentHistory();
    });
    elements.componentMore.addEventListener("click", () => {
      componentVisibleCount += componentPageSize;
      renderComponentResults(componentIndex);
    });
  }

  function initialize() {
    const params = new URLSearchParams(window.location.search);
    const requestedComponents = core.extractHanComponents(params.get("components") || "");
    const requestedMode = params.get("mode");
    const requestedStrokes = params.get("strokes") || "";
    const requestedSort = params.get("sort") || "common";
    if ([...elements.componentStrokes.options].some((option) => option.value === requestedStrokes)) elements.componentStrokes.value = requestedStrokes;
    if ([...elements.componentSort.options].some((option) => option.value === requestedSort)) elements.componentSort.value = requestedSort;

    if (requestedComponents.length || requestedMode === "components") {
      characters = [body.dataset.initialCharacter || "明"];
      currentCharacter = characters[0];
      elements.input.value = currentCharacter;
      renderCharacterTabs();
      resetResult(currentCharacter);
      setMode("component", { updateHistory: false });
      if (requestedComponents.length) startComponentSearch(requestedComponents);
      return;
    }

    const requested = params.get("character");
    const initial = core.extractHanCharacters(requested || body.dataset.initialCharacter || "明");
    elements.input.value = initial.join("");
    setCharacters(initial.length ? initial : ["明"]);
  }

  function setMode(mode, options = {}) {
    const nextMode = mode === "component" ? "component" : "character";
    activeMode = nextMode;
    body.dataset.lookupMode = nextMode;
    elements.modeButtons.forEach((button) => {
      const selected = button.dataset.hanLookupMode === nextMode;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    elements.characterPanel.hidden = nextMode !== "character";
    elements.componentPanel.hidden = nextMode !== "component";
    renderStatus(statusByMode[nextMode]);

    if (options.updateHistory !== false) {
      if (nextMode === "component") updateComponentHistory();
      else if (currentCharacter) window.history.replaceState(null, "", `${window.location.pathname}?character=${encodeURIComponent(currentCharacter)}`);
    }
    if (nextMode === "character" && options.loadCharacter !== false && !currentRecord && currentCharacter) selectCharacter(currentCharacter);
  }

  function startComponentSearch(components) {
    selectedComponents = components.slice(0, 4);
    elements.componentInput.value = selectedComponents.join("");
    renderSelectedComponents();
    setMode("component", { updateHistory: false });
    searchByComponents();
  }

  function clearComponentSearch() {
    componentSearchToken += 1;
    selectedComponents = [];
    componentResults = [];
    componentVisibleCount = componentPageSize;
    elements.componentInput.value = "";
    elements.componentResults.replaceChildren();
    elements.componentSummary.textContent = componentLabels.initialHint;
    elements.componentEmpty.textContent = componentLabels.initialHint;
    elements.componentEmpty.hidden = false;
    elements.componentMore.hidden = true;
    elements.componentSubmit.disabled = false;
    renderSelectedComponents();
    setComponentStatusText(componentLabels.initialHint);
    updateComponentHistory();
  }

  function renderSelectedComponents() {
    elements.componentSelected.replaceChildren();
    elements.componentClear.disabled = !selectedComponents.length;
    if (!selectedComponents.length) {
      const empty = document.createElement("span");
      empty.textContent = componentLabels.selectedEmpty;
      elements.componentSelected.append(empty);
      return;
    }

    selectedComponents.forEach((character, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", componentMessage("removeComponent", { character }));
      const glyph = document.createElement("strong");
      glyph.textContent = character;
      const remove = document.createElement("span");
      remove.textContent = "×";
      remove.setAttribute("aria-hidden", "true");
      button.append(glyph, remove);
      button.addEventListener("click", () => {
        const next = selectedComponents.filter((_, componentIndex) => componentIndex !== index);
        if (next.length) startComponentSearch(next);
        else clearComponentSearch();
      });
      elements.componentSelected.append(button);
    });
  }

  async function loadComponentIndex() {
    if (!componentIndexPromise) {
      componentIndexPromise = fetch("/data/han-character-lookup/components.json").then((response) => {
        if (!response.ok) throw new Error("Component index unavailable");
        return response.json();
      }).then((index) => {
        if (index.version !== 1 || !index.components || !index.meta) throw new Error("Invalid component index");
        componentIndex = index;
        return index;
      }).catch((error) => {
        componentIndexPromise = null;
        componentIndex = null;
        throw error;
      });
    }
    return componentIndexPromise;
  }

  async function searchByComponents() {
    if (!selectedComponents.length) return;
    const token = ++componentSearchToken;
    setComponentStatus("loading");
    elements.componentSubmit.disabled = true;
    elements.componentSummary.textContent = componentLabels.loading;
    try {
      const index = await loadComponentIndex();
      if (token !== componentSearchToken) return;
      componentResults = core.findCharactersByComponents(index, selectedComponents, {
        locale: body.dataset.locale,
        sort: elements.componentSort.value,
        strokes: elements.componentStrokes.value
      });
      componentVisibleCount = componentPageSize;
      renderComponentResults(index);
      if (componentResults.length) {
        const values = { count: componentResults.length, components: selectedComponents.join(" + ") };
        setComponentStatusText(componentMessage("resultSummary", values), "ready");
      } else {
        setComponentStatus("noResults");
      }
      updateComponentHistory();
    } catch (error) {
      if (token !== componentSearchToken) return;
      console.error(error);
      componentResults = [];
      elements.componentResults.replaceChildren();
      elements.componentSummary.textContent = componentLabels.failed;
      elements.componentEmpty.textContent = componentLabels.failed;
      elements.componentEmpty.hidden = false;
      elements.componentMore.hidden = true;
      setComponentStatus("failed", "error");
    } finally {
      if (token === componentSearchToken) elements.componentSubmit.disabled = false;
    }
  }

  function renderComponentResults(index) {
    elements.componentResults.replaceChildren();
    const values = { count: componentResults.length, components: selectedComponents.join(" + ") };
    elements.componentSummary.textContent = componentResults.length ? componentMessage("resultSummary", values) : componentLabels.noResults;
    elements.componentEmpty.textContent = componentResults.length ? componentLabels.initialHint : componentLabels.noResults;
    elements.componentEmpty.hidden = Boolean(componentResults.length);

    componentResults.slice(0, componentVisibleCount).forEach((character) => {
      const metadata = index.meta[character] || [];
      const strokes = metadata[0] || "-";
      const reading = metadata[4] || "-";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "han-component-result";
      const resultLabel = componentMessage("resultLabel", { character, strokes, reading });
      button.setAttribute("aria-label", resultLabel);
      button.title = resultLabel;
      const glyph = document.createElement("strong");
      glyph.textContent = character;
      const pronunciation = document.createElement("span");
      pronunciation.textContent = reading;
      const strokeCount = document.createElement("small");
      strokeCount.textContent = componentMessage("resultStroke", { count: strokes });
      button.append(glyph, pronunciation, strokeCount);
      button.addEventListener("click", () => {
        setMode("character", { updateHistory: false, loadCharacter: false });
        setCharacters([character]);
        elements.tool.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      elements.componentResults.append(button);
    });
    elements.componentMore.hidden = componentVisibleCount >= componentResults.length;
  }

  function buildComponentQuery() {
    const params = new URLSearchParams();
    if (selectedComponents.length) params.set("components", selectedComponents.join(""));
    else params.set("mode", "components");
    if (elements.componentStrokes.value) params.set("strokes", elements.componentStrokes.value);
    if (elements.componentSort.value !== "common") params.set("sort", elements.componentSort.value);
    return `?${params.toString()}`;
  }

  function updateComponentHistory() {
    if (activeMode === "component") window.history.replaceState(null, "", `${window.location.pathname}${buildComponentQuery()}`);
  }

  function componentMessage(key, values = {}) {
    return (componentLabels[key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  function setCharacters(nextCharacters) {
    characters = nextCharacters;
    elements.input.value = characters.join("");
    renderCharacterTabs();
    selectCharacter(characters[0]);
  }

  async function selectCharacter(character) {
    if (!character) return;
    currentCharacter = character;
    currentRecord = null;
    currentTree = null;
    currentMatches = [];
    selectedPath = [];
    renderCharacterTabs();
    resetResult(character);
    setStatus("loading");
    elements.submit.disabled = true;
    window.history.replaceState(null, "", `${window.location.pathname}?character=${encodeURIComponent(character)}`);

    try {
      currentRecord = await loadCharacterRecord(character);
      if (!currentRecord) throw new Error(`Character data unavailable: ${character}`);
      currentTree = core.parseIds(currentRecord.d);
      currentMatches = core.decodeMatches(currentRecord.m);
      renderDetails();
      renderStructure();
      await renderGlyph();
      setStatus("ready", "ready", { character });
    } catch (error) {
      console.error(error);
      renderMissing(character);
      setStatus("missing", "error", { character });
    } finally {
      elements.submit.disabled = false;
    }
  }

  async function loadCharacterRecord(character) {
    const shard = core.shardName(character);
    if (!shard) return null;
    if (!dataCache.has(shard)) {
      const request = fetch(`/data/han-character-lookup/${shard}.json`).then((response) => {
        if (!response.ok) throw new Error(`Character shard unavailable: ${shard}`);
        return response.json();
      });
      dataCache.set(shard, request);
    }
    try {
      const data = await dataCache.get(shard);
      return data[character] || null;
    } catch (error) {
      dataCache.delete(shard);
      throw error;
    }
  }

  async function loadStrokeData(character) {
    if (!strokeCache.has(character)) {
      const request = fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data/${encodeURIComponent(character)}.json`, { mode: "cors" }).then((response) => {
        if (!response.ok) throw new Error(`Stroke data unavailable: ${character}`);
        return response.json();
      });
      strokeCache.set(character, request);
    }
    try {
      return await strokeCache.get(character);
    } catch (error) {
      strokeCache.delete(character);
      throw error;
    }
  }

  function renderCharacterTabs() {
    elements.characterTabs.replaceChildren();
    elements.characterTabs.hidden = characters.length < 2;
    characters.forEach((character) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = character;
      button.className = character === currentCharacter ? "is-active" : "";
      button.setAttribute("aria-pressed", String(character === currentCharacter));
      button.addEventListener("click", () => selectCharacter(character));
      elements.characterTabs.append(button);
    });
  }

  function resetResult(character) {
    elements.currentCharacter.textContent = character;
    elements.glyph.replaceChildren();
    elements.glyphFallback.textContent = character;
    elements.glyphFallback.hidden = false;
    elements.structureTree.replaceChildren();
    elements.structureEmpty.hidden = true;
    elements.selectedQuery.hidden = true;
    elements.selectedFind.hidden = true;
    for (const target of [elements.pinyin, elements.radical, elements.strokes, elements.structure]) target.textContent = "-";
    elements.unicode.textContent = core.formatCodePoint(character);
    for (const row of [elements.definitionRow, elements.cantoneseRow, elements.japaneseRow, elements.koreanRow, elements.variantsRow]) row.hidden = true;
    elements.formation.hidden = true;
    updateActionLinks(character);
  }

  function renderDetails() {
    const record = currentRecord;
    elements.pinyin.textContent = record.p?.join(" / ") || "-";
    elements.radical.textContent = record.r || "-";
    elements.strokes.textContent = record.s || String(currentMatches.length || "-");
    elements.structure.textContent = labels.structures[core.structureKey(currentTree?.value)] || labels.structures.single;
    elements.unicode.textContent = core.formatCodePoint(currentCharacter);
    showRow(elements.definitionRow, elements.definition, record.g);
    showRow(elements.cantoneseRow, elements.cantonese, record.c);
    showRow(elements.japaneseRow, elements.japanese, formatJapaneseReadings(record));
    showRow(elements.koreanRow, elements.korean, record.ko?.join(" / "));
    renderVariants(record);
    renderFormation(record.e);
    updateActionLinks(currentCharacter);
  }

  function showRow(row, target, value) {
    row.hidden = !value;
    target.textContent = value || "-";
  }

  function formatJapaneseReadings(record) {
    const parts = [];
    if (record.jo) parts.push(`${labels.onReading}: ${record.jo.toLowerCase()}`);
    if (record.jk) parts.push(`${labels.kunReading}: ${record.jk.toLowerCase()}`);
    return parts.join(" · ");
  }

  function renderVariants(record) {
    const variants = [...new Set([...(record.vs || []), ...(record.vt || [])])].filter((character) => character !== currentCharacter);
    elements.variantsRow.hidden = !variants.length;
    elements.variants.replaceChildren();
    variants.forEach((character) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = character;
      button.title = message("queryComponent", { character });
      button.addEventListener("click", () => setCharacters([character]));
      elements.variants.append(button);
    });
  }

  function renderFormation(etymology) {
    elements.formation.hidden = !etymology?.t;
    if (!etymology?.t) return;
    elements.formationType.textContent = labels.formations[etymology.t] || labels.formations.unknown;
    const details = [];
    if (etymology.s) details.push(message("semanticComponent", { character: etymology.s }));
    if (etymology.p) details.push(message("phoneticComponent", { character: etymology.p }));
    elements.formationDetail.textContent = details.join(" · ");
    elements.formationDetail.hidden = !details.length;
  }

  function renderStructure() {
    elements.structureTree.replaceChildren();
    if (!currentTree || currentRecord.d.startsWith("？")) {
      elements.structureEmpty.hidden = false;
      elements.structureEmpty.textContent = message("structureUnavailable", { character: currentCharacter });
      elements.selectedText.textContent = message("allStrokes", { character: currentCharacter });
      elements.selectedQuery.hidden = true;
      elements.selectedFind.hidden = true;
      return;
    }

    elements.structureEmpty.hidden = true;
    const root = createTreeButton(currentCharacter, [], labels.wholeCharacter);
    root.classList.add("is-root", "is-active");
    elements.structureTree.append(root);
    const connector = document.createElement("span");
    connector.className = "han-lookup-tree-connector";
    connector.setAttribute("aria-hidden", "true");
    elements.structureTree.append(connector, renderTreeNode(currentTree, true));
    updateSelectedComponent([]);
  }

  function renderTreeNode(node, isRoot = false) {
    if (!node.children.length) return createTreeButton(node.value, node.path, labels.component);
    const group = document.createElement("div");
    group.className = "han-lookup-tree-group";
    const operator = document.createElement("button");
    operator.type = "button";
    operator.className = "han-lookup-tree-operator";
    operator.dataset.path = node.path.join(".");
    operator.disabled = isRoot;
    operator.innerHTML = `<span>${labels.structures[core.structureKey(node.value)] || labels.structures.single}</span><small>${node.value}</small>`;
    if (!isRoot) attachTreeInteraction(operator, node.path);
    const children = document.createElement("div");
    children.className = "han-lookup-tree-children";
    children.style.setProperty("--tree-columns", String(node.children.length));
    node.children.forEach((child) => children.append(renderTreeNode(child)));
    group.append(operator, children);
    return group;
  }

  function createTreeButton(character, path, description) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "han-lookup-tree-character";
    button.dataset.path = path.join(".");
    const color = path.length ? componentColors[path[0] % componentColors.length] : "#eefcf5";
    button.style.setProperty("--component-color", color);
    const glyph = document.createElement("strong");
    glyph.textContent = character;
    const label = document.createElement("small");
    label.textContent = description;
    button.append(glyph, label);
    attachTreeInteraction(button, path);
    return button;
  }

  function attachTreeInteraction(button, path) {
    button.addEventListener("click", () => updateSelectedComponent(path));
    button.addEventListener("mouseenter", () => highlightStrokePath(path));
    button.addEventListener("mouseleave", () => highlightStrokePath(selectedPath));
  }

  function updateSelectedComponent(path) {
    selectedPath = path;
    const node = path.length ? core.findNode(currentTree, path) : null;
    const label = node?.value || currentCharacter;
    elements.selectedText.textContent = path.length
      ? message("selectedComponent", { character: label })
      : message("allStrokes", { character: currentCharacter });
    elements.selectedQuery.hidden = !path.length || !isHan(label);
    elements.selectedFind.hidden = !path.length || !isHan(label);
    if (!elements.selectedQuery.hidden) elements.selectedQuery.textContent = message("queryComponent", { character: label });
    if (!elements.selectedFind.hidden) elements.selectedFind.textContent = componentMessage("findContaining", { character: label });
    elements.structureTree.querySelectorAll("[data-path]").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.path === path.join("."));
    });
    highlightStrokePath(path);
  }

  function highlightStrokePath(path) {
    elements.glyph.querySelectorAll("path").forEach((stroke, index) => {
      const belongs = core.strokeBelongsToPath(currentMatches[index], path);
      stroke.classList.toggle("is-muted", !belongs);
      stroke.classList.toggle("is-focused", Boolean(path.length) && belongs);
    });
  }

  async function renderGlyph() {
    const requestedCharacter = currentCharacter;
    try {
      const data = await loadStrokeData(requestedCharacter);
      if (requestedCharacter !== currentCharacter) return;
      const svg = document.createElementNS(svgNamespace, "svg");
      svg.setAttribute("viewBox", "0 0 1024 1024");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", message("glyphLabel", { character: requestedCharacter }));
      const group = document.createElementNS(svgNamespace, "g");
      group.setAttribute("transform", "scale(1, -1) translate(0, -900)");
      data.strokes.forEach((pathData, index) => {
        const path = document.createElementNS(svgNamespace, "path");
        const match = currentMatches[index];
        path.setAttribute("d", pathData);
        path.setAttribute("fill", Array.isArray(match) && match.length ? componentColors[match[0] % componentColors.length] : "#8aa39a");
        group.append(path);
      });
      svg.append(group);
      elements.glyph.replaceChildren(svg);
      elements.glyphFallback.hidden = true;
      highlightStrokePath(selectedPath);
    } catch (error) {
      console.warn(error);
      elements.glyphFallback.hidden = false;
      elements.glyphFallback.title = message("glyphUnavailable");
    }
  }

  function renderMissing(character) {
    elements.structureTree.replaceChildren();
    elements.structureEmpty.hidden = false;
    elements.structureEmpty.textContent = message("missingDetail", { character });
    elements.selectedText.textContent = message("allStrokes", { character });
    elements.selectedQuery.hidden = true;
    elements.selectedFind.hidden = true;
  }

  function updateActionLinks(character) {
    const query = `?character=${encodeURIComponent(character)}`;
    elements.strokeLink.href = `${elements.strokeLink.dataset.base}${query}`;
    elements.pinyinLink.href = `${elements.pinyinLink.dataset.base}${query}`;
    elements.worksheetLink.href = `${elements.worksheetLink.dataset.base}${query}`;
  }

  function setStatus(key, type = "idle", values = {}) {
    const state = { text: message(key, values), type };
    statusByMode.character = state;
    if (activeMode === "character") renderStatus(state);
  }

  function setComponentStatus(key, type = "idle", values = {}) {
    setComponentStatusText(componentMessage(key, values), type);
  }

  function setComponentStatusText(text, type = "idle") {
    const state = { text, type };
    statusByMode.component = state;
    if (activeMode === "component") renderStatus(state);
  }

  function renderStatus(state) {
    elements.status.classList.toggle("is-ready", state.type === "ready");
    elements.status.classList.toggle("is-error", state.type === "error");
    elements.status.lastElementChild.textContent = state.text;
  }

  async function copyCurrentCharacter() {
    try {
      await navigator.clipboard.writeText(currentCharacter);
      setStatus("copied", "ready", { character: currentCharacter });
    } catch {
      setStatus("copyFailed", "error");
    }
  }

  function isHan(value) {
    return /^\p{Script=Han}$/u.test(value || "");
  }
})();
