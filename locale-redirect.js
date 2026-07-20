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

  function shouldShowMirrorBanner(languages) {
    if (window.location.hostname === "jf.soushula.com") return false;
    if (localStorage.getItem("jianfan-mirror-banner-dismissed") === "1") return false;

    const primaryLanguage = languages[0];
    if (!primaryLanguage?.startsWith("zh")) return false;

    if (
      primaryLanguage.startsWith("zh-hant") ||
      primaryLanguage === "zh-tw" ||
      primaryLanguage === "zh-hk" ||
      primaryLanguage === "zh-mo"
    ) {
      return false;
    }

    return (
      primaryLanguage === "zh" ||
      primaryLanguage.startsWith("zh-hans") ||
      primaryLanguage === "zh-cn" ||
      primaryLanguage === "zh-sg" ||
      primaryLanguage === "zh-my"
    );
  }

  function showMirrorBanner() {
    const renderBanner = () => {
      if (document.getElementById("mirrorSpeedBanner")) return;

      const style = document.createElement("style");
      style.textContent = `
        .mirror-speed-banner {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          min-height: 46px;
          padding: 9px 18px;
          border-bottom: 1px solid rgba(64, 242, 176, 0.3);
          background: linear-gradient(90deg, #07120f, #12352c 48%, #18130a);
          color: #eefcf5;
          box-shadow: 0 14px 44px rgba(0, 0, 0, 0.28);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans CJK SC", sans-serif;
          font-size: 14px;
          line-height: 1.35;
        }
        .mirror-speed-banner strong {
          color: #ffdd8f;
          font-weight: 800;
        }
        .mirror-speed-banner a {
          flex: 0 0 auto;
          min-height: 30px;
          padding: 6px 12px;
          border: 1px solid rgba(255, 204, 102, 0.72);
          border-radius: 8px;
          background: rgba(255, 204, 102, 0.12);
          color: #ffdd8f;
          font-weight: 800;
          text-decoration: none;
        }
        .mirror-speed-banner button {
          display: grid;
          flex: 0 0 auto;
          width: 30px;
          height: 30px;
          place-items: center;
          border: 1px solid rgba(238, 252, 245, 0.2);
          border-radius: 999px;
          background: rgba(238, 252, 245, 0.08);
          color: #eefcf5;
          cursor: pointer;
          font: inherit;
        }
        .mirror-speed-banner a:focus-visible,
        .mirror-speed-banner button:focus-visible {
          outline: 3px solid rgba(255, 204, 102, 0.95);
          outline-offset: 2px;
        }
        @media (max-width: 680px) {
          .mirror-speed-banner {
            align-items: flex-start;
            justify-content: flex-start;
            padding: 10px 12px;
            font-size: 13px;
          }
          .mirror-speed-banner span {
            flex: 1 1 auto;
          }
        }
      `;

      const banner = document.createElement("div");
      banner.id = "mirrorSpeedBanner";
      banner.className = "mirror-speed-banner";
      banner.setAttribute("role", "region");
      banner.setAttribute("aria-label", "中国大陆镜像访问提示");

      const message = document.createElement("span");
      message.innerHTML = "<strong>网站访问慢？</strong> 可以使用中国大陆镜像地址，加载速度更快。";

      const link = document.createElement("a");
      link.href = "https://jf.soushula.com";
      link.textContent = "访问中国大陆镜像";
      link.target = "_blank";

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "关闭中国大陆镜像访问提示");
      closeButton.textContent = "×";
      closeButton.addEventListener("click", () => {
        localStorage.setItem("jianfan-mirror-banner-dismissed", "1");
        banner.remove();
      });

      banner.append(message, link, closeButton);
      document.head.append(style);
      document.body.prepend(banner);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderBanner, { once: true });
      return;
    }

    renderBanner();
  }
})();
