import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { JAPANESE_CHARACTER_CATEGORIES } from "../japanese-character-data.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://jianfan.app";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容", language: "界面语言", about: "关于我们", contact: "联系我们", privacy: "隐私声明", copyWord: "复制" },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容", language: "介面語言", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", copyWord: "複製" },
  en: { prefix: "en/", lang: "en", label: "English", home: "Home", skip: "Skip to main content", language: "Language", about: "About", contact: "Contact", privacy: "Privacy Statement", copyWord: "Copy" },
  ja: { prefix: "ja/", lang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動", language: "表示言語", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", copyWord: "コピー" },
  ko: { prefix: "ko/", lang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동", language: "인터페이스 언어", about: "소개", contact: "문의", privacy: "개인정보 보호 안내", copyWord: "복사" }
};

const relatedToolLabels = {
  "zh-CN": {
    kicker: "相关工具",
    "japanese-chinese-kanji-converter": "日中汉字三体转换",
    "japanese-kanji-converter": "日文新旧字体转换",
    "japanese-characters": "日文字符复制",
    "chinese-to-pinyin": "汉字转拼音",
    "chinese-stroke-order": "汉字笔顺查询",
    "word-to-txt": "Word 转 TXT",
    "simplified-to-traditional": "简体转繁体",
    "traditional-to-simplified": "繁体转简体"
  },
  "zh-TW": {
    kicker: "相關工具",
    "japanese-chinese-kanji-converter": "日中漢字三體轉換",
    "japanese-kanji-converter": "日文新舊字體轉換",
    "japanese-characters": "日文字元複製",
    "chinese-to-pinyin": "漢字轉拼音",
    "chinese-stroke-order": "漢字筆順查詢",
    "word-to-txt": "DOCX 轉 TXT",
    "simplified-to-traditional": "簡體轉繁體",
    "traditional-to-simplified": "繁體轉簡體"
  },
  en: {
    kicker: "Related tools",
    "japanese-chinese-kanji-converter": "Japanese and Chinese Kanji",
    "japanese-kanji-converter": "Shinjitai and Kyujitai",
    "japanese-characters": "Japanese Characters",
    "chinese-to-pinyin": "Chinese to Pinyin",
    "chinese-stroke-order": "Chinese stroke order",
    "word-to-txt": "Word to text",
    "simplified-to-traditional": "Simplified to Traditional",
    "traditional-to-simplified": "Traditional to Simplified"
  },
  ja: {
    kicker: "関連ツール",
    "japanese-chinese-kanji-converter": "日中漢字3種類変換",
    "japanese-kanji-converter": "旧字体・新字体変換",
    "japanese-characters": "日本語文字コピー",
    "chinese-to-pinyin": "中国語ピンイン変換",
    "chinese-stroke-order": "中国語漢字の筆順",
    "word-to-txt": "Word TXT 変換",
    "simplified-to-traditional": "簡体字から繁体字",
    "traditional-to-simplified": "繁体字を簡体字に変換"
  },
  ko: {
    kicker: "관련 도구",
    "japanese-chinese-kanji-converter": "일본·중국 한자 변환",
    "japanese-kanji-converter": "일본 신자체·구자체 변환",
    "japanese-characters": "일본어 문자 복사",
    "chinese-to-pinyin": "중국어 병음 변환",
    "chinese-stroke-order": "중국어 한자 필순",
    "word-to-txt": "DOCX TXT 변환",
    "simplified-to-traditional": "간체를 번체로",
    "traditional-to-simplified": "번체를 간체로"
  }
};

