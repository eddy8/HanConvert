export const SCENARIO_LOCALES = Object.freeze({
  "zh-CN": Object.freeze({ prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文" }),
  "zh-TW": Object.freeze({ prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文" }),
  en: Object.freeze({ prefix: "en/", lang: "en", hreflang: "en", label: "English" }),
  ja: Object.freeze({ prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語" }),
  ko: Object.freeze({ prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어" })
});

export const SCENARIO_UI = Object.freeze({
  "zh-CN": Object.freeze({
    skip: "跳到主要内容", home: "网站首页", language: "语言", nav: "主要导航", footer: "页脚导航",
    about: "关于我们", contact: "联系我们", privacy: "隐私声明", openTool: "打开对应工具", related: "同类场景",
    overview: "适合这个场景的处理方式", howTitle: "使用步骤", faqTitle: "常见问题", breadcrumb: "路径导航",
    localTitle: "优先在浏览器处理", localBody: "无需注册。能在本地完成的读取、转换和排版均留在当前浏览器中。",
    boundaryTitle: "先确认处理边界", steps: Object.freeze({
      file: ["选择对应格式的文件并确认其中包含可读取文字。", "进入文件转换工具，选择简体、繁体、台湾正体或香港繁体方向。", "核对提取结果后复制转换文字；重要文件请保留原件。"],
      kanji: ["确认输入文字属于中国简体、繁体或日本新字体。", "进入三体转换工具并选择正确的输入文字类型。", "并排核对日本汉字、简体字和繁体字结果后再使用。"],
      worksheet: ["输入要练习的汉字、词语或短句。", "打开对应预设，再调整格子、描红、拼音、笔顺和行列数。", "检查打印预览后直接打印，或在浏览器中另存为 PDF。"]
    }),
    privacyQ: "内容会上传到服务器吗？", privacyA: "不会。页面跳转到相应主工具后，文本提取、字形转换和练习纸排版优先在浏览器本地完成。",
    toolQ: "为什么还要进入主工具？", toolA: "场景页负责给出针对性的设置和注意事项，主工具集中维护完整转换能力，避免产生功能不同步。",
    footerText: "JianFan.app 提供中文、日文和韩文相关的文字转换、汉字查询、笔顺与练习工具。"
  }),
  "zh-TW": Object.freeze({
    skip: "跳到主要內容", home: "網站首頁", language: "語言", nav: "主要導覽", footer: "頁尾導覽",
    about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", openTool: "開啟對應工具", related: "同類情境",
    overview: "適合這個情境的處理方式", howTitle: "使用步驟", faqTitle: "常見問題", breadcrumb: "路徑導覽",
    localTitle: "優先在瀏覽器處理", localBody: "不必註冊。可在本機完成的讀取、轉換與排版都會留在目前的瀏覽器中。",
    boundaryTitle: "先確認處理限制", steps: Object.freeze({
      file: ["選擇對應格式的檔案，並確認其中含有可讀取的文字。", "進入檔案轉換工具，選擇簡體、繁體、台灣正體或香港繁體方向。", "核對擷取結果後複製轉換文字；重要檔案請保留原檔。"],
      kanji: ["確認輸入文字屬於中國簡體、繁體或日本新字體。", "進入三體轉換工具並選擇正確的輸入文字類型。", "並排核對日本漢字、簡體字與繁體字結果後再使用。"],
      worksheet: ["輸入要練習的國字、詞語或短句。", "開啟對應預設，再調整格線、描紅、讀音、筆順與行列數。", "檢查列印預覽後直接列印，或在瀏覽器中另存為 PDF。"]
    }),
    privacyQ: "內容會上傳到伺服器嗎？", privacyA: "不會。前往相應主工具後，文字擷取、字形轉換與練習紙排版都優先在瀏覽器本機完成。",
    toolQ: "為什麼還要進入主工具？", toolA: "情境頁提供專用設定與注意事項，主工具集中維護完整功能，避免不同頁面的處理結果不一致。",
    footerText: "JianFan.app 提供中文、日文與韓文相關的文字轉換、漢字查詢、筆順及練習工具。"
  }),
  en: Object.freeze({
    skip: "Skip to main content", home: "Home", language: "Language", nav: "Primary navigation", footer: "Footer navigation",
    about: "About", contact: "Contact", privacy: "Privacy", openTool: "Open the configured tool", related: "Related scenarios",
    overview: "A focused workflow for this task", howTitle: "How to use it", faqTitle: "Frequently asked questions", breadcrumb: "Breadcrumb",
    localTitle: "Browser-first processing", localBody: "No account is required. Extraction, conversion, and worksheet layout stay in your current browser whenever the task can be completed locally.",
    boundaryTitle: "Know the format limits", steps: Object.freeze({
      file: ["Choose the matching file format and confirm that it contains selectable text.", "Open the file converter and select Simplified, Traditional, Taiwan, or Hong Kong Chinese.", "Review the extracted text before copying the result, and keep the original file for reference."],
      kanji: ["Identify whether the source uses Simplified Chinese, Traditional Chinese, or modern Japanese Kanji.", "Open the three-way converter and select the correct source type.", "Compare the Japanese, Simplified, and Traditional columns before using the result."],
      worksheet: ["Enter the Chinese characters, words, or short sentence you want to practise.", "Open the preset and adjust the grid, tracing, Pinyin, stroke order, rows, and columns.", "Check the print preview, then print the sheet or save it as a PDF from your browser."]
    }),
    privacyQ: "Is my content uploaded?", privacyA: "No. After you open the main tool, supported extraction, glyph conversion, and worksheet layout are performed locally in your browser.",
    toolQ: "Why does this page open the main tool?", toolA: "This page explains the task and supplies a focused preset. The shared tool keeps conversion behaviour consistent across every scenario.",
    footerText: "JianFan.app provides Chinese, Japanese, and Korean text conversion, character lookup, stroke-order, and printable practice tools."
  }),
  ja: Object.freeze({
    skip: "メインコンテンツへ移動", home: "ホーム", language: "言語", nav: "メインナビゲーション", footer: "フッターナビゲーション",
    about: "運営者情報", contact: "お問い合わせ", privacy: "プライバシー", openTool: "設定済みツールを開く", related: "関連する用途",
    overview: "この用途に合った処理方法", howTitle: "使い方", faqTitle: "よくある質問", breadcrumb: "パンくずリスト",
    localTitle: "ブラウザ内で優先処理", localBody: "登録は不要です。対応する文字抽出・字形変換・プリント作成は、できる限り現在のブラウザ内で処理します。",
    boundaryTitle: "対応範囲を事前に確認", steps: Object.freeze({
      file: ["対応するファイル形式を選び、文字を選択できる文書か確認します。", "ファイル変換ツールを開き、簡体字・繁体字・台湾・香港向けの変換方向を選びます。", "抽出結果を確認してからコピーし、大切な文書は元ファイルも保管します。"],
      kanji: ["入力が中国語の簡体字・繁体字・日本の新字体のどれか確認します。", "3種類変換ツールを開き、入力文字の種類を正しく選びます。", "日本語漢字・簡体字・繁体字を並べて確認してから利用します。"],
      worksheet: ["練習したい漢字・単語・短い文を入力します。", "用途別の初期設定を開き、マス目・なぞり書き・読み・筆順・行列を調整します。", "印刷プレビューを確認し、そのまま印刷するか PDF として保存します。"]
    }),
    privacyQ: "入力内容はサーバーへ送信されますか？", privacyA: "いいえ。メインツールを開いた後も、対応する文字抽出・字形変換・プリント作成はブラウザ内で処理します。",
    toolQ: "なぜメインツールを開くのですか？", toolA: "このページは用途別の設定と注意点を示し、共通ツール側で変換処理を一元管理して結果のずれを防ぎます。",
    footerText: "JianFan.app は中国語・日本語・韓国語の文字変換、漢字検索、筆順、練習プリントを提供します。"
  }),
  ko: Object.freeze({
    skip: "본문으로 이동", home: "홈", language: "언어", nav: "주요 메뉴", footer: "하단 메뉴",
    about: "소개", contact: "문의", privacy: "개인정보 처리방침", openTool: "설정된 도구 열기", related: "관련 활용 방법",
    overview: "이 작업에 맞는 처리 방법", howTitle: "사용 방법", faqTitle: "자주 묻는 질문", breadcrumb: "이동 경로",
    localTitle: "브라우저에서 우선 처리", localBody: "가입할 필요가 없습니다. 지원되는 텍스트 추출, 글자 변환, 연습지 편집은 가능한 한 현재 브라우저에서 처리합니다.",
    boundaryTitle: "지원 범위 먼저 확인", steps: Object.freeze({
      file: ["알맞은 파일 형식을 고르고 선택 가능한 텍스트가 들어 있는지 확인합니다.", "파일 변환 도구를 열어 간체, 번체, 대만 정체자 또는 홍콩 번체 변환 방향을 고릅니다.", "추출 결과를 확인한 뒤 복사하고 중요한 문서는 원본도 보관합니다."],
      kanji: ["입력문이 중국 간체, 번체 또는 일본 신자체인지 확인합니다.", "세 가지 글자 변환 도구를 열고 올바른 입력 문자 유형을 고릅니다.", "일본 한자, 간체자, 번체자 결과를 나란히 확인한 뒤 사용합니다."],
      worksheet: ["연습할 한자, 단어 또는 짧은 문장을 입력합니다.", "용도별 설정을 열고 격자, 따라쓰기, 읽기, 필순, 행과 열을 조정합니다.", "인쇄 미리보기를 확인한 뒤 바로 인쇄하거나 PDF로 저장합니다."]
    }),
    privacyQ: "입력한 내용이 서버로 전송되나요?", privacyA: "아니요. 기본 도구를 연 뒤에도 지원되는 텍스트 추출, 글자 변환, 연습지 편집은 브라우저에서 처리합니다.",
    toolQ: "왜 기본 도구로 이동하나요?", toolA: "이 페이지는 작업별 설정과 주의점을 제공하고, 공통 도구에서 실제 처리를 관리해 기능과 결과를 일관되게 유지합니다.",
    footerText: "JianFan.app은 중국어·일본어·한국어 문자 변환, 한자 검색, 필순, 인쇄용 연습 도구를 제공합니다."
  })
});

const fileScenarios = [
  {
    slug: "word-chinese-converter", category: "file", tool: "file-text-converter", query: "?config=s2t#fileImportTitle", badge: "DOCX",
    localized: {
      "zh-CN": { name: "Word文档简繁转换", title: "Word文档简繁转换与文字提取在线工具 | JianFan", description: "在线读取 DOCX Word 文档中的中文文字，并进行简体、繁体、台湾正体或香港繁体转换。文件在浏览器本地处理，可合并多份文档并复制结果，适合合同、报告与文章初步转换。", lede: "上传 DOCX 文档，提取其中的段落文字后转换简繁体，不必先把整篇内容复制到文本框。", specific: "工具使用 Mammoth 读取 DOCX 的文字内容，适合以段落为主的合同、报告和文章。", limit: "不保留 Word 的字体、图片、批注和复杂版式；旧版 .doc 文件需先另存为 .docx。", question: "Word 简繁转换会保留原来的排版吗？", answer: "不会。此工具提取文字后进行字形转换，输出适合复制使用，不会重新生成保持原排版的 Word 文件。" },
      "zh-TW": { name: "Word文件簡繁轉換", title: "Word文件簡繁轉換與文字擷取線上工具 | JianFan", description: "線上讀取 DOCX Word 文件中的中文文字，轉成簡體、繁體、台灣正體或香港繁體。檔案在瀏覽器本機處理，可合併多份文件並複製結果，適合合約、報告與文章初步轉換。", lede: "上傳 DOCX 文件，擷取段落文字後轉換簡繁體，不必先將整篇內容複製到文字框。", specific: "工具使用 Mammoth 讀取 DOCX 文字，適合以段落為主的合約、報告與文章。", limit: "不保留 Word 的字型、圖片、註解與複雜版面；舊版 .doc 請先另存為 .docx。", question: "Word 簡繁轉換會保留原本的排版嗎？", answer: "不會。工具擷取文字後進行字形轉換，結果適合複製使用，不會重新產生保留原版面的 Word 檔。" },
      en: { name: "Word Chinese converter", title: "Word Chinese Converter for DOCX Files Online | JianFan", description: "Extract Chinese text from DOCX Word files and convert it between Simplified, Traditional, Taiwan, or Hong Kong forms locally in your browser, free online.", lede: "Upload a DOCX file, extract its paragraph text, and convert Chinese character forms without copying the whole document into a text box first.", specific: "The tool uses Mammoth to read text from DOCX files, making it practical for paragraph-based reports, contracts, and articles.", limit: "Fonts, images, comments, and complex Word layout are not preserved. Save legacy .doc files as .docx before opening them.", question: "Does the Word Chinese converter preserve document formatting?", answer: "No. It extracts text for character-form conversion and copyable output; it does not rebuild a formatted Word document." },
      ja: { name: "Word中国語簡体字・繁体字変換", title: "Word中国語簡体字・繁体字変換ツール | JianFan", description: "DOCX形式のWord文書から中国語テキストをブラウザ内で抽出し、簡体字・繁体字・台湾・香港向け表記へ無料変換。複数文書の結合と結果コピーにも対応します。", lede: "DOCX文書を選ぶだけで段落テキストを抽出し、全文を手作業で貼り付けずに簡体字・繁体字を変換できます。", specific: "MammothでDOCX内の文字を読み取るため、文章中心の報告書・契約書・記事に向いています。", limit: "フォント・画像・コメント・複雑なレイアウトは保持しません。旧形式の.docは.docxへ保存し直してください。", question: "Wordの書式を保ったまま変換できますか？", answer: "できません。文字を抽出して字形を変換するツールであり、元のレイアウトを持つWord文書は再生成しません。" },
      ko: { name: "Word 중국어 간체 번체 변환", title: "Word 중국어 간체 번체 변환 온라인 도구 | JianFan", description: "DOCX Word 문서의 중국어 텍스트를 브라우저에서 추출해 간체, 번체, 대만 정체자, 홍콩 번체로 무료 변환합니다. 여러 문서를 합치고 결과를 복사할 수 있어 계약서와 보고서에 편리합니다.", lede: "DOCX 문서를 올려 문단 텍스트를 추출하고, 전체 내용을 직접 붙여 넣지 않고도 중국어 간체와 번체를 변환합니다.", specific: "Mammoth로 DOCX의 텍스트를 읽으므로 문단 중심의 계약서, 보고서, 기사에 적합합니다.", limit: "글꼴, 이미지, 메모, 복잡한 Word 배치는 유지하지 않습니다. 예전 .doc 파일은 .docx로 저장한 뒤 이용하세요.", question: "Word 문서의 원래 서식도 유지되나요?", answer: "아니요. 텍스트를 추출해 글자 모양을 변환하고 복사할 수 있게 하며, 기존 배치를 유지한 Word 파일을 다시 만들지는 않습니다." }
    }
  },
  {
    slug: "pdf-chinese-converter", category: "file", tool: "file-text-converter", query: "?config=s2t#fileImportTitle", badge: "PDF",
    localized: {
      "zh-CN": { name: "PDF中文简繁转换", title: "PDF中文简繁转换与文字提取在线工具 | JianFan", description: "在线提取文字型 PDF 中的中文内容，并转换为简体、繁体、台湾正体或香港繁体。文件在浏览器本地读取，可复制转换结果，适合论文、资料和电子书的文字初步整理。", lede: "从可以选择文字的 PDF 中提取中文内容，再统一转换为需要的简体或繁体字形。", specific: "工具逐页读取 PDF 的文字层，适合论文、说明书、资料和由办公软件导出的 PDF。", limit: "扫描件或只有图片的 PDF 没有可用文字层，不能在此页完成 OCR；复杂分栏的阅读顺序也可能需要校对。", question: "扫描版 PDF 可以直接转换简繁体吗？", answer: "不可以。扫描版需要先做 OCR；本工具只提取 PDF 已有的文字层，并对提取结果转换字形。" },
      "zh-TW": { name: "PDF中文簡繁轉換", title: "PDF中文簡繁轉換與文字擷取線上工具 | JianFan", description: "線上擷取文字型 PDF 中的中文內容，轉成簡體、繁體、台灣正體或香港繁體。檔案在瀏覽器本機讀取，可複製轉換結果，適合論文、資料與電子書的文字初步整理。", lede: "從能夠選取文字的 PDF 擷取中文內容，再統一轉成需要的簡體或繁體字形。", specific: "工具逐頁讀取 PDF 的文字層，適合論文、說明書、資料及由辦公軟體匯出的 PDF。", limit: "掃描檔或只有圖片的 PDF 沒有可用文字層，無法在此完成 OCR；複雜分欄的閱讀順序也可能需要校對。", question: "掃描版 PDF 可以直接轉換簡繁體嗎？", answer: "不可以。掃描版必須先做 OCR；本工具只擷取 PDF 現有的文字層，再轉換擷取結果的字形。" },
      en: { name: "PDF Chinese converter", title: "PDF Chinese Text Converter Online for Free | JianFan", description: "Extract selectable Chinese text from PDF files and convert it to Simplified, Traditional, Taiwan, or Hong Kong forms locally in your browser, free online.", lede: "Extract Chinese from a text-based PDF and standardise it into the Simplified or Traditional character form you need.", specific: "The tool reads each PDF page's text layer, which works well for papers, manuals, reference material, and office-generated PDFs.", limit: "Scans and image-only PDFs require OCR first. Multi-column reading order may also need manual review after extraction.", question: "Can this tool convert a scanned Chinese PDF?", answer: "Not directly. It reads an existing PDF text layer; scanned pages need OCR before their Chinese text can be converted." },
      ja: { name: "PDF中国語簡体字・繁体字変換", title: "PDF中国語簡体字・繁体字変換ツール | JianFan", description: "文字を選択できるPDFから中国語をブラウザ内で抽出し、簡体字・繁体字・台湾・香港向け表記へ無料変換。論文、資料、電子書籍のテキスト整理とコピーに使えます。", lede: "文字情報を持つPDFから中国語を抽出し、必要な簡体字・繁体字の表記へまとめて変換します。", specific: "PDF各ページの文字レイヤーを読むため、論文・説明書・資料・オフィス文書から作成したPDFに適しています。", limit: "スキャン画像だけのPDFにはOCRが必要です。段組みが複雑な文書は抽出後の読む順番も確認してください。", question: "スキャンしたPDFも簡体字・繁体字へ変換できますか？", answer: "直接はできません。既存の文字レイヤーを読み取るため、画像だけのPDFは先にOCR処理が必要です。" },
      ko: { name: "PDF 중국어 간체 번체 변환", title: "PDF 중국어 간체 번체 변환 온라인 도구 | JianFan", description: "선택 가능한 PDF의 중국어 텍스트를 브라우저에서 추출해 간체, 번체, 대만 정체자, 홍콩 번체로 무료 변환합니다. 논문, 자료, 전자책의 텍스트를 정리하고 복사할 때 편리합니다.", lede: "텍스트 선택이 가능한 PDF에서 중국어를 추출하고 필요한 간체 또는 번체 글자 형태로 한 번에 변환합니다.", specific: "PDF 페이지의 텍스트 레이어를 읽으므로 논문, 설명서, 참고 자료, 오피스에서 만든 PDF에 적합합니다.", limit: "스캔 이미지로만 된 PDF는 먼저 OCR이 필요합니다. 여러 단으로 된 문서는 추출 순서를 확인해야 할 수 있습니다.", question: "스캔한 PDF도 바로 간체·번체로 바꿀 수 있나요?", answer: "바로 처리할 수 없습니다. 기존 텍스트 레이어만 읽으므로 이미지 PDF는 먼저 OCR로 문자를 추출해야 합니다." }
    }
  },
  {
    slug: "excel-chinese-converter", category: "file", tool: "file-text-converter", query: "?config=s2t#fileImportTitle", badge: "XLSX",
    localized: {
      "zh-CN": { name: "Excel表格简繁转换", title: "Excel表格简繁转换与文字提取在线工具 | JianFan", description: "在线读取 XLSX、XLS Excel 表格中的单元格文字，按工作表提取后转换为简体、繁体、台湾正体或香港繁体。文件仅在浏览器中处理，适合名单、术语表和资料表校对。", lede: "读取 Excel 各工作表中的单元格文字，转换中文简繁体后集中复制和校对。", specific: "工具依照工作表读取单元格并转成接近 CSV 的纯文本，适合名单、术语表和内容资料表。", limit: "公式只读取当前保存的结果，颜色、合并单元格、图表和工作簿格式不会写回或保留。", question: "转换后会下载一个新的 Excel 文件吗？", answer: "不会。工具提取并转换单元格文字，输出为可复制文本，不会修改原工作簿或生成保留格式的 XLSX。" },
      "zh-TW": { name: "Excel表格簡繁轉換", title: "Excel表格簡繁轉換與文字擷取線上工具 | JianFan", description: "線上讀取 XLSX、XLS Excel 表格的儲存格文字，依工作表擷取後轉成簡體、繁體、台灣正體或香港繁體。檔案只在瀏覽器處理，適合名單、術語表與資料表校對。", lede: "讀取 Excel 各工作表中的儲存格文字，轉換中文簡繁體後集中複製與校對。", specific: "工具依工作表讀取儲存格並轉成接近 CSV 的純文字，適合名單、術語表與內容資料表。", limit: "公式只讀取目前儲存的結果，色彩、合併儲存格、圖表與活頁簿格式不會寫回或保留。", question: "轉換後會下載一個新的 Excel 檔案嗎？", answer: "不會。工具擷取並轉換儲存格文字，輸出為可複製文字，不會修改原活頁簿或產生保留格式的 XLSX。" },
      en: { name: "Excel Chinese converter", title: "Excel Chinese Converter for XLSX Files Online | JianFan", description: "Extract cell text from XLSX or XLS spreadsheets and convert Chinese to Simplified, Traditional, Taiwan, or Hong Kong forms locally in your browser online.", lede: "Read cell text from each Excel worksheet, convert its Chinese character forms, and gather the result for copying and review.", specific: "Worksheets are rendered as CSV-like plain text, which is useful for names, terminology lists, and content inventories.", limit: "Formulas use their saved values. Cell formatting, merged cells, charts, and workbook layout are not preserved or written back.", question: "Will the converter download a new formatted Excel workbook?", answer: "No. It extracts and converts cell text for copying; it does not edit the source workbook or rebuild an XLSX file." },
      ja: { name: "Excel中国語簡体字・繁体字変換", title: "Excel中国語簡体字・繁体字変換ツール | JianFan", description: "XLSX・XLSのセル文字列をシート別にブラウザ内で抽出し、中国語の簡体字・繁体字・台湾・香港向け表記へ無料変換。名簿、用語集、商品データの確認に便利です。", lede: "Excelの各シートからセル文字列を読み取り、中国語の字形を変換してまとめてコピー・確認できます。", specific: "シートをCSVに近いプレーンテキストへ展開するため、名簿・用語集・商品データの整理に向いています。", limit: "数式は保存済みの値を読みます。色・結合セル・グラフ・ブックの書式は保持せず、元ファイルへ書き戻しません。", question: "変換後のExcelファイルをダウンロードできますか？", answer: "できません。セル文字列を抽出して変換する機能であり、書式を保ったXLSXは作成しません。" },
      ko: { name: "Excel 중국어 간체 번체 변환", title: "Excel 중국어 간체 번체 변환 온라인 도구 | JianFan", description: "XLSX와 XLS 스프레드시트의 셀 텍스트를 시트별로 추출해 간체, 번체, 대만 정체자, 홍콩 번체로 무료 변환합니다. 명단, 용어집, 상품 자료를 확인하고 복사할 때 편리합니다.", lede: "Excel 각 시트의 셀 텍스트를 읽어 중국어 글자 형태를 변환하고 한곳에서 복사하거나 검토합니다.", specific: "시트를 CSV와 비슷한 일반 텍스트로 펼치므로 명단, 용어집, 상품 데이터 정리에 적합합니다.", limit: "수식은 저장된 결과를 읽습니다. 색상, 병합 셀, 차트, 통합 문서 서식은 유지하거나 원본에 다시 쓰지 않습니다.", question: "변환한 새 Excel 파일을 내려받을 수 있나요?", answer: "아니요. 셀 텍스트를 추출하고 변환해 복사할 수 있게 하며, 서식이 유지된 XLSX 파일은 만들지 않습니다." }
    }
  },
  {
    slug: "txt-chinese-converter", category: "file", tool: "file-text-converter", query: "?config=s2t#fileImportTitle", badge: "TXT",
    localized: {
      "zh-CN": { name: "TXT文件简繁转换", title: "TXT文件简繁转换与纯文本在线工具 | JianFan.app", description: "在线读取 TXT、Markdown 纯文本并转换为简体、繁体、台湾正体或香港繁体。支持大文本分块转换、自定义词库和结果复制，内容仅在浏览器本地处理，适合小说与资料整理。", lede: "直接选择 TXT 或 Markdown 文件，保留换行并把全文转换为需要的简体或繁体字形。", specific: "纯文本没有复杂排版，提取稳定，适合小说、字幕、日志、代码注释和批量资料。", limit: "工具会尝试识别常见编码；少见编码或原文件已经乱码时，应先使用文本编辑器转换为 UTF-8。", question: "很大的 TXT 文件也能转换吗？", answer: "可以在网站限制内处理。长文本会分块转换以降低内存占用，但仍建议先保留原文件并抽查分段结果。" },
      "zh-TW": { name: "TXT檔案簡繁轉換", title: "TXT檔案簡繁轉換與純文字線上工具 | JianFan", description: "線上讀取 TXT、Markdown 純文字並轉成簡體、繁體、台灣正體或香港繁體。支援長文字分段轉換、自訂詞庫及結果複製，內容只在瀏覽器本機處理，適合小說與資料整理。", lede: "直接選擇 TXT 或 Markdown 檔案，保留換行並將全文轉成需要的簡體或繁體字形。", specific: "純文字沒有複雜版面，擷取穩定，適合小說、字幕、日誌、程式註解與批次資料。", limit: "工具會嘗試辨識常見編碼；少見編碼或原檔已經亂碼時，請先用文字編輯器轉成 UTF-8。", question: "很大的 TXT 檔案也能轉換嗎？", answer: "可以在網站限制內處理。長文字會分段轉換以降低記憶體用量，但仍建議保留原檔並抽查各段結果。" },
      en: { name: "TXT Chinese converter", title: "TXT Chinese Text Converter for Large Files | JianFan", description: "Open TXT or Markdown files and convert Chinese to Simplified, Traditional, Taiwan, or Hong Kong forms locally, with chunked processing for long text online.", lede: "Choose a TXT or Markdown file, preserve its line breaks, and convert the full text into the Chinese character form you need.", specific: "Plain text has no complex layout, so extraction is reliable for novels, subtitles, logs, code comments, and collected notes.", limit: "Common encodings are detected when possible. If a rare encoding is already garbled, convert the source to UTF-8 in a text editor first.", question: "Can the tool convert a large TXT file?", answer: "Yes, within the site's limits. Long text is processed in bounded chunks, but you should keep the source and review representative sections." },
      ja: { name: "TXT中国語簡体字・繁体字変換", title: "TXT中国語簡体字・繁体字変換ツール | JianFan", description: "TXT・Markdownの中国語テキストを開き、簡体字・繁体字・台湾・香港向け表記へ無料変換。長文は分割処理し、改行を保ったままブラウザ内で変換・コピーできます。", lede: "TXTまたはMarkdownファイルを選び、改行を保ったまま全文を必要な簡体字・繁体字へ変換します。", specific: "複雑な書式のない純テキストなので、小説・字幕・ログ・コードコメント・資料整理に安定して使えます。", limit: "一般的な文字コードは自動判定します。珍しい文字コードや既に文字化けしたファイルは、先にUTF-8へ変換してください。", question: "容量の大きいTXTファイルも変換できますか？", answer: "サイトの上限内で利用できます。長文はメモリ負荷を抑えて分割処理しますが、元ファイルを残して一部を確認してください。" },
      ko: { name: "TXT 중국어 간체 번체 변환", title: "TXT 중국어 간체 번체 변환 온라인 도구 | JianFan", description: "TXT와 Markdown의 중국어 텍스트를 열어 간체, 번체, 대만 정체자, 홍콩 번체로 무료 변환합니다. 긴 글은 나누어 처리하고 줄바꿈을 유지하며 브라우저에서 결과를 복사할 수 있습니다.", lede: "TXT 또는 Markdown 파일을 고르고 줄바꿈을 유지한 채 전체 글을 필요한 간체나 번체 형태로 변환합니다.", specific: "복잡한 서식이 없는 일반 텍스트라 소설, 자막, 로그, 코드 주석, 자료 정리에 안정적으로 사용할 수 있습니다.", limit: "일반적인 문자 인코딩은 자동으로 확인합니다. 드문 인코딩이거나 이미 깨진 파일은 먼저 UTF-8로 바꾸세요.", question: "큰 TXT 파일도 변환할 수 있나요?", answer: "사이트 제한 안에서 가능합니다. 긴 글은 메모리 부담을 줄이도록 나누어 처리하지만 원본을 보관하고 일부 결과를 확인하세요." }
    }
  },
  {
    slug: "csv-chinese-converter", category: "file", tool: "file-text-converter", query: "?config=s2t#fileImportTitle", badge: "CSV",
    localized: {
      "zh-CN": { name: "CSV文件简繁转换", title: "CSV文件简繁转换与表格文字在线工具 | JianFan", description: "在线读取 CSV 表格中的中文文字，并转换为简体、繁体、台湾正体或香港繁体。文件仅在浏览器本地处理，可保留行列分隔后复制结果，适合商品目录、名单和术语数据校对。", lede: "打开 CSV 数据中的中文字段，统一转换简繁字形后复制到表格软件继续处理。", specific: "适合商品目录、联系人名单、术语库和导出数据；工具以纯文本方式保留原有分隔与换行。", limit: "不会生成新的 CSV 下载文件；字段内含特殊换行或不同分隔符时，复制回表格前应检查列是否对齐。", question: "转换后还能保持 CSV 的行列吗？", answer: "通常会保留原文字中的分隔符和换行，但输出是可复制文本。复杂字段应在粘贴回表格软件后再次校对。" },
      "zh-TW": { name: "CSV檔案簡繁轉換", title: "CSV檔案簡繁轉換與表格文字線上工具 | JianFan", description: "線上讀取 CSV 表格中的中文文字，轉成簡體、繁體、台灣正體或香港繁體。檔案只在瀏覽器本機處理，可保留行列分隔後複製結果，適合商品目錄、名單與術語資料校對。", lede: "開啟 CSV 資料中的中文欄位，統一轉換簡繁字形後複製到試算表軟體繼續處理。", specific: "適合商品目錄、聯絡人名單、術語庫與匯出資料；工具以純文字方式保留原有分隔與換行。", limit: "不會產生新的 CSV 下載檔；欄位含特殊換行或不同分隔符號時，貼回試算表前請檢查欄位是否對齊。", question: "轉換後還能維持 CSV 的行列嗎？", answer: "通常會保留原文字中的分隔符號與換行，但輸出是可複製文字。複雜欄位貼回試算表後仍需再次校對。" },
      en: { name: "CSV Chinese converter", title: "CSV Chinese Text Converter for Table Data | JianFan", description: "Open CSV table data and convert Chinese fields to Simplified, Traditional, Taiwan, or Hong Kong forms locally in your browser while retaining separators online.", lede: "Open Chinese fields from CSV data, standardise their character forms, and copy the result back into your spreadsheet workflow.", specific: "Useful for product catalogues, contact lists, terminology tables, and exports; separators and line breaks remain in the plain-text result.", limit: "The tool does not download a rebuilt CSV. Check column alignment after pasting data that contains unusual delimiters or embedded line breaks.", question: "Will the converted result keep CSV rows and columns?", answer: "It normally retains the original separators and line breaks, but the output is copyable text. Review complex fields after pasting them back." },
      ja: { name: "CSV中国語簡体字・繁体字変換", title: "CSV中国語簡体字・繁体字変換ツール | JianFan", description: "CSV表の中国語フィールドをブラウザ内で読み込み、簡体字・繁体字・台湾・香港向け表記へ無料変換。区切りと改行を保ってコピーでき、商品一覧や用語データの確認に便利です。", lede: "CSVデータの中国語フィールドを開き、字形を統一して表計算ソフトへ戻せる形でコピーします。", specific: "商品一覧・連絡先・用語集・エクスポートデータに適し、区切り文字と改行を純テキストのまま保ちます。", limit: "新しいCSVファイルは生成しません。特殊な改行や区切りを含むフィールドは、貼り戻した後に列の位置を確認してください。", question: "変換後もCSVの行と列は保たれますか？", answer: "通常は区切り文字と改行を維持しますが、出力はコピー用テキストです。複雑なフィールドは貼り戻して確認してください。" },
      ko: { name: "CSV 중국어 간체 번체 변환", title: "CSV 중국어 간체 번체 변환 온라인 도구 | JianFan", description: "CSV 표의 중국어 필드를 브라우저에서 읽어 간체, 번체, 대만 정체자, 홍콩 번체로 무료 변환합니다. 구분자와 줄바꿈을 유지해 복사할 수 있어 상품 목록과 용어 자료 검토에 편리합니다.", lede: "CSV 데이터의 중국어 필드를 열어 글자 형태를 통일하고 스프레드시트 작업에 다시 사용할 수 있게 복사합니다.", specific: "상품 목록, 연락처, 용어집, 내보낸 자료에 적합하며 구분자와 줄바꿈을 일반 텍스트로 유지합니다.", limit: "새 CSV 파일을 만들지는 않습니다. 특수 줄바꿈이나 다른 구분자가 있는 필드는 붙여 넣은 뒤 열 정렬을 확인하세요.", question: "변환 뒤에도 CSV의 행과 열이 유지되나요?", answer: "보통 기존 구분자와 줄바꿈을 유지하지만 결과는 복사용 텍스트입니다. 복잡한 필드는 스프레드시트에 붙여 넣은 뒤 확인하세요." }
    }
  }
];

const kanjiScenarios = [
  ["simplified-chinese-to-japanese-kanji", "simplified", "简体字转日本汉字", "簡體字轉日本漢字", "Simplified Chinese to Japanese Kanji", "簡体字から日本語漢字へ変換", "중국 간체를 일본 한자로 변환", "简体中文输入会先还原对应繁体字形，再映射为现代日本汉字，并同时显示三体对照。", "中國簡體輸入會先還原對應繁體字形，再對應現代日本漢字，並同時顯示三體對照。", "Simplified Chinese is mapped through its Traditional form to modern Japanese Kanji, with all three forms shown for comparison.", "中国語の簡体字を繁体字相当へ戻してから日本の新字体へ対応させ、3種類を並べて表示します。", "중국 간체를 번체 대응 형태로 복원한 뒤 일본 신자체로 매핑하고 세 형태를 함께 보여 줍니다."],
  ["traditional-chinese-to-japanese-kanji", "traditional", "繁体字转日本汉字", "繁體字轉日本漢字", "Traditional Chinese to Japanese Kanji", "繁体字から日本語漢字へ変換", "중국 번체를 일본 한자로 변환", "繁体中文输入会映射为现代日本新字体，并保留原繁体与对应简体供逐字比较。", "繁體中文輸入會對應成現代日本新字體，並保留原繁體與相應簡體供逐字比較。", "Traditional Chinese is mapped to modern Japanese Shinjitai while the original Traditional and matching Simplified forms remain visible.", "繁体字を現代日本の新字体へ対応させ、元の繁体字と簡体字も残して1文字ずつ比較できます。", "중국 번체를 현대 일본 신자체로 매핑하고 원래 번체와 대응 간체를 함께 남겨 비교합니다."],
  ["japanese-kanji-to-simplified-chinese", "japanese", "日本汉字转简体中文", "日本漢字轉簡體中文", "Japanese Kanji to Simplified Chinese", "日本語漢字から中国語簡体字へ変換", "일본 한자를 중국 간체로 변환", "日本新字体输入会先对应到传统字形，再转换为中国简体字，并显示三种结果帮助校对。", "日本新字體輸入會先對應至傳統字形，再轉成中國簡體字，並顯示三種結果協助校對。", "Modern Japanese Kanji is mapped through the Traditional form to Simplified Chinese, with three outputs available for review.", "日本の新字体を伝統字形に対応させてから中国語簡体字へ変換し、3種類の結果を確認できます。", "일본 신자체를 전통 자형에 대응시킨 뒤 중국 간체로 변환하고 세 결과를 검토할 수 있습니다."],
  ["japanese-kanji-to-traditional-chinese", "japanese", "日本汉字转繁体中文", "日本漢字轉繁體中文", "Japanese Kanji to Traditional Chinese", "日本語漢字から中国語繁体字へ変換", "일본 한자를 중국 번체로 변환", "日本新字体输入会转换为对应繁体字，并同时列出中国简体字，便于处理姓名、资料与旧文献。", "日本新字體輸入會轉成相應繁體字，並同時列出中國簡體字，方便處理姓名、資料與舊文獻。", "Modern Japanese Kanji is mapped to the corresponding Traditional Chinese form, with Simplified Chinese shown beside it for reference.", "日本の新字体を対応する中国語繁体字へ変換し、参考用の簡体字も並べて表示します。", "일본 신자체를 대응하는 중국 번체로 바꾸고 참고할 수 있도록 간체도 함께 표시합니다."],
  ["chinese-japanese-kanji-comparison", "simplified", "中日汉字字形对照", "中日漢字字形對照", "Chinese and Japanese Kanji Comparison", "日本語漢字・簡体字・繁体字を比較", "일본 한자·중국 간체·번체 비교", "输入中文或日文文本后并排显示日本新字体、中国简体字和繁体字，只整理实际发生变化的字形。", "輸入中文或日文文字後並排顯示日本新字體、中國簡體字與繁體字，只整理實際發生變化的字形。", "Paste Chinese or Japanese text to compare modern Japanese Kanji, Simplified Chinese, and Traditional Chinese side by side, including changed glyph pairs.", "中国語または日本語を入力し、日本の新字体・中国語簡体字・繁体字を並べ、変化した字形だけを対応表で確認します。", "중국어나 일본어를 입력해 일본 신자체, 중국 간체, 번체를 나란히 보고 달라진 글자만 대조표로 확인합니다."]
].map(([slug, source, zhName, twName, enName, jaName, koName, zhSpecific, twSpecific, enSpecific, jaSpecific, koSpecific]) => ({
  slug, category: "kanji", tool: "japanese-chinese-kanji-converter", query: `?source=${source}#toolTitle`, badge: "日 / 简 / 繁",
  localized: {
    "zh-CN": { name: zhName, title: `${zhName}在线转换与三体对照工具 | JianFan`, description: `${zhSpecific}工具支持长文本分块处理、结果复制与差异表，适合学习、姓名核对和资料整理。`, lede: zhSpecific, specific: zhSpecific, limit: "这是字形对应工具，不会把中文词句翻译成日语，也不能替代姓名、地名和专业术语的人工确认。", question: `${zhName}等同于翻译吗？`, answer: "不等同。工具只转换有对应关系的汉字字形，不改变语法、词序、读音和词语含义。" },
    "zh-TW": { name: twName, title: `${twName}線上轉換與三體對照工具 | JianFan`, description: `${twSpecific}支援長文字分段處理、結果複製與差異表，適合學習、姓名核對與資料整理。`, lede: twSpecific, specific: twSpecific, limit: "這是字形對應工具，不會把中文詞句翻譯成日文，也不能取代姓名、地名與專業術語的人工確認。", question: `${twName}等同翻譯嗎？`, answer: "不等同。工具只轉換有對應關係的漢字字形，不會改變文法、語序、讀音及詞語含義。" },
    en: { name: enName, title: `${enName} Converter Online | JianFan`, description: `${enSpecific} It processes long text in chunks and provides copyable results plus a focused glyph-difference table for careful review.`, lede: enSpecific, specific: enSpecific, limit: "This is orthographic mapping, not Chinese-Japanese translation. It does not rewrite grammar, word order, readings, names, or terminology.", question: `Is ${enName.toLowerCase()} the same as translation?`, answer: "No. The tool maps corresponding character forms; it does not translate vocabulary, grammar, pronunciation, or meaning." },
    ja: { name: jaName, title: `${jaName}オンラインツール | JianFan`, description: `${jaSpecific}長文の分割処理、結果コピー、字形差分表に対応し、学習・氏名確認・資料整理に無料で使えます。`, lede: jaSpecific, specific: jaSpecific, limit: "字形の対応を変換する機能であり、中国語と日本語の翻訳ではありません。文法・語順・読み・固有名詞は別途確認してください。", question: `${jaName}は翻訳と同じですか？`, answer: "同じではありません。対応する漢字の形だけを変換し、語彙・文法・読み方・意味は翻訳しません。" },
    ko: { name: koName, title: `${koName} 온라인 변환 도구 | JianFan`, description: `${koSpecific} 긴 글 분할 처리, 결과 복사, 글자 차이표를 지원해 학습, 이름 확인, 자료 정리에 무료로 활용할 수 있습니다.`, lede: koSpecific, specific: koSpecific, limit: "글자 모양 대응을 바꾸는 기능이며 중국어와 일본어 번역이 아닙니다. 문법, 어순, 발음, 이름, 전문 용어는 따로 확인하세요.", question: `${koName}은 번역과 같은가요?`, answer: "아닙니다. 대응하는 한자 모양만 변환하며 어휘, 문법, 발음, 의미를 번역하지 않습니다." }
  }
}));

const worksheetScenarios = [
  ["tian-zi-ge-worksheet", "?grid=tian&trace=3&pinyin=1&strokes=1", "田字格字帖生成器", "田字格國字練習紙", "Tian Zi Ge worksheet generator", "漢字マス目練習プリント作成", "한자 십자 격자 연습장 만들기", "田字格用中间十字帮助观察汉字上下、左右比例，适合初学者从描红逐步过渡到独立书写。", "田字格利用中央十字協助觀察國字上下、左右比例，適合初學者從描紅逐步過渡到獨立書寫。", "Tian Zi Ge uses centre cross guides to show Chinese character proportions and supports a gradual move from tracing to independent writing.", "中央の十字ガイドで漢字の上下左右のバランスを確認し、なぞり書きから自力で書く練習へ進めます。", "가운데 십자선을 기준으로 한자의 위아래와 좌우 비율을 익히며 따라쓰기에서 혼자 쓰기로 단계적으로 연습합니다."],
  ["mi-zi-ge-worksheet", "?grid=mi&trace=3&pinyin=1&strokes=1", "米字格字帖生成器", "米字格國字練習紙", "Mi Zi Ge worksheet generator", "対角線マス漢字練習プリント作成", "한자 대각선 격자 연습장 만들기", "米字格在十字基础上增加对角线，便于定位撇、捺、斜钩等倾斜笔画和字形重心。", "米字格在十字上增加對角線，方便定位撇、捺、斜鉤等傾斜筆畫與字形重心。", "Mi Zi Ge adds diagonal guides to the centre cross, helping learners place slanted strokes and judge the visual centre of each Hanzi.", "十字に対角線を加えたマス目で、払い・斜めの画・文字の重心を位置取りしやすくします。", "십자선에 대각선을 더해 삐침과 비스듬한 획의 위치, 한자 전체의 무게중심을 더 쉽게 확인합니다."],
  ["hanzi-tracing-worksheet", "?grid=tian&trace=6&pinyin=1&strokes=0", "汉字描红字帖生成器", "國字描紅練習紙產生器", "Chinese character tracing sheet generator", "漢字なぞり書きプリント作成", "한자 따라쓰기 학습지 만들기", "增加浅色描红格并保留后续空格，让儿童和初学者先沿字形书写，再逐渐减少提示。", "增加淺色描紅格並保留後續空格，讓兒童與初學者先沿字形書寫，再逐步減少提示。", "More faded tracing boxes are followed by blank practice cells so beginners can copy the form first and then write it from memory.", "薄い見本文字を多めに並べ、その後に空欄を置くことで、形をなぞってから自力で書く練習へ移れます。", "옅은 따라쓰기 칸 뒤에 빈칸을 배치해 초보자가 글자 모양을 따라 쓴 다음 기억해서 쓰도록 연습합니다."],
  ["pinyin-hanzi-worksheet", "?grid=tian&trace=3&pinyin=1&strokes=0", "拼音汉字练习纸生成器", "拼音國字練習紙產生器", "Pinyin and Hanzi worksheet generator", "読み方付き漢字練習プリント作成", "병음 포함 중국어 한자 연습지", "在每个汉字练习区显示上下文拼音，帮助学习者同时复习普通话读音与字形；单字输入可显示多个读音。", "在每個國字練習區顯示上下文拼音，協助學習者同時複習華語讀音與字形；輸入單字時可顯示多個讀音。", "Context-aware Pinyin appears with each Hanzi practice block so learners can review Mandarin pronunciation and writing together, including polyphonic characters.", "各漢字に音読み・訓読みを表示し、読み方と字形を一緒に復習できます。熟語固有の読みや人名の読みは必要に応じて確認できます。", "각 한자 연습 영역에 문맥을 반영한 병음을 표시해 중국어 발음과 글자 쓰기를 함께 복습하며 다의음자도 확인합니다."],
  ["stroke-order-worksheet", "?grid=tian&trace=2&pinyin=1&strokes=1", "汉字笔顺练习纸生成器", "國字筆順練習紙產生器", "Chinese stroke order worksheet generator", "漢字筆順付き練習プリント作成", "한자 필순 포함 연습지 만들기", "先显示逐笔笔顺图，再安排描红与空白练习格，适合课堂讲解、家庭练习和容易写错笔顺的汉字复习。", "先顯示逐筆筆順圖，再安排描紅與空白練習格，適合課堂講解、家庭練習與容易寫錯筆順的國字複習。", "Step-by-step stroke diagrams appear before tracing and blank cells, supporting classroom instruction, home practice, and review of difficult Hanzi.", "1画ずつの筆順図を先に表示し、その後になぞり書きと空欄を並べ、授業・家庭学習・間違えやすい漢字の復習に使えます。", "획별 필순 그림 뒤에 따라쓰기와 빈칸을 배치해 수업, 가정 학습, 획순을 틀리기 쉬운 한자 복습에 활용합니다."]
].map(([slug, query, zhName, twName, enName, jaName, koName, zhSpecific, twSpecific, enSpecific, jaSpecific, koSpecific]) => ({
  slug, category: "worksheet", tool: "han-character-worksheet", query: `${query}#worksheetToolTitle`, badge: "PDF / PRINT",
  localized: {
    "zh-CN": { name: zhName, title: `${zhName}在线制作与打印 | JianFan.app`, description: `${zhSpecific}支持输入自定义内容、调节格数与描红深浅，并可直接打印或另存为 PDF。`, lede: zhSpecific, specific: zhSpecific, limit: "练习纸按浏览器打印尺寸生成。启用笔顺时会远程按需读取单字公开字形数据，打印前请先查看预览。", question: `${zhName}可以保存为 PDF 吗？`, answer: "可以。生成预览后选择打印，并在浏览器打印窗口中选择“另存为 PDF”。" },
    "zh-TW": { name: twName, title: `${twName}線上製作與列印 | JianFan.app`, description: `${twSpecific}支援輸入自訂內容、調整格數與描紅深淺，並可直接列印或另存成 PDF。`, lede: twSpecific, specific: twSpecific, limit: "練習紙依瀏覽器列印尺寸產生。啟用筆順時會遠端按需讀取單字公開字形資料，列印前請先查看預覽。", question: `${twName}可以儲存成 PDF 嗎？`, answer: "可以。產生預覽後選擇列印，再於瀏覽器列印視窗中選擇「另存為 PDF」。" },
    en: { name: enName, title: `${enName} Online and Printable | JianFan`, description: `${enSpecific} Enter custom text, adjust grid and tracing options, then print the worksheet or save it as a PDF without signing up.`, lede: enSpecific, specific: enSpecific, limit: "Sheets use your browser's print layout. When stroke order is enabled, public character-shape data is fetched remotely on demand; review the preview first.", question: `Can I save the ${enName.toLowerCase()} as a PDF?`, answer: "Yes. Generate the preview, choose Print, and select Save as PDF in your browser's print dialog." },
    ja: { name: jaName, title: `${jaName}・無料印刷 | JianFan`, description: `${jaSpecific}文字、マス数、見本の濃さを自由に調整し、登録不要で印刷または PDF 保存できます。`, lede: jaSpecific, specific: jaSpecific, limit: "ブラウザの印刷用紙サイズで作成します。筆順を有効にすると公開字形データを必要な文字だけ取得するため、印刷前に確認してください。", question: `${jaName}はPDFで保存できますか？`, answer: "はい。プレビューを作成して印刷を選び、ブラウザの印刷画面で「PDFとして保存」を指定します。" },
    ko: { name: koName, title: `${koName} 무료 인쇄 도구 | JianFan`, description: `${koSpecific} 글자, 칸 수, 따라쓰기 농도를 조정하고 가입 없이 바로 인쇄하거나 PDF로 저장할 수 있습니다.`, lede: koSpecific, specific: koSpecific, limit: "브라우저 인쇄 용지 크기에 맞춰 만듭니다. 필순을 켜면 필요한 글자의 공개 자형 자료를 원격으로 불러오므로 인쇄 전 미리보기를 확인하세요.", question: `${koName}을 PDF로 저장할 수 있나요?`, answer: "네. 미리보기를 만든 뒤 인쇄를 선택하고 브라우저 인쇄 창에서 PDF로 저장을 고르세요." }
  }
}));

const seoOverrides = Object.freeze({
  "word-chinese-converter": {
    "zh-CN": { description: "在线读取 DOCX Word 文档中的中文文字，转换为简体、繁体、台湾正体或香港繁体。文件仅在浏览器本地处理，可合并文档并复制结果，适合合同、报告与文章整理。" },
    "zh-TW": { description: "線上讀取 DOCX Word 文件中的中文文字，轉成簡體、繁體、台灣正體或香港繁體。檔案只在瀏覽器本機處理，可合併多份文件並複製結果，適合合約、報告與文章整理。" },
    ko: { title: "Word 중국어 간체·번체 변환 도구 | JianFan", description: "DOCX Word 문서의 중국어를 추출해 간체, 번체, 대만 정체자, 홍콩 번체로 변환합니다. 여러 문서를 합치고 결과를 복사할 수 있습니다." }
  },
  "pdf-chinese-converter": {
    ko: { title: "PDF 중국어 간체·번체 변환 도구 | JianFan", description: "선택 가능한 PDF의 중국어를 추출해 간체, 번체, 대만 정체자, 홍콩 번체로 변환합니다. 논문과 전자책 내용을 정리하고 복사할 수 있습니다." }
  },
  "excel-chinese-converter": {
    "zh-CN": { description: "在线读取 XLSX、XLS Excel 表格中的单元格文字，按工作表提取并转换为简体、繁体、台湾正体或香港繁体。文件仅在浏览器处理，适合名单、术语和资料表校对。" },
    ko: { title: "XLSX 중국어 간체·번체 변환 도구 | JianFan", description: "XLSX와 XLS의 셀 텍스트를 추출해 간체, 번체, 대만 정체자, 홍콩 번체로 변환합니다. 명단과 용어 자료를 확인하고 복사할 수 있습니다." }
  },
  "txt-chinese-converter": {
    "zh-CN": { title: "TXT文件简繁转换与纯文本在线工具 | JianFan", description: "在线读取 TXT、Markdown 纯文本并转换为简体、繁体、台湾正体或香港繁体。支持长文本分块、自定义词库和结果复制，内容仅在浏览器处理，适合小说与资料整理。" },
    "zh-TW": { description: "線上讀取 TXT、Markdown 純文字並轉成簡體、繁體、台灣正體或香港繁體。支援長文字分段處理、自訂詞庫及結果複製，內容只在瀏覽器處理，適合小說與資料整理。" },
    ja: { description: "TXT・Markdownの中国語を開き、簡体字・繁体字・台湾・香港向け表記へ無料変換。長文は分割処理し、改行を保ったままブラウザ内で変換・コピーできます。" },
    ko: { title: "TXT 중국어 간체·번체 변환 도구 | JianFan", description: "TXT와 Markdown의 중국어를 간체, 번체, 대만 정체자, 홍콩 번체로 변환합니다. 긴 글을 나누어 줄바꿈을 유지해 복사할 수 있습니다." }
  },
  "csv-chinese-converter": {
    ja: { description: "CSV表の中国語フィールドを読み込み、簡体字・繁体字・台湾・香港向け表記へ無料変換。区切りと改行を保ってコピーでき、商品一覧や用語データの確認に便利です。" },
    ko: { title: "CSV 중국어 간체·번체 변환 도구 | JianFan", description: "CSV 필드를 간체, 번체, 대만 정체자, 홍콩 번체로 변환합니다. 구분자와 줄바꿈을 유지해 상품 목록과 용어 자료를 검토하기 편리합니다." }
  },
  "simplified-chinese-to-japanese-kanji": {
    en: { description: "Convert Simplified Chinese to Japanese Kanji online. Compare Japanese, Simplified, and Traditional forms side by side, copy results, and review glyph changes." },
    ja: { title: "簡体字を日本語漢字へ変換・三体比較 | JianFan", description: "中国語の簡体字を日本の新字体へ変換し、簡体字・繁体字・日本語漢字を並べて比較。長文の分割処理、コピー、字形差分表に無料で対応します。" },
    ko: { title: "중국 간체 일본 한자 변환·비교 | JianFan", description: "중국 간체를 일본 신자체로 변환하고 간체, 번체, 일본 한자를 비교합니다. 긴 글 처리, 결과 복사, 글자 차이표를 무료로 이용할 수 있습니다." }
  },
  "traditional-chinese-to-japanese-kanji": {
    en: { description: "Convert Traditional Chinese to Japanese Kanji online. Compare Japanese, Simplified, and Traditional forms side by side, copy results, and review glyph changes." },
    ja: { title: "繁体字を日本語漢字へ変換・三体比較 | JianFan", description: "中国語の繁体字を日本の新字体へ変換し、繁体字・簡体字・日本語漢字を並べて比較。長文の分割処理、コピー、字形差分表に無料で対応します。" },
    ko: { title: "중국 번체 일본 한자 변환·비교 | JianFan", description: "중국 번체를 일본 신자체로 변환하고 번체, 간체, 일본 한자를 비교합니다. 긴 글 처리, 결과 복사, 글자 차이표를 무료로 이용할 수 있습니다." }
  },
  "japanese-kanji-to-simplified-chinese": {
    en: { description: "Convert Japanese Kanji to Simplified Chinese online. Compare Japanese, Simplified, and Traditional forms side by side, copy results, and review glyph changes." },
    ja: { title: "日本語漢字を中国語簡体字へ変換 | JianFan", description: "日本の新字体を中国語簡体字へ変換し、日本語漢字・簡体字・繁体字を並べて比較。長文の分割処理、コピー、字形差分表に無料で対応します。" },
    ko: { title: "일본 한자 중국 간체 변환·비교 | JianFan", description: "일본 신자체를 중국 간체로 변환하고 일본 한자, 간체, 번체를 비교합니다. 긴 글 처리, 결과 복사, 글자 차이표를 무료로 이용할 수 있습니다." }
  },
  "japanese-kanji-to-traditional-chinese": {
    en: { description: "Convert Japanese Kanji to Traditional Chinese online. Compare Japanese, Simplified, and Traditional forms side by side, copy results, and review glyph changes." },
    ja: { title: "日本語漢字を中国語繁体字へ変換 | JianFan", description: "日本の新字体を中国語繁体字へ変換し、日本語漢字・繁体字・簡体字を並べて比較。長文の分割処理、コピー、字形差分表に無料で対応します。" },
    ko: { title: "일본 한자 중국 번체 변환·비교 | JianFan", description: "일본 신자체를 중국 번체로 변환하고 일본 한자, 번체, 간체를 비교합니다. 긴 글 처리, 결과 복사, 글자 차이표를 무료로 이용할 수 있습니다." }
  },
  "chinese-japanese-kanji-comparison": {
    en: { description: "Compare modern Japanese Kanji, Simplified Chinese, and Traditional Chinese online. Paste text, copy all three results, and review only the glyphs that differ." },
    ja: { title: "日本語漢字・簡体字・繁体字の三体比較 | JianFan", description: "日本語漢字・中国語簡体字・繁体字を並べて比較し、変化した字形だけを対応表で確認。長文の分割処理と三種類の結果コピーに無料で対応します。" },
    ko: { title: "일본 한자·중국 간체·번체 비교 | JianFan", description: "일본 신자체, 중국 간체, 번체를 비교하고 달라진 글자만 확인합니다. 긴 글 처리와 세 가지 결과 복사를 무료로 이용할 수 있습니다." }
  },
  "tian-zi-ge-worksheet": {
    en: { description: "Create printable Tian Zi Ge Chinese worksheets with centre guides, tracing, Pinyin, and stroke order. Adjust the layout, then print or save a PDF for free." },
    ja: { title: "漢字十字マス練習プリント作成・印刷 | JianFan", description: "中央の十字ガイドで漢字のバランスを確認できる練習プリントを無料作成。文字、なぞり書き、読み、筆順、マス数を調整して印刷・PDF保存できます。" },
    ko: { title: "한자 십자 격자 연습장 만들기 | JianFan", description: "가운데 십자선으로 한자 비율을 익히는 연습지를 만듭니다. 따라쓰기, 읽기, 필순, 칸 수를 조정해 인쇄하거나 PDF로 저장할 수 있습니다." }
  },
  "mi-zi-ge-worksheet": {
    en: { description: "Create printable Mi Zi Ge Chinese worksheets with diagonal guides, tracing, Pinyin, and stroke order. Adjust the layout, then print or save a PDF for free." },
    ja: { title: "漢字対角線マス練習プリント作成 | JianFan", description: "十字と対角線で漢字の斜めの画や重心を確認できる練習プリントを無料作成。文字、なぞり書き、読み、筆順、マス数を調整して印刷できます。" },
    ko: { title: "한자 대각선 격자 연습장 만들기 | JianFan", description: "십자선과 대각선으로 한자의 비스듬한 획과 중심을 익힙니다. 글자, 따라쓰기, 읽기, 필순, 칸 수를 조정해 인쇄하거나 PDF로 저장합니다." }
  },
  "hanzi-tracing-worksheet": {
    "zh-TW": { title: "國字描紅練習紙線上製作與列印 | JianFan.app" },
    en: { title: "Chinese Tracing Worksheet Generator Online | JianFan", description: "Create printable Chinese character tracing sheets with faded models, blank practice boxes, Pinyin, and grids. Adjust the layout, then print or save a PDF free." },
    ja: { title: "漢字なぞり書きプリント作成・印刷 | JianFan", description: "薄い見本文字と空欄を並べた漢字なぞり書きプリントを無料作成。文字、マス目、読み、見本の濃さを調整して印刷またはPDF保存できます。" },
    ko: { title: "한자 따라쓰기 학습지 만들기 | JianFan", description: "옅은 따라쓰기 칸과 빈칸을 배치한 한자 학습지를 만듭니다. 글자, 격자, 읽기, 본보기 농도를 조정해 인쇄하거나 PDF로 저장할 수 있습니다." }
  },
  "pinyin-hanzi-worksheet": {
    "zh-CN": { title: "拼音汉字练习纸在线制作与打印 | JianFan.app", description: "在每个汉字练习区显示上下文拼音，帮助学习者同时复习普通话读音与字形，单字可显示多个读音。支持调整格数与描红，并可打印或另存为 PDF。" },
    "zh-TW": { title: "拼音國字練習紙線上製作與列印 | JianFan.app" },
    en: { title: "Pinyin and Hanzi Worksheet Generator Online | JianFan", description: "Create printable Pinyin and Hanzi worksheets with readings, tracing boxes, custom grids, and polyphonic characters. Print or save each sheet as a PDF free." },
    ja: { title: "読み方付き漢字練習プリント作成 | JianFan", description: "各漢字に音読み・訓読みを付けた練習プリントを無料作成。なぞり書き、マス目、練習量を調整し、登録不要で印刷またはPDF保存できます。" },
    ko: { title: "병음 포함 중국어 한자 연습지 | JianFan", description: "병음과 한자를 함께 연습하는 학습지를 만듭니다. 다의음자, 따라쓰기, 격자와 칸 수를 조정해 인쇄하거나 PDF로 저장할 수 있습니다." }
  },
  "stroke-order-worksheet": {
    "zh-CN": { title: "汉字笔顺练习纸在线制作与打印 | JianFan.app" },
    "zh-TW": { title: "國字筆順練習紙線上製作與列印 | JianFan.app" },
    en: { title: "Chinese Stroke Order Worksheet Generator | JianFan", description: "Create printable Chinese stroke order worksheets with step diagrams, tracing, Pinyin, and practice grids. Adjust the layout, then print or save a PDF free." },
    ja: { title: "漢字筆順付き練習プリント作成・印刷 | JianFan", description: "1画ずつの筆順図、なぞり書き、空欄を並べた漢字練習プリントを無料作成。読み、マス目、行列を調整して印刷またはPDFとして保存できます。" },
    ko: { title: "한자 필순 연습지 만들기·인쇄 | JianFan", description: "획별 필순 그림, 따라쓰기, 빈칸을 넣은 한자 연습지를 만듭니다. 읽기, 격자, 행과 열을 조정해 인쇄하거나 PDF로 저장할 수 있습니다." }
  }
});

const scenarioPages = [...fileScenarios, ...kanjiScenarios, ...worksheetScenarios];
for (const scenario of scenarioPages) {
  for (const [locale, values] of Object.entries(seoOverrides[scenario.slug] || {})) {
    Object.assign(scenario.localized[locale], values);
  }
}

export const SCENARIO_PAGES = Object.freeze(scenarioPages);

export const SCENARIO_CATEGORY_PARENTS = Object.freeze({
  file: "file-text-converter",
  kanji: "japanese-chinese-kanji-converter",
  worksheet: "han-character-worksheet"
});
