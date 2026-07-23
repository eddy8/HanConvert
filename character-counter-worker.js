"use strict";

importScripts("/character-counter.js");

self.addEventListener("message", (event) => {
  const { token, text, locale } = event.data;
  const result = self.CharacterCounterCore.analyzeText(text, locale);
  self.postMessage({ token, result });
});
