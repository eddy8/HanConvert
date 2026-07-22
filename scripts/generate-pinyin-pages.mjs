import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://jianfan.app";
const slug = "chinese-to-pinyin";
const sampleText = "重庆银行的音乐会在长安举行，行人走过快乐的街道。";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", siteHeader: "网站页眉", primary: "主要导航", footerAria: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", siteHeader: "網站頁首", primary: "主要導覽", footerAria: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", siteHeader: "Site header", primary: "Primary navigation", footerAria: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", siteHeader: "サイトヘッダー", primary: "メインナビゲーション", footerAria: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "인터페이스 언어", siteHeader: "사이트 헤더", primary: "주요 탐색", footerAria: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "汉字转拼音 - 汉字拼音在线转换与查询 | JianFan.app",
    description: "免费汉字转拼音工具，支持汉字拼音在线转换和汉字拼音查询，可输出带声调拼音、数字声调、无声调、首字母及逐字注音，简繁体均在浏览器本地处理。",
    eyebrow: "普通话拼音 · 声调 · 多音字",
    heading: "汉字转拼音在线转换",
    lede: "输入汉字、词语或段落，即时生成带声调或无声调拼音，也可查询单个汉字的常见读音。支持简体中文和繁体中文。",
    toolTitle: "输入汉字，选择拼音格式",
    idle: "等待输入汉字", converting: "正在转换拼音", ready: "拼音转换完成", copied: "已复制拼音结果", copyFailed: "无法自动复制，请手动复制", error: "拼音组件加载失败，请刷新页面", tooLong: "文本不能超过 {limit} 个字符",
    formatLabel: "输出格式", formats: [["symbol", "带声调", "nǐ hǎo"], ["number", "数字声调", "ni3 hao3"], ["none", "无声调", "ni hao"], ["initials", "首字母", "nh"]],
    caseLabel: "字母格式", cases: [["lower", "小写"], ["title", "首字母大写"], ["upper", "全大写"]],
    preserve: "保留标点与字母", surname: "姓名读音模式",
    inputTitle: "汉字文本", inputPlaceholder: "输入或粘贴需要转换的简体或繁体中文...", sample: "示例", clear: "清空", convert: "转换拼音",
    outputTitle: "拼音结果", outputPlaceholder: "转换后的拼音会显示在这里", copy: "复制结果",
    annotationTitle: "逐字拼音标注", annotationEmpty: "输入汉字后，这里会显示逐字注音预览。", annotationNote: "长文本仅预览前 500 个字符，完整拼音结果不受影响。",
    lookupTitle: "单字拼音查询", lookupEmpty: "只输入一个汉字，可查看该字的全部常见读音。",
    disclaimer: "自动转换会根据常见词语和上下文处理多音字，但人名、地名、生僻字和专业词仍可能存在其他读音，正式使用前请人工复核。",
    seoKicker: "汉字拼音在线转换",
    featureTitle: "汉字转拼音、拼音查询与注音整理",
    featureIntro: "面向中文学习、姓名拼音、内容注音、字幕整理和数据处理等常见场景，所有输入仅在当前浏览器中转换。",
    cards: [["四种拼音输出", "可切换带声调拼音、数字声调、无声调拼音和拼音首字母，并调整字母大小写。"], ["简繁体与多音字", "支持简体和繁体汉字，结合常见词语上下文识别多音字，并提供单字全部读音查询。"], ["本地处理更安心", "汉字和转换结果不会上传服务器，适合处理文章、姓名列表、学习材料和内部文本。"]],
    faqTitle: "汉字拼音查询常见问题",
    faqs: [["汉字转拼音可以显示声调吗？", "可以。可选择声调符号、数字声调或无声调三种完整拼音格式。"], ["可以查询多音字吗？", "输入单个汉字时会列出常见读音；输入词语或句子时会优先根据上下文选择读音。"], ["繁体字可以转换拼音吗？", "可以。简体字和繁体字都可直接输入，无需先做简繁转换。"]],
    related: "相关工具", relatedAria: "相关转换页面", footer: "JianFan.app 提供浏览器本地运行的中文文字转换与拼音工具。"
  },
  "zh-TW": {
    title: "漢字轉拼音 - 漢字拼音線上轉換與查詢 | JianFan.app",
    description: "免費漢字轉拼音工具，支援漢字拼音線上轉換與漢字拼音查詢，可輸出聲調符號、數字聲調、無聲調、首字母及逐字注音，簡繁體皆在瀏覽器本機處理。",
    eyebrow: "漢語拼音 · 聲調 · 多音字",
    heading: "漢字轉拼音線上轉換",
    lede: "輸入漢字、詞語或段落，即時產生帶聲調或無聲調拼音，也可查詢單一漢字的常見讀音。支援簡體中文與繁體中文。",
    toolTitle: "輸入漢字，選擇拼音格式",
    idle: "等待輸入漢字", converting: "正在轉換拼音", ready: "拼音轉換完成", copied: "已複製拼音結果", copyFailed: "無法自動複製，請手動複製", error: "拼音元件載入失敗，請重新整理頁面", tooLong: "文字不能超過 {limit} 個字元",
    formatLabel: "輸出格式", formats: [["symbol", "帶聲調", "nǐ hǎo"], ["number", "數字聲調", "ni3 hao3"], ["none", "無聲調", "ni hao"], ["initials", "首字母", "nh"]],
    caseLabel: "字母格式", cases: [["lower", "小寫"], ["title", "首字母大寫"], ["upper", "全大寫"]],
    preserve: "保留標點與字母", surname: "姓名讀音模式",
    inputTitle: "漢字文字", inputPlaceholder: "輸入或貼上需要轉換的簡體或繁體中文...", sample: "範例", clear: "清空", convert: "轉換拼音",
    outputTitle: "拼音結果", outputPlaceholder: "轉換後的拼音會顯示在這裡", copy: "複製結果",
    annotationTitle: "逐字拼音標註", annotationEmpty: "輸入漢字後，這裡會顯示逐字注音預覽。", annotationNote: "長文字只預覽前 500 個字元，完整拼音結果不受影響。",
    lookupTitle: "單字拼音查詢", lookupEmpty: "只輸入一個漢字，可查看該字的全部常見讀音。",
    disclaimer: "自動轉換會依常見詞語與上下文處理多音字，但人名、地名、生僻字與專業詞仍可能有其他讀音，正式使用前請人工複核。",
    seoKicker: "漢字拼音線上轉換",
    featureTitle: "漢字轉拼音、拼音查詢與注音整理",
    featureIntro: "適合中文學習、姓名拼音、內容注音、字幕整理與資料處理等場景，所有輸入只在目前瀏覽器中轉換。",
    cards: [["四種拼音輸出", "可切換帶聲調拼音、數字聲調、無聲調拼音與拼音首字母，並調整字母大小寫。"], ["簡繁體與多音字", "支援簡體與繁體漢字，依常見詞語上下文辨識多音字，並提供單字全部讀音查詢。"], ["瀏覽器本機處理", "漢字與轉換結果不會上傳伺服器，適合文章、姓名清單、學習材料與內部文字。"]],
    faqTitle: "漢字拼音查詢常見問題",
    faqs: [["漢字轉拼音可以顯示聲調嗎？", "可以。可選擇聲調符號、數字聲調或無聲調三種完整拼音格式。"], ["可以查詢多音字嗎？", "輸入單一漢字時會列出常見讀音；輸入詞語或句子時會優先依上下文選擇讀音。"], ["簡體字可以轉換拼音嗎？", "可以。簡體字與繁體字都可直接輸入，不需要先進行簡繁轉換。"]],
    related: "相關工具", relatedAria: "相關轉換頁面", footer: "JianFan.app 提供在瀏覽器本機運行的中文文字轉換與拼音工具。"
  },
  en: {
    title: "Chinese to Pinyin Converter with Tones | JianFan.app",
    description: "Convert Simplified or Traditional Chinese characters to Pinyin with tone marks, tone numbers, no tones, initials, ruby annotations, and single-character pronunciation lookup.",
    eyebrow: "Mandarin Pinyin · Tones · Polyphonic Characters",
    heading: "Chinese to Pinyin Converter",
    lede: "Convert Chinese characters, words, or paragraphs to Pinyin instantly. Choose tone marks, tone numbers, plain Pinyin, or initials and look up common readings for a single Han character.",
    toolTitle: "Enter Chinese and choose a Pinyin format",
    idle: "Waiting for Chinese text", converting: "Converting to Pinyin", ready: "Pinyin conversion complete", copied: "Pinyin result copied", copyFailed: "Automatic copy failed. Please copy manually.", error: "The Pinyin component failed to load. Refresh the page.", tooLong: "Text is limited to {limit} characters",
    formatLabel: "Output format", formats: [["symbol", "Tone marks", "nǐ hǎo"], ["number", "Tone numbers", "ni3 hao3"], ["none", "No tones", "ni hao"], ["initials", "Initials", "nh"]],
    caseLabel: "Letter case", cases: [["lower", "Lowercase"], ["title", "Capitalize words"], ["upper", "Uppercase"]],
    preserve: "Keep punctuation and letters", surname: "Name pronunciation mode",
    inputTitle: "Chinese text", inputPlaceholder: "Type or paste Simplified or Traditional Chinese...", sample: "Sample", clear: "Clear", convert: "Convert to Pinyin",
    outputTitle: "Pinyin result", outputPlaceholder: "Converted Pinyin appears here", copy: "Copy result",
    annotationTitle: "Character-by-character Pinyin", annotationEmpty: "Enter Chinese characters to see a ruby-style pronunciation preview.", annotationNote: "Long text previews the first 500 characters; the complete text result remains available above.",
    lookupTitle: "Single-character Pinyin lookup", lookupEmpty: "Enter one Han character to see its common pronunciations.",
    disclaimer: "Context helps choose common polyphonic readings, but names, places, rare characters, and specialist terms may use other pronunciations. Review important results manually.",
    seoKicker: "Chinese characters to Pinyin",
    featureTitle: "Pinyin conversion, pronunciation lookup, and annotation",
    featureIntro: "Built for Chinese learners, name romanization, reading aids, subtitles, and text processing. Input stays in the current browser.",
    cards: [["Four output formats", "Switch between tone marks, tone numbers, plain Pinyin, and initials, with flexible capitalization."], ["Simplified, Traditional, and polyphonic text", "Convert both scripts, use context-aware readings, and check all common readings for one character."], ["Local browser processing", "Chinese text and Pinyin results are not uploaded, making the tool suitable for private learning and work content."]],
    faqTitle: "Chinese to Pinyin questions",
    faqs: [["Can the converter include Pinyin tones?", "Yes. Choose tone marks, tone numbers, or a no-tone output."], ["Can I look up polyphonic characters?", "A single character shows common readings, while words and sentences use context to choose a likely pronunciation."], ["Does it support Traditional Chinese?", "Yes. Simplified and Traditional Chinese can both be entered directly."]],
    related: "Related tools", relatedAria: "Related conversion pages", footer: "JianFan.app provides browser-local Chinese character conversion and Pinyin tools."
  },
  ja: {
    title: "中国語漢字をピンインに変換 - 声調付き拼音 | JianFan.app",
    description: "簡体字・繁体字を声調付きピンイン、数字声調、声調なし、頭文字へ変換。1文字の読み方検索と文字別ルビ表示に対応し、ブラウザー内で処理します。",
    eyebrow: "中国語ピンイン · 声調 · 多音字",
    heading: "中国語漢字をピンインに変換",
    lede: "中国語の漢字・単語・文章をピンインへ変換します。声調記号、数字声調、声調なし、頭文字を選択でき、1文字の代表的な読み方も確認できます。",
    toolTitle: "中国語を入力してピンイン形式を選択",
    idle: "中国語の入力待ち", converting: "ピンインへ変換中", ready: "ピンイン変換完了", copied: "ピンインをコピーしました", copyFailed: "自動コピーに失敗しました。手動でコピーしてください。", error: "ピンイン機能を読み込めませんでした。ページを再読み込みしてください。", tooLong: "テキストは {limit} 文字までです",
    formatLabel: "出力形式", formats: [["symbol", "声調記号", "nǐ hǎo"], ["number", "数字声調", "ni3 hao3"], ["none", "声調なし", "ni hao"], ["initials", "頭文字", "nh"]],
    caseLabel: "大文字・小文字", cases: [["lower", "小文字"], ["title", "語頭を大文字"], ["upper", "大文字"]],
    preserve: "句読点と英字を残す", surname: "人名読みモード",
    inputTitle: "中国語テキスト", inputPlaceholder: "簡体字または繁体字の中国語を入力・貼り付け...", sample: "サンプル", clear: "クリア", convert: "ピンインへ変換",
    outputTitle: "ピンイン結果", outputPlaceholder: "変換後のピンインがここに表示されます", copy: "結果をコピー",
    annotationTitle: "1文字ずつのピンイン表示", annotationEmpty: "中国語を入力すると、文字別の読み方がここに表示されます。", annotationNote: "長文は先頭500文字のみプレビューし、上の完全な結果には影響しません。",
    lookupTitle: "漢字1文字のピンイン検索", lookupEmpty: "漢字を1文字だけ入力すると、代表的な読み方を確認できます。",
    disclaimer: "多音字は一般的な語句と文脈から判定しますが、人名・地名・難字・専門用語には別の読み方があります。正式利用前に確認してください。",
    seoKicker: "中国語ピンイン変換",
    featureTitle: "漢字のピンイン変換・読み方検索・ルビ表示",
    featureIntro: "中国語学習、人名のローマ字表記、読解補助、字幕、文字データ整理に利用でき、入力はブラウザー内だけで処理されます。",
    cards: [["4種類の出力", "声調記号、数字声調、声調なし、頭文字を切り替え、大文字・小文字も調整できます。"], ["簡体字・繁体字・多音字", "両方の字体に対応し、文脈を使って多音字を判定。1文字なら代表的な全読みを確認できます。"], ["ブラウザー内で処理", "入力した中国語と結果はサーバーへ送信されず、学習資料や業務文書にも使えます。"]],
    faqTitle: "中国語ピンイン変換のよくある質問",
    faqs: [["声調付きピンインを表示できますか？", "はい。声調記号、数字声調、声調なしから選択できます。"], ["多音字を検索できますか？", "1文字入力では代表的な読みを一覧表示し、単語や文章では文脈から読みを選びます。"], ["繁体字にも対応していますか？", "はい。簡体字と繁体字をそのまま入力できます。"]],
    related: "関連ツール", relatedAria: "関連変換ページ", footer: "JianFan.app はブラウザー内で動作する中国語文字変換・ピンインツールを提供します。"
  },
  ko: {
    title: "중국어 한자 병음 변환기 - 성조 포함 Pinyin | JianFan.app",
    description: "중국어 간체와 번체를 성조 기호, 숫자 성조, 무성조 병음과 첫 글자로 변환하고 글자별 발음 및 단일 한자 다독음 조회를 제공합니다.",
    eyebrow: "중국어 병음 · 성조 · 다독음 한자",
    heading: "중국어 한자 병음 변환기",
    lede: "중국어 한자, 단어, 문장을 병음으로 즉시 변환합니다. 성조 기호, 숫자 성조, 무성조, 첫 글자를 선택하고 한 글자의 대표 발음도 조회할 수 있습니다.",
    toolTitle: "중국어를 입력하고 병음 형식 선택",
    idle: "중국어 입력 대기", converting: "병음으로 변환 중", ready: "병음 변환 완료", copied: "병음 결과를 복사했습니다", copyFailed: "자동 복사에 실패했습니다. 직접 복사해 주세요.", error: "병음 기능을 불러오지 못했습니다. 페이지를 새로 고쳐 주세요.", tooLong: "텍스트는 {limit}자까지 입력할 수 있습니다",
    formatLabel: "출력 형식", formats: [["symbol", "성조 기호", "nǐ hǎo"], ["number", "숫자 성조", "ni3 hao3"], ["none", "성조 없음", "ni hao"], ["initials", "첫 글자", "nh"]],
    caseLabel: "영문 대소문자", cases: [["lower", "소문자"], ["title", "단어 첫 글자 대문자"], ["upper", "대문자"]],
    preserve: "문장부호와 영문 유지", surname: "이름 발음 모드",
    inputTitle: "중국어 텍스트", inputPlaceholder: "중국어 간체 또는 번체를 입력하거나 붙여 넣으세요...", sample: "예시", clear: "지우기", convert: "병음 변환",
    outputTitle: "병음 결과", outputPlaceholder: "변환된 병음이 여기에 표시됩니다", copy: "결과 복사",
    annotationTitle: "글자별 병음 표기", annotationEmpty: "중국어를 입력하면 글자별 발음 미리보기가 표시됩니다.", annotationNote: "긴 텍스트는 처음 500자만 미리 보며 위의 전체 결과에는 영향을 주지 않습니다.",
    lookupTitle: "한 글자 병음 조회", lookupEmpty: "한자를 한 글자만 입력하면 대표 발음을 모두 볼 수 있습니다.",
    disclaimer: "다독음 한자는 일반 단어와 문맥으로 판단하지만 인명, 지명, 희귀 한자와 전문 용어에는 다른 발음이 있을 수 있으므로 중요한 결과는 직접 확인하세요.",
    seoKicker: "중국어 한자 병음 변환",
    featureTitle: "한자 병음 변환, 발음 조회와 글자별 표기",
    featureIntro: "중국어 학습, 이름 로마자 표기, 읽기 보조, 자막과 텍스트 데이터 정리에 사용할 수 있으며 입력은 브라우저에서만 처리됩니다.",
    cards: [["네 가지 출력 형식", "성조 기호, 숫자 성조, 무성조 병음과 첫 글자를 전환하고 영문 대소문자도 조정할 수 있습니다."], ["간체·번체와 다독음", "두 문자 체계를 모두 지원하고 문맥으로 발음을 선택하며 한 글자의 대표 발음을 조회합니다."], ["브라우저 로컬 처리", "중국어 텍스트와 병음 결과를 서버로 보내지 않아 학습 자료와 업무 문서에 사용할 수 있습니다."]],
    faqTitle: "중국어 병음 변환 자주 묻는 질문",
    faqs: [["성조가 있는 병음을 표시할 수 있나요?", "네. 성조 기호, 숫자 성조 또는 무성조 형식을 선택할 수 있습니다."], ["다독음 한자를 조회할 수 있나요?", "한 글자를 입력하면 대표 발음을 표시하고 단어나 문장에서는 문맥에 맞는 발음을 우선 선택합니다."], ["번체 중국어도 지원하나요?", "네. 간체와 번체를 모두 직접 입력할 수 있습니다."]],
    related: "관련 도구", relatedAria: "관련 변환 페이지", footer: "JianFan.app는 브라우저에서 실행되는 중국어 문자 변환 및 병음 도구를 제공합니다."
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "汉字转拼音"], ["chinese-stroke-order", "汉字笔顺查询"], ["simplified-to-traditional", "简体转繁体"], ["traditional-to-simplified", "繁体转简体"], ["file-text-converter", "文件文本简繁转换"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["japanese-characters", "日文字符复制"]],
  "zh-TW": [[slug, "漢字轉拼音"], ["chinese-stroke-order", "漢字筆順查詢"], ["simplified-to-traditional", "簡體轉繁體"], ["traditional-to-simplified", "繁體轉簡體"], ["file-text-converter", "文件文字簡繁轉換"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["japanese-characters", "日文字元複製"]],
  en: [[slug, "Chinese to Pinyin"], ["chinese-stroke-order", "Chinese stroke order"], ["simplified-to-traditional", "Simplified to Traditional"], ["traditional-to-simplified", "Traditional to Simplified"], ["file-text-converter", "Document text converter"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["japanese-characters", "Japanese character copy"]],
  ja: [[slug, "中国語ピンイン変換"], ["chinese-stroke-order", "中国語漢字の筆順"], ["simplified-to-traditional", "簡体字から繁体字"], ["traditional-to-simplified", "繁体字から簡体字"], ["file-text-converter", "文書テキスト変換"], ["japanese-chinese-kanji-converter", "日中漢字3種類変換"], ["japanese-characters", "日本語文字コピー"]],
  ko: [[slug, "중국어 병음 변환"], ["chinese-stroke-order", "중국어 한자 필순"], ["simplified-to-traditional", "간체를 번체로"], ["traditional-to-simplified", "번체를 간체로"], ["file-text-converter", "문서 텍스트 변환"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["japanese-characters", "일본어 문자 복사"]]
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localizedPath(locale, targetSlug = "") {
  return `/${locales[locale].prefix}${targetSlug ? `${targetSlug}/` : ""}`;
}

function buildSchema(locale, page) {
  const canonical = `${siteOrigin}${localizedPath(locale, slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${canonical}#webapp`, name: page.heading, url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${siteOrigin}/#website`, name: "JianFan.app", url: `${siteOrigin}/` } },
      { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${siteOrigin}${localizedPath(locale)}` }, { "@type": "ListItem", position: 2, name: page.heading, item: canonical }] },
      { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
    ]
  };
}

function buildHead(locale, page) {
  const canonical = `${siteOrigin}${localizedPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([targetLocale, meta]) => `    <link rel="alternate" hreflang="${meta.hreflang}" href="${siteOrigin}${localizedPath(targetLocale, slug)}" />`).join("\n");
  return `    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(page.description)}" />
    <title>${escapeHtml(page.title)}</title>
    <link rel="canonical" href="${canonical}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${siteOrigin}${localizedPath("zh-CN", slug)}" />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <script defer src="/vendor/pinyin-pro.js"></script>
    <script defer src="/pinyin-tool.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n")}
    </script>
    <!-- seo-schema:end -->`;
}

function buildHeader(locale) {
  const meta = locales[locale];
  const options = Object.entries(locales).map(([value, option]) => `              <option value="${value}"${value === locale ? " selected" : ""}>${option.label}</option>`).join("\n");
  return `    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.siteHeader}">
      <a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">漢</span><span>JianFan.app</span></a>
      <nav class="top-actions" aria-label="${meta.primary}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${options}
          </select></label></nav>
    </header>`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const bodyMessages = [["idle", page.idle], ["converting", page.converting], ["ready", page.ready], ["copied", page.copied], ["copy-failed", page.copyFailed], ["error", page.error], ["too-long", page.tooLong]].map(([key, value]) => ` data-message-${key}="${escapeHtml(value)}"`).join("");
  const formatButtons = page.formats.map(([value, label, example], index) => `            <button type="button" data-pinyin-format="${value}" role="radio" aria-checked="${index === 0}"${index === 0 ? ' class="is-active"' : ""}><span>${label}</span><small>${example}</small></button>`).join("\n");
  const caseButtons = page.cases.map(([value, label], index) => `            <button type="button" data-pinyin-case="${value}" role="radio" aria-checked="${index === 0}"${index === 0 ? ' class="is-active"' : ""}>${label}</button>`).join("\n");
  const links = relatedLabels[locale].map(([targetSlug, label]) => `          <a href="${localizedPath(locale, targetSlug)}"${targetSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("\n");
  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, page)}
  </head>
  <body data-tool-page="pinyin-converter" data-page-slug="${slug}" data-locale="${locale}"${bodyMessages}>
${buildHeader(locale)}
    <main id="main">
      <section class="tool-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="tool-hero-glyphs" aria-hidden="true"><span>汉</span><span>hàn</span><span>4</span></div></section>
      <section class="standalone-tool pinyin-tool" aria-labelledby="pinyinToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">PINYIN / LOOKUP</p><h2 id="pinyinToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="pinyinStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.idle}</span></div></div>
        <div class="pinyin-options">
          <fieldset><legend>${page.formatLabel}</legend><div class="pinyin-format-control" role="radiogroup" aria-label="${page.formatLabel}">
${formatButtons}
          </div></fieldset>
          <fieldset><legend>${page.caseLabel}</legend><div class="pinyin-case-control" role="radiogroup" aria-label="${page.caseLabel}">
${caseButtons}
          </div></fieldset>
          <div class="pinyin-switches"><label><input id="preserveNonChinese" type="checkbox" checked /><span>${page.preserve}</span></label><label><input id="surnameMode" type="checkbox" /><span>${page.surname}</span></label></div>
        </div>
        <div class="pinyin-converter-grid">
          <section class="pinyin-text-panel input-variant" aria-labelledby="pinyinInputTitle"><div class="panel-topline"><h3 id="pinyinInputTitle">${page.inputTitle}</h3><span id="pinyinInputCount">0</span></div><textarea id="pinyinInput" spellcheck="false" placeholder="${escapeHtml(page.inputPlaceholder)}"></textarea><div class="panel-actions"><button class="text-button" id="pinyinSample" type="button" data-sample="${sampleText}">${page.sample}</button><button class="text-button" id="pinyinClear" type="button">${page.clear}</button><button class="primary-action" id="pinyinConvert" type="button">${page.convert}</button></div></section>
          <section class="pinyin-text-panel output-variant" aria-labelledby="pinyinOutputTitle"><div class="panel-topline"><h3 id="pinyinOutputTitle">${page.outputTitle}</h3><span id="pinyinOutputCount">0</span></div><textarea id="pinyinOutput" readonly spellcheck="false" placeholder="${escapeHtml(page.outputPlaceholder)}"></textarea><div class="panel-actions"><button class="text-button" id="pinyinCopy" type="button">${page.copy}</button></div></section>
        </div>
        <div class="pinyin-detail-grid">
          <section class="pinyin-annotation-panel" aria-labelledby="pinyinAnnotationTitle"><div><p class="section-kicker">RUBY</p><h3 id="pinyinAnnotationTitle">${page.annotationTitle}</h3></div><p id="pinyinAnnotationEmpty" class="pinyin-empty">${page.annotationEmpty}</p><div id="pinyinAnnotation" class="pinyin-annotation" hidden></div><p class="pinyin-preview-note">${page.annotationNote}</p></section>
          <section class="pinyin-lookup-panel" aria-labelledby="pinyinLookupTitle"><div><p class="section-kicker">LOOKUP</p><h3 id="pinyinLookupTitle">${page.lookupTitle}</h3></div><p id="pinyinLookupEmpty" class="pinyin-empty">${page.lookupEmpty}</p><strong id="pinyinLookupCharacter" hidden></strong><div id="pinyinLookupReadings" hidden></div></section>
        </div>
        <p class="tool-disclaimer">${page.disclaimer}</p>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="pinyinFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.seoKicker}</p><h2 id="pinyinFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">
${page.cards.map(([title, text]) => `          <article><h3>${title}</h3><p>${text}</p></article>`).join("\n")}
        </div><section class="pinyin-faq" aria-labelledby="pinyinFaqTitle"><h2 id="pinyinFaqTitle">${page.faqTitle}</h2>
${page.faqs.map(([question, answer]) => `          <details><summary>${question}</summary><p>${answer}</p></details>`).join("\n")}
        </section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">
${links}
        </nav></section>
    </main>
    <footer class="site-footer"><p>${page.footer}</p><nav class="footer-links" aria-label="${meta.footerAria}"><a href="${localizedPath(locale, "about")}">${meta.about}</a><a href="${localizedPath(locale, "contact")}">${meta.contact}</a><a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>`;
}

for (const locale of Object.keys(locales)) {
  const directory = path.join(projectRoot, locales[locale].prefix, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), `${buildPage(locale)}\n`);
}

console.log("Generated 5 multilingual Chinese-to-Pinyin pages.");
