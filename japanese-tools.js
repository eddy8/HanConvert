import OpenCC from "https://cdn.jsdelivr.net/npm/opencc-wasm@0.12.0/dist/esm/index.js";

import { filterJapaneseCharacters } from "/japanese-character-data.js";
import {
  buildThreeWayComparison,
  convertJapaneseChineseText,
  DEFAULT_THREE_WAY_COMPARISON_LIMIT
} from "/japanese-chinese-converter.js";

const localePaths = {
  "zh-CN": "/",
  "zh-TW": "/zh-tw/",
  en: "/en/",
  ja: "/ja/",
  ko: "/ko/"
};

const messages = {
  "zh-CN": {
    idle: "等待输入",
    loading: "正在加载转换组件",
    converting: "正在转换长文本",
    ready: "转换完成",
    copied: "已复制",
    copiedCount: "已复制 {count} 个字符",
    copyFailed: "无法自动复制，请手动复制",
    error: "转换失败，请缩短文本后重试",
    tooLong: "文本不能超过 300 万字符",
    noDifferences: "三种结果中没有检测到字形差异。",
    comparison: "共发现 {changes} 处差异，合并为 {pairs} 组字形。",
    comparisonTruncated: "对照表仅显示前 {limit} 组。",
    alignmentLimited: "转换后文本长度发生变化，无法可靠生成逐字对照表，三种完整结果仍可使用。"
  },
  "zh-TW": {
    idle: "等待輸入",
    loading: "正在載入轉換元件",
    converting: "正在轉換長文字",
    ready: "轉換完成",
    copied: "已複製",
    copiedCount: "已複製 {count} 個字符",
    copyFailed: "無法自動複製，請手動複製",
    error: "轉換失敗，請縮短文字後重試",
    tooLong: "文字不能超過 300 萬字符",
    noDifferences: "三種結果中沒有偵測到字形差異。",
    comparison: "共發現 {changes} 處差異，合併為 {pairs} 組字形。",
    comparisonTruncated: "對照表只顯示前 {limit} 組。",
    alignmentLimited: "轉換後文字長度發生變化，無法可靠產生逐字對照表，三種完整結果仍可使用。"
  },
  en: {
    idle: "Waiting for input",
    loading: "Loading the converter",
    converting: "Converting long text",
    ready: "Conversion complete",
    copied: "Copied",
    copiedCount: "Copied {count} characters",
    copyFailed: "Automatic copy failed. Please copy manually.",
    error: "Conversion failed. Try a shorter text.",
    tooLong: "Text is limited to 3 million characters",
    noDifferences: "No glyph differences were found in the three results.",
    comparison: "Found {changes} changes, grouped into {pairs} glyph sets.",
    comparisonTruncated: "The table shows the first {limit} sets only.",
    alignmentLimited: "The converted lengths differ, so a reliable character-by-character table cannot be shown. All three full results remain available."
  },
  ja: {
    idle: "入力待ち",
    loading: "変換機能を読み込み中",
    converting: "長いテキストを変換中",
    ready: "変換完了",
    copied: "コピーしました",
    copiedCount: "{count} 文字をコピーしました",
    copyFailed: "自動コピーに失敗しました。手動でコピーしてください。",
    error: "変換に失敗しました。テキストを短くして再試行してください。",
    tooLong: "テキストは300万文字までです",
    noDifferences: "3つの結果に字形の違いは見つかりませんでした。",
    comparison: "{changes} 箇所の違いを {pairs} 組の字形にまとめました。",
    comparisonTruncated: "対応表は先頭 {limit} 組のみ表示しています。",
    alignmentLimited: "変換後の文字数が異なるため、正確な1文字単位の対応表は表示できません。3つの変換結果はそのまま利用できます。"
  },
  ko: {
    idle: "입력 대기",
    loading: "변환 기능 불러오는 중",
    converting: "긴 텍스트 변환 중",
    ready: "변환 완료",
    copied: "복사했습니다",
    copiedCount: "{count}개 문자를 복사했습니다",
    copyFailed: "자동 복사에 실패했습니다. 직접 복사해 주세요.",
    error: "변환에 실패했습니다. 텍스트를 줄여 다시 시도하세요.",
    tooLong: "텍스트는 300만 자까지 입력할 수 있습니다",
    noDifferences: "세 결과에서 글자 모양 차이를 찾지 못했습니다.",
    comparison: "{changes}곳의 차이를 {pairs}개 글자 조합으로 정리했습니다.",
    comparisonTruncated: "대조표에는 처음 {limit}개 조합만 표시합니다.",
    alignmentLimited: "변환 후 글자 수가 달라 문자별 대조표를 정확히 만들 수 없습니다. 세 가지 전체 결과는 그대로 사용할 수 있습니다."
  }
};

