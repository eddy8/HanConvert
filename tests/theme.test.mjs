import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

test("Traditional Chinese theme labels support script and region language tags", async () => {
  const source = await readFile(new URL("../theme.js", import.meta.url), "utf8");
  for (const lang of ["zh-TW", "zh-Hant", "zh-Hant-TW"]) {
    const attributes = {};
    const button = { setAttribute: (name, value) => { attributes[name] = value; } };
    const context = {
      document: {
        documentElement: { lang, setAttribute() {} }, readyState: "complete",
        getElementById: () => button, addEventListener() {}
      },
      localStorage: { getItem: () => "light" },
      window: { addEventListener() {} }
    };
    vm.runInNewContext(source, context);
    assert.equal(attributes["aria-label"], "切換到暗色主題");
    assert.equal(attributes.title, "切換到暗色主題");
  }
});
