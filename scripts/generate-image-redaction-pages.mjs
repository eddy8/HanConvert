import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "image-redaction";
const checkOnly = process.argv.includes("--check");

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明", errorTitle: "无法完成操作", close: "关闭" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", errorTitle: "無法完成操作", close: "關閉" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement", errorTitle: "Action could not be completed", close: "Close" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", errorTitle: "処理を完了できませんでした", close: "閉じる" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내", errorTitle: "작업을 완료할 수 없습니다", close: "닫기" }
};

const commonMessages = {
  invalidFile: "This image could not be opened.", fileTooLarge: "The image is larger than 30 MB.", loading: "Opening image...", waiting: "Choose an image to begin",
  ready: "Image ready. Draw over anything you want to hide.", resized: "A large image was resized for stable browser processing.", sampleReady: "Sample loaded",
  modelError: "The local AI model could not be loaded. Check the network and try again, or continue with manual redaction.", chooseDetection: "Select faces, sensitive text, or both.",
  loadingFaceModel: "Loading face detection model...", detectingFaces: "Finding faces...", loadingTextModel: "Loading text recognition model...", detectingText: "Reading text locally...",
  ocrProgress: "Reading text locally... {percent}%", aiComplete: "Found {count} review suggestions", appliedSuggestions: "Applied {count} suggestions", exported: "Redacted image downloaded",
  exportError: "The browser could not create the downloaded image.", faceSuggestion: "Face candidate", textSuggestion: "Sensitive text candidate",
  categories: { face: "Face", email: "Email", url: "Web address", network: "IP address", secret: "Access key", id: "ID number", card: "Payment card", phone: "Phone number", plate: "License plate", personal: "Personal details" }
};

