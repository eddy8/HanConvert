import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "japanese-stroke-order";
const samples = ["永", "日", "本", "語", "学", "書", "曜", "飛"];

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-CN", label: "简体中文", home: "网站首页", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明", skip: "跳到主要内容" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", skip: "跳到主要內容" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement", skip: "Skip to main content" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", skip: "メインコンテンツへ移動" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내", skip: "주요 내용으로 이동" }
};

const content = {
  "zh-CN": {
    title: "日本汉字笔顺查询 - 日文汉字书写顺序动画 | JianFan.app",
    description: "免费日本汉字笔顺与书写顺序查询工具，输入一个或多个日文汉字即可查看 KanjiVG 动画、逐笔演示、笔画编号、总笔画数和书写字形。数据采用日本学校字形及日文标准笔顺，可调播放速度、显示轮廓并逐字切换，适合日语学习、假名与汉字教学、作业核对和在线书写参考；笔顺数据按需远程加载，浏览器端可直接播放使用。",
    eyebrow: "日本汉字 · 书写顺序 · KanjiVG", heading: "日本汉字笔顺与书写顺序查询", lede: "输入日文汉字，按日本学校字形查看完整动画、逐笔顺序、笔画编号和总笔画数。日本笔顺与中文规范可能不同，本页使用专门的日文数据。",
    toolTitle: "输入日文汉字，查看日本标准书写顺序", searchLabel: "要查询的日文汉字", placeholder: "输入日文汉字，最多 8 个", search: "查询笔顺", quick: "常用汉字", list: "待查询汉字", previous: "上一字", next: "下一字", play: "播放全部", pause: "暂停", resume: "继续", step: "下一笔", reset: "重置", outline: "显示字形轮廓", numbers: "显示笔画编号", speed: "播放速度", speedOptions: [["0.7", "较慢"], ["1", "正常"], ["1.5", "较快"], ["2", "快速"]], strokes: "总笔画", position: "当前位置", unicode: "Unicode", standard: "字形标准", standardValue: "日本",
    messages: { idle: "等待输入日文汉字", loading: "正在加载日本笔顺数据", ready: "已加载“{character}”的日本笔顺", playing: "正在播放完整笔顺", paused: "动画已暂停", step: "正在演示第 {current} / {total} 笔", missing: "KanjiVG 暂未收录“{character}”", invalid: "请输入至少一个日文汉字" }, svgLabel: "“{character}”的日本笔顺动画",
    note: "字形和笔顺来自 KanjiVG，采用日本学校字形。查询时仅远程加载当前汉字的公开矢量数据。", source: "KanjiVG 数据说明与许可",
    featureKicker: "日文汉字书写顺序", featureTitle: "不要把中文笔顺直接当作日本汉字笔顺", featureIntro: "同一个汉字在日本、中国大陆、台湾或香港可能存在字形和笔顺差异。本工具使用 KanjiVG 的日本学校字形数据，适合日语学习场景。",
    cards: [["日本标准字形", "字形与笔顺按日本学校书写习惯展示，不复用本站中文笔顺页的数据。"], ["动画与逐笔查看", "可播放完整笔顺，也可单独查看下一笔，并显示官方数据中的笔画编号。"], ["多字连续核对", "一次输入最多 8 个汉字，在同一工作区切换并调整动画播放速度。"]],
    faqTitle: "日本汉字笔顺常见问题", faqs: [["日文汉字笔顺和中文一样吗？", "不一定。部分汉字的字形、笔画处理和书写顺序会因地区规范而不同，学习日语时应使用日本标准。"], ["笔顺数据来自哪里？", "本页使用 KanjiVG 的日本学校字形矢量数据，并按其许可要求注明来源。"], ["可以一次查询多个汉字吗？", "可以，一次最多输入 8 个汉字，然后用汉字标签或上一字、下一字按钮切换。"]], related: "相关日语工具", relatedAria: "相关日语与汉字工具", footerText: "JianFan.app 提供日语读音、日本汉字学习与中文转换工具。"
  },
  "zh-TW": {
    title: "日本漢字筆順查詢 - 日文漢字書寫順序動畫 | JianFan.app",
    description: "免費日本漢字筆順與書寫順序查詢工具，輸入一個或多個日文漢字即可查看 KanjiVG 動畫、逐筆示範、筆畫編號、總筆畫數和書寫字形。資料採用日本學校字形及日文標準筆順，可調整播放速度、顯示輪廓並逐字切換，適合日語學習、漢字教學、作業核對和線上書寫參考；筆順資料按需從遠端載入並可在瀏覽器中免費播放使用。",
    eyebrow: "日本漢字 · 書寫順序 · KanjiVG", heading: "日本漢字筆順與書寫順序查詢", lede: "輸入日文漢字，依日本學校字形查看完整動畫、逐筆順序、筆畫編號與總筆畫數。日本筆順可能與中文規範不同，本頁使用專門的日文資料。",
    toolTitle: "輸入日文漢字，查看日本標準書寫順序", searchLabel: "要查詢的日文漢字", placeholder: "輸入日文漢字，最多 8 個", search: "查詢筆順", quick: "常用漢字", list: "待查詢漢字", previous: "上一字", next: "下一字", play: "播放全部", pause: "暫停", resume: "繼續", step: "下一筆", reset: "重設", outline: "顯示字形輪廓", numbers: "顯示筆畫編號", speed: "播放速度", speedOptions: [["0.7", "較慢"], ["1", "正常"], ["1.5", "較快"], ["2", "快速"]], strokes: "總筆畫", position: "目前位置", unicode: "Unicode", standard: "字形標準", standardValue: "日本",
    messages: { idle: "等待輸入日文漢字", loading: "正在載入日本筆順資料", ready: "已載入「{character}」的日本筆順", playing: "正在播放完整筆順", paused: "動畫已暫停", step: "正在示範第 {current} / {total} 筆", missing: "KanjiVG 暫未收錄「{character}」", invalid: "請至少輸入一個日文漢字" }, svgLabel: "「{character}」的日本筆順動畫", note: "字形與筆順來自 KanjiVG，採用日本學校字形。查詢時只會遠端載入目前漢字的公開向量資料。", source: "KanjiVG 資料說明與授權",
    featureKicker: "日文漢字書寫順序", featureTitle: "不要將中文筆順直接當作日本漢字筆順", featureIntro: "同一個漢字在日本、中國大陸、台灣或香港可能有字形與筆順差異。本工具使用 KanjiVG 的日本學校字形資料，適合日語學習。", cards: [["日本標準字形", "字形與筆順依日本學校書寫習慣顯示，不會重用本站中文筆順頁的資料。"], ["動畫與逐筆查看", "可播放完整筆順或單獨查看下一筆，並顯示官方資料中的筆畫編號。"], ["多字連續核對", "一次輸入最多 8 個漢字，在同一工作區切換並調整動畫速度。"]], faqTitle: "日本漢字筆順常見問題", faqs: [["日文漢字筆順和中文相同嗎？", "不一定。部分漢字的字形、筆畫處理與書寫順序會因地區規範而不同。"], ["筆順資料來自哪裡？", "本頁使用 KanjiVG 的日本學校字形向量資料，並依其授權要求標示來源。"], ["可以一次查詢多個漢字嗎？", "可以，一次最多輸入 8 個漢字，再用標籤或上一字、下一字切換。"]], related: "相關日語工具", relatedAria: "相關日語與漢字工具", footerText: "JianFan.app 提供日語讀音、日本漢字學習與中文轉換工具。"
  },
  en: {
    title: "Japanese Kanji Stroke Order Animation | JianFan.app",
    description: "Look up Japanese Kanji stroke order with KanjiVG animations, numbered strokes, step controls, stroke counts, schoolbook glyphs, and adjustable playback speed.",
    eyebrow: "JAPANESE KANJI · STROKE ORDER · KANJIVG", heading: "Japanese Kanji Stroke Order", lede: "Enter Japanese Kanji to view schoolbook glyphs, complete animations, one-stroke steps, numbered strokes, and stroke counts. This page uses Japanese data rather than Chinese stroke-order data.",
    toolTitle: "Enter Kanji to see the Japanese writing order", searchLabel: "Japanese Kanji", placeholder: "Enter up to 8 Kanji", search: "Look up strokes", quick: "Common Kanji", list: "Kanji to review", previous: "Previous", next: "Next", play: "Play all", pause: "Pause", resume: "Resume", step: "Next stroke", reset: "Reset", outline: "Show glyph outline", numbers: "Show stroke numbers", speed: "Playback speed", speedOptions: [["0.7", "Slow"], ["1", "Normal"], ["1.5", "Faster"], ["2", "Fast"]], strokes: "Strokes", position: "Position", unicode: "Unicode", standard: "Glyph standard", standardValue: "Japanese",
    messages: { idle: "Waiting for Japanese Kanji", loading: "Loading Japanese stroke data", ready: "Japanese stroke order loaded for {character}", playing: "Playing the complete stroke order", paused: "Animation paused", step: "Showing stroke {current} of {total}", missing: "KanjiVG does not currently include {character}", invalid: "Enter at least one Japanese Kanji" }, svgLabel: "Japanese stroke order animation for {character}", note: "Glyphs and stroke order come from KanjiVG's Japanese schoolbook data. Only the selected character data is loaded remotely.", source: "KanjiVG data and license",
    featureKicker: "Japanese writing order", featureTitle: "Use Japanese stroke data for Japanese Kanji", featureIntro: "The same Han character can differ across Japanese, Mainland Chinese, Taiwanese, and Hong Kong standards. This tool is built specifically on KanjiVG Japanese schoolbook glyphs.", cards: [["Japanese schoolbook forms", "Glyph shapes and stroke order follow the Japanese model instead of reusing the site's Chinese stroke data."], ["Animation and single steps", "Play the full character or advance one stroke at a time with official stroke-number positions."], ["Review several Kanji", "Enter up to eight Kanji, switch in one workspace, and adjust animation speed as needed."]], faqTitle: "Japanese Kanji stroke-order questions", faqs: [["Is Japanese Kanji stroke order the same as Chinese?", "Not always. Regional standards can differ in glyph shape, stroke treatment, and writing order."], ["Where does the stroke data come from?", "The page uses KanjiVG vector data based on Japanese schoolbook forms and links to its license."], ["Can I look up several Kanji at once?", "Yes. Enter up to eight Kanji and switch with the character tabs or navigation buttons."]], related: "Related Japanese tools", relatedAria: "Related Japanese and Kanji tools", footerText: "JianFan.app provides Japanese reading, Kanji learning, and Chinese conversion tools."
  },
  ja: {
    title: "漢字の書き順・筆順検索 - 無料アニメーション | JianFan.app",
    description: "漢字の書き順・筆順をアニメーションで確認できるオンラインツールです。日本の学校字形に基づくKanjiVGデータを使い、1画ずつの表示、画数、筆順番号、輪郭表示、再生速度の変更、複数漢字の切り替えに対応。漢字学習、書き取り、宿題の確認、授業教材に利用でき、必要な公開データだけをリモートから読み込みブラウザーで再生します。",
    eyebrow: "漢字 · 書き順 · 筆順アニメーション", heading: "漢字の書き順・筆順検索", lede: "漢字を入力すると、日本の学校字形による筆順アニメーション、1画ずつの書き方、画数、筆順番号を確認できます。中国語用ではなく、日本語学習向けのデータを使用します。",
    toolTitle: "漢字を入力して正しい書き順を確認", searchLabel: "調べる漢字", placeholder: "漢字を8文字まで入力", search: "書き順を検索", quick: "よく使う漢字", list: "確認する漢字", previous: "前の字", next: "次の字", play: "すべて再生", pause: "一時停止", resume: "再開", step: "次の画", reset: "リセット", outline: "字形の輪郭を表示", numbers: "筆順番号を表示", speed: "再生速度", speedOptions: [["0.7", "ゆっくり"], ["1", "標準"], ["1.5", "やや速い"], ["2", "速い"]], strokes: "画数", position: "位置", unicode: "Unicode", standard: "字形基準", standardValue: "日本",
    messages: { idle: "漢字の入力待ち", loading: "日本の筆順データを読み込み中", ready: "「{character}」の書き順を表示しています", playing: "筆順を最初から再生中", paused: "アニメーションを一時停止しました", step: "第 {current} / {total} 画を表示中", missing: "KanjiVGに「{character}」のデータがありません", invalid: "漢字を1文字以上入力してください" }, svgLabel: "「{character}」の書き順アニメーション", note: "字形と筆順は日本の学校字形に基づくKanjiVGを使用しています。選択した漢字の公開ベクターデータだけをリモートから取得します。", source: "KanjiVGのデータとライセンス",
    featureKicker: "漢字の書き順を検索", featureTitle: "日本語の漢字には日本の筆順データを使用", featureIntro: "同じ漢字でも、日本・中国大陸・台湾・香港では字形や筆順が異なる場合があります。このページは日本の学校字形を基準にしたKanjiVG専用です。", cards: [["日本の学校字形", "中国語向けの筆順データを流用せず、日本の学校教育で使われる字形と書き順を表示します。"], ["アニメーションと1画表示", "最初から再生するほか、「次の画」で1画ずつ確認し、筆順番号も表示できます。"], ["複数漢字をまとめて確認", "最大8文字を入力して切り替え、学習しやすい再生速度に調整できます。"]], faqTitle: "漢字の書き順・筆順に関する質問", faqs: [["日本語と中国語の漢字は同じ書き順ですか？", "必ずしも同じではありません。地域によって字形、画の扱い、書く順番が異なる漢字があります。"], ["書き順データはどこから取得していますか？", "日本の学校字形を基準にしたKanjiVGの公開ベクターデータを使用しています。"], ["複数の漢字を続けて調べられますか？", "はい。漢字を8文字まで入力し、文字タブや前後ボタンで切り替えられます。"]], related: "関連する日本語ツール", relatedAria: "関連する日本語・漢字ツール", footerText: "JianFan.app は日本語の読み方、漢字学習、中国語変換ツールを提供します。"
  },
  ko: {
    title: "일본 한자 필순·획순 애니메이션 | JianFan.app",
    description: "일본 한자 필순과 획순을 KanjiVG 애니메이션으로 확인하는 도구입니다. 일본 학교 글자체의 쓰기 순서와 획수, 획 번호를 제공하며 한 획씩 보기와 재생 속도 조절을 지원합니다. 일본어 한자 학습과 숙제 확인에 활용하고 필요한 공개 데이터만 원격으로 불러와 브라우저에서 재생합니다.",
    eyebrow: "일본 한자 · 필순 · KANJIVG", heading: "일본 한자 필순·획순 조회", lede: "일본 한자를 입력하면 학교 글자체에 맞는 필순 애니메이션, 한 획씩 보기, 획 번호와 총 획수를 확인할 수 있습니다. 중국어용이 아닌 일본어 학습용 데이터를 사용합니다.",
    toolTitle: "일본 한자를 입력해 올바른 쓰기 순서 확인", searchLabel: "조회할 일본 한자", placeholder: "한자를 최대 8자 입력", search: "필순 조회", quick: "자주 쓰는 한자", list: "확인할 한자", previous: "이전 글자", next: "다음 글자", play: "전체 재생", pause: "일시 정지", resume: "계속", step: "다음 획", reset: "초기화", outline: "글자 윤곽 표시", numbers: "획 번호 표시", speed: "재생 속도", speedOptions: [["0.7", "느리게"], ["1", "보통"], ["1.5", "조금 빠르게"], ["2", "빠르게"]], strokes: "총 획수", position: "위치", unicode: "Unicode", standard: "글자 기준", standardValue: "일본",
    messages: { idle: "일본 한자 입력 대기", loading: "일본 필순 데이터 불러오는 중", ready: "{character}의 일본 필순을 표시합니다", playing: "전체 필순 재생 중", paused: "애니메이션 일시 정지", step: "{current} / {total}번째 획 표시 중", missing: "KanjiVG에 {character} 데이터가 없습니다", invalid: "일본 한자를 한 글자 이상 입력하세요" }, svgLabel: "{character} 일본 필순 애니메이션", note: "글자체와 필순은 일본 학교 글자체 기반 KanjiVG를 사용합니다. 선택한 한자의 공개 벡터 데이터만 원격으로 불러옵니다.", source: "KanjiVG 데이터와 라이선스",
    featureKicker: "일본 한자 쓰기 순서", featureTitle: "일본 한자는 일본 필순 데이터로 확인", featureIntro: "같은 한자라도 일본, 중국 대륙, 대만과 홍콩의 글자체나 쓰기 순서가 다를 수 있습니다. 이 도구는 일본 학교 글자체 기반 KanjiVG를 사용합니다.", cards: [["일본 학교 글자체", "중국어 필순 데이터를 재사용하지 않고 일본 학교에서 쓰는 글자 모양과 순서를 보여 줍니다."], ["애니메이션과 한 획 보기", "전체 재생 또는 다음 획으로 순서대로 확인하고 공식 데이터의 획 번호도 표시합니다."], ["여러 한자 연속 확인", "최대 8자를 입력해 전환하고 학습에 맞게 애니메이션 속도를 조절합니다."]], faqTitle: "일본 한자 필순 질문", faqs: [["일본어와 중국어 한자는 필순이 같은가요?", "항상 같지는 않습니다. 지역 기준에 따라 글자 모양, 획 처리와 쓰는 순서가 다를 수 있습니다."], ["필순 데이터는 어디에서 가져오나요?", "일본 학교 글자체를 기준으로 만든 KanjiVG 공개 벡터 데이터를 사용합니다."], ["여러 한자를 한 번에 조회할 수 있나요?", "네. 최대 8자를 입력하고 글자 탭이나 이전·다음 버튼으로 전환할 수 있습니다."]], related: "관련 일본어 도구", relatedAria: "관련 일본어 및 한자 도구", footerText: "JianFan.app는 일본어 읽기, 한자 학습 및 중국어 변환 도구를 제공합니다."
  }
};

