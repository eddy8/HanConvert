(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.JianFanAppDownload = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DOWNLOADS = Object.freeze({
    mac: Object.freeze({
      href: "/app/JianFan-macOS.zip",
      fileName: "JianFan-macOS.zip"
    }),
    windows: Object.freeze({
      href: "/app/JianFan-Windows.zip",
      fileName: "JianFan-Windows.zip"
    })
  });
  const HOME_PATHS = new Set(["/", "/zh-tw/", "/en/", "/ja/", "/ko/"]);
  const LABELS = Object.freeze({
    "zh-CN": "下载 APP",
    "zh-Hant": "下載 APP",
    en: "Download app",
    ja: "アプリをダウンロード",
    ko: "앱 다운로드"
  });
  const LINK_TITLE = "简体转繁体 APP 繁体转简体 APP";

  function normalizeHomePath(pathname) {
    const value = String(pathname || "/").replace(/\/+/g, "/");
    return value.endsWith("/") ? value : `${value}/`;
  }

  function isHomePath(pathname) {
    return HOME_PATHS.has(normalizeHomePath(pathname));
  }

  function isPackagedDesktopRuntime(environment = {}) {
    return Boolean(
      environment.tauri ||
      environment.tauriInternals ||
      environment.tauriIpc ||
      environment.tauriInvoke
    );
  }

  function detectDesktopPlatform(environment = {}) {
    const userAgent = String(environment.userAgent || "");
    const userAgentDataPlatform = String(environment.userAgentDataPlatform || "");
    const navigatorPlatform = String(environment.platform || "");
    const platformSignals = `${userAgentDataPlatform} ${navigatorPlatform} ${userAgent}`;
    const touchPoints = Number(environment.maxTouchPoints) || 0;
    const isAppleMobile =
      /iPad|iPhone|iPod/i.test(userAgent) ||
      (touchPoints > 1 && /Mac|Macintosh/i.test(platformSignals));

    if (isAppleMobile || /Android/i.test(userAgent)) return "";
    if (/Windows|Win32|Win64|WinCE/i.test(platformSignals)) return "windows";
    if (/macOS|Macintosh|MacIntel|MacPPC|Mac68K|Mac OS X/i.test(platformSignals)) return "mac";
    return "";
  }

  function getDownloadTarget(environment = {}) {
    if (isPackagedDesktopRuntime(environment)) return null;
    const platform = detectDesktopPlatform(environment);
    return platform ? DOWNLOADS[platform] : null;
  }

  function getLabel(language) {
    const value = String(language || "");
    if (value.toLowerCase().startsWith("zh-hant") || value.toLowerCase().startsWith("zh-tw")) {
      return LABELS["zh-Hant"];
    }
    if (value.toLowerCase().startsWith("en")) return LABELS.en;
    if (value.toLowerCase().startsWith("ja")) return LABELS.ja;
    if (value.toLowerCase().startsWith("ko")) return LABELS.ko;
    return LABELS["zh-CN"];
  }

  return {
    DOWNLOADS,
    LINK_TITLE,
    detectDesktopPlatform,
    getDownloadTarget,
    getLabel,
    isHomePath,
    isPackagedDesktopRuntime
  };
});

(function () {
  "use strict";

  if (typeof document === "undefined") return;
  const api = globalThis.JianFanAppDownload;
  if (!api?.isHomePath(window.location.pathname)) return;

  const target = api.getDownloadTarget({
    userAgent: navigator.userAgent,
    userAgentDataPlatform: navigator.userAgentData?.platform,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    tauri: globalThis.__TAURI__,
    tauriInternals: globalThis.__TAURI_INTERNALS__,
    tauriIpc: globalThis.__TAURI_IPC__,
    tauriInvoke: globalThis.__TAURI_INVOKE__
  });
  if (!target) return;

  const navigation = document.querySelector(".top-actions");
  const languagePicker = navigation?.querySelector(".language-picker");
  if (!navigation || !languagePicker || navigation.querySelector(".app-download-link")) return;

  const link = document.createElement("a");
  link.className = "nav-link app-download-link";
  link.href = target.href;
  link.download = target.fileName;
  link.title = api.LINK_TITLE;
  link.textContent = api.getLabel(document.documentElement.lang);
  navigation.insertBefore(link, languagePicker);
})();