const content = {
  "zh-CN": {
    title: "在线图片打码工具 - AI自动识别人脸与隐私信息 | JianFan.app",
    description: "免费在线图片打码工具，支持纯色遮挡、马赛克和模糊处理，可用 AI 自动识别人脸及疑似手机号、邮箱、证件号等隐私信息。图片仅在浏览器本地处理，导出时移除 EXIF 元数据。",
    eyebrow: "图片打码 · AI 隐私检测 · 本地处理", heading: "在线图片打码工具", lede: "给照片、截图和证件图片中的人脸、姓名、手机号、地址等隐私信息打码。可手动画框，也可让本地 AI 先检测后由你逐项确认。",
    toolTitle: "上传图片并遮挡敏感信息", dropTitle: "拖入、粘贴或选择一张图片", dropBody: "支持 JPG、PNG、WebP 等浏览器可读取的图片，单张不超过 30 MB。图片不会上传。", choose: "选择图片", sample: "加载示例", formats: "也可以直接按 Ctrl / Cmd + V 粘贴截图",
    drawHint: "在图片上拖动画框；选中后可移动、缩放或删除。", fileLabel: "当前图片", replace: "更换图片", reset: "重新开始",
    effectsTitle: "打码方式", solid: "纯色遮挡", pixelate: "马赛克", blur: "模糊", intensity: "效果强度", colors: "遮挡颜色", black: "深色", white: "白色",
    undo: "撤销", redo: "重做", remove: "删除选区", compare: "查看原图", zoomOut: "缩小", zoomIn: "放大", canvasLabel: "图片打码编辑画布",
    aiTitle: "AI 智能检测", aiBody: "AI 只提供候选区域，不会直接修改图片。请检查漏检和误检后再应用。", faceScan: "检测人脸", textScan: "检测隐私文字", ocrLanguage: "文字语言", aiRun: "开始 AI 检测",
    ocrOptions: [["chi_sim", "简体中文 + 英文"], ["chi_tra", "繁体中文 + 英文"], ["eng", "英文"], ["jpn", "日文"], ["kor", "韩文"]],
    aiNetwork: "首次检测需联网下载识别模型，之后可由浏览器缓存；图片本身不会发送到服务器。", suggestionTitle: "待确认候选", suggestionEmpty: "检测结果会显示在这里。", apply: "应用所选", ignore: "忽略全部",
    exportTitle: "导出图片", exportBody: "导出会把遮挡写入新图片并移除 EXIF、GPS 等原图元数据。", format: "图片格式", quality: "导出质量", download: "下载已打码图片",
    localNote: "敏感文字建议使用纯色遮挡。轻度马赛克或模糊可能仍能被猜测或恢复，AI 检测也不能保证找出全部隐私信息。",
    featureKicker: "图片马赛克、人脸打码与隐私信息遮挡", featureTitle: "一处完成手动打码、AI 检测和安全导出", featureIntro: "这不是给整张照片套模糊滤镜，而是针对图片中的敏感区域进行像素级重写。适合分享截图、证件照片、聊天记录或社交媒体图片前做隐私检查。",
    cards: [["手动画框并随时调整", "可添加多个区域，拖动位置、缩放边界，再分别选择纯色、马赛克或模糊效果。"], ["AI 先找、人再确认", "本地模型可识别人脸，并用 OCR 检查手机号、邮箱、证件号、银行卡号、网址和 IP 等疑似隐私文字。"], ["导出时真正重写像素", "结果由 Canvas 重新生成，不是覆盖一层可移除的网页元素，同时不会继承原图的 EXIF 和 GPS 信息。"]],
    casesTitle: "常见图片打码场景", cases: [["截图与聊天记录", "隐藏用户名、头像、订单号、邮箱、访问密钥及客户资料后再发送或发布。"], ["证件与文档照片", "遮挡身份证号、护照号、住址、签名和银行卡信息；正式敏感资料应优先使用纯色遮挡。"], ["照片与社交媒体", "对路人或儿童人脸、车辆号牌、门牌和背景中的定位线索进行马赛克或遮挡。"]],
    safetyTitle: "为什么 AI 候选必须人工复核", safety: ["照片角度、反光、低清晰度、艺术字体和复杂背景都会影响识别。工具会尽量多找候选，但不能承诺零漏检。", "导出前请放大检查整张图片，尤其是边角、反射画面、通知栏和背景标牌。真正机密的数字与文字应使用纯色覆盖并留出边距。"],
    howTitle: "如何在线给图片打码", steps: ["选择、拖入或粘贴需要处理的图片。", "手动画出遮挡区域，或运行 AI 检测并审核候选。", "选择纯色、马赛克或模糊效果，调整范围与强度。", "切换原图核对遗漏后，选择格式并下载新图片。"],
    faqTitle: "图片打码常见问题", faqs: [["图片会上传到服务器吗？", "不会。图片解码、手动编辑、人脸检测、OCR 和导出都在当前浏览器中完成；联网只用于首次下载 AI 模型。"], ["马赛克和模糊能彻底隐藏文字吗？", "不能保证。对证件号、银行卡号、密码或访问密钥等重要文字，应使用纯色遮挡并覆盖得稍宽一些。"], ["AI 能识别哪些隐私信息？", "工具会标记人脸，以及疑似手机号、邮箱、证件号、银行卡号、网址、IP、车牌和带有姓名或地址标签的文字行。结果必须人工确认。"], ["导出图片还包含拍摄位置吗？", "工具通过 Canvas 重新生成 JPG、PNG 或 WebP，正常情况下不会复制原图中的 EXIF、GPS、设备型号和拍摄时间等元数据。"]],
    related: "相关图片与文字工具", relatedAria: "相关图片隐私与汉字工具", footerText: "JianFan.app 提供浏览器本地运行的中文、日文、韩文及图片隐私处理工具。",
    messages: { ...commonMessages, invalidFile: "无法读取这张图片，请选择 JPG、PNG 或 WebP 等常见格式。", fileTooLarge: "图片超过 30 MB，请压缩后再试。", loading: "正在打开图片…", waiting: "请选择图片开始打码", ready: "图片已就绪，请拖动画出需要隐藏的区域。", resized: "图片尺寸较大，已等比缩小以保证浏览器稳定处理。", sampleReady: "示例图片已载入", modelError: "本地 AI 模型加载失败，请检查网络后重试，或继续手动打码。", chooseDetection: "请至少选择检测人脸或检测隐私文字。", loadingFaceModel: "正在加载人脸检测模型…", detectingFaces: "正在识别人脸…", loadingTextModel: "正在加载文字识别模型…", detectingText: "正在本地识别文字…", ocrProgress: "正在本地识别文字… {percent}%", aiComplete: "发现 {count} 个待确认候选", appliedSuggestions: "已应用 {count} 个候选区域", exported: "已下载打码后的图片", exportError: "浏览器无法生成下载图片，请重试。", faceSuggestion: "疑似人脸", textSuggestion: "疑似隐私文字", categories: { face: "人脸", email: "邮箱", url: "网址", network: "IP 地址", secret: "访问密钥", id: "证件号", card: "银行卡号", phone: "手机号", plate: "车牌", personal: "个人信息" } }
  },
  "zh-TW": {
    title: "線上圖片打馬賽克 - AI自動辨識臉部與個資遮蔽 | JianFan.app",
    description: "免費線上圖片打馬賽克工具，支援純色遮蔽、馬賽克與模糊處理，可用 AI 自動辨識臉部及疑似電話、電子郵件、證件號等個資。圖片只在瀏覽器本機處理，匯出時移除 EXIF 中繼資料。",
    eyebrow: "圖片馬賽克 · AI 個資偵測 · 本機處理", heading: "線上圖片打馬賽克工具", lede: "遮蔽照片、截圖與證件圖片中的臉部、姓名、電話、地址等個資。可手動框選，也可由本機 AI 先偵測再逐項確認。",
    toolTitle: "上傳圖片並遮蔽敏感資訊", dropTitle: "拖入、貼上或選擇一張圖片", dropBody: "支援 JPG、PNG、WebP 等瀏覽器可讀取的圖片，單張不超過 30 MB。圖片不會上傳。", choose: "選擇圖片", sample: "載入範例", formats: "也可以直接按 Ctrl / Cmd + V 貼上截圖",
    drawHint: "在圖片上拖曳框選；選取後可移動、縮放或刪除。", fileLabel: "目前圖片", replace: "更換圖片", reset: "重新開始",
    effectsTitle: "遮蔽方式", solid: "純色遮蔽", pixelate: "馬賽克", blur: "模糊", intensity: "效果強度", colors: "遮蔽顏色", black: "深色", white: "白色", undo: "復原", redo: "重做", remove: "刪除選取區", compare: "查看原圖", zoomOut: "縮小", zoomIn: "放大", canvasLabel: "圖片馬賽克編輯畫布",
    aiTitle: "AI 智慧偵測", aiBody: "AI 只會提出候選區域，不會直接修改圖片。請檢查漏偵測與誤判後再套用。", faceScan: "偵測臉部", textScan: "偵測個資文字", ocrLanguage: "文字語言", aiRun: "開始 AI 偵測",
    ocrOptions: [["chi_tra", "繁體中文 + 英文"], ["chi_sim", "簡體中文 + 英文"], ["eng", "英文"], ["jpn", "日文"], ["kor", "韓文"]], aiNetwork: "首次偵測需連線下載辨識模型，之後可由瀏覽器快取；圖片本身不會傳送到伺服器。", suggestionTitle: "待確認候選", suggestionEmpty: "偵測結果會顯示在這裡。", apply: "套用所選", ignore: "全部忽略",
    exportTitle: "匯出圖片", exportBody: "匯出會將遮蔽寫入新圖片，並移除 EXIF、GPS 等原圖中繼資料。", format: "圖片格式", quality: "匯出品質", download: "下載已遮蔽圖片", localNote: "敏感文字建議使用純色遮蔽。輕度馬賽克或模糊仍可能被推測或還原，AI 偵測也無法保證找出所有個資。",
    featureKicker: "照片馬賽克、臉部模糊與個資遮蔽", featureTitle: "一次完成手動遮蔽、AI 偵測與安全匯出", featureIntro: "這不是替整張照片套上模糊濾鏡，而是重寫指定敏感區域的像素。適合在分享截圖、證件照片、聊天記錄或社群圖片前進行個資檢查。",
    cards: [["手動框選並隨時調整", "可建立多個區域、拖曳位置與縮放邊界，再分別選擇純色、馬賽克或模糊效果。"], ["AI 先找、人再確認", "本機模型可偵測臉部，並透過 OCR 檢查電話、電子郵件、證件號、信用卡號、網址與 IP 等疑似個資。"], ["匯出時真正重寫像素", "結果由 Canvas 重新產生，不是覆蓋一層可移除的網頁物件，也不會沿用原圖的 EXIF 與 GPS 資訊。"]],
    casesTitle: "常見圖片遮蔽情境", cases: [["截圖與聊天記錄", "隱藏使用者名稱、頭像、訂單編號、電子郵件、存取金鑰及客戶資料後再分享。"], ["證件與文件照片", "遮蔽身分證號、護照號碼、住址、簽名與信用卡資料；正式敏感資料應優先使用純色遮蔽。"], ["照片與社群媒體", "對路人或兒童臉部、車牌、門牌與背景中的定位線索加上馬賽克或遮蔽。"]],
    safetyTitle: "為什麼 AI 候選一定要人工複核", safety: ["拍攝角度、反光、低畫質、特殊字型與複雜背景都會影響辨識。工具會盡量找出候選，但不能保證完全不漏。", "匯出前請放大檢查整張圖片，特別是角落、反射畫面、通知列與背景招牌。真正機密的數字與文字應使用純色覆蓋並保留邊距。"],
    howTitle: "如何在線上替圖片打馬賽克", steps: ["選擇、拖入或貼上需要處理的圖片。", "手動框出遮蔽區域，或執行 AI 偵測並審核候選。", "選擇純色、馬賽克或模糊效果，調整範圍與強度。", "切換原圖檢查遺漏後，選擇格式並下載新圖片。"],
    faqTitle: "圖片馬賽克常見問題", faqs: [["圖片會上傳到伺服器嗎？", "不會。圖片解碼、手動編輯、臉部偵測、OCR 與匯出都在目前瀏覽器完成；連線只用於首次下載 AI 模型。"], ["馬賽克和模糊能徹底隱藏文字嗎？", "無法保證。身分證號、信用卡號、密碼或存取金鑰等重要文字，應使用純色遮蔽並多覆蓋一些範圍。"], ["AI 可以辨識哪些個資？", "工具會標示臉部，以及疑似電話、電子郵件、證件號、信用卡號、網址、IP、車牌與帶有姓名或地址標籤的文字行，仍需人工確認。"], ["匯出圖片還有拍攝位置嗎？", "工具透過 Canvas 重新產生 JPG、PNG 或 WebP，正常情況下不會複製原圖中的 EXIF、GPS、裝置型號與拍攝時間。"]],
    related: "相關圖片與文字工具", relatedAria: "相關圖片隱私與漢字工具", footerText: "JianFan.app 提供在瀏覽器本機執行的中文、日文、韓文與圖片隱私處理工具。",
    messages: { ...commonMessages, invalidFile: "無法讀取這張圖片，請選擇 JPG、PNG 或 WebP 等常見格式。", fileTooLarge: "圖片超過 30 MB，請壓縮後再試。", loading: "正在開啟圖片…", waiting: "請選擇圖片開始遮蔽", ready: "圖片已就緒，請拖曳框出要隱藏的區域。", resized: "圖片尺寸較大，已等比例縮小以維持瀏覽器穩定。", sampleReady: "範例圖片已載入", modelError: "本機 AI 模型載入失敗，請檢查網路後重試，或繼續手動遮蔽。", chooseDetection: "請至少選擇偵測臉部或偵測個資文字。", loadingFaceModel: "正在載入臉部偵測模型…", detectingFaces: "正在辨識臉部…", loadingTextModel: "正在載入文字辨識模型…", detectingText: "正在本機辨識文字…", ocrProgress: "正在本機辨識文字… {percent}%", aiComplete: "找到 {count} 個待確認候選", appliedSuggestions: "已套用 {count} 個候選區域", exported: "已下載遮蔽後的圖片", exportError: "瀏覽器無法產生下載圖片，請再試一次。", faceSuggestion: "疑似臉部", textSuggestion: "疑似個資文字", categories: { face: "臉部", email: "電子郵件", url: "網址", network: "IP 位址", secret: "存取金鑰", id: "證件號", card: "信用卡號", phone: "電話", plate: "車牌", personal: "個人資料" } }
  },
  en: {
    title: "Image Redaction Tool - Blur Faces and Sensitive Data Online | JianFan.app",
    description: "Redact images online with black boxes, pixelation or blur. Local AI finds faces and sensitive text; photos stay in the browser and export without EXIF.",
    eyebrow: "IMAGE REDACTION · LOCAL AI · PRIVATE EXPORT", heading: "Online Image Redaction Tool", lede: "Hide faces, names, phone numbers, addresses and other private details in photos or screenshots. Draw boxes manually or review suggestions from on-device AI.",
    toolTitle: "Open an image and redact sensitive details", dropTitle: "Drop, paste or choose an image", dropBody: "Works with JPG, PNG, WebP and other browser-readable images up to 30 MB. Your image is not uploaded.", choose: "Choose image", sample: "Load sample", formats: "You can also paste a screenshot with Ctrl / Cmd + V",
    drawHint: "Drag over the image to add a region. Select a region to move, resize or delete it.", fileLabel: "Current image", replace: "Replace image", reset: "Start over",
    effectsTitle: "Redaction style", solid: "Black box", pixelate: "Pixelate", blur: "Blur", intensity: "Effect strength", colors: "Box color", black: "Dark", white: "White", undo: "Undo", redo: "Redo", remove: "Delete region", compare: "View original", zoomOut: "Zoom out", zoomIn: "Zoom in", canvasLabel: "Image redaction editing canvas",
    aiTitle: "AI privacy scan", aiBody: "AI creates review suggestions only. It never edits the image until you approve selected regions.", faceScan: "Detect faces", textScan: "Detect sensitive text", ocrLanguage: "Text language", aiRun: "Run AI scan",
    ocrOptions: [["eng", "English"], ["chi_sim", "Simplified Chinese + English"], ["chi_tra", "Traditional Chinese + English"], ["jpn", "Japanese"], ["kor", "Korean"]], aiNetwork: "The first scan downloads recognition models that the browser may cache. The image itself is never sent to a server.", suggestionTitle: "Suggestions to review", suggestionEmpty: "Detected regions will appear here.", apply: "Apply selected", ignore: "Ignore all",
    exportTitle: "Export image", exportBody: "Export flattens redactions into a new image and leaves behind the original EXIF, GPS and camera metadata.", format: "Image format", quality: "Export quality", download: "Download redacted image", localNote: "Use a solid box for truly sensitive text. Light blur or pixelation may be guessed or reconstructed, and automatic detection can miss private details.",
    featureKicker: "REDACT PHOTOS, SCREENSHOTS, FACES AND PRIVATE TEXT", featureTitle: "Manual image censoring, local AI review and safer export", featureIntro: "This tool rewrites pixels inside selected regions rather than placing removable overlays on top. Use it before sharing screenshots, document photos, chats, forms or social media images.",
    cards: [["Draw, move and resize regions", "Add as many regions as needed, then adjust each boundary and choose a black box, pixelation or blur independently."], ["Let AI find likely private details", "Local face detection and OCR can suggest emails, phone numbers, IDs, payment cards, URLs, IP addresses, plates and labeled personal fields."], ["Flatten pixels and strip metadata", "Canvas creates a fresh output file, so the redaction is baked into its pixels and the original EXIF and GPS metadata is not carried over."]],
    casesTitle: "Common image redaction jobs", cases: [["Screenshots and support conversations", "Hide usernames, avatars, order numbers, customer records, email addresses and access keys before sharing a screen capture."], ["IDs and document photos", "Cover document numbers, addresses, signatures and payment details. Use a solid box for formal or high-risk information."], ["Photos and social posts", "Pixelate bystanders, children, license plates, house numbers and location clues visible in the background."]],
    safetyTitle: "Why every AI suggestion needs a human review", safety: ["Glare, low resolution, unusual type, angled photos and busy backgrounds all reduce detection accuracy. The scan is a head start, not a guarantee against missed data.", "Zoom around the full image before exporting, including corners, reflections, notification bars and background signs. Give solid boxes extra margin around truly confidential text."],
    howTitle: "How to redact an image online", steps: ["Choose, drop or paste the image you want to protect.", "Draw regions manually, or run the AI scan and review each suggestion.", "Choose black box, pixelation or blur, then adjust region size and strength.", "Compare with the original, inspect for missed details and download a new image."],
    faqTitle: "Image redaction questions", faqs: [["Is my image uploaded?", "No. Decoding, manual edits, face detection, OCR and export run in this browser. An internet connection is used only to download the AI models on first use."], ["Can blur or pixelation permanently hide text?", "Not reliably. Use a solid box with generous margins for passwords, access keys, payment cards, identity numbers or other high-risk text."], ["What sensitive data can the AI scan find?", "It suggests faces and likely phone numbers, emails, IDs, payment cards, URLs, IP addresses, plates and text lines labeled as names or addresses. Review every result."], ["Does export remove photo location data?", "The tool recreates a JPG, PNG or WebP with Canvas, so it normally does not copy EXIF fields such as GPS, device model or capture time from the source file."]],
    related: "Related image and text tools", relatedAria: "Related privacy, image and character tools", footerText: "JianFan.app provides browser-based Chinese, Japanese, Korean and image privacy tools.", messages: commonMessages
  },
  ja: {
    title: "画像モザイク加工 - AIで顔と個人情報を自動検出 | JianFan.app",
    description: "画像モザイク加工をオンラインで。黒塗り・ぼかしに対応し、AIが顔、電話番号、メール、IDなどの個人情報候補を検出。画像はブラウザ内で処理し、保存時にEXIF情報も削除します。",
    eyebrow: "画像モザイク · AI顔検出 · ブラウザ内処理", heading: "画像モザイク・ぼかし加工ツール", lede: "写真やスクリーンショットの顔、氏名、電話番号、住所などを隠せます。手動で囲むほか、端末内AIの候補を確認してから適用できます。",
    toolTitle: "画像を開いて個人情報を隠す", dropTitle: "画像をドロップ・貼り付け・選択", dropBody: "JPG、PNG、WebPなど、ブラウザで開ける30 MB以下の画像に対応。画像はアップロードされません。", choose: "画像を選択", sample: "サンプルで試す", formats: "Ctrl / Cmd + Vでスクリーンショットを貼り付けることもできます",
    drawHint: "画像上をドラッグして範囲を追加します。選択した範囲は移動・サイズ変更・削除できます。", fileLabel: "編集中の画像", replace: "画像を変更", reset: "最初からやり直す",
    effectsTitle: "隠し方", solid: "黒塗り", pixelate: "モザイク", blur: "ぼかし", intensity: "効果の強さ", colors: "塗りつぶし色", black: "濃色", white: "白", undo: "元に戻す", redo: "やり直す", remove: "範囲を削除", compare: "元画像を表示", zoomOut: "縮小", zoomIn: "拡大", canvasLabel: "画像モザイク編集キャンバス",
    aiTitle: "AIで自動検出", aiBody: "AIは確認用の候補だけを表示します。選択した候補を適用するまで画像は変更しません。", faceScan: "顔を検出", textScan: "個人情報の文字を検出", ocrLanguage: "文字の言語", aiRun: "AI検出を開始",
    ocrOptions: [["jpn", "日本語"], ["eng", "英語"], ["chi_sim", "簡体字中国語 + 英語"], ["chi_tra", "繁体字中国語 + 英語"], ["kor", "韓国語"]], aiNetwork: "初回は認識モデルをダウンロードし、ブラウザにキャッシュされる場合があります。画像自体はサーバーへ送信されません。", suggestionTitle: "確認待ちの候補", suggestionEmpty: "検出した範囲がここに表示されます。", apply: "選択項目を適用", ignore: "すべて無視",
    exportTitle: "画像を書き出す", exportBody: "加工結果を新しい画像に焼き込み、元画像のEXIF・GPSなどのメタデータを引き継がずに保存します。", format: "画像形式", quality: "保存品質", download: "加工済み画像を保存", localNote: "機密性の高い文字には黒塗りを推奨します。弱いモザイクやぼかしは推測・復元される可能性があり、AIにも見落としがあります。",
    featureKicker: "写真の顔・文字・ナンバーを安全に隠す", featureTitle: "手動加工、AI候補確認、メタデータ削除を一つに", featureIntro: "画像全体をぼかすのではなく、指定範囲のピクセルだけを書き換えます。スクリーンショット、書類写真、チャット画面、SNS投稿前の確認に使えます。",
    cards: [["範囲を後から細かく調整", "複数の範囲を追加し、位置や大きさを修正してから、黒塗り・モザイク・ぼかしを個別に選べます。"], ["AIで顔と個人情報を候補表示", "端末内の顔検出とOCRで、電話番号、メール、ID、カード番号、URL、IP、ナンバープレートなどを探します。"], ["加工を画像のピクセルに固定", "Canvasで新しい画像を生成するため、外せるレイヤーではありません。元のEXIFやGPS情報も保存結果に引き継ぎません。"]],
    casesTitle: "画像にモザイクをかける主な場面", cases: [["スクリーンショットやチャット", "ユーザー名、アイコン、注文番号、メール、顧客情報、アクセスキーなどを隠してから共有します。"], ["身分証や書類の写真", "証明書番号、住所、署名、カード情報を黒塗りします。重要書類ではぼかしより黒塗りが安全です。"], ["写真やSNS投稿", "通行人や子どもの顔、車のナンバー、表札、背景の位置情報につながる文字を隠します。"]],
    safetyTitle: "AI検出後に目視確認が必要な理由", safety: ["傾き、反射、低画質、装飾文字、複雑な背景によって検出精度は変わります。自動検出は作業の補助であり、見落としがない保証ではありません。", "保存前に画像全体を拡大し、四隅、反射、通知欄、背景の看板も確認してください。重要な文字は少し広めに黒塗りしてください。"],
    howTitle: "オンラインで画像にモザイクをかける方法", steps: ["加工する画像を選択、ドロップ、または貼り付けます。", "手動で範囲を囲むか、AI検出を実行して候補を確認します。", "黒塗り、モザイク、ぼかしを選び、範囲と強さを調整します。", "元画像と比較して見落としを確認し、新しい画像を保存します。"],
    faqTitle: "画像モザイク加工のよくある質問", faqs: [["画像はサーバーに送信されますか？", "送信されません。画像の読み込み、編集、顔検出、OCR、保存はブラウザ内で行い、通信は初回のAIモデル取得だけに使います。"], ["モザイクやぼかしで文字を完全に隠せますか？", "保証できません。ID番号、カード番号、パスワード、アクセスキーなどには、余白を持たせた黒塗りを使用してください。"], ["AIは何を検出できますか？", "顔、電話番号、メール、ID、カード番号、URL、IP、ナンバープレート、氏名・住所ラベルを含む文字行を候補として表示します。必ず確認してください。"], ["保存後の画像に位置情報は残りますか？", "CanvasでJPG、PNG、WebPを新しく生成するため、通常は元画像のEXIF、GPS、端末名、撮影日時をコピーしません。"]],
    related: "関連する画像・文字ツール", relatedAria: "関連する画像プライバシー・漢字ツール", footerText: "JianFan.appはブラウザで使える中国語・日本語・韓国語・画像プライバシーツールを提供します。",
    messages: { ...commonMessages, invalidFile: "この画像を開けません。JPG、PNG、WebPなどを選択してください。", fileTooLarge: "画像が30 MBを超えています。圧縮してからお試しください。", loading: "画像を開いています…", waiting: "画像を選択してください", ready: "画像を開きました。隠したい範囲をドラッグしてください。", resized: "画像が大きいため、安定して処理できるサイズに縮小しました。", sampleReady: "サンプル画像を読み込みました", modelError: "端末内AIモデルを読み込めませんでした。通信を確認するか、手動加工を続けてください。", chooseDetection: "顔または個人情報の文字を選択してください。", loadingFaceModel: "顔検出モデルを読み込んでいます…", detectingFaces: "顔を検出しています…", loadingTextModel: "文字認識モデルを読み込んでいます…", detectingText: "端末内で文字を認識しています…", ocrProgress: "端末内で文字を認識しています… {percent}%", aiComplete: "確認候補が{count}件見つかりました", appliedSuggestions: "候補を{count}件適用しました", exported: "加工済み画像を保存しました", exportError: "保存画像を作成できませんでした。もう一度お試しください。", faceSuggestion: "顔の候補", textSuggestion: "個人情報の候補", categories: { face: "顔", email: "メール", url: "URL", network: "IPアドレス", secret: "アクセスキー", id: "ID番号", card: "カード番号", phone: "電話番号", plate: "ナンバープレート", personal: "個人情報" } }
  },
  ko: {
    title: "사진 모자이크 - AI 얼굴·개인정보 자동 가리기 | JianFan.app",
    description: "온라인 사진 모자이크 도구로 검은색 가리기·흐림 효과와 AI 얼굴·개인정보 감지를 지원합니다. 사진은 브라우저에서 처리하고 EXIF 없이 저장합니다.",
    eyebrow: "사진 모자이크 · AI 개인정보 감지 · 로컬 처리", heading: "온라인 사진 모자이크 도구", lede: "사진과 스크린샷의 얼굴, 이름, 전화번호, 주소 등 개인정보를 가립니다. 직접 영역을 그리거나 기기 내 AI가 찾은 후보를 확인해 적용할 수 있습니다.",
    toolTitle: "사진을 열고 민감한 정보를 가리기", dropTitle: "사진을 끌어놓거나 붙여넣고 선택하세요", dropBody: "JPG, PNG, WebP 등 브라우저가 읽을 수 있는 30 MB 이하 이미지를 지원합니다. 사진은 업로드되지 않습니다.", choose: "사진 선택", sample: "예시 불러오기", formats: "Ctrl / Cmd + V로 스크린샷을 바로 붙여넣을 수도 있습니다",
    drawHint: "사진 위를 드래그해 영역을 추가하세요. 선택한 영역은 이동·크기 조절·삭제할 수 있습니다.", fileLabel: "현재 사진", replace: "사진 바꾸기", reset: "처음부터",
    effectsTitle: "가리기 방식", solid: "검은색 가리기", pixelate: "모자이크", blur: "흐림", intensity: "효과 강도", colors: "가리기 색상", black: "어두운색", white: "흰색", undo: "실행 취소", redo: "다시 실행", remove: "영역 삭제", compare: "원본 보기", zoomOut: "축소", zoomIn: "확대", canvasLabel: "사진 모자이크 편집 캔버스",
    aiTitle: "AI 개인정보 감지", aiBody: "AI는 검토할 후보 영역만 표시합니다. 선택한 후보를 적용하기 전에는 사진을 바꾸지 않습니다.", faceScan: "얼굴 감지", textScan: "개인정보 문자 감지", ocrLanguage: "문자 언어", aiRun: "AI 감지 시작",
    ocrOptions: [["kor", "한국어"], ["eng", "영어"], ["chi_sim", "중국어 간체 + 영어"], ["chi_tra", "중국어 번체 + 영어"], ["jpn", "일본어"]], aiNetwork: "첫 감지 때 인식 모델을 내려받아 브라우저에 캐시할 수 있습니다. 사진 자체는 서버로 전송하지 않습니다.", suggestionTitle: "검토할 후보", suggestionEmpty: "감지한 영역이 여기에 표시됩니다.", apply: "선택 항목 적용", ignore: "모두 무시",
    exportTitle: "사진 내보내기", exportBody: "가리기 효과를 새 이미지 픽셀에 합치고 원본의 EXIF, GPS 등 메타데이터 없이 저장합니다.", format: "이미지 형식", quality: "저장 품질", download: "모자이크 사진 다운로드", localNote: "중요한 문자에는 검은색 가리기를 권장합니다. 약한 모자이크나 흐림은 추측·복원될 수 있고 AI도 개인정보를 놓칠 수 있습니다.",
    featureKicker: "얼굴·번호판·개인정보 사진 모자이크", featureTitle: "수동 가리기와 AI 감지, 안전한 저장을 한곳에서", featureIntro: "사진 전체를 흐리는 대신 지정한 민감 영역의 픽셀을 다시 씁니다. 스크린샷, 신분증 사진, 채팅 화면, SNS 사진을 공유하기 전에 사용할 수 있습니다.",
    cards: [["영역을 그리고 다시 조정", "여러 영역을 추가하고 위치와 크기를 고친 뒤 검은색, 모자이크, 흐림 효과를 각각 선택할 수 있습니다."], ["AI가 얼굴과 개인정보 후보 감지", "기기 내 얼굴 감지와 OCR로 전화번호, 이메일, 신분증 번호, 카드 번호, URL, IP, 차량 번호 등을 찾습니다."], ["픽셀에 효과를 합치고 메타데이터 제거", "Canvas로 새 이미지를 만들어 가리기 효과를 픽셀에 고정하고 원본 EXIF와 GPS 정보를 이어받지 않습니다."]],
    casesTitle: "사진 모자이크가 필요한 상황", cases: [["스크린샷과 대화 내용", "사용자 이름, 프로필 사진, 주문 번호, 이메일, 고객 정보와 접근 키를 가리고 공유합니다."], ["신분증과 문서 사진", "신분증 번호, 여권 번호, 주소, 서명, 카드 정보를 가립니다. 중요한 자료는 검은색으로 덮는 것이 안전합니다."], ["사진과 SNS 게시물", "행인이나 어린이 얼굴, 차량 번호판, 문패와 배경의 위치 단서를 모자이크 처리합니다."]],
    safetyTitle: "AI 감지 뒤에 직접 확인해야 하는 이유", safety: ["기울어진 사진, 반사광, 낮은 화질, 장식 글꼴과 복잡한 배경은 인식 정확도를 낮춥니다. 자동 감지는 작업을 돕지만 누락이 없다고 보장하지 않습니다.", "저장하기 전에 사진 전체를 확대해 모서리, 반사 화면, 알림 표시줄과 배경 간판까지 확인하세요. 중요한 문자는 여유 있게 검은색으로 덮으세요."],
    howTitle: "온라인에서 사진 모자이크 하는 방법", steps: ["처리할 사진을 선택하거나 끌어놓고 붙여넣습니다.", "직접 가릴 영역을 그리거나 AI 감지를 실행해 후보를 검토합니다.", "검은색, 모자이크, 흐림 효과를 고르고 영역과 강도를 조정합니다.", "원본과 비교해 누락을 확인한 뒤 새 사진을 다운로드합니다."],
    faqTitle: "사진 모자이크 자주 묻는 질문", faqs: [["사진이 서버로 업로드되나요?", "아니요. 사진 열기, 편집, 얼굴 감지, OCR과 저장은 브라우저에서 처리하며 인터넷은 첫 AI 모델 다운로드에만 사용합니다."], ["모자이크나 흐림으로 문자를 완전히 숨길 수 있나요?", "보장할 수 없습니다. 신분증 번호, 카드 번호, 비밀번호, 접근 키처럼 중요한 문자는 주변까지 넉넉하게 검은색으로 덮으세요."], ["AI는 어떤 개인정보를 찾나요?", "얼굴과 전화번호, 이메일, 신분증 번호, 카드 번호, URL, IP, 차량 번호, 이름·주소 라벨이 있는 문자 줄을 후보로 표시합니다. 직접 확인해야 합니다."], ["저장한 사진에 위치 정보가 남나요?", "Canvas로 JPG, PNG, WebP를 새로 만들기 때문에 일반적으로 원본의 EXIF, GPS, 기기 모델, 촬영 시간을 복사하지 않습니다."]],
    related: "관련 사진·문자 도구", relatedAria: "관련 개인정보·이미지·한자 도구", footerText: "JianFan.app는 브라우저에서 실행되는 중국어·일본어·한국어·사진 개인정보 도구를 제공합니다.",
    messages: { ...commonMessages, invalidFile: "이 사진을 열 수 없습니다. JPG, PNG, WebP 등 일반 형식을 선택하세요.", fileTooLarge: "사진이 30 MB를 넘습니다. 압축한 뒤 다시 시도하세요.", loading: "사진을 여는 중…", waiting: "사진을 선택해 시작하세요", ready: "사진을 열었습니다. 가릴 영역을 드래그하세요.", resized: "사진이 커서 브라우저에서 안정적으로 처리할 수 있는 크기로 줄였습니다.", sampleReady: "예시 사진을 불러왔습니다", modelError: "기기 내 AI 모델을 불러오지 못했습니다. 네트워크를 확인하거나 수동 가리기를 계속하세요.", chooseDetection: "얼굴 또는 개인정보 문자 감지를 하나 이상 선택하세요.", loadingFaceModel: "얼굴 감지 모델을 불러오는 중…", detectingFaces: "얼굴을 찾는 중…", loadingTextModel: "문자 인식 모델을 불러오는 중…", detectingText: "기기에서 문자를 인식하는 중…", ocrProgress: "기기에서 문자를 인식하는 중… {percent}%", aiComplete: "검토할 후보 {count}개를 찾았습니다", appliedSuggestions: "후보 영역 {count}개를 적용했습니다", exported: "모자이크 사진을 다운로드했습니다", exportError: "다운로드할 사진을 만들지 못했습니다. 다시 시도하세요.", faceSuggestion: "얼굴 후보", textSuggestion: "개인정보 문자 후보", categories: { face: "얼굴", email: "이메일", url: "URL", network: "IP 주소", secret: "접근 키", id: "신분증 번호", card: "카드 번호", phone: "전화번호", plate: "차량 번호", personal: "개인정보" } }
  }
};

