import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "chinese-handwriting-recognition";
const sampleCharacters = ["人", "大", "木", "中"];

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "手写汉字识别 - 在线手写查字与汉字输入 | JianFan.app",
    description: "免费手写汉字识别与在线手写查字工具。遇到不会读、不会输入的汉字，可用鼠标、触控板、触屏或手写笔在田字格中照着字形逐笔书写，页面会边写边显示相似候选字。选中后即可复制，并查询拼音、笔画数、Unicode 与汉字笔顺。支持常见简体字和繁体字，无需注册或安装应用，笔画识别在浏览器本地完成，电脑、平板和手机都可使用。",
    alternateNames: ["在线手写查字", "汉字手写输入", "汉字手写查询"],
    eyebrow: "手写识别 · 候选汉字 · 拼音笔顺",
    heading: "手写汉字识别与在线查字",
    lede: "不知道一个汉字怎么读、也无法输入时，照着字形在田字格中写出来。系统会即时给出相似候选字，选择后即可查看拼音、笔画数和书写顺序。",
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
      candidateLabel: "选择候选汉字“{character}”"
    },
    seoKicker: "在线手写查字",
    featureTitle: "不会读也不会输入，直接手写识别汉字",
    featureIntro: "手写汉字识别适合查询书籍、图片或生活中遇到的陌生字。无需先知道拼音或部首，用鼠标、触控板、触屏或手写笔描出字形即可查字。",
    cards: [
      ["边写边显示候选字", "每完成一笔自动更新匹配结果，最多显示 10 个相似汉字，选错时可以撤销上一笔。"],
      ["候选字信息直接可用", "选中汉字后显示全部常见拼音、笔画数和 Unicode，并可复制或继续查看动态笔顺。"],
      ["浏览器本地识别", "笔画坐标不会上传到 JianFan.app 服务器，公开的 WebAssembly 识别组件在浏览器中完成匹配。"]
    ],
    howTitle: "如何在线手写查字",
    steps: ["用鼠标、触屏或手写笔在田字格中央逐笔写下汉字。", "从自动更新的候选结果中选择最接近的字。", "查看拼音和笔画数，或进入笔顺页面继续查询。"],
    faqTitle: "手写汉字识别常见问题",
    faqs: [
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
    title: "手寫漢字辨識 - 線上手寫查字與國字輸入 | JianFan.app",
    description: "免費手寫漢字辨識與線上手寫查字工具。遇到不會唸、無法輸入的國字，可用滑鼠、觸控板、觸控螢幕或手寫筆在田字格中照著字形逐畫書寫，頁面會邊寫邊顯示相似候選字。選取後即可複製，並查詢漢語拼音、筆畫數、Unicode 與國字筆順。支援常見正體字和簡體字，免註冊或安裝應用程式，筆畫辨識在瀏覽器本機完成，電腦和手機皆可使用。",
    alternateNames: ["線上手寫查字", "手寫國字辨識", "漢字手寫輸入"],
    eyebrow: "手寫辨識 · 候選漢字 · 拼音筆順",
    heading: "手寫漢字辨識與線上查字",
    lede: "遇到不知道讀音、也無法輸入的國字時，直接照著字形寫在田字格中。系統會即時列出相似候選字，選取後可查看拼音、筆畫數及筆順。",
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
      candidateLabel: "選取候選漢字「{character}」"
    },
    seoKicker: "線上手寫查字",
    featureTitle: "不知道讀音也能直接手寫辨識國字",
    featureIntro: "手寫漢字辨識適合查詢書籍、圖片或生活中遇到的陌生國字。不必先知道讀音或部首，用滑鼠、觸控板、觸控螢幕或手寫筆描出字形即可查字。",
    cards: [
      ["邊寫邊顯示候選字", "每完成一畫就自動更新結果，最多顯示 10 個相似漢字，寫錯時可復原上一畫。"],
      ["候選字資料直接查看", "選取漢字後顯示常見拼音、筆畫數和 Unicode，並可複製或繼續查看動態筆順。"],
      ["在瀏覽器本機辨識", "筆畫座標不會上傳到 JianFan.app 伺服器，公開 WebAssembly 元件會在瀏覽器中完成比對。"]
    ],
    howTitle: "如何線上手寫查字",
    steps: ["用滑鼠、觸控螢幕或手寫筆在田字格中央逐畫寫下漢字。", "從自動更新的候選結果中選取最接近的字。", "查看拼音與筆畫數，或前往筆順頁面繼續查詢。"],
    faqTitle: "手寫漢字辨識常見問題",
    faqs: [
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
    description: "Free Chinese handwriting input and recognition online. Draw a Hanzi with a mouse, finger or pen to find matches, Pinyin, stroke count and stroke order.",
    alternateNames: ["Chinese Handwriting Input", "Draw Chinese Character", "Chinese Character Lookup by Drawing", "Find Chinese Character by Drawing", "Search Chinese Characters by Drawing", "Draw Hanzi Online"],
    eyebrow: "DRAW HANZI · RECOGNIZE · LOOK UP",
    heading: "Chinese Handwriting Recognition",
    lede: "Cannot pronounce or type a Chinese character? Draw its shape in the writing grid to get likely Hanzi matches, then check its Pinyin, stroke count and stroke order.",
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
      candidateLabel: "Select candidate character {character}"
    },
    seoKicker: "Chinese handwriting input online",
    featureTitle: "Find a Chinese character by drawing it online",
    featureIntro: "Use this Chinese handwriting recognition tool when you know what a Hanzi looks like but not its Pinyin or how to type it. Draw the Chinese character with a mouse, trackpad, touchscreen or pen, then choose from the closest matches.",
    cards: [
      ["Live character candidates", "The list refreshes after each completed stroke and shows up to ten likely Hanzi. Undo the last stroke whenever the shape goes wrong."],
      ["Useful character details", "Choose a match to see its common Pinyin readings, stroke count and Unicode, then copy it or open the animated stroke-order lookup."],
      ["Recognition runs in your browser", "Stroke coordinates are not uploaded to JianFan.app. A public WebAssembly component performs the matching on your device."]
    ],
    howTitle: "How to use Chinese handwriting input",
    steps: ["Draw one Chinese character in the centre of the grid, one stroke at a time.", "Choose the closest Hanzi from the automatically updated matches.", "Check its Pinyin and stroke count, or continue to the animated stroke-order page."],
    faqTitle: "Chinese handwriting recognition questions",
    faqs: [
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
    description: "漢字手書き検索を無料で利用できます。読み方が分からず入力できない漢字を、マウス、トラックパッド、タッチ画面やペンで1画ずつ書くと、似ている候補をすぐに表示。候補を選んでコピーし、中国語のピンイン、画数、Unicode、筆順を確認できます。簡体字と繁体字に対応し、登録・アプリのインストールは不要です。",
    alternateNames: ["漢字手書き検索", "手書き漢字認識", "漢字を手書きで検索"],
    eyebrow: "手書き入力 · 漢字候補 · 読み方と筆順",
    heading: "漢字手書き検索",
    lede: "読み方が分からず入力できない漢字を、見たままマスに書いて検索できます。候補から文字を選ぶと、中国語のピンイン、画数、Unicode、筆順を確認できます。",
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
      candidateLabel: "候補の「{character}」を選択"
    },
    seoKicker: "漢字を手書きで検索",
    featureTitle: "読めない漢字を手書き入力して調べる",
    featureIntro: "漢字手書き検索は、本や画像で見つけた読み方の分からない漢字を調べるときに便利です。マウス、トラックパッド、タッチ画面、ペンで字形を書くだけで候補を表示します。",
    cards: [
      ["書きながら候補を更新", "1画ごとに最大10文字の候補を表示します。書き間違えた場合は直前の1画だけを戻せます。"],
      ["読み方・画数・筆順へ", "候補を選ぶと中国語のピンイン、画数、Unicodeを表示し、そのままコピーまたは筆順検索できます。"],
      ["ブラウザー内で認識", "筆画の座標は JianFan.app のサーバーへ送信されず、公開 WebAssembly コンポーネントが端末内で照合します。"]
    ],
    howTitle: "漢字を手書きで検索する方法",
    steps: ["マウスやタッチ操作で、マスの中央に漢字を1画ずつ書きます。", "自動更新される候補から最も近い漢字を選びます。", "中国語のピンインや画数を確認し、必要に応じて筆順を開きます。"],
    faqTitle: "漢字手書き検索のよくある質問",
    faqs: [
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
    title: "한자 필기 인식 - 손글씨로 한자 찾기 | JianFan.app",
    description: "무료 한자 필기인식과 한자 그려서 찾기 도구입니다. 읽는 법을 몰라 입력하기 어려운 한자를 마우스나 터치로 쓰면 비슷한 후보를 보여 줍니다. 한자를 골라 복사하고 병음, 획수, Unicode와 필순을 확인하세요. 간체와 번체를 지원하며 회원가입이나 앱 설치 없이 이용할 수 있습니다.",
    alternateNames: ["한자 필기 인식", "손글씨 한자 찾기", "한자 그려서 찾기"],
    eyebrow: "손글씨 입력 · 한자 후보 · 병음과 필순",
    heading: "한자 필기 인식·손글씨 한자 찾기",
    lede: "읽는 법을 몰라 입력하기 어려운 한자를 보이는 모양대로 칸 안에 써 보세요. 비슷한 후보를 고르면 중국어 병음, 획수, Unicode와 필순을 확인할 수 있습니다.",
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
      candidateLabel: "후보 한자 {character} 선택"
    },
    seoKicker: "손글씨 한자 찾기",
    featureTitle: "읽기 어려운 한자를 직접 그려서 찾기",
    featureIntro: "한자 필기 인식은 책이나 이미지에서 본 낯선 한자의 음을 모를 때 유용합니다. 마우스, 트랙패드, 터치스크린 또는 펜으로 글자 모양을 쓰면 가까운 후보를 보여 줍니다.",
    cards: [
      ["필획마다 후보 갱신", "한 획을 마칠 때마다 최대 10개의 비슷한 한자를 표시하며 잘못 쓴 경우 마지막 한 획만 되돌릴 수 있습니다."],
      ["병음·획수·필순 조회", "후보를 선택하면 중국어 병음, 획수와 Unicode를 확인하고 복사하거나 필순 페이지로 이동할 수 있습니다."],
      ["브라우저에서 로컬 인식", "필획 좌표는 JianFan.app 서버로 전송되지 않으며 공개 WebAssembly 구성 요소가 기기에서 직접 비교합니다."]
    ],
    howTitle: "손글씨로 한자 찾는 방법",
    steps: ["마우스나 터치로 격자 중앙에 한자를 한 획씩 씁니다.", "자동으로 바뀌는 후보 중 가장 가까운 한자를 선택합니다.", "중국어 병음과 획수를 확인하거나 필순 페이지를 엽니다."],
    faqTitle: "한자 필기 인식 자주 묻는 질문",
    faqs: [
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
  "zh-CN": [[slug, "手写汉字识别"], ["chinese-character-lookup", "汉字查询与结构拆解"], ["chinese-stroke-order", "汉字笔顺查询"], ["chinese-to-pinyin", "汉字转拼音"], ["han-character-worksheet", "汉字练习纸"], ["character-counter", "在线字数统计"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["kanji-to-romaji", "日文汉字转罗马字"], ["japanese-characters", "日文字符复制"], ["word-to-txt", "Word 转 TXT"]],
  "zh-TW": [[slug, "手寫漢字辨識"], ["chinese-character-lookup", "漢字查詢與結構拆解"], ["chinese-stroke-order", "漢字筆順查詢"], ["chinese-to-pinyin", "漢字轉拼音"], ["han-character-worksheet", "國字練習紙"], ["character-counter", "線上字數統計"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["kanji-to-romaji", "日文漢字轉羅馬字"], ["japanese-characters", "日文字元複製"], ["word-to-txt", "DOCX 轉 TXT"]],
  en: [[slug, "Chinese handwriting recognition"], ["chinese-character-lookup", "Chinese character lookup"], ["chinese-stroke-order", "Chinese stroke order"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["han-character-worksheet", "Chinese worksheet generator"], ["character-counter", "CJK character counter"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["kanji-to-romaji", "Kanji to Romaji"], ["japanese-characters", "Japanese character copy"], ["word-to-txt", "Word to text"]],
  ja: [[slug, "漢字手書き検索"], ["chinese-character-lookup", "漢字の構成・部首検索"], ["chinese-stroke-order", "中国語漢字の筆順"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["han-character-worksheet", "漢字練習プリント"], ["character-counter", "文字数カウント"], ["japanese-chinese-kanji-converter", "日本語漢字・簡体字・繁体字変換"], ["kanji-to-romaji", "漢字・ローマ字変換"], ["japanese-characters", "日本語文字コピー"], ["word-to-txt", "Word TXT 変換"]],
  ko: [[slug, "한자 필기 인식"], ["chinese-character-lookup", "한자 부수·구성요소 검색"], ["chinese-stroke-order", "중국어 한자 필순"], ["chinese-to-pinyin", "중국어 병음 변환"], ["han-character-worksheet", "한자 쓰기 연습장"], ["character-counter", "글자수 세기"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["kanji-to-romaji", "일본어 한자 로마자 변환"], ["japanese-characters", "일본어 문자 복사"], ["word-to-txt", "DOCX TXT 변환"]]
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
    <script defer src="/vendor/pinyin-pro.js"></script>
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
      </nav>
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
              <button id="handwritingUndo" type="button" disabled><span aria-hidden="true">↶</span><span>${page.undo}</span></button>
              <button id="handwritingClear" type="button" disabled><span aria-hidden="true">×</span><span>${page.clear}</span></button>
            </div>
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
                  <div><dt>${page.pinyin}</dt><dd id="handwritingResultPinyin">-</dd></div>
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
  await writeFile(path.join(directory, "index.html"), `${buildPage(locale)}\n`);
}

console.log("Generated 5 multilingual Chinese handwriting-recognition pages.");
