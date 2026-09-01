import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://jianfan.app";
const checkOnly = process.argv.includes("--check");
const slug = "kanji-to-romaji";
const sampleText = "明日は東京で日本語を勉強します。";
const dictionaryPath = "https://cdn.jsdmirror.cn/npm/kuromoji@0.1.2/dict/";
const dictionaryFallbackPath = "https://cdn.jsdmirror.cn/npm/kuromoji@0.1.2/dict/";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", siteHeader: "网站页眉", primary: "主要导航", footerAria: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", siteHeader: "網站頁首", primary: "主要導覽", footerAria: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明" },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", siteHeader: "Site header", primary: "Primary navigation", footerAria: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement" },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", siteHeader: "サイトヘッダー", primary: "メインナビゲーション", footerAria: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明" },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "인터페이스 언어", siteHeader: "사이트 헤더", primary: "주요 탐색", footerAria: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내" }
};

const content = {
  "zh-CN": {
    title: "日文汉字转罗马字 - 日语罗马音、平假名与注音 | JianFan.app",
    description: "免费日文汉字转罗马字工具，将日语文本转换为罗马字、平假名、片假名或振假名，支持平文式、训令式和日本式罗马字及上下文读音。",
    eyebrow: "日语读音 · 罗马字 · 平假名 · 振假名",
    heading: "日文汉字转罗马字与平假名",
    lede: "输入包含汉字、平假名或片假名的日语句子，即可完成日语罗马音转换、假名转换和汉字注音。读音会根据常见词语与句子上下文判断。",
    toolTitle: "输入日语并选择输出格式",
    idle: "等待输入日语文本",
    loading: "首次使用，正在远程加载日语词典",
    converting: "正在转换第 {current}/{total} 段",
    ready: "日语读音转换完成",
    copied: "已复制转换结果",
    copyFailed: "无法自动复制，请手动复制",
    componentError: "转换组件加载失败，请刷新页面",
    dictionaryError: "日语词典加载失败，请检查网络后重试",
    notJapanese: "请输入包含日文汉字或假名的文本",
    tooLong: "文本不能超过 {limit} 个字符",
    formatLabel: "输出格式",
    formats: [
      ["romaji", "罗马字", "nihongo", "罗马字结果", "转换后的日语罗马字会显示在这里"],
      ["hiragana", "平假名", "にほんご", "平假名结果", "转换后的平假名会显示在这里"],
      ["katakana", "片假名", "ニホンゴ", "片假名结果", "转换后的片假名会显示在这里"],
      ["furigana", "振假名", "日本語", "汉字振假名标注", "转换后的振假名会显示在这里"]
    ],
    systemLabel: "罗马字体系",
    systems: [["hepburn", "平文式（Hepburn）"], ["kunrei", "训令式（Kunrei）"], ["nippon", "日本式（Nippon）"]],
    resourceNote: "首次转换会远程按需加载公开日语词典，之后可在当前页面继续使用。",
    inputTitle: "日语文本",
    inputPlaceholder: "输入或粘贴包含汉字、平假名或片假名的日语...",
    sample: "示例",
    clear: "清空",
    convert: "转换读音",
    outputTitle: "罗马字结果",
    outputPlaceholder: "转换后的日语罗马字会显示在这里",
    furiganaEmpty: "转换后会在这里显示带振假名的日语文本。",
    retry: "重试加载",
    copy: "复制结果",
    disclaimer: "本工具转换的是日语读音，不是汉语拼音或中日翻译。日语汉字可能有多种音读、训读；人名、地名、生僻词和特殊读法仍需人工确认。",
    seoKicker: "日语罗马音转换",
    featureTitle: "日文转罗马音、平假名和振假名",
    featureIntro: "覆盖日文汉字转罗马字、日文转罗马音、日文汉字转平假名、日语假名标注等常见需求，适合日语学习、发音查询、字幕和阅读辅助。",
    cards: [
      ["四种日语读音输出", "在罗马字、平假名、片假名和振假名之间快速切换，日文中的汉字和假名可放在同一段文本中处理。"],
      ["结合上下文判断读音", "基于 Kuromoji 日语词法分析处理常见活用和汉字读音，比逐字替换更适合完整单词与句子。"],
      ["文本仅在浏览器处理", "页面会远程获取公开词典文件，但输入的日语文本和转换结果不会上传到服务器。"]
    ],
    faqTitle: "日文汉字转罗马字常见问题",
    faqs: [
      ["Kanji to alphabet 是什么？", "通常指把日文汉字或日语句子转换为拉丁字母，也就是日语罗马字。本页对应的主要输出是 Romaji。"],
      ["可以把日文汉字转成平假名吗？", "可以。选择“平假名”会用日语读音替换汉字；选择“振假名”则会保留汉字并在上方标注读音。"],
      ["为什么同一个汉字会有不同读音？", "日语汉字存在音读、训读和特殊读法，工具会根据常见词语与上下文选择读音，人名和地名仍可能需要手动确认。"]
    ],
    related: "相关工具",
    relatedAria: "相关日语与汉字工具",
    footer: "JianFan.app 提供在浏览器中运行的日语读音、汉字与中文转换工具。"
  },
  "zh-TW": {
    title: "日文漢字轉羅馬字 - 日語羅馬拼音、平假名與注音 | JianFan.app",
    schemaName: "日文漢字轉羅馬字 - 日語羅馬拼音、平假名與注音",
    description: "免費線上日文漢字轉羅馬字工具，將漢字、平假名與片假名轉成羅馬字、平假名、片假名或振假名，支援平文式、訓令式、日本式和常見上下文讀音。",
    eyebrow: "日語讀音 · 羅馬字 · 平假名 · 振假名",
    heading: "日文漢字轉羅馬字與平假名",
    lede: "輸入包含漢字、平假名或片假名的日語句子，即可進行日語羅馬拼音轉換、假名轉換與漢字注音。讀音會依常見詞語與句子上下文判斷。",
    toolTitle: "輸入日語並選擇輸出格式",
    idle: "等待輸入日語文字",
    loading: "首次使用，正在遠端載入日語詞典",
    converting: "正在轉換第 {current}/{total} 段",
    ready: "日語讀音轉換完成",
    copied: "已複製轉換結果",
    copyFailed: "無法自動複製，請手動複製",
    componentError: "轉換元件載入失敗，請重新整理頁面",
    dictionaryError: "日語詞典載入失敗，請檢查網路後重試",
    notJapanese: "請輸入包含日文漢字或假名的文字",
    tooLong: "文字不能超過 {limit} 個字元",
    formatLabel: "輸出格式",
    formats: [
      ["romaji", "羅馬字", "nihongo", "羅馬字結果", "轉換後的日語羅馬字會顯示在這裡"],
      ["hiragana", "平假名", "にほんご", "平假名結果", "轉換後的平假名會顯示在這裡"],
      ["katakana", "片假名", "ニホンゴ", "片假名結果", "轉換後的片假名會顯示在這裡"],
      ["furigana", "振假名", "日本語", "漢字振假名標註", "轉換後的振假名會顯示在這裡"]
    ],
    systemLabel: "羅馬字系統",
    systems: [["hepburn", "平文式（Hepburn）"], ["kunrei", "訓令式（Kunrei）"], ["nippon", "日本式（Nippon）"]],
    resourceNote: "首次轉換會遠端按需載入公開日語詞典，之後可在目前頁面繼續使用。",
    inputTitle: "日語文字",
    inputPlaceholder: "輸入或貼上包含漢字、平假名或片假名的日語...",
    sample: "範例",
    clear: "清空",
    convert: "轉換讀音",
    outputTitle: "羅馬字結果",
    outputPlaceholder: "轉換後的日語羅馬字會顯示在這裡",
    furiganaEmpty: "轉換後會在這裡顯示帶振假名的日語文字。",
    retry: "重新載入",
    copy: "複製結果",
    disclaimer: "本工具轉換的是日語讀音，不是漢語拼音或中日翻譯。日語漢字可能有多種音讀、訓讀；人名、地名、罕見詞與特殊讀法仍需人工確認。",
    seoKicker: "日語羅馬拼音轉換",
    featureTitle: "日文轉羅馬字、平假名與振假名",
    featureIntro: "涵蓋日文漢字轉羅馬字、日文轉羅馬音、日文漢字轉平假名、日語假名標註等常見需求，適合日語學習、發音查詢、字幕與閱讀輔助。",
    cards: [
      ["四種日語讀音輸出", "可在羅馬字、平假名、片假名與振假名之間快速切換，同一段文字可同時包含日文漢字與假名。"],
      ["依上下文判斷讀音", "使用 Kuromoji 日語詞法分析處理常見活用與漢字讀音，比逐字替換更適合完整單字與句子。"],
      ["文字只在瀏覽器處理", "頁面會遠端取得公開詞典檔案，但輸入的日語文字與轉換結果不會上傳至伺服器。"]
    ],
    faqTitle: "日文漢字轉羅馬字常見問題",
    faqs: [
      ["Kanji to alphabet 是什麼？", "通常指將日文漢字或日語句子轉成拉丁字母，也就是日語羅馬字。本頁對應的主要輸出是 Romaji。"],
      ["可以把日文漢字轉成平假名嗎？", "可以。選擇「平假名」會用日語讀音取代漢字；選擇「振假名」則保留漢字並在上方標註讀音。"],
      ["為什麼同一個漢字會有不同讀音？", "日語漢字有音讀、訓讀與特殊讀法，工具會依常見詞語和上下文選擇讀音，人名與地名仍可能需要手動確認。"]
    ],
    related: "相關工具",
    relatedAria: "相關日語與漢字工具",
    footer: "JianFan.app 提供在瀏覽器中運行的日語讀音、漢字與中文轉換工具。"
  },
  en: {
    title: "Kanji to Romaji Converter - Japanese to Alphabet | JianFan.app",
    description: "Convert Japanese kanji, hiragana, and katakana to Romaji, Hiragana, Katakana, or Furigana with context-aware readings and three Japanese romanization systems.",
    eyebrow: "Kanji Reading · Romaji · Hiragana · Furigana",
    heading: "Kanji to Romaji Converter",
    lede: "Convert Japanese kanji and mixed Japanese text to the Latin alphabet, Hiragana, Katakana, or Furigana. Common readings are resolved from words and sentence context.",
    toolTitle: "Enter Japanese and choose an output",
    idle: "Waiting for Japanese text",
    loading: "Loading the Japanese dictionary for first use",
    converting: "Converting section {current} of {total}",
    ready: "Japanese reading conversion complete",
    copied: "Converted result copied",
    copyFailed: "Automatic copy failed. Please copy manually.",
    componentError: "The conversion component failed to load. Refresh the page.",
    dictionaryError: "The Japanese dictionary could not load. Check your connection and retry.",
    notJapanese: "Enter text containing Japanese kanji or kana",
    tooLong: "Text is limited to {limit} characters",
    formatLabel: "Output format",
    formats: [
      ["romaji", "Romaji", "nihongo", "Romaji result", "The romanized Japanese result appears here"],
      ["hiragana", "Hiragana", "にほんご", "Hiragana result", "The Hiragana reading appears here"],
      ["katakana", "Katakana", "ニホンゴ", "Katakana result", "The Katakana reading appears here"],
      ["furigana", "Furigana", "日本語", "Japanese text with Furigana", "The Furigana result appears here"]
    ],
    systemLabel: "Romanization system",
    systems: [["hepburn", "Hepburn"], ["kunrei", "Kunrei-shiki"], ["nippon", "Nippon-shiki"]],
    resourceNote: "The first conversion remotely loads a public Japanese dictionary. It remains available while this page stays open.",
    inputTitle: "Japanese text",
    inputPlaceholder: "Type or paste Japanese kanji, hiragana, or katakana...",
    sample: "Sample",
    clear: "Clear",
    convert: "Convert reading",
    outputTitle: "Romaji result",
    outputPlaceholder: "The romanized Japanese result appears here",
    furiganaEmpty: "Japanese text with Furigana appears here after conversion.",
    retry: "Retry loading",
    copy: "Copy result",
    disclaimer: "This tool romanizes Japanese readings; it is not Chinese Pinyin or a Japanese translator. Kanji can have several on-yomi, kun-yomi, and special readings, so review names, places, rare words, and specialist terms.",
    seoKicker: "Japanese to Romaji",
    featureTitle: "Kanji to alphabet, Hiragana, and Furigana",
    featureIntro: "Use this Kanji to Romaji converter to romanize Japanese text, convert Kanji to Hiragana or Katakana, and add Furigana for reading practice, subtitles, study notes, and pronunciation checks.",
    cards: [
      ["Four Japanese reading formats", "Switch between Romaji, Hiragana, Katakana, and Furigana while keeping kanji and kana together in the original Japanese text."],
      ["Context-aware Kanji readings", "Kuromoji morphological analysis handles common words, conjugation, and Japanese readings more accurately than character-by-character replacement."],
      ["Browser-local text processing", "The page fetches public dictionary files remotely, but your Japanese text and converted results are not uploaded to a server."]
    ],
    faqTitle: "Kanji to Romaji questions",
    faqs: [
      ["What does Kanji to alphabet mean?", "It usually means converting Japanese kanji or Japanese sentences to the Latin alphabet, known as Romaji. Romaji is the primary output on this page."],
      ["Can I convert Kanji to Hiragana?", "Yes. Hiragana replaces kanji with their readings, while Furigana keeps the kanji and displays the reading above it."],
      ["Does one Kanji always have one Romaji reading?", "No. Japanese kanji can have on-yomi, kun-yomi, and special readings. Context selects a likely reading, but names and places may need manual review."]
    ],
    related: "Related tools",
    relatedAria: "Related Japanese and character tools",
    footer: "JianFan.app provides browser-based Japanese reading, Kanji, and Chinese conversion tools."
  },
  ja: {
    title: "漢字をローマ字に変換 - ひらがな・ふりがな変換 | JianFan.app",
    description: "日本語の漢字・ひらがな・カタカナをローマ字、ひらがな、カタカナ、ふりがなへ変換。ヘボン式・訓令式・日本式と文脈に応じた読み方に対応します。",
    eyebrow: "漢字の読み方 · ローマ字 · ひらがな · ふりがな",
    heading: "漢字をローマ字・ひらがなに変換",
    lede: "漢字とかなが混在する日本語を入力すると、ローマ字、ひらがな、カタカナ、ふりがなへ変換できます。一般的な単語と文章の文脈から読み方を判定します。",
    toolTitle: "日本語を入力して出力形式を選択",
    idle: "日本語の入力待ち",
    loading: "初回利用のため日本語辞書を読み込み中",
    converting: "{total} 件中 {current} 件目を変換中",
    ready: "日本語の読み方変換が完了しました",
    copied: "変換結果をコピーしました",
    copyFailed: "自動コピーに失敗しました。手動でコピーしてください。",
    componentError: "変換機能を読み込めませんでした。ページを再読み込みしてください。",
    dictionaryError: "日本語辞書を読み込めませんでした。通信環境を確認して再試行してください。",
    notJapanese: "漢字またはかなを含む日本語を入力してください",
    tooLong: "テキストは {limit} 文字までです",
    formatLabel: "出力形式",
    formats: [
      ["romaji", "ローマ字", "nihongo", "ローマ字変換結果", "変換後のローマ字がここに表示されます"],
      ["hiragana", "ひらがな", "にほんご", "ひらがな変換結果", "変換後のひらがながここに表示されます"],
      ["katakana", "カタカナ", "ニホンゴ", "カタカナ変換結果", "変換後のカタカナがここに表示されます"],
      ["furigana", "ふりがな", "日本語", "ふりがな付き日本語", "ふりがな付きの日本語がここに表示されます"]
    ],
    systemLabel: "ローマ字表記法",
    systems: [["hepburn", "ヘボン式"], ["kunrei", "訓令式"], ["nippon", "日本式"]],
    resourceNote: "初回変換時に公開日本語辞書をリモートから読み込みます。このページを開いている間は続けて利用できます。",
    inputTitle: "日本語テキスト",
    inputPlaceholder: "漢字・ひらがな・カタカナを含む日本語を入力・貼り付け...",
    sample: "サンプル",
    clear: "クリア",
    convert: "読み方を変換",
    outputTitle: "ローマ字変換結果",
    outputPlaceholder: "変換後のローマ字がここに表示されます",
    furiganaEmpty: "変換すると、ふりがな付きの日本語がここに表示されます。",
    retry: "再読み込み",
    copy: "結果をコピー",
    disclaimer: "本ツールは日本語の読み方を変換するもので、翻訳や中国語ピンイン変換ではありません。漢字には音読み・訓読み・特殊な読み方があるため、人名・地名・難読語は確認してください。",
    seoKicker: "漢字 ローマ字 変換",
    featureTitle: "日本語をローマ字・ひらがな・ふりがなに変換",
    featureIntro: "「漢字をローマ字に変換」「日本語をローマ字に変換」「漢字をひらがなに変換」「ふりがな変換ツール」の用途に対応し、漢字にふりがなを自動付与できます。",
    cards: [
      ["4種類の読み方を表示", "ローマ字、ひらがな、カタカナ、ふりがなを切り替え、漢字とかなが混在した文章をそのまま処理できます。"],
      ["文脈に応じた漢字の読み方", "Kuromoji の形態素解析を使い、単純な1文字変換ではなく一般的な単語、活用、文章に合わせて読み方を判定します。"],
      ["テキストはブラウザー内で処理", "公開辞書ファイルはリモートから取得しますが、入力した日本語と変換結果はサーバーへ送信されません。"]
    ],
    faqTitle: "漢字・ローマ字変換のよくある質問",
    faqs: [
      ["漢字をローマ字に変換できますか？", "はい。漢字とかなを含む日本語を、ヘボン式・訓令式・日本式のローマ字へ変換できます。"],
      ["漢字をひらがなに変換できますか？", "はい。「ひらがな」は漢字を読み方へ置き換え、「ふりがな」は元の漢字を残して上に読み方を表示します。"],
      ["人名や地名の読み方も正確ですか？", "一般的な語は文脈から判定しますが、人名・地名・当て字には複数の読み方があるため、重要な結果は確認してください。"]
    ],
    related: "関連ツール",
    relatedAria: "関連する日本語・漢字ツール",
    footer: "JianFan.app はブラウザーで使える日本語読み方・漢字・中国語変換ツールを提供します。"
  },
  ko: {
    title: "일본어 한자 로마자 변환기 - 히라가나·후리가나 | JianFan.app",
    description: "일본어 한자, 히라가나, 가타카나를 로마자, 히라가나, 가타카나 또는 후리가나로 변환하고 문맥 기반 발음과 세 가지 로마자 표기법을 지원합니다.",
    eyebrow: "일본어 발음 · 로마자 · 히라가나 · 후리가나",
    heading: "일본어 한자 로마자 변환기",
    lede: "한자와 가나가 섞인 일본어 문장을 로마자, 히라가나, 가타카나 또는 후리가나로 변환합니다. 일반 단어와 문장 문맥을 바탕으로 읽는 법을 분석합니다.",
    toolTitle: "일본어를 입력하고 출력 형식 선택",
    idle: "일본어 입력 대기",
    loading: "처음 사용할 일본어 사전을 불러오는 중",
    converting: "{total}개 중 {current}번째 구간 변환 중",
    ready: "일본어 발음 변환 완료",
    copied: "변환 결과를 복사했습니다",
    copyFailed: "자동 복사에 실패했습니다. 직접 복사해 주세요.",
    componentError: "변환 기능을 불러오지 못했습니다. 페이지를 새로 고쳐 주세요.",
    dictionaryError: "일본어 사전을 불러오지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.",
    notJapanese: "일본 한자 또는 가나가 포함된 텍스트를 입력하세요",
    tooLong: "텍스트는 {limit}자까지 입력할 수 있습니다",
    formatLabel: "출력 형식",
    formats: [
      ["romaji", "로마자", "nihongo", "로마자 결과", "변환된 일본어 로마자가 여기에 표시됩니다"],
      ["hiragana", "히라가나", "にほんご", "히라가나 결과", "변환된 히라가나가 여기에 표시됩니다"],
      ["katakana", "가타카나", "ニホンゴ", "가타카나 결과", "변환된 가타카나가 여기에 표시됩니다"],
      ["furigana", "후리가나", "日本語", "후리가나가 있는 일본어", "후리가나 결과가 여기에 표시됩니다"]
    ],
    systemLabel: "로마자 표기법",
    systems: [["hepburn", "헵번식"], ["kunrei", "훈령식"], ["nippon", "일본식"]],
    resourceNote: "첫 변환 때 공개 일본어 사전을 원격으로 불러오며 이 페이지를 열어 둔 동안 계속 사용할 수 있습니다.",
    inputTitle: "일본어 텍스트",
    inputPlaceholder: "일본 한자, 히라가나 또는 가타카나가 포함된 텍스트를 입력하거나 붙여 넣으세요...",
    sample: "예시",
    clear: "지우기",
    convert: "발음 변환",
    outputTitle: "로마자 결과",
    outputPlaceholder: "변환된 일본어 로마자가 여기에 표시됩니다",
    furiganaEmpty: "변환 후 후리가나가 있는 일본어가 여기에 표시됩니다.",
    retry: "다시 불러오기",
    copy: "결과 복사",
    disclaimer: "이 도구는 일본어 발음을 변환하며 번역이나 중국어 병음 변환 기능이 아닙니다. 일본 한자는 음독, 훈독과 특수 독음이 있으므로 인명, 지명과 희귀 단어는 직접 확인하세요.",
    seoKicker: "일본어 로마자 변환",
    featureTitle: "일본 한자를 로마자·히라가나·후리가나로 변환",
    featureIntro: "일본어 한자 로마자 변환, 한자 히라가나 변환, 일본어 발음 변환과 후리가나 변환을 한 페이지에서 제공해 학습, 자막, 읽기와 발음 확인에 활용할 수 있습니다.",
    cards: [
      ["네 가지 일본어 읽기 형식", "로마자, 히라가나, 가타카나와 후리가나를 전환하고 한자와 가나가 섞인 일본어 문장을 그대로 처리합니다."],
      ["문맥을 반영한 한자 발음", "Kuromoji 형태소 분석으로 한 글자씩 바꾸는 대신 일반 단어, 활용과 문장 문맥에 맞는 읽는 법을 선택합니다."],
      ["텍스트는 브라우저에서 처리", "공개 사전 파일은 원격으로 가져오지만 입력한 일본어와 변환 결과는 서버로 전송하지 않습니다."]
    ],
    faqTitle: "일본어 한자 로마자 변환 질문",
    faqs: [
      ["일본어 한자를 로마자로 변환할 수 있나요?", "네. 한자와 가나가 포함된 일본어를 헵번식, 훈령식 또는 일본식 로마자로 변환할 수 있습니다."],
      ["한자를 히라가나로 변환할 수 있나요?", "네. 히라가나는 한자를 읽는 법으로 바꾸고, 후리가나는 원래 한자를 유지하면서 위에 발음을 표시합니다."],
      ["이름과 지명 발음도 정확한가요?", "일반 단어는 문맥으로 분석하지만 인명, 지명과 특수 독음은 여러 읽는 법이 있을 수 있어 직접 확인해야 합니다."]
    ],
    related: "관련 도구",
    relatedAria: "관련 일본어 및 한자 도구",
    footer: "JianFan.app는 브라우저에서 사용하는 일본어 발음, 한자 및 중국어 변환 도구를 제공합니다."
  }
};

