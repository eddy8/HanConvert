import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "word-to-txt";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "인터페이스 언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "Word转TXT - DOCX转TXT在线工具 | JianFan.app",
    description: "免费在线Word转TXT、DOCX转TXT工具。在浏览器本地提取Word文档纯文本，支持批量预览、编辑、复制和下载UTF-8 TXT文件。",
    eyebrow: "WORD 转纯文本 · 浏览器本地处理",
    heading: "Word 转 TXT 在线转换",
    lede: "上传 Word（DOCX）文档，去除字体、图片和版式，提取可编辑的纯文本并下载为 UTF-8 TXT。文件不会上传到服务器。",
    toolTitle: "选择 DOCX，立即提取纯文本",
    dropTitle: "拖放 Word 文档到这里",
    dropBody: "或点击选择一个或多个 .docx 文件",
    browse: "选择 DOCX 文件",
    limits: "一次最多 20 个文件，每个不超过 10 MB。暂不支持旧版 .doc。",
    filesTitle: "转换文件",
    downloadAll: "下载全部",
    clear: "清空",
    previewTitle: "TXT 预览",
    emptyTitle: "转换结果会显示在这里",
    emptyBody: "选择 DOCX 后，可逐个预览和编辑提取的文本。",
    copy: "复制文本",
    download: "下载 TXT",
    privacyNote: "DOCX 内容仅在当前浏览器中读取。页面会加载公开的文档解析组件，但不会把你的文件发送到远程服务器。",
    messages: {
      idle: "等待选择 DOCX 文件",
      reading: "正在读取 {count} 个文件",
      ready: "已完成 {ready} / {total} 个文件",
      characters: "个字符",
      unsupported: "仅支持 .docx 文件",
      tooLarge: "文件超过 {limit}",
      emptyFile: "没有提取到可用文本",
      failed: "无法读取这个 DOCX 文件",
      libraryError: "文档解析组件加载失败，请刷新页面",
      noneReady: "没有可下载的文件",
      downloaded: "已下载 {name}",
      packing: "正在打包 TXT 文件",
      allDownloaded: "已打包下载 {count} 个 TXT 文件",
      zipError: "无法打包文件，请分别下载",
      copied: "已复制文本"
    },
    seoKicker: "WORD 文档转纯文本",
    featureTitle: "DOCX 转 TXT，无需安装 Word",
    featureIntro: "这个页面针对 Word转TXT、Word文档转TXT、DOCX转TXT 和 Word转纯文本等任务设计。打开页面即可使用，不要求注册账号。",
    cards: [
      ["浏览器本地转换", "Word 文档直接在浏览器内解析，适合处理不希望上传到第三方服务器的文本内容。"],
      ["批量 DOCX 转 TXT", "一次选择多个 DOCX，分别预览、编辑和下载；多个结果也可以打包为 ZIP。"],
      ["纯文本输出", "TXT 使用 UTF-8 编码，保留文字与基本段落换行，不保留字体、颜色、图片和页面版式。"]
    ],
    howTitle: "Word 文档怎么转换成 TXT",
    steps: ["选择或拖入一个或多个 DOCX 文件。", "在右侧检查并按需编辑提取的纯文本。", "下载当前 TXT，或把全部结果打包下载。"],
    faqTitle: "Word 转 TXT 常见问题",
    faqs: [
      ["支持 .doc 文件吗？", "暂不支持旧版 Word .doc 二进制格式。请先在 Word、WPS 或 LibreOffice 中另存为 .docx，再进行转换。"],
      ["转换后会保留 Word 格式吗？", "不会。TXT 是纯文本格式，只保留文字和基本换行；字体、字号、颜色、图片与复杂版式都会被移除。"],
      ["Word 文件会上传吗？", "不会。文档内容在浏览器本地解析，不会发送到 JianFan.app 或第三方转换服务器。"],
      ["可以批量把 DOCX 转成 TXT 吗？", "可以。一次最多选择 20 个 DOCX 文件，可分别下载 TXT，也可将全部结果打包下载。"]
    ],
    related: "相关工具",
    relatedAria: "相关文件和文字工具",
    footerText: "JianFan.app 提供浏览器本地运行的文件文本与中文转换工具。"
  },
  "zh-TW": {
    title: "DOCX轉TXT - Word轉文字檔線上工具 | JianFan.app",
    description: "免費 DOCX轉TXT、Word轉文字檔線上工具。在瀏覽器本機提取 Word 純文字，支援批次預覽、編輯、複製與下載 UTF-8 TXT。",
    eyebrow: "WORD 轉純文字 · 瀏覽器本機處理",
    heading: "DOCX 轉 TXT、Word 轉文字檔",
    lede: "上傳 Word（DOCX）文件，移除字型、圖片與版面配置，提取可編輯的純文字並下載為 UTF-8 TXT。文件不會上傳到伺服器。",
    toolTitle: "選擇 DOCX，立即提取純文字",
    dropTitle: "將 Word 文件拖放到這裡",
    dropBody: "或點選一個或多個 .docx 文件",
    browse: "選擇 DOCX 文件",
    limits: "一次最多 20 個文件，每個不超過 10 MB。暫不支援舊版 .doc。",
    filesTitle: "轉換文件",
    downloadAll: "下載全部",
    clear: "清空",
    previewTitle: "TXT 預覽",
    emptyTitle: "轉換結果會顯示在這裡",
    emptyBody: "選擇 DOCX 後，可逐一預覽與編輯提取的文字。",
    copy: "複製文字",
    download: "下載 TXT",
    privacyNote: "DOCX 內容只在目前瀏覽器中讀取。頁面會載入公開的文件解析元件，但不會將你的文件傳送至遠端伺服器。",
    messages: {
      idle: "等待選擇 DOCX 文件",
      reading: "正在讀取 {count} 個文件",
      ready: "已完成 {ready} / {total} 個文件",
      characters: "個字元",
      unsupported: "僅支援 .docx 文件",
      tooLarge: "文件超過 {limit}",
      emptyFile: "沒有提取到可用文字",
      failed: "無法讀取這個 DOCX 文件",
      libraryError: "文件解析元件載入失敗，請重新整理頁面",
      noneReady: "沒有可下載的文件",
      downloaded: "已下載 {name}",
      packing: "正在打包 TXT 文件",
      allDownloaded: "已打包下載 {count} 個 TXT 文件",
      zipError: "無法打包文件，請分別下載",
      copied: "已複製文字"
    },
    seoKicker: "WORD 文件轉純文字",
    featureTitle: "DOCX 轉 TXT，不需安裝 Word",
    featureIntro: "適合 DOCX轉TXT、Word轉TXT、Word轉文字檔與 Word轉純文字等需求，開啟頁面即可使用，不需註冊。",
    cards: [
      ["瀏覽器本機轉換", "Word 文件直接在瀏覽器內解析，適合不希望上傳到第三方伺服器的文字內容。"],
      ["批次 DOCX 轉 TXT", "一次選擇多個 DOCX，分別預覽、編輯與下載，也可將多個結果打包為 ZIP。"],
      ["純文字輸出", "TXT 使用 UTF-8 編碼，保留文字與基本段落換行，不保留字型、顏色、圖片和頁面版面。"]
    ],
    howTitle: "如何將 Word 文件轉成 TXT",
    steps: ["選擇或拖入一個或多個 DOCX 文件。", "在右側檢查並視需要編輯提取的純文字。", "下載目前 TXT，或將全部結果打包下載。"],
    faqTitle: "DOCX 轉 TXT 常見問題",
    faqs: [
      ["支援 .doc 文件嗎？", "暫不支援舊版 Word .doc 二進位格式。請先在 Word、WPS 或 LibreOffice 另存為 .docx。"],
      ["轉換後會保留 Word 格式嗎？", "不會。TXT 只保留文字與基本換行，字型、顏色、圖片和複雜版面都會移除。"],
      ["Word 文件會上傳嗎？", "不會。文件內容在瀏覽器本機解析，不會傳送至 JianFan.app 或第三方轉檔伺服器。"],
      ["可以批次將 DOCX 轉 TXT 嗎？", "可以。一次最多選擇 20 個 DOCX，可分別下載 TXT，也可打包下載全部結果。"]
    ],
    related: "相關工具",
    relatedAria: "相關文件與文字工具",
    footerText: "JianFan.app 提供在瀏覽器本機執行的文件文字與中文轉換工具。"
  },
  en: {
    title: "Word to Text Converter - DOCX to TXT Online | JianFan.app",
    description: "Convert Word to text online. Extract plain text from DOCX files locally in your browser, then preview, edit, copy, or batch-download UTF-8 TXT files.",
    eyebrow: "WORD TO PLAIN TEXT · LOCAL PROCESSING",
    heading: "Word to Text Converter",
    lede: "Turn Word DOCX documents into editable plain text and download UTF-8 TXT files. Formatting and images are removed, and your documents stay in your browser.",
    toolTitle: "Choose DOCX files and extract text",
    dropTitle: "Drop Word documents here",
    dropBody: "or choose one or more .docx files",
    browse: "Choose DOCX files",
    limits: "Up to 20 files at once, 10 MB each. Legacy .doc files are not supported.",
    filesTitle: "Converted files",
    downloadAll: "Download all",
    clear: "Clear",
    previewTitle: "TXT preview",
    emptyTitle: "Your extracted text will appear here",
    emptyBody: "Choose a DOCX file to preview and edit its plain-text content.",
    copy: "Copy text",
    download: "Download TXT",
    privacyNote: "DOCX content is read only in this browser. The page loads public document-parsing code, but your files are not sent to a remote server.",
    messages: {
      idle: "Waiting for DOCX files",
      reading: "Reading {count} files",
      ready: "Finished {ready} of {total} files",
      characters: "characters",
      unsupported: "Only .docx files are supported",
      tooLarge: "File exceeds {limit}",
      emptyFile: "No usable text was found",
      failed: "This DOCX file could not be read",
      libraryError: "The document parser failed to load. Refresh the page.",
      noneReady: "No files are ready to download",
      downloaded: "Downloaded {name}",
      packing: "Packaging TXT files",
      allDownloaded: "Downloaded {count} TXT files in a ZIP",
      zipError: "Could not create the ZIP. Download files separately.",
      copied: "Text copied"
    },
    seoKicker: "WORD DOCUMENT TO PLAIN TEXT",
    featureTitle: "Convert DOCX to TXT without installing Word",
    featureIntro: "A focused Word to text and DOCX to TXT converter for extracting clean, editable content without an account or software installation.",
    cards: [
      ["Local browser conversion", "Word documents are parsed in your browser, so private text does not need to be uploaded to a third-party conversion server."],
      ["Batch DOCX to TXT", "Choose several DOCX files, preview and edit each result, then download individual TXT files or one ZIP."],
      ["Clean plain-text output", "UTF-8 TXT keeps text and basic paragraph breaks while removing fonts, colors, images, and page layout."]
    ],
    howTitle: "How to convert Word to TXT",
    steps: ["Choose or drop one or more DOCX files.", "Review and edit the extracted plain text in the preview.", "Download the current TXT file or package all results in a ZIP."],
    faqTitle: "Word to text questions",
    faqs: [
      ["Does this converter support .doc files?", "No. Legacy binary .doc files are not supported. Save the file as .docx in Word, WPS, or LibreOffice first."],
      ["Will Word formatting be preserved?", "No. TXT contains plain text and basic line breaks only. Fonts, colors, images, and complex layouts are removed."],
      ["Are Word files uploaded?", "No. Document content is parsed locally in your browser and is not sent to JianFan.app or a third-party conversion server."],
      ["Can I batch-convert DOCX to TXT?", "Yes. Select up to 20 DOCX files and download each TXT separately or package all successful results in a ZIP."]
    ],
    related: "Related tools",
    relatedAria: "Related document and text tools",
    footerText: "JianFan.app provides browser-local document text and Chinese conversion tools."
  },
  ja: {
    title: "Word TXT 変換 - DOCXをテキストに変換 | JianFan.app",
    description: "Word TXT 変換をブラウザー内で無料実行。DOCXからプレーンテキストを抽出し、編集・コピー・UTF-8 TXT保存と複数ファイルの一括変換に対応。",
    eyebrow: "WORD をプレーンテキストへ · ブラウザー内処理",
    heading: "WordをTXTに変換",
    lede: "Word（DOCX）から書式や画像を除いたテキストを抽出し、編集して UTF-8 の TXT ファイルとして保存できます。文書はサーバーへ送信されません。",
    toolTitle: "DOCXを選択してテキストを抽出",
    dropTitle: "Word文書をここにドロップ",
    dropBody: "または1つ以上の .docx ファイルを選択",
    browse: "DOCXを選択",
    limits: "一度に20ファイル、各10 MBまで。旧形式の .doc には対応していません。",
    filesTitle: "変換ファイル",
    downloadAll: "すべて保存",
    clear: "クリア",
    previewTitle: "TXTプレビュー",
    emptyTitle: "抽出したテキストがここに表示されます",
    emptyBody: "DOCXを選択すると、ファイルごとにテキストを確認・編集できます。",
    copy: "テキストをコピー",
    download: "TXTを保存",
    privacyNote: "DOCXの内容は現在のブラウザー内だけで読み取ります。公開の文書解析コードを読み込みますが、ファイルを外部サーバーへ送信しません。",
    messages: {
      idle: "DOCXファイルを選択してください",
      reading: "{count}ファイルを読み込み中",
      ready: "{total}件中{ready}件を変換しました",
      characters: "文字",
      unsupported: ".docxファイルのみ対応しています",
      tooLarge: "ファイルが{limit}を超えています",
      emptyFile: "テキストを抽出できませんでした",
      failed: "このDOCXを読み込めませんでした",
      libraryError: "文書解析機能を読み込めません。ページを再読み込みしてください。",
      noneReady: "保存できるファイルがありません",
      downloaded: "{name}を保存しました",
      packing: "TXTファイルをまとめています",
      allDownloaded: "{count}件のTXTをZIPで保存しました",
      zipError: "ZIPを作成できません。個別に保存してください。",
      copied: "テキストをコピーしました"
    },
    seoKicker: "WORD・DOCX テキスト変換",
    featureTitle: "Word・DOCXをTXTへオンライン変換",
    featureIntro: "Word TXT 変換、Word テキスト変換、DOCX TXT 変換を探しているときに、ソフトのインストールや会員登録なしで使えるツールです。",
    cards: [
      ["ブラウザー内で変換", "Word文書をブラウザー内で直接解析するため、文書の内容を外部の変換サーバーへアップロードする必要がありません。"],
      ["複数DOCXを一括変換", "複数のDOCXを選択し、結果を個別に確認・編集して、TXT単体またはZIPでまとめて保存できます。"],
      ["プレーンテキスト出力", "UTF-8のTXTに文字と基本的な改行を残し、フォント、色、画像、ページレイアウトは削除します。"]
    ],
    howTitle: "Wordをテキストファイルに変換する方法",
    steps: ["1つ以上のDOCXを選択するか、ドロップします。", "抽出されたテキストをプレビューで確認・編集します。", "現在のTXTを保存するか、すべての結果をZIPで保存します。"],
    faqTitle: "Word TXT 変換のよくある質問",
    faqs: [
      [".docファイルにも対応していますか？", "旧形式の .doc には対応していません。Word、WPS、LibreOfficeなどで .docx として保存してから変換してください。"],
      ["Wordの書式は残りますか？", "残りません。TXTには文字と基本的な改行だけが残り、フォント、色、画像、複雑なレイアウトは削除されます。"],
      ["Wordファイルはアップロードされますか？", "アップロードされません。文書内容はブラウザー内で解析され、JianFan.appや第三者の変換サーバーへ送信されません。"],
      ["複数のDOCXをTXTに一括変換できますか？", "はい。一度に最大20ファイルを選択し、個別のTXTまたは全結果をまとめたZIPを保存できます。"]
    ],
    related: "関連ツール",
    relatedAria: "関連する文書・文字ツール",
    footerText: "JianFan.app はブラウザー内で使える文書テキスト・中国語変換ツールを提供します。"
  },
  ko: {
    title: "DOCX TXT 변환 - Word 문서 텍스트 변환 | JianFan.app",
    description: "DOCX TXT 변환과 워드 텍스트 변환을 브라우저에서 무료로 처리하세요. Word 문서의 일반 텍스트를 추출해 편집, 복사, UTF-8 TXT 일괄 다운로드할 수 있습니다.",
    eyebrow: "WORD를 일반 텍스트로 · 브라우저 로컬 처리",
    heading: "DOCX를 TXT로 변환",
    lede: "Word DOCX 문서에서 서식과 이미지를 제거한 텍스트를 추출하고 편집한 뒤 UTF-8 TXT로 저장합니다. 문서는 서버로 전송되지 않습니다.",
    toolTitle: "DOCX를 선택해 일반 텍스트 추출",
    dropTitle: "Word 문서를 여기에 놓으세요",
    dropBody: "또는 하나 이상의 .docx 파일 선택",
    browse: "DOCX 파일 선택",
    limits: "한 번에 최대 20개, 파일당 10 MB입니다. 이전 .doc 형식은 지원하지 않습니다.",
    filesTitle: "변환 파일",
    downloadAll: "모두 다운로드",
    clear: "비우기",
    previewTitle: "TXT 미리보기",
    emptyTitle: "추출한 텍스트가 여기에 표시됩니다",
    emptyBody: "DOCX를 선택하면 파일별 일반 텍스트를 확인하고 편집할 수 있습니다.",
    copy: "텍스트 복사",
    download: "TXT 다운로드",
    privacyNote: "DOCX 내용은 현재 브라우저에서만 읽습니다. 공개 문서 분석 코드를 불러오지만 파일을 원격 서버로 전송하지 않습니다.",
    messages: {
      idle: "DOCX 파일을 선택하세요",
      reading: "{count}개 파일 읽는 중",
      ready: "{total}개 중 {ready}개 완료",
      characters: "자",
      unsupported: ".docx 파일만 지원합니다",
      tooLarge: "파일이 {limit}를 초과합니다",
      emptyFile: "사용할 텍스트를 찾지 못했습니다",
      failed: "이 DOCX 파일을 읽을 수 없습니다",
      libraryError: "문서 분석 기능을 불러오지 못했습니다. 새로 고쳐 주세요.",
      noneReady: "다운로드할 파일이 없습니다",
      downloaded: "{name} 다운로드 완료",
      packing: "TXT 파일 압축 중",
      allDownloaded: "TXT {count}개를 ZIP으로 다운로드했습니다",
      zipError: "ZIP을 만들 수 없습니다. 개별 다운로드해 주세요.",
      copied: "텍스트를 복사했습니다"
    },
    seoKicker: "WORD 문서 일반 텍스트 변환",
    featureTitle: "Word 설치 없이 DOCX를 TXT로 변환",
    featureIntro: "DOCX TXT 변환, 워드 TXT 변환, Word 문서 텍스트 변환이 필요할 때 설치나 회원 가입 없이 사용할 수 있습니다.",
    cards: [
      ["브라우저 로컬 변환", "Word 문서를 브라우저에서 직접 분석하므로 민감한 텍스트를 외부 변환 서버에 업로드할 필요가 없습니다."],
      ["여러 DOCX 일괄 변환", "여러 DOCX를 선택해 각 결과를 확인하고 편집한 뒤 개별 TXT 또는 하나의 ZIP으로 다운로드합니다."],
      ["깔끔한 일반 텍스트", "UTF-8 TXT에 텍스트와 기본 문단 줄바꿈을 남기고 글꼴, 색상, 이미지와 페이지 레이아웃을 제거합니다."]
    ],
    howTitle: "Word 문서를 TXT로 변환하는 방법",
    steps: ["하나 이상의 DOCX 파일을 선택하거나 끌어다 놓습니다.", "미리보기에서 추출된 일반 텍스트를 확인하고 편집합니다.", "현재 TXT를 다운로드하거나 모든 결과를 ZIP으로 저장합니다."],
    faqTitle: "DOCX TXT 변환 자주 묻는 질문",
    faqs: [
      [".doc 파일도 지원하나요?", "이전 바이너리 .doc 형식은 지원하지 않습니다. Word, WPS 또는 LibreOffice에서 .docx로 저장한 뒤 변환하세요."],
      ["Word 서식이 유지되나요?", "아니요. TXT에는 텍스트와 기본 줄바꿈만 남고 글꼴, 색상, 이미지와 복잡한 레이아웃은 제거됩니다."],
      ["Word 파일이 업로드되나요?", "아니요. 문서 내용은 브라우저에서만 분석되며 JianFan.app이나 외부 변환 서버로 전송되지 않습니다."],
      ["여러 DOCX를 TXT로 일괄 변환할 수 있나요?", "네. 한 번에 최대 20개를 선택해 개별 TXT로 받거나 모든 결과를 ZIP으로 다운로드할 수 있습니다."]
    ],
    related: "관련 도구",
    relatedAria: "관련 문서 및 텍스트 도구",
    footerText: "JianFan.app는 브라우저에서 실행되는 문서 텍스트 및 중국어 변환 도구를 제공합니다."
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "Word 转 TXT"], ["file-text-converter", "文件文本简繁转换"], ["simplified-to-traditional", "简体转繁体"], ["traditional-to-simplified", "繁体转简体"], ["chinese-to-pinyin", "汉字转拼音"], ["chinese-stroke-order", "汉字笔顺查询"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["japanese-characters", "日文字符复制"]],
  "zh-TW": [[slug, "DOCX 轉 TXT"], ["file-text-converter", "文件文字簡繁轉換"], ["simplified-to-traditional", "簡體轉繁體"], ["traditional-to-simplified", "繁體轉簡體"], ["chinese-to-pinyin", "漢字轉拼音"], ["chinese-stroke-order", "漢字筆順查詢"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["japanese-characters", "日文字元複製"]],
  en: [[slug, "Word to text"], ["file-text-converter", "Document Chinese converter"], ["simplified-to-traditional", "Simplified to Traditional"], ["traditional-to-simplified", "Traditional to Simplified"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["chinese-stroke-order", "Chinese stroke order"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["japanese-characters", "Japanese character copy"]],
  ja: [[slug, "Word TXT 変換"], ["file-text-converter", "文書の中国語簡繁変換"], ["simplified-to-traditional", "簡体字から繁体字"], ["traditional-to-simplified", "繁体字から簡体字"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["chinese-stroke-order", "中国語漢字の筆順"], ["japanese-chinese-kanji-converter", "日中漢字3種類変換"], ["japanese-characters", "日本語文字コピー"]],
  ko: [[slug, "DOCX TXT 변환"], ["file-text-converter", "문서 중국어 변환"], ["simplified-to-traditional", "간체를 번체로"], ["traditional-to-simplified", "번체를 간체로"], ["chinese-to-pinyin", "중국어 병음 변환"], ["chinese-stroke-order", "중국어 한자 필순"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["japanese-characters", "일본어 문자 복사"]]
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localizedPath(locale, targetSlug = "") {
  return `/${locales[locale].prefix}${targetSlug ? `${targetSlug}/` : ""}`;
}

function buildSchema(locale, page) {
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${canonical}#webapp`,
        name: page.heading,
        url: canonical,
        description: page.description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: locales[locale].lang,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localizedPath(locale)}` },
          { "@type": "ListItem", position: 2, name: page.heading, item: canonical }
        ]
      },
      {
        "@type": "HowTo",
        "@id": `${canonical}#howto`,
        name: page.howTitle,
        step: page.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text }))
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: page.faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer }
        }))
      }
    ]
  };
}

