import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preserveExistingLastmods } from "./sitemap-lastmod.mjs";
import { withSiteDirectory } from "./sync-site-tool-directory.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "image-splitter";
const checkOnly = process.argv.includes("--check");

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明", errorTitle: "无法完成操作", close: "关闭" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", errorTitle: "無法完成操作", close: "關閉" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement", errorTitle: "Action could not be completed", close: "Close" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", errorTitle: "処理を完了できませんでした", close: "閉じる" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내", errorTitle: "작업을 완료할 수 없습니다", close: "닫기" }
};

const content = {
  "zh-CN": {
    title: "图片分割 - 在线九宫格切图、长图切割与分割打印 | JianFan.app",
    description: "免费在线图片分割工具：把图片切成九宫格、四宫格或横向轮播，长图按 A4 智能分页，大图分割成多张 A4 打印海报，导出 ZIP 或 PDF，图片不上传。",
    eyebrow: "图片分割 · 九宫格切图 · 分割打印", heading: "在线图片分割：九宫格切图、长图切割、分割打印",
    lede: "把一张图片按行列切成九宫格、四宫格或横向全景轮播，把长截图按 A4 分页，或把大图分割到多张 A4 纸上打印成海报。全部在浏览器本地完成，切图可打包 ZIP 或导出 PDF。",
    toolTitle: "上传图片并选择切割方式", dropTitle: "拖入、粘贴或选择一张图片", dropBody: "支持 JPG、PNG、WebP、AVIF 等浏览器可读取的图片，单张不超过 50 MB。图片只在本机处理，不会上传。", choose: "选择图片", sample: "加载示例", formats: "也可以直接按 Ctrl / Cmd + V 粘贴截图",
    fileLabel: "当前图片", replace: "更换图片", previewLabel: "切割预览", settingsLabel: "切割设置", modeLabel: "切割方式",
    modes: { grid: "网格切图", long: "长图分段", poster: "分割打印" },
    gridTitle: "按行列切图", presets: [["3x3", "1:1", "九宫格 3×3"], ["2x2", "1:1", "四宫格 2×2"], ["1x3", "4:5", "横向轮播 3 张"], ["1x2", "original", "左右 2 等分"], ["4x1", "original", "竖向 4 条"]],
    rows: "行数", cols: "列数", ratio: "单张比例", ratios: { original: "保持原图比例", "1:1": "1:1 正方形", "4:5": "4:5 竖图", "3:4": "3:4 竖图", "9:16": "9:16 全屏" },
    fit: "比例不符时", fits: { crop: "居中裁切", pad: "补边不裁切" }, padColor: "补边颜色", padColors: { "#ffffff": "白色", "#000000": "黑色" },
    order: "文件编号", orders: { reading: "从左上到右下", instagram: "Instagram 发帖顺序（倒序）" },
    gridNote: "暗色区域会被裁掉。行列不能整除时，相邻两张最多相差 1 像素。",
    longTitle: "把长图切成多段", segmentMode: "每段长度", segmentModes: { a4: "按 A4 纸比例", screen: "按手机屏幕 9:16", pixels: "固定像素高度", count: "平均分成几段" },
    smartCut: "智能避开文字：切线落在空白行，不把一行字切成两半", longNote: "适合长截图、聊天记录、网页长图打印或转 PDF；“下载 A4 PDF”每段占一页。",
    posterTitle: "把大图分割到多张纸打印", paper: "纸张", orientation: "方向", orientations: { portrait: "纵向", landscape: "横向" }, posterCols: "横向页数", margin: "页边距（mm）", overlap: "拼接重叠（mm）",
    marks: "打印裁切线和页码（A1、A2…）", posterNote: "按 100% 实际大小打印。重叠区用于对齐粘贴，虚线是上一张纸覆盖到的位置。",
    format: "图片格式", zip: "下载全部（ZIP）", pdf: "下载 PDF", share: "分享 / 存到相册", reset: "重新开始",
    localNote: "图片在浏览器本地切割；首次下载 ZIP 或 PDF 时会联网加载开源导出组件，图片本身不会发送到任何服务器。",
    featureKicker: "图片切割、九宫格、长图分页、海报打印", featureTitle: "一张图，三种常见切法",
    featureIntro: "图片分割就是把一张图片按网格、按高度或按纸张切成多张小图。本工具在切割前实时预览每条切线和编号，导出原始分辨率，不压缩、不加水印。",
    cards: [["网格切图与九宫格", "1–10 行 × 1–10 列任意组合，内置九宫格、四宫格、横向轮播等预设，可按 1:1、4:5、3:4 自动居中裁切或补边。"], ["长截图智能分页", "按 A4、手机屏幕、固定像素或段数切分，智能切线会在切割点附近寻找空白行，导出图片或一页一段的 A4 PDF。"], ["大图分割打印成海报", "选择 A4、A3 或 Letter 纸和横向页数，自动算出总页数、成品尺寸和打印 dpi，生成带裁切线、重叠区和页码的 PDF。"]],
    casesTitle: "常见图片分割场景", cases: [["朋友圈、微博九宫格", "把一张照片切成 9 张正方形，按 01–09 顺序选图，发出后在动态里拼回完整画面。"], ["Instagram / Threads 拼图和全景轮播", "主页拼图按倒序编号发布；横向全景图切成 4:5 的多张，左右滑动时画面无缝衔接。"], ["长图打印与海报", "把聊天记录、网页长截图分成 A4 页打印；把孩子的画、地图或海报放大到 4 张、9 张 A4 上拼贴。"]],
    sizesTitle: "常用切图尺寸速查", sizesIntro: "以下是常见用途的推荐设置，切换方式或预设后可在预览中直接核对。",
    sizesHead: ["用途", "推荐设置", "说明"],
    sizes: [["朋友圈 / 微博九宫格", "3×3，1:1", "每张正方形；原图不小于 3240×3240 px 时，每张可达 1080×1080 px。"], ["Instagram 主页拼图", "3 列 × N 行，3:4 或 4:5", "主页网格以 3:4 显示缩略图，重要内容放在中间；编号选“Instagram 发帖顺序”。"], ["横向全景轮播", "1×2 至 1×10，4:5 或 1:1", "竖图帖子常用 1080×1350 px（4:5），切线两侧画面连续。"], ["长截图打印 / 转 PDF", "长图分段，按 A4 纸比例", "A4 纸为 210×297 mm；开启智能避开文字，避免把一行字切断。"], ["A4 拼接海报", "分割打印，横向 2–4 页", "300 dpi 打印一整张 A4 约需 2480×3508 px；建议不低于 150 dpi。"]],
    howTitle: "如何在线分割图片", steps: ["选择、拖入或粘贴要切割的图片。", "选择网格切图、长图分段或分割打印，再挑选预设或调整行列、比例、纸张。", "在预览中检查切线、编号和成品尺寸，点击预览中的某一块可单独下载。", "下载全部切图的 ZIP 或 PDF；手机上可用“分享 / 存到相册”一次保存全部图片。"],
    faqTitle: "图片分割常见问题",
    faqs: [
      ["图片会上传到服务器吗？", "不会。读取、切割、预览、打包 ZIP 和生成 PDF 都在当前浏览器中完成。首次下载 ZIP 或 PDF 时会联网加载开源的压缩与 PDF 组件，图片本身不会发送出去。"],
      ["怎么把一张图片切成九宫格发朋友圈？", "选择“九宫格 3×3”预设（默认 1:1 正方形并居中裁切），在预览中确认保留范围，点击“下载全部（ZIP）”。手机上可点“分享 / 存到相册”。发朋友圈时按文件名 01 到 09 的顺序选图，就能拼回完整画面。"],
      ["Instagram 拼图为什么要倒着发？", "Instagram 主页把最新的帖子放在左上角，所以要从右下角最后一张开始发。把“文件编号”设为“Instagram 发帖顺序”，按 post01、post02… 依次发布即可；每次发满整行（3 的倍数）才不会错位。"],
      ["切出来的每张图为什么相差 1 像素？", "当宽度或高度不能被行数、列数整除时，工具会把多出的像素平均分给各行各列，所以相邻两张最多相差 1 像素。所有小图拼回去正好是原图，不缺也不重复任何像素。"],
      ["怎么把长图、长截图切成 A4 并转成 PDF？", "切换到“长图分段”，每段长度选“按 A4 纸比例”，保持“智能避开文字”开启，再点“下载 PDF”。每段占一页 A4，切线会尽量落在文字之间的空白行，不会把一行字切成上下两半。"],
      ["怎么把一张图片分割成多张 A4 打印成海报？", "切换到“分割打印”，选择纸张和方向，设置横向页数（例如 3 页），工具会自动算出需要几行，并显示成品尺寸和 dpi。下载 PDF 后用 100%（实际大小）打印，沿裁切线修边，按 A1、A2… 页码对齐重叠区粘贴。"],
      ["打印出来模糊怎么办？", "看结果区的 dpi 数值，建议不低于 150 dpi，低于 100 dpi 近看会明显模糊。可以减少横向页数、把 A3 改为 A4，或换一张分辨率更高的原图；放大打印不会凭空增加细节。"],
      ["免费吗？有水印和数量限制吗？", "完全免费，无需注册，导出的图片不加水印。为保证浏览器稳定，一次最多切 100 张、海报最多 64 页，单张图片不超过 50 MB 或 6400 万像素。"],
      ["支持哪些格式？手机上能用吗？", "支持 JPG、PNG、WebP、AVIF、BMP、GIF（取第一帧）等浏览器能打开的图片，可导出 PNG、JPG、ZIP 或 PDF。手机浏览器同样可用；支持系统分享的手机会显示“分享 / 存到相册”，可一次把全部切图存进相册。"]
    ],
    related: "相关图片与文字工具", relatedAria: "相关图片与汉字工具", footerText: "JianFan.app 提供浏览器本地运行的中文、日文、韩文文字工具和图片处理工具。",
    messages: { waiting: "请选择图片开始切割", loading: "正在打开图片…", ready: "图片已就绪，请选择切割方式", sampleReady: "示例图片已载入", invalidFile: "无法读取这张图片，请选择 JPG、PNG 或 WebP 等常见格式。", fileTooLarge: "图片超过 50 MB，请压缩后再试。", tooManyPixels: "图片超过 6400 万像素，请先缩小尺寸再切割。", libraryError: "导出组件加载失败，请检查网络后重试。", exportError: "浏览器无法生成文件，请重试。", rendering: "正在生成 {current}/{total}…", zipDone: "已下载 {count} 张切图（ZIP）", pdfDone: "已下载 {count} 页 PDF", singleDone: "已下载 {name}", gridSummary: "共 {count} 张 · 每张 {size} px", longSummary: "共 {count} 段 · 每段最高 {height} px", posterSummary: "共 {count} 页（{cols} 列 × {rows} 行）· 成品约 {width} × {height} cm · 约 {dpi} dpi", smallTiles: "每张小于 320 像素，发布到社交平台可能不清晰。", tooManyParts: "超过 {max} 段，请调大每段长度或减少段数。", tooManyPages: "超过 {max} 页，请减少横向页数或改用更大的纸张。", lowDpi: "打印分辨率偏低，可能模糊；建议减少横向页数或使用更清晰的原图。", clickHint: "点击预览中的任意一块，可单独下载这一张。", posterHint: "黄色区域是相邻两页的重叠部分，拼贴时对齐即可。", segmentPixels: "每段高度（px）", segmentCount: "段数", share: "分享 / 存到相册", shareReady: "再点一次分享", shared: "已打开系统分享", shareTapAgain: "图片已准备好，请再点一次“分享”。", shareError: "当前浏览器无法分享图片，请改用下载 ZIP。" }
  },
  "zh-TW": {
    title: "圖片分割器 - 線上切圖、IG 九宮格與 A4 分割列印 | JianFan.app",
    description: "免費線上圖片分割器：把照片切成 IG 九宮格、Threads 輪播或任意格數，長圖自動分成 A4 頁，大圖分割列印成海報，可下載 ZIP 或 PDF，圖片不上傳。",
    eyebrow: "圖片分割 · 九宮格切圖 · 分割列印", heading: "線上圖片分割器：切圖、IG 九宮格與 A4 分割列印",
    lede: "把一張圖片依行列切成 IG 九宮格、四宮格或橫向全景輪播，把長截圖分成 A4 頁，或把大圖分割到多張 A4 紙上列印成海報。全程在瀏覽器本機處理，可打包 ZIP 或匯出 PDF。",
    toolTitle: "上傳圖片並選擇切割方式", dropTitle: "拖入、貼上或選擇一張圖片", dropBody: "支援 JPG、PNG、WebP、AVIF 等瀏覽器可讀取的圖片，單張不超過 50 MB。圖片只在本機處理，不會上傳。", choose: "選擇圖片", sample: "載入範例", formats: "也可以直接按 Ctrl / Cmd + V 貼上截圖",
    fileLabel: "目前圖片", replace: "更換圖片", previewLabel: "切割預覽", settingsLabel: "切割設定", modeLabel: "切割方式",
    modes: { grid: "網格切圖", long: "長圖分段", poster: "分割列印" },
    gridTitle: "依行列切圖", presets: [["3x3", "1:1", "九宮格 3×3"], ["2x2", "1:1", "四宮格 2×2"], ["1x3", "4:5", "橫向輪播 3 張"], ["1x2", "original", "左右 2 等分"], ["4x1", "original", "直向 4 條"]],
    rows: "列數（橫排）", cols: "欄數（直排）", ratio: "單張比例", ratios: { original: "維持原圖比例", "1:1": "1:1 正方形", "4:5": "4:5 直式", "3:4": "3:4 直式", "9:16": "9:16 全螢幕" },
    fit: "比例不符時", fits: { crop: "置中裁切", pad: "補邊不裁切" }, padColor: "補邊顏色", padColors: { "#ffffff": "白色", "#000000": "黑色" },
    order: "檔案編號", orders: { reading: "從左上到右下", instagram: "IG 發文順序（倒序）" },
    gridNote: "暗色區域會被裁掉。行列無法整除時，相鄰兩張最多相差 1 像素。",
    longTitle: "把長圖切成多段", segmentMode: "每段長度", segmentModes: { a4: "依 A4 紙比例", screen: "依手機螢幕 9:16", pixels: "固定像素高度", count: "平均分成幾段" },
    smartCut: "智慧避開文字：切線落在空白行，不把一行字切成兩半", longNote: "適合長截圖、對話紀錄、網頁長圖列印或轉 PDF；「下載 PDF」每段佔一頁 A4。",
    posterTitle: "把大圖分割到多張紙列印", paper: "紙張", orientation: "方向", orientations: { portrait: "直向", landscape: "橫向" }, posterCols: "橫向頁數", margin: "邊界（mm）", overlap: "拼接重疊（mm）",
    marks: "列印裁切線與頁碼（A1、A2…）", posterNote: "請以 100% 實際大小列印。重疊區用於對齊黏貼，虛線是上一張紙覆蓋到的位置。",
    format: "圖片格式", zip: "下載全部（ZIP）", pdf: "下載 PDF", share: "分享 / 存到相簿", reset: "重新開始",
    localNote: "圖片在瀏覽器本機切割；首次下載 ZIP 或 PDF 時會連線載入開源匯出元件，圖片本身不會傳送到任何伺服器。",
    featureKicker: "圖片切割、九宮格、長圖分頁、海報列印", featureTitle: "一張圖，三種常用切法",
    featureIntro: "圖片分割就是把一張圖片依網格、依高度或依紙張切成多張小圖。本工具在切割前即時預覽每條切線與編號，匯出原始解析度，不壓縮、不加浮水印。",
    cards: [["網格切圖與 IG 九宮格", "1–10 列 × 1–10 欄任意組合，內建九宮格、四宮格、橫向輪播等預設，可依 1:1、4:5、3:4 自動置中裁切或補邊。"], ["長截圖智慧分頁", "依 A4、手機螢幕、固定像素或段數切分，智慧切線會在切割點附近尋找空白行，匯出圖片或一頁一段的 A4 PDF。"], ["大圖分割列印成海報", "選擇 A4、A3 或 Letter 紙與橫向頁數，自動算出總頁數、成品尺寸與列印 dpi，產生含裁切線、重疊區與頁碼的 PDF。"]],
    casesTitle: "常見圖片分割情境", cases: [["IG 主頁九宮格拼圖", "把一張照片切成 9 張，依「IG 發文順序」從 post01 開始發，主頁就會拼回完整畫面。"], ["IG / Threads 全景輪播", "把橫幅照片切成多張 4:5，左右滑動時畫面無縫銜接，適合風景、活動與作品集。"], ["長圖列印與 A4 海報", "把 LINE 對話紀錄、網頁長截圖分成 A4 頁列印；把孩子的畫、地圖或海報放大到 4 張、9 張 A4 上拼貼。"]],
    sizesTitle: "常用切圖尺寸速查", sizesIntro: "以下是常見用途的建議設定，切換方式或預設後可在預覽中直接核對。",
    sizesHead: ["用途", "建議設定", "說明"],
    sizes: [["IG 主頁九宮格", "3 欄 × 3 列，3:4 或 4:5", "主頁網格以 3:4 顯示縮圖，重要內容放在中間；編號選「IG 發文順序」。"], ["臉書 / 一般九宮格", "3×3，1:1", "每張正方形；原圖不小於 3240×3240 px 時，每張可達 1080×1080 px。"], ["橫向全景輪播", "1×2 至 1×10，4:5 或 1:1", "直式貼文常用 1080×1350 px（4:5），切線兩側畫面連續。"], ["長截圖列印 / 轉 PDF", "長圖分段，依 A4 紙比例", "A4 紙為 210×297 mm；開啟智慧避開文字，避免把一行字切斷。"], ["A4 拼接海報", "分割列印，橫向 2–4 頁", "以 300 dpi 列印一整張 A4 約需 2480×3508 px；建議不低於 150 dpi。"]],
    howTitle: "如何線上分割圖片", steps: ["選擇、拖入或貼上要切割的圖片。", "選擇網格切圖、長圖分段或分割列印，再挑選預設或調整行列、比例、紙張。", "在預覽中檢查切線、編號與成品尺寸，點選預覽中的某一塊可單獨下載。", "下載全部切圖的 ZIP 或 PDF；手機上可用「分享 / 存到相簿」一次儲存全部圖片。"],
    faqTitle: "圖片分割常見問題",
    faqs: [
      ["圖片會上傳到伺服器嗎？", "不會。讀取、切割、預覽、打包 ZIP 與產生 PDF 都在目前的瀏覽器完成。首次下載 ZIP 或 PDF 時會連線載入開源的壓縮與 PDF 元件，圖片本身不會傳送出去。"],
      ["怎麼把一張照片切成 IG 九宮格？", "選擇「九宮格 3×3」預設，單張比例可改成 3:4 或 4:5 以配合 IG 主頁網格，在預覽中確認保留範圍後點「下載全部（ZIP）」。手機上可點「分享 / 存到相簿」，再依編號發文。"],
      ["IG 九宮格為什麼要倒著發？", "IG 主頁把最新的貼文放在左上角，所以要從右下角最後一張開始發。把「檔案編號」設為「IG 發文順序」，依 post01、post02… 依序發布即可；每次發滿整列（3 的倍數）才不會錯位。"],
      ["切出來的每張圖為什麼相差 1 像素？", "當寬度或高度無法被列數、欄數整除時，工具會把多出的像素平均分給各列各欄，所以相鄰兩張最多相差 1 像素。所有小圖拼回去正好是原圖，不缺也不重複任何像素。"],
      ["怎麼把長圖、長截圖切成 A4 並轉成 PDF？", "切換到「長圖分段」，每段長度選「依 A4 紙比例」，保持「智慧避開文字」開啟，再點「下載 PDF」。每段佔一頁 A4，切線會盡量落在文字之間的空白行，不會把一行字切成上下兩半。"],
      ["怎麼把一張圖片分割成多張 A4 列印成海報？", "切換到「分割列印」，選擇紙張與方向，設定橫向頁數（例如 3 頁），工具會自動算出需要幾列，並顯示成品尺寸與 dpi。下載 PDF 後以 100%（實際大小）列印，沿裁切線修邊，依 A1、A2… 頁碼對齊重疊區黏貼。"],
      ["列印出來模糊怎麼辦？", "看結果區的 dpi 數值，建議不低於 150 dpi，低於 100 dpi 近看會明顯模糊。可以減少橫向頁數、把 A3 改成 A4，或換一張解析度更高的原圖；放大列印不會憑空增加細節。"],
      ["免費嗎？有浮水印和數量限制嗎？", "完全免費，不需註冊，匯出的圖片不加浮水印。為維持瀏覽器穩定，一次最多切 100 張、海報最多 64 頁，單張圖片不超過 50 MB 或 6,400 萬像素。"],
      ["支援哪些格式？手機能用嗎？", "支援 JPG、PNG、WebP、AVIF、BMP、GIF（取第一格）等瀏覽器能開啟的圖片，可匯出 PNG、JPG、ZIP 或 PDF。手機瀏覽器同樣可用；支援系統分享的手機會顯示「分享 / 存到相簿」，可一次把全部切圖存進相簿。"]
    ],
    related: "相關圖片與文字工具", relatedAria: "相關圖片與漢字工具", footerText: "JianFan.app 提供在瀏覽器本機執行的中文、日文、韓文文字工具與圖片處理工具。",
    messages: { waiting: "請選擇圖片開始切割", loading: "正在開啟圖片…", ready: "圖片已就緒，請選擇切割方式", sampleReady: "範例圖片已載入", invalidFile: "無法讀取這張圖片，請選擇 JPG、PNG 或 WebP 等常見格式。", fileTooLarge: "圖片超過 50 MB，請壓縮後再試。", tooManyPixels: "圖片超過 6,400 萬像素，請先縮小尺寸再切割。", libraryError: "匯出元件載入失敗，請檢查網路後再試。", exportError: "瀏覽器無法產生檔案，請再試一次。", rendering: "正在產生 {current}/{total}…", zipDone: "已下載 {count} 張切圖（ZIP）", pdfDone: "已下載 {count} 頁 PDF", singleDone: "已下載 {name}", gridSummary: "共 {count} 張 · 每張 {size} px", longSummary: "共 {count} 段 · 每段最高 {height} px", posterSummary: "共 {count} 頁（{cols} 欄 × {rows} 列）· 成品約 {width} × {height} cm · 約 {dpi} dpi", smallTiles: "每張小於 320 像素，發布到社群平台可能不清晰。", tooManyParts: "超過 {max} 段，請調大每段長度或減少段數。", tooManyPages: "超過 {max} 頁，請減少橫向頁數或改用更大的紙張。", lowDpi: "列印解析度偏低，可能模糊；建議減少橫向頁數或使用更清晰的原圖。", clickHint: "點選預覽中的任一塊，可單獨下載這一張。", posterHint: "黃色區域是相鄰兩頁的重疊部分，拼貼時對齊即可。", segmentPixels: "每段高度（px）", segmentCount: "段數", share: "分享 / 存到相簿", shareReady: "再點一次分享", shared: "已開啟系統分享", shareTapAgain: "圖片已準備好，請再點一次「分享」。", shareError: "目前的瀏覽器無法分享圖片，請改用下載 ZIP。" }
  },
  en: {
    title: "Image Splitter - Split Image into Grid or Print Pages | JianFan.app",
    description: "Free image splitter: split a picture into a 3x3 Instagram grid or carousel, cut long screenshots into A4 pages, or print a poster across sheets. No upload.",
    eyebrow: "SPLIT IMAGE · GRID · POSTER PRINTING", heading: "Image Splitter: Split an Image into a Grid, Pages or a Print Poster",
    lede: "Split one image into a 3x3 grid, a 2x2 grid or a seamless carousel, cut a long screenshot into A4 pages, or enlarge a picture across several sheets of paper as a poster. Everything runs in your browser, and you download a ZIP or PDF.",
    toolTitle: "Open an image and choose how to split it", dropTitle: "Drop, paste or choose an image", dropBody: "Works with JPG, PNG, WebP, AVIF and other browser-readable images up to 50 MB. The image stays on your device.", choose: "Choose image", sample: "Load sample", formats: "You can also paste a screenshot with Ctrl / Cmd + V",
    fileLabel: "Current image", replace: "Replace image", previewLabel: "Split preview", settingsLabel: "Split settings", modeLabel: "Split mode",
    modes: { grid: "Grid", long: "Long image", poster: "Print poster" },
    gridTitle: "Split into rows and columns", presets: [["3x3", "1:1", "3×3 grid"], ["2x2", "1:1", "2×2 grid"], ["1x3", "4:5", "3-slide carousel"], ["1x2", "original", "Split in half"], ["4x1", "original", "4 vertical strips"]],
    rows: "Rows", cols: "Columns", ratio: "Tile shape", ratios: { original: "Keep original", "1:1": "1:1 square", "4:5": "4:5 portrait", "3:4": "3:4 portrait", "9:16": "9:16 full screen" },
    fit: "When the shape differs", fits: { crop: "Crop to center", pad: "Add borders" }, padColor: "Border color", padColors: { "#ffffff": "White", "#000000": "Black" },
    order: "File numbering", orders: { reading: "Top-left to bottom-right", instagram: "Instagram posting order" },
    gridNote: "Darkened areas are cropped away. When the size does not divide evenly, neighboring tiles differ by at most 1 pixel.",
    longTitle: "Cut a long image into sections", segmentMode: "Section length", segmentModes: { a4: "A4 page ratio", screen: "Phone screen 9:16", pixels: "Fixed pixel height", count: "Equal number of parts" },
    smartCut: "Avoid cutting through text: move each cut to a blank row", longNote: "For long screenshots, chat logs and web pages you want to print or save as PDF. The PDF puts one section on each A4 page.",
    posterTitle: "Print a large image across sheets", paper: "Paper", orientation: "Orientation", orientations: { portrait: "Portrait", landscape: "Landscape" }, posterCols: "Pages across", margin: "Margin (mm)", overlap: "Overlap (mm)",
    marks: "Print cut marks and page labels (A1, A2…)", posterNote: "Print at 100% (actual size). The overlap helps you line sheets up; the dashed line shows where the previous sheet ends.",
    format: "Image format", zip: "Download all (ZIP)", pdf: "Download PDF", share: "Share / Save to Photos", reset: "Start over",
    localNote: "Images are split locally in your browser. Your first ZIP or PDF download loads open-source export components; the image itself is never sent to a server.",
    featureKicker: "SPLIT IMAGES INTO GRIDS, PAGES AND POSTERS", featureTitle: "Three ways to split one picture",
    featureIntro: "An image splitter cuts one picture into several smaller images by grid, by height or by paper size. This tool previews every cut line and number before export, keeps full resolution and adds no watermark.",
    cards: [["Grid split for Instagram and more", "Any layout from 1×1 to 10×10, with presets for 3×3 and 2×2 grids and seamless carousels. Crop or pad tiles to 1:1, 4:5 or 3:4 automatically."], ["Long screenshots to pages", "Split by A4 ratio, phone screen, pixel height or number of parts. Smart cuts look for a blank row near each cut and export images or an A4 PDF."], ["Poster printing on A4 or Letter", "Choose A4, A3 or Letter and the number of pages across. The tool calculates pages, finished size and print dpi, then builds a PDF with cut marks, overlap and labels."]],
    casesTitle: "Common reasons to split an image", cases: [["Instagram profile grid", "Cut one photo into 3, 6 or 9 posts and number them in posting order so the profile shows the full picture."], ["Seamless carousel and TikTok banners", "Slice a panorama into 4:5 or 1:1 slides that line up as people swipe, or split a wide banner into equal parts."], ["Printing long images and posters", "Print a long chat or web screenshot on A4 pages, or enlarge artwork, maps and posters across 4 or 9 sheets."]],
    sizesTitle: "Common split sizes", sizesIntro: "Recommended settings for popular jobs. Pick the mode or preset and check the result in the preview.",
    sizesHead: ["Use", "Settings", "Notes"],
    sizes: [["Instagram profile grid", "3 columns × N rows, 3:4 or 4:5", "The profile grid shows 3:4 thumbnails, so keep key content centered. Use Instagram posting order."], ["Square 3×3 grid", "3×3, 1:1", "Square tiles. A source of at least 3240×3240 px gives 1080×1080 px tiles."], ["Seamless carousel", "1×2 to 1×10, 4:5 or 1:1", "Portrait posts are commonly 1080×1350 px (4:5); the picture continues across each cut."], ["Long screenshot to PDF", "Long image, A4 page ratio", "A4 paper is 210×297 mm. Smart cuts avoid splitting a line of text."], ["Poster on A4 sheets", "Print poster, 2–4 pages across", "Printing a full A4 page at 300 dpi needs about 2480×3508 px. Aim for at least 150 dpi."]],
    howTitle: "How to split an image online", steps: ["Choose, drop or paste the image you want to split.", "Pick Grid, Long image or Print poster, then choose a preset or set rows, columns, shape or paper.", "Check cut lines, numbers and the finished size in the preview. Click any tile to download just that one.", "Download every piece as a ZIP or PDF. On a phone, Share / Save to Photos saves all images at once."],
    faqTitle: "Image splitter questions",
    faqs: [
      ["Is my image uploaded?", "No. Opening, splitting, previewing, zipping and PDF creation all happen in this browser. Your first ZIP or PDF download loads open-source compression and PDF components; the image itself is never sent anywhere."],
      ["How do I split a picture into a 3×3 grid for Instagram?", "Choose the 3×3 grid preset, set the tile shape to 3:4 or 4:5 to match the Instagram profile grid, check the kept area in the preview and download the ZIP. Set File numbering to Instagram posting order and post the files from post01 upward."],
      ["Why do Instagram grid posts go in reverse order?", "Instagram shows the newest post at the top left of your profile, so a mosaic is posted from the bottom-right tile back to the top-left one. Post whole rows (multiples of 3) so the picture stays aligned."],
      ["Why do some tiles differ by one pixel?", "When the width or height does not divide evenly by the rows or columns, the spare pixels are spread across the tiles, so neighbors differ by at most one pixel. Put back together, the tiles match the original exactly with no missing or repeated pixels."],
      ["How do I cut a long screenshot into A4 pages as a PDF?", "Switch to Long image, choose A4 page ratio, keep Avoid cutting through text on, and select Download PDF. Each section fills one A4 page, and cuts move to the nearest blank row so lines of text are not sliced in half."],
      ["How do I print one image across several A4 pages?", "Switch to Print poster, pick the paper and orientation, and set the pages across, for example 3. The tool works out the rows, finished size and dpi. Print the PDF at 100% (actual size), trim along the cut marks and glue the overlaps in label order: A1, A2 and so on."],
      ["Why does my printed poster look blurry?", "Check the dpi in the result box. Aim for at least 150 dpi; below about 100 dpi the print looks soft up close. Use fewer pages across, smaller paper, or a higher-resolution source, because enlarging cannot add detail."],
      ["Is it free, and are there watermarks or limits?", "It is free with no sign-up and no watermark. To keep the browser stable, one export holds up to 100 images or 64 poster pages, and the source image can be up to 50 MB or 64 megapixels."],
      ["Which formats work, and can I use it on a phone?", "JPG, PNG, WebP, AVIF, BMP, GIF (first frame) and other images your browser can open. Export as PNG, JPG, ZIP or PDF. It works in mobile browsers too, and phones with system sharing show Share / Save to Photos to save every tile at once."]
    ],
    related: "Related image and text tools", relatedAria: "Related image and character tools", footerText: "JianFan.app provides browser-based Chinese, Japanese and Korean text tools and image utilities.",
    messages: { waiting: "Choose an image to begin", loading: "Opening image...", ready: "Image ready. Choose how to split it.", sampleReady: "Sample loaded", invalidFile: "This image could not be opened. Choose a JPG, PNG, WebP or another common format.", fileTooLarge: "The image is larger than 50 MB. Compress it and try again.", tooManyPixels: "The image is larger than 64 megapixels. Resize it before splitting.", libraryError: "The export component could not be loaded. Check your connection and try again.", exportError: "The browser could not create the file. Please try again.", rendering: "Creating {current}/{total}...", zipDone: "Downloaded {count} images (ZIP)", pdfDone: "Downloaded a {count}-page PDF", singleDone: "Downloaded {name}", gridSummary: "{count} tiles · {size} px each", longSummary: "{count} sections · up to {height} px tall", posterSummary: "{count} pages ({cols} across × {rows} down) · about {width} × {height} cm · about {dpi} dpi", smallTiles: "Tiles are smaller than 320 px and may look soft on social media.", tooManyParts: "More than {max} sections. Use a longer section or fewer parts.", tooManyPages: "More than {max} pages. Use fewer pages across or larger paper.", lowDpi: "Print resolution is low and may look blurry. Use fewer pages across or a sharper image.", clickHint: "Click any tile in the preview to download just that one.", posterHint: "Yellow areas show where neighboring pages overlap for alignment.", segmentPixels: "Section height (px)", segmentCount: "Number of parts", share: "Share / Save to Photos", shareReady: "Tap again to share", shared: "Share sheet opened", shareTapAgain: "Your images are ready. Tap Share again.", shareError: "This browser cannot share images. Download the ZIP instead." }
  },
  ja: {
    title: "画像分割ツール - 4分割・9分割・A4分割印刷 | JianFan.app",
    description: "無料の画像分割ツール。画像を4分割・9分割やインスタ・X用に切り分け、縦長画像はA4ごとに分割、大きな画像はA4複数枚に分割印刷できます。ZIP・PDF保存、アップロード不要。",
    eyebrow: "画像分割 · 4分割・9分割 · 分割印刷", heading: "画像分割ツール：4分割・9分割・縦長画像・A4分割印刷",
    lede: "1枚の画像を4分割・9分割や横長パノラマのカルーセル用に切り分け、縦長のスクリーンショットをA4ごとに分割し、大きな画像をA4数枚に分割印刷してポスターにできます。処理はすべてブラウザ内で行い、ZIPまたはPDFで保存できます。",
    toolTitle: "画像を開いて分割方法を選ぶ", dropTitle: "画像をドロップ・貼り付け・選択", dropBody: "JPG、PNG、WebP、AVIFなど、ブラウザで開ける50 MB以下の画像に対応。画像は端末内で処理し、アップロードしません。", choose: "画像を選択", sample: "サンプルで試す", formats: "Ctrl / Cmd + Vでスクリーンショットを貼り付けることもできます",
    fileLabel: "編集中の画像", replace: "画像を変更", previewLabel: "分割プレビュー", settingsLabel: "分割設定", modeLabel: "分割方法",
    modes: { grid: "グリッド分割", long: "縦長画像", poster: "分割印刷" },
    gridTitle: "縦横の数で分割", presets: [["3x3", "1:1", "9分割 3×3"], ["2x2", "1:1", "4分割 2×2"], ["1x3", "4:5", "横3枚カルーセル"], ["1x2", "original", "左右2分割"], ["4x1", "original", "縦4分割"]],
    rows: "縦の分割数（行）", cols: "横の分割数（列）", ratio: "1枚の比率", ratios: { original: "元の比率のまま", "1:1": "1:1 正方形", "4:5": "4:5 縦長", "3:4": "3:4 縦長", "9:16": "9:16 全画面" },
    fit: "比率が合わないとき", fits: { crop: "中央で切り抜く", pad: "余白を足す" }, padColor: "余白の色", padColors: { "#ffffff": "白", "#000000": "黒" },
    order: "ファイル番号", orders: { reading: "左上から右下へ", instagram: "インスタ投稿順（逆順）" },
    gridNote: "暗くなった部分は切り取られます。割り切れない場合、隣り合う画像の差は最大1ピクセルです。",
    longTitle: "縦長画像を複数に分割", segmentMode: "1枚の長さ", segmentModes: { a4: "A4用紙の比率", screen: "スマホ画面 9:16", pixels: "高さをピクセル指定", count: "等分する枚数" },
    smartCut: "文字を避けて分割：切れ目を空白の行に合わせ、文字を真っ二つにしない", longNote: "長いスクリーンショット、LINEのトーク画面、Webページの印刷やPDF化に。PDFは1区切りをA4の1ページに配置します。",
    posterTitle: "大きな画像を複数の用紙に分割印刷", paper: "用紙", orientation: "向き", orientations: { portrait: "縦", landscape: "横" }, posterCols: "横の枚数", margin: "余白（mm）", overlap: "のりしろ（mm）",
    marks: "トンボとページ番号（A1、A2…）を印刷", posterNote: "実際のサイズ（100%）で印刷してください。のりしろは位置合わせ用で、点線は前の用紙が重なる位置です。",
    format: "画像形式", zip: "すべて保存（ZIP）", pdf: "PDFを保存", share: "共有・写真に保存", reset: "最初からやり直す",
    localNote: "画像はブラウザ内で分割します。初めてZIPやPDFを保存するときにオープンソースの書き出し部品を読み込みますが、画像自体はサーバーへ送信しません。",
    featureKicker: "画像の分割・4分割・9分割・ポスター印刷", featureTitle: "1枚の画像を3通りに分割",
    featureIntro: "画像分割とは、1枚の画像をグリッド、高さ、用紙サイズごとに複数の画像へ切り分けることです。このツールは書き出し前に切れ目と番号をプレビューし、元の解像度のまま透かしなしで保存します。",
    cards: [["4分割・9分割のグリッド", "1〜10行×1〜10列を自由に指定でき、9分割・4分割・横カルーセルのプリセット付き。1:1、4:5、3:4に中央で切り抜くか余白を足せます。"], ["縦長スクショをページ分割", "A4比率、スマホ画面、ピクセル指定、枚数指定で分割。切れ目付近の空白行を探して文字を避け、画像またはA4のPDFで保存します。"], ["A4・A3で分割印刷", "A4、A3、Letterと横の枚数を選ぶと、総ページ数、仕上がりサイズ、印刷dpiを自動計算。トンボ、のりしろ、番号付きのPDFを作成します。"]],
    casesTitle: "画像分割のよくある使い道", cases: [["X・インスタの分割投稿", "1枚の写真を4分割や9分割にして投稿。インスタのプロフィールで1枚絵に見せるときは投稿順の番号で保存します。"], ["パノラマのカルーセル投稿", "横長の写真を4:5や1:1で切り分け、スワイプしたときに絵がつながるカルーセルを作れます。"], ["長い画像の印刷とポスター", "LINEのトーク画面やWebページの長いスクショをA4ごとに印刷したり、子どもの絵や地図をA4の4枚・9枚に拡大して貼り合わせたりできます。"]],
    sizesTitle: "よく使う分割サイズ早見表", sizesIntro: "用途ごとのおすすめ設定です。方法やプリセットを選ぶと、プレビューですぐに確認できます。",
    sizesHead: ["用途", "おすすめ設定", "補足"],
    sizes: [["インスタのプロフィール9分割", "3列×3行、3:4 または 4:5", "プロフィールのグリッドは3:4で表示されるため、大事な部分は中央に。番号は「インスタ投稿順」。"], ["正方形の9分割", "3×3、1:1", "正方形の9枚。元画像が3240×3240 px以上なら1枚1080×1080 pxになります。"], ["横長パノラマのカルーセル", "1×2〜1×10、4:5 または 1:1", "縦長投稿は1080×1350 px（4:5）が一般的。切れ目の両側で絵がつながります。"], ["縦長スクショの印刷・PDF化", "縦長画像、A4用紙の比率", "A4用紙は210×297 mm。「文字を避けて分割」で行の途中での切断を防ぎます。"], ["A4を貼り合わせたポスター", "分割印刷、横2〜4枚", "300 dpiでA4全面を印刷するには約2480×3508 pxが必要。150 dpi以上が目安です。"]],
    howTitle: "オンラインで画像を分割する方法", steps: ["分割したい画像を選択、ドロップ、または貼り付けます。", "グリッド分割、縦長画像、分割印刷から選び、プリセットや行・列、比率、用紙を調整します。", "プレビューで切れ目、番号、仕上がりサイズを確認します。プレビューの1枚をクリックするとその画像だけ保存できます。", "すべての画像をZIPまたはPDFで保存します。スマホでは「共有・写真に保存」でまとめて写真に保存できます。"],
    faqTitle: "画像分割のよくある質問",
    faqs: [
      ["画像はサーバーにアップロードされますか？", "されません。読み込み、分割、プレビュー、ZIP作成、PDF作成はすべてこのブラウザ内で行います。初めてZIPやPDFを保存するときにオープンソースの圧縮・PDF部品を読み込みますが、画像自体は送信しません。"],
      ["画像を4分割や9分割にするには？", "「4分割 2×2」または「9分割 3×3」のプリセットを選び、プレビューで残る範囲を確認して「すべて保存（ZIP）」を押します。縦横の数は1〜10の範囲で自由に変えられ、比率を変えると中央で切り抜くか余白を足すかを選べます。"],
      ["インスタで1枚絵に見せるには、なぜ逆順で投稿するのですか？", "インスタのプロフィールは最新の投稿が左上に表示されるため、右下の最後の1枚から投稿する必要があります。「ファイル番号」を「インスタ投稿順」にして post01、post02… の順に投稿し、毎回1行分（3の倍数）ずつ投稿するとずれません。"],
      ["Xの縦4分割や横カルーセル投稿にも使えますか？", "使えます。縦長画像なら「縦4分割」、横長なら「横3枚カルーセル」などを選び、番号順に添付してください。Xの複数画像は環境によって横スワイプのカルーセルで表示されるため、以前の縦4分割と見え方が変わる場合があります。"],
      ["分割した画像の大きさが1ピクセル違うのはなぜ？", "幅や高さが分割数で割り切れないとき、余ったピクセルを各行・各列に均等に配るため、隣り合う画像の差は最大1ピクセルになります。並べ直すと元画像とぴったり一致し、欠けや重複はありません。"],
      ["縦長のスクショをA4ごとに分割してPDFにするには？", "「縦長画像」に切り替え、1枚の長さを「A4用紙の比率」にして「文字を避けて分割」をオンのまま「PDFを保存」を押します。1区切りがA4の1ページになり、切れ目は文字の間の空白行に寄せられます。"],
      ["1枚の画像をA4数枚に分割印刷してポスターにするには？", "「分割印刷」で用紙と向き、横の枚数（例：3枚）を選ぶと、必要な行数、仕上がりサイズ、dpiが表示されます。PDFを実際のサイズ（100%）で印刷し、トンボに沿って切り、A1、A2…の順にのりしろを重ねて貼り合わせます。"],
      ["印刷するとぼやけるのはなぜ？", "結果欄のdpiを確認してください。150 dpi以上が目安で、100 dpiを下回ると近くで見たときにぼやけます。横の枚数を減らす、A3をA4にする、解像度の高い元画像を使う、のいずれかで改善できます。"],
      ["無料ですか？透かしや枚数の制限は？", "無料で登録不要、保存した画像に透かしは入りません。ブラウザを安定させるため、1回の書き出しは最大100枚、ポスターは最大64ページ、元画像は50 MBまたは6,400万画素までです。"]
    ],
    related: "関連する画像・文字ツール", relatedAria: "関連する画像・漢字ツール", footerText: "JianFan.appはブラウザで使える中国語・日本語・韓国語の文字ツールと画像ツールを提供します。",
    messages: { waiting: "画像を選択してください", loading: "画像を開いています…", ready: "画像を開きました。分割方法を選んでください。", sampleReady: "サンプル画像を読み込みました", invalidFile: "この画像を開けません。JPG、PNG、WebPなどを選択してください。", fileTooLarge: "画像が50 MBを超えています。圧縮してからお試しください。", tooManyPixels: "画像が6,400万画素を超えています。縮小してから分割してください。", libraryError: "書き出し部品を読み込めませんでした。通信を確認して再度お試しください。", exportError: "ファイルを作成できませんでした。もう一度お試しください。", rendering: "作成中 {current}/{total}…", zipDone: "{count}枚の画像を保存しました（ZIP）", pdfDone: "{count}ページのPDFを保存しました", singleDone: "{name} を保存しました", gridSummary: "{count}枚 · 1枚 {size} px", longSummary: "{count}枚 · 最大の高さ {height} px", posterSummary: "{count}ページ（横{cols}枚 × 縦{rows}枚）· 仕上がり約 {width} × {height} cm · 約 {dpi} dpi", smallTiles: "1枚が320ピクセル未満のため、SNSでは粗く見える場合があります。", tooManyParts: "{max}枚を超えています。1枚の長さを大きくするか枚数を減らしてください。", tooManyPages: "{max}ページを超えています。横の枚数を減らすか大きな用紙を選んでください。", lowDpi: "印刷解像度が低く、ぼやける可能性があります。横の枚数を減らすか、より鮮明な画像を使ってください。", clickHint: "プレビューの1枚をクリックすると、その画像だけを保存できます。", posterHint: "黄色の部分は隣のページと重なるのりしろです。", segmentPixels: "1枚の高さ（px）", segmentCount: "枚数", share: "共有・写真に保存", shareReady: "もう一度タップして共有", shared: "共有メニューを開きました", shareTapAgain: "画像の準備ができました。もう一度「共有」を押してください。", shareError: "このブラウザでは画像を共有できません。ZIPで保存してください。" }
  },
  ko: {
    title: "이미지 분할 사이트 - 사진 분할 인쇄·인스타 나누기 | JianFan.app",
    description: "무료 이미지 분할 사이트. 사진을 A4 여러 장에 분할 인쇄하고 인스타 9분할·파노라마, 긴 이미지 나누기까지 ZIP·PDF로 저장합니다. 업로드 없음.",
    eyebrow: "이미지 분할 · 분할 인쇄 · 인스타 나누기", heading: "이미지 분할 사이트: 사진 분할 인쇄와 인스타 사진 나누기",
    lede: "사진 한 장을 A4 여러 장에 나눠 큰 포스터로 분할 인쇄하고, 인스타 9분할·4분할이나 파노라마 캐러셀로 나누고, 긴 캡처 이미지를 A4 페이지로 자를 수 있습니다. 모든 처리는 브라우저에서 이루어지며 ZIP이나 PDF로 저장합니다.",
    toolTitle: "사진을 열고 분할 방식을 고르세요", dropTitle: "사진을 끌어놓거나 붙여넣고 선택하세요", dropBody: "JPG, PNG, WebP, AVIF 등 브라우저가 읽을 수 있는 50 MB 이하 이미지를 지원합니다. 사진은 기기 안에서만 처리되고 업로드되지 않습니다.", choose: "사진 선택", sample: "예시 불러오기", formats: "Ctrl / Cmd + V로 스크린샷을 바로 붙여넣을 수도 있습니다",
    fileLabel: "현재 사진", replace: "사진 바꾸기", previewLabel: "분할 미리보기", settingsLabel: "분할 설정", modeLabel: "분할 방식",
    modes: { grid: "격자 분할", long: "긴 이미지", poster: "분할 인쇄" },
    gridTitle: "가로·세로 칸으로 나누기", presets: [["3x3", "1:1", "9분할 3×3"], ["2x2", "1:1", "4분할 2×2"], ["1x3", "4:5", "가로 3장 캐러셀"], ["1x2", "original", "좌우 2분할"], ["4x1", "original", "세로 4줄"]],
    rows: "세로 칸 수(행)", cols: "가로 칸 수(열)", ratio: "한 장 비율", ratios: { original: "원본 비율 유지", "1:1": "1:1 정사각형", "4:5": "4:5 세로형", "3:4": "3:4 세로형", "9:16": "9:16 전체 화면" },
    fit: "비율이 다를 때", fits: { crop: "가운데 기준 자르기", pad: "여백 추가" }, padColor: "여백 색", padColors: { "#ffffff": "흰색", "#000000": "검은색" },
    order: "파일 번호", orders: { reading: "왼쪽 위부터 오른쪽 아래로", instagram: "인스타 게시 순서(역순)" },
    gridNote: "어둡게 표시된 부분은 잘려 나갑니다. 나누어떨어지지 않으면 이웃한 조각은 최대 1픽셀 차이가 납니다.",
    longTitle: "긴 이미지를 여러 장으로 나누기", segmentMode: "한 장 길이", segmentModes: { a4: "A4 용지 비율", screen: "휴대폰 화면 9:16", pixels: "고정 픽셀 높이", count: "같은 길이로 몇 장" },
    smartCut: "글자 피해서 자르기: 자르는 선을 빈 줄에 맞춰 글자가 반으로 잘리지 않게 합니다", longNote: "긴 캡처, 카카오톡 대화, 웹페이지를 인쇄하거나 PDF로 만들 때 좋습니다. PDF는 한 조각을 A4 한 쪽에 넣습니다.",
    posterTitle: "큰 사진을 여러 장에 분할 인쇄", paper: "용지", orientation: "방향", orientations: { portrait: "세로", landscape: "가로" }, posterCols: "가로 장수", margin: "여백(mm)", overlap: "겹침(mm)",
    marks: "재단선과 페이지 번호(A1, A2…) 인쇄", posterNote: "실제 크기(100%)로 인쇄하세요. 겹치는 부분은 맞춰 붙이기 위한 영역이고, 점선은 앞 장이 덮는 위치입니다.",
    format: "이미지 형식", zip: "모두 다운로드(ZIP)", pdf: "PDF 다운로드", share: "공유 / 사진에 저장", reset: "처음부터",
    localNote: "사진은 브라우저 안에서 분할됩니다. 처음 ZIP이나 PDF를 받을 때 오픈소스 내보내기 구성 요소를 불러오지만, 사진 자체는 서버로 보내지 않습니다.",
    featureKicker: "사진 분할 인쇄 · 인스타 9분할 · 긴 이미지 나누기", featureTitle: "사진 한 장을 세 가지 방식으로 분할",
    featureIntro: "이미지 분할은 사진 한 장을 격자, 높이, 용지 크기에 맞춰 여러 장으로 나누는 작업입니다. 이 도구는 내보내기 전에 자르는 선과 번호를 미리 보여 주고, 원본 해상도 그대로 워터마크 없이 저장합니다.",
    cards: [["A4 분할 인쇄로 큰 포스터", "A4, A3, Letter 용지와 가로 장수를 고르면 전체 장수, 완성 크기, 인쇄 dpi를 계산하고 재단선·겹침·번호가 들어간 PDF를 만듭니다."], ["인스타 9분할과 캐러셀", "1~10행 × 1~10열을 자유롭게 정하고 9분할, 4분할, 가로 캐러셀 프리셋을 쓸 수 있습니다. 1:1, 4:5, 3:4로 가운데 자르기나 여백 추가도 됩니다."], ["긴 캡처 이미지 페이지 나누기", "A4 비율, 휴대폰 화면, 픽셀 높이, 장수로 나눕니다. 자르는 위치 근처의 빈 줄을 찾아 글자를 피하고 이미지나 A4 PDF로 저장합니다."]],
    casesTitle: "이미지 분할이 필요한 상황", cases: [["사진 분할 인쇄", "아이 그림, 지도, 포스터를 A4 4장·9장으로 크게 인쇄해 이어 붙입니다. 학교 게시물이나 매장 안내문에도 좋습니다."], ["인스타 피드·게시물 사진 나누기", "사진을 3장, 6장, 9장으로 나눠 게시 순서대로 올리면 프로필에서 한 장의 큰 사진으로 보입니다."], ["긴 캡처를 페이지로", "카카오톡 대화나 웹페이지 긴 캡처를 A4 쪽으로 나눠 인쇄하거나 PDF로 보관합니다."]],
    sizesTitle: "자주 쓰는 분할 크기", sizesIntro: "용도별 추천 설정입니다. 방식이나 프리셋을 고르면 미리보기에서 바로 확인할 수 있습니다.",
    sizesHead: ["용도", "추천 설정", "참고"],
    sizes: [["A4 이어 붙이기 포스터", "분할 인쇄, 가로 2~4장", "300 dpi로 A4 한 장을 가득 인쇄하려면 약 2480×3508 px가 필요합니다. 150 dpi 이상을 권장합니다."], ["인스타 프로필 9분할", "3열 × 3행, 3:4 또는 4:5", "프로필 격자는 3:4로 보이므로 중요한 내용은 가운데에 둡니다. 번호는 ‘인스타 게시 순서’."], ["정사각형 9분할", "3×3, 1:1", "정사각형 9장. 원본이 3240×3240 px 이상이면 한 장이 1080×1080 px입니다."], ["가로 파노라마 캐러셀", "1×2~1×10, 4:5 또는 1:1", "세로 게시물은 보통 1080×1350 px(4:5)이며 자르는 선 양쪽 그림이 이어집니다."], ["긴 캡처 인쇄 / PDF", "긴 이미지, A4 용지 비율", "A4 용지는 210×297 mm입니다. 글자 피해서 자르기로 줄 중간이 잘리지 않습니다."]],
    howTitle: "온라인에서 이미지 분할하는 방법", steps: ["나눌 사진을 선택하거나 끌어놓고 붙여넣습니다.", "격자 분할, 긴 이미지, 분할 인쇄 중 하나를 고르고 프리셋이나 행·열, 비율, 용지를 조정합니다.", "미리보기에서 자르는 선, 번호, 완성 크기를 확인합니다. 미리보기의 한 조각을 누르면 그 조각만 받을 수 있습니다.", "모든 조각을 ZIP이나 PDF로 받습니다. 휴대폰에서는 ‘공유 / 사진에 저장’으로 한 번에 사진첩에 저장합니다."],
    faqTitle: "이미지 분할 자주 묻는 질문",
    faqs: [
      ["사진이 서버로 업로드되나요?", "아니요. 열기, 분할, 미리보기, ZIP 만들기, PDF 만들기가 모두 이 브라우저 안에서 처리됩니다. 처음 ZIP이나 PDF를 받을 때 오픈소스 압축·PDF 구성 요소를 불러오지만 사진 자체는 보내지 않습니다."],
      ["사진 한 장을 A4 여러 장에 분할 인쇄하려면?", "‘분할 인쇄’에서 용지와 방향, 가로 장수(예: 3장)를 고르면 필요한 행 수와 완성 크기, dpi가 표시됩니다. PDF를 실제 크기(100%)로 인쇄하고 재단선을 따라 자른 뒤 A1, A2… 순서로 겹치는 부분을 맞춰 붙이세요."],
      ["분할 인쇄한 결과가 흐릿한 이유는?", "결과 칸의 dpi를 확인하세요. 150 dpi 이상을 권장하며 100 dpi보다 낮으면 가까이서 볼 때 흐릿합니다. 가로 장수를 줄이거나 A3 대신 A4를 쓰거나 해상도가 높은 원본을 사용하세요."],
      ["인스타 9분할은 어떻게 올리나요?", "‘9분할 3×3’ 프리셋을 고르고 한 장 비율을 3:4나 4:5로 맞춘 뒤 ZIP으로 받습니다. 파일 번호를 ‘인스타 게시 순서’로 두고 post01부터 차례로 올리세요. 프로필은 최신 게시물이 왼쪽 위에 오기 때문에 오른쪽 아래 조각부터 올려야 합니다."],
      ["나눈 사진 크기가 1픽셀씩 다른 이유는?", "가로나 세로가 칸 수로 나누어떨어지지 않으면 남는 픽셀을 각 행과 열에 고르게 나누기 때문에 이웃한 조각은 최대 1픽셀 차이가 납니다. 다시 이어 붙이면 원본과 정확히 같고 빠지거나 겹치는 픽셀이 없습니다."],
      ["긴 캡처를 A4 페이지로 나눠 PDF로 만들려면?", "‘긴 이미지’로 바꾸고 한 장 길이를 ‘A4 용지 비율’로 두고 ‘글자 피해서 자르기’를 켠 채 ‘PDF 다운로드’를 누릅니다. 한 조각이 A4 한 쪽이 되고 자르는 선은 글자 사이의 빈 줄로 옮겨집니다."],
      ["무료인가요? 워터마크나 장수 제한이 있나요?", "무료이며 가입이 필요 없고 워터마크도 없습니다. 브라우저를 안정적으로 쓰기 위해 한 번에 최대 100장, 포스터는 최대 64쪽, 원본은 50 MB 또는 6,400만 화소까지 지원합니다."],
      ["어떤 형식을 지원하나요?", "JPG, PNG, WebP, AVIF, BMP, GIF(첫 프레임) 등 브라우저에서 열리는 이미지를 지원하고 PNG, JPG, ZIP, PDF로 내보냅니다."],
      ["휴대폰에서도 되나요? 사진첩에 바로 저장할 수 있나요?", "네. 휴대폰 브라우저에서 그대로 쓸 수 있습니다. 시스템 공유를 지원하는 휴대폰에는 ‘공유 / 사진에 저장’ 버튼이 보이며 나눈 사진을 한 번에 사진첩에 저장할 수 있습니다."]
    ],
    related: "관련 사진·문자 도구", relatedAria: "관련 이미지·한자 도구", footerText: "JianFan.app는 브라우저에서 실행되는 중국어·일본어·한국어 문자 도구와 이미지 도구를 제공합니다.",
    messages: { waiting: "사진을 선택해 시작하세요", loading: "사진을 여는 중…", ready: "사진을 열었습니다. 분할 방식을 고르세요.", sampleReady: "예시 사진을 불러왔습니다", invalidFile: "이 사진을 열 수 없습니다. JPG, PNG, WebP 등 일반 형식을 선택하세요.", fileTooLarge: "사진이 50 MB를 넘습니다. 압축한 뒤 다시 시도하세요.", tooManyPixels: "사진이 6,400만 화소를 넘습니다. 크기를 줄인 뒤 분할하세요.", libraryError: "내보내기 구성 요소를 불러오지 못했습니다. 네트워크를 확인한 뒤 다시 시도하세요.", exportError: "파일을 만들지 못했습니다. 다시 시도하세요.", rendering: "만드는 중 {current}/{total}…", zipDone: "사진 {count}장을 받았습니다(ZIP)", pdfDone: "{count}쪽 PDF를 받았습니다", singleDone: "{name} 파일을 받았습니다", gridSummary: "{count}장 · 한 장 {size} px", longSummary: "{count}장 · 최대 높이 {height} px", posterSummary: "{count}쪽(가로 {cols}장 × 세로 {rows}장) · 완성 약 {width} × {height} cm · 약 {dpi} dpi", smallTiles: "한 장이 320픽셀보다 작아 SNS에서 흐리게 보일 수 있습니다.", tooManyParts: "{max}장을 넘습니다. 한 장 길이를 늘리거나 장수를 줄이세요.", tooManyPages: "{max}쪽을 넘습니다. 가로 장수를 줄이거나 더 큰 용지를 고르세요.", lowDpi: "인쇄 해상도가 낮아 흐릴 수 있습니다. 가로 장수를 줄이거나 더 선명한 사진을 쓰세요.", clickHint: "미리보기의 한 조각을 누르면 그 조각만 받을 수 있습니다.", posterHint: "노란 부분은 이웃한 쪽과 겹치는 영역입니다.", segmentPixels: "한 장 높이(px)", segmentCount: "장수", share: "공유 / 사진에 저장", shareReady: "한 번 더 눌러 공유", shared: "공유 메뉴를 열었습니다", shareTapAgain: "사진이 준비됐습니다. ‘공유’를 한 번 더 누르세요.", shareError: "이 브라우저는 사진 공유를 지원하지 않습니다. ZIP으로 받으세요." }
  }
};

