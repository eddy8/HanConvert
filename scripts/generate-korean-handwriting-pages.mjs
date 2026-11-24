// Generates the Korean (Hangul) handwriting input pages in five locales.
// Usage: node scripts/generate-korean-handwriting-pages.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getMetadataLengthRange, visibleMetadataLength, visibleTitleContentLength } from "./seo-metadata-rules.mjs";
import { preserveToolLinks } from "./static-tool-links.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
export const slug = "korean-handwriting-recognition";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明", skip: "跳到主要内容" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", skip: "跳到主要內容" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement", skip: "Skip to main content" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", skip: "メインコンテンツへ移動" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내", skip: "주요 내용으로 이동" }
};

export const content = {
  "zh-CN": {
    title: "韩语手写识别 - 在线韩文手写输入 | JianFan.app",
    description: "免费韩语手写识别，在方格里写出韩文就能自动给出候选，逐字加入输入框后一键复制整段韩文，并显示字母组成和罗马字；默认在浏览器本地识别。",
    eyebrow: "韩语手写 · 韩文输入 · 浏览器识别",
    heading: "韩语手写识别与韩文手写输入",
    lede: "不会用韩文键盘、看到韩文却打不出来时，在方格里照着写一个韩文字，写完就会自动给出候选。选中后加入输入框，可以连续手写输入一段韩文再一次复制。",
    toolTitle: "在方格中手写一个韩文字",
    drawTitle: "手写输入", drawMeta: "一次写一个字", append: "加入输入框", undo: "撤销一笔", clear: "清空重写",
    hint: "默认在浏览器本地识别；本地没有结果或点击“试试远程识别”时，当前笔画坐标会发送到远程识别服务。",
    candidatesTitle: "识别候选", candidatesIntro: "写完一笔就会自动更新，点击最接近的韩文字。", candidateEmpty: "开始书写后，候选韩文字会显示在这里。",
    remoteHint: "候选不准确？", remoteAction: "试试远程识别",
    detailTitle: "选中的韩文字", detailEmpty: "选择候选后，会显示字母组成、罗马字和 Unicode。",
    labels: { jamo: "字母组成", roman: "罗马字", unicode: "Unicode" }, copy: "复制",
    composeLabel: "已输入的韩文", composePlaceholder: "选中候选后点“加入输入框”，可连续输入", textCopy: "复制", textClear: "清空",
    messages: { idle: "请在方格中手写一个韩文字", loading: "正在加载韩文识别数据", recognizing: "正在比对手写字形", recognized: "已找到 {count} 个候选，请选择正确的字", noCandidates: "没有识别到候选，请写得更大更清楚", remoteRecognizing: "正在进行远程识别…", remoteNoMatch: "远程识别也没有找到候选", remoteError: "远程识别失败，请检查网络后重试", loadError: "识别数据加载失败，请检查网络后重试", engineError: "手写识别组件加载失败，请刷新页面", candidateLabel: "候选 {position}：{character}", copied: "已复制", copiedText: "已复制输入框中的韩文", appended: "已加入输入框：{character}" },
    featureKicker: "韩语手写识别", featureTitle: "不会韩文键盘，也能手写输入韩文",
    featureIntro: "韩语手写识别是把手写的韩文（한글）转换成可复制的文字：在方格里写一个音节，例如“한”，从候选中选中后加入输入框，逐字写完再一次复制整段。本页本地可识别 2,350 个常用韩文音节和 51 个单独字母，适合抄写韩剧台词、歌词、招牌和课本里的韩文。",
    stepsName: "如何手写输入韩文", steps: ["在方格中按笔顺写一个韩文音节，例如“한”，可以用手指、触控笔或鼠标。", "写完后候选会自动出现，选中字形相同的韩文字。", "点击“加入输入框”，画板会清空，接着写下一个字。", "全部写完后点击输入框旁的“复制”，把整段韩文粘贴到翻译、搜索或聊天软件中。"],
    cards: [["写完自动出候选", "识别在后台线程中进行，每写完一笔就自动比对，不需要点击按钮，也不要求完全正确的笔顺。"], ["连续输入整段韩文", "选中的字逐个加入输入框，画板自动清空，适合把看到的韩文句子完整抄下来再复制。"], ["本地优先，远程兜底", "常用音节在浏览器中本地识别；本地没有结果或你点击“试试远程识别”时，才会把笔画坐标发送到远程识别服务。"]],
    faqTitle: "韩语手写识别常见问题",
    faqs: [["怎样手写输入韩文？", "在方格中写一个韩文音节，从自动出现的候选中选中，再点击“加入输入框”。逐字写完后点击“复制”，就能把整段韩文粘贴到需要的地方，不需要安装韩文输入法。"], ["能识别哪些韩文字？", "本地识别覆盖韩国 KS X 1001 标准中的 2,350 个常用音节，以及 ㄱ、ㅏ 等 51 个单独字母，日常用字基本都能找到。少见的音节可以点击“试试远程识别”，远程识别支持全部 11,172 个韩文音节。"], ["必须按正确笔顺书写吗？", "不必完全一致，但按常见笔顺（先上后下、先左后右）并把字写大、写在中间，候选会更准确。韩文里形状相近的字，例如“가”和“기”，可以从候选列表里选择正确的一个。"], ["能直接翻译手写的韩文吗？", "本页只负责把手写韩文变成文字，不提供翻译。把输入框里的韩文复制后，粘贴到翻译工具中即可。"], ["罗马字是怎么标的？", "选中候选后会显示这个音节按韩国《国语罗马字标记法》单独标注的读法，例如“한”是 han。连读时的音变（如“한국어”读作 hangugeo）不会体现在单字标注里。"], ["手写内容会上传吗？", "默认不会，常用音节在浏览器本地识别。只有本地没有找到候选，或你主动点击“试试远程识别”时，当前笔画坐标才会发送到远程识别服务，不会发送输入框里的文字。"], ["和韩国汉字手写识别有什么区别？", "本页识别的是韩文字母（한글）；如果要查韩国使用的汉字（한자）的读音和意思，请使用“韩国汉字手写识别”。"]],
    related: "相关韩文与汉字工具", relatedAria: "相关韩文与汉字工具", footerText: "JianFan.app 提供韩语手写识别、韩国汉字查询与韩汉转换等在浏览器中运行的工具。"
  },
  "zh-TW": {
    title: "韓文手寫辨識 - 線上韓文手寫輸入 | JianFan.app",
    description: "免費韓文手寫辨識，在方格裡寫出韓文就能自動提供候選，逐字加入輸入框後一鍵複製整段韓文，並顯示字母組成與羅馬字；預設在瀏覽器本機辨識。",
    eyebrow: "韓文手寫 · 韓文輸入 · 瀏覽器辨識",
    heading: "韓文手寫辨識與線上輸入",
    lede: "不會用韓文鍵盤、看到韓文卻打不出來時，在方格裡照著寫一個韓文字，寫完就會自動提供候選。選取後加入輸入框，可以連續手寫輸入一段韓文再一次複製。",
    toolTitle: "在方格中手寫一個韓文字",
    drawTitle: "手寫輸入", drawMeta: "一次寫一個字", append: "加入輸入框", undo: "復原一筆", clear: "清除重寫",
    hint: "預設在瀏覽器本機辨識；本機沒有結果或點選「試試遠端辨識」時，目前的筆畫座標會傳送到遠端辨識服務。",
    candidatesTitle: "辨識候選", candidatesIntro: "寫完一筆就會自動更新，點選最接近的韓文字。", candidateEmpty: "開始書寫後，候選韓文字會顯示在這裡。",
    remoteHint: "候選不準確？", remoteAction: "試試遠端辨識",
    detailTitle: "選取的韓文字", detailEmpty: "選擇候選後，會顯示字母組成、羅馬字和 Unicode。",
    labels: { jamo: "字母組成", roman: "羅馬字", unicode: "Unicode" }, copy: "複製",
    composeLabel: "已輸入的韓文", composePlaceholder: "選取候選後點「加入輸入框」，可連續輸入", textCopy: "複製", textClear: "清除",
    messages: { idle: "請在方格中手寫一個韓文字", loading: "正在載入韓文辨識資料", recognizing: "正在比對手寫字形", recognized: "找到 {count} 個候選，請選擇正確的字", noCandidates: "沒有辨識到候選，請寫得更大更清楚", remoteRecognizing: "正在進行遠端辨識…", remoteNoMatch: "遠端辨識也沒有找到候選", remoteError: "遠端辨識失敗，請檢查網路後再試", loadError: "辨識資料載入失敗，請檢查網路後再試", engineError: "手寫辨識元件載入失敗，請重新整理", candidateLabel: "候選 {position}：{character}", copied: "已複製", copiedText: "已複製輸入框中的韓文", appended: "已加入輸入框：{character}" },
    featureKicker: "韓文手寫辨識", featureTitle: "不會韓文鍵盤，也能手寫輸入韓文",
    featureIntro: "韓文手寫辨識是把手寫的韓文（한글）轉成可以複製的文字：在方格裡寫一個音節，例如「한」，從候選中選取後加入輸入框，逐字寫完再一次複製整段。本頁本機可辨識 2,350 個常用韓文音節和 51 個單獨字母，適合抄寫韓劇台詞、歌詞、招牌和課本裡的韓文。",
    stepsName: "如何手寫輸入韓文", steps: ["在方格中依筆順寫一個韓文音節，例如「한」，可以用手指、觸控筆或滑鼠。", "寫完後候選會自動出現，選取字形相同的韓文字。", "點選「加入輸入框」，畫布會清除，接著寫下一個字。", "全部寫完後點選輸入框旁的「複製」，把整段韓文貼到翻譯、搜尋或聊天軟體中。"],
    cards: [["寫完自動出候選", "辨識在背景執行緒進行，每寫完一筆就自動比對，不需要點按鈕，也不要求完全正確的筆順。"], ["連續輸入整段韓文", "選取的字逐一加入輸入框，畫布自動清除，適合把看到的韓文句子完整抄下來再複製。"], ["本機優先，遠端備援", "常用音節在瀏覽器中本機辨識；本機沒有結果或你點選「試試遠端辨識」時，才會把筆畫座標傳送到遠端辨識服務。"]],
    faqTitle: "韓文手寫辨識常見問題",
    faqs: [["怎麼手寫輸入韓文？", "在方格中寫一個韓文音節，從自動出現的候選中選取，再點選「加入輸入框」。逐字寫完後點選「複製」，就能把整段韓文貼到需要的地方，不需要安裝韓文輸入法。"], ["可以辨識哪些韓文字？", "本機辨識涵蓋韓國 KS X 1001 標準中的 2,350 個常用音節，以及 ㄱ、ㅏ 等 51 個單獨字母，日常用字大多都能找到。少見的音節可以點選「試試遠端辨識」，遠端辨識支援全部 11,172 個韓文音節。"], ["一定要依正確筆順寫嗎？", "不需完全一致，但依一般筆順（先上後下、先左後右）並把字寫大、置中，候選會更準確。形狀相近的字，例如「가」和「기」，可以從候選清單中選擇正確的一個。"], ["可以直接翻譯手寫的韓文嗎？", "本頁只負責把手寫韓文變成文字，不提供翻譯。把輸入框裡的韓文複製後，貼到翻譯工具即可。"], ["羅馬字是怎麼標的？", "選取候選後會顯示這個音節依韓國《國語羅馬字標記法》單獨標注的讀法，例如「한」是 han。連讀時的音變（如「한국어」讀作 hangugeo）不會顯示在單字標注裡。"], ["手寫內容會上傳嗎？", "預設不會，常用音節在瀏覽器本機辨識。只有本機沒有找到候選，或你主動點選「試試遠端辨識」時，目前的筆畫座標才會傳送到遠端辨識服務，不會傳送輸入框裡的文字。"], ["和韓國漢字手寫辨識有什麼不同？", "本頁辨識的是韓文字母（한글）；如果要查韓國使用的漢字（한자）的讀音和意思，請使用「韓國漢字手寫辨識」。"]],
    related: "相關韓文與漢字工具", relatedAria: "相關韓文與漢字工具", footerText: "JianFan.app 提供韓文手寫辨識、韓國漢字查詢與韓漢轉換等在瀏覽器中執行的工具。"
  },
  en: {
    title: "Korean Handwriting Input - Draw Hangul to Text | JianFan.app",
    description: "Write Korean by hand online: draw a Hangul syllable to get candidates, add each one to a text box and copy the whole phrase, with jamo and romanization shown.",
    eyebrow: "KOREAN HANDWRITING · HANGUL INPUT · IN-BROWSER",
    heading: "Korean Handwriting Input",
    lede: "No Korean keyboard? Draw a Hangul syllable in the square and candidates appear as you write. Add each match to the text box to write a whole Korean phrase, then copy it at once.",
    toolTitle: "Draw one Hangul syllable",
    drawTitle: "Drawing area", drawMeta: "One syllable at a time", append: "Add to text", undo: "Undo stroke", clear: "Clear",
    hint: "Recognition runs in your browser. Only when nothing is found locally, or you choose Try online recognition, are the current stroke coordinates sent to an online recognition service.",
    candidatesTitle: "Hangul candidates", candidatesIntro: "Matches update after every stroke. Select the closest syllable.", candidateEmpty: "Start drawing and candidates appear here automatically.",
    remoteHint: "Matches not right?", remoteAction: "Try online recognition",
    detailTitle: "Selected syllable", detailEmpty: "Select a candidate to see its jamo, romanization and Unicode.",
    labels: { jamo: "Jamo", roman: "Romanization", unicode: "Unicode" }, copy: "Copy",
    composeLabel: "Your Korean text", composePlaceholder: "Select a candidate, then Add to text to keep writing", textCopy: "Copy", textClear: "Clear",
    messages: { idle: "Draw one Hangul syllable in the square", loading: "Loading Korean handwriting data", recognizing: "Comparing handwritten shapes", recognized: "Found {count} candidates. Select the correct syllable.", noCandidates: "No candidate found. Draw the syllable larger and more clearly.", remoteRecognizing: "Checking with online recognition…", remoteNoMatch: "Online recognition found no match either.", remoteError: "Online recognition failed. Check your connection and retry.", loadError: "Recognition data failed to load. Check your connection and retry.", engineError: "The handwriting engine failed to load. Refresh the page.", candidateLabel: "Candidate {position}: {character}", copied: "Copied", copiedText: "Korean text copied", appended: "Added to text: {character}" },
    featureKicker: "KOREAN HANDWRITING TO TEXT", featureTitle: "Type Korean by drawing it, without a Korean keyboard",
    featureIntro: "Korean handwriting input turns hand-drawn Hangul into text you can copy: draw one syllable such as 한, pick it from the candidates, add it to the text box, and repeat until the phrase is complete. The page recognizes the 2,350 common Hangul syllables and 51 single jamo locally, which covers K-drama lines, lyrics, signs and textbook Korean.",
    stepsName: "How to write Korean by hand", steps: ["Draw one Hangul syllable in the square, such as 한, with a finger, stylus or mouse.", "Candidates appear automatically; select the one that matches.", "Choose Add to text. The square clears so you can draw the next syllable.", "When you finish, choose Copy next to the text box and paste the Korean into a translator, search box or chat."],
    cards: [["Candidates while you write", "Recognition runs in a background thread after every stroke, so there is no button to press, and the exact stroke order is not required."], ["Write a whole phrase", "Each selected syllable goes into the text box and the square clears, so you can copy a full Korean sentence you see."], ["Local first, online fallback", "Common syllables are matched in the browser. Stroke coordinates are sent to an online recognition service only when nothing is found locally or you choose to try it."]],
    faqTitle: "Korean handwriting input questions",
    faqs: [["How do I type Korean by handwriting?", "Draw one Hangul syllable, select it from the candidates, and choose Add to text. Repeat for each syllable, then choose Copy to paste the whole phrase anywhere. No Korean keyboard or input method is needed."], ["Which Korean characters can it recognize?", "Local recognition covers the 2,350 common syllables of the Korean KS X 1001 standard and 51 single jamo such as ㄱ and ㅏ. For a rare syllable, choose Try online recognition, which supports all 11,172 Hangul syllables."], ["Must I use the correct stroke order?", "Not exactly, but the usual order (top to bottom, left to right) with a large, centered syllable gives better candidates. For similar shapes such as 가 and 기, pick the right one from the list."], ["Can it translate handwritten Korean?", "No. It turns handwriting into Korean text only. Copy the text box and paste it into a translator."], ["How is the romanization shown?", "The selected syllable is romanized on its own with the Revised Romanization of Korean, for example 한 is han. Sound changes across syllables, such as 한국어 pronounced hangugeo, are not reflected."], ["Is my handwriting uploaded?", "Not by default; common syllables are recognized in the browser. Stroke coordinates are sent to an online recognition service only when nothing is found locally or you choose Try online recognition. The text box content is never sent."], ["How is this different from Korean Hanja handwriting?", "This page recognizes Hangul letters. To look up the reading and meaning of a Chinese character used in Korean (Hanja), use Korean Hanja handwriting."]],
    related: "Related Korean tools", relatedAria: "Related Korean and Hanja tools", footerText: "JianFan.app provides browser-based Korean handwriting input, Korean Hanja lookup and Hangul conversion tools."
  },
  ja: {
    title: "韓国語 手書き入力 - ハングル手書き検索 | JianFan.app",
    description: "韓国語を手書きで入力できる無料ツール。ハングルを1文字書くと候補を自動表示し、入力欄に追加して文章ごとコピーできます。字母の構成とローマ字も確認でき、通常はブラウザー内で認識。",
    eyebrow: "韓国語 手書き · ハングル入力 · ブラウザー内認識",
    heading: "韓国語の手書き入力・ハングル手書き検索",
    lede: "韓国語キーボードがなくても、見たハングルをマスに書けば候補がすぐに表示されます。選んだ字を入力欄に追加していけば、韓国語の文章を続けて入力してまとめてコピーできます。",
    toolTitle: "ハングルを1文字書く",
    drawTitle: "手書き入力", drawMeta: "1回に1文字", append: "入力欄に追加", undo: "1画戻す", clear: "消去",
    hint: "通常はブラウザー内で認識します。ローカルで候補が見つからないときや「オンライン認識を試す」を押したときだけ、筆画の座標をオンライン認識サービスへ送信します。",
    candidatesTitle: "ハングルの候補", candidatesIntro: "1画書くごとに更新されます。最も近い文字を選んでください。", candidateEmpty: "書き始めると、候補がここに自動で表示されます。",
    remoteHint: "候補が合いませんか？", remoteAction: "オンライン認識を試す",
    detailTitle: "選んだ文字", detailEmpty: "候補を選ぶと、字母の構成、ローマ字、Unicodeを表示します。",
    labels: { jamo: "字母の構成", roman: "ローマ字", unicode: "Unicode" }, copy: "コピー",
    composeLabel: "入力した韓国語", composePlaceholder: "候補を選んで「入力欄に追加」で続けて入力", textCopy: "コピー", textClear: "クリア",
    messages: { idle: "マス内にハングルを1文字書いてください", loading: "韓国語の認識データを読み込み中", recognizing: "手書き字形を照合中", recognized: "候補を {count} 件表示しました。正しい文字を選んでください。", noCandidates: "候補が見つかりません。大きく丁寧に書き直してください。", remoteRecognizing: "オンライン認識で検索しています…", remoteNoMatch: "オンライン認識でも候補が見つかりませんでした。", remoteError: "オンライン認識に失敗しました。通信を確認してもう一度お試しください。", loadError: "認識データを読み込めません。通信を確認して再度お試しください。", engineError: "手書き認識機能を読み込めません。ページを再読み込みしてください。", candidateLabel: "候補{position}：{character}", copied: "コピーしました", copiedText: "入力欄の韓国語をコピーしました", appended: "入力欄に追加しました：{character}" },
    featureKicker: "韓国語の手書き入力", featureTitle: "韓国語キーボードがなくても手書きで入力",
    featureIntro: "韓国語の手書き入力は、手で書いたハングル（한글）をコピーできる文字にする機能です。「한」のように1音節を書いて候補から選び、入力欄に追加していけば文章になります。よく使う2,350音節と51の字母をブラウザー内で認識でき、ドラマのせりふや歌詞、看板、教科書の韓国語を書き写すのに便利です。",
    stepsName: "韓国語を手書きで入力する方法", steps: ["マスの中に、「한」のようにハングルを1音節書きます。指・タッチペン・マウスのどれでも書けます。", "候補が自動で表示されるので、形が同じ文字を選びます。", "「入力欄に追加」を押すと、マスが消えて次の文字を書けます。", "書き終えたら入力欄の「コピー」を押し、翻訳や検索、チャットに貼り付けます。"],
    cards: [["書くそばから候補を表示", "1画書くごとにバックグラウンドで照合するので、ボタンを押す必要はありません。筆順が多少違っても候補を探せます。"], ["文章をまとめて入力", "選んだ文字を入力欄に追加するとマスが消えるので、見た韓国語の文をそのまま書き写してコピーできます。"], ["ローカル優先、オンラインで補完", "よく使う音節はブラウザー内で認識します。候補が見つからないときやオンライン認識を選んだときだけ、筆画の座標を送信します。"]],
    faqTitle: "韓国語の手書き入力のよくある質問",
    faqs: [["韓国語を手書きで入力するには？", "マスにハングルを1音節書き、自動で表示される候補から選んで「入力欄に追加」を押します。1文字ずつ繰り返して最後に「コピー」を押せば、韓国語キーボードがなくても文章を入力できます。"], ["どのハングルを認識できますか？", "ブラウザー内の認識は、韓国の KS X 1001 規格のよく使う2,350音節と、ㄱ・ㅏ などの51字母に対応しています。まれな音節は「オンライン認識を試す」を使うと、全11,172音節に対応します。"], ["正しい書き順で書く必要がありますか？", "完全に正しくなくても認識できますが、一般的な筆順（上から下、左から右）で大きく中央に書くと精度が上がります。「가」と「기」のように似た文字は候補一覧から選んでください。"], ["手書きの韓国語を翻訳できますか？", "このページは手書きを文字にするだけで、翻訳はしません。入力欄の韓国語をコピーして翻訳ツールに貼り付けてください。"], ["ローマ字はどう表示されますか？", "選んだ音節を韓国の「国語のローマ字表記法」で単独に表記します。例えば「한」は han です。「한국어」が hangugeo と読まれるような連音の変化は反映されません。"], ["手書きした内容は送信されますか？", "通常は送信されず、よく使う音節はブラウザー内で認識します。候補が見つからないときや「オンライン認識を試す」を押したときだけ筆画の座標を送信し、入力欄の文字は送信しません。"], ["韓国漢字の手書き検索との違いは？", "このページはハングルを認識します。韓国で使われる漢字（한자）の読みや意味を調べるときは「韓国漢字の手書き検索」を使ってください。"]],
    related: "関連する韓国語ツール", relatedAria: "関連する韓国語・韓国漢字ツール", footerText: "JianFan.app は韓国語の手書き入力、韓国漢字検索、ハングル変換などのブラウザーツールを提供します。"
  },
  ko: {
    title: "한글 필기 인식 - 손글씨로 한글 입력 | JianFan.app",
    description: "무료 한글 필기 인식 도구입니다. 한글을 손글씨로 한 글자 쓰면 후보를 바로 보여 주고, 입력란에 이어 붙여 문장째 복사할 수 있습니다.",
    eyebrow: "한글 필기 · 손글씨 입력 · 브라우저 인식",
    heading: "한글 필기 인식·손글씨 입력",
    lede: "한글 자판을 쓰기 어려울 때 칸 안에 한 글자를 손으로 쓰면 바로 후보를 보여 줍니다. 고른 글자를 입력란에 이어 붙이면 문장을 손글씨로 입력해 한꺼번에 복사할 수 있습니다.",
    toolTitle: "칸 안에 한글 한 글자 쓰기",
    drawTitle: "손글씨 입력", drawMeta: "한 번에 한 글자", append: "입력란에 추가", undo: "한 획 취소", clear: "지우기",
    hint: "기본적으로 브라우저에서 인식합니다. 로컬 후보가 없거나 ‘온라인 인식 시도’를 누를 때만 현재 획 좌표를 온라인 인식 서비스로 보냅니다.",
    candidatesTitle: "한글 후보", candidatesIntro: "획을 쓸 때마다 갱신됩니다. 가장 비슷한 글자를 고르세요.", candidateEmpty: "쓰기 시작하면 후보가 여기에 자동으로 표시됩니다.",
    remoteHint: "후보가 맞지 않나요?", remoteAction: "온라인 인식 시도",
    detailTitle: "선택한 글자", detailEmpty: "후보를 고르면 자모 구성, 로마자, 유니코드를 보여 줍니다.",
    labels: { jamo: "자모 구성", roman: "로마자", unicode: "유니코드" }, copy: "복사",
    composeLabel: "입력한 한글", composePlaceholder: "후보를 고른 뒤 ‘입력란에 추가’로 이어서 입력", textCopy: "복사", textClear: "지우기",
    messages: { idle: "칸 안에 한글을 한 글자 쓰세요", loading: "한글 인식 데이터를 불러오는 중", recognizing: "손글씨 모양 비교 중", recognized: "후보 {count}개를 찾았습니다. 맞는 글자를 고르세요.", noCandidates: "후보를 찾지 못했습니다. 더 크고 또렷하게 써 보세요.", remoteRecognizing: "온라인 인식으로 찾는 중…", remoteNoMatch: "온라인 인식에서도 후보를 찾지 못했습니다.", remoteError: "온라인 인식에 실패했습니다. 네트워크를 확인하세요.", loadError: "인식 데이터를 불러오지 못했습니다. 네트워크를 확인하세요.", engineError: "손글씨 인식 기능을 불러오지 못했습니다. 새로 고쳐 주세요.", candidateLabel: "후보 {position}: {character}", copied: "복사했습니다", copiedText: "입력한 한글을 복사했습니다", appended: "입력란에 추가했습니다: {character}" },
    featureKicker: "한글 필기 인식", featureTitle: "자판 없이 손글씨로 한글 입력하기",
    featureIntro: "한글 필기 인식은 손으로 쓴 한글을 복사할 수 있는 글자로 바꿔 줍니다. ‘한’처럼 한 음절을 쓰고 후보에서 고른 뒤 입력란에 추가하면 문장이 됩니다. 자주 쓰는 2,350개 음절과 자모 51개를 브라우저에서 인식하며, 한글을 배우는 외국인이나 자판 입력이 불편할 때 쓰기 좋습니다.",
    stepsName: "손글씨로 한글을 입력하는 방법", steps: ["칸 안에 ‘한’처럼 한글 한 음절을 씁니다. 손가락, 터치펜, 마우스 모두 가능합니다.", "후보가 자동으로 나타나면 모양이 같은 글자를 고릅니다.", "‘입력란에 추가’를 누르면 칸이 지워져 다음 글자를 쓸 수 있습니다.", "다 쓴 뒤 입력란의 ‘복사’를 눌러 번역기, 검색창, 메신저에 붙여 넣습니다."],
    cards: [["쓰는 동안 후보 표시", "획을 하나 쓸 때마다 백그라운드에서 자동으로 비교하므로 버튼을 누를 필요가 없고, 필순이 조금 달라도 됩니다."], ["문장을 이어서 입력", "고른 글자를 입력란에 추가하면 칸이 지워져 보이는 한글 문장을 그대로 옮겨 쓰고 복사할 수 있습니다."], ["로컬 우선, 온라인 보완", "자주 쓰는 음절은 브라우저에서 인식합니다. 후보가 없거나 온라인 인식을 고를 때만 획 좌표를 전송합니다."]],
    faqTitle: "한글 필기 인식 질문",
    faqs: [["손글씨로 한글을 입력하려면 어떻게 하나요?", "칸 안에 한글 한 음절을 쓰고 자동으로 나타나는 후보에서 고른 뒤 ‘입력란에 추가’를 누릅니다. 한 글자씩 반복한 다음 ‘복사’를 누르면 자판 없이도 문장을 입력할 수 있습니다."], ["어떤 글자를 인식하나요?", "브라우저 인식은 KS X 1001 표준의 자주 쓰는 2,350개 음절과 ㄱ, ㅏ 같은 자모 51개를 지원합니다. 드문 음절은 ‘온라인 인식 시도’를 누르면 11,172개 음절 전체를 지원합니다."], ["정확한 필순으로 써야 하나요?", "완전히 같지 않아도 되지만 일반적인 필순(위에서 아래로, 왼쪽에서 오른쪽으로)으로 크게 가운데에 쓰면 더 정확합니다. ‘가’와 ‘기’처럼 비슷한 글자는 후보 목록에서 고르세요."], ["손글씨 한글을 번역할 수 있나요?", "이 페이지는 손글씨를 글자로 바꾸기만 하며 번역은 하지 않습니다. 입력란의 한글을 복사해 번역기에 붙여 넣으세요."], ["로마자는 어떻게 표시하나요?", "선택한 음절을 국어의 로마자 표기법에 따라 한 글자씩 표기합니다. 예를 들어 ‘한’은 han입니다. ‘한국어’가 hangugeo로 소리 나는 것처럼 음절 사이의 소리 변화는 반영하지 않습니다."], ["쓴 내용이 서버로 전송되나요?", "기본적으로 전송되지 않고 자주 쓰는 음절은 브라우저에서 인식합니다. 로컬 후보가 없거나 ‘온라인 인식 시도’를 누를 때만 획 좌표를 전송하며 입력란의 글자는 보내지 않습니다."], ["한자 필기인식과 무엇이 다른가요?", "이 페이지는 한글을 인식합니다. 한자의 음과 뜻을 찾을 때는 ‘한자 필기인식’을 이용하세요."]],
    related: "관련 한글·한자 도구", relatedAria: "관련 한글과 한자 도구", footerText: "JianFan.app는 한글 필기 인식, 한자 찾기, 한글·한자 변환 등 브라우저 도구를 제공합니다."
  }
};

