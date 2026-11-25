// Chinese → Zhuyin (Bopomofo) page. Readings come from pinyin-pro (with the shared Traditional
// table), Taiwan/Mainland reading rules from zhuyin-core.js, and the pinyin → zhuyin syllable step
// from the pinyin-to-zhuyin library loaded through the page's import map (pinned, with SRI).
import { p2z } from "pinyin-to-zhuyin";

const localePaths = { "zh-CN": "/", "zh-TW": "/zh-tw/", en: "/en/", ja: "/ja/", ko: "/ko/" };
const sizes = { s: 30, m: 40, l: 54 };
const Z = window.JianfanZhuyin;
const body = document.body;
const locale = body.dataset.locale || "zh-CN";
const pageSlug = body.dataset.pageSlug || "chinese-to-zhuyin";
const messages = readMessages();
const $ = (selector) => document.querySelector(selector);

const status = $("#zhuyinStatus");
const input = $("#zhuyinInput");
const output = $("#zhuyinOutput");
const inputCount = $("#zhuyinInputCount");
const outputCount = $("#zhuyinOutputCount");
const preview = $("#zhuyinPreview");
const previewEmpty = $("#zhuyinPreviewEmpty");
const previewNote = $("#zhuyinPreviewNote");
const sandhi = $("#zhuyinSandhi");
const preserve = $("#zhuyinPreserve");
const readingEmpty = $("#zhuyinReadingEmpty");
const readingCharacter = $("#zhuyinReadingCharacter");
const readingList = $("#zhuyinReadingList");
const readingReset = $("#zhuyinReadingReset");
const standardButtons = [...document.querySelectorAll("[data-zhuyin-standard]")];
const formatButtons = [...document.querySelectorAll("[data-zhuyin-format]")];
const sizeButtons = [...document.querySelectorAll("[data-zhuyin-size]")];

let standard = "taiwan";
let format = "zhuyin";
let size = "m";
let units = [];
let previewUnits = [];
let selectedIndex = -1;
let timer;
const manualReadings = new Map();

setupLocaleSelector();
setupControls();
updateCounts();

if (!window.pinyinPro?.pinyin || !Z || typeof p2z !== "function") {
  setStatus("error", "error");
  document.querySelectorAll(".zhuyin-tool button, .zhuyin-tool input, .zhuyin-tool textarea").forEach((element) => {
    element.disabled = true;
  });
} else {
  setStatus("idle");
  const requested = new URLSearchParams(window.location.search).get("text");
  if (requested) {
    input.value = requested.slice(0, Z.MAX_INPUT_CHARACTERS);
    convert();
  }
  window.JianfanTraditionalPinyin?.load().then((map) => {
    if (map && input.value) convert();
  });
}

function readMessages() {
  try {
    return JSON.parse(document.querySelector("#zhuyinMessages")?.textContent || "{}");
  } catch {
    return {};
  }
}

function setupLocaleSelector() {
  const selector = $("#localeSelect");
  if (!selector) return;
  selector.addEventListener("change", () => {
    try {
      localStorage.setItem("jianfan-locale", selector.value);
      localStorage.setItem("jianfan-locale-manual", "1");
    } catch {
      // Storage can be unavailable in private windows; navigation still works.
    }
    const base = localePaths[selector.value] || "/";
    window.location.href = `${base}${pageSlug}/`.replace("//", "/") + window.location.search;
  });
}

