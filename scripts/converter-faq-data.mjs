// FAQ content for the Simplified/Traditional converter pages (home and the four direction pages).
// Every conversion example was verified against the live converter (OpenCC via opencc-wasm 0.12.0) on 2026-11-17.
// Mode names match the localized option labels shown in each page's mode selector.
// Rendered into the pages and FAQPage structured data by scripts/sync-converter-faq.mjs.

export const CONVERTER_FAQ_SLUGS = ["", "simplified-to-traditional", "traditional-to-simplified", "taiwan-traditional", "hong-kong-traditional"];

const privacy = {
  "zh-CN": ["转换的文字会上传吗？能转多长？", "不会上传，转换在浏览器本地分段完成。单次最多可转换 300 万字符，也可以导入 10 MB 以内的 TXT、DOCX、PDF、Excel 或 CSV 文件提取文字。"],
  "zh-TW": ["轉換的文字會上傳嗎？可以轉多長？", "不會上傳，轉換在瀏覽器本機分段完成。單次最多可轉換 300 萬字元，也能匯入 10 MB 以內的 TXT、DOCX、PDF、Excel 或 CSV 檔案擷取文字。"],
  en: ["Is my text uploaded, and how much can I convert?", "No. Conversion runs locally in your browser in chunks. One conversion can handle up to 3 million characters, and you can import TXT, DOCX, PDF, Excel, or CSV files up to 10 MB."],
  ja: ["入力した文章はアップロードされますか？どれくらいの長さまで変換できますか？", "アップロードされません。変換はブラウザー内で分割して処理します。1回で最大300万文字まで変換でき、10 MB以内のTXT、DOCX、PDF、Excel、CSVファイルも読み込めます。"],
  ko: ["입력한 텍스트가 업로드되나요? 얼마나 길게 변환할 수 있나요?", "업로드되지 않습니다. 변환은 브라우저에서 나누어 처리합니다. 한 번에 최대 300만 자까지 변환할 수 있고 10 MB 이하의 TXT, DOCX, PDF, Excel, CSV 파일도 불러올 수 있습니다."]
};

const customTerms = {
  "zh-CN": ["品牌名或专有名词被转错怎么办？", "打开「自定义词库」，填写转换前和转换后的写法即可固定结果；两边填写相同内容可以让品牌名保持不变。词条只保存在当前浏览器中。"],
  "zh-TW": ["品牌名稱或專有名詞被轉錯怎麼辦？", "開啟「自訂詞庫」，填寫轉換前和轉換後的寫法即可固定結果；兩邊填寫相同內容可讓品牌名稱保持不變。詞條只儲存在目前的瀏覽器中。"],
  en: ["What if a brand name or proper noun converts wrongly?", "Open the custom dictionary and enter the text before and after conversion to lock the result. Enter the same text on both sides to keep a brand name unchanged. Entries are stored only in your current browser."],
  ja: ["ブランド名や固有名詞が誤って変換される場合は？", "「カスタム辞書」に変換前と変換後の表記を登録すると結果を固定できます。同じ表記を両側に入れれば、ブランド名をそのまま残せます。登録内容は現在のブラウザーにだけ保存されます。"],
  ko: ["브랜드명이나 고유명사가 잘못 변환되면 어떻게 하나요?", "사용자 사전에 변환 전과 변환 후 표기를 입력하면 결과를 고정할 수 있습니다. 양쪽에 같은 표기를 넣으면 브랜드명이 그대로 유지됩니다. 항목은 현재 브라우저에만 저장됩니다."]
};

