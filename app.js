import OpenCC from "https://cdn.jsdelivr.net/npm/opencc-wasm@0.12.0/dist/esm/index.js";

const translations = {
  "zh-CN": {
    skip: "跳到主要内容",
    languageLabel: "界面语言",
    eyebrow: "浏览器本地转换",
    title: "简繁中文在线转换",
    lede: "粘贴文本即可转换。适合文章、社媒、字幕、产品文案和日常沟通，不需要理解任何技术配置。",
    workspaceKicker: "转换工作台",
    workspaceTitle: "输入、选择方向、复制结果",
    statusIdle: "准备加载转换引擎",
    statusLoading: "正在加载转换引擎",
    statusReady: "转换引擎已就绪",
    statusError: "引擎加载失败，请检查网络",
    statusCopied: "已复制结果",
    statusDownloaded: "已下载 TXT",
    modeS2T: "简体 → 繁体",
    modeT2S: "繁体 → 简体",
    modeS2TW: "简体 → 台湾正体",
    modeS2TWP: "简体 → 台湾正体（含用词）",
    modeS2HK: "简体 → 香港繁体",
    modeS2HKP: "简体 → 香港繁体（含用词）",
    modeTW2S: "台湾正体 → 简体",
    modeTW2SP: "台湾正体 → 简体（含用词）",
    modeHK2S: "香港繁体 → 简体",
    modeHK2SP: "香港繁体 → 简体（含用词）",
    modeT2TW: "繁体 → 台湾正体",
    modeTW2T: "台湾正体 → 繁体",
    modeT2HK: "繁体 → 香港繁体",
    modeHK2T: "香港繁体 → 繁体",
    modeJP2T: "日文新字体 → 旧字体",
    modeT2JP: "旧字体 → 日文新字体",
    advancedSummary: "更多地区和专业选项",
    configLabel: "转换模式",
    autoConvert: "输入时自动转换",
    inputTitle: "原文",
    outputTitle: "结果",
    inputPlaceholder: "在这里粘贴或输入需要转换的中文...",
    outputPlaceholder: "转换后的文本会显示在这里",
    sample: "示例",
    clear: "清空",
    convert: "转换",
    copy: "复制",
    download: "下载 TXT",
    swapLabel: "交换输入和结果",
    featureKicker: "为什么放在同一页",
    featureTitle: "转换前后，用户最关心这几件事",
    featurePrivacyTitle: "本地处理",
    featurePrivacyBody: "文本在浏览器里完成转换，不需要上传到服务器。",
    featureRegionTitle: "地区用词",
    featureRegionBody: "常用模式放在外层，台湾、香港和日文相关选项收纳在高级区。",
    featureFlowTitle: "更少操作",
    featureFlowBody: "支持自动转换、方向切换、复制和下载，适合非技术人员连续处理文本。",
    footerPrefix: "Powered by",
    sampleText: "在线工具可以帮助用户快速转换简体中文和繁体中文，适合处理软件说明、网页内容和社交媒体文案。"
  },
  "zh-TW": {
    skip: "跳到主要內容",
    languageLabel: "介面語言",
    eyebrow: "瀏覽器本地轉換",
    title: "簡繁中文線上轉換",
    lede: "貼上文字即可轉換。適合文章、社群、字幕、產品文案與日常溝通，不需要理解任何技術設定。",
    workspaceKicker: "轉換工作台",
    workspaceTitle: "輸入、選擇方向、複製結果",
    statusIdle: "準備載入轉換引擎",
    statusLoading: "正在載入轉換引擎",
    statusReady: "轉換引擎已就緒",
    statusError: "引擎載入失敗，請檢查網路",
    statusCopied: "已複製結果",
    statusDownloaded: "已下載 TXT",
    modeS2T: "簡體 → 繁體",
    modeT2S: "繁體 → 簡體",
    modeS2TW: "簡體 → 台灣正體",
    modeS2TWP: "簡體 → 台灣正體（含用詞）",
    modeS2HK: "簡體 → 香港繁體",
    modeS2HKP: "簡體 → 香港繁體（含用詞）",
    modeTW2S: "台灣正體 → 簡體",
    modeTW2SP: "台灣正體 → 簡體（含用詞）",
    modeHK2S: "香港繁體 → 簡體",
    modeHK2SP: "香港繁體 → 簡體（含用詞）",
    modeT2TW: "繁體 → 台灣正體",
    modeTW2T: "台灣正體 → 繁體",
    modeT2HK: "繁體 → 香港繁體",
    modeHK2T: "香港繁體 → 繁體",
    modeJP2T: "日文新字體 → 舊字體",
    modeT2JP: "舊字體 → 日文新字體",
    advancedSummary: "更多地區和專業選項",
    configLabel: "轉換模式",
    autoConvert: "輸入時自動轉換",
    inputTitle: "原文",
    outputTitle: "結果",
    inputPlaceholder: "在這裡貼上或輸入需要轉換的中文...",
    outputPlaceholder: "轉換後的文字會顯示在這裡",
    sample: "範例",
    clear: "清空",
    convert: "轉換",
    copy: "複製",
    download: "下載 TXT",
    swapLabel: "交換輸入和結果",
    featureKicker: "為什麼放在同一頁",
    featureTitle: "轉換前後，使用者最關心這幾件事",
    featurePrivacyTitle: "本地處理",
    featurePrivacyBody: "文字在瀏覽器裡完成轉換，不需要上傳到伺服器。",
    featureRegionTitle: "地區用詞",
    featureRegionBody: "常用模式放在外層，台灣、香港和日文相關選項收納在進階區。",
    featureFlowTitle: "更少操作",
    featureFlowBody: "支援自動轉換、方向切換、複製和下載，適合非技術人員連續處理文字。",
    footerPrefix: "Powered by",
    sampleText: "線上工具可以幫助使用者快速轉換簡體中文和繁體中文，適合處理軟體說明、網頁內容和社群文案。"
  },
  en: {
    skip: "Skip to main content",
    languageLabel: "Language",
    eyebrow: "Local browser conversion",
    title: "Chinese Simplified and Traditional Converter",
    lede: "Paste text and convert instantly. Built for articles, social posts, subtitles, product copy, and everyday communication without exposing technical settings.",
    workspaceKicker: "Conversion workspace",
    workspaceTitle: "Input, choose a direction, copy the result",
    statusIdle: "Ready to load converter",
    statusLoading: "Loading converter",
    statusReady: "Converter ready",
    statusError: "Could not load the engine. Check your network.",
    statusCopied: "Result copied",
    statusDownloaded: "TXT downloaded",
    modeS2T: "Simplified → Traditional",
    modeT2S: "Traditional → Simplified",
    modeS2TW: "Simplified → Taiwan",
    modeS2TWP: "Simplified → Taiwan phrases",
    modeS2HK: "Simplified → Hong Kong",
    modeS2HKP: "Simplified → Hong Kong phrases",
    modeTW2S: "Taiwan → Simplified",
    modeTW2SP: "Taiwan → Simplified phrases",
    modeHK2S: "Hong Kong → Simplified",
    modeHK2SP: "Hong Kong → Simplified phrases",
    modeT2TW: "Traditional → Taiwan",
    modeTW2T: "Taiwan → Traditional",
    modeT2HK: "Traditional → Hong Kong",
    modeHK2T: "Hong Kong → Traditional",
    modeJP2T: "Japanese Shinjitai → Kyujitai",
    modeT2JP: "Kyujitai → Japanese Shinjitai",
    advancedSummary: "More regional and specialist options",
    configLabel: "Conversion mode",
    autoConvert: "Convert while typing",
    inputTitle: "Original",
    outputTitle: "Result",
    inputPlaceholder: "Paste or type Chinese text here...",
    outputPlaceholder: "Converted text appears here",
    sample: "Sample",
    clear: "Clear",
    convert: "Convert",
    copy: "Copy",
    download: "Download TXT",
    swapLabel: "Swap input and result",
    featureKicker: "Why one page",
    featureTitle: "The details users need before and after converting",
    featurePrivacyTitle: "Local processing",
    featurePrivacyBody: "Text is converted in the browser without uploading it to a server.",
    featureRegionTitle: "Regional wording",
    featureRegionBody: "Common modes stay visible, while Taiwan, Hong Kong, and Japanese options sit in the advanced area.",
    featureFlowTitle: "Fewer steps",
    featureFlowBody: "Auto conversion, swapping, copy, and download support repeated text work for non-technical users.",
    footerPrefix: "Powered by",
    sampleText: "Online tools help users convert Simplified and Traditional Chinese quickly for software guides, web pages, and social media copy."
  },
  ja: {
    skip: "メインコンテンツへ移動",
    languageLabel: "表示言語",
    eyebrow: "ブラウザー内で変換",
    title: "簡体字・繁体字オンライン変換",
    lede: "テキストを貼り付けるだけで変換できます。記事、SNS、字幕、製品コピー、日常の文章作成に使いやすい設計です。",
    workspaceKicker: "変換ワークスペース",
    workspaceTitle: "入力、方向選択、結果コピー",
    statusIdle: "変換エンジンを読み込む準備ができました",
    statusLoading: "変換エンジンを読み込み中",
    statusReady: "変換エンジンの準備ができました",
    statusError: "エンジンを読み込めません。ネットワークを確認してください。",
    statusCopied: "結果をコピーしました",
    statusDownloaded: "TXT をダウンロードしました",
    modeS2T: "簡体字 → 繁体字",
    modeT2S: "繁体字 → 簡体字",
    modeS2TW: "簡体字 → 台湾繁体字",
    modeS2TWP: "簡体字 → 台湾用語込み",
    modeS2HK: "簡体字 → 香港繁体字",
    modeS2HKP: "簡体字 → 香港用語込み",
    modeTW2S: "台湾繁体字 → 簡体字",
    modeTW2SP: "台湾繁体字 → 簡体字（用語込み）",
    modeHK2S: "香港繁体字 → 簡体字",
    modeHK2SP: "香港繁体字 → 簡体字（用語込み）",
    modeT2TW: "繁体字 → 台湾繁体字",
    modeTW2T: "台湾繁体字 → 繁体字",
    modeT2HK: "繁体字 → 香港繁体字",
    modeHK2T: "香港繁体字 → 繁体字",
    modeJP2T: "日本語新字体 → 旧字体",
    modeT2JP: "旧字体 → 日本語新字体",
    advancedSummary: "地域別・専門オプション",
    configLabel: "変換モード",
    autoConvert: "入力中に自動変換",
    inputTitle: "原文",
    outputTitle: "結果",
    inputPlaceholder: "変換したい中国語テキストを貼り付けるか入力してください...",
    outputPlaceholder: "変換結果がここに表示されます",
    sample: "サンプル",
    clear: "クリア",
    convert: "変換",
    copy: "コピー",
    download: "TXT を保存",
    swapLabel: "入力と結果を入れ替える",
    featureKicker: "同じページに置く理由",
    featureTitle: "変換前後にユーザーが確認したいこと",
    featurePrivacyTitle: "ローカル処理",
    featurePrivacyBody: "テキストはブラウザー内で変換され、サーバーへアップロードされません。",
    featureRegionTitle: "地域別の表現",
    featureRegionBody: "よく使うモードは表に出し、台湾・香港・日本語関連は詳細エリアにまとめています。",
    featureFlowTitle: "少ない操作",
    featureFlowBody: "自動変換、方向切替、コピー、ダウンロードにより、非技術者でも連続作業しやすくなっています。",
    footerPrefix: "Powered by",
    sampleText: "オンラインツールは、ソフトウェア説明、Web コンテンツ、SNS 投稿用の簡体字と繁体字の変換に役立ちます。"
  },
  ko: {
    skip: "본문으로 건너뛰기",
    languageLabel: "인터페이스 언어",
    eyebrow: "브라우저 로컬 변환",
    title: "중국어 간체·번체 온라인 변환",
    lede: "텍스트를 붙여 넣으면 바로 변환됩니다. 글, 소셜 게시물, 자막, 제품 문구, 일상 커뮤니케이션에 적합합니다.",
    workspaceKicker: "변환 작업대",
    workspaceTitle: "입력, 방향 선택, 결과 복사",
    statusIdle: "변환 엔진을 불러올 준비가 되었습니다",
    statusLoading: "변환 엔진을 불러오는 중",
    statusReady: "변환 엔진 준비 완료",
    statusError: "엔진을 불러오지 못했습니다. 네트워크를 확인하세요.",
    statusCopied: "결과를 복사했습니다",
    statusDownloaded: "TXT를 다운로드했습니다",
    modeS2T: "간체 → 번체",
    modeT2S: "번체 → 간체",
    modeS2TW: "간체 → 대만 정체",
    modeS2TWP: "간체 → 대만 용어 포함",
    modeS2HK: "간체 → 홍콩 번체",
    modeS2HKP: "간체 → 홍콩 용어 포함",
    modeTW2S: "대만 정체 → 간체",
    modeTW2SP: "대만 정체 → 간체 용어 포함",
    modeHK2S: "홍콩 번체 → 간체",
    modeHK2SP: "홍콩 번체 → 간체 용어 포함",
    modeT2TW: "번체 → 대만 정체",
    modeTW2T: "대만 정체 → 번체",
    modeT2HK: "번체 → 홍콩 번체",
    modeHK2T: "홍콩 번체 → 번체",
    modeJP2T: "일본 신자체 → 구자체",
    modeT2JP: "구자체 → 일본 신자체",
    advancedSummary: "지역 및 전문 옵션 더 보기",
    configLabel: "변환 모드",
    autoConvert: "입력 중 자동 변환",
    inputTitle: "원문",
    outputTitle: "결과",
    inputPlaceholder: "변환할 중국어 텍스트를 붙여 넣거나 입력하세요...",
    outputPlaceholder: "변환된 텍스트가 여기에 표시됩니다",
    sample: "예시",
    clear: "지우기",
    convert: "변환",
    copy: "복사",
    download: "TXT 다운로드",
    swapLabel: "입력과 결과 바꾸기",
    featureKicker: "한 페이지에 둔 이유",
    featureTitle: "변환 전후 사용자가 알고 싶은 핵심",
    featurePrivacyTitle: "로컬 처리",
    featurePrivacyBody: "텍스트는 브라우저 안에서 변환되며 서버로 업로드되지 않습니다.",
    featureRegionTitle: "지역별 표현",
    featureRegionBody: "자주 쓰는 모드는 바깥에 두고, 대만·홍콩·일본어 관련 옵션은 고급 영역에 정리했습니다.",
    featureFlowTitle: "적은 단계",
    featureFlowBody: "자동 변환, 방향 전환, 복사, 다운로드로 비기술 사용자도 반복 작업을 쉽게 할 수 있습니다.",
    footerPrefix: "Powered by",
    sampleText: "온라인 도구는 소프트웨어 설명, 웹 콘텐츠, 소셜 미디어 문구에 쓰이는 간체와 번체 변환을 빠르게 도와줍니다."
  }
};