const relatedLinks = {
  "zh-CN": [[slug, "在线图片打码"], ["photo-chinese-character-recognition", "拍照识字"], ["text-formatter", "文本格式化"], ["file-text-converter", "文件文本转换"], ["chinese-character-lookup", "汉字查询"], ["character-counter", "字数统计"]],
  "zh-TW": [[slug, "線上圖片打馬賽克"], ["photo-chinese-character-recognition", "拍照辨識漢字"], ["text-formatter", "文字格式化"], ["file-text-converter", "文件文字轉換"], ["chinese-character-lookup", "漢字查詢"], ["character-counter", "字數統計"]],
  en: [[slug, "Image redaction tool"], ["photo-chinese-character-recognition", "Chinese OCR from photo"], ["text-formatter", "Text formatter"], ["file-text-converter", "Document Chinese converter"], ["chinese-character-lookup", "Chinese character lookup"], ["character-counter", "Character counter"]],
  ja: [[slug, "画像モザイク加工"], ["photo-chinese-character-recognition", "写真から中国語漢字を認識"], ["text-formatter", "テキスト整形"], ["file-text-converter", "文書の中国語変換"], ["japanese-kanji-dictionary", "漢字検索"], ["character-counter", "文字数カウント"]],
  ko: [[slug, "사진 모자이크"], ["photo-chinese-character-recognition", "사진 속 중국 한자 인식"], ["text-formatter", "텍스트 정리"], ["file-text-converter", "문서 중국어 변환"], ["korean-hanja-dictionary", "한자 찾기"], ["character-counter", "글자수 세기"]]
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
      { "@type": "WebApplication", "@id": `${canonical}#webapp`, name, url: canonical, description: page.description, applicationCategory: "MultimediaApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript and browser image processing support", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` } },
      { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localizedPath(locale)}` }, { "@type": "ListItem", position: 2, name, item: canonical }] },
      { "@type": "HowTo", "@id": `${canonical}#howto`, name: page.howTitle, step: page.steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, text: step })) },
      { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
    ]
  };
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([targetLocale, item]) => `    <link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localizedPath(targetLocale, slug)}" />`).join("\n");
  const localeOptions = Object.entries(locales).map(([value, item]) => `<option value="${value}"${value === locale ? " selected" : ""}>${item.label}</option>`).join("");
  const ocrOptions = page.ocrOptions.map(([value, label], index) => `<option value="${value}"${index === 0 ? " selected" : ""}>${label}</option>`).join("");
  const links = relatedLinks[locale].map(([targetSlug, label]) => `<a href="${localizedPath(locale, targetSlug)}"${targetSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const schema = JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n");
  const messages = JSON.stringify(page.messages).replaceAll("<", "\\u003c");
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
    <script defer src="/image-redaction.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${schema}
    </script>
    <!-- seo-schema:end -->
  </head>
  <body data-tool-page="image-redaction" data-page-slug="${slug}" data-locale="${locale}">
    <script type="application/json" id="imageRedactionMessages">${messages}</script>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">隐</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${localeOptions}</select></label></nav></header>
    <main id="main">
      <section class="tool-hero redaction-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="redaction-hero-signal" aria-hidden="true"><span>LOCAL</span><strong><i></i><i></i><i></i></strong><b>PRIVATE</b></div></section>
      <section class="standalone-tool image-redaction-tool" aria-labelledby="redactionToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">REDACT / REVIEW / EXPORT</p><h2 id="redactionToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="redactionStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.waiting}</span></div></div>
        <input class="visually-hidden" id="redactionFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/bmp" />
        <div class="redaction-drop-zone" id="redactionDropZone"><div class="redaction-drop-visual" aria-hidden="true"><span></span><span></span><span></span></div><h3>${page.dropTitle}</h3><p>${page.dropBody}</p><div><label class="primary-action" for="redactionFileInput">${page.choose}</label><button class="text-button" id="redactionSample" type="button">${page.sample}</button></div><small>${page.formats}</small></div>
        <div class="redaction-workspace" id="redactionWorkspace" hidden>
          <div class="redaction-toolbar" role="toolbar" aria-label="${page.effectsTitle}">
            <fieldset><legend>${page.effectsTitle}</legend><div class="redaction-segmented" role="radiogroup" aria-label="${page.effectsTitle}"><button class="is-active" type="button" data-redaction-effect="solid" role="radio" aria-checked="true">${page.solid}</button><button type="button" data-redaction-effect="pixelate" role="radio" aria-checked="false">${page.pixelate}</button><button type="button" data-redaction-effect="blur" role="radio" aria-checked="false">${page.blur}</button></div></fieldset>
            <div class="redaction-range"><div><label for="redactionIntensity">${page.intensity}</label> <output id="redactionIntensityValue">52</output></div><input id="redactionIntensity" type="range" min="10" max="90" value="52" /></div>
            <fieldset class="redaction-colors"><legend>${page.colors}</legend><button class="is-active" type="button" data-redaction-color="#07120f" aria-label="${page.black}" title="${page.black}"></button><button type="button" data-redaction-color="#ffffff" aria-label="${page.white}" title="${page.white}"></button></fieldset>
            <div class="redaction-tool-actions"><button id="redactionUndo" type="button" title="${page.undo}" disabled>↶ <span>${page.undo}</span></button><button id="redactionRedo" type="button" title="${page.redo}" disabled>↷ <span>${page.redo}</span></button><button id="redactionRemove" type="button" disabled>${page.remove}</button><button id="redactionCompare" type="button" aria-pressed="false">${page.compare}</button></div>
          </div>
          <div class="redaction-editor-grid">
            <section class="redaction-canvas-panel" aria-labelledby="redactionCanvasTitle"><div class="redaction-file-row"><div><span>${page.fileLabel}</span><strong id="redactionFileName">image</strong><small id="redactionFileMeta"></small></div><label for="redactionFileInput">${page.replace}</label></div><h3 class="visually-hidden" id="redactionCanvasTitle">${page.canvasLabel}</h3><p class="redaction-draw-hint">${page.drawHint}</p><div class="redaction-canvas-frame" id="redactionCanvasFrame"><canvas id="redactionCanvas" tabindex="0" aria-label="${page.canvasLabel}"></canvas></div><div class="redaction-zoom"><button id="redactionZoomOut" type="button" title="${page.zoomOut}" aria-label="${page.zoomOut}">−</button><output id="redactionZoomValue">100%</output><button id="redactionZoomIn" type="button" title="${page.zoomIn}" aria-label="${page.zoomIn}">+</button></div></section>
            <aside class="redaction-side-panel">
              <section class="redaction-ai-panel" aria-labelledby="redactionAiTitle"><div class="redaction-panel-heading"><span>AI</span><div><h3 id="redactionAiTitle">${page.aiTitle}</h3><p>${page.aiBody}</p></div></div><div class="redaction-ai-options"><label><input id="redactionFaceScan" type="checkbox" checked /> <span>${page.faceScan}</span></label><label><input id="redactionTextScan" type="checkbox" checked /> <span>${page.textScan}</span></label><label class="redaction-ai-language"><span>${page.ocrLanguage}</span><select id="redactionOcrLanguage">${ocrOptions}</select></label></div><button class="redaction-ai-run" id="redactionAiRun" type="button">${page.aiRun}</button><p class="redaction-ai-network">${page.aiNetwork}</p><div class="redaction-ai-progress" id="redactionAiProgress" hidden><span><span id="redactionAiProgressBar"></span></span><strong id="redactionAiProgressText"></strong></div><div class="redaction-suggestions-head"><h4>${page.suggestionTitle}</h4><span>REVIEW</span></div><p class="redaction-suggestions-empty" id="redactionSuggestionsEmpty">${page.suggestionEmpty}</p><div class="redaction-suggestions" id="redactionSuggestions"></div><div class="redaction-suggestion-actions"><button id="redactionApplySuggestions" type="button" disabled>${page.apply}</button><button id="redactionClearSuggestions" type="button" disabled>${page.ignore}</button></div></section>
              <section class="redaction-export-panel" aria-labelledby="redactionExportTitle"><h3 id="redactionExportTitle">${page.exportTitle}</h3><p>${page.exportBody}</p><div class="redaction-export-fields"><label><span>${page.format}</span><select id="redactionExportFormat"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></label><div id="redactionExportQualityRow" hidden><div><label for="redactionExportQuality">${page.quality}</label> <output id="redactionExportQualityValue">92%</output></div><input id="redactionExportQuality" type="range" min="60" max="100" value="92" /></div></div><button class="primary-action" id="redactionDownload" type="button">${page.download}</button></section>
            </aside>
          </div>
          <div class="redaction-workspace-footer"><p>${page.localNote}</p><button id="redactionReset" type="button">${page.reset}</button></div>
        </div>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="redactionFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.featureKicker}</p><h2 id="redactionFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">${page.cards.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div><section class="redaction-use-cases" aria-labelledby="redactionCasesTitle"><h2 id="redactionCasesTitle">${page.casesTitle}</h2><div>${page.cases.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></section><section class="redaction-safety" aria-labelledby="redactionSafetyTitle"><h2 id="redactionSafetyTitle">${page.safetyTitle}</h2>${page.safety.map((copy) => `<p>${copy}</p>`).join("")}</section><section class="pinyin-howto" aria-labelledby="redactionHowTitle"><h2 id="redactionHowTitle">${page.howTitle}</h2><ol>${page.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section><section class="pinyin-faq" aria-labelledby="redactionFaqTitle"><h2 id="redactionFaqTitle">${page.faqTitle}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">${links}</nav></section>
    </main>
    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localizedPath(locale, "about")}">${meta.about}</a><a href="${localizedPath(locale, "contact")}">${meta.contact}</a><a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
    <dialog class="redaction-dialog" id="redactionDialog" aria-labelledby="redactionDialogTitle"><form method="dialog"><h2 id="redactionDialogTitle">${meta.errorTitle}</h2><p id="redactionDialogMessage"></p><button type="submit">${meta.close}</button></form></dialog>
  </body>
</html>`;
}

