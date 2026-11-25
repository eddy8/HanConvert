(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ImageSplitterCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
  const MAX_IMAGE_PIXELS = 64_000_000;
  const MAX_PARTS = 100;
  const MAX_POSTER_PAGES = 64;
  const MAX_GRID = 10;
  const PAPER_SIZES = { a4: [210, 297], a3: [297, 420], letter: [215.9, 279.4] };
  const TILE_RATIOS = { original: null, "1:1": [1, 1], "4:5": [4, 5], "3:4": [3, 4], "9:16": [9, 16] };
  const SEGMENT_RATIOS = { a4: 297 / 210, screen: 16 / 9 };

  function clampInt(value, min, max, fallback) {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  // Integer boundaries that spread any remainder evenly, so tiles differ by at most one pixel.
  function splitEdges(start, length, count) {
    return Array.from({ length: count + 1 }, (_, index) => start + Math.round((index * length) / count));
  }

  // The region the grid covers. "crop" trims the image to the target ratio around its center;
  // "pad" grows the canvas around the image so nothing is cut off.
  function gridFrame(width, height, rows, cols, ratio, fit) {
    if (!ratio) return { x: 0, y: 0, width, height };
    const target = (cols * ratio[0]) / (rows * ratio[1]);
    const actual = width / height;
    if (Math.abs(actual - target) < 1e-6) return { x: 0, y: 0, width, height };
    const tooWide = actual > target;
    if (fit === "pad") {
      if (tooWide) {
        const frameHeight = Math.round(width / target);
        return { x: 0, y: Math.round((height - frameHeight) / 2), width, height: frameHeight };
      }
      const frameWidth = Math.round(height * target);
      return { x: Math.round((width - frameWidth) / 2), y: 0, width: frameWidth, height };
    }
    if (tooWide) {
      const frameWidth = Math.max(1, Math.round(height * target));
      return { x: Math.round((width - frameWidth) / 2), y: 0, width: frameWidth, height };
    }
    const frameHeight = Math.max(1, Math.round(width / target));
    return { x: 0, y: Math.round((height - frameHeight) / 2), width, height: frameHeight };
  }

  function computeGrid({ width, height, rows, cols, ratio = "original", fit = "crop" }) {
    const safeRows = clampInt(rows, 1, MAX_GRID, 3);
    const safeCols = clampInt(cols, 1, MAX_GRID, 3);
    const frame = gridFrame(width, height, safeRows, safeCols, TILE_RATIOS[ratio] || null, fit);
    const xs = splitEdges(frame.x, frame.width, safeCols);
    const ys = splitEdges(frame.y, frame.height, safeRows);
    const tiles = [];
    for (let row = 0; row < safeRows; row += 1) {
      for (let col = 0; col < safeCols; col += 1) {
        tiles.push({ index: tiles.length, row, col, x: xs[col], y: ys[row], width: xs[col + 1] - xs[col], height: ys[row + 1] - ys[row] });
      }
    }
    return { rows: safeRows, cols: safeCols, frame, tiles, padded: fit === "pad" && (frame.width > width || frame.height > height) };
  }

  // Instagram shows the newest post first, so a profile mosaic is posted from the last tile back to the first.
  function partNumber(index, total, order) {
    return order === "instagram" ? total - index : index + 1;
  }

  function partFileName(base, part, total, order, extension) {
    const digits = String(total).length < 2 ? 2 : String(total).length;
    const number = String(partNumber(part.index, total, order)).padStart(digits, "0");
    const prefix = order === "instagram" ? "post" : "";
    const position = Number.isInteger(part.row) && Number.isInteger(part.col) ? `_r${part.row + 1}c${part.col + 1}` : "";
    return `${base}_${prefix}${number}${position}.${extension}`;
  }

  function targetSegmentHeight(width, mode, value) {
    if (mode === "pixels") return clampInt(value, 64, 100000, 1600);
    return Math.round(width * (SEGMENT_RATIOS[mode] || SEGMENT_RATIOS.a4));
  }

  // Picks the cleanest row in a scored window: the lowest busyness score, preferring the row
  // closest to the ideal cut among rows that are nearly as clean as the best one.
  function pickCleanRow(scores, idealIndex) {
    if (!scores.length) return idealIndex;
    const best = Math.min(...scores);
    const tolerance = best * 0.08 + 0.35;
    let chosen = -1;
    let distance = Infinity;
    scores.forEach((score, index) => {
      if (score > best + tolerance) return;
      const gap = Math.abs(index - idealIndex);
      if (gap < distance) { distance = gap; chosen = index; }
    });
    return chosen;
  }

  // Splits a tall image top to bottom. chooseCut(lo, hi, ideal) may move each cut to a blank row.
  function computeSegments({ width, height, mode = "a4", value = 0, chooseCut = null }) {
    const cuts = [];
    if (mode === "count") {
      const count = clampInt(value, 1, MAX_PARTS, 4);
      const ideal = splitEdges(0, height, count);
      const window = Math.round((height / count) * 0.08);
      let previous = 0;
      for (let index = 1; index < count; index += 1) {
        const lo = Math.max(previous + 1, ideal[index] - window);
        const hi = Math.min(height - 1, ideal[index] + window);
        const cut = chooseCut ? chooseCut(lo, hi, ideal[index]) : ideal[index];
        cuts.push(cut);
        previous = cut;
      }
    } else {
      const segment = Math.max(32, targetSegmentHeight(width, mode, value));
      const window = Math.round(segment * 0.12);
      let start = 0;
      while (height - start > segment) {
        if (cuts.length >= MAX_PARTS) return { tooMany: true, segments: [] };
        const ideal = start + segment;
        const cut = chooseCut ? chooseCut(Math.max(start + 1, ideal - window), ideal, ideal) : ideal;
        cuts.push(cut);
        start = cut;
      }
    }
    const edges = [0, ...cuts, height];
    const segments = edges.slice(0, -1).map((y, index) => ({ index, x: 0, y, width, height: edges[index + 1] - y }));
    return { tooMany: segments.length > MAX_PARTS, segments };
  }

  function paperSize(paper, orientation) {
    const [shortSide, longSide] = PAPER_SIZES[paper] || PAPER_SIZES.a4;
    return orientation === "landscape" ? [longSide, shortSide] : [shortSide, longSide];
  }

  // Tiles an image over several sheets of paper. All lengths are millimetres except source coordinates.
  function computePoster({ width, height, paper = "a4", orientation = "portrait", cols = 2, margin = 6, overlap = 8 }) {
    const [pageWidth, pageHeight] = paperSize(paper, orientation);
    const safeMargin = Math.min(Math.max(Number(margin) || 0, 0), 30);
    const printableWidth = pageWidth - safeMargin * 2;
    const printableHeight = pageHeight - safeMargin * 2;
    const safeOverlap = Math.min(Math.max(Number(overlap) || 0, 0), printableWidth / 3, printableHeight / 3);
    const safeCols = clampInt(cols, 1, 10, 2);
    const posterWidth = safeCols * printableWidth - (safeCols - 1) * safeOverlap;
    const scale = posterWidth / width;
    const posterHeight = height * scale;
    const stepX = printableWidth - safeOverlap;
    const stepY = printableHeight - safeOverlap;
    const rows = Math.max(1, Math.ceil((posterHeight - safeOverlap) / stepY - 1e-9));
    const pages = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < safeCols; col += 1) {
        const left = col * stepX;
        const top = row * stepY;
        const drawWidth = Math.min(printableWidth, posterWidth - left);
        const drawHeight = Math.min(printableHeight, posterHeight - top);
        pages.push({
          index: pages.length, row, col, label: `${String.fromCharCode(65 + (row % 26))}${col + 1}`,
          x: left / scale, y: top / scale, width: drawWidth / scale, height: drawHeight / scale,
          drawWidth, drawHeight
        });
      }
    }
    return {
      pageWidth, pageHeight, margin: safeMargin, overlap: safeOverlap, printableWidth, printableHeight,
      cols: safeCols, rows, posterWidth, posterHeight, dpi: Math.round(width / (posterWidth / 25.4)), pages,
      tooMany: pages.length > MAX_POSTER_PAGES
    };
  }

  return {
    MAX_FILE_SIZE_BYTES, MAX_IMAGE_PIXELS, MAX_PARTS, MAX_POSTER_PAGES, MAX_GRID, PAPER_SIZES, TILE_RATIOS,
    clampInt, splitEdges, gridFrame, computeGrid, partNumber, partFileName, targetSegmentHeight, pickCleanRow,
    computeSegments, paperSize, computePoster
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;
  const core = globalThis.ImageSplitterCore;
  if (!core || document.body?.dataset.toolPage !== "image-splitter") return;

  const LIBRARIES = {
    zip: { url: "https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js", integrity: "sha384-DT0Ls0mO7JmjTnT+oBuMhEJzYJO1zUqzuuMXNdnOmOQRIpN2BgSjvBV/j50NngIT", global: "fflate" },
    pdf: { url: "https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js", integrity: "sha384-qovJwSBbRDPP5cEjCp8S0UP66wrvnjaa60XMOGzTNanrThcrGfXfnZkvgY8N1KT3", global: "jspdf" }
  };
  const PDF_MARGIN_MM = 5;
  const PRINT_DPI = 300;
  const messages = JSON.parse(document.querySelector("#imageSplitterMessages")?.textContent || "{}");
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    locale: $("#localeSelect"), file: $("#splitterFileInput"), drop: $("#splitterDropZone"), sample: $("#splitterSample"),
    workspace: $("#splitterWorkspace"), status: $("#splitterStatus"), fileName: $("#splitterFileName"), fileMeta: $("#splitterFileMeta"),
    frame: $("#splitterPreviewFrame"), canvas: $("#splitterCanvas"), summary: $("#splitterSummary"), warning: $("#splitterWarning"),
    modeButtons: document.querySelectorAll("[data-splitter-mode]"), panels: document.querySelectorAll("[data-splitter-panel]"),
    presets: document.querySelectorAll("[data-grid-preset]"), rows: $("#splitterRows"), cols: $("#splitterCols"), ratio: $("#splitterRatio"),
    fitRow: $("#splitterFitRow"), fit: $("#splitterFit"), padColor: $("#splitterPadColor"), order: $("#splitterOrder"),
    segmentMode: $("#splitterSegmentMode"), segmentValueRow: $("#splitterSegmentValueRow"), segmentValue: $("#splitterSegmentValue"),
    segmentValueLabel: $("#splitterSegmentValueLabel"), smartCut: $("#splitterSmartCut"),
    paper: $("#splitterPaper"), orientation: $("#splitterOrientation"), posterCols: $("#splitterPosterCols"), margin: $("#splitterMargin"),
    overlap: $("#splitterOverlap"), marks: $("#splitterMarks"), formatRow: $("#splitterFormatRow"), format: $("#splitterFormat"),
    zip: $("#splitterZip"), pdf: $("#splitterPdf"), share: $("#splitterShare"), reset: $("#splitterReset"), hint: $("#splitterHint"),
    dialog: $("#splitterDialog"), dialogMessage: $("#splitterDialogMessage")
  };
  if (!elements.canvas) return;

  const state = {
    source: null, preview: null, width: 0, height: 0, fileName: "image", sourceType: "image/png", mode: "grid",
    layout: null, view: null, busy: false, prepared: null, rowScoreCache: new Map(), libraries: {}
  };

  function text(template, values = {}) {
    return Object.entries(values).reduce((output, [key, value]) => output.replaceAll(`{${key}}`, String(value)), template || "");
  }

  function formatNumber(value, digits = 0) {
    return Number(value).toLocaleString(document.documentElement.lang || undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  }

  function setStatus(message, mode = "") {
    elements.status.querySelector("span:last-child").textContent = message;
    elements.status.classList.toggle("is-ready", mode === "ready");
    elements.status.classList.toggle("is-error", mode === "error");
  }

  function showError(message) {
    elements.dialogMessage.textContent = message;
    if (typeof elements.dialog.showModal === "function") elements.dialog.showModal();
    else window.alert(message);
  }

  function loadLibrary(name) {
    const library = LIBRARIES[name];
    if (window[library.global]) return Promise.resolve(window[library.global]);
    if (!state.libraries[name]) {
      state.libraries[name] = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = library.url;
        script.integrity = library.integrity;
        script.crossOrigin = "anonymous";
        script.onload = () => (window[library.global] ? resolve(window[library.global]) : reject(new Error(messages.libraryError)));
        script.onerror = () => { state.libraries[name] = null; script.remove(); reject(new Error(messages.libraryError)); };
        document.head.append(script);
      });
    }
    return state.libraries[name];
  }

  // ---------- Loading ----------

  async function decodeImage(file) {
    if (typeof createImageBitmap === "function") {
      try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch { /* Try without options. */ }
      try { return await createImageBitmap(file); } catch { /* Fall back to an image element. */ }
    }
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function sourceSize(source) {
    return { width: source.naturalWidth || source.width, height: source.naturalHeight || source.height };
  }

  async function loadFile(file) {
    if (!file) return;
    if (!file.type?.startsWith("image/")) { showError(messages.invalidFile); return; }
    if (file.size > core.MAX_FILE_SIZE_BYTES) { showError(messages.fileTooLarge); return; }
    setStatus(messages.loading);
    try {
      const source = await decodeImage(file);
      const { width, height } = sourceSize(source);
      if (!width || !height) throw new Error(messages.invalidFile);
      if (width * height > core.MAX_IMAGE_PIXELS) {
        source.close?.();
        throw new Error(messages.tooManyPixels);
      }
      useSource(source, (file.name || "image").replace(/\.[^.]+$/u, "") || "image", file.type === "image/jpeg" ? "image/jpeg" : "image/png", messages.ready);
    } catch (error) {
      setStatus(messages.waiting);
      showError(error?.message && error.message !== "undefined" ? error.message : messages.invalidFile);
    }
  }

  function makePreview(source, width, height) {
    const scale = Math.min(1, 1600 / width, 16000 / height, Math.sqrt(6_000_000 / (width * height)));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function useSource(source, fileName, sourceType, statusMessage) {
    state.source?.close?.();
    const { width, height } = sourceSize(source);
    Object.assign(state, { source, width, height, fileName, sourceType, prepared: null, rowScoreCache: new Map() });
    state.preview = makePreview(source, width, height);
    elements.fileName.textContent = fileName;
    elements.fileMeta.textContent = `${formatNumber(width)} × ${formatNumber(height)} px`;
    elements.format.value = sourceType === "image/jpeg" ? "image/jpeg" : "image/png";
    elements.drop.hidden = true;
    elements.workspace.hidden = false;
    // Tall screenshots open straight in the long-image mode.
    if (height / width >= 2.4 && state.mode === "grid") setMode("long", false);
    setStatus(statusMessage, "ready");
    update();
  }

  function loadSample() {
    const canvas = document.createElement("canvas");
    canvas.width = 1620;
    canvas.height = 1620;
    const ctx = canvas.getContext("2d");
    const sky = ctx.createLinearGradient(0, 0, 0, 1620);
    sky.addColorStop(0, "#1b3a5b");
    sky.addColorStop(0.55, "#f1a25b");
    sky.addColorStop(1, "#f7d9a8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1620, 1620);
    ctx.fillStyle = "#ffe7a3";
    ctx.beginPath();
    ctx.arc(1080, 720, 190, 0, Math.PI * 2);
    ctx.fill();
    const ridges = [["#2f4858", 980, 0.0035, 120], ["#1f3442", 1120, 0.005, 90], ["#132530", 1290, 0.008, 60]];
    ridges.forEach(([color, base, frequency, amplitude]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 1620);
      for (let x = 0; x <= 1620; x += 20) ctx.lineTo(x, base + Math.sin(x * frequency) * amplitude + Math.cos(x * frequency * 2.7) * amplitude * 0.4);
      ctx.lineTo(1620, 1620);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "800 120px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("JianFan.app", 810, 360);
    ctx.font = "600 54px system-ui, sans-serif";
    ctx.fillText("3 × 3 · 1 : 1 · A4", 810, 450);
    useSource(canvas, "split-sample", "image/png", messages.sampleReady);
  }

  function resetTool() {
    state.source?.close?.();
    Object.assign(state, { source: null, preview: null, width: 0, height: 0, layout: null, prepared: null });
    elements.file.value = "";
    elements.workspace.hidden = true;
    elements.drop.hidden = false;
    setStatus(messages.waiting);
  }

  // ---------- Layout ----------

  function readGridSettings() {
    return {
      rows: core.clampInt(elements.rows.value, 1, core.MAX_GRID, 3), cols: core.clampInt(elements.cols.value, 1, core.MAX_GRID, 3),
      ratio: elements.ratio.value, fit: elements.fit.value, padColor: elements.padColor.value, order: elements.order.value
    };
  }

  // Busyness of every source row in [lo, hi]: mean horizontal brightness change, sampled on a narrow copy.
  function rowScores(lo, hi) {
    const key = `${lo}:${hi}`;
    if (state.rowScoreCache.has(key)) return state.rowScoreCache.get(key);
    const sampleWidth = Math.min(360, state.width);
    const rows = hi - lo + 1;
    const scaleY = Math.min(1, 1200 / rows);
    const sampleHeight = Math.max(1, Math.round(rows * scaleY));
    const canvas = document.createElement("canvas");
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(state.source, 0, lo, state.width, rows, 0, 0, sampleWidth, sampleHeight);
    const data = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const scores = [];
    for (let y = 0; y < sampleHeight; y += 1) {
      let total = 0;
      let previous = -1;
      for (let x = 0; x < sampleWidth; x += 1) {
        const offset = (y * sampleWidth + x) * 4;
        const luma = data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
        if (previous >= 0) total += Math.abs(luma - previous);
        previous = luma;
      }
      scores.push(total / sampleWidth);
    }
    const result = { scores, scaleY };
    state.rowScoreCache.set(key, result);
    return result;
  }

  function chooseCleanCut(lo, hi, ideal) {
    if (hi <= lo) return ideal;
    try {
      const { scores, scaleY } = rowScores(lo, hi);
      const index = core.pickCleanRow(scores, Math.round((ideal - lo) * scaleY));
      return Math.min(hi, Math.max(lo, lo + Math.round(index / scaleY)));
    } catch {
      return ideal;
    }
  }

  function computeLayout() {
    if (state.mode === "grid") {
      const settings = readGridSettings();
      const grid = core.computeGrid({ width: state.width, height: state.height, ...settings });
      return { mode: "grid", settings, parts: grid.tiles, frame: grid.frame, padded: grid.padded, rows: grid.rows, cols: grid.cols };
    }
    if (state.mode === "long") {
      const segmentMode = elements.segmentMode.value;
      const result = core.computeSegments({
        width: state.width, height: state.height, mode: segmentMode, value: Number(elements.segmentValue.value),
        chooseCut: elements.smartCut.checked ? chooseCleanCut : null
      });
      return { mode: "long", parts: result.segments, tooMany: result.tooMany, frame: { x: 0, y: 0, width: state.width, height: state.height } };
    }
    const poster = core.computePoster({
      width: state.width, height: state.height, paper: elements.paper.value, orientation: elements.orientation.value,
      cols: Number(elements.posterCols.value), margin: Number(elements.margin.value), overlap: Number(elements.overlap.value)
    });
    return { mode: "poster", poster, parts: poster.pages, tooMany: poster.tooMany, frame: { x: 0, y: 0, width: state.width, height: state.height } };
  }

  // ---------- Preview ----------

  function renderPreview() {
    const layout = state.layout;
    if (!layout || !state.preview) return;
    const frame = layout.frame;
    const view = {
      x: Math.min(0, frame.x), y: Math.min(0, frame.y),
      right: Math.max(state.width, frame.x + frame.width), bottom: Math.max(state.height, frame.y + frame.height)
    };
    view.width = view.right - view.x;
    view.height = view.bottom - view.y;
    const available = Math.max(200, elements.frame.clientWidth - 28);
    const maxHeight = layout.mode === "long" ? Infinity : Math.max(260, elements.frame.clientHeight - 28);
    let scale = Math.min(available / view.width, maxHeight / view.height, 1.5);
    if (layout.mode === "long") scale = Math.min(scale, 14000 / view.height);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const cssWidth = Math.max(1, Math.round(view.width * scale));
    const cssHeight = Math.max(1, Math.round(view.height * scale));
    const pixelRatio = Math.min(ratio, 16000 / (cssHeight || 1));
    elements.canvas.width = Math.round(cssWidth * pixelRatio);
    elements.canvas.height = Math.round(cssHeight * pixelRatio);
    elements.canvas.style.width = `${cssWidth}px`;
    elements.canvas.style.height = `${cssHeight}px`;
    state.view = { ...view, scale };
    const ctx = elements.canvas.getContext("2d");
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    const toX = (x) => (x - view.x) * scale;
    const toY = (y) => (y - view.y) * scale;
    if (layout.mode === "grid" && layout.padded) {
      ctx.fillStyle = layout.settings.padColor;
      ctx.fillRect(toX(frame.x), toY(frame.y), frame.width * scale, frame.height * scale);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(state.preview, toX(0), toY(0), state.width * scale, state.height * scale);
    if (layout.mode === "grid") drawGridOverlay(ctx, layout, toX, toY, scale, cssWidth, cssHeight);
    else if (layout.mode === "long") drawSegmentOverlay(ctx, layout, toX, toY, scale, cssWidth);
    else drawPosterOverlay(ctx, layout, toX, toY, scale);
  }

  function drawLine(ctx, x1, y1, x2, y2, dashed = false) {
    ctx.save();
    ctx.setLineDash(dashed ? [6, 5] : []);
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  function drawBadge(ctx, label, x, y) {
    ctx.save();
    ctx.font = "700 13px system-ui, sans-serif";
    const width = Math.max(24, ctx.measureText(label).width + 14);
    ctx.fillStyle = "rgba(7,18,15,0.78)";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x - width / 2, y - 12, width, 24, 12) : ctx.rect(x - width / 2, y - 12, width, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 0.5);
    ctx.restore();
  }

  function drawGridOverlay(ctx, layout, toX, toY, scale, cssWidth, cssHeight) {
    const { frame } = layout;
    const fx = toX(frame.x);
    const fy = toY(frame.y);
    const fw = frame.width * scale;
    const fh = frame.height * scale;
    if (!layout.padded) {
      ctx.fillStyle = "rgba(0,0,0,0.58)";
      ctx.fillRect(0, 0, cssWidth, fy);
      ctx.fillRect(0, fy + fh, cssWidth, cssHeight - fy - fh);
      ctx.fillRect(0, fy, fx, fh);
      ctx.fillRect(fx + fw, fy, cssWidth - fx - fw, fh);
    }
    const total = layout.parts.length;
    layout.parts.forEach((tile) => {
      if (tile.col > 0) drawLine(ctx, toX(tile.x), toY(tile.y), toX(tile.x), toY(tile.y + tile.height));
      if (tile.row > 0) drawLine(ctx, toX(tile.x), toY(tile.y), toX(tile.x + tile.width), toY(tile.y));
    });
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1);
    ctx.restore();
    if (total <= 60) {
      layout.parts.forEach((tile) => drawBadge(ctx, String(core.partNumber(tile.index, total, layout.settings.order)), toX(tile.x + tile.width / 2), toY(tile.y + tile.height / 2)));
    }
  }

  function drawSegmentOverlay(ctx, layout, toX, toY, scale, cssWidth) {
    layout.parts.forEach((segment) => {
      if (segment.index > 0) drawLine(ctx, 0, toY(segment.y), cssWidth, toY(segment.y), true);
      drawBadge(ctx, String(segment.index + 1), 26, toY(segment.y) + 20);
    });
  }

  function drawPosterOverlay(ctx, layout, toX, toY, scale) {
    const { poster } = layout;
    const overlapPx = poster.overlap / (poster.posterWidth / state.width);
    layout.parts.forEach((page) => {
      const x = toX(page.x);
      const y = toY(page.y);
      if (page.col > 0 && overlapPx > 0) {
        ctx.fillStyle = "rgba(255,204,102,0.28)";
        ctx.fillRect(x, y, overlapPx * scale, page.height * scale);
      }
      if (page.row > 0 && overlapPx > 0) {
        ctx.fillStyle = "rgba(255,204,102,0.28)";
        ctx.fillRect(x, y, page.width * scale, overlapPx * scale);
      }
    });
    layout.parts.forEach((page) => {
      const x = toX(page.x);
      const y = toY(page.y);
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, page.width * scale, page.height * scale);
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 1.25;
      ctx.strokeRect(x, y, page.width * scale, page.height * scale);
      ctx.restore();
      if (layout.parts.length <= 64) drawBadge(ctx, page.label, x + Math.min(page.width * scale / 2, 30), y + 20);
    });
  }

  // ---------- Summary ----------

  function updateSummary() {
    const layout = state.layout;
    let summary = "";
    let warning = "";
    if (layout.mode === "grid") {
      const widths = layout.parts.map((tile) => tile.width);
      const heights = layout.parts.map((tile) => tile.height);
      const size = Math.max(...widths) === Math.min(...widths) && Math.max(...heights) === Math.min(...heights)
        ? `${formatNumber(widths[0])} × ${formatNumber(heights[0])}`
        : `≈ ${formatNumber(Math.round(widths.reduce((a, b) => a + b) / widths.length))} × ${formatNumber(Math.round(heights.reduce((a, b) => a + b) / heights.length))}`;
      summary = text(messages.gridSummary, { count: layout.parts.length, size });
      if (layout.parts[0].width < 320 || layout.parts[0].height < 320) warning = messages.smallTiles;
    } else if (layout.mode === "long") {
      if (layout.tooMany) {
        summary = "";
        warning = text(messages.tooManyParts, { max: core.MAX_PARTS });
      } else {
        const tallest = Math.max(...layout.parts.map((segment) => segment.height));
        summary = text(messages.longSummary, { count: layout.parts.length, height: formatNumber(tallest) });
      }
    } else {
      const { poster } = layout;
      summary = text(messages.posterSummary, {
        count: layout.parts.length, cols: poster.cols, rows: poster.rows,
        width: formatNumber(poster.posterWidth / 10, 1), height: formatNumber(poster.posterHeight / 10, 1), dpi: poster.dpi
      });
      if (layout.tooMany) warning = text(messages.tooManyPages, { max: core.MAX_POSTER_PAGES });
      else if (poster.dpi < 100) warning = messages.lowDpi;
    }
    elements.summary.textContent = summary;
    elements.warning.textContent = warning;
    elements.warning.hidden = !warning;
    const blocked = Boolean(layout.tooMany);
    elements.zip.disabled = blocked || state.busy;
    elements.pdf.disabled = blocked || state.busy;
    elements.share.disabled = blocked || state.busy;
  }

  function update() {
    if (!state.source) return;
    state.prepared = null;
    state.layout = computeLayout();
    updateSummary();
    renderPreview();
    updateShareLabel();
  }

  // ---------- Controls ----------

  function setMode(mode, refresh = true) {
    state.mode = mode;
    elements.modeButtons.forEach((button) => {
      const active = button.dataset.splitterMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
    elements.panels.forEach((panel) => { panel.hidden = panel.dataset.splitterPanel !== mode; });
    elements.formatRow.hidden = mode === "poster";
    elements.zip.hidden = mode === "poster";
    elements.pdf.hidden = mode === "grid";
    elements.pdf.classList.toggle("primary-action", mode === "poster");
    elements.share.hidden = mode === "poster" || !canShareFiles();
    elements.hint.textContent = mode === "poster" ? messages.posterHint : messages.clickHint;
    if (refresh) update();
  }

  function syncGridControls() {
    const ratioRow = elements.ratio.value !== "original";
    elements.fitRow.hidden = !ratioRow;
    elements.padColor.closest("label").hidden = !ratioRow || elements.fit.value !== "pad";
    const size = `${elements.rows.value}x${elements.cols.value}`;
    elements.presets.forEach((button) => {
      const active = button.dataset.gridPreset === size && button.dataset.gridRatio === elements.ratio.value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function syncSegmentControls() {
    const mode = elements.segmentMode.value;
    elements.segmentValueRow.hidden = mode !== "pixels" && mode !== "count";
    if (mode === "pixels") {
      elements.segmentValueLabel.textContent = messages.segmentPixels;
      elements.segmentValue.min = "64";
      elements.segmentValue.max = "100000";
      if (Number(elements.segmentValue.value) < 64) elements.segmentValue.value = String(Math.max(64, Math.round(state.width * 1.4) || 1600));
    } else if (mode === "count") {
      elements.segmentValueLabel.textContent = messages.segmentCount;
      elements.segmentValue.min = "1";
      elements.segmentValue.max = String(core.MAX_PARTS);
      if (Number(elements.segmentValue.value) > core.MAX_PARTS || Number(elements.segmentValue.value) < 1) elements.segmentValue.value = "4";
    }
  }

  // ---------- Rendering parts ----------

  function renderRegion(region, { background = null, maxEdge = Infinity } = {}) {
    const scale = Math.min(1, maxEdge / Math.max(region.width, region.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(region.width * scale));
    canvas.height = Math.max(1, Math.round(region.height * scale));
    const ctx = canvas.getContext("2d");
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const left = Math.max(region.x, 0);
    const top = Math.max(region.y, 0);
    const right = Math.min(region.x + region.width, state.width);
    const bottom = Math.min(region.y + region.height, state.height);
    if (right > left && bottom > top) {
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(state.source, left, top, right - left, bottom - top, (left - region.x) * scale, (top - region.y) * scale, (right - left) * scale, (bottom - top) * scale);
    }
    return canvas;
  }

  function canvasToBlob(canvas, type, quality = 0.92) {
    return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error(messages.exportError))), type, quality));
  }

  function imageFormat() {
    const type = elements.format.value === "image/jpeg" ? "image/jpeg" : "image/png";
    return { type, extension: type === "image/jpeg" ? "jpg" : "png" };
  }

  function partBackground(layout, type) {
    if (layout.mode === "grid" && layout.padded) return layout.settings.padColor;
    return type === "image/jpeg" ? "#ffffff" : null;
  }

  function partName(layout, part, extension) {
    const order = layout.mode === "grid" ? layout.settings.order : "reading";
    return core.partFileName(state.fileName, layout.mode === "grid" ? part : { index: part.index }, layout.parts.length, order, extension);
  }

  async function renderPartFiles(onProgress) {
    const layout = state.layout;
    const { type, extension } = imageFormat();
    const files = [];
    for (const part of layout.parts) {
      onProgress?.(files.length + 1, layout.parts.length);
      const canvas = renderRegion(part, { background: partBackground(layout, type) });
      const blob = await canvasToBlob(canvas, type);
      files.push(new File([blob], partName(layout, part, extension), { type }));
      canvas.width = 0;
      canvas.height = 0;
    }
    return layout.mode === "grid" && layout.settings.order === "instagram"
      ? files.sort((a, b) => a.name.localeCompare(b.name))
      : files;
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  async function runExport(task) {
    if (state.busy || !state.layout) return;
    state.busy = true;
    elements.workspace.classList.add("is-busy");
    updateSummary();
    try {
      await task();
    } catch (error) {
      if (error?.name !== "AbortError") {
        setStatus(messages.exportError, "error");
        showError(error?.message || messages.exportError);
      }
    } finally {
      state.busy = false;
      elements.workspace.classList.remove("is-busy");
      updateSummary();
    }
  }

  function progress(current, total) {
    setStatus(text(messages.rendering, { current, total }));
  }

  function exportZip() {
    return runExport(async () => {
      const fflate = await loadLibrary("zip");
      const files = await renderPartFiles(progress);
      const entries = {};
      for (const file of files) entries[file.name] = [new Uint8Array(await file.arrayBuffer()), { level: 0 }];
      const zipped = fflate.zipSync(entries);
      downloadBlob(new Blob([zipped], { type: "application/zip" }), `${state.fileName}_split_${files.length}.zip`);
      setStatus(text(messages.zipDone, { count: files.length }), "ready");
    });
  }

  async function jpegBytes(canvas) {
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
    return new Uint8Array(await blob.arrayBuffer());
  }

  function exportPdf() {
    return runExport(async () => {
      const { jsPDF } = await loadLibrary("pdf");
      const layout = state.layout;
      let doc;
      if (layout.mode === "poster") {
        const { poster } = layout;
        const orientation = elements.orientation.value === "landscape" ? "landscape" : "portrait";
        const format = elements.paper.value === "letter" ? "letter" : elements.paper.value;
        doc = new jsPDF({ orientation, unit: "mm", format, compress: true });
        for (const page of layout.parts) {
          progress(page.index + 1, layout.parts.length);
          if (page.index > 0) doc.addPage(format, orientation);
          const maxEdge = (Math.max(page.drawWidth, page.drawHeight) / 25.4) * PRINT_DPI;
          const canvas = renderRegion(page, { background: "#ffffff", maxEdge });
          doc.addImage(await jpegBytes(canvas), "JPEG", poster.margin, poster.margin, page.drawWidth, page.drawHeight, undefined, "FAST");
          canvas.width = 0;
          if (elements.marks.checked) drawPrintMarks(doc, poster, page, layout.parts.length);
        }
        downloadBlob(doc.output("blob"), `${state.fileName}_poster_${poster.cols}x${poster.rows}_${elements.paper.value.toUpperCase()}.pdf`);
      } else {
        doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
        const [pageWidth, pageHeight] = core.paperSize("a4", "portrait");
        const boxWidth = pageWidth - PDF_MARGIN_MM * 2;
        const boxHeight = pageHeight - PDF_MARGIN_MM * 2;
        const maxEdge = (boxHeight / 25.4) * PRINT_DPI;
        for (const part of layout.parts) {
          progress(part.index + 1, layout.parts.length);
          if (part.index > 0) doc.addPage("a4", "portrait");
          const scale = Math.min(boxWidth / part.width, boxHeight / part.height);
          const width = part.width * scale;
          const height = part.height * scale;
          const canvas = renderRegion(part, { background: "#ffffff", maxEdge });
          doc.addImage(await jpegBytes(canvas), "JPEG", (pageWidth - width) / 2, PDF_MARGIN_MM, width, height, undefined, "FAST");
          canvas.width = 0;
        }
        downloadBlob(doc.output("blob"), `${state.fileName}_A4_${layout.parts.length}p.pdf`);
      }
      setStatus(text(messages.pdfDone, { count: layout.parts.length }), "ready");
    });
  }

  // Crop marks at the printable corners, a dashed line where the previous sheet's overlap ends,
  // and a page label such as "B2 · 5/12" in the top margin.
  function drawPrintMarks(doc, poster, page, total) {
    const left = poster.margin;
    const top = poster.margin;
    const right = left + page.drawWidth;
    const bottom = top + page.drawHeight;
    const mark = Math.min(4, Math.max(poster.margin - 1, 1.5));
    doc.setDrawColor(90, 90, 90);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([], 0);
    [[left, top, -1, -1], [right, top, 1, -1], [left, bottom, -1, 1], [right, bottom, 1, 1]].forEach(([x, y, dx, dy]) => {
      doc.line(x, y, x + dx * mark, y);
      doc.line(x, y, x, y + dy * mark);
    });
    doc.setLineDashPattern([1.5, 1.5], 0);
    if (page.col > 0 && poster.overlap > 0) doc.line(left + poster.overlap, top, left + poster.overlap, bottom);
    if (page.row > 0 && poster.overlap > 0) doc.line(left, top + poster.overlap, right, top + poster.overlap);
    doc.setLineDashPattern([], 0);
    if (poster.margin >= 3) {
      doc.setFontSize(7);
      doc.setTextColor(90, 90, 90);
      doc.text(`${page.label} · ${page.index + 1}/${total}`, left + mark + 1, Math.max(2.5, top - 1.2));
    }
  }

  function canShareFiles() {
    try {
      return typeof navigator.canShare === "function" && navigator.canShare({ files: [new File([new Uint8Array(1)], "a.png", { type: "image/png" })] });
    } catch {
      return false;
    }
  }

  function updateShareLabel() {
    const label = elements.share.querySelector("span");
    if (label) label.textContent = state.prepared ? messages.shareReady : messages.share;
  }

  function settingsKey() {
    return JSON.stringify([state.mode, elements.format.value, state.layout?.parts.map((part) => [part.x, part.y, part.width, part.height])]);
  }

  // Sharing needs a fresh tap. If rendering used up the browser's user-activation window,
  // the files stay prepared and the next tap shares them immediately.
  function shareParts() {
    if (state.prepared?.key === settingsKey()) {
      return navigator.share({ files: state.prepared.files }).then(() => setStatus(messages.shared, "ready")).catch((error) => {
        if (error?.name !== "AbortError") showError(messages.shareError);
      });
    }
    return runExport(async () => {
      const files = await renderPartFiles(progress);
      state.prepared = { key: settingsKey(), files };
      try {
        await navigator.share({ files });
        setStatus(messages.shared, "ready");
      } catch (error) {
        if (error?.name === "NotAllowedError") {
          setStatus(messages.shareTapAgain, "ready");
          updateShareLabel();
        } else if (error?.name !== "AbortError") {
          throw new Error(messages.shareError);
        }
      }
    });
  }

  function partAtPointer(event) {
    if (!state.view || !state.layout || state.layout.mode === "poster") return null;
    const rect = elements.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / state.view.scale + state.view.x;
    const y = (event.clientY - rect.top) / state.view.scale + state.view.y;
    return state.layout.parts.find((part) => x >= part.x && x < part.x + part.width && y >= part.y && y < part.y + part.height) || null;
  }

  function downloadSinglePart(event) {
    const part = partAtPointer(event);
    if (!part || state.busy) return;
    runExport(async () => {
      const { type, extension } = imageFormat();
      const canvas = renderRegion(part, { background: partBackground(state.layout, type) });
      const name = partName(state.layout, part, extension);
      downloadBlob(await canvasToBlob(canvas, type), name);
      setStatus(text(messages.singleDone, { name }), "ready");
    });
  }

  function changeLocale() {
    const prefixes = { "zh-CN": "", "zh-TW": "zh-tw/", en: "en/", ja: "ja/", ko: "ko/" };
    const prefix = prefixes[elements.locale.value];
    if (prefix === undefined) return;
    try { localStorage.setItem("jianfan-locale-manual", "1"); } catch { /* Navigation still works without storage. */ }
    window.location.assign(`/${prefix}image-splitter/`);
  }

  // ---------- Events ----------

  elements.file.addEventListener("change", () => loadFile(elements.file.files?.[0]));
  elements.sample.addEventListener("click", loadSample);
  elements.drop.addEventListener("dragover", (event) => { event.preventDefault(); elements.drop.classList.add("is-dragging"); });
  elements.drop.addEventListener("dragleave", () => elements.drop.classList.remove("is-dragging"));
  elements.drop.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.drop.classList.remove("is-dragging");
    loadFile(event.dataTransfer?.files?.[0]);
  });
  elements.frame.addEventListener("dragover", (event) => event.preventDefault());
  elements.frame.addEventListener("drop", (event) => { event.preventDefault(); loadFile(event.dataTransfer?.files?.[0]); });
  document.addEventListener("paste", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    const item = [...(event.clipboardData?.items || [])].find((entry) => entry.type.startsWith("image/"));
    if (item) loadFile(item.getAsFile());
  });
  elements.modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.splitterMode)));
  elements.presets.forEach((button) => button.addEventListener("click", () => {
    const [rows, cols] = button.dataset.gridPreset.split("x");
    elements.rows.value = rows;
    elements.cols.value = cols;
    elements.ratio.value = button.dataset.gridRatio;
    syncGridControls();
    update();
  }));
  [elements.rows, elements.cols].forEach((input) => {
    input.addEventListener("input", () => { if (input.value !== "") { syncGridControls(); update(); } });
    input.addEventListener("change", () => { input.value = String(core.clampInt(input.value, 1, core.MAX_GRID, 3)); syncGridControls(); update(); });
  });
  [elements.ratio, elements.fit, elements.padColor, elements.order].forEach((input) => input.addEventListener("change", () => { syncGridControls(); update(); }));
  elements.segmentMode.addEventListener("change", () => { syncSegmentControls(); update(); });
  elements.segmentValue.addEventListener("change", () => {
    const pixels = elements.segmentMode.value === "pixels";
    elements.segmentValue.value = String(core.clampInt(elements.segmentValue.value, pixels ? 64 : 1, pixels ? 100000 : core.MAX_PARTS, pixels ? 1600 : 4));
    update();
  });
  elements.smartCut.addEventListener("change", update);
  [elements.paper, elements.orientation, elements.posterCols, elements.margin, elements.overlap].forEach((input) => input.addEventListener("change", () => {
    if (input.type === "number") input.value = String(Math.min(Number(input.max), Math.max(Number(input.min), Number(input.value) || 0)));
    update();
  }));
  elements.format.addEventListener("change", () => { state.prepared = null; updateShareLabel(); });
  elements.zip.addEventListener("click", exportZip);
  elements.pdf.addEventListener("click", exportPdf);
  elements.share.addEventListener("click", shareParts);
  elements.reset.addEventListener("click", resetTool);
  elements.canvas.addEventListener("click", downloadSinglePart);
  elements.canvas.addEventListener("pointermove", (event) => { elements.canvas.style.cursor = partAtPointer(event) ? "pointer" : "default"; });
  elements.locale?.addEventListener("change", changeLocale);
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(renderPreview);
  });

  syncGridControls();
  syncSegmentControls();
  setMode("grid", false);
})();
