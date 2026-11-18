import { preserveToolLinks } from "./static-tool-links.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SEO_DESCRIPTIONS } from "./seo-descriptions.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "photo-chinese-character-recognition";
const blogGuide = `      <!-- blog-guide-links:start -->
      <section class="tool-guide-strip" aria-labelledby="blogGuideTitle">
        <div><p class="section-kicker">使用指南</p><h2 id="blogGuideTitle">拍照识字还是手写汉字识别</h2><p>比较图片 OCR 和笔画轨迹识别的适用场景、隐私处理与提高成功率的方法。</p></div>
        <a href="/blog/photo-vs-handwriting-chinese-recognition/">阅读完整指南 <span aria-hidden="true">→</span></a>
      </section>
      <!-- blog-guide-links:end -->`;

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明", errorTitle: "识别失败", close: "关闭" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", errorTitle: "辨識失敗", close: "關閉" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement", errorTitle: "Recognition failed", close: "Close" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", errorTitle: "認識に失敗しました", close: "閉じる" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내", errorTitle: "인식에 실패했습니다", close: "닫기" }
};

const content = {
  "zh-CN": {
    title: "拍照识字 - 在线图片识字、截图识字与 OCR 转文字 | JianFan.app",
    alternateNames: ["图片识字", "截图识字", "拍照汉字识别", "图片识别汉字", "拍照查字", "中文 OCR", "在线 OCR", "图片 OCR 识别", "汉字图片转文字", "图片文字识别", "图片提取文字", "图片转拼音"],
    eyebrow: "拍照识字 · 截图识字 · 拼音标注",
    heading: "在线拍照识字、图片识字",
    lede: "拍摄、上传或直接粘贴含汉字的照片、截图和扫描件，通常几秒就能提取可复制文字；还可以在每个字上方显示拼音、朗读全文，点击任意汉字继续查笔画、笔顺和字形结构。",
    toolTitle: "拍照或上传图片识别汉字",
    sourceTitle: "选择汉字图片",
    sourceHint: "文字清晰、完整更容易识别；电脑上也可以拖入图片，或按 Ctrl+V 粘贴截图。",
    emptyPreviewTitle: "拍照或选择图片",
    emptyPreviewBody: "支持 PNG、JPEG、WebP、HEIC 和 HEIF",
    capture: "拍照或选择图片",
    reset: "重新选择",
    recognize: "识别图片中的汉字",
    pasteHint: "也可拖入图片或按 Ctrl+V / ⌘V 粘贴截图",
    showPinyin: "显示拼音",
    copyPinyin: "复制拼音",
    speakText: "朗读",
    speakCharacter: "朗读这个字",
    resultTitle: "汉字识别结果",
    resultHint: "可复制全文或显示拼音；点击高亮汉字查看详细信息。",
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
    privacy: "图片会先在浏览器中自动裁剪并压缩；点击识别后，处理后的图片会上传到 JianFan.app OCR 服务。请勿上传含个人资料、证件或其他敏感信息的图片。朗读使用浏览器或系统自带的语音；若只有在线语音可用，要朗读的文字会发送给浏览器厂商的语音服务。",
    featureKicker: "拍照识字 · 图片转文字 · 拍照查字",
    featureTitle: "从照片和图片提取汉字，再逐字查询",
    featureIntro: "拍照识字就是用中文 OCR 把照片、截图或扫描件中的汉字转成可复制文字。在本页拍照、上传或粘贴截图后点击识别，通常几秒内返回结果，并可标注拼音、逐字查笔顺。它适合识别书籍、菜单、路牌、课堂资料和聊天截图里的简体字与繁体字。",
    cards: [["拍照、上传或粘贴截图", "手机可直接调用相机或相册；电脑上可选择文件、把图片拖进预览区，或用 Ctrl+V（Mac 为 ⌘V）粘贴刚截的屏幕截图。"], ["识别结果标注拼音", "打开“显示拼音”，每个汉字上方按词语语境标注带声调拼音，例如“重要”标 zhòng、“重庆”标 chóng，整段拼音可一键复制。"], ["点击汉字继续查字", "点击结果中的任意汉字，即可查看拼音、笔画数和 Unicode 编码，并进入笔顺动画或部件结构查询。"]],
    howTitle: "如何在线拍照识别汉字",
    steps: ["拍摄汉字，或选择相册、电脑中的图片；电脑上也可以拖入图片或按 Ctrl+V 粘贴截图。", "确认自动裁剪后的预览，点击“识别图片中的汉字”，通常几秒内返回文字。", "复制全文或拼音、朗读全文，或点击其中的汉字继续查笔顺和字形结构。"],
    faqTitle: "拍照汉字识别常见问题",
    faqs: [
      ["可以一次识别多个汉字吗？", "可以。图片可以包含一个字、词语或多行文字；返回多字结果时，可复制全文，也可点击其中任意汉字查字。"],
      ["支持简体字和繁体字吗？", "支持常见简体字和繁体字。模糊照片、艺术字、严重倾斜、反光或复杂背景可能影响中文 OCR 的结果。"],
      ["图片会在本地识别吗？", "不会完全在本地识别。自动裁剪和压缩在浏览器中完成，处理后的图片会上传到 JianFan.app OCR 服务进行文字识别。"],
      ["拍照识别和手写识别有什么区别？", "本页读取照片或截图中的汉字；手写识别页则是在田字格里逐笔书写，通过笔画轨迹匹配一个汉字。"],
      ["可以把图片中的中文转换成可复制文字吗？", "可以。本工具可用于中文图片转文字、图片文字识别和图片提取文字，从手机照片、截图或扫描件提取简体字与繁体字，结果可以整段复制。"],
      ["截图可以直接粘贴识别吗？", "可以。在电脑上用 Win+Shift+S、Mac 的 Control+Shift+Command+4 或聊天软件截图后，回到本页按 Ctrl+V（Mac 为 ⌘V）即可载入，再点击识别；也可以把图片文件直接拖到预览区。"],
      ["能把图片里的汉字直接标上拼音吗？", "可以。识别后点击“显示拼音”，每个字上方会出现带声调拼音，多音字按所在词语判断，例如“重要”标 zhòng、“重庆”标 chóng；点击“复制拼音”可得到整段拼音。自动注音仍可能出错，人名和少见词请再核对。"],
      ["识别出的繁体字能转成简体吗？", "可以。复制识别结果，粘贴到繁体转简体工具即可按词语转换，例如“頭髮”转为“头发”、“軟體”可转为“软件”。"],
      ["图片有格式和大小限制吗？", "支持 PNG、JPEG、WebP、HEIC 和 HEIF，原图不超过 24 MB。浏览器会先裁掉多余边缘，必要时把长边缩到 1600 像素以内、压缩到 2 MB 以下再上传。"],
      ["照片模糊或识别不准怎么办？", "让文字尽量占满画面、正对拍摄、光线均匀；屏幕上的文字最好直接截图，不要用手机翻拍。只查一个字时，把它裁大单独识别；书法字或生僻字也可以改用手写识字。"],
      ["需要注册或付费吗？", "不需要，打开网页即可免费使用。为防止滥用，短时间内请求过多时会提示稍后再试。"],
      ["能朗读识别出的文字吗？", "可以。点击“朗读”会用浏览器或系统自带的普通话语音读出全文，再点一次即可停止；选中某个字后点击“朗读这个字”可单独听发音。音色取决于设备，优先使用本机语音；只有在线语音时，要朗读的文字会发送给浏览器厂商的语音服务。"], ["OCR 是什么意思？", "OCR 是光学字符识别（Optical Character Recognition）的缩写，指从图片中识别文字并转成可编辑的文本。本页是专门识别汉字的在线 OCR：上传或粘贴图片后，识别出的简繁汉字可以复制、标注拼音并逐字查询。"]
    ],
    related: "相关汉字工具",
    relatedAria: "相关汉字与文字工具",
    links: [["image-redaction", "在线图片打码"], ["chinese-handwriting-recognition", "手写汉字识别"], ["chinese-character-lookup", "汉字查询与结构拆解"], ["chinese-stroke-order", "汉字笔顺查询"], ["chinese-to-pinyin", "汉字转拼音"], ["han-character-worksheet", "汉字练习纸"], ["traditional-to-simplified", "繁体转简体"]],
    footerText: "JianFan.app 提供拍照识字、手写查字、拼音、笔顺与中文转换工具。",
    messages: {
      waiting: "等待选择图片", processingImage: "正在自动裁剪并压缩图片", imageReady: "图片已处理，可以开始识别", compressionFailed: "图片处理后仍超过 2 MB，请重新拍摄或选择图片", emptyImage: "图片内容为空，请重新选择", sourceTooLarge: "原始图片不能超过 24 MB", unsupportedImage: "仅支持 PNG、JPEG、WebP、HEIC 或 HEIF 图片", imageSelected: "图片已选择", emptyPreviewTitle: "拍照或选择图片", emptyPreviewBody: "支持手机相机、相册和电脑图片", uploading: "正在上传并识别图片", recognizing: "正在识别图片中的汉字…", recognizedCharacter: "已识别为“{character}”", recognizedText: "已识别出汉字文本", noText: "识别服务没有返回可用的汉字文本", timeout: "识别请求超时，请检查网络后重试", networkError: "无法连接识别服务，请检查网络后重试", authError: "识别服务鉴权失败", uploadTooLarge: "处理后的图片超过 2 MB，请重新拍摄或选择图片", rateLimited: "请求次数过多，请稍后重试", serviceUnavailable: "识别服务暂时不可用，请稍后重试", resultEmpty: "选择图片后，点击“识别图片中的汉字”。", resultSummary: "识别到 {count} 个汉字", selectCharacter: "查询汉字“{character}”", copiedText: "已复制识别文字", copiedCharacter: "已复制“{character}”", copiedPinyin: "已复制拼音", speaking: "正在朗读", speechFinished: "朗读结束", speechStopped: "已停止朗读", speechUnavailable: "此设备或浏览器没有可用的中文朗读语音", stopSpeaking: "停止朗读", copyFailed: "自动复制失败，请直接选择文字复制", recognitionFailed: "识别失败"
    }
  },
  "zh-TW": {
    title: "線上拍照漢字辨識 - 圖片、截圖 OCR 轉文字 | JianFan.app",
    alternateNames: ["圖片辨識漢字", "拍照查字", "中文 OCR", "漢字圖片轉文字", "圖片文字辨識", "從圖片擷取文字", "線上 OCR", "圖片 OCR 辨識", "截圖辨識文字", "圖片轉拼音"],
    eyebrow: "拍照識字 · 截圖辨識 · 拼音標注",
    heading: "線上拍照漢字辨識",
    lede: "拍攝、上傳或直接貼上含有漢字的照片、截圖與掃描檔，通常幾秒就能擷取可複製文字；還能在每個字上方顯示漢語拼音、朗讀全文，點選任一漢字繼續查筆畫、筆順與字形結構。",
    toolTitle: "拍照或上傳圖片辨識漢字",
    sourceTitle: "選擇漢字圖片",
    sourceHint: "文字清晰完整較容易辨識；電腦上也可拖入圖片，或按 Ctrl+V 貼上截圖。",
    emptyPreviewTitle: "拍照或選擇圖片",
    emptyPreviewBody: "支援 PNG、JPEG、WebP、HEIC 和 HEIF",
    capture: "拍照或選擇圖片",
    reset: "重新選擇",
    recognize: "辨識圖片中的漢字",
    pasteHint: "也可拖入圖片或按 Ctrl+V / ⌘V 貼上截圖",
    showPinyin: "顯示拼音",
    copyPinyin: "複製拼音",
    speakText: "朗讀",
    speakCharacter: "朗讀這個字",
    resultTitle: "漢字辨識結果",
    resultHint: "可複製全文或顯示拼音；點選高亮漢字查看詳細資料。",
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
    privacy: "圖片會先在瀏覽器中自動裁切並壓縮；點選辨識後，處理過的圖片會上傳至 JianFan.app OCR 服務。請勿上傳含個人資料、證件或其他敏感資訊的圖片。朗讀使用瀏覽器或系統內建的語音；若只有線上語音可用，要朗讀的文字會傳送給瀏覽器廠商的語音服務。",
    featureKicker: "拍照識字 · 圖片轉文字 · 拍照查字",
    featureTitle: "從照片和圖片擷取漢字，再逐字查詢",
    featureIntro: "拍照識字就是用中文 OCR 把照片、截圖或掃描檔中的漢字轉成可複製文字。在本頁拍照、上傳或貼上截圖後點選辨識，通常幾秒內回傳結果，並可標注拼音、逐字查筆順。適合辨識書籍、菜單、路牌、課堂講義與聊天截圖中的正體字和簡體字。",
    cards: [["拍照、上傳或貼上截圖", "手機可直接開啟相機或相簿；電腦上可選擇檔案、把圖片拖進預覽區，或用 Ctrl+V（Mac 為 ⌘V）貼上剛擷取的螢幕截圖。"], ["辨識結果標注拼音", "開啟「顯示拼音」，每個漢字上方依詞語語境標注帶聲調的漢語拼音，例如「重要」標 zhòng、「重新」標 chóng，整段拼音可一鍵複製。"], ["點選漢字繼續查字", "點選結果中的任一漢字，即可查看漢語拼音、筆畫數與 Unicode 編碼，並前往筆順動畫或部件結構查詢。"]],
    howTitle: "如何線上拍照辨識漢字",
    steps: ["拍攝漢字，或選擇相簿、電腦中的圖片；電腦上也可拖入圖片或按 Ctrl+V 貼上截圖。", "確認自動裁切後的預覽，點選「辨識圖片中的漢字」，通常幾秒內回傳文字。", "複製全文或拼音、朗讀全文，或點選其中的漢字繼續查筆順和字形結構。"],
    faqTitle: "拍照漢字辨識常見問題",
    faqs: [["可以一次辨識多個漢字嗎？", "可以。圖片可包含單字、詞語或多行文字；回傳多字結果時，可複製全文，也能點選任一漢字查字。"], ["支援正體字和簡體字嗎？", "支援常見正體字和簡體字。模糊照片、藝術字、嚴重傾斜、反光或複雜背景可能影響中文 OCR 結果。"], ["圖片會在本機辨識嗎？", "不會完全在本機辨識。自動裁切和壓縮在瀏覽器中完成，處理後的圖片會上傳到 JianFan.app OCR 服務。"], ["拍照辨識和手寫辨識有何不同？", "本頁讀取照片或截圖中的漢字；手寫辨識頁則是在田字格逐畫書寫，依筆畫軌跡比對一個漢字。"], ["可以把圖片中的中文轉成可複製文字嗎？", "可以。本工具可用於中文圖片轉文字、圖片文字辨識和從圖片擷取文字，從手機照片、截圖或掃描檔擷取正體字與簡體字，結果可整段複製。"], ["截圖可以直接貼上辨識嗎？", "可以。在電腦上用 Win+Shift+S、Mac 的 Control+Shift+Command+4 或通訊軟體截圖後，回到本頁按 Ctrl+V（Mac 為 ⌘V）即可載入，再點選辨識；也可以把圖檔直接拖到預覽區。"], ["能把圖片裡的漢字直接標上拼音嗎？", "可以。辨識後點選「顯示拼音」，每個字上方會出現帶聲調的漢語拼音，多音字依所在詞語判斷，例如「重要」標 zhòng、「重新」標 chóng；點選「複製拼音」可取得整段拼音。正體字的多音字較容易判斷錯誤，人名和少見詞請再核對。"], ["辨識出的簡體字能轉成繁體嗎？", "可以。複製辨識結果，貼到簡體轉繁體工具即可依詞語轉換，例如「头发」轉為「頭髮」、「出发」轉為「出發」，也能選擇台灣用詞。"], ["圖片有格式和大小限制嗎？", "支援 PNG、JPEG、WebP、HEIC 和 HEIF，原圖不超過 24 MB。瀏覽器會先裁掉多餘邊緣，必要時把長邊縮到 1600 像素以內、壓縮到 2 MB 以下再上傳。"], ["照片模糊或辨識不準怎麼辦？", "讓文字盡量占滿畫面、正對拍攝、光線均勻；螢幕上的文字最好直接截圖，不要用手機翻拍。只查一個字時，把它裁大單獨辨識；書法字或罕用字也可以改用手寫辨識。"], ["需要註冊或付費嗎？", "不需要，開啟網頁即可免費使用。為防止濫用，短時間內請求過多時會提示稍後再試。"], ["能朗讀辨識出的文字嗎？", "可以。點選「朗讀」會用瀏覽器或系統內建的國語語音讀出全文，再點一次即可停止；選取某個字後點選「朗讀這個字」可單獨聽發音。音色取決於裝置，優先使用本機語音；只有線上語音時，要朗讀的文字會傳送給瀏覽器廠商的語音服務。"], ["OCR 是什麼意思？", "OCR 是光學字元辨識（Optical Character Recognition）的縮寫，指從圖片中辨識文字並轉成可編輯的文字。本頁是專門辨識漢字的線上 OCR：上傳或貼上圖片後，辨識出的正簡體字可以複製、標注拼音並逐字查詢。"]],
    related: "相關漢字工具",
    relatedAria: "相關漢字與文字工具",
    links: [["image-redaction", "線上圖片打馬賽克"], ["chinese-handwriting-recognition", "手寫漢字辨識"], ["chinese-character-lookup", "漢字查詢與結構拆解"], ["chinese-stroke-order", "漢字筆順查詢"], ["chinese-to-pinyin", "漢字轉拼音"], ["han-character-worksheet", "國字練習紙"], ["simplified-to-traditional", "簡體轉繁體"]],
    footerText: "JianFan.app 提供拍照識字、手寫查字、拼音、筆順與中文轉換工具。",
    messages: {
      waiting: "等待選擇圖片", processingImage: "正在自動裁切並壓縮圖片", imageReady: "圖片已處理，可以開始辨識", compressionFailed: "圖片處理後仍超過 2 MB，請重新拍攝或選擇圖片", emptyImage: "圖片內容為空，請重新選擇", sourceTooLarge: "原始圖片不能超過 24 MB", unsupportedImage: "僅支援 PNG、JPEG、WebP、HEIC 或 HEIF 圖片", imageSelected: "圖片已選擇", emptyPreviewTitle: "拍照或選擇圖片", emptyPreviewBody: "支援手機相機、相簿和電腦圖片", uploading: "正在上傳並辨識圖片", recognizing: "正在辨識圖片中的漢字…", recognizedCharacter: "已辨識為「{character}」", recognizedText: "已辨識出漢字文字", noText: "辨識服務沒有回傳可用的漢字文字", timeout: "辨識逾時，請檢查網路後再試一次", networkError: "無法連線辨識服務，請檢查網路後再試一次", authError: "辨識服務驗證失敗", uploadTooLarge: "處理後的圖片超過 2 MB，請重新拍攝或選擇圖片", rateLimited: "辨識次數過多，請稍後再試", serviceUnavailable: "辨識服務暫時無法使用，請稍後再試", resultEmpty: "選擇圖片後，點選「辨識圖片中的漢字」。", resultSummary: "辨識到 {count} 個漢字", selectCharacter: "查詢漢字「{character}」", copiedText: "已複製辨識文字", copiedCharacter: "已複製「{character}」", copiedPinyin: "已複製拼音", speaking: "正在朗讀", speechFinished: "朗讀結束", speechStopped: "已停止朗讀", speechUnavailable: "此裝置或瀏覽器沒有可用的中文朗讀語音", stopSpeaking: "停止朗讀", copyFailed: "自動複製失敗，請直接選取文字複製", recognitionFailed: "辨識失敗"
    }
  },
  en: {
    title: "Chinese OCR Online - Image to Text with Pinyin | JianFan.app",
    alternateNames: ["Chinese photo OCR", "Recognize Chinese characters from image", "Hanzi image to text", "Chinese OCR online", "Chinese image to text", "Chinese image to Pinyin", "Copy Chinese text from image"],
    eyebrow: "CHINESE OCR · SCREENSHOT PASTE · PINYIN",
    heading: "Chinese OCR: Image to Text with Pinyin",
    lede: "Take, upload or paste a photo, screenshot or scan with Chinese characters. In a few seconds you get copyable text with optional Pinyin above every Hanzi and read-aloud audio, and you can tap any character for its stroke count, order and structure.",
    toolTitle: "Recognize Chinese characters in an image",
    sourceTitle: "Choose a Chinese text image",
    sourceHint: "Sharp, complete characters work best. On a computer you can also drop an image here or press Ctrl+V to paste a screenshot.",
    emptyPreviewTitle: "Take or choose a photo",
    emptyPreviewBody: "PNG, JPEG, WebP, HEIC and HEIF supported",
    capture: "Take or choose a photo",
    reset: "Choose again",
    recognize: "Recognize Chinese characters",
    pasteHint: "Or drop an image, or paste a screenshot with Ctrl+V / ⌘V",
    showPinyin: "Show Pinyin",
    copyPinyin: "Copy Pinyin",
    speakText: "Read aloud",
    speakCharacter: "Hear this character",
    resultTitle: "OCR result",
    resultHint: "Copy the text, show Pinyin, or tap a highlighted Hanzi for details.",
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
    privacy: "Your browser automatically crops and compresses the image first. When you start recognition, the processed image is uploaded to the JianFan.app OCR service. Do not upload images containing personal, identity or other sensitive information. Read aloud uses your browser's or system's built-in voices; if only an online voice is available, the text being read is sent to the browser vendor's speech service.",
    featureKicker: "Chinese character recognition · Image to text · Pinyin",
    featureTitle: "Extract Chinese text from images, then inspect each Hanzi",
    featureIntro: "Chinese OCR turns the Chinese characters in a photo, screenshot or scan into text you can copy. Take, upload or paste an image here, start recognition and you usually get the result within seconds, with Pinyin above each character when you want it. Use this free Chinese OCR online as an image-to-text tool for books, menus, signs, worksheets, chat screenshots and printed documents in Simplified or Traditional Chinese.",
    cards: [["Take, upload or paste", "Open the phone camera or photo library. On a computer, choose a file, drag an image onto the preview, or paste a fresh screenshot with Ctrl+V (⌘V on a Mac)."], ["Pinyin above every character", "Turn on Show Pinyin to see tone-marked Pinyin over each Hanzi, chosen from the surrounding word: 重 reads zhòng in 重要 and chóng in 重庆. Copy all of the Pinyin in one click."], ["Tap a Hanzi to look it up", "Select any character in the result to see its Pinyin, stroke count and Unicode code point, then open the stroke-order animation or component lookup."]],
    howTitle: "How to recognize Chinese characters from a photo",
    steps: ["Photograph the Chinese text or choose an image. On a computer you can also drag in an image or paste a screenshot with Ctrl+V.", "Check the automatically cropped preview, select “Recognize Chinese characters” and wait a few seconds.", "Copy the text or its Pinyin, listen to it read aloud, or tap a Hanzi to check its stroke order and structure."],
    faqTitle: "Chinese photo OCR questions",
    faqs: [["Can it recognize more than one Chinese character?", "Yes. An image may contain one Hanzi, a phrase or several lines. Copy the complete result or tap any recognized character to look it up."], ["Does it support Simplified and Traditional Chinese?", "It supports common Simplified and Traditional characters. Blur, stylized lettering, glare, steep angles and busy backgrounds can reduce OCR accuracy."], ["Does recognition run entirely in my browser?", "No. Cropping and compression run in your browser, then the processed image is uploaded to the JianFan.app OCR service for recognition."], ["How is photo OCR different from handwriting recognition?", "This page reads Chinese text from a photo or screenshot. The handwriting tool matches one character from strokes drawn in its writing grid."], ["Can this Chinese OCR convert an image to editable text?", "Yes. Upload a photo, screenshot or scan containing Simplified or Traditional Chinese. The Chinese image-to-text result can be copied in full, or you can tap a Hanzi to look it up."], ["Can I paste a screenshot instead of saving a file?", "Yes. Take a screenshot with Win+Shift+S on Windows or Control+Shift+Command+4 on a Mac, return to this page and press Ctrl+V (⌘V). You can also drag an image file onto the preview."], ["Can it show Pinyin for Chinese text in a picture?", "Yes. After recognition, select Show Pinyin to add tone-marked Pinyin above each character, or Copy Pinyin to copy it as text. Polyphonic characters follow the word, for example 重要 zhòng yào and 重庆 chóng qìng, but check names and rare words."], ["How can I read Chinese from a blurry photo or an old document?", "Fill the frame with the text, shoot straight on in even light, and take a screenshot of on-screen text instead of photographing the screen. For one unclear character, crop it large and recognize it alone, or draw it in the handwriting tool."], ["Can I convert recognized Traditional Chinese to Simplified?", "Yes. Copy the result and paste it into the Traditional to Simplified converter, which converts by word, for example 頭髮 to 头发 and 軟體 to 软件."], ["What image formats and sizes are supported?", "PNG, JPEG, WebP, HEIC and HEIF up to 24 MB. The browser trims empty borders and, when needed, scales the longer side to 1,600 pixels and compresses the image below 2 MB before upload."], ["Is it free, and do I need an account?", "It is free and needs no sign-up. To prevent abuse, sending many requests in a short time shows a message asking you to try again later."], ["Can it read the recognized Chinese aloud?", "Yes. Select Read aloud to hear the full text in a Mandarin voice from your browser or system, and select it again to stop. After choosing a character, Hear this character plays it alone. Voices depend on your device; on-device voices are preferred, and if only an online voice exists, the text is sent to the browser vendor's speech service."], ["What does OCR mean?", "OCR stands for optical character recognition: software reads the text in an image and turns it into editable text. This page is an online OCR for Chinese characters, so you can copy the recognized Simplified or Traditional text, add Pinyin and look up each Hanzi."]],
    related: "Related Chinese tools",
    relatedAria: "Related Chinese character and text tools",
    links: [["image-redaction", "Image redaction tool"], ["chinese-handwriting-recognition", "Chinese handwriting recognition"], ["chinese-character-lookup", "Chinese character lookup"], ["chinese-stroke-order", "Chinese stroke order"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["han-character-worksheet", "Chinese worksheet generator"], ["traditional-to-simplified", "Traditional to Simplified Chinese"]],
    footerText: "JianFan.app provides Chinese photo OCR, handwriting, Pinyin, stroke-order and text-conversion tools.",
    messages: {
      waiting: "Waiting for an image", processingImage: "Cropping and compressing the image", imageReady: "Image ready for recognition", compressionFailed: "The processed image is larger than 2 MB. Take another photo or choose a different image", emptyImage: "The image is empty. Choose another file", sourceTooLarge: "The original image must be 24 MB or smaller", unsupportedImage: "Use a PNG, JPEG, WebP, HEIC or HEIF image", imageSelected: "Image selected", emptyPreviewTitle: "Take or choose a photo", emptyPreviewBody: "Use the camera, photo library or a desktop image", uploading: "Uploading and recognizing the image", recognizing: "Recognizing Chinese characters…", recognizedCharacter: "Recognized as “{character}”", recognizedText: "Chinese text recognized", noText: "No usable Chinese text was returned", timeout: "Recognition timed out. Check your connection and try again", networkError: "Could not reach the recognition service. Check your connection and try again", authError: "Recognition service authorization failed", uploadTooLarge: "The processed image is larger than 2 MB. Take another photo or choose a different image", rateLimited: "Too many recognition requests. Try again later", serviceUnavailable: "Recognition is temporarily unavailable. Try again later", resultEmpty: "Choose an image, then select “Recognize Chinese characters”.", resultSummary: "{count} Chinese characters recognized", selectCharacter: "Look up Chinese character {character}", copiedText: "Extracted text copied", copiedCharacter: "Copied “{character}”", copiedPinyin: "Pinyin copied", speaking: "Reading aloud", speechFinished: "Finished reading", speechStopped: "Reading stopped", speechUnavailable: "No Chinese voice is available in this browser or device", stopSpeaking: "Stop reading", copyFailed: "Automatic copy failed. Select and copy the text directly", recognitionFailed: "Recognition failed"
    }
  },
  ja: {
    title: "中国語OCR - 画像の漢字を文字起こし・ピンイン表示 | JianFan.app",
    alternateNames: ["中国語OCR", "中国語画像OCR", "中国語 画像 文字起こし", "写真から漢字を認識", "画像の漢字を文字に変換", "中国語画像テキスト化", "画像から中国語テキスト抽出"],
    eyebrow: "中国語OCR · スクショ貼り付け · ピンイン表示",
    heading: "中国語OCR：画像の漢字を文字起こし",
    lede: "中国語の漢字が写った写真、スクリーンショット、スキャン画像を撮影・選択・貼り付けすると、通常数秒でコピーできるテキストに変換します。各漢字の上にピンインを表示したり読み上げを聞いたりでき、漢字を選べば画数、筆順、字形構成も確認できます。",
    toolTitle: "画像から中国語の漢字を読み取る",
    sourceTitle: "漢字が写った画像を選択",
    sourceHint: "文字が鮮明に写っているほど正確です。パソコンでは画像のドラッグ＆ドロップや Ctrl+V でのスクショ貼り付けもできます。",
    emptyPreviewTitle: "撮影または画像を選択",
    emptyPreviewBody: "PNG、JPEG、WebP、HEIC、HEIFに対応",
    capture: "撮影または画像を選択",
    reset: "選び直す",
    recognize: "画像の漢字を認識",
    pasteHint: "画像をドロップ、または Ctrl+V / ⌘V でスクショを貼り付け",
    showPinyin: "ピンインを表示",
    copyPinyin: "ピンインをコピー",
    speakText: "読み上げ",
    speakCharacter: "この字を発音",
    resultTitle: "文字認識の結果",
    resultHint: "全文コピーやピンイン表示ができます。ハイライトされた漢字を選ぶと詳細を確認できます。",
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
    privacy: "画像はブラウザーで自動的にトリミング・圧縮されます。認識を開始すると、処理済み画像が JianFan.app OCR サービスへ送信されます。個人情報、身分証明書など機密情報を含む画像はアップロードしないでください。読み上げにはブラウザーまたはOS標準の音声を使います。オンライン音声しかない場合、読み上げる文字はブラウザー提供元の音声サービスへ送信されます。",
    featureKicker: "中国語画像OCR・画像テキスト化",
    featureTitle: "写真から中国語テキストを抽出し、漢字を検索",
    featureIntro: "中国語画像OCRは、写真やスクリーンショットに写った中国語の漢字をコピーできるテキストに変換する機能です。このページでは撮影・アップロード・貼り付けのあと認識ボタンを押すと通常数秒で結果が返り、ピンイン表示や1文字ずつの筆順検索もできます。書籍、メニュー、看板、学習プリント、SNSのスクショなど、中国語の画像から文字起こししたいときに使えます。",
    cards: [["撮影・アップロード・貼り付け", "スマートフォンではカメラや写真ライブラリを開けます。パソコンではファイル選択、プレビューへのドラッグ、Ctrl+V（Macは⌘V）でのスクショ貼り付けに対応します。"], ["認識結果にピンインを表示", "「ピンインを表示」をオンにすると、各漢字の上に声調付きピンインが付きます。多音字は語に合わせて判定され、重要は zhòng、重庆は chóng と表示されます。"], ["漢字を選んで検索", "結果の漢字を選ぶと中国語ピンイン、画数、Unicodeを表示し、筆順アニメーションや構成検索へ進めます。"]],
    howTitle: "写真から中国語漢字を認識する方法",
    steps: ["漢字を撮影するか画像を選びます。パソコンでは画像をドラッグするか、Ctrl+V でスクショを貼り付けることもできます。", "自動トリミングされたプレビューを確認し、「画像の漢字を認識」を押すと通常数秒で結果が出ます。", "全文やピンインをコピーしたり読み上げを聞いたりし、漢字を選んで筆順や字形構成を調べます。"],
    faqTitle: "中国語画像OCRのよくある質問",
    faqs: [["複数の漢字を一度に認識できますか？", "はい。1文字、単語、複数行の画像に対応します。結果全体をコピーするほか、各漢字を選んで詳しく調べられます。"], ["簡体字と繁体字に対応していますか？", "一般的な簡体字・繁体字に対応します。ぼけ、装飾文字、反射、強い傾き、複雑な背景は認識精度を下げる場合があります。"], ["画像認識はブラウザー内だけで行われますか？", "いいえ。トリミングと圧縮はブラウザー内で行い、処理済み画像を JianFan.app OCR サービスへ送信して認識します。"], ["手書き漢字検索との違いは？", "このページは写真やスクリーンショットを読み取ります。手書き検索はマスに1画ずつ書いた筆跡から漢字候補を探します。"], ["中国語の画像をテキスト化できますか？", "はい。中国語画像OCRとして、写真、スクリーンショット、スキャン画像から簡体字・繁体字を抽出できます。結果全体をコピーするほか、漢字ごとの検索も可能です。"], ["スクリーンショットを貼り付けて認識できますか？", "はい。Windows の Win+Shift+S や Mac の Control+Shift+Command+4 でスクショを撮り、このページで Ctrl+V（Macは⌘V）を押すと読み込めます。画像ファイルをプレビューにドラッグすることもできます。"], ["画像の中国語にピンインを付けられますか？", "はい。認識後に「ピンインを表示」を押すと各漢字の上に声調付きピンインが表示され、「ピンインをコピー」でテキストとしてコピーできます。多音字は語に合わせて判定しますが、人名や珍しい語の読みは確認してください。"], ["対応する画像形式とサイズは？", "PNG、JPEG、WebP、HEIC、HEIF の24 MBまでの画像に対応します。送信前にブラウザーで余白を切り取り、必要に応じて長辺1600ピクセル以内・2 MB未満に圧縮します。"], ["ぼやけた写真でうまく認識できないときは？", "文字を画面いっぱいに写し、正面から均一な明るさで撮影してください。画面上の文字は撮影せずスクショにすると正確です。1文字だけ調べたい場合は大きく切り抜くか、手書き検索を使ってください。"], ["無料ですか？登録は必要ですか？", "無料で、登録は不要です。不正利用を防ぐため、短時間に多数のリクエストを送ると、しばらく待ってから再試行するよう表示されます。"], ["認識した中国語を読み上げできますか？", "はい。「読み上げ」を押すとブラウザーまたはOS標準の中国語（普通話）音声で全文を読み上げ、もう一度押すと止まります。漢字を選んで「この字を発音」を押すと1文字だけ聞けます。端末内の音声を優先し、オンライン音声しかない場合は読み上げる文字がブラウザー提供元の音声サービスへ送信されます。"], ["OCRとは何の略ですか？", "OCRは Optical Character Recognition（光学文字認識）の略で、画像に写った文字を読み取り、編集できるテキストに変換する技術です。このページは中国語の漢字に特化したWeb版OCRで、認識した簡体字・繁体字をコピーし、ピンインを付けて1文字ずつ調べられます。"]],
    related: "関連する漢字ツール",
    relatedAria: "関連する中国語漢字ツール",
    links: [["image-redaction", "画像モザイク加工"], ["chinese-handwriting-recognition", "中国語の手書き漢字検索"], ["chinese-character-lookup", "漢字の構成・部首検索"], ["chinese-stroke-order", "中国語漢字の筆順"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["han-character-worksheet", "漢字練習プリント"]],
    footerText: "JianFan.app は中国語画像OCR、手書き検索、ピンイン、筆順、文字変換ツールを提供します。",
    messages: {
      waiting: "画像を選択してください", processingImage: "画像をトリミング・圧縮しています", imageReady: "画像の準備ができました", compressionFailed: "処理後の画像が2 MBを超えています。撮り直すか、別の画像を選んでください", emptyImage: "画像が空です。別の画像を選んでください", sourceTooLarge: "元画像は24 MB以下にしてください", unsupportedImage: "PNG、JPEG、WebP、HEIC、HEIF画像を使用してください", imageSelected: "画像を選択しました", emptyPreviewTitle: "撮影または画像を選択", emptyPreviewBody: "カメラ、写真ライブラリ、パソコンの画像に対応", uploading: "画像を送信して認識しています", recognizing: "画像の漢字を認識しています…", recognizedCharacter: "「{character}」と認識しました", recognizedText: "中国語テキストを認識しました", noText: "利用できる漢字テキストが返されませんでした", timeout: "認識がタイムアウトしました。通信を確認してもう一度お試しください", networkError: "認識サービスに接続できません。通信を確認してもう一度お試しください", authError: "認識サービスの認証に失敗しました", uploadTooLarge: "処理後の画像が2 MBを超えています。撮り直すか、別の画像を選んでください", rateLimited: "認識回数が上限に達しました。しばらくしてからもう一度お試しください", serviceUnavailable: "認識サービスを一時的に利用できません。後でもう一度お試しください", resultEmpty: "画像を選び、「画像の漢字を認識」を押してください。", resultSummary: "漢字を {count} 文字認識しました", selectCharacter: "漢字「{character}」を調べる", copiedText: "認識結果をコピーしました", copiedCharacter: "「{character}」をコピーしました", copiedPinyin: "ピンインをコピーしました", speaking: "読み上げ中", speechFinished: "読み上げが終わりました", speechStopped: "読み上げを停止しました", speechUnavailable: "このブラウザーまたは端末で使える中国語の音声がありません", stopSpeaking: "読み上げを停止", copyFailed: "自動コピーに失敗しました。文字を選択してコピーしてください", recognitionFailed: "認識に失敗しました"
    }
  },
  ko: {
    title: "중국어 이미지 OCR - 사진 한자 인식·텍스트 추출 | JianFan.app",
    alternateNames: ["중국어 이미지 OCR", "사진 한자 인식", "이미지 한자 텍스트 변환", "이미지 텍스트 추출", "사진으로 한자 찾기"],
    eyebrow: "중국어 OCR · 스크린샷 붙여넣기 · 병음 표시",
    heading: "사진으로 중국 한자 인식",
    lede: "중국 한자가 있는 사진, 스크린샷, 스캔 이미지를 촬영·선택·붙여넣기하면 보통 몇 초 안에 복사 가능한 텍스트로 바꿉니다. 각 한자 위에 중국어 병음을 표시하고 소리 내어 읽을 수 있으며, 한자를 누르면 획수, 필순과 글자 구조도 확인할 수 있습니다.",
    toolTitle: "이미지에서 중국 한자 인식",
    sourceTitle: "한자가 있는 이미지 선택",
    sourceHint: "글자가 선명하고 온전할수록 정확합니다. PC에서는 이미지를 끌어다 놓거나 Ctrl+V로 스크린샷을 붙여넣을 수도 있습니다.",
    emptyPreviewTitle: "촬영하거나 이미지 선택",
    emptyPreviewBody: "PNG, JPEG, WebP, HEIC, HEIF 지원",
    capture: "촬영하거나 이미지 선택",
    reset: "다시 선택",
    recognize: "이미지 속 한자 인식",
    pasteHint: "이미지를 끌어다 놓거나 Ctrl+V / ⌘V로 스크린샷 붙여넣기",
    showPinyin: "병음 표시",
    copyPinyin: "병음 복사",
    speakText: "소리 내어 읽기",
    speakCharacter: "이 글자 발음 듣기",
    resultTitle: "한자 인식 결과",
    resultHint: "전체 텍스트를 복사하거나 병음을 표시하고, 강조된 한자를 눌러 상세 정보를 확인하세요.",
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
    privacy: "이미지는 먼저 브라우저에서 자동 자르기와 압축을 거칩니다. 인식을 시작하면 처리된 이미지가 JianFan.app OCR 서비스로 전송됩니다. 개인정보, 신분증 또는 민감한 정보가 포함된 이미지는 올리지 마세요.소리 내어 읽기는 브라우저나 운영체제의 기본 음성을 사용합니다. 온라인 음성만 있으면 읽을 텍스트가 브라우저 제공업체의 음성 서비스로 전송됩니다.",
    featureKicker: "중국어 이미지 OCR·이미지 텍스트 추출",
    featureTitle: "사진에서 중국어 텍스트를 추출하고 한자 찾기",
    featureIntro: "중국어 이미지 OCR은 사진이나 스크린샷 속 중국 한자를 복사할 수 있는 텍스트로 바꾸는 기능입니다. 이 페이지에서 촬영·업로드·붙여넣기 후 인식을 누르면 보통 몇 초 안에 결과가 나오고, 병음 표시와 한 글자씩 필순 찾기도 할 수 있습니다. 책, 메뉴판, 간판, 학습 자료와 메신저 스크린샷에서 사진으로 한자 찾기나 중국어 이미지 텍스트 추출이 필요할 때 쓰세요.",
    cards: [["촬영·업로드·붙여넣기", "휴대폰에서는 카메라나 사진 보관함을 열 수 있습니다. PC에서는 파일 선택, 미리보기로 끌어다 놓기, Ctrl+V(Mac은 ⌘V)로 스크린샷 붙여넣기를 지원합니다."], ["인식 결과에 병음 표시", "‘병음 표시’를 켜면 각 한자 위에 성조가 있는 중국어 병음이 붙습니다. 다음자는 단어에 맞춰 판단해 重要는 zhòng, 重庆은 chóng으로 표시합니다."], ["한자를 눌러 찾기", "결과의 한자를 누르면 중국어 병음, 획수와 Unicode를 확인하고 필순 애니메이션이나 구조 검색으로 이동할 수 있습니다."]],
    howTitle: "사진으로 중국 한자를 인식하는 방법",
    steps: ["한자를 촬영하거나 이미지를 선택합니다. PC에서는 이미지를 끌어다 놓거나 Ctrl+V로 스크린샷을 붙여넣을 수도 있습니다.", "자동으로 잘린 미리보기를 확인하고 ‘이미지 속 한자 인식’을 누르면 보통 몇 초 안에 결과가 나옵니다.", "전체 텍스트나 병음을 복사하거나 소리 내어 읽고, 한자를 눌러 필순과 글자 구조를 확인합니다."],
    faqTitle: "중국어 이미지 OCR 자주 묻는 질문",
    faqs: [["한자를 여러 글자 인식할 수 있나요?", "네. 한 글자, 단어 또는 여러 줄이 있는 이미지를 인식할 수 있습니다. 전체 결과를 복사하거나 각 한자를 눌러 찾으세요."], ["간체자와 번체자를 지원하나요?", "일반적인 중국어 간체자와 번체자를 지원합니다. 흐림, 장식 글꼴, 반사, 심한 기울기와 복잡한 배경은 정확도를 낮출 수 있습니다."], ["이미지 인식이 브라우저에서만 처리되나요?", "아닙니다. 자르기와 압축은 브라우저에서 처리하고, 처리된 이미지는 JianFan.app OCR 서비스로 전송해 인식합니다."], ["손글씨 한자 인식과 무엇이 다른가요?", "이 페이지는 사진이나 스크린샷을 읽습니다. 손글씨 도구는 쓰기 칸에 한 획씩 그린 궤적으로 한 글자를 찾습니다."], ["사진 속 중국어를 텍스트로 추출할 수 있나요?", "네. 중국어 이미지 OCR로 사진, 스크린샷과 스캔 이미지에서 간체자와 번체자를 추출할 수 있습니다. 이미지 텍스트 추출 결과를 복사하거나 한자를 눌러 상세 정보를 확인하세요."], ["스크린샷을 바로 붙여넣어 인식할 수 있나요?", "네. Windows의 Win+Shift+S나 Mac의 Control+Shift+Command+4로 화면을 캡처한 뒤 이 페이지에서 Ctrl+V(Mac은 ⌘V)를 누르면 불러옵니다. 이미지 파일을 미리보기로 끌어다 놓아도 됩니다."], ["사진 속 중국어에 병음을 달 수 있나요?", "네. 인식 후 ‘병음 표시’를 누르면 각 한자 위에 성조가 있는 병음이 나타나고, ‘병음 복사’로 텍스트처럼 복사할 수 있습니다. 다음자는 단어에 맞춰 판단하지만 인명이나 드문 단어의 읽기는 한 번 더 확인하세요."], ["한국 한자음과 뜻도 알 수 있나요?", "이 페이지는 중국어 병음을 보여 줍니다. 한국 한자음과 뜻은 인식한 한자를 복사해 한자 사전에서 찾아보세요. 예를 들어 學은 ‘배울 학’으로 나옵니다."], ["지원하는 이미지 형식과 크기는?", "PNG, JPEG, WebP, HEIC, HEIF 이미지를 24 MB까지 지원합니다. 전송 전에 브라우저에서 여백을 자르고, 필요하면 긴 변을 1600픽셀 이하·2 MB 미만으로 압축합니다."], ["사진이 흐려서 인식이 잘 안 되면?", "글자가 화면을 채우도록 정면에서 고른 조명으로 찍으세요. 화면 속 글자는 촬영하지 말고 스크린샷을 쓰는 편이 정확합니다. 한 글자만 찾을 때는 크게 잘라 인식하거나 손글씨 인식을 이용하세요."], ["무료인가요? 가입이 필요한가요?", "무료이며 가입이 필요 없습니다. 남용을 막기 위해 짧은 시간에 요청이 너무 많으면 잠시 후 다시 시도하라는 안내가 표시됩니다."], ["인식한 중국어를 소리 내어 읽어 주나요?", "네. ‘소리 내어 읽기’를 누르면 브라우저나 운영체제의 중국어(표준어) 음성으로 전체를 읽고, 다시 누르면 멈춥니다. 한자를 선택하고 ‘이 글자 발음 듣기’를 누르면 한 글자만 들을 수 있습니다. 기기 내 음성을 우선 사용하며, 온라인 음성만 있으면 읽을 텍스트가 브라우저 제공업체의 음성 서비스로 전송됩니다."], ["OCR 뜻이 무엇인가요?", "OCR은 Optical Character Recognition(광학 문자 인식)의 줄임말로, 이미지 속 글자를 읽어 편집할 수 있는 텍스트로 바꾸는 기술입니다. 이 페이지는 중국 한자 전용 온라인 OCR로, 인식한 간체자·번체자를 복사하고 병음을 달아 한 글자씩 찾아볼 수 있습니다."]],
    related: "관련 한자 도구",
    relatedAria: "관련 중국어 한자와 텍스트 도구",
    links: [["image-redaction", "사진 모자이크"], ["chinese-handwriting-recognition", "중국 한자 손글씨 인식"], ["chinese-character-lookup", "한자 부수·구성요소 검색"], ["chinese-stroke-order", "중국어 한자 필순"], ["chinese-to-pinyin", "중국어 병음 변환"], ["han-character-worksheet", "한자 쓰기 연습장"], ["korean-hanja-dictionary", "한자 사전"]],
    footerText: "JianFan.app는 중국어 이미지 OCR, 손글씨, 병음, 필순과 텍스트 변환 도구를 제공합니다.",
    messages: {
      waiting: "이미지를 선택하세요", processingImage: "이미지를 자동으로 자르고 압축하는 중", imageReady: "이미지 준비가 완료되었습니다", compressionFailed: "처리된 이미지가 2 MB를 넘습니다. 다시 촬영하거나 다른 이미지를 선택하세요", emptyImage: "이미지가 비어 있습니다. 다른 파일을 선택하세요", sourceTooLarge: "원본 이미지는 24 MB 이하여야 합니다", unsupportedImage: "PNG, JPEG, WebP, HEIC 또는 HEIF 이미지를 사용하세요", imageSelected: "이미지를 선택했습니다", emptyPreviewTitle: "촬영하거나 이미지 선택", emptyPreviewBody: "카메라, 사진 보관함과 PC 이미지 지원", uploading: "이미지를 전송하고 인식하는 중", recognizing: "이미지 속 한자를 인식하는 중…", recognizedCharacter: "‘{character}’로 인식했습니다", recognizedText: "중국어 텍스트를 인식했습니다", noText: "사용할 수 있는 한자 텍스트가 반환되지 않았습니다", timeout: "인식 시간이 초과되었습니다. 네트워크를 확인하고 다시 시도하세요", networkError: "인식 서비스에 연결할 수 없습니다. 네트워크를 확인하고 다시 시도하세요", authError: "인식 서비스 인증에 실패했습니다", uploadTooLarge: "처리된 이미지가 2 MB를 넘습니다. 다시 촬영하거나 다른 이미지를 선택하세요", rateLimited: "인식 요청이 너무 많습니다. 잠시 후 다시 시도하세요", serviceUnavailable: "인식 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요", resultEmpty: "이미지를 선택한 뒤 ‘이미지 속 한자 인식’을 누르세요.", resultSummary: "한자 {count}자를 인식했습니다", selectCharacter: "한자 ‘{character}’ 찾기", copiedText: "인식한 텍스트를 복사했습니다", copiedCharacter: "‘{character}’를 복사했습니다", copiedPinyin: "병음을 복사했습니다", speaking: "읽는 중", speechFinished: "읽기를 마쳤습니다", speechStopped: "읽기를 멈췄습니다", speechUnavailable: "이 브라우저나 기기에서 사용할 수 있는 중국어 음성이 없습니다", stopSpeaking: "읽기 중지", copyFailed: "자동 복사에 실패했습니다. 텍스트를 직접 선택해 복사하세요", recognitionFailed: "인식에 실패했습니다"
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
    <link rel="stylesheet" href="/styles.min.css" />
    <script src="/theme.js"></script>
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
      <nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${localeOptions}</select></label><button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false"></button></nav>
    </header>

    <main id="main" class="photo-ocr-main">
      <section class="tool-hero photo-ocr-hero" aria-labelledby="pageTitle">
        <div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div>
        <div class="photo-ocr-signal" aria-hidden="true"><span>PHOTO</span><strong>字</strong><b>OCR</b></div>
      </section>

      <section class="standalone-tool photo-ocr-tool" aria-labelledby="photoToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">PHOTO / OCR</p><h2 id="photoToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="photoOcrStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.waiting}</span></div></div>
        <div class="photo-ocr-workspace">
          <section class="photo-ocr-panel" id="photoSourcePanel" aria-labelledby="photoSourceTitle">
            <div class="photo-ocr-panel-head"><span class="photo-ocr-step" aria-hidden="true">01</span><div><h3 id="photoSourceTitle">${page.sourceTitle}</h3><p>${page.sourceHint}</p></div></div>
            <div class="photo-ocr-capture-row"><button class="photo-ocr-capture" id="photoCapture" type="button">${page.capture}</button><input class="visually-hidden" id="photoInput" aria-labelledby="photoCapture" tabindex="-1" type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif" capture="environment" /><button class="photo-ocr-secondary" id="photoReset" type="button" disabled>${page.reset}</button></div>
            <button class="photo-ocr-recognize" id="photoRecognize" type="button" disabled>${page.recognize}</button>
            <div class="photo-ocr-canvas-frame is-empty" id="photoSourceFrame"><canvas id="photoSourceCanvas" aria-label="${page.sourceTitle}"></canvas><div class="photo-ocr-empty" id="photoSourceEmpty"><strong>${page.emptyPreviewTitle}</strong><span>${page.emptyPreviewBody}</span><em class="photo-ocr-paste-hint">${page.pasteHint}</em></div></div>
          </section>

          <section class="photo-ocr-results" aria-labelledby="photoResultsTitle">
            <div class="photo-ocr-panel-head"><span class="photo-ocr-step" aria-hidden="true">02</span><div><h3 id="photoResultsTitle">${page.resultTitle}</h3><p>${page.resultHint}</p></div></div>
            <p class="photo-ocr-results-empty" id="photoResultsEmpty">${page.resultEmpty}</p>
            <div class="photo-ocr-result-text" id="photoResultText" role="region" aria-live="polite" aria-label="${page.resultTitle}" hidden></div>
            <div class="photo-ocr-result-actions" id="photoTextActions" hidden><output id="photoResultSummary"></output><button class="photo-ocr-pinyin-toggle" id="photoPinyinToggle" type="button" aria-pressed="false">${page.showPinyin}</button><button id="photoCopyPinyin" type="button" hidden>${page.copyPinyin}</button><button class="photo-ocr-speak" id="photoSpeakText" type="button" aria-pressed="false" hidden>${page.speakText}</button><a id="photoPinyinText" href="${localPath(locale, "chinese-to-pinyin")}" hidden>${page.textPinyin}</a><button id="photoCopyText" type="button">${page.copyText}</button></div>
            <article class="photo-ocr-character-detail" id="photoCharacterDetail" aria-labelledby="photoCharacterDetailTitle" hidden><h4 class="visually-hidden" id="photoCharacterDetailTitle">${page.detailTitle}</h4><output class="photo-ocr-result-character" id="photoResultCharacter"></output><dl class="photo-ocr-character-meta"><div><dt>${page.pinyin}</dt><dd id="photoResultPinyin">-</dd></div><div><dt>${page.strokes}</dt><dd id="photoResultStrokes">-</dd></div><div><dt>${page.unicode}</dt><dd id="photoResultUnicode">-</dd></div></dl><div class="photo-ocr-character-actions"><button id="photoCopyCharacter" type="button">${page.copyCharacter}</button><button id="photoSpeakCharacter" type="button" hidden>${page.speakCharacter}</button><a id="photoStrokeLink" href="${localPath(locale, "chinese-stroke-order")}">${page.strokeLink}</a><a id="photoPinyinLink" href="${localPath(locale, "chinese-to-pinyin")}">${page.pinyinLink}</a><a id="photoStructureLink" href="${localPath(locale, "chinese-character-lookup")}">${page.structureLink}</a></div></article>
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
${locale === "zh-CN" ? blogGuide : ""}
    </main>

    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localPath(locale, "about")}">${meta.about}</a><a href="${localPath(locale, "contact")}">${meta.contact}</a><a href="${localPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
    <dialog class="photo-ocr-error-dialog" id="photoOcrErrorDialog" aria-labelledby="photoOcrErrorTitle"><form method="dialog"><h2 id="photoOcrErrorTitle">${meta.errorTitle}</h2><p id="photoOcrErrorMessage"></p><button type="submit">${meta.close}</button></form></dialog>
  </body>
</html>
`;
}

for (const locale of Object.keys(locales)) {
  const outputDirectory = path.join(projectRoot, locales[locale].prefix, slug);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "index.html"), await preserveToolLinks(renderPage(locale), path.join(outputDirectory, "index.html")), "utf8");
}

console.log(`Generated ${Object.keys(locales).length} ${slug} pages.`);
