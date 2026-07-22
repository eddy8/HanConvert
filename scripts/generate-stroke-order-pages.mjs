import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const slug = "chinese-stroke-order";
const sampleCharacters = ["永", "汉", "字", "学", "爱", "龙", "書", "漢"];

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "인터페이스 언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "汉字笔顺查询 - 在线笔画顺序动画与书写练习 | JianFan.app",
    description: "免费汉字笔顺查询和汉字笔画顺序查询工具，支持简体、繁体汉字笔顺动画、逐笔演示、笔画数查询与在线书写练习。",
    eyebrow: "笔顺动画 · 逐笔演示 · 书写练习", heading: "汉字笔顺查询与动画演示",
    lede: "输入一个或多个汉字，查看笔画顺序、笔画数和动态书写过程，也可以在田字格中跟写练习。支持常见简体字和繁体字。",
    toolTitle: "输入汉字，查看正确书写顺序", searchLabel: "要查询的汉字", placeholder: "输入汉字，最多 8 个", search: "查询笔顺", quick: "常用字",
    characterList: "待查询汉字", previous: "上一字", next: "下一字", animate: "播放动画", pause: "暂停", resume: "继续", step: "下一笔", quiz: "书写练习", reset: "重置", outline: "显示字形轮廓",
    pinyin: "拼音", strokes: "总笔画", position: "当前位置", unicode: "Unicode",
    messages: { idle: "等待输入汉字", loading: "正在加载笔顺数据", ready: "已加载“{character}”的笔顺", playing: "正在播放笔顺动画", paused: "动画已暂停", step: "正在演示第 {current} / {total} 笔", quiz: "请在田字格中按顺序书写", quizComplete: "练习完成，错误 {mistakes} 次", missing: "暂未收录“{character}”的笔顺数据", invalid: "请输入至少一个汉字", componentError: "笔顺组件加载失败，请刷新页面" },
    note: "书写练习会判断笔画位置、方向和顺序；查询字形时会远程按需获取对应的公开笔顺数据。",
    seoKicker: "汉字笔画顺序查询", featureTitle: "在线查看汉字笔顺动画并逐笔练习", featureIntro: "适合学生、家长、教师和中文学习者快速核对汉字书写笔顺。无需安装应用，电脑、平板和手机浏览器均可使用。",
    cards: [["动态笔顺演示", "按正确顺序逐笔播放汉字书写动画，可暂停、继续或单独查看下一笔。"], ["简繁体与多字切换", "一次输入最多 8 个汉字，在同一工作区逐字切换，查看笔画数、拼音和 Unicode。"], ["互动书写练习", "直接在田字格中跟写，系统会提示错误笔画并在完成后显示错误次数。"]],
    faqTitle: "汉字笔顺查询常见问题",
    faqs: [["可以查询繁体字笔顺吗？", "可以。数据覆盖 9,000 多个常见简体字与繁体字，但极少数生僻字可能尚未收录。"], ["怎样逐笔查看汉字笔画顺序？", "查询汉字后点击“下一笔”，即可按顺序单独播放每一笔；点击“重置”可从第一笔重新开始。"], ["可以在线练习写汉字吗？", "可以。点击“书写练习”，然后在田字格中按照正确笔顺书写。"], ["不同地区的汉字笔顺都相同吗？", "不一定。中国大陆、台湾、香港和日本的部分字形及笔顺规范可能不同，本工具提供学习参考，正式教学请以当地规范为准。"]],
    related: "相关工具", relatedAria: "相关文字工具", footerText: "JianFan.app 提供中文转换、拼音与汉字笔顺学习工具。"
  },
  "zh-TW": {
    title: "漢字筆順查詢 - 線上筆畫順序動畫與書寫練習 | JianFan.app",
    description: "免費漢字筆順查詢與漢字筆畫順序查詢工具，支援簡體、繁體漢字筆順動畫、逐筆示範、筆畫數查詢與線上書寫練習。",
    eyebrow: "筆順動畫 · 逐筆示範 · 書寫練習", heading: "漢字筆順查詢與動畫示範",
    lede: "輸入一個或多個漢字，查看筆畫順序、筆畫數與動態書寫過程，也可在田字格中跟寫練習。支援常見簡體字與繁體字。",
    toolTitle: "輸入漢字，查看正確書寫順序", searchLabel: "要查詢的漢字", placeholder: "輸入漢字，最多 8 個", search: "查詢筆順", quick: "常用字",
    characterList: "待查詢漢字", previous: "上一字", next: "下一字", animate: "播放動畫", pause: "暫停", resume: "繼續", step: "下一筆", quiz: "書寫練習", reset: "重設", outline: "顯示字形輪廓",
    pinyin: "拼音", strokes: "總筆畫", position: "目前位置", unicode: "Unicode",
    messages: { idle: "等待輸入漢字", loading: "正在載入筆順資料", ready: "已載入「{character}」的筆順", playing: "正在播放筆順動畫", paused: "動畫已暫停", step: "正在示範第 {current} / {total} 筆", quiz: "請在田字格中依序書寫", quizComplete: "練習完成，錯誤 {mistakes} 次", missing: "暫未收錄「{character}」的筆順資料", invalid: "請至少輸入一個漢字", componentError: "筆順元件載入失敗，請重新整理頁面" },
    note: "書寫練習會判斷筆畫位置、方向與順序；查詢字形時會從遠端按需取得對應的公開筆順資料。",
    seoKicker: "漢字筆畫順序查詢", featureTitle: "線上查看漢字筆順動畫並逐筆練習", featureIntro: "適合學生、家長、教師與中文學習者快速核對漢字書寫筆順，不需安裝應用程式。",
    cards: [["動態筆順示範", "依正確順序逐筆播放漢字書寫動畫，可暫停、繼續或單獨查看下一筆。"], ["簡繁體與多字切換", "一次輸入最多 8 個漢字，在同一工作區逐字切換並查看筆畫數、拼音與 Unicode。"], ["互動書寫練習", "直接在田字格中跟寫，系統會提示錯誤筆畫並在完成後顯示錯誤次數。"]],
    faqTitle: "漢字筆順查詢常見問題",
    faqs: [["可以查詢簡體字筆順嗎？", "可以。資料涵蓋 9,000 多個常見簡體字與繁體字，但極少數生僻字可能尚未收錄。"], ["如何逐筆查看漢字筆畫順序？", "查詢後點選「下一筆」即可依序播放每一筆，點選「重設」可重新開始。"], ["可以線上練習寫漢字嗎？", "可以。點選「書寫練習」，再於田字格中依正確筆順書寫。"], ["不同地區的漢字筆順都相同嗎？", "不一定。台灣、中國大陸、香港與日本的部分字形及筆順規範可能不同，正式教學請以當地規範為準。"]],
    related: "相關工具", relatedAria: "相關文字工具", footerText: "JianFan.app 提供中文轉換、拼音與漢字筆順學習工具。"
  },
  en: {
    title: "Chinese Stroke Order - Animation and Writing Practice | JianFan.app",
    description: "Look up Chinese character stroke order with animated steps, stroke counts, Simplified and Traditional Hanzi support, and interactive handwriting practice.",
    eyebrow: "STROKE ORDER · ANIMATION · PRACTICE", heading: "Chinese Stroke Order Lookup",
    lede: "Enter one or more Chinese characters to see stroke order animation, individual strokes, stroke counts, and guided writing practice for common Simplified and Traditional Hanzi.",
    toolTitle: "Enter Chinese characters to see how they are written", searchLabel: "Chinese characters", placeholder: "Enter up to 8 Chinese characters", search: "Look up strokes", quick: "Common characters",
    characterList: "Characters to review", previous: "Previous", next: "Next", animate: "Play animation", pause: "Pause", resume: "Resume", step: "Next stroke", quiz: "Writing practice", reset: "Reset", outline: "Show character outline",
    pinyin: "Pinyin", strokes: "Strokes", position: "Position", unicode: "Unicode",
    messages: { idle: "Waiting for Chinese characters", loading: "Loading stroke-order data", ready: "Stroke order for {character} is ready", playing: "Playing stroke-order animation", paused: "Animation paused", step: "Showing stroke {current} of {total}", quiz: "Write the character in the grid", quizComplete: "Practice complete with {mistakes} mistakes", missing: "Stroke-order data is unavailable for {character}", invalid: "Enter at least one Chinese character", componentError: "The stroke-order component failed to load. Refresh the page." },
    note: "Writing practice checks stroke position, direction, and order. Public stroke-order data is requested remotely on demand.",
    seoKicker: "Animated Chinese stroke order", featureTitle: "Study Chinese stroke order step by step", featureIntro: "A focused reference for Chinese learners, families, and teachers. It works in desktop, tablet, and mobile browsers without installing an app.",
    cards: [["Animated stroke order", "Play each stroke in sequence, pause and resume the animation, or inspect one stroke at a time."], ["Multiple Simplified and Traditional characters", "Enter up to eight Hanzi, switch between them, and view stroke count, Pinyin, and Unicode."], ["Interactive writing practice", "Draw directly in the grid and receive stroke-order hints plus a mistake count when practice is complete."]],
    faqTitle: "Chinese stroke order questions",
    faqs: [["Does it support Traditional Chinese characters?", "Yes. The dataset covers more than 9,000 common Simplified and Traditional characters, although a few rare characters may be unavailable."], ["How can I view strokes one at a time?", "Select a character and press “Next stroke” to animate each stroke in order. Reset to start again."], ["Can I practice writing online?", "Yes. Start Writing practice and draw the character directly inside the grid."], ["Is stroke order identical in every region?", "Not always. Some forms and conventions differ across Mainland China, Taiwan, Hong Kong, and Japan. Use the relevant local standard for formal teaching."]],
    related: "Related tools", relatedAria: "Related character tools", footerText: "JianFan.app provides Chinese conversion, Pinyin, and stroke-order learning tools."
  },
  ja: {
    title: "中国語漢字の筆順・書き順検索 - アニメーション練習 | JianFan.app",
    description: "中国語漢字の筆順・書き順をアニメーションで検索。簡体字・繁体字の画数、1画ずつの表示、オンライン書き取り練習に対応。",
    eyebrow: "中国語漢字 · 筆順 · 書き取り練習", heading: "中国語漢字の筆順・書き順検索",
    lede: "中国語の漢字を入力すると、筆順アニメーション、画数、1画ずつの書き方を確認できます。簡体字・繁体字の書き取り練習にも対応します。",
    toolTitle: "中国語漢字を入力して筆順を確認", searchLabel: "検索する中国語漢字", placeholder: "漢字を8文字まで入力", search: "筆順を検索", quick: "よく使う漢字",
    characterList: "検索する漢字", previous: "前の字", next: "次の字", animate: "アニメーション", pause: "一時停止", resume: "再開", step: "次の画", quiz: "書き取り練習", reset: "リセット", outline: "字形の輪郭を表示",
    pinyin: "ピンイン", strokes: "画数", position: "位置", unicode: "Unicode",
    messages: { idle: "中国語漢字の入力待ち", loading: "筆順データを読み込み中", ready: "「{character}」の筆順を表示しています", playing: "筆順アニメーションを再生中", paused: "アニメーションを一時停止しました", step: "第 {current} / {total} 画を表示中", quiz: "マス内に正しい順序で書いてください", quizComplete: "練習完了：間違い {mistakes} 回", missing: "「{character}」の筆順データは未収録です", invalid: "中国語漢字を1文字以上入力してください", componentError: "筆順機能を読み込めませんでした。再読み込みしてください。" },
    note: "練習では画の位置・方向・順序を判定します。公開されている筆順データは必要な文字だけリモートから取得します。",
    seoKicker: "中国語漢字の書き順", featureTitle: "中国語の筆順をアニメーションと1画表示で確認", featureIntro: "中国語学習者、教師、保護者向けのシンプルな筆順検索です。アプリをインストールせずブラウザーで使えます。",
    cards: [["筆順アニメーション", "正しい順番で1画ずつ再生し、一時停止・再開・次の画の確認ができます。"], ["簡体字・繁体字と複数文字", "最大8文字を入力して切り替え、画数・ピンイン・Unicodeを確認できます。"], ["書き取り練習", "マス内に直接書き、筆順のヒントと練習完了時の間違い回数を確認できます。"]],
    faqTitle: "中国語漢字の筆順に関する質問",
    faqs: [["繁体字にも対応していますか？", "はい。9,000字以上の一般的な簡体字・繁体字に対応しますが、一部の難字は未収録です。"], ["1画ずつ確認できますか？", "「次の画」を押すと順番に1画ずつ再生できます。"], ["ブラウザーで書き取り練習できますか？", "はい。「書き取り練習」を開始し、マス内に正しい筆順で書いてください。"], ["中国語と日本語の漢字は同じ筆順ですか？", "必ずしも同じではありません。このページは中国語漢字のデータを使用しているため、日本の学校教育では日本の基準も確認してください。"]],
    related: "関連ツール", relatedAria: "関連文字ツール", footerText: "JianFan.app は中国語変換・ピンイン・漢字筆順学習ツールを提供します。"
  },
  ko: {
    title: "중국어 한자 필순 조회 - 획순 애니메이션과 쓰기 연습 | JianFan.app",
    description: "중국어 한자 필순과 획순을 애니메이션으로 조회하고 간체·번체 획수, 한 획씩 보기와 온라인 쓰기 연습을 이용하세요.",
    eyebrow: "중국어 한자 · 필순 · 쓰기 연습", heading: "중국어 한자 필순·획순 조회",
    lede: "중국어 한자를 입력하면 필순 애니메이션, 획수와 한 획씩 쓰는 순서를 확인하고 간체·번체 쓰기를 연습할 수 있습니다.",
    toolTitle: "중국어 한자를 입력해 쓰는 순서 확인", searchLabel: "조회할 중국어 한자", placeholder: "한자를 최대 8자 입력", search: "필순 조회", quick: "자주 쓰는 한자",
    characterList: "조회할 한자", previous: "이전 글자", next: "다음 글자", animate: "애니메이션", pause: "일시 정지", resume: "계속", step: "다음 획", quiz: "쓰기 연습", reset: "초기화", outline: "글자 윤곽 표시",
    pinyin: "병음", strokes: "총 획수", position: "현재 위치", unicode: "Unicode",
    messages: { idle: "중국어 한자 입력 대기", loading: "필순 데이터 불러오는 중", ready: "{character} 필순을 표시합니다", playing: "필순 애니메이션 재생 중", paused: "애니메이션 일시 정지", step: "{current} / {total}번째 획 표시 중", quiz: "격자 안에 올바른 순서로 써 보세요", quizComplete: "연습 완료, 오류 {mistakes}회", missing: "{character} 필순 데이터가 없습니다", invalid: "중국어 한자를 한 글자 이상 입력하세요", componentError: "필순 기능을 불러오지 못했습니다. 새로 고쳐 주세요." },
    note: "쓰기 연습은 획의 위치, 방향과 순서를 확인합니다. 공개 필순 데이터는 필요한 글자만 원격으로 불러옵니다.",
    seoKicker: "중국어 한자 획순", featureTitle: "중국어 필순을 애니메이션으로 한 획씩 학습", featureIntro: "중국어 학습자, 교사와 보호자를 위한 필순 조회 도구로 앱 설치 없이 브라우저에서 사용할 수 있습니다.",
    cards: [["필순 애니메이션", "올바른 순서로 한 획씩 재생하고 일시 정지, 계속 또는 다음 획 보기를 사용할 수 있습니다."], ["간체·번체와 여러 글자", "최대 8자를 입력해 전환하고 획수, 병음과 Unicode를 확인합니다."], ["대화형 쓰기 연습", "격자 안에 직접 쓰면 잘못된 획을 알려 주고 완료 후 오류 횟수를 표시합니다."]],
    faqTitle: "중국어 한자 필순 자주 묻는 질문",
    faqs: [["번체 한자도 지원하나요?", "네. 9,000자 이상의 일반 간체와 번체를 지원하지만 일부 희귀 한자는 없을 수 있습니다."], ["한 획씩 볼 수 있나요?", "“다음 획”을 누르면 올바른 순서대로 한 획씩 재생됩니다."], ["온라인 쓰기 연습이 가능한가요?", "네. “쓰기 연습”을 시작하고 격자 안에 올바른 필순으로 쓰세요."], ["지역마다 한자 필순이 모두 같나요?", "항상 같지는 않습니다. 중국 대륙, 대만, 홍콩, 일본의 일부 자형과 필순 규정은 다를 수 있으므로 정규 교육에서는 현지 기준을 확인하세요."]],
    related: "관련 도구", relatedAria: "관련 문자 도구", footerText: "JianFan.app는 중국어 변환, 병음과 한자 필순 학습 도구를 제공합니다."
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "汉字笔顺查询"], ["chinese-to-pinyin", "汉字转拼音"], ["simplified-to-traditional", "简体转繁体"], ["traditional-to-simplified", "繁体转简体"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["japanese-characters", "日文字符复制"]],
  "zh-TW": [[slug, "漢字筆順查詢"], ["chinese-to-pinyin", "漢字轉拼音"], ["simplified-to-traditional", "簡體轉繁體"], ["traditional-to-simplified", "繁體轉簡體"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["japanese-characters", "日文字元複製"]],
  en: [[slug, "Chinese stroke order"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["simplified-to-traditional", "Simplified to Traditional"], ["traditional-to-simplified", "Traditional to Simplified"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["japanese-characters", "Japanese character copy"]],
  ja: [[slug, "中国語漢字の筆順"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["simplified-to-traditional", "簡体字から繁体字"], ["traditional-to-simplified", "繁体字から簡体字"], ["japanese-chinese-kanji-converter", "日中漢字3種類変換"], ["japanese-characters", "日本語文字コピー"]],
  ko: [[slug, "중국어 한자 필순"], ["chinese-to-pinyin", "중국어 병음 변환"], ["simplified-to-traditional", "간체를 번체로"], ["traditional-to-simplified", "번체를 간체로"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["japanese-characters", "일본어 문자 복사"]]
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
      { "@type": "WebApplication", "@id": `${canonical}#webapp`, name: page.heading, url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` } },
      { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localizedPath(locale)}` }, { "@type": "ListItem", position: 2, name: page.heading, item: canonical }] },
      { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
    ]
  };
}

function buildHead(locale, page) {
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([targetLocale, meta]) => `    <link rel="alternate" hreflang="${meta.hreflang}" href="${origin}${localizedPath(targetLocale, slug)}" />`).join("\n");
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
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <script defer src="https://cdn.jsdelivr.net/npm/hanzi-writer/dist/hanzi-writer.min.js"></script>
    <script defer src="/vendor/pinyin-pro.js"></script>
    <script defer src="/stroke-order-tool.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n")}
    </script>
    <!-- seo-schema:end -->`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const localeOptions = Object.entries(locales).map(([value, option]) => `              <option value="${value}"${value === locale ? " selected" : ""}>${option.label}</option>`).join("\n");
  const messages = Object.entries(page.messages).map(([key, value]) => ` data-message-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`).join("");
  const related = relatedLabels[locale].map(([targetSlug, label]) => `          <a href="${localizedPath(locale, targetSlug)}"${targetSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("\n");
  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, page)}
  </head>
  <body data-tool-page="stroke-order" data-page-slug="${slug}" data-locale="${locale}" data-initial-character="永" data-label-pause="${escapeHtml(page.pause)}" data-label-resume="${escapeHtml(page.resume)}"${messages}>
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">漢</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${localeOptions}
          </select></label></nav></header>
    <main id="main">
      <section class="tool-hero stroke-tool-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="tool-hero-glyphs" aria-hidden="true"><span>永</span><span>1→5</span><span>✎</span></div></section>
      <section class="standalone-tool stroke-order-tool" aria-labelledby="strokeToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">STROKE / PRACTICE</p><h2 id="strokeToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="strokeStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.idle}</span></div></div>
        <form class="stroke-search" id="strokeSearchForm"><label for="strokeInput">${page.searchLabel}</label><div><input id="strokeInput" type="text" maxlength="24" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(page.placeholder)}" /><button class="primary-action" type="submit">${page.search}</button></div></form>
        <div class="stroke-quick-row"><span>${page.quick}</span>${sampleCharacters.map((character) => `<button type="button" data-stroke-sample="${character}">${character}</button>`).join("")}</div>
        <div class="stroke-workspace">
          <section class="stroke-stage" aria-labelledby="strokeStageTitle"><div class="panel-topline"><h3 id="strokeStageTitle">${page.characterList}</h3><div class="stroke-character-tabs" id="strokeCharacterTabs"></div></div><div class="stroke-board-shell"><div class="stroke-grid-line vertical" aria-hidden="true"></div><div class="stroke-grid-line horizontal" aria-hidden="true"></div><div id="strokeWriterTarget"></div></div></section>
          <aside class="stroke-sidebar">
            <div class="stroke-character-summary"><strong id="strokeCurrentCharacter">永</strong><dl><div><dt>${page.pinyin}</dt><dd id="strokePinyin">yǒng</dd></div><div><dt>${page.strokes}</dt><dd id="strokeCount">5</dd></div><div><dt>${page.position}</dt><dd id="strokePosition">1 / 1</dd></div><div><dt>${page.unicode}</dt><dd id="strokeUnicode">U+6C38</dd></div></dl></div>
            <div class="stroke-navigation"><button id="strokePrevious" type="button">‹ ${page.previous}</button><button id="strokeNext" type="button">${page.next} ›</button></div>
            <div class="stroke-actions"><button id="strokeAnimate" type="button" class="primary-action"><span aria-hidden="true">▶</span><span>${page.animate}</span></button><button id="strokePause" type="button" aria-pressed="false" disabled><span aria-hidden="true">Ⅱ</span><span id="strokePauseLabel">${page.pause}</span></button><button id="strokeStep" type="button"><span aria-hidden="true">+1</span><span>${page.step}</span></button><button id="strokeQuiz" type="button"><span aria-hidden="true">✎</span><span>${page.quiz}</span></button><button id="strokeReset" type="button"><span aria-hidden="true">↺</span><span>${page.reset}</span></button></div>
            <label class="stroke-outline-toggle"><input id="strokeOutline" type="checkbox" checked /><span>${page.outline}</span></label>
            <p class="stroke-data-note">${page.note}</p>
          </aside>
        </div>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="strokeFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.seoKicker}</p><h2 id="strokeFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">
${page.cards.map(([title, text]) => `          <article><h3>${title}</h3><p>${text}</p></article>`).join("\n")}
        </div><section class="pinyin-faq" aria-labelledby="strokeFaqTitle"><h2 id="strokeFaqTitle">${page.faqTitle}</h2>
${page.faqs.map(([question, answer]) => `          <details><summary>${question}</summary><p>${answer}</p></details>`).join("\n")}
        </section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">
${related}
        </nav></section>
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

console.log("Generated 5 multilingual Chinese stroke-order pages.");
