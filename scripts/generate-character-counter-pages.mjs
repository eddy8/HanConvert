import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "character-counter";
const sampleText = "中文字符统计与汉字词频\n日本語の文字数カウントと漢字分析\n한국어 글자수 세기와 한자 분석\nCJK text analysis 2026.";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "在线字数统计 - 汉字字符、字节与词频统计 | JianFan.app",
    description: "免费在线字数统计和汉字字数统计工具，实时计算字符数、汉字数、字节数、段落、句子与词频，并区分日文假名、韩文和英文字符。",
    eyebrow: "实时统计 · CJK 文字分析 · 浏览器本地处理",
    heading: "在线字数统计",
    lede: "粘贴或输入文字，即时统计汉字、字符、字节、单词、句子和段落，并查看中日韩文字构成与高频字符。内容仅在浏览器本地分析。",
    toolTitle: "输入文本，实时查看字数和字符构成",
    inputTitle: "待统计文本",
    inputPlaceholder: "在这里输入或粘贴中文、日文、韩文或英文文本...",
    sample: "加载示例",
    clear: "清空",
    importFile: "导入文件",
    importHint: "支持 TXT、MD、CSV、JSON 和 DOCX，单文件不超过 10 MB",
    statsTitle: "统计结果",
    metrics: {
      characters: ["字符数", "包含空格与换行"],
      charactersNoWhitespace: ["不含空白", "排除空格与换行"],
      words: ["词语 / 单词", "按语言边界识别"],
      sentences: ["句子", "按常见句末标点"],
      paragraphs: ["段落", "以空行分隔"],
      lines: ["行数", "包含非空与空白行"],
      bytes: ["UTF-8 字节", "实际编码占用"],
      uniqueCharacters: ["不同字符", "排除空白字符"]
    },
    targetLabel: "目标字数",
    targetProgress: "不含空白字符进度",
    targetUnit: "字",
    breakdownTitle: "文字构成",
    breakdownIntro: "按 Unicode 文字系统识别，共用汉字统一计入汉字。",
    categories: { han: "汉字", hiragana: "平假名", katakana: "片假名", hangul: "韩文", latin: "英文字母", number: "数字", punctuationSymbol: "标点与符号", other: "其它字符" },
    frequencyTitle: "高频字符",
    frequencyIntro: "显示出现次数最多的 12 个非空白字符。",
    excludePunctuation: "不统计标点与符号",
    frequencyEmpty: "输入文字后会显示字符频次。",
    privacyNote: "文字统计在当前浏览器中完成。只有导入 DOCX 时才会按需加载公开的文档解析组件，文件内容不会上传。",
    messages: {
      idle: "等待输入文本",
      analyzing: "正在统计",
      ready: "统计已更新",
      error: "暂时无法统计，请刷新页面",
      tooLong: "文本超过 {limit} 个字符，请分批统计",
      reading: "正在读取文件",
      unsupported: "仅支持 TXT、MD、CSV、JSON 和 DOCX 文件",
      fileTooLarge: "文件超过 {limit}",
      fileError: "无法读取这个文本文件",
      libraryError: "DOCX 解析组件加载失败，请刷新后重试"
    },
    seoKicker: "汉字字数与字符数统计",
    featureTitle: "面向中日韩文本的在线字数统计工具",
    featureIntro: "除了常见的字数统计、字符数统计和字节数计算，还能区分汉字、日文假名、韩文、英文字母和标点，适合文案、论文、字幕、表单与内容审核。",
    cards: [
      ["正确计算 Unicode 字符", "按用户看到的完整字符统计，家庭表情、组合音标等不会被拆成多个字符。"],
      ["中日韩文字构成", "分别统计汉字、平假名、片假名、韩文、英文、数字和标点，快速判断文本组成。"],
      ["字符频次与目标进度", "查看高频字符，并设置目标字数，适合控制标题、摘要、投稿和表单长度。"]
    ],
    howTitle: "如何在线统计字数",
    steps: ["输入或粘贴要统计的文本，也可以导入 TXT、DOCX 等文件。", "实时查看字符数、词语、句子、段落、行数与 UTF-8 字节。", "根据需要检查文字构成、字符频次和目标字数进度。"],
    faqTitle: "在线字数统计常见问题",
    faqs: [
      ["字符数和汉字数有什么区别？", "字符数包含汉字、字母、数字、标点、空格与换行；汉字数只统计 Unicode 汉字。简体、繁体、日文汉字和韩文汉字可能共享同一码位，因此统一计入汉字。"],
      ["为什么字符数和字节数不同？", "字符是用户看到的文字单位，字节是编码后的存储大小。UTF-8 中英文通常占 1 字节，常见汉字通常占 3 字节。"],
      ["Word 文件会上传吗？", "不会。DOCX 文档在浏览器内提取文字，内容不会发送到 JianFan.app 或第三方转换服务器。"],
      ["可以统计很长的文本吗？", "可以统计最多 300 万个字符。较长文本会在后台线程处理，超过限制时建议分段统计。"]
    ],
    related: "相关文字工具",
    relatedAria: "相关文字和文件工具",
    footerText: "JianFan.app 提供浏览器本地运行的中文转换、文字统计与文件文本工具。",
    targetDefault: 1000
  },
  "zh-TW": {
    title: "線上字數統計 - 中文字數、字元與詞頻計算 | JianFan.app",
    description: "免費線上字數統計與中文字數統計工具，即時計算字元數、漢字數、UTF-8 位元組、段落、句子與字元頻率，並分析日文、韓文及英文。",
    eyebrow: "即時統計 · CJK 文字分析 · 瀏覽器本機處理",
    heading: "線上字數統計",
    lede: "貼上或輸入文字，即時查看字數、字元數、位元組、單字、句子與段落，並分析中日韓文字組成及常用字元。內容只在瀏覽器本機處理。",
    toolTitle: "輸入文字，即時查看字數與字元組成",
    inputTitle: "要統計的文字",
    inputPlaceholder: "在這裡輸入或貼上中文、日文、韓文或英文內容...",
    sample: "載入範例",
    clear: "清除",
    importFile: "匯入檔案",
    importHint: "支援 TXT、MD、CSV、JSON 與 DOCX，單一檔案上限 10 MB",
    statsTitle: "統計結果",
    metrics: {
      characters: ["字元數", "包含空白與換行"],
      charactersNoWhitespace: ["不含空白", "排除空格與換行"],
      words: ["詞語 / 單字", "依語言邊界辨識"],
      sentences: ["句子", "依常見句末標點"],
      paragraphs: ["段落", "以空白行分隔"],
      lines: ["行數", "包含空白行"],
      bytes: ["UTF-8 位元組", "實際編碼大小"],
      uniqueCharacters: ["相異字元", "排除空白字元"]
    },
    targetLabel: "目標字數",
    targetProgress: "不含空白字元進度",
    targetUnit: "字",
    breakdownTitle: "文字組成",
    breakdownIntro: "依 Unicode 文字系統辨識，共用漢字統一列入漢字。",
    categories: { han: "漢字", hiragana: "平假名", katakana: "片假名", hangul: "韓文", latin: "英文字母", number: "數字", punctuationSymbol: "標點與符號", other: "其他字元" },
    frequencyTitle: "常用字元",
    frequencyIntro: "顯示出現次數最多的 12 個非空白字元。",
    excludePunctuation: "排除標點與符號",
    frequencyEmpty: "輸入文字後會顯示字元頻率。",
    privacyNote: "文字統計在目前的瀏覽器中完成。只有匯入 DOCX 時才會視需要載入公開的文件解析元件，檔案內容不會上傳。",
    messages: {
      idle: "等待輸入文字",
      analyzing: "正在統計",
      ready: "統計已更新",
      error: "目前無法統計，請重新整理頁面",
      tooLong: "文字超過 {limit} 個字元，請分段統計",
      reading: "正在讀取檔案",
      unsupported: "僅支援 TXT、MD、CSV、JSON 與 DOCX 檔案",
      fileTooLarge: "檔案超過 {limit}",
      fileError: "無法讀取這個文字檔",
      libraryError: "DOCX 解析元件載入失敗，請重新整理後再試"
    },
    seoKicker: "中文字數與字元統計",
    featureTitle: "適合中日韓文字的線上字數統計工具",
    featureIntro: "除了常見的字數統計、中文字數統計與字元數計算，也能分辨漢字、日文假名、韓文、英文字母與標點，適合文案、論文、字幕及表單內容。",
    cards: [
      ["正確計算 Unicode 字元", "依畫面上看到的完整字元計算，家庭表情符號、組合音標等不會被拆成多個字元。"],
      ["中日韓文字組成", "分別統計漢字、平假名、片假名、韓文、英文、數字與標點，快速掌握文字內容。"],
      ["字元頻率與目標進度", "查看常用字元並設定目標字數，方便控制標題、摘要、投稿與表單長度。"]
    ],
    howTitle: "如何在線上統計字數",
    steps: ["輸入或貼上要統計的文字，也可以匯入 TXT、DOCX 等檔案。", "即時查看字元數、詞語、句子、段落、行數與 UTF-8 位元組。", "依需要檢查文字組成、字元頻率及目標字數進度。"],
    faqTitle: "字數統計常見問題",
    faqs: [
      ["字元數和漢字數有什麼不同？", "字元數包含漢字、字母、數字、標點、空白與換行；漢字數只計算 Unicode 漢字。正體、簡體、日文漢字與韓文漢字可能共用碼位，因此統一列入漢字。"],
      ["為什麼字元數和位元組數不同？", "字元是畫面上看到的文字單位，位元組是編碼後的儲存大小。UTF-8 中英文字母通常為 1 位元組，常見漢字通常為 3 位元組。"],
      ["Word 文件會上傳嗎？", "不會。DOCX 文件只在瀏覽器內提取文字，不會傳送到 JianFan.app 或第三方轉檔伺服器。"],
      ["可以統計很長的文字嗎？", "最多可統計 300 萬個字元。較長內容會在背景執行緒處理，超過限制時建議分段統計。"]
    ],
    related: "相關文字工具",
    relatedAria: "相關文字與檔案工具",
    footerText: "JianFan.app 提供在瀏覽器本機執行的中文轉換、字數統計與文件文字工具。",
    targetDefault: 1000
  },
  en: {
    title: "Chinese Character Counter - CJK Text & Word Count | JianFan.app",
    description: "Free Chinese character counter for CJK text. Count characters, words, sentences, UTF-8 bytes, kanji, kana, Hangul, Hanja and character frequency in your browser.",
    eyebrow: "LIVE COUNT · CJK SCRIPT ANALYSIS · LOCAL PROCESSING",
    heading: "Chinese Character Counter",
    lede: "Count Chinese characters, Japanese kana and kanji, Korean Hangul and Hanja, English words, sentences, lines and UTF-8 bytes. Your text stays in this browser.",
    toolTitle: "Paste text for an instant CJK character count",
    inputTitle: "Text to count",
    inputPlaceholder: "Type or paste Chinese, Japanese, Korean or English text...",
    sample: "Load sample",
    clear: "Clear",
    importFile: "Import file",
    importHint: "TXT, MD, CSV, JSON and DOCX up to 10 MB",
    statsTitle: "Text statistics",
    metrics: {
      characters: ["Characters", "Including spaces and line breaks"],
      charactersNoWhitespace: ["No whitespace", "Spaces and line breaks excluded"],
      words: ["Words", "Locale-aware word boundaries"],
      sentences: ["Sentences", "Detected by sentence boundaries"],
      paragraphs: ["Paragraphs", "Separated by blank lines"],
      lines: ["Lines", "Including blank lines"],
      bytes: ["UTF-8 bytes", "Encoded storage size"],
      uniqueCharacters: ["Unique characters", "Whitespace excluded"]
    },
    targetLabel: "Character target",
    targetProgress: "Progress excluding whitespace",
    targetUnit: "characters",
    breakdownTitle: "CJK script breakdown",
    breakdownIntro: "Detected by Unicode script. Shared Han ideographs are grouped together.",
    categories: { han: "Han characters", hiragana: "Hiragana", katakana: "Katakana", hangul: "Hangul", latin: "Latin letters", number: "Numbers", punctuationSymbol: "Punctuation & symbols", other: "Other characters" },
    frequencyTitle: "Character frequency",
    frequencyIntro: "The 12 most common non-whitespace characters.",
    excludePunctuation: "Exclude punctuation and symbols",
    frequencyEmpty: "Character frequency will appear as you type.",
    privacyNote: "Counting happens in this browser. A public document parser is loaded only when you import DOCX; the file itself is never uploaded.",
    messages: {
      idle: "Waiting for text",
      analyzing: "Counting text",
      ready: "Statistics updated",
      error: "Counting failed. Refresh the page and try again.",
      tooLong: "Text exceeds {limit} characters. Split it into smaller sections.",
      reading: "Reading file",
      unsupported: "Choose a TXT, MD, CSV, JSON or DOCX file",
      fileTooLarge: "File exceeds {limit}",
      fileError: "This text file could not be read",
      libraryError: "The DOCX parser failed to load. Refresh and try again."
    },
    seoKicker: "CHINESE, JAPANESE & KOREAN TEXT COUNT",
    featureTitle: "A Unicode-aware character counter for CJK text",
    featureIntro: "Use it as a Chinese character counter, Japanese character counter or Korean text counter. Beyond words and characters, it identifies the scripts inside multilingual copy without sending text to a server.",
    cards: [
      ["Count complete Unicode characters", "Emoji families, combining marks and other grapheme sequences count as the single visible character users expect."],
      ["Break down CJK scripts", "Measure Han ideographs, Hiragana, Katakana, Hangul, Latin letters, numbers, punctuation and symbols separately."],
      ["Track frequency and a target", "Find repeated characters and set a target for descriptions, assignments, submissions and form limits."]
    ],
    howTitle: "How to count Chinese and CJK characters",
    steps: ["Type or paste text, or import a supported text or DOCX file.", "Review characters, words, sentences, paragraphs, lines and UTF-8 bytes.", "Use the script breakdown, frequency list and target progress for a closer check."],
    faqTitle: "Character counter questions",
    faqs: [
      ["What is the difference between characters and Han characters?", "Characters include letters, numbers, punctuation, whitespace and line breaks. Han characters count only Unicode Han ideographs shared across Chinese, Japanese and Korean writing systems."],
      ["Why is the byte count different from the character count?", "Characters describe visible text units. Bytes describe encoded storage. In UTF-8, an English letter is usually 1 byte while a common Han character is usually 3 bytes."],
      ["Are imported Word files uploaded?", "No. DOCX text is extracted in your browser and is not sent to JianFan.app or a third-party conversion server."],
      ["How much text can I count?", "The tool accepts up to 3 million characters. Longer input runs in a background worker; split anything larger into sections."]
    ],
    related: "Related text tools",
    relatedAria: "Related text and document tools",
    footerText: "JianFan.app provides browser-local Chinese conversion, character counting and document text tools.",
    targetDefault: 1000
  },
  ja: {
    title: "文字数カウント - 空白なし・漢字・かな・バイト数 | JianFan.app",
    description: "無料の文字数カウント・文字数カウンター。空白あり・空白なしの文字数、単語数、行数、段落数、UTF-8バイト数に加え、漢字・ひらがな・カタカナの内訳も確認できます。",
    eyebrow: "リアルタイム集計 · 日本語文字分析 · ブラウザー内処理",
    heading: "文字数カウント",
    lede: "文章を入力するだけで、空白あり・空白なしの文字数、単語数、行数、段落数、バイト数を自動集計。漢字・ひらがな・カタカナの割合や文字の使用頻度も確認できます。",
    toolTitle: "文章を入力して文字数をリアルタイム集計",
    inputTitle: "カウントする文章",
    inputPlaceholder: "ここに文章を入力または貼り付けてください...",
    sample: "サンプル",
    clear: "クリア",
    importFile: "ファイルを読み込む",
    importHint: "TXT・MD・CSV・JSON・DOCX、1ファイル10 MBまで",
    statsTitle: "文字数の集計結果",
    metrics: {
      characters: ["文字数（空白込み）", "スペース・改行を含む"],
      charactersNoWhitespace: ["文字数（空白なし）", "スペース・改行を除く"],
      words: ["単語数", "言語別の区切りで判定"],
      sentences: ["文の数", "文末を基準に判定"],
      paragraphs: ["段落数", "空行で区切る"],
      lines: ["行数", "空行を含む"],
      bytes: ["UTF-8バイト数", "文字コード上の容量"],
      uniqueCharacters: ["使用文字の種類", "空白を除く"]
    },
    targetLabel: "目標文字数",
    targetProgress: "空白なしの進捗",
    targetUnit: "文字",
    breakdownTitle: "文字種の内訳",
    breakdownIntro: "Unicodeの文字体系で判定し、共通する漢字は漢字として集計します。",
    categories: { han: "漢字", hiragana: "ひらがな", katakana: "カタカナ", hangul: "ハングル", latin: "英字", number: "数字", punctuationSymbol: "記号・句読点", other: "その他" },
    frequencyTitle: "文字の使用頻度",
    frequencyIntro: "よく使われている文字を上位12件まで表示します。",
    excludePunctuation: "記号・句読点を除く",
    frequencyEmpty: "文章を入力すると文字の使用頻度が表示されます。",
    privacyNote: "文章は現在のブラウザー内だけで集計します。DOCXを読み込む場合のみ公開の文書解析機能を取得しますが、ファイル自体は送信しません。",
    messages: {
      idle: "文章を入力してください",
      analyzing: "文字数を集計中",
      ready: "集計結果を更新しました",
      error: "集計できませんでした。ページを再読み込みしてください。",
      tooLong: "{limit}文字を超えています。分割して集計してください。",
      reading: "ファイルを読み込み中",
      unsupported: "TXT・MD・CSV・JSON・DOCXファイルを選択してください",
      fileTooLarge: "ファイルが{limit}を超えています",
      fileError: "このテキストファイルを読み込めませんでした",
      libraryError: "DOCX解析機能を読み込めません。再読み込みしてお試しください。"
    },
    seoKicker: "文字数カウンター・空白なし文字数",
    featureTitle: "日本語の文章を詳しく確認できる文字数カウンター",
    featureIntro: "文字数カウント、空白なし文字数、行数、バイト数をすぐに確認できます。原稿、レポート、志望動機、SNS投稿、フォーム入力など、文字数制限がある文章のチェックに便利です。",
    cards: [
      ["見た目どおりの文字数", "絵文字や結合文字をUnicodeの文字単位で扱い、画面上では1文字のものを不自然に分割しません。"],
      ["漢字・かなの割合", "漢字、ひらがな、カタカナ、英字、数字、記号を分けて、日本語文章の文字種を確認できます。"],
      ["目標文字数と使用頻度", "400字など任意の目標を設定し、進捗とよく使う文字を同時にチェックできます。"]
    ],
    howTitle: "文字数をカウントする方法",
    steps: ["文章を入力・貼り付けるか、TXTやDOCXなどのファイルを読み込みます。", "空白あり・空白なしの文字数、単語、文、段落、行、バイト数を確認します。", "必要に応じて文字種、使用頻度、目標文字数まで確認します。"],
    faqTitle: "文字数カウントのよくある質問",
    faqs: [
      ["空白ありと空白なしの違いは何ですか？", "空白ありはスペースや改行も1文字として含めます。空白なしはスペース、タブ、改行を除いた文字数です。応募フォームなどでは指定された数え方を確認してください。"],
      ["日本語の単語数はどのように数えますか？", "ブラウザーの言語別単語分割機能を使います。形態素解析とは異なるため、用途によって他サービスと結果が少し異なる場合があります。"],
      ["Wordファイルはアップロードされますか？", "アップロードされません。DOCXからの文字抽出はブラウザー内で行い、JianFan.appや外部の変換サーバーへ送りません。"],
      ["長い文章にも対応していますか？", "最大300万文字まで対応します。長文はバックグラウンドで集計し、それを超える場合は分割してご利用ください。"]
    ],
    related: "関連ツール",
    relatedAria: "関連する文字・文書ツール",
    footerText: "JianFan.app はブラウザー内で使える文字数カウント、中国語変換、文書テキストツールを提供します。",
    targetDefault: 400
  },
  ko: {
    title: "글자수 세기 - 공백 제외·바이트 계산기 | JianFan.app",
    description: "무료 글자수 세기와 글자수 계산기. 공백 포함·제외 글자수, 단어, 문장, 줄 수, UTF-8 바이트를 실시간 계산하고 한글·한자·영문 비율과 글자 빈도를 확인하세요.",
    eyebrow: "실시간 계산 · 한글·한자 분석 · 브라우저 로컬 처리",
    heading: "글자수 세기",
    lede: "텍스트를 입력하면 공백 포함·제외 글자수, 단어, 문장, 문단, 줄 수와 UTF-8 바이트를 바로 계산합니다. 한글·한자·영문 구성과 자주 쓴 글자도 확인할 수 있습니다.",
    toolTitle: "텍스트를 입력하고 글자수를 실시간으로 확인하세요",
    inputTitle: "계산할 텍스트",
    inputPlaceholder: "여기에 자기소개서, 원고 또는 확인할 텍스트를 입력하세요...",
    sample: "예시 불러오기",
    clear: "비우기",
    importFile: "파일 불러오기",
    importHint: "TXT, MD, CSV, JSON, DOCX 지원 · 파일당 10 MB 이하",
    statsTitle: "글자수 계산 결과",
    metrics: {
      characters: ["공백 포함", "띄어쓰기와 줄바꿈 포함"],
      charactersNoWhitespace: ["공백 제외", "띄어쓰기와 줄바꿈 제외"],
      words: ["단어 수", "언어별 단어 경계 사용"],
      sentences: ["문장 수", "문장 끝을 기준으로 계산"],
      paragraphs: ["문단 수", "빈 줄로 구분"],
      lines: ["줄 수", "빈 줄 포함"],
      bytes: ["UTF-8 바이트", "인코딩 기준 용량"],
      uniqueCharacters: ["사용한 글자 종류", "공백 제외"]
    },
    targetLabel: "목표 글자수",
    targetProgress: "공백 제외 기준",
    targetUnit: "자",
    breakdownTitle: "문자 구성",
    breakdownIntro: "유니코드 문자 체계로 구분하며 공통 한자는 한자로 계산합니다.",
    categories: { han: "한자", hiragana: "히라가나", katakana: "가타카나", hangul: "한글", latin: "영문", number: "숫자", punctuationSymbol: "문장부호·기호", other: "기타 문자" },
    frequencyTitle: "자주 쓴 글자",
    frequencyIntro: "공백을 제외하고 많이 사용한 글자 12개를 보여 줍니다.",
    excludePunctuation: "문장부호와 기호 제외",
    frequencyEmpty: "텍스트를 입력하면 글자별 사용 횟수가 표시됩니다.",
    privacyNote: "글자수 계산은 현재 브라우저에서 처리됩니다. DOCX를 불러올 때만 공개 문서 분석 기능을 가져오며 파일 내용은 업로드하지 않습니다.",
    messages: {
      idle: "텍스트를 입력하세요",
      analyzing: "글자수 계산 중",
      ready: "계산 결과를 업데이트했습니다",
      error: "계산하지 못했습니다. 페이지를 새로 고쳐 주세요.",
      tooLong: "{limit}자를 초과했습니다. 내용을 나눠서 계산해 주세요.",
      reading: "파일 읽는 중",
      unsupported: "TXT, MD, CSV, JSON 또는 DOCX 파일을 선택하세요",
      fileTooLarge: "파일이 {limit}를 초과했습니다",
      fileError: "이 텍스트 파일을 읽을 수 없습니다",
      libraryError: "DOCX 분석 기능을 불러오지 못했습니다. 새로 고친 후 다시 시도해 주세요."
    },
    seoKicker: "공백 제외 글자수·바이트 계산",
    featureTitle: "한글과 한자까지 구분하는 온라인 글자수 계산기",
    featureIntro: "글자수 세기, 공백 제외 글자수, 단어 수와 바이트 계산이 필요한 자기소개서, 이력서, 과제, 원고와 입력 폼에서 바로 사용할 수 있습니다.",
    cards: [
      ["화면에 보이는 글자 기준", "이모지 묶음과 결합 문자를 유니코드 글자 단위로 처리해 하나의 글자를 여러 개로 잘못 세지 않습니다."],
      ["한글·한자·영문 구분", "한글, 한자, 영문, 숫자, 일본어 가나와 문장부호를 나눠 다국어 텍스트 구성을 확인합니다."],
      ["목표 글자수와 사용 빈도", "자기소개서나 입력란의 목표 글자수를 설정하고 진행률과 반복해서 사용한 글자를 확인합니다."]
    ],
    howTitle: "온라인에서 글자수 세는 방법",
    steps: ["텍스트를 입력하거나 붙여 넣고, 필요하면 TXT나 DOCX 파일을 불러옵니다.", "공백 포함·제외 글자수, 단어, 문장, 문단, 줄 수와 UTF-8 바이트를 확인합니다.", "문자 구성, 자주 쓴 글자와 목표 글자수 진행률을 함께 점검합니다."],
    faqTitle: "글자수 세기 자주 묻는 질문",
    faqs: [
      ["공백 포함과 공백 제외는 어떻게 다른가요?", "공백 포함은 띄어쓰기, 탭과 줄바꿈도 글자수에 넣습니다. 공백 제외는 이 항목을 빼고 계산합니다. 지원서나 입력 폼이 요구하는 기준을 확인하세요."],
      ["바이트 수가 사이트마다 다른 이유는 무엇인가요?", "이 도구는 UTF-8 기준입니다. 채용 사이트나 공공기관 시스템이 EUC-KR 또는 자체 계산 규칙을 사용하면 결과가 다를 수 있습니다."],
      ["Word 파일이 서버로 전송되나요?", "아니요. DOCX 텍스트는 브라우저에서 추출하며 JianFan.app이나 외부 변환 서버로 전송하지 않습니다."],
      ["긴 글도 계산할 수 있나요?", "최대 300만 자까지 지원합니다. 긴 내용은 백그라운드에서 계산하며 제한을 넘으면 나눠서 사용해 주세요."]
    ],
    related: "관련 텍스트 도구",
    relatedAria: "관련 텍스트 및 문서 도구",
    footerText: "JianFan.app는 브라우저에서 실행되는 글자수 계산, 중국어 변환 및 문서 텍스트 도구를 제공합니다.",
    targetDefault: 1000
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "在线字数统计"], ["word-to-txt", "Word 转 TXT"], ["file-text-converter", "文件文本简繁转换"], ["chinese-to-pinyin", "汉字转拼音"], ["chinese-stroke-order", "汉字笔顺查询"], ["simplified-to-traditional", "简体转繁体"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["japanese-characters", "日文字符复制"]],
  "zh-TW": [[slug, "線上字數統計"], ["word-to-txt", "DOCX 轉 TXT"], ["file-text-converter", "文件文字簡繁轉換"], ["chinese-to-pinyin", "漢字轉拼音"], ["chinese-stroke-order", "漢字筆順查詢"], ["simplified-to-traditional", "簡體轉繁體"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["japanese-characters", "日文字元複製"]],
  en: [[slug, "CJK character counter"], ["word-to-txt", "Word to text"], ["file-text-converter", "Document Chinese converter"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["chinese-stroke-order", "Chinese stroke order"], ["simplified-to-traditional", "Simplified to Traditional"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["japanese-characters", "Japanese character copy"]],
  ja: [[slug, "文字数カウント"], ["word-to-txt", "Word TXT 変換"], ["file-text-converter", "文書の中国語簡繁変換"], ["japanese-characters", "日本語文字コピー"], ["japanese-kanji-converter", "旧字体 新字体 変換"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["chinese-stroke-order", "中国語漢字の筆順"], ["japanese-chinese-kanji-converter", "日中漢字3種類変換"]],
  ko: [[slug, "글자수 세기"], ["word-to-txt", "DOCX TXT 변환"], ["file-text-converter", "문서 중국어 변환"], ["japanese-characters", "일본어 문자 복사"], ["chinese-to-pinyin", "중국어 병음 변환"], ["chinese-stroke-order", "중국어 한자 필순"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["simplified-to-traditional", "간체를 번체로"]]
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
    <script defer src="/character-counter.js"></script>
    <script defer src="/webmcp.js"></script>
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
  const metrics = Object.entries(page.metrics)
    .map(([key, [label, note]]) => `              <article class="counter-metric"><span>${label}</span><strong data-counter-metric="${key}">0</strong><small>${note}</small></article>`)
    .join("\n");
  const categories = Object.entries(page.categories)
    .map(([key, label]) => `              <li data-counter-category="${key}"><span class="counter-category-name">${label}</span><span class="counter-category-bar" aria-hidden="true"><span></span></span><strong>0</strong><small>0%</small></li>`)
    .join("\n");

  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, page)}
  </head>
  <body data-tool-page="character-counter" data-page-slug="${slug}" data-locale="${locale}"${messages}>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">字</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${localeOptions}
          </select></label></nav></header>
    <main id="main">
      <section class="tool-hero counter-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="counter-hero-readout" aria-hidden="true"><span><b>字</b>1,024</span><span><b>A</b>512</span><span><b>8</b>KB</span></div></section>
      <section class="standalone-tool character-counter-tool" aria-labelledby="counterToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">COUNT / SCRIPT / FREQUENCY</p><h2 id="counterToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="counterStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.idle}</span></div></div>
        <div class="counter-workspace">
          <section class="counter-input-panel" aria-labelledby="counterInputTitle">
            <div class="panel-topline"><h3 id="counterInputTitle">${page.inputTitle}</h3><span id="counterInputCount">0 / 3,000,000</span></div>
            <textarea id="counterInput" spellcheck="false" placeholder="${escapeHtml(page.inputPlaceholder)}"></textarea>
            <div class="counter-input-actions">
              <div><button class="text-button" id="counterSample" type="button" data-sample="${escapeHtml(sampleText)}">${page.sample}</button><button class="text-button" id="counterClear" type="button">${page.clear}</button></div>
              <label class="counter-file-action" id="counterFileLabel" for="counterFileInput"><span>${page.importFile}</span><input id="counterFileInput" type="file" accept=".txt,.md,.csv,.json,.docx,text/plain,text/markdown,text/csv,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
            </div>
            <div class="counter-file-meta"><span>${page.importHint}</span><strong id="counterFileName"></strong></div>
          </section>
          <section class="counter-summary-panel" aria-labelledby="counterStatsTitle">
            <div class="panel-topline"><h3 id="counterStatsTitle">${page.statsTitle}</h3><span>UNICODE</span></div>
            <div class="counter-metric-grid">
${metrics}
            </div>
            <div class="counter-target">
              <label for="counterTarget"><span>${page.targetLabel}</span><input id="counterTarget" type="number" min="1" max="3000000" step="100" value="${page.targetDefault}" /></label>
              <div><span>${page.targetProgress}</span><strong><span id="counterTargetValue">${page.targetDefault}</span> ${page.targetUnit} · <span id="counterTargetPercent">0%</span></strong></div>
              <span class="counter-target-track"><span id="counterTargetBar"></span></span>
            </div>
          </section>
        </div>
        <div class="counter-detail-grid">
          <section class="counter-breakdown-panel" aria-labelledby="counterBreakdownTitle"><div class="counter-detail-head"><div><p class="section-kicker">SCRIPT</p><h3 id="counterBreakdownTitle">${page.breakdownTitle}</h3></div><p>${page.breakdownIntro}</p></div><ul class="counter-category-list">
${categories}
            </ul></section>
          <section class="counter-frequency-panel" aria-labelledby="counterFrequencyTitle"><div class="counter-detail-head"><div><p class="section-kicker">FREQUENCY</p><h3 id="counterFrequencyTitle">${page.frequencyTitle}</h3></div><p>${page.frequencyIntro}</p></div><label class="counter-frequency-toggle"><input id="counterExcludePunctuation" type="checkbox" checked /><span>${page.excludePunctuation}</span></label><p class="counter-frequency-empty" id="counterFrequencyEmpty">${page.frequencyEmpty}</p><ol class="counter-frequency-list" id="counterFrequency"></ol></section>
        </div>
        <p class="counter-privacy-note">${page.privacyNote}</p>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="counterFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.seoKicker}</p><h2 id="counterFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">
${page.cards.map(([title, text]) => `          <article><h3>${title}</h3><p>${text}</p></article>`).join("\n")}
        </div><section class="word-howto" aria-labelledby="counterHowTitle"><h2 id="counterHowTitle">${page.howTitle}</h2><ol>
${page.steps.map((step) => `          <li>${step}</li>`).join("\n")}
        </ol></section><section class="pinyin-faq" aria-labelledby="counterFaqTitle"><h2 id="counterFaqTitle">${page.faqTitle}</h2>
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

console.log("Generated 5 multilingual character-counter pages.");