const elements = {
  localeSelect: document.querySelector("#localeSelect"),
  engineStatus: document.querySelector("#engineStatus"),
  configSelect: document.querySelector("#configSelect"),
  autoConvert: document.querySelector("#autoConvert"),
  inputText: document.querySelector("#inputText"),
  outputText: document.querySelector("#outputText"),
  inputCount: document.querySelector("#inputCount"),
  outputCount: document.querySelector("#outputCount"),
  convertButton: document.querySelector("#convertButton"),
  copyButton: document.querySelector("#copyButton"),
  downloadButton: document.querySelector("#downloadButton"),
  clearButton: document.querySelector("#clearButton"),
  sampleButton: document.querySelector("#sampleButton"),
  swapButton: document.querySelector("#swapButton"),
  modeButtons: [...document.querySelectorAll(".mode-card")]
};

const converterCache = new Map();
let activeLocale = getInitialLocale();
let activeConfig = new URLSearchParams(window.location.search).get("config") || "s2t";
let conversionToken = 0;
let convertTimer;
let currentStatusKey = "statusIdle";
let currentStatusType = "idle";

applyLocale(activeLocale);
setConfig(activeConfig);
updateCounts();
scheduleConvert();

elements.localeSelect.addEventListener("change", () => {
  activeLocale = elements.localeSelect.value;
  localStorage.setItem("hanshift-locale", activeLocale);
  applyLocale(activeLocale);
});