function setupControls() {
  input.addEventListener("input", () => {
    manualReadings.clear();
    selectedIndex = -1;
    updateCounts();
    window.clearTimeout(timer);
    timer = window.setTimeout(convert, 180);
  });
  sandhi.addEventListener("change", convert);
  preserve.addEventListener("change", convert);
  standardButtons.forEach((button) => button.addEventListener("click", () => {
    standard = button.dataset.zhuyinStandard;
    activate(standardButtons, button);
    convert();
  }));
  formatButtons.forEach((button) => button.addEventListener("click", () => {
    format = button.dataset.zhuyinFormat;
    activate(formatButtons, button);
    convert();
  }));
  sizeButtons.forEach((button) => button.addEventListener("click", () => {
    size = button.dataset.zhuyinSize;
    activate(sizeButtons, button);
    preview.style.setProperty("--zhuyin-size", `${sizes[size]}px`);
  }));
  $("#zhuyinSample").addEventListener("click", (event) => {
    input.value = event.currentTarget.dataset.sample || "";
    manualReadings.clear();
    selectedIndex = -1;
    convert();
    if (!coarsePointer()) input.focus();
  });
  $("#zhuyinClear").addEventListener("click", () => {
    input.value = "";
    manualReadings.clear();
    selectedIndex = -1;
    convert();
    if (!coarsePointer()) input.focus();
  });
  $("#zhuyinConvert").addEventListener("click", convert);
  $("#zhuyinCopy").addEventListener("click", copyOutput);
  $("#zhuyinPrint").addEventListener("click", () => window.print());
  $("#zhuyinDownload").addEventListener("click", downloadImage);
  preview.addEventListener("click", (event) => {
    const cell = event.target.closest(".zhuyin-cell");
    if (!cell) return;
    selectedIndex = Number(cell.dataset.index);
    renderPreview();
    renderReadingPanel();
    if (window.matchMedia("(max-width: 860px)").matches) {
      $(".zhuyin-reading-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
  readingList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reading]");
    if (!button || selectedIndex < 0) return;
    manualReadings.set(selectedIndex, { text: units[selectedIndex]?.text, reading: button.dataset.reading });
    convert();
  });
  readingReset.addEventListener("click", () => {
    manualReadings.delete(selectedIndex);
    convert();
  });
}

// On phones, focusing the textarea after a button tap opens the keyboard over the result.
function coarsePointer() {
  return window.matchMedia?.("(pointer: coarse)").matches;
}

function activate(buttons, activeButton) {
  buttons.forEach((button) => {
    const active = button === activeButton;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-checked", String(active));
  });
}

function readItems(text) {
  const options = { type: "all", toneType: "num", toneSandhi: sandhi.checked, nonZh: "consecutive", traditional: true };
  return window.JianfanTraditionalPinyin
    ? window.JianfanTraditionalPinyin.pinyin(window.pinyinPro, text, options)
    : window.pinyinPro.pinyin(text, options);
}

function convert() {
  window.clearTimeout(timer);
  const value = input.value;
  updateCounts();
  if (!value.trim()) {
    units = [];
    output.value = "";
    renderPreview();
    renderReadingPanel();
    updateCounts();
    setStatus("idle");
    return;
  }
  if (Z.countCharacters(value) > Z.MAX_INPUT_CHARACTERS) {
    units = [];
    output.value = "";
    renderPreview();
    renderReadingPanel();
    updateCounts();
    setStatus("tooLong", "error", { limit: Z.MAX_INPUT_CHARACTERS.toLocaleString(locale) });
    return;
  }
  try {
    if (Z.isPinyinInput(value)) {
      units = [];
      const hasMarks = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/iu.test(value);
      output.value = p2z(value, { inputHasToneMarks: hasMarks });
      renderPreview();
      renderReadingPanel();
      updateCounts();
      setStatus("pinyinReady", "ready");
      return;
    }
    units = Z.buildUnits(readItems(value), { standard });
    for (const [index, manual] of manualReadings) {
      const unit = units[index];
      if (unit?.isHan && unit.text === manual.text) {
        unit.reading = manual.reading;
        unit.manual = true;
      } else {
        manualReadings.delete(index);
      }
    }
    output.value = Z.formatUnits(units, format, { p2z, convert: window.pinyinPro.convert, preserveNonChinese: preserve.checked });
    const hanUnits = units.filter((unit) => unit.isHan);
    if (selectedIndex < 0 && hanUnits.length === 1) selectedIndex = units.indexOf(hanUnits[0]);
    renderPreview();
    renderReadingPanel();
    updateCounts();
    const adjusted = hanUnits.filter((unit) => unit.adjusted).length;
    if (adjusted && standard === "taiwan") setStatus("readyAdjusted", "ready", { count: adjusted.toLocaleString(locale) });
    else setStatus("ready", "ready");
  } catch (error) {
    console.error(error);
    output.value = "";
    units = [];
    renderPreview();
    renderReadingPanel();
    updateCounts();
    setStatus("error", "error");
  }
}

function renderPreview() {
  preview.replaceChildren();
  previewUnits = [];
  let count = 0;
  for (const unit of units) {
    if (count >= Z.PREVIEW_CHARACTERS) break;
    previewUnits.push(unit);
    count += Z.countCharacters(unit.text);
  }
  const fragment = document.createDocumentFragment();
  let lastGroup = null;
  previewUnits.forEach((unit, index) => {
    if (!unit.isHan) {
      // Closing punctuation stays on the same line as the character before it.
      const [, leading = "", rest = ""] = unit.text.match(/^([，。、！？；：,.!?;:）」』》】”’…]*)([\s\S]*)$/u) || [];
      if (leading && lastGroup) lastGroup.append(Object.assign(document.createElement("span"), { className: "zhuyin-plain", textContent: leading }));
      const text = leading && lastGroup ? rest : unit.text;
      if (text) fragment.append(Object.assign(document.createElement("span"), { className: "zhuyin-plain", textContent: text }));
      lastGroup = null;
      return;
    }
    const zhuyin = Z.readingToZhuyin(unit.reading, p2z);
    const parts = Z.parseZhuyin(zhuyin);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "zhuyin-cell";
    cell.dataset.index = String(index);
    cell.classList.toggle("is-adjusted", Boolean(unit.adjusted) && !unit.manual);
    cell.classList.toggle("is-manual", Boolean(unit.manual));
    cell.classList.toggle("is-selected", index === selectedIndex);
    cell.setAttribute("aria-label", `${unit.text} ${zhuyin}`);
    const character = document.createElement("span");
    character.className = "zhuyin-char";
    character.textContent = unit.text;
    const mark = document.createElement("span");
    mark.className = "zhuyin-mark";
    mark.setAttribute("aria-hidden", "true");
    const column = document.createElement("span");
    column.className = "zhuyin-symbols";
    if (parts.neutral) column.append(Object.assign(document.createElement("span"), { className: "zhuyin-neutral", textContent: "˙" }));
    parts.symbols.forEach((symbol) => column.append(Object.assign(document.createElement("span"), { className: symbol === "ㄧ" ? "zhuyin-yi" : "", textContent: symbol })));
    const tone = document.createElement("span");
    tone.className = "zhuyin-tone";
    tone.textContent = parts.neutral ? "" : parts.tone;
    mark.append(column, tone);
    cell.append(character, mark);
    lastGroup = document.createElement("span");
    lastGroup.className = "zhuyin-group";
    lastGroup.append(cell);
    fragment.append(lastGroup);
  });
  preview.append(fragment);
  const hasPreview = previewUnits.some((unit) => unit.isHan);
  preview.hidden = !hasPreview;
  previewEmpty.hidden = hasPreview;
  previewEmpty.textContent = Z.isPinyinInput(input.value) ? messages.pinyinPreview || "" : messages.previewEmpty || "";
  previewNote.hidden = previewUnits.length >= units.length;
  $("#zhuyinPrint").disabled = !hasPreview;
  $("#zhuyinDownload").disabled = !hasPreview;
}

function renderReadingPanel() {
  const unit = units[selectedIndex];
  readingList.replaceChildren();
  if (!unit?.isHan) {
    readingEmpty.hidden = false;
    readingCharacter.hidden = true;
    readingReset.hidden = true;
    return;
  }
  readingEmpty.hidden = true;
  readingCharacter.hidden = false;
  readingCharacter.textContent = unit.text;
  for (const reading of candidateReadings(unit)) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.reading = reading;
    button.className = reading === unit.reading ? "is-active" : "";
    button.setAttribute("aria-pressed", String(reading === unit.reading));
    const zhuyin = document.createElement("strong");
    zhuyin.textContent = Z.readingToZhuyin(reading, p2z);
    const pinyin = document.createElement("small");
    pinyin.textContent = Z.readingToPinyinMark(reading, window.pinyinPro.convert);
    button.append(zhuyin, pinyin);
    if (standard === "taiwan" && unit.adjusted && reading === unit.mainland) {
      button.append(Object.assign(document.createElement("em"), { textContent: messages.mainlandTag || "" }));
    }
    readingList.append(button);
  }
  readingReset.hidden = !unit.manual;
}

