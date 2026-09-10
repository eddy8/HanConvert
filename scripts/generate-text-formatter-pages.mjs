import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "text-formatter";
const checkOnly = process.argv.includes("--check");
const sampleText = "PDF 复制的文 本 可能带有多余换行。\nThis sen-\ntence includes a hidden marker\u200B and https://example.com/a%20b.\n\nAI 文本也可能包含特殊空格\u00A0或不可见字符。";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "文本格式化工具 - 在线清理空格换行与AI文本水印 | JianFan.app",
    description: "免费在线文本格式化工具，整理从 PDF、PPT、CAJ 复制的多余空格、断行与标点，并检测去除零宽字符、特殊空格等可见的 AI 文本水印，全部在浏览器本地处理。",
    eyebrow: "文本整理 · 隐藏字符检测 · 浏览器本地处理",
    heading: "在线文本格式化工具",
    lede: "整理从 PDF、PPT、CAJ 或网页复制的文本，清理多余空格与断行，并检测可见编码层面的 AI 文本水印。原文不会上传。",
    toolTitle: "粘贴文本，选择规则后格式化",
    inputTitle: "原始文本", outputTitle: "格式化结果", placeholder: "在这里粘贴需要整理的文本...",
    run: "开始格式化", sample: "加载示例", clear: "清空", importFile: "导入文本", copy: "复制结果", reuse: "继续编辑", download: "下载 TXT",
    lineModeLabel: "换行处理", lineModes: { keep: "保留原换行", join: "合并段内断行", remove: "移除全部换行", sentence: "每句单独一行" },
    basicTitle: "常规格式化", watermarkTitle: "AI 水印与 Unicode 清理",
    options: {
      trimLines: "清理每行首尾空格", collapseSpaces: "合并连续空格与制表符", reduceBlankLines: "最多保留一个空行", repairHyphenation: "修复英文断词连字符",
      removeHanSpaces: "删除汉字之间的空格", addHanLatinSpaces: "中英文与数字之间加空格", fixEnglishQuotes: "修复英文弯引号", useCjkPunctuation: "中文语境使用全角标点", decodeUrls: "安全解码 URL",
      removeBasicInvisible: "去除零宽空格等高置信隐藏字符", normalizeSpecialSpaces: "将特殊空格转换为普通空格",
      removeJoiners: "删除零宽连接符与非连接符", removeVariationSelectors: "删除变体选择符", removeBidiControls: "删除双向文字控制符", removeTags: "删除 Unicode 标签字符", normalizeConfusables: "修正全角及混合字母同形字符"
    },
    advancedTitle: "高风险 Unicode 清理选项",
    advancedWarning: "这些字符可能参与 emoji、阿拉伯文、印度文字或字形变体的正常显示。只有确认它们是异常标记时才开启。",
    localNote: "格式化与检测均在当前浏览器完成。工具只清理可检测的 Unicode 编码标记，不能判断作者身份，也不能识别或消除统计型 AI 水印。",
    status: { idle: "等待输入文本", pending: "文本已修改，等待格式化", ready: "格式化完成", unchanged: "未发现需要修改的内容", copied: "结果已复制", copyFailed: "复制失败，请手动选择结果", tooLong: "文本超过 {limit} 个字符，请分批处理", fileTooLarge: "文件超过 10 MB，请选择更小的文本文件", fileError: "无法读取这个文本文件" },
    metrics: ["输入字符", "输出字符", "处理前可疑字符", "处理后可疑字符"],
    reportTitle: "Unicode 检测明细", reportEmpty: "尚未检测到零宽字符、特殊空格、变体选择符或同形字符。",
    categories: { basicInvisible: "高置信隐藏字符", specialSpaces: "特殊空格", joiners: "零宽连接符", variationSelectors: "变体选择符", bidiControls: "双向控制符", tags: "Unicode 标签", confusables: "同形与全角字符" },
    seoKicker: "PDF 复制文本整理与隐藏字符清理",
    featureTitle: "适合文档复制、排版与 AI 文本检查的格式化工具",
    featureIntro: "在线文本格式化不只是删除空格和换行。工具会保护 URL、小数与常见英文内容，同时把不可见 Unicode 字符按风险分组，便于先检测再决定是否清理。",
    cards: [
      ["修复 PDF 与 CAJ 复制断行", "合并段内硬换行时会区分中英文边界，并可单独修复英文单词跨行产生的连字符。"],
      ["避免破坏 URL 和小数", "标点转换与空格处理会避开网址、邮箱、行内代码和小数，不会把正常内容一并改坏。"],
      ["分级去除 AI 文本水印", "默认去除零宽空格等高置信标记；连接符、变体选择符和同形字符需要手动开启。"]
    ],
    howTitle: "如何在线格式化文本", steps: ["粘贴文本或导入 TXT、MD、CSV、JSON 文件。", "选择换行、空格、标点和 Unicode 清理规则。", "点击开始格式化，查看处理前后的字符统计和检测明细。", "确认结果后复制、下载，或送回输入框继续调整。"],
    faqTitle: "文本格式化与 AI 水印常见问题",
    faqs: [
      ["什么是 AI 文本水印？", "本页所说的 AI 文本水印是可检测的 Unicode 编码痕迹，例如零宽字符、特殊空格、变体选择符和混合字母同形字符。它们与基于词语分布的统计型水印不是一回事。"],
      ["为什么不默认删除 U+200C、U+200D 和变体选择符？", "零宽连接符、零宽非连接符与变体选择符可能影响 emoji、阿拉伯文、印度文字或字形显示。默认删除会损坏正常文本，因此放在高风险选项中。"],
      ["可以整理从 PDF 复制的多余换行吗？", "可以。选择“合并段内断行”会保留空行分隔的段落，并按中英文边界连接行；需要时可开启英文断词连字符修复。"],
      ["文本会上传到服务器吗？", "不会。文本格式化、不可见字符检测与 AI 文本水印清理全部使用浏览器内的 JavaScript 完成。"]
    ],
    related: "相关文字工具", relatedAria: "相关文字与文件工具",
    footerText: "JianFan.app 提供浏览器本地运行的中文转换、文本整理、字符统计与文档处理工具。"
  },
  "zh-TW": {
    title: "文字格式化工具 - 線上清理空格換行與AI文字浮水印 | JianFan.app",
    description: "免費線上文字格式化工具，整理從 PDF、PPT、CAJ 複製的多餘空格、斷行與標點，並偵測移除零寬字元、特殊空格等可辨識的 AI 文字浮水印，全程在瀏覽器本機處理。",
    eyebrow: "文字整理 · 隱藏字元偵測 · 瀏覽器本機處理",
    heading: "線上文字格式化工具",
    lede: "整理從 PDF、PPT、CAJ 或網頁複製的文字，清除多餘空格與斷行，並偵測編碼層級可辨識的 AI 文字浮水印。原文不會上傳。",
    toolTitle: "貼上文字，選擇規則後格式化",
    inputTitle: "原始文字", outputTitle: "格式化結果", placeholder: "在這裡貼上需要整理的文字...",
    run: "開始格式化", sample: "載入範例", clear: "清除", importFile: "匯入文字", copy: "複製結果", reuse: "繼續編輯", download: "下載 TXT",
    lineModeLabel: "換行處理", lineModes: { keep: "保留原換行", join: "合併段內斷行", remove: "移除全部換行", sentence: "每句獨立一行" },
    basicTitle: "一般格式化", watermarkTitle: "AI 浮水印與 Unicode 清理",
    options: {
      trimLines: "清理每行前後空白", collapseSpaces: "合併連續空格與定位字元", reduceBlankLines: "最多保留一個空白行", repairHyphenation: "修復英文斷字連字號",
      removeHanSpaces: "移除漢字之間的空格", addHanLatinSpaces: "中英文與數字之間加空格", fixEnglishQuotes: "修復英文彎引號", useCjkPunctuation: "中文語境使用全形標點", decodeUrls: "安全解碼 URL",
      removeBasicInvisible: "移除零寬空格等高可信隱藏字元", normalizeSpecialSpaces: "將特殊空格轉成一般空格",
      removeJoiners: "刪除零寬連接符與非連接符", removeVariationSelectors: "刪除異體字選擇器", removeBidiControls: "刪除雙向文字控制符", removeTags: "刪除 Unicode 標籤字元", normalizeConfusables: "修正全形及混合字母同形字元"
    },
    advancedTitle: "高風險 Unicode 清理選項",
    advancedWarning: "這些字元可能參與 emoji、阿拉伯文、印度文字或字形變體的正常顯示。只有確認是異常標記時才開啟。",
    localNote: "格式化與偵測都在目前的瀏覽器完成。工具只清理可偵測的 Unicode 編碼標記，無法判斷作者身分，也不能辨識或消除統計型 AI 浮水印。",
    status: { idle: "等待輸入文字", pending: "文字已修改，等待格式化", ready: "格式化完成", unchanged: "沒有需要修改的內容", copied: "結果已複製", copyFailed: "複製失敗，請手動選取結果", tooLong: "文字超過 {limit} 個字元，請分段處理", fileTooLarge: "檔案超過 10 MB，請選擇較小的文字檔", fileError: "無法讀取這個文字檔" },
    metrics: ["輸入字元", "輸出字元", "處理前可疑字元", "處理後可疑字元"],
    reportTitle: "Unicode 偵測明細", reportEmpty: "尚未偵測到零寬字元、特殊空格、異體字選擇器或同形字元。",
    categories: { basicInvisible: "高可信隱藏字元", specialSpaces: "特殊空格", joiners: "零寬連接符", variationSelectors: "異體字選擇器", bidiControls: "雙向控制符", tags: "Unicode 標籤", confusables: "同形與全形字元" },
    seoKicker: "PDF 複製文字整理與隱藏字元清理",
    featureTitle: "適合文件複製、排版與 AI 文字檢查的格式化工具",
    featureIntro: "線上文字格式化不只是移除空格和換行。工具會保護 URL、小數與常見英文內容，同時依風險整理不可見 Unicode 字元，方便先偵測再決定是否清除。",
    cards: [
      ["修復 PDF 與 CAJ 複製斷行", "合併段內硬換行時會分辨中英文邊界，也能選擇是否修復英文單字跨行產生的連字號。"],
      ["避免破壞 URL 和小數", "標點轉換與空格處理會略過網址、電子郵件、行內程式碼和小數，保留正常內容。"],
      ["分級移除 AI 文字浮水印", "預設移除零寬空格等高可信標記；連接符、異體字選擇器與同形字元需手動開啟。"]
    ],
    howTitle: "如何在線上格式化文字", steps: ["貼上文字或匯入 TXT、MD、CSV、JSON 檔案。", "選擇換行、空格、標點與 Unicode 清理規則。", "按下開始格式化，查看處理前後的字元統計及偵測明細。", "確認結果後複製、下載，或送回輸入欄繼續調整。"],
    faqTitle: "文字格式化與 AI 浮水印常見問題",
    faqs: [
      ["什麼是 AI 文字浮水印？", "本頁指的是可偵測的 Unicode 編碼痕跡，例如零寬字元、特殊空格、異體字選擇器和混合字母同形字元，不等同於基於詞語分布的統計型浮水印。"],
      ["為什麼不預設刪除 U+200C、U+200D 和異體字選擇器？", "這些字元可能影響 emoji、阿拉伯文、印度文字或字形顯示。預設刪除可能損壞正常文字，因此列在高風險選項。"],
      ["可以整理從 PDF 複製的多餘換行嗎？", "可以。選擇「合併段內斷行」會保留空白行分隔的段落，並依中英文邊界連接各行。"],
      ["文字會上傳到伺服器嗎？", "不會。文字格式化、不可見字元偵測與 AI 文字浮水印清理都使用瀏覽器內的 JavaScript 完成。"]
    ],
    related: "相關文字工具", relatedAria: "相關文字與文件工具",
    footerText: "JianFan.app 提供在瀏覽器本機執行的中文轉換、文字整理、字數統計與文件處理工具。"
  },
  en: {
    title: "Online Text Formatter - Clean PDF Text and AI Watermarks | JianFan.app",
    description: "Free text formatter to clean copied PDF text, spaces, line breaks and punctuation. Detect zero-width characters, Unicode marks and AI text watermarks locally.",
    eyebrow: "TEXT CLEANUP · HIDDEN CHARACTER SCAN · LOCAL PROCESSING",
    heading: "Online Text Formatter",
    lede: "Clean text copied from PDF, PowerPoint, CAJ files or web pages. Fix unwanted spaces and line breaks, then detect removable Unicode-based AI text watermarks without uploading your text.",
    toolTitle: "Paste text, choose rules, and format",
    inputTitle: "Original text", outputTitle: "Formatted result", placeholder: "Paste the text you want to clean...",
    run: "Format text", sample: "Load sample", clear: "Clear", importFile: "Import text", copy: "Copy result", reuse: "Edit result", download: "Download TXT",
    lineModeLabel: "Line break handling", lineModes: { keep: "Keep line breaks", join: "Join wrapped lines", remove: "Remove all line breaks", sentence: "One sentence per line" },
    basicTitle: "Text formatting", watermarkTitle: "AI watermark and Unicode cleanup",
    options: {
      trimLines: "Trim each line", collapseSpaces: "Collapse repeated spaces and tabs", reduceBlankLines: "Keep at most one blank line", repairHyphenation: "Repair hyphenated line breaks",
      removeHanSpaces: "Remove spaces between Han characters", addHanLatinSpaces: "Space Han and Latin text", fixEnglishQuotes: "Repair English curly quotes", useCjkPunctuation: "Use CJK punctuation in Han text", decodeUrls: "Safely decode URLs",
      removeBasicInvisible: "Remove high-confidence hidden characters", normalizeSpecialSpaces: "Convert special spaces to regular spaces",
      removeJoiners: "Remove zero-width joiners and non-joiners", removeVariationSelectors: "Remove variation selectors", removeBidiControls: "Remove bidirectional controls", removeTags: "Remove Unicode tag characters", normalizeConfusables: "Fix fullwidth and mixed-script lookalikes"
    },
    advancedTitle: "High-risk Unicode cleanup",
    advancedWarning: "These characters can be required for emoji, Arabic, Indic scripts, bidirectional text or glyph variants. Enable them only when you know they are unwanted markers.",
    localNote: "Formatting and detection run in this browser. The tool removes detectable Unicode artifacts; it cannot identify an author or detect and erase statistical AI watermarks.",
    status: { idle: "Waiting for text", pending: "Text changed; ready to format", ready: "Formatting complete", unchanged: "No matching changes found", copied: "Result copied", copyFailed: "Copy failed; select the result manually", tooLong: "Text exceeds {limit} characters. Split it into sections.", fileTooLarge: "File exceeds 10 MB. Choose a smaller text file.", fileError: "This text file could not be read" },
    metrics: ["Input characters", "Output characters", "Suspicious before", "Suspicious after"],
    reportTitle: "Unicode scan details", reportEmpty: "No zero-width characters, special spaces, variation selectors or lookalike characters detected yet.",
    categories: { basicInvisible: "High-confidence hidden", specialSpaces: "Special spaces", joiners: "Zero-width joiners", variationSelectors: "Variation selectors", bidiControls: "Bidirectional controls", tags: "Unicode tags", confusables: "Lookalike and fullwidth" },
    seoKicker: "CLEAN COPIED PDF TEXT AND HIDDEN UNICODE",
    featureTitle: "A text cleaner for documents, layout fixes and AI watermark checks",
    featureIntro: "This online text formatter does more than remove spaces and line breaks. It protects URLs, decimals and common English text while grouping invisible Unicode characters by risk before you clean them.",
    cards: [
      ["Repair copied PDF line breaks", "Join hard-wrapped lines inside each paragraph with language-aware spacing, and optionally repair English words split by a line-ending hyphen."],
      ["Protect URLs and decimals", "Punctuation and spacing rules skip web addresses, email addresses, inline code and decimal numbers instead of corrupting them."],
      ["Remove AI text watermarks by risk", "High-confidence zero-width markers are removed by default. Joiners, variation selectors and mixed-script lookalikes remain opt-in."]
    ],
    howTitle: "How to format and clean text online", steps: ["Paste text or import a TXT, MD, CSV or JSON file.", "Choose line break, spacing, punctuation and Unicode cleanup rules.", "Select Format text and review the before-and-after Unicode scan.", "Copy or download the result, or return it to the input for another pass."],
    faqTitle: "Text formatting and AI watermark questions",
    faqs: [
      ["What is an AI text watermark?", "On this page, it means detectable Unicode artifacts such as zero-width characters, special spaces, variation selectors and mixed-script lookalikes. Statistical token-choice watermarks are different."],
      ["Why are U+200C, U+200D and variation selectors not removed by default?", "They can be required for emoji, Arabic, Indic scripts and glyph variants. Removing them automatically can damage legitimate text, so they are high-risk options."],
      ["Can it clean line breaks from copied PDF text?", "Yes. Join wrapped lines preserves paragraphs separated by blank lines and reconnects CJK or Latin line endings with suitable spacing."],
      ["Is my text uploaded?", "No. Text formatting, invisible character detection and Unicode AI watermark removal all run locally in your browser with JavaScript."]
    ],
    related: "Related text tools", relatedAria: "Related text and document tools",
    footerText: "JianFan.app provides browser-local Chinese conversion, text formatting, character counting and document tools."
  },
  ja: {
    title: "テキスト整形ツール - 改行・空白とAI透かしを削除 | JianFan.app",
    description: "無料のテキスト整形ツール。PDF・PPT・CAJからコピーした不要な改行、空白、句読点を整え、ゼロ幅文字や特殊スペースなど検出可能なAI文章の透かしをブラウザー内で削除します。",
    eyebrow: "文章整形 · 不可視文字チェック · ブラウザー内処理",
    heading: "テキスト整形ツール",
    lede: "PDF・PowerPoint・CAJ・Webページからコピーした文章の不要な改行や空白を整え、Unicodeに埋め込まれた検出可能なAI文章の透かしを削除します。文章は送信されません。",
    toolTitle: "文章を貼り付け、ルールを選んで整形",
    inputTitle: "整形前の文章", outputTitle: "整形結果", placeholder: "整形したい文章を貼り付けてください...",
    run: "テキストを整形", sample: "サンプル", clear: "クリア", importFile: "ファイルを開く", copy: "結果をコピー", reuse: "結果を再編集", download: "TXTを保存",
    lineModeLabel: "改行の処理", lineModes: { keep: "元の改行を維持", join: "段落内の改行を結合", remove: "すべての改行を削除", sentence: "一文ごとに改行" },
    basicTitle: "テキスト整形", watermarkTitle: "AI透かし・Unicodeの整理",
    options: {
      trimLines: "各行の前後の空白を削除", collapseSpaces: "連続する空白とタブをまとめる", reduceBlankLines: "空行を1行までにする", repairHyphenation: "英文の行末ハイフンを修復",
      removeHanSpaces: "漢字間の空白を削除", addHanLatinSpaces: "漢字と英数字の間に空白を追加", fixEnglishQuotes: "英文の引用符を修正", useCjkPunctuation: "漢字文脈の句読点を全角化", decodeUrls: "URLを安全にデコード",
      removeBasicInvisible: "高確度の不可視文字を削除", normalizeSpecialSpaces: "特殊スペースを通常の空白に変換",
      removeJoiners: "ゼロ幅接合子・非接合子を削除", removeVariationSelectors: "異体字セレクターを削除", removeBidiControls: "双方向制御文字を削除", removeTags: "Unicodeタグ文字を削除", normalizeConfusables: "全角・混在文字の同形字を修正"
    },
    advancedTitle: "注意が必要な Unicode 削除",
    advancedWarning: "絵文字、アラビア文字、インド系文字、双方向テキスト、字形の選択に必要な場合があります。不要な印だと確認できた場合だけ有効にしてください。",
    localNote: "整形と検出はブラウザー内で行われます。削除できるのは検出可能な Unicode の印だけで、作者の判定や統計型 AI 透かしの検出・除去はできません。",
    status: { idle: "文章を入力してください", pending: "文章が変更されました", ready: "整形が完了しました", unchanged: "変更対象は見つかりませんでした", copied: "結果をコピーしました", copyFailed: "コピーできません。手動で選択してください", tooLong: "{limit}文字を超えています。分割して処理してください。", fileTooLarge: "10 MBを超えています。小さいファイルを選んでください。", fileError: "このテキストファイルを読み込めません" },
    metrics: ["入力文字数", "出力文字数", "処理前の疑わしい文字", "処理後の疑わしい文字"],
    reportTitle: "Unicode 検出結果", reportEmpty: "ゼロ幅文字、特殊スペース、異体字セレクター、同形文字はまだ検出されていません。",
    categories: { basicInvisible: "高確度の不可視文字", specialSpaces: "特殊スペース", joiners: "ゼロ幅接合子", variationSelectors: "異体字セレクター", bidiControls: "双方向制御文字", tags: "Unicodeタグ", confusables: "同形・全角文字" },
    seoKicker: "PDFコピー文章の改行・不可視文字を整理",
    featureTitle: "文書のコピペ、文章整形、AI透かし確認に使えるツール",
    featureIntro: "改行・空白削除だけでなく、URL、小数、一般的な英文を保護しながら整形します。不可視 Unicode 文字は危険度別に確認してから削除できます。",
    cards: [
      ["PDF・CAJの不自然な改行を修正", "段落を残したまま行末を結合し、日本語と英語の境界に合った空白を入れます。英文の分割ハイフンも個別に修正できます。"],
      ["URLや小数を壊さずに整形", "句読点と空白の処理ではURL、メールアドレス、インラインコード、小数を保護します。"],
      ["AI文章の透かしを段階的に削除", "ゼロ幅空白など確度の高い印だけを標準で削除し、接合子や異体字セレクターは任意にします。"]
    ],
    howTitle: "オンラインでテキストを整形する方法", steps: ["文章を貼り付けるか、TXT・MD・CSV・JSONを読み込みます。", "改行、空白、句読点、Unicodeの処理ルールを選びます。", "テキストを整形し、処理前後の検出結果を確認します。", "結果をコピー、保存、または入力欄へ戻して再調整します。"],
    faqTitle: "テキスト整形と AI 透かしのよくある質問",
    faqs: [
      ["AI文章の透かしとは何ですか？", "このページでは、ゼロ幅文字、特殊スペース、異体字セレクター、混在文字の同形字など検出可能な Unicode の印を指します。単語選択による統計型透かしとは異なります。"],
      ["U+200C、U+200D、異体字セレクターを標準で消さない理由は？", "絵文字、アラビア文字、インド系文字、字形表示に必要なことがあり、自動削除すると正常な文章を壊すためです。"],
      ["PDFからコピーした改行を削除できますか？", "はい。「段落内の改行を結合」を選ぶと空行で分かれた段落を維持しながら、行末を自然につなぎます。"],
      ["文章はサーバーへ送信されますか？", "いいえ。テキスト整形、不可視文字の検出、Unicode AI透かしの削除はJavaScriptでブラウザー内処理されます。"]
    ],
    related: "関連テキストツール", relatedAria: "関連テキスト・文書ツール",
    footerText: "JianFan.app はブラウザー内で動作する中国語変換、文章整形、文字数カウント、文書ツールを提供しています。"
  },
  ko: {
    title: "텍스트 정리기 - 공백·줄바꿈과 AI 워터마크 제거 | JianFan.app",
    description: "무료 텍스트 정리기. PDF·PPT에서 복사한 글의 공백과 줄바꿈을 정리하고 제로폭 문자, 특수 공백 등 AI 텍스트 워터마크를 브라우저에서 찾아 제거합니다.",
    eyebrow: "텍스트 정리 · 숨은 문자 검사 · 브라우저 처리",
    heading: "온라인 텍스트 정리기",
    lede: "PDF, PowerPoint, CAJ, 웹페이지에서 복사한 글의 불필요한 공백과 줄바꿈을 정리하고 Unicode에 숨은 AI 텍스트 워터마크를 검사합니다. 텍스트는 업로드하지 않습니다.",
    toolTitle: "텍스트를 붙여 넣고 규칙을 선택하세요",
    inputTitle: "원본 텍스트", outputTitle: "정리 결과", placeholder: "정리할 텍스트를 붙여 넣으세요...",
    run: "텍스트 정리", sample: "예시 불러오기", clear: "지우기", importFile: "텍스트 가져오기", copy: "결과 복사", reuse: "결과 다시 편집", download: "TXT 저장",
    lineModeLabel: "줄바꿈 처리", lineModes: { keep: "원래 줄바꿈 유지", join: "문단 안 줄바꿈 합치기", remove: "모든 줄바꿈 제거", sentence: "문장마다 줄바꿈" },
    basicTitle: "기본 텍스트 정리", watermarkTitle: "AI 워터마크·Unicode 정리",
    options: {
      trimLines: "줄 앞뒤 공백 제거", collapseSpaces: "연속 공백과 탭 합치기", reduceBlankLines: "빈 줄 하나만 유지", repairHyphenation: "영문 줄 끝 하이픈 복원",
      removeHanSpaces: "한자 사이 공백 제거", addHanLatinSpaces: "한자와 영문·숫자 사이 띄우기", fixEnglishQuotes: "영문 곡선 따옴표 수정", useCjkPunctuation: "한자 문맥의 문장부호 전각 변환", decodeUrls: "URL 안전하게 디코딩",
      removeBasicInvisible: "확실한 숨은 문자 제거", normalizeSpecialSpaces: "특수 공백을 일반 공백으로 변환",
      removeJoiners: "제로폭 연결자·비연결자 제거", removeVariationSelectors: "변형 선택자 제거", removeBidiControls: "양방향 제어 문자 제거", removeTags: "Unicode 태그 문자 제거", normalizeConfusables: "전각·혼합 문자 닮은꼴 수정"
    },
    advancedTitle: "주의가 필요한 Unicode 정리",
    advancedWarning: "이 문자는 이모지, 아랍 문자, 인도계 문자, 양방향 텍스트와 글리프 변형에 필요할 수 있습니다. 불필요한 표식이 확실할 때만 켜세요.",
    localNote: "정리와 검사는 브라우저에서 실행됩니다. 감지 가능한 Unicode 표식만 제거하며 작성자를 판별하거나 통계 방식의 AI 워터마크를 감지·제거할 수는 없습니다.",
    status: { idle: "텍스트를 입력하세요", pending: "텍스트가 변경되었습니다", ready: "텍스트 정리를 마쳤습니다", unchanged: "바꿀 항목을 찾지 못했습니다", copied: "결과를 복사했습니다", copyFailed: "복사하지 못했습니다. 결과를 직접 선택하세요.", tooLong: "{limit}자를 초과했습니다. 나눠서 처리해 주세요.", fileTooLarge: "10 MB를 초과했습니다. 더 작은 파일을 선택하세요.", fileError: "이 텍스트 파일을 읽을 수 없습니다" },
    metrics: ["입력 글자", "출력 글자", "처리 전 의심 문자", "처리 후 의심 문자"],
    reportTitle: "Unicode 검사 결과", reportEmpty: "제로폭 문자, 특수 공백, 변형 선택자 또는 닮은꼴 문자가 아직 감지되지 않았습니다.",
    categories: { basicInvisible: "확실한 숨은 문자", specialSpaces: "특수 공백", joiners: "제로폭 연결자", variationSelectors: "변형 선택자", bidiControls: "양방향 제어 문자", tags: "Unicode 태그", confusables: "닮은꼴·전각 문자" },
    seoKicker: "PDF 복사 텍스트와 숨은 Unicode 정리",
    featureTitle: "문서 복사, 문장 정리, AI 워터마크 검사에 맞춘 도구",
    featureIntro: "공백·줄바꿈 제거뿐 아니라 URL, 소수, 일반 영문을 보호하면서 텍스트를 정리합니다. 보이지 않는 Unicode 문자는 위험도별로 확인한 뒤 지울 수 있습니다.",
    cards: [
      ["PDF·CAJ 복사 줄바꿈 복원", "빈 줄로 나눈 문단은 유지하고 문단 안 강제 줄바꿈을 합칩니다. 영문 단어를 나눈 하이픈도 선택해서 복원할 수 있습니다."],
      ["URL과 소수를 보존", "문장부호와 공백을 바꿀 때 웹 주소, 이메일, 인라인 코드와 소수는 처리 대상에서 제외합니다."],
      ["AI 텍스트 워터마크 단계별 제거", "제로폭 공백처럼 확실한 표식은 기본 제거하고 연결자, 변형 선택자, 혼합 문자 닮은꼴은 직접 선택하게 합니다."]
    ],
    howTitle: "온라인에서 텍스트 정리하는 방법", steps: ["텍스트를 붙여 넣거나 TXT, MD, CSV, JSON 파일을 불러옵니다.", "줄바꿈, 공백, 문장부호와 Unicode 정리 규칙을 선택합니다.", "텍스트 정리를 누르고 처리 전후 Unicode 검사 결과를 확인합니다.", "결과를 복사·저장하거나 입력 칸으로 돌려 다시 조정합니다."],
    faqTitle: "텍스트 정리와 AI 워터마크 FAQ",
    faqs: [
      ["AI 텍스트 워터마크란 무엇인가요?", "이 페이지에서는 제로폭 문자, 특수 공백, 변형 선택자, 혼합 문자 닮은꼴처럼 감지할 수 있는 Unicode 표식을 뜻합니다. 단어 선택 기반 통계 워터마크와는 다릅니다."],
      ["U+200C, U+200D와 변형 선택자를 기본 삭제하지 않는 이유는 무엇인가요?", "이모지, 아랍 문자, 인도계 문자와 글리프 표시에 필요할 수 있어 자동 삭제하면 정상 텍스트를 손상할 수 있기 때문입니다."],
      ["PDF에서 복사한 줄바꿈을 정리할 수 있나요?", "네. ‘문단 안 줄바꿈 합치기’를 선택하면 빈 줄로 구분된 문단을 유지하면서 각 줄을 자연스럽게 연결합니다."],
      ["텍스트가 서버로 전송되나요?", "아니요. 텍스트 정리, 보이지 않는 문자 검사와 Unicode AI 워터마크 제거는 모두 브라우저의 JavaScript로 처리됩니다."]
    ],
    related: "관련 텍스트 도구", relatedAria: "관련 텍스트 및 문서 도구",
    footerText: "JianFan.app는 브라우저에서 실행되는 중국어 변환, 텍스트 정리, 글자수 계산과 문서 도구를 제공합니다."
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "文本格式化工具"], ["character-counter", "在线字数统计"], ["word-to-txt", "Word 转 TXT"], ["file-text-converter", "文件文本简繁转换"], ["simplified-to-traditional", "简体转繁体"], ["traditional-to-simplified", "繁体转简体"], ["chinese-to-pinyin", "汉字转拼音"], ["chinese-character-lookup", "汉字查询与结构拆解"]],
  "zh-TW": [[slug, "文字格式化工具"], ["character-counter", "線上字數統計"], ["word-to-txt", "DOCX 轉 TXT"], ["file-text-converter", "文件文字簡繁轉換"], ["simplified-to-traditional", "簡體轉繁體"], ["traditional-to-simplified", "繁體轉簡體"], ["chinese-to-pinyin", "漢字轉拼音"], ["chinese-character-lookup", "漢字查詢與結構拆解"]],
  en: [[slug, "Online text formatter"], ["character-counter", "CJK character counter"], ["word-to-txt", "Word to text"], ["file-text-converter", "Document Chinese converter"], ["simplified-to-traditional", "Simplified to Traditional"], ["traditional-to-simplified", "Traditional to Simplified"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["chinese-character-lookup", "Chinese character lookup"]],
  ja: [[slug, "テキスト整形ツール"], ["character-counter", "文字数カウント"], ["word-to-txt", "Word TXT 変換"], ["file-text-converter", "文書の中国語簡繁変換"], ["japanese-characters", "日本語文字コピー"], ["kanji-to-hiragana", "漢字をひらがなに変換"], ["japanese-kanji-dictionary", "漢字検索・漢字辞典"], ["han-character-worksheet", "漢字練習プリント"]],
  ko: [[slug, "텍스트 정리기"], ["character-counter", "글자수 세기"], ["word-to-txt", "DOCX TXT 변환"], ["file-text-converter", "문서 중국어 변환"], ["hangul-hanja-converter", "한글 한자 변환"], ["korean-hanja-dictionary", "한자 찾기·옥편"], ["chinese-handwriting-recognition", "한자 필기 인식"], ["han-character-worksheet", "한자 쓰기 연습장"]]
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localizedPath(locale, targetSlug = "") {
  return `/${locales[locale].prefix}${targetSlug ? `${targetSlug}/` : ""}`;
}

function titleContent(title) {
  return title.replace(/ \| JianFan\.app$/u, "");
}

function buildSchema(locale, page) {
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const name = titleContent(page.title);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${canonical}#webapp`, name, url: canonical, description: page.description, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` } },
      { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localizedPath(locale)}` }, { "@type": "ListItem", position: 2, name, item: canonical }] },
      { "@type": "HowTo", "@id": `${canonical}#howto`, name: page.howTitle, step: page.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text })) },
      { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
    ]
  };
}

