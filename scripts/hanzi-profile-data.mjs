export const HANZI_LOCALES = Object.freeze({
  "zh-CN": Object.freeze({ prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文" }),
  "zh-TW": Object.freeze({ prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文" }),
  en: Object.freeze({ prefix: "en/", lang: "en", hreflang: "en", label: "English" }),
  ja: Object.freeze({ prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語" }),
  ko: Object.freeze({ prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어" })
});

export const HANZI_PROFILES = Object.freeze([
  Object.freeze({
    slug: "xue",
    forms: Object.freeze({ simplified: "学", traditional: "學", japanese: "学", korean: "學" }),
    japaneseReading: "音読み：ガク／訓読み：まなぶ",
    koreanReading: "학",
    localized: Object.freeze({
      "zh-CN": Object.freeze({
        meaning: "学习、学问，也用于学校、学科等词。",
        words: Object.freeze([
          Object.freeze(["学习", "xuéxí", "通过阅读、练习等获得知识或技能"]),
          Object.freeze(["学生", "xuésheng", "在学校学习的人"]),
          Object.freeze(["学校", "xuéxiào", "进行教育和学习的机构"])
        ])
      }),
      "zh-TW": Object.freeze({
        meaning: "學習、學問，也用於學校、學科等詞。",
        words: Object.freeze([
          Object.freeze(["學習", "xuéxí", "透過閱讀、練習等獲得知識或技能"]),
          Object.freeze(["學生", "xuésheng", "在學校學習的人"]),
          Object.freeze(["學校", "xuéxiào", "進行教育與學習的機構"])
        ])
      }),
      en: Object.freeze({
        meaning: "to study or learn; knowledge, school, or a field of study",
        words: Object.freeze([
          Object.freeze(["学习", "xuéxí", "to study or learn"]),
          Object.freeze(["学生", "xuésheng", "student"]),
          Object.freeze(["学校", "xuéxiào", "school"])
        ])
      }),
      ja: Object.freeze({
        meaning: "学ぶこと、学問、学校などを表す常用漢字。",
        words: Object.freeze([
          Object.freeze(["学ぶ", "まなぶ", "知識や技能を身につける"]),
          Object.freeze(["学生", "がくせい", "学校で学ぶ人"]),
          Object.freeze(["学校", "がっこう", "教育を行う施設"])
        ])
      }),
      ko: Object.freeze({
        meaning: "배우다, 학문 또는 학교를 뜻하는 한자.",
        words: Object.freeze([
          Object.freeze(["學生", "학생", "학교에서 배우는 사람"]),
          Object.freeze(["學校", "학교", "교육을 하는 기관"]),
          Object.freeze(["學問", "학문", "체계적으로 연구하는 지식"])
        ])
      })
    })
  }),
  Object.freeze({
    slug: "guo",
    forms: Object.freeze({ simplified: "国", traditional: "國", japanese: "国", korean: "國" }),
    japaneseReading: "音読み：コク／訓読み：くに",
    koreanReading: "국",
    localized: Object.freeze({
      "zh-CN": Object.freeze({
        meaning: "国家、国土，也用于表示国家或地区范围。",
        words: Object.freeze([
          Object.freeze(["国家", "guójiā", "拥有领土、人民和政权的政治共同体"]),
          Object.freeze(["中国", "Zhōngguó", "中华人民共和国的简称"]),
          Object.freeze(["国际", "guójì", "国家与国家之间的"])
        ])
      }),
      "zh-TW": Object.freeze({
        meaning: "國家、國土，也用於表示國家或地區範圍。",
        words: Object.freeze([
          Object.freeze(["國家", "guójiā", "具有領土、人民與政府的政治共同體"]),
          Object.freeze(["中國", "Zhōngguó", "中國的名稱或簡稱"]),
          Object.freeze(["國際", "guójì", "國家與國家之間的"])
        ])
      }),
      en: Object.freeze({
        meaning: "country, nation, state, or national territory",
        words: Object.freeze([
          Object.freeze(["国家", "guójiā", "country or nation"]),
          Object.freeze(["中国", "Zhōngguó", "China"]),
          Object.freeze(["国际", "guójì", "international"])
        ])
      }),
      ja: Object.freeze({
        meaning: "くに、国家、地域を表す常用漢字。",
        words: Object.freeze([
          Object.freeze(["国", "くに", "国家や土地"]),
          Object.freeze(["外国", "がいこく", "自国以外の国"]),
          Object.freeze(["全国", "ぜんこく", "国全体"])
        ])
      }),
      ko: Object.freeze({
        meaning: "나라, 국가 또는 국토를 뜻하는 한자.",
        words: Object.freeze([
          Object.freeze(["國家", "국가", "일정한 영토와 국민을 가진 공동체"]),
          Object.freeze(["韓國", "한국", "대한민국의 약칭"]),
          Object.freeze(["外國", "외국", "자기 나라가 아닌 다른 나라"])
        ])
      })
    })
  }),
  Object.freeze({
    slug: "ai",
    forms: Object.freeze({ simplified: "爱", traditional: "愛", japanese: "愛", korean: "愛" }),
    japaneseReading: "音読み：アイ／訓読み：いとしい・めでる",
    koreanReading: "애",
    localized: Object.freeze({
      "zh-CN": Object.freeze({
        meaning: "喜爱、爱护，也表示深厚的感情。",
        words: Object.freeze([
          Object.freeze(["爱情", "àiqíng", "人与人之间深厚而亲密的感情"]),
          Object.freeze(["爱好", "àihào", "对某种事物具有兴趣"]),
          Object.freeze(["可爱", "kě'ài", "令人喜爱"])
        ])
      }),
      "zh-TW": Object.freeze({
        meaning: "喜愛、愛護，也表示深厚的感情。",
        words: Object.freeze([
          Object.freeze(["愛情", "àiqíng", "人與人之間深厚而親密的感情"]),
          Object.freeze(["愛好", "àihào", "對某種事物具有興趣"]),
          Object.freeze(["可愛", "kě'ài", "令人喜愛"])
        ])
      }),
      en: Object.freeze({
        meaning: "love, affection, or to be fond of something",
        words: Object.freeze([
          Object.freeze(["爱情", "àiqíng", "love or romantic affection"]),
          Object.freeze(["爱好", "àihào", "hobby; to be fond of"]),
          Object.freeze(["可爱", "kě'ài", "cute or lovable"])
        ])
      }),
      ja: Object.freeze({
        meaning: "愛すること、いつくしむ気持ちを表す常用漢字。",
        words: Object.freeze([
          Object.freeze(["愛", "あい", "大切に思う気持ち"]),
          Object.freeze(["愛情", "あいじょう", "相手をいつくしむ感情"]),
          Object.freeze(["恋愛", "れんあい", "恋をすること"])
        ])
      }),
      ko: Object.freeze({
        meaning: "사랑, 애정 또는 아끼는 마음을 뜻하는 한자.",
        words: Object.freeze([
          Object.freeze(["愛情", "애정", "사랑하고 아끼는 마음"]),
          Object.freeze(["愛國", "애국", "자기 나라를 사랑함"]),
          Object.freeze(["愛好", "애호", "좋아하고 즐김"])
        ])
      })
    })
  }),
  Object.freeze({
    slug: "ren",
    forms: Object.freeze({ simplified: "人", traditional: "人", japanese: "人", korean: "人" }),
    japaneseReading: "音読み：ジン・ニン／訓読み：ひと",
    koreanReading: "인",
    localized: Object.freeze({
      "zh-CN": Object.freeze({
        meaning: "人类、他人，也可表示从事某种活动或属于某地的人。",
        words: Object.freeze([
          Object.freeze(["人民", "rénmín", "以劳动群众为主体的社会成员"]),
          Object.freeze(["人口", "rénkǒu", "一定地区内人的总数"]),
          Object.freeze(["人生", "rénshēng", "人的一生或生活经历"])
        ])
      }),
      "zh-TW": Object.freeze({
        meaning: "人類、他人，也可表示從事某種活動或屬於某地的人。",
        words: Object.freeze([
          Object.freeze(["人民", "rénmín", "構成社會的群眾成員"]),
          Object.freeze(["人口", "rénkǒu", "一定地區內人的總數"]),
          Object.freeze(["人生", "rénshēng", "人的一生或生活經歷"])
        ])
      }),
      en: Object.freeze({
        meaning: "person, people, humankind, or someone else",
        words: Object.freeze([
          Object.freeze(["人民", "rénmín", "the people"]),
          Object.freeze(["人口", "rénkǒu", "population"]),
          Object.freeze(["人生", "rénshēng", "human life"])
        ])
      }),
      ja: Object.freeze({
        meaning: "ひと、人間、人物を表す基本的な常用漢字。",
        words: Object.freeze([
          Object.freeze(["人", "ひと", "人間や人物"]),
          Object.freeze(["日本人", "にほんじん", "日本の国籍や文化に属する人"]),
          Object.freeze(["人生", "じんせい", "人が生きる一生"])
        ])
      }),
      ko: Object.freeze({
        meaning: "사람, 인간 또는 다른 사람을 뜻하는 기본 한자.",
        words: Object.freeze([
          Object.freeze(["人間", "인간", "사람 또는 인류"]),
          Object.freeze(["人口", "인구", "일정 지역에 사는 사람의 수"]),
          Object.freeze(["人生", "인생", "사람이 살아가는 일생"])
        ])
      })
    })
  }),
  Object.freeze({
    slug: "sun",
    forms: Object.freeze({ simplified: "孙", traditional: "孫", japanese: "孫", korean: "孫" }),
    japaneseReading: "音読み：ソン／訓読み：まご",
    koreanReading: "손",
    localized: Object.freeze({
      "zh-CN": Object.freeze({
        meaning: "子女的子女或后代，也用作姓氏。",
        words: Object.freeze([
          Object.freeze(["孙子", "sūnzi", "儿子的儿子，也可泛指孙辈男孩"]),
          Object.freeze(["孙女", "sūnnǚ", "儿子或女儿的女儿"]),
          Object.freeze(["子孙", "zǐsūn", "儿子和孙子，泛指后代"])
        ])
      }),
      "zh-TW": Object.freeze({
        meaning: "兒女的子女或後代，也可作為姓氏。",
        words: Object.freeze([
          Object.freeze(["孫子", "sūnzi", "兒子或女兒的兒子，也泛指孫輩男孩"]),
          Object.freeze(["孫女", "sūnnǚ", "兒子或女兒的女兒"]),
          Object.freeze(["子孫", "zǐsūn", "泛指後代子女"])
        ])
      }),
      en: Object.freeze({
        meaning: "grandchild, descendant, or the Chinese surname Sun",
        words: Object.freeze([
          Object.freeze(["孙子", "sūnzi", "grandson"]),
          Object.freeze(["孙女", "sūnnǚ", "granddaughter"]),
          Object.freeze(["子孙", "zǐsūn", "descendants"])
        ])
      }),
      ja: Object.freeze({
        meaning: "まご、子孫、血筋を受け継ぐ人を表す常用漢字。",
        words: Object.freeze([
          Object.freeze(["孫", "まご", "子どもの子ども"]),
          Object.freeze(["子孫", "しそん", "血筋を受け継ぐ後代"]),
          Object.freeze(["初孫", "はつまご", "初めて生まれた孫"])
        ])
      }),
      ko: Object.freeze({
        meaning: "손자, 후손 또는 성씨를 뜻하는 한자.",
        words: Object.freeze([
          Object.freeze(["子孫", "자손", "대를 이어 내려오는 후손"]),
          Object.freeze(["孫子", "손자", "아들의 아들 또는 남자 손주"]),
          Object.freeze(["外孫", "외손", "딸이 낳은 자녀"])
        ])
      })
    })
  })
]);

export const HANZI_UI = Object.freeze({
  "zh-CN": Object.freeze({
    skip: "跳到主要内容", header: "网站页眉", nav: "主要导航", home: "网站首页", dictionary: "汉字字典", language: "界面语言",
    about: "关于我们", contact: "联系我们", privacy: "隐私声明", footer: "页脚",
    footerText: "JianFan.app 提供汉字查询、拼音、笔顺、结构拆解、练习纸和中文转换工具。",
    hubTitle: "常用汉字查询：拼音、部首、笔画与笔顺 | JianFan",
    hubDescription: "常用汉字字典，集中查询汉字拼音、部首、笔画、结构、简繁异体和常见词语。选择具体汉字可继续查看动态笔顺、日语读音、韩国汉字音，并生成田字格练习字帖。",
    hubKicker: "常用汉字资料库", hubHeading: "常用汉字拼音、部首与笔画查询", hubIntro: "选择汉字即可查看读音、含义、部首、笔画、结构、简繁字形和常见词语，并继续使用笔顺与练字工具。",
    searchTitle: "查询其他汉字", searchLabel: "输入一个汉字", searchPlaceholder: "例如：明", searchSubmit: "查询汉字",
    listTitle: "常用汉字精选", listIntro: "从常见汉字开始，快速比较简体、繁体、日本汉字与韩国汉字音，并查看读音、结构和常用词语。",
    hubInfoTitle: "一页连接读音、字形和书写练习", hubInfo: "每个单字页都直接呈现静态字典资料，并连接动态笔顺、拼音查询、结构拆解和田字格练习纸。简体、繁体、日本汉字与韩国汉字音会并列展示，便于学习和校对。",
    hubFaqTitle: "汉字查询常见问题",
    hubFaqs: Object.freeze([
      Object.freeze(["这里可以查询哪些汉字资料？", "目前可查看汉字拼音、含义、部首、总笔画、字形结构、简繁异体、日语读音、韩国汉字音和常见词语。"]),
      Object.freeze(["列表中没有要查的汉字怎么办？", "在页面上方输入任意汉字，即可打开完整汉字查询，查看拼音、部首、笔画、结构和简繁异体。"]),
      Object.freeze(["简体字、繁体字和日本汉字总是相同吗？", "不一定。例如“学、學”和“国、國”在不同地区采用不同字形，具体页面会并列显示常用形式。"])
    ]),
    profileTitle: "{character}字拼音、部首、笔画、结构与笔顺 | JianFan",
    profileDescription: "查询“{character}”字怎么读，查看拼音 {pinyin}、部首、{strokes}画笔顺、结构拆解、简繁异体、常见词语，以及日语读音和韩国汉字音；可继续打开动态笔顺、拼音查询和田字格字帖。",
    profileKicker: "汉字单字查询", profileHeading: "“{character}”字怎么读？", profileIntro: "“{character}”读作 {reading}，{meaning}", quickTitle: "“{character}”字基本资料",
    labels: Object.freeze({ reading: "拼音", meaning: "含义", radical: "部首", strokes: "总笔画", structure: "结构", formation: "构字类型", unicode: "Unicode", variants: "简繁字形", cantonese: "粤语拼音", japanese: "日语读音", korean: "韩国汉字音" }),
    actions: Object.freeze({ stroke: "查看动态笔顺", pinyin: "查询完整拼音", worksheet: "生成田字格字帖", lookup: "打开结构拆解" }),
    formsTitle: "“{character}”在不同地区的字形和读音", formsIntro: "下表用于对照常见字形与读音，不表示不同语言中的全部词义和用法都相同。",
    formHeaders: Object.freeze(["使用范围", "字形", "读音"]),
    formLabels: Object.freeze({ simplified: "中国大陆简体", traditional: "繁体中文", japanese: "日本汉字", korean: "韩国汉字" }),
    wordsTitle: "含“{character}”的常见词语", wordsIntro: "单字在词语中的读音和含义可能受语境影响，下面列出三个常见用法。",
    wordHeaders: Object.freeze(["词语", "读音", "含义"]),
    structureTitle: "“{character}”的部首与结构", structureText: "“{character}”的部首是“{radical}”，共 {strokes} 画，属于{structure}。字形数据的 IDS 表示为 {ids}，可辨认的组成部件包括 {components}。",
    practiceTitle: "继续查询或练习“{character}”", practiceText: "打开对应工具可播放笔顺、检查拼音、查看彩色结构树，或生成可打印的练习纸。",
    faqTitle: "“{character}”字常见问题", relatedTitle: "继续查看其他常用汉字", sourceTitle: "资料来源",
    sourceText: "部首、笔画、读音与异体信息参考 Unicode Unihan，结构数据来自 Make Me a Hanzi。不同地区的字形、笔顺和词义可能存在差异，正式使用时请结合当地规范核对。",
    directoryLinkTitle: "常用汉字资料页", directoryLinkIntro: "从单字页面直接查看拼音、部首、笔画、结构、简繁字形和常见词语。",
    structureNames: Object.freeze({ leftRight: "左右结构", topBottom: "上下结构", leftMiddleRight: "左中右结构", topMiddleBottom: "上中下结构", enclosure: "包围结构", overlaid: "叠加结构", single: "独体或其他结构" }),
    formationNames: Object.freeze({ ideographic: "会意字", pictographic: "象形字", pictophonetic: "形声字", unknown: "其他" })
  }),
  "zh-TW": Object.freeze({
    skip: "跳到主要內容", header: "網站頁首", nav: "主要導覽", home: "網站首頁", dictionary: "國字字典", language: "介面語言",
    about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", footer: "頁尾",
    footerText: "JianFan.app 提供國字查詢、漢語拼音、筆順、結構拆解、練習紙與中文轉換工具。",
    hubTitle: "常用國字查詢：拼音、部首、筆畫與筆順 | JianFan",
    hubDescription: "常用國字字典，集中查詢漢語拼音、部首、筆畫、結構、簡繁異體與常用詞語。選擇國字可繼續查看動態筆順、日語讀音、韓國漢字音，並製作練習紙。",
    hubKicker: "常用國字資料庫", hubHeading: "常用國字拼音、部首與筆畫查詢", hubIntro: "選擇國字即可查看讀音、含義、部首、筆畫、結構、簡繁字形與常用詞語，並繼續使用筆順和練字工具。",
    searchTitle: "查詢其他國字", searchLabel: "輸入一個國字", searchPlaceholder: "例如：明", searchSubmit: "查詢國字",
    listTitle: "常用國字精選", listIntro: "從常見國字開始，快速比較簡體、繁體、日本漢字與韓國漢字音，並查看讀音、結構及常用詞語。",
    hubInfoTitle: "一頁連結讀音、字形與書寫練習", hubInfo: "每個單字頁都直接呈現靜態字典資料，並連結動態筆順、拼音查詢、結構拆解與國字練習紙。簡體、繁體、日本漢字及韓國漢字音會並列顯示，方便學習與校對。",
    hubFaqTitle: "國字查詢常見問題",
    hubFaqs: Object.freeze([
      Object.freeze(["這裡可以查詢哪些國字資料？", "目前可查看漢語拼音、含義、部首、總筆畫、字形結構、簡繁異體、日語讀音、韓國漢字音與常用詞語。"]),
      Object.freeze(["列表中沒有要查的國字怎麼辦？", "在頁面上方輸入任意國字，即可開啟完整漢字查詢，查看漢語拼音、部首、筆畫、結構與簡繁異體。"]),
      Object.freeze(["簡體字、繁體字和日本漢字總是相同嗎？", "不一定。例如「学、學」與「国、國」在不同地區採用不同字形，單字頁會並列顯示常用形式。"])
    ]),
    profileTitle: "{character}字拼音、部首、筆畫、結構與筆順 | JianFan",
    profileDescription: "查詢「{character}」字怎麼讀，查看漢語拼音 {pinyin}、部首、{strokes}畫筆順、結構拆解、簡繁異體、常用詞語，以及日語讀音和韓國漢字音；還可開啟動態筆順、拼音查詢與國字練習紙。",
    profileKicker: "國字單字查詢", profileHeading: "「{character}」字怎麼讀？", profileIntro: "「{character}」讀作 {reading}，{meaning}", quickTitle: "「{character}」字基本資料",
    labels: Object.freeze({ reading: "漢語拼音", meaning: "含義", radical: "部首", strokes: "總筆畫", structure: "結構", formation: "構字類型", unicode: "Unicode", variants: "簡繁字形", cantonese: "粵語拼音", japanese: "日語讀音", korean: "韓國漢字音" }),
    actions: Object.freeze({ stroke: "查看動態筆順", pinyin: "查詢完整拼音", worksheet: "製作國字練習紙", lookup: "開啟結構拆解" }),
    formsTitle: "「{character}」在不同地區的字形與讀音", formsIntro: "下表用於對照常用字形及讀音，不表示不同語言中的所有詞義和用法完全相同。",
    formHeaders: Object.freeze(["使用範圍", "字形", "讀音"]),
    formLabels: Object.freeze({ simplified: "中國大陸簡體", traditional: "繁體中文", japanese: "日本漢字", korean: "韓國漢字" }),
    wordsTitle: "含「{character}」的常用詞語", wordsIntro: "單字在詞語中的讀音與含義可能受語境影響，以下列出三個常見用法。",
    wordHeaders: Object.freeze(["詞語", "讀音", "含義"]),
    structureTitle: "「{character}」的部首與結構", structureText: "「{character}」的部首是「{radical}」，共 {strokes} 畫，屬於{structure}。字形資料的 IDS 表示為 {ids}，可辨認的組成部件包括 {components}。",
    practiceTitle: "繼續查詢或練習「{character}」", practiceText: "開啟對應工具即可播放筆順、檢查拼音、查看彩色結構樹，或製作可列印的練習紙。",
    faqTitle: "「{character}」字常見問題", relatedTitle: "繼續查看其他常用國字", sourceTitle: "資料來源",
    sourceText: "部首、筆畫、讀音與異體資訊參考 Unicode Unihan，結構資料來自 Make Me a Hanzi。不同地區的字形、筆順及詞義可能有差異，正式使用時請依當地規範核對。",
    directoryLinkTitle: "常用國字資料頁", directoryLinkIntro: "從單字頁面直接查看漢語拼音、部首、筆畫、結構、簡繁字形與常用詞語。",
    structureNames: Object.freeze({ leftRight: "左右結構", topBottom: "上下結構", leftMiddleRight: "左中右結構", topMiddleBottom: "上中下結構", enclosure: "包圍結構", overlaid: "重疊結構", single: "獨體或其他結構" }),
    formationNames: Object.freeze({ ideographic: "會意字", pictographic: "象形字", pictophonetic: "形聲字", unknown: "其他" })
  }),
  en: Object.freeze({
    skip: "Skip to main content", header: "Site header", nav: "Primary navigation", home: "Home", dictionary: "Hanzi dictionary", language: "Language",
    about: "About", contact: "Contact", privacy: "Privacy Statement", footer: "Footer",
    footerText: "JianFan.app provides Chinese character lookup, Pinyin, stroke order, decomposition, worksheets and text conversion tools.",
    hubTitle: "Chinese Character Dictionary: Pinyin, Radicals, Strokes | JianFan",
    hubDescription: "Browse common Chinese characters by Pinyin, meaning, radical, strokes and structure. Compare variants, readings, stroke order and printable practice sheets.",
    hubKicker: "COMMON HANZI DIRECTORY", hubHeading: "Chinese character dictionary with Pinyin and radicals", hubIntro: "Choose a Hanzi to see its Mandarin reading, meaning, radical, strokes, structure, regional forms, useful words and direct learning tools.",
    searchTitle: "Look up another Chinese character", searchLabel: "Chinese character", searchPlaceholder: "For example: 明", searchSubmit: "Look up character",
    listTitle: "Featured common Chinese characters", listIntro: "Start with familiar Hanzi and compare Simplified, Traditional, Japanese and Korean forms while checking pronunciation, structure and useful words.",
    hubInfoTitle: "Connect pronunciation, character form and writing practice", hubInfo: "Every entry includes static dictionary facts and direct links to animated stroke order, Pinyin, component decomposition and printable worksheets. Simplified, Traditional, Japanese and Korean forms are compared where relevant.",
    hubFaqTitle: "Chinese character lookup questions",
    hubFaqs: Object.freeze([
      Object.freeze(["What information does each Chinese character page include?", "Entries include Pinyin, meaning, radical, stroke count, structure, regional forms, Japanese readings, Korean Hanja and common words."]),
      Object.freeze(["Can I look up a character that is not listed?", "Yes. Enter any Hanzi in the search field above to open the full lookup with Pinyin, radicals, strokes, decomposition and regional variants."]),
      Object.freeze(["Are Simplified, Traditional and Japanese forms always the same?", "No. Characters such as 学 and 學 or 国 and 國 use different common forms by region. Each entry compares the relevant shapes."])
    ]),
    profileTitle: "{character} Chinese Character: Pinyin, Meaning and Strokes | JianFan.app",
    profileDescription: "Look up {character} ({pinyin}): meaning, radical, {strokes} strokes, structure, Simplified and Traditional forms, Japanese readings, Korean Hanja, stroke order and worksheets.",
    profileKicker: "CHINESE CHARACTER LOOKUP", profileHeading: "What does {character} mean?", profileIntro: "{character} is pronounced {reading} in Mandarin and means {meaning}.", quickTitle: "Quick facts for {character}",
    labels: Object.freeze({ reading: "Pinyin", meaning: "Meaning", radical: "Radical", strokes: "Stroke count", structure: "Structure", formation: "Formation", unicode: "Unicode", variants: "Regional forms", cantonese: "Cantonese", japanese: "Japanese readings", korean: "Korean Hanja" }),
    actions: Object.freeze({ stroke: "View animated stroke order", pinyin: "Check full Pinyin", worksheet: "Make a practice sheet", lookup: "Open decomposition" }),
    formsTitle: "Forms and readings of {character} by region", formsIntro: "The table compares common glyphs and readings. It does not imply that every language uses the character with exactly the same meaning or frequency.",
    formHeaders: Object.freeze(["Usage", "Form", "Reading"]),
    formLabels: Object.freeze({ simplified: "Simplified Chinese", traditional: "Traditional Chinese", japanese: "Japanese Kanji", korean: "Korean Hanja" }),
    wordsTitle: "Common words containing {character}", wordsIntro: "A character's reading and meaning can change with context. These are three useful examples.",
    wordHeaders: Object.freeze(["Word", "Reading", "Meaning"]),
    structureTitle: "Radical and structure of {character}", structureText: "{character} uses the {radical} radical, has {strokes} strokes and a {structure}. Its IDS representation is {ids}; visible components include {components}.",
    practiceTitle: "Continue studying {character}", practiceText: "Open the matching tool to animate its strokes, check Mandarin pronunciation, inspect the component tree or make a printable writing worksheet.",
    faqTitle: "Questions about the character {character}", relatedTitle: "Browse more common Chinese characters", sourceTitle: "Data sources",
    sourceText: "Radicals, strokes, readings and variants use Unicode Unihan; decomposition data comes from Make Me a Hanzi. Regional glyph, stroke-order and usage conventions may differ, so verify formal work against the relevant local standard.",
    directoryLinkTitle: "Common Chinese character entries", directoryLinkIntro: "Open static character pages with Pinyin, meanings, radicals, strokes, structures, regional forms and common words.",
    structureNames: Object.freeze({ leftRight: "left-right structure", topBottom: "top-bottom structure", leftMiddleRight: "left-middle-right structure", topMiddleBottom: "top-middle-bottom structure", enclosure: "enclosure structure", overlaid: "overlaid structure", single: "single or other structure" }),
    formationNames: Object.freeze({ ideographic: "ideographic compound", pictographic: "pictograph", pictophonetic: "phono-semantic compound", unknown: "other formation" })
  }),
  ja: Object.freeze({
    skip: "メインコンテンツへ移動", header: "サイトヘッダー", nav: "メインナビゲーション", home: "ホーム", dictionary: "漢字検索", language: "表示言語",
    about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", footer: "フッター",
    footerText: "JianFan.app は漢字検索、読み方、筆順、構成分解、練習プリント、中国語変換ツールを提供します。",
    hubTitle: "常用漢字検索・読み方・部首・画数 | JianFan",
    hubDescription: "常用漢字の読み方、意味、部首、画数、字形構成を一覧から検索。中国語ピンイン、簡体字・繁体字、韓国漢字音、関連語を確認し、筆順や漢字練習プリントも利用できます。",
    hubKicker: "常用漢字データ", hubHeading: "常用漢字の読み方・意味・部首検索", hubIntro: "漢字を選ぶと、日本語の読み方と意味、部首、画数、構成、中国語の字形・ピンイン、韓国漢字音、関連語を確認できます。",
    searchTitle: "ほかの漢字を検索", searchLabel: "漢字を入力", searchPlaceholder: "例：明", searchSubmit: "漢字を検索",
    listTitle: "よく使う漢字", listIntro: "身近な漢字から、日本の字形、中国語の簡体字・繁体字、韓国漢字音を比べ、読み方、構成、関連語を確認できます。",
    hubInfoTitle: "読み方・字形・書き取り練習を一つの入口から", hubInfo: "各ページに静的な漢字データを掲載し、日本の筆順、部品構成、中国語ピンイン、印刷できる漢字練習プリントへ直接移動できます。簡体字・繁体字・日本漢字・韓国漢字も比較できます。",
    hubFaqTitle: "漢字検索についてよくある質問",
    hubFaqs: Object.freeze([
      Object.freeze(["各漢字ページでは何を確認できますか？", "読み方、意味、部首、画数、構成、簡体字・繁体字、中国語ピンイン、韓国漢字音、関連語を確認できます。"]),
      Object.freeze(["一覧にない漢字も検索できますか？", "はい。ページ上部の入力欄に漢字を入れると、ピンイン、部首、画数、構成、地域別字形を確認できる検索ページが開きます。"]),
      Object.freeze(["簡体字・繁体字と日本の漢字は同じですか？", "常に同じではありません。学・學、国・國のように地域で一般的な字形が異なる漢字は、各ページで並べて示します。"])
    ]),
    profileTitle: "{character}の読み方・意味・部首・画数 | JianFan",
    profileDescription: "「{character}」の読み方、意味、部首、{strokes}画、構成、中国語ピンイン、簡体字・繁体字、韓国漢字音を確認。筆順、関連語、漢字練習プリントにも移動できます。",
    profileKicker: "漢字一字検索", profileHeading: "「{character}」の読み方と意味", profileIntro: "「{character}」は{reading}。{meaning}", quickTitle: "「{character}」の基本情報",
    labels: Object.freeze({ reading: "日本語の読み", meaning: "意味", radical: "部首", strokes: "画数", structure: "構成", formation: "成り立ち", unicode: "Unicode", variants: "地域別字形", cantonese: "広東語", japanese: "日本語の読み", korean: "韓国漢字音" }),
    actions: Object.freeze({ stroke: "日本の筆順を見る", pinyin: "中国語ピンインを確認", worksheet: "漢字練習プリントを作成", lookup: "字形構成を開く" }),
    formsTitle: "「{character}」の地域別字形と読み方", formsIntro: "一般的な字形と読み方の比較です。言語によって意味や使用頻度が同じとは限りません。",
    formHeaders: Object.freeze(["使用地域", "字形", "読み方"]),
    formLabels: Object.freeze({ simplified: "中国語・簡体字", traditional: "中国語・繁体字", japanese: "日本の漢字", korean: "韓国の漢字" }),
    wordsTitle: "「{character}」を使う言葉", wordsIntro: "漢字の読み方と意味は語によって変わることがあります。代表的な三つの用例です。",
    wordHeaders: Object.freeze(["言葉", "読み方", "意味"]),
    structureTitle: "「{character}」の部首と構成", structureText: "「{character}」の部首は「{radical}」、画数は {strokes} 画、構成は{structure}です。IDS は {ids} で、見分けられる主な部品は {components} です。",
    practiceTitle: "「{character}」の筆順と書き取りを練習", practiceText: "日本の学校字形による筆順を再生し、中国語ピンインや部品構成を確認したり、印刷できる漢字練習プリントを作成したりできます。",
    faqTitle: "「{character}」についてよくある質問", relatedTitle: "ほかの常用漢字を見る", sourceTitle: "データ出典",
    sourceText: "部首、画数、読み方、異体字は Unicode Unihan、字形構成は Make Me a Hanzi を参照しています。地域により字形、筆順、用法が異なる場合があるため、正式な用途では各地域の基準も確認してください。",
    directoryLinkTitle: "常用漢字の個別データ", directoryLinkIntro: "読み方、意味、部首、画数、構成、地域別字形、関連語を一字ずつ確認できます。",
    structureNames: Object.freeze({ leftRight: "左右構成", topBottom: "上下構成", leftMiddleRight: "左中右構成", topMiddleBottom: "上中下構成", enclosure: "囲み構成", overlaid: "重なり構成", single: "単独またはその他の構成" }),
    formationNames: Object.freeze({ ideographic: "会意文字", pictographic: "象形文字", pictophonetic: "形声文字", unknown: "その他" })
  }),
  ko: Object.freeze({
    skip: "주요 내용으로 이동", header: "사이트 헤더", nav: "주요 탐색", home: "홈", dictionary: "한자 사전", language: "언어",
    about: "소개", contact: "문의", privacy: "개인정보 보호 안내", footer: "바닥글",
    footerText: "JianFan.app은 한자 검색, 뜻과 음, 필순, 구조 분석, 쓰기 연습장과 문자 변환 도구를 제공합니다.",
    hubTitle: "한자 뜻·음·부수·획수 사전 | JianFan.app",
    hubDescription: "상용 한자의 뜻과 음, 부수, 획수, 구조를 찾으세요. 중국어 병음, 간체자·번체자, 일본어 읽기, 필순과 쓰기 연습장도 이용할 수 있습니다.",
    hubKicker: "상용 한자 자료", hubHeading: "한자 뜻·음·부수·획수 찾기", hubIntro: "한자를 선택해 한국 한자음과 뜻, 부수, 획수, 구조, 중국어 병음, 간체자·번체자, 일본어 읽기와 관련 단어를 확인하세요.",
    searchTitle: "다른 한자 찾기", searchLabel: "한자 입력", searchPlaceholder: "예: 明", searchSubmit: "한자 찾기",
    listTitle: "자주 쓰는 한자", listIntro: "익숙한 한자부터 간체자·번체자·일본 한자·한국 한자를 비교하고 뜻과 음, 구조와 관련 단어를 확인하세요.",
    hubInfoTitle: "한자음, 글자 모양과 쓰기 연습을 한곳에서", hubInfo: "각 글자 페이지에 정적인 사전 정보를 제공하고 필순, 중국어 병음, 구성요소 분석과 인쇄용 한자 쓰기 연습장으로 연결합니다. 간체자·번체자·일본 한자·한국 한자를 함께 비교할 수 있습니다.",
    hubFaqTitle: "한자 검색 자주 묻는 질문",
    hubFaqs: Object.freeze([
      Object.freeze(["한자 페이지에서 어떤 정보를 볼 수 있나요?", "한자의 뜻과 음, 부수, 총획수, 구조, 간체자·번체자, 중국어 병음, 일본어 읽기와 관련 단어를 확인할 수 있습니다."]),
      Object.freeze(["목록에 없는 한자도 찾을 수 있나요?", "네. 페이지 위 입력란에 한자를 넣으면 중국어 병음, 부수, 획수, 구조와 지역별 글자를 확인하는 전체 검색이 열립니다."]),
      Object.freeze(["간체자·번체자와 일본 한자는 항상 같은가요?", "항상 같지는 않습니다. 学·學, 国·國처럼 지역에서 주로 쓰는 글자 모양이 다르면 각 페이지에서 함께 비교합니다. "])
    ]),
    profileTitle: "{character} 한자 뜻·음·부수·획수·구조 | JianFan",
    profileDescription: "{character} 한자 뜻과 음 {koreanReading}, 부수, {strokes}획, 구조와 중국어 병음을 확인하세요. 필순, 간체자·번체자, 관련 단어와 쓰기 연습장도 이용할 수 있습니다.",
    profileKicker: "한자 한 글자 찾기", profileHeading: "{character} 한자 뜻과 음", profileIntro: "{character}의 한자음은 {reading}이며, {meaning}", quickTitle: "{character} 한자 기본 정보",
    labels: Object.freeze({ reading: "한자음", meaning: "뜻", radical: "부수", strokes: "총획수", structure: "구조", formation: "짜임", unicode: "Unicode", variants: "지역별 글자", cantonese: "광둥어", japanese: "일본어 읽기", korean: "한국 한자음" }),
    actions: Object.freeze({ stroke: "필순 보기", pinyin: "중국어 병음 확인", worksheet: "한자 쓰기 연습장 만들기", lookup: "글자 구조 열기" }),
    formsTitle: "{character}의 지역별 글자 모양과 읽기", formsIntro: "지역에서 주로 쓰는 글자 모양과 읽기를 비교합니다. 언어마다 뜻과 사용 빈도가 모두 같다는 의미는 아닙니다.",
    formHeaders: Object.freeze(["사용 지역", "글자", "읽기"]),
    formLabels: Object.freeze({ simplified: "중국어 간체자", traditional: "중국어 번체자", japanese: "일본 한자", korean: "한국 한자" }),
    wordsTitle: "{character}이 들어간 한자어", wordsIntro: "한자는 단어에 따라 뜻과 읽기가 달라질 수 있습니다. 대표적인 세 가지 예를 확인하세요.",
    wordHeaders: Object.freeze(["한자어", "읽기", "뜻"]),
    structureTitle: "{character}의 부수와 글자 구조", structureText: "{character}의 부수는 {radical}, 총획수는 {strokes}획이며 {structure}입니다. IDS 표기는 {ids}이고 눈에 보이는 주요 구성요소는 {components}입니다.",
    practiceTitle: "{character} 필순과 쓰기 연습", practiceText: "필순을 보고 중국어 병음과 구성요소를 확인하거나, 인쇄할 수 있는 한자 쓰기 연습장을 만들 수 있습니다.",
    faqTitle: "{character} 한자 자주 묻는 질문", relatedTitle: "다른 상용 한자 보기", sourceTitle: "자료 출처",
    sourceText: "부수, 획수, 읽기와 이체자 정보는 Unicode Unihan, 글자 구조는 Make Me a Hanzi를 참고합니다. 지역에 따라 글자 모양, 필순과 쓰임이 다를 수 있으므로 공식 문서에는 해당 지역 기준을 함께 확인하세요.",
    directoryLinkTitle: "상용 한자 개별 자료", directoryLinkIntro: "한자 한 글자씩 뜻과 음, 부수, 획수, 구조, 지역별 글자와 관련 단어를 확인하세요.",
    structureNames: Object.freeze({ leftRight: "좌우 구조", topBottom: "상하 구조", leftMiddleRight: "좌중우 구조", topMiddleBottom: "상중하 구조", enclosure: "둘러싼 구조", overlaid: "겹친 구조", single: "독체 또는 기타 구조" }),
    formationNames: Object.freeze({ ideographic: "회의자", pictographic: "상형자", pictophonetic: "형성자", unknown: "기타 짜임" })
  })
});