function candidateReadings(unit) {
  const lookup = window.JianfanTraditionalPinyin?.simplify(unit.text) || unit.text;
  let polyphonic = [];
  try {
    polyphonic = window.pinyinPro.polyphonic(lookup, { type: "array", toneType: "num" }).flat(Infinity);
  } catch {
    polyphonic = [];
  }
  const ordered = [unit.reading, unit.mainland, ...unit.candidates, ...polyphonic].map(Z.normalizeReading);
  return [...new Set(ordered)].filter((reading) => /[1-5]$/u.test(reading) && Z.readingToZhuyin(reading, p2z));
}

async function copyOutput() {
  if (!output.value) return;
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) await navigator.clipboard.writeText(output.value);
    else copyWithSelection();
    setStatus("copied", "ready");
  } catch (error) {
    console.error(error);
    setStatus("copyFailed", "error");
  }
}

// Fallback for pages without the async clipboard (plain http): iOS Safari only copies from an
// editable field with an explicit selection range.
function copyWithSelection() {
  const wasReadOnly = output.readOnly;
  output.readOnly = false;
  output.focus({ preventScroll: true });
  output.setSelectionRange(0, output.value.length);
  const copied = document.execCommand("copy");
  output.setSelectionRange(0, 0);
  output.readOnly = wasReadOnly;
  output.blur();
  if (!copied) throw new Error("copy failed");
}

