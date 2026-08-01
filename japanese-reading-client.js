(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.JapaneseReadingClient = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_WORKER_PATH = "/japanese-reading-worker.js";

  function createClient(options = {}) {
    const WorkerConstructor = options.Worker || globalThis.Worker;
    if (typeof WorkerConstructor !== "function") {
      const error = new Error("Web Workers are unavailable");
      error.code = "WORKER_UNAVAILABLE";
      throw error;
    }

    const worker = new WorkerConstructor(options.workerPath || DEFAULT_WORKER_PATH);
    const requests = new Map();
    let sequence = 0;
    let closed = false;

    worker.addEventListener("message", (event) => {
      const message = event.data || {};
      const request = requests.get(message.id);
      if (!request) return;

      if (message.type === "progress") {
        request.onProgress?.(message.progress || {});
        return;
      }

      requests.delete(message.id);
      if (message.type === "result") {
        request.resolve(message.result || "");
        return;
      }

      const error = new Error(message.message || "Japanese reading conversion failed");
      error.code = message.code || "CONVERSION_FAILED";
      request.reject(error);
    });

    worker.addEventListener("error", (event) => {
      const error = new Error(event.message || "Japanese reading worker failed");
      error.code = "WORKER_FAILED";
      rejectAll(error);
    });

    function rejectAll(error) {
      for (const request of requests.values()) request.reject(error);
      requests.clear();
    }

    function convert(payload, onProgress) {
      if (closed) {
        const error = new Error("Japanese reading client is closed");
        error.code = "CLIENT_CLOSED";
        return Promise.reject(error);
      }

      const id = ++sequence;
      return new Promise((resolve, reject) => {
        requests.set(id, { resolve, reject, onProgress });
        worker.postMessage({ type: "convert", id, ...payload });
      });
    }

    function close() {
      if (closed) return;
      closed = true;
      const error = new Error("Japanese reading client was closed");
      error.code = "CLIENT_CLOSED";
      rejectAll(error);
      worker.terminate();
    }

    return Object.freeze({ close, convert });
  }

  return Object.freeze({ DEFAULT_WORKER_PATH, createClient });
});
