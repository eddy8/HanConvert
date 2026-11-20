// Categorized tool directory shown in every page footer, and right below the converter on the
// five home pages. Labels are each target page's core search term so the anchor text matches the
// query that page ranks for. The first link of every locale points to the home page with the
// broad converter keyword, which gives the home page an exact-match internal anchor site-wide.
export const directoryMarkerStart = "<!-- site-tool-directory:start -->";
export const directoryMarkerEnd = "<!-- site-tool-directory:end -->";

export const directoryLocales = {
  "zh-CN": {
    prefix: "",
    label: "全部工具",
    homeHeading: "更多汉字工具",
    groups: [
      ["简繁转换", [
        ["", "简繁转换"],
        ["simplified-to-traditional", "简体转繁体"],
        ["traditional-to-simplified", "繁体转简体"],
        ["taiwan-traditional", "台湾繁体转换"],
        ["hong-kong-traditional", "香港繁体转换"],
        ["file-text-converter", "文件简繁转换"]
      ]],
      ["中文汉字", [
        ["chinese-handwriting-recognition", "手写汉字识别"],
        ["photo-chinese-character-recognition", "拍照识字"],
        ["chinese-to-pinyin", "汉字转拼音"],
        ["chinese-stroke-order", "汉字笔顺查询"],
        ["chinese-character-lookup", "汉字查询与结构拆解"],
        ["han-character-worksheet", "田字格字帖生成器"]
      ]],
      ["日文汉字", [
        ["japanese-handwriting-recognition", "日文手写汉字识别"],
        ["japanese-kanji-dictionary", "日本汉字查询"],
        ["japanese-stroke-order", "日本汉字笔顺"],
        ["kanji-to-hiragana", "日文汉字转平假名"],
        ["kanji-to-romaji", "日文汉字转罗马字"],
        ["japanese-kanji-converter", "日文新旧字体转换"],
        ["japanese-chinese-kanji-converter", "日中汉字转换"],
        ["japanese-characters", "日文字符复制"]
      ]],
      ["韩文与韩国汉字", [
        ["korean-handwriting-recognition", "韩语手写识别"],
        ["korean-hanja-dictionary", "韩国汉字查询"],
        ["korean-hanja-handwriting-recognition", "韩国汉字手写识别"],
        ["hangul-hanja-converter", "韩文汉字转换"],
        ["korean-name-hanja", "韩国人名用汉字"]
      ]],
      ["文本工具", [
        ["character-counter", "在线字数统计"],
        ["word-to-txt", "Word 转 TXT"],
        ["text-formatter", "文本格式化"],
        ["image-redaction", "图片打码"],
        ["password-generator", "密码生成器"]
      ]]
    ]
  },
  "zh-TW": {
    prefix: "zh-tw/",
    label: "全部工具",
    homeHeading: "更多漢字工具",
    groups: [
      ["簡繁轉換", [
        ["", "簡繁轉換"],
        ["simplified-to-traditional", "簡體轉繁體"],
        ["traditional-to-simplified", "繁體轉簡體"],
        ["taiwan-traditional", "台灣繁體轉換"],
        ["hong-kong-traditional", "香港繁體轉換"],
        ["file-text-converter", "檔案簡繁轉換"]
      ]],
      ["中文漢字", [
        ["chinese-handwriting-recognition", "手寫漢字辨識"],
        ["photo-chinese-character-recognition", "拍照漢字辨識"],
        ["chinese-to-pinyin", "漢字轉拼音"],
        ["chinese-stroke-order", "漢字筆順查詢"],
        ["chinese-character-lookup", "漢字查詢與結構拆解"],
        ["han-character-worksheet", "國字練習紙"]
      ]],
      ["日文漢字", [
        ["japanese-handwriting-recognition", "日文手寫漢字辨識"],
        ["japanese-kanji-dictionary", "日本漢字查詢"],
        ["japanese-stroke-order", "日本漢字筆順"],
        ["kanji-to-hiragana", "日文漢字轉平假名"],
        ["kanji-to-romaji", "日文漢字轉羅馬字"],
        ["japanese-kanji-converter", "日文新舊字體轉換"],
        ["japanese-chinese-kanji-converter", "日中漢字轉換"],
        ["japanese-characters", "日文字元複製"]
      ]],
      ["韓文與韓國漢字", [
        ["korean-handwriting-recognition", "韓文手寫辨識"],
        ["korean-hanja-dictionary", "韓國漢字查詢"],
        ["korean-hanja-handwriting-recognition", "韓國漢字手寫辨識"],
        ["hangul-hanja-converter", "韓文漢字轉換"],
        ["korean-name-hanja", "韓國人名用漢字"]
      ]],
      ["文字工具", [
        ["character-counter", "線上字數統計"],
        ["word-to-txt", "DOCX 轉 TXT"],
        ["text-formatter", "文字格式化"],
        ["image-redaction", "圖片馬賽克"],
        ["password-generator", "密碼產生器"]
      ]]
    ]
  },
  en: {
    prefix: "en/",
    label: "All tools",
    homeHeading: "More Chinese, Japanese and Korean character tools",
    groups: [
      ["Chinese converter", [
        ["", "Simplified and Traditional Chinese converter"],
        ["simplified-to-traditional", "Simplified to Traditional"],
        ["traditional-to-simplified", "Traditional to Simplified"],
        ["taiwan-traditional", "Taiwan Traditional converter"],
        ["hong-kong-traditional", "Hong Kong Traditional converter"],
        ["file-text-converter", "Chinese document converter"]
      ]],
      ["Chinese characters", [
        ["chinese-handwriting-recognition", "Chinese handwriting recognition"],
        ["photo-chinese-character-recognition", "Chinese OCR"],
        ["chinese-to-pinyin", "Chinese to Pinyin"],
        ["chinese-stroke-order", "Chinese stroke order"],
        ["chinese-character-lookup", "Chinese character lookup"],
        ["han-character-worksheet", "Chinese practice sheets"]
      ]],
      ["Japanese kanji", [
        ["japanese-handwriting-recognition", "Japanese kanji handwriting lookup"],
        ["japanese-kanji-dictionary", "Japanese kanji dictionary"],
        ["japanese-stroke-order", "Kanji stroke order"],
        ["kanji-to-hiragana", "Kanji to Hiragana"],
        ["kanji-to-romaji", "Kanji to Romaji"],
        ["japanese-kanji-converter", "Shinjitai Kyujitai converter"],
        ["japanese-chinese-kanji-converter", "Chinese to Japanese kanji"],
        ["japanese-characters", "Japanese character copy"]
      ]],
      ["Korean", [
        ["korean-handwriting-recognition", "Korean handwriting input"],
        ["korean-hanja-dictionary", "Korean Hanja dictionary"],
        ["korean-hanja-handwriting-recognition", "Korean Hanja handwriting"],
        ["hangul-hanja-converter", "Hangul Hanja converter"],
        ["korean-name-hanja", "Korean name Hanja"]
      ]],
      ["Text tools", [
        ["character-counter", "Chinese character counter"],
        ["word-to-txt", "Word to text"],
        ["text-formatter", "Text formatter"],
        ["image-redaction", "Image redaction"],
        ["password-generator", "Password generator"]
      ]]
    ]
  },
  ja: {
    prefix: "ja/",
    label: "ツール一覧",
    homeHeading: "そのほかの漢字ツール",
    groups: [
      ["簡体字・繁体字", [
        ["", "簡体字 繁体字 変換"],
        ["simplified-to-traditional", "簡体字から繁体字"],
        ["traditional-to-simplified", "繁体字から簡体字"],
        ["taiwan-traditional", "台湾繁体字変換"],
        ["hong-kong-traditional", "香港繁体字変換"],
        ["file-text-converter", "Word・PDF の簡繁変換"]
      ]],
      ["日本語の漢字", [
        ["japanese-handwriting-recognition", "手書き漢字検索"],
        ["japanese-kanji-dictionary", "漢字辞典"],
        ["japanese-stroke-order", "漢字の書き順"],
        ["kanji-to-hiragana", "漢字をひらがなに変換"],
        ["kanji-to-romaji", "漢字をローマ字に変換"],
        ["japanese-kanji-converter", "旧字体 新字体 変換"],
        ["japanese-chinese-kanji-converter", "日中漢字変換"],
        ["japanese-characters", "日本語文字コピー"],
        ["han-character-worksheet", "漢字練習プリント"]
      ]],
      ["中国語の漢字", [
        ["chinese-handwriting-recognition", "中国語の手書き検索"],
        ["photo-chinese-character-recognition", "中国語OCR"],
        ["chinese-to-pinyin", "ピンイン変換"],
        ["chinese-stroke-order", "中国語漢字の筆順"],
        ["chinese-character-lookup", "漢字の構成・部首検索"]
      ]],
      ["韓国語・韓国漢字", [
        ["korean-handwriting-recognition", "韓国語 手書き入力"],
        ["korean-hanja-dictionary", "韓国漢字検索"],
        ["korean-hanja-handwriting-recognition", "韓国漢字の手書き検索"],
        ["hangul-hanja-converter", "ハングル・漢字変換"],
        ["korean-name-hanja", "韓国の人名用漢字"]
      ]],
      ["テキストツール", [
        ["character-counter", "文字数カウント"],
        ["word-to-txt", "Word TXT 変換"],
        ["text-formatter", "テキスト整形"],
        ["image-redaction", "画像モザイク"],
        ["password-generator", "パスワード生成"]
      ]]
    ]
  },
  ko: {
    prefix: "ko/",
    label: "전체 도구",
    homeHeading: "다른 한자 도구",
    groups: [
      ["간체·번체 변환", [
        ["", "간체 번체 변환기"],
        ["simplified-to-traditional", "간체를 번체로"],
        ["traditional-to-simplified", "번체를 간체로"],
        ["taiwan-traditional", "대만 번체 변환"],
        ["hong-kong-traditional", "홍콩 번체 변환"],
        ["file-text-converter", "문서 간체 번체 변환"]
      ]],
      ["한글·한자", [
        ["korean-handwriting-recognition", "한글 필기 인식"],
        ["korean-hanja-dictionary", "한자 찾기·옥편"],
        ["korean-hanja-handwriting-recognition", "한자 필기인식"],
        ["hangul-hanja-converter", "한자 변환기"],
        ["korean-name-hanja", "인명용 한자"]
      ]],
      ["중국어 한자", [
        ["chinese-handwriting-recognition", "중국어 한자 필기 인식"],
        ["photo-chinese-character-recognition", "중국어 이미지 OCR"],
        ["chinese-to-pinyin", "중국어 병음 변환"],
        ["chinese-stroke-order", "중국어 한자 필순"],
        ["chinese-character-lookup", "한자 부수·구성요소 검색"],
        ["han-character-worksheet", "한자 쓰기 연습장"]
      ]],
      ["일본 한자", [
        ["japanese-handwriting-recognition", "일본 한자 손글씨 인식"],
        ["japanese-kanji-dictionary", "일본 한자 검색"],
        ["japanese-stroke-order", "일본 한자 필순"],
        ["kanji-to-hiragana", "일본어 한자 히라가나 변환"],
        ["kanji-to-romaji", "일본어 한자 로마자 변환"],
        ["japanese-kanji-converter", "일본 신자체 구자체 변환"],
        ["japanese-chinese-kanji-converter", "일본·중국 한자 변환"],
        ["japanese-characters", "일본어 문자 복사"]
      ]],
      ["텍스트 도구", [
        ["character-counter", "글자수 세기"],
        ["word-to-txt", "DOCX TXT 변환"],
        ["text-formatter", "텍스트 정리기"],
        ["image-redaction", "사진 모자이크"],
        ["password-generator", "비밀번호 생성기"]
      ]]
    ]
  }
};
