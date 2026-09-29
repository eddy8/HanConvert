(function () {
  var STORAGE_KEY = "jianfan-theme";
  var root = document.documentElement;
  var labels = {
    "zh-cn": ["切换到亮色主题", "切换到暗色主题"],
    "zh-tw": ["切換到亮色主題", "切換到暗色主題"],
    en: ["Switch to light theme", "Switch to dark theme"],
    ja: ["ライトテーマに切り替え", "ダークテーマに切り替え"],
    ko: ["라이트 테마로 전환", "다크 테마로 전환"]
  };

  function readStored() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function preferredTheme() {
    var stored = readStored();
    if (stored) return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function labelFor(theme) {
    var lang = (root.lang || "zh-CN").toLowerCase();
    var set = labels[lang] || labels[lang.split("-")[0]] || labels["zh-cn"];
    return theme === "light" ? set[1] : set[0];
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var button = document.getElementById("themeToggle");
    if (!button) return;
    var label = labelFor(theme);
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  }

  applyTheme(preferredTheme());

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function" || !target.closest("#themeToggle")) return;
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      /* Storage can be unavailable; the choice still applies to this page view. */
    }
    applyTheme(next);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyTheme(root.getAttribute("data-theme") || "dark");
    });
  }

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) applyTheme(preferredTheme());
  });
})();
