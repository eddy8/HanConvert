import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { HANZI_PROFILES, HANZI_UI } from "./hanzi-profile-data.mjs";
import { SEO_DESCRIPTIONS } from "./seo-descriptions.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "chinese-character-lookup";
const samples = ["明", "清", "赢", "森"];

function profileCharacter(profile, locale) {
  if (locale === "zh-TW") return profile.forms.traditional;
  if (locale === "ja") return profile.forms.japanese;
  if (locale === "ko") return profile.forms.korean;
  return profile.forms.simplified;
}

function profilePath(locale, suffix = "") {
  const prefix = locales[locale].prefix;
  return `/${prefix}hanzi/${suffix ? `${suffix}/` : ""}`;
}

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "汉字查询与结构拆解 - 部首、部件查字和笔画在线查询 | JianFan.app",
    description: SEO_DESCRIPTIONS[slug]["zh-CN"],
    alternateNames: ["汉字结构查询", "汉字拆解", "汉字部首查询", "部件查字", "按部件查字"],
    eyebrow: "汉字查询 · 部件高亮 · 结构拆解",
    heading: "汉字查询与结构拆解",
    lede: "输入汉字可查看拼音、部首、笔画和结构拆解；不知道读音时，也可输入多个部件反查可能的汉字。",
    toolTitle: "输入汉字，查看字形结构",
    inputLabel: "要查询的汉字",
    placeholder: "例如：明、清、赢",
    submit: "查询汉字",
    samples: "试用示例",
    glyphTitle: "彩色部件字形",
    glyphHint: "不同颜色对应最外层部件。选择结构树中的节点，可聚焦相关笔画。",
    treeTitle: "汉字结构树",
    treeHint: "结构按字形逐层展开。部首是字典索引，部件则是组成汉字的字形单位，两者并不完全相同。",
    detailTitle: "汉字基本信息",
    labels: { pinyin: "拼音", radical: "部首", strokes: "总笔画", structure: "字形结构", unicode: "Unicode", definition: "英文释义", cantonese: "粤语拼音", japanese: "日语读音", korean: "韩国汉字音", variants: "简繁与异体" },
    formationTitle: "构字类型",
    copy: "复制汉字",
    strokeLink: "查看笔顺",
    pinyinLink: "查询拼音",
    worksheetLink: "生成字帖",
    sourceNote: "结构数据来自 Make Me a Hanzi，读音和异体信息参考 Unicode Unihan。字形拆解可能因地区字形标准或资料来源而不同，不等同于唯一的字源解释。",
    dataSource: "字形数据说明",
    unicodeSource: "Unihan 数据说明",
    featureKicker: "汉字结构查询",
    featureTitle: "正向拆解汉字，也能按部件反查生僻字",
    featureIntro: "汉字结构查询可将 IDS 字形描述转换成左右、上下、包围等常见结构，并把对应笔画直接标在字形上；遇到不知道读音、无法输入的字，还能根据看得出的汉字偏旁部首和组成部件进行部件查字。",
    cards: [
      ["逐层拆解而非只报部首", "除了字典检索使用的部首，还会显示构成汉字的其他部件及层级关系，帮助区分部首、偏旁和部件。"],
      ["多个部件组合反查", "输入氵和青可找到清，输入三个木可找到森；还可按总笔画筛选，并优先展示常用字。"],
      ["查字结果连接学习工具", "查询后可直接打开动态笔顺、汉字拼音、手写识别或田字格字帖，不必重复输入同一个字。"]
    ],
    howTitle: "如何查询、拆解或按部件查字",
    steps: ["已知汉字时，输入一个字并查看彩色字形、部首与结构树。", "不知道读音时，切换到部件查字并输入一至四个可辨认的部件。", "需要缩小范围时选择总笔画，并按常用程度或笔画数排序。", "点击候选字进入完整资料，或继续查看笔顺、拼音和字帖。"],
    faqTitle: "汉字结构拆解常见问题",
    faqs: [
      ["部首和部件是一回事吗？", "不是。部首主要用于字典分类与检索，部件是构成汉字字形的单位。一个汉字通常只有一个索引部首，但可以包含多个部件。"],
      ["为什么不同网站的拆解结果不完全一样？", "汉字可按不同层级拆分，简体、繁体以及中国大陆、台湾、日本等地区的字形也可能不同，因此同一个字可能存在多种合理描述。"],
      ["结构拆解代表汉字的真实字源吗？", "不一定。本工具主要展示现代字形的视觉组成。构字类型可作为学习提示，但不能替代古文字学或权威字源研究。"],
      ["可以一次输入多个汉字吗？", "可以。页面会提取最多十二个汉字并生成标签，点击标签即可逐字查询，标点、字母和数字会被忽略。"],
      ["不知道汉字读音，可以按部件查字吗？", "可以。输入一至四个看得出的部件，系统会匹配同时包含这些部件的汉字。相同部件可以重复输入，例如三个木可找到森。"]
    ],
    related: "相关汉字工具",
    relatedAria: "相关汉字与文字工具",
    footerText: "JianFan.app 提供浏览器中运行的汉字结构、手写识别、拼音、笔顺与中文转换工具。",
    messages: {
      loading: "正在查询汉字资料", ready: "已显示“{character}”的结构", invalid: "请输入至少一个汉字", missing: "暂时没有“{character}”的结构数据", missingDetail: "当前字库暂未收录“{character}”，可以改用手写查字或查询其他汉字。", copied: "已复制“{character}”", copyFailed: "自动复制失败，请直接选择汉字复制", structureUnavailable: "“{character}”暂无可靠的部件拆解", allStrokes: "正在显示“{character}”的全部笔画", selectedComponent: "已聚焦部件“{character}”", queryComponent: "查询“{character}”", semanticComponent: "“{character}”表意", phoneticComponent: "“{character}”表音", glyphLabel: "汉字“{character}”的彩色部件字形", glyphUnavailable: "彩色笔画暂时无法加载，已显示系统字体字形"
    },
    lookupLabels: {
      structures: { leftRight: "左右结构", topBottom: "上下结构", leftMiddleRight: "左中右结构", topMiddleBottom: "上中下结构", fullEnclosure: "全包围结构", topEnclosure: "上包围结构", bottomEnclosure: "下包围结构", leftEnclosure: "左包围结构", upperLeftEnclosure: "左上包围结构", upperRightEnclosure: "右上包围结构", lowerLeftEnclosure: "左下包围结构", rightEnclosure: "右包围结构", lowerRightEnclosure: "右下包围结构", overlaid: "叠加结构", horizontalReflection: "水平镜像结构", rotation: "旋转结构", single: "独体或其他结构" },
      formations: { ideographic: "会意字", pictographic: "象形字", pictophonetic: "形声字", unknown: "其他构字类型" },
      onReading: "音读", kunReading: "训读", wholeCharacter: "整个汉字", component: "组成部件"
    }
  },
  "zh-TW": {
    title: "漢字查詢與結構拆解 - 部件檢索、部首及筆畫線上查詢 | JianFan.app",
    description: SEO_DESCRIPTIONS[slug]["zh-TW"],
    alternateNames: ["漢字結構查詢", "漢字拆解", "國字部首查詢", "部件檢索", "部件查字"],
    eyebrow: "漢字查詢 · 部件標示 · 結構拆解",
    heading: "漢字查詢與結構拆解",
    lede: "輸入漢字可查看拼音、部首、筆畫與結構拆解；不知道讀音時，也能輸入多個部件反查可能的漢字。",
    toolTitle: "輸入漢字，查看字形結構",
    inputLabel: "要查詢的漢字",
    placeholder: "例如：明、清、贏",
    submit: "查詢漢字",
    samples: "試用範例",
    glyphTitle: "彩色部件字形",
    glyphHint: "不同顏色代表最外層部件。選取結構樹中的節點，即可聚焦相關筆畫。",
    treeTitle: "漢字結構樹",
    treeHint: "結構會依字形逐層展開。部首用於字典檢索，部件則是組成漢字的字形單位，兩者不完全相同。",
    detailTitle: "漢字基本資料",
    labels: { pinyin: "漢語拼音", radical: "部首", strokes: "總筆畫", structure: "字形結構", unicode: "Unicode", definition: "英文釋義", cantonese: "粵語拼音", japanese: "日語讀音", korean: "韓國漢字音", variants: "簡繁與異體" },
    formationTitle: "構字類型",
    copy: "複製漢字",
    strokeLink: "查看筆順",
    pinyinLink: "查詢拼音",
    worksheetLink: "製作練習紙",
    sourceNote: "結構資料來自 Make Me a Hanzi，讀音與異體資訊參考 Unicode Unihan。字形拆解可能因地區字形標準或資料來源不同，不代表唯一的字源解釋。",
    dataSource: "字形資料說明",
    unicodeSource: "Unihan 資料說明",
    featureKicker: "漢字結構查詢",
    featureTitle: "正向拆解漢字，也能依部件反查生僻字",
    featureIntro: "漢字結構查詢會將 IDS 字形描述轉換成左右、上下、包圍等常見結構，並在字形上標示對應筆畫；遇到不會讀、無法輸入的字，也可依看得出的偏旁部件進行部件檢索。",
    cards: [
      ["逐層拆解，不只列出部首", "除了字典檢索所用的部首，也會呈現其他部件與層級關係，協助分辨部首、偏旁及部件。"],
      ["組合多個部件反查", "輸入氵與青可找到清，輸入三個木可找到森；亦可依總筆畫篩選，並優先顯示常用字。"],
      ["連結既有漢字學習工具", "查詢後可直接開啟動態筆順、漢語拼音、手寫辨識或田字格練習紙，不必重新輸入。"]
    ],
    howTitle: "如何查詢、拆解或依部件找字",
    steps: ["已知漢字時，輸入一個字並查看彩色字形、部首與結構樹。", "不知道讀音時，切換至部件檢索並輸入一至四個可辨認的部件。", "需要縮小範圍時選擇總筆畫，再依常用程度或筆畫數排序。", "點選候選字查看完整資料，或繼續前往筆順、拼音與練習紙。"],
    faqTitle: "漢字結構拆解常見問題",
    faqs: [
      ["部首和部件相同嗎？", "不同。部首主要用於字典分類與檢索，部件是組成漢字字形的單位。一個漢字通常只有一個索引部首，但可能包含多個部件。"],
      ["為什麼不同網站的拆解結果不完全一樣？", "漢字可依不同層級拆分，正體、簡體及臺灣、中國大陸、日本等地區的字形也可能不同，因此可能有多種合理描述。"],
      ["結構拆解就是漢字的真實字源嗎？", "不一定。本工具主要呈現現代字形的視覺組成。構字類型可作為學習提示，但不能取代古文字學或權威字源研究。"],
      ["可以一次輸入多個漢字嗎？", "可以。頁面會擷取最多十二個漢字並產生標籤，點選標籤即可逐字查詢，標點、字母和數字會略過。"],
      ["不知道漢字讀音，可以依部件查字嗎？", "可以。輸入一至四個看得出的部件，即會配對同時含有這些部件的漢字。相同部件可重複輸入，例如三個木可找到森。"]
    ],
    related: "相關漢字工具",
    relatedAria: "相關漢字與文字工具",
    footerText: "JianFan.app 提供在瀏覽器中執行的漢字結構、手寫辨識、拼音、筆順與中文轉換工具。",
    messages: {
      loading: "正在查詢漢字資料", ready: "已顯示「{character}」的結構", invalid: "請輸入至少一個漢字", missing: "目前沒有「{character}」的結構資料", missingDetail: "目前字庫尚未收錄「{character}」，可改用手寫查字或查詢其他漢字。", copied: "已複製「{character}」", copyFailed: "自動複製失敗，請直接選取漢字複製", structureUnavailable: "「{character}」目前沒有可靠的部件拆解", allStrokes: "正在顯示「{character}」的全部筆畫", selectedComponent: "已聚焦部件「{character}」", queryComponent: "查詢「{character}」", semanticComponent: "「{character}」表意", phoneticComponent: "「{character}」表音", glyphLabel: "漢字「{character}」的彩色部件字形", glyphUnavailable: "彩色筆畫暫時無法載入，已顯示系統字型字形"
    },
    lookupLabels: {
      structures: { leftRight: "左右結構", topBottom: "上下結構", leftMiddleRight: "左中右結構", topMiddleBottom: "上中下結構", fullEnclosure: "全包圍結構", topEnclosure: "上包圍結構", bottomEnclosure: "下包圍結構", leftEnclosure: "左包圍結構", upperLeftEnclosure: "左上包圍結構", upperRightEnclosure: "右上包圍結構", lowerLeftEnclosure: "左下包圍結構", rightEnclosure: "右包圍結構", lowerRightEnclosure: "右下包圍結構", overlaid: "重疊結構", horizontalReflection: "水平鏡像結構", rotation: "旋轉結構", single: "獨體或其他結構" },
      formations: { ideographic: "會意字", pictographic: "象形字", pictophonetic: "形聲字", unknown: "其他構字類型" },
      onReading: "音讀", kunReading: "訓讀", wholeCharacter: "完整漢字", component: "組成部件"
    }
  },
  en: {
    title: "Chinese Character Lookup & Component Search | JianFan.app",
    description: SEO_DESCRIPTIONS[slug].en,
    alternateNames: ["Chinese Character Decomposition", "Hanzi Component Lookup", "Chinese Radical Lookup", "Chinese Character Component Search"],
    eyebrow: "LOOK UP · HIGHLIGHT · DECOMPOSE",
    heading: "Chinese Character Lookup & Decomposition",
    lede: "Look up a Hanzi for Pinyin, radicals, strokes and decomposition, or find an unknown Chinese character by combining the components you can recognize.",
    toolTitle: "Enter a Chinese character to inspect its structure",
    inputLabel: "Chinese character",
    placeholder: "For example: 明, 清, 赢",
    submit: "Look up character",
    samples: "Try a sample",
    glyphTitle: "Color-coded component glyph",
    glyphHint: "Colors identify the outermost components. Select a tree node to focus the strokes that belong to it.",
    treeTitle: "Character decomposition tree",
    treeHint: "The glyph is expanded by structure. A radical is a dictionary index, while components are the visual parts used to form a character.",
    detailTitle: "Character details",
    labels: { pinyin: "Pinyin", radical: "Radical", strokes: "Stroke count", structure: "Structure", unicode: "Unicode", definition: "Meaning", cantonese: "Cantonese", japanese: "Japanese readings", korean: "Korean reading", variants: "Simplified and Traditional variants" },
    formationTitle: "Formation type",
    copy: "Copy character",
    strokeLink: "View stroke order",
    pinyinLink: "Check Pinyin",
    worksheetLink: "Make practice sheet",
    sourceNote: "Structure data comes from Make Me a Hanzi; readings and variants use Unicode Unihan. Decompositions can vary by glyph region and source and are not a single authoritative account of character origin.",
    dataSource: "Character data documentation",
    unicodeSource: "Unihan documentation",
    featureKicker: "Chinese character decomposition",
    featureTitle: "Decompose a Hanzi or find a Chinese character by its components",
    featureIntro: "This Chinese character lookup turns IDS notation into familiar left-right, top-bottom and enclosure layouts. Its component search also identifies an unknown Hanzi from one to four visible parts, without requiring Pinyin or pronunciation.",
    cards: [
      ["More than a radical label", "See the dictionary radical alongside the other components and nested groups that make up the modern character shape."],
      ["Search with multiple components", "Combine visible parts such as 氵 and 青 to find 清, repeat 木 three times to find 森, then narrow matches by total stroke count."],
      ["Continue with practical tools", "Open animated stroke order, Pinyin, handwriting lookup or a printable Tian Zi Ge worksheet without entering the character again."]
    ],
    howTitle: "How to look up a Hanzi or search by components",
    steps: ["If you know the character, enter it to view its color-coded glyph, radical and decomposition tree.", "If you do not know it, switch to component search and enter one to four recognizable parts.", "Optionally filter by total stroke count and sort by common usage or stroke count.", "Choose a result to open its full details, stroke order, Pinyin or worksheet tools."],
    faqTitle: "Chinese character decomposition questions",
    faqs: [
      ["Are radicals and components the same thing?", "No. A radical is mainly an indexing category used by dictionaries. Components are the visible units that form a character, so one Hanzi can contain several components but normally has one indexing radical."],
      ["Why do decomposition results differ between sources?", "Characters can be divided at different levels, and Simplified, Traditional, mainland Chinese, Taiwanese and Japanese glyph conventions may use different shapes. More than one analysis can therefore be reasonable."],
      ["Does the tree show the true etymology of a character?", "Not necessarily. The tree describes the visible modern glyph. Formation labels are learning aids and should not replace specialist paleographic or etymological research."],
      ["Can I paste more than one character?", "Yes. The tool extracts up to twelve Han characters and creates a tab for each one. Punctuation, Latin letters and numbers are ignored."],
      ["Can I find a Chinese character without knowing its pronunciation?", "Yes. Enter one to four visible components and the tool returns characters containing all of them. Repeated components are counted, so 木木木 can find 森."]
    ],
    related: "Related Chinese tools",
    relatedAria: "Related Chinese character and text tools",
    footerText: "JianFan.app provides browser-based Chinese character structure, handwriting, Pinyin, stroke-order and text-conversion tools.",
    messages: {
      loading: "Looking up character data", ready: "Showing the structure of {character}", invalid: "Enter at least one Chinese character", missing: "No structure data is available for {character}", missingDetail: "The current dataset does not include {character}. Try handwriting lookup or search for another character.", copied: "Copied {character}", copyFailed: "Automatic copy failed. Select and copy the character directly", structureUnavailable: "No reliable component decomposition is available for {character}", allStrokes: "Showing every stroke in {character}", selectedComponent: "Focused component: {character}", queryComponent: "Look up {character}", semanticComponent: "{character} suggests meaning", phoneticComponent: "{character} suggests sound", glyphLabel: "Color-coded component glyph for {character}", glyphUnavailable: "Color-coded strokes could not load; the system-font glyph is shown instead"
    },
    lookupLabels: {
      structures: { leftRight: "Left-right", topBottom: "Top-bottom", leftMiddleRight: "Left-middle-right", topMiddleBottom: "Top-middle-bottom", fullEnclosure: "Full enclosure", topEnclosure: "Enclosed from top", bottomEnclosure: "Enclosed from bottom", leftEnclosure: "Enclosed from left", upperLeftEnclosure: "Enclosed from upper left", upperRightEnclosure: "Enclosed from upper right", lowerLeftEnclosure: "Enclosed from lower left", rightEnclosure: "Enclosed from right", lowerRightEnclosure: "Enclosed from lower right", overlaid: "Overlaid", horizontalReflection: "Horizontal reflection", rotation: "Rotated", single: "Single or other structure" },
      formations: { ideographic: "Compound ideograph", pictographic: "Pictograph", pictophonetic: "Phono-semantic compound", unknown: "Other formation" },
      onReading: "On", kunReading: "Kun", wholeCharacter: "Whole character", component: "Component"
    }
  },
  ja: {
    title: "漢字の構成・部首検索 - 部品検索と画数・構成分解 | JianFan.app",
    description: SEO_DESCRIPTIONS[slug].ja,
    alternateNames: ["漢字構成検索", "漢字分解", "漢字部首検索", "構成検索", "パーツ検索"],
    eyebrow: "漢字検索 · 部品表示 · 構成分解",
    heading: "漢字の構成・部首検索",
    lede: "漢字の部首・画数・読みと構成を確認できます。読み方が分からない漢字は、見えている複数の部品から逆引きできます。",
    toolTitle: "漢字を入力して構成を調べる",
    inputLabel: "調べる漢字",
    placeholder: "例：明、清、赢",
    submit: "漢字を検索",
    samples: "サンプル",
    glyphTitle: "部品を色分けした字形",
    glyphHint: "色は外側の構成部品に対応します。ツリーの項目を選ぶと、該当する画だけを強調できます。",
    treeTitle: "漢字の構成ツリー",
    treeHint: "字形を段階的に分解します。部首は辞書検索用の分類で、構成部品は漢字を形作る要素です。両者は同じとは限りません。",
    detailTitle: "漢字の基本情報",
    labels: { pinyin: "中国語ピンイン", radical: "部首", strokes: "画数", structure: "字形構成", unicode: "Unicode", definition: "英語の意味", cantonese: "広東語", japanese: "日本語の読み", korean: "韓国漢字音", variants: "簡体字・繁体字・異体字" },
    formationTitle: "造字法",
    copy: "漢字をコピー",
    strokeLink: "筆順を見る",
    pinyinLink: "ピンインを調べる",
    worksheetLink: "練習プリントを作る",
    sourceNote: "構成データは Make Me a Hanzi、読みと異体字は Unicode Unihan を参照しています。字形分解は地域の字体や資料によって異なり、唯一の字源解釈を示すものではありません。",
    dataSource: "字形データの説明",
    unicodeSource: "Unihan の説明",
    featureKicker: "漢字の構成を検索",
    featureTitle: "漢字を分解し、構成する部品からも検索",
    featureIntro: "IDSを左右・上下・囲みなど一般的な構成名に置き換えて表示します。読み方が分からず入力できない漢字は、一つから四つの構成部品を組み合わせる構成検索（パーツ検索）で候補を探せます。",
    cards: [
      ["部首だけでなく部品も表示", "辞書で使う部首に加え、現代の字形を構成する部品と入れ子になった関係を確認できます。"],
      ["複数の部品から漢字を検索", "山と石から岩、三つの車から轟のように、部品の組み合わせと重複を反映し、総画数でも候補を絞れます。"],
      ["筆順や練習ページへ連携", "検索した文字を再入力せず、筆順、中国語ピンイン、手書き検索、田字格の練習プリントへ移動できます。"]
    ],
    howTitle: "漢字の構成検索・パーツ検索の使い方",
    steps: ["漢字が入力できる場合は、一文字を検索して部首と構成ツリーを確認します。", "読み方が分からない場合は部品検索へ切り替え、見えている部品を一つから四つ入力します。", "必要に応じて総画数で絞り、常用順または画数順に並べます。", "候補の漢字を選び、読み、筆順、ピンインや練習プリントを確認します。"],
    faqTitle: "漢字の構成・部首検索に関する質問",
    faqs: [
      ["部首と構成部品は同じですか？", "同じではありません。部首は主に辞書で分類・検索するための代表要素です。一方、構成部品は字形を組み立てる要素で、一つの漢字に複数含まれます。"],
      ["資料によって分解結果が違うのはなぜですか？", "分解する深さが異なるほか、中国の簡体字・繁体字、台湾、日本などで字形が異なる場合があります。そのため複数の妥当な分析が存在します。"],
      ["表示された構成は漢字の字源ですか？", "必ずしも字源ではありません。このツールは主に現代字形の見た目を分解します。造字法は学習の参考情報としてご覧ください。"],
      ["熟語や文章を入力できますか？", "入力できます。最大12文字の漢字を抽出してタブに表示します。タブを選ぶと1文字ずつ構成を確認できます。"],
      ["読み方が分からない漢字も検索できますか？", "はい。見えている構成部品を一つから四つ入力すると、すべての部品を含む漢字を検索できます。同じ部品も繰り返して指定できます。"]
    ],
    related: "関連する漢字ツール",
    relatedAria: "関連する漢字・文字ツール",
    footerText: "JianFan.app はブラウザーで使える漢字構成、手書き検索、中国語ピンイン、筆順、文字変換ツールを提供します。",
    messages: {
      loading: "漢字データを検索中", ready: "「{character}」の構成を表示しています", invalid: "漢字を1文字以上入力してください", missing: "「{character}」の構成データがありません", missingDetail: "現在の字形データに「{character}」は収録されていません。手書き検索または別の漢字をお試しください。", copied: "「{character}」をコピーしました", copyFailed: "自動コピーに失敗しました。漢字を選択してコピーしてください", structureUnavailable: "「{character}」には信頼できる部品分解データがありません", allStrokes: "「{character}」のすべての画を表示中", selectedComponent: "構成部品「{character}」を強調中", queryComponent: "「{character}」を検索", semanticComponent: "「{character}」が意味を示す", phoneticComponent: "「{character}」が音を示す", glyphLabel: "「{character}」の構成部品を色分けした字形", glyphUnavailable: "色分けした画を読み込めないため、システムフォントの字形を表示しています"
    },
    lookupLabels: {
      structures: { leftRight: "左右構成", topBottom: "上下構成", leftMiddleRight: "左中右構成", topMiddleBottom: "上中下構成", fullEnclosure: "全囲み構成", topEnclosure: "上から囲む構成", bottomEnclosure: "下から囲む構成", leftEnclosure: "左から囲む構成", upperLeftEnclosure: "左上から囲む構成", upperRightEnclosure: "右上から囲む構成", lowerLeftEnclosure: "左下から囲む構成", rightEnclosure: "右から囲む構成", lowerRightEnclosure: "右下から囲む構成", overlaid: "重ね合わせ構成", horizontalReflection: "左右反転構成", rotation: "回転構成", single: "単体またはその他" },
      formations: { ideographic: "会意文字", pictographic: "象形文字", pictophonetic: "形声文字", unknown: "その他の造字法" },
      onReading: "音読み", kunReading: "訓読み", wholeCharacter: "漢字全体", component: "構成部品"
    }
  },
  ko: {
    title: "한자 부수·구성요소 검색 - 부수·획수와 글자 구조 | JianFan.app",
    description: SEO_DESCRIPTIONS[slug].ko,
    alternateNames: ["한자 구성요소 검색", "한자 구조 분해", "한자 부수 검색", "구성요소로 한자 찾기", "부수·획수 검색"],
    eyebrow: "한자 검색 · 구성요소 강조 · 구조 분해",
    heading: "한자 부수·구성요소 검색",
    lede: "한자의 부수, 획수, 중국어 병음과 구조를 확인하세요. 읽기 모르는 한자는 여러 구성요소와 총획수로 찾을 수 있습니다.",
    toolTitle: "한자를 입력하고 글자 구조 확인하기",
    inputLabel: "검색할 한자",
    placeholder: "예: 明, 清, 赢",
    submit: "한자 검색",
    samples: "예시",
    glyphTitle: "구성요소 색상 글자",
    glyphHint: "색상은 가장 바깥쪽 구성요소를 나타냅니다. 구조 트리에서 항목을 선택하면 해당 획이 강조됩니다.",
    treeTitle: "한자 구조 트리",
    treeHint: "글자 모양을 단계별로 분해합니다. 부수는 사전 검색을 위한 분류이고 구성요소는 한자 모양을 이루는 부분이므로 서로 같지 않을 수 있습니다.",
    detailTitle: "한자 기본 정보",
    labels: { pinyin: "중국어 병음", radical: "부수", strokes: "총획수", structure: "글자 구조", unicode: "Unicode", definition: "영어 뜻", cantonese: "광둥어", japanese: "일본어 음독·훈독", korean: "한국 한자음", variants: "간체자·번체자·이체자" },
    formationTitle: "한자 구성 방식",
    copy: "한자 복사",
    strokeLink: "필순 보기",
    pinyinLink: "병음 조회",
    worksheetLink: "쓰기 연습장 만들기",
    sourceNote: "구조 데이터는 Make Me a Hanzi, 읽기와 이체자 정보는 Unicode Unihan을 참고합니다. 글자 분해는 지역별 자형과 자료에 따라 달라질 수 있으며 유일한 자원 해석을 뜻하지 않습니다.",
    dataSource: "글자 데이터 설명",
    unicodeSource: "Unihan 설명",
    featureKicker: "한자 구성요소 검색",
    featureTitle: "한자를 분해하고 구성요소로 모르는 한자 찾기",
    featureIntro: "IDS 기호를 좌우, 상하, 둘러싸기처럼 익숙한 구조 이름으로 바꿔 표시합니다. 음을 모르거나 입력하기 어려운 한자는 눈에 보이는 한자 부수와 구성요소를 한 개부터 네 개까지 조합해 찾을 수 있습니다.",
    cards: [
      ["부수와 구성요소를 구분", "사전 분류에 사용하는 부수뿐 아니라 현대 한자 모양을 이루는 다른 부분과 중첩된 관계도 함께 보여 줍니다."],
      ["여러 구성요소로 한자 찾기", "氵와 青으로 清을 찾고 木을 세 번 입력해 森을 찾을 수 있습니다. 총획수 조건으로 후보를 더 줄일 수도 있습니다."],
      ["필순과 쓰기 학습으로 연결", "검색한 글자를 다시 입력하지 않고 필순, 중국어 병음, 손글씨 검색, 전자격자 쓰기 연습장으로 이동합니다."]
    ],
    howTitle: "한자 구조와 구성요소 검색 방법",
    steps: ["한자를 입력할 수 있으면 한 글자를 검색해 부수와 구조 트리를 확인합니다.", "음을 모르면 구성요소 검색으로 전환해 눈에 보이는 부분을 한 개부터 네 개까지 입력합니다.", "필요하면 총획수로 걸러 내고 자주 쓰는 순서 또는 획수순으로 정렬합니다.", "후보를 선택해 읽기, 필순, 병음과 쓰기 연습 도구를 이용합니다."],
    faqTitle: "한자 부수·구성요소 검색 질문",
    faqs: [
      ["부수와 구성요소는 같은가요?", "아닙니다. 부수는 주로 사전의 분류와 검색에 쓰는 대표 요소입니다. 구성요소는 글자 모양을 이루는 부분이므로 한 한자에 여러 개가 포함될 수 있습니다."],
      ["자료마다 분해 결과가 다른 이유는 무엇인가요?", "분해 단계가 다를 수 있고 중국 간체자, 번체자, 대만과 일본 자형에도 차이가 있습니다. 따라서 한 글자에 여러 가지 타당한 분석이 존재할 수 있습니다."],
      ["구조 트리가 실제 한자 어원을 뜻하나요?", "반드시 그렇지는 않습니다. 이 도구는 주로 현대 자형의 시각적 구성을 설명합니다. 구성 방식은 학습 참고 정보로 이용하세요."],
      ["여러 글자를 한 번에 입력할 수 있나요?", "가능합니다. 최대 12개의 한자를 추출해 탭으로 표시하며, 탭을 누르면 한 글자씩 구조를 확인할 수 있습니다."],
      ["한자 음을 몰라도 구성요소로 찾을 수 있나요?", "네. 눈에 보이는 구성요소를 한 개부터 네 개까지 입력하면 모두 포함한 한자를 찾습니다. 같은 구성요소를 여러 번 입력하는 방식도 지원합니다."]
    ],
    related: "관련 한자 도구",
    relatedAria: "관련 한자 및 텍스트 도구",
    footerText: "JianFan.app는 브라우저에서 사용하는 한자 구조, 필기 인식, 중국어 병음, 필순 및 텍스트 변환 도구를 제공합니다.",
    messages: {
      loading: "한자 데이터를 검색하는 중", ready: "‘{character}’의 구조를 표시했습니다", invalid: "한자를 한 글자 이상 입력하세요", missing: "‘{character}’의 구조 데이터가 없습니다", missingDetail: "현재 글자 데이터에 ‘{character}’가 없습니다. 손글씨 한자 찾기나 다른 한자를 이용해 보세요.", copied: "‘{character}’ 복사 완료", copyFailed: "자동 복사에 실패했습니다. 한자를 직접 선택해 복사하세요", structureUnavailable: "‘{character}’의 신뢰할 수 있는 구성요소 분해가 없습니다", allStrokes: "‘{character}’의 모든 획을 표시하고 있습니다", selectedComponent: "구성요소 ‘{character}’ 강조", queryComponent: "‘{character}’ 검색", semanticComponent: "‘{character}’가 뜻을 나타냄", phoneticComponent: "‘{character}’가 소리를 나타냄", glyphLabel: "‘{character}’의 구성요소를 색으로 구분한 글자", glyphUnavailable: "색상 획 데이터를 불러오지 못해 시스템 글꼴로 표시합니다"
    },
    lookupLabels: {
      structures: { leftRight: "좌우 구조", topBottom: "상하 구조", leftMiddleRight: "좌중우 구조", topMiddleBottom: "상중하 구조", fullEnclosure: "완전 둘러싸기", topEnclosure: "위에서 둘러싸기", bottomEnclosure: "아래에서 둘러싸기", leftEnclosure: "왼쪽에서 둘러싸기", upperLeftEnclosure: "왼쪽 위에서 둘러싸기", upperRightEnclosure: "오른쪽 위에서 둘러싸기", lowerLeftEnclosure: "왼쪽 아래에서 둘러싸기", rightEnclosure: "오른쪽에서 둘러싸기", lowerRightEnclosure: "오른쪽 아래에서 둘러싸기", overlaid: "겹침 구조", horizontalReflection: "좌우 반전 구조", rotation: "회전 구조", single: "독체 또는 기타 구조" },
      formations: { ideographic: "회의자", pictographic: "상형자", pictophonetic: "형성자", unknown: "기타 구성 방식" },
      onReading: "음독", kunReading: "훈독", wholeCharacter: "한자 전체", component: "구성요소"
    }
  }
};