const tools = {
  "japanese-chinese-kanji-converter": {
    content: {
      "zh-CN": {
        title: "日中汉字转换 - 日本汉字/简体字/繁体字在线对照 | JianFan.app",
        description: "在线转换和对照日本汉字、中国简体字与繁体字，支持三列结果、差异字对照和一键复制，文本仅在浏览器本地处理。",
        eyebrow: "日本汉字 · 简体字 · 繁体字",
        heading: "日中汉字三体转换与对照",
        lede: "输入一种汉字文本，同时获得日本汉字、中国简体字和繁体字结果。适合字形比较、资料整理和日中内容校对。",
        sourceLabel: "输入文字类型",
        sourceJapanese: "日本汉字",
        sourceSimplified: "中国简体字",
        sourceTraditional: "中国繁体字",
        inputTitle: "输入文本",
        inputPlaceholder: "粘贴日本汉字、简体字或繁体字文本...",
        sample: "示例",
        clear: "清空",
        convert: "转换并对照",
        outputJapanese: "日本汉字",
        outputSimplified: "中国简体字",
        outputTraditional: "中国繁体字",
        copy: "复制",
        comparisonKicker: "三体差异",
        comparisonTitle: "日本汉字、简体字、繁体字对照表",
        comparisonEmpty: "转换后会在这里列出不同字形及出现次数。",
        count: "出现次数",
        disclaimer: "本工具转换汉字字形，不会把日语句子翻译成中文；正式姓名、地名和专业文本仍需人工确认。",
        featureTitle: "一次输入，完成三种汉字字形比较",
        featureIntro: "面向日中汉字转换、日本汉字转简体字以及简繁日三体对照需求。",
        cards: [
          ["正确处理转换来源", "先选择输入文字类型，再按日本、简体或繁体对应链路转换，避免使用错误方向。"],
          ["差异字自动汇总", "仅列出三种结果中存在差异的汉字，并合并重复字形、统计出现次数。"],
          ["浏览器本地处理", "文本不上传服务器，可分别复制三种结果；转换能力基于 OpenCC。"]
        ],
        footer: "JianFan.app 提供浏览器本地运行的中文与日文汉字转换工具。",
        sampleText: "日本語の国と学、芸術と図書館の漢字表記を比較します。"
      },
      "zh-TW": {
        title: "日中漢字轉換 - 日本漢字/簡體字/繁體字線上對照 | JianFan.app",
        description: "線上轉換和對照日本漢字、中國簡體字與繁體字，支援三欄結果、差異字對照和一鍵複製，文字僅在瀏覽器本機處理。",
        eyebrow: "日本漢字 · 簡體字 · 繁體字",
        heading: "日中漢字三體轉換與對照",
        lede: "輸入一種漢字文字，同時取得日本漢字、中國簡體字和繁體字結果，適合字形比較、資料整理和日中內容校對。",
        sourceLabel: "輸入文字類型",
        sourceJapanese: "日本漢字",
        sourceSimplified: "中國簡體字",
        sourceTraditional: "中國繁體字",
        inputTitle: "輸入文字",
        inputPlaceholder: "貼上日本漢字、簡體字或繁體字文字...",
        sample: "範例",
        clear: "清空",
        convert: "轉換並對照",
        outputJapanese: "日本漢字",
        outputSimplified: "中國簡體字",
        outputTraditional: "中國繁體字",
        copy: "複製",
        comparisonKicker: "三體差異",
        comparisonTitle: "日本漢字、簡體字、繁體字對照表",
        comparisonEmpty: "轉換後會在這裡列出不同字形及出現次數。",
        count: "出現次數",
        disclaimer: "本工具轉換漢字字形，不會把日語句子翻譯成中文；正式姓名、地名和專業文字仍需人工確認。",
        featureTitle: "一次輸入，完成三種漢字字形比較",
        featureIntro: "面向日中漢字轉換、日本漢字轉簡體字以及簡繁日三體對照需求。",
        cards: [
          ["正確處理轉換來源", "先選擇輸入文字類型，再依日本、簡體或繁體對應鏈路轉換，避免使用錯誤方向。"],
          ["差異字自動彙整", "只列出三種結果中存在差異的漢字，並合併重複字形、統計出現次數。"],
          ["瀏覽器本機處理", "文字不會上傳伺服器，可分別複製三種結果；轉換能力基於 OpenCC。"]
        ],
        footer: "JianFan.app 提供在瀏覽器本機運行的中文與日文漢字轉換工具。",
        sampleText: "日本語の国と学、芸術と図書館の漢字表記を比較します。"
      },
      en: {
        title: "Japanese, Simplified and Traditional Chinese Kanji Converter | JianFan.app",
        description: "Convert and compare Japanese kanji, Simplified Chinese, and Traditional Chinese in three columns with a changed-glyph table. Processing stays in your browser.",
        eyebrow: "Japanese · Simplified · Traditional",
        heading: "Japanese and Chinese Kanji Converter",
        lede: "Enter one form and compare Japanese kanji, Simplified Chinese, and Traditional Chinese side by side for review and character-level checking.",
        sourceLabel: "Input character type",
        sourceJapanese: "Japanese kanji",
        sourceSimplified: "Simplified Chinese",
        sourceTraditional: "Traditional Chinese",
        inputTitle: "Input text",
        inputPlaceholder: "Paste Japanese kanji, Simplified Chinese, or Traditional Chinese...",
        sample: "Sample",
        clear: "Clear",
        convert: "Convert and compare",
        outputJapanese: "Japanese kanji",
        outputSimplified: "Simplified Chinese",
        outputTraditional: "Traditional Chinese",
        copy: "Copy",
        comparisonKicker: "Three-way differences",
        comparisonTitle: "Japanese, Simplified, and Traditional comparison",
        comparisonEmpty: "Changed glyphs and occurrence counts will appear here after conversion.",
        count: "Occurrences",
        disclaimer: "This tool converts kanji glyph forms; it does not translate Japanese sentences into Chinese. Review official names, places, and specialist text manually.",
        featureTitle: "Compare three kanji forms from one input",
        featureIntro: "Built for Japanese-to-Simplified conversion, Japanese-Chinese kanji comparison, and three-way glyph review.",
        cards: [
          ["Source-aware conversion", "Select the input form first so Japanese, Simplified, and Traditional text follows the correct conversion path."],
          ["Deduplicated differences", "Only differing glyphs are listed, with repeated character combinations merged and counted."],
          ["Local browser processing", "Text is not uploaded. Copy each result independently; conversion is powered by OpenCC."]
        ],
        footer: "JianFan.app provides browser-local Chinese and Japanese kanji conversion tools.",
        sampleText: "日本語の国と学、芸術と図書館の漢字表記を比較します。"
      },
      ja: {
        title: "日本語漢字を簡体字に変換 - 日中漢字変換ツール | JianFan.app",
        description: "日本語の漢字を中国語の簡体字・繁体字に変換し、3種類の漢字表記を並べて比較できます。変更字の対応表とコピーに対応し、ブラウザー内で処理します。",
        eyebrow: "日本語漢字 · 簡体字 · 繁体字",
        heading: "日本語漢字を簡体字・繁体字に変換",
        lede: "1つのテキストから日本語漢字、中国語簡体字、中国語繁体字を同時に表示し、日中漢字の違いを確認できます。",
        sourceLabel: "入力文字の種類",
        sourceJapanese: "日本語漢字",
        sourceSimplified: "中国語簡体字",
        sourceTraditional: "中国語繁体字",
        inputTitle: "入力テキスト",
        inputPlaceholder: "日本語漢字、簡体字、繁体字のテキストを貼り付けてください...",
        sample: "サンプル",
        clear: "クリア",
        convert: "変換して比較",
        outputJapanese: "日本語漢字",
        outputSimplified: "中国語簡体字",
        outputTraditional: "中国語繁体字",
        copy: "コピー",
        comparisonKicker: "3種類の差分",
        comparisonTitle: "日本語漢字・簡体字・繁体字の対応表",
        comparisonEmpty: "変換後、異なる字形と出現回数がここに表示されます。",
        count: "出現回数",
        disclaimer: "このツールは漢字の字形を変換するもので、日本語の文章を中国語へ翻訳するものではありません。氏名・地名・専門文書は確認してください。",
        featureTitle: "一度の入力で3種類の漢字を比較",
        featureIntro: "「簡体字に変換」「日本語漢字 簡体字 変換」「日中漢字変換」の用途に対応します。",
        cards: [
          ["入力元に合わせて変換", "日本語・簡体字・繁体字から入力形式を選び、正しい変換経路で3種類を生成します。"],
          ["異なる漢字を自動集計", "3つの結果で字形が異なる漢字だけを抽出し、重複をまとめて出現回数を表示します。"],
          ["ブラウザー内で処理", "入力内容はサーバーへ送信されません。各結果を個別にコピーでき、OpenCC を基に変換します。"]
        ],
        footer: "JianFan.app はブラウザー内で動作する中国語・日本語漢字変換ツールです。",
        sampleText: "日本語の国と学、芸術と図書館の漢字表記を比較します。"
      },
      ko: {
        title: "일본 한자·중국어 간체·번체 변환기 | JianFan.app",
        description: "일본 한자, 중국어 간체, 번체를 세 열로 변환·비교하고 다른 글자 대조표와 복사 기능을 제공합니다. 텍스트는 브라우저에서 처리됩니다.",
        eyebrow: "일본 한자 · 간체 · 번체",
        heading: "일본 한자와 중국어 간체·번체 변환",
        lede: "한 가지 표기를 입력하면 일본 한자, 중국어 간체, 번체 결과를 함께 표시해 글자 차이를 쉽게 확인할 수 있습니다.",
        sourceLabel: "입력 문자 유형",
        sourceJapanese: "일본 한자",
        sourceSimplified: "중국어 간체",
        sourceTraditional: "중국어 번체",
        inputTitle: "입력 텍스트",
        inputPlaceholder: "일본 한자, 간체 또는 번체 텍스트를 붙여 넣으세요...",
        sample: "예시",
        clear: "지우기",
        convert: "변환하고 비교",
        outputJapanese: "일본 한자",
        outputSimplified: "중국어 간체",
        outputTraditional: "중국어 번체",
        copy: "복사",
        comparisonKicker: "세 가지 표기 차이",
        comparisonTitle: "일본 한자·간체·번체 대조표",
        comparisonEmpty: "변환 후 다른 글자와 등장 횟수가 여기에 표시됩니다.",
        count: "등장 횟수",
        disclaimer: "이 도구는 한자 글자 모양을 변환하며 일본어 문장을 중국어로 번역하지 않습니다. 공식 이름, 지명, 전문 문서는 직접 확인하세요.",
        featureTitle: "한 번 입력해 세 가지 한자 표기 비교",
        featureIntro: "일본 한자와 중국어 간체·번체 변환 및 글자별 대조 작업에 맞춘 페이지입니다.",
        cards: [
          ["입력 유형별 변환", "일본어·간체·번체 중 입력 유형을 선택해 올바른 경로로 세 결과를 생성합니다."],
          ["다른 글자 자동 정리", "세 결과에서 모양이 다른 한자만 추출하고 중복을 합쳐 등장 횟수를 표시합니다."],
          ["브라우저 로컬 처리", "텍스트를 서버에 업로드하지 않으며 각 결과를 따로 복사할 수 있습니다. 변환은 OpenCC 기반입니다."]
        ],
        footer: "JianFan.app는 브라우저에서 실행되는 중국어·일본어 한자 변환 도구입니다.",
        sampleText: "日本語の国と学、芸術と図書館の漢字表記を比較します。"
      }
    }
  },
  "japanese-characters": {
    content: {
      "zh-CN": {
        title: "日文字符复制 - 平假名、片假名与日文符号 | JianFan.app",
        description: "在线查找并复制平假名、片假名、半角片假名、小写假名、浊音和常用日文符号，支持分类筛选、搜索与整组复制。",
        eyebrow: "平假名 · 片假名 · 日文符号",
        heading: "日文字符查找与复制",
        lede: "按分类浏览完整日文字符，点击单字即可复制，也可以搜索罗马音或一次复制当前分类。",
        searchLabel: "搜索日文字符",
        searchPlaceholder: "输入字符或罗马音，例如：あ、ka、shi",
        all: "全部",
        categories: { hiragana: "平假名", katakana: "片假名", halfwidth: "半角片假名", symbols: "日文符号" },
        copyVisible: "复制当前结果",
        recentTitle: "最近复制",
        recentEmpty: "本次访问还没有复制字符",
        resultTemplate: "显示 {count} 个字符",
        featureTitle: "常用日文字元集中查找和复制",
        featureIntro: "覆盖标准与小写假名、浊音、半浊音、半角片假名、重复符号和日本年代符号。",
        cards: [["点击即复制", "每个字符都是独立按钮，复制后可直接粘贴到文档、社交平台或设计工具。"], ["分类与罗马音搜索", "可按平假名、片假名、半角和符号筛选，也能用字符或罗马音查找。"], ["无需上传内容", "字符表和复制操作完全在浏览器中运行，不会向服务器发送输入内容。"]],
        footer: "JianFan.app 提供浏览器本地运行的中文与日文字符工具。"
      },
      "zh-TW": {
        title: "日文字體複製 - 平假名、片假名與日文字元 | JianFan.app",
        description: "線上查找並複製平假名、片假名、半形片假名、小寫假名、濁音和常用日文符號，支援分類篩選、搜尋與整組複製。",
        eyebrow: "平假名 · 片假名 · 日文字元",
        heading: "日文字體與日文字元複製",
        lede: "依分類瀏覽完整日文字符，點選單字即可複製，也可以搜尋羅馬音或一次複製目前分類。",
        searchLabel: "搜尋日文字符",
        searchPlaceholder: "輸入字符或羅馬音，例如：あ、ka、shi",
        all: "全部",
        categories: { hiragana: "平假名", katakana: "片假名", halfwidth: "半形片假名", symbols: "日文符號" },
        copyVisible: "複製目前結果",
        recentTitle: "最近複製",
        recentEmpty: "本次瀏覽還沒有複製字符",
        resultTemplate: "顯示 {count} 個字符",
        featureTitle: "常用日文字元集中查找和複製",
        featureIntro: "涵蓋標準與小寫假名、濁音、半濁音、半形片假名、重複符號和日本年號符號。",
        cards: [["點選即可複製", "每個字符都是獨立按鈕，複製後可直接貼到文件、社群平台或設計工具。"], ["分類與羅馬音搜尋", "可依平假名、片假名、半形和符號篩選，也能使用字符或羅馬音查找。"], ["不需上傳內容", "字符表和複製操作完全在瀏覽器中運行，不會向伺服器傳送輸入內容。"]],
        footer: "JianFan.app 提供在瀏覽器本機運行的中文與日文字符工具。"
      },
      en: {
        title: "Copy Japanese Characters - Hiragana, Katakana and Symbols | JianFan.app",
        description: "Find and copy Hiragana, Katakana, half-width Kana, small Kana, voiced characters, and Japanese symbols with category filters and romaji search.",
        eyebrow: "Hiragana · Katakana · Japanese symbols",
        heading: "Find and Copy Japanese Characters",
        lede: "Browse a complete categorized character set, click any character to copy it, search by romaji, or copy the current results at once.",
        searchLabel: "Search Japanese characters",
        searchPlaceholder: "Enter a character or romaji, such as あ, ka, or shi",
        all: "All",
        categories: { hiragana: "Hiragana", katakana: "Katakana", halfwidth: "Half-width Kana", symbols: "Japanese symbols" },
        copyVisible: "Copy current results",
        recentTitle: "Recently copied",
        recentEmpty: "No characters copied during this visit",
        resultTemplate: "Showing {count} characters",
        featureTitle: "A focused Japanese character copy tool",
        featureIntro: "Includes standard and small Kana, voiced and semi-voiced forms, half-width Katakana, iteration marks, and Japanese era symbols.",
        cards: [["Click to copy", "Every character is a separate button ready to paste into documents, social posts, or design tools."], ["Categories and romaji search", "Filter Hiragana, Katakana, half-width forms, and symbols, or search by character and romaji."], ["Browser-local interaction", "The character list and clipboard workflow run in your browser without sending input to a server."]],
        footer: "JianFan.app provides browser-local Chinese and Japanese character tools."
      },
      ja: {
        title: "日本語文字コピー - ひらがな・カタカナ・記号一覧 | JianFan.app",
        description: "ひらがな、カタカナ、半角カナ、小書き文字、濁音、日本語記号を一覧から検索してコピーできます。カテゴリ絞り込みとローマ字検索に対応。",
        eyebrow: "ひらがな · カタカナ · 日本語記号",
        heading: "日本語文字一覧・コピー",
        lede: "日本語の文字をカテゴリ別に探し、1文字ずつコピーできます。ローマ字検索や表示中の文字の一括コピーにも対応します。",
        searchLabel: "日本語文字を検索",
        searchPlaceholder: "文字またはローマ字を入力（例：あ、ka、shi）",
        all: "すべて",
        categories: { hiragana: "ひらがな", katakana: "カタカナ", halfwidth: "半角カナ", symbols: "日本語記号" },
        copyVisible: "表示中をコピー",
        recentTitle: "最近コピーした文字",
        recentEmpty: "このページではまだ文字をコピーしていません",
        resultTemplate: "{count} 文字を表示",
        featureTitle: "よく使う日本語文字を一覧からコピー",
        featureIntro: "基本・小書き仮名、濁音・半濁音、半角カナ、繰り返し記号、元号記号をまとめています。",
        cards: [["クリックでコピー", "各文字は独立したボタンで、文書、SNS、デザインツールへすぐ貼り付けられます。"], ["カテゴリとローマ字検索", "ひらがな、カタカナ、半角、記号で絞り込み、文字またはローマ字で検索できます。"], ["ブラウザー内で完結", "文字一覧とコピー操作はブラウザー内で実行され、入力内容をサーバーへ送信しません。"]],
        footer: "JianFan.app はブラウザー内で動作する中国語・日本語文字ツールです。"
      },
      ko: {
        title: "일본어 문자 복사 - 히라가나·가타카나·기호 | JianFan.app",
        description: "히라가나, 가타카나, 반각 가나, 작은 가나, 탁음과 일본어 기호를 검색하고 복사할 수 있습니다. 분류 필터와 로마자 검색을 지원합니다.",
        eyebrow: "히라가나 · 가타카나 · 일본어 기호",
        heading: "일본어 문자 찾기와 복사",
        lede: "일본어 문자를 분류별로 찾고 한 글자씩 복사하세요. 로마자 검색과 현재 결과 전체 복사도 지원합니다.",
        searchLabel: "일본어 문자 검색",
        searchPlaceholder: "문자 또는 로마자 입력: あ, ka, shi",
        all: "전체",
        categories: { hiragana: "히라가나", katakana: "가타카나", halfwidth: "반각 가나", symbols: "일본어 기호" },
        copyVisible: "현재 결과 복사",
        recentTitle: "최근 복사",
        recentEmpty: "이번 방문에서 복사한 문자가 없습니다",
        resultTemplate: "{count}개 문자 표시",
        featureTitle: "자주 쓰는 일본어 문자를 한곳에서 복사",
        featureIntro: "기본·작은 가나, 탁음·반탁음, 반각 가타카나, 반복 기호와 일본 연호 기호를 포함합니다.",
        cards: [["클릭해서 복사", "각 문자는 독립 버튼이며 문서, 소셜 게시물, 디자인 도구에 바로 붙여 넣을 수 있습니다."], ["분류와 로마자 검색", "히라가나, 가타카나, 반각, 기호를 필터링하고 문자나 로마자로 검색할 수 있습니다."], ["브라우저에서만 실행", "문자 목록과 복사 작업은 브라우저에서 처리되며 입력 내용을 서버로 보내지 않습니다."]],
        footer: "JianFan.app는 브라우저에서 실행되는 중국어·일본어 문자 도구입니다."
      }
    }
  }
};

