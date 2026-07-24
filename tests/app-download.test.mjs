import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../app-download.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);

const {
  LINK_TITLE,
  detectDesktopPlatform,
  getDownloadTarget,
  getLabel,
  isHomePath,
  isPackagedDesktopRuntime
} = context.JianFanAppDownload;

test("selects the macOS app archive", () => {
  const environment = {
    platform: "MacIntel",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    maxTouchPoints: 0
  };
  assert.equal(detectDesktopPlatform(environment), "mac");
  assert.equal(getDownloadTarget(environment).href, "/app/JianFan-macOS.zip");
});

test("selects the Windows app archive", () => {
  const environment = {
    userAgentDataPlatform: "Windows",
    platform: "Win32",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  };
  assert.equal(detectDesktopPlatform(environment), "windows");
  assert.equal(getDownloadTarget(environment).href, "/app/JianFan-Windows.zip");
});

test("does not offer a desktop archive on iPad, mobile, Linux or Android", () => {
  const environments = [
    {
      platform: "MacIntel",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/17.0 Mobile/15E148 Safari/604.1",
      maxTouchPoints: 5
    },
    { platform: "iPhone", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" },
    { platform: "Linux x86_64", userAgent: "Mozilla/5.0 (X11; Linux x86_64)" },
    { platform: "Linux armv8l", userAgent: "Mozilla/5.0 (Linux; Android 14)" }
  ];
  for (const environment of environments) {
    assert.equal(getDownloadTarget(environment), null);
  }
});

test("does not show a download inside Pake or another Tauri desktop app", () => {
  const macPake = {
    platform: "MacIntel",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    tauriInternals: { invoke() {} }
  };
  const windowsPake = {
    platform: "Win32",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    tauri: { core: {} }
  };
  assert.equal(isPackagedDesktopRuntime(macPake), true);
  assert.equal(isPackagedDesktopRuntime(windowsPake), true);
  assert.equal(getDownloadTarget(macPake), null);
  assert.equal(getDownloadTarget(windowsPake), null);
});

test("limits the download navigation to localized home pages", () => {
  for (const pathname of ["/", "/zh-tw/", "/en", "/ja/", "/ko/"]) {
    assert.equal(isHomePath(pathname), true);
  }
  for (const pathname of ["/simplified-to-traditional/", "/en/chinese-to-pinyin/", "/about/"]) {
    assert.equal(isHomePath(pathname), false);
  }
});

test("provides localized labels and the requested title attribute", () => {
  assert.equal(getLabel("zh-CN"), "下载 APP");
  assert.equal(getLabel("zh-Hant"), "下載 APP");
  assert.equal(getLabel("en"), "Download app");
  assert.equal(getLabel("ja"), "アプリをダウンロード");
  assert.equal(getLabel("ko"), "앱 다운로드");
  assert.equal(LINK_TITLE, "简体转繁体 APP 繁体转简体 APP");
});