const MAX_INPUT_CHARACTERS = 3_000_000;
const CONVERSION_CHUNK_SIZE = 16_000;
const CHUNK_BREAKPOINTS = ["\n", "。", "！", "？", ".", "!", "?", "；", ";", "，", ",", " "];
const converterCache = new Map();
const locale = document.body.dataset.locale || "zh-CN";
const pageSlug = document.body.dataset.pageSlug || "";
const toolPage = document.body.dataset.toolPage;
const status = document.querySelector("#toolStatus");

setupLocaleSelector();

if (toolPage === "kanji-converter") setupKanjiConverter();
if (toolPage === "character-copy") setupCharacterCopy();

function setupLocaleSelector() {
  const selector = document.querySelector("#localeSelect");
  if (!selector) return;
  selector.addEventListener("change", () => {
    const nextLocale = selector.value;
    localStorage.setItem("jianfan-locale", nextLocale);
    localStorage.setItem("jianfan-locale-manual", "1");
    const base = localePaths[nextLocale] || "/";
    const query = window.location.search;
    window.location.href = `${base}${pageSlug}/`.replace("//", "/") + query;
  });
}

function setupKanjiConverter() {
  const input = document.querySelector("#tripleInput");
  const inputCount = document.querySelector("#tripleInputCount");
  const outputFields = Object.fromEntries(["japanese", "simplified", "traditional"].map((id) => [id, document.querySelector(`#${id}Output`)]));
  const outputCounts = Object.fromEntries(["japanese", "simplified", "traditional"].map((id) => [id, document.querySelector(`#${id}OutputCount`)]));
  const sourceButtons = [...document.querySelectorAll("[data-source-type]")];
  let sourceType = "japanese";
  let timer;
  let conversionToken = 0;

  setStatus("idle");
  updateCounts();

  sourceButtons.forEach((button) => button.addEventListener("click", () => {
    sourceType = button.dataset.sourceType;
    sourceButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-checked", String(active));
    });
    scheduleConversion(0);
  }));

  input.addEventListener("input", () => {
    updateCounts();
    scheduleConversion(260);
  });
  document.querySelector("#tripleConvert").addEventListener("click", () => scheduleConversion(0));
  document.querySelector("#tripleClear").addEventListener("click", () => {
    conversionToken += 1;
    input.value = "";
    Object.values(outputFields).forEach((field) => { field.value = ""; });
    clearComparison();
    updateCounts();
    setStatus("idle");
    input.focus();
  });
  document.querySelector("#tripleSample").addEventListener("click", (event) => {
    input.value = event.currentTarget.dataset.sample || "";
    updateCounts();
    scheduleConversion(0);
  });
  document.querySelectorAll("[data-copy-output]").forEach((button) => button.addEventListener("click", async () => {
    const value = outputFields[button.dataset.copyOutput].value;
    if (value) await copyText(value);
  }));

  function scheduleConversion(delay) {
    window.clearTimeout(timer);
    timer = window.setTimeout(convert, delay);
  }

  async function convert() {
    const value = input.value;
    const token = ++conversionToken;
    if (!value) {
      Object.values(outputFields).forEach((field) => { field.value = ""; });
      clearComparison();
      updateCounts();
      setStatus("idle");
      return;
    }
    if (value.length > MAX_INPUT_CHARACTERS) {
      Object.values(outputFields).forEach((field) => { field.value = ""; });
      clearComparison();
      updateCounts();
      setStatus("tooLong", "error");
      return;
    }

    setStatus("loading");
    try {
      const results = await convertJapaneseChineseText(value, sourceType, (config, text) => (
        convertInChunks(config, text, token, () => conversionToken)
      ));
      if (token !== conversionToken) return;
      for (const [id, result] of Object.entries(results)) outputFields[id].value = result;
      updateCounts();
      renderComparison(buildThreeWayComparison(results));
      setStatus("ready", "ready");
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error(error);
      setStatus("error", "error");
    }
  }

  function updateCounts() {
    inputCount.textContent = input.value.length.toLocaleString(locale);
    for (const id of Object.keys(outputFields)) outputCounts[id].textContent = outputFields[id].value.length.toLocaleString(locale);
  }
}