function localizedPath(locale, slug = "") {
  const prefix = locales[locale].prefix;
  return `/${prefix}${slug ? `${slug}/` : ""}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildHead(locale, slug, content) {
  const canonical = `${siteOrigin}${localizedPath(locale, slug)}`;
  const hreflangs = {
    "zh-CN": "zh-CN",
    "zh-Hant": "zh-TW",
    en: "en",
    ja: "ja",
    ko: "ko",
    "x-default": "zh-CN"
  };
  const alternates = Object.entries(hreflangs)
    .map(([hreflang, targetLocale]) => `    <link rel="alternate" hreflang="${hreflang}" href="${siteOrigin}${localizedPath(targetLocale, slug)}" />`)
    .join("\n");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${canonical}#webapp`,
        name: content.title.replace(/\s*\|\s*JianFan\.app\s*$/, ""),
        url: canonical,
        description: content.description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: locales[locale].lang,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isPartOf: { "@type": "WebSite", "@id": `${siteOrigin}/#website`, name: "JianFan.app", url: `${siteOrigin}/` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locales[locale].home, item: `${siteOrigin}${localizedPath(locale)}` },
          { "@type": "ListItem", position: 2, name: content.heading, item: canonical }
        ]
      }
    ]
  };

  return `    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(content.description)}" />
    <title>${escapeHtml(content.title)}</title>
    <link rel="canonical" href="${canonical}" />
${alternates}
    <link rel="preconnect" href="https://cdn.jsdelivr.net" />
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <script type="module" src="/japanese-tools.js"></script>
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2).split("\n").map((line) => `      ${line}`).join("\n")}
    </script>
    <!-- seo-schema:end -->`;
}