function option(locale, key, checked = false, extra = "") {
  const page = content[locale];
  return `<label class="formatter-option"><input type="checkbox" data-formatter-option="${key}" id="${key}"${checked ? " checked" : ""}${extra} /><span>${page.options[key]}</span></label>`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([targetLocale, item]) => `    <link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localizedPath(targetLocale, slug)}" />`).join("\n");
  const localeOptions = Object.entries(locales).map(([value, item]) => `<option value="${value}"${value === locale ? " selected" : ""}>${item.label}</option>`).join("");
  const statusData = Object.entries(page.status).map(([key, value]) => ` data-message-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`).join("");
  const categoryData = Object.entries(page.categories).map(([key, value]) => ` data-category-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`).join("");
  const related = relatedLabels[locale].map(([targetSlug, label]) => `<a href="${localizedPath(locale, targetSlug)}"${targetSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const lineModes = Object.entries(page.lineModes).map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  const schema = JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n");
  const sample = escapeHtml(sampleText);

  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(page.description)}" />
    <title>${escapeHtml(page.title)}</title>
    <link rel="canonical" href="${canonical}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${origin}${localizedPath("zh-CN", slug)}" />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.min.css" />
    <script defer src="/text-formatter.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${schema}
    </script>
    <!-- seo-schema:end -->
  </head>
  <body data-tool-page="text-formatter" data-page-slug="${slug}" data-locale="${locale}"${statusData}${categoryData}>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">文</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${localeOptions}</select></label></nav></header>
    <main id="main">
      <section class="tool-hero formatter-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="formatter-hero-signal" aria-hidden="true"><span>U+200B</span><strong>TXT</strong><b>CLEAN</b></div></section>
      <section class="standalone-tool text-formatter-tool" aria-labelledby="formatterToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">FORMAT / SCAN / CLEAN</p><h2 id="formatterToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="formatterStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.status.idle}</span></div></div>
        <div class="formatter-settings">
          <fieldset><legend>${page.basicTitle}</legend><div class="formatter-option-grid"><label class="formatter-select-option" for="formatterLineMode"><span>${page.lineModeLabel}</span><select id="formatterLineMode">${lineModes}</select></label>${option(locale, "trimLines", true)}${option(locale, "collapseSpaces", true)}${option(locale, "reduceBlankLines", true)}${option(locale, "repairHyphenation", false, " disabled")}${option(locale, "removeHanSpaces")}${option(locale, "addHanLatinSpaces")}${option(locale, "fixEnglishQuotes", true)}${option(locale, "useCjkPunctuation")}${option(locale, "decodeUrls")}</div></fieldset>
          <fieldset><legend>${page.watermarkTitle}</legend><div class="formatter-option-grid formatter-watermark-options">${option(locale, "removeBasicInvisible", true)}${option(locale, "normalizeSpecialSpaces", true)}</div><details class="formatter-risk-options"><summary>${page.advancedTitle}</summary><p>${page.advancedWarning}</p><div class="formatter-option-grid">${option(locale, "removeJoiners")}${option(locale, "removeVariationSelectors")}${option(locale, "removeBidiControls")}${option(locale, "removeTags")}${option(locale, "normalizeConfusables")}</div></details></fieldset>
        </div>
        <div class="formatter-workspace">
          <section class="formatter-text-panel" aria-labelledby="formatterInputTitle"><div class="panel-topline"><h3 id="formatterInputTitle">${page.inputTitle}</h3><span><b id="formatterInputCount">0</b> / 3,000,000</span></div><textarea id="formatterInput" spellcheck="false" placeholder="${escapeHtml(page.placeholder)}"></textarea><div class="formatter-panel-actions"><div><button class="text-button" id="formatterSample" type="button" data-sample="${sample}">${page.sample}</button><button class="text-button" id="formatterClear" type="button">${page.clear}</button></div><label class="formatter-file-button" for="formatterFile">${page.importFile}<input id="formatterFile" type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" /></label></div></section>
          <section class="formatter-text-panel formatter-output-panel" aria-labelledby="formatterOutputTitle"><div class="panel-topline"><h3 id="formatterOutputTitle">${page.outputTitle}</h3><span id="formatterOutputCount">0</span></div><textarea id="formatterOutput" readonly spellcheck="false"></textarea><div class="formatter-panel-actions"><div><button class="text-button" id="formatterReuse" type="button">${page.reuse}</button><button class="text-button" id="formatterDownload" type="button">${page.download}</button></div><button class="text-button" id="formatterCopy" type="button">${page.copy}</button></div></section>
        </div>
        <div class="formatter-run-row"><button class="primary-action" id="formatterRun" type="button">${page.run}</button><p>${page.localNote}</p></div>
        <div class="formatter-metrics">${page.metrics.map((label, index) => `<article><span>${label}</span><strong id="${["formatterInputMetric", "formatterOutputMetric", "formatterHiddenBefore", "formatterHiddenAfter"][index] || ""}">${index < 2 ? '<span aria-hidden="true">—</span>' : "0"}</strong></article>`).join("")}</div>
        <section class="formatter-report-panel" aria-labelledby="formatterReportTitle"><div class="panel-topline"><h3 id="formatterReportTitle">${page.reportTitle}</h3><span>UNICODE</span></div><p id="formatterReportEmpty">${page.reportEmpty}</p><ul id="formatterReport"></ul></section>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="formatterFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.seoKicker}</p><h2 id="formatterFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">${page.cards.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div><section class="word-howto" aria-labelledby="formatterHowTitle"><h2 id="formatterHowTitle">${page.howTitle}</h2><ol>${page.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section><section class="pinyin-faq" aria-labelledby="formatterFaqTitle"><h2 id="formatterFaqTitle">${page.faqTitle}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">${related}</nav></section>
    </main>
    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localizedPath(locale, "about")}">${meta.about}</a><a href="${localizedPath(locale, "contact")}">${meta.contact}</a><a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>`;
}