const componentSearchContent = {
  "zh-CN": {
    modeAria: "汉字查询方式", characterMode: "单字查询", componentMode: "部件查字",
    title: "按部件反查汉字", intro: "输入一至四个看得出的汉字部件，查找同时包含这些部件的字。相同部件可以重复输入。",
    inputLabel: "汉字部件", placeholder: "例如：氵 青，或 木木木", submit: "查找汉字",
    selectedLabel: "已选部件", selectedEmpty: "尚未选择部件", clear: "清空",
    commonLabel: "常用偏旁部件", strokeLabel: "总笔画", strokeAll: "不限", sortLabel: "结果排序", sortCommon: "常用字优先", sortStrokes: "笔画少优先",
    resultsTitle: "候选汉字", initialHint: "输入部件或点击常用部件，即可反查可能的汉字。", loadMore: "显示更多",
    loading: "正在匹配部件", invalid: "请输入一至四个汉字部件", failed: "部件索引暂时无法加载，请稍后重试", noResults: "没有找到同时包含这些部件的汉字，可以减少部件或取消笔画筛选。",
    resultSummary: "找到 {count} 个包含“{components}”的汉字", removeComponent: "移除部件“{character}”", addComponent: "添加部件“{character}”",
    resultLabel: "查看汉字“{character}”，{strokes}画，拼音 {reading}", resultStroke: "{count}画", findContaining: "查找含“{character}”的字"
  },
  "zh-TW": {
    modeAria: "漢字查詢方式", characterMode: "單字查詢", componentMode: "部件檢索",
    title: "依部件反查漢字", intro: "輸入一至四個看得出的漢字部件，尋找同時包含這些部件的字。相同部件可以重複輸入。",
    inputLabel: "漢字部件", placeholder: "例如：氵 青，或 木木木", submit: "尋找漢字",
    selectedLabel: "已選部件", selectedEmpty: "尚未選取部件", clear: "清除",
    commonLabel: "常用偏旁部件", strokeLabel: "總筆畫", strokeAll: "不限", sortLabel: "結果排序", sortCommon: "常用字優先", sortStrokes: "筆畫少優先",
    resultsTitle: "候選漢字", initialHint: "輸入部件或點選常用部件，即可反查可能的漢字。", loadMore: "顯示更多",
    loading: "正在配對部件", invalid: "請輸入一至四個漢字部件", failed: "部件索引暫時無法載入，請稍後再試", noResults: "找不到同時包含這些部件的漢字，可減少部件或取消筆畫篩選。",
    resultSummary: "找到 {count} 個包含「{components}」的漢字", removeComponent: "移除部件「{character}」", addComponent: "加入部件「{character}」",
    resultLabel: "查看漢字「{character}」，{strokes}畫，漢語拼音 {reading}", resultStroke: "{count}畫", findContaining: "尋找含「{character}」的字"
  },
  en: {
    modeAria: "Chinese character search mode", characterMode: "Character lookup", componentMode: "Component search",
    title: "Find a Chinese character by components", intro: "Enter one to four visible parts to find Hanzi containing all of them. Repeat a component when it appears more than once.",
    inputLabel: "Character components", placeholder: "For example: 氵 青 or 木木木", submit: "Find characters",
    selectedLabel: "Selected components", selectedEmpty: "No components selected", clear: "Clear",
    commonLabel: "Common radicals and components", strokeLabel: "Total strokes", strokeAll: "Any", sortLabel: "Sort results", sortCommon: "Common first", sortStrokes: "Fewest strokes first",
    resultsTitle: "Matching characters", initialHint: "Enter components or choose common parts to start a Chinese character component search.", loadMore: "Show more",
    loading: "Matching components", invalid: "Enter one to four Chinese character components", failed: "The component index could not load. Try again shortly", noResults: "No character contains all of these components. Remove a component or clear the stroke filter.",
    resultSummary: "Found {count} characters containing {components}", removeComponent: "Remove component {character}", addComponent: "Add component {character}",
    resultLabel: "View {character}, {strokes} strokes, Pinyin {reading}", resultStroke: "{count} strokes", findContaining: "Find characters containing {character}"
  },
  ja: {
    modeAria: "漢字の検索方法", characterMode: "漢字から調べる", componentMode: "部品から探す",
    title: "構成検索（パーツ検索）", intro: "読み方が分からない漢字を、見えている一つから四つの構成部品で検索できます。同じ部品も繰り返し指定できます。",
    inputLabel: "漢字を構成する部品", placeholder: "例：山 石、または 車車車", submit: "漢字を検索",
    selectedLabel: "選択した部品", selectedEmpty: "部品が選択されていません", clear: "クリア",
    commonLabel: "よく使う構成部品", strokeLabel: "総画数", strokeAll: "指定なし", sortLabel: "並び順", sortCommon: "常用漢字を優先", sortStrokes: "画数が少ない順",
    resultsTitle: "候補の漢字", initialHint: "部品を入力するか、よく使う構成部品を選んで検索してください。", loadMore: "さらに表示",
    loading: "構成部品を検索中", invalid: "構成部品を一つから四つ入力してください", failed: "部品検索データを読み込めません。しばらくしてから再度お試しください", noResults: "すべての部品を含む漢字が見つかりません。部品を減らすか、総画数の指定を解除してください。",
    resultSummary: "「{components}」を含む漢字が {count} 字見つかりました", removeComponent: "部品「{character}」を削除", addComponent: "部品「{character}」を追加",
    resultLabel: "漢字「{character}」を表示、{strokes}画、中国語ピンイン {reading}", resultStroke: "{count}画", findContaining: "「{character}」を含む漢字を探す"
  },
  ko: {
    modeAria: "한자 검색 방법", characterMode: "한자 조회", componentMode: "구성요소로 찾기",
    title: "구성요소로 한자 찾기", intro: "읽기 모르는 한자를 눈에 보이는 구성요소 한 개부터 네 개로 찾으세요. 같은 부분이 반복되면 여러 번 입력할 수 있습니다.",
    inputLabel: "한자 구성요소", placeholder: "예: 氵 青 또는 木木木", submit: "한자 찾기",
    selectedLabel: "선택한 구성요소", selectedEmpty: "선택한 구성요소 없음", clear: "지우기",
    commonLabel: "자주 쓰는 부수·구성요소", strokeLabel: "총획수", strokeAll: "전체", sortLabel: "결과 정렬", sortCommon: "자주 쓰는 한자 우선", sortStrokes: "획수 적은 순",
    resultsTitle: "후보 한자", initialHint: "구성요소를 입력하거나 자주 쓰는 부수를 선택해 한자를 찾아보세요.", loadMore: "더 보기",
    loading: "구성요소를 검색하는 중", invalid: "한자 구성요소를 한 개부터 네 개까지 입력하세요", failed: "구성요소 검색 데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요", noResults: "모든 구성요소를 포함한 한자가 없습니다. 구성요소를 줄이거나 총획수 조건을 해제하세요.",
    resultSummary: "‘{components}’를 포함한 한자 {count}개", removeComponent: "구성요소 ‘{character}’ 삭제", addComponent: "구성요소 ‘{character}’ 추가",
    resultLabel: "한자 ‘{character}’ 보기, {strokes}획, 중국어 병음 {reading}", resultStroke: "{count}획", findContaining: "‘{character}’를 포함한 한자 찾기"
  }
};