function buildHeader(locale) {
  const meta = locales[locale];
  const options = Object.entries(locales).map(([value, option]) =>
    `              <option value="${value}"${value === locale ? " selected" : ""}>${option.label}</option>`
  ).join("\n");
  return `    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="Site header">
      <a class="brand" id="homeBrand" href="${localizedPath(locale)}">
        <span class="brand-mark" aria-hidden="true">漢</span>
        <span>JianFan.app</span>
      </a>
      <nav class="top-actions" aria-label="Primary">
        <a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a>
        <label class="language-picker">
          <span>${meta.language}</span>
          <select id="localeSelect" aria-label="${meta.language}">
${options}
          </select>
        </label>
      </nav>
    </header>`;
}

function buildHero(content, glyphs) {
  return `      <section class="tool-hero" aria-labelledby="pageTitle">
        <div>
          <p class="section-kicker">${content.eyebrow}</p>
          <h1 id="pageTitle">${content.heading}</h1>
          <p class="lede">${content.lede}</p>
        </div>
        <div class="tool-hero-glyphs" aria-hidden="true">${glyphs.map((glyph) => `<span>${glyph}</span>`).join("")}</div>
      </section>`;
}

function buildFooter(locale, content) {
  const meta = locales[locale];
  return `    <footer class="site-footer"><p>${content.footer}</p><nav class="footer-links" aria-label="Footer">
        <a href="${localizedPath(locale, "about")}">${meta.about}</a>
        <a href="${localizedPath(locale, "contact")}">${meta.contact}</a>
        <a href="${localizedPath(locale, "privacy")}">${meta.privacy}</a>
      </nav></footer>`;
}

