import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { preserveExistingLastmods } from "./sitemap-lastmod.mjs";
import { withSiteDirectory } from "./sync-site-tool-directory.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "chinese-to-zhuyin";
const checkOnly = process.argv.includes("--check");
const zhuyinLibrary = "https://cdn.jsdelivr.net/npm/pinyin-to-zhuyin@1.1.0/dist/pinyin-to-zhuyin.esm.js";
const zhuyinIntegrity = "sha384-JuGtdlwGQ98FCJsO16TSFzx4SKJMhBhsZXeYODXf6Ua6FazxwnTSfOFVablwvxiM";

const pinyinContext = {};
pinyinContext.globalThis = pinyinContext;
vm.runInNewContext(await readFile(path.join(projectRoot, "vendor/pinyin-pro.js"), "utf8"), pinyinContext);
vm.runInNewContext(await readFile(path.join(projectRoot, "zhuyin-core.js"), "utf8"), pinyinContext);
const { TAIWAN_EXAMPLES } = pinyinContext.JianfanZhuyin;
const toMarks = (numbered) => pinyinContext.pinyinPro.convert(numbered, { format: "numToSymbol" });

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const traditionalSample = "星期天我們去圖書館研究注音符號，銀行旁邊的垃圾要分類，過馬路注意危險。";
const simplifiedSample = "星期天我们去图书馆研究注音符号，银行旁边的垃圾要分类，过马路注意危险。";

const symbolGroups = {
  initials: [["ㄅ", "b"], ["ㄆ", "p"], ["ㄇ", "m"], ["ㄈ", "f"], ["ㄉ", "d"], ["ㄊ", "t"], ["ㄋ", "n"], ["ㄌ", "l"], ["ㄍ", "g"], ["ㄎ", "k"], ["ㄏ", "h"], ["ㄐ", "j"], ["ㄑ", "q"], ["ㄒ", "x"], ["ㄓ", "zh"], ["ㄔ", "ch"], ["ㄕ", "sh"], ["ㄖ", "r"], ["ㄗ", "z"], ["ㄘ", "c"], ["ㄙ", "s"]],
  medials: [["ㄧ", "i / yi"], ["ㄨ", "u / wu"], ["ㄩ", "ü / yu"]],
  finals: [["ㄚ", "a"], ["ㄛ", "o"], ["ㄜ", "e"], ["ㄝ", "ê"], ["ㄞ", "ai"], ["ㄟ", "ei"], ["ㄠ", "ao"], ["ㄡ", "ou"], ["ㄢ", "an"], ["ㄣ", "en"], ["ㄤ", "ang"], ["ㄥ", "eng"], ["ㄦ", "er"]]
};
const toneRows = [["", "mā", "ㄇㄚ"], ["ˊ", "má", "ㄇㄚˊ"], ["ˇ", "mǎ", "ㄇㄚˇ"], ["ˋ", "mà", "ㄇㄚˋ"], ["˙", "ma", "˙ㄇㄚ"]];

