import OpenCC from "https://cdn.jsdelivr.net/npm/opencc-wasm@0.12.0/dist/esm/index.js";

const translations = {
  "zh-CN": {
    pageTitle: "简繁转换 - 简体转繁体 / 繁体转简体在线工具 | HanShift",
    pageDescription:
      "HanShift 是一个基于 OpenCC 实现的在线简繁转换工具，支持简体转繁体、繁体转简体、台湾正体、香港繁体和常用地区词转换。",
    skip: "跳到主要内容",
    homeLink: "网站首页",
    languageLabel: "界面语言",
    eyebrow: "浏览器本地转换",
    title: "简繁转换：简体转繁体 / 繁体转简体",
    lede: "粘贴文本即可转换。适合文章、社媒、字幕、产品文案和日常沟通，也适合作为在线繁体字转换、在线简体字转换和中文简繁转换工具。",
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
    fileKicker: "文件转换",
    fileTitle: "上传文件并在浏览器本地提取文本",
    fileBody: "支持 TXT、CSV、DOCX、PDF、Excel 文件。内容只在当前浏览器中读取，不会上传到服务器。",
    fileDropTitle: "选择或拖入文件",
    fileDropBody: "可多选，提取后会自动填入原文区并转换",
    fileReading: "正在读取文件...",
    fileImported: "已读取 {count} 个文件，并填入原文区。",
    fileUnsupported: "暂不支持该文件类型：{name}",
    fileFailed: "文件读取失败：{name}",
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
    featureKicker: "功能特色",
    featureTitle: "为高频文本转换设计",
    featurePrivacyTitle: "隐私更安心",
    featurePrivacyBody: "文本在浏览器里完成转换，不需要上传到服务器；转换能力基于 OpenCC 实现。",
    featureRegionTitle: "地区表达更准确",
    featureRegionBody: "常用模式放在外层，台湾、香港和日文相关选项收纳在高级区。",
    featureFlowTitle: "处理流程更顺手",
    featureFlowBody: "支持自动转换、方向切换、复制和下载，适合非技术人员连续处理文本。",
    seoKicker: "常见转换需求",
    seoTitle: "覆盖日常中文简繁体转换场景",
    seoIntro:
      "HanShift 可作为在线繁体字转换、在线简体字转换和中文简繁转换工具使用。常用方向直接显示在工作台，高级选项中保留台湾正体、香港繁体和地区用词转换。",
    seoCoreTitle: "核心转换",
    seoCoreBody: "适合简体转繁体、繁体转简体、简繁体转换和繁体字转换器等高频需求。",
    seoRegionTitle: "地区版本",
    seoRegionBody: "需要台湾繁体、简体转台湾正体、港澳繁体或地区词转换时，可在高级选项中选择对应模式。",
    seoUseCaseTitle: "文本场景",
    seoUseCaseBody: "可用于网页内容、社媒文案、字幕、TXT 文本，以及从 Word、PDF、Excel 复制出来的文字。",
    linkTaiwan: "台湾繁体转换",
    linkHongKong: "香港繁体转换",
    linkFiles: "文件文本简繁转换",
    footerText: "HanShift 是一个浏览器本地运行的中文简繁转换工具。",
    sampleText: "在线工具可以帮助用户快速转换简体中文和繁体中文，适合处理软件说明、网页内容和社交媒体文案。"
  },
  "zh-TW": {
    pageTitle: "簡繁轉換 - 簡體轉繁體 / 繁體轉簡體線上工具 | HanShift",
    pageDescription:
      "HanShift 是基於 OpenCC 實現的線上簡繁轉換工具，支援簡體轉繁體、繁體轉簡體、台灣正體、香港繁體與常用地區詞轉換。",
    skip: "跳到主要內容",
    homeLink: "網站首頁",
    languageLabel: "介面語言",
    eyebrow: "瀏覽器本地轉換",
    title: "簡繁轉換：簡體轉繁體 / 繁體轉簡體",
    lede: "貼上文字即可轉換。適合文章、社群、字幕、產品文案與日常溝通，也適合作為正體中文轉換、台灣正體與香港繁體轉換工具。",
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
    fileKicker: "文件轉換",
    fileTitle: "上傳文件並在瀏覽器本地提取文字",
    fileBody: "支援 TXT、CSV、DOCX、PDF、Excel 文件。內容只在目前瀏覽器中讀取，不會上傳到伺服器。",
    fileDropTitle: "選擇或拖入文件",
    fileDropBody: "可多選，提取後會自動填入原文區並轉換",
    fileReading: "正在讀取文件...",
    fileImported: "已讀取 {count} 個文件，並填入原文區。",
    fileUnsupported: "暫不支援此文件類型：{name}",
    fileFailed: "文件讀取失敗：{name}",
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
    featureKicker: "功能特色",
    featureTitle: "為高頻文字轉換設計",
    featurePrivacyTitle: "隱私更安心",
    featurePrivacyBody: "文字在瀏覽器裡完成轉換，不需要上傳到伺服器；轉換能力基於 OpenCC 實現。",
    featureRegionTitle: "地區表達更準確",
    featureRegionBody: "常用模式放在外層，台灣、香港和日文相關選項收納在進階區。",
    featureFlowTitle: "處理流程更順手",
    featureFlowBody: "支援自動轉換、方向切換、複製和下載，適合非技術人員連續處理文字。",
    seoKicker: "常見轉換需求",
    seoTitle: "覆蓋日常中文簡繁體轉換場景",
    seoIntro:
      "HanShift 可處理簡體轉繁體、繁體轉簡體和正體中文轉換。常用方向直接顯示在工作台，進階選項保留台灣正體、香港繁體和地區用詞轉換。",
    seoCoreTitle: "核心轉換",
    seoCoreBody: "適合簡體轉繁體、繁體轉簡體、簡繁體轉換和繁體字轉換器等高頻需求。",
    seoRegionTitle: "地區版本",
    seoRegionBody: "需要台灣繁體、簡體轉台灣正體、港澳繁體或地區詞轉換時，可在進階選項中選擇對應模式。",
    seoUseCaseTitle: "文字場景",
    seoUseCaseBody: "可用於網頁內容、社群文案、字幕、TXT 文字，以及從 Word、PDF、Excel 複製出來的文字。",
    linkTaiwan: "台灣繁體轉換",
    linkHongKong: "香港繁體轉換",
    linkFiles: "文件文字簡繁轉換",
    footerText: "HanShift 是一個瀏覽器本地運行的中文簡繁轉換工具。",
    sampleText: "線上工具可以幫助使用者快速轉換簡體中文和繁體中文，適合處理軟體說明、網頁內容和社群文案。"
  },
  en: {
    pageTitle: "Simplified to Traditional Chinese Converter | HanShift",
    pageDescription:
      "HanShift is an online Chinese converter built with OpenCC for Simplified Chinese, Traditional Chinese, Taiwan Traditional, Hong Kong Traditional, and regional wording.",
    skip: "Skip to main content",
    homeLink: "Home",
    languageLabel: "Language",
    eyebrow: "Local browser conversion",
    title: "Simplified to Traditional Chinese Converter",
    lede: "Paste text and convert instantly. Use HanShift as a traditional to simplified Chinese converter, Chinese character converter, and regional wording tool without exposing technical settings.",
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
    fileKicker: "File conversion",
    fileTitle: "Upload files and extract text locally in your browser",
    fileBody: "Supports TXT, CSV, DOCX, PDF, and Excel files. Content is read only in this browser and is not uploaded.",
    fileDropTitle: "Choose or drop files",
    fileDropBody: "Multiple files are supported and will be converted after text extraction",
    fileReading: "Reading files...",
    fileImported: "Read {count} file(s) and placed the text in the original field.",
    fileUnsupported: "Unsupported file type: {name}",
    fileFailed: "Could not read file: {name}",
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
    featureKicker: "Features",
    featureTitle: "Designed for frequent text conversion",
    featurePrivacyTitle: "More privacy by default",
    featurePrivacyBody: "Text is converted in the browser without uploading it to a server; the conversion engine is built with OpenCC.",
    featureRegionTitle: "More accurate regional wording",
    featureRegionBody: "Common modes stay visible, while Taiwan, Hong Kong, and Japanese options sit in the advanced area.",
    featureFlowTitle: "Smoother text workflow",
    featureFlowBody: "Auto conversion, swapping, copy, and download support repeated text work for non-technical users.",
    seoKicker: "Common conversion needs",
    seoTitle: "Built for everyday Chinese character conversion",
    seoIntro:
      "HanShift covers simplified to traditional Chinese converter, traditional to simplified Chinese converter, Chinese character converter, and convert Chinese traditional to simplified online search intent in one focused workspace.",
    seoCoreTitle: "Core conversion",
    seoCoreBody: "Convert Simplified Chinese to Traditional Chinese, Traditional Chinese to Simplified Chinese, or handle two-way Chinese character conversion.",
    seoRegionTitle: "Regional variants",
    seoRegionBody: "Choose Taiwan Traditional, Hong Kong Traditional, and phrase-level regional wording from the advanced options.",
    seoUseCaseTitle: "Text workflows",
    seoUseCaseBody: "Use it for web content, social posts, subtitles, TXT text, or text copied from Word, PDF, and Excel files.",
    linkTaiwan: "Taiwan Traditional converter",
    linkHongKong: "Hong Kong Traditional converter",
    linkFiles: "Document text converter",
    footerText: "HanShift is a browser-local Chinese Simplified and Traditional conversion tool.",
    sampleText: "Online tools help users convert Simplified and Traditional Chinese quickly for software guides, web pages, and social media copy."
  },
  ja: {
    pageTitle: "簡体字 繁体字 変換ツール | HanShift",
    pageDescription:
      "HanShift は OpenCC を基にした中国語変換ツールです。簡体字、繁体字、台湾繁体字、香港繁体字、地域別表現に対応します。",
    skip: "メインコンテンツへ移動",
    homeLink: "ホーム",
    languageLabel: "表示言語",
    eyebrow: "ブラウザー内で変換",
    title: "簡体字 繁体字 変換ツール",
    lede: "テキストを貼り付けるだけで、中国語の簡体字と繁体字を相互変換できます。記事、SNS、字幕、製品コピー、日常の文章作成に使いやすい設計です。",
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
    fileKicker: "ファイル変換",
    fileTitle: "ブラウザー内でファイルからテキストを抽出",
    fileBody: "TXT、CSV、DOCX、PDF、Excel ファイルに対応します。内容はこのブラウザー内でのみ読み取られ、サーバーへ送信されません。",
    fileDropTitle: "ファイルを選択またはドロップ",
    fileDropBody: "複数選択できます。抽出後、自動で原文欄に入り変換されます",
    fileReading: "ファイルを読み込み中...",
    fileImported: "{count} 個のファイルを読み込み、原文欄に入力しました。",
    fileUnsupported: "未対応のファイル形式です：{name}",
    fileFailed: "ファイルを読み込めません：{name}",
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
    featureKicker: "機能",
    featureTitle: "頻繁なテキスト変換に最適化",
    featurePrivacyTitle: "プライバシーに配慮",
    featurePrivacyBody: "テキストはブラウザー内で変換され、サーバーへアップロードされません。変換機能は OpenCC を基にしています。",
    featureRegionTitle: "地域別表現に対応",
    featureRegionBody: "よく使うモードは表に出し、台湾・香港・日本語関連は詳細エリアにまとめています。",
    featureFlowTitle: "スムーズな作業フロー",
    featureFlowBody: "自動変換、方向切替、コピー、ダウンロードにより、非技術者でも連続作業しやすくなっています。",
    seoKicker: "よく使う変換",
    seoTitle: "中国語の簡体字・繁体字変換に対応",
    seoIntro:
      "HanShift は「簡体字 繁体字 変換」「繁体字 簡体字 変換」「中国語 簡体字 繁体字 変換」「簡体字 繁体字 変換 ツール」の用途に対応します。",
    seoCoreTitle: "基本変換",
    seoCoreBody: "簡体字から繁体字、繁体字から簡体字への相互変換をすばやく処理できます。",
    seoRegionTitle: "地域別表記",
    seoRegionBody: "台湾 繁体字 変換、香港 繁体字 変換、日本語新字体と旧字体の変換も詳細オプションから選べます。",
    seoUseCaseTitle: "テキスト作業",
    seoUseCaseBody: "Web コンテンツ、SNS 投稿、字幕、TXT、Word、PDF、Excel からコピーしたテキストに利用できます。",
    linkTaiwan: "台湾 繁体字 変換",
    linkHongKong: "香港 繁体字 変換",
    linkFiles: "文書テキスト変換",
    footerText: "HanShift はブラウザー内で動作する中国語簡繁変換ツールです。",
    sampleText: "オンラインツールは、ソフトウェア説明、Web コンテンツ、SNS 投稿用の簡体字と繁体字の変換に役立ちます。"
  },
  ko: {
    pageTitle: "간체 번체 변환기 | HanShift",
    pageDescription:
      "HanShift는 OpenCC 기반 온라인 중국어 변환 도구로 간체, 번체, 대만 번체, 홍콩 번체, 지역 표현 변환을 지원합니다.",
    skip: "본문으로 건너뛰기",
    homeLink: "홈",
    languageLabel: "인터페이스 언어",
    eyebrow: "브라우저 로컬 변환",
    title: "간체 번체 변환기",
    lede: "텍스트를 붙여 넣으면 중국어 간체와 번체를 바로 변환합니다. 글, 소셜 게시물, 자막, 제품 문구, 일상 커뮤니케이션에 적합합니다.",
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
    fileKicker: "파일 변환",
    fileTitle: "브라우저에서 파일 텍스트 추출",
    fileBody: "TXT, CSV, DOCX, PDF, Excel 파일을 지원합니다. 내용은 이 브라우저 안에서만 읽고 서버로 업로드하지 않습니다.",
    fileDropTitle: "파일 선택 또는 드롭",
    fileDropBody: "여러 파일을 선택할 수 있으며 추출 후 자동으로 원문 영역에 입력됩니다",
    fileReading: "파일을 읽는 중...",
    fileImported: "{count}개 파일을 읽고 원문 영역에 입력했습니다.",
    fileUnsupported: "지원하지 않는 파일 형식: {name}",
    fileFailed: "파일을 읽지 못했습니다: {name}",
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
    featureKicker: "기능",
    featureTitle: "반복 텍스트 변환에 최적화",
    featurePrivacyTitle: "더 안심되는 개인정보 보호",
    featurePrivacyBody: "텍스트는 브라우저 안에서 변환되며 서버로 업로드되지 않습니다. 변환 기능은 OpenCC를 기반으로 합니다.",
    featureRegionTitle: "더 정확한 지역별 표현",
    featureRegionBody: "자주 쓰는 모드는 바깥에 두고, 대만·홍콩·일본어 관련 옵션은 고급 영역에 정리했습니다.",
    featureFlowTitle: "더 매끄러운 작업 흐름",
    featureFlowBody: "자동 변환, 방향 전환, 복사, 다운로드로 비기술 사용자도 반복 작업을 쉽게 할 수 있습니다.",
    seoKicker: "자주 쓰는 변환",
    seoTitle: "중국어 간체·번체 변환에 최적화",
    seoIntro:
      "HanShift는 간체 번체 변환기, 중국어 간체 번체 변환, 번체 간체 변환, 중국어 간체자 번체자 변환 검색 의도를 한 작업 화면에서 처리합니다.",
    seoCoreTitle: "기본 변환",
    seoCoreBody: "간체를 번체로, 번체를 간체로 빠르게 바꾸고 중국어 글자 변환 작업을 반복 처리할 수 있습니다.",
    seoRegionTitle: "지역별 번체",
    seoRegionBody: "대만 번체 변환, 홍콩 번체 변환, 지역 표현 변환은 고급 옵션에서 선택할 수 있습니다.",
    seoUseCaseTitle: "텍스트 작업",
    seoUseCaseBody: "웹 콘텐츠, 소셜 게시물, 자막, TXT, Word, PDF, Excel에서 복사한 텍스트에 사용할 수 있습니다.",
    linkTaiwan: "대만 번체 변환",
    linkHongKong: "홍콩 번체 변환",
    linkFiles: "문서 텍스트 변환",
    footerText: "HanShift는 브라우저에서 로컬로 실행되는 중국어 간체·번체 변환 도구입니다.",
    sampleText: "온라인 도구는 소프트웨어 설명, 웹 콘텐츠, 소셜 미디어 문구에 쓰이는 간체와 번체 변환을 빠르게 도와줍니다."
  }
};