function buildHomeLink(locale) {
  const labels = { "zh-CN": "在线图片打码与 AI 隐私检测", "zh-TW": "線上圖片馬賽克與 AI 個資偵測", en: "Image redaction and AI privacy scan", ja: "画像モザイク・AI個人情報検出", ko: "사진 모자이크·AI 개인정보 감지" };
  return `          <!-- image-redaction-link:start -->\n          <a href="${localizedPath(locale, slug)}" data-route="image-redaction">${labels[locale]}</a>\n          <!-- image-redaction-link:end -->`;
}

function syncHomeLink(source, locale) {
  const block = buildHomeLink(locale);
  if (source.includes("<!-- image-redaction-link:start -->")) return source.replace(/          <!-- image-redaction-link:start -->[\s\S]*?          <!-- image-redaction-link:end -->/u, block);
  const anchor = "          <!-- text-formatter-link:end -->";
  if (!source.includes(anchor)) throw new Error(`${locale} homepage is missing the text formatter marker`);
  return source.replace(anchor, `${anchor}\n${block}`);
}

function buildSitemapSection() {
  const localeEntries = Object.entries(locales);
  const alternates = localeEntries.map(([locale, item]) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localizedPath(locale, slug)}" />`).join("\n");
  const urls = localeEntries.map(([locale]) => `  <url>\n    <loc>${origin}${localizedPath(locale, slug)}</loc>\n    <lastmod>2026-09-21</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${locale === "zh-CN" ? "0.9" : "0.8"}</priority>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${localizedPath("zh-CN", slug)}" />\n  </url>`).join("\n");
  return `  <!-- image-redaction-tool:start -->\n${urls}\n  <!-- image-redaction-tool:end -->`;
}

function syncSitemap(source) {
  const section = buildSitemapSection();
  if (source.includes("<!-- image-redaction-tool:start -->")) return source.replace(/  <!-- image-redaction-tool:start -->[\s\S]*?  <!-- image-redaction-tool:end -->/u, section);
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

console.log(`${checkOnly ? "Checked" : "Generated"} 5 multilingual image-redaction pages, homepage links, and sitemap entries.`);