function buildFeatureBand(locale, content, activeSlug) {
  const labels = relatedToolLabels[locale];
  const links = Object.entries(labels).filter(([slug]) => slug !== "kicker");
  return `      <section class="seo-band standalone-info" aria-labelledby="featureTitle">
        <div class="section-heading">
          <p class="section-kicker">${labels.kicker}</p>
          <h2 id="featureTitle">${content.featureTitle}</h2>
          <p class="seo-intro">${content.featureIntro}</p>
        </div>
        <div class="seo-grid">
${content.cards.map(([title, body]) => `          <article><h3>${title}</h3><p>${body}</p></article>`).join("\n")}
        </div>
        <nav class="landing-links" aria-label="Related tools">
${links.map(([slug, label]) => `          <a href="${localizedPath(locale, slug)}"${slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`).join("\n")}
        </nav>
      </section>`;
}

function buildConverterPage(locale, slug, content) {
  const meta = locales[locale];
  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, slug, content)}
  </head>
  <body data-tool-page="kanji-converter" data-page-slug="${slug}" data-locale="${locale}">
${buildHeader(locale)}
    <main id="main">
${buildHero(content, ["日", "简", "繁"])}
      <section class="standalone-tool kanji-triple-tool" aria-labelledby="toolTitle">
        <div class="standalone-tool-head">
          <div>
            <p class="section-kicker">CONVERT / COMPARE</p>
            <h2 id="toolTitle">${content.sourceLabel}</h2>
          </div>
          <div class="status-pill" id="toolStatus" role="status" aria-live="polite"><span class="status-dot"></span><span></span></div>
        </div>
        <div class="source-type-control" role="radiogroup" aria-label="${content.sourceLabel}">
          <button type="button" data-source-type="japanese" role="radio" aria-checked="true" class="is-active">${content.sourceJapanese}</button>
          <button type="button" data-source-type="simplified" role="radio" aria-checked="false">${content.sourceSimplified}</button>
          <button type="button" data-source-type="traditional" role="radio" aria-checked="false">${content.sourceTraditional}</button>
        </div>
        <div class="triple-converter-grid">
          <section class="triple-text-panel input-variant" aria-labelledby="tripleInputTitle">
            <div class="panel-topline"><h3 id="tripleInputTitle">${content.inputTitle}</h3><span id="tripleInputCount">0</span></div>
            <textarea id="tripleInput" spellcheck="false" placeholder="${escapeHtml(content.inputPlaceholder)}"></textarea>
            <div class="panel-actions">
              <button class="text-button" id="tripleSample" type="button" data-sample="${escapeHtml(content.sampleText)}">${content.sample}</button>
              <button class="text-button" id="tripleClear" type="button">${content.clear}</button>
              <button class="primary-action" id="tripleConvert" type="button">${content.convert}</button>
            </div>
          </section>