const landingPages = {
  "taiwan-traditional": {
    defaultConfig: "s2twp",
    content: {
      "zh-CN": {
        pageTitle: "台湾繁体转换 - 简体转台湾正体 / 大陆用词转台湾用词 | HanShift",
        pageDescription:
          "基于 OpenCC 实现的在线台湾繁体转换工具，支持简体转台湾正体、正体中文转换和大陆用词转台湾用词。",
        eyebrow: "台湾正体转换",
        title: "台湾繁体转换：简体转台湾正体",
        lede: "输入简体中文即可转换为更适合台湾读者的正体中文。高级模式会同时处理字形和部分大陆用词转台湾用词需求。",
        featureTitle: "面向台湾地区内容本地化",
        featureRegionTitle: "包含台湾用词",
        featureRegionBody: "使用“简体 → 台湾正体（含用词）”模式，可处理常见地区表达差异。",
        seoKicker: "台湾繁体关键词",
        seoTitle: "承接台湾繁体、正体中文转换和地区词转换",
        seoIntro:
          "这个页面面向台湾繁体、简体转台湾正体、正体中文转换、大陆用词转台湾用词等搜索需求。适合网页、产品文案、字幕和社群内容进入台湾市场前的文本处理。",
        seoCoreTitle: "简体转台湾正体",
        seoCoreBody: "默认启用台湾正体含用词模式，减少用户在高级配置中反复选择。",
        seoRegionTitle: "大陆词汇对照台湾词汇",
        seoRegionBody: "适合处理软件界面、说明文档、客服话术和营销文案中的地区表达。",
        seoUseCaseTitle: "发布前校对",
        seoUseCaseBody: "转换结果仍建议人工校对，尤其是品牌名、专有名词和语境相关词。"
      },
      "zh-TW": {
        pageTitle: "台灣繁體轉換 - 簡體轉台灣正體 | HanShift",
        pageDescription: "基於 OpenCC 實現的線上台灣繁體轉換工具，支援簡體轉台灣正體與地區用詞轉換。",
        eyebrow: "台灣正體轉換",
        title: "台灣繁體轉換：簡體轉台灣正體",
        lede: "輸入簡體中文即可轉換為更適合台灣讀者的正體中文，並可處理部分地區用詞差異。",
        featureTitle: "面向台灣在地化內容",
        featureRegionTitle: "包含台灣用詞",
        featureRegionBody: "使用「簡體 → 台灣正體（含用詞）」模式，可處理常見地區表達差異。",
        seoKicker: "台灣繁體關鍵詞",
        seoTitle: "承接台灣繁體、正體中文轉換和地區詞轉換",
        seoIntro: "這個頁面適合簡體轉台灣正體、正體中文轉換與台灣在地化文字處理需求。",
        seoCoreTitle: "簡體轉台灣正體",
        seoCoreBody: "預設啟用台灣正體含用詞模式，降低重複選擇設定的成本。",
        seoRegionTitle: "地區詞轉換",
        seoRegionBody: "適合軟體介面、說明文件、客服話術與行銷文案。",
        seoUseCaseTitle: "發布前校對",
        seoUseCaseBody: "轉換結果仍建議人工校對，尤其是品牌名、專有名詞和語境相關詞。"
      },
      en: {
        pageTitle: "Taiwan Traditional Chinese Converter | HanShift",
        pageDescription: "Convert Simplified Chinese to Taiwan Traditional Chinese with regional wording support. Built with OpenCC.",
        eyebrow: "Taiwan Traditional conversion",
        title: "Taiwan Traditional Chinese Converter",
        lede: "Convert Simplified Chinese text into Taiwan Traditional Chinese with phrase-level regional wording support.",
        featureTitle: "For Taiwan localization workflows",
        featureRegionTitle: "Taiwan wording",
        featureRegionBody: "The Taiwan phrases mode handles character conversion plus common regional wording differences.",
        seoKicker: "Taiwan Traditional search intent",
        seoTitle: "Simplified Chinese to Taiwan Traditional Chinese",
        seoIntro: "Use this page for Taiwan Traditional Chinese conversion, Taiwan phrase localization, web copy, subtitles, and product text.",
        seoCoreTitle: "Default Taiwan mode",
        seoCoreBody: "This landing page opens the converter with Taiwan Traditional phrases selected.",
        seoRegionTitle: "Regional localization",
        seoRegionBody: "Useful for UI copy, help docs, support macros, and marketing content.",
        seoUseCaseTitle: "Human review friendly",
        seoUseCaseBody: "Keep reviewing brand names, product terms, and context-sensitive wording after conversion."
      },
      ja: {
        pageTitle: "台湾 繁体字 変換 | HanShift",
        pageDescription: "OpenCC を基に、簡体字を台湾向け繁体字に変換。中国語の台湾繁体字表記や地域別表現の確認に使えます。",
        eyebrow: "台湾繁体字変換",
        title: "台湾 繁体字 変換",
        lede: "簡体字テキストを台湾向けの繁体字に変換し、地域別表現の違いも確認しやすくします。",
        featureTitle: "台湾向け中国語ローカライズに対応",
        featureRegionTitle: "台湾表現",
        featureRegionBody: "台湾用語込みの変換モードで、字形と一部の表現差をまとめて処理できます。",
        seoKicker: "台湾繁体字",
        seoTitle: "簡体字から台湾繁体字へ変換",
        seoIntro: "台湾 繁体字 変換、中国語 簡体字 繁体字 変換、台湾向けローカライズの用途に対応します。",
        seoCoreTitle: "台湾モード",
        seoCoreBody: "このページでは台湾用語込みの変換モードを初期選択します。",
        seoRegionTitle: "地域別表現",
        seoRegionBody: "Web、字幕、製品コピー、説明文の台湾向け調整に使えます。",
        seoUseCaseTitle: "公開前チェック",
        seoUseCaseBody: "固有名詞やブランド名は変換後も人の目で確認してください。"
      },
      ko: {
        pageTitle: "대만 번체 변환 | HanShift",
        pageDescription: "OpenCC 기반 도구로 중국어 간체를 대만 번체로 변환하고 지역 표현 차이를 확인할 수 있습니다.",
        eyebrow: "대만 번체 변환",
        title: "대만 번체 변환",
        lede: "중국어 간체 텍스트를 대만 독자에게 맞는 번체와 지역 표현으로 변환합니다.",
        featureTitle: "대만 현지화 작업에 맞춤",
        featureRegionTitle: "대만 표현",
        featureRegionBody: "대만 용어 포함 모드로 글자 변환과 일부 지역 표현 차이를 함께 처리합니다.",
        seoKicker: "대만 번체 검색 의도",
        seoTitle: "중국어 간체를 대만 번체로 변환",
        seoIntro: "대만 번체 변환, 중국어 간체 번체 변환, 현지화 문구 작업에 사용할 수 있습니다.",
        seoCoreTitle: "대만 모드",
        seoCoreBody: "이 페이지는 대만 용어 포함 변환 모드를 기본으로 엽니다.",
        seoRegionTitle: "지역별 표현",
        seoRegionBody: "웹 콘텐츠, 자막, 제품 문구, 설명 텍스트를 대만 독자에 맞게 조정할 때 유용합니다.",
        seoUseCaseTitle: "게시 전 검토",
        seoUseCaseBody: "브랜드명, 고유명사, 문맥 의존 표현은 변환 후에도 사람이 확인하는 것이 좋습니다."
      }
    }
  },
  "hong-kong-traditional": {
    defaultConfig: "s2hkp",
    content: {
      "zh-CN": {
        pageTitle: "香港繁体转换 - 简体转香港繁体 / 港澳繁体在线工具 | HanShift",
        pageDescription: "基于 OpenCC 实现的在线香港繁体转换工具，支持简体转香港繁体、港澳繁体和地区用词转换。",
        eyebrow: "香港繁体转换",
        title: "香港繁体转换：简体转港澳繁体",
        lede: "把简体中文转换为更适合香港和港澳读者的繁体文本，适合公告、字幕、网页和产品文案。",
        featureTitle: "面向香港和港澳繁体场景",
        featureRegionTitle: "包含香港用词",
        featureRegionBody: "使用“简体 → 香港繁体（含用词）”模式处理字形和部分地区表达。",
        seoKicker: "港澳繁体关键词",
        seoTitle: "承接港澳繁体、香港繁体和地区词转换",
        seoIntro: "这个页面面向港澳繁体、香港繁体转换、地区词转换等长尾需求，默认打开香港繁体含用词模式。",
        seoCoreTitle: "简体转香港繁体",
        seoCoreBody: "适合从大陆简体内容生成香港繁体版本。",
        seoRegionTitle: "港澳地区表达",
        seoRegionBody: "可用于网页、本地化说明、字幕和面向香港读者的社媒文案。",
        seoUseCaseTitle: "保留人工审核",
        seoUseCaseBody: "金融、法律、医疗等高风险文本仍应由专业人员复核。"
      },
      "zh-TW": {
        pageTitle: "香港繁體轉換 - 簡體轉香港繁體 | HanShift",
        pageDescription: "基於 OpenCC 實現的線上香港繁體轉換工具，支援簡體轉香港繁體、港澳繁體和地區用詞轉換。",
        eyebrow: "香港繁體轉換",
        title: "香港繁體轉換：簡體轉港澳繁體",
        lede: "把簡體中文轉換為更適合香港和港澳讀者的繁體文字，適合公告、字幕、網頁和產品文案。",
        featureTitle: "面向香港和港澳繁體場景",
        featureRegionTitle: "包含香港用詞",
        featureRegionBody: "使用「簡體 → 香港繁體（含用詞）」模式處理字形和部分地區表達。",
        seoKicker: "港澳繁體關鍵詞",
        seoTitle: "承接港澳繁體、香港繁體和地區詞轉換",
        seoIntro: "這個頁面面向港澳繁體、香港繁體轉換和地區詞轉換需求，預設開啟香港繁體含用詞模式。",
        seoCoreTitle: "簡體轉香港繁體",
        seoCoreBody: "適合從大陸簡體內容生成香港繁體版本。",
        seoRegionTitle: "港澳地區表達",
        seoRegionBody: "可用於網頁、本地化說明、字幕和面向香港讀者的社群文案。",
        seoUseCaseTitle: "保留人工審核",
        seoUseCaseBody: "金融、法律、醫療等高風險文字仍應由專業人員複核。"
      },
      en: {
        pageTitle: "Hong Kong Traditional Chinese Converter | HanShift",
        pageDescription: "Convert Simplified Chinese to Hong Kong Traditional Chinese with phrase-level regional wording support. Built with OpenCC.",
        eyebrow: "Hong Kong Traditional conversion",
        title: "Hong Kong Traditional Chinese Converter",
        lede: "Convert Simplified Chinese text into Hong Kong Traditional Chinese for web copy, subtitles, announcements, and product text.",
        featureTitle: "For Hong Kong localization",
        featureRegionTitle: "Hong Kong wording",
        featureRegionBody: "The Hong Kong phrases mode handles character conversion plus common regional wording differences.",
        seoKicker: "Hong Kong Traditional search intent",
        seoTitle: "Simplified Chinese to Hong Kong Traditional Chinese",
        seoIntro: "Use this page for Hong Kong Traditional Chinese conversion and regional phrase localization.",
        seoCoreTitle: "Default Hong Kong mode",
        seoCoreBody: "This page opens the converter with Hong Kong Traditional phrases selected.",
        seoRegionTitle: "Local wording",
        seoRegionBody: "Useful for web content, help docs, subtitles, and social copy.",
        seoUseCaseTitle: "Review sensitive text",
        seoUseCaseBody: "Legal, financial, medical, and official text should still receive specialist review."
      },
      ja: {
        pageTitle: "香港 繁体字 変換 | HanShift",
        pageDescription: "OpenCC を基に、簡体字を香港向け繁体字に変換。中国語の香港繁体字表記や地域別表現に対応します。",
        eyebrow: "香港繁体字変換",
        title: "香港 繁体字 変換",
        lede: "簡体字テキストを香港向けの繁体字に変換し、地域別表現の違いも確認しやすくします。",
        featureTitle: "香港向け中国語ローカライズ",
        featureRegionTitle: "香港表現",
        featureRegionBody: "香港用語込みの変換モードで、字形と一部の表現差をまとめて処理できます。",
        seoKicker: "香港繁体字",
        seoTitle: "簡体字から香港繁体字へ変換",
        seoIntro: "香港 繁体字 変換、中国語 簡体字 繁体字 変換、香港向けローカライズの用途に対応します。",
        seoCoreTitle: "香港モード",
        seoCoreBody: "このページでは香港用語込みの変換モードを初期選択します。",
        seoRegionTitle: "地域別表現",
        seoRegionBody: "Web、字幕、製品コピー、説明文の香港向け調整に使えます。",
        seoUseCaseTitle: "専門文書の確認",
        seoUseCaseBody: "法務、金融、医療などの文章は専門家の確認を前提にしてください。"
      },
      ko: {
        pageTitle: "홍콩 번체 변환 | HanShift",
        pageDescription: "OpenCC 기반 도구로 중국어 간체를 홍콩 번체로 변환하고 지역 표현 차이를 확인할 수 있습니다.",
        eyebrow: "홍콩 번체 변환",
        title: "홍콩 번체 변환",
        lede: "중국어 간체 텍스트를 홍콩 독자에게 맞는 번체와 지역 표현으로 변환합니다.",
        featureTitle: "홍콩 현지화 작업에 맞춤",
        featureRegionTitle: "홍콩 표현",
        featureRegionBody: "홍콩 용어 포함 모드로 글자 변환과 일부 지역 표현 차이를 함께 처리합니다.",
        seoKicker: "홍콩 번체 검색 의도",
        seoTitle: "중국어 간체를 홍콩 번체로 변환",
        seoIntro: "홍콩 번체 변환, 중국어 간체 번체 변환, 현지화 문구 작업에 사용할 수 있습니다.",
        seoCoreTitle: "홍콩 모드",
        seoCoreBody: "이 페이지는 홍콩 용어 포함 변환 모드를 기본으로 엽니다.",
        seoRegionTitle: "지역별 표현",
        seoRegionBody: "웹 콘텐츠, 자막, 제품 문구, 설명 텍스트를 홍콩 독자에 맞게 조정할 때 유용합니다.",
        seoUseCaseTitle: "전문 문서 검토",
        seoUseCaseBody: "법률, 금융, 의료 문서는 전문가 검토를 전제로 사용하세요."
      }
    }
  },
  "file-text-converter": {
    defaultConfig: "s2t",
    content: {
      "zh-CN": {
        pageTitle: "Word/PDF/TXT/Excel 简繁转换 - 文件文本在线转换 | HanShift",
        pageDescription: "把 Word、PDF、TXT、Excel 文件上传到 HanShift，在浏览器端提取文本并基于 OpenCC 进行简繁转换。",
        eyebrow: "文件文本转换",
        title: "Word、PDF、TXT、Excel 文本简繁转换",
        lede: "上传 Word、PDF、TXT 或 Excel 文件后，HanShift 会在浏览器端提取文本，并进行简体转繁体、繁体转简体和地区版本转换。",
        featureTitle: "适合文件内容的轻量转换流程",
        featureFlowTitle: "复制粘贴即可处理",
        featureFlowBody: "文件在浏览器端读取文本，不需要后端处理，适合快速转换文档片段。",
        seoKicker: "文件场景关键词",
        seoTitle: "承接 Word、PDF、TXT、Excel 简繁转换需求",
        seoIntro:
          "这个页面覆盖 word简体繁体转换、word文档简繁转换、pdf简繁转换、txt文件简繁转换、excel简繁转换等任务型搜索。文件内容在浏览器端读取文本后再转换。",
        seoCoreTitle: "Word 文档简繁转换",
        seoCoreBody: "上传 DOCX 文件后提取段落文本，转换后可复制回文档。",
        seoRegionTitle: "PDF/TXT/Excel 文本",
        seoRegionBody: "适合处理 PDF 可选中文字、TXT 全文和 Excel 单元格文本。",
        seoUseCaseTitle: "批量文件的现实路径",
        seoUseCaseBody: "支持多选文件并合并提取文本；复杂排版仍建议转换后人工复核格式。"
      },
      "zh-TW": {
        pageTitle: "Word/PDF/TXT/Excel 簡繁轉換 - 文件文字線上轉換 | HanShift",
        pageDescription: "把 Word、PDF、TXT、Excel 文件上傳到 HanShift，在瀏覽器端提取文字並基於 OpenCC 進行簡繁轉換。",
        eyebrow: "文件文字轉換",
        title: "Word、PDF、TXT、Excel 文字簡繁轉換",
        lede: "上傳 Word、PDF、TXT 或 Excel 文件後，HanShift 會在瀏覽器端提取文字，並進行簡繁轉換和地區版本轉換。",
        featureTitle: "適合文件內容的輕量轉換流程",
        featureFlowTitle: "複製貼上即可處理",
        featureFlowBody: "文件在瀏覽器端讀取文字，不需要後端處理，適合快速轉換文件片段。",
        seoKicker: "文件場景關鍵詞",
        seoTitle: "承接 Word、PDF、TXT、Excel 簡繁轉換需求",
        seoIntro: "這個頁面適合 Word 文件、PDF、TXT、Excel 文字的簡繁轉換。文件內容會在瀏覽器端提取文字後再轉換。",
        seoCoreTitle: "Word 文件簡繁轉換",
        seoCoreBody: "上傳 DOCX 文件後提取段落文字，轉換後可複製回文件。",
        seoRegionTitle: "PDF/TXT/Excel 文字",
        seoRegionBody: "適合處理 PDF 可選文字、TXT 全文和 Excel 儲存格文字。",
        seoUseCaseTitle: "批量文件流程",
        seoUseCaseBody: "支援多選文件並合併提取文字；複雜排版仍建議轉換後人工複核格式。"
      },
      en: {
        pageTitle: "Chinese Document Text Converter for Word, PDF, TXT and Excel | HanShift",
        pageDescription: "Upload Word, PDF, TXT, or Excel files, extract text in the browser, and convert Simplified and Traditional Chinese with OpenCC.",
        eyebrow: "Document text conversion",
        title: "Chinese text converter for Word, PDF, TXT, and Excel",
        lede: "Upload Word, PDF, TXT, or Excel files, extract text locally in the browser, and convert it between Simplified and Traditional Chinese.",
        featureTitle: "A lightweight document text workflow",
        featureFlowTitle: "Copy, convert, paste back",
        featureFlowBody: "Files are read locally in the browser without backend processing, making document text conversion faster.",
        seoKicker: "Document workflow search intent",
        seoTitle: "Convert Chinese text copied from Word, PDF, TXT, and Excel",
        seoIntro: "Use this page when you need a Chinese converter for Word documents, PDFs, TXT files, or Excel cells. Text is extracted locally before conversion.",
        seoCoreTitle: "Word text conversion",
        seoCoreBody: "Upload DOCX files, extract paragraph text, convert it, and paste the result back into your document.",
        seoRegionTitle: "PDF, TXT, and Excel text",
        seoRegionBody: "Works well for selectable PDF text, plain TXT content, and spreadsheet cell text.",
        seoUseCaseTitle: "Batch file note",
        seoUseCaseBody: "Multiple files can be selected and merged into the input area; review formatting manually after conversion."
      },
      ja: {
        pageTitle: "Word・PDF・TXT・Excel の中国語簡繁変換 | HanShift",
        pageDescription: "Word、PDF、TXT、Excel ファイルからブラウザー内でテキストを抽出し、OpenCC を基に簡繁変換できます。",
        eyebrow: "文書テキスト変換",
        title: "Word・PDF・TXT・Excel の簡体字 繁体字 変換",
        lede: "Word、PDF、TXT、Excel ファイルをアップロードし、ブラウザー内でテキストを抽出して簡体字と繁体字を変換できます。",
        featureTitle: "文書テキスト向けの軽量ワークフロー",
        featureFlowTitle: "コピーして変換",
        featureFlowBody: "ファイルはブラウザー内で読み取られ、バックエンド処理なしで文書テキストを変換できます。",
        seoKicker: "文書変換",
        seoTitle: "Word、PDF、TXT、Excel からコピーした中国語を変換",
        seoIntro: "Word、PDF、TXT、Excel ファイルの中国語テキストをブラウザー内で抽出し、簡体字・繁体字変換に使えます。",
        seoCoreTitle: "Word テキスト変換",
        seoCoreBody: "DOCX ファイルをアップロードして段落テキストを抽出し、変換後に文書へ戻せます。",
        seoRegionTitle: "PDF/TXT/Excel",
        seoRegionBody: "選択可能な PDF 文字、TXT 全文、Excel セルの文字に対応します。",
        seoUseCaseTitle: "一括変換の注意",
        seoUseCaseBody: "複数ファイルを選択して入力欄にまとめられます。複雑なレイアウトは変換後に確認してください。"
      },
      ko: {
        pageTitle: "Word, PDF, TXT, Excel 중국어 간체 번체 변환 | HanShift",
        pageDescription: "Word, PDF, TXT, Excel 파일에서 브라우저 안에서 텍스트를 추출하고 OpenCC 기반으로 간체와 번체를 변환합니다.",
        eyebrow: "문서 텍스트 변환",
        title: "Word, PDF, TXT, Excel 텍스트 간체 번체 변환",
        lede: "Word, PDF, TXT, Excel 파일을 업로드하면 브라우저 안에서 텍스트를 추출해 간체와 번체로 변환합니다.",
        featureTitle: "문서 텍스트에 맞춘 간단한 흐름",
        featureFlowTitle: "복사해서 변환",
        featureFlowBody: "파일은 브라우저 안에서 읽고 백엔드 처리 없이 문서 텍스트를 변환합니다.",
        seoKicker: "문서 변환 검색 의도",
        seoTitle: "Word, PDF, TXT, Excel에서 복사한 중국어 변환",
        seoIntro: "Word 문서, PDF, TXT, Excel 파일의 중국어 텍스트를 브라우저 안에서 추출해 간체 번체 변환에 사용할 수 있습니다.",
        seoCoreTitle: "Word 텍스트 변환",
        seoCoreBody: "DOCX 파일을 업로드해 문단 텍스트를 추출하고 변환 후 다시 문서에 붙여 넣을 수 있습니다.",
        seoRegionTitle: "PDF/TXT/Excel",
        seoRegionBody: "선택 가능한 PDF 텍스트, TXT 전문, Excel 셀 텍스트에 적합합니다.",
        seoUseCaseTitle: "일괄 파일 참고",
        seoUseCaseBody: "여러 파일을 선택해 입력 영역에 합칠 수 있습니다. 복잡한 형식은 변환 후 직접 확인하세요."
      }
    }
  }
};

