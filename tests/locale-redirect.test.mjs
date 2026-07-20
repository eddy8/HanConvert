import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const script = readFileSync(new URL("../locale-redirect.js", import.meta.url), "utf8");

function mirrorBannerIsScheduled(languages, options = {}) {
  let scheduled = false;
  const storage = new Map(Object.entries(options.storage || {}));
  const primaryLanguage = languages[0] || "";

  const context = {
    window: {
      location: {
        pathname: options.pathname || "/en/",
        hostname: options.hostname || "jianfan.app",
        search: "",
        hash: "",
        replace() {},
      },
    },
    navigator: { languages, language: primaryLanguage },
    localStorage: {
      getItem(key) {
        return storage.get(key) || null;
      },
    },
    document: {
      readyState: "loading",
      addEventListener(type) {
        if (type === "DOMContentLoaded") scheduled = true;
      },
    },
    console,
  };

  vm.runInNewContext(script, context);
  return scheduled;
}

test("shows the mirror banner for Simplified Chinese primary languages", () => {
  for (const language of ["zh", "zh-CN", "zh-Hans", "zh-Hans-CN", "zh-SG", "zh-MY"]) {
    assert.equal(mirrorBannerIsScheduled([language, "en"]), true, language);
  }
});

test("does not use a secondary Simplified Chinese preference", () => {
  assert.equal(mirrorBannerIsScheduled(["en", "zh-CN"]), false);
  assert.equal(mirrorBannerIsScheduled(["ja", "zh-Hans"]), false);
});

test("does not show the banner for Traditional Chinese primary languages", () => {
  for (const language of ["zh-TW", "zh-HK", "zh-MO", "zh-Hant", "zh-Hant-TW"]) {
    assert.equal(mirrorBannerIsScheduled([language, "zh-CN"]), false, language);
  }
});

test("does not show the banner on the mirror host or after dismissal", () => {
  assert.equal(mirrorBannerIsScheduled(["zh-CN"], { hostname: "jf.soushula.com" }), false);
  assert.equal(
    mirrorBannerIsScheduled(["zh-CN"], { storage: { "jianfan-mirror-banner-dismissed": "1" } }),
    false,
  );
});
