(() => {
  try {    
    const path = window.location.pathname.replace(/\/+$/, "/");
    const hasManualLocale = localStorage.getItem("jianfan-locale-manual") === "1";
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const normalizedLanguages = languages.filter(Boolean).map((language) => language.toLowerCase().replace("_", "-"));

    setupSegmentedRadioGroups();

    if (shouldShowMirrorBanner(normalizedLanguages)) {
      reserveMirrorBannerSpace();
      showMirrorBanner();
    }
    return;

    if (hasManualLocale || /^\/(zh-tw|en|ja|ko)(\/|$)/.test(path)) return;

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

  function setupSegmentedRadioGroups() {
    if (typeof document.querySelectorAll !== "function") return;
    const runAfterFrame = typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (callback) => setTimeout(callback, 0);

    const initialize = () => {
      document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
        const radios = getRadioButtons(group);
        if (!radios.length || group.dataset.radioKeyboardReady === "1") return;

        group.dataset.radioKeyboardReady = "1";
        syncRadioTabStops(group);

        group.addEventListener("click", (event) => {
          if (!findClosestRadio(event.target)) return;
          runAfterFrame(() => syncRadioTabStops(group));
        });

        group.addEventListener("keydown", (event) => {
          const current = findClosestRadio(event.target);
          if (!current || current.closest('[role="radiogroup"]') !== group) return;

          const currentRadios = getRadioButtons(group);
          if (!currentRadios.length) return;

          const currentIndex = currentRadios.indexOf(current);
          if (currentIndex === -1) return;

          const nextIndex = getNextRadioIndex(event.key, currentIndex, currentRadios.length);
          if (nextIndex === currentIndex) return;

          event.preventDefault();
          const nextRadio = currentRadios[nextIndex];
          nextRadio.focus();
          nextRadio.click();
          runAfterFrame(() => syncRadioTabStops(group));
        });
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize, { once: true });
      return;
    }

    initialize();
  }

  function findClosestRadio(target) {
    if (typeof target?.closest !== "function") return null;
    return target.closest('[role="radio"]');
  }

  function getRadioButtons(group) {
    return [...group.querySelectorAll('[role="radio"]')].filter((radio) => {
      return !radio.disabled && radio.getAttribute("aria-disabled") !== "true" && !radio.hidden;
    });
  }

  function getNextRadioIndex(key, currentIndex, radioCount) {
    switch (key) {
      case "ArrowRight":
      case "ArrowDown":
        return (currentIndex + 1) % radioCount;
      case "ArrowLeft":
      case "ArrowUp":
        return (currentIndex - 1 + radioCount) % radioCount;
      case "Home":
        return 0;
      case "End":
        return radioCount - 1;
      default:
        return currentIndex;
    }
  }

  function syncRadioTabStops(group) {
    const radios = getRadioButtons(group);
    if (!radios.length) return;

    const checkedRadio = radios.find((radio) => radio.getAttribute("aria-checked") === "true") || radios[0];
    radios.forEach((radio) => {
      radio.tabIndex = radio === checkedRadio ? 0 : -1;
    });
  }

  function reserveMirrorBannerSpace() {
    // Reserve the banner height before first paint so the page does not jump when the banner is inserted.
    const style = document.createElement("style");
    style.id = "mirrorSpeedBannerSpace";
    style.textContent = "html.has-mirror-banner body { padding-top: var(--mirror-banner-height, 52px); }";
    document.head.append(style);
    document.documentElement.classList.add("has-mirror-banner");
  }

  function releaseMirrorBannerSpace() {
    document.documentElement.classList.remove("has-mirror-banner");
    document.documentElement.style.removeProperty("--mirror-banner-height");
  }

  function showMirrorBanner() {
    const renderBanner = () => {
      if (document.getElementById("mirrorSpeedBanner")) return;

      const style = document.createElement("style");
      style.textContent = `
        .mirror-speed-banner {
          --banner-bg: linear-gradient(90deg, #0d1c19, #12352c 55%, #1d1a0d);
          --banner-ink: #eefcf5;
          --banner-strong: #ffdd8f;
          --banner-line: rgba(64, 242, 176, 0.3);
          --banner-link-line: rgba(255, 204, 102, 0.72);
          --banner-link-bg: rgba(255, 204, 102, 0.12);
          --banner-close-line: rgba(238, 252, 245, 0.24);
          --banner-close-bg: rgba(238, 252, 245, 0.08);
          --banner-focus: rgba(255, 204, 102, 0.95);
          position: fixed;
          top: 0;
          right: 0;
          left: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          min-height: 46px;
          padding: 9px 18px;
          border-bottom: 1px solid var(--banner-line);
          background: var(--banner-bg);
          color: var(--banner-ink);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans CJK SC", sans-serif;
          font-size: 14px;
          line-height: 1.35;
        }
        :root[data-theme="light"] .mirror-speed-banner {
          --banner-bg: linear-gradient(90deg, #e6f3ed, #f1f7f3 55%, #f8f3e2);
          --banner-ink: #12261f;
          --banner-strong: #8a4f00;
          --banner-line: rgba(13, 110, 84, 0.24);
          --banner-link-line: rgba(138, 79, 0, 0.55);
          --banner-link-bg: rgba(178, 106, 0, 0.1);
          --banner-close-line: rgba(18, 38, 31, 0.24);
          --banner-close-bg: rgba(18, 38, 31, 0.06);
          --banner-focus: rgba(178, 106, 0, 0.9);
          box-shadow: 0 8px 24px rgba(20, 60, 48, 0.12);
        }
        .mirror-speed-banner strong {
          color: var(--banner-strong);
          font-weight: 800;
        }
        .mirror-speed-banner a {
          flex: 0 0 auto;
          min-height: 30px;
          padding: 6px 12px;
          border: 1px solid var(--banner-link-line);
          border-radius: 8px;
          background: var(--banner-link-bg);
          color: var(--banner-strong);
          font-weight: 800;
          text-decoration: none;
        }
        .mirror-speed-banner button {
          display: grid;
          flex: 0 0 auto;
          width: 30px;
          height: 30px;
          place-items: center;
          border: 1px solid var(--banner-close-line);
          border-radius: 999px;
          background: var(--banner-close-bg);
          color: var(--banner-ink);
          cursor: pointer;
          font: inherit;
        }
        .mirror-speed-banner a:focus-visible,
        .mirror-speed-banner button:focus-visible {
          outline: 3px solid var(--banner-focus);
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
        releaseMirrorBannerSpace();
      });

      banner.append(message, link, closeButton);
      document.head.append(style);
      // The head script runs before <body> exists; attach to <html> so the banner paints with the first frame.
      if (document.body) document.body.prepend(banner);
      else document.documentElement.append(banner);

      const syncHeight = () => {
        document.documentElement.style.setProperty("--mirror-banner-height", `${banner.offsetHeight}px`);
      };
      syncHeight();
      if (typeof ResizeObserver === "function") new ResizeObserver(syncHeight).observe(banner);
    };

    renderBanner();

    if (document.readyState === "loading") {
      // Move the banner into <body> once it is parsed so sibling selectors keep working.
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          const banner = document.getElementById("mirrorSpeedBanner");
          if (banner && document.body && banner.parentNode !== document.body) document.body.prepend(banner);
        },
        { once: true }
      );
    }
  }
})();