const related = {
  "zh-CN": [[slug, "日本汉字笔顺"], ["kanji-to-hiragana", "汉字转平假名与振假名"], ["kanji-to-romaji", "日文汉字转罗马字"], ["japanese-kanji-converter", "日文新旧字体转换"], ["chinese-stroke-order", "中文汉字笔顺"]],
  "zh-TW": [[slug, "日本漢字筆順"], ["kanji-to-hiragana", "漢字轉平假名與振假名"], ["kanji-to-romaji", "日文漢字轉羅馬字"], ["japanese-kanji-converter", "日文新舊字體轉換"], ["chinese-stroke-order", "中文漢字筆順"]],
  en: [[slug, "Japanese Kanji stroke order"], ["kanji-to-hiragana", "Kanji to Hiragana & Furigana"], ["kanji-to-romaji", "Kanji to Romaji"], ["japanese-kanji-converter", "Japanese old and new Kanji"], ["chinese-stroke-order", "Chinese stroke order"]],
  ja: [[slug, "漢字の書き順"], ["kanji-to-hiragana", "漢字をひらがな・ふりがなに変換"], ["kanji-to-romaji", "漢字をローマ字に変換"], ["japanese-kanji-converter", "新字体・旧字体変換"], ["chinese-stroke-order", "中国語漢字の筆順"]],
  ko: [[slug, "일본 한자 필순"], ["kanji-to-hiragana", "한자를 히라가나·후리가나로"], ["kanji-to-romaji", "한자를 로마자로"], ["japanese-kanji-converter", "일본 신자체·구자체 변환"], ["chinese-stroke-order", "중국어 한자 필순"]]
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localPath(locale, target = "") {
  return `/${locales[locale].prefix}${target ? `${target}/` : ""}`;
}

function schema(locale, page) {
  const canonical = `${origin}${localPath(locale, slug)}`;
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", "@id": `${canonical}#webapp`, name: page.heading, alternateName: locale === "ja" ? ["漢字書き順検索", "漢字筆順アニメーション"] : undefined, url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` } },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localPath(locale)}` }, { "@type": "ListItem", position: 2, name: page.heading, item: canonical }] },
    { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
  ] };
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const canonical = `${origin}${localPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([key, item]) => `    <link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localPath(key, slug)}" />`).join("\n");
  const options = Object.entries(locales).map(([key, item]) => `<option value="${key}"${key === locale ? " selected" : ""}>${item.label}</option>`).join("");
  const messages = Object.entries(page.messages).map(([key, value]) => ` data-message-${key.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`).join("");
  const speedOptions = page.speedOptions.map(([value, label]) => `<option value="${value}"${value === "1" ? " selected" : ""}>${label}</option>`).join("");
  const relatedLinks = related[locale].map(([target, label]) => `<a href="${localPath(locale, target)}"${target === slug ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a>`).join("");
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
    <link rel="alternate" hreflang="x-default" href="${origin}${localPath("zh-CN", slug)}" />
    <link rel="preconnect" href="https://cdn.jsdmirror.cn" crossorigin />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <script defer src="/japanese-stroke-order.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">${JSON.stringify(schema(locale, page))}</script>
    <!-- seo-schema:end -->
  </head>
  <body data-tool-page="japanese-stroke-order" data-page-slug="${slug}" data-locale="${locale}" data-initial-character="永" data-label-pause="${escapeHtml(page.pause)}" data-label-resume="${escapeHtml(page.resume)}" data-svg-label="${escapeHtml(page.svgLabel)}"${messages}>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">漢</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${options}</select></label></nav></header>
    <main id="main">
      <section class="tool-hero stroke-tool-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="tool-hero-glyphs japanese-stroke-glyphs" aria-hidden="true"><span>永</span><span>一 → 丨 → 丿</span><span>書</span></div></section>
      <section class="standalone-tool stroke-order-tool" aria-labelledby="jpStrokeToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">KANJIVG / JAPANESE STANDARD</p><h2 id="jpStrokeToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="jpStrokeStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.idle}</span></div></div>
        <form class="stroke-search" id="jpStrokeSearchForm"><label for="jpStrokeInput">${page.searchLabel}</label><div><input id="jpStrokeInput" type="text" maxlength="24" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(page.placeholder)}" /><button class="primary-action" type="submit">${page.search}</button></div></form>
        <div class="stroke-quick-row"><span>${page.quick}</span>${samples.map((character) => `<button type="button" data-jp-stroke-sample="${character}">${character}</button>`).join("")}</div>
        <div class="stroke-workspace japanese-stroke-workspace">
          <section class="stroke-stage" aria-labelledby="jpStrokeStageTitle"><div class="panel-topline"><h3 id="jpStrokeStageTitle">${page.list}</h3><div class="stroke-character-tabs" id="jpStrokeCharacterTabs"></div></div><div class="stroke-board-shell"><div class="stroke-grid-line vertical" aria-hidden="true"></div><div class="stroke-grid-line horizontal" aria-hidden="true"></div><div id="kanjiVgTarget"></div></div></section>
          <aside class="stroke-sidebar"><div class="stroke-character-summary"><strong id="jpStrokeCurrentCharacter">永</strong><dl><div><dt>${page.strokes}</dt><dd id="jpStrokeCount">5</dd></div><div><dt>${page.position}</dt><dd id="jpStrokePosition">1 / 1</dd></div><div><dt>${page.standard}</dt><dd>${page.standardValue}</dd></div><div><dt>${page.unicode}</dt><dd id="jpStrokeUnicode">U+6C38</dd></div></dl></div>
            <div class="stroke-navigation"><button id="jpStrokePrevious" type="button">‹ ${page.previous}</button><button id="jpStrokeNext" type="button">${page.next} ›</button></div>
            <div class="stroke-actions"><button id="jpStrokePlay" type="button" class="primary-action"><span aria-hidden="true">▶</span><span>${page.play}</span></button><button id="jpStrokePause" type="button" aria-pressed="false" disabled><span aria-hidden="true">Ⅱ</span><span id="jpStrokePauseLabel">${page.pause}</span></button><button id="jpStrokeStep" type="button"><span aria-hidden="true">+1</span><span>${page.step}</span></button><button id="jpStrokeReset" type="button"><span aria-hidden="true">↺</span><span>${page.reset}</span></button></div>
            <div class="japanese-stroke-options"><label class="stroke-outline-toggle"><input id="jpStrokeOutline" type="checkbox" checked /><span>${page.outline}</span></label><label class="stroke-outline-toggle"><input id="jpStrokeNumbers" type="checkbox" checked /><span>${page.numbers}</span></label><label class="japanese-stroke-speed"><span>${page.speed}</span><select id="jpStrokeSpeed">${speedOptions}</select></label></div>
            <p class="stroke-data-note">${page.note} <a href="https://kanjivg.tagaini.net/" rel="license noopener noreferrer">${page.source}</a></p>
          </aside>
        </div>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="jpStrokeFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.featureKicker}</p><h2 id="jpStrokeFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">${page.cards.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div><section class="pinyin-faq" aria-labelledby="jpStrokeFaqTitle"><h2 id="jpStrokeFaqTitle">${page.faqTitle}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">${relatedLinks}</nav></section>
    </main>
    <footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localPath(locale, "about")}">${meta.about}</a><a href="${localPath(locale, "contact")}">${meta.contact}</a><a href="${localPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>`;
}

for (const locale of Object.keys(locales)) {
  const directory = path.join(root, locales[locale].prefix, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), `${buildPage(locale)}\n`);
}

console.log("Generated 5 multilingual Japanese stroke-order pages.");