// Draws the preview as a white PNG in the same character + right-side zhuyin layout.
function downloadImage() {
  if (!previewUnits.some((unit) => unit.isHan)) return;
  const fontSize = sizes[size] * 2;
  const fontFamily = getComputedStyle(preview).fontFamily || "sans-serif";
  const markSize = Math.round(fontSize * 0.4);
  const cellWidth = Math.round(fontSize * 1.86);
  const lineHeight = Math.round(fontSize * 1.75);
  const padding = Math.round(fontSize * 0.6);
  const maxWidth = Math.round(fontSize * 1.86 * 18);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = `${fontSize}px ${fontFamily}`;

  const lines = [[]];
  let lineWidth = 0;
  for (const unit of previewUnits) {
    const pieces = unit.isHan ? [unit] : [...unit.text].map((text) => ({ text, isHan: false }));
    for (const piece of pieces) {
      if (piece.text === "\n") {
        lines.push([]);
        lineWidth = 0;
        continue;
      }
      const width = piece.isHan ? cellWidth : Math.max(context.measureText(piece.text).width, fontSize * 0.3);
      if (lineWidth + width > maxWidth && lines[lines.length - 1].length) {
        lines.push([]);
        lineWidth = 0;
      }
      lines[lines.length - 1].push({ ...piece, width });
      lineWidth += width;
    }
  }
  const widest = Math.max(...lines.map((line) => line.reduce((sum, piece) => sum + piece.width, 0)), cellWidth);
  canvas.width = Math.ceil(widest + padding * 2);
  canvas.height = Math.ceil(lines.length * lineHeight + padding * 2);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#111111";
  context.textBaseline = "middle";

  lines.forEach((line, lineIndex) => {
    let x = padding;
    const centerY = padding + lineIndex * lineHeight + lineHeight / 2;
    for (const piece of line) {
      context.font = `${fontSize}px ${fontFamily}`;
      context.textAlign = "left";
      context.fillText(piece.text, x, centerY);
      if (piece.isHan) drawZhuyin(context, piece, x + fontSize * 1.08, centerY, markSize, fontFamily);
      x += piece.width;
    }
  });

  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus("error", "error");
      return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "zhuyin.png";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    setStatus("downloaded", "ready");
  }, "image/png");
}

function drawZhuyin(context, unit, x, centerY, markSize, fontFamily) {
  const parts = Z.parseZhuyin(Z.readingToZhuyin(unit.reading, p2z));
  const rows = [...(parts.neutral ? ["˙"] : []), ...parts.symbols];
  const step = markSize * 1.02;
  const top = centerY - (rows.length * step) / 2 + step / 2;
  context.font = `${markSize}px ${fontFamily}`;
  context.textAlign = "center";
  rows.forEach((symbol, index) => {
    const symbolY = top + index * step;
    if (symbol !== "ㄧ") {
      context.fillText(symbol, x + markSize / 2, symbolY);
      return;
    }
    // Side-annotation zhuyin writes ㄧ as a vertical stroke.
    context.save();
    context.translate(x + markSize / 2, symbolY);
    context.rotate(Math.PI / 2);
    context.fillText(symbol, 0, 0);
    context.restore();
  });
  if (!parts.neutral && parts.tone) {
    const toneY = parts.symbols.length > 1 ? top + (rows.length - 1.5) * step : top;
    context.fillText(parts.tone, x + markSize * 1.15, toneY);
  }
}

function updateCounts() {
  inputCount.textContent = Z ? Z.countCharacters(input.value).toLocaleString(locale) : "0";
  outputCount.textContent = Z ? Z.countCharacters(output.value).toLocaleString(locale) : "0";
}

function setStatus(key, type = "idle", values = {}) {
  const template = messages[key] || key;
  status.classList.toggle("is-ready", type === "ready");
  status.classList.toggle("is-error", type === "error");
  status.lastElementChild.textContent = Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}