const relatedLabels = {
  "zh-CN": [[slug, "日文汉字转罗马字"], ["japanese-handwriting-recognition", "日文手写查字"], ["japanese-kanji-dictionary", "日本汉字字典"], ["japanese-chinese-kanji-converter", "日中汉字三体转换"], ["japanese-kanji-converter", "日文新旧字体转换"], ["japanese-characters", "日文字符复制"], ["chinese-to-pinyin", "汉字转拼音"], ["chinese-stroke-order", "汉字笔顺查询"], ["character-counter", "在线字数统计"], ["han-character-worksheet", "汉字练习纸"], ["word-to-txt", "Word 转 TXT"]],
  "zh-TW": [[slug, "日文漢字轉羅馬字"], ["japanese-handwriting-recognition", "日文手寫查字"], ["japanese-kanji-dictionary", "日本漢字字典"], ["japanese-chinese-kanji-converter", "日中漢字三體轉換"], ["japanese-kanji-converter", "日文新舊字體轉換"], ["japanese-characters", "日文字元複製"], ["chinese-to-pinyin", "漢字轉拼音"], ["chinese-stroke-order", "漢字筆順查詢"], ["character-counter", "線上字數統計"], ["han-character-worksheet", "國字練習紙"], ["word-to-txt", "DOCX 轉 TXT"]],
  en: [[slug, "Kanji to Romaji"], ["japanese-handwriting-recognition", "Japanese handwriting lookup"], ["japanese-kanji-dictionary", "Japanese Kanji dictionary"], ["japanese-chinese-kanji-converter", "Japanese and Chinese Kanji"], ["japanese-kanji-converter", "Shinjitai and Kyujitai"], ["japanese-characters", "Japanese character copy"], ["chinese-to-pinyin", "Chinese to Pinyin"], ["chinese-stroke-order", "Chinese stroke order"], ["character-counter", "CJK character counter"], ["han-character-worksheet", "Chinese worksheet generator"], ["word-to-txt", "Word to text"]],
  ja: [[slug, "漢字・ローマ字変換"], ["japanese-handwriting-recognition", "手書き漢字検索"], ["japanese-kanji-dictionary", "漢字検索・漢字辞典"], ["japanese-chinese-kanji-converter", "日中漢字3種類変換"], ["japanese-kanji-converter", "旧字体・新字体変換"], ["japanese-characters", "日本語文字コピー"], ["chinese-to-pinyin", "中国語ピンイン変換"], ["chinese-stroke-order", "中国語漢字の筆順"], ["character-counter", "文字数カウント"], ["han-character-worksheet", "漢字練習プリント"], ["word-to-txt", "Word TXT 変換"]],
  ko: [[slug, "일본어 한자 로마자 변환"], ["japanese-handwriting-recognition", "일본 한자 손글씨 검색"], ["japanese-kanji-dictionary", "일본 한자 사전"], ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"], ["japanese-kanji-converter", "일본 신자체·구자체 변환"], ["japanese-characters", "일본어 문자 복사"], ["chinese-to-pinyin", "중국어 병음 변환"], ["chinese-stroke-order", "중국어 한자 필순"], ["character-counter", "글자수 세기"], ["han-character-worksheet", "한자 쓰기 연습장"], ["word-to-txt", "DOCX TXT 변환"]]
};

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localizedPath(locale, targetSlug = "") {
  return `/${locales[locale].prefix}${targetSlug ? `${targetSlug}/` : ""}`;
}

function buildSchema(locale, page) {
  const canonical = `${siteOrigin}${localizedPath(locale, slug)}`;
  const schemaName = page.schemaName ?? page.heading;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${canonical}#webapp`, name: schemaName, url: canonical, description: page.description, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${siteOrigin}/#website`, name: "JianFan.app", url: `${siteOrigin}/` } },
      { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${siteOrigin}${localizedPath(locale)}` }, { "@type": "ListItem", position: 2, name: schemaName, item: canonical }] },
      { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
    ]
  };
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
    <script defer src="/kanji-to-romaji.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${JSON.stringify(buildSchema(locale, page), null, 2).split("\n").map((line) => `      ${line}`).join("\n")}
    </script>
    <!-- seo-schema:end -->`;
}

function buildHeader(locale) {
  const meta = locales[locale];
  const options = Object.entries(locales).map(([value, option]) => `              <option value="${value}"${value === locale ? " selected" : ""}>${option.label}</option>`).join("\n");
  return `    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="${meta.siteHeader}">
      <a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">漢</span><span>JianFan.app</span></a>
      <nav class="top-actions" aria-label="${meta.primary}"><a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">
${options}
          </select></label></nav>
    </header>`;
}

function buildPage(locale) {
  const meta = locales[locale];
  const page = content[locale];
  const messages = [
    ["idle", page.idle],
    ["loading", page.loading],
    ["converting", page.converting],
    ["ready", page.ready],
    ["copied", page.copied],
    ["copy-failed", page.copyFailed],
    ["component-error", page.componentError],
    ["dictionary-error", page.dictionaryError],
    ["not-japanese", page.notJapanese],
    ["too-long", page.tooLong]
  ].map(([key, value]) => ` data-message-${key}="${escapeHtml(value)}"`).join("");
  const formatButtons = page.formats.map(([value, label, example, title, placeholder], index) => `            <button type="button" data-romaji-format="${value}" data-output-title="${escapeHtml(title)}" data-output-placeholder="${escapeHtml(placeholder)}" role="radio" aria-checked="${index === 0}"${index === 0 ? ' class="is-active"' : ""}><span>${label}</span><small>${example}</small></button>`).join("\n");
  const systemButtons = page.systems.map(([value, label], index) => `            <button type="button" data-romaji-system="${value}" role="radio" aria-checked="${index === 0}"${index === 0 ? ' class="is-active"' : ""}>${label}</button>`).join("\n");
  const links = relatedLabels[locale].map(([targetSlug, label]) => `          <a href="${localizedPath(locale, targetSlug)}"${targetSlug === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("\n");
  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, page)}
  </head>
  <body data-tool-page="kanji-to-romaji" data-page-slug="${slug}" data-locale="${locale}" data-dictionary-path="${dictionaryPath}" data-dictionary-fallback-path="${dictionaryFallbackPath}"${messages}>
${buildHeader(locale)}
    <main id="main">
      <section class="tool-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="tool-hero-glyphs" aria-hidden="true"><span>漢</span><span>かな</span><span>A</span></div></section>
      <section class="standalone-tool romaji-tool" aria-labelledby="romajiToolTitle">
        <div class="standalone-tool-head"><div><p class="section-kicker">READ / ROMANIZE</p><h2 id="romajiToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="romajiStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.idle}</span></div></div>
        <div class="pinyin-options romaji-options">
          <fieldset><legend>${page.formatLabel}</legend><div class="pinyin-format-control romaji-format-control" role="radiogroup" aria-label="${page.formatLabel}">
${formatButtons}
          </div></fieldset>
          <fieldset id="romajiSystemFieldset"><legend>${page.systemLabel}</legend><div class="pinyin-case-control romaji-system-control" role="radiogroup" aria-label="${page.systemLabel}">
${systemButtons}
          </div></fieldset>
        </div>
        <p class="romaji-resource-note">${page.resourceNote}</p>
        <div class="pinyin-converter-grid romaji-converter-grid">
          <section class="pinyin-text-panel romaji-text-panel input-variant" aria-labelledby="romajiInputTitle"><div class="panel-topline"><h3 id="romajiInputTitle">${page.inputTitle}</h3><span id="romajiInputCount">0</span></div><textarea id="romajiInput" spellcheck="false" placeholder="${escapeHtml(page.inputPlaceholder)}"></textarea><div class="panel-actions"><button class="text-button" id="romajiSample" type="button" data-sample="${sampleText}">${page.sample}</button><button class="text-button" id="romajiClear" type="button">${page.clear}</button><button class="primary-action" id="romajiConvert" type="button">${page.convert}</button></div></section>
          <section class="pinyin-text-panel romaji-text-panel output-variant" aria-labelledby="romajiOutputTitle"><div class="panel-topline"><h3 id="romajiOutputTitle">${page.outputTitle}</h3><span id="romajiOutputCount">0</span></div><textarea id="romajiOutput" readonly spellcheck="false" placeholder="${escapeHtml(page.outputPlaceholder)}"></textarea><div id="furiganaOutput" class="romaji-furigana-output" hidden><p id="furiganaOutputEmpty" class="pinyin-empty">${page.furiganaEmpty}</p></div><div class="panel-actions"><button class="text-button" id="romajiRetry" type="button" hidden>${page.retry}</button><button class="text-button" id="romajiCopy" type="button">${page.copy}</button></div></section>
        </div>
        <p class="tool-disclaimer">${page.disclaimer}</p>
      </section>
      <section class="seo-band standalone-info" aria-labelledby="romajiFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.seoKicker}</p><h2 id="romajiFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">
${page.cards.map(([title, text]) => `          <article><h3>${title}</h3><p>${text}</p></article>`).join("\n")}
        </div><section class="pinyin-faq" aria-labelledby="romajiFaqTitle"><h2 id="romajiFaqTitle">${page.faqTitle}</h2>
${page.faqs.map(([question, answer]) => `          <details><summary>${question}</summary><p>${answer}</p></details>`).join("\n")}
        </section><p class="section-kicker pinyin-related-kicker">${page.related}</p><nav class="landing-links" aria-label="${page.relatedAria}">
${links}
        </nav></section>
    </main>
    <footer class="site-footer"><p>${page.footer}</p><nav class="footer-links" aria-label="${meta.footerAria}"><a href="${localizedPath(locale, "about")}">${meta.about}</a><a href="${localizedPath(locale, "contact")}">${meta.contact}</a><a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a></nav></footer>
  </body>
</html>`;
}

function preserveExistingNavigation(generatedHtml, existingHtml) {
  for (const pattern of [
    /<nav class="landing-links"[\s\S]*?<\/nav>/,
    /<footer class="site-footer">[\s\S]*?<\/footer>/
  ]) {
    const existingSection = existingHtml.match(pattern)?.[0];
    if (existingSection) generatedHtml = generatedHtml.replace(pattern, existingSection);
  }
  return generatedHtml;
}

for (const locale of Object.keys(locales)) {
  const directory = path.join(projectRoot, locales[locale].prefix, slug);
  const destination = path.join(directory, "index.html");
  await mkdir(directory, { recursive: true });
  let html = buildPage(locale);
  try {
    html = preserveExistingNavigation(html, await readFile(destination, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const generated = `${html}\n`;
  if (checkOnly) {
    const existing = await readFile(destination, "utf8");
    if (generated !== existing) throw new Error(`${path.relative(projectRoot, destination)} is out of sync with the Kanji-to-Romaji generator`);
  } else {
    await writeFile(destination, generated);
  }
}

console.log(checkOnly ? "Checked 5 multilingual Kanji-to-Romaji pages." : "Generated 5 multilingual Kanji-to-Romaji pages.");
