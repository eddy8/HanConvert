import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "han-character-worksheet";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "田字格字帖生成器 - 汉字练习纸在线打印 | JianFan.app",
    description: "免费田字格字帖生成器和汉字练习纸制作工具，支持米字格、描红、拼音、笔顺、A4 打印与保存 PDF，输入汉字即可在线生成字帖。",
    eyebrow: "田字格 · 米字格 · 描红 · 笔顺",
    heading: "田字格字帖与汉字练习纸生成器",
    lede: "输入要练习的汉字，自动排版见字、描红和空白书写格。可调整格子、行列、拼音与笔顺，直接打印或在浏览器中保存为 PDF。",
    toolTitle: "输入汉字并实时制作可打印练习纸",
    inputLabel: "练习内容",
    inputPlaceholder: "输入汉字、词语或课文片段，最多提取 40 个汉字",
    sample: "加载示例",
    clear: "清空",
    titleLabel: "练习纸标题",
    titlePlaceholder: "汉字书写练习",
    defaultTitle: "汉字书写练习",
    settingsTitle: "版式设置",
    paperSize: "纸张",
    gridStyle: "格子类型",
    gridOptions: [["tian", "田字格"], ["mi", "米字格"], ["square", "方格"]],
    columns: "每行格数",
    rows: "每字练习行数",
    traceCells: "描红格数",
    traceOpacity: "描红深浅",
    showPinyin: "显示拼音",
    showStrokeOrder: "显示笔顺示范",
    dedupe: "自动去除重复汉字",
    previewTitle: "打印预览",
    print: "打印 / 保存 PDF",
    privacy: "练习内容只在当前浏览器中排版。开启笔顺示范时，会远程按需获取对应汉字的公开笔顺数据。",
    nameLabel: "姓名：",
    dateLabel: "日期：",
    sampleText: "永字八法 汉字书写 学习中文",
    messages: {
      idle: "等待输入汉字",
      loadingStrokes: "正在加载公开笔顺数据",
      ready: "已生成 {count} 个汉字的练习纸",
      readyWithoutStrokes: "练习纸已生成，部分字没有笔顺数据",
      invalid: "请先输入至少一个汉字",
      empty: "输入汉字后，这里会实时生成练习纸预览。",
      strokeLoading: "正在加载笔顺",
      strokeMissing: "暂无笔顺数据",
      strokeCount: "{count} 画",
      strokeOrderLabel: "“{character}”的笔顺示范"
    },
    seoKicker: "在线字帖生成器",
    featureTitle: "从汉字输入到 A4 练习纸，一页完成",
    featureIntro: "面向家长、教师、小学生和中文学习者的在线字帖生成器。无需注册和上传文件，可快速生成田字格字帖、米字格描红纸和带笔顺的汉字练习纸。",
    cards: [
      ["见字、描红、独立书写", "每个汉字先显示清晰范字，再安排可调深浅的描红格和空白格，适合逐步练习字形结构。"],
      ["田字格、米字格与方格", "按练习阶段选择中心线、对角辅助线或纯方格，并调整每行格数和每字练习行数。"],
      ["上下文拼音与笔顺示范", "拼音会结合输入词句判断多音字；只输入一个汉字时列出全部读音。还可利用公开字形数据生成逐笔累积示范。"]
    ],
    howTitle: "如何在线生成田字格字帖",
    steps: ["输入需要练习的汉字、词语或课文片段。", "选择田字格或米字格，并调整行列、描红、拼音和笔顺。", "检查白色纸张预览，点击“打印 / 保存 PDF”完成输出。"],
    faqTitle: "汉字练习纸常见问题",
    faqs: [
      ["可以把练习纸保存成 PDF 吗？", "可以。点击打印按钮后，在浏览器打印窗口中选择“另存为 PDF”或系统提供的 PDF 打印机。"],
      ["简体字和繁体字都支持吗？", "支持输入常见简体字和繁体字。最终范字字形还会受到当前系统中文字体的影响。"],
      ["多音字的拼音如何处理？", "输入词语或句子时会根据上下文标注拼音；只输入一个汉字时会列出该字的全部读音。同一字在不同语境中读音不同时，去重模式会合并显示检测到的读音。"],
      ["笔顺示范会上传输入内容吗？", "不会上传整段内容。开启笔顺后，页面只会按每个汉字远程请求公开的笔顺字形数据。"],
      ["为什么不同地区的笔顺可能不一样？", "中国大陆、台湾、香港、日本和韩国的部分字形与笔顺规范不同。页面笔顺用于学习参考，学校作业应遵循当地教材。"]
    ],
    related: "相关汉字工具",
    relatedAria: "相关汉字与文字工具",
    footerText: "JianFan.app 提供浏览器本地运行的汉字学习、中文转换和文字处理工具。"
  },
  "zh-TW": {
    title: "國字練習紙產生器 - 田字格描紅與列印 | JianFan.app",
    description: "免費國字練習紙與田字格字帖產生器，支援米字格、描紅、漢語拼音、筆順、A4 列印及儲存 PDF，輸入國字即可製作練習簿。",
    eyebrow: "國字練習 · 田字格 · 描紅 · 筆順",
    heading: "國字練習紙與田字格產生器",
    lede: "輸入要練習的國字，自動排出範字、描紅與空白書寫格。可調整格線、行列、拼音和筆順，直接列印或儲存為 PDF。",
    toolTitle: "輸入國字，即時製作可列印練習紙",
    inputLabel: "練習內容",
    inputPlaceholder: "輸入國字、詞語或課文片段，最多擷取 40 個漢字",
    sample: "載入範例",
    clear: "清除",
    titleLabel: "練習紙標題",
    titlePlaceholder: "國字書寫練習",
    defaultTitle: "國字書寫練習",
    settingsTitle: "版面設定",
    paperSize: "紙張",
    gridStyle: "格線類型",
    gridOptions: [["tian", "田字格"], ["mi", "米字格"], ["square", "方格"]],
    columns: "每行格數",
    rows: "每字練習行數",
    traceCells: "描紅格數",
    traceOpacity: "描紅深淺",
    showPinyin: "顯示漢語拼音",
    showStrokeOrder: "顯示筆順示範",
    dedupe: "自動移除重複國字",
    previewTitle: "列印預覽",
    print: "列印 / 儲存 PDF",
    privacy: "練習內容只在目前的瀏覽器中排版。開啟筆順示範時，會從遠端按需取得對應漢字的公開筆順資料。",
    nameLabel: "姓名：",
    dateLabel: "日期：",
    sampleText: "永字八法 國字書寫 學習中文",
    messages: {
      idle: "等待輸入國字",
      loadingStrokes: "正在載入公開筆順資料",
      ready: "已產生 {count} 個國字的練習紙",
      readyWithoutStrokes: "練習紙已產生，部分字沒有筆順資料",
      invalid: "請先輸入至少一個國字",
      empty: "輸入國字後，這裡會即時產生練習紙預覽。",
      strokeLoading: "正在載入筆順",
      strokeMissing: "暫無筆順資料",
      strokeCount: "{count} 畫",
      strokeOrderLabel: "「{character}」的筆順示範"
    },
    seoKicker: "國字練習簿線上製作",
    featureTitle: "自訂國字描紅、田字格與列印練習紙",
    featureIntro: "適合家長、教師、國小學生及華語學習者製作國字練習紙。免註冊、免上傳文件，可直接建立田字格、米字格、描紅與空白練習。",
    cards: [
      ["範字、描紅與自己寫", "先看清楚範字，再沿著淡色字描寫，最後在空白格獨立完成，循序練習字形。"],
      ["田字格、米字格與方格", "依年齡和練習目標選擇輔助線，並調整每行格數與每個國字的練習行數。"],
      ["依上下文標示拼音", "拼音會依輸入詞句判斷多音字；只輸入一個漢字時列出全部讀音。筆順示範則可依需要開啟。"]
    ],
    howTitle: "如何製作國字練習紙",
    steps: ["輸入要練習的國字、詞語或課文內容。", "選擇格線並調整描紅、拼音、筆順和練習行數。", "確認白色紙張預覽後列印，或從列印視窗儲存 PDF。"],
    faqTitle: "國字練習紙常見問題",
    faqs: [
      ["可以儲存為 PDF 嗎？", "可以。按下列印後，在瀏覽器列印視窗選擇儲存為 PDF。"],
      ["繁體字和簡體字都能使用嗎？", "可以輸入常見繁體字與簡體字，范字顯示會依目前裝置可用的中文字型而異。"],
      ["多音字的拼音如何處理？", "輸入詞語或句子時會依上下文標示拼音；只輸入一個漢字時會列出全部讀音。同一字在不同語境中有不同讀音時，去重模式會合併顯示。"],
      ["內容會傳到伺服器嗎？", "練習內容不會上傳。只有開啟筆順時，才會依單一漢字遠端取得公開筆順資料。"],
      ["筆順是否完全符合台灣標準？", "不一定。不同地區可能採用不同字形和筆順，本頁資料供參考，學校作業請依台灣教材。"]
    ],
    related: "相關漢字工具",
    relatedAria: "相關漢字與文字工具",
    footerText: "JianFan.app 提供在瀏覽器本機執行的漢字學習、中文轉換與文字處理工具。"
  },
  en: {
    title: "Chinese Character Worksheet Generator - Printable Hanzi Practice | JianFan.app",
    description: "Free Chinese character worksheet generator for printable Hanzi writing practice. Create Tian Zi Ge or Mi Zi Ge sheets with tracing, Pinyin, stroke order, A4 or Letter PDF printing.",
    eyebrow: "TIAN ZI GE · TRACING · PINYIN · STROKE ORDER",
    heading: "Chinese Character Worksheet Generator",
    lede: "Type Chinese characters and build a printable writing practice sheet with model characters, tracing guides and blank grids. Adjust the layout, then print or save it as a PDF.",
    toolTitle: "Build a printable Hanzi practice sheet",
    inputLabel: "Characters to practise",
    inputPlaceholder: "Enter characters, words or a short passage; up to 40 Hanzi",
    sample: "Load sample",
    clear: "Clear",
    titleLabel: "Worksheet title",
    titlePlaceholder: "Chinese writing practice",
    defaultTitle: "Chinese writing practice",
    settingsTitle: "Worksheet settings",
    paperSize: "Paper",
    gridStyle: "Writing grid",
    gridOptions: [["tian", "Tian Zi Ge"], ["mi", "Mi Zi Ge"], ["square", "Plain squares"]],
    columns: "Boxes per row",
    rows: "Rows per character",
    traceCells: "Trace boxes",
    traceOpacity: "Trace darkness",
    showPinyin: "Show Pinyin",
    showStrokeOrder: "Show stroke-order guide",
    dedupe: "Remove duplicate characters",
    previewTitle: "Print preview",
    print: "Print / Save PDF",
    privacy: "Worksheet text is laid out in this browser. If stroke order is enabled, public data for each character is requested remotely on demand.",
    nameLabel: "Name:",
    dateLabel: "Date:",
    sampleText: "你好中文 汉字学习 永字八法",
    messages: {
      idle: "Waiting for Chinese characters",
      loadingStrokes: "Loading public stroke-order data",
      ready: "Worksheet ready for {count} characters",
      readyWithoutStrokes: "Worksheet ready; stroke data is unavailable for some characters",
      invalid: "Enter at least one Chinese character first",
      empty: "Your printable worksheet preview will appear here.",
      strokeLoading: "Loading stroke order",
      strokeMissing: "Stroke data unavailable",
      strokeCount: "{count} strokes",
      strokeOrderLabel: "Stroke-order guide for {character}"
    },
    seoKicker: "Printable Chinese writing practice",
    featureTitle: "Make a Chinese writing practice sheet in one workspace",
    featureIntro: "A free Chinese character worksheet generator for learners, families and teachers. Create Tian Zi Ge or Mi Zi Ge practice paper without signing up, uploading text or installing an app.",
    cards: [
      ["Model, trace, then write", "Start with a clear model character, trace adjustable faded copies, and finish with blank boxes for writing from memory."],
      ["Tian Zi Ge and Mi Zi Ge grids", "Choose centre guides, diagonal guides or plain squares, then set the number of boxes and practice rows."],
      ["Context-aware Pinyin", "Pinyin uses the surrounding word or sentence to resolve polyphonic characters. For a single Hanzi, all dictionary readings are shown; stroke-order guides remain optional."]
    ],
    howTitle: "How to create a Chinese character worksheet",
    steps: ["Enter the Hanzi, vocabulary or short passage you want to practise.", "Choose a grid and adjust tracing, Pinyin, stroke order, rows and columns.", "Review the white paper preview, then print it or save it as a PDF."],
    faqTitle: "Chinese worksheet generator questions",
    faqs: [
      ["Can I download the worksheet as a PDF?", "Yes. Select Print / Save PDF, then choose Save as PDF in your browser's print dialog."],
      ["Does it support Simplified and Traditional Chinese?", "Yes. You can enter common Simplified and Traditional characters. The exact printed glyph also depends on fonts available on your device."],
      ["How are polyphonic characters handled?", "Words and sentences use contextual Pinyin. If you enter one Hanzi by itself, all dictionary readings are shown. When grouped duplicates have different contextual readings, the worksheet displays each detected reading."],
      ["Is my worksheet text uploaded?", "No. Layout happens locally. When stroke order is enabled, only individual character-data requests are made to a public remote source."],
      ["Why might stroke order differ from my textbook?", "Some character forms and conventions differ across Mainland China, Taiwan, Hong Kong, Japan and Korea. Use your local curriculum for formal study."]
    ],
    related: "Related Chinese tools",
    relatedAria: "Related Chinese character and text tools",
    footerText: "JianFan.app provides browser-local Chinese learning, conversion and text tools."
  },
  ja: {
    title: "漢字練習プリント作成 - なぞり書き・マス目を無料印刷 | JianFan.app",
    description: "漢字練習プリントを無料作成。見本、なぞり書き、空欄マス、読み、筆順を組み合わせ、A4・Letter 用紙で印刷または PDF 保存できます。",
    eyebrow: "漢字練習 · なぞり書き · マス目 · 印刷",
    heading: "漢字練習プリント作成",
    lede: "練習したい漢字を入力すると、見本・なぞり書き・空欄を並べたプリントを自動作成。マス目や練習回数を調整し、そのまま印刷できます。",
    toolTitle: "漢字を入力して練習プリントを作成",
    inputLabel: "練習する漢字",
    inputPlaceholder: "漢字・熟語・短い文章を入力（最大40字を抽出）",
    sample: "サンプル",
    clear: "クリア",
    titleLabel: "プリントのタイトル",
    titlePlaceholder: "漢字の書き取り練習",
    defaultTitle: "漢字の書き取り練習",
    settingsTitle: "レイアウト設定",
    paperSize: "用紙",
    gridStyle: "マス目",
    gridOptions: [["tian", "十字ガイド"], ["mi", "対角線ガイド"], ["square", "通常マス"]],
    columns: "1行のマス数",
    rows: "1字の練習行数",
    traceCells: "なぞり書きマス",
    traceOpacity: "見本の濃さ",
    showPinyin: "ピンインを表示",
    showStrokeOrder: "筆順見本を表示",
    dedupe: "同じ漢字をまとめる",
    previewTitle: "印刷プレビュー",
    print: "印刷 / PDF 保存",
    privacy: "入力内容はこのブラウザー内だけで処理します。筆順見本を有効にした場合のみ、公開されている字形データを文字ごとに取得します。",
    nameLabel: "名前：",
    dateLabel: "日付：",
    sampleText: "漢字練習 学校生活 春夏秋冬",
    messages: {
      idle: "漢字の入力待ち",
      loadingStrokes: "公開筆順データを読み込み中",
      ready: "{count}字の練習プリントを作成しました",
      readyWithoutStrokes: "プリントを作成しました。一部の字に筆順データがありません",
      invalid: "漢字を1字以上入力してください",
      empty: "漢字を入力すると、印刷用プリントがここに表示されます。",
      strokeLoading: "筆順を読み込み中",
      strokeMissing: "筆順データなし",
      strokeCount: "{count}画",
      strokeOrderLabel: "「{character}」の筆順見本"
    },
    seoKicker: "漢字練習プリントを無料作成",
    featureTitle: "見本・なぞり書き・自力書きを1枚に",
    featureIntro: "家庭学習や授業準備に使える漢字練習プリント作成ツールです。登録不要で、入力した漢字だけのマス目プリントをすぐ印刷できます。",
    cards: [
      ["なぞってから自分で書く", "濃い見本、薄いなぞり書き、空欄マスの順に配置し、字形を確認しながら反復練習できます。"],
      ["マス目と練習量を調整", "十字・対角線・通常マスを選び、学年や用途に合わせて1行のマス数と練習行数を変更できます。"],
      ["文脈に応じたピンイン", "語句や文では文脈から多音字の中国語ピンインを判定し、漢字1字だけの場合は候補の読みをすべて表示します。筆順見本も任意で追加できます。"]
    ],
    howTitle: "漢字練習プリントの作り方",
    steps: ["練習したい漢字、熟語、短い文章を入力します。", "マス目、なぞり書き、練習行数、読み、筆順を設定します。", "白い用紙プレビューを確認し、印刷または PDF 保存します。"],
    faqTitle: "漢字練習プリントのよくある質問",
    faqs: [
      ["PDFで保存できますか？", "はい。印刷ボタンを押し、ブラウザーの印刷画面で「PDFに保存」を選択してください。"],
      ["小学生の漢字練習に使えますか？", "入力した漢字だけでプリントを作れるため、宿題や間違えた漢字の復習に使えます。字形は端末のフォントにも左右されます。"],
      ["多音字のピンインはどう表示されますか？", "熟語や文では中国語の文脈に応じたピンインを表示します。漢字を1字だけ入力した場合は、辞書にある読みをすべて表示します。"],
      ["入力した内容は送信されますか？", "本文は送信されません。筆順を表示するときだけ、1文字ごとの公開字形データをリモートから取得します。"],
      ["筆順は日本の学校基準ですか？", "筆順見本は中国語字形データを使用します。日本語の正式な書き順学習では、学校の教科書や学習指導資料を確認してください。"]
    ],
    related: "関連する漢字ツール",
    relatedAria: "関連する漢字・文字ツール",
    footerText: "JianFan.app はブラウザー内で動作する漢字学習・中国語変換・文字ツールを提供します。"
  },
  ko: {
    title: "한자 쓰기 연습장 만들기 - 따라쓰기 학습지 인쇄 | JianFan.app",
    description: "무료 한자 쓰기 연습장과 따라쓰기 학습지를 만드세요. 본보기, 흐린 글자, 빈칸, 병음, 필순을 설정하고 A4로 인쇄하거나 PDF로 저장할 수 있습니다.",
    eyebrow: "한자 쓰기 · 따라쓰기 · 격자 · 인쇄",
    heading: "한자 쓰기 연습장 만들기",
    lede: "연습할 한자를 입력하면 본보기, 따라쓰기와 빈칸을 한 장에 자동 배치합니다. 격자와 연습량을 조절한 뒤 바로 인쇄하세요.",
    toolTitle: "한자를 입력해 쓰기 연습지 만들기",
    inputLabel: "연습할 한자",
    inputPlaceholder: "한자, 단어 또는 짧은 글 입력 (최대 40자 추출)",
    sample: "예시 불러오기",
    clear: "지우기",
    titleLabel: "학습지 제목",
    titlePlaceholder: "한자 쓰기 연습",
    defaultTitle: "한자 쓰기 연습",
    settingsTitle: "학습지 설정",
    paperSize: "용지",
    gridStyle: "격자 모양",
    gridOptions: [["tian", "십자 격자"], ["mi", "대각선 격자"], ["square", "기본 네모칸"]],
    columns: "한 줄 칸 수",
    rows: "한자별 연습 줄",
    traceCells: "따라쓰기 칸",
    traceOpacity: "따라쓰기 진하기",
    showPinyin: "병음 표시",
    showStrokeOrder: "필순 보기 표시",
    dedupe: "중복 한자 제거",
    previewTitle: "인쇄 미리보기",
    print: "인쇄 / PDF 저장",
    privacy: "입력 내용은 이 브라우저에서만 배치합니다. 필순 보기를 켠 경우에만 한자별 공개 필순 데이터를 원격으로 불러옵니다.",
    nameLabel: "이름:",
    dateLabel: "날짜:",
    sampleText: "天地人 한자 쓰기 연습 학교 생활",
    messages: {
      idle: "한자 입력 대기",
      loadingStrokes: "공개 필순 데이터 불러오는 중",
      ready: "{count}자 한자 연습지를 만들었습니다",
      readyWithoutStrokes: "연습지를 만들었습니다. 일부 한자는 필순 데이터가 없습니다",
      invalid: "한자를 한 글자 이상 입력하세요",
      empty: "한자를 입력하면 인쇄용 연습지 미리보기가 표시됩니다.",
      strokeLoading: "필순 불러오는 중",
      strokeMissing: "필순 데이터 없음",
      strokeCount: "총 {count}획",
      strokeOrderLabel: "{character} 필순 보기"
    },
    seoKicker: "한자 따라쓰기 학습지",
    featureTitle: "본보기부터 따라쓰기와 빈칸 연습까지",
    featureIntro: "학생, 학부모와 교사를 위한 무료 한자 쓰기 연습장 만들기 도구입니다. 회원가입 없이 원하는 한자만 넣은 따라쓰기 학습지를 바로 인쇄할 수 있습니다.",
    cards: [
      ["보고, 따라 쓰고, 혼자 쓰기", "선명한 본보기 다음에 흐린 따라쓰기와 빈칸을 배치해 한자 모양을 단계적으로 익힐 수 있습니다."],
      ["격자와 연습량 조절", "십자선, 대각선 또는 기본 네모칸을 고르고 한 줄의 칸 수와 한자별 연습 줄을 설정합니다."],
      ["문맥을 반영한 병음", "단어나 문장에서는 문맥으로 다음자 발음을 판단하고, 한 글자만 입력하면 사전에 있는 발음을 모두 표시합니다. 필순 그림도 선택해 추가할 수 있습니다."]
    ],
    howTitle: "한자 쓰기 연습지 만드는 방법",
    steps: ["연습할 한자, 단어 또는 짧은 글을 입력합니다.", "격자, 따라쓰기, 연습 줄, 병음과 필순 표시를 조절합니다.", "흰색 용지 미리보기를 확인하고 인쇄하거나 PDF로 저장합니다."],
    faqTitle: "한자 쓰기 연습장 자주 묻는 질문",
    faqs: [
      ["PDF로 저장할 수 있나요?", "네. 인쇄 버튼을 누른 뒤 브라우저 인쇄 창에서 PDF 저장을 선택하세요."],
      ["한국 한자 공부에도 사용할 수 있나요?", "원하는 한자를 직접 입력해 따라쓰기와 빈칸 학습지를 만들 수 있습니다. 표시 자형은 기기의 글꼴에도 영향을 받습니다."],
      ["여러 음이 있는 한자의 병음은 어떻게 표시되나요?", "단어나 문장에서는 중국어 문맥에 맞는 병음을 표시합니다. 한 글자만 입력하면 사전에 등록된 발음을 모두 보여 줍니다."],
      ["입력한 내용이 서버로 전송되나요?", "본문은 전송되지 않습니다. 필순을 켰을 때만 글자별 공개 필순 데이터를 원격으로 요청합니다."],
      ["필순이 한국 교재와 다를 수 있나요?", "그럴 수 있습니다. 공개 필순 자료는 중국어 자형을 기반으로 하므로 국내 정규 학습에서는 학교 교재를 우선하세요."]
    ],
    related: "관련 한자 도구",
    relatedAria: "관련 한자 및 텍스트 도구",
    footerText: "JianFan.app는 브라우저에서 실행되는 한자 학습, 중국어 변환 및 텍스트 도구를 제공합니다."
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "汉字练习纸"], ["chinese-stroke-order", "汉字笔顺查询"], ["chinese-to-pinyin", "汉字转拼音"], ["character-counter", "在线字数统计"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["japanese-characters", "日文字符复制"], ["simplified-to-traditional", "简体转繁体"], ["traditional-to-simplified", "繁体转简体"], ["word-to-txt", "Word 转 TXT"]],
  "zh-TW": [[slug, "國字練習紙"], ["chinese-stroke-order", "漢字筆順查詢"], ["chinese-to-pinyin", "漢字轉拼音"], ["character-counter", "線上字數統計"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["japanese-characters", "日文字元複製"], ["simplified-to-traditional", "簡體轉繁體"], ["traditional-to-simplified", "繁體轉簡體"], ["word-to-txt", "DOCX 轉 TXT"]],
  en: [[slug, "Chinese worksheet generator"], ["chinese-stroke-order", "Chinese stroke order"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["character-counter", "CJK character counter"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["japanese-characters", "Japanese character copy"], ["simplified-to-traditional", "Simplified to Traditional"], ["traditional-to-simplified", "Traditional to Simplified"], ["word-to-txt", "Word to text"]],
  ja: [[slug, "漢字練習プリント"], ["chinese-stroke-order", "中国語漢字の筆順"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["character-counter", "文字数カウント"], ["japanese-chinese-kanji-converter", "日本語漢字・簡体字・繁体字変換"], ["japanese-characters", "日本語文字コピー"], ["japanese-kanji-converter", "旧字体 新字体 変換"], ["word-to-txt", "Word TXT 変換"]],
  ko: [[slug, "한자 쓰기 연습장"], ["chinese-stroke-order", "중국어 한자 필순"], ["chinese-to-pinyin", "중국어 병음 변환"], ["character-counter", "글자수 세기"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["japanese-characters", "일본어 문자 복사"], ["simplified-to-traditional", "간체를 번체로"], ["word-to-txt", "DOCX TXT 변환"]]
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
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and printing support",
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
    <script defer src="https://cdn.jsdmirror.cn/npm/hanzi-writer/dist/hanzi-writer.min.js"></script>
    <script defer src="/vendor/pinyin-pro.js"></script>
    <script defer src="/han-character-worksheet.js"></script>
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
  const gridOptions = page.gridOptions
    .map(([value, label]) => `                    <option value="${value}">${label}</option>`)
    .join("\n");

  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, page)}
  </head>
  <body data-tool-page="han-character-worksheet" data-page-slug="${slug}" data-locale="${locale}" data-sample-text="${escapeHtml(page.sampleText)}" data-default-worksheet-title="${escapeHtml(page.defaultTitle)}" data-name-label="${escapeHtml(page.nameLabel)}" data-date-label="${escapeHtml(page.dateLabel)}"${messages}>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}">
      <a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">字</span><span>JianFan.app</span></a>
      <nav class="top-actions" aria-label="${meta.nav}">
        <a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a>
        <label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${localeOptions}
          </select></label>
      </nav>
    </header>
    <main id="main">
      <section class="tool-hero worksheet-tool-hero" aria-labelledby="pageTitle">
        <div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div>
        <div class="worksheet-hero-sheet" aria-hidden="true"><span>永</span><i></i><i></i><i></i><b>PDF</b></div>
      </section>

      <section class="standalone-tool worksheet-tool" aria-labelledby="worksheetToolTitle">
        <div class="standalone-tool-head">
          <div><p class="section-kicker">WRITE / TRACE / PRINT</p><h2 id="worksheetToolTitle">${page.toolTitle}</h2></div>
          <div class="status-pill" id="worksheetStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.idle}</span></div>
        </div>
        <div class="worksheet-builder">
          <form class="worksheet-controls" id="worksheetControls">
            <div class="worksheet-input-head"><label for="worksheetInput">${page.inputLabel}</label><output id="worksheetCharacterCount">0 / 40</output></div>
            <textarea id="worksheetInput" maxlength="1000" spellcheck="false" placeholder="${escapeHtml(page.inputPlaceholder)}"></textarea>
            <div class="worksheet-input-actions"><button id="worksheetSample" type="button">${page.sample}</button><button id="worksheetClear" type="button">${page.clear}</button></div>
            <label class="worksheet-field" for="worksheetTitle"><span>${page.titleLabel}</span><input id="worksheetTitle" type="text" maxlength="60" placeholder="${escapeHtml(page.titlePlaceholder)}" /></label>
            <fieldset class="worksheet-settings"><legend>${page.settingsTitle}</legend>
              <div class="worksheet-setting-grid">
                <label class="worksheet-field" for="worksheetPaperSize"><span>${page.paperSize}</span><select id="worksheetPaperSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
                <label class="worksheet-field" for="worksheetGridStyle"><span>${page.gridStyle}</span><select id="worksheetGridStyle">
${gridOptions}
                </select></label>
              </div>
              <label class="worksheet-range" for="worksheetColumns"><span>${page.columns}</span><output id="worksheetColumnsValue">10</output><input id="worksheetColumns" type="range" min="6" max="12" value="10" /></label>
              <label class="worksheet-range" for="worksheetRows"><span>${page.rows}</span><output id="worksheetRowsValue">2</output><input id="worksheetRows" type="range" min="1" max="3" value="2" /></label>
              <label class="worksheet-range" for="worksheetTraceCells"><span>${page.traceCells}</span><output id="worksheetTraceCellsValue">3</output><input id="worksheetTraceCells" type="range" min="0" max="9" value="3" /></label>
              <label class="worksheet-range" for="worksheetTraceOpacity"><span>${page.traceOpacity}</span><output id="worksheetTraceOpacityValue">20%</output><input id="worksheetTraceOpacity" type="range" min="8" max="50" value="20" /></label>
              <div class="worksheet-switches">
                <label><input id="worksheetShowPinyin" type="checkbox" checked /><span>${page.showPinyin}</span></label>
                <label><input id="worksheetShowStrokeOrder" type="checkbox" checked /><span>${page.showStrokeOrder}</span></label>
                <label><input id="worksheetDedupe" type="checkbox" checked /><span>${page.dedupe}</span></label>
              </div>
            </fieldset>
            <p class="worksheet-privacy">${page.privacy}</p>
          </form>
          <section class="worksheet-preview-panel" aria-labelledby="worksheetPreviewTitle">
            <div class="worksheet-preview-head"><div><span>LIVE PAPER</span><h3 id="worksheetPreviewTitle">${page.previewTitle}</h3></div><button class="primary-action" id="worksheetPrint" type="button">${page.print}</button></div>
            <div class="worksheet-preview-viewport" id="worksheetPreview"></div>
          </section>
        </div>
      </section>

      <section class="seo-band standalone-info" aria-labelledby="worksheetFeatureTitle">
        <div class="section-heading"><p class="section-kicker">${page.seoKicker}</p><h2 id="worksheetFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div>
        <div class="seo-grid">
${page.cards.map(([title, text]) => `          <article><h3>${title}</h3><p>${text}</p></article>`).join("\n")}
        </div>
        <section class="word-howto" aria-labelledby="worksheetHowTitle"><h2 id="worksheetHowTitle">${page.howTitle}</h2><ol>
${page.steps.map((step) => `            <li>${step}</li>`).join("\n")}
          </ol></section>
        <section class="pinyin-faq" aria-labelledby="worksheetFaqTitle"><h2 id="worksheetFaqTitle">${page.faqTitle}</h2>
${page.faqs.map(([question, answer]) => `          <details><summary>${question}</summary><p>${answer}</p></details>`).join("\n")}
        </section>
        <p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">
${related}
        </nav>
      </section>
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

console.log("Generated 5 multilingual Han character worksheet pages.");
