(function (root, factory) {
  "use strict";

  const api = factory();
  root.PhotoChineseCharacterRecognitionApi = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";

  const HAN_PATTERN = /\p{Script=Han}/u;

  function parseSuccess(payload) {
    let result = payload;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result);
      } catch {
        throw new Error("识别服务返回了无法解析的结果");
      }
    }
    const text = result && typeof result.text === "string" ? result.text.trim() : "";
    if (!text || !HAN_PATTERN.test(text)) throw new Error("识别服务没有返回可用的汉字文本");
    return text;
  }

  function parseError(payload, status) {
    const error = payload && typeof payload.error === "object" ? payload.error : null;
    if (error && typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    if (status === 401) return "识别服务鉴权失败";
    if (status === 413) return "图片超过大小限制";
    if (status === 415) return "图片格式不受支持";
    if (status === 422) return "未能识别出一个明确的汉字";
    return "识别服务暂时不可用，请稍后重试";
  }

  function findContentBounds(imageData) {
    const width = imageData?.width;
    const height = imageData?.height;
    const data = imageData?.data;
    const fullImage = { x: 0, y: 0, width, height, cropped: false };
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 16 || height < 16 || !data) {
      return fullImage;
    }

    const patchSize = Math.max(3, Math.floor(Math.min(width, height) * 0.06));
    const corners = [
      samplePatch(data, width, 0, 0, patchSize, patchSize),
      samplePatch(data, width, width - patchSize, 0, patchSize, patchSize),
      samplePatch(data, width, 0, height - patchSize, patchSize, patchSize),
      samplePatch(data, width, width - patchSize, height - patchSize, patchSize, patchSize)
    ];
    const backgrounds = corners.filter((corner) => (
      corners.filter((candidate) => colorDistance(corner, candidate) < 60).length >= 2
    ));
    if (!backgrounds.length) return fullImage;

    const rowCounts = new Uint32Array(height);
    const columnCounts = new Uint32Array(width);
    let foregroundPixels = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const pixel = { r: data[offset], g: data[offset + 1], b: data[offset + 2] };
        const isBackground = backgrounds.some((background) => (
          colorDistance(pixel, background) <= background.tolerance
        ));
        if (isBackground) continue;
        rowCounts[y] += 1;
        columnCounts[x] += 1;
        foregroundPixels += 1;
      }
    }

    const foregroundRatio = foregroundPixels / (width * height);
    if (foregroundRatio < 0.001 || foregroundRatio > 0.86) return fullImage;

    const minimumRowPixels = Math.max(2, Math.floor(width * 0.004));
    const minimumColumnPixels = Math.max(2, Math.floor(height * 0.004));
    const top = firstDenseIndex(rowCounts, minimumRowPixels);
    const bottom = lastDenseIndex(rowCounts, minimumRowPixels);
    const left = firstDenseIndex(columnCounts, minimumColumnPixels);
    const right = lastDenseIndex(columnCounts, minimumColumnPixels);
    if (top < 0 || bottom < top || left < 0 || right < left) return fullImage;

    const contentWidth = right - left + 1;
    const contentHeight = bottom - top + 1;
    const padding = Math.max(4, Math.round(Math.max(contentWidth, contentHeight) * 0.08));
    const x = Math.max(0, left - padding);
    const y = Math.max(0, top - padding);
    const cropRight = Math.min(width, right + padding + 1);
    const cropBottom = Math.min(height, bottom + padding + 1);
    const cropWidth = cropRight - x;
    const cropHeight = cropBottom - y;
    if ((cropWidth * cropHeight) / (width * height) > 0.94) return fullImage;

    return { x, y, width: cropWidth, height: cropHeight, cropped: true };
  }

  function samplePatch(data, imageWidth, left, top, width, height) {
    const red = [];
    const green = [];
    const blue = [];
    const step = Math.max(1, Math.floor(Math.min(width, height) / 8));
    for (let y = top; y < top + height; y += step) {
      for (let x = left; x < left + width; x += step) {
        const offset = (y * imageWidth + x) * 4;
        red.push(data[offset]);
        green.push(data[offset + 1]);
        blue.push(data[offset + 2]);
      }
    }
    const background = { r: median(red), g: median(green), b: median(blue) };
    const noise = [];
    for (let index = 0; index < red.length; index += 1) {
      noise.push(colorDistance({ r: red[index], g: green[index], b: blue[index] }, background));
    }
    background.tolerance = Math.max(34, percentile(noise, 0.85) * 2.4 + 12);
    return background;
  }

  function colorDistance(first, second) {
    return Math.hypot(first.r - second.r, first.g - second.g, first.b - second.b);
  }

  function median(values) {
    return percentile(values, 0.5);
  }

  function percentile(values, ratio) {
    if (!values.length) return 0;
    const sorted = [...values].sort((first, second) => first - second);
    return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))];
  }

  function firstDenseIndex(counts, minimum) {
    for (let index = 0; index < counts.length; index += 1) {
      if (counts[index] >= minimum) return index;
    }
    return -1;
  }

  function lastDenseIndex(counts, minimum) {
    for (let index = counts.length - 1; index >= 0; index -= 1) {
      if (counts[index] >= minimum) return index;
    }
    return -1;
  }

  return { parseSuccess, parseError, findContentBounds };
});