${[["japanese", content.outputJapanese], ["simplified", content.outputSimplified], ["traditional", content.outputTraditional]].map(([id, label]) => `          <section class="triple-text-panel output-variant ${id}" aria-labelledby="${id}OutputTitle">
            <div class="panel-topline"><h3 id="${id}OutputTitle">${label}</h3><span id="${id}OutputCount">0</span></div>
            <textarea id="${id}Output" readonly spellcheck="false"></textarea>
            <div class="panel-actions"><button class="text-button" type="button" data-copy-output="${id}">${content.copy}</button></div>
          </section>`).join("\n")}
        </div>
        <p class="tool-disclaimer">${content.disclaimer}</p>
        <section class="triple-comparison" aria-labelledby="tripleComparisonTitle">
          <div class="japanese-comparison-head">
            <div><p class="section-kicker">${content.comparisonKicker}</p><h3 id="tripleComparisonTitle">${content.comparisonTitle}</h3><p id="tripleComparisonSummary" class="japanese-comparison-summary" aria-live="polite"></p></div>
          </div>
          <p class="japanese-comparison-empty" id="tripleComparisonEmpty">${content.comparisonEmpty}</p>
          <div class="japanese-table-scroll" id="tripleComparisonTableWrap" hidden>
            <table class="japanese-comparison-table triple-comparison-table">
              <thead><tr><th>${content.outputJapanese}</th><th>${content.outputSimplified}</th><th>${content.outputTraditional}</th><th>${content.count}</th></tr></thead>
              <tbody id="tripleComparisonBody"></tbody>
            </table>
          </div>
        </section>
      </section>