function buildHead(locale, page) {
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const alternates = Object.entries(locales)
    .map(([targetLocale, meta]) => `    <link rel="alternate" hreflang="${meta.hreflang}" href="${origin}${localizedPath(targetLocale, slug)}" />`)
    .join("\n");
  return `    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(page.description)}" />
    <title>${escapeHtml(page.title)}</title>
    <link rel="canonical" href="${canonical}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${origin}${localizedPath("zh-CN", slug)}" />
    <link rel="preconnect" href="https://cdn.jsdmirror.cn" crossorigin />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <script defer src="https://cdn.jsdmirror.cn/npm/mammoth/mammoth.browser.min.js"></script>
    <script defer src="https://cdn.jsdmirror.cn/npm/jszip/dist/jszip.min.js"></script>
    <script defer src="/word-to-txt-tool.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n")}
    </script>
    <!-- seo-schema:end -->`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const localeOptions = Object.entries(locales)
    .map(([value, option]) => `              <option value="${value}"${value === locale ? " selected" : ""}>${option.label}</option>`)
    .join("\n");
  const messages = Object.entries(page.messages)
    .map(([key, value]) => ` data-message-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`)
    .join("");
  const related = relatedLabels[locale]
    .map(([targetSlug, label]) => `          <a href="${localizedPath(locale, targetSlug)}"${targetSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("\n");

  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, page)}
  </head>
  <body data-tool-page="word-to-txt" data-page-slug="${slug}" data-locale="${locale}"${messages}>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">文</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${localeOptions}
          </select></label></nav></header>
    <main id="main">
      <section class="tool-hero word-txt-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="word-format-flow" aria-hidden="true"><span>DOCX</span><b>→</b><span>TXT</span></div></section>
      <section class="standalone-tool word-to-txt-tool" aria-labelledby="wordToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">DOCX / TXT</p><h2 id="wordToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="wordToolStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.idle}</span></div></div>
        <div class="word-txt-workspace">
          <section class="word-import-pane" aria-labelledby="wordImportTitle">
            <label class="word-file-drop" id="wordFileDrop" for="wordFileInput"><span class="word-drop-mark" aria-hidden="true">DOCX</span><strong id="wordImportTitle">${page.dropTitle}</strong><span>${page.dropBody}</span><span class="primary-action word-browse-action">${page.browse}</span><input id="wordFileInput" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple /></label>
            <p class="word-limit-note">${page.limits}</p>
            <div class="word-queue-head"><h3>${page.filesTitle}</h3><div><button class="text-button" id="wordDownloadAllButton" type="button" disabled>${page.downloadAll}</button><button class="text-button" id="wordClearButton" type="button" disabled>${page.clear}</button></div></div>
            <ol class="word-file-list" id="wordFileList"></ol>
          </section>
          <section class="word-preview-pane" aria-labelledby="wordPreviewTitle">
            <div class="panel-topline"><div><p class="section-kicker">PLAIN TEXT</p><h3 id="wordPreviewTitle">${page.previewTitle}</h3></div><span id="wordCharacterCount">0 ${page.messages.characters}</span></div>
            <div class="word-preview-empty" id="wordPreviewEmpty"><strong>${page.emptyTitle}</strong><p>${page.emptyBody}</p></div>
            <div class="word-editor-pane" id="wordEditorPane" hidden><div class="word-selected-file"><strong id="wordSelectedName"></strong><span id="wordSelectedMeta"></span></div><textarea id="wordTextEditor" spellcheck="false"></textarea><div class="panel-actions"><button class="text-button" id="wordCopyButton" type="button">${page.copy}</button><button class="primary-action" id="wordDownloadButton" type="button">${page.download}</button></div></div>
          </section>
        </div>
        <p class="word-privacy-note">${page.privacyNote}</p>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="wordFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.seoKicker}</p><h2 id="wordFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">
${page.cards.map(([title, text]) => `          <article><h3>${title}</h3><p>${text}</p></article>`).join("\n")}
        </div><section class="word-howto" aria-labelledby="wordHowTitle"><h2 id="wordHowTitle">${page.howTitle}</h2><ol>
${page.steps.map((step) => `          <li>${step}</li>`).join("\n")}
        </ol></section><section class="pinyin-faq" aria-labelledby="wordFaqTitle"><h2 id="wordFaqTitle">${page.faqTitle}</h2>
${page.faqs.map(([question, answer]) => `          <details><summary>${question}</summary><p>${answer}</p></details>`).join("\n")}
        </section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">
${related}
        </nav></section>
    </main>
    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localizedPath(locale, "about")}">${meta.about}</a><a href="${localizedPath(locale, "contact")}">${meta.contact}</a><a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>`;
}

for (const locale of Object.keys(locales)) {
  const directory = path.join(projectRoot, locales[locale].prefix, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), `${buildPage(locale)}\n`);
}

console.log("Generated 5 multilingual Word-to-TXT pages.");