const content = {
  "zh-CN": {
    title: "汉字转注音 - 注音符号在线转换、拼音转注音 | JianFan.app",
    description: "免费汉字转注音工具，粘贴中文即可转换成注音符号（ㄅㄆㄇ），可选台湾国语或大陆普通话读音，点字修改多音字，支持拼音转注音、打印和下载注音图片。",
    eyebrow: "注音符号 · 台湾国语读音 · 多音字", heading: "汉字转注音符号在线转换",
    lede: "输入汉字、词语或整段文章，即时生成注音符号，并按台湾课本常见的“注音在字右侧”排版预览。可切换台湾国语或大陆普通话读音，点任一字修改多音字。",
    toolTitle: "输入汉字，生成注音", sample: simplifiedSample,
    messages: { idle: "等待输入汉字或拼音", ready: "注音转换完成", readyAdjusted: "注音转换完成，{count} 个字已按台湾读音标注", pinyinReady: "已把拼音转换成注音", copied: "已复制结果", copyFailed: "无法自动复制，请手动复制", error: "注音组件加载失败，请刷新页面重试", tooLong: "文本不能超过 {limit} 个字符", downloaded: "注音图片已下载", previewEmpty: "输入汉字后，这里会显示注音在字右侧的排版。", pinyinPreview: "输入的是拼音，已在右侧输出注音文字；输入汉字才会显示排版预览。", mainlandTag: "大陆读音" },
    standardLabel: "读音标准", standards: [["taiwan", "台湾国语", "教育部读音"], ["mainland", "大陆普通话", "普通话读音"]],
    formatLabel: "输出格式", formats: [["zhuyin", "注音", "ㄓㄨˋ ㄧㄣ"], ["inline", "汉字(注音)", "注(ㄓㄨˋ)音(ㄧㄣ)"], ["pinyin", "拼音", "zhù yīn"]],
    sandhi: "“一”“不”标变调", preserve: "保留标点与字母",
    inputTitle: "汉字或拼音", inputPlaceholder: "输入或粘贴简体、繁体中文，也可以输入 zhù yīn 或 zhu4 yin1 这样的拼音...", sampleLabel: "示例", clear: "清空", convert: "转换注音",
    outputTitle: "注音结果", outputPlaceholder: "转换后的注音会显示在这里", copy: "复制结果",
    previewTitle: "注音排版预览", previewHint: "点任意一个字可以改读音；底色标出的是台湾与大陆读音不同的字。", sizeLabel: "字号", sizes: [["s", "小"], ["m", "中"], ["l", "大"]], print: "打印", download: "下载图片", previewNote: "预览、打印和图片只包含前 1,500 个字符，注音文字结果不受影响。",
    readingTitle: "选择读音", readingEmpty: "在预览中点一个字，这里会列出它的全部读音。", readingReset: "恢复自动读音",
    disclaimer: "自动转换会按常见词语判断多音字，人名、地名和生僻字仍可能有其他读音，用于作业或出版前请逐字核对。",
    answerTitle: "汉字怎么转注音？",
    answer: "把中文粘贴到上方输入框，工具会先判断每个字的读音，再转换成注音符号和声调：一声不标，二声标ˊ，三声标ˇ，四声标ˋ，轻声把˙写在最前面。例如“注音符号”会转换成“ㄓㄨˋ ㄧㄣ ㄈㄨˊ ㄏㄠˋ”。",
    featureKicker: "注音符号在线转换", featureTitle: "汉字转注音、拼音转注音与注音排版", featureIntro: "适合学习台湾国语、给孩子准备注音读物、制作华语教材，或把拼音资料改成注音。所有文字只在当前浏览器中转换。",
    cards: [["台湾国语读音", "选择“台湾国语”时，会按台湾教育部读音标注星期、危险、垃圾等两岸读音不同的词，并在预览里用底色标出。"], ["多音字逐字修改", "自动按词语上下文选音，例如银行的“行”读ㄏㄤˊ。判断不准时点一下那个字，就能从全部读音里改选。"], ["打印和下载图片", "预览采用注音在字右侧的排版，可直接打印，或下载白底 PNG 图片贴进 Word、作业单和课件。"]],
    tableTitle: "注音符号与拼音对照表", tableIntro: "注音符号共 37 个：21 个声母、3 个介音和 13 个韵母，另有 4 个声调符号和轻声点。下表列出每个符号对应的汉语拼音。",
    groupNames: { initials: "声母（21）", medials: "介音（3）", finals: "韵母（13）" }, symbolHead: "注音", pinyinHead: "拼音",
    toneTitle: "声调标法", toneHead: ["声调", "注音标法", "拼音", "示例"], toneNames: ["一声", "二声", "三声", "四声", "轻声"], toneNone: "不标",
    diffTitle: "台湾与大陆读音不同的常见词", diffIntro: "以下词语在“台湾国语”模式会自动改用台湾教育部读音，切换到“大陆普通话”则保留大陆读音。", diffHead: ["词语", "大陆普通话", "台湾国语", "注音"], useSimplified: true,
    howTitle: "汉字转注音步骤", steps: ["把简体或繁体中文粘贴到输入框，也可以输入带声调的拼音。", "选择读音标准：台湾国语或大陆普通话。", "选择输出格式：纯注音、汉字加注音或拼音。", "在预览中点读错的字改选读音，然后复制结果、打印或下载图片。"],
    faqTitle: "汉字转注音常见问题",
    faqs: [
      ["注音符号和拼音有什么区别？", "两者都用来标普通话读音。拼音用拉丁字母，主要在中国大陆使用；注音符号用ㄅㄆㄇ等 37 个符号，主要在台湾使用。例如“注音”的拼音是 zhù yīn，注音是ㄓㄨˋ ㄧㄣ。"],
      ["多音字会转错吗？", "工具会按词语上下文选音，例如银行的“行”标ㄏㄤˊ，行走的“行”标ㄒㄧㄥˊ。如果仍然不对，在预览里点那个字，右侧会列出全部读音，选中后注音结果会同步更新。"],
      ["为什么“星期”“垃圾”的注音和拼音读音不一样？", "台湾教育部审定的国语读音和大陆普通话有一部分不同，例如星期标ㄒㄧㄥ ㄑㄧˊ（大陆 xīngqī），垃圾标ㄌㄜˋ ㄙㄜˋ（大陆 lājī），危险标ㄨㄟˊ ㄒㄧㄢˇ。需要大陆读音时切换到“大陆普通话”即可。"],
      ["“一”和“不”标本调还是变调？", "默认标本调，与字典一致：“一个”标ㄧ ㄍㄜˋ，“不对”标ㄅㄨˋ ㄉㄨㄟˋ。勾选“‘一’‘不’标变调”后改为实际读音ㄧˊ ㄍㄜˋ、ㄅㄨˊ ㄉㄨㄟˋ。"],
      ["可以把拼音转换成注音吗？", "可以。输入不含汉字的拼音，例如 zhù yīn 或 zhu4 yin1，会直接转换成ㄓㄨˋ ㄧㄣ，带声调符号和数字声调都支持。"],
      ["怎么把注音放进 Word 或作业单？", "可以复制“汉字(注音)”格式的文字，也可以点“打印”直接打印注音在字右侧的排版，或“下载图片”得到白底 PNG。图片会保留你在预览中改过的读音。"],
      ["输入的文字会上传吗？", "不会。读音判断和注音转换都在当前浏览器中完成，页面只从公共 CDN 加载转换程序，不会发送你输入的文字。"]
    ],
    related: "相关工具", relatedAria: "相关汉字工具",
    relatedLinks: [["chinese-to-pinyin", "汉字转拼音"], ["chinese-handwriting-recognition", "手写汉字识别"], ["photo-chinese-character-recognition", "拍照识字"], ["chinese-stroke-order", "汉字笔顺查询"], ["chinese-character-lookup", "汉字查询与结构拆解"], ["taiwan-traditional", "台湾繁体转换"], ["han-character-worksheet", "田字格字帖生成器"]],
    footerText: "JianFan.app 提供在浏览器本地运行的汉字、注音与拼音工具。"
  },
  "zh-TW": {
    title: "國字注音產生器 - 漢字轉注音符號、拼音轉注音 | JianFan.app",
    description: "免費國字注音產生器，貼上中文即可把漢字轉成注音符號，依教育部國語讀音標注星期、垃圾等兩岸異讀，可點字修改破音字，並列印或下載國字注音圖片。",
    eyebrow: "國字注音 · 教育部國語讀音 · 破音字", heading: "國字注音產生器：漢字轉注音符號",
    lede: "貼上國字、詞語或整篇文章，即時產生注音符號，並以課本常見的「注音在字右側」排版預覽。可切換臺灣國語或大陸普通話讀音，點選任一字修改破音字。",
    toolTitle: "輸入國字，產生注音", sample: traditionalSample,
    messages: { idle: "等待輸入國字或拼音", ready: "注音轉換完成", readyAdjusted: "注音轉換完成，{count} 個字已依臺灣讀音標注", pinyinReady: "已把拼音轉成注音", copied: "已複製結果", copyFailed: "無法自動複製，請手動複製", error: "注音元件載入失敗，請重新整理頁面", tooLong: "文字不能超過 {limit} 個字元", downloaded: "注音圖片已下載", previewEmpty: "輸入國字後，這裡會顯示注音在字右側的排版。", pinyinPreview: "輸入的是拼音，已在右側輸出注音文字；輸入國字才會顯示排版預覽。", mainlandTag: "大陸讀音" },
    standardLabel: "讀音標準", standards: [["taiwan", "臺灣國語", "教育部讀音"], ["mainland", "大陸普通話", "普通話讀音"]],
    formatLabel: "輸出格式", formats: [["zhuyin", "注音", "ㄓㄨˋ ㄧㄣ"], ["inline", "國字(注音)", "注(ㄓㄨˋ)音(ㄧㄣ)"], ["pinyin", "拼音", "zhù yīn"]],
    sandhi: "「一」「不」標變調", preserve: "保留標點與字母",
    inputTitle: "國字或拼音", inputPlaceholder: "輸入或貼上繁體、簡體中文，也可以輸入 zhù yīn 或 zhu4 yin1 這類拼音...", sampleLabel: "範例", clear: "清空", convert: "轉換注音",
    outputTitle: "注音結果", outputPlaceholder: "轉換後的注音會顯示在這裡", copy: "複製結果",
    previewTitle: "國字注音預覽", previewHint: "點任一個字可修改讀音；有底色的是臺灣與大陸讀音不同的字。", sizeLabel: "字級", sizes: [["s", "小"], ["m", "中"], ["l", "大"]], print: "列印", download: "下載圖片", previewNote: "預覽、列印與圖片只包含前 1,500 個字元，注音文字結果不受影響。",
    readingTitle: "選擇讀音", readingEmpty: "在預覽中點一個字，這裡會列出它的所有讀音。", readingReset: "恢復自動讀音",
    disclaimer: "自動轉換會依常見詞語判斷破音字，人名、地名與罕用字仍可能有其他讀音，用於作業或出版前請逐字核對。",
    answerTitle: "國字怎麼轉注音？",
    answer: "把中文貼進上方輸入框，工具會先判斷每個字的讀音，再轉成注音符號與聲調：一聲不標，二聲標ˊ，三聲標ˇ，四聲標ˋ，輕聲把˙寫在最前面。例如「注音符號」會轉成「ㄓㄨˋ ㄧㄣ ㄈㄨˊ ㄏㄠˋ」。",
    featureKicker: "國字注音線上轉換", featureTitle: "國字轉注音、拼音轉注音與注音排版", featureIntro: "適合準備國語作業、親子共讀的注音讀物、華語教材，或把拼音資料改成注音。所有文字只在目前的瀏覽器中轉換。",
    cards: [["教育部國語讀音", "選「臺灣國語」時，會依教育部讀音標注星期、危險、垃圾等兩岸讀音不同的詞，並在預覽中以底色標出。"], ["破音字逐字修改", "自動依詞語上下文選音，例如銀行的「行」讀ㄏㄤˊ。判斷不準時點一下那個字，就能從所有讀音中改選。"], ["列印與下載圖片", "預覽採用注音在字右側的排版，可直接列印，或下載白底 PNG 圖片貼進 Word、學習單與簡報。"]],
    tableTitle: "注音符號與拼音對照表", tableIntro: "注音符號共 37 個：21 個聲母、3 個介音與 13 個韻母，另有 4 個聲調符號與輕聲點。下表列出每個符號對應的漢語拼音。",
    groupNames: { initials: "聲母（21）", medials: "介音（3）", finals: "韻母（13）" }, symbolHead: "注音", pinyinHead: "拼音",
    toneTitle: "聲調標法", toneHead: ["聲調", "注音標法", "拼音", "範例"], toneNames: ["一聲", "二聲", "三聲", "四聲", "輕聲"], toneNone: "不標",
    diffTitle: "臺灣與大陸讀音不同的常見詞", diffIntro: "以下詞語在「臺灣國語」模式會自動改用教育部讀音，切換到「大陸普通話」則保留大陸讀音。", diffHead: ["詞語", "大陸普通話", "臺灣國語", "注音"], useSimplified: false,
    howTitle: "國字轉注音步驟", steps: ["把繁體或簡體中文貼進輸入框，也可以輸入帶聲調的拼音。", "選擇讀音標準：臺灣國語或大陸普通話。", "選擇輸出格式：純注音、國字加注音或拼音。", "在預覽中點讀錯的字改選讀音，再複製結果、列印或下載圖片。"],
    faqTitle: "國字注音常見問題",
    faqs: [
      ["國字注音產生器可以處理破音字嗎？", "可以。工具會依詞語上下文選音，例如銀行的「行」標ㄏㄤˊ，行走的「行」標ㄒㄧㄥˊ。如果仍然不對，在預覽中點那個字，右側會列出所有讀音，點選後注音結果會同步更新。"],
      ["為什麼「星期」「垃圾」的注音和大陸拼音不一樣？", "教育部審定的國語讀音與大陸普通話有部分不同，例如星期標ㄒㄧㄥ ㄑㄧˊ（大陸 xīngqī），垃圾標ㄌㄜˋ ㄙㄜˋ（大陸 lājī），危險標ㄨㄟˊ ㄒㄧㄢˇ。需要大陸讀音時切換到「大陸普通話」即可。"],
      ["「一」和「不」要標本調還是變調？", "預設標本調，與字典一致：「一個」標ㄧ ㄍㄜˋ，「不對」標ㄅㄨˋ ㄉㄨㄟˋ。勾選「『一』『不』標變調」後，改為實際讀音ㄧˊ ㄍㄜˋ、ㄅㄨˊ ㄉㄨㄟˋ。"],
      ["怎麼把國字注音放進 Word 或學習單？", "可以複製「國字(注音)」格式的文字，或按「列印」直接印出注音在字右側的排版，也可以「下載圖片」取得白底 PNG。Word 內建的注音標示遇到破音字要逐字修改，用圖片則會保留你在預覽中改好的讀音。"],
      ["可以把拼音轉成注音嗎？", "可以。輸入不含漢字的拼音，例如 zhù yīn 或 zhu4 yin1，會直接轉成ㄓㄨˋ ㄧㄣ，聲調符號與數字聲調都支援。"],
      ["簡體字也可以轉注音嗎？", "可以。簡體與繁體都能直接輸入，不必先做簡繁轉換；如果需要繁體文字，可先用臺灣繁體轉換工具處理。"],
      ["輸入的文字會上傳嗎？", "不會。讀音判斷與注音轉換都在目前的瀏覽器中完成，頁面只從公共 CDN 載入轉換程式，不會傳送你輸入的文字。"]
    ],
    related: "相關工具", relatedAria: "相關漢字工具",
    relatedLinks: [["chinese-to-pinyin", "漢字轉拼音"], ["chinese-handwriting-recognition", "手寫輸入查注音"], ["photo-chinese-character-recognition", "拍照識字"], ["chinese-stroke-order", "國字筆順查詢"], ["chinese-character-lookup", "漢字查詢與結構拆解"], ["taiwan-traditional", "臺灣繁體轉換"], ["han-character-worksheet", "國字練習簿產生器"]],
    footerText: "JianFan.app 提供在瀏覽器本機運行的漢字、注音與拼音工具。"
  },
  en: {
    title: "Chinese to Zhuyin Converter - Bopomofo with Tones | JianFan.app",
    description: "Convert Chinese characters to Zhuyin (Bopomofo) free online. Pick Taiwan or Mainland readings, fix polyphones, convert Pinyin, and print or save the result.",
    eyebrow: "Zhuyin · Bopomofo · Taiwan Mandarin", heading: "Chinese to Zhuyin (Bopomofo) Converter",
    lede: "Paste Chinese characters, words, or whole paragraphs to get Zhuyin with tone marks, shown in the Taiwan textbook layout with Bopomofo beside each character. Switch between Taiwan and Mainland readings and click any character to change its pronunciation.",
    toolTitle: "Enter Chinese and get Zhuyin", sample: traditionalSample,
    messages: { idle: "Waiting for Chinese or Pinyin", ready: "Zhuyin ready", readyAdjusted: "Zhuyin ready; {count} characters use Taiwan readings", pinyinReady: "Pinyin converted to Zhuyin", copied: "Result copied", copyFailed: "Automatic copy failed. Please copy manually.", error: "The Zhuyin component failed to load. Refresh the page.", tooLong: "Text is limited to {limit} characters", downloaded: "Zhuyin image downloaded", previewEmpty: "Enter Chinese to preview Zhuyin beside each character.", pinyinPreview: "You entered Pinyin, so only the Zhuyin text is shown. Enter Chinese characters to see the layout preview.", mainlandTag: "Mainland" },
    standardLabel: "Pronunciation", standards: [["taiwan", "Taiwan Mandarin", "Ministry of Education"], ["mainland", "Mainland Mandarin", "Putonghua"]],
    formatLabel: "Output format", formats: [["zhuyin", "Zhuyin", "ㄓㄨˋ ㄧㄣ"], ["inline", "Hanzi(Zhuyin)", "注(ㄓㄨˋ)音(ㄧㄣ)"], ["pinyin", "Pinyin", "zhù yīn"]],
    sandhi: "Mark tone changes of 一 and 不", preserve: "Keep punctuation and letters",
    inputTitle: "Chinese or Pinyin", inputPlaceholder: "Type or paste Traditional or Simplified Chinese, or Pinyin such as zhù yīn or zhu4 yin1...", sampleLabel: "Sample", clear: "Clear", convert: "Convert to Zhuyin",
    outputTitle: "Zhuyin result", outputPlaceholder: "Zhuyin appears here", copy: "Copy result",
    previewTitle: "Zhuyin layout preview", previewHint: "Click a character to change its reading. Highlighted characters are read differently in Taiwan and Mainland China.", sizeLabel: "Size", sizes: [["s", "S"], ["m", "M"], ["l", "L"]], print: "Print", download: "Download image", previewNote: "The preview, printout, and image include the first 1,500 characters. The Zhuyin text result is complete.",
    readingTitle: "Choose a reading", readingEmpty: "Click a character in the preview to list all of its readings.", readingReset: "Use automatic reading",
    disclaimer: "Readings are chosen from common words and context. Names, places, and rare characters can have other readings, so check each character before publishing or teaching.",
    answerTitle: "How do you convert Chinese to Zhuyin?",
    answer: "Paste Chinese text above. The tool picks each character's Mandarin reading and writes it in Zhuyin (Bopomofo), the 37-symbol phonetic system taught in Taiwan. Tone 1 has no mark, tones 2-4 use ˊ ˇ ˋ, and the neutral tone puts ˙ in front. For example, 注音 becomes ㄓㄨˋ ㄧㄣ (zhù yīn).",
    featureKicker: "Zhuyin converter online", featureTitle: "Chinese to Zhuyin, Pinyin to Zhuyin, and printable Bopomofo", featureIntro: "Useful for learning Taiwan Mandarin, preparing graded readers and worksheets, or turning Pinyin study notes into Zhuyin. Everything is converted in your browser.",
    cards: [["Taiwan readings", "In Taiwan mode, words read differently across the strait, such as 星期, 危險, and 垃圾, follow Taiwan's Ministry of Education and are highlighted in the preview."], ["Fix polyphonic characters", "Readings follow word context, so the 行 in 銀行 is ㄏㄤˊ. If a reading is wrong, click the character and pick another one."], ["Print or save an image", "The preview puts Zhuyin to the right of each character, like Taiwan textbooks. Print it or download a white PNG for Word, Google Docs, or slides."]],
    tableTitle: "Zhuyin to Pinyin chart", tableIntro: "Zhuyin has 37 symbols: 21 initials, 3 medials, and 13 finals, plus 4 tone marks and the neutral-tone dot. The chart lists the Pinyin equivalent of each symbol.",
    groupNames: { initials: "Initials (21)", medials: "Medials (3)", finals: "Finals (13)" }, symbolHead: "Zhuyin", pinyinHead: "Pinyin",
    toneTitle: "Zhuyin tone marks", toneHead: ["Tone", "Zhuyin mark", "Pinyin", "Example"], toneNames: ["Tone 1", "Tone 2", "Tone 3", "Tone 4", "Neutral"], toneNone: "none",
    diffTitle: "Common words read differently in Taiwan", diffIntro: "In Taiwan mode these words switch to the Ministry of Education reading. Mainland mode keeps the Putonghua reading.", diffHead: ["Word", "Mainland", "Taiwan", "Zhuyin"], useSimplified: false,
    howTitle: "How to convert Chinese to Zhuyin", steps: ["Paste Traditional or Simplified Chinese, or Pinyin with tones.", "Choose Taiwan Mandarin or Mainland Mandarin readings.", "Choose plain Zhuyin, characters with Zhuyin, or Pinyin output.", "Click any wrong character in the preview to fix it, then copy, print, or download."],
    faqTitle: "Chinese to Zhuyin FAQ",
    faqs: [
      ["What is the difference between Zhuyin and Pinyin?", "Both write Mandarin pronunciation. Pinyin uses Latin letters and is standard in Mainland China. Zhuyin, also called Bopomofo, uses 37 symbols such as ㄅㄆㄇㄈ and is used in Taiwan. 注音 is zhù yīn in Pinyin and ㄓㄨˋ ㄧㄣ in Zhuyin."],
      ["Does the converter handle polyphonic characters?", "Yes. Readings follow word context, so 銀行 (bank) gets ㄏㄤˊ and 行走 (walk) gets ㄒㄧㄥˊ. If a reading is still wrong, click that character in the preview, choose another reading, and the text result updates too."],
      ["Why does Taiwan Zhuyin differ from Mainland Pinyin for some words?", "Taiwan's Ministry of Education standard reads some characters differently. 星期 is ㄒㄧㄥ ㄑㄧˊ (Mainland xīngqī), 垃圾 is ㄌㄜˋ ㄙㄜˋ (Mainland lājī), and 危險 is ㄨㄟˊ ㄒㄧㄢˇ. Switch to Mainland Mandarin if you need Putonghua readings."],
      ["Can I convert Pinyin to Zhuyin?", "Yes. Enter Pinyin without Chinese characters, such as zhù yīn or zhu4 yin1, and it converts directly to ㄓㄨˋ ㄧㄣ. Both tone marks and tone numbers work."],
      ["Should 一 and 不 show their tone changes?", "By default they keep their dictionary tones, so 一個 is ㄧ ㄍㄜˋ and 不對 is ㄅㄨˋ ㄉㄨㄟˋ. Turn on the tone-change option to show the spoken tones ㄧˊ ㄍㄜˋ and ㄅㄨˊ ㄉㄨㄟˋ."],
      ["How do I put Zhuyin into Word or a worksheet?", "Copy the Hanzi(Zhuyin) text, print the side-by-side layout, or download a white PNG image. The image keeps any readings you corrected in the preview."],
      ["Is my text uploaded?", "No. Readings and Zhuyin are produced in your browser. The page only loads the converter code from a public CDN and never sends the text you enter."]
    ],
    related: "Related tools", relatedAria: "Related Chinese character tools",
    relatedLinks: [["chinese-to-pinyin", "Chinese to Pinyin"], ["chinese-handwriting-recognition", "Chinese handwriting recognition"], ["photo-chinese-character-recognition", "Chinese OCR"], ["chinese-stroke-order", "Chinese stroke order"], ["chinese-character-lookup", "Chinese character lookup"], ["taiwan-traditional", "Taiwan Traditional Chinese converter"], ["han-character-worksheet", "Chinese character worksheet"]],
    footerText: "JianFan.app provides browser-based Chinese character, Zhuyin, and Pinyin tools."
  },
  ja: {
    title: "注音符号 変換 - 中国語の漢字・ピンインを注音に変換 | JianFan.app",
    description: "中国語の漢字を注音符号（ボポモフォ）に無料で変換。台湾の国語読みと大陸の普通話読みを切り替え、多音字は一文字ずつ修正できます。ピンイン変換、印刷、画像保存にも対応。",
    eyebrow: "注音符号 · ボポモフォ · 台湾華語", heading: "注音符号変換：中国語の漢字を注音に",
    lede: "漢字・単語・文章を貼り付けると、声調付きの注音符号をすぐに表示します。台湾の教科書と同じく文字の右側に注音を付けたレイアウトで確認でき、台湾と大陸の読みを切り替えたり、文字をクリックして読みを直したりできます。",
    toolTitle: "中国語を入力して注音に変換", sample: traditionalSample,
    messages: { idle: "中国語またはピンインを入力してください", ready: "注音に変換しました", readyAdjusted: "注音に変換しました（{count} 文字は台湾の読み）", pinyinReady: "ピンインを注音に変換しました", copied: "結果をコピーしました", copyFailed: "自動コピーできませんでした。手動でコピーしてください", error: "注音変換の読み込みに失敗しました。ページを再読み込みしてください", tooLong: "テキストは {limit} 文字までです", downloaded: "注音画像を保存しました", previewEmpty: "漢字を入力すると、文字の右側に注音を付けたプレビューを表示します。", pinyinPreview: "ピンインが入力されたため、注音テキストのみ表示しています。漢字を入力するとレイアウトを確認できます。", mainlandTag: "大陸の読み" },
    standardLabel: "読みの基準", standards: [["taiwan", "台湾の国語", "教育部の読み"], ["mainland", "大陸の普通話", "普通話の読み"]],
    formatLabel: "出力形式", formats: [["zhuyin", "注音のみ", "ㄓㄨˋ ㄧㄣ"], ["inline", "漢字(注音)", "注(ㄓㄨˋ)音(ㄧㄣ)"], ["pinyin", "ピンイン", "zhù yīn"]],
    sandhi: "「一」「不」を変調で表示", preserve: "句読点と英字を残す",
    inputTitle: "中国語またはピンイン", inputPlaceholder: "繁体字・簡体字の中国語、または zhù yīn、zhu4 yin1 のようなピンインを入力...", sampleLabel: "例文", clear: "クリア", convert: "注音に変換",
    outputTitle: "注音の結果", outputPlaceholder: "変換した注音がここに表示されます", copy: "結果をコピー",
    previewTitle: "注音レイアウトのプレビュー", previewHint: "文字をクリックすると読みを変更できます。色付きの文字は台湾と大陸で読みが異なります。", sizeLabel: "文字サイズ", sizes: [["s", "小"], ["m", "中"], ["l", "大"]], print: "印刷", download: "画像を保存", previewNote: "プレビュー・印刷・画像は先頭 1,500 文字までです。注音テキストの結果はすべて変換されます。",
    readingTitle: "読みを選ぶ", readingEmpty: "プレビューの文字をクリックすると、その字のすべての読みを表示します。", readingReset: "自動の読みに戻す",
    disclaimer: "読みはよく使われる語と文脈から判定します。人名・地名・まれな字には別の読みがある場合があるため、教材や出版に使う前に確認してください。",
    answerTitle: "中国語を注音符号に変換するには？",
    answer: "上の入力欄に中国語を貼り付けると、各文字の普通話（国語）の読みを判定し、台湾で使われる 37 個の注音符号（ボポモフォ）で表記します。第 1 声は記号なし、第 2〜4 声は ˊ ˇ ˋ、軽声は ˙ を前に付けます。例えば「注音」は ㄓㄨˋ ㄧㄣ（zhù yīn）になります。",
    featureKicker: "注音符号オンライン変換", featureTitle: "漢字→注音、ピンイン→注音と注音レイアウト", featureIntro: "台湾華語の学習、注音付き読み物や教材の作成、ピンインのメモを注音に直す作業に使えます。文字はすべてブラウザー内で変換されます。",
    cards: [["台湾の国語読み", "「台湾の国語」では、星期・危險・垃圾など台湾と大陸で読みが違う語を台湾教育部の読みで表記し、プレビューで色分けします。"], ["多音字を一文字ずつ修正", "読みは語の文脈で判定し、銀行の「行」は ㄏㄤˊ になります。違う場合は文字をクリックして別の読みを選べます。"], ["印刷と画像保存", "台湾の教科書と同じく注音を文字の右側に配置したレイアウトを印刷したり、白背景の PNG として Word やスライドに貼ったりできます。"]],
    tableTitle: "注音符号とピンインの対照表", tableIntro: "注音符号は声母 21、介音 3、韻母 13 の計 37 個で、ほかに声調記号 4 つと軽声の点があります。各記号に対応するピンインは次のとおりです。",
    groupNames: { initials: "声母（21）", medials: "介音（3）", finals: "韻母（13）" }, symbolHead: "注音", pinyinHead: "ピンイン",
    toneTitle: "声調の書き方", toneHead: ["声調", "注音の記号", "ピンイン", "例"], toneNames: ["第1声", "第2声", "第3声", "第4声", "軽声"], toneNone: "なし",
    diffTitle: "台湾と大陸で読みが異なる主な語", diffIntro: "次の語は「台湾の国語」で台湾教育部の読みに自動で切り替わり、「大陸の普通話」では大陸の読みのまま表示します。", diffHead: ["語", "大陸の普通話", "台湾の国語", "注音"], useSimplified: false,
    howTitle: "注音に変換する手順", steps: ["繁体字または簡体字の中国語、または声調付きのピンインを貼り付けます。", "読みの基準として台湾の国語か大陸の普通話を選びます。", "出力形式を注音のみ、漢字(注音)、ピンインから選びます。", "読みが違う文字はプレビューでクリックして直し、コピー・印刷・画像保存をします。"],
    faqTitle: "注音符号変換のよくある質問",
    faqs: [
      ["注音符号とピンインの違いは？", "どちらも中国語（普通話）の発音を表す記号です。ピンインはアルファベットで中国大陸の標準、注音符号は ㄅㄆㄇㄈ などの 37 個の記号で台湾で使われます。「注音」はピンインで zhù yīn、注音で ㄓㄨˋ ㄧㄣ です。"],
      ["多音字は正しく変換されますか？", "語の文脈から読みを選ぶため、「銀行」の行は ㄏㄤˊ、「行走」の行は ㄒㄧㄥˊ になります。違っている場合はプレビューでその文字をクリックし、別の読みを選ぶとテキスト結果も更新されます。"],
      ["台湾と大陸で注音が違う語があるのはなぜ？", "台湾教育部の国語の読みは、一部の字で大陸の普通話と異なります。星期は ㄒㄧㄥ ㄑㄧˊ（大陸は xīngqī）、垃圾は ㄌㄜˋ ㄙㄜˋ（大陸は lājī）、危險は ㄨㄟˊ ㄒㄧㄢˇ です。大陸の読みが必要なら「大陸の普通話」に切り替えてください。"],
      ["ピンインを注音に変換できますか？", "できます。zhù yīn や zhu4 yin1 のように漢字を含まないピンインを入力すると、ㄓㄨˋ ㄧㄣ に直接変換します。声調記号と数字の声調のどちらにも対応しています。"],
      ["「一」と「不」は本来の声調と変調のどちらで表示されますか？", "初期設定では辞書と同じ本来の声調で、「一個」は ㄧ ㄍㄜˋ、「不對」は ㄅㄨˋ ㄉㄨㄟˋ です。変調オプションをオンにすると実際の発音 ㄧˊ ㄍㄜˋ、ㄅㄨˊ ㄉㄨㄟˋ になります。"],
      ["注音付きの文章を Word や教材に使うには？", "「漢字(注音)」形式のテキストをコピーするか、右側注音のレイアウトをそのまま印刷するか、白背景の PNG 画像を保存してください。画像にはプレビューで直した読みが反映されます。"],
      ["入力した文章はアップロードされますか？", "いいえ。読みの判定と注音への変換はブラウザー内で行います。ページは公開 CDN から変換プログラムを読み込むだけで、入力した文章は送信しません。"]
    ],
    related: "関連ツール", relatedAria: "関連する漢字ツール",
    relatedLinks: [["chinese-to-pinyin", "中国語ピンイン変換"], ["chinese-handwriting-recognition", "中国語 手書き入力"], ["photo-chinese-character-recognition", "中国語 OCR"], ["chinese-stroke-order", "中国語の筆順"], ["chinese-character-lookup", "中国語の漢字検索"], ["taiwan-traditional", "台湾繁体字変換"], ["han-character-worksheet", "漢字練習プリント作成"]],
    footerText: "JianFan.app はブラウザー内で動く漢字・注音・ピンインのツールを提供しています。"
  },
  ko: {
    title: "주음부호 변환기 - 중국어 한자를 주음부호로 변환 | JianFan.app",
    description: "중국어 한자를 대만식 주음부호(보포모포)로 무료 변환합니다. 대만·중국 발음 전환, 다음자 직접 수정, 병음→주음 변환과 인쇄, 이미지 저장을 지원합니다.",
    eyebrow: "주음부호 · 보포모포 · 대만 중국어", heading: "주음부호 변환기: 중국어 한자를 주음으로",
    lede: "한자, 단어, 문장을 붙여 넣으면 성조가 붙은 주음부호를 바로 만들어 줍니다. 대만 교과서처럼 글자 오른쪽에 주음을 단 배치로 미리 보고, 대만·중국 발음을 바꾸거나 글자를 눌러 발음을 고칠 수 있습니다.",
    toolTitle: "중국어를 입력해 주음부호로 변환", sample: traditionalSample,
    messages: { idle: "중국어나 병음을 입력하세요", ready: "주음부호 변환 완료", readyAdjusted: "변환 완료, {count}자는 대만 발음으로 표기", pinyinReady: "병음을 주음부호로 변환했습니다", copied: "결과를 복사했습니다", copyFailed: "자동으로 복사하지 못했습니다. 직접 복사해 주세요", error: "주음 변환 기능을 불러오지 못했습니다. 페이지를 새로 고쳐 주세요", tooLong: "텍스트는 {limit}자까지 입력할 수 있습니다", downloaded: "주음 이미지를 저장했습니다", previewEmpty: "한자를 입력하면 글자 오른쪽에 주음을 단 미리보기가 나타납니다.", pinyinPreview: "병음을 입력해 주음 텍스트만 표시합니다. 한자를 입력하면 배치 미리보기를 볼 수 있습니다.", mainlandTag: "중국 발음" },
    standardLabel: "발음 기준", standards: [["taiwan", "대만 국어", "교육부 발음"], ["mainland", "중국 보통화", "보통화 발음"]],
    formatLabel: "출력 형식", formats: [["zhuyin", "주음만", "ㄓㄨˋ ㄧㄣ"], ["inline", "한자(주음)", "注(ㄓㄨˋ)音(ㄧㄣ)"], ["pinyin", "병음", "zhù yīn"]],
    sandhi: "一·不 성조 변화 표시", preserve: "문장부호와 영문 유지",
    inputTitle: "중국어 또는 병음", inputPlaceholder: "번체·간체 중국어를 입력하거나 zhù yīn, zhu4 yin1 같은 병음을 입력하세요...", sampleLabel: "예문", clear: "지우기", convert: "주음으로 변환",
    outputTitle: "주음부호 결과", outputPlaceholder: "변환된 주음부호가 여기에 표시됩니다", copy: "결과 복사",
    previewTitle: "주음 배치 미리보기", previewHint: "글자를 누르면 발음을 바꿀 수 있습니다. 색이 칠해진 글자는 대만과 중국의 발음이 다른 글자입니다.", sizeLabel: "글자 크기", sizes: [["s", "작게"], ["m", "보통"], ["l", "크게"]], print: "인쇄", download: "이미지 저장", previewNote: "미리보기, 인쇄, 이미지는 앞 1,500자까지만 포함합니다. 주음 텍스트 결과는 전체가 변환됩니다.",
    readingTitle: "발음 선택", readingEmpty: "미리보기에서 글자를 누르면 그 글자의 모든 발음이 표시됩니다.", readingReset: "자동 발음으로 되돌리기",
    disclaimer: "발음은 자주 쓰는 단어와 문맥으로 판단합니다. 인명, 지명, 드문 한자는 다른 발음이 있을 수 있으니 교재나 출판에 쓰기 전에 확인하세요.",
    answerTitle: "중국어를 주음부호로 바꾸는 방법은?",
    answer: "위 입력란에 중국어를 붙여 넣으면 각 글자의 표준 중국어 발음을 판단해 대만에서 쓰는 37개 주음부호(보포모포)로 적습니다. 1성은 표시하지 않고 2~4성은 ˊ ˇ ˋ, 경성은 ˙을 앞에 붙입니다. 예를 들어 注音은 ㄓㄨˋ ㄧㄣ(zhù yīn)이 됩니다.",
    featureKicker: "주음부호 온라인 변환", featureTitle: "한자→주음, 병음→주음 변환과 주음 배치", featureIntro: "대만 중국어 공부, 주음이 달린 읽기 자료나 교재 제작, 병음 메모를 주음으로 옮기는 작업에 쓸 수 있습니다. 모든 텍스트는 브라우저 안에서 변환됩니다.",
    cards: [["대만 국어 발음", "대만 국어 모드에서는 星期, 危險, 垃圾처럼 대만과 중국에서 발음이 다른 단어를 대만 교육부 발음으로 표기하고 미리보기에 색으로 표시합니다."], ["다음자 직접 수정", "문맥에 따라 발음을 고르므로 銀行의 行은 ㄏㄤˊ로 표기됩니다. 틀린 글자는 눌러서 다른 발음을 고를 수 있습니다."], ["인쇄와 이미지 저장", "대만 교과서처럼 주음을 글자 오른쪽에 단 배치를 그대로 인쇄하거나 흰 배경 PNG로 저장해 Word나 슬라이드에 넣을 수 있습니다."]],
    tableTitle: "주음부호·병음 대조표", tableIntro: "주음부호는 성모 21개, 개음 3개, 운모 13개를 합쳐 37개이며, 성조 부호 4개와 경성 점이 따로 있습니다. 아래 표에서 각 부호에 해당하는 병음을 확인하세요.",
    groupNames: { initials: "성모(21)", medials: "개음(3)", finals: "운모(13)" }, symbolHead: "주음", pinyinHead: "병음",
    toneTitle: "성조 표기법", toneHead: ["성조", "주음 표기", "병음", "예"], toneNames: ["1성", "2성", "3성", "4성", "경성"], toneNone: "표시 없음",
    diffTitle: "대만과 중국에서 발음이 다른 주요 단어", diffIntro: "아래 단어는 대만 국어 모드에서 대만 교육부 발음으로 자동 표기되고, 중국 보통화 모드에서는 중국 발음을 유지합니다.", diffHead: ["단어", "중국 보통화", "대만 국어", "주음"], useSimplified: false,
    howTitle: "주음부호로 변환하는 순서", steps: ["번체나 간체 중국어, 또는 성조가 있는 병음을 붙여 넣습니다.", "발음 기준을 대만 국어나 중국 보통화 중에서 고릅니다.", "출력 형식을 주음만, 한자(주음), 병음 중에서 고릅니다.", "틀린 글자는 미리보기에서 눌러 고친 뒤 복사, 인쇄, 이미지 저장을 합니다."],
    faqTitle: "주음부호 변환 자주 묻는 질문",
    faqs: [
      ["주음부호와 병음은 무엇이 다른가요?", "둘 다 표준 중국어 발음을 적는 방법입니다. 병음은 로마자를 쓰며 중국 대륙의 표준이고, 주음부호는 ㄅㄆㄇㄈ 같은 37개 부호로 대만에서 씁니다. 注音은 병음으로 zhù yīn, 주음으로 ㄓㄨˋ ㄧㄣ입니다."],
      ["다음자도 제대로 바뀌나요?", "단어 문맥으로 발음을 고르기 때문에 銀行의 行은 ㄏㄤˊ, 行走의 行은 ㄒㄧㄥˊ로 표기됩니다. 그래도 틀리면 미리보기에서 그 글자를 눌러 다른 발음을 고르면 텍스트 결과도 함께 바뀝니다."],
      ["대만과 중국의 주음이 다른 단어가 있는 이유는?", "대만 교육부의 국어 발음은 일부 글자에서 중국 보통화와 다릅니다. 星期는 ㄒㄧㄥ ㄑㄧˊ(중국 xīngqī), 垃圾는 ㄌㄜˋ ㄙㄜˋ(중국 lājī), 危險은 ㄨㄟˊ ㄒㄧㄢˇ입니다. 중국 발음이 필요하면 중국 보통화로 바꾸세요."],
      ["병음을 주음부호로 바꿀 수 있나요?", "네. zhù yīn이나 zhu4 yin1처럼 한자가 없는 병음을 입력하면 ㄓㄨˋ ㄧㄣ로 바로 변환합니다. 성조 부호와 숫자 성조를 모두 지원합니다."],
      ["一와 不는 본래 성조와 바뀐 성조 중 무엇으로 표시하나요?", "기본값은 사전과 같은 본래 성조로 一個는 ㄧ ㄍㄜˋ, 不對는 ㄅㄨˋ ㄉㄨㄟˋ입니다. 성조 변화 옵션을 켜면 실제 발음인 ㄧˊ ㄍㄜˋ, ㄅㄨˊ ㄉㄨㄟˋ로 표시합니다."],
      ["주음이 달린 글을 Word나 학습지에 넣으려면?", "한자(주음) 형식 텍스트를 복사하거나, 오른쪽 주음 배치를 그대로 인쇄하거나, 흰 배경 PNG 이미지를 저장하세요. 이미지에는 미리보기에서 고친 발음이 반영됩니다."],
      ["입력한 글이 업로드되나요?", "아니요. 발음 판단과 주음 변환은 브라우저 안에서 이루어집니다. 페이지는 공개 CDN에서 변환 프로그램만 불러오며 입력한 글은 보내지 않습니다."]
    ],
    related: "관련 도구", relatedAria: "관련 한자 도구",
    relatedLinks: [["chinese-to-pinyin", "중국어 병음 변환"], ["chinese-handwriting-recognition", "중국어 필기 인식"], ["photo-chinese-character-recognition", "중국어 사진 번역 OCR"], ["chinese-stroke-order", "중국어 한자 필순"], ["chinese-character-lookup", "중국어 한자 검색"], ["taiwan-traditional", "대만 번체 변환"], ["han-character-worksheet", "한자 쓰기 연습장"]],
    footerText: "JianFan.app는 브라우저에서 실행되는 한자, 주음부호, 병음 도구를 제공합니다."
  }
};