function buildHomeLink(locale) {
  const labels = { "zh-CN": "文本格式化与 AI 水印清理", "zh-TW": "文字格式化與 AI 浮水印清理", en: "Text formatter & AI watermark cleaner", ja: "テキスト整形・AI透かし削除", ko: "텍스트 정리·AI 워터마크 제거" };
  return `          <!-- text-formatter-link:start -->\n          <a href="${localizedPath(locale, slug)}" data-route="text-formatter">${labels[locale]}</a>\n          <!-- text-formatter-link:end -->`;
}

function syncHomeLink(source, locale) {
  const block = buildHomeLink(locale);
  if (source.includes("<!-- text-formatter-link:start -->")) {
    return source.replace(/          <!-- text-formatter-link:start -->[\s\S]*?          <!-- text-formatter-link:end -->/u, block);
  }
  const anchor = "          <!-- japanese-tool-links:end -->";
  if (!source.includes(anchor)) throw new Error(`${locale} homepage is missing the related-tool marker`);
  return source.replace(anchor, `${anchor}\n${block}`);
}

function buildSitemapSection() {
  const localeEntries = Object.entries(locales);
  const alternates = localeEntries.map(([locale, item]) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localizedPath(locale, slug)}" />`).join("\n");
  const urls = localeEntries.map(([locale]) => `  <url>\n    <loc>${origin}${localizedPath(locale, slug)}</loc>\n    <lastmod>2026-09-10</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${locale === "zh-CN" ? "0.9" : "0.8"}</priority>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${localizedPath("zh-CN", slug)}" />\n  </url>`).join("\n");
  return `  <!-- text-formatter-tool:start -->\n${urls}\n  <!-- text-formatter-tool:end -->`;
}