elements.configSelect.addEventListener("change", () => {
  setConfig(elements.configSelect.value);
  scheduleConvert(0);
});

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setConfig(button.dataset.config);
    scheduleConvert(0);
  });
});

elements.inputText.addEventListener("input", () => {
  updateCounts();
  if (elements.autoConvert.checked) {
    scheduleConvert();
  }
});

elements.autoConvert.addEventListener("change", () => {
  if (elements.autoConvert.checked) {
    scheduleConvert(0);
  }
});

elements.convertButton.addEventListener("click", () => scheduleConvert(0));

elements.clearButton.addEventListener("click", () => {
  elements.inputText.value = "";
  elements.outputText.value = "";
  updateCounts();
  elements.inputText.focus();
});

elements.sampleButton.addEventListener("click", () => {
  elements.inputText.value = t("sampleText");
  updateCounts();
  scheduleConvert(0);
});

elements.swapButton.addEventListener("click", () => {
  const previousOutput = elements.outputText.value;
  elements.outputText.value = elements.inputText.value;
  elements.inputText.value = previousOutput;
  setConfig(getReverseConfig(activeConfig));
  updateCounts();
  scheduleConvert(0);
});

elements.copyButton.addEventListener("click", async () => {
  if (!elements.outputText.value) return;
  await navigator.clipboard.writeText(elements.outputText.value);
  setStatus("statusCopied", "ready");
});