const popularComponents = {
  "zh-CN": ["亻", "氵", "扌", "口", "女", "子", "宀", "心", "忄", "木", "火", "灬", "日", "月", "讠", "纟", "艹", "辶", "阝", "钅", "贝", "车"],
  "zh-TW": ["亻", "氵", "扌", "口", "女", "子", "宀", "心", "忄", "木", "火", "灬", "日", "月", "言", "糸", "艹", "辶", "阝", "金", "貝", "車"],
  en: ["亻", "氵", "扌", "口", "女", "子", "宀", "心", "木", "火", "日", "月", "言", "讠", "糸", "纟", "艹", "辶", "阝", "金", "钅", "貝", "贝", "車", "车"],
  ja: ["亻", "氵", "扌", "口", "女", "子", "宀", "心", "忄", "木", "火", "灬", "日", "月", "言", "糸", "艹", "辶", "阝", "金", "貝", "車"],
  ko: ["亻", "氵", "扌", "口", "女", "子", "宀", "心", "忄", "木", "火", "灬", "日", "月", "言", "糸", "艹", "辶", "阝", "金", "貝", "車"]
};

const relatedLabels = {
  "zh-CN": [[slug, "汉字查询与结构拆解"], ["chinese-handwriting-recognition", "手写汉字识别"], ["chinese-stroke-order", "汉字笔顺查询"], ["chinese-to-pinyin", "汉字转拼音"], ["han-character-worksheet", "汉字练习纸"], ["character-counter", "在线字数统计"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["kanji-to-romaji", "日文汉字转罗马字"], ["japanese-characters", "日文字符复制"], ["word-to-txt", "Word 转 TXT"]],
  "zh-TW": [[slug, "漢字查詢與結構拆解"], ["chinese-handwriting-recognition", "手寫漢字辨識"], ["chinese-stroke-order", "漢字筆順查詢"], ["chinese-to-pinyin", "漢字轉拼音"], ["han-character-worksheet", "國字練習紙"], ["character-counter", "線上字數統計"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["kanji-to-romaji", "日文漢字轉羅馬字"], ["japanese-characters", "日文字元複製"], ["word-to-txt", "DOCX 轉 TXT"]],
  en: [[slug, "Chinese character lookup"], ["chinese-handwriting-recognition", "Find a Chinese character by drawing"], ["chinese-stroke-order", "Chinese stroke order"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["han-character-worksheet", "Chinese worksheet generator"], ["character-counter", "CJK character counter"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["kanji-to-romaji", "Kanji to Romaji"], ["japanese-characters", "Japanese character copy"], ["word-to-txt", "Word to text"]],
  ja: [[slug, "漢字の構成・部首検索"], ["chinese-handwriting-recognition", "漢字手書き検索"], ["chinese-stroke-order", "中国語漢字の筆順"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["han-character-worksheet", "漢字練習プリント"], ["character-counter", "文字数カウント"], ["japanese-chinese-kanji-converter", "日本語漢字・簡体字・繁体字変換"], ["kanji-to-romaji", "漢字・ローマ字変換"], ["japanese-characters", "日本語文字コピー"], ["word-to-txt", "Word TXT 変換"]],
  ko: [[slug, "한자 부수·구성요소 검색"], ["chinese-handwriting-recognition", "한자 필기 인식"], ["chinese-stroke-order", "중국어 한자 필순"], ["chinese-to-pinyin", "중국어 병음 변환"], ["han-character-worksheet", "한자 쓰기 연습장"], ["character-counter", "글자수 세기"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["kanji-to-romaji", "일본어 한자 로마자 변환"], ["japanese-characters", "일본어 문자 복사"], ["word-to-txt", "DOCX TXT 변환"]]
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localizedPath(locale, targetSlug = "") {
  return `/${locales[locale].prefix}${targetSlug ? `${targetSlug}/` : ""}`;
}

function buildStrokeOptions(component) {
  return [
    `<option value="">${component.strokeAll}</option>`,
    ...Array.from({ length: 30 }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`),
    '<option value="31+">31+</option>'
  ].join("");
}

function buildSchema(locale, page) {
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication", "@id": `${canonical}#webapp`, name: page.heading, alternateName: page.alternateNames,
        url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any",
        browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` }
      },
      {
        "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
          { "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localizedPath(locale)}` },
          { "@type": "ListItem", position: 2, name: page.heading, item: canonical }
        ]
      },
      { "@type": "HowTo", "@id": `${canonical}#howto`, name: page.howTitle, step: page.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text })) },
      {
        "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({
          "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer }
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
    <script defer src="/han-character-lookup-core.js"></script>
    <script defer src="/han-character-lookup.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n")}
    </script>
    <!-- seo-schema:end -->`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const component = componentSearchContent[locale];
  const options = Object.entries(locales).map(([value, option]) => `              <option value="${value}"${value === locale ? " selected" : ""}>${option.label}</option>`).join("\n");
  const messageAttributes = Object.entries(page.messages).map(([key, value]) => ` data-message-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`).join("");
  const related = relatedLabels[locale].map(([targetSlug, label]) => `          <a href="${localizedPath(locale, targetSlug)}"${targetSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("\n");
  const base = (targetSlug) => localizedPath(locale, targetSlug);
  const profileUi = HANZI_UI[locale];
  const profileLinks = HANZI_PROFILES.map((profile) => `          <a href="${profilePath(locale, profile.slug)}">${profileCharacter(profile, locale)}</a>`).join("\n");

  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, page)}
  </head>
  <body data-tool-page="han-character-lookup" data-page-slug="${slug}" data-locale="${locale}" data-initial-character="明"${messageAttributes}>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}">
      <a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">字</span><span>JianFan.app</span></a>
      <nav class="top-actions" aria-label="${meta.nav}">
        <a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a>
        <label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${options}
          </select></label>
      </nav>
    </header>
    <main id="main">
      <section class="tool-hero han-lookup-hero" aria-labelledby="pageTitle">
        <div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div>
        <div class="han-lookup-hero-equation" aria-hidden="true"><span>氵</span><i>+</i><span>青</span><i>=</i><strong>清</strong></div>
      </section>

      <section class="standalone-tool han-lookup-tool" aria-labelledby="hanLookupToolTitle">
        <div class="standalone-tool-head">
          <div><p class="section-kicker">LOOK UP / DECOMPOSE / FOCUS</p><h2 id="hanLookupToolTitle">${page.toolTitle}</h2></div>
          <div class="han-lookup-mode-switch" role="tablist" aria-label="${component.modeAria}">
            <button id="hanLookupCharacterMode" type="button" role="tab" aria-selected="true" aria-controls="hanCharacterLookupPanel" data-han-lookup-mode="character">${component.characterMode}</button>
            <button id="hanLookupComponentMode" type="button" role="tab" aria-selected="false" aria-controls="hanComponentLookupPanel" data-han-lookup-mode="component">${component.componentMode}</button>
          </div>
          <div class="status-pill" id="hanLookupStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.loading}</span></div>
        </div>
        <div id="hanCharacterLookupPanel" role="tabpanel" aria-labelledby="hanLookupCharacterMode">
        <form class="han-lookup-form" id="hanLookupForm">
          <label for="hanLookupInput">${page.inputLabel}</label>
          <div><input id="hanLookupInput" type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="${page.placeholder}" /><button class="primary-action" id="hanLookupSubmit" type="submit">${page.submit}</button></div>
        </form>
        <div class="han-lookup-samples"><span>${page.samples}</span>${samples.map((character) => `<button type="button" data-han-lookup-sample="${character}">${character}</button>`).join("")}</div>
        <div class="han-lookup-character-tabs" id="hanLookupCharacterTabs" role="group" aria-label="${page.inputLabel}" hidden></div>

        <div class="han-lookup-workspace">
          <section class="han-lookup-glyph-panel" aria-labelledby="hanLookupGlyphTitle">
            <div class="panel-topline"><div><h3 id="hanLookupGlyphTitle">${page.glyphTitle}</h3><p>${page.glyphHint}</p></div></div>
            <div class="han-lookup-glyph-stage"><div id="hanLookupGlyph"></div><span id="hanLookupGlyphFallback">明</span></div>
            <div class="han-lookup-focus-bar"><span id="hanLookupSelectedText">${page.messages.allStrokes.replace("{character}", "明")}</span><div><button id="hanLookupSelectedQuery" type="button" hidden></button><button id="hanLookupSelectedFind" type="button" hidden></button></div></div>
          </section>

          <section class="han-lookup-tree-panel" aria-labelledby="hanLookupTreeTitle">
            <div class="panel-topline"><div><h3 id="hanLookupTreeTitle">${page.treeTitle}</h3><p>${page.treeHint}</p></div></div>
            <div class="han-lookup-tree" id="hanLookupStructureTree"></div>
            <p class="han-lookup-tree-empty" id="hanLookupStructureEmpty" hidden></p>
          </section>

          <aside class="han-lookup-detail-panel" aria-labelledby="hanLookupDetailTitle">
            <div class="han-lookup-detail-heading"><span id="hanLookupCurrentCharacter">明</span><div><p class="section-kicker">CHARACTER DATA</p><h3 id="hanLookupDetailTitle">${page.detailTitle}</h3></div></div>
            <dl class="han-lookup-facts">
              <div><dt>${page.labels.pinyin}</dt><dd id="hanLookupPinyin">-</dd></div>
              <div><dt>${page.labels.radical}</dt><dd id="hanLookupRadical">-</dd></div>
              <div><dt>${page.labels.strokes}</dt><dd id="hanLookupStrokes">-</dd></div>
              <div><dt>${page.labels.structure}</dt><dd id="hanLookupStructure">-</dd></div>
              <div><dt>${page.labels.unicode}</dt><dd id="hanLookupUnicode">U+660E</dd></div>
              <div id="hanLookupDefinitionRow" hidden><dt>${page.labels.definition}</dt><dd id="hanLookupDefinition">-</dd></div>
              <div id="hanLookupCantoneseRow" hidden><dt>${page.labels.cantonese}</dt><dd id="hanLookupCantonese">-</dd></div>
              <div id="hanLookupJapaneseRow" hidden><dt>${page.labels.japanese}</dt><dd id="hanLookupJapanese">-</dd></div>
              <div id="hanLookupKoreanRow" hidden><dt>${page.labels.korean}</dt><dd id="hanLookupKorean">-</dd></div>
              <div id="hanLookupVariantsRow" hidden><dt>${page.labels.variants}</dt><dd class="han-lookup-variants" id="hanLookupVariants"></dd></div>
            </dl>
            <div class="han-lookup-formation" id="hanLookupFormation" hidden><span>${page.formationTitle}</span><strong id="hanLookupFormationType"></strong><small id="hanLookupFormationDetail"></small></div>
            <div class="han-lookup-actions">
              <button class="primary-action" id="hanLookupCopy" type="button">${page.copy}</button>
              <a id="hanLookupStrokeLink" data-base="${base("chinese-stroke-order")}" href="${base("chinese-stroke-order")}?character=明">${page.strokeLink}</a>
              <a id="hanLookupPinyinLink" data-base="${base("chinese-to-pinyin")}" href="${base("chinese-to-pinyin")}?character=明">${page.pinyinLink}</a>
              <a id="hanLookupWorksheetLink" data-base="${base("han-character-worksheet")}" href="${base("han-character-worksheet")}?character=明">${page.worksheetLink}</a>
            </div>
          </aside>
        </div>
        </div>

        <section class="han-component-panel" id="hanComponentLookupPanel" role="tabpanel" aria-labelledby="hanLookupComponentMode" hidden>
          <div class="han-component-workspace">
            <form class="han-component-form" id="hanComponentForm">
              <div class="han-component-heading"><p class="section-kicker">COMPONENT / RADICAL / STROKES</p><h3>${component.title}</h3><p>${component.intro}</p></div>
              <label for="hanComponentInput">${component.inputLabel}</label>
              <div class="han-component-input-row"><input id="hanComponentInput" type="text" inputmode="text" autocomplete="off" spellcheck="false" maxlength="12" placeholder="${component.placeholder}" /><button class="primary-action" id="hanComponentSubmit" type="submit">${component.submit}</button></div>
              <div class="han-component-selected-head"><span>${component.selectedLabel}</span><button id="hanComponentClear" type="button" disabled>${component.clear}</button></div>
              <div class="han-component-selected" id="hanComponentSelected"><span>${component.selectedEmpty}</span></div>
              <fieldset class="han-component-common"><legend>${component.commonLabel}</legend><div>
${popularComponents[locale].map((character) => `                <button type="button" data-han-component="${character}" title="${component.addComponent.replace("{character}", character)}" aria-label="${component.addComponent.replace("{character}", character)}">${character}</button>`).join("\n")}
              </div></fieldset>
              <div class="han-component-filters">
                <label><span>${component.strokeLabel}</span><select id="hanComponentStrokes">${buildStrokeOptions(component)}</select></label>
                <label><span>${component.sortLabel}</span><select id="hanComponentSort"><option value="common">${component.sortCommon}</option><option value="strokes">${component.sortStrokes}</option></select></label>
              </div>
            </form>
            <section class="han-component-results-panel" aria-labelledby="hanComponentResultsTitle">
              <div class="han-component-results-head"><div><p class="section-kicker">MATCHING CHARACTERS</p><h3 id="hanComponentResultsTitle">${component.resultsTitle}</h3></div><p id="hanComponentSummary">${component.initialHint}</p></div>
              <div class="han-component-results" id="hanComponentResults" role="group" aria-label="${component.resultsTitle}"></div>
              <p class="han-component-empty" id="hanComponentEmpty">${component.initialHint}</p>
              <button class="han-component-more" id="hanComponentMore" type="button" hidden>${component.loadMore}</button>
            </section>
          </div>
        </section>
        <p class="han-lookup-source-note">${page.sourceNote} <a href="https://github.com/skishore/makemeahanzi">${page.dataSource}</a> · <a href="https://www.unicode.org/reports/tr38/">${page.unicodeSource}</a></p>
      </section>

      <section class="seo-band standalone-info" aria-labelledby="hanLookupFeatureTitle">
        <div class="section-heading"><p class="section-kicker">${page.featureKicker}</p><h2 id="hanLookupFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div>
        <div class="seo-grid">
${page.cards.map(([title, text]) => `          <article><h3>${title}</h3><p>${text}</p></article>`).join("\n")}
        </div>
        <section class="word-howto" aria-labelledby="hanLookupHowTitle"><h2 id="hanLookupHowTitle">${page.howTitle}</h2><ol>
${page.steps.map((step) => `            <li>${step}</li>`).join("\n")}
          </ol></section>
        <section class="pinyin-faq" aria-labelledby="hanLookupFaqTitle"><h2 id="hanLookupFaqTitle">${page.faqTitle}</h2>
${page.faqs.map(([question, answer]) => `          <details><summary>${question}</summary><p>${answer}</p></details>`).join("\n")}
        </section>
        <section class="hanzi-lookup-directory" aria-labelledby="hanLookupDirectoryTitle">
          <div class="section-heading"><p class="section-kicker">CHARACTER DIRECTORY</p><h2 id="hanLookupDirectoryTitle">${profileUi.directoryLinkTitle}</h2><p class="seo-intro">${profileUi.directoryLinkIntro}</p></div>
          <nav class="landing-links" aria-label="${profileUi.directoryLinkTitle}">
            <a href="${profilePath(locale)}">${profileUi.dictionary}</a>
${profileLinks}
          </nav>
        </section>
        <p class="section-kicker pinyin-related-kicker">${page.related}</p>
        <nav class="landing-links" aria-label="${page.relatedAria}">
${related}
        </nav>
      </section>
    </main>
    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${base("about")}">${meta.about}</a><a href="${base("contact")}">${meta.contact}</a><a href="${base("privacy")}">${meta.privacy}</a></nav></footer>
    <script id="hanLookupLabels" type="application/json">${JSON.stringify({ ...page.lookupLabels, componentSearch: component }).replaceAll("<", "\\u003c")}</script>
  </body>
</html>`;
}

for (const locale of Object.keys(locales)) {
  const directory = path.join(projectRoot, locales[locale].prefix, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), `${buildPage(locale)}\n`);
}

console.log("Generated 5 multilingual Han-character lookup pages.");
