import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://jianfan.app";
const slug = "kanji-to-hiragana";
const sampleText = "明日は東京で日本語を勉強します。";
const dictionaryPath = "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/";
const dictionaryFallbackPath = "https://cdn.jsdmirror.cn/npm/kuromoji@0.1.2/dict/";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", siteHeader: "网站页眉", primary: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", siteHeader: "網站頁首", primary: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", siteHeader: "Site header", primary: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", siteHeader: "サイトヘッダー", primary: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "언어", siteHeader: "사이트 헤더", primary: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "日文汉字转平假名 - 振假名自动生成与 Ruby 注音 | JianFan.app",
    description: "免费日文汉字转平假名与振假名工具，可将含汉字、平假名和片假名的日语句子转换为纯平假名、保留送假名的读音或带注音的 Ruby 文本，并复制文本或 HTML。使用 Kuromoji 结合词语和句子上下文判断常见读音，适合日语学习、阅读辅助、字幕、课件和网页标注；人名、地名及特殊读法建议人工确认，文本仅在浏览器本地处理。",
    alternateNames: ["日文汉字转平假名", "日语振假名生成器", "日文注音", "Ruby 注音生成器"],
    eyebrow: "日语读音 · 平假名 · 振假名 · Ruby 注音",
    heading: "日文汉字转平假名与振假名",
    lede: "输入日语句子，即可转换为纯平假名、带振假名的日文或可复制的 Ruby HTML。常见汉字读音会结合词语和句子上下文判断。",
    toolTitle: "输入日语并选择注音方式",
    formatsLabel: "输出方式",
    formats: [
      ["hiragana", "纯平假名", "にほんご", "平假名转换结果", "转换后的平假名会显示在这里"],
      ["furigana", "振假名", "日本語", "振假名预览", "转换后的振假名会显示在这里"],
      ["okurigana", "保留送假名", "読(よ)み方", "保留送假名的结果", "保留汉字和送假名的读音会显示在这里"],
      ["ruby", "Ruby HTML", "<ruby>", "Ruby HTML 代码", "可复制的 Ruby HTML 会显示在这里"]
    ],
    inputTitle: "日语文本", inputPlaceholder: "输入或粘贴包含汉字、平假名或片假名的日语...", sample: "示例", clear: "清空", convert: "转换读音",
    visualEmpty: "转换后会在这里显示带振假名的日语文本。", retry: "重试加载", copyText: "复制文本", copyHtml: "复制 Ruby HTML",
    resourceNote: "首次转换需要远程加载公开日语词典；加载完成后可在当前页面连续使用。",
    disclaimer: "日语汉字可能有音读、训读和特殊读法。一般词语可结合上下文判断，人名、地名、作品名和生僻词仍建议人工确认。",
    messages: { idle: "等待输入日语文本", components: "正在加载日语读音组件 {current}/{total}", dictionary: "正在加载日语词典 {current}/{total}", initializing: "正在初始化日语词典", converting: "正在转换第 {current}/{total} 段", complete: "正在整理转换结果", ready: "日语读音转换完成", copiedText: "已复制普通文本", copiedHtml: "已复制 Ruby HTML", copyFailed: "无法自动复制，请手动选择内容", componentError: "转换组件加载失败，请刷新页面", dictionaryError: "日语词典加载失败，请检查网络后重试", notJapanese: "请输入包含日文汉字或假名的文本", tooLong: "文本不能超过 {limit} 个字符" },
    featureKicker: "汉字转平假名 · 振假名自动生成",
    featureTitle: "把日语汉字转换为平假名、振假名或 Ruby 注音",
    featureIntro: "针对日文汉字转平假名、日语振假名自动生成、汉字读音查询和网页 Ruby 注音等需求，同一段日语可以切换不同输出形式。",
    cards: [["根据词语和句子判断读音", "使用日语词法分析识别常见单词和活用，比逐个汉字查音更适合完整句子。"], ["普通读者与网页编辑都能使用", "可直接阅读振假名预览，也可复制平假名文本、括号读音或标准 Ruby HTML。"], ["文本在浏览器内转换", "页面只远程获取公开词典文件，输入的日语和转换结果不会上传到转换服务器。"]],
    howTitle: "如何给日语汉字添加振假名", steps: ["输入或粘贴包含日文汉字和假名的句子。", "选择纯平假名、振假名、保留送假名或 Ruby HTML。", "点击转换并检查人名、地名等特殊读音。", "复制普通文本或 Ruby HTML，用于笔记、字幕、课件或网页。"],
    faqTitle: "汉字转平假名与振假名常见问题", faqs: [["平假名转换和振假名有什么区别？", "纯平假名会用读音替换汉字；振假名保留原来的汉字，并在汉字上方显示读音。"], ["Ruby HTML 是什么？", "Ruby 是网页显示注音的标准 HTML 标签。复制后可在支持 Ruby 的网页编辑器中显示汉字及其上方读音。"], ["人名和地名的读音一定正确吗？", "不一定。人名、地名、当字和作品名可能有特殊读法，自动结果应结合可靠资料确认。"]],
    related: "相关日语工具", relatedAria: "相关日语读音与汉字工具", sourceNote: "读音转换基于 Kuroshiro 与 Kuromoji.js 的公开日语词典，输入文本不会发送给词典来源。", footerText: "JianFan.app 提供在浏览器中运行的日语读音、汉字学习与中文转换工具。"
  },
  "zh-TW": {
    title: "日文漢字轉平假名 - 振假名自動產生與 Ruby 注音 | JianFan.app",
    description: "免費日文漢字轉平假名與振假名工具，可將含漢字、平假名和片假名的日語句子轉成純平假名、保留送假名的讀音或附注音的 Ruby 文字，並複製文字或 HTML。使用 Kuromoji 依單字和句子脈絡判斷常見讀音，適合日語學習、閱讀輔助、字幕、教材與網頁標註；人名、地名及特殊讀法建議人工確認，文字只在瀏覽器本機處理。",
    alternateNames: ["日文漢字轉平假名", "日語振假名產生器", "日文注音", "Ruby 注音產生器"],
    eyebrow: "日語讀音 · 平假名 · 振假名 · Ruby 注音", heading: "日文漢字轉平假名與振假名", lede: "輸入日語句子，即可轉成純平假名、附振假名的日文或可複製的 Ruby HTML。常見漢字讀音會依單字與句子脈絡判斷。", toolTitle: "輸入日語並選擇注音方式", formatsLabel: "輸出方式",
    formats: [["hiragana", "純平假名", "にほんご", "平假名轉換結果", "轉換後的平假名會顯示在這裡"], ["furigana", "振假名", "日本語", "振假名預覽", "轉換後的振假名會顯示在這裡"], ["okurigana", "保留送假名", "読(よ)み方", "保留送假名的結果", "保留漢字與送假名的讀音會顯示在這裡"], ["ruby", "Ruby HTML", "<ruby>", "Ruby HTML 程式碼", "可複製的 Ruby HTML 會顯示在這裡"]],
    inputTitle: "日語文字", inputPlaceholder: "輸入或貼上包含漢字、平假名或片假名的日語...", sample: "範例", clear: "清除", convert: "轉換讀音", visualEmpty: "轉換後會在這裡顯示附振假名的日語文字。", retry: "重新載入", copyText: "複製文字", copyHtml: "複製 Ruby HTML", resourceNote: "第一次轉換需從遠端載入公開日語詞典；完成後可在目前頁面連續使用。", disclaimer: "日語漢字可能有音讀、訓讀與特殊讀法。一般單字可依脈絡判斷，人名、地名、作品名與罕見詞仍建議人工確認。",
    messages: { idle: "等待輸入日語文字", components: "正在載入日語讀音元件 {current}/{total}", dictionary: "正在載入日語詞典 {current}/{total}", initializing: "正在初始化日語詞典", converting: "正在轉換第 {current}/{total} 段", complete: "正在整理轉換結果", ready: "日語讀音轉換完成", copiedText: "已複製一般文字", copiedHtml: "已複製 Ruby HTML", copyFailed: "無法自動複製，請手動選取內容", componentError: "轉換元件載入失敗，請重新整理頁面", dictionaryError: "日語詞典載入失敗，請檢查網路後再試", notJapanese: "請輸入包含日文漢字或假名的文字", tooLong: "文字不能超過 {limit} 個字元" },
    featureKicker: "漢字轉平假名 · 振假名自動產生", featureTitle: "將日語漢字轉成平假名、振假名或 Ruby 注音", featureIntro: "針對日文漢字轉平假名、日語振假名自動產生、漢字讀音查詢與網頁 Ruby 注音等需求，同一段日語可切換不同輸出形式。", cards: [["依單字與句子判斷讀音", "使用日語詞法分析辨識常見單字與活用，比逐字查音更適合完整句子。"], ["一般讀者與網頁編輯皆可使用", "可直接閱讀振假名預覽，也能複製平假名文字、括號讀音或標準 Ruby HTML。"], ["文字在瀏覽器內轉換", "頁面只會從遠端取得公開詞典檔案，輸入的日語與轉換結果不會上傳至轉換伺服器。"]],
    howTitle: "如何替日語漢字加上振假名", steps: ["輸入或貼上包含日文漢字與假名的句子。", "選擇純平假名、振假名、保留送假名或 Ruby HTML。", "執行轉換並檢查人名、地名等特殊讀音。", "複製一般文字或 Ruby HTML，用於筆記、字幕、教材或網頁。"], faqTitle: "漢字轉平假名與振假名常見問題", faqs: [["平假名轉換和振假名有何不同？", "純平假名會以讀音取代漢字；振假名保留原有漢字，並在漢字上方顯示讀音。"], ["Ruby HTML 是什麼？", "Ruby 是網頁顯示注音的標準 HTML 標籤，可在支援 Ruby 的編輯器中顯示漢字及其上方讀音。"], ["人名和地名的讀音一定正確嗎？", "不一定。人名、地名、當字與作品名可能有特殊讀法，自動結果應配合可靠資料確認。"]], related: "相關日語工具", relatedAria: "相關日語讀音與漢字工具", sourceNote: "讀音轉換使用 Kuroshiro 與 Kuromoji.js 的公開日語詞典，輸入文字不會傳送給詞典來源。", footerText: "JianFan.app 提供在瀏覽器中執行的日語讀音、漢字學習與中文轉換工具。"
  },
  en: {
    title: "Kanji to Hiragana - Furigana & Ruby Generator | JianFan.app",
    description: "Convert Japanese Kanji to Hiragana, automatically add Furigana or Ruby markup, and copy text or HTML with context-aware readings processed in your browser.",
    alternateNames: ["Kanji to Hiragana Converter", "Furigana Generator", "Japanese Ruby Generator", "Add Furigana to Japanese"],
    eyebrow: "KANJI READING · HIRAGANA · FURIGANA · RUBY", heading: "Kanji to Hiragana & Furigana Converter", lede: "Convert Japanese sentences to Hiragana, add Furigana above Kanji, keep Okurigana, or generate clean Ruby HTML. Common readings are resolved from words and sentence context.", toolTitle: "Enter Japanese and choose a reading format", formatsLabel: "Output format",
    formats: [["hiragana", "Hiragana", "にほんご", "Hiragana result", "The Hiragana reading appears here"], ["furigana", "Furigana", "日本語", "Furigana preview", "Japanese text with Furigana appears here"], ["okurigana", "Keep Okurigana", "読(よ)み方", "Okurigana reading", "Kanji with parenthesized readings appears here"], ["ruby", "Ruby HTML", "<ruby>", "Ruby HTML source", "Copyable Ruby HTML appears here"]],
    inputTitle: "Japanese text", inputPlaceholder: "Type or paste Japanese kanji, hiragana, or katakana...", sample: "Sample", clear: "Clear", convert: "Convert reading", visualEmpty: "Japanese text with Furigana will appear here.", retry: "Retry loading", copyText: "Copy text", copyHtml: "Copy Ruby HTML", resourceNote: "The first conversion remotely loads a public Japanese dictionary. Further conversions reuse it on this page.", disclaimer: "Japanese kanji can have on-yomi, kun-yomi, and special readings. Review names, places, titles, rare words, and specialist terms against a reliable source.",
    messages: { idle: "Waiting for Japanese text", components: "Loading reading components {current}/{total}", dictionary: "Loading Japanese dictionary {current}/{total}", initializing: "Initializing Japanese dictionary", converting: "Converting section {current}/{total}", complete: "Preparing the result", ready: "Japanese reading conversion complete", copiedText: "Plain text copied", copiedHtml: "Ruby HTML copied", copyFailed: "Automatic copy failed. Select the output manually.", componentError: "The reading component failed to load. Refresh the page.", dictionaryError: "The Japanese dictionary failed to load. Check your connection and retry.", notJapanese: "Enter text containing Japanese kanji or kana", tooLong: "Text is limited to {limit} characters" },
    featureKicker: "KANJI TO HIRAGANA · AUTOMATIC FURIGANA", featureTitle: "Convert Japanese Kanji to Hiragana, Furigana, or Ruby HTML", featureIntro: "Use one focused tool for Kanji to Hiragana conversion, automatic Furigana, Japanese reading lookup, Okurigana notation, and standards-based Ruby markup for web content.", cards: [["Readings from words and context", "Japanese morphological analysis handles common vocabulary and conjugation more accurately than replacing one Kanji at a time."], ["Useful output for readers and editors", "Read the Furigana preview or copy Hiragana, parenthesized readings, and clean Ruby HTML for another document."], ["Japanese text stays in your browser", "The page fetches public dictionary files remotely, but your input and converted result are not uploaded to a conversion server."]],
    howTitle: "How to convert Kanji to Hiragana or add Furigana", steps: ["Enter a Japanese sentence containing Kanji or Kana.", "Choose Hiragana, Furigana, Okurigana, or Ruby HTML.", "Convert the reading and review names or unusual words.", "Copy plain text or Ruby HTML for notes, subtitles, lessons, or a website."], faqTitle: "Kanji, Hiragana, and Furigana questions", faqs: [["What is the difference between Hiragana and Furigana output?", "Hiragana replaces Kanji with their readings. Furigana keeps the original Kanji and displays the reading above it."], ["What is Ruby HTML?", "Ruby is the standard HTML markup for pronunciation annotations. Supporting browsers display the reading above or beside its Kanji base text."], ["Are names and place readings always correct?", "No. Names, places, ateji, titles, and rare vocabulary can have special readings, so important output should be checked."]], related: "Related Japanese tools", relatedAria: "Related Japanese reading and Kanji tools", sourceNote: "Readings use the public Kuroshiro and Kuromoji.js Japanese dictionaries. Your text is not sent to the dictionary source.", footerText: "JianFan.app provides browser-based Japanese reading, Kanji learning, and Chinese conversion tools."
  },
  ja: {
    title: "漢字をひらがなに変換 - ふりがな自動・ルビ振り | JianFan.app",
    description: "漢字をひらがなに変換し、ふりがなを自動で付けられる無料ツールです。日本語の文章を純粋なひらがな、送り仮名を残した読み、ルビ付き表示、コピー可能なRuby HTMLへ変換。Kuromojiが単語と文脈から一般的な読み方を判定し、学習教材、字幕、ブログ、読み上げ原稿の作成を支援します。入力文はブラウザー内で処理されます。",
    alternateNames: ["漢字ひらがな変換", "ふりがな自動", "ルビ振り", "ふりがな変換ツール"],
    eyebrow: "漢字の読み · ひらがな · ふりがな · ルビ", heading: "漢字をひらがなに変換・ふりがなを自動作成", lede: "漢字とかなが混在した文章を、ひらがな、ふりがな付き日本語、送り仮名を残した読み、Ruby HTMLへ変換できます。一般的な単語は文脈から読み方を判定します。", toolTitle: "日本語を入力して読み方の表示形式を選択", formatsLabel: "表示形式",
    formats: [["hiragana", "ひらがな", "にほんご", "ひらがな変換結果", "変換後のひらがながここに表示されます"], ["furigana", "ふりがな", "日本語", "ふりがな付き日本語", "ふりがな付きの日本語がここに表示されます"], ["okurigana", "送り仮名を残す", "読(よ)み方", "送り仮名を残した読み", "漢字と送り仮名を残した読みがここに表示されます"], ["ruby", "ルビHTML", "<ruby>", "Ruby HTMLコード", "コピーできるRuby HTMLがここに表示されます"]],
    inputTitle: "変換する日本語", inputPlaceholder: "漢字・ひらがな・カタカナを含む日本語を入力・貼り付け...", sample: "サンプル", clear: "クリア", convert: "読み方を変換", visualEmpty: "変換すると、ふりがな付きの日本語がここに表示されます。", retry: "再読み込み", copyText: "テキストをコピー", copyHtml: "Ruby HTMLをコピー", resourceNote: "初回変換時に公開日本語辞書をリモートから読み込みます。読み込み後はこのページで続けて利用できます。", disclaimer: "漢字には音読み・訓読み・特殊な読み方があります。人名、地名、作品名、難読語、専門用語は信頼できる資料でも確認してください。",
    messages: { idle: "日本語の入力待ち", components: "読み方変換を読み込み中 {current}/{total}", dictionary: "日本語辞書を読み込み中 {current}/{total}", initializing: "日本語辞書を初期化中", converting: "{total}件中{current}件目を変換中", complete: "変換結果を準備中", ready: "読み方の変換が完了しました", copiedText: "テキストをコピーしました", copiedHtml: "Ruby HTMLをコピーしました", copyFailed: "自動コピーに失敗しました。出力を選択してコピーしてください。", componentError: "変換機能を読み込めませんでした。ページを再読み込みしてください。", dictionaryError: "日本語辞書を読み込めませんでした。通信環境を確認して再試行してください。", notJapanese: "漢字またはかなを含む日本語を入力してください", tooLong: "テキストは{limit}文字までです" },
    featureKicker: "漢字をひらがなに変換 · ふりがな自動", featureTitle: "ひらがな変換、ふりがな自動、ルビ振りを一つの画面で", featureIntro: "「漢字をひらがなに変換」「ふりがなを自動で付ける」「ルビを振る」といった用途に対応し、文章の読み方を目的に合う形式で取り出せます。", cards: [["単語と文脈に応じた読み方", "日本語の形態素解析で一般的な単語や活用を判定し、漢字を一文字ずつ置き換えるより自然な読みを選びます。"], ["読む場合も編集する場合も便利", "画面上でふりがなを確認し、ひらがな、括弧付きの読み、標準的なRuby HTMLを用途に合わせてコピーできます。"], ["入力した文章は送信しません", "公開辞書ファイルはリモートから取得しますが、入力文と変換結果はブラウザー内だけで処理します。"]],
    howTitle: "漢字をひらがなに変換してふりがなを付ける方法", steps: ["漢字やかなを含む日本語の文章を入力します。", "ひらがな、ふりがな、送り仮名、ルビHTMLから形式を選びます。", "読み方を変換し、人名や地名などの特殊な読みを確認します。", "テキストまたはRuby HTMLをコピーして利用します。"], faqTitle: "ひらがな変換・ふりがな自動のよくある質問", faqs: [["ひらがな変換とふりがなの違いは何ですか？", "ひらがな変換は漢字を読み方へ置き換えます。ふりがなは元の漢字を残し、その上に小さく読み方を表示します。"], ["ルビHTMLとは何ですか？", "ブラウザーで漢字の上や横に読み方を表示する標準HTMLです。Ruby対応のエディターやWebページで利用できます。"], ["人名や地名も正しく変換できますか？", "一般的な語は文脈から判定しますが、人名、地名、当て字、作品名には複数の読み方があるため確認が必要です。"]], related: "関連する日本語ツール", relatedAria: "関連する日本語読み方・漢字ツール", sourceNote: "読み方の変換にはKuroshiroとKuromoji.jsの公開日本語辞書を使用します。入力文が辞書提供元へ送信されることはありません。", footerText: "JianFan.app はブラウザーで使える日本語の読み方、漢字学習、中国語変換ツールを提供します。"
  },
  ko: {
    title: "일본어 한자 히라가나 변환 - 후리가나·루비 자동 생성 | JianFan.app",
    description: "일본어 한자를 히라가나로 변환하고 후리가나를 자동으로 넣는 무료 도구입니다. 문장을 히라가나, 오쿠리가나, 루비 미리보기 또는 Ruby HTML로 바꾸며 단어와 문맥을 분석해 발음을 찾습니다. 일본어 학습, 자막과 수업 자료에 활용할 수 있으며 입력 내용은 브라우저 안에서 처리됩니다.",
    alternateNames: ["한자 히라가나 변환", "후리가나 생성기", "일본어 루비 생성기", "일본어 한자 읽기 변환"],
    eyebrow: "한자 읽기 · 히라가나 · 후리가나 · 루비", heading: "일본어 한자를 히라가나와 후리가나로 변환", lede: "한자와 가나가 섞인 일본어 문장을 히라가나, 후리가나, 오쿠리가나 표기 또는 Ruby HTML로 변환합니다. 일반 단어의 읽는 법은 문맥을 반영해 분석합니다.", toolTitle: "일본어를 입력하고 읽기 형식을 선택하세요", formatsLabel: "출력 형식",
    formats: [["hiragana", "히라가나", "にほんご", "히라가나 결과", "변환한 히라가나가 여기에 표시됩니다"], ["furigana", "후리가나", "日本語", "후리가나 미리보기", "후리가나가 있는 일본어가 여기에 표시됩니다"], ["okurigana", "오쿠리가나 유지", "読(よ)み方", "오쿠리가나 표기", "한자와 오쿠리가나를 유지한 읽기가 표시됩니다"], ["ruby", "Ruby HTML", "<ruby>", "Ruby HTML 코드", "복사 가능한 Ruby HTML이 여기에 표시됩니다"]],
    inputTitle: "일본어 텍스트", inputPlaceholder: "일본 한자, 히라가나 또는 가타카나를 입력하거나 붙여 넣으세요...", sample: "예시", clear: "지우기", convert: "읽기 변환", visualEmpty: "변환하면 후리가나가 있는 일본어가 여기에 표시됩니다.", retry: "다시 불러오기", copyText: "텍스트 복사", copyHtml: "Ruby HTML 복사", resourceNote: "첫 변환 때 공개 일본어 사전을 원격으로 불러옵니다. 이후에는 이 페이지에서 계속 사용할 수 있습니다.", disclaimer: "일본 한자는 음독, 훈독과 특수 독음이 있습니다. 인명, 지명, 작품명, 희귀 단어와 전문 용어는 신뢰할 수 있는 자료로 확인하세요.",
    messages: { idle: "일본어 입력 대기", components: "읽기 변환 구성 요소 불러오는 중 {current}/{total}", dictionary: "일본어 사전 불러오는 중 {current}/{total}", initializing: "일본어 사전 초기화 중", converting: "{total}개 중 {current}번째 변환 중", complete: "변환 결과 준비 중", ready: "일본어 읽기 변환 완료", copiedText: "텍스트를 복사했습니다", copiedHtml: "Ruby HTML을 복사했습니다", copyFailed: "자동 복사에 실패했습니다. 출력 내용을 직접 선택해 주세요.", componentError: "변환 기능을 불러오지 못했습니다. 페이지를 새로고침해 주세요.", dictionaryError: "일본어 사전을 불러오지 못했습니다. 네트워크를 확인하고 다시 시도하세요.", notJapanese: "일본 한자 또는 가나가 포함된 텍스트를 입력하세요", tooLong: "텍스트는 {limit}자까지 입력할 수 있습니다" },
    featureKicker: "한자 히라가나 변환 · 자동 후리가나", featureTitle: "일본어 한자를 히라가나, 후리가나 또는 Ruby HTML로 변환", featureIntro: "한자 히라가나 변환, 일본어 후리가나 자동 생성, 한자 읽기 확인, 오쿠리가나 표기와 웹용 Ruby 주석을 한 화면에서 처리합니다.", cards: [["단어와 문맥을 반영한 읽기", "일본어 형태소 분석으로 일반 어휘와 활용을 판별해 한 글자씩 바꾸는 방식보다 문장에 맞는 읽기를 선택합니다."], ["학습자와 웹 편집자 모두 활용", "후리가나 미리보기를 읽거나 히라가나, 괄호 표기, 표준 Ruby HTML을 다른 문서에 복사할 수 있습니다."], ["일본어 텍스트는 브라우저에서 처리", "공개 사전 파일만 원격으로 가져오며 입력한 문장과 변환 결과는 변환 서버에 업로드하지 않습니다."]],
    howTitle: "일본어 한자를 히라가나로 바꾸고 후리가나를 넣는 방법", steps: ["한자나 가나가 포함된 일본어 문장을 입력합니다.", "히라가나, 후리가나, 오쿠리가나 또는 Ruby HTML을 선택합니다.", "읽기를 변환하고 이름이나 지명의 특수 독음을 확인합니다.", "일반 텍스트나 Ruby HTML을 복사해 사용합니다."], faqTitle: "한자 히라가나·후리가나 변환 질문", faqs: [["히라가나 변환과 후리가나는 어떻게 다른가요?", "히라가나는 한자를 읽는 법으로 바꾸고, 후리가나는 원래 한자를 유지하면서 위에 발음을 표시합니다."], ["Ruby HTML은 무엇인가요?", "웹 브라우저에서 한자 위나 옆에 발음을 표시하는 표준 HTML 마크업입니다."], ["이름과 지명도 정확하게 변환되나요?", "일반 단어는 문맥으로 분석하지만 인명, 지명, 아테지와 작품명은 여러 읽는 법이 있어 확인이 필요합니다."]], related: "관련 일본어 도구", relatedAria: "관련 일본어 읽기 및 한자 도구", sourceNote: "읽기 변환에는 Kuroshiro와 Kuromoji.js의 공개 일본어 사전을 사용하며 입력 문장은 사전 제공처로 전송하지 않습니다.", footerText: "JianFan.app는 브라우저에서 사용하는 일본어 읽기, 한자 학습 및 중국어 변환 도구를 제공합니다."
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "日文汉字转平假名"], ["kanji-to-romaji", "日文汉字转罗马字"], ["japanese-stroke-order", "日本汉字笔顺"], ["japanese-kanji-dictionary", "日本汉字查询"], ["japanese-handwriting-recognition", "日文手写汉字查询"], ["han-character-worksheet", "汉字练习纸"], ["character-counter", "在线字数统计"], ["japanese-kanji-converter", "日文新旧字体转换"]],
  "zh-TW": [[slug, "日文漢字轉平假名"], ["kanji-to-romaji", "日文漢字轉羅馬字"], ["japanese-stroke-order", "日本漢字筆順"], ["japanese-kanji-dictionary", "日本漢字查詢"], ["japanese-handwriting-recognition", "日文手寫漢字查詢"], ["han-character-worksheet", "國字練習紙"], ["character-counter", "線上字數統計"], ["japanese-kanji-converter", "日文新舊字體轉換"]],
  en: [[slug, "Kanji to Hiragana"], ["kanji-to-romaji", "Kanji to Romaji"], ["japanese-stroke-order", "Japanese Kanji stroke order"], ["japanese-kanji-dictionary", "Japanese Kanji search"], ["japanese-handwriting-recognition", "Handwritten Kanji search"], ["han-character-worksheet", "Kanji practice sheets"], ["character-counter", "Japanese character counter"], ["japanese-kanji-converter", "Shinjitai and Kyujitai"]],
  ja: [[slug, "漢字をひらがなに変換"], ["kanji-to-romaji", "漢字をローマ字に変換"], ["japanese-stroke-order", "漢字の書き順"], ["japanese-kanji-dictionary", "漢字検索"], ["japanese-handwriting-recognition", "手書き漢字検索"], ["han-character-worksheet", "漢字練習プリント"], ["character-counter", "文字数カウント"], ["japanese-kanji-converter", "旧字体・新字体変換"]],
  ko: [[slug, "한자 히라가나 변환"], ["kanji-to-romaji", "일본어 한자 로마자 변환"], ["japanese-stroke-order", "일본 한자 획순"], ["japanese-kanji-dictionary", "일본 한자 검색"], ["japanese-handwriting-recognition", "손글씨 일본 한자 검색"], ["han-character-worksheet", "한자 쓰기 연습장"], ["character-counter", "글자수 세기"], ["japanese-kanji-converter", "일본 신자체·구자체 변환"]]
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localizedPath(locale, targetSlug = "") {
  return `/${locales[locale].prefix}${targetSlug ? `${targetSlug}/` : ""}`;
}