elements.downloadButton.addEventListener("click", () => {
  if (!elements.outputText.value) return;
  const blob = new Blob([elements.outputText.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hanshift-${activeConfig}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("statusDownloaded", "ready");
});

function getInitialLocale() {
  const saved = localStorage.getItem("hanshift-locale");
  if (saved && translations[saved]) return saved;

  const browserLocale = navigator.language;
  if (browserLocale.startsWith("zh-Hant") || browserLocale === "zh-TW" || browserLocale === "zh-HK") {
    return "zh-TW";
  }
  if (browserLocale.startsWith("ja")) return "ja";
  if (browserLocale.startsWith("ko")) return "ko";
  if (browserLocale.startsWith("en")) return "en";
  return "zh-CN";
}

function applyLocale(locale) {
  const dictionary = translations[locale] || translations["zh-CN"];
  document.documentElement.lang = locale;
  elements.localeSelect.value = locale;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dictionary[key]) node.textContent = dictionary[key];
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
    node.dataset.i18nAttr.split(",").forEach((pair) => {
      const [attr, key] = pair.split(":");
      if (dictionary[key]) node.setAttribute(attr, dictionary[key]);
    });
  });

  setStatus(currentStatusKey, currentStatusType);
}

function t(key) {
  return translations[activeLocale]?.[key] || translations["zh-CN"][key] || key;
}

