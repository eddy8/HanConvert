(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const body = document.body;
  if (body.dataset.toolPage !== "han-character-lookup") return;

  const core = globalThis.HanCharacterLookupCore;
  const labels = JSON.parse(document.querySelector("#hanLookupLabels").textContent);
  const localePrefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
  const dataCache = new Map();
  const strokeCache = new Map();
  const componentColors = ["#40f2b0", "#ffcc66", "#ff7d8b"];
  const svgNamespace = "http://www.w3.org/2000/svg";
  const elements = {
    locale: document.querySelector("#localeSelect"),
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
    worksheetLink: document.querySelector("#hanLookupWorksheetLink")
  };

  let characters = [];
  let currentCharacter = "";
  let currentRecord = null;
  let currentTree = null;
  let currentMatches = [];
  let selectedPath = [];

  setupEvents();
  initialize();

  function message(key, values = {}) {
    const attribute = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[attribute] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  function setupEvents() {
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
      const query = currentCharacter ? `?character=${encodeURIComponent(currentCharacter)}` : "";
      window.location.assign(`/${localePrefixes[locale]}chinese-character-lookup/${query}`);
    });

    elements.copy.addEventListener("click", copyCurrentCharacter);
    elements.selectedQuery.addEventListener("click", () => {
      const node = core.findNode(currentTree, selectedPath);
      if (node && isHan(node.value)) setCharacters([node.value]);
    });
  }

  function initialize() {
    const requested = new URLSearchParams(window.location.search).get("character");
    const initial = core.extractHanCharacters(requested || body.dataset.initialCharacter || "明");
    elements.input.value = initial.join("");
    setCharacters(initial.length ? initial : ["明"]);
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
    if (!elements.selectedQuery.hidden) elements.selectedQuery.textContent = message("queryComponent", { character: label });
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
  }

  function updateActionLinks(character) {
    const query = `?character=${encodeURIComponent(character)}`;
    elements.strokeLink.href = `${elements.strokeLink.dataset.base}${query}`;
    elements.pinyinLink.href = `${elements.pinyinLink.dataset.base}${query}`;
    elements.worksheetLink.href = `${elements.worksheetLink.dataset.base}${query}`;
  }

  function setStatus(key, type = "idle", values = {}) {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = message(key, values);
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