function localizedPath(locale, targetSlug = "") {
  const prefix = locales[locale].prefix;
  return `/${prefix}${targetSlug ? `${targetSlug}/` : ""}`.replace(/\/+/gu, "/");
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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
      { "@type": "WebApplication", "@id": `${canonical}#webapp`, name, url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` } },
      { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localizedPath(locale)}` }, { "@type": "ListItem", position: 2, name, item: canonical }] },
      { "@type": "HowTo", "@id": `${canonical}#howto`, name: page.howTitle, step: page.steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, text: step })) },
      { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: [[page.answerTitle, page.answer], ...page.faqs].map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
    ]
  };
}

function buttonGroup(name, items, label) {
  return `<div class="pinyin-format-control zhuyin-choice" role="radiogroup" aria-label="${escapeHtml(label)}">${items.map(([value, text, hint], index) => `<button type="button" data-zhuyin-${name}="${value}" role="radio" aria-checked="${index === 0}"${index === 0 ? ' class="is-active"' : ""}><span>${escapeHtml(text)}</span><small>${escapeHtml(hint)}</small></button>`).join("")}</div>`;
}

function symbolTable(page) {
  const groups = Object.entries(symbolGroups).map(([key, rows]) => `<div class="zhuyin-chart-group"><h3>${page.groupNames[key]}</h3><table><thead><tr><th scope="col">${page.symbolHead}</th><th scope="col">${page.pinyinHead}</th></tr></thead><tbody>${rows.map(([symbol, pinyin]) => `<tr><td lang="zh-Hant">${symbol}</td><td>${escapeHtml(pinyin)}</td></tr>`).join("")}</tbody></table></div>`).join("");
  const tones = `<div class="zhuyin-chart-group zhuyin-tone-group"><h3>${page.toneTitle}</h3><table><thead><tr>${page.toneHead.map((head) => `<th scope="col">${head}</th>`).join("")}</tr></thead><tbody>${toneRows.map(([mark, pinyin, example], index) => `<tr><td>${page.toneNames[index]}</td><td>${mark || page.toneNone}</td><td>${pinyin}</td><td lang="zh-Hant">${example}</td></tr>`).join("")}</tbody></table></div>`;
  return `<section class="zhuyin-chart" aria-labelledby="zhuyinChartTitle"><h2 id="zhuyinChartTitle">${page.tableTitle}</h2><p>${page.tableIntro}</p><div class="zhuyin-chart-grid">${groups}${tones}</div></section>`;
}