export const CONVERTER_FAQ = {
  "": {
    "zh-CN": {
      title: "简繁转换常见问题",
      lead: "简繁转换是在中国大陆使用的简体字与台湾、香港、澳门使用的繁体字之间互相转换。因为一个简体字可能对应多个繁体字，可靠的转换要按词语判断，而不是逐字替换。",
      items: [
        ["简体字和繁体字有什么区别？", "简体字是中国大陆推行的规范汉字，现行标准是 2013 年发布的《通用规范汉字表》，收字 8105 个；繁体字通行于台湾、香港和澳门。两者读音和语法相同，主要区别是字形，部分常用词在各地的说法也不同。"],
        ["简繁转换为什么不能逐字替换？", "部分简体字由多个繁体字合并而来。本工具基于 OpenCC，先匹配词组再转单字：理发→理髮、出发→出發、然后→然後、皇后→皇后、干杯→乾杯、干活→幹活、树干→樹幹、台风→颱風。人名、新词和孤立单字仍可能出错，正式文本请校对。"],
        ["应该选通用繁体、台湾正体还是香港繁体？", "读者在台湾选台湾正体，在香港选香港繁体，不确定时用通用繁体。三者字形不同：「里面、着急、为什么、床」在通用繁体中为「裏面、着急、爲什麼、牀」，台湾正体为「裡面、著急、為什麼、床」，香港繁体为「裏面、着急、為什麼、牀」。"],
        ["能同时转换地区用词吗？", "可以。选择「简体 → 台湾正体（含用词）」会把软件→軟體、鼠标→滑鼠、出租车→計程車、视频→影片、内存→記憶體；「台湾正体 → 简体（含用词）」可以把这些台湾用语换回大陆常用词。只转字形的模式会保留原有词汇。"],
        privacy["zh-CN"]
      ]
    },
    "zh-TW": {
      title: "簡繁轉換常見問題",
      lead: "簡繁轉換是在中國大陸使用的簡體字與台灣、香港、澳門使用的繁體字之間互相轉換。由於一個簡體字可能對應多個繁體字，可靠的轉換要依詞語判斷，而不是逐字替換。",
      items: [
        ["簡體字和繁體字有什麼不同？", "簡體字是中國大陸推行的規範漢字，現行標準是 2013 年公布的《通用規範漢字表》，收字 8105 個；繁體字通行於台灣、香港和澳門。兩者讀音與文法相同，主要差在字形，部分常用詞在各地的說法也不同。"],
        ["簡繁轉換為什麼不能逐字替換？", "部分簡體字是由多個繁體字合併而來。本工具以 OpenCC 為基礎，先比對詞組再轉單字：理发→理髮、出发→出發、然后→然後、皇后→皇后、干杯→乾杯、干活→幹活、树干→樹幹、台风→颱風。人名、新詞和單獨的字仍可能出錯，正式文件請再校對。"],
        ["該選通用繁體、台灣正體還是香港繁體？", "讀者在台灣請選台灣正體，在香港請選香港繁體，不確定時用通用繁體。三者字形不同：「里面、着急、为什么、床」在通用繁體為「裏面、着急、爲什麼、牀」，台灣正體為「裡面、著急、為什麼、床」，香港繁體為「裏面、着急、為什麼、牀」。"],
        ["可以同時轉換地區用詞嗎？", "可以。選擇「簡體 → 台灣正體（含用詞）」會把软件→軟體、鼠标→滑鼠、出租车→計程車、视频→影片、内存→記憶體；「台灣正體 → 簡體（含用詞）」則能把這些台灣用語換回中國大陸常用詞。只轉字形的模式會保留原本的詞彙。"],
        privacy["zh-TW"]
      ]
    },
    en: {
      title: "Chinese converter FAQ",
      lead: "Chinese conversion switches text between Simplified Chinese, used in mainland China, and Traditional Chinese, used in Taiwan, Hong Kong, and Macau. One Simplified character can map to several Traditional characters, so reliable conversion works on whole words rather than single characters.",
      items: [
        ["What is the difference between Simplified and Traditional Chinese?", "Simplified characters are the standard in mainland China, defined today by the 2013 Table of General Standard Chinese Characters (8,105 characters). Traditional characters are used in Taiwan, Hong Kong, and Macau. Pronunciation and grammar are the same; the main differences are character forms and some regional vocabulary."],
        ["Why can't Chinese be converted character by character?", "Some Simplified characters merged several Traditional ones. This tool uses OpenCC, which matches whole words before single characters: 理发→理髮 (haircut), 出发→出發 (depart), 然后→然後, 皇后→皇后, 干杯→乾杯, 干活→幹活, 树干→樹幹, 台风→颱風. Names, new words, and isolated characters can still be wrong, so proofread important text."],
        ["Should I choose standard Traditional, Taiwan, or Hong Kong?", "Choose Taiwan for readers in Taiwan, Hong Kong for readers in Hong Kong, and standard Traditional when the audience is unknown. Their character forms differ: 里面, 着急, 为什么, and 床 become 裏面, 着急, 爲什麼, 牀 in standard Traditional; 裡面, 著急, 為什麼, 床 in Taiwan; and 裏面, 着急, 為什麼, 牀 in Hong Kong."],
        ["Can it convert regional vocabulary too?", "Yes. “Simplified → Taiwan phrases” turns 软件 into 軟體, 鼠标 into 滑鼠, 出租车 into 計程車, 视频 into 影片, and 内存 into 記憶體. “Taiwan → Simplified phrases” converts those Taiwan terms back to mainland usage. Modes without phrases change only character forms."],
        privacy.en
      ]
    },
    ja: {
      title: "簡体字・繁体字変換のよくある質問",
      lead: "簡体字・繁体字変換は、中国大陸で使われる簡体字と、台湾・香港・マカオで使われる繁体字を相互に変換することです。1つの簡体字が複数の繁体字に対応する場合があるため、正確な変換には1文字ずつではなく単語単位の判断が必要です。",
      items: [
        ["簡体字と繁体字は何が違いますか？", "簡体字は中国大陸の標準字体で、現在の規範は2013年公布の「通用規範漢字表」（8105字）です。繁体字は台湾・香港・マカオで使われています。読み方や文法は同じで、主な違いは字形と一部の地域ごとの語彙です。"],
        ["なぜ1文字ずつ置き換えるだけではだめなのですか？", "複数の繁体字が1つの簡体字に統合された例があるためです。このツールはOpenCCを基に、単語を先に照合してから1文字ずつ変換します。例：理发→理髮、出发→出發、然后→然後、皇后→皇后、干杯→乾杯、干活→幹活、树干→樹幹、台风→颱風。人名や新語、単独の文字は誤ることがあるので、重要な文書は確認してください。"],
        ["一般的な繁体字・台湾繁体字・香港繁体字のどれを選べばよいですか？", "台湾向けなら台湾繁体字、香港向けなら香港繁体字、読者が決まっていなければ一般的な繁体字を選びます。字形も異なり、「里面、着急、为什么、床」は一般的な繁体字で「裏面、着急、爲什麼、牀」、台湾繁体字で「裡面、著急、為什麼、床」、香港繁体字で「裏面、着急、為什麼、牀」になります。"],
        ["地域ごとの用語も変換できますか？", "できます。「簡体字 → 台湾用語込み」では软件→軟體、鼠标→滑鼠、出租车→計程車、视频→影片、内存→記憶體のように台湾の言い方に置き換えます。「台湾繁体字 → 簡体字（用語込み）」なら台湾の用語を中国大陸の言い方に戻せます。用語なしのモードは字形だけを変換します。"],
        privacy.ja
      ]
    },
    ko: {
      title: "간체·번체 변환 자주 묻는 질문",
      lead: "간체·번체 변환은 중국 대륙에서 쓰는 간체자와 대만·홍콩·마카오에서 쓰는 번체자를 서로 바꾸는 작업입니다. 간체자 하나가 여러 번체자에 대응하기도 하므로, 정확한 변환은 한 글자씩이 아니라 단어 단위로 판단해야 합니다.",
      items: [
        ["간체자와 번체자는 무엇이 다른가요?", "간체자는 중국 대륙의 표준 한자로, 현재 기준은 2013년 발표된 ‘통용규범한자표’(8,105자)입니다. 번체자는 대만, 홍콩, 마카오에서 씁니다. 발음과 문법은 같고, 주된 차이는 글자 모양과 일부 지역별 어휘입니다."],
        ["왜 한 글자씩 바꾸면 안 되나요?", "여러 번체자가 하나의 간체자로 합쳐진 경우가 있기 때문입니다. 이 도구는 OpenCC를 바탕으로 단어를 먼저 맞춘 뒤 글자를 변환합니다. 예: 理发→理髮, 出发→出發, 然后→然後, 皇后→皇后, 干杯→乾杯, 干活→幹活, 树干→樹幹, 台风→颱風. 인명, 신조어, 단독 글자는 틀릴 수 있으니 중요한 글은 검토하세요."],
        ["일반 번체, 대만 정체, 홍콩 번체 중 무엇을 골라야 하나요?", "대만 독자에게는 대만 정체, 홍콩 독자에게는 홍콩 번체, 독자가 정해지지 않았다면 일반 번체를 고르세요. 글자 모양도 달라서 ‘里面, 着急, 为什么, 床’은 일반 번체에서 ‘裏面, 着急, 爲什麼, 牀’, 대만 정체에서 ‘裡面, 著急, 為什麼, 床’, 홍콩 번체에서 ‘裏面, 着急, 為什麼, 牀’이 됩니다."],
        ["지역별 어휘도 바꿀 수 있나요?", "네. ‘간체 → 대만 용어 포함’을 고르면 软件→軟體, 鼠标→滑鼠, 出租车→計程車, 视频→影片, 内存→記憶體처럼 대만식 표현으로 바뀝니다. ‘대만 정체 → 간체 용어 포함’은 대만 용어를 중국 대륙 표현으로 되돌립니다. 용어 미포함 모드는 글자 모양만 바꿉니다."],
        privacy.ko
      ]
    }
  },

  "simplified-to-traditional": {
    "zh-CN": {
      title: "简体转繁体常见问题",
      lead: "简体转繁体是把简体中文转换为繁体字形。本页默认输出通用繁体（OpenCC 标准字形），也可以切换为台湾正体或香港繁体，并按需替换地区用词。",
      items: [
        ["简体转繁体会把「发、后、干」转错吗？", "常见词能自动区分。转换先匹配词组再转单字：头发→頭髮、出发→出發、发票→發票、后天→後天、皇后→皇后、干净→乾淨、干活→幹活、只有一只猫→只有一隻貓、钟表→鐘錶。人名、新词和孤立的单字缺少上下文，发布前仍建议校对。"],
        ["为什么转出来是「爲、裏、牀」，和台湾常见写法不同？", "默认的通用繁体采用 OpenCC 标准字形：为什么→爲什麼、里面→裏面、床铺→牀鋪、面包→麪包。读者在台湾请选择「简体 → 台湾正体」，会得到「為什麼、裡面、床鋪、麵包」；面向香港请选择香港繁体。"],
        ["能把软件、视频等词换成台湾说法吗？", "选择「简体 → 台湾正体（含用词）」即可：软件→軟體、鼠标→滑鼠、服务器→伺服器、出租车→計程車、视频→影片、打印机→印表機、内存→記憶體、博客→部落格、激光→雷射。只转字形的模式会保留「軟件、視頻」等原词。"],
        customTerms["zh-CN"],
        privacy["zh-CN"]
      ]
    },
    "zh-TW": {
      title: "簡體轉繁體常見問題",
      lead: "簡體轉繁體是把簡體中文轉換成繁體字形。本頁預設輸出通用繁體（OpenCC 標準字形），也可以切換為台灣正體或香港繁體，並視需要替換地區用詞。",
      items: [
        ["簡體轉繁體會把「发、后、干」轉錯嗎？", "常見詞能自動區分。轉換先比對詞組再轉單字：头发→頭髮、出发→出發、发票→發票、后天→後天、皇后→皇后、干净→乾淨、干活→幹活、只有一只猫→只有一隻貓、钟表→鐘錶。人名、新詞和單獨的字缺少上下文，發佈前仍建議校對。"],
        ["為什麼轉出來是「爲、裏、牀」，和台灣常見寫法不同？", "預設的通用繁體採用 OpenCC 標準字形：为什么→爲什麼、里面→裏面、床铺→牀鋪、面包→麪包。讀者在台灣請選擇「簡體 → 台灣正體」，會得到「為什麼、裡面、床鋪、麵包」；面向香港請選擇香港繁體。"],
        ["可以把软件、视频等詞換成台灣說法嗎？", "選擇「簡體 → 台灣正體（含用詞）」即可：软件→軟體、鼠标→滑鼠、服务器→伺服器、出租车→計程車、视频→影片、打印机→印表機、内存→記憶體、博客→部落格、激光→雷射。只轉字形的模式會保留「軟件、視頻」等原詞。"],
        customTerms["zh-TW"],
        privacy["zh-TW"]
      ]
    },
    en: {
      title: "Simplified to Traditional Chinese FAQ",
      lead: "Simplified to Traditional conversion rewrites Simplified Chinese in Traditional character forms. This page outputs standard Traditional Chinese (OpenCC standard forms) by default, and you can switch to Taiwan or Hong Kong forms and regional vocabulary.",
      items: [
        ["Will characters like 发, 后, and 干 be converted wrongly?", "Common words are handled from context, because whole words are matched first: 头发→頭髮 (hair), 出发→出發 (depart), 发票→發票, 后天→後天, 皇后→皇后 (empress), 干净→乾淨, 干活→幹活, 只有一只猫→只有一隻貓, 钟表→鐘錶. Names, new words, and isolated characters lack context, so proofread before publishing."],
        ["Why does the result use 爲, 裏, and 牀 instead of the usual Taiwan forms?", "The default standard Traditional output uses OpenCC standard forms: 为什么→爲什麼, 里面→裏面, 床铺→牀鋪, 面包→麪包. For readers in Taiwan, choose “Simplified → Taiwan” to get 為什麼, 裡面, 床鋪, 麵包. For Hong Kong readers, choose the Hong Kong mode."],
        ["Can it replace mainland terms with Taiwan vocabulary?", "Choose “Simplified → Taiwan phrases”: 软件→軟體 (software), 鼠标→滑鼠 (mouse), 服务器→伺服器 (server), 出租车→計程車 (taxi), 视频→影片 (video), 打印机→印表機 (printer), 内存→記憶體 (memory), 博客→部落格 (blog), 激光→雷射 (laser). Modes without phrases keep words such as 軟件 and 視頻."],
        customTerms.en,
        privacy.en
      ]
    },
    ja: {
      title: "簡体字→繁体字変換のよくある質問",
      lead: "簡体字→繁体字変換は、簡体字の中国語を繁体字の字形に書き換えることです。このページは初期設定で一般的な繁体字（OpenCC標準字形）を出力し、台湾繁体字や香港繁体字、地域の用語にも切り替えられます。",
      items: [
        ["「发・后・干」のような字は誤変換されませんか？", "よく使う単語は文脈から判別します。単語を先に照合するため、头发→頭髮、出发→出發、发票→發票、后天→後天、皇后→皇后、干净→乾淨、干活→幹活、只有一只猫→只有一隻貓、钟表→鐘錶のように変換されます。人名や新語、単独の文字は文脈がないため、公開前に確認してください。"],
        ["なぜ「爲・裏・牀」になり、台湾でよく見る字形と違うのですか？", "初期設定の一般的な繁体字はOpenCC標準字形を使うためです。为什么→爲什麼、里面→裏面、床铺→牀鋪、面包→麪包となります。台湾向けなら「簡体字 → 台湾繁体字」を選ぶと「為什麼、裡面、床鋪、麵包」になります。香港向けには香港繁体字を選んでください。"],
        ["「软件」「视频」などを台湾の言い方に変えられますか？", "「簡体字 → 台湾用語込み」を選んでください。软件→軟體、鼠标→滑鼠、服务器→伺服器、出租车→計程車、视频→影片、打印机→印表機、内存→記憶體、博客→部落格、激光→雷射に置き換わります。用語なしのモードは「軟件、視頻」のように元の語を残します。"],
        customTerms.ja,
        privacy.ja
      ]
    },
    ko: {
      title: "간체→번체 변환 자주 묻는 질문",
      lead: "간체→번체 변환은 간체 중국어를 번체 글자 모양으로 바꾸는 작업입니다. 이 페이지는 기본으로 일반 번체(OpenCC 표준 자형)를 출력하며, 대만 정체나 홍콩 번체와 지역 어휘로도 바꿀 수 있습니다.",
      items: [
        ["发, 后, 干 같은 글자가 잘못 변환되지 않나요?", "자주 쓰는 단어는 문맥으로 구분합니다. 단어를 먼저 맞추기 때문에 头发→頭髮, 出发→出發, 发票→發票, 后天→後天, 皇后→皇后, 干净→乾淨, 干活→幹活, 只有一只猫→只有一隻貓, 钟表→鐘錶처럼 변환됩니다. 인명, 신조어, 단독 글자는 문맥이 없으니 게시 전에 확인하세요."],
        ["왜 결과가 爲, 裏, 牀으로 나오고 대만에서 흔히 쓰는 자형과 다른가요?", "기본 일반 번체는 OpenCC 표준 자형을 쓰기 때문입니다. 为什么→爲什麼, 里面→裏面, 床铺→牀鋪, 面包→麪包가 됩니다. 대만 독자용이면 ‘간체 → 대만 정체’를 고르세요. 為什麼, 裡面, 床鋪, 麵包가 나옵니다. 홍콩용이면 홍콩 번체를 고르세요."],
        ["软件, 视频 같은 단어를 대만식 표현으로 바꿀 수 있나요?", "‘간체 → 대만 용어 포함’을 고르세요. 软件→軟體, 鼠标→滑鼠, 服务器→伺服器, 出租车→計程車, 视频→影片, 打印机→印表機, 内存→記憶體, 博客→部落格, 激光→雷射로 바뀝니다. 용어 미포함 모드는 軟件, 視頻처럼 원래 단어를 유지합니다."],
        customTerms.ko,
        privacy.ko
      ]
    }
  },

  "traditional-to-simplified": {
    "zh-CN": {
      title: "繁体转简体常见问题",
      lead: "繁体转简体是把台湾、香港或通用繁体文字转换为中国大陆使用的简体字。这是多对一转换，例如「頭髮」和「發展」中的不同字形都会变成「发」。",
      items: [
        ["台湾、香港的繁体都能转成简体吗？", "能，但建议选择对应来源。默认的「繁体 → 简体」会把「裏面、説話」转成「里面、说话」，却可能保留「衞生、著急」等地区字形；香港文本请选「香港繁体 → 简体」，台湾文本请选「台湾正体 → 简体」，结果更完整。"],
        ["能把台湾用语换成大陆常用词吗？", "选择「台湾正体 → 简体（含用词）」：軟體→软件、滑鼠→鼠标、伺服器→服务器、計程車→出租车、影片→视频、印表機→打印机、記憶體→内存、部落格→博客、網路→网络。默认模式只转字形，不改词汇。"],
        ["繁体转简体后还能转回原来的繁体吗？", "不一定。多个繁体字会合并为同一个简体字：頭髮/發展→头发/发展，乾杯/幹活/樹幹→干杯/干活/树干，後面/皇后→后面/皇后，颱風/臺灣→台风/台湾。再转回繁体时依靠词组判断，常见词能恢复，少见搭配需要对照原文。"],
        ["繁体转简体会翻译或改写粤语吗？", "不会。转换只改变字形和可选的地区词汇，不翻译语义，也不改写语法。粤语口语词会保留，例如「的士」转为简体后仍是「的士」。"],
        privacy["zh-CN"]
      ]
    },
    "zh-TW": {
      title: "繁體轉簡體常見問題",
      lead: "繁體轉簡體是把台灣、香港或通用繁體文字轉換成中國大陸使用的簡體字。這是多對一轉換，例如「頭髮」和「發展」中的不同字形都會變成「发」。",
      items: [
        ["台灣、香港的繁體都能轉成簡體嗎？", "可以，但建議選擇對應的來源。預設的「繁體 → 簡體」會把「裏面、説話」轉成「里面、说话」，卻可能保留「衞生、著急」等地區字形；香港文字請選「香港繁體 → 簡體」，台灣文字請選「台灣正體 → 簡體」，結果會更完整。"],
        ["可以把台灣用語換成中國大陸常用詞嗎？", "選擇「台灣正體 → 簡體（含用詞）」：軟體→软件、滑鼠→鼠标、伺服器→服务器、計程車→出租车、影片→视频、印表機→打印机、記憶體→内存、部落格→博客、網路→网络。預設模式只轉字形，不改詞彙。"],
        ["繁體轉簡體後還能轉回原本的繁體嗎？", "不一定。多個繁體字會合併成同一個簡體字：頭髮/發展→头发/发展，乾杯/幹活/樹幹→干杯/干活/树干，後面/皇后→后面/皇后，颱風/臺灣→台风/台湾。再轉回繁體時依靠詞組判斷，常見詞能還原，少見的搭配需要對照原文。"],
        ["繁體轉簡體會翻譯或改寫粵語嗎？", "不會。轉換只改變字形和可選的地區詞彙，不翻譯語意，也不改寫文法。粵語口語詞會保留，例如「的士」轉成簡體後仍是「的士」。"],
        privacy["zh-TW"]
      ]
    },
    en: {
      title: "Traditional to Simplified Chinese FAQ",
      lead: "Traditional to Simplified conversion rewrites Taiwan, Hong Kong, or standard Traditional Chinese in the Simplified characters used in mainland China. It is a many-to-one conversion: for example, the different characters in 頭髮 (hair) and 發展 (develop) both become 发.",
      items: [
        ["Can it convert both Taiwan and Hong Kong Traditional Chinese?", "Yes, but choose the matching source mode. The default “Traditional → Simplified” turns 裏面 and 説話 into 里面 and 说话 but can leave regional forms such as 衞生 and 著急 unchanged. Use “Hong Kong → Simplified” for Hong Kong text and a Taiwan mode for Taiwan text to get complete results."],
        ["Can it replace Taiwan terms with mainland vocabulary?", "Choose “Taiwan → Simplified phrases”: 軟體→软件 (software), 滑鼠→鼠标 (mouse), 伺服器→服务器 (server), 計程車→出租车 (taxi), 影片→视频 (video), 印表機→打印机 (printer), 記憶體→内存 (memory), 部落格→博客 (blog), 網路→网络 (network). The default mode changes only character forms."],
        ["Can I convert the result back to the original Traditional text?", "Not always. Several Traditional characters merge into one Simplified character: 頭髮/發展→头发/发展, 乾杯/幹活/樹幹→干杯/干活/树干, 後面/皇后→后面/皇后, 颱風/臺灣→台风/台湾. Converting back relies on word context, so common words return correctly but rare combinations need checking against the original."],
        ["Does it translate or rewrite Cantonese?", "No. Conversion changes only character forms and optional regional vocabulary. It does not translate meaning or change grammar. Cantonese words stay as they are; for example, 的士 (taxi) remains 的士 in Simplified Chinese."],
        privacy.en
      ]
    },
    ja: {
      title: "繁体字→簡体字変換のよくある質問",
      lead: "繁体字→簡体字変換は、台湾・香港・一般的な繁体字の文章を中国大陸で使われる簡体字に書き換えることです。複数の字が1字にまとまる変換で、たとえば「頭髮」と「發展」の異なる字はどちらも「发」になります。",
      items: [
        ["台湾と香港の繁体字はどちらも簡体字に変換できますか？", "できますが、元の地域に合ったモードを選ぶのがおすすめです。初期設定の「繁体字 → 簡体字」は「裏面、説話」を「里面、说话」に変換する一方、「衞生、著急」などの地域字形を残すことがあります。香港の文章は「香港繁体字 → 簡体字」、台湾の文章は台湾繁体字のモードを選ぶと確実です。"],
        ["台湾の用語を中国大陸の言い方に変えられますか？", "「台湾繁体字 → 簡体字（用語込み）」を選んでください。軟體→软件、滑鼠→鼠标、伺服器→服务器、計程車→出租车、影片→视频、印表機→打印机、記憶體→内存、部落格→博客、網路→网络に置き換わります。初期設定のモードは字形だけを変換します。"],
        ["簡体字にした文章を元の繁体字に戻せますか？", "必ず戻せるとは限りません。複数の繁体字が同じ簡体字にまとまるためです：頭髮/發展→头发/发展、乾杯/幹活/樹幹→干杯/干活/树干、後面/皇后→后面/皇后、颱風/臺灣→台风/台湾。戻すときは単語の文脈で判断するので、一般的な語は戻りますが、珍しい組み合わせは原文と照らし合わせてください。"],
        ["翻訳や広東語の書き換えもしますか？", "しません。変換するのは字形と、選択した場合の地域用語だけで、意味の翻訳や文法の書き換えは行いません。広東語の語はそのまま残り、たとえば「的士」は簡体字でも「的士」のままです。"],
        privacy.ja
      ]
    },
    ko: {
      title: "번체→간체 변환 자주 묻는 질문",
      lead: "번체→간체 변환은 대만, 홍콩 또는 일반 번체 중국어를 중국 대륙에서 쓰는 간체자로 바꾸는 작업입니다. 여러 글자가 하나로 합쳐지는 변환이라 ‘頭髮’와 ‘發展’의 서로 다른 글자가 모두 ‘发’가 됩니다.",
      items: [
        ["대만과 홍콩 번체를 모두 간체로 바꿀 수 있나요?", "가능하지만 원문 지역에 맞는 모드를 고르는 것이 좋습니다. 기본 ‘번체 → 간체’는 裏面, 説話를 里面, 说话로 바꾸지만 衞生, 著急 같은 지역 자형은 그대로 둘 수 있습니다. 홍콩 글은 ‘홍콩 번체 → 간체’, 대만 글은 대만 정체 모드를 쓰면 더 정확합니다."],
        ["대만 용어를 중국 대륙 표현으로 바꿀 수 있나요?", "‘대만 정체 → 간체 용어 포함’을 고르세요. 軟體→软件, 滑鼠→鼠标, 伺服器→服务器, 計程車→出租车, 影片→视频, 印表機→打印机, 記憶體→内存, 部落格→博客, 網路→网络로 바뀝니다. 기본 모드는 글자 모양만 바꿉니다."],
        ["간체로 바꾼 글을 원래 번체로 되돌릴 수 있나요?", "항상 되돌릴 수는 없습니다. 여러 번체자가 같은 간체자로 합쳐지기 때문입니다: 頭髮/發展→头发/发展, 乾杯/幹活/樹幹→干杯/干活/树干, 後面/皇后→后面/皇后, 颱風/臺灣→台风/台湾. 되돌릴 때는 단어 문맥으로 판단하므로 흔한 단어는 복원되지만 드문 조합은 원문과 대조해야 합니다."],
        ["번역하거나 광둥어를 바꾸기도 하나요?", "아니요. 글자 모양과 선택한 지역 어휘만 바꾸며 뜻을 번역하거나 문법을 고치지 않습니다. 광둥어 단어는 그대로 남아서 的士(택시)는 간체에서도 的士입니다."],
        privacy.ko
      ]
    }
  },

  "taiwan-traditional": {
    "zh-CN": {
      title: "台湾繁体转换常见问题",
      lead: "台湾繁体（台湾正体）转换是把简体中文转换为台湾使用的标准字形。本页默认使用「简体 → 台湾正体（含用词）」，会同时把大陆用词换成台湾常用说法。",
      items: [
        ["台湾正体和通用繁体有什么区别？", "多个常用字写法不同：里面→裡面（通用繁体为裏面）、着急→著急（着急）、为什么→為什麼（爲什麼）、床铺→床鋪（牀鋪）、面包→麵包（麪包）。在台湾发布的内容建议使用台湾正体。"],
        ["「含用词」和不含用词有什么不同？", "不含用词只转字形，「软件」会变成「軟件」；含用词还会替换为台湾常用说法：软件→軟體、鼠标→滑鼠、服务器→伺服器、出租车→計程車、视频→影片、打印机→印表機、内存→記憶體、博客→部落格、自行车→腳踏車、激光→雷射。"],
        ["为什么「台湾」被转成了「臺灣」？", "台湾的标准字形是「臺」，所以结果为「臺灣、舞臺」，「台风」则转为「颱風」。日常书写也常用「台」；如需保留，可在自定义词库中把「台湾」固定为「台灣」。"],
        ["台湾正体能转回简体吗？", "可以。选择「台湾正体 → 简体（含用词）」会把軟體、滑鼠、伺服器、計程車等换回软件、鼠标、服务器、出租车。注意多个繁体字可能合并为同一个简体字，例如頭髮/發展→头发/发展，转回后不一定逐字还原。"],
        privacy["zh-CN"]
      ]
    },
    "zh-TW": {
      title: "台灣繁體轉換常見問題",
      lead: "台灣繁體（台灣正體）轉換是把簡體中文轉換成台灣使用的標準字形。本頁預設使用「簡體 → 台灣正體（含用詞）」，會同時把中國大陸用詞換成台灣慣用說法。",
      items: [
        ["台灣正體和通用繁體有什麼不同？", "多個常用字寫法不同：里面→裡面（通用繁體為裏面）、着急→著急（着急）、为什么→為什麼（爲什麼）、床铺→床鋪（牀鋪）、面包→麵包（麪包）。在台灣發佈的內容建議使用台灣正體。"],
        ["「含用詞」和不含用詞有什麼不同？", "不含用詞只轉字形，「软件」會變成「軟件」；含用詞還會換成台灣慣用說法：软件→軟體、鼠标→滑鼠、服务器→伺服器、出租车→計程車、视频→影片、打印机→印表機、内存→記憶體、博客→部落格、自行车→腳踏車、激光→雷射。"],
        ["為什麼「台湾」被轉成「臺灣」？", "台灣的標準字形是「臺」，所以結果為「臺灣、舞臺」，「台风」則轉為「颱風」。日常書寫也常用「台」；如需保留，可在自訂詞庫中把「台湾」固定為「台灣」。"],
        ["台灣正體可以轉回簡體嗎？", "可以。選擇「台灣正體 → 簡體（含用詞）」會把軟體、滑鼠、伺服器、計程車等換回软件、鼠标、服务器、出租车。要注意多個繁體字可能合併成同一個簡體字，例如頭髮/發展→头发/发展，轉回後不一定逐字還原。"],
        privacy["zh-TW"]
      ]
    },
    en: {
      title: "Taiwan Traditional Chinese FAQ",
      lead: "Taiwan Traditional Chinese conversion rewrites Simplified Chinese in the standard character forms used in Taiwan. This page defaults to “Simplified → Taiwan phrases”, which also replaces mainland vocabulary with common Taiwan terms.",
      items: [
        ["How is Taiwan Traditional different from standard Traditional Chinese?", "Several common characters differ: 里面→裡面 (standard Traditional: 裏面), 着急→著急 (着急), 为什么→為什麼 (爲什麼), 床铺→床鋪 (牀鋪), 面包→麵包 (麪包). Use Taiwan Traditional for content published in Taiwan."],
        ["What is the difference between the modes with and without phrases?", "Without phrases, only character forms change, so 软件 becomes 軟件. With phrases, words are also replaced with Taiwan usage: 软件→軟體 (software), 鼠标→滑鼠 (mouse), 服务器→伺服器 (server), 出租车→計程車 (taxi), 视频→影片 (video), 打印机→印表機 (printer), 内存→記憶體 (memory), 博客→部落格 (blog), 自行车→腳踏車 (bicycle), 激光→雷射 (laser)."],
        ["Why does 台湾 become 臺灣?", "臺 is the standard form in Taiwan, so the result is 臺灣 and 舞臺, while 台风 (typhoon) becomes 颱風. 台 is also common in everyday writing; to keep it, add a custom dictionary entry that fixes 台湾 as 台灣."],
        ["Can Taiwan Traditional be converted back to Simplified?", "Yes. “Taiwan → Simplified phrases” turns 軟體, 滑鼠, 伺服器, and 計程車 back into 软件, 鼠标, 服务器, and 出租车. Several Traditional characters can merge into one Simplified character, as in 頭髮/發展→头发/发展, so a round trip may not restore every character."],
        privacy.en
      ]
    },
    ja: {
      title: "台湾繁体字変換のよくある質問",
      lead: "台湾繁体字変換は、簡体字の中国語を台湾で使われる標準字形に書き換えることです。このページは初期設定で「簡体字 → 台湾用語込み」を使い、中国大陸の用語も台湾の言い方に置き換えます。",
      items: [
        ["台湾繁体字と一般的な繁体字はどう違いますか？", "よく使う字の形が異なります：里面→裡面（一般的な繁体字は裏面）、着急→著急（着急）、为什么→為什麼（爲什麼）、床铺→床鋪（牀鋪）、面包→麵包（麪包）。台湾向けに公開する文章には台湾繁体字をおすすめします。"],
        ["「用語込み」とそうでないモードの違いは？", "用語なしは字形だけを変換するため、「软件」は「軟件」になります。用語込みでは台湾の言い方にも置き換えます：软件→軟體、鼠标→滑鼠、服务器→伺服器、出租车→計程車、视频→影片、打印机→印表機、内存→記憶體、博客→部落格、自行车→腳踏車、激光→雷射。"],
        ["なぜ「台湾」が「臺灣」になるのですか？", "台湾の標準字形は「臺」のため、「臺灣、舞臺」となり、「台风」は「颱風」になります。日常的には「台」もよく使われます。「台」を残したい場合は、カスタム辞書で「台湾」を「台灣」に固定してください。"],
        ["台湾繁体字を簡体字に戻せますか？", "戻せます。「台湾繁体字 → 簡体字（用語込み）」なら軟體、滑鼠、伺服器、計程車を软件、鼠标、服务器、出租车に戻します。ただし複数の繁体字が同じ簡体字にまとまることがあり（頭髮/發展→头发/发展）、往復しても1字ずつ元通りになるとは限りません。"],
        privacy.ja
      ]
    },
    ko: {
      title: "대만 번체 변환 자주 묻는 질문",
      lead: "대만 번체(대만 정체) 변환은 간체 중국어를 대만에서 쓰는 표준 자형으로 바꾸는 작업입니다. 이 페이지는 기본으로 ‘간체 → 대만 용어 포함’을 사용해 중국 대륙 용어도 대만식 표현으로 바꿉니다.",
      items: [
        ["대만 정체와 일반 번체는 무엇이 다른가요?", "자주 쓰는 글자 모양이 다릅니다: 里面→裡面(일반 번체는 裏面), 着急→著急(着急), 为什么→為什麼(爲什麼), 床铺→床鋪(牀鋪), 面包→麵包(麪包). 대만에 게시할 글에는 대만 정체를 권합니다."],
        ["용어 포함 모드와 미포함 모드는 어떻게 다른가요?", "용어 미포함은 글자 모양만 바꿔 软件이 軟件이 됩니다. 용어 포함은 대만식 표현으로도 바꿉니다: 软件→軟體, 鼠标→滑鼠, 服务器→伺服器, 出租车→計程車, 视频→影片, 打印机→印表機, 内存→記憶體, 博客→部落格, 自行车→腳踏車, 激光→雷射."],
        ["왜 台湾이 臺灣으로 바뀌나요?", "대만의 표준 자형이 臺이기 때문에 臺灣, 舞臺가 되고, 台风(태풍)은 颱風이 됩니다. 일상에서는 台도 많이 씁니다. 台를 유지하려면 사용자 사전에서 台湾을 台灣으로 고정하세요."],
        ["대만 정체를 다시 간체로 바꿀 수 있나요?", "네. ‘대만 정체 → 간체 용어 포함’은 軟體, 滑鼠, 伺服器, 計程車를 软件, 鼠标, 服务器, 出租车로 되돌립니다. 다만 여러 번체자가 같은 간체자로 합쳐질 수 있어(頭髮/發展→头发/发展) 왕복 변환 후 모든 글자가 그대로 돌아오지는 않습니다."],
        privacy.ko
      ]
    }
  },

  "hong-kong-traditional": {
    "zh-CN": {
      title: "香港繁体转换常见问题",
      lead: "香港繁体转换是把简体中文转换为香港常用的繁体字形。本页默认使用「简体 → 香港繁体（含用词）」；香港繁体与台湾正体在多个常用字上写法不同。",
      items: [
        ["香港繁体和台湾繁体有什么区别？", "常用字写法不同：里面→裏面（台湾：裡面）、着急→着急（著急）、卫生→衞生（衛生）、说话→説話（說話）、床铺→牀鋪（床鋪）、面包→麪包（麵包）。另外「台湾、舞台」在香港繁体中保持「台灣、舞台」，台湾正体则为「臺灣、舞臺」。"],
        ["会把内地用词换成香港说法吗？", "只会处理少量词汇：含用词模式会把鼠标→滑鼠、服务器→伺服器，「软件」保持「軟件」，这也是香港的常用写法。「出租车」不会自动变成「的士」，粤语和港式用语需要人工改写。"],
        ["香港繁体能转回简体吗？", "可以，选择「香港繁体 → 简体」：裏面→里面、衞生→卫生、説話→说话。粤语用词会保留原样，例如「的士」仍是「的士」。"],
        customTerms["zh-CN"],
        privacy["zh-CN"]
      ]
    },
    "zh-TW": {
      title: "香港繁體轉換常見問題",
      lead: "香港繁體轉換是把簡體中文轉換成香港常用的繁體字形。本頁預設使用「簡體 → 香港繁體（含用詞）」；香港繁體與台灣正體在多個常用字上寫法不同。",
      items: [
        ["香港繁體和台灣繁體有什麼不同？", "常用字寫法不同：里面→裏面（台灣：裡面）、着急→着急（著急）、卫生→衞生（衛生）、说话→説話（說話）、床铺→牀鋪（床鋪）、面包→麪包（麵包）。另外「台湾、舞台」在香港繁體中為「台灣、舞台」，台灣正體則為「臺灣、舞臺」。"],
        ["會把中國大陸用詞換成香港說法嗎？", "只會處理少量詞彙：含用詞模式會把鼠标→滑鼠、服务器→伺服器，「软件」保持「軟件」，這也是香港常用的寫法。「出租车」不會自動變成「的士」，粵語和港式用語需要人工改寫。"],
        ["香港繁體可以轉回簡體嗎？", "可以，請選擇「香港繁體 → 簡體」：裏面→里面、衞生→卫生、説話→说话。粵語用詞會保留原樣，例如「的士」仍是「的士」。"],
        customTerms["zh-TW"],
        privacy["zh-TW"]
      ]
    },
    en: {
      title: "Hong Kong Traditional Chinese FAQ",
      lead: "Hong Kong Traditional Chinese conversion rewrites Simplified Chinese in the Traditional character forms commonly used in Hong Kong. This page defaults to “Simplified → Hong Kong phrases”. Hong Kong and Taiwan forms differ for several common characters.",
      items: [
        ["How is Hong Kong Traditional different from Taiwan Traditional?", "Common characters differ: 里面→裏面 (Taiwan: 裡面), 着急→着急 (著急), 卫生→衞生 (衛生), 说话→説話 (說話), 床铺→牀鋪 (床鋪), 面包→麪包 (麵包). Also, 台湾 and 舞台 stay as 台灣 and 舞台 in Hong Kong forms, but become 臺灣 and 舞臺 in Taiwan forms."],
        ["Does it replace mainland terms with Hong Kong vocabulary?", "Only a few. The phrase mode changes 鼠标→滑鼠 (mouse) and 服务器→伺服器 (server), and keeps 软件 as 軟件, which is also how Hong Kong writes “software”. 出租车 (taxi) is not changed to the Cantonese 的士, so Cantonese and Hong Kong expressions need manual editing."],
        ["Can Hong Kong Traditional be converted back to Simplified?", "Yes. Choose “Hong Kong → Simplified”: 裏面→里面, 衞生→卫生, 説話→说话. Cantonese words stay unchanged; for example, 的士 remains 的士."],
        customTerms.en,
        privacy.en
      ]
    },
    ja: {
      title: "香港繁体字変換のよくある質問",
      lead: "香港繁体字変換は、簡体字の中国語を香港でよく使われる繁体字の字形に書き換えることです。このページは初期設定で「簡体字 → 香港用語込み」を使います。香港と台湾では、よく使う字の形がいくつも異なります。",
      items: [
        ["香港繁体字と台湾繁体字はどう違いますか？", "よく使う字の形が異なります：里面→裏面（台湾：裡面）、着急→着急（著急）、卫生→衞生（衛生）、说话→説話（說話）、床铺→牀鋪（床鋪）、面包→麪包（麵包）。また「台湾、舞台」は香港繁体字では「台灣、舞台」のままですが、台湾繁体字では「臺灣、舞臺」になります。"],
        ["中国大陸の用語を香港の言い方に変えますか？", "一部だけです。用語込みモードでは鼠标→滑鼠、服务器→伺服器に置き換え、「软件」は香港でも使われる「軟件」のままです。「出租车」が広東語の「的士」に変わることはないため、広東語や香港特有の表現は手作業で直してください。"],
        ["香港繁体字を簡体字に戻せますか？", "戻せます。「香港繁体字 → 簡体字」を選ぶと、裏面→里面、衞生→卫生、説話→说话になります。広東語の語はそのまま残り、たとえば「的士」は「的士」のままです。"],
        customTerms.ja,
        privacy.ja
      ]
    },
    ko: {
      title: "홍콩 번체 변환 자주 묻는 질문",
      lead: "홍콩 번체 변환은 간체 중국어를 홍콩에서 흔히 쓰는 번체 자형으로 바꾸는 작업입니다. 이 페이지는 기본으로 ‘간체 → 홍콩 용어 포함’을 사용합니다. 홍콩과 대만은 자주 쓰는 여러 글자의 모양이 다릅니다.",
      items: [
        ["홍콩 번체와 대만 번체는 무엇이 다른가요?", "자주 쓰는 글자 모양이 다릅니다: 里面→裏面(대만: 裡面), 着急→着急(著急), 卫生→衞生(衛生), 说话→説話(說話), 床铺→牀鋪(床鋪), 面包→麪包(麵包). 또 台湾, 舞台는 홍콩 번체에서 台灣, 舞台로 남지만 대만 정체에서는 臺灣, 舞臺가 됩니다."],
        ["중국 대륙 용어를 홍콩식 표현으로 바꾸나요?", "일부만 바꿉니다. 용어 포함 모드는 鼠标→滑鼠, 服务器→伺服器로 바꾸고, 软件은 홍콩에서도 쓰는 軟件으로 유지합니다. 出租车(택시)는 광둥어 的士로 바뀌지 않으므로 광둥어와 홍콩식 표현은 직접 고쳐야 합니다."],
        ["홍콩 번체를 간체로 되돌릴 수 있나요?", "네. ‘홍콩 번체 → 간체’를 고르면 裏面→里面, 衞生→卫生, 説話→说话가 됩니다. 광둥어 단어는 그대로 남아 的士는 的士로 유지됩니다."],
        customTerms.ko,
        privacy.ko
      ]
    }
  }
};
