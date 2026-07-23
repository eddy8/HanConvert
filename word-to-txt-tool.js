(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WordToTxtCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_FILES = 20;
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

  function toTxtFilename(filename) {
    const basename = String(filename || "document").replace(/\.[^.]+$/, "") || "document";
    return `${basename}.txt`;
  }

  function validateFileDescriptor(filename, size) {
    if (!/\.docx$/i.test(String(filename || ""))) return "unsupported";
    if (Number(size) > MAX_FILE_SIZE_BYTES) return "tooLarge";
    return "";
  }

  function createUniqueTxtFilenames(filenames) {
    const used = new Set();
    return filenames.map((filename) => {
      const initial = toTxtFilename(filename);
      const stem = initial.slice(0, -4);
      let candidate = initial;
      let suffix = 2;
      while (used.has(candidate.toLocaleLowerCase())) {
        candidate = `${stem}-${suffix}.txt`;
        suffix += 1;
      }
      used.add(candidate.toLocaleLowerCase());
      return candidate;
    });
  }

  return {
    MAX_FILES,
    MAX_FILE_SIZE_BYTES,
    createUniqueTxtFilenames,
    toTxtFilename,
    validateFileDescriptor
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;

  const core = globalThis.WordToTxtCore;
  const body = document.body;
  const elements = {
    localeSelect: document.querySelector("#localeSelect"),
    input: document.querySelector("#wordFileInput"),
    drop: document.querySelector("#wordFileDrop"),
    status: document.querySelector("#wordToolStatus"),
    list: document.querySelector("#wordFileList"),
    empty: document.querySelector("#wordPreviewEmpty"),
    editorPane: document.querySelector("#wordEditorPane"),
    editor: document.querySelector("#wordTextEditor"),
    selectedName: document.querySelector("#wordSelectedName"),
    selectedMeta: document.querySelector("#wordSelectedMeta"),
    charCount: document.querySelector("#wordCharacterCount"),
    copy: document.querySelector("#wordCopyButton"),
    download: document.querySelector("#wordDownloadButton"),
    downloadAll: document.querySelector("#wordDownloadAllButton"),
    clear: document.querySelector("#wordClearButton")
  };

  const localePrefixes = {
    "zh-CN": "",
    "zh-TW": "zh-tw/",
    en: "en/",
    ja: "ja/",
    ko: "ko/"
  };

  let entries = [];
  let selectedId = "";
  let nextId = 1;
  let processingToken = 0;

  function message(key, values = {}) {
    const attribute = `message${key[0].toUpperCase()}${key.slice(1)}`;
    return (body.dataset[attribute] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(body.dataset.locale || "en").format(value);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function setStatus(text, type = "idle") {
    elements.status.classList.toggle("is-ready", type === "ready");
    elements.status.classList.toggle("is-error", type === "error");
    elements.status.lastElementChild.textContent = text;
  }

  function getSelectedEntry() {
    return entries.find((entry) => entry.id === selectedId);
  }

  function render() {
    elements.list.replaceChildren();

    for (const entry of entries) {
      const item = document.createElement("li");
      item.className = "word-file-item";
      if (entry.id === selectedId) item.classList.add("is-active");
      if (entry.error) item.classList.add("is-error");

      const button = document.createElement("button");
      button.type = "button";
      button.disabled = Boolean(entry.error);
      button.dataset.fileId = entry.id;
      button.setAttribute("aria-pressed", String(entry.id === selectedId));

      const name = document.createElement("strong");
      name.textContent = entry.name;
      const meta = document.createElement("span");
      meta.textContent = entry.error
        ? entry.error
        : `${formatNumber(entry.text.length)} ${message("characters")} · ${formatBytes(entry.size)}`;
      button.append(name, meta);
      item.append(button);
      elements.list.append(item);
    }

    const selected = getSelectedEntry();
    elements.empty.hidden = Boolean(selected);
    elements.editorPane.hidden = !selected;
    elements.downloadAll.disabled = !entries.some((entry) => !entry.error);
    elements.clear.disabled = entries.length === 0;

    if (!selected) return;
    elements.selectedName.textContent = selected.name;
    elements.selectedMeta.textContent = `${core.toTxtFilename(selected.name)} · UTF-8`;
    if (elements.editor.value !== selected.text) elements.editor.value = selected.text;
    elements.charCount.textContent = `${formatNumber(selected.text.length)} ${message("characters")}`;
  }

  async function processFiles(fileList) {
    const files = Array.from(fileList).slice(0, core.MAX_FILES);
    if (!files.length) return;
    const token = ++processingToken;

    entries = [];
    selectedId = "";
    setStatus(message("reading", { count: files.length }));
    render();

    if (!globalThis.mammoth) {
      setStatus(message("libraryError"), "error");
      return;
    }

    for (const file of files) {
      const validation = core.validateFileDescriptor(file.name, file.size);
      const entry = {
        id: String(nextId++),
        name: file.name,
        size: file.size,
        text: "",
        error: ""
      };

      if (validation === "unsupported") {
        entry.error = message("unsupported");
      } else if (validation === "tooLarge") {
        entry.error = message("tooLarge", { limit: formatBytes(core.MAX_FILE_SIZE_BYTES) });
      } else {
        try {
          const result = await globalThis.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
          if (token !== processingToken) return;
          entry.text = String(result.value || "").replace(/\r\n?/g, "\n").trim();
          if (!entry.text) entry.error = message("emptyFile");
        } catch (error) {
          console.error(error);
          entry.error = message("failed");
        }
      }

      if (token !== processingToken) return;
      entries.push(entry);
      if (!selectedId && !entry.error) selectedId = entry.id;
      render();
    }

    const readyCount = entries.filter((entry) => !entry.error).length;
    if (readyCount) {
      setStatus(message("ready", { ready: readyCount, total: entries.length }), "ready");
    } else {
      setStatus(message("noneReady"), "error");
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function downloadText(entry) {
    const blob = new Blob([`\uFEFF${entry.text}`], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, core.toTxtFilename(entry.name));
    setStatus(message("downloaded", { name: core.toTxtFilename(entry.name) }), "ready");
  }

  async function downloadAll() {
    const readyEntries = entries.filter((entry) => !entry.error);
    if (!readyEntries.length) return;
    if (readyEntries.length === 1) {
      downloadText(readyEntries[0]);
      return;
    }
    if (!globalThis.JSZip) {
      setStatus(message("zipError"), "error");
      return;
    }

    elements.downloadAll.disabled = true;
    setStatus(message("packing"));
    try {
      const zip = new globalThis.JSZip();
      const filenames = core.createUniqueTxtFilenames(readyEntries.map((entry) => entry.name));
      readyEntries.forEach((entry, index) => {
        zip.file(filenames[index], `\uFEFF${entry.text}`);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "jianfan-word-to-txt.zip");
      setStatus(message("allDownloaded", { count: readyEntries.length }), "ready");
    } catch (error) {
      console.error(error);
      setStatus(message("zipError"), "error");
    } finally {
      elements.downloadAll.disabled = false;
    }
  }

  elements.input.addEventListener("change", () => {
    processFiles(elements.input.files);
    elements.input.value = "";
  });

  elements.drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.drop.classList.add("is-dragging");
  });

  elements.drop.addEventListener("dragleave", () => {
    elements.drop.classList.remove("is-dragging");
  });

  elements.drop.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.drop.classList.remove("is-dragging");
    processFiles(event.dataTransfer.files);
  });

  elements.list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-file-id]");
    if (!button || button.disabled) return;
    selectedId = button.dataset.fileId;
    render();
  });

  elements.editor.addEventListener("input", () => {
    const selected = getSelectedEntry();
    if (!selected) return;
    selected.text = elements.editor.value;
    elements.charCount.textContent = `${formatNumber(selected.text.length)} ${message("characters")}`;
  });

  elements.copy.addEventListener("click", async () => {
    const selected = getSelectedEntry();
    if (!selected) return;
    await navigator.clipboard.writeText(selected.text);
    setStatus(message("copied"), "ready");
  });

  elements.download.addEventListener("click", () => {
    const selected = getSelectedEntry();
    if (selected) downloadText(selected);
  });

  elements.downloadAll.addEventListener("click", downloadAll);

  elements.clear.addEventListener("click", () => {
    processingToken += 1;
    entries = [];
    selectedId = "";
    elements.editor.value = "";
    setStatus(message("idle"));
    render();
  });

  elements.localeSelect.addEventListener("change", () => {
    const locale = elements.localeSelect.value;
    localStorage.setItem("jianfan-locale", locale);
    localStorage.setItem("jianfan-locale-manual", "1");
    window.location.assign(`/${localePrefixes[locale] || ""}word-to-txt/`);
  });

  setStatus(message("idle"));
  render();
})();