function syncSitemap(source) {
  const section = buildSitemapSection();
  if (source.includes("<!-- text-formatter-tool:start -->")) {
    return source.replace(/  <!-- text-formatter-tool:start -->[\s\S]*?  <!-- text-formatter-tool:end -->/u, section);
  }
  const anchor = "  <!-- blog:start -->";
  if (!source.includes(anchor)) throw new Error("sitemap.xml is missing the blog marker");
  return source.replace(anchor, `${section}\n${anchor}`);
}

async function writeOrCheck(filePath, expected) {
  if (checkOnly) {
    const actual = await readFile(filePath, "utf8");
    if (actual !== expected) throw new Error(`${path.relative(projectRoot, filePath)} is out of sync; run ${path.basename(fileURLToPath(import.meta.url))}`);
    return;
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, expected);
}

for (const locale of Object.keys(locales)) {
  await writeOrCheck(path.join(projectRoot, locales[locale].prefix, slug, "index.html"), `${buildPage(locale)}\n`);
  const homepagePath = path.join(projectRoot, locales[locale].prefix, "index.html");
  const homepage = await readFile(homepagePath, "utf8");
  await writeOrCheck(homepagePath, syncHomeLink(homepage, locale));
}

const sitemapPath = path.join(projectRoot, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
await writeOrCheck(sitemapPath, syncSitemap(sitemap));

console.log(`${checkOnly ? "Checked" : "Generated"} 5 multilingual text-formatter pages, homepage links, and sitemap entries.`);
