(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ImageRedactionCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;
  const MAX_IMAGE_PIXELS = 24_000_000;
  const MAX_IMAGE_EDGE = 6000;
  const EMAIL_PATTERN = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/giu;
  const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>{}\[\]"']+/giu;
  const IPV4_PATTERN = /\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/gu;
  const CN_ID_PATTERN = /\b\d{6}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/gu;
  const KR_ID_PATTERN = /\b\d{6}[\s-]?[1-8]\d{6}\b/gu;
  const SECRET_PATTERN = /\b(?:sk-[A-Za-z0-9_-]{12,}|gh[opusr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16}|Bearer\s+[A-Za-z0-9._~+\/-]+=*)\b/giu;
  const NUMBER_PATTERN = /(?:\+?\d[\d\s().-]{5,}\d)/gu;
  const CN_PLATE_PATTERN = /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}/gu;
  const KR_PLATE_PATTERN = /\b\d{2,3}[가-힣]\s?\d{4}\b/gu;
  const PERSONAL_KEYWORD_PATTERN = /(?:full\s*name|name|address|passport|account|phone|mobile|tel(?:ephone)?|e-?mail|身份证|身分證|证件号|證件號|护照|護照|姓名|住址|地址|手机号|手機號|电话|電話|邮箱|郵箱|电子邮件|電子郵件|银行卡|銀行卡|账号|帳號|氏名|住所|電話番号|携帯|メール|パスポート|口座|이름|성명|주소|전화번호|휴대폰|이메일|여권|계좌|주민등록)/iu;
  const PHONE_CONTEXT_PATTERN = /(?:phone|mobile|tel(?:ephone)?|手机号|手機號|电话|電話|電話番号|携帯|전화번호|휴대폰)/iu;

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function normalizeRect(x, y, width, height) {
    const left = clamp(Math.min(x, x + width), 0, 1);
    const top = clamp(Math.min(y, y + height), 0, 1);
    const right = clamp(Math.max(x, x + width), 0, 1);
    const bottom = clamp(Math.max(y, y + height), 0, 1);
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
  }

  function expandRect(rect, horizontalPadding = 0, verticalPadding = horizontalPadding) {
    return normalizeRect(
      rect.x - horizontalPadding,
      rect.y - verticalPadding,
      rect.width + horizontalPadding * 2,
      rect.height + verticalPadding * 2
    );
  }

  function unionRects(rectangles) {
    if (!rectangles.length) return null;
    const x0 = Math.min(...rectangles.map((rect) => rect.x));
    const y0 = Math.min(...rectangles.map((rect) => rect.y));
    const x1 = Math.max(...rectangles.map((rect) => rect.x + rect.width));
    const y1 = Math.max(...rectangles.map((rect) => rect.y + rect.height));
    return normalizeRect(x0, y0, x1 - x0, y1 - y0);
  }

  function intersectionArea(left, right) {
    const width = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
    const height = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
    return width * height;
  }

  function rectArea(rect) {
    return Math.max(0, rect.width) * Math.max(0, rect.height);
  }

  function intersectionOverUnion(left, right) {
    const intersection = intersectionArea(left, right);
    const union = rectArea(left) + rectArea(right) - intersection;
    return union > 0 ? intersection / union : 0;
  }

  function isLuhnValid(value) {
    const digits = String(value || "").replace(/\D/gu, "");
    if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/u.test(digits)) return false;
    let sum = 0;
    let doubleDigit = false;
    for (let index = digits.length - 1; index >= 0; index -= 1) {
      let digit = Number(digits[index]);
      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      doubleDigit = !doubleDigit;
    }
    return sum % 10 === 0;
  }

  function patternMatches(pattern, value) {
    pattern.lastIndex = 0;
    const matches = pattern.test(value);
    pattern.lastIndex = 0;
    return matches;
  }

  function classifySensitiveText(value, context = "") {
    const text = String(value || "").trim();
    const line = String(context || text);
    if (!text) return null;
    if (patternMatches(EMAIL_PATTERN, text)) return "email";
    if (patternMatches(URL_PATTERN, text)) return "url";
    if (patternMatches(IPV4_PATTERN, text)) return "network";
    if (patternMatches(SECRET_PATTERN, text)) return "secret";
    if (patternMatches(CN_ID_PATTERN, text) || patternMatches(KR_ID_PATTERN, text)) return "id";
    if (patternMatches(CN_PLATE_PATTERN, text) || patternMatches(KR_PLATE_PATTERN, text)) return "plate";

    const digits = text.replace(/\D/gu, "");
    if (isLuhnValid(digits)) return "card";
    const looksLikeRegionalMobile = /^(?:1[3-9]\d{9}|01[016789]\d{7,8}|0[789]0\d{8})$/u.test(digits);
    const hasPhoneFormatting = /[+().\s-]/u.test(text);
    if (digits.length >= 7 && digits.length <= 15 && (looksLikeRegionalMobile || hasPhoneFormatting || PHONE_CONTEXT_PATTERN.test(line))) {
      return "phone";
    }
    return null;
  }

  function bboxToRect(bbox, imageWidth, imageHeight) {
    if (!bbox || !imageWidth || !imageHeight) return null;
    return normalizeRect(
      Number(bbox.x0) / imageWidth,
      Number(bbox.y0) / imageHeight,
      (Number(bbox.x1) - Number(bbox.x0)) / imageWidth,
      (Number(bbox.y1) - Number(bbox.y0)) / imageHeight
    );
  }

  function extractOcrLines(data) {
    const blockLines = (data?.blocks || []).flatMap((block) =>
      (block.paragraphs || []).flatMap((paragraph) => paragraph.lines || [])
    ).map((line) => ({
      text: line.text || "",
      words: (line.words || []).map((word) => ({ text: word.text || "", bbox: word.bbox, confidence: word.confidence || 0 }))
    })).filter((line) => line.words.length);
    if (blockLines.length) return blockLines;
    if (!data?.tsv) return [];

    const groups = new Map();
    const rows = String(data.tsv).split(/\r?\n/u).slice(1);
    for (const row of rows) {
      const columns = row.split("\t");
      if (columns.length < 12 || columns[0] !== "5" || !columns[11]?.trim()) continue;
      const key = columns.slice(1, 5).join(":");
      const left = Number(columns[6]);
      const top = Number(columns[7]);
      const width = Number(columns[8]);
      const height = Number(columns[9]);
      const word = {
        text: columns.slice(11).join("\t").trim(),
        confidence: Number(columns[10]),
        bbox: { x0: left, y0: top, x1: left + width, y1: top + height }
      };
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(word);
    }
    return Array.from(groups.values(), (words) => ({ text: words.map((word) => word.text).join(" "), words }));
  }

  function collectLineMatches(line, imageWidth, imageHeight) {
    const words = line.words.filter((word) => word.text && word.bbox);
    if (!words.length) return [];
    let text = "";
    const spans = [];
    for (const word of words) {
      if (text) text += " ";
      const start = text.length;
      text += word.text;
      spans.push({ start, end: text.length, word });
    }

    const matches = [];
    const patternCategories = [
      [EMAIL_PATTERN, "email"], [URL_PATTERN, "url"], [IPV4_PATTERN, "network"],
      [SECRET_PATTERN, "secret"], [CN_ID_PATTERN, "id"], [KR_ID_PATTERN, "id"],
      [CN_PLATE_PATTERN, "plate"], [KR_PLATE_PATTERN, "plate"], [NUMBER_PATTERN, null]
    ];
    for (const [pattern, fixedCategory] of patternCategories) {
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        const category = fixedCategory || classifySensitiveText(match[0], text);
        if (!category) continue;
        const end = match.index + match[0].length;
        const matchedWords = spans.filter((span) => span.end > match.index && span.start < end).map((span) => span.word);
        const rect = unionRects(matchedWords.map((word) => bboxToRect(word.bbox, imageWidth, imageHeight)).filter(Boolean));
        if (rect) matches.push({ category, text: match[0], rect: expandRect(rect, 0.006, 0.009), confidence: "high" });
      }
      pattern.lastIndex = 0;
    }

    if (!matches.length && PERSONAL_KEYWORD_PATTERN.test(text)) {
      const rect = unionRects(words.map((word) => bboxToRect(word.bbox, imageWidth, imageHeight)).filter(Boolean));
      if (rect) matches.push({ category: "personal", text, rect: expandRect(rect, 0.008, 0.012), confidence: "medium" });
    }
    return matches;
  }

  function dedupeRegions(regions) {
    const result = [];
    const confidenceOrder = { high: 2, medium: 1 };
    const sorted = [...regions].sort((left, right) => (confidenceOrder[right.confidence] || 0) - (confidenceOrder[left.confidence] || 0));
    for (const region of sorted) {
      const duplicate = result.some((existing) => {
        if (existing.category !== region.category) return false;
        const overlap = intersectionArea(existing.rect, region.rect);
        const smaller = Math.min(rectArea(existing.rect), rectArea(region.rect));
        return intersectionOverUnion(existing.rect, region.rect) > 0.45 || (smaller > 0 && overlap / smaller > 0.82);
      });
      if (!duplicate) result.push(region);
    }
    return result;
  }

  function detectSensitiveTextRegions(data, imageWidth, imageHeight) {
    const lines = extractOcrLines(data);
    return dedupeRegions(lines.flatMap((line) => collectLineMatches(line, imageWidth, imageHeight)));
  }

  function calculateOutputSize(width, height) {
    const edgeScale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height));
    const pixelScale = Math.min(1, Math.sqrt(MAX_IMAGE_PIXELS / Math.max(1, width * height)));
    const scale = Math.min(edgeScale, pixelScale);
    return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)), scale };
  }

  return {
    MAX_FILE_SIZE_BYTES,
    MAX_IMAGE_EDGE,
    MAX_IMAGE_PIXELS,
    calculateOutputSize,
    classifySensitiveText,
    detectSensitiveTextRegions,
    expandRect,
    extractOcrLines,
    intersectionOverUnion,
    isLuhnValid,
    normalizeRect,
    unionRects
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;
  const body = document.body;
  const core = globalThis.ImageRedactionCore;
  if (!core || body?.dataset.toolPage !== "image-redaction") return;

  const messages = JSON.parse(document.querySelector("#imageRedactionMessages")?.textContent || "{}");
  const elements = {
    locale: document.querySelector("#localeSelect"), file: document.querySelector("#redactionFileInput"), drop: document.querySelector("#redactionDropZone"),
    sample: document.querySelector("#redactionSample"), workspace: document.querySelector("#redactionWorkspace"), canvasFrame: document.querySelector("#redactionCanvasFrame"),
    canvas: document.querySelector("#redactionCanvas"), status: document.querySelector("#redactionStatus"), fileName: document.querySelector("#redactionFileName"),
    fileMeta: document.querySelector("#redactionFileMeta"), effectButtons: document.querySelectorAll("[data-redaction-effect]"), colorButtons: document.querySelectorAll("[data-redaction-color]"),
    intensity: document.querySelector("#redactionIntensity"), intensityValue: document.querySelector("#redactionIntensityValue"), undo: document.querySelector("#redactionUndo"),
    redo: document.querySelector("#redactionRedo"), remove: document.querySelector("#redactionRemove"), compare: document.querySelector("#redactionCompare"),
    zoomOut: document.querySelector("#redactionZoomOut"), zoomIn: document.querySelector("#redactionZoomIn"), zoomValue: document.querySelector("#redactionZoomValue"),
    faceScan: document.querySelector("#redactionFaceScan"), textScan: document.querySelector("#redactionTextScan"), ocrLanguage: document.querySelector("#redactionOcrLanguage"),
    aiRun: document.querySelector("#redactionAiRun"), aiProgress: document.querySelector("#redactionAiProgress"), aiProgressBar: document.querySelector("#redactionAiProgressBar"),
    aiProgressText: document.querySelector("#redactionAiProgressText"), suggestions: document.querySelector("#redactionSuggestions"), suggestionsEmpty: document.querySelector("#redactionSuggestionsEmpty"),
    applySuggestions: document.querySelector("#redactionApplySuggestions"), clearSuggestions: document.querySelector("#redactionClearSuggestions"),
    exportFormat: document.querySelector("#redactionExportFormat"), exportQuality: document.querySelector("#redactionExportQuality"), exportQualityRow: document.querySelector("#redactionExportQualityRow"),
    exportQualityValue: document.querySelector("#redactionExportQualityValue"), download: document.querySelector("#redactionDownload"), reset: document.querySelector("#redactionReset"),
    dialog: document.querySelector("#redactionDialog"), dialogMessage: document.querySelector("#redactionDialogMessage")
  };
  if (!elements.canvas) return;

  const context = elements.canvas.getContext("2d");
  const state = {
    source: document.createElement("canvas"), previewSource: document.createElement("canvas"), regions: [], suggestions: [], history: [], future: [],
    selectedId: null, effect: "solid", color: "#07120f", strength: 52, showOriginal: false, zoom: 1, fitScale: 1,
    fileName: "image", interaction: null, draft: null, nextId: 1, aiBusy: false, faceDetector: null, ocrWorker: null, ocrWorkerLanguage: "",
    sliderSnapshot: null
  };

  function text(template, values = {}) {
    return Object.entries(values).reduce((output, [key, value]) => output.replaceAll(`{${key}}`, String(value)), template || "");
  }

  function setStatus(message, mode = "") {
    elements.status.querySelector("span:last-child").textContent = message;
    elements.status.dataset.mode = mode;
  }

  function showError(message) {
    elements.dialogMessage.textContent = message;
    if (typeof elements.dialog.showModal === "function") elements.dialog.showModal();
    else window.alert(message);
  }

  function cloneRegions(regions = state.regions) {
    return regions.map((region) => ({ ...region, rect: { ...region.rect } }));
  }

  function updateHistoryButtons() {
    elements.undo.disabled = state.history.length === 0;
    elements.redo.disabled = state.future.length === 0;
    elements.remove.disabled = !state.selectedId;
  }

  function commitRegions(mutator) {
    state.history.push(cloneRegions());
    if (state.history.length > 60) state.history.shift();
    state.future = [];
    mutator();
    updateHistoryButtons();
    render();
  }

  function selectedRegion() {
    return state.regions.find((region) => region.id === state.selectedId) || null;
  }

  function setActiveEffect(effect, updateSelection = true) {
    state.effect = effect;
    elements.effectButtons.forEach((button) => {
      const active = button.dataset.redactionEffect === effect;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
    const region = selectedRegion();
    if (updateSelection && region && region.effect !== effect) {
      commitRegions(() => { region.effect = effect; });
    }
  }

  function setActiveColor(color, updateSelection = true) {
    state.color = color;
    elements.colorButtons.forEach((button) => {
      const active = button.dataset.redactionColor === color;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const region = selectedRegion();
    if (updateSelection && region?.effect === "solid" && region.color !== color) {
      commitRegions(() => { region.color = color; });
    }
  }

  function syncControlsFromSelection() {
    const region = selectedRegion();
    if (!region) return;
    state.effect = region.effect;
    state.color = region.color;
    state.strength = region.strength;
    elements.intensity.value = String(region.strength);
    elements.intensityValue.textContent = String(region.strength);
    setActiveEffect(region.effect, false);
    setActiveColor(region.color, false);
  }

  function createPreviewSource() {
    const maxWidth = 1600;
    const maxHeight = 1100;
    const scale = Math.min(1, maxWidth / state.source.width, maxHeight / state.source.height);
    state.previewSource.width = Math.max(1, Math.round(state.source.width * scale));
    state.previewSource.height = Math.max(1, Math.round(state.source.height * scale));
    state.previewSource.getContext("2d").drawImage(state.source, 0, 0, state.previewSource.width, state.previewSource.height);
    elements.canvas.width = state.previewSource.width;
    elements.canvas.height = state.previewSource.height;
    updateCanvasSize();
  }

  function updateCanvasSize() {
    if (!elements.canvas.width) return;
    const availableWidth = Math.max(280, elements.canvasFrame.clientWidth - 28);
    const availableHeight = Math.max(260, Math.min(window.innerHeight - 250, 760));
    state.fitScale = Math.min(1, availableWidth / elements.canvas.width, availableHeight / elements.canvas.height);
    elements.canvas.style.width = `${Math.round(elements.canvas.width * state.fitScale * state.zoom)}px`;
    elements.canvas.style.height = `${Math.round(elements.canvas.height * state.fitScale * state.zoom)}px`;
    elements.zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function effectStrength(region, width, height) {
    const base = Math.min(width, height);
    if (region.effect === "blur") return Math.max(3, Math.round(base * (0.003 + region.strength * 0.00012)));
    return Math.max(5, Math.round(base * (0.004 + region.strength * 0.00018)));
  }

  function captureRegion(ctx, x, y, width, height) {
    const snapshot = document.createElement("canvas");
    snapshot.width = width;
    snapshot.height = height;
    snapshot.getContext("2d").drawImage(ctx.canvas, x, y, width, height, 0, 0, width, height);
    return snapshot;
  }

  function applyRegion(ctx, region, width, height) {
    const x = Math.round(region.rect.x * width);
    const y = Math.round(region.rect.y * height);
    const w = Math.max(1, Math.round(region.rect.width * width));
    const h = Math.max(1, Math.round(region.rect.height * height));
    if (region.effect === "solid") {
      ctx.fillStyle = region.color || "#07120f";
      ctx.fillRect(x, y, w, h);
      return;
    }
    if (region.effect === "blur") {
      const radius = effectStrength(region, width, height);
      const snapshot = captureRegion(ctx, x, y, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.filter = `blur(${radius}px)`;
      ctx.drawImage(snapshot, x, y, w, h);
      ctx.restore();
      return;
    }
    const blockSize = effectStrength(region, width, height);
    const snapshot = captureRegion(ctx, x, y, w, h);
    const pixelCanvas = document.createElement("canvas");
    pixelCanvas.width = Math.max(1, Math.ceil(w / blockSize));
    pixelCanvas.height = Math.max(1, Math.ceil(h / blockSize));
    const pixelContext = pixelCanvas.getContext("2d");
    pixelContext.imageSmoothingEnabled = true;
    pixelContext.drawImage(snapshot, 0, 0, w, h, 0, 0, pixelCanvas.width, pixelCanvas.height);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pixelCanvas, 0, 0, pixelCanvas.width, pixelCanvas.height, x, y, w, h);
    ctx.restore();
  }

  function drawRegionOutline(ctx, region, width, height, selected) {
    const x = region.rect.x * width;
    const y = region.rect.y * height;
    const w = region.rect.width * width;
    const h = region.rect.height * height;
    ctx.save();
    ctx.strokeStyle = selected ? "#ffcc66" : "rgba(127, 255, 210, 0.74)";
    ctx.lineWidth = selected ? 3 : 1.5;
    ctx.setLineDash(selected ? [] : [7, 5]);
    ctx.strokeRect(x, y, w, h);
    if (selected) {
      ctx.fillStyle = "#ffcc66";
      for (const [hx, hy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
        ctx.fillRect(hx - 5, hy - 5, 10, 10);
      }
    }
    ctx.restore();
  }

  function renderToCanvas(canvas, source, regions, includeGuides = false, background = "") {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(source, 0, 0, width, height);
    if (!state.showOriginal || !includeGuides) {
      for (const region of regions) applyRegion(ctx, region, width, height);
    }
    if (!includeGuides) return;
    for (const region of regions) drawRegionOutline(ctx, region, width, height, region.id === state.selectedId);
    for (const suggestion of state.suggestions) {
      const rect = suggestion.rect;
      ctx.save();
      ctx.fillStyle = "rgba(255, 204, 102, 0.12)";
      ctx.strokeStyle = "#ffcc66";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 6]);
      ctx.fillRect(rect.x * width, rect.y * height, rect.width * width, rect.height * height);
      ctx.strokeRect(rect.x * width, rect.y * height, rect.width * width, rect.height * height);
      ctx.restore();
    }
    if (state.draft) drawRegionOutline(ctx, { rect: state.draft }, width, height, true);
  }

  function render() {
    if (!state.previewSource.width) return;
    renderToCanvas(elements.canvas, state.previewSource, state.regions, true);
    elements.compare.classList.toggle("is-active", state.showOriginal);
    elements.compare.setAttribute("aria-pressed", String(state.showOriginal));
  }

  function pointFromEvent(event) {
    const bounds = elements.canvas.getBoundingClientRect();
    return {
      x: core.normalizeRect((event.clientX - bounds.left) / bounds.width, 0, 0, 0).x,
      y: core.normalizeRect(0, (event.clientY - bounds.top) / bounds.height, 0, 0).y
    };
  }

  function hitHandle(point, region) {
    const bounds = elements.canvas.getBoundingClientRect();
    const toleranceX = 14 / bounds.width;
    const toleranceY = 14 / bounds.height;
    const corners = {
      nw: [region.rect.x, region.rect.y], ne: [region.rect.x + region.rect.width, region.rect.y],
      sw: [region.rect.x, region.rect.y + region.rect.height], se: [region.rect.x + region.rect.width, region.rect.y + region.rect.height]
    };
    return Object.entries(corners).find(([, [x, y]]) => Math.abs(point.x - x) <= toleranceX && Math.abs(point.y - y) <= toleranceY)?.[0] || "";
  }

  function hitRegion(point) {
    return [...state.regions].reverse().find((region) => point.x >= region.rect.x && point.x <= region.rect.x + region.rect.width && point.y >= region.rect.y && point.y <= region.rect.y + region.rect.height) || null;
  }

  function pointerDown(event) {
    if (!state.previewSource.width || event.button > 0) return;
    event.preventDefault();
    elements.canvas.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    const selected = selectedRegion();
    const handle = selected ? hitHandle(point, selected) : "";
    if (handle) {
      state.interaction = { type: "resize", handle, start: point, before: cloneRegions(), original: { ...selected.rect } };
      return;
    }
    const hit = hitRegion(point);
    if (hit) {
      state.selectedId = hit.id;
      syncControlsFromSelection();
      updateHistoryButtons();
      state.interaction = { type: "move", start: point, before: cloneRegions(), original: { ...hit.rect } };
      render();
      return;
    }
    state.selectedId = null;
    state.interaction = { type: "draw", start: point };
    state.draft = core.normalizeRect(point.x, point.y, 0, 0);
    updateHistoryButtons();
    render();
  }

  function pointerMove(event) {
    if (!state.interaction) return;
    const point = pointFromEvent(event);
    const action = state.interaction;
    if (action.type === "draw") {
      state.draft = core.normalizeRect(action.start.x, action.start.y, point.x - action.start.x, point.y - action.start.y);
      render();
      return;
    }
    const region = selectedRegion();
    if (!region) return;
    if (action.type === "move") {
      region.rect.x = Math.min(1 - action.original.width, Math.max(0, action.original.x + point.x - action.start.x));
      region.rect.y = Math.min(1 - action.original.height, Math.max(0, action.original.y + point.y - action.start.y));
    } else {
      const original = action.original;
      const anchors = {
        nw: [original.x + original.width, original.y + original.height], ne: [original.x, original.y + original.height],
        sw: [original.x + original.width, original.y], se: [original.x, original.y]
      };
      const [anchorX, anchorY] = anchors[action.handle];
      region.rect = core.normalizeRect(anchorX, anchorY, point.x - anchorX, point.y - anchorY);
    }
    render();
  }

  function pointerUp(event) {
    if (!state.interaction) return;
    const action = state.interaction;
    if (elements.canvas.hasPointerCapture(event.pointerId)) elements.canvas.releasePointerCapture(event.pointerId);
    if (action.type === "draw") {
      const draft = state.draft;
      state.draft = null;
      if (draft && draft.width >= 0.008 && draft.height >= 0.008) {
        commitRegions(() => {
          const region = { id: `region-${state.nextId++}`, rect: draft, effect: state.effect, strength: state.strength, color: state.color, source: "manual" };
          state.regions.push(region);
          state.selectedId = region.id;
        });
      }
    } else if (JSON.stringify(action.before) !== JSON.stringify(state.regions)) {
      state.history.push(action.before);
      state.future = [];
      updateHistoryButtons();
    }
    state.interaction = null;
    render();
  }

  function removeSelected() {
    if (!selectedRegion()) return;
    commitRegions(() => {
      state.regions = state.regions.filter((region) => region.id !== state.selectedId);
      state.selectedId = null;
    });
  }

  function undo() {
    if (!state.history.length) return;
    state.future.push(cloneRegions());
    state.regions = state.history.pop();
    if (!selectedRegion()) state.selectedId = null;
    updateHistoryButtons();
    render();
  }

  function redo() {
    if (!state.future.length) return;
    state.history.push(cloneRegions());
    state.regions = state.future.pop();
    if (!selectedRegion()) state.selectedId = null;
    updateHistoryButtons();
    render();
  }

  async function decodeFile(file) {
    if (!file?.type.startsWith("image/")) throw new Error(messages.invalidFile);
    if (file.size > core.MAX_FILE_SIZE_BYTES) throw new Error(messages.fileTooLarge);
    let bitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      bitmap = await createImageBitmap(file);
    }
    const output = core.calculateOutputSize(bitmap.width, bitmap.height);
    state.source.width = output.width;
    state.source.height = output.height;
    state.source.getContext("2d").drawImage(bitmap, 0, 0, output.width, output.height);
    bitmap.close();
    return output;
  }

  async function loadFile(file) {
    try {
      setStatus(messages.loading);
      const output = await decodeFile(file);
      state.fileName = (file.name || "image").replace(/\.[^.]+$/u, "") || "image";
      finishImageLoad(output.scale < 1 ? messages.resized : messages.ready);
    } catch (error) {
      showError(error.message || messages.invalidFile);
      setStatus(messages.waiting);
    }
  }

  function finishImageLoad(statusMessage) {
    state.regions = [];
    state.suggestions = [];
    state.history = [];
    state.future = [];
    state.selectedId = null;
    state.zoom = 1;
    state.showOriginal = false;
    elements.drop.hidden = true;
    elements.workspace.hidden = false;
    createPreviewSource();
    elements.fileName.textContent = state.fileName;
    elements.fileMeta.textContent = `${state.source.width.toLocaleString()} × ${state.source.height.toLocaleString()} px`;
    setStatus(statusMessage, "ready");
    renderSuggestions();
    updateHistoryButtons();
    render();
  }

  function loadSample() {
    state.source.width = 1440;
    state.source.height = 900;
    const ctx = state.source.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 1440, 900);
    gradient.addColorStop(0, "#e7eee9");
    gradient.addColorStop(1, "#c8d9d0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1440, 900);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(110, 90, 1220, 720);
    ctx.fillStyle = "#15372f";
    ctx.font = "700 54px system-ui";
    ctx.fillText("PRIVATE CONTACT CARD", 180, 185);
    ctx.fillStyle = "#4b625c";
    ctx.font = "34px system-ui";
    ctx.fillText("Name: Wang Xiaoming", 180, 300);
    ctx.fillText("Phone: +86 138 0013 8000", 180, 380);
    ctx.fillText("Email: xiaoming@example.com", 180, 460);
    ctx.fillText("ID: 110101199003071234", 180, 540);
    ctx.fillText("Website: https://example.com/account", 180, 620);
    ctx.fillStyle = "#dce9e3";
    ctx.beginPath();
    ctx.arc(1120, 330, 112, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#78928a";
    ctx.beginPath();
    ctx.arc(1120, 300, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1120, 400, 78, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    state.fileName = "privacy-sample";
    finishImageLoad(messages.sampleReady);
  }

  function resetTool() {
    state.regions = [];
    state.suggestions = [];
    state.source.width = 0;
    state.source.height = 0;
    state.previewSource.width = 0;
    state.previewSource.height = 0;
    elements.workspace.hidden = true;
    elements.drop.hidden = false;
    elements.file.value = "";
    setStatus(messages.waiting);
  }

  function categoryLabel(category) {
    return messages.categories?.[category] || category;
  }

  function renderSuggestions() {
    elements.suggestions.replaceChildren();
    elements.suggestionsEmpty.hidden = state.suggestions.length > 0;
    elements.applySuggestions.disabled = !state.suggestions.some((item) => item.checked);
    elements.clearSuggestions.disabled = state.suggestions.length === 0;
    for (const suggestion of state.suggestions) {
      const item = document.createElement("label");
      item.className = "redaction-suggestion-item";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = suggestion.checked;
      checkbox.addEventListener("change", () => {
        suggestion.checked = checkbox.checked;
        elements.applySuggestions.disabled = !state.suggestions.some((entry) => entry.checked);
        render();
      });
      const copy = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = categoryLabel(suggestion.category);
      const detail = document.createElement("small");
      detail.textContent = suggestion.category === "face" ? messages.faceSuggestion : (suggestion.text || messages.textSuggestion);
      copy.append(strong, detail);
      item.append(checkbox, copy);
      elements.suggestions.append(item);
    }
  }

  function setAiProgress(value, label) {
    elements.aiProgress.hidden = false;
    elements.aiProgressBar.style.width = `${Math.max(2, Math.round(value * 100))}%`;
    elements.aiProgressText.textContent = label;
  }

  async function loadFaceDetector() {
    if (state.faceDetector) return state.faceDetector;
    const moduleUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/+esm";
    const wasmUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
    const modelUrl = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
    const { FaceDetector, FilesetResolver } = await import(moduleUrl);
    const fileset = await FilesetResolver.forVisionTasks(wasmUrl);
    state.faceDetector = await FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: modelUrl }, runningMode: "IMAGE", minDetectionConfidence: 0.48, minSuppressionThreshold: 0.3
    });
    return state.faceDetector;
  }

  async function detectFaces() {
    setAiProgress(0.08, messages.loadingFaceModel);
    const detector = await loadFaceDetector();
    setAiProgress(0.32, messages.detectingFaces);
    const result = detector.detect(state.previewSource);
    return (result.detections || []).map((detection) => {
      const box = detection.boundingBox;
      const rect = core.normalizeRect(box.originX / state.previewSource.width, box.originY / state.previewSource.height, box.width / state.previewSource.width, box.height / state.previewSource.height);
      return { category: "face", rect: core.expandRect(rect, rect.width * 0.14, rect.height * 0.2), confidence: detection.categories?.[0]?.score || 0, checked: true };
    });
  }

  function loadExternalScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (globalThis.Tesseract) resolve();
        else existing.addEventListener("load", resolve, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", () => reject(new Error(messages.modelError)), { once: true });
      document.head.append(script);
    });
  }

  async function getOcrWorker(language) {
    if (state.ocrWorker && state.ocrWorkerLanguage === language) return state.ocrWorker;
    if (state.ocrWorker) await state.ocrWorker.terminate();
    await loadExternalScript("https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js");
    state.ocrWorkerLanguage = language;
    state.ocrWorker = await globalThis.Tesseract.createWorker(language, 1, {
      logger: (event) => {
        const progress = 0.42 + Math.max(0, Number(event.progress) || 0) * 0.48;
        setAiProgress(progress, text(messages.ocrProgress, { percent: Math.round((Number(event.progress) || 0) * 100) }));
      }
    });
    return state.ocrWorker;
  }

  async function detectSensitiveText() {
    const language = elements.ocrLanguage.value;
    setAiProgress(0.4, messages.loadingTextModel);
    const worker = await getOcrWorker(language);
    setAiProgress(0.52, messages.detectingText);
    const result = await worker.recognize(state.previewSource, { rotateAuto: true }, { text: true, blocks: true, tsv: true });
    return core.detectSensitiveTextRegions(result.data, state.previewSource.width, state.previewSource.height).map((item) => ({ ...item, checked: true }));
  }

  function dedupeSuggestions(items) {
    const result = [];
    for (const item of items) {
      if (!result.some((existing) => existing.category === item.category && core.intersectionOverUnion(existing.rect, item.rect) > 0.55)) result.push(item);
    }
    return result;
  }

  async function runAiScan() {
    if (state.aiBusy || !state.previewSource.width) return;
    if (!elements.faceScan.checked && !elements.textScan.checked) {
      showError(messages.chooseDetection);
      return;
    }
    state.aiBusy = true;
    elements.aiRun.disabled = true;
    state.suggestions = [];
    renderSuggestions();
    try {
      const suggestions = [];
      if (elements.faceScan.checked) suggestions.push(...await detectFaces());
      if (elements.textScan.checked) suggestions.push(...await detectSensitiveText());
      state.suggestions = dedupeSuggestions(suggestions);
      setAiProgress(1, text(messages.aiComplete, { count: state.suggestions.length }));
      setStatus(text(messages.aiComplete, { count: state.suggestions.length }), "ready");
      renderSuggestions();
      render();
    } catch (error) {
      console.error(error);
      setAiProgress(0, messages.modelError);
      showError(messages.modelError);
    } finally {
      state.aiBusy = false;
      elements.aiRun.disabled = false;
    }
  }

  function applySuggestions() {
    const selected = state.suggestions.filter((item) => item.checked);
    if (!selected.length) return;
    commitRegions(() => {
      for (const suggestion of selected) {
        state.regions.push({
          id: `region-${state.nextId++}`, rect: { ...suggestion.rect }, effect: suggestion.category === "face" ? "pixelate" : "solid",
          strength: suggestion.category === "face" ? 58 : 70, color: "#07120f", source: "ai", category: suggestion.category
        });
      }
      state.suggestions = state.suggestions.filter((item) => !item.checked);
      state.selectedId = null;
    });
    renderSuggestions();
    setStatus(text(messages.appliedSuggestions, { count: selected.length }), "ready");
  }

  function clearSuggestions() {
    state.suggestions = [];
    renderSuggestions();
    render();
  }

  function exportImage() {
    if (!state.source.width) return;
    const format = elements.exportFormat.value;
    const canvas = document.createElement("canvas");
    canvas.width = state.source.width;
    canvas.height = state.source.height;
    renderToCanvas(canvas, state.source, state.regions, false, format === "image/jpeg" ? "#ffffff" : "");
    const quality = Number(elements.exportQuality.value) / 100;
    canvas.toBlob((blob) => {
      if (!blob) {
        showError(messages.exportError);
        return;
      }
      const extension = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${state.fileName}-redacted.${extension}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(messages.exported, "ready");
    }, format, quality);
  }

  function changeLocale() {
    const prefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
    const prefix = prefixes[elements.locale.value];
    if (prefix === undefined) return;
    localStorage.setItem("jianfan-locale-manual", "1");
    window.location.href = `/${prefix}image-redaction/`;
  }

  elements.file.addEventListener("change", () => loadFile(elements.file.files?.[0]));
  elements.sample.addEventListener("click", loadSample);
  elements.drop.addEventListener("dragover", (event) => { event.preventDefault(); elements.drop.classList.add("is-dragging"); });
  elements.drop.addEventListener("dragleave", () => elements.drop.classList.remove("is-dragging"));
  elements.drop.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.drop.classList.remove("is-dragging");
    loadFile(event.dataTransfer?.files?.[0]);
  });
  elements.drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); elements.file.click(); }
  });
  document.addEventListener("paste", (event) => {
    const image = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith("image/"));
    if (image) loadFile(image.getAsFile());
  });
  elements.canvas.addEventListener("pointerdown", pointerDown);
  elements.canvas.addEventListener("pointermove", pointerMove);
  elements.canvas.addEventListener("pointerup", pointerUp);
  elements.canvas.addEventListener("pointercancel", pointerUp);
  elements.canvas.addEventListener("keydown", (event) => {
    if ((event.key === "Delete" || event.key === "Backspace") && selectedRegion()) { event.preventDefault(); removeSelected(); }
    if (event.key === "Escape") { state.selectedId = null; updateHistoryButtons(); render(); }
  });
  elements.effectButtons.forEach((button) => button.addEventListener("click", () => setActiveEffect(button.dataset.redactionEffect)));
  elements.colorButtons.forEach((button) => button.addEventListener("click", () => setActiveColor(button.dataset.redactionColor)));
  elements.intensity.addEventListener("focus", () => { state.sliderSnapshot = cloneRegions(); });
  elements.intensity.addEventListener("pointerdown", () => { state.sliderSnapshot = cloneRegions(); });
  elements.intensity.addEventListener("input", () => {
    state.strength = Number(elements.intensity.value);
    elements.intensityValue.textContent = elements.intensity.value;
    if (selectedRegion()) { selectedRegion().strength = state.strength; render(); }
  });
  elements.intensity.addEventListener("change", () => {
    if (selectedRegion() && state.sliderSnapshot && JSON.stringify(state.sliderSnapshot) !== JSON.stringify(state.regions)) {
      state.history.push(state.sliderSnapshot);
      state.future = [];
      updateHistoryButtons();
    }
    state.sliderSnapshot = null;
  });
  elements.undo.addEventListener("click", undo);
  elements.redo.addEventListener("click", redo);
  elements.remove.addEventListener("click", removeSelected);
  elements.compare.addEventListener("click", () => { state.showOriginal = !state.showOriginal; render(); });
  elements.zoomOut.addEventListener("click", () => { state.zoom = Math.max(0.5, state.zoom - 0.25); updateCanvasSize(); });
  elements.zoomIn.addEventListener("click", () => { state.zoom = Math.min(2.5, state.zoom + 0.25); updateCanvasSize(); });
  elements.aiRun.addEventListener("click", runAiScan);
  elements.applySuggestions.addEventListener("click", applySuggestions);
  elements.clearSuggestions.addEventListener("click", clearSuggestions);
  elements.exportFormat.addEventListener("change", () => { elements.exportQualityRow.hidden = elements.exportFormat.value === "image/png"; });
  elements.exportQuality.addEventListener("input", () => { elements.exportQualityValue.textContent = `${elements.exportQuality.value}%`; });
  elements.download.addEventListener("click", exportImage);
  elements.reset.addEventListener("click", resetTool);
  elements.locale.addEventListener("change", changeLocale);
  window.addEventListener("resize", updateCanvasSize);
  setActiveEffect("solid", false);
  setActiveColor("#07120f", false);
  updateHistoryButtons();
})();