function differenceTable(page) {
  const rows = TAIWAN_EXAMPLES.map(([traditional, simplified, mainland, taiwan, zhuyin]) => `<tr><th scope="row">${page.useSimplified ? simplified : traditional}</th><td>${toMarks(mainland)}</td><td>${toMarks(taiwan)}</td><td lang="zh-Hant">${zhuyin}</td></tr>`).join("");
  return `<section class="zhuyin-differences" aria-labelledby="zhuyinDiffTitle"><h2 id="zhuyinDiffTitle">${page.diffTitle}</h2><p>${page.diffIntro}</p><div class="zhuyin-table-scroll"><table><thead><tr>${page.diffHead.map((head) => `<th scope="col">${head}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([targetLocale, item]) => `    <link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localizedPath(targetLocale, slug)}" />`).join("\n");
  const localeOptions = Object.entries(locales).map(([value, item]) => `<option value="${value}"${value === locale ? " selected" : ""}>${item.label}</option>`).join("");
  const links = page.relatedLinks.map(([targetSlug, label]) => `<a href="${localizedPath(locale, targetSlug)}">${label}</a>`).join("");
  const schema = JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n");
  const messages = JSON.stringify(page.messages).replaceAll("<", "\\u003c");
  const importMap = JSON.stringify({ imports: { "pinyin-to-zhuyin": zhuyinLibrary }, integrity: { [zhuyinLibrary]: zhuyinIntegrity } });
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
    <link rel="stylesheet" href="/chinese-to-zhuyin.css" />
    <script src="/theme.js"></script>
    <script type="importmap">${importMap}</script>
    <link rel="modulepreload" href="${zhuyinLibrary}" integrity="${zhuyinIntegrity}" crossorigin="anonymous" />
    <script defer src="/vendor/pinyin-pro.js"></script>
    <script defer src="/traditional-pinyin.js"></script>
    <script defer src="/zhuyin-core.js"></script>
    <script type="module" src="/chinese-to-zhuyin.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${schema}
    </script>
    <!-- seo-schema:end -->
  </head>
  <body data-tool-page="chinese-to-zhuyin" data-page-slug="${slug}" data-locale="${locale}">
    <script type="application/json" id="zhuyinMessages">${messages}</script>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">注</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${localeOptions}</select></label><button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false"></button></nav></header>
    <main id="main">
      <section class="tool-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="tool-hero-glyphs zhuyin-hero-glyphs" aria-hidden="true"><span>ㄅ</span><span>ㄆ</span><span>ㄇ</span></div></section>
      <section class="standalone-tool pinyin-tool zhuyin-tool" aria-labelledby="zhuyinToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">ZHUYIN / BOPOMOFO</p><h2 id="zhuyinToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="zhuyinStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.idle}</span></div></div>
        <div class="pinyin-options zhuyin-options">
          <fieldset><legend>${page.standardLabel}</legend>${buttonGroup("standard", page.standards, page.standardLabel)}</fieldset>
          <fieldset><legend>${page.formatLabel}</legend>${buttonGroup("format", page.formats, page.formatLabel)}</fieldset>
          <div class="pinyin-switches"><label><input id="zhuyinSandhi" type="checkbox" /><span>${page.sandhi}</span></label><label><input id="zhuyinPreserve" type="checkbox" checked /><span>${page.preserve}</span></label></div>
        </div>
        <div class="pinyin-converter-grid">
          <section class="pinyin-text-panel input-variant" aria-labelledby="zhuyinInputTitle"><div class="panel-topline"><h3 id="zhuyinInputTitle">${page.inputTitle}</h3><span id="zhuyinInputCount">0</span></div><textarea id="zhuyinInput" aria-labelledby="zhuyinInputTitle" spellcheck="false" placeholder="${escapeHtml(page.inputPlaceholder)}"></textarea><div class="panel-actions"><button class="text-button" id="zhuyinSample" type="button" data-sample="${escapeHtml(page.sample)}">${page.sampleLabel}</button><button class="text-button" id="zhuyinClear" type="button">${page.clear}</button><button class="primary-action" id="zhuyinConvert" type="button">${page.convert}</button></div></section>
          <section class="pinyin-text-panel output-variant" aria-labelledby="zhuyinOutputTitle"><div class="panel-topline"><h3 id="zhuyinOutputTitle">${page.outputTitle}</h3><span id="zhuyinOutputCount">0</span></div><textarea id="zhuyinOutput" aria-labelledby="zhuyinOutputTitle" readonly spellcheck="false" placeholder="${escapeHtml(page.outputPlaceholder)}"></textarea><div class="panel-actions"><button class="text-button" id="zhuyinCopy" type="button">${page.copy}</button></div></section>
        </div>
        <div class="zhuyin-detail-grid">
          <section class="zhuyin-preview-panel" aria-labelledby="zhuyinPreviewTitle"><div class="zhuyin-preview-head"><div><p class="section-kicker">PREVIEW</p><h3 id="zhuyinPreviewTitle">${page.previewTitle}</h3></div><div class="zhuyin-preview-toolbar"><div class="zhuyin-size-control" role="radiogroup" aria-label="${page.sizeLabel}">${page.sizes.map(([value, label]) => `<button type="button" data-zhuyin-size="${value}" role="radio" aria-checked="${value === "m"}"${value === "m" ? ' class="is-active"' : ""}>${label}</button>`).join("")}</div><button class="text-button" id="zhuyinPrint" type="button" disabled>${page.print}</button><button class="primary-action" id="zhuyinDownload" type="button" disabled>${page.download}</button></div></div><p class="zhuyin-preview-hint">${page.previewHint}</p><p id="zhuyinPreviewEmpty" class="pinyin-empty">${page.messages.previewEmpty}</p><div id="zhuyinPreview" class="zhuyin-preview" lang="zh-Hant" hidden></div><p id="zhuyinPreviewNote" class="pinyin-preview-note" hidden>${page.previewNote}</p></section>
          <section class="zhuyin-reading-panel" aria-labelledby="zhuyinReadingTitle"><div><p class="section-kicker">READINGS</p><h3 id="zhuyinReadingTitle">${page.readingTitle}</h3></div><p id="zhuyinReadingEmpty" class="pinyin-empty">${page.readingEmpty}</p><strong id="zhuyinReadingCharacter" hidden></strong><div id="zhuyinReadingList" class="zhuyin-reading-list"></div><button class="text-button" id="zhuyinReadingReset" type="button" hidden>${page.readingReset}</button></section>
        </div>
        <p class="tool-disclaimer">${page.disclaimer}</p>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="zhuyinFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.featureKicker}</p><h2 id="zhuyinFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><section class="zhuyin-answer" aria-labelledby="zhuyinAnswerTitle"><h2 id="zhuyinAnswerTitle">${page.answerTitle}</h2><p>${page.answer}</p></section><div class="seo-grid">${page.cards.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div>${symbolTable(page)}${differenceTable(page)}<section class="zhuyin-howto" aria-labelledby="zhuyinHowTitle"><h2 id="zhuyinHowTitle">${page.howTitle}</h2><ol>${page.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section><section class="pinyin-faq" aria-labelledby="zhuyinFaqTitle"><h2 id="zhuyinFaqTitle">${page.faqTitle}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">${links}</nav></section>
    </main>
    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localizedPath(locale, "about")}">${meta.about}</a><a href="${localizedPath(locale, "contact")}">${meta.contact}</a><a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>`;
}

