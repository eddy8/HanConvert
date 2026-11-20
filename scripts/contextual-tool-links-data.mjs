// In-copy links from one tool page to another, written by scripts/sync-site-tool-directory.mjs.
// Each rule is [page, sentence fragment, words to link, target slug in the same locale]. The fragment
// must appear in the page's <main> copy; its first occurrence is linked, once per page.
// Only link a fragment that actually sends the reader to another tool ("search it in X", "paste it
// into X"), not every occurrence of a common word such as 笔顺 or Pinyin.
export const contextualToolLinks = [
  // Simplified Chinese
  ["chinese-handwriting-recognition", "可用“汉字查询与结构拆解”按偏旁部件反查", "汉字查询与结构拆解", "chinese-character-lookup"],
  ["chinese-handwriting-recognition", "用“在线拍照汉字识别”", "在线拍照汉字识别", "photo-chinese-character-recognition"],
  ["chinese-handwriting-recognition", "或进入笔顺页面继续查询", "笔顺页面", "chinese-stroke-order"],
  ["chinese-character-lookup", "查询后可直接打开动态笔顺、汉字拼音、手写识别或田字格字帖", "动态笔顺", "chinese-stroke-order"],
  ["chinese-character-lookup", "查询后可直接打开动态笔顺、汉字拼音、手写识别或田字格字帖", "汉字拼音", "chinese-to-pinyin"],
  ["chinese-character-lookup", "查询后可直接打开动态笔顺、汉字拼音、手写识别或田字格字帖", "手写识别", "chinese-handwriting-recognition"],
  ["chinese-character-lookup", "查询后可直接打开动态笔顺、汉字拼音、手写识别或田字格字帖", "田字格字帖", "han-character-worksheet"],
  ["photo-chinese-character-recognition", "粘贴到繁体转简体工具", "繁体转简体工具", "traditional-to-simplified"],
  ["photo-chinese-character-recognition", "也可以改用手写识字", "手写识字", "chinese-handwriting-recognition"],
  ["japanese-handwriting-recognition", "“日本汉字字典”", "日本汉字字典", "japanese-kanji-dictionary"],
  ["japanese-handwriting-recognition", "“汉字查询与结构拆解”", "汉字查询与结构拆解", "chinese-character-lookup"],
  ["japanese-handwriting-recognition", "“汉字转平假名与振假名”", "汉字转平假名与振假名", "kanji-to-hiragana"],
  ["korean-hanja-dictionary", "“韩国汉字手写查字”", "韩国汉字手写查字", "korean-hanja-handwriting-recognition"],

  // Traditional Chinese
  ["zh-tw/chinese-handwriting-recognition", "可用「漢字查詢與結構拆解」依偏旁部件反查", "漢字查詢與結構拆解", "chinese-character-lookup"],
  ["zh-tw/chinese-handwriting-recognition", "用「線上拍照漢字辨識」", "線上拍照漢字辨識", "photo-chinese-character-recognition"],
  ["zh-tw/chinese-character-lookup", "或繼續前往筆順、拼音與練習紙", "筆順", "chinese-stroke-order"],
  ["zh-tw/chinese-character-lookup", "或繼續前往筆順、拼音與練習紙", "拼音", "chinese-to-pinyin"],
  ["zh-tw/chinese-character-lookup", "或繼續前往筆順、拼音與練習紙", "練習紙", "han-character-worksheet"],
  ["zh-tw/photo-chinese-character-recognition", "貼到簡體轉繁體工具", "簡體轉繁體工具", "simplified-to-traditional"],
  ["zh-tw/photo-chinese-character-recognition", "也可以改用手寫辨識", "手寫辨識", "chinese-handwriting-recognition"],
  ["zh-tw/japanese-handwriting-recognition", "「日本漢字字典」", "日本漢字字典", "japanese-kanji-dictionary"],
  ["zh-tw/japanese-handwriting-recognition", "「漢字查詢與結構拆解」", "漢字查詢與結構拆解", "chinese-character-lookup"],
  ["zh-tw/japanese-handwriting-recognition", "「漢字轉平假名與振假名」", "漢字轉平假名與振假名", "kanji-to-hiragana"],
  ["zh-tw/korean-hanja-dictionary", "「韓國漢字手寫查字」", "韓國漢字手寫查字", "korean-hanja-handwriting-recognition"],

  // English
  ["en/chinese-handwriting-recognition", "search by its components in Chinese character lookup", "Chinese character lookup", "chinese-character-lookup"],
  ["en/photo-chinese-character-recognition", "paste it into the Traditional to Simplified converter", "Traditional to Simplified converter", "traditional-to-simplified"],
  ["en/photo-chinese-character-recognition", "or draw it in the handwriting tool", "handwriting tool", "chinese-handwriting-recognition"],
  ["en/japanese-handwriting-recognition", "search the Japanese Kanji dictionary (over 13,000", "Japanese Kanji dictionary", "japanese-kanji-dictionary"],
  ["en/japanese-handwriting-recognition", "find the character by its parts in Chinese character lookup", "Chinese character lookup", "chinese-character-lookup"],
  ["en/japanese-handwriting-recognition", "paste the text into Kanji to Hiragana & Furigana", "Kanji to Hiragana & Furigana", "kanji-to-hiragana"],

  // Japanese
  ["ja/chinese-handwriting-recognition", "「写真から中国語漢字を認識」", "写真から中国語漢字を認識", "photo-chinese-character-recognition"],
  ["ja/chinese-handwriting-recognition", "「漢字の構成・部首検索」", "漢字の構成・部首検索", "chinese-character-lookup"],
  ["ja/japanese-handwriting-recognition", "「漢字辞典で調べる」を開けば", "漢字辞典", "japanese-kanji-dictionary"],
  ["ja/japanese-handwriting-recognition", "「漢字の構成・部首検索」", "漢字の構成・部首検索", "chinese-character-lookup"],
  ["ja/japanese-handwriting-recognition", "「漢字をひらがな・ふりがなに変換」", "漢字をひらがな・ふりがなに変換", "kanji-to-hiragana"],
  ["ja/photo-chinese-character-recognition", "手書き検索を使ってください", "手書き検索", "chinese-handwriting-recognition"],
  ["ja/korean-hanja-dictionary", "「韓国漢字の手書き検索」", "韓国漢字の手書き検索", "korean-hanja-handwriting-recognition"],

  // Korean
  ["ko/chinese-handwriting-recognition", "‘사진으로 중국 한자 인식’", "사진으로 중국 한자 인식", "photo-chinese-character-recognition"],
  ["ko/chinese-handwriting-recognition", "‘한자 부수·구성요소 검색’", "한자 부수·구성요소 검색", "chinese-character-lookup"],
  ["ko/chinese-character-lookup", "후보를 선택해 읽기, 필순, 병음과 쓰기 연습 도구를 이용합니다", "필순", "chinese-stroke-order"],
  ["ko/chinese-character-lookup", "후보를 선택해 읽기, 필순, 병음과 쓰기 연습 도구를 이용합니다", "병음", "chinese-to-pinyin"],
  ["ko/chinese-character-lookup", "후보를 선택해 읽기, 필순, 병음과 쓰기 연습 도구를 이용합니다", "쓰기 연습 도구", "han-character-worksheet"],
  ["ko/japanese-handwriting-recognition", "‘일본 한자 사전’을 열면", "일본 한자 사전", "japanese-kanji-dictionary"],
  ["ko/japanese-handwriting-recognition", "‘한자 부수·구성요소 검색’", "한자 부수·구성요소 검색", "chinese-character-lookup"],
  ["ko/japanese-handwriting-recognition", "‘한자를 히라가나·후리가나로’", "한자를 히라가나·후리가나로", "kanji-to-hiragana"],
  ["ko/korean-hanja-dictionary", "‘한자 필기인식’", "한자 필기인식", "korean-hanja-handwriting-recognition"],
  ["ko/korean-hanja-dictionary", "대법원이 공개한 인명용 한자", "인명용 한자", "korean-name-hanja"]
];
