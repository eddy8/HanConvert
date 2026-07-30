"use strict";

const HANZI_LOOKUP_COMMIT = "01f90c3ab99a8fadf0696c28e5eb097223c500db";
const HANZI_LOOKUP_BASE = `https://cdn.jsdmirror.cn/gh/gugray/hanzi_lookup@${HANZI_LOOKUP_COMMIT}/web_demo`;

let readyPromise;

try {
  importScripts(`${HANZI_LOOKUP_BASE}/hanzi_lookup.js`);
  readyPromise = self.wasm_bindgen(`${HANZI_LOOKUP_BASE}/hanzi_lookup_bg.wasm`);
  readyPromise
    .then(() => self.postMessage({ type: "ready" }))
    .catch((error) => self.postMessage({ type: "error", message: String(error?.message || error) }));
} catch (error) {
  readyPromise = Promise.reject(error);
  readyPromise.catch(() => {});
  self.postMessage({ type: "error", message: String(error?.message || error) });
}

self.addEventListener("message", async (event) => {
  if (event.data?.type !== "lookup") return;

  const requestId = event.data.requestId;
  try {
    await readyPromise;
    const json = self.wasm_bindgen.lookup(event.data.strokes, event.data.limit);
    self.postMessage({ type: "results", requestId, matches: JSON.parse(json) });
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId,
      message: String(error?.message || error)
    });
  }
});