const homeLabels = { "zh-CN": "汉字转注音", "zh-TW": "國字注音產生器", en: "Chinese to Zhuyin", ja: "注音符号変換", ko: "주음부호 변환기" };

function syncHomeLink(source, locale) {
  const block = `          <!-- chinese-to-zhuyin-link:start -->\n          <a href="${localizedPath(locale, slug)}" data-route="chinese-to-zhuyin">${homeLabels[locale]}</a>\n          <!-- chinese-to-zhuyin-link:end -->`;
  if (source.includes("<!-- chinese-to-zhuyin-link:start -->")) {
    return source.replace(/          <!-- chinese-to-zhuyin-link:start -->[\s\S]*?          <!-- chinese-to-zhuyin-link:end -->/u, block);
  }
  const anchor = source.match(/^ *<a href="[^"]*chinese-to-pinyin\/" data-route="chinese-to-pinyin"[^\n]*$/mu);
  if (!anchor) throw new Error(`${locale} homepage is missing the chinese-to-pinyin link`);
  return source.replace(anchor[0], `${anchor[0]}\n${block}`);
}

function buildSitemapSection() {
  const entries = Object.entries(locales);
  const alternates = entries.map(([locale, item]) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localizedPath(locale, slug)}" />`).join("\n");
  const urls = entries.map(([locale]) => `  <url>\n    <loc>${origin}${localizedPath(locale, slug)}</loc>\n    <lastmod>2026-11-25</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${locale === "zh-CN" || locale === "zh-TW" ? "0.9" : "0.8"}</priority>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${localizedPath("zh-CN", slug)}" />\n  </url>`).join("\n");
  return `  <!-- chinese-to-zhuyin-tool:start -->\n${urls}\n  <!-- chinese-to-zhuyin-tool:end -->`;
}

function syncSitemap(source) {
  const section = buildSitemapSection();
  if (source.includes("<!-- chinese-to-zhuyin-tool:start -->")) {
    return source.replace(/  <!-- chinese-to-zhuyin-tool:start -->[\s\S]*?  <!-- chinese-to-zhuyin-tool:end -->/u, section);
  }
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
  await writeOrCheck(homepagePath, syncHomeLink(await readFile(homepagePath, "utf8"), locale));
}
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const sitemap = await readFile(sitemapPath, "utf8");
await writeOrCheck(sitemapPath, preserveExistingLastmods(sitemap, syncSitemap(sitemap)));

console.log(`${checkOnly ? "Checked" : "Generated"} 5 multilingual chinese-to-zhuyin pages, homepage links, and sitemap entries.`);