(function () {
  "use strict";

  if (typeof document !== "object") return;

  const OCR_URL = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    ? "http://localhost:8787/api/ocr/text"
    : "/api/ocr/text";
  const OCR_AUTHORIZATION = "QmVhcmVyIGdlbWluaQ==";
  const OCR_TIMEOUT = 30000;
  const MAX_SOURCE_BYTES = 24 * 1024 * 1024;
  const MAX_PROCESSED_IMAGE_BYTES = 2 * 1024 * 1024;
  const MAX_IMAGE_DIMENSION = 1600;
  const STROKE_DATA_ORIGIN = "https://cdn.jsdelivr.net/npm/hanzi-writer-data";
  const HAN_PATTERN = /^\p{Script=Han}$/u;
  const localePaths = {
    "zh-CN": "/",
    "zh-TW": "/zh-tw/",
    en: "/en/",
    ja: "/ja/",
    ko: "/ko/"
  };
  const SUPPORTED_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/heif"
  ]);
  const EXTENSION_TYPES = new Map([
    ["png", "image/png"],
    ["jpg", "image/jpeg"],
    ["jpeg", "image/jpeg"],
    ["webp", "image/webp"],
    ["heic", "image/heic"],
    ["heif", "image/heif"]
  ]);

  const body = document.body;
  const locale = body.dataset.locale || "zh-CN";
  const pageSlug = body.dataset.pageSlug || "photo-chinese-character-recognition";
  const messages = readMessages();
  const input = document.querySelector("#photoInput");
  const captureButton = document.querySelector("#photoCapture");
  const resetButton = document.querySelector("#photoReset");
  const sourceCanvas = document.querySelector("#photoSourceCanvas");
  const sourceFrame = document.querySelector("#photoSourceFrame");
  const sourceEmpty = document.querySelector("#photoSourceEmpty");
  const recognizeButton = document.querySelector("#photoRecognize");
  const status = document.querySelector("#photoOcrStatus");
  const resultText = document.querySelector("#photoResultText");
  const resultsEmpty = document.querySelector("#photoResultsEmpty");
  const textActions = document.querySelector("#photoTextActions");
  const resultSummary = document.querySelector("#photoResultSummary");
  const copyTextButton = document.querySelector("#photoCopyText");
  const pinyinTextLink = document.querySelector("#photoPinyinText");
  const characterDetail = document.querySelector("#photoCharacterDetail");
  const resultCharacter = document.querySelector("#photoResultCharacter");
  const resultPinyin = document.querySelector("#photoResultPinyin");
  const resultStrokes = document.querySelector("#photoResultStrokes");
  const resultUnicode = document.querySelector("#photoResultUnicode");
  const copyCharacterButton = document.querySelector("#photoCopyCharacter");
  const strokeLink = document.querySelector("#photoStrokeLink");
  const pinyinLink = document.querySelector("#photoPinyinLink");
  const structureLink = document.querySelector("#photoStructureLink");

  if (!input || !sourceCanvas || !window.PhotoChineseCharacterRecognitionApi) return;

  const sourceContext = sourceCanvas.getContext("2d");
  let selectedFile;
  let recognitionController;
  let recognizedText = "";
  let selectedCharacter = "";
  let selectionId = 0;
  let detailRequestId = 0;

  setupLocaleSelector();
  input.addEventListener("change", handleFileSelection);
  captureButton.addEventListener("click", openImagePicker);
  resetButton.addEventListener("click", openImagePicker);
  recognizeButton.addEventListener("click", recognizeImage);
  copyTextButton.addEventListener("click", () => copyValue(recognizedText, "copiedText"));
  copyCharacterButton.addEventListener("click", () => copyValue(selectedCharacter, "copiedCharacter"));

  function readMessages() {
    try {
      return JSON.parse(document.querySelector("#photoOcrMessages")?.textContent || "{}");
    } catch {
      return {};
    }
  }

  function message(key, values = {}) {
    let value = messages[key] || key;
    for (const [name, replacement] of Object.entries(values)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
    return value;
  }

  function setupLocaleSelector() {
    const selector = document.querySelector("#localeSelect");
    if (!selector) return;
    selector.addEventListener("change", () => {
      const nextLocale = selector.value;
      localStorage.setItem("jianfan-locale", nextLocale);
      localStorage.setItem("jianfan-locale-manual", "1");
      window.location.href = `${localePaths[nextLocale] || "/"}${pageSlug}/`.replace("//", "/");
    });
  }

  function openImagePicker() {
    input.value = "";
    input.click();
  }

  async function handleFileSelection() {
    const file = input.files?.[0];
    if (!file) return;

    recognitionController?.abort();
    recognitionController = undefined;
    clearRecognitionResult();
    selectedFile = undefined;
    recognizeButton.disabled = true;
    selectionId += 1;
    const currentSelectionId = selectionId;

    let sourceFile;
    try {
      sourceFile = normalizeImageFile(file);
    } catch (error) {
      resetPreview();
      resetButton.disabled = true;
      setStatus(message(error.message), "error");
      return;
    }

    resetButton.disabled = false;
    setStatus(message("processingImage"));

    try {
      const image = await decodeImage(sourceFile);
      if (selectionId !== currentSelectionId) {
        image.close?.();
        return;
      }
      const crop = detectContentCrop(image);
      drawSourceImage(image, crop);
      let uploadFile;
      try {
        uploadFile = await compressImage(image, sourceFile, crop);
      } finally {
        image.close?.();
      }
      if (selectionId !== currentSelectionId) return;
      selectedFile = uploadFile;
      recognizeButton.disabled = false;
      setStatus(message("imageReady"), "ready");
    } catch {
      if (selectionId !== currentSelectionId) return;
      if (sourceFile.size > MAX_PROCESSED_IMAGE_BYTES) {
        selectedFile = undefined;
        resetPreview();
        setStatus(message("compressionFailed"), "error");
        return;
      }
      selectedFile = sourceFile;
      recognizeButton.disabled = false;
      showPreviewFallback(sourceFile.name);
      setStatus(message("imageReady"), "ready");
    }
  }

  function normalizeImageFile(file) {
    if (file.size === 0) throw new Error("emptyImage");
    if (file.size > MAX_SOURCE_BYTES) throw new Error("sourceTooLarge");

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const declaredType = file.type.toLowerCase();
    const type = declaredType === "image/jpg"
      ? "image/jpeg"
      : SUPPORTED_TYPES.has(declaredType)
        ? declaredType
        : EXTENSION_TYPES.get(extension) || declaredType;
    if (!SUPPORTED_TYPES.has(type)) throw new Error("unsupportedImage");
    if (file.type.toLowerCase() === type) return file;
    return new File([file], file.name, { type, lastModified: file.lastModified });
  }

  async function decodeImage(file) {
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(file, { imageOrientation: "from-image" });
      } catch {
        return createImageBitmap(file);
      }
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

  function detectContentCrop(image) {
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const scale = Math.min(1, 640 / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const bounds = window.PhotoChineseCharacterRecognitionApi.findContentBounds(
      context.getImageData(0, 0, canvas.width, canvas.height)
    );
    if (!bounds.cropped) {
      return { x: 0, y: 0, width: sourceWidth, height: sourceHeight, cropped: false };
    }

    const x = Math.max(0, Math.floor(bounds.x / scale));
    const y = Math.max(0, Math.floor(bounds.y / scale));
    const right = Math.min(sourceWidth, Math.ceil((bounds.x + bounds.width) / scale));
    const bottom = Math.min(sourceHeight, Math.ceil((bounds.y + bounds.height) / scale));
    return { x, y, width: right - x, height: bottom - y, cropped: true };
  }

  async function compressImage(image, sourceFile, crop) {
    let blob = await encodeJpeg(image, crop, MAX_IMAGE_DIMENSION, 0.86);
    if (blob.size > MAX_PROCESSED_IMAGE_BYTES) blob = await encodeJpeg(image, crop, MAX_IMAGE_DIMENSION, 0.72);
    if (blob.size > MAX_PROCESSED_IMAGE_BYTES) blob = await encodeJpeg(image, crop, 1200, 0.68);
    if (blob.size > MAX_PROCESSED_IMAGE_BYTES) throw new Error("COMPRESSED_IMAGE_TOO_LARGE");
    if (!crop.cropped && sourceFile.size <= MAX_PROCESSED_IMAGE_BYTES && sourceFile.size <= blob.size) {
      return sourceFile;
    }

    const fileName = sourceFile.name.replace(/\.[^.]+$/, "") || "hanzi";
    return new File([blob], `${fileName}.jpg`, {
      type: "image/jpeg",
      lastModified: sourceFile.lastModified
    });
  }

  function encodeJpeg(image, crop, maxDimension, quality) {
    const scale = Math.min(1, maxDimension / Math.max(crop.width, crop.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(crop.width * scale));
    canvas.height = Math.max(1, Math.round(crop.height * scale));
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("IMAGE_COMPRESSION_FAILED")),
        "image/jpeg",
        quality
      );
    });
  }

  function drawSourceImage(image, crop) {
    const canvasSize = 720;
    const scale = Math.min(canvasSize / crop.width, canvasSize / crop.height);
    const width = Math.max(1, Math.round(crop.width * scale));
    const height = Math.max(1, Math.round(crop.height * scale));
    sourceCanvas.width = canvasSize;
    sourceCanvas.height = canvasSize;
    sourceContext.fillStyle = "#0a1714";
    sourceContext.fillRect(0, 0, canvasSize, canvasSize);
    sourceContext.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      Math.round((canvasSize - width) / 2),
      Math.round((canvasSize - height) / 2),
      width,
      height
    );
    sourceFrame.classList.remove("is-empty");
  }

  function showPreviewFallback(fileName) {
    sourceFrame.classList.add("is-empty");
    sourceEmpty.querySelector("strong").textContent = message("imageSelected");
    sourceEmpty.querySelector("span").textContent = fileName;
  }

  function resetPreview() {
    sourceContext.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceFrame.classList.add("is-empty");
    sourceEmpty.querySelector("strong").textContent = message("emptyPreviewTitle");
    sourceEmpty.querySelector("span").textContent = message("emptyPreviewBody");
  }

  async function recognizeImage() {
    if (!selectedFile || recognitionController) return;

    clearRecognitionResult();
    const controller = new AbortController();
    recognitionController = controller;
    recognizeButton.disabled = true;
    setStatus(message("uploading"));
    resultsEmpty.textContent = message("recognizing");
    resultsEmpty.hidden = false;

    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, OCR_TIMEOUT);
    try {
      const form = new FormData();
      form.append("image", selectedFile, selectedFile.name);
      const response = await fetch(OCR_URL, {
        method: "POST",
        headers: { Authorization: window.atob(OCR_AUTHORIZATION) },
        credentials: "omit",
        body: form,
        signal: controller.signal
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw userFacingError(errorMessageForStatus(response.status));

      let result;
      try {
        result = window.PhotoChineseCharacterRecognitionApi.parseSuccess(payload);
      } catch {
        throw userFacingError(message("noText"));
      }
      renderResult(result);
      const characters = [...result];
      setStatus(
        characters.length === 1 && HAN_PATTERN.test(result)
          ? message("recognizedCharacter", { character: result })
          : message("recognizedText"),
        "ready"
      );
    } catch (error) {
      if (error.name === "AbortError") {
        if (timedOut) showRecognitionError(message("timeout"));
      } else if (error.name === "OcrServiceError") {
        showRecognitionError(error.message);
      } else {
        showRecognitionError(message("networkError"));
      }
    } finally {
      window.clearTimeout(timeout);
      if (recognitionController === controller) {
        recognitionController = undefined;
        recognizeButton.disabled = !selectedFile;
      }
    }
  }

  function errorMessageForStatus(code) {
    if (code === 401) return message("authError");
    if (code === 413) return message("uploadTooLarge");
    if (code === 415) return message("unsupportedImage");
    if (code === 422) return message("noText");
    return message("serviceUnavailable");
  }

  function userFacingError(value) {
    const error = new Error(value);
    error.name = "OcrServiceError";
    return error;
  }

  function renderResult(text) {
    recognizedText = text;
    selectedCharacter = "";
    resultText.replaceChildren();
    resultsEmpty.hidden = true;

    const characters = [...text];
    const hanCharacters = characters.filter((character) => HAN_PATTERN.test(character));
    for (const character of characters) {
      if (!HAN_PATTERN.test(character)) {
        resultText.append(document.createTextNode(character));
        continue;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "photo-ocr-text-character";
      button.textContent = character;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", message("selectCharacter", { character }));
      button.addEventListener("click", () => selectResultCharacter(character, button));
      resultText.append(button);
    }

    resultText.hidden = false;
    resultSummary.textContent = message("resultSummary", {
      count: hanCharacters.length.toLocaleString(locale)
    });
    textActions.hidden = false;
    pinyinTextLink.href = `${localePaths[locale]}chinese-to-pinyin/?text=${encodeURIComponent(text)}`;
    pinyinTextLink.hidden = characters.length === 1;

    const firstCharacterButton = resultText.querySelector("button");
    if (firstCharacterButton) selectResultCharacter(firstCharacterButton.textContent, firstCharacterButton);
  }

  async function selectResultCharacter(character, button) {
    selectedCharacter = character;
    resultText.querySelectorAll("button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    characterDetail.hidden = false;
    resultCharacter.textContent = character;
    resultPinyin.textContent = getReadings(character) || "-";
    resultStrokes.textContent = "…";
    resultUnicode.textContent = formatUnicode(character);
    strokeLink.href = `${localePaths[locale]}chinese-stroke-order/?character=${encodeURIComponent(character)}`;
    pinyinLink.href = `${localePaths[locale]}chinese-to-pinyin/?character=${encodeURIComponent(character)}`;
    structureLink.href = `${localePaths[locale]}chinese-character-lookup/?character=${encodeURIComponent(character)}`;

    const requestId = ++detailRequestId;
    try {
      const response = await fetch(`${STROKE_DATA_ORIGIN}/${encodeURIComponent(character)}.json`, { mode: "cors" });
      if (!response.ok) throw new Error("Stroke data unavailable");
      const data = await response.json();
      if (requestId === detailRequestId && selectedCharacter === character) {
        resultStrokes.textContent = Array.isArray(data.strokes)
          ? data.strokes.length.toLocaleString(locale)
          : "-";
      }
    } catch {
      if (requestId === detailRequestId && selectedCharacter === character) resultStrokes.textContent = "-";
    }
  }

  function getReadings(character) {
    try {
      const readings = window.pinyinPro
        ?.polyphonic(character, { type: "array", toneType: "symbol", traditional: true })
        ?.flat(Infinity)
        .flatMap((item) => String(item).split(/\s+/u))
        .filter(Boolean);
      return [...new Set(readings || [])].join(" / ");
    } catch {
      return "";
    }
  }

  function formatUnicode(character) {
    return `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
  }

  async function copyValue(value, successKey) {
    if (!value) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const helper = document.createElement("textarea");
        helper.value = value;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.append(helper);
        helper.select();
        if (!document.execCommand("copy")) throw new Error("Copy command failed");
        helper.remove();
      }
      setStatus(message(successKey, { character: value }), "ready");
    } catch {
      setStatus(message("copyFailed"), "error");
    }
  }

  function clearRecognitionResult() {
    recognizedText = "";
    selectedCharacter = "";
    detailRequestId += 1;
    resultText.replaceChildren();
    resultText.hidden = true;
    pinyinTextLink.hidden = true;
    resultsEmpty.hidden = false;
    resultsEmpty.textContent = message("resultEmpty");
    textActions.hidden = true;
    characterDetail.hidden = true;
  }

  function showRecognitionError(value) {
    resultsEmpty.textContent = value;
    resultsEmpty.hidden = false;
    setStatus(message("recognitionFailed"), "error");
  }

  function setStatus(value, type = "idle") {
    status.classList.toggle("is-ready", type === "ready");
    status.classList.toggle("is-error", type === "error");
    status.lastElementChild.textContent = value;
  }
})();
