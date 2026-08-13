import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SEO_DESCRIPTIONS } from "./seo-descriptions.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "photo-chinese-character-recognition";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "在线拍照汉字识别 - 图片识别汉字与拍照查字 | JianFan.app",
    alternateNames: ["图片识别汉字", "拍照查字", "中文 OCR", "汉字图片转文字"],
    eyebrow: "拍照识字 · 中文 OCR · 点击查字",
    heading: "在线拍照汉字识别",
    lede: "拍摄或上传包含汉字的照片、截图或扫描件，提取可复制文字；点击识别结果中的任意汉字，还能继续查询拼音、笔画、笔顺和字形结构。",
    toolTitle: "拍照或上传图片识别汉字",
    sourceTitle: "选择汉字图片",
    sourceHint: "保持文字清晰、完整，尽量避免反光、倾斜和复杂背景。",
    emptyPreviewTitle: "拍照或选择图片",
    emptyPreviewBody: "支持 PNG、JPEG、WebP、HEIC 和 HEIF",
    capture: "拍照或选择图片",
    reset: "重新选择",
    recognize: "识别图片中的汉字",
    resultTitle: "汉字识别结果",
    resultHint: "整段文字可直接复制；点击高亮汉字可查看详细信息。",
    resultEmpty: "选择图片后，点击“识别图片中的汉字”。",
    copyText: "复制识别文字",
    textPinyin: "整段转拼音",
    detailTitle: "所选汉字信息",
    pinyin: "拼音",
    strokes: "笔画数",
    unicode: "Unicode",
    copyCharacter: "复制汉字",
    strokeLink: "查看笔顺",
    pinyinLink: "查询拼音",
    structureLink: "查看结构",
    privacy: "图片会先在浏览器中自动裁剪并压缩；点击识别后，处理后的图片会上传到 JianFan.app OCR 服务。请勿上传含个人资料、证件或其他敏感信息的图片。",
    featureKicker: "图片识别汉字与拍照查字",
    featureTitle: "从照片提取汉字，再逐字查询",
    featureIntro: "在线拍照汉字识别适合处理书籍、菜单、路牌、课堂资料、截图和扫描件。它不仅把图片中的简体字或繁体字变成可复制文字，还把 OCR 结果连接到拼音、笔顺与汉字结构工具。",
    cards: [
      ["拍照、截图和扫描件", "手机可直接调用相机，也可从相册选择图片；电脑端支持上传已有照片与截图。"],
      ["上传前自动处理图片", "页面会在浏览器中寻找文字区域、裁去多余边缘并压缩尺寸，减少上传时间和流量。"],
      ["识别后点击汉字查字", "点击结果中的任意汉字，即可查看拼音、笔画数和 Unicode，并进入笔顺或结构查询。"]
    ],
    howTitle: "如何在线拍照识别汉字",
    steps: ["拍摄汉字，或选择手机相册、电脑中的照片、截图或扫描图片。", "确认自动裁剪后的预览，点击识别按钮并等待返回文字。", "复制完整结果，或点击其中的汉字继续查拼音、笔顺和字形结构。"],
    faqTitle: "拍照汉字识别常见问题",
    faqs: [
      ["可以一次识别多个汉字吗？", "可以。图片可以包含一个字、词语或多行文字；返回多字结果时，可复制全文，也可点击其中任意汉字查字。"],
      ["支持简体字和繁体字吗？", "支持常见简体字和繁体字。模糊照片、艺术字、严重倾斜、反光或复杂背景可能影响中文 OCR 的结果。"],
      ["图片会在本地识别吗？", "不会完全在本地识别。自动裁剪和压缩在浏览器中完成，处理后的图片会上传到 JianFan.app OCR 服务进行文字识别。"],
      ["拍照识别和手写识别有什么区别？", "本页读取照片或截图中的汉字；手写识别页则是在田字格里逐笔书写，通过笔画轨迹匹配一个汉字。"]
    ],
    related: "相关汉字工具",
    relatedAria: "相关汉字与文字工具",
    links: [["chinese-handwriting-recognition", "手写汉字识别"], ["chinese-character-lookup", "汉字查询与结构拆解"], ["chinese-stroke-order", "汉字笔顺查询"], ["chinese-to-pinyin", "汉字转拼音"], ["han-character-worksheet", "汉字练习纸"]],
    footerText: "JianFan.app 提供拍照识字、手写查字、拼音、笔顺与中文转换工具。",
    messages: {
      waiting: "等待选择图片", processingImage: "正在自动裁剪并压缩图片", imageReady: "图片已处理，可以开始识别", compressionFailed: "图片处理后仍超过 2 MB，请重新拍摄或选择图片", emptyImage: "图片内容为空，请重新选择", sourceTooLarge: "原始图片不能超过 24 MB", unsupportedImage: "仅支持 PNG、JPEG、WebP、HEIC 或 HEIF 图片", imageSelected: "图片已选择", emptyPreviewTitle: "拍照或选择图片", emptyPreviewBody: "支持手机相机、相册和电脑图片", uploading: "正在上传并识别图片", recognizing: "正在识别图片中的汉字…", recognizedCharacter: "已识别为“{character}”", recognizedText: "已识别出汉字文本", noText: "识别服务没有返回可用的汉字文本", timeout: "识别请求超时，请检查网络后重试", networkError: "无法连接识别服务，请检查网络后重试", authError: "识别服务鉴权失败", uploadTooLarge: "处理后的图片超过 2 MB，请重新拍摄或选择图片", serviceUnavailable: "识别服务暂时不可用，请稍后重试", resultEmpty: "选择图片后，点击“识别图片中的汉字”。", resultSummary: "识别到 {count} 个汉字", selectCharacter: "查询汉字“{character}”", copiedText: "已复制识别文字", copiedCharacter: "已复制“{character}”", copyFailed: "自动复制失败，请直接选择文字复制", recognitionFailed: "识别失败"
    }
  },
  "zh-TW": {
    title: "線上拍照漢字辨識 - 圖片辨識漢字與拍照查字 | JianFan.app",
    alternateNames: ["圖片辨識漢字", "拍照查字", "中文 OCR", "漢字圖片轉文字"],
    eyebrow: "拍照識字 · 中文 OCR · 點選查字",
    heading: "線上拍照漢字辨識",
    lede: "拍攝或上傳含有漢字的照片、截圖或掃描檔，擷取可複製文字；點選辨識結果中的任一漢字，還能繼續查詢漢語拼音、筆畫、筆順與字形結構。",
    toolTitle: "拍照或上傳圖片辨識漢字",
    sourceTitle: "選擇漢字圖片",
    sourceHint: "保持文字清晰完整，盡量避免反光、傾斜與複雜背景。",
    emptyPreviewTitle: "拍照或選擇圖片",
    emptyPreviewBody: "支援 PNG、JPEG、WebP、HEIC 和 HEIF",
    capture: "拍照或選擇圖片",
    reset: "重新選擇",
    recognize: "辨識圖片中的漢字",
    resultTitle: "漢字辨識結果",
    resultHint: "整段文字可直接複製；點選高亮漢字可查看詳細資料。",
    resultEmpty: "選擇圖片後，點選「辨識圖片中的漢字」。",
    copyText: "複製辨識文字",
    textPinyin: "整段轉拼音",
    detailTitle: "所選漢字資料",
    pinyin: "漢語拼音",
    strokes: "筆畫數",
    unicode: "Unicode",
    copyCharacter: "複製漢字",
    strokeLink: "查看筆順",
    pinyinLink: "查詢拼音",
    structureLink: "查看結構",
    privacy: "圖片會先在瀏覽器中自動裁切並壓縮；點選辨識後，處理過的圖片會上傳至 JianFan.app OCR 服務。請勿上傳含個人資料、證件或其他敏感資訊的圖片。",
    featureKicker: "圖片辨識漢字與拍照查字",
    featureTitle: "從照片擷取漢字，再逐字查詢",
    featureIntro: "線上拍照漢字辨識適合處理書籍、菜單、路牌、課堂資料、截圖及掃描檔。不只把圖片中的正體字或簡體字轉成可複製文字，也能由 OCR 結果直接查詢拼音、筆順與漢字結構。",
    cards: [["照片、截圖和掃描檔", "手機可直接開啟相機，也能從相簿選圖；電腦端可上傳現有照片與截圖。"], ["上傳前自動處理圖片", "頁面會在瀏覽器中尋找文字區域、裁去多餘邊緣並壓縮尺寸，以減少上傳時間及流量。"], ["辨識後點選漢字查字", "點選結果中的任一漢字，即可查看漢語拼音、筆畫數與 Unicode，並前往筆順或結構查詢。"]],
    howTitle: "如何線上拍照辨識漢字",
    steps: ["拍攝漢字，或選擇手機相簿、電腦中的照片、截圖或掃描圖片。", "確認自動裁切後的預覽，點選辨識按鈕並等待文字結果。", "複製完整結果，或點選其中的漢字繼續查拼音、筆順和字形結構。"],
    faqTitle: "拍照漢字辨識常見問題",
    faqs: [["可以一次辨識多個漢字嗎？", "可以。圖片可包含單字、詞語或多行文字；回傳多字結果時，可複製全文，也能點選任一漢字查字。"], ["支援正體字和簡體字嗎？", "支援常見正體字和簡體字。模糊照片、藝術字、嚴重傾斜、反光或複雜背景可能影響中文 OCR 結果。"], ["圖片會在本機辨識嗎？", "不會完全在本機辨識。自動裁切和壓縮在瀏覽器中完成，處理後的圖片會上傳到 JianFan.app OCR 服務。"], ["拍照辨識和手寫辨識有何不同？", "本頁讀取照片或截圖中的漢字；手寫辨識頁則是在田字格逐畫書寫，依筆畫軌跡比對一個漢字。"]],
    related: "相關漢字工具",
    relatedAria: "相關漢字與文字工具",
    links: [["chinese-handwriting-recognition", "手寫漢字辨識"], ["chinese-character-lookup", "漢字查詢與結構拆解"], ["chinese-stroke-order", "漢字筆順查詢"], ["chinese-to-pinyin", "漢字轉拼音"], ["han-character-worksheet", "國字練習紙"]],
    footerText: "JianFan.app 提供拍照識字、手寫查字、拼音、筆順與中文轉換工具。",
    messages: {
      waiting: "等待選擇圖片", processingImage: "正在自動裁切並壓縮圖片", imageReady: "圖片已處理，可以開始辨識", compressionFailed: "圖片處理後仍超過 2 MB，請重新拍攝或選擇圖片", emptyImage: "圖片內容為空，請重新選擇", sourceTooLarge: "原始圖片不能超過 24 MB", unsupportedImage: "僅支援 PNG、JPEG、WebP、HEIC 或 HEIF 圖片", imageSelected: "圖片已選擇", emptyPreviewTitle: "拍照或選擇圖片", emptyPreviewBody: "支援手機相機、相簿和電腦圖片", uploading: "正在上傳並辨識圖片", recognizing: "正在辨識圖片中的漢字…", recognizedCharacter: "已辨識為「{character}」", recognizedText: "已辨識出漢字文字", noText: "辨識服務沒有回傳可用的漢字文字", timeout: "辨識逾時，請檢查網路後再試一次", networkError: "無法連線辨識服務，請檢查網路後再試一次", authError: "辨識服務驗證失敗", uploadTooLarge: "處理後的圖片超過 2 MB，請重新拍攝或選擇圖片", serviceUnavailable: "辨識服務暫時無法使用，請稍後再試", resultEmpty: "選擇圖片後，點選「辨識圖片中的漢字」。", resultSummary: "辨識到 {count} 個漢字", selectCharacter: "查詢漢字「{character}」", copiedText: "已複製辨識文字", copiedCharacter: "已複製「{character}」", copyFailed: "自動複製失敗，請直接選取文字複製", recognitionFailed: "辨識失敗"
    }
  },
  en: {
    title: "Chinese Character Recognition from Photo | JianFan.app",
    alternateNames: ["Chinese photo OCR", "Recognize Chinese characters from image", "Hanzi image to text"],
    eyebrow: "PHOTO OCR · EXTRACT HANZI · LOOK UP",
    heading: "Chinese Character Recognition from Photo",
    lede: "Take or upload a photo, screenshot or scan containing Chinese characters. Copy the extracted text, or tap any Hanzi to check its Pinyin, stroke count, order and structure.",
    toolTitle: "Recognize Chinese characters in an image",
    sourceTitle: "Choose a Chinese text image",
    sourceHint: "Keep the characters sharp and complete. Avoid glare, steep angles and busy backgrounds.",
    emptyPreviewTitle: "Take or choose a photo",
    emptyPreviewBody: "PNG, JPEG, WebP, HEIC and HEIF supported",
    capture: "Take or choose a photo",
    reset: "Choose again",
    recognize: "Recognize Chinese characters",
    resultTitle: "OCR result",
    resultHint: "Copy all extracted text, or tap a highlighted Hanzi for character details.",
    resultEmpty: "Choose an image, then select “Recognize Chinese characters”.",
    copyText: "Copy extracted text",
    textPinyin: "Convert all to Pinyin",
    detailTitle: "Selected character details",
    pinyin: "Pinyin",
    strokes: "Stroke count",
    unicode: "Unicode",
    copyCharacter: "Copy character",
    strokeLink: "View stroke order",
    pinyinLink: "Check Pinyin",
    structureLink: "View structure",
    privacy: "Your browser automatically crops and compresses the image first. When you start recognition, the processed image is uploaded to the JianFan.app OCR service. Do not upload images containing personal, identity or other sensitive information.",
    featureKicker: "Chinese photo OCR and Hanzi lookup",
    featureTitle: "Extract Chinese text from a photo, then inspect each Hanzi",
    featureIntro: "Use online Chinese character recognition for books, menus, signs, study sheets, screenshots and scanned pages. The tool turns Simplified or Traditional Chinese in an image into copyable text and connects each recognized Hanzi to Pinyin, stroke order and character structure.",
    cards: [["Photos, screenshots and scans", "Open the phone camera or photo library, or upload an existing image from a desktop browser."], ["Automatic image preparation", "Before upload, the browser finds the content area, trims excess borders and compresses the image to reduce transfer time."], ["Tap a Hanzi to look it up", "Select any Chinese character in the result to see Pinyin, stroke count and Unicode, then open stroke-order or structure lookup."]],
    howTitle: "How to recognize Chinese characters from a photo",
    steps: ["Photograph the Chinese text, or choose a photo, screenshot or scan from your device.", "Check the automatically cropped preview, then start recognition and wait for the text result.", "Copy the full text, or tap a Hanzi to check its Pinyin, stroke order and structure."],
    faqTitle: "Chinese photo OCR questions",
    faqs: [["Can it recognize more than one Chinese character?", "Yes. An image may contain one Hanzi, a phrase or several lines. Copy the complete result or tap any recognized character to look it up."], ["Does it support Simplified and Traditional Chinese?", "It supports common Simplified and Traditional characters. Blur, stylized lettering, glare, steep angles and busy backgrounds can reduce OCR accuracy."], ["Does recognition run entirely in my browser?", "No. Cropping and compression run in your browser, then the processed image is uploaded to the JianFan.app OCR service for recognition."], ["How is photo OCR different from handwriting recognition?", "This page reads Chinese text from a photo or screenshot. The handwriting tool matches one character from strokes drawn in its writing grid."]],
    related: "Related Chinese tools",
    relatedAria: "Related Chinese character and text tools",
    links: [["chinese-handwriting-recognition", "Chinese handwriting recognition"], ["chinese-character-lookup", "Chinese character lookup"], ["chinese-stroke-order", "Chinese stroke order"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["han-character-worksheet", "Chinese worksheet generator"]],
    footerText: "JianFan.app provides Chinese photo OCR, handwriting, Pinyin, stroke-order and text-conversion tools.",
    messages: {
      waiting: "Waiting for an image", processingImage: "Cropping and compressing the image", imageReady: "Image ready for recognition", compressionFailed: "The processed image is larger than 2 MB. Take another photo or choose a different image", emptyImage: "The image is empty. Choose another file", sourceTooLarge: "The original image must be 24 MB or smaller", unsupportedImage: "Use a PNG, JPEG, WebP, HEIC or HEIF image", imageSelected: "Image selected", emptyPreviewTitle: "Take or choose a photo", emptyPreviewBody: "Use the camera, photo library or a desktop image", uploading: "Uploading and recognizing the image", recognizing: "Recognizing Chinese characters…", recognizedCharacter: "Recognized as “{character}”", recognizedText: "Chinese text recognized", noText: "No usable Chinese text was returned", timeout: "Recognition timed out. Check your connection and try again", networkError: "Could not reach the recognition service. Check your connection and try again", authError: "Recognition service authorization failed", uploadTooLarge: "The processed image is larger than 2 MB. Take another photo or choose a different image", serviceUnavailable: "Recognition is temporarily unavailable. Try again later", resultEmpty: "Choose an image, then select “Recognize Chinese characters”.", resultSummary: "{count} Chinese characters recognized", selectCharacter: "Look up Chinese character {character}", copiedText: "Extracted text copied", copiedCharacter: "Copied “{character}”", copyFailed: "Automatic copy failed. Select and copy the text directly", recognitionFailed: "Recognition failed"
    }
  },
  ja: {
    title: "写真から中国語漢字を認識・画像で漢字検索 | JianFan.app",
    alternateNames: ["中国語画像OCR", "写真から漢字を認識", "画像の漢字を文字に変換"],
    eyebrow: "写真OCR · 中国語漢字 · 文字検索",
    heading: "写真から中国語の漢字を認識",
    lede: "中国語の漢字が写った写真、スクリーンショット、スキャン画像を読み取り、コピーできる文字に変換します。認識した漢字を選ぶと、ピンイン、画数、筆順、字形構成も確認できます。",
    toolTitle: "画像から中国語の漢字を読み取る",
    sourceTitle: "漢字が写った画像を選択",
    sourceHint: "文字全体が鮮明に写るようにし、反射、強い傾き、複雑な背景を避けてください。",
    emptyPreviewTitle: "撮影または画像を選択",
    emptyPreviewBody: "PNG、JPEG、WebP、HEIC、HEIFに対応",
    capture: "撮影または画像を選択",
    reset: "選び直す",
    recognize: "画像の漢字を認識",
    resultTitle: "文字認識の結果",
    resultHint: "結果全体をコピーできます。ハイライトされた漢字を選ぶと詳細を確認できます。",
    resultEmpty: "画像を選び、「画像の漢字を認識」を押してください。",
    copyText: "認識結果をコピー",
    textPinyin: "全文をピンインに変換",
    detailTitle: "選択した漢字の情報",
    pinyin: "中国語ピンイン",
    strokes: "画数",
    unicode: "Unicode",
    copyCharacter: "漢字をコピー",
    strokeLink: "筆順を見る",
    pinyinLink: "ピンインを調べる",
    structureLink: "字形構成を見る",
    privacy: "画像はブラウザーで自動的にトリミング・圧縮されます。認識を開始すると、処理済み画像が JianFan.app OCR サービスへ送信されます。個人情報、身分証明書など機密情報を含む画像はアップロードしないでください。",
    featureKicker: "中国語画像OCR・写真の漢字検索",
    featureTitle: "写真の中国語を文字に変換し、漢字ごとに調べる",
    featureIntro: "書籍、メニュー、看板、学習プリント、スクリーンショット、スキャン画像の中国語に利用できます。簡体字・繁体字をコピー可能な文字へ変換し、認識結果からピンイン、筆順、漢字の構成も検索できます。",
    cards: [["写真・スクリーンショット・スキャン", "スマートフォンではカメラや写真ライブラリを開けます。パソコンから既存画像をアップロードすることもできます。"], ["送信前に画像を自動調整", "ブラウザーで文字領域を検出し、不要な余白を切り取り、画像を圧縮して通信量を抑えます。"], ["認識した漢字をそのまま検索", "結果の漢字を選ぶと中国語ピンイン、画数、Unicodeを表示し、筆順・構成検索へ進めます。"]],
    howTitle: "写真から中国語漢字を認識する方法",
    steps: ["漢字を撮影するか、端末にある写真、スクリーンショット、スキャン画像を選びます。", "自動トリミングされたプレビューを確認し、認識ボタンを押します。", "結果全体をコピーするか、漢字を選んでピンイン、筆順、字形構成を調べます。"],
    faqTitle: "中国語画像OCRのよくある質問",
    faqs: [["複数の漢字を一度に認識できますか？", "はい。1文字、単語、複数行の画像に対応します。結果全体をコピーするほか、各漢字を選んで詳しく調べられます。"], ["簡体字と繁体字に対応していますか？", "一般的な簡体字・繁体字に対応します。ぼけ、装飾文字、反射、強い傾き、複雑な背景は認識精度を下げる場合があります。"], ["画像認識はブラウザー内だけで行われますか？", "いいえ。トリミングと圧縮はブラウザー内で行い、処理済み画像を JianFan.app OCR サービスへ送信して認識します。"], ["手書き漢字検索との違いは？", "このページは写真やスクリーンショットを読み取ります。手書き検索はマスに1画ずつ書いた筆跡から漢字候補を探します。"]],
    related: "関連する漢字ツール",
    relatedAria: "関連する中国語漢字ツール",
    links: [["chinese-handwriting-recognition", "中国語の手書き漢字検索"], ["chinese-character-lookup", "漢字の構成・部首検索"], ["chinese-stroke-order", "中国語漢字の筆順"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["han-character-worksheet", "漢字練習プリント"]],
    footerText: "JianFan.app は中国語画像OCR、手書き検索、ピンイン、筆順、文字変換ツールを提供します。",
    messages: {
      waiting: "画像を選択してください", processingImage: "画像をトリミング・圧縮しています", imageReady: "画像の準備ができました", compressionFailed: "処理後の画像が2 MBを超えています。撮り直すか、別の画像を選んでください", emptyImage: "画像が空です。別の画像を選んでください", sourceTooLarge: "元画像は24 MB以下にしてください", unsupportedImage: "PNG、JPEG、WebP、HEIC、HEIF画像を使用してください", imageSelected: "画像を選択しました", emptyPreviewTitle: "撮影または画像を選択", emptyPreviewBody: "カメラ、写真ライブラリ、パソコンの画像に対応", uploading: "画像を送信して認識しています", recognizing: "画像の漢字を認識しています…", recognizedCharacter: "「{character}」と認識しました", recognizedText: "中国語テキストを認識しました", noText: "利用できる漢字テキストが返されませんでした", timeout: "認識がタイムアウトしました。通信を確認してもう一度お試しください", networkError: "認識サービスに接続できません。通信を確認してもう一度お試しください", authError: "認識サービスの認証に失敗しました", uploadTooLarge: "処理後の画像が2 MBを超えています。撮り直すか、別の画像を選んでください", serviceUnavailable: "認識サービスを一時的に利用できません。後でもう一度お試しください", resultEmpty: "画像を選び、「画像の漢字を認識」を押してください。", resultSummary: "漢字を {count} 文字認識しました", selectCharacter: "漢字「{character}」を調べる", copiedText: "認識結果をコピーしました", copiedCharacter: "「{character}」をコピーしました", copyFailed: "自動コピーに失敗しました。文字を選択してコピーしてください", recognitionFailed: "認識に失敗しました"
    }
  },
  ko: {
    title: "사진으로 중국 한자 인식·이미지 한자 찾기 | JianFan.app",
    alternateNames: ["중국어 이미지 OCR", "사진 한자 인식", "이미지 한자 텍스트 변환"],
    eyebrow: "사진 OCR · 중국 한자 · 글자 찾기",
    heading: "사진으로 중국 한자 인식",
    lede: "중국 한자가 있는 사진, 스크린샷, 스캔 이미지를 복사 가능한 텍스트로 바꿉니다. 인식된 한자를 누르면 중국어 병음, 획수, 필순과 글자 구조도 확인할 수 있습니다.",
    toolTitle: "이미지에서 중국 한자 인식",
    sourceTitle: "한자가 있는 이미지 선택",
    sourceHint: "글자가 선명하고 온전히 보이게 촬영하고 반사, 심한 기울기와 복잡한 배경은 피하세요.",
    emptyPreviewTitle: "촬영하거나 이미지 선택",
    emptyPreviewBody: "PNG, JPEG, WebP, HEIC, HEIF 지원",
    capture: "촬영하거나 이미지 선택",
    reset: "다시 선택",
    recognize: "이미지 속 한자 인식",
    resultTitle: "한자 인식 결과",
    resultHint: "전체 텍스트를 복사하거나 강조된 한자를 눌러 상세 정보를 확인하세요.",
    resultEmpty: "이미지를 선택한 뒤 ‘이미지 속 한자 인식’을 누르세요.",
    copyText: "인식한 텍스트 복사",
    textPinyin: "전체 병음 변환",
    detailTitle: "선택한 한자 정보",
    pinyin: "중국어 병음",
    strokes: "획수",
    unicode: "Unicode",
    copyCharacter: "한자 복사",
    strokeLink: "필순 보기",
    pinyinLink: "병음 확인",
    structureLink: "글자 구조 보기",
    privacy: "이미지는 먼저 브라우저에서 자동 자르기와 압축을 거칩니다. 인식을 시작하면 처리된 이미지가 JianFan.app OCR 서비스로 전송됩니다. 개인정보, 신분증 또는 민감한 정보가 포함된 이미지는 올리지 마세요.",
    featureKicker: "중국어 이미지 OCR·사진 한자 찾기",
    featureTitle: "사진에서 중국 한자를 추출하고 글자별로 찾기",
    featureIntro: "책, 메뉴판, 간판, 학습 자료, 스크린샷과 스캔 이미지에 있는 중국어를 확인할 때 사용하세요. 간체자와 번체자를 복사 가능한 텍스트로 바꾸고, 인식된 한자에서 병음, 필순과 글자 구조를 바로 찾을 수 있습니다.",
    cards: [["사진·스크린샷·스캔", "휴대폰 카메라나 사진 보관함을 열 수 있고 PC에서는 저장된 이미지를 업로드할 수 있습니다."], ["전송 전 이미지 자동 처리", "브라우저에서 글자 영역을 찾아 불필요한 여백을 자르고 이미지를 압축해 전송 시간과 데이터 사용량을 줄입니다."], ["인식한 한자를 눌러 찾기", "결과의 한자를 선택하면 중국어 병음, 획수와 Unicode를 확인하고 필순·구조 검색으로 이동할 수 있습니다."]],
    howTitle: "사진으로 중국 한자를 인식하는 방법",
    steps: ["한자를 촬영하거나 기기의 사진, 스크린샷 또는 스캔 이미지를 선택합니다.", "자동으로 잘린 미리보기를 확인하고 인식 버튼을 눌러 결과를 기다립니다.", "전체 텍스트를 복사하거나 한자를 눌러 병음, 필순과 글자 구조를 확인합니다."],
    faqTitle: "중국어 이미지 OCR 자주 묻는 질문",
    faqs: [["한자를 여러 글자 인식할 수 있나요?", "네. 한 글자, 단어 또는 여러 줄이 있는 이미지를 인식할 수 있습니다. 전체 결과를 복사하거나 각 한자를 눌러 찾으세요."], ["간체자와 번체자를 지원하나요?", "일반적인 중국어 간체자와 번체자를 지원합니다. 흐림, 장식 글꼴, 반사, 심한 기울기와 복잡한 배경은 정확도를 낮출 수 있습니다."], ["이미지 인식이 브라우저에서만 처리되나요?", "아닙니다. 자르기와 압축은 브라우저에서 처리하고, 처리된 이미지는 JianFan.app OCR 서비스로 전송해 인식합니다."], ["손글씨 한자 인식과 무엇이 다른가요?", "이 페이지는 사진이나 스크린샷을 읽습니다. 손글씨 도구는 쓰기 칸에 한 획씩 그린 궤적으로 한 글자를 찾습니다."]],
    related: "관련 한자 도구",
    relatedAria: "관련 중국어 한자와 텍스트 도구",
    links: [["chinese-handwriting-recognition", "중국 한자 손글씨 인식"], ["chinese-character-lookup", "한자 부수·구성요소 검색"], ["chinese-stroke-order", "중국어 한자 필순"], ["chinese-to-pinyin", "중국어 병음 변환"], ["han-character-worksheet", "한자 쓰기 연습장"]],
    footerText: "JianFan.app는 중국어 이미지 OCR, 손글씨, 병음, 필순과 텍스트 변환 도구를 제공합니다.",
    messages: {
      waiting: "이미지를 선택하세요", processingImage: "이미지를 자동으로 자르고 압축하는 중", imageReady: "이미지 준비가 완료되었습니다", compressionFailed: "처리된 이미지가 2 MB를 넘습니다. 다시 촬영하거나 다른 이미지를 선택하세요", emptyImage: "이미지가 비어 있습니다. 다른 파일을 선택하세요", sourceTooLarge: "원본 이미지는 24 MB 이하여야 합니다", unsupportedImage: "PNG, JPEG, WebP, HEIC 또는 HEIF 이미지를 사용하세요", imageSelected: "이미지를 선택했습니다", emptyPreviewTitle: "촬영하거나 이미지 선택", emptyPreviewBody: "카메라, 사진 보관함과 PC 이미지 지원", uploading: "이미지를 전송하고 인식하는 중", recognizing: "이미지 속 한자를 인식하는 중…", recognizedCharacter: "‘{character}’로 인식했습니다", recognizedText: "중국어 텍스트를 인식했습니다", noText: "사용할 수 있는 한자 텍스트가 반환되지 않았습니다", timeout: "인식 시간이 초과되었습니다. 네트워크를 확인하고 다시 시도하세요", networkError: "인식 서비스에 연결할 수 없습니다. 네트워크를 확인하고 다시 시도하세요", authError: "인식 서비스 인증에 실패했습니다", uploadTooLarge: "처리된 이미지가 2 MB를 넘습니다. 다시 촬영하거나 다른 이미지를 선택하세요", serviceUnavailable: "인식 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요", resultEmpty: "이미지를 선택한 뒤 ‘이미지 속 한자 인식’을 누르세요.", resultSummary: "한자 {count}자를 인식했습니다", selectCharacter: "한자 ‘{character}’ 찾기", copiedText: "인식한 텍스트를 복사했습니다", copiedCharacter: "‘{character}’를 복사했습니다", copyFailed: "자동 복사에 실패했습니다. 텍스트를 직접 선택해 복사하세요", recognitionFailed: "인식에 실패했습니다"
    }
  }
};

function localPath(locale, target = "") {
  return `/${locales[locale].prefix}${target ? `${target}/` : ""}`;
}

function canonicalUrl(locale) {
  return `${origin}${localPath(locale, slug)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildSchema(locale, page, description) {
  const canonical = canonicalUrl(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: page.heading,
        alternateName: page.alternateNames,
        url: canonical,
        description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and image upload support",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localPath(locale)}` },
          { "@type": "ListItem", position: 2, name: page.heading, item: canonical }
        ]
      },
      {
        "@type": "HowTo",
        name: page.howTitle,
        description,
        step: page.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text }))
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text }
        }))
      }
    ]
  };
}

function renderPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const description = SEO_DESCRIPTIONS[slug][locale];
  const canonical = canonicalUrl(locale);
  const alternates = Object.entries(locales)
    .map(([key, value]) => `<link rel="alternate" hreflang="${value.hreflang}" href="${canonicalUrl(key)}" />`)
    .join("");
  const localeOptions = Object.entries(locales)
    .map(([key, value]) => `<option value="${key}"${key === locale ? " selected" : ""}>${value.label}</option>`)
    .join("");
  const relatedLinks = page.links
    .map(([target, label]) => `<a href="${localPath(locale, target)}" data-route="${target}">${escapeHtml(label)}</a>`)
    .join("");
  const schema = JSON.stringify(buildSchema(locale, page, description), null, 2);
  const messages = JSON.stringify(page.messages).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(description)}" />
    <title>${escapeHtml(page.title)}</title>
    <link rel="canonical" href="${canonical}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${canonicalUrl("zh-CN")}" />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/photo-chinese-character-recognition.css" />
    <script defer src="/vendor/pinyin-pro.js"></script>
    <script defer src="/photo-chinese-character-recognition.js"></script>
    <!-- seo-schema:start --><script type="application/ld+json">${schema}</script><!-- seo-schema:end -->
  </head>
  <body data-tool-page="photo-chinese-character-recognition" data-page-slug="${slug}" data-locale="${locale}">
    <script type="application/json" id="photoOcrMessages">${messages}</script>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}">
      <a class="brand" href="${localPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">拍</span><span>JianFan.app</span></a>
      <nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${localeOptions}</select></label></nav>
    </header>

    <main id="main" class="photo-ocr-main">
      <section class="tool-hero photo-ocr-hero" aria-labelledby="pageTitle">
        <div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div>
        <div class="photo-ocr-signal" aria-hidden="true"><span>PHOTO</span><strong>字</strong><b>OCR</b></div>
      </section>

      <section class="standalone-tool photo-ocr-tool" aria-labelledby="photoToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">PHOTO / OCR</p><h2 id="photoToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="photoOcrStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.waiting}</span></div></div>
        <div class="photo-ocr-workspace">
          <section class="photo-ocr-panel" aria-labelledby="photoSourceTitle">
            <div class="photo-ocr-panel-head"><span class="photo-ocr-step" aria-hidden="true">01</span><div><h3 id="photoSourceTitle">${page.sourceTitle}</h3><p>${page.sourceHint}</p></div></div>
            <div class="photo-ocr-capture-row"><button class="photo-ocr-capture" id="photoCapture" type="button">${page.capture}</button><input class="visually-hidden" id="photoInput" type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif" capture="environment" /><button class="photo-ocr-secondary" id="photoReset" type="button" disabled>${page.reset}</button></div>
            <button class="photo-ocr-recognize" id="photoRecognize" type="button" disabled>${page.recognize}</button>
            <div class="photo-ocr-canvas-frame is-empty" id="photoSourceFrame"><canvas id="photoSourceCanvas" aria-label="${page.sourceTitle}"></canvas><div class="photo-ocr-empty" id="photoSourceEmpty"><strong>${page.emptyPreviewTitle}</strong><span>${page.emptyPreviewBody}</span></div></div>
          </section>

          <section class="photo-ocr-results" aria-labelledby="photoResultsTitle">
            <div class="photo-ocr-panel-head"><span class="photo-ocr-step" aria-hidden="true">02</span><div><h3 id="photoResultsTitle">${page.resultTitle}</h3><p>${page.resultHint}</p></div></div>
            <p class="photo-ocr-results-empty" id="photoResultsEmpty">${page.resultEmpty}</p>
            <div class="photo-ocr-result-text" id="photoResultText" aria-live="polite" aria-label="${page.resultTitle}" hidden></div>
            <div class="photo-ocr-result-actions" id="photoTextActions" hidden><output id="photoResultSummary"></output><a id="photoPinyinText" href="${localPath(locale, "chinese-to-pinyin")}" hidden>${page.textPinyin}</a><button id="photoCopyText" type="button">${page.copyText}</button></div>
            <article class="photo-ocr-character-detail" id="photoCharacterDetail" aria-labelledby="photoCharacterDetailTitle" hidden><h4 class="visually-hidden" id="photoCharacterDetailTitle">${page.detailTitle}</h4><output class="photo-ocr-result-character" id="photoResultCharacter"></output><dl class="photo-ocr-character-meta"><div><dt>${page.pinyin}</dt><dd id="photoResultPinyin">-</dd></div><div><dt>${page.strokes}</dt><dd id="photoResultStrokes">-</dd></div><div><dt>${page.unicode}</dt><dd id="photoResultUnicode">-</dd></div></dl><div class="photo-ocr-character-actions"><button id="photoCopyCharacter" type="button">${page.copyCharacter}</button><a id="photoStrokeLink" href="${localPath(locale, "chinese-stroke-order")}">${page.strokeLink}</a><a id="photoPinyinLink" href="${localPath(locale, "chinese-to-pinyin")}">${page.pinyinLink}</a><a id="photoStructureLink" href="${localPath(locale, "chinese-character-lookup")}">${page.structureLink}</a></div></article>
          </section>
        </div>
        <p class="photo-ocr-privacy">${page.privacy}</p>
      </section>

      <section class="seo-band standalone-info" aria-labelledby="photoFeatureTitle">
        <div class="section-heading"><p class="section-kicker">${page.featureKicker}</p><h2 id="photoFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div>
        <div class="seo-grid">${page.cards.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>
        <section class="pinyin-howto" aria-labelledby="photoHowTitle"><h2 id="photoHowTitle">${page.howTitle}</h2><ol>${page.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section>
        <section class="pinyin-faq" aria-labelledby="photoFaqTitle"><h2 id="photoFaqTitle">${page.faqTitle}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section>
        <p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">${relatedLinks}</nav>
      </section>
    </main>

    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localPath(locale, "about")}">${meta.about}</a><a href="${localPath(locale, "contact")}">${meta.contact}</a><a href="${localPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>
`;
}

for (const locale of Object.keys(locales)) {
  const outputDirectory = path.join(projectRoot, locales[locale].prefix, slug);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "index.html"), renderPage(locale), "utf8");
}

console.log(`Generated ${Object.keys(locales).length} ${slug} pages.`);