const relatedLinks = {
  "zh-CN": [[slug, "在线图片分割"], ["image-redaction", "图片打码"], ["photo-chinese-character-recognition", "拍照识字"], ["han-character-worksheet", "田字格字帖生成器"], ["text-formatter", "文本格式化"], ["character-counter", "字数统计"]],
  "zh-TW": [[slug, "線上圖片分割器"], ["image-redaction", "圖片馬賽克"], ["photo-chinese-character-recognition", "拍照辨識漢字"], ["han-character-worksheet", "國字練習紙"], ["text-formatter", "文字格式化"], ["character-counter", "字數統計"]],
  en: [[slug, "Image splitter"], ["image-redaction", "Image redaction"], ["photo-chinese-character-recognition", "Chinese OCR from photo"], ["han-character-worksheet", "Chinese worksheet generator"], ["text-formatter", "Text formatter"], ["character-counter", "Character counter"]],
  ja: [[slug, "画像分割ツール"], ["image-redaction", "画像モザイク加工"], ["photo-chinese-character-recognition", "写真から中国語漢字を認識"], ["han-character-worksheet", "漢字練習プリント"], ["text-formatter", "テキスト整形"], ["character-counter", "文字数カウント"]],
  ko: [[slug, "이미지 분할"], ["image-redaction", "사진 모자이크"], ["photo-chinese-character-recognition", "사진 속 중국 한자 인식"], ["han-character-worksheet", "한자 쓰기 연습장"], ["text-formatter", "텍스트 정리"], ["character-counter", "글자수 세기"]]
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

function options(map, selected) {
  return Object.entries(map).map(([value, label]) => `<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`).join("");
}

const icons = {
  download: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></svg>',
  pdf: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M9 15h6" /></svg>',
  share: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>'
};

function buildTool(page) {
  const presets = page.presets.map(([size, ratio, label], index) => `<button${index === 0 ? ' class="is-active"' : ""} type="button" data-grid-preset="${size}" data-grid-ratio="${ratio}" aria-pressed="${index === 0}">${label}</button>`).join("");
  const modes = Object.entries(page.modes).map(([mode, label], index) => `<button${index === 0 ? ' class="is-active"' : ""} type="button" role="radio" aria-checked="${index === 0}" data-splitter-mode="${mode}">${label}</button>`).join("");
  return `      <section class="standalone-tool image-splitter-tool" aria-labelledby="splitterToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">SPLIT / PREVIEW / EXPORT</p><h2 id="splitterToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="splitterStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.waiting}</span></div></div>
        <input class="visually-hidden" id="splitterFileInput" type="file" accept="image/*" />
        <div class="splitter-drop-zone" id="splitterDropZone"><div class="splitter-drop-visual" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div><h3>${page.dropTitle}</h3><p>${page.dropBody}</p><div class="splitter-drop-actions"><label class="primary-action" for="splitterFileInput">${page.choose}</label><button class="text-button" id="splitterSample" type="button">${page.sample}</button></div><small>${page.formats}</small></div>
        <div class="splitter-workspace" id="splitterWorkspace" hidden>
          <section class="splitter-preview-panel" aria-labelledby="splitterPreviewTitle"><div class="splitter-file-row"><div><span>${page.fileLabel}</span><strong id="splitterFileName">image</strong><small id="splitterFileMeta"></small></div><label for="splitterFileInput">${page.replace}</label></div><h3 class="visually-hidden" id="splitterPreviewTitle">${page.previewLabel}</h3><p class="splitter-hint" id="splitterHint">${page.messages.clickHint}</p><div class="splitter-preview-frame" id="splitterPreviewFrame"><canvas id="splitterCanvas" role="img" aria-label="${page.previewLabel}"></canvas></div></section>
          <aside class="splitter-side-panel" aria-label="${page.settingsLabel}">
            <div class="splitter-modes" role="radiogroup" aria-label="${page.modeLabel}">${modes}</div>
            <div class="splitter-options" data-splitter-panel="grid"><h3>${page.gridTitle}</h3><div class="splitter-presets">${presets}</div><div class="splitter-field-row"><label>${page.rows}<input id="splitterRows" type="number" min="1" max="10" value="3" inputmode="numeric" /></label><label>${page.cols}<input id="splitterCols" type="number" min="1" max="10" value="3" inputmode="numeric" /></label></div><div class="splitter-field-row"><label>${page.ratio}<select id="splitterRatio">${options(page.ratios, "1:1")}</select></label><label>${page.order}<select id="splitterOrder">${options(page.orders, "reading")}</select></label></div><div class="splitter-field-row" id="splitterFitRow"><label>${page.fit}<select id="splitterFit">${options(page.fits, "crop")}</select></label><label>${page.padColor}<select id="splitterPadColor">${options(page.padColors, "#ffffff")}</select></label></div><p class="splitter-note">${page.gridNote}</p></div>
            <div class="splitter-options" data-splitter-panel="long" hidden><h3>${page.longTitle}</h3><label>${page.segmentMode}<select id="splitterSegmentMode">${options(page.segmentModes, "a4")}</select></label><label id="splitterSegmentValueRow" hidden><span id="splitterSegmentValueLabel">${page.messages.segmentPixels}</span><input id="splitterSegmentValue" type="number" min="64" max="100000" value="1600" inputmode="numeric" /></label><label class="splitter-check"><input id="splitterSmartCut" type="checkbox" checked /> <span>${page.smartCut}</span></label><p class="splitter-note">${page.longNote}</p></div>
            <div class="splitter-options" data-splitter-panel="poster" hidden><h3>${page.posterTitle}</h3><div class="splitter-field-row"><label>${page.paper}<select id="splitterPaper"><option value="a4" selected>A4</option><option value="a3">A3</option><option value="letter">Letter</option></select></label><label>${page.orientation}<select id="splitterOrientation">${options(page.orientations, "portrait")}</select></label></div><div class="splitter-field-row"><label>${page.posterCols}<input id="splitterPosterCols" type="number" min="1" max="10" value="2" inputmode="numeric" /></label><label>${page.margin}<input id="splitterMargin" type="number" min="0" max="20" value="6" inputmode="numeric" /></label></div><div class="splitter-field-row"><label>${page.overlap}<input id="splitterOverlap" type="number" min="0" max="30" value="8" inputmode="numeric" /></label></div><label class="splitter-check"><input id="splitterMarks" type="checkbox" checked /> <span>${page.marks}</span></label><p class="splitter-note">${page.posterNote}</p></div>
            <div class="splitter-result" aria-live="polite"><p id="splitterSummary"></p><p class="splitter-warning" id="splitterWarning" hidden></p></div>
            <div class="splitter-export"><label id="splitterFormatRow">${page.format}<select id="splitterFormat"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></label><div class="splitter-export-actions"><button class="primary-action" id="splitterZip" type="button">${icons.download}<span>${page.zip}</span></button><button id="splitterPdf" type="button" hidden>${icons.pdf}<span>${page.pdf}</span></button><button id="splitterShare" type="button" hidden>${icons.share}<span>${page.share}</span></button></div></div>
          </aside>
          <div class="splitter-footer"><p>${page.localNote}</p><button class="splitter-reset" id="splitterReset" type="button">${page.reset}</button></div>
        </div>
      </section>`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([targetLocale, item]) => `    <link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localizedPath(targetLocale, slug)}" />`).join("\n");
  const localeOptions = Object.entries(locales).map(([value, item]) => `<option value="${value}"${value === locale ? " selected" : ""}>${item.label}</option>`).join("");
  const links = relatedLinks[locale].map(([targetSlug, label]) => `<a href="${localizedPath(locale, targetSlug)}"${targetSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const schema = JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n");
  const messages = JSON.stringify(page.messages).replaceAll("<", "\\u003c");
  const sizeRows = page.sizes.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
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
    <link rel="stylesheet" href="/image-splitter.css" />
    <script src="/theme.js"></script>
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <script defer src="/image-splitter.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${schema}
    </script>
    <!-- seo-schema:end -->
  </head>
  <body data-tool-page="image-splitter" data-page-slug="${slug}" data-locale="${locale}">
    <script type="application/json" id="imageSplitterMessages">${messages}</script>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">分</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${localeOptions}</select></label><button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false"></button></nav></header>
    <main id="main">
      <section class="tool-hero splitter-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="splitter-hero-signal" aria-hidden="true">${"<span></span>".repeat(9)}</div></section>
${buildTool(page)}
      <section class="seo-band standalone-info" aria-labelledby="splitterFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.featureKicker}</p><h2 id="splitterFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">${page.cards.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div><section class="redaction-use-cases" aria-labelledby="splitterCasesTitle"><h2 id="splitterCasesTitle">${page.casesTitle}</h2><div>${page.cases.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></section><section class="splitter-sizes" aria-labelledby="splitterSizesTitle"><h2 id="splitterSizesTitle">${page.sizesTitle}</h2><p>${page.sizesIntro}</p><div class="splitter-table-wrap"><table class="splitter-size-table"><thead><tr>${page.sizesHead.map((cell) => `<th scope="col">${cell}</th>`).join("")}</tr></thead><tbody>${sizeRows}</tbody></table></div></section><section class="pinyin-howto" aria-labelledby="splitterHowTitle"><h2 id="splitterHowTitle">${page.howTitle}</h2><ol>${page.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section><section class="pinyin-faq" aria-labelledby="splitterFaqTitle"><h2 id="splitterFaqTitle">${page.faqTitle}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">${links}</nav></section>
    </main>
    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localizedPath(locale, "about")}">${meta.about}</a><a href="${localizedPath(locale, "contact")}">${meta.contact}</a><a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
    <dialog class="splitter-dialog" id="splitterDialog" aria-labelledby="splitterDialogTitle"><form method="dialog"><h2 id="splitterDialogTitle">${meta.errorTitle}</h2><p id="splitterDialogMessage"></p><button type="submit">${meta.close}</button></form></dialog>
  </body>
</html>`;
}

function buildHomeLink(locale) {
  const labels = { "zh-CN": "图片分割与九宫格切图", "zh-TW": "圖片分割器與九宮格切圖", en: "Image splitter and grid maker", ja: "画像分割・4分割・9分割", ko: "이미지 분할·분할 인쇄" };
  return `          <!-- image-splitter-link:start -->\n          <a href="${localizedPath(locale, slug)}" data-route="image-splitter">${labels[locale]}</a>\n          <!-- image-splitter-link:end -->`;
}

function syncHomeLink(source, locale) {
  const block = buildHomeLink(locale);
  if (source.includes("<!-- image-splitter-link:start -->")) return source.replace(/          <!-- image-splitter-link:start -->[\s\S]*?          <!-- image-splitter-link:end -->/u, block);
  const anchor = "          <!-- image-redaction-link:end -->";
  if (!source.includes(anchor)) throw new Error(`${locale} homepage is missing the image redaction marker`);
  return source.replace(anchor, `${anchor}\n${block}`);
}

function buildSitemapSection() {
  const localeEntries = Object.entries(locales);
  const alternates = localeEntries.map(([locale, item]) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localizedPath(locale, slug)}" />`).join("\n");
  const urls = localeEntries.map(([locale]) => `  <url>\n    <loc>${origin}${localizedPath(locale, slug)}</loc>\n    <lastmod>2026-11-25</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${locale === "zh-CN" ? "0.9" : "0.8"}</priority>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${localizedPath("zh-CN", slug)}" />\n  </url>`).join("\n");
  return `  <!-- image-splitter-tool:start -->\n${urls}\n  <!-- image-splitter-tool:end -->`;
}

function syncSitemap(source) {
  const section = buildSitemapSection();
  if (source.includes("<!-- image-splitter-tool:start -->")) return source.replace(/  <!-- image-splitter-tool:start -->[\s\S]*?  <!-- image-splitter-tool:end -->/u, section);
  const anchor = "  <!-- blog:start -->";
  if (!source.includes(anchor)) throw new Error("sitemap.xml is missing the blog marker");
  return source.replace(anchor, `${section}\n${anchor}`);
}

async function writeOrCheck(filePath, expected) {
  expected = withSiteDirectory(expected, filePath);
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
await writeOrCheck(sitemapPath, preserveExistingLastmods(sitemap, syncSitemap(sitemap)));

console.log(`${checkOnly ? "Checked" : "Generated"} 5 multilingual image-splitter pages, homepage links, and sitemap entries.`);