async function convertInChunks(config, value, token, getActiveToken) {
  const converter = await getConverter(config);
  const chunks = splitText(value);
  if (chunks.length > 1) setStatus("converting");
  const output = [];
  for (const chunk of chunks) {
    if (token !== getActiveToken()) throw new DOMException("Conversion superseded", "AbortError");
    output.push(await converter(chunk));
    if (chunks.length > 1) await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
  return output.join("");
}

async function getConverter(config) {
  if (!converterCache.has(config)) converterCache.set(config, OpenCC.Converter({ config }));
  return converterCache.get(config);
}

function splitText(value) {
  if (value.length <= CONVERSION_CHUNK_SIZE) return [value];
  const chunks = [];
  let start = 0;
  while (start < value.length) {
    let end = Math.min(start + CONVERSION_CHUNK_SIZE, value.length);
    if (end < value.length) {
      const minEnd = start + Math.floor(CONVERSION_CHUNK_SIZE * 0.65);
      const area = value.slice(minEnd, end);
      const relativeBoundary = Math.max(...CHUNK_BREAKPOINTS.map((breakpoint) => area.lastIndexOf(breakpoint)));
      if (relativeBoundary >= 0) end = minEnd + relativeBoundary + 1;
      else {
        const previousCode = value.charCodeAt(end - 1);
        if (previousCode >= 0xd800 && previousCode <= 0xdbff) end -= 1;
      }
    }
    chunks.push(value.slice(start, end));
    start = end;
  }
  return chunks;
}

function renderComparison(comparison) {
  const empty = document.querySelector("#tripleComparisonEmpty");
  const wrap = document.querySelector("#tripleComparisonTableWrap");
  const body = document.querySelector("#tripleComparisonBody");
  const summary = document.querySelector("#tripleComparisonSummary");
  body.replaceChildren();

  if (comparison.alignmentLimited) {
    empty.textContent = message("alignmentLimited");
    empty.hidden = false;
    wrap.hidden = true;
    summary.textContent = "";
    return;
  }
  if (!comparison.totalChanges) {
    empty.textContent = message("noDifferences");
    empty.hidden = false;
    wrap.hidden = true;
    summary.textContent = "";
    return;
  }

  for (const item of comparison.rows) {
    const row = document.createElement("tr");
    for (const key of ["japanese", "simplified", "traditional", "count"]) {
      const cell = document.createElement("td");
      cell.textContent = key === "count" ? item[key].toLocaleString(locale) : item[key] || "–";
      if (key !== "count") cell.className = "japanese-comparison-glyph";
      row.append(cell);
    }
    body.append(row);
  }
  const baseSummary = formatMessage("comparison", {
    changes: comparison.totalChanges.toLocaleString(locale),
    pairs: comparison.uniqueChanges.toLocaleString(locale)
  });
  summary.textContent = comparison.truncated
    ? `${baseSummary} ${formatMessage("comparisonTruncated", { limit: DEFAULT_THREE_WAY_COMPARISON_LIMIT.toLocaleString(locale) })}`
    : baseSummary;
  empty.hidden = true;
  wrap.hidden = false;
}

function clearComparison() {
  document.querySelector("#tripleComparisonSummary").textContent = "";
  document.querySelector("#tripleComparisonBody").replaceChildren();
  document.querySelector("#tripleComparisonTableWrap").hidden = true;
  document.querySelector("#tripleComparisonEmpty").hidden = false;
}

function setupCharacterCopy() {
  const search = document.querySelector("#characterSearch");
  const buttons = [...document.querySelectorAll(".japanese-character-button")];
  const filters = [...document.querySelectorAll("[data-category-filter]")];
  const resultCount = document.querySelector("#characterResultCount");
  const template = resultCount.dataset.template;
  const recent = [];
  let activeCategory = "all";

  setStatus("idle");
  applyFilters();
  search.addEventListener("input", applyFilters);
  filters.forEach((button) => button.addEventListener("click", () => {
    activeCategory = button.dataset.categoryFilter;
    filters.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-selected", String(active));
    });
    applyFilters();
  }));
  buttons.forEach((button) => button.addEventListener("click", async () => {
    const character = button.dataset.character;
    if (await copyText(character)) addRecent(character);
  }));
  document.querySelector("#copyVisibleCharacters").addEventListener("click", async () => {
    const value = buttons.filter((button) => !button.hidden).map((button) => button.dataset.character).join("");
    if (value && await writeClipboard(value)) setStatus("copiedCount", "ready", { count: [...value].length.toLocaleString(locale) });
  });

  function applyFilters() {
    const searchableEntries = buttons
      .filter((button) => activeCategory === "all" || button.dataset.category === activeCategory)
      .map((button) => ({ character: button.dataset.character, reading: button.dataset.reading }));
    const matches = new Set(filterJapaneseCharacters(searchableEntries, search.value).map((entry) => `${entry.character}\u0000${entry.reading}`));
    let count = 0;
    buttons.forEach((button) => {
      const categoryMatches = activeCategory === "all" || button.dataset.category === activeCategory;
      const searchMatches = matches.has(`${button.dataset.character}\u0000${button.dataset.reading}`);
      button.hidden = !(categoryMatches && searchMatches);
      if (!button.hidden) count += 1;
    });
    resultCount.textContent = template.replace("{count}", count.toLocaleString(locale));
  }

  function addRecent(character) {
    const existing = recent.indexOf(character);
    if (existing >= 0) recent.splice(existing, 1);
    recent.unshift(character);
    recent.splice(12);
    const list = document.querySelector("#recentCharacterList");
    list.replaceChildren();
    for (const item of recent) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item;
      button.addEventListener("click", () => copyText(item));
      list.append(button);
    }
    document.querySelector("#recentCharactersEmpty").hidden = recent.length > 0;
  }
}

async function copyText(value) {
  if (!value) return false;
  if (await writeClipboard(value)) {
    setStatus("copied", "ready");
    return true;
  }
  setStatus("copyFailed", "error");
  return false;
}

async function writeClipboard(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    textarea.remove();
    return success;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function setStatus(key, type = "idle", values = {}) {
  if (!status) return;
  status.classList.toggle("is-ready", type === "ready");
  status.classList.toggle("is-error", type === "error");
  status.lastElementChild.textContent = formatMessage(key, values);
}

function message(key) {
  return messages[locale]?.[key] || messages["zh-CN"][key] || key;
}

function formatMessage(key, values = {}) {
  return Object.entries(values).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, value), message(key));
}