function setConfig(config) {
  activeConfig = config;
  elements.configSelect.value = config;
  elements.modeButtons.forEach((button) => {
    const isActive = button.dataset.config === config;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });
  const url = new URL(window.location.href);
  url.searchParams.set("config", config);
  window.history.replaceState({}, "", url);
}

function scheduleConvert(delay = 260) {
  window.clearTimeout(convertTimer);
  convertTimer = window.setTimeout(convertText, delay);
}

async function getConverter(config) {
  if (!converterCache.has(config)) {
    converterCache.set(config, OpenCC.Converter({ config }));
  }
  return converterCache.get(config);
}

async function convertText() {
  const input = elements.inputText.value;
  const token = ++conversionToken;

  if (!input.trim()) {
    elements.outputText.value = "";
    updateCounts();
    setStatus("statusIdle");
    return;
  }

  setStatus("statusLoading");

  try {
    const converter = await getConverter(activeConfig);
    const result = await converter(input);
    if (token !== conversionToken) return;
    elements.outputText.value = result;
    updateCounts();
    setStatus("statusReady", "ready");
  } catch (error) {
    console.error(error);
    setStatus("statusError", "error");
  }
}

function updateCounts() {
  elements.inputCount.textContent = elements.inputText.value.length;
  elements.outputCount.textContent = elements.outputText.value.length;
}

function setStatus(key, type = "idle") {
  currentStatusKey = key;
  currentStatusType = type;
  elements.engineStatus.classList.toggle("is-ready", type === "ready");
  elements.engineStatus.classList.toggle("is-error", type === "error");
  elements.engineStatus.lastElementChild.textContent = t(key);
}

function getReverseConfig(config) {
  const reverse = {
    s2t: "t2s",
    t2s: "s2t",
    s2tw: "tw2s",
    s2twp: "tw2sp",
    s2hk: "hk2s",
    s2hkp: "hk2sp",
    tw2s: "s2tw",
    hk2s: "s2hk",
    t2tw: "tw2t",
    t2hk: "hk2t",
    jp2t: "t2jp",
    t2jp: "jp2t"
  };
  return reverse[config] || "t2s";
}