const related = {
  "zh-CN": [[slug, "韩语手写识别"], ["korean-hanja-handwriting-recognition", "韩国汉字手写识别"], ["korean-hanja-dictionary", "韩国汉字查询"], ["hangul-hanja-converter", "韩文汉字转换"], ["character-counter", "在线字数统计"], ["chinese-handwriting-recognition", "手写汉字识别"], ["japanese-handwriting-recognition", "日文手写汉字识别"]],
  "zh-TW": [[slug, "韓文手寫辨識"], ["korean-hanja-handwriting-recognition", "韓國漢字手寫辨識"], ["korean-hanja-dictionary", "韓國漢字查詢"], ["hangul-hanja-converter", "韓文漢字轉換"], ["character-counter", "線上字數統計"], ["chinese-handwriting-recognition", "手寫漢字辨識"], ["japanese-handwriting-recognition", "日文手寫漢字辨識"]],
  en: [[slug, "Korean handwriting input"], ["korean-hanja-handwriting-recognition", "Korean Hanja handwriting"], ["korean-hanja-dictionary", "Korean Hanja dictionary"], ["hangul-hanja-converter", "Hangul Hanja converter"], ["character-counter", "Korean character counter"], ["chinese-handwriting-recognition", "Chinese handwriting recognition"], ["japanese-handwriting-recognition", "Japanese kanji handwriting lookup"]],
  ja: [[slug, "韓国語 手書き入力"], ["korean-hanja-handwriting-recognition", "韓国漢字の手書き検索"], ["korean-hanja-dictionary", "韓国漢字検索"], ["hangul-hanja-converter", "ハングル・漢字変換"], ["character-counter", "文字数カウント"], ["japanese-handwriting-recognition", "手書き漢字検索"], ["chinese-handwriting-recognition", "中国語の手書き検索"]],
  ko: [[slug, "한글 필기 인식"], ["korean-hanja-handwriting-recognition", "한자 필기인식"], ["korean-hanja-dictionary", "한자 찾기·옥편"], ["hangul-hanja-converter", "한자 변환기"], ["character-counter", "글자수 세기"], ["chinese-handwriting-recognition", "중국어 한자 필기 인식"], ["japanese-handwriting-recognition", "일본 한자 손글씨 인식"]]
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
    { "@type": "WebApplication", "@id": `${canonical}#webapp`, name: page.heading, url: canonical, description: page.description, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript and Canvas", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localPath(locale)}` }, { "@type": "ListItem", position: 2, name: page.heading, item: canonical }] },
    { "@type": "HowTo", name: page.stepsName, step: page.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text })) },
    { "@type": "FAQPage", mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
  ] };
}