function buildSchema(locale, page) {
  const canonical = `${siteOrigin}${localizedPath(locale, slug)}`;
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", "@id": `${canonical}#webapp`, name: page.heading, alternateName: page.alternateNames, url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${siteOrigin}/#website`, name: "JianFan.app", url: `${siteOrigin}/` } },
    { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${siteOrigin}${localizedPath(locale)}` }, { "@type": "ListItem", position: 2, name: page.heading, item: canonical }] },
    { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
  ] };
}

function buildHead(locale, page) {
  const canonical = `${siteOrigin}${localizedPath(locale, slug)}`;
  const alternates = Object.entries(locales).map(([targetLocale, meta]) => `    <link rel="alternate" hreflang="${meta.hreflang}" href="${siteOrigin}${localizedPath(targetLocale, slug)}" />`).join("\n");
  return `    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(page.description)}" />
    <title>${escapeHtml(page.title)}</title>
    <link rel="canonical" href="${canonical}" />
${alternates}
    <link rel="alternate" hreflang="x-default" href="${siteOrigin}${localizedPath("zh-CN", slug)}" />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.min.css" />
    <script defer src="/kanji-romaji-core.js"></script>
    <script defer src="/japanese-reading-client.js"></script>
    <script defer src="/kanji-to-hiragana.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n")}
    </script>
    <!-- seo-schema:end -->`;
}

function buildHeader(locale) {
  const meta = locales[locale];
  const options = Object.entries(locales).map(([value, item]) => `              <option value="${value}"${value === locale ? " selected" : ""}>${item.label}</option>`).join("\n");
  return `    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.siteHeader}"><a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">読</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.primary}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${options}
          </select></label></nav></header>`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const messages = Object.entries(page.messages).map(([key, value]) => ` data-message-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`).join("");
  const formats = page.formats.map(([value, label, example, title, placeholder], index) => `            <button type="button" data-hiragana-format="${value}" data-output-title="${escapeHtml(title)}" data-output-placeholder="${escapeHtml(placeholder)}" role="radio" aria-checked="${index === 0}"${index === 0 ? ' class="is-active"' : ""}><span>${escapeHtml(label)}</span><small>${escapeHtml(example)}</small></button>`).join("\n");
  const related = relatedLabels[locale].map(([target, label]) => `          <a href="${localizedPath(locale, target)}"${target === slug ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a>`).join("\n");
  const faq = page.faqs.map(([question, answer]) => `          <details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("\n");
  const cards = page.cards.map(([title, text]) => `          <article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("\n");
  const steps = page.steps.map((step) => `          <li>${escapeHtml(step)}</li>`).join("\n");
  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, page)}
  </head>
  <body data-tool-page="kanji-to-hiragana" data-page-slug="${slug}" data-locale="${locale}" data-dictionary-path="${dictionaryPath}" data-dictionary-fallback-path="${dictionaryFallbackPath}"${messages}>
${buildHeader(locale)}
    <main id="main">
      <section class="tool-hero reading-tool-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${escapeHtml(page.eyebrow)}</p><h1 id="pageTitle">${escapeHtml(page.heading)}</h1><p class="lede">${escapeHtml(page.lede)}</p></div><div class="reading-hero-sample" aria-hidden="true"><ruby>日本語<rt>にほんご</rt></ruby><span>→</span><strong>にほんご</strong></div></section>
      <section class="standalone-tool hiragana-tool" aria-labelledby="hiraganaToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">READ / ANNOTATE / COPY</p><h2 id="hiraganaToolTitle">${escapeHtml(page.toolTitle)}</h2></div><div><div class="status-pill" id="hiraganaStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${escapeHtml(page.messages.idle)}</span></div><progress class="reading-progress" id="hiraganaProgress" max="12" value="0" hidden></progress></div></div>
        <fieldset class="reading-format-fieldset"><legend>${escapeHtml(page.formatsLabel)}</legend><div class="pinyin-format-control reading-format-control" role="radiogroup" aria-label="${escapeHtml(page.formatsLabel)}">
${formats}
        </div></fieldset>
        <p class="romaji-resource-note">${escapeHtml(page.resourceNote)}</p>
        <div class="pinyin-converter-grid reading-converter-grid">
          <section class="pinyin-text-panel input-variant" aria-labelledby="hiraganaInputTitle"><div class="panel-topline"><h3 id="hiraganaInputTitle">${escapeHtml(page.inputTitle)}</h3><span id="hiraganaInputCount">0</span></div><textarea id="hiraganaInput" spellcheck="false" placeholder="${escapeHtml(page.inputPlaceholder)}"></textarea><div class="panel-actions"><button class="text-button" id="hiraganaSample" type="button" data-sample="${sampleText}">${escapeHtml(page.sample)}</button><button class="text-button" id="hiraganaClear" type="button">${escapeHtml(page.clear)}</button><button class="primary-action" id="hiraganaConvert" type="button">${escapeHtml(page.convert)}</button></div></section>
          <section class="pinyin-text-panel output-variant" aria-labelledby="hiraganaOutputTitle"><div class="panel-topline"><h3 id="hiraganaOutputTitle">${escapeHtml(page.formats[0][3])}</h3><span id="hiraganaOutputCount">0</span></div><textarea id="hiraganaPlainOutput" readonly spellcheck="false" placeholder="${escapeHtml(page.formats[0][4])}"></textarea><div id="hiraganaVisualOutput" class="romaji-furigana-output reading-visual-output" hidden><p id="hiraganaVisualEmpty" class="pinyin-empty">${escapeHtml(page.visualEmpty)}</p></div><div class="panel-actions"><button class="text-button" id="hiraganaRetry" type="button" hidden>${escapeHtml(page.retry)}</button><button class="text-button" id="hiraganaCopyText" type="button" disabled>${escapeHtml(page.copyText)}</button><button class="text-button" id="hiraganaCopyHtml" type="button" disabled>${escapeHtml(page.copyHtml)}</button></div></section>
        </div>
        <p class="tool-disclaimer">${escapeHtml(page.disclaimer)}</p>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="hiraganaFeatureTitle"><div class="section-heading"><p class="section-kicker">${escapeHtml(page.featureKicker)}</p><h2 id="hiraganaFeatureTitle">${escapeHtml(page.featureTitle)}</h2><p class="seo-intro">${escapeHtml(page.featureIntro)}</p></div><div class="seo-grid">
${cards}
        </div><section class="word-howto" aria-labelledby="hiraganaHowTitle"><h2 id="hiraganaHowTitle">${escapeHtml(page.howTitle)}</h2><ol>
${steps}
        </ol></section><section class="pinyin-faq" aria-labelledby="hiraganaFaqTitle"><h2 id="hiraganaFaqTitle">${escapeHtml(page.faqTitle)}</h2>
${faq}
        </section><p class="section-kicker pinyin-related-kicker">${escapeHtml(page.related)}</p><nav class="landing-links" aria-label="${escapeHtml(page.relatedAria)}">
${related}
        </nav><p class="reading-source-note">${escapeHtml(page.sourceNote)}</p></section>
    </main>
    <footer class="site-footer"><p>${escapeHtml(page.footerText)}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localizedPath(locale, "about")}">${meta.about}</a><a href="${localizedPath(locale, "contact")}">${meta.contact}</a><a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>
`;
}

for (const locale of Object.keys(locales)) {
  const directory = path.join(projectRoot, locales[locale].prefix, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), buildPage(locale));
}

console.log("Generated 5 multilingual Kanji-to-Hiragana pages.");