${buildFeatureBand(locale, content, slug)}
    </main>
${buildFooter(locale, content)}
  </body>
</html>`;
}

function buildCharacterButtons(locale) {
  const copyWord = locales[locale].copyWord;
  return JAPANESE_CHARACTER_CATEGORIES.flatMap((category) => category.entries.map((entry) =>
    `            <button class="japanese-character-button" type="button" data-category="${category.id}" data-character="${escapeHtml(entry.character)}" data-reading="${escapeHtml(entry.reading)}" aria-label="${copyWord} ${escapeHtml(entry.character)} ${escapeHtml(entry.reading)}"><span>${escapeHtml(entry.character)}</span><small>${escapeHtml(entry.reading)}</small></button>`
  )).join("\n");
}

function buildCharacterPage(locale, slug, content) {
  const meta = locales[locale];
  const tabs = [["all", content.all], ...Object.entries(content.categories)];
  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
${buildHead(locale, slug, content)}
  </head>
  <body data-tool-page="character-copy" data-page-slug="${slug}" data-locale="${locale}">
${buildHeader(locale)}
    <main id="main">
${buildHero(content, ["あ", "ア", "㋿"])}
      <section class="standalone-tool character-copy-tool" aria-labelledby="characterToolTitle">
        <div class="standalone-tool-head">
          <div><p class="section-kicker">FIND / COPY</p><h2 id="characterToolTitle">${content.searchLabel}</h2></div>
          <div class="status-pill" id="toolStatus" role="status" aria-live="polite"><span class="status-dot"></span><span></span></div>
        </div>
        <div class="character-search-row">
          <label><span>${content.searchLabel}</span><input id="characterSearch" type="search" autocomplete="off" placeholder="${escapeHtml(content.searchPlaceholder)}" /></label>
          <button class="text-button" id="copyVisibleCharacters" type="button">${content.copyVisible}</button>
        </div>
        <div class="character-category-tabs" role="tablist" aria-label="${content.searchLabel}">
${tabs.map(([id, label], index) => `          <button type="button" role="tab" data-category-filter="${id}" aria-selected="${index === 0 ? "true" : "false"}"${index === 0 ? ' class="is-active"' : ""}>${label}</button>`).join("\n")}
        </div>
        <div class="character-results-meta"><span id="characterResultCount" data-template="${escapeHtml(content.resultTemplate)}"></span></div>
        <section class="recent-characters" aria-labelledby="recentCharactersTitle">
          <h3 id="recentCharactersTitle">${content.recentTitle}</h3>
          <p id="recentCharactersEmpty">${content.recentEmpty}</p>
          <div id="recentCharacterList"></div>
        </section>
        <div class="japanese-character-grid" id="japaneseCharacterGrid">
${buildCharacterButtons(locale)}
        </div>
      </section>
${buildFeatureBand(locale, content, slug)}
    </main>
${buildFooter(locale, content)}
  </body>
</html>`;
}

for (const [slug, tool] of Object.entries(tools)) {
  for (const locale of Object.keys(locales)) {
    const outputDirectory = path.join(projectRoot, locales[locale].prefix, slug);
    await mkdir(outputDirectory, { recursive: true });
    const content = tool.content[locale];
    const html = slug === "japanese-chinese-kanji-converter"
      ? buildConverterPage(locale, slug, content)
      : buildCharacterPage(locale, slug, content);
    await writeFile(path.join(outputDirectory, "index.html"), `${html}\n`);
  }
}

console.log("Generated 10 multilingual Japanese tool pages.");