function validateMetadata(locale, page) {
  const [titleMin, titleMax] = getMetadataLengthRange(locale, "title");
  const titleLength = visibleTitleContentLength(page.title);
  if (titleLength < titleMin || titleLength > titleMax) throw new Error(`${locale}: title has ${titleLength} characters, expected ${titleMin}-${titleMax}`);
  const [descriptionMin, descriptionMax] = getMetadataLengthRange(locale, "description");
  const descriptionLength = visibleMetadataLength(page.description);
  if (descriptionLength < descriptionMin || descriptionLength > descriptionMax) throw new Error(`${locale}: description has ${descriptionLength} characters, expected ${descriptionMin}-${descriptionMax}`);
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  validateMetadata(locale, page);
  const canonical = `${origin}${localPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([key, item]) => `<link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localPath(key, slug)}" />`).join("");
  const localeOptions = Object.entries(locales).map(([key, item]) => `<option value="${key}"${key === locale ? " selected" : ""}>${item.label}</option>`).join("");
  const messages = Object.entries(page.messages).map(([key, value]) => ` data-message-${key.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`).join("");
  const relatedLinks = related[locale].map(([target, label]) => `<a href="${localPath(locale, target)}"${target === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<!doctype html><html lang="${meta.lang}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#07120f" /><link rel="icon" href="/favicon.svg" type="image/svg+xml" /><link rel="apple-touch-icon" href="/apple-touch-icon.png" /><meta name="description" content="${escapeHtml(page.description)}" /><title>${escapeHtml(page.title)}</title><link rel="canonical" href="${canonical}" />${alternates}<link rel="alternate" hreflang="x-default" href="${origin}${localPath("zh-CN", slug)}" /><script src="/locale-redirect.js"></script><link rel="stylesheet" href="/styles.min.css" /><script src="/theme.js"></script><script defer src="https://cdn.jsdelivr.net/gh/barionleg/okanjirec@e036ef26dc307d897653f5b8750a8cb048f042b3/docs/resources/javascript/kanji-canvas.min.js" integrity="sha384-XrcfDF++RCu+q5y34rzWu5oMmUPxapMbAVrEjgq4BgF/SdKDXHT4pCCCh30Wb55D" crossorigin="anonymous"></script><script defer src="/korean-handwriting-recognition.js"></script><!-- seo-schema:start --><script type="application/ld+json">${JSON.stringify(schema(locale, page))}</script><!-- seo-schema:end --></head>
<body data-tool-page="korean-handwriting-recognition" data-page-slug="${slug}" data-locale="${locale}" data-empty-value="—"${messages}><a class="skip-nav" href="#main">${meta.skip}</a><header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">한</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${localeOptions}</select></label><button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false"></button></nav></header>
<main id="main"><section class="tool-hero handwriting-tool-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="handwriting-hero-signal" aria-hidden="true"><span>DRAW</span><strong lang="ko">한</strong><i></i></div></section>
<section class="standalone-tool handwriting-tool" aria-labelledby="handwritingToolTitle"><div class="standalone-tool-head"><div><p class="section-kicker">HANGUL CANVAS / LOCAL FIRST</p><h2 id="handwritingToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="koreanHandwritingStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.messages.idle}</span></div></div>
<div class="handwriting-workspace"><section class="handwriting-draw-panel" aria-labelledby="handwritingDrawTitle"><div class="panel-topline"><h3 id="handwritingDrawTitle">${page.drawTitle}</h3><output>${page.drawMeta}</output></div><div class="handwriting-board"><span class="handwriting-grid-line is-vertical"></span><span class="handwriting-grid-line is-horizontal"></span><span class="handwriting-grid-line is-diagonal-one"></span><span class="handwriting-grid-line is-diagonal-two"></span><canvas id="koreanHandwritingCanvas" aria-label="${escapeHtml(page.drawTitle)}"></canvas></div><div class="handwriting-actions"><button class="primary-action" id="koreanHandwritingAppend" type="button" disabled><span aria-hidden="true">＋</span><span>${page.append}</span></button><button id="koreanHandwritingUndo" type="button"><span aria-hidden="true">↶</span><span>${page.undo}</span></button><button id="koreanHandwritingClear" type="button"><span aria-hidden="true">×</span><span>${page.clear}</span></button></div><div class="handwriting-compose"><div class="handwriting-compose-head"><label for="koreanHandwritingText">${page.composeLabel}</label><button id="koreanHandwritingTextCopy" type="button" disabled>${page.textCopy}</button><button id="koreanHandwritingTextClear" type="button" disabled>${page.textClear}</button></div><input id="koreanHandwritingText" type="text" lang="ko" autocomplete="off" spellcheck="false" maxlength="200" placeholder="${escapeHtml(page.composePlaceholder)}" /></div><p class="handwriting-hint">${page.hint}</p></section>
<section class="handwriting-match-panel" aria-labelledby="handwritingCandidatesTitle"><div class="panel-topline"><div><h3 id="handwritingCandidatesTitle">${page.candidatesTitle}</h3><p>${page.candidatesIntro}</p></div></div><p class="handwriting-candidate-empty" id="koreanHandwritingCandidateEmpty">${page.candidateEmpty}</p><div class="handwriting-candidates" id="koreanHandwritingCandidates"></div><div class="handwriting-remote-action" id="koreanHandwritingRemoteAction" hidden><span>${page.remoteHint}</span><button id="koreanHandwritingRemote" type="button">${page.remoteAction}</button></div><div class="handwriting-result" id="koreanHandwritingDetail" hidden><strong class="handwriting-result-character" id="koreanHandwritingCharacter" lang="ko">한</strong><div class="handwriting-result-content"><h3>${page.detailTitle}</h3><dl><div><dt>${page.labels.jamo}</dt><dd id="koreanHandwritingJamo" lang="ko"></dd></div><div><dt>${page.labels.roman}</dt><dd id="koreanHandwritingRoman"></dd></div><div><dt>${page.labels.unicode}</dt><dd id="koreanHandwritingUnicode"></dd></div></dl><nav class="handwriting-result-actions"><button class="primary-action" id="koreanHandwritingCopy" type="button">${page.copy}</button></nav></div></div><p class="handwriting-candidate-empty" id="koreanHandwritingDetailEmpty">${page.detailEmpty}</p></section></div></section>
<section class="seo-band standalone-info" aria-labelledby="handwritingFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.featureKicker}</p><h2 id="handwritingFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="handwriting-howto"><h3>${page.stepsName}</h3><ol class="blog-steps">${page.steps.map((step) => `<li>${step}</li>`).join("")}</ol></div><div class="seo-grid">${page.cards.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div><section class="pinyin-faq" aria-labelledby="handwritingFaqTitle"><h2 id="handwritingFaqTitle">${page.faqTitle}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">${relatedLinks}</nav></section></main><footer class="site-footer"><p>${page.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localPath(locale, "about")}">${meta.about}</a><a href="${localPath(locale, "contact")}">${meta.contact}</a><a href="${localPath(locale, "privacy")}">${meta.privacy}</a></nav></footer></body></html>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const locale of Object.keys(locales)) {
    const directory = path.join(root, locales[locale].prefix, slug);
    await mkdir(directory, { recursive: true });
    const target = path.join(directory, "index.html");
    await writeFile(target, await preserveToolLinks(`${buildPage(locale)}\n`, target));
  }
  console.log("Generated 5 multilingual Korean handwriting pages.");
}
