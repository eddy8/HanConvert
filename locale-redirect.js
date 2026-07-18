(() => {
  try {
    const path = window.location.pathname.replace(/\/+$/, "/");
    const hasManualLocale = localStorage.getItem("jianfan-locale-manual") === "1";

    if (hasManualLocale || /^\/(zh-tw|en|ja|ko)(\/|$)/.test(path)) return;

    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const normalizedLanguages = languages.filter(Boolean).map((language) => language.toLowerCase().replace("_", "-"));

    const localePath = normalizedLanguages.reduce((matchedPath, language) => {
      if (matchedPath) return matchedPath;
      if (language.startsWith("zh-hant") || language === "zh-tw" || language === "zh-hk" || language === "zh-mo") {
        return "/zh-tw/";
      }
      if (language.startsWith("zh")) return "/";
      if (language.startsWith("en")) return "/en/";
      if (language.startsWith("ja")) return "/ja/";
      if (language.startsWith("ko")) return "/ko/";
      return "";
    }, "");

    if (!localePath || localePath === "/") return;

    const suffix = path === "/" ? "" : path.slice(1);
    window.location.replace(`${localePath}${suffix}${window.location.search}${window.location.hash}`);
  } catch (error) {
    console.warn(error);
  }
})();
