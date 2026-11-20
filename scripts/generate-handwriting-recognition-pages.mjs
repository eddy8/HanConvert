import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preserveToolLinks } from "./static-tool-links.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "chinese-handwriting-recognition";
const sampleCharacters = ["人", "大", "木", "中"];

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "手写汉字识别 - 在线手写查字与汉字输入工具 | JianFan.app",
    description: "免费在线手写查字与汉字识别工具，逐笔写出不会读的简繁汉字，即时查看候选字、拼音、部首和笔顺，还能连续手写输入整段文字，默认在浏览器本地识别。",
    alternateNames: ["在线手写查字", "汉字手写输入", "汉字手写查询"],
    eyebrow: "手写识别 · 候选汉字 · 拼音笔顺",
    heading: "手写汉字识别与在线查字",
    lede: "不知道一个汉字怎么读、也无法输入时，照着字形在田字格中写出来。系统会即时给出相似候选字，选中后可查看拼音、部首、结构和笔顺；把字逐个加入输入框，还能连续手写输入一段文字。",
    toolTitle: "在田字格中手写一个汉字",
    drawTitle: "手写输入",
    strokeCount: "已写 {count} 笔",
    undo: "撤销上一笔",
    clear: "清空重写",
    samples: "试用示例",
    drawHint: "请尽量写大、写在中央，并按常见笔顺逐笔书写。",
    candidateTitle: "识别候选字",
    candidateHint: "每完成一笔都会自动更新，点击最接近的汉字继续查询。",
    candidateEmpty: "写下第一笔后，候选汉字会显示在这里。",
    remoteHint: "识别结果有误？",
    remoteAction: "试试远程识别",
    resultTitle: "查字结果",
    pinyin: "拼音",
    strokes: "笔画数",
    unicode: "Unicode",
    copy: "复制汉字",
    append: "加入输入框",
    composeLabel: "已输入的文字",
    composePlaceholder: "选中候选后点“加入输入框”，可连续手写输入",
    textCopy: "复制",
    textClear: "清空",
    textReading: "拼音",
    radical: "部首",
    structure: "结构",
    structureLabels: {"single": "独体字", "leftRight": "左右结构", "topBottom": "上下结构", "leftMiddleRight": "左中右结构", "topMiddleBottom": "上中下结构", "surround": "全包围结构", "surroundFromAbove": "上三包围结构", "surroundFromBelow": "下三包围结构", "surroundFromLeft": "左三包围结构", "surroundFromUpperLeft": "左上包围结构", "surroundFromUpperRight": "右上包围结构", "surroundFromLowerLeft": "左下包围结构"},
    strokeLink: "查看笔顺",
    pinyinLink: "查询拼音",
    structureLink: "查看结构",
    messages: {
      loading: "正在加载手写识别组件",
      ready: "可以开始手写汉字",
      recognizing: "正在匹配候选汉字",
      matched: "已找到 {count} 个候选汉字",
      noMatch: "暂未找到候选字，请撤销或重新书写",
      remoteRecognizing: "正在进行远程识别",
      remoteNoMatch: "远程识别未找到更合适的候选字",
      remoteError: "远程识别失败，请检查网络后重试",
      error: "手写识别组件加载失败，请检查网络后刷新",
      copied: "已复制所选汉字",
      copyFailed: "自动复制失败，请直接选择汉字复制",
      strokeCount: "已写 {count} 笔",
      appended: "已加入输入框：{character}",
      copiedText: "已复制输入框中的文字",
      candidateLabel: "选择候选汉字“{character}”"
    },
    seoKicker: "在线手写查字",
    featureTitle: "不会读也不会输入，直接手写识别汉字",
    featureIntro: "手写汉字识别适合查询书籍、图片或生活中遇到的陌生字。无需先知道拼音或部首，用鼠标、触控板、触屏或手写笔描出字形即可查字。",
    cards: [
      ["边写边显示候选字", "每完成一笔自动更新匹配结果，最多显示 10 个相似汉字，选错时可以撤销上一笔。"],
      ["候选字信息直接可用", "选中汉字后显示全部常见拼音、部首、字形结构、笔画数和 Unicode，并可复制或继续查看动态笔顺。"],
      ["浏览器本地识别", "笔画坐标不会上传到 JianFan.app 服务器，公开的 WebAssembly 识别组件在浏览器中完成匹配。"]
    ],
    howTitle: "如何在线手写查字",
    steps: ["用鼠标、触屏或手写笔在田字格中央逐笔写下汉字。", "从自动更新的候选结果中选择最接近的字。", "查看拼音、部首和结构，或进入笔顺页面继续查询。", "要输入多个字时，点击“加入输入框”逐字拼接，输入框下方会显示整段拼音，最后一次复制整段文字。"],
    faqTitle: "手写汉字识别常见问题",
    faqs: [
      ["不认识的字怎么查拼音？", "手写这个字并点击最接近的候选，页面会显示拼音、部首、字形结构、总笔画数和 Unicode，还可以继续查看笔顺。"],
      ["可以当手写输入法用吗？", "可以。每写好一个字，选中候选后点击“加入输入框”，画板会自动清空，接着写下一个字；全部写完后点击输入框旁的“复制”，一次复制整段文字。输入框下方会按词语显示整段拼音，例如“银行”读作 yín háng。本页一次识别一个字，不识别连笔写成的整句。"],
      ["候选里没有要找的字怎么办？", "把字写大、让笔画分开后重试；仍然找不到时，可用“汉字查询与结构拆解”按偏旁部件反查。照片或截图里的印刷文字，用“在线拍照汉字识别”更省事。"],
      ["手机和平板能用吗？", "可以。直接用手指或触控笔在方格中书写即可，不需要安装应用或注册。"],
      ["不按正确笔顺也能识别吗？", "识别会参考笔画方向、位置和数量。少量笔顺偏差可能仍能找到候选，但按常见笔顺、把字写大并保持结构清楚通常更准确。"],
      ["支持简体字和繁体字吗？", "支持 9,000 多个常见简体字与繁体字。极少数生僻字、异体字或日本特有字形可能没有结果。"],
      ["这是拍照识字或手写文字 OCR 吗？", "不是。本页用于一次手写并识别一个汉字，不处理照片，也不识别连续手写句子。"],
      ["我的手写内容会上传吗？", "不会。笔画匹配在浏览器中运行，页面只会远程加载公开的识别组件和所选汉字的笔顺数据。"]
    ],
    related: "相关汉字工具",
    relatedAria: "相关汉字与文字工具",
    footerText: "JianFan.app 提供浏览器中运行的汉字识别、拼音、笔顺与中文转换工具。"
  },
  "zh-TW": {
    title: "手寫漢字辨識 - 線上手寫查字、注音與國字輸入 | JianFan.app",
    description: "免費線上手寫查字與漢字辨識工具，寫出不會讀的國字即可查看候選字、注音、拼音、部首與筆順，還能連續手寫輸入整段文字，預設在瀏覽器本機辨識。",
    alternateNames: ["線上手寫查字", "手寫國字辨識", "漢字手寫輸入"],
    eyebrow: "手寫辨識 · 候選漢字 · 拼音筆順",
    heading: "手寫漢字辨識與線上查字",
    lede: "遇到不知道讀音、也無法輸入的國字時，直接照著字形寫在田字格中。系統會即時列出相似候選字，選取後可查看注音、拼音、部首與筆順；把字逐一加入輸入框，還能連續手寫輸入一段文字。",
    toolTitle: "在田字格中手寫一個漢字",
    drawTitle: "手寫輸入",
    strokeCount: "已寫 {count} 畫",
    undo: "復原上一畫",
    clear: "清除重寫",
    samples: "試用範例",
    drawHint: "請盡量寫大、置中，並依一般筆順逐畫書寫。",
    candidateTitle: "辨識候選字",
    candidateHint: "每完成一畫就會自動更新，點選最接近的漢字繼續查詢。",
    candidateEmpty: "寫下第一畫後，候選漢字會顯示在這裡。",
    remoteHint: "辨識結果不理想？",
    remoteAction: "試試遠端辨識",
    resultTitle: "查字結果",
    pinyin: "漢語拼音",
    strokes: "筆畫數",
    unicode: "Unicode",
    copy: "複製漢字",
    append: "加入輸入框",
    composeLabel: "已輸入的文字",
    composePlaceholder: "選取候選後點「加入輸入框」，可連續手寫輸入",
    textCopy: "複製",
    textClear: "清除",
    textReading: "注音／拼音",
    zhuyin: "注音",
    radical: "部首",
    structure: "結構",
    structureLabels: {"single": "獨體字", "leftRight": "左右結構", "topBottom": "上下結構", "leftMiddleRight": "左中右結構", "topMiddleBottom": "上中下結構", "surround": "全包圍結構", "surroundFromAbove": "上三包圍結構", "surroundFromBelow": "下三包圍結構", "surroundFromLeft": "左三包圍結構", "surroundFromUpperLeft": "左上包圍結構", "surroundFromUpperRight": "右上包圍結構", "surroundFromLowerLeft": "左下包圍結構"},
    strokeLink: "查看筆順",
    pinyinLink: "查詢拼音",
    structureLink: "查看結構",
    messages: {
      loading: "正在載入手寫辨識元件",
      ready: "可以開始手寫漢字",
      recognizing: "正在比對候選漢字",
      matched: "已找到 {count} 個候選漢字",
      noMatch: "暫時找不到候選字，請復原或重新書寫",
      remoteRecognizing: "正在進行遠端辨識",
      remoteNoMatch: "遠端辨識未找到更合適的候選字",
      remoteError: "遠端辨識失敗，請檢查網路後再試一次",
      error: "手寫辨識元件載入失敗，請檢查網路後重新整理",
      copied: "已複製所選漢字",
      copyFailed: "自動複製失敗，請直接選取漢字複製",
      strokeCount: "已寫 {count} 畫",
      appended: "已加入輸入框：{character}",
      copiedText: "已複製輸入框中的文字",
      candidateLabel: "選取候選漢字「{character}」"
    },
    seoKicker: "線上手寫查字",
    featureTitle: "不知道讀音也能直接手寫辨識國字",
    featureIntro: "手寫漢字辨識適合查詢書籍、圖片或生活中遇到的陌生國字。不必先知道讀音或部首，用滑鼠、觸控板、觸控螢幕或手寫筆描出字形即可查字。",
    cards: [
      ["邊寫邊顯示候選字", "每完成一畫就自動更新結果，最多顯示 10 個相似漢字，寫錯時可復原上一畫。"],
      ["候選字資料直接查看", "選取漢字後顯示注音、拼音、部首、字形結構、筆畫數和 Unicode，並可複製或繼續查看動態筆順。"],
      ["在瀏覽器本機辨識", "筆畫座標不會上傳到 JianFan.app 伺服器，公開 WebAssembly 元件會在瀏覽器中完成比對。"]
    ],
    howTitle: "如何線上手寫查字",
    steps: ["用滑鼠、觸控螢幕或手寫筆在田字格中央逐畫寫下漢字。", "從自動更新的候選結果中選取最接近的字。", "查看注音、拼音與部首，或前往筆順頁面繼續查詢。", "要輸入多個字時，點選「加入輸入框」逐字拼接，輸入框下方會顯示整段注音與拼音，最後一次複製整段文字。"],
    faqTitle: "手寫漢字辨識常見問題",
    faqs: [
      ["不認識的字怎麼查注音和拼音？", "手寫這個字並點選最接近的候選，頁面會顯示注音、拼音、部首、總筆畫數和 Unicode，還能繼續查看筆順和字形結構。"],
      ["手寫查字可以顯示注音嗎？", "可以。選取候選字後，查字結果會同時顯示注音符號與漢語拼音，破音字會列出所有常見讀音，例如「行」顯示 ㄒㄧㄥˊ / ㄏㄤˊ。"],
      ["可以當手寫輸入法用嗎？", "可以。每寫好一個字，選取候選後點選「加入輸入框」，畫布會自動清除，接著寫下一個字；全部寫完後點選輸入框旁的「複製」，一次複製整段文字。輸入框下方會依詞語顯示整段注音與拼音，例如「銀行」顯示 ㄧㄣˊ ㄏㄤˊ。本頁一次辨識一個字，不辨識連筆寫成的整句。"],
      ["候選裡沒有要找的字怎麼辦？", "把字寫大、讓筆畫分開後再試；仍然找不到時，可用「漢字查詢與結構拆解」依偏旁部件反查。照片或截圖中的印刷文字，用「線上拍照漢字辨識」更方便。"],
      ["手機和平板可以用嗎？", "可以。直接用手指或觸控筆在方格中書寫即可，不需要安裝 App 或註冊。"],
      ["不依正確筆順也能辨識嗎？", "辨識會參考筆畫方向、位置和數量。少量筆順差異可能仍有候選，但依一般筆順、寫大並保持結構清楚通常更準確。"],
      ["支援繁體字和簡體字嗎？", "支援 9,000 多個常見繁體字與簡體字，少數罕用字、異體字或日本特有字形可能沒有結果。"],
      ["這是拍照辨識或手寫文字 OCR 嗎？", "不是。本頁一次辨識一個手寫漢字，不處理照片，也不辨識連續手寫句子。"],
      ["手寫內容會上傳嗎？", "不會。筆畫比對在瀏覽器中執行，只會從遠端載入公開辨識元件及所選漢字的筆順資料。"]
    ],
    related: "相關漢字工具",
    relatedAria: "相關漢字與文字工具",
    footerText: "JianFan.app 提供在瀏覽器中執行的漢字辨識、拼音、筆順與中文轉換工具。"
  },
  en: {
    title: "Chinese Handwriting Recognition - Draw and Look Up Hanzi | JianFan.app",
    description: "Draw a Chinese character with a mouse, finger, or pen to find matching Hanzi with meaning, Pinyin, radical, and stroke order, or keep writing to type a phrase.",
    alternateNames: ["Chinese Handwriting Input", "Draw Chinese Character", "Chinese Character Lookup by Drawing", "Find Chinese Character by Drawing", "Search Chinese Characters by Drawing", "Draw Hanzi Online"],
    eyebrow: "DRAW HANZI · RECOGNIZE · LOOK UP",
    heading: "Chinese Handwriting Recognition",
    lede: "Cannot pronounce or type a Chinese character? Draw its shape in the writing grid to get likely Hanzi matches, then check its meaning, Pinyin, radical and stroke order. Add each match to the text box to write a whole phrase.",
    toolTitle: "Draw one Chinese character in the grid",
    drawTitle: "Handwriting input",
    strokeCount: "{count} strokes drawn",
    undo: "Undo last stroke",
    clear: "Clear drawing",
    samples: "Try a sample",
    drawHint: "Write large and near the centre. Following the usual stroke order improves recognition.",
    candidateTitle: "Character matches",
    candidateHint: "Matches update after every stroke. Select the character that best fits your drawing.",
    candidateEmpty: "Draw the first stroke to see likely Chinese characters.",
    remoteHint: "Results not right?",
    remoteAction: "Try remote recognition",
    resultTitle: "Character details",
    pinyin: "Pinyin",
    strokes: "Stroke count",
    unicode: "Unicode",
    copy: "Copy character",
    append: "Add to text",
    composeLabel: "Your text",
    composePlaceholder: "Select a candidate, then Add to text to write a phrase",
    textCopy: "Copy",
    textClear: "Clear",
    textReading: "Pinyin",
    meaning: "Meaning",
    radical: "Radical",
    structure: "Structure",
    structureLabels: {"single": "single component", "leftRight": "left–right", "topBottom": "top–bottom", "leftMiddleRight": "left–middle–right", "topMiddleBottom": "top–middle–bottom", "surround": "full enclosure", "surroundFromAbove": "enclosed from above", "surroundFromBelow": "enclosed from below", "surroundFromLeft": "enclosed from the left", "surroundFromUpperLeft": "enclosed from the upper left", "surroundFromUpperRight": "enclosed from the upper right", "surroundFromLowerLeft": "enclosed from the lower left"},
    strokeLink: "View stroke order",
    pinyinLink: "Check Pinyin",
    structureLink: "View structure",
    messages: {
      loading: "Loading handwriting recognition",
      ready: "Ready for Chinese handwriting input",
      recognizing: "Finding matching Chinese characters",
      matched: "Found {count} possible characters",
      noMatch: "No match yet. Undo a stroke or try drawing again",
      remoteRecognizing: "Checking with remote recognition",
      remoteNoMatch: "Remote recognition found no better matches",
      remoteError: "Remote recognition failed. Check your connection and try again",
      error: "Recognition could not load. Check your connection and refresh",
      copied: "Selected character copied",
      copyFailed: "Automatic copy failed. Select and copy the character directly",
      strokeCount: "{count} strokes drawn",
      appended: "Added to text: {character}",
      copiedText: "Text copied",
      candidateLabel: "Select candidate character {character}"
    },
    seoKicker: "Chinese handwriting input online",
    featureTitle: "Find a Chinese character by drawing it online",
    featureIntro: "Use this Chinese handwriting recognition tool when you know what a Hanzi looks like but not its Pinyin or how to type it. Draw the Chinese character with a mouse, trackpad, touchscreen or pen, then choose from the closest matches.",
    cards: [
      ["Live character candidates", "The list refreshes after each completed stroke and shows up to ten likely Hanzi. Undo the last stroke whenever the shape goes wrong."],
      ["Useful character details", "Choose a match to see its English meaning, common Pinyin readings, radical, structure, stroke count and Unicode, then copy it or open the animated stroke-order lookup."],
      ["Recognition runs in your browser", "Stroke coordinates are not uploaded to JianFan.app. A public WebAssembly component performs the matching on your device."]
    ],
    howTitle: "How to use Chinese handwriting input",
    steps: ["Draw one Chinese character in the centre of the grid, one stroke at a time.", "Choose the closest Hanzi from the automatically updated matches.", "Check its meaning and Pinyin, or continue to the animated stroke-order page.", "To type several characters, choose Add to text after each one; the Pinyin of the phrase appears below the text box, and you can copy it all at once."],
    faqTitle: "Chinese handwriting recognition questions",
    faqs: [
      ["How do I find the Pinyin of a character I cannot read?", "Draw the character and select the closest candidate. The result shows its English meaning, Pinyin, radical, structure, total strokes and Unicode, with a link to stroke order."],
      ["Can I see what a Chinese character means?", "Yes. Select a candidate and the result shows a short English meaning from the Unicode Unihan database, together with Pinyin, radical, structure and stroke count. For example, 好 shows “good, excellent, fine; well”."],
      ["Can I use it as a handwriting input method?", "Yes. After each character, select the candidate and choose Add to text; the pad clears for the next character. When you finish, choose Copy next to the text box to copy the whole phrase. The Pinyin of the whole phrase, read word by word, appears below the text box, for example 银行 reads yín háng. The page recognizes one character per drawing, not joined-up sentences."],
      ["What if the character I want is not among the candidates?", "Redraw it larger with clearly separated strokes. If it still does not appear, search by its components in Chinese character lookup. For printed text in a photo or screenshot, “Chinese character recognition from photo” is faster."],
      ["Does it work on phones and tablets?", "Yes. Draw with your finger or a stylus directly in the square. No app installation or sign-up is needed."],
      ["How can I find a Chinese character if I do not know its Pinyin?", "Draw the character shape in the writing grid and select the closest result. You can then check its Pinyin, stroke count, Unicode and stroke order without knowing its pronunciation first."],
      ["Can I draw a Chinese character with a mouse or finger?", "Yes. The writing grid works with a mouse, trackpad, touchscreen or digital pen on desktop, tablet and mobile browsers."],
      ["Does stroke order affect recognition?", "The matcher uses stroke direction, position and count. Small stroke-order differences may still work, but a large, clear character written in the usual order normally produces better matches."],
      ["Does it recognize Simplified and Traditional Chinese?", "It covers more than 9,000 common Simplified and Traditional characters. A few rare variants or Japanese-only forms may be unavailable."],
      ["Can it recognize a photo or a handwritten sentence?", "No. This tool recognizes one character drawn on the writing pad. It is not photo OCR or continuous handwriting recognition."],
      ["Is my handwriting uploaded?", "No. Matching runs in the browser. Only the public recognition files and stroke-order data for a selected character are requested remotely."]
    ],
    related: "Related Chinese tools",
    relatedAria: "Related Chinese character and text tools",
    footerText: "JianFan.app provides browser-based Chinese handwriting, Pinyin, stroke-order and text-conversion tools."
  },
  ja: {
    title: "漢字手書き検索 - 手書き入力で漢字を調べる | JianFan.app",
    description: "読み方が分からない中国語漢字をマウスや指、ペンで一画ずつ書いて検索。簡体字・繁体字の候補、ピンイン、画数、筆順を確認でき、手書き認識はブラウザー内で動作します。",
    alternateNames: ["漢字手書き検索", "手書き漢字認識", "漢字を手書きで検索"],
    eyebrow: "手書き入力 · 漢字候補 · 読み方と筆順",
    heading: "漢字手書き検索",
    lede: "読み方が分からず入力できない漢字を、見たままマスに書いて検索できます。候補から文字を選ぶと、中国語のピンイン、画数、Unicode、筆順を確認できます。候補を入力欄に追加すれば、続けて手書き入力することもできます。",
    toolTitle: "マスの中に漢字を1文字書いてください",
    drawTitle: "手書き入力",
    strokeCount: "{count}画入力",
    undo: "1画戻す",
    clear: "すべて消す",
    samples: "サンプル",
    drawHint: "中央に大きく、一般的な筆順で1画ずつはっきり書くと認識しやすくなります。",
    candidateTitle: "漢字の候補",
    candidateHint: "1画書くごとに候補が更新されます。最も近い漢字を選んでください。",
    candidateEmpty: "最初の1画を書くと、漢字候補がここに表示されます。",
    remoteHint: "候補が合いませんか？",
    remoteAction: "オンライン認識を試す",
    resultTitle: "漢字情報",
    pinyin: "中国語ピンイン",
    strokes: "画数",
    unicode: "Unicode",
    copy: "漢字をコピー",
    append: "入力欄に追加",
    composeLabel: "入力した文字",
    composePlaceholder: "候補を選んで「入力欄に追加」で続けて入力",
    textCopy: "コピー",
    textClear: "クリア",
    textReading: "ピンイン",
    radical: "部首",
    structure: "構成",
    structureLabels: {"single": "単体", "leftRight": "左右", "topBottom": "上下", "leftMiddleRight": "左中右", "topMiddleBottom": "上中下", "surround": "囲み", "surroundFromAbove": "上からの囲み", "surroundFromBelow": "下からの囲み", "surroundFromLeft": "左からの囲み", "surroundFromUpperLeft": "左上からの囲み", "surroundFromUpperRight": "右上からの囲み", "surroundFromLowerLeft": "左下からの囲み"},
    strokeLink: "筆順を見る",
    pinyinLink: "ピンインを調べる",
    structureLink: "構成を見る",
    messages: {
      loading: "手書き認識を読み込み中",
      ready: "漢字を手書きできます",
      recognizing: "似ている漢字を検索中",
      matched: "候補を {count} 文字見つけました",
      noMatch: "候補が見つかりません。1画戻すか、書き直してください",
      remoteRecognizing: "オンライン認識で検索中",
      remoteNoMatch: "オンライン認識でも適切な候補が見つかりませんでした",
      remoteError: "オンライン認識に失敗しました。通信を確認してもう一度お試しください",
      error: "手書き認識を読み込めません。通信を確認して再読み込みしてください",
      copied: "選択した漢字をコピーしました",
      copyFailed: "自動コピーに失敗しました。漢字を選択してコピーしてください",
      strokeCount: "{count}画入力",
      appended: "入力欄に追加しました：{character}",
      copiedText: "入力欄の文字をコピーしました",
      candidateLabel: "候補の「{character}」を選択"
    },
    seoKicker: "漢字を手書きで検索",
    featureTitle: "読めない漢字を手書き入力して調べる",
    featureIntro: "漢字手書き検索は、本や画像で見つけた読み方の分からない漢字を調べるときに便利です。マウス、トラックパッド、タッチ画面、ペンで字形を書くだけで候補を表示します。",
    cards: [
      ["書きながら候補を更新", "1画ごとに最大10文字の候補を表示します。書き間違えた場合は直前の1画だけを戻せます。"],
      ["読み方・画数・筆順へ", "候補を選ぶと中国語のピンイン、部首、構成、画数、Unicodeを表示し、そのままコピーまたは筆順検索できます。"],
      ["ブラウザー内で認識", "筆画の座標は JianFan.app のサーバーへ送信されず、公開 WebAssembly コンポーネントが端末内で照合します。"]
    ],
    howTitle: "漢字を手書きで検索する方法",
    steps: ["マウスやタッチ操作で、マスの中央に漢字を1画ずつ書きます。", "自動更新される候補から最も近い漢字を選びます。", "中国語のピンインや画数を確認し、必要に応じて筆順を開きます。", "複数の字を入力するときは、「入力欄に追加」で1字ずつつなげ、最後にまとめてコピーします。"],
    faqTitle: "漢字手書き検索のよくある質問",
    faqs: [
      ["読めない中国語の漢字のピンインを調べるには？", "漢字を手書きして一番近い候補を選ぶと、ピンイン・総画数・Unicodeが表示され、書き順や字形構成も続けて確認できます。"],
      ["手書き入力の代わりに使えますか？", "使えます。1文字書くごとに候補を選んで「入力欄に追加」を押すと、手書きパッドが消えて次の字を書けます。書き終えたら入力欄の「コピー」でまとめてコピーできます。入力欄の下には全体のピンインが単語単位で表示されます（例：银行は yín háng）。1回に認識するのは1文字で、続け字の文章は認識しません。"],
      ["候補に目的の字が出てこないときは？", "大きく書き、画を離して書き直してください。それでも出ない場合は「漢字の構成・部首検索」で部品から探せます。写真やスクリーンショットの印刷文字なら「写真から中国語漢字を認識」が便利です。"],
      ["スマホやタブレットでも使えますか？", "使えます。指やタッチペンでマスにそのまま書けます。アプリのインストールや登録は不要です。"],
      ["正しい筆順で書く必要がありますか？", "筆画の方向・位置・数を照合するため、一般的な筆順で大きくはっきり書くと精度が上がります。多少の違いでも候補が出る場合があります。"],
      ["日本語の漢字も検索できますか？", "中国語の簡体字・繁体字を中心に9,000字以上を収録しています。共通する漢字は検索できますが、日本独自の字体や一部の異体字は未収録の場合があります。"],
      ["写真や手書き文章を認識できますか？", "できません。手書きパッドに書いた漢字1文字を検索する機能で、写真OCRや文章の連続認識には対応していません。"],
      ["手書きデータは送信されますか？", "送信されません。照合はブラウザー内で行い、公開認識ファイルと選択した文字の筆順データだけをリモートから取得します。"]
    ],
    related: "関連する漢字ツール",
    relatedAria: "関連する漢字・文字ツール",
    footerText: "JianFan.app はブラウザーで使える漢字手書き検索、中国語ピンイン、筆順、文字変換ツールを提供します。"
  },
  ko: {
    title: "한자 필기 인식 - 온라인 손글씨 한자 찾기 | JianFan.app",
    description: "무료 한자 필기인식으로 모르는 중국어 한자를 써서 찾으세요. 간체·번체 후보와 병음, 획수, 필순을 확인하며 인식은 브라우저에서 처리됩니다.",
    alternateNames: ["한자 필기 인식", "손글씨 한자 찾기", "한자 그려서 찾기"],
    eyebrow: "손글씨 입력 · 한자 후보 · 병음과 필순",
    heading: "한자 필기 인식·손글씨 한자 찾기",
    lede: "읽는 법을 몰라 입력하기 어려운 한자를 보이는 모양대로 칸 안에 써 보세요. 비슷한 후보를 고르면 중국어 병음, 획수, Unicode와 필순을 확인할 수 있습니다.고른 글자를 입력란에 추가하면 여러 글자를 이어서 입력할 수 있습니다.",
    toolTitle: "격자 안에 한자를 한 글자 써 보세요",
    drawTitle: "손글씨 입력",
    strokeCount: "{count}획 입력",
    undo: "한 획 되돌리기",
    clear: "모두 지우기",
    samples: "예시",
    drawHint: "글자를 중앙에 크게 쓰고 일반적인 필순에 따라 한 획씩 또렷하게 입력하세요.",
    candidateTitle: "인식 후보 한자",
    candidateHint: "한 획을 마칠 때마다 후보가 바뀝니다. 가장 비슷한 한자를 선택하세요.",
    candidateEmpty: "첫 획을 쓰면 한자 후보가 여기에 표시됩니다.",
    remoteHint: "인식 결과가 정확하지 않나요?",
    remoteAction: "온라인 인식 시도",
    resultTitle: "한자 정보",
    pinyin: "중국어 병음",
    strokes: "총 획수",
    unicode: "Unicode",
    copy: "한자 복사",
    append: "입력란에 추가",
    composeLabel: "입력한 글자",
    composePlaceholder: "후보를 고른 뒤 ‘입력란에 추가’로 이어서 입력",
    textCopy: "복사",
    textClear: "지우기",
    textReading: "병음",
    radical: "부수",
    structure: "구조",
    structureLabels: {"single": "독체자", "leftRight": "좌우 구조", "topBottom": "상하 구조", "leftMiddleRight": "좌중우 구조", "topMiddleBottom": "상중하 구조", "surround": "에운 구조", "surroundFromAbove": "위 감싸기", "surroundFromBelow": "아래 감싸기", "surroundFromLeft": "왼쪽 감싸기", "surroundFromUpperLeft": "왼쪽 위 감싸기", "surroundFromUpperRight": "오른쪽 위 감싸기", "surroundFromLowerLeft": "왼쪽 아래 감싸기"},
    strokeLink: "필순 보기",
    pinyinLink: "병음 조회",
    structureLink: "구조 보기",
    messages: {
      loading: "필기 인식 기능 불러오는 중",
      ready: "한자 손글씨를 입력할 수 있습니다",
      recognizing: "비슷한 한자 찾는 중",
      matched: "후보 한자 {count}개를 찾았습니다",
      noMatch: "후보를 찾지 못했습니다. 한 획을 되돌리거나 다시 써 주세요",
      remoteRecognizing: "온라인 인식으로 찾는 중",
      remoteNoMatch: "온라인 인식에서도 더 적합한 후보를 찾지 못했습니다",
      remoteError: "온라인 인식에 실패했습니다. 네트워크를 확인한 후 다시 시도하세요",
      error: "필기 인식 기능을 불러오지 못했습니다. 네트워크 확인 후 새로 고침하세요",
      copied: "선택한 한자를 복사했습니다",
      copyFailed: "자동 복사에 실패했습니다. 한자를 직접 선택해 복사하세요",
      strokeCount: "{count}획 입력",
      appended: "입력란에 추가했습니다: {character}",
      copiedText: "입력한 글자를 복사했습니다",
      candidateLabel: "후보 한자 {character} 선택"
    },
    seoKicker: "손글씨 한자 찾기",
    featureTitle: "읽기 어려운 한자를 직접 그려서 찾기",
    featureIntro: "한자 필기 인식은 책이나 이미지에서 본 낯선 한자의 음을 모를 때 유용합니다. 마우스, 트랙패드, 터치스크린 또는 펜으로 글자 모양을 쓰면 가까운 후보를 보여 줍니다.",
    cards: [
      ["필획마다 후보 갱신", "한 획을 마칠 때마다 최대 10개의 비슷한 한자를 표시하며 잘못 쓴 경우 마지막 한 획만 되돌릴 수 있습니다."],
      ["병음·획수·필순 조회", "후보를 선택하면 중국어 병음, 부수, 구조, 획수와 Unicode를 확인하고 복사하거나 필순 페이지로 이동할 수 있습니다."],
      ["브라우저에서 로컬 인식", "필획 좌표는 JianFan.app 서버로 전송되지 않으며 공개 WebAssembly 구성 요소가 기기에서 직접 비교합니다."]
    ],
    howTitle: "손글씨로 한자 찾는 방법",
    steps: ["마우스나 터치로 격자 중앙에 한자를 한 획씩 씁니다.", "자동으로 바뀌는 후보 중 가장 가까운 한자를 선택합니다.", "중국어 병음과 획수를 확인하거나 필순 페이지를 엽니다.", "여러 글자를 입력할 때는 ‘입력란에 추가’로 한 글자씩 이어 붙인 뒤 한꺼번에 복사합니다."],
    faqTitle: "한자 필기 인식 자주 묻는 질문",
    faqs: [
      ["모르는 중국 한자의 병음은 어떻게 찾나요?", "한자를 손으로 쓰고 가장 비슷한 후보를 고르면 병음, 총 획수, Unicode가 표시되고 필순과 글자 구조도 이어서 볼 수 있습니다."],
      ["손글씨 입력기처럼 쓸 수 있나요?", "네. 글자를 쓸 때마다 후보를 고르고 ‘입력란에 추가’를 누르면 입력판이 지워져 다음 글자를 쓸 수 있습니다. 다 쓴 뒤 입력란의 ‘복사’를 누르면 한꺼번에 복사됩니다. 입력란 아래에는 전체 병음이 단어 단위로 표시됩니다(예: 银行은 yín háng). 한 번에 한 글자씩 인식하며 이어 쓴 문장은 인식하지 않습니다."],
      ["원하는 글자가 후보에 없으면 어떻게 하나요?", "글자를 크게, 획을 떼어 다시 써 보세요. 그래도 없으면 ‘한자 부수·구성요소 검색’에서 구성요소로 찾을 수 있습니다. 사진이나 스크린샷 속 인쇄 글자는 ‘사진으로 중국 한자 인식’이 더 편합니다."],
      ["스마트폰이나 태블릿에서도 쓸 수 있나요?", "네. 손가락이나 터치펜으로 칸에 바로 쓰면 됩니다. 앱 설치나 가입은 필요 없습니다."],
      ["정확한 필순으로 써야 하나요?", "인식기는 필획 방향, 위치와 개수를 참고합니다. 조금 달라도 후보가 나올 수 있지만 일반적인 필순으로 크고 또렷하게 쓰면 더 정확합니다."],
      ["한국에서 쓰는 한자도 찾을 수 있나요?", "중국어 간체와 번체를 중심으로 9,000자 이상을 지원합니다. 공통 한자는 검색할 수 있지만 한국·일본 고유 자형이나 일부 이체자는 없을 수 있습니다."],
      ["사진이나 손글씨 문장도 인식하나요?", "아니요. 이 도구는 입력판에 쓴 한자 한 글자를 찾으며 사진 OCR이나 연속 문장 인식은 지원하지 않습니다."],
      ["손글씨 데이터가 전송되나요?", "전송되지 않습니다. 후보 비교는 브라우저에서 실행되고 공개 인식 파일과 선택한 글자의 필순 데이터만 원격으로 요청합니다."]
    ],
    related: "관련 한자 도구",
    relatedAria: "관련 한자 및 텍스트 도구",
    footerText: "JianFan.app는 브라우저에서 실행되는 한자 필기 인식, 중국어 병음, 필순 및 텍스트 변환 도구를 제공합니다."
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "手写汉字识别"], ["photo-chinese-character-recognition", "在线拍照汉字识别"], ["chinese-character-lookup", "汉字查询与结构拆解"], ["chinese-stroke-order", "汉字笔顺查询"], ["chinese-to-pinyin", "汉字转拼音"], ["han-character-worksheet", "汉字练习纸"], ["character-counter", "在线字数统计"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["kanji-to-romaji", "日文汉字转罗马字"], ["japanese-characters", "日文字符复制"], ["word-to-txt", "Word 转 TXT"]],
  "zh-TW": [[slug, "手寫漢字辨識"], ["photo-chinese-character-recognition", "線上拍照漢字辨識"], ["chinese-character-lookup", "漢字查詢與結構拆解"], ["chinese-stroke-order", "漢字筆順查詢"], ["chinese-to-pinyin", "漢字轉拼音"], ["han-character-worksheet", "國字練習紙"], ["character-counter", "線上字數統計"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["kanji-to-romaji", "日文漢字轉羅馬字"], ["japanese-characters", "日文字元複製"], ["word-to-txt", "DOCX 轉 TXT"]],
  en: [[slug, "Chinese handwriting recognition"], ["photo-chinese-character-recognition", "Chinese character recognition from photo"], ["chinese-character-lookup", "Chinese character lookup"], ["chinese-stroke-order", "Chinese stroke order"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["han-character-worksheet", "Chinese worksheet generator"], ["character-counter", "CJK character counter"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["kanji-to-romaji", "Kanji to Romaji"], ["japanese-characters", "Japanese character copy"], ["word-to-txt", "Word to text"]],
  ja: [[slug, "漢字手書き検索"], ["photo-chinese-character-recognition", "写真から中国語漢字を認識"], ["chinese-character-lookup", "漢字の構成・部首検索"], ["chinese-stroke-order", "中国語漢字の筆順"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["han-character-worksheet", "漢字練習プリント"], ["character-counter", "文字数カウント"], ["japanese-chinese-kanji-converter", "日本語漢字・簡体字・繁体字変換"], ["kanji-to-romaji", "漢字・ローマ字変換"], ["japanese-characters", "日本語文字コピー"], ["word-to-txt", "Word TXT 変換"]],
  ko: [[slug, "한자 필기 인식"], ["photo-chinese-character-recognition", "사진으로 중국 한자 인식"], ["chinese-character-lookup", "한자 부수·구성요소 검색"], ["chinese-stroke-order", "중국어 한자 필순"], ["chinese-to-pinyin", "중국어 병음 변환"], ["han-character-worksheet", "한자 쓰기 연습장"], ["character-counter", "글자수 세기"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["kanji-to-romaji", "일본어 한자 로마자 변환"], ["japanese-characters", "일본어 문자 복사"], ["word-to-txt", "DOCX TXT 변환"]]
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localizedPath(locale, targetSlug = "") {
  return `/${locales[locale].prefix}${targetSlug ? `${targetSlug}/` : ""}`;
}

function buildSchema(locale, page) {
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const schemaName = page.title.replace(/\s*\|\s*JianFan\.app$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${canonical}#webapp`,
        name: schemaName,
        alternateName: page.alternateNames,
        url: canonical,
        description: page.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and WebAssembly",
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
          { "@type": "ListItem", position: 2, name: schemaName, item: canonical }
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
    <link rel="stylesheet" href="/styles.min.css" />
    <script src="/theme.js"></script>
    <script defer src="/vendor/pinyin-pro.js"></script>
    <script defer src="/traditional-pinyin.js"></script>
    <script defer src="/handwriting-recognition.js"></script>
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
  <body data-tool-page="handwriting-recognition" data-page-slug="${slug}" data-locale="${locale}"${messages}>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}">
      <a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">手</span><span>JianFan.app</span></a>
      <nav class="top-actions" aria-label="${meta.nav}">
        <a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a>
        <label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${localeOptions}
          </select></label>
      <button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false"></button></nav>
    </header>
    <main id="main">
      <section class="tool-hero handwriting-tool-hero" aria-labelledby="pageTitle">
        <div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div>
        <div class="handwriting-hero-signal" aria-hidden="true"><span>?</span><i></i><strong>漢</strong></div>
      </section>

      <section class="standalone-tool handwriting-tool" aria-labelledby="handwritingToolTitle">
        <div class="standalone-tool-head">
          <div><p class="section-kicker">DRAW / MATCH / LOOK UP</p><h2 id="handwritingToolTitle">${page.toolTitle}</h2></div>
          <div class="status-pill" id="handwritingStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.loading}</span></div>
        </div>
        <div class="handwriting-workspace">
          <section class="handwriting-draw-panel" aria-labelledby="handwritingDrawTitle">
            <div class="panel-topline"><h3 id="handwritingDrawTitle">${page.drawTitle}</h3><output id="handwritingStrokeCount">${escapeHtml(page.strokeCount.replace("{count}", "0"))}</output></div>
            <div class="handwriting-board" id="handwritingBoard">
              <span class="handwriting-grid-line is-vertical" aria-hidden="true"></span>
              <span class="handwriting-grid-line is-horizontal" aria-hidden="true"></span>
              <span class="handwriting-grid-line is-diagonal-one" aria-hidden="true"></span>
              <span class="handwriting-grid-line is-diagonal-two" aria-hidden="true"></span>
              <canvas id="handwritingCanvas" width="256" height="256" aria-label="${escapeHtml(page.toolTitle)}"></canvas>
              <div class="handwriting-loader" id="handwritingLoader"><span></span><b>${page.messages.loading}</b></div>
            </div>
            <div class="handwriting-actions">
              <button class="primary-action" id="handwritingAppend" type="button" disabled><span aria-hidden="true">＋</span><span>${page.append}</span></button>
              <button id="handwritingUndo" type="button" disabled><span aria-hidden="true">↶</span><span>${page.undo}</span></button>
              <button id="handwritingClear" type="button" disabled><span aria-hidden="true">×</span><span>${page.clear}</span></button>
            </div>
            <div class="handwriting-compose"><div class="handwriting-compose-head"><label for="handwritingText">${page.composeLabel}</label><button id="handwritingTextCopy" type="button" disabled>${page.textCopy}</button><button id="handwritingTextClear" type="button" disabled>${page.textClear}</button></div><input id="handwritingText" type="text" lang="${meta.lang}" autocomplete="off" spellcheck="false" maxlength="200" placeholder="${escapeHtml(page.composePlaceholder)}" /><p class="handwriting-compose-reading" id="handwritingTextReading" hidden><span>${page.textReading}</span><strong id="handwritingTextReadingValue"></strong></p></div>
            <div class="handwriting-samples"><span>${page.samples}</span>${sampleCharacters.map((character) => `<button type="button" data-handwriting-sample="${character}" aria-label="${escapeHtml(`${page.samples} ${character}`)}">${character}</button>`).join("")}</div>
            <p class="handwriting-hint">${page.drawHint}</p>
          </section>

          <section class="handwriting-match-panel" aria-labelledby="handwritingCandidateTitle">
            <div class="panel-topline"><div><h3 id="handwritingCandidateTitle">${page.candidateTitle}</h3><p>${page.candidateHint}</p></div></div>
            <div class="handwriting-candidates" id="handwritingCandidates" role="listbox" aria-label="${escapeHtml(page.candidateTitle)}"></div>
            <p class="handwriting-candidate-empty" id="handwritingCandidateEmpty">${page.candidateEmpty}</p>
            <div class="handwriting-remote-action" id="handwritingRemoteAction" hidden><span>${page.remoteHint}</span><button id="handwritingRemoteLookup" type="button">${page.remoteAction}</button></div>
            <article class="handwriting-result" id="handwritingResult" aria-labelledby="handwritingResultTitle" hidden>
              <div class="handwriting-result-character" id="handwritingResultCharacter"></div>
              <div class="handwriting-result-content">
                <p class="section-kicker">${page.resultTitle}</p>
                <h3 id="handwritingResultTitle">${page.resultTitle}</h3>
                <dl>
${page.meaning ? `                  <div><dt>${page.meaning}</dt><dd id="handwritingResultMeaning">-</dd></div>\n` : ""}${page.zhuyin ? `                  <div><dt>${page.zhuyin}</dt><dd id="handwritingResultZhuyin">-</dd></div>\n` : ""}                  <div><dt>${page.pinyin}</dt><dd id="handwritingResultPinyin">-</dd></div>
                  <div><dt>${page.radical}</dt><dd id="handwritingResultRadical">-</dd></div>
                  <div><dt>${page.structure}</dt><dd id="handwritingResultStructure">-</dd></div>
                  <div><dt>${page.strokes}</dt><dd id="handwritingResultStrokes">-</dd></div>
                  <div><dt>${page.unicode}</dt><dd id="handwritingResultUnicode">-</dd></div>
                </dl>
                <div class="handwriting-result-actions">
                  <button class="primary-action" id="handwritingCopy" type="button">${page.copy}</button>
                  <a id="handwritingStrokeLink" href="${localizedPath(locale, "chinese-stroke-order")}">${page.strokeLink}</a>
                  <a id="handwritingPinyinLink" href="${localizedPath(locale, "chinese-to-pinyin")}">${page.pinyinLink}</a>
                  <a id="handwritingStructureLink" href="${localizedPath(locale, "chinese-character-lookup")}">${page.structureLink}</a>
                </div>
              </div>
            </article>
            <script type="application/json" id="handwritingStructureLabels">${JSON.stringify(page.structureLabels)}</script>
          </section>
        </div>
      </section>

      <section class="seo-band standalone-info" aria-labelledby="handwritingFeatureTitle">
        <div class="section-heading"><p class="section-kicker">${page.seoKicker}</p><h2 id="handwritingFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div>
        <div class="seo-grid">
${page.cards.map(([title, text]) => `          <article><h3>${title}</h3><p>${text}</p></article>`).join("\n")}
        </div>
        <section class="word-howto" aria-labelledby="handwritingHowTitle"><h2 id="handwritingHowTitle">${page.howTitle}</h2><ol>
${page.steps.map((step) => `            <li>${step}</li>`).join("\n")}
          </ol></section>
        <section class="pinyin-faq" aria-labelledby="handwritingFaqTitle"><h2 id="handwritingFaqTitle">${page.faqTitle}</h2>
${page.faqs.map(([question, answer]) => `          <details><summary>${question}</summary><p>${answer}</p></details>`).join("\n")}
        </section>
        <p class="section-kicker pinyin-related-kicker">${page.related}</p>
        <nav class="landing-links" aria-label="${page.relatedAria}">
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
  const target = path.join(directory, "index.html");
  await writeFile(target, await preserveToolLinks(`${buildPage(locale)}\n`, target));
}

console.log("Generated 5 multilingual Chinese handwriting-recognition pages.");