const localePaths = {
  "zh-CN": "/",
  "zh-TW": "/zh-tw/",
  en: "/en/",
  ja: "/ja/",
  ko: "/ko/"
};

const supportedPageSlugs = Object.keys(landingPages);

const elements = {
  homeBrand: document.querySelector("#homeBrand"),
  homeLink: document.querySelector("#homeLink"),
  localeSelect: document.querySelector("#localeSelect"),
  engineStatus: document.querySelector("#engineStatus"),
  configSelect: document.querySelector("#configSelect"),
  autoConvert: document.querySelector("#autoConvert"),
  fileDrop: document.querySelector("#fileDrop"),
  fileInput: document.querySelector("#fileInput"),
  fileImportStatus: document.querySelector("#fileImportStatus"),
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
const activePageSlug = getActivePageSlug();
let activeLocale = getInitialLocale();
let activeConfig =
  new URLSearchParams(window.location.search).get("config") ||
  landingPages[activePageSlug]?.defaultConfig ||
  "s2t";
let conversionToken = 0;
let convertTimer;
let currentStatusKey = "statusIdle";
let currentStatusType = "idle";

applyLocale(activeLocale);
setConfig(activeConfig);
updateCounts();
scheduleConvert();

elements.localeSelect.addEventListener("change", () => {
  const nextLocale = elements.localeSelect.value;
  localStorage.setItem("hanshift-locale", nextLocale);
  localStorage.setItem("hanshift-locale-manual", "1");
  navigateToLocale(nextLocale);
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

elements.fileInput.addEventListener("change", () => {
  handleFiles(elements.fileInput.files);
  elements.fileInput.value = "";
});

elements.fileDrop.addEventListener("dragover", (event) => {
  event.preventDefault();
  elements.fileDrop.classList.add("is-dragging");
});

elements.fileDrop.addEventListener("dragleave", () => {
  elements.fileDrop.classList.remove("is-dragging");
});

elements.fileDrop.addEventListener("drop", (event) => {
  event.preventDefault();
  elements.fileDrop.classList.remove("is-dragging");
  handleFiles(event.dataTransfer.files);
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
  const pathLocale = getLocaleFromPath();
  if (pathLocale) return pathLocale;
  return "zh-CN";
}

function applyLocale(locale) {
  const dictionary = getDictionary(locale);
  document.documentElement.lang = locale;
  elements.localeSelect.value = locale;
  updateHomeLinks(locale);
  applyMeta(locale);
  updateLandingLinks(locale);

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
  return getDictionary(activeLocale)[key] || translations["zh-CN"][key] || key;
}

function formatMessage(key, values = {}) {
  return t(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function getDictionary(locale) {
  return {
    ...(translations[locale] || translations["zh-CN"]),
    ...(landingPages[activePageSlug]?.content?.[locale] || {})
  };
}

function getActivePageSlug() {
  const segments = window.location.pathname.split("/").filter(Boolean);
  const firstContentSegment = ["zh-tw", "en", "ja", "ko"].includes(segments[0]) ? segments[1] : segments[0];
  return supportedPageSlugs.includes(firstContentSegment) ? firstContentSegment : "";
}

function getLocaleFromPath() {
  const path = window.location.pathname.replace(/\/+$/, "/");
  if (path.startsWith("/zh-tw/")) return "zh-TW";
  if (path.startsWith("/en/")) return "en";
  if (path.startsWith("/ja/")) return "ja";
  if (path.startsWith("/ko/")) return "ko";
  return "zh-CN";
}

function navigateToLocale(locale) {
  const targetPath = getLocalizedPath(locale, activePageSlug);
  const targetUrl = new URL(window.location.href);
  targetUrl.pathname = targetPath;
  targetUrl.searchParams.set("config", activeConfig);

  if (window.location.pathname === targetPath) {
    activeLocale = locale;
    applyLocale(locale);
    return;
  }

  window.location.assign(targetUrl);
}

function applyMeta(locale) {
  const dictionary = getDictionary(locale);
  document.title = dictionary.pageTitle;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", dictionary.pageDescription);
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute("href", getLocalizedPath(locale, activePageSlug));
  }

  const hreflangPaths = {
    "zh-CN": getLocalizedPath("zh-CN", activePageSlug),
    "zh-Hant": getLocalizedPath("zh-TW", activePageSlug),
    en: getLocalizedPath("en", activePageSlug),
    ja: getLocalizedPath("ja", activePageSlug),
    ko: getLocalizedPath("ko", activePageSlug),
    "x-default": getLocalizedPath("zh-CN", activePageSlug)
  };

  Object.entries(hreflangPaths).forEach(([hreflang, href]) => {
    const link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (link) link.setAttribute("href", href);
  });
}

function updateLandingLinks(locale) {
  document.querySelectorAll("[data-route]").forEach((link) => {
    const route = link.dataset.route;
    link.setAttribute("href", getLocalizedPath(locale, route));
    link.toggleAttribute("aria-current", route === activePageSlug);
  });
}

function updateHomeLinks(locale) {
  const homePath = getLocalizedPath(locale);
  elements.homeBrand.setAttribute("href", homePath);
  elements.homeLink.setAttribute("href", homePath);
}

function getLocalizedPath(locale, pageSlug = "") {
  const base = localePaths[locale] || "/";
  if (!pageSlug) return base;
  return base === "/" ? `/${pageSlug}/` : `${base}${pageSlug}/`;
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

async function handleFiles(fileList) {
  const files = [...fileList];
  if (!files.length) return;

  setFileImportStatus(t("fileReading"));

  const imported = [];
  const errors = [];

  for (const file of files) {
    try {
      const text = await extractTextFromFile(file);
      if (text.trim()) {
        imported.push({ name: file.name, text: text.trim() });
      } else {
        errors.push(formatMessage("fileFailed", { name: file.name }));
      }
    } catch (error) {
      console.error(error);
      errors.push(error.message || formatMessage("fileFailed", { name: file.name }));
    }
  }

  if (imported.length) {
    elements.inputText.value = imported
      .map((item) => `===== ${item.name} =====\n${item.text}`)
      .join("\n\n");
    updateCounts();
    setFileImportStatus(
      [formatMessage("fileImported", { count: imported.length }), ...errors].filter(Boolean).join(" ")
    );
    scheduleConvert(0);
    elements.inputText.focus();
  } else {
    setFileImportStatus(errors.join(" "));
  }
}

async function extractTextFromFile(file) {
  const extension = getFileExtension(file.name);

  if (["txt", "md", "csv"].includes(extension)) {
    return file.text();
  }

  if (extension === "docx") {
    return extractDocxText(file);
  }

  if (["xlsx", "xls"].includes(extension)) {
    return extractSpreadsheetText(file);
  }

  if (extension === "pdf") {
    return extractPdfText(file);
  }

  throw new Error(formatMessage("fileUnsupported", { name: file.name }));
}

async function extractDocxText(file) {
  await loadScript("https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js", "mammoth");
  const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value || "";
}

async function extractSpreadsheetText(file) {
  await loadScript("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js", "XLSX");
  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array" });
  return workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = window.XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    return `--- ${sheetName} ---\n${csv}`;
  })
    .filter(Boolean)
    .join("\n\n");
}

async function extractPdfText(file) {
  const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/standard_fonts/"
  }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }

  return pages.join("\n\n");
}

function loadScript(src, globalName) {
  if (window[globalName]) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(src));
    document.head.append(script);
  });
}

function getFileExtension(fileName) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function setFileImportStatus(message) {
  elements.fileImportStatus.textContent = message;
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
