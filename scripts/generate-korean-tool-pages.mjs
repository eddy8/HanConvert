import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { visibleMetadataLength } from "./seo-metadata-rules.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const localePaths = "zh-CN:/|zh-TW:/zh-tw/|en:/en/|ja:/ja/|ko:/ko/";

const locales = {
  "zh-CN": { prefix: "", lang: "zh-CN", hreflang: "zh-Hans", label: "简体中文", home: "网站首页", language: "界面语言", header: "网站页眉", nav: "主要导航", footer: "页脚", about: "关于我们", contact: "联系我们", privacy: "隐私声明", skip: "跳到主要内容", related: "相关韩国汉字工具", relatedAria: "相关韩国汉字与韩文工具", footerText: "JianFan.app 提供在浏览器中运行的韩国汉字查询、手写识别和韩汉转换工具。", runtime: { loading: "正在加载词典…", loadingProgress: "词典加载进度：{percent}%", loaded: "已加载 {count} 条资料", ready: "找到 {count} 条结果", noResults: "没有找到符合条件的结果。", results: "{count} 条结果", resultMeta: "部首 {radical} · {strokes} 画", invalid: "请输入查询内容或选择筛选条件。", error: "资料加载失败，请刷新页面后重试。", recognizing: "正在识别笔迹…", matched: "找到 {count} 个候选字", copied: "已复制", copyFailed: "复制失败，请手动复制", candidateLabel: "候选字 {character}", remoteRecognizing: "正在进行远程识别…", remoteNoMatch: "远程识别未找到更合适的候选字", remoteError: "远程识别失败，请检查网络后重试", converted: "已转换 {count} 个字符", conversionPending: "已处理 {count} 个字符，请选择 {pending} 处同音词", descriptionUnavailable: "暂无释义" } },
  "zh-TW": { prefix: "zh-tw/", lang: "zh-Hant", hreflang: "zh-Hant", label: "繁體中文", home: "網站首頁", language: "介面語言", header: "網站頁首", nav: "主要導覽", footer: "頁尾", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", skip: "跳到主要內容", related: "相關韓國漢字工具", relatedAria: "相關韓國漢字與韓文工具", footerText: "JianFan.app 提供在瀏覽器中執行的韓國漢字查詢、手寫辨識與韓漢轉換工具。", runtime: { loading: "正在載入字典…", loadingProgress: "字典載入進度：{percent}%", loaded: "已載入 {count} 筆資料", ready: "找到 {count} 筆結果", noResults: "找不到符合條件的結果。", results: "{count} 筆結果", resultMeta: "部首 {radical} · {strokes} 畫", invalid: "請輸入查詢內容或選擇篩選條件。", error: "資料載入失敗，請重新整理頁面後再試。", recognizing: "正在辨識筆跡…", matched: "找到 {count} 個候選字", copied: "已複製", copyFailed: "複製失敗，請手動複製", candidateLabel: "候選字 {character}", remoteRecognizing: "正在進行遠端辨識…", remoteNoMatch: "遠端辨識未找到更合適的候選字", remoteError: "遠端辨識失敗，請檢查網路後再試一次", converted: "已轉換 {count} 個字元", conversionPending: "已處理 {count} 個字元，請選擇 {pending} 處同音詞", descriptionUnavailable: "暫無釋義" } },
  en: { prefix: "en/", lang: "en", hreflang: "en", label: "English", home: "Home", language: "Language", header: "Site header", nav: "Primary navigation", footer: "Footer", about: "About", contact: "Contact", privacy: "Privacy Statement", skip: "Skip to main content", related: "Related Korean Hanja tools", relatedAria: "Related Korean Hanja and Hangul tools", footerText: "JianFan.app provides browser-based Korean Hanja lookup, handwriting recognition and Hangul conversion tools.", runtime: { loading: "Loading the dictionary…", loadingProgress: "Dictionary loading: {percent}%", loaded: "Loaded {count} records", ready: "Found {count} results", noResults: "No matching results were found.", results: "{count} results", resultMeta: "Radical {radical} · {strokes} strokes", invalid: "Enter a query or choose a filter.", error: "The data could not be loaded. Refresh the page and try again.", recognizing: "Recognizing handwriting…", matched: "Found {count} candidate characters", copied: "Copied", copyFailed: "Copy failed. Select and copy manually.", candidateLabel: "Candidate {character}", remoteRecognizing: "Checking with online recognition…", remoteNoMatch: "Online recognition found no better matches.", remoteError: "Online recognition failed. Check your connection and try again.", converted: "Converted {count} characters", conversionPending: "Processed {count} characters; ambiguous choices: {pending}", descriptionUnavailable: "No definition available" } },
  ja: { prefix: "ja/", lang: "ja", hreflang: "ja", label: "日本語", home: "ホーム", language: "表示言語", header: "サイトヘッダー", nav: "メインナビゲーション", footer: "フッター", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", skip: "メインコンテンツへ移動", related: "関連する韓国漢字ツール", relatedAria: "関連する韓国漢字・ハングルツール", footerText: "JianFan.app はブラウザーで使える韓国漢字検索、手書き認識、ハングル変換ツールを提供します。", runtime: { loading: "辞書を読み込んでいます…", loadingProgress: "辞書の読み込み：{percent}%", loaded: "{count} 件のデータを読み込みました", ready: "{count} 件見つかりました", noResults: "条件に一致する結果はありません。", results: "{count} 件", resultMeta: "部首 {radical} · {strokes} 画", invalid: "検索語を入力するか、絞り込み条件を選んでください。", error: "データを読み込めませんでした。ページを再読み込みしてください。", recognizing: "手書き文字を認識しています…", matched: "候補を {count} 字見つけました", copied: "コピーしました", copyFailed: "コピーできませんでした。手動でコピーしてください。", candidateLabel: "候補 {character}", remoteRecognizing: "オンライン認識で検索しています…", remoteNoMatch: "オンライン認識でも適切な候補が見つかりませんでした。", remoteError: "オンライン認識に失敗しました。通信を確認してもう一度お試しください。", converted: "{count} 文字を変換しました", conversionPending: "{count} 文字を処理しました。{pending} 語の候補を選んでください", descriptionUnavailable: "字義情報はありません" } },
  ko: { prefix: "ko/", lang: "ko", hreflang: "ko", label: "한국어", home: "홈", language: "언어", header: "사이트 헤더", nav: "주요 탐색", footer: "바닥글", about: "소개", contact: "문의", privacy: "개인정보 보호 안내", skip: "주요 내용으로 이동", related: "관련 한자·한글 도구", relatedAria: "관련 한자 찾기와 한글 변환 도구", footerText: "JianFan.app는 브라우저에서 실행되는 한자 찾기, 필기 인식, 한글·한자 변환 도구를 제공합니다.", runtime: { loading: "사전을 불러오는 중…", loadingProgress: "사전 불러오기: {percent}%", loaded: "자료 {count}건을 불러왔습니다", ready: "{count}건을 찾았습니다", noResults: "조건에 맞는 결과가 없습니다.", results: "{count}건", resultMeta: "부수 {radical} · 총 {strokes}획", invalid: "검색어를 입력하거나 검색 조건을 선택하세요.", error: "자료를 불러오지 못했습니다. 페이지를 새로 고침해 주세요.", recognizing: "필기한 한자를 인식하는 중…", matched: "후보 한자 {count}자를 찾았습니다", copied: "복사했습니다", copyFailed: "복사하지 못했습니다. 직접 선택해 복사하세요.", candidateLabel: "후보 {character}", remoteRecognizing: "온라인 인식으로 찾는 중…", remoteNoMatch: "온라인 인식에서도 더 적합한 후보를 찾지 못했습니다.", remoteError: "온라인 인식에 실패했습니다. 네트워크를 확인한 후 다시 시도하세요.", converted: "{count}자를 변환했습니다", conversionPending: "{count}자를 처리했습니다. 동음어 {pending}곳의 한자를 선택하세요", descriptionUnavailable: "뜻풀이 정보 없음" } }
};

const converterLabels = {
  "zh-CN": { choicesTitle: "转换候选", choicesEmpty: "出现多个汉字或韩文读音时，可在这里逐项选择。", pending: "已处理 {count} 个字符，请确认 {pending} 处转换候选", choicePosition: "{current} / {total}", previousChoice: "上一个待确认位置", nextChoice: "下一个待确认位置", keepOriginal: "保留原文", splitCharacters: "逐字选择", applyAll: "相同词全部使用此项", showAll: "显示全部 {count} 个候选", showLess: "收起候选", detailsLoading: "正在加载字义…", detailsUnavailable: "暂无音训资料", candidateDetails: "查看 {candidate} 的部首与笔画", detailRadical: "部首 {radical}", detailStrokes: "{count} 画", dictionary: { title: "个人词典", count: "{enabled}/{total} 已启用", note: "保存常用人名、地名或专业词语，转换时优先使用；资料仅保存在当前浏览器。", hangulLabel: "韩文词语", hangulPlaceholder: "例如：수도", hanjaLabel: "韩国汉字", hanjaPlaceholder: "例如：水道", add: "添加词条", empty: "还没有个人词条。", clear: "清空词典", messages: { dictionaryCount: "{enabled}/{total} 已启用", dictionaryToggle: "启用或停用 {term}", dictionaryRemove: "删除 {term}", dictionaryClearConfirm: "确定清空全部个人词条吗？", dictionaryRequired: "请同时输入韩文词语和韩国汉字。", dictionaryInvalid: "左侧需包含韩文，右侧需包含汉字。", dictionaryTooLong: "每项最多 {limit} 个字符。", dictionaryLimit: "个人词典最多保存 {limit} 项。", dictionaryAdded: "已添加个人词条。", dictionaryUpdated: "已更新个人词条。", dictionaryRemoved: "已删除个人词条。", dictionaryCleared: "已清空个人词典。", dictionaryStorageError: "当前浏览器无法保存词典，本次页面仍可继续使用。" } } },
  "zh-TW": { choicesTitle: "轉換候選", choicesEmpty: "出現多個漢字或韓文讀音時，可在這裡逐項選擇。", pending: "已處理 {count} 個字元，請確認 {pending} 處轉換候選", choicePosition: "{current} / {total}", previousChoice: "上一個待確認位置", nextChoice: "下一個待確認位置", keepOriginal: "保留原文", splitCharacters: "逐字選擇", applyAll: "相同詞全部使用此項", showAll: "顯示全部 {count} 個候選", showLess: "收合候選", detailsLoading: "正在載入字義…", detailsUnavailable: "暫無音訓資料", candidateDetails: "查看 {candidate} 的部首與筆畫", detailRadical: "部首 {radical}", detailStrokes: "{count} 畫", dictionary: { title: "個人辭典", count: "已啟用 {enabled}/{total}", note: "儲存常用人名、地名或專業詞語，轉換時優先套用；資料只保存在目前瀏覽器。", hangulLabel: "韓文詞語", hangulPlaceholder: "例如：수도", hanjaLabel: "韓國漢字", hanjaPlaceholder: "例如：水道", add: "新增詞條", empty: "尚未建立個人詞條。", clear: "清空辭典", messages: { dictionaryCount: "已啟用 {enabled}/{total}", dictionaryToggle: "啟用或停用 {term}", dictionaryRemove: "刪除 {term}", dictionaryClearConfirm: "確定清空全部個人詞條嗎？", dictionaryRequired: "請同時輸入韓文詞語與韓國漢字。", dictionaryInvalid: "左側需包含韓文，右側需包含漢字。", dictionaryTooLong: "每項最多 {limit} 個字元。", dictionaryLimit: "個人辭典最多儲存 {limit} 項。", dictionaryAdded: "已新增個人詞條。", dictionaryUpdated: "已更新個人詞條。", dictionaryRemoved: "已刪除個人詞條。", dictionaryCleared: "已清空個人辭典。", dictionaryStorageError: "目前瀏覽器無法儲存辭典，本次頁面仍可繼續使用。" } } },
  en: { choicesTitle: "Conversion choices", choicesEmpty: "Alternative Hanja or Hangul readings will appear here for review.", pending: "Processed {count} characters; ambiguous choices: {pending}", choicePosition: "{current} / {total}", previousChoice: "Previous occurrence", nextChoice: "Next occurrence", keepOriginal: "Keep original", splitCharacters: "Choose one character at a time", applyAll: "Use for every matching occurrence", showAll: "Show all {count} candidates", showLess: "Show fewer", detailsLoading: "Loading meanings…", detailsUnavailable: "No Korean gloss available", candidateDetails: "Show radical and stroke details for {candidate}", detailRadical: "Radical {radical}", detailStrokes: "{count} strokes", dictionary: { title: "Personal dictionary", count: "{enabled} of {total} active", note: "Save preferred names, places and specialist terms. They take priority during conversion and stay in this browser.", hangulLabel: "Hangul term", hangulPlaceholder: "For example: 수도", hanjaLabel: "Korean Hanja", hanjaPlaceholder: "For example: 水道", add: "Add entry", empty: "No personal entries yet.", clear: "Clear dictionary", messages: { dictionaryCount: "{enabled} of {total} active", dictionaryToggle: "Enable or disable {term}", dictionaryRemove: "Remove {term}", dictionaryClearConfirm: "Clear every personal dictionary entry?", dictionaryRequired: "Enter both a Hangul term and its Korean Hanja.", dictionaryInvalid: "The first field must contain Hangul and the second must contain Hanja.", dictionaryTooLong: "Each term can contain up to {limit} characters.", dictionaryLimit: "The personal dictionary can hold up to {limit} entries.", dictionaryAdded: "Personal entry added.", dictionaryUpdated: "Personal entry updated.", dictionaryRemoved: "Personal entry removed.", dictionaryCleared: "Personal dictionary cleared.", dictionaryStorageError: "This browser could not save the dictionary. It remains available on this page." } } },
  ja: { choicesTitle: "変換候補", choicesEmpty: "複数の漢字候補やハングル読みがある箇所を、ここで順番に選べます。", pending: "{count} 文字を処理しました。{pending} 語の候補を選んでください", choicePosition: "{current} / {total}", previousChoice: "前の箇所", nextChoice: "次の箇所", keepOriginal: "原文のまま", splitCharacters: "1文字ずつ選ぶ", applyAll: "同じ語のすべてに適用", showAll: "候補をすべて表示（{count}件）", showLess: "候補を閉じる", detailsLoading: "字義を読み込み中…", detailsUnavailable: "韓国語の字義情報はありません", candidateDetails: "{candidate} の部首と画数を見る", detailRadical: "部首 {radical}", detailStrokes: "{count}画", dictionary: { title: "個人辞書", count: "{enabled}/{total}件を使用", note: "人名、地名、専門用語の表記を保存すると、変換時に優先されます。データはこのブラウザーだけに保存されます。", hangulLabel: "ハングル語句", hangulPlaceholder: "例：수도", hanjaLabel: "韓国漢字", hanjaPlaceholder: "例：水道", add: "単語を追加", empty: "個人辞書はまだ空です。", clear: "辞書を消去", messages: { dictionaryCount: "{enabled}/{total}件を使用", dictionaryToggle: "{term} を有効または無効にする", dictionaryRemove: "{term} を削除", dictionaryClearConfirm: "個人辞書をすべて消去しますか？", dictionaryRequired: "ハングル語句と韓国漢字の両方を入力してください。", dictionaryInvalid: "左欄にはハングル、右欄には漢字を含めてください。", dictionaryTooLong: "各項目は {limit} 文字以内です。", dictionaryLimit: "個人辞書には最大 {limit} 件まで保存できます。", dictionaryAdded: "個人辞書に追加しました。", dictionaryUpdated: "個人辞書を更新しました。", dictionaryRemoved: "個人辞書から削除しました。", dictionaryCleared: "個人辞書を消去しました。", dictionaryStorageError: "このブラウザーには保存できません。現在のページでは引き続き使用できます。" } } },
  ko: { choicesTitle: "변환 후보", choicesEmpty: "한자 후보나 한글 읽기가 여러 개면 여기에서 하나씩 확인할 수 있습니다.", pending: "{count}자를 처리했습니다. 변환 후보 {pending}곳을 확인하세요", choicePosition: "{current} / {total}", previousChoice: "이전 위치", nextChoice: "다음 위치", keepOriginal: "원문 유지", splitCharacters: "한 자씩 선택", applyAll: "같은 낱말에 모두 적용", showAll: "후보 {count}개 모두 보기", showLess: "후보 접기", detailsLoading: "훈과 뜻을 불러오는 중…", detailsUnavailable: "훈음 정보 없음", candidateDetails: "{candidate}의 부수와 획수 보기", detailRadical: "부수 {radical}", detailStrokes: "총 {count}획", dictionary: { title: "개인 한자 사전", count: "{enabled}/{total}개 사용", note: "이름, 지명, 회사명이나 전문 용어를 저장하면 변환할 때 먼저 적용합니다. 자료는 이 브라우저에만 보관됩니다.", hangulLabel: "한글 낱말", hangulPlaceholder: "예: 수도", hanjaLabel: "한자 표기", hanjaPlaceholder: "예: 水道", add: "낱말 추가", empty: "저장한 개인 낱말이 없습니다.", clear: "사전 비우기", messages: { dictionaryCount: "{enabled}/{total}개 사용", dictionaryToggle: "{term} 사용 여부", dictionaryRemove: "{term} 삭제", dictionaryClearConfirm: "개인 한자 사전을 모두 비울까요?", dictionaryRequired: "한글 낱말과 한자 표기를 모두 입력하세요.", dictionaryInvalid: "왼쪽에는 한글, 오른쪽에는 한자가 포함되어야 합니다.", dictionaryTooLong: "각 항목은 {limit}자까지 입력할 수 있습니다.", dictionaryLimit: "개인 사전은 최대 {limit}개까지 저장할 수 있습니다.", dictionaryAdded: "개인 사전에 추가했습니다.", dictionaryUpdated: "개인 사전을 수정했습니다.", dictionaryRemoved: "개인 사전에서 삭제했습니다.", dictionaryCleared: "개인 한자 사전을 비웠습니다.", dictionaryStorageError: "이 브라우저에 사전을 저장하지 못했습니다. 현재 페이지에서는 계속 사용할 수 있습니다." } } }
};

const relatedLinks = {
  "zh-CN": [["korean-hanja-dictionary", "韩国汉字查询"], ["korean-hanja-handwriting-recognition", "韩国汉字手写查字"], ["hangul-hanja-converter", "韩文汉字转换"], ["korean-name-hanja", "韩国人名用汉字"], ["character-counter", "字数统计"]],
  "zh-TW": [["korean-hanja-dictionary", "韓國漢字查詢"], ["korean-hanja-handwriting-recognition", "韓國漢字手寫查字"], ["hangul-hanja-converter", "韓文漢字轉換"], ["korean-name-hanja", "韓國人名用漢字"], ["character-counter", "字數統計"]],
  en: [["korean-hanja-dictionary", "Korean Hanja dictionary"], ["korean-hanja-handwriting-recognition", "Korean Hanja handwriting"], ["hangul-hanja-converter", "Hangul Hanja converter"], ["korean-name-hanja", "Korean name Hanja"], ["character-counter", "Korean character counter"]],
  ja: [["korean-hanja-dictionary", "韓国漢字検索"], ["korean-hanja-handwriting-recognition", "韓国漢字の手書き検索"], ["hangul-hanja-converter", "ハングル・漢字変換"], ["korean-name-hanja", "韓国の人名用漢字"], ["character-counter", "文字数カウント"]],
  ko: [["korean-hanja-dictionary", "한자 찾기·옥편"], ["korean-hanja-handwriting-recognition", "한자 필기인식"], ["hangul-hanja-converter", "한글 한자 변환"], ["korean-name-hanja", "인명용 한자"], ["character-counter", "글자수 세기"]]
};

const pages = {
  "korean-hanja-dictionary": {
    type: "dictionary",
    content: {
      "zh-CN": { title: "韩国汉字查询 - 韩文读音、部首与画数 | JianFan.app", description: "免费韩国汉字查询与在线韩文汉字字典，可按汉字、韩文读音、韩语释义、部首和总画数搜索，并筛选韩国法院公开的人名用汉字。结果显示韩国汉字音、韩文释义、部首、笔画数、英文含义与 Unicode 字形，可继续进行手写查字、结构拆解或人名用字核验，词典数据按需在浏览器本地加载，无需注册，支持电脑、平板和手机使用。", eyebrow: "韩国汉字 · 韩文读音 · 部首 · 画数", heading: "韩国汉字查询与在线字典", lede: "输入汉字、韩文读音或韩语释义，也可以组合部首、总画数和人名用汉字筛选，查找不会读或不熟悉的韩国汉字。", toolTitle: "按读音、部首或画数查找韩国汉字", queryLabel: "汉字、韩文读音或韩语释义", placeholder: "例如：韓、한、나라", radical: "部首", allRadicals: "全部部首", strokes: "总画数", allStrokes: "全部画数", nameOnly: "只显示韩国人名用汉字", search: "查询汉字", clear: "清空", resultsTitle: "查询结果", resultEmpty: "输入韩文读音、汉字或筛选条件后，结果会显示在这里。", detailTitle: "汉字详情", detailEmpty: "选择一个结果，查看韩国读音、含义与人名用状态。", labels: { readings: "韩文读音", meanings: "韩语释义", radical: "部首", strokes: "总画数", name: "人名用状态" }, structure: "查看汉字结构", nameLink: "核验人名用汉字", nameAllowed: "韩国法院公开名单中可用于人名", nameNotConfirmed: "未在当前法院公开名单中确认", source: "韩文读音和释义来自 libhangul，部首与画数参考 Unicode Unihan；人名用状态来自韩国法院公开查询。", featureTitle: "用韩文读音、部首和画数完成韩式在线查字", featureIntro: "韩国的在线 옥편（玉篇）通常需要同时支持 한자 찾기、부수、획수 与韩文读音。本页把这些检索线索集中在同一界面。", cards: [["韩文读音与韩语释义", "按 한、국、민 等读音查找同音汉字，并查看 libhangul 提供的韩语训释。"], ["部首与总画数筛选", "不知道读音时，可以按可辨认的部首和大致总画数缩小候选范围。"], ["标记韩国人名用汉字", "结果会区分一般韩国汉字与法院公开名单中的人名用汉字，但正式登记仍应以法院为准。"]], howTitle: "如何查询韩国汉字", steps: ["输入一个汉字、一个韩文读音或韩语含义。", "需要时选择部首、总画数或人名用汉字筛选。", "从结果中选择汉字并查看完整资料。"], faqs: [["옥편 和韩国汉字字典有什么区别？", "옥편 原指按部首编排的汉字字典，现在也常用来指可以按部首、画数或读音检索的在线汉字工具。"], ["可以只查韩国人名允许使用的汉字吗？", "可以勾选人名用筛选，但姓名登记政策可能更新，办理手续前请再次核对韩国法院官方名单。"], ["为什么有些生僻字没有部首或画数？", "韩文读音词典覆盖范围大于站内字形资料，少数扩展汉字暂时只有读音与释义。"]] },
      "zh-TW": { title: "韓國漢字查詢 - 韓文讀音、部首與畫數 | JianFan.app", description: "免費韓國漢字查詢與線上韓文漢字字典，可依漢字、韓文讀音、韓語釋義、部首和總筆畫搜尋，並篩選韓國法院公開的人名用漢字。結果顯示韓國漢字音、韓文訓釋、部首、筆畫數、英文含義與 Unicode 字形，可接續手寫查字、結構拆解或人名用字核驗。字典資料按需在瀏覽器本機載入，免註冊，也支援電腦、平板與手機使用。", eyebrow: "韓國漢字 · 韓文讀音 · 部首 · 畫數", heading: "韓國漢字查詢與線上字典", lede: "輸入漢字、韓文讀音或韓語釋義，也可搭配部首、總畫數和人名用漢字篩選，查找不會唸或不熟悉的韓國漢字。", toolTitle: "依讀音、部首或畫數查找韓國漢字", queryLabel: "漢字、韓文讀音或韓語釋義", placeholder: "例如：韓、한、나라", radical: "部首", allRadicals: "全部部首", strokes: "總畫數", allStrokes: "全部畫數", nameOnly: "只顯示韓國人名用漢字", search: "查詢漢字", clear: "清除", resultsTitle: "查詢結果", resultEmpty: "輸入韓文讀音、漢字或篩選條件後，結果會顯示在這裡。", detailTitle: "漢字詳情", detailEmpty: "選擇一個結果，查看韓國讀音、含義與人名用狀態。", labels: { readings: "韓文讀音", meanings: "韓語釋義", radical: "部首", strokes: "總畫數", name: "人名用狀態" }, structure: "查看漢字結構", nameLink: "核驗人名用漢字", nameAllowed: "韓國法院公開名單中可用於人名", nameNotConfirmed: "未在目前法院公開名單中確認", source: "韓文讀音和釋義來自 libhangul，部首與畫數參考 Unicode Unihan；人名用狀態來自韓國法院公開查詢。", featureTitle: "用韓文讀音、部首與畫數完成韓式線上查字", featureIntro: "韓國的線上 옥편（玉篇）通常需要同時支援 한자 찾기、부수、획수 與韓文讀音，本頁將這些線索集中在同一介面。", cards: [["韓文讀音與韓語釋義", "依 한、국、민 等讀音查找同音漢字，並查看 libhangul 提供的韓語訓釋。"], ["部首與總畫數篩選", "不知道讀音時，可依可辨認的部首與大致總畫數縮小候選範圍。"], ["標示韓國人名用漢字", "結果會區分一般韓國漢字與法院公開名單中的人名用漢字，正式登記仍應以法院為準。"]], howTitle: "如何查詢韓國漢字", steps: ["輸入一個漢字、一個韓文讀音或韓語含義。", "需要時選擇部首、總畫數或人名用漢字篩選。", "從結果中選擇漢字並查看完整資料。"], faqs: [["옥편 和韓國漢字字典有何不同？", "옥편 原指依部首編排的漢字字典，現在也常指可依部首、畫數或讀音檢索的線上漢字工具。"], ["可以只查韓國人名允許使用的漢字嗎？", "可以勾選人名用篩選，但姓名登記政策可能更新，辦理手續前請再次核對韓國法院官方名單。"], ["為何有些罕用字沒有部首或畫數？", "韓文讀音詞典的涵蓋範圍大於站內字形資料，少數擴展漢字暫時只有讀音與釋義。"]] },
      en: { title: "Korean Hanja Dictionary - Radical & Stroke Search | JianFan.app", description: "Search Korean Hanja by character, Hangul reading, meaning, radical or total strokes. Filter personal-name Hanja and view readings, definitions and Unicode.", eyebrow: "KOREAN HANJA · READINGS · RADICALS · STROKES", heading: "Korean Hanja Dictionary & Lookup", lede: "Search by Hanja, a Korean reading or meaning, then combine radical, stroke count and personal-name filters to narrow unfamiliar characters.", toolTitle: "Find Korean Hanja from the clues you know", queryLabel: "Hanja, Hangul reading or Korean meaning", placeholder: "For example: 韓, 한, 나라", radical: "Radical", allRadicals: "All radicals", strokes: "Total strokes", allStrokes: "All stroke counts", nameOnly: "Personal-name Hanja only", search: "Search Hanja", clear: "Clear", resultsTitle: "Search results", resultEmpty: "Enter a reading, character or filter to see matching Korean Hanja.", detailTitle: "Hanja details", detailEmpty: "Choose a result to inspect its Korean readings, meaning and name-use status.", labels: { readings: "Korean readings", meanings: "Korean glosses", radical: "Radical", strokes: "Total strokes", name: "Name-use status" }, structure: "View character structure", nameLink: "Check personal-name Hanja", nameAllowed: "Listed for personal names by the Korean court", nameNotConfirmed: "Not confirmed in the current court list", source: "Korean readings and glosses come from libhangul; radicals and strokes reference Unicode Unihan. Name-use status uses the Korean court's public lookup.", featureTitle: "A Korean Hanja lookup for readings, radicals and strokes", featureIntro: "Korean searches for 한자 찾기 and 옥편 often require Hangul readings, 부수 and 획수 together. This page combines those clues in one focused reference tool.", cards: [["Hangul readings and Korean glosses", "Find homophonous Hanja from readings such as 한, 국 or 민 and compare their Korean dictionary glosses."], ["Radical and stroke filters", "When pronunciation is unknown, narrow the list with a recognizable radical and approximate total stroke count."], ["Current personal-name markers", "Distinguish general Korean Hanja from characters in the court's public name list, while treating the court as the final authority."]], howTitle: "How to look up Korean Hanja", steps: ["Enter a Hanja, one Hangul reading or a Korean meaning.", "Optionally select a radical, total strokes or the personal-name filter.", "Choose a result to inspect the full character record."], faqs: [["What does 옥편 mean?", "옥편 originally meant a radical-indexed Chinese character dictionary and now commonly describes online Hanja lookup by radical, strokes or reading."], ["Can I show only Hanja allowed in Korean names?", "Yes, but name-registration rules can change. Confirm the character again on the Korean court's official service before filing documents."], ["Why do some rare Hanja lack radical or stroke data?", "The Korean reading dictionary covers more extension characters than the site's glyph dataset, so a few records contain readings and glosses only."]] },
      ja: { title: "韓国漢字検索 - ハングル読み・部首・画数 | JianFan.app", description: "韓国で使われる漢字を、字形、ハングルの読み、韓国語の意味、部首、総画数から無料検索できる韓国漢字辞典です。韓国裁判所が公開する人名用漢字だけに絞り込み、韓国漢字音、韓国語の訓、部首、画数、英語の意味、Unicodeを確認できます。手書き検索、構成分解、人名用漢字確認にも進め、辞書は必要時だけブラウザーに読み込みます。", eyebrow: "韓国漢字 · ハングル読み · 部首 · 画数", heading: "韓国漢字検索・オンライン辞典", lede: "漢字、ハングルの読み、韓国語の意味を入力し、部首、総画数、人名用漢字の条件を組み合わせて韓国漢字を検索できます。", toolTitle: "分かる手掛かりから韓国漢字を探す", queryLabel: "漢字・ハングル読み・韓国語の意味", placeholder: "例：韓、한、나라", radical: "部首", allRadicals: "すべての部首", strokes: "総画数", allStrokes: "すべての画数", nameOnly: "韓国の人名用漢字だけ表示", search: "漢字を検索", clear: "クリア", resultsTitle: "検索結果", resultEmpty: "読み、漢字、検索条件を入力すると候補が表示されます。", detailTitle: "漢字情報", detailEmpty: "候補を選ぶと韓国語読み、意味、人名用の状態を確認できます。", labels: { readings: "韓国語読み", meanings: "韓国語の訓", radical: "部首", strokes: "総画数", name: "人名用の状態" }, structure: "漢字の構成を見る", nameLink: "人名用漢字を確認", nameAllowed: "韓国裁判所の公開リストで人名に使用可能", nameNotConfirmed: "現在の裁判所公開リストでは未確認", source: "韓国語読みと訓は libhangul、部首と画数は Unicode Unihan を参照し、人名用の状態は韓国裁判所の公開検索に基づきます。", featureTitle: "ハングル読み・部首・画数を組み合わせる韓国漢字検索", featureIntro: "韓国のオンライン 옥편 で求められる 한자 찾기、부수、획수、ハングル読みを一つの検索画面にまとめました。", cards: [["ハングル読みと韓国語の訓", "한、국、민 などの読みから同音漢字を探し、韓国語辞書の訓を比較できます。"], ["部首と総画数で絞り込み", "読み方が分からないときは、見える部首とおおよその総画数から候補を絞れます。"], ["韓国の人名用漢字を表示", "一般の韓国漢字と裁判所公開リストの人名用漢字を区別します。正式な届出は裁判所で再確認してください。"]], howTitle: "韓国漢字を検索する方法", steps: ["漢字、ハングル読み、韓国語の意味のいずれかを入力します。", "必要に応じて部首、総画数、人名用漢字を選びます。", "候補を選んで詳しい情報を確認します。"], faqs: [["옥편 とは何ですか？", "本来は部首順の漢字辞典を指し、現在の韓国語では部首・画数・読みから探せるオンライン漢字辞典にも使われます。"], ["韓国の人名に使える漢字だけ検索できますか？", "できます。ただし登録規則は更新されるため、届出前に韓国裁判所の公式サービスで再確認してください。"], ["一部の珍しい漢字に部首や画数がないのはなぜですか？", "韓国語読み辞書の収録範囲が字形データより広く、一部の拡張漢字は読みと訓だけを表示します。"]] },
      ko: { title: "한자 찾기 - 옥편 부수 획수 한자사전 | JianFan.app", description: "한자 찾기와 옥편입니다. 한자, 한글 음, 뜻, 부수, 총획수로 검색하고 대법원 공개 인명용 한자만 따로 볼 수 있습니다. 결과에서 한자음, 훈, 부수, 획수와 유니코드를 확인하고 필기인식, 한자 구조와 이름 한자 조회로 이동합니다. 사전은 필요할 때 브라우저에서 불러옵니다.", eyebrow: "한자 찾기 · 옥편 · 부수 · 획수", heading: "한자 찾기·온라인 옥편", lede: "한자, 한글 음이나 뜻을 입력하고 부수, 총획수, 인명용 한자 조건을 함께 선택해 모르는 한자를 찾으세요.", toolTitle: "아는 단서로 한자 찾기", queryLabel: "한자·한글 음·뜻풀이", placeholder: "예: 韓, 한, 나라", radical: "부수", allRadicals: "모든 부수", strokes: "총획수", allStrokes: "모든 획수", nameOnly: "인명용 한자만 보기", search: "한자 검색", clear: "지우기", resultsTitle: "검색 결과", resultEmpty: "한글 음, 한자 또는 검색 조건을 입력하면 결과가 표시됩니다.", detailTitle: "한자 정보", detailEmpty: "결과를 선택해 한자음, 뜻과 인명용 여부를 확인하세요.", labels: { readings: "한자음", meanings: "뜻과 훈", radical: "부수", strokes: "총획수", name: "인명용 여부" }, structure: "한자 구조 보기", nameLink: "인명용 한자 확인", nameAllowed: "대법원 공개 목록의 인명용 한자", nameNotConfirmed: "현재 대법원 공개 목록에서 확인되지 않음", source: "한자음과 훈은 libhangul, 부수와 획수는 Unicode Unihan을 참고하며 인명용 여부는 대한민국 법원 공개 조회를 사용합니다.", featureTitle: "한글 음·부수·획수로 찾는 온라인 옥편", featureIntro: "읽기를 알면 한글 음으로, 모르면 부수와 총획수로 찾을 수 있습니다. 한자 찾기, 옥편, 부수·획수 검색을 한 화면에 모았습니다.", cards: [["한자음과 뜻풀이", "한, 국, 민처럼 같은 음을 가진 한자를 모아 보고 libhangul의 훈과 뜻을 비교합니다."], ["부수·총획수 검색", "읽기를 모를 때 눈에 보이는 부수와 대략적인 총획수를 선택해 후보를 줄입니다."], ["인명용 한자 표시", "일반 한자와 대법원 공개 목록의 인명용 한자를 구분하며, 실제 신고 전에는 법원 자료를 다시 확인해야 합니다."]], howTitle: "온라인에서 한자 찾는 방법", steps: ["한자 한 글자, 한글 음 또는 뜻을 입력합니다.", "필요하면 부수, 총획수, 인명용 한자 조건을 선택합니다.", "검색 결과에서 글자를 눌러 상세 정보를 봅니다."], faqs: [["옥편과 한자사전은 다른가요?", "옥편은 원래 부수 순으로 찾는 자전을 뜻하지만, 현재는 음·부수·획수 검색을 제공하는 온라인 한자사전도 흔히 옥편이라고 부릅니다."], ["이름에 쓸 수 있는 한자만 찾을 수 있나요?", "인명용 한자만 보기로 검색할 수 있습니다. 다만 신고 기준은 바뀔 수 있으므로 최종 확인은 대한민국 법원에서 해야 합니다."], ["일부 한자에 부수나 획수가 없는 이유는 무엇인가요?", "한자음 자료가 사이트의 글자 모양 자료보다 넓은 확장 한자를 포함해 일부는 음과 뜻만 제공됩니다."]] }
    }
  },
  "korean-hanja-handwriting-recognition": {
    type: "handwriting",
    content: {
      "zh-CN": { title: "韩国汉字手写识别 - 在线手写查字 | JianFan.app", description: "免费韩国汉字手写识别与在线手写查字工具。遇到不会读、无法输入的韩国汉字，可用鼠标、触控板、触屏或手写笔在田字格中逐笔书写。页面先在浏览器端匹配候选，并优先显示有韩国读音或韩国人名用名单中的汉字；本地没有结果或用户主动选择时，使用远程识别。选中后可查看韩文读音、笔画数、Unicode、韩国汉字字典、人名用状态和汉字结构。", eyebrow: "韩国汉字 · 手写识别 · 韩文读音", heading: "韩国汉字手写识别与查字", lede: "不知道韩国汉字怎么读、也无法输入时，直接照着字形逐笔写下，选择按韩文词典重新排序的相似候选。", toolTitle: "在田字格中手写一个韩国汉字", drawTitle: "手写输入", strokeCount: "已写 {count} 笔", undo: "撤销上一笔", clear: "清空重写", samples: "试用示例", drawHint: "请尽量写大、写在中央，并按常见笔顺逐笔书写。", candidatesTitle: "识别候选字", candidatesHint: "候选会优先显示有韩国读音或属于韩国人名用名单的汉字。", candidatesEmpty: "写下第一笔后，候选汉字会显示在这里。", remoteHint: "候选不准确？", remoteAction: "试试远程识别", resultTitle: "查字结果", labels: { reading: "韩文读音", strokes: "笔画数", unicode: "Unicode" }, copy: "复制汉字", dictionary: "韩国汉字字典", name: "核验人名用状态", structure: "查看结构", source: "默认由开源 HanziLookup 在浏览器中匹配笔画，必要时可使用远程识别；候选再按韩国汉字词典和人名用数据排序。", featureTitle: "不知道读音时，直接手写查找韩国汉字", featureIntro: "한자 필기인식、한자 써서 찾기 的核心场景是看得见字形却不知道汉字音。本页无需先输入韩文读音或部首。", cards: [["边写边显示候选", "每完成一笔自动更新候选，可撤销错误笔画并重新书写。"], ["按韩国资料重新排序", "常见韩国汉字和人名用汉字会优先于没有韩文读音资料的候选。"], ["本地优先，远程保底", "通常在浏览器中匹配；本地没有结果或主动选择远程识别时，才会发送当前笔画坐标。"]], howTitle: "如何手写查找韩国汉字", steps: ["在田字格中央逐笔写下一个汉字。", "从自动更新的候选中选择最接近的字。", "查看韩文读音，并继续前往字典或人名用查询。"], faqs: [["必须按正确笔顺书写吗？", "识别会参考笔画方向、位置和数量，按常见笔顺清楚书写通常更准确，但少量差异仍可能找到候选。"], ["支持连续手写韩文句子吗？", "不支持。本页一次识别一个汉字，不是照片 OCR 或连续手写文字识别。"], ["笔迹会上传到服务器吗？", "默认不会，本地识别在浏览器中完成。仅当本地没有结果或你主动选择远程识别时，当前笔画坐标会发送到远程识别服务。"]] },
      "zh-TW": { title: "韓國漢字手寫辨識 - 線上手寫查字 | JianFan.app", description: "韓國漢字手寫辨識與線上手寫查字工具。遇到不會唸、無法輸入的韓國漢字，可用滑鼠、觸控板、觸控螢幕或手寫筆在田字格中逐畫書寫。頁面先在瀏覽器端比對候選，並優先顯示有韓國讀音或人名用名單中的漢字；本機沒有結果或使用者主動選擇時，再使用遠端辨識。選取後可查看韓文讀音、筆畫數、Unicode、韓國漢字字典、人名用狀態與漢字結構。", eyebrow: "韓國漢字 · 手寫辨識 · 韓文讀音", heading: "韓國漢字手寫辨識與查字", lede: "不知道韓國漢字怎麼唸、也無法輸入時，直接照著字形逐畫寫下，再從依韓文詞典排序的相似候選中選字。", toolTitle: "在田字格中手寫一個韓國漢字", drawTitle: "手寫輸入", strokeCount: "已寫 {count} 畫", undo: "復原上一畫", clear: "清除重寫", samples: "試用範例", drawHint: "請盡量寫大、置中，並依一般筆順逐畫書寫。", candidatesTitle: "辨識候選字", candidatesHint: "候選會優先顯示有韓國讀音或屬於韓國人名用名單的漢字。", candidatesEmpty: "寫下第一畫後，候選漢字會顯示在這裡。", remoteHint: "候選不準確？", remoteAction: "試試遠端辨識", resultTitle: "查字結果", labels: { reading: "韓文讀音", strokes: "筆畫數", unicode: "Unicode" }, copy: "複製漢字", dictionary: "韓國漢字字典", name: "核驗人名用狀態", structure: "查看結構", source: "預設由開源 HanziLookup 在瀏覽器中比對筆畫，必要時可使用遠端辨識；候選再依韓國漢字詞典與人名用資料排序。", featureTitle: "不知道讀音時，直接手寫查找韓國漢字", featureIntro: "한자 필기인식、한자 써서 찾기 的主要情境是看得見字形卻不知道漢字音，本頁不需先輸入韓文讀音或部首。", cards: [["邊寫邊顯示候選", "每完成一畫就自動更新候選，可復原錯誤筆畫並重新書寫。"], ["依韓國資料重新排序", "常見韓國漢字和人名用漢字會優先於沒有韓文讀音資料的候選。"], ["本機優先，遠端備援", "通常在瀏覽器中比對；本機沒有結果或主動選擇遠端辨識時，才會傳送目前的筆畫座標。"]], howTitle: "如何手寫查找韓國漢字", steps: ["在田字格中央逐畫寫下一個漢字。", "從自動更新的候選中選擇最接近的字。", "查看韓文讀音，再前往字典或人名用查詢。"], faqs: [["必須依正確筆順書寫嗎？", "辨識會參考筆畫方向、位置和數量，依一般筆順清楚書寫通常更準確，但少量差異仍可能找到候選。"], ["支援連續手寫韓文句子嗎？", "不支援。本頁一次辨識一個漢字，不是照片 OCR 或連續手寫文字辨識。"], ["筆跡會上傳到伺服器嗎？", "預設不會，本機辨識在瀏覽器中完成。只有本機沒有結果或你主動選擇遠端辨識時，目前的筆畫座標才會傳送至遠端辨識服務。"]] },
      en: { title: "Korean Hanja Handwriting - Draw and Find | JianFan.app", description: "Draw Korean Hanja to find similar characters without knowing the reading. See Hangul readings, strokes and Unicode, then open the dictionary or name checker.", eyebrow: "KOREAN HANJA · DRAW · RECOGNIZE", heading: "Korean Hanja Handwriting Recognition", lede: "When you can see a Hanja but cannot type or pronounce it, draw the shape one stroke at a time and choose from matches reranked for Korean use.", toolTitle: "Draw one Korean Hanja in the grid", drawTitle: "Handwriting input", strokeCount: "{count} strokes drawn", undo: "Undo last stroke", clear: "Clear drawing", samples: "Try a sample", drawHint: "Write large and near the centre. Following the usual stroke order improves recognition.", candidatesTitle: "Character matches", candidatesHint: "Matches with Korean readings or current personal-name status are shown first.", candidatesEmpty: "Draw the first stroke to see likely Hanja.", remoteHint: "Matches not right?", remoteAction: "Try online recognition", resultTitle: "Hanja details", labels: { reading: "Korean reading", strokes: "Stroke count", unicode: "Unicode" }, copy: "Copy Hanja", dictionary: "Korean Hanja dictionary", name: "Check name-use status", structure: "View structure", source: "The open-source HanziLookup matcher runs locally by default, with online recognition available when needed; matches are then reranked with Korean Hanja data.", featureTitle: "Draw an unknown Korean Hanja instead of guessing its reading", featureIntro: "Korean searches such as 한자 필기인식 and 한자 써서 찾기 begin with a visible shape rather than pronunciation. No Hangul reading or radical is required.", cards: [["Live candidate updates", "Matches refresh after each completed stroke, and you can undo a mistaken line without starting over."], ["Reranked for Korean usage", "Hanja with Korean readings and current personal-name status appear ahead of unsupported character matches."], ["Local first, online fallback", "Matching normally stays in the browser. Stroke coordinates are sent only after no local match or when you choose online recognition."]], howTitle: "How to find Korean Hanja by handwriting", steps: ["Draw one character in the centre of the grid, one stroke at a time.", "Choose the closest Hanja from the automatically updated matches.", "Check its Korean reading, then open the dictionary or name-use lookup."], faqs: [["Must I use the correct stroke order?", "The matcher considers stroke direction, position and count. Clear writing in the usual order works best, although small differences can still produce matches."], ["Can it read a photo or a handwritten Korean sentence?", "No. It recognizes one Hanja drawn on the pad and is not photo OCR or continuous handwriting recognition."], ["Are my pen strokes uploaded?", "Not by default. Local matching runs in the browser. Stroke coordinates are sent to the online recognition service only when no local match is found or you choose to try it."]] },
      ja: { title: "韓国漢字の手書き検索 - 書いて調べる | JianFan.app", description: "読み方が分からず入力できない韓国漢字を、マウスやペンで1画ずつ書いて検索できます。ブラウザー内で候補を照合し、韓国語読みがある漢字や韓国の人名用漢字を優先表示。候補がない場合、または利用者が選んだ場合のみオンライン認識を使います。選択後はハングル読み、画数、Unicode、韓国漢字辞典、人名用漢字、構成を確認できます。", eyebrow: "韓国漢字 · 手書き認識 · ハングル読み", heading: "韓国漢字の手書き検索", lede: "読み方が分からず入力できない韓国漢字を見たまま1画ずつ書き、韓国語辞書向けに並べ直した候補から選べます。", toolTitle: "マスの中に韓国漢字を1文字書く", drawTitle: "手書き入力", strokeCount: "{count}画入力", undo: "1画戻す", clear: "すべて消す", samples: "サンプル", drawHint: "中央に大きく、一般的な筆順で1画ずつはっきり書くと認識しやすくなります。", candidatesTitle: "漢字候補", candidatesHint: "韓国語読みがある漢字と韓国の人名用漢字を優先して表示します。", candidatesEmpty: "最初の1画を書くと候補が表示されます。", remoteHint: "候補が合いませんか？", remoteAction: "オンライン認識を試す", resultTitle: "韓国漢字情報", labels: { reading: "ハングル読み", strokes: "画数", unicode: "Unicode" }, copy: "漢字をコピー", dictionary: "韓国漢字辞典", name: "人名用を確認", structure: "構成を見る", source: "通常はオープンソースの HanziLookup がブラウザー内で照合し、必要な場合のみオンライン認識を使います。候補は韓国漢字データで並べ直します。", featureTitle: "読めない韓国漢字をそのまま手書きして調べる", featureIntro: "한자 필기인식、한자 써서 찾기 は、読みではなく見えている字形から始める検索です。ハングル読みや部首を先に知る必要はありません。", cards: [["書きながら候補を更新", "1画ごとに候補が更新され、間違えた画だけを戻して書き直せます。"], ["韓国での使用を優先", "韓国語読みがある漢字と現在の人名用漢字を、未対応の候補より上に表示します。"], ["ローカル優先、オンラインで補完", "通常はブラウザー内で照合し、ローカル候補がない場合か、利用者が選んだ場合だけ筆画座標を送信します。"]], howTitle: "韓国漢字を手書きで探す方法", steps: ["マスの中央に漢字を1画ずつ書きます。", "自動更新される候補から最も近い字を選びます。", "ハングル読みを確認し、辞典や人名用検索へ進みます。"], faqs: [["正しい書き順で書く必要がありますか？", "画の方向、位置、数を照合するため一般的な筆順が有利ですが、少し違っても候補が出る場合があります。"], ["写真や手書きの韓国語文章を認識できますか？", "できません。手書きパッドに書いた漢字1文字を検索する機能で、写真OCRや文章認識ではありません。"], ["筆跡はサーバーに送信されますか？", "通常は送信されず、ローカル認識はブラウザー内で実行されます。ローカル候補がない場合、またはオンライン認識を選んだ場合だけ筆画座標を送信します。"]] },
      ko: { title: "한자 필기인식 - 한자 써서 찾기 | JianFan.app", description: "한자 필기인식·써서 찾기 도구입니다. 모르는 한자를 마우스나 펜으로 쓰면 후보 중 한자음이나 인명용 정보가 있는 글자를 우선 표시합니다. 결과가 없거나 선택할 때만 온라인 인식을 사용합니다. 후보를 고르면 한자음, 획수, 유니코드와 한자사전, 인명용 여부 및 구조를 확인할 수 있습니다.", eyebrow: "한자 필기인식 · 써서 찾기 · 한자음", heading: "한자 필기인식·써서 찾기", lede: "읽을 수 없고 키보드로 입력하기 어려운 한자를 칸 안에 한 획씩 써 보세요. 한국 한자 자료에 맞춰 정렬한 후보를 보여 줍니다.", toolTitle: "찾을 한자 한 글자 쓰기", drawTitle: "필기 입력", strokeCount: "{count}획 입력", undo: "한 획 취소", clear: "다시 쓰기", samples: "예시", drawHint: "칸 중앙에 크게 쓰고 일반적인 필순으로 한 획씩 또렷하게 그리세요.", candidatesTitle: "한자 후보", candidatesHint: "한국 한자음이 있거나 인명용 한자인 후보를 먼저 보여 줍니다.", candidatesEmpty: "첫 획을 쓰면 비슷한 한자 후보가 여기에 표시됩니다.", remoteHint: "후보가 정확하지 않나요?", remoteAction: "온라인 인식 시도", resultTitle: "한자 정보", labels: { reading: "한자음", strokes: "획수", unicode: "유니코드" }, copy: "한자 복사", dictionary: "한자사전에서 찾기", name: "인명용 여부 확인", structure: "한자 구조 보기", source: "기본적으로 오픈 소스 HanziLookup이 브라우저에서 획을 비교하고, 필요할 때만 온라인 인식을 사용합니다. 후보는 한국 한자 자료로 다시 정렬합니다.", featureTitle: "음과 부수를 몰라도 한자를 직접 써서 찾기", featureIntro: "한자 필기인식과 한자 써서 찾기는 글자 모양만 알고 읽기를 모를 때 유용합니다. 한글 음이나 부수를 먼저 입력할 필요가 없습니다.", cards: [["쓰는 동안 후보 갱신", "한 획을 마칠 때마다 후보가 바뀌며 잘못 쓴 획만 취소하고 계속 쓸 수 있습니다."], ["한국 한자 자료로 재정렬", "한국 한자음이 있는 글자와 현재 인명용 한자를 지원 정보가 없는 후보보다 먼저 보여 줍니다."], ["로컬 우선, 온라인 보완", "평소에는 브라우저에서 비교하며, 로컬 후보가 없거나 사용자가 온라인 인식을 선택할 때만 획 좌표를 전송합니다."]], howTitle: "한자를 써서 찾는 방법", steps: ["칸 중앙에 한자 한 글자를 한 획씩 씁니다.", "자동으로 갱신되는 후보에서 가장 비슷한 글자를 고릅니다.", "한자음을 확인하고 옥편이나 인명용 한자 조회를 엽니다."], faqs: [["정확한 필순으로 써야 하나요?", "획의 방향, 위치, 수를 비교하므로 일반적인 필순으로 또렷하게 쓰면 더 정확하지만 조금 달라도 후보가 나올 수 있습니다."], ["사진이나 손글씨 문장도 인식하나요?", "아니요. 필기 칸에 쓴 한자 한 글자를 찾는 기능이며 사진 OCR이나 연속 필기 인식은 지원하지 않습니다."], ["쓴 내용이 서버로 전송되나요?", "기본적으로 전송되지 않고 로컬 인식은 브라우저에서 실행됩니다. 로컬 후보가 없거나 온라인 인식을 직접 선택한 경우에만 현재 획 좌표를 전송합니다."]] }
    }
  },
  "hangul-hanja-converter": {
    type: "converter",
    content: {
      "zh-CN": { title: "韩文汉字转换 - Hangul Hanja 在线转换 | JianFan.app", description: "免费韩文汉字在线转换工具，支持 한글 한자 변환 与 한자 한글 변환。输入现代韩文词语或韩国汉字文本，可在浏览器端按词典进行双向替换，也能保留原文并在括号中标注转换结果。遇到同音异字时会显示候选汉字供选择，适合阅读韩国姓名、历史资料、新闻标题和汉字词。词典按需加载，文本不会上传，结果可直接复制使用。", eyebrow: "한글 ⇄ 漢字 · 双向转换 · 同音候选", heading: "韩文与韩国汉字在线转换", lede: "支持韩文转汉字与汉字转韩文，优先匹配完整词语，并为韩文同音词提供候选汉字。", toolTitle: "输入韩文或韩国汉字文本", inputLabel: "待转换文本", inputPlaceholder: "例如：대한민국의 역사와 문화", outputLabel: "转换结果", outputPlaceholder: "结果会显示在这里", directions: ["韩文转汉字", "汉字转韩文"], modeLabel: "显示方式", modes: ["仅显示转换结果", "한글(漢字)", "漢字(한글)"], convert: "开始转换", sample: "加载示例", clear: "清空", copy: "复制结果", choicesTitle: "同音候选", choicesEmpty: "出现多个汉字候选时，可在这里选择。", source: "转换词典来自 libhangul。自动转换不能理解所有上下文，姓名、古文和正式文件请人工复核。", featureTitle: "支持韩文转汉字与汉字转韩文", featureIntro: "韩国键盘通常一次选择一个汉字，本页可以处理词语和短文，并保留同音候选供人工确认。", cards: [["词语优先匹配", "优先识别 대한민국、역사 等完整词语，减少逐字转换产生的错误组合。"], ["三种显示格式", "支持仅显示转换结果、한글(漢字) 和 漢字(한글)，便于阅读、校对或正式文档排版。"], ["候选音训与个人词典", "候选会显示韩国汉字音训；人名、地名和专业术语可保存到浏览器个人词典并优先转换。"]], howTitle: "如何进行韩文汉字转换", steps: ["选择韩文转汉字或汉字转韩文。", "输入文本并选择仅转换、한글(漢字) 或 漢字(한글)。", "检查同音候选后复制结果。"], faqs: [["韩文转汉字会自动判断所有词义吗？", "不会。词典会优先匹配已有词语，但同音词和姓名仍需要结合上下文人工选择。"], ["汉字转韩文支持整段文字吗？", "支持常见韩国汉字词的段落转换，未收录的生僻组合会保留原字。"], ["个人词典会上传或同步吗？", "不会。个人词条只保存在当前浏览器，不会上传，也不会自动同步到其他设备。"], ["输入文本会上传吗？", "不会。词典文件按需下载后，匹配与转换都在浏览器中完成。"]] },
      "zh-TW": { title: "韓文漢字轉換 - Hangul Hanja 線上轉換 | JianFan.app", description: "免費韓文漢字線上轉換工具，支援 한글 한자 변환 與 한자 한글 변환。輸入現代韓文詞語或韓國漢字文本，可在瀏覽器端依詞典雙向替換，也能保留原文並在括號內標註轉換結果。遇到同音異字時會顯示候選漢字供選擇，適合閱讀韓國姓名、歷史資料、新聞標題和漢字詞。詞典按需載入，文字不會上傳，結果可直接複製並隨時使用。", eyebrow: "한글 ⇄ 漢字 · 雙向轉換 · 同音候選", heading: "韓文與韓國漢字線上轉換", lede: "支援韓文轉漢字與漢字轉韓文，優先配對完整詞語，並為韓文同音詞提供候選漢字。", toolTitle: "輸入韓文或韓國漢字文本", inputLabel: "待轉換文字", inputPlaceholder: "例如：대한민국의 역사와 문화", outputLabel: "轉換結果", outputPlaceholder: "結果會顯示在這裡", directions: ["韓文轉漢字", "漢字轉韓文"], modeLabel: "顯示方式", modes: ["只顯示轉換結果", "한글(漢字)", "漢字(한글)"], convert: "開始轉換", sample: "載入範例", clear: "清除", copy: "複製結果", choicesTitle: "同音候選", choicesEmpty: "出現多個漢字候選時，可在這裡選擇。", source: "轉換詞典來自 libhangul。自動轉換無法理解所有上下文，姓名、古文與正式文件請人工複核。", featureTitle: "支援韓文轉漢字與漢字轉韓文", featureIntro: "韓國鍵盤通常一次選擇一個漢字，本頁可處理詞語和短文，並保留同音候選供人工確認。", cards: [["優先配對完整詞語", "優先辨識 대한민국、역사 等完整詞語，減少逐字轉換造成的錯誤組合。"], ["三種顯示格式", "支援只顯示轉換結果、한글(漢字) 與 漢字(한글)，方便閱讀、校對或正式文件排版。"], ["候選音訓與個人辭典", "候選會顯示韓國漢字音訓；人名、地名與專業詞語可存入瀏覽器個人辭典並優先轉換。"]], howTitle: "如何進行韓文漢字轉換", steps: ["選擇韓文轉漢字或漢字轉韓文。", "輸入文字並選擇只轉換、한글(漢字) 或 漢字(한글)。", "檢查同音候選後複製結果。"], faqs: [["韓文轉漢字會自動判斷所有詞義嗎？", "不會。詞典會優先配對既有詞語，但同音詞和姓名仍需配合上下文人工選擇。"], ["漢字轉韓文支援整段文字嗎？", "支援常見韓國漢字詞的段落轉換，未收錄的罕見組合會保留原字。"], ["個人辭典會上傳或同步嗎？", "不會。個人詞條只保存在目前瀏覽器，不會上傳，也不會自動同步到其他裝置。"], ["輸入文字會上傳嗎？", "不會。詞典檔案按需下載後，配對與轉換都在瀏覽器中完成。"]] },
      en: { title: "Hangul Hanja Converter - Korean Text Conversion | JianFan.app", description: "Convert Korean text between Hangul and Hanja with phrase-first matching. Choose ambiguous Hanja, add parenthetical readings, and keep text in your browser.", eyebrow: "HANGUL ⇄ HANJA · PHRASE MATCHING · ALTERNATIVES", heading: "Hangul Hanja Converter", lede: "Convert Hangul to Hanja or Hanja to Hangul with phrase-first matching, optional parenthetical annotations and selectable homophone candidates.", toolTitle: "Enter Korean Hangul or Hanja text", inputLabel: "Text to convert", inputPlaceholder: "For example: 대한민국의 역사와 문화", outputLabel: "Converted result", outputPlaceholder: "The result appears here", directions: ["Hangul to Hanja", "Hanja to Hangul"], modeLabel: "Output style", modes: ["Converted text only", "한글(漢字)", "漢字(한글)"], convert: "Convert text", sample: "Load sample", clear: "Clear", copy: "Copy result", choicesTitle: "Ambiguous Hanja choices", choicesEmpty: "Alternative Hanja will appear here when a Korean reading has multiple matches.", source: "Mappings come from libhangul. Automatic conversion cannot resolve every context, so review names, classical text and official documents manually.", featureTitle: "Both 한글 한자 변환 and 한자 한글 변환 in one tool", featureIntro: "Korean input methods often choose one Hanja at a time. This converter handles phrases and short passages while keeping ambiguous choices visible.", cards: [["Phrase-first matching", "Known terms such as 대한민국 and 역사 are matched before individual syllables to avoid implausible combinations."], ["Three output layouts", "Choose converted text only, 한글(漢字), or 漢字(한글) for reading, review, and document formatting."], ["Korean glosses and personal terms", "Candidate meanings help distinguish homophones, while saved names, places, and specialist terms take priority in this browser."]], howTitle: "How to convert Hangul and Hanja", steps: ["Choose Hangul to Hanja or Hanja to Hangul.", "Enter text and choose converted text only, 한글(漢字), or 漢字(한글).", "Review ambiguous candidates, then copy the result."], faqs: [["Does Hangul-to-Hanja conversion understand every meaning?", "No. Known words are matched first, but homophones and personal names still require a human choice based on context."], ["Can Hanja-to-Hangul process a paragraph?", "It converts common Korean Hanja words in longer text and leaves unknown rare combinations unchanged."], ["Does the personal dictionary sync or upload entries?", "No. Personal entries stay in this browser and are not uploaded or automatically synced to another device."], ["Is the text uploaded?", "No. After the static dictionary loads, matching and conversion run entirely in your browser."]] },
      ja: { title: "ハングル・漢字変換 - 韓国語を双方向変換 | JianFan.app", description: "韓国語をハングルから漢字、漢字からハングルへ無料でオンライン変換できます。単語を優先して辞書照合し、原文の置換や括弧での併記に対応。同じ読みの漢字候補から文脈に合う字を選べるため、韓国人名、歴史資料、ニュース見出し、漢字語の読解に便利です。辞書は必要時だけ読み込み、入力文と変換処理はブラウザー内に残ります。", eyebrow: "ハングル ⇄ 漢字 · 双方向変換 · 同音候補", heading: "ハングル・韓国漢字変換", lede: "한글 한자 변환 と 한자 한글 변환 を切り替え、単語優先で照合しながら同音漢字の候補を選べます。", toolTitle: "ハングルまたは韓国漢字の文章を入力", inputLabel: "変換する文章", inputPlaceholder: "例：대한민국의 역사와 문화", outputLabel: "変換結果", outputPlaceholder: "結果がここに表示されます", directions: ["ハングルから漢字", "漢字からハングル"], modeLabel: "表示方法", modes: ["変換結果のみ", "한글(漢字)", "漢字(한글)"], convert: "変換する", sample: "サンプル", clear: "クリア", copy: "結果をコピー", choicesTitle: "同音漢字の候補", choicesEmpty: "同じ読みの漢字候補がある場合はここで選べます。", source: "変換辞書は libhangul を使用します。自動変換ですべての文脈は判断できないため、人名、漢文、公的文書は確認してください。", featureTitle: "한글 한자 변환 と 한자 한글 변환 を一つの画面で", featureIntro: "韓国語入力では1字ずつ漢字を選ぶことが多い一方、このページは単語と短文を処理し、同音候補も残します。", cards: [["単語を優先して照合", "대한민국、역사 など既知の語を1音節より先に照合し、不自然な字の組み合わせを減らします。"], ["3種類の表示形式", "変換結果のみ、한글(漢字)、漢字(한글)から、閲覧・校正・文書作成に合う形式を選べます。"], ["韓国語の訓と個人辞書", "候補の韓国語の訓を比較でき、人名・地名・専門用語はブラウザーの個人辞書に保存して優先変換できます。"]], howTitle: "ハングルと漢字を変換する方法", steps: ["ハングルから漢字、または漢字からハングルを選びます。", "文章を入力し、変換結果のみ、한글(漢字)、漢字(한글)から選びます。", "同音候補を確認して結果をコピーします。"], faqs: [["ハングルから漢字へ自動で意味を判定できますか？", "すべては判定できません。既知の単語を優先しますが、同音語や人名は文脈に合わせて選ぶ必要があります。"], ["漢字からハングルへ段落を変換できますか？", "一般的な韓国漢字語は長い文章でも変換し、辞書にない珍しい組み合わせは原文を残します。"], ["個人辞書は送信・同期されますか？", "送信されません。個人辞書は現在のブラウザーだけに保存され、別の端末へ自動同期されません。"], ["入力した文章は送信されますか？", "送信されません。静的辞書を読み込んだ後の照合と変換はブラウザー内で実行します。"]] },
      ko: { title: "한자 변환기 - 한글 한자·한자 한글 변환 | JianFan.app", description: "한자 변환기입니다. 한글 한자 변환과 한자 한글 변환을 지원하고, 긴 단어를 먼저 찾아 이름·한자어·문장을 바꿉니다. 같은 음의 한자 후보를 선택할 수 있으며 한자 번역기, 한자 독음 변환기처럼 읽기 확인에도 쓸 수 있습니다. 입력한 글은 브라우저에서 안전하게 처리합니다.", eyebrow: "한자 변환기 · 한글 ⇄ 한자 · 동음 후보", heading: "한자 변환기·한글 한자 변환", lede: "한글을 한자로, 한자를 한글로 바꾸는 온라인 한자 변환기입니다. 긴 단어를 먼저 찾고 같은 음의 한자 후보도 직접 고를 수 있습니다.", toolTitle: "한글 또는 한자 문장 입력", inputLabel: "변환할 내용", inputPlaceholder: "예: 대한민국의 역사와 문화", outputLabel: "변환 결과", outputPlaceholder: "결과가 여기에 표시됩니다", directions: ["한글을 한자로", "한자를 한글로"], modeLabel: "표시 방식", modes: ["변환 결과만", "한글(漢字)", "漢字(한글)"], convert: "변환하기", sample: "예시 불러오기", clear: "지우기", copy: "결과 복사", choicesTitle: "동음 한자 후보", choicesEmpty: "같은 음의 한자가 여러 개면 여기에서 선택할 수 있습니다.", source: "변환 사전은 libhangul을 사용합니다. 자동 변환은 모든 문맥을 이해하지 못하므로 이름, 한문, 공문서는 직접 확인해야 합니다.", featureTitle: "한자 변환기에서 한글 한자 변환과 독음 확인", featureIntro: "한자 변환기, 한자 번역기, 한자 독음 변환기를 찾는 사용자는 보통 한글을 한자로 바꾸거나 한자의 한글 읽기를 확인하려고 합니다. 이 페이지는 두 방향을 한 화면에서 처리합니다.", cards: [["긴 단어 먼저 찾기", "대한민국, 역사처럼 사전에 있는 단어를 한 음절보다 먼저 찾아 어색한 한자 조합을 줄입니다."], ["세 가지 표기 방식", "변환 결과만, 한글(漢字), 漢字(한글) 중에서 읽기, 교정이나 문서 작성에 맞는 형식을 고릅니다."], ["훈음 확인과 개인 사전", "후보의 한자 훈음을 비교하고 이름, 지명, 회사명이나 전문 용어를 브라우저 개인 사전에 저장해 우선 변환합니다."]], howTitle: "한자 변환기 사용 방법", steps: ["한글을 한자로 또는 한자를 한글로 방향을 고릅니다.", "문장을 입력하고 변환 결과만, 한글(漢字), 漢字(한글) 중 하나를 고릅니다.", "동음 후보를 확인한 뒤 결과를 복사합니다."], faqs: [["한자 변환기는 한자 번역기와 같은 기능인가요?", "완전한 번역기는 아닙니다. 한국 한자어의 한글 읽기와 한자 후보를 바꾸는 도구이며 문장 의미 번역은 제공하지 않습니다."], ["한글을 한자로 바꿀 때 뜻을 모두 구분하나요?", "아니요. 등록된 단어를 먼저 찾지만 동음어와 사람 이름은 문맥에 맞춰 직접 골라야 합니다."], ["한자 문장 전체를 한글로 바꿀 수 있나요?", "자주 쓰는 한국 한자어는 긴 글에서도 바꾸며 사전에 없는 드문 조합은 원문을 유지합니다."], ["개인 한자 사전이 서버로 전송되거나 동기화되나요?", "아니요. 개인 낱말은 현재 브라우저에만 저장되며 다른 기기로 자동 동기화되지 않습니다."], ["입력한 글이 서버로 전송되나요?", "아니요. 정적 사전을 불러온 뒤 검색과 변환은 현재 브라우저에서 처리합니다."]] }
    }
  },
  "korean-name-hanja": {
    type: "names",
    content: {
      "zh-CN": { title: "韩国人名用汉字查询 - 姓名汉字核验 | JianFan.app", description: "免费查询韩国人名用汉字、姓名汉字和指定韩文读音。输入一个韩文音、汉字或韩语释义，即可筛选韩国法院电子家族关系登记系统公开的人名用汉字，查看允许读音与官方查询返回的训释，并复制 Unicode 字形或打开韩国汉字字典。页面会单独说明依赖法院专用字形的扩展字，数据按公开接口生成；正式取名和登记前仍应以韩国法院最新规定为准。", eyebrow: "人名用汉字 · 韩国姓名 · 法院公开名单", heading: "韩国人名用汉字与姓名汉字查询", lede: "按韩文读音、汉字或释义查找韩国法院公开的人名用汉字，并核对该字允许使用的指定读音。", toolTitle: "查询一个姓名读音或人名用汉字", queryLabel: "韩文读音、汉字或韩语释义", placeholder: "例如：민、珉、옥돌", search: "查询人名用汉字", clear: "清空", resultsTitle: "人名用汉字结果", resultEmpty: "输入一个韩文音或汉字后，符合条件的人名用汉字会显示在这里。", copy: "复制汉字", dictionary: "查看韩国汉字字典", source: "数据来自韩国法院电子家族关系登记系统公开查询。页面只直接显示标准浏览器可呈现的 Unicode 字形；法院专用扩展字请前往官方系统核对。", featureTitle: "按姓名读音查找韩国人名用汉字", featureIntro: "韩国姓名汉字并不是所有汉字都能自由使用，还需要符合登记名单和指定读音。本页针对 이름 한자、인명용 한자 的查询场景。", cards: [["按韩文读音筛选", "输入 민、서、지 等一个韩文音，查看法院公开查询返回的所有对应人名用汉字。"], ["显示指定读音与训释", "同一个汉字可能有多个允许读音，结果会保留法院公开的读音和说明。"], ["区分标准与专用字形", "可用 Unicode 字形直接显示；依赖法院专用字体的扩展字不会用错误字符替代。"]], howTitle: "如何查询韩国姓名汉字", steps: ["输入一个韩文读音、一个汉字或韩语释义。", "从结果中比较字形、指定读音和训释。", "正式登记前在韩国法院系统再次核验。"], faqs: [["查询结果可以直接作为姓名登记依据吗？", "不建议。页面数据来自法院公开查询，但政策和字形支持可能更新，提交姓名登记前应以法院官方系统为准。"], ["为什么显示数量少于法院全部代码？", "部分扩展字使用法院专用字形编码，普通浏览器无法可靠显示，因此本页只列出标准 Unicode 可显示字形。"], ["同一个汉字可以按不同读音用于姓名吗？", "有些可以。页面会列出法院公开查询返回的指定读音，实际使用应符合当期登记规则。"]] },
      "zh-TW": { title: "韓國人名用漢字查詢 - 姓名漢字核驗 | JianFan.app", description: "免費查詢韓國人名用漢字、姓名漢字和指定韓文讀音。輸入一個韓文音、漢字或韓語釋義，即可篩選韓國法院電子家族關係登記系統公開的人名用漢字，查看允許讀音與官方查詢回傳的訓釋，並複製標準 Unicode 字形或開啟韓國漢字字典。頁面會另行說明依賴法院專用字形的擴展字；正式取名和登記前仍應以韓國法院最新規定為準。", eyebrow: "人名用漢字 · 韓國姓名 · 法院公開名單", heading: "韓國人名用漢字與姓名漢字查詢", lede: "依韓文讀音、漢字或釋義查找韓國法院公開的人名用漢字，並核對該字允許使用的指定讀音。", toolTitle: "查詢一個姓名讀音或人名用漢字", queryLabel: "韓文讀音、漢字或韓語釋義", placeholder: "例如：민、珉、옥돌", search: "查詢人名用漢字", clear: "清除", resultsTitle: "人名用漢字結果", resultEmpty: "輸入一個韓文音或漢字後，符合條件的人名用漢字會顯示在這裡。", copy: "複製漢字", dictionary: "查看韓國漢字字典", source: "資料來自韓國法院電子家族關係登記系統公開查詢。頁面只直接顯示標準瀏覽器可呈現的 Unicode 字形；法院專用擴展字請前往官方系統核對。", featureTitle: "依姓名讀音查找韓國人名用漢字", featureIntro: "韓國姓名漢字並非所有漢字都能自由使用，還需符合登記名單與指定讀音。本頁針對 이름 한자、인명용 한자 的查詢情境。", cards: [["依韓文讀音篩選", "輸入 민、서、지 等一個韓文音，查看法院公開查詢回傳的所有對應人名用漢字。"], ["顯示指定讀音與訓釋", "同一漢字可能有多個允許讀音，結果會保留法院公開的讀音和說明。"], ["區分標準與專用字形", "可用 Unicode 字形直接顯示；依賴法院專用字型的擴展字不會用錯誤字符替代。"]], howTitle: "如何查詢韓國姓名漢字", steps: ["輸入一個韓文讀音、一個漢字或韓語釋義。", "從結果中比較字形、指定讀音和訓釋。", "正式登記前在韓國法院系統再次核驗。"], faqs: [["查詢結果可直接作為姓名登記依據嗎？", "不建議。頁面資料來自法院公開查詢，但政策和字形支援可能更新，提交姓名登記前應以法院官方系統為準。"], ["為何顯示數量少於法院全部代碼？", "部分擴展字使用法院專用字形編碼，普通瀏覽器無法可靠顯示，因此本頁只列出標準 Unicode 可顯示字形。"], ["同一漢字可依不同讀音用於姓名嗎？", "有些可以。頁面會列出法院公開查詢回傳的指定讀音，實際使用應符合當期登記規則。"]] },
      en: { title: "Korean Name Hanja - Personal Name Character Search | JianFan.app", description: "Search Korean personal-name Hanja by Hangul reading, character or gloss. Check court readings, copy Unicode forms, and verify choices before registration.", eyebrow: "PERSONAL-NAME HANJA · KOREAN NAMES · COURT DATA", heading: "Korean Personal-Name Hanja Search", lede: "Search the Korean court's public personal-name Hanja by Hangul reading, character or gloss and check the designated readings returned for each form.", toolTitle: "Look up a Korean name reading or Hanja", queryLabel: "Hangul reading, Hanja or Korean gloss", placeholder: "For example: 민, 珉, 옥돌", search: "Search name Hanja", clear: "Clear", resultsTitle: "Personal-name Hanja results", resultEmpty: "Enter one Hangul reading or Hanja to see matching personal-name characters.", copy: "Copy Hanja", dictionary: "Open Korean Hanja dictionary", source: "Data comes from the Korean court's public Electronic Family Relations Registration System lookup. This page directly displays standard browser-compatible Unicode glyphs; court-specific extension forms must be checked on the official service.", featureTitle: "Find Korean personal-name Hanja from a name reading", featureIntro: "Not every Hanja and reading is accepted for Korean name registration. This page addresses searches for 이름 한자 and 인명용 한자 with the public court list.", cards: [["Search by Hangul reading", "Enter one Korean syllable such as 민, 서 or 지 to compare all personal-name Hanja returned by the court lookup."], ["Check designated readings", "A Hanja may have more than one permitted reading, so results preserve the readings and descriptions in the public response."], ["Separate standard and court glyphs", "Standard Unicode forms display directly; extension characters that require the court's own font are never replaced with the wrong glyph."]], howTitle: "How to search Korean name Hanja", steps: ["Enter one Hangul reading, one Hanja or a Korean gloss.", "Compare the glyph, designated readings and descriptions.", "Confirm the final choice again on the Korean court service before registration."], faqs: [["Can I rely on this result for official name registration?", "Do not rely on it alone. The data comes from the public court lookup, but policies and glyph support can change; confirm on the official system before filing."], ["Why are fewer glyphs displayed than all court codes?", "Some extension forms use court-specific glyph encoding that ordinary browsers cannot render reliably, so this page lists standard Unicode forms only."], ["Can one Hanja be used with different name readings?", "Some can. The page lists designated readings returned by the court lookup, subject to the current registration rules."]] },
      ja: { title: "韓国の人名用漢字検索 - 名前の漢字を確認 | JianFan.app", description: "韓国の人名用漢字を、ハングル読み、漢字、韓国語の訓から無料検索できます。韓国裁判所の公開データを基に、使用できる指定読みと説明を確認し、標準Unicode字形をコピー、または韓国漢字辞典を開けます。裁判所専用字形が必要な拡張字は別扱いにし、命名や正式な届出の前には韓国裁判所の最新規定で再確認するよう案内します。", eyebrow: "人名用漢字 · 韓国の名前 · 裁判所公開データ", heading: "韓国の人名用漢字・名前漢字検索", lede: "ハングルの読み、漢字、韓国語の訓から、韓国裁判所が公開する人名用漢字と指定読みを確認できます。", toolTitle: "名前の読み・人名用漢字を検索", queryLabel: "ハングル読み・漢字・韓国語の訓", placeholder: "例：민、珉、옥돌", search: "人名用漢字を検索", clear: "クリア", resultsTitle: "人名用漢字の結果", resultEmpty: "ハングル読みまたは漢字を入力すると候補が表示されます。", copy: "漢字をコピー", dictionary: "韓国漢字辞典を開く", source: "韓国裁判所の電子家族関係登録システムが公開する検索データを使用します。標準ブラウザーで表示できる Unicode 字形だけを直接掲載し、裁判所専用の拡張字形は公式サービスで確認してください。", featureTitle: "名前のハングル読みから韓国の人名用漢字を探す", featureIntro: "韓国の名前には任意の漢字と読みを使えるわけではなく、登録リストと指定読みを満たす必要があります。이름 한자、인명용 한자 の検索向けです。", cards: [["ハングル読みで絞り込み", "민、서、지 など1音を入力し、裁判所の公開検索が返す人名用漢字を比較できます。"], ["指定読みと説明を表示", "一つの漢字に複数の許可読みがある場合も、公開レスポンスの読みと説明を保持します。"], ["標準字形と専用字形を区別", "Unicode字形は直接表示し、裁判所専用フォントが必要な拡張字を誤った文字で代用しません。"]], howTitle: "韓国の名前漢字を検索する方法", steps: ["ハングル読み、漢字、韓国語の訓を入力します。", "字形、指定読み、説明を比較します。", "正式な届出前に韓国裁判所で再確認します。"], faqs: [["この結果だけで名前を届け出られますか？", "推奨しません。裁判所の公開検索に基づきますが、規則や字形対応は更新されるため、届出前に公式システムで確認してください。"], ["裁判所の全コードより表示字数が少ないのはなぜですか？", "一部の拡張字は裁判所専用の字形符号を使い、通常のブラウザーで正確に表示できないため、標準Unicode字形だけを掲載します。"], ["一つの漢字を複数の読みで名前に使えますか？", "使える場合があります。公開検索が返す指定読みを表示しますが、実際の使用は現在の登録規則に従います。"]] },
      ko: { title: "인명용 한자 - 이름 한자 찾기 | JianFan.app", description: "인명용 한자와 이름 한자 찾기입니다. 한글 음, 한자나 뜻을 입력해 법원 공개 조회의 인명용 한자를 찾고 허용된 음과 설명을 확인합니다. 유니코드 글자는 복사하거나 한자사전에서 볼 수 있고 전용 확장 글자도 구분합니다. 실제 작명과 신고 전에는 법원 최신 기준을 다시 확인해야 합니다.", eyebrow: "인명용 한자 · 이름 한자 · 법원 공개 조회", heading: "인명용 한자·이름 한자 찾기", lede: "한글 이름 음, 한자 또는 뜻으로 대법원 공개 인명용 한자를 찾고 해당 글자에 지정된 이름 읽기를 확인하세요.", toolTitle: "이름 음 또는 인명용 한자 검색", queryLabel: "한글 음·한자·뜻풀이", placeholder: "예: 민, 珉, 옥돌", search: "인명용 한자 검색", clear: "지우기", resultsTitle: "인명용 한자 결과", resultEmpty: "한글 음이나 한자를 입력하면 해당하는 인명용 한자가 표시됩니다.", copy: "한자 복사", dictionary: "한자사전에서 보기", source: "대한민국 법원 전자가족관계등록시스템의 공개 조회 데이터를 사용합니다. 일반 브라우저에서 표시 가능한 표준 유니코드 글자만 직접 보여 주며 법원 전용 확장 글자는 공식 서비스에서 확인해야 합니다.", featureTitle: "이름 음으로 인명용 한자 찾기", featureIntro: "모든 한자와 음을 이름에 자유롭게 쓸 수 있는 것은 아닙니다. 이름 한자와 인명용 한자 검색에 맞춰 법원 공개 목록과 지정 음을 확인합니다.", cards: [["한글 이름 음으로 검색", "민, 서, 지처럼 한 음을 입력해 법원 공개 조회에 포함된 인명용 한자를 한 번에 비교합니다."], ["지정 음과 뜻 확인", "한 글자에 여러 이름 음이 허용된 경우 공개 조회의 음과 설명을 그대로 보여 줍니다."], ["표준·법원 전용 글자 구분", "유니코드 글자는 바로 표시하고 법원 전용 글꼴이 필요한 확장 글자를 잘못된 문자로 대신하지 않습니다."]], howTitle: "이름 한자를 찾는 방법", steps: ["한글 이름 음, 한자 한 글자 또는 뜻을 입력합니다.", "결과에서 글자 모양, 지정 음과 설명을 비교합니다.", "신고하기 전에 대한민국 법원에서 최종 확인합니다."], faqs: [["검색 결과만 보고 이름을 신고해도 되나요?", "권장하지 않습니다. 법원 공개 조회를 바탕으로 하지만 기준과 글자 지원은 바뀔 수 있으므로 신고 전 공식 시스템에서 확인해야 합니다."], ["법원 전체 코드보다 표시되는 글자가 적은 이유는 무엇인가요?", "일부 확장 글자는 법원 전용 글꼴과 코드를 사용해 일반 브라우저에서 정확히 표시할 수 없으므로 표준 유니코드 글자만 보여 줍니다."], ["한 한자를 여러 음으로 이름에 쓸 수 있나요?", "허용되는 글자가 있습니다. 법원 공개 조회가 반환한 지정 음을 표시하며 실제 사용은 현재 신고 기준을 따라야 합니다."]] }
    }
  }
};

const marketEnhancements = {
  "hangul-hanja-converter:ko": {
    exampleTitle: "실제 문맥으로 확인하는 한글·한자 변환",
    exampleIntro: "한글 음이 같아도 뜻에 따라 한자가 달라집니다. 단어 전체를 먼저 찾은 뒤, 여러 후보가 나오면 문맥에 맞는 표기를 직접 고르세요.",
    exampleInputLabel: "입력",
    exampleResultLabel: "변환·후보",
    exampleAction: "이 예시로 변환",
    examples: [
      { input: "대한민국", result: "大韓民國", note: "등록된 낱말을 음절별로 나누지 않고 한 번에 찾습니다.", direction: "hangul-to-hanja" },
      { input: "수도", result: "首都 · 水道 · 修道 등", note: "같은 음의 한자가 여러 개이므로 문장의 뜻에 맞춰 후보를 선택합니다.", direction: "hangul-to-hanja" },
      { input: "大韓民國의 歷史", result: "대한민국의 역사", note: "한자가 섞인 문장에서도 조사와 한글은 그대로 두고 한자어의 독음을 바꿉니다.", direction: "hanja-to-hangul" }
    ],
    pathTitle: "입력할 수 있는 단서에 맞춰 다음 도구 선택",
    paths: [
      { prompt: "글자 모양만 알고 읽기를 모를 때", label: "한자 필기인식으로 써서 찾기", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "한자음·훈·부수·획수를 함께 볼 때", label: "온라인 옥편에서 한자 찾기", slug: "korean-hanja-dictionary" },
      { prompt: "이름에 쓸 수 있는 한자인지 확인할 때", label: "인명용 한자 조회하기", slug: "korean-name-hanja" }
    ]
  },
  "hangul-hanja-converter:ja": {
    exampleTitle: "韓国語の実例で分かるハングル・漢字変換",
    exampleIntro: "同じハングル表記でも意味によって漢字が変わります。まず単語単位で照合し、複数の候補がある語だけ文脈に合わせて選択します。",
    exampleInputLabel: "入力",
    exampleResultLabel: "変換・候補",
    exampleAction: "この例を試す",
    examples: [
      { input: "대한민국", result: "大韓民國", note: "登録済みの語を音節ごとに分けず、まとまりのまま照合します。", direction: "hangul-to-hanja" },
      { input: "수도", result: "首都・水道・修道 など", note: "同音語は自動で決めつけず、文章の意味に合う韓国漢字を候補から選べます。", direction: "hangul-to-hanja" },
      { input: "大韓民國의 歷史", result: "대한민국의 역사", note: "漢字とハングルが混在する文章でも、助詞を残して漢字語の読みを確認できます。", direction: "hanja-to-hangul" }
    ],
    pathTitle: "分かっている手掛かりから韓国漢字を調べる",
    paths: [
      { prompt: "字形は見えるが読み方も入力方法も分からない", label: "韓国漢字を手書きで検索", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "ハングル読み・部首・画数から候補を絞りたい", label: "韓国漢字辞典で検索", slug: "korean-hanja-dictionary" },
      { prompt: "韓国の名前に使える漢字と指定読みを確認したい", label: "人名用漢字を検索", slug: "korean-name-hanja" }
    ]
  },
  "korean-hanja-handwriting-recognition:ja": {
    exampleTitle: "字形からハングル読みにつなげる検索例",
    exampleIntro: "日本語IMEで読みを推測しにくい字でも、見たまま書いて候補を選ぶと、韓国語の漢字音と人名用の状態を続けて確認できます。",
    exampleInputLabel: "手書きする字",
    exampleResultLabel: "韓国語読み",
    examples: [
      { input: "尹", result: "윤", note: "韓国の姓で見かける字を、読みが分からない状態から検索できます。" },
      { input: "珉", result: "민", note: "候補を選ぶと画数とUnicodeに加え、韓国の人名用漢字かどうかも確認できます。" },
      { input: "曺", result: "조", note: "日本の標準的な字形と異なる韓国の姓の字も、収録データにあれば候補として探せます。" }
    ],
    pathTitle: "手書き検索の結果を次の確認へつなげる",
    paths: [
      { prompt: "選んだ字の韓国語の訓・部首・画数を詳しく見る", label: "韓国漢字辞典を開く", slug: "korean-hanja-dictionary" },
      { prompt: "漢字を含む語句や文章をハングル読みに変える", label: "ハングル・漢字変換を使う", slug: "hangul-hanja-converter" },
      { prompt: "選んだ字を韓国の名前に使えるか確認する", label: "人名用漢字を検索", slug: "korean-name-hanja" }
    ]
  },
  "korean-name-hanja:ja": {
    quickSearchLabel: "よく調べられる名前の読み",
    quickSearches: ["민", "서", "지", "윤"],
    exampleTitle: "同じハングル読みから複数の名前漢字を比較",
    exampleIntro: "韓国の名前は同じ読みでも選べる漢字が複数あります。読みを一つ入力し、字形と韓国語の訓、裁判所公開データの指定読みを比較してください。",
    exampleInputLabel: "ハングル読み",
    exampleResultLabel: "人名用漢字の例",
    examples: [
      { input: "민", result: "珉・旻・敏", note: "옥돌、하늘、민첩할 など、韓国語の説明を見比べられます。" },
      { input: "서", result: "瑞・書・緖", note: "同じ読みでも字義と字形が異なるため、候補を一覧で比較できます。" },
      { input: "지", result: "智・志・知", note: "指定読みが確認できる標準Unicode字形をコピーして使えます。" }
    ],
    pathTitle: "名前漢字を調べる前後に使える韓国漢字ツール",
    paths: [
      { prompt: "漢字の形は分かるがハングル読みを入力できない", label: "韓国漢字を手書きで検索", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "候補の部首・画数や一般の韓国語読みも確認する", label: "韓国漢字辞典で詳しく見る", slug: "korean-hanja-dictionary" },
      { prompt: "韓国人名や漢字語を文章の中で読みたい", label: "ハングル・漢字変換を使う", slug: "hangul-hanja-converter" }
    ]
  }
};

Object.assign(marketEnhancements, {
  "hangul-hanja-converter:zh-CN": {
    exampleTitle: "用实际韩语词语理解韩文汉字转换",
    exampleIntro: "相同韩文读音可能对应不同韩国汉字。工具会先匹配完整词语；遇到同音词时保留候选，由你根据姓名、新闻或历史资料的上下文确认。",
    exampleInputLabel: "输入",
    exampleResultLabel: "转换或候选",
    exampleAction: "转换这个示例",
    examples: [
      { input: "대한민국", result: "大韓民國", note: "已收录的完整词语会优先于逐个韩文音节进行匹配。", direction: "hangul-to-hanja" },
      { input: "수도", result: "首都 · 水道 · 修道等", note: "同一个韩文词可能有多组汉字写法，需要结合句意选择。", direction: "hangul-to-hanja" },
      { input: "大韓民國의 歷史", result: "대한민국의 역사", note: "汉字与韩文混排时，保留韩文助词并转换已识别的韩国汉字词。", direction: "hanja-to-hangul" }
    ],
    pathTitle: "根据已经掌握的线索选择韩国汉字工具",
    paths: [
      { prompt: "只看得到字形，不知道韩文读音也无法输入", label: "手写查找韩国汉字", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "需要查看韩文读音、韩语释义、部首和画数", label: "打开韩国汉字字典", slug: "korean-hanja-dictionary" },
      { prompt: "需要核验汉字能否用于韩国姓名及指定读音", label: "查询韩国人名用汉字", slug: "korean-name-hanja" }
    ]
  },
  "hangul-hanja-converter:zh-TW": {
    exampleTitle: "用實際韓語詞語理解韓文漢字轉換",
    exampleIntro: "相同韓文讀音可能對應不同韓國漢字。工具會先配對完整詞語；遇到同音詞時保留候選，讓你依姓名、新聞或歷史資料的上下文確認。",
    exampleInputLabel: "輸入",
    exampleResultLabel: "轉換或候選",
    exampleAction: "轉換這個範例",
    examples: [
      { input: "대한민국", result: "大韓民國", note: "已收錄的完整詞語會優先於逐個韓文音節進行配對。", direction: "hangul-to-hanja" },
      { input: "수도", result: "首都 · 水道 · 修道等", note: "同一個韓文詞可能有多組漢字寫法，需要依句意選擇。", direction: "hangul-to-hanja" },
      { input: "大韓民國의 歷史", result: "대한민국의 역사", note: "漢字與韓文混排時，保留韓文助詞並轉換已辨識的韓國漢字詞。", direction: "hanja-to-hangul" }
    ],
    pathTitle: "依已知線索選擇韓國漢字工具",
    paths: [
      { prompt: "只看得到字形，不知道韓文讀音也無法輸入", label: "手寫查找韓國漢字", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "需要查看韓文讀音、韓語釋義、部首與畫數", label: "開啟韓國漢字字典", slug: "korean-hanja-dictionary" },
      { prompt: "需要核驗漢字能否用於韓國姓名及指定讀音", label: "查詢韓國人名用漢字", slug: "korean-name-hanja" }
    ]
  },
  "hangul-hanja-converter:en": {
    exampleTitle: "Try common Hangul-to-Hanja and Hanja-to-Hangul cases",
    exampleIntro: "A Hangul spelling can represent several Hanja words. The converter matches known terms first and leaves homophones for you to resolve from the sentence, name, or document context.",
    exampleInputLabel: "Input",
    exampleResultLabel: "Conversion or choices",
    exampleAction: "Try this example",
    examples: [
      { input: "대한민국", result: "大韓民國", note: "A known Korean term is matched as a phrase instead of being split into syllables.", direction: "hangul-to-hanja" },
      { input: "수도", result: "首都 · 水道 · 修道 and more", note: "One Hangul word may have several Hanja spellings, so the intended meaning must be selected.", direction: "hangul-to-hanja" },
      { input: "大韓民國의 歷史", result: "대한민국의 역사", note: "In mixed-script Korean, Hangul particles stay in place while recognized Hanja terms receive Korean readings.", direction: "hanja-to-hangul" }
    ],
    pathTitle: "Choose a Korean Hanja tool from the clue you have",
    paths: [
      { prompt: "You can see the character but cannot type or pronounce it", label: "Draw and find Korean Hanja", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "You know a reading, radical, stroke count, or Korean meaning", label: "Search the Korean Hanja dictionary", slug: "korean-hanja-dictionary" },
      { prompt: "You need to check whether a character and reading are allowed in a Korean name", label: "Search personal-name Hanja", slug: "korean-name-hanja" }
    ]
  },
  "korean-hanja-handwriting-recognition:zh-CN": {
    exampleTitle: "从字形找到韩国汉字的韩文读音",
    exampleIntro: "这类手写查字不是查询中文拼音，而是从看得见但无法输入的字形开始，先找候选字，再查看韩国汉字音、画数和人名用状态。",
    exampleInputLabel: "手写字形",
    exampleResultLabel: "韩文读音",
    examples: [
      { input: "尹", result: "윤", note: "遇到韩国姓氏中的汉字时，可以在不知道读音的情况下先按字形查找。" },
      { input: "珉", result: "민", note: "选中候选后可继续确认画数、Unicode以及是否属于韩国人名用汉字。" },
      { input: "曺", result: "조", note: "韩国姓名中使用的特殊字形，只要资料已收录，也可以按笔迹寻找候选。" }
    ],
    pathTitle: "从手写候选继续核对韩国汉字资料",
    paths: [
      { prompt: "查看候选字的韩文训释、部首与总画数", label: "前往韩国汉字字典", slug: "korean-hanja-dictionary" },
      { prompt: "把包含韩国汉字的词语或段落转换为韩文读音", label: "使用韩文汉字转换", slug: "hangul-hanja-converter" },
      { prompt: "核验候选字能否用于韩国姓名", label: "查询韩国人名用汉字", slug: "korean-name-hanja" }
    ]
  },
  "korean-hanja-handwriting-recognition:zh-TW": {
    exampleTitle: "從字形找到韓國漢字的韓文讀音",
    exampleIntro: "這類手寫查字不是查中文注音或拼音，而是從看得見卻無法輸入的字形開始，先找候選字，再查看韓國漢字音、畫數與人名用狀態。",
    exampleInputLabel: "手寫字形",
    exampleResultLabel: "韓文讀音",
    examples: [
      { input: "尹", result: "윤", note: "遇到韓國姓氏中的漢字時，可在不知道讀音的情況下先依字形查找。" },
      { input: "珉", result: "민", note: "選取候選後可接著確認畫數、Unicode，以及是否屬於韓國人名用漢字。" },
      { input: "曺", result: "조", note: "韓國姓名使用的特殊字形，只要資料已收錄，也能依筆跡尋找候選。" }
    ],
    pathTitle: "從手寫候選繼續核對韓國漢字資料",
    paths: [
      { prompt: "查看候選字的韓文訓釋、部首與總畫數", label: "前往韓國漢字字典", slug: "korean-hanja-dictionary" },
      { prompt: "把包含韓國漢字的詞語或段落轉成韓文讀音", label: "使用韓文漢字轉換", slug: "hangul-hanja-converter" },
      { prompt: "核驗候選字能否用於韓國姓名", label: "查詢韓國人名用漢字", slug: "korean-name-hanja" }
    ]
  },
  "korean-hanja-handwriting-recognition:en": {
    exampleTitle: "Identify Korean Hanja by shape, then check the Hangul reading",
    exampleIntro: "This lookup starts from a character you can see but cannot type or pronounce. Draw it, choose a match, and continue to its Korean reading, stroke count, and name-use status.",
    exampleInputLabel: "Character shape",
    exampleResultLabel: "Korean reading",
    examples: [
      { input: "尹", result: "윤", note: "Find a Hanja used as a Korean surname even when its reading is unknown." },
      { input: "珉", result: "민", note: "After selecting a match, check its strokes, Unicode form, and Korean personal-name status." },
      { input: "曺", result: "조", note: "Distinctive forms found in Korean names can also be matched when they are covered by the character data." }
    ],
    pathTitle: "Continue from a handwriting match to the right reference",
    paths: [
      { prompt: "Inspect Korean readings, glosses, radical, and total strokes", label: "Open the Korean Hanja dictionary", slug: "korean-hanja-dictionary" },
      { prompt: "Read a Korean phrase or passage containing Hanja", label: "Use the Hangul Hanja converter", slug: "hangul-hanja-converter" },
      { prompt: "Check whether the character is approved for Korean personal names", label: "Search personal-name Hanja", slug: "korean-name-hanja" }
    ]
  },
  "korean-hanja-handwriting-recognition:ko": {
    exampleTitle: "한국 성씨·이름 한자를 모양으로 찾는 예",
    exampleIntro: "한자음과 뜻을 몰라도 보이는 모양을 직접 쓰면 후보를 찾을 수 있습니다. 후보를 고른 뒤 한자음, 획수, 인명용 여부를 이어서 확인하세요.",
    exampleInputLabel: "써 볼 한자",
    exampleResultLabel: "한자음",
    examples: [
      { input: "尹", result: "윤", note: "성씨 한자의 음을 모를 때 글자 모양을 그대로 써서 찾을 수 있습니다." },
      { input: "珉", result: "민", note: "후보를 선택하면 획수와 유니코드, 인명용 한자 여부를 함께 확인합니다." },
      { input: "曺", result: "조", note: "한국 성씨에 쓰이는 이체자도 수록 자료에 있으면 필기 후보로 찾을 수 있습니다." }
    ],
    pathTitle: "필기 후보를 찾은 뒤 필요한 정보 확인",
    paths: [
      { prompt: "한자음·훈·부수·총획수를 자세히 볼 때", label: "온라인 옥편에서 확인", slug: "korean-hanja-dictionary" },
      { prompt: "한자가 섞인 낱말이나 문장을 한글 독음으로 바꿀 때", label: "한자 변환기 사용", slug: "hangul-hanja-converter" },
      { prompt: "찾은 글자를 이름에 쓸 수 있는지 확인할 때", label: "인명용 한자 조회", slug: "korean-name-hanja" }
    ]
  },
  "korean-name-hanja:zh-CN": {
    quickSearchLabel: "常见姓名读音",
    quickSearches: ["민", "서", "지", "윤"],
    exampleTitle: "比较同一韩文读音对应的多个人名用汉字",
    exampleIntro: "韩国姓名仅凭韩文读音无法推断实际汉字。同一个音可能对应多个人名用字，应比较字形、韩语训释和韩国法院公开的指定读音。",
    exampleInputLabel: "韩文读音",
    exampleResultLabel: "人名用汉字示例",
    examples: [
      { input: "민", result: "珉 · 旻 · 敏", note: "可对比玉石、天空、敏捷等不同韩语训释与字形。" },
      { input: "서", result: "瑞 · 書 · 緖", note: "相同读音下存在不同字义，查询结果会分别列出可用字。" },
      { input: "지", result: "智 · 志 · 知", note: "标准Unicode字形可以直接复制，正式登记前仍需到法院系统核验。" }
    ],
    pathTitle: "查询韩国姓名汉字前后可使用的工具",
    paths: [
      { prompt: "只知道汉字字形，不知道对应韩文读音", label: "手写查找韩国汉字", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "需要查看候选字的一般韩文读音、部首和画数", label: "打开韩国汉字字典", slug: "korean-hanja-dictionary" },
      { prompt: "需要阅读包含韩国姓名或汉字词的文章", label: "使用韩文汉字转换", slug: "hangul-hanja-converter" }
    ]
  },
  "korean-name-hanja:zh-TW": {
    quickSearchLabel: "常見姓名讀音",
    quickSearches: ["민", "서", "지", "윤"],
    exampleTitle: "比較同一韓文讀音對應的多個人名用漢字",
    exampleIntro: "韓國姓名只憑韓文讀音無法推斷實際漢字。同一個音可能對應多個人名用字，應比較字形、韓語訓釋與韓國法院公開的指定讀音。",
    exampleInputLabel: "韓文讀音",
    exampleResultLabel: "人名用漢字範例",
    examples: [
      { input: "민", result: "珉 · 旻 · 敏", note: "可比較玉石、天空、敏捷等不同韓語訓釋與字形。" },
      { input: "서", result: "瑞 · 書 · 緖", note: "相同讀音下有不同字義，查詢結果會分別列出可用字。" },
      { input: "지", result: "智 · 志 · 知", note: "標準Unicode字形可直接複製，正式登記前仍需至法院系統核驗。" }
    ],
    pathTitle: "查詢韓國姓名漢字前後可使用的工具",
    paths: [
      { prompt: "只知道漢字字形，不知道對應韓文讀音", label: "手寫查找韓國漢字", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "需要查看候選字的一般韓文讀音、部首與畫數", label: "開啟韓國漢字字典", slug: "korean-hanja-dictionary" },
      { prompt: "需要閱讀包含韓國姓名或漢字詞的文章", label: "使用韓文漢字轉換", slug: "hangul-hanja-converter" }
    ]
  },
  "korean-name-hanja:en": {
    quickSearchLabel: "Common name readings",
    quickSearches: ["민", "서", "지", "윤"],
    exampleTitle: "Compare Korean name Hanja that share a Hangul reading",
    exampleIntro: "Hangul alone does not reveal the actual Hanja in a Korean name. One reading can map to many approved characters, so compare each glyph, Korean gloss, and designated court reading.",
    exampleInputLabel: "Hangul reading",
    exampleResultLabel: "Name Hanja examples",
    examples: [
      { input: "민", result: "珉 · 旻 · 敏", note: "Compare characters associated with jade, sky, or quickness in the Korean glosses." },
      { input: "서", result: "瑞 · 書 · 緖", note: "The same reading can carry different meanings, so the tool lists each eligible character separately." },
      { input: "지", result: "智 · 志 · 知", note: "Copy browser-compatible Unicode forms and verify the final choice on the Korean court service." }
    ],
    pathTitle: "Useful Korean Hanja tools before and after a name search",
    paths: [
      { prompt: "You know the character shape but not its Hangul reading", label: "Draw and find Korean Hanja", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "You need general readings, glosses, radical, and stroke information", label: "Open the Korean Hanja dictionary", slug: "korean-hanja-dictionary" },
      { prompt: "You need to read a Korean name or Hanja word in a passage", label: "Use the Hangul Hanja converter", slug: "hangul-hanja-converter" }
    ]
  },
  "korean-name-hanja:ko": {
    quickSearchLabel: "자주 찾는 이름 음",
    quickSearches: ["민", "서", "지", "윤"],
    exampleTitle: "같은 이름 음에 해당하는 인명용 한자 비교",
    exampleIntro: "한글 이름 음만으로 실제 한자를 정할 수는 없습니다. 같은 음에 여러 인명용 한자가 있으므로 글자 모양, 뜻과 훈, 법원 공개 조회의 지정 음을 비교하세요.",
    exampleInputLabel: "한글 이름 음",
    exampleResultLabel: "인명용 한자 예",
    examples: [
      { input: "민", result: "珉 · 旻 · 敏", note: "옥돌, 하늘, 민첩할처럼 서로 다른 뜻과 글자 모양을 비교합니다." },
      { input: "서", result: "瑞 · 書 · 緖", note: "같은 음이라도 뜻이 다르므로 이름에 맞는 후보를 하나씩 확인합니다." },
      { input: "지", result: "智 · 志 · 知", note: "표준 유니코드 글자는 복사할 수 있으며 신고 전에는 법원에서 다시 확인해야 합니다." }
    ],
    pathTitle: "이름 한자를 찾기 전후에 사용할 도구",
    paths: [
      { prompt: "글자 모양만 알고 한글 음을 모를 때", label: "한자 필기인식으로 찾기", slug: "korean-hanja-handwriting-recognition" },
      { prompt: "일반 한자음·훈·부수·획수를 함께 확인할 때", label: "온라인 옥편에서 보기", slug: "korean-hanja-dictionary" },
      { prompt: "이름이나 한자어가 들어간 문장의 독음을 볼 때", label: "한자 변환기 사용", slug: "hangul-hanja-converter" }
    ]
  }
});

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function localPath(locale, slug = "") {
  return `/${locales[locale].prefix}${slug ? `${slug}/` : ""}`;
}

function buildSchema(locale, slug, page) {
  const canonical = `${origin}${localPath(locale, slug)}`;
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", "@id": `${canonical}#webapp`, name: page.heading, url: canonical, description: page.description, applicationCategory: page.type === "dictionary" || page.type === "names" ? "ReferenceApplication" : "UtilitiesApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", inLanguage: locales[locale].lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localPath(locale)}` }, { "@type": "ListItem", position: 2, name: page.heading, item: canonical }] },
    { "@type": "HowTo", name: page.howTitle, step: page.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text })) },
    { "@type": "FAQPage", mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
  ] };
}

function bodyMessages(messages) {
  return Object.entries(messages).map(([key, value]) => ` data-message-${key.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}="${escapeHtml(value)}"`).join("");
}

function commonRuntimeMessages(runtime) {
  const { remoteRecognizing, remoteNoMatch, remoteError, ...common } = runtime;
  return common;
}

function marketExamples(page) {
  if (!page.examples?.length) return "";
  const items = page.examples.map((example) => {
    const action = example.direction
      ? `<button type="button" data-korean-converter-example="${escapeHtml(example.input)}" data-korean-example-direction="${example.direction}">${page.exampleAction}</button>`
      : "";
    return `<article><div class="korean-market-example-pair"><span><small>${page.exampleInputLabel}</small><strong>${example.input}</strong></span><b aria-hidden="true">→</b><span><small>${page.exampleResultLabel}</small><strong>${example.result}</strong></span></div><p>${example.note}</p>${action}</article>`;
  }).join("");
  return `<section class="korean-market-section" aria-labelledby="koreanMarketExamplesTitle"><div class="section-heading"><h2 id="koreanMarketExamplesTitle">${page.exampleTitle}</h2><p class="seo-intro">${page.exampleIntro}</p></div><div class="korean-market-examples">${items}</div></section>`;
}

function marketPaths(page, locale) {
  if (!page.paths?.length) return "";
  const items = page.paths.map((item) => `<article><p>${item.prompt}</p><a href="${localPath(locale, item.slug)}">${item.label}<span aria-hidden="true">→</span></a></article>`).join("");
  return `<section class="korean-market-paths" aria-labelledby="koreanMarketPathsTitle"><h2 id="koreanMarketPathsTitle">${page.pathTitle}</h2><div>${items}</div></section>`;
}

function dictionaryTool(page) {
  const strokes = Array.from({ length: 40 }, (_, index) => `<option value="${index + 1}">${index + 1}</option>`).join("");
  const messages = { idle: page.resultEmpty, ...commonRuntimeMessages(page.runtime), nameAllowed: page.nameAllowed, nameNotConfirmed: page.nameNotConfirmed };
  return { datasets: bodyMessages(messages), html: `<section class="standalone-tool kanji-dictionary-tool korean-hanja-tool" aria-labelledby="koreanHanjaToolTitle"><div class="standalone-tool-head"><div><p class="section-kicker">LIBHANGUL / UNICODE / KOREAN COURT</p><h2 id="koreanHanjaToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="koreanHanjaStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.resultEmpty}</span></div></div><form class="kanji-dictionary-form" id="koreanHanjaForm"><label class="kanji-dictionary-query" for="koreanHanjaQuery"><span>${page.queryLabel}</span><input id="koreanHanjaQuery" type="search" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(page.placeholder)}" /></label><label><span>${page.radical}</span><select id="koreanHanjaRadical"><option value="">${page.allRadicals}</option></select></label><label><span>${page.strokes}</span><select id="koreanHanjaStrokes"><option value="">${page.allStrokes}</option>${strokes}</select></label><label class="korean-hanja-name-filter"><input id="koreanHanjaNameOnly" type="checkbox" /><span>${page.nameOnly}</span></label><div class="kanji-dictionary-form-actions"><button class="primary-action" type="submit">${page.search}</button><button class="text-button" id="koreanHanjaClear" type="button">${page.clear}</button></div></form><div class="kanji-dictionary-progress" id="koreanHanjaProgress" hidden><span><span id="koreanHanjaProgressBar"></span></span><strong id="koreanHanjaProgressText"></strong></div><div class="kanji-dictionary-workspace"><section class="kanji-dictionary-results-panel" aria-labelledby="koreanHanjaResultsTitle"><div class="panel-topline"><h3 id="koreanHanjaResultsTitle">${page.resultsTitle}</h3><span id="koreanHanjaSummary"></span></div><p class="kanji-dictionary-empty" id="koreanHanjaEmpty">${page.resultEmpty}</p><div class="kanji-dictionary-results" id="koreanHanjaResults"></div></section><aside class="kanji-dictionary-detail-panel" aria-labelledby="koreanHanjaDetailTitle"><div class="panel-topline"><h3 id="koreanHanjaDetailTitle">${page.detailTitle}</h3><span>KOREAN HANJA</span></div><p class="kanji-dictionary-empty" id="koreanHanjaDetailEmpty">${page.detailEmpty}</p><article class="kanji-dictionary-detail" id="koreanHanjaDetail" hidden><strong id="koreanHanjaCharacter">韓</strong><dl><div><dt>${page.labels.readings}</dt><dd id="koreanHanjaReadings"></dd></div><div><dt>${page.labels.radical}</dt><dd id="koreanHanjaRadicalDetail"></dd></div><div><dt>${page.labels.strokes}</dt><dd id="koreanHanjaStrokesDetail"></dd></div><div class="is-wide"><dt>${page.labels.meanings}</dt><dd id="koreanHanjaMeanings"></dd></div><div class="is-wide"><dt>${page.labels.name}</dt><dd id="koreanHanjaNameStatus"></dd></div></dl><nav class="kanji-detail-actions"><a id="koreanHanjaStructureLink" href="/chinese-character-lookup/">${page.structure}</a><a id="koreanHanjaNameLink" href="/korean-name-hanja/">${page.nameLink}</a></nav></article></aside></div><p class="kanji-dictionary-source">${page.source}</p></section>` };
}

function handwritingTool(page) {
  const messages = { loading: page.runtime.loading, ready: page.drawHint, recognizing: page.runtime.recognizing, matched: page.runtime.matched, noMatch: page.runtime.noResults, remoteRecognizing: page.runtime.remoteRecognizing, remoteNoMatch: page.runtime.remoteNoMatch, remoteError: page.runtime.remoteError, error: page.runtime.error, copied: page.runtime.copied, copyFailed: page.runtime.copyFailed, strokeCount: page.strokeCount, candidateLabel: page.runtime.candidateLabel };
  const sampleCharacters = ["人", "大", "木", "中"];
  return { datasets: `${bodyMessages(messages)} data-reading-source="korean"`, html: `<section class="standalone-tool handwriting-tool" aria-labelledby="handwritingToolTitle"><div class="standalone-tool-head"><div><p class="section-kicker">BROWSER HANDWRITING MATCHING</p><h2 id="handwritingToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="handwritingStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${messages.loading}</span></div></div><div class="handwriting-workspace"><section class="handwriting-draw-panel" aria-labelledby="handwritingDrawTitle"><div class="panel-topline"><h3 id="handwritingDrawTitle">${page.drawTitle}</h3><output id="handwritingStrokeCount">${page.strokeCount.replace("{count}", "0")}</output></div><div class="handwriting-board" id="handwritingBoard"><span class="handwriting-grid-line is-vertical"></span><span class="handwriting-grid-line is-horizontal"></span><span class="handwriting-grid-line is-diagonal-one"></span><span class="handwriting-grid-line is-diagonal-two"></span><canvas id="handwritingCanvas" aria-label="${escapeHtml(page.drawTitle)}"></canvas><div class="handwriting-loader" id="handwritingLoader"><span></span></div></div><div class="handwriting-actions"><button id="handwritingUndo" type="button"><span aria-hidden="true">↶</span><span>${page.undo}</span></button><button id="handwritingClear" type="button"><span aria-hidden="true">×</span><span>${page.clear}</span></button></div><div class="handwriting-samples"><span>${page.samples}</span>${sampleCharacters.map((character) => `<button type="button" data-handwriting-sample="${character}">${character}</button>`).join("")}</div><p class="handwriting-hint">${page.drawHint}</p></section><section class="handwriting-match-panel" aria-labelledby="handwritingCandidatesTitle"><div class="panel-topline"><div><h3 id="handwritingCandidatesTitle">${page.candidatesTitle}</h3><p>${page.candidatesHint}</p></div></div><p class="handwriting-candidate-empty" id="handwritingCandidateEmpty">${page.candidatesEmpty}</p><div class="handwriting-candidates" id="handwritingCandidates" role="listbox" aria-label="${escapeHtml(page.candidatesTitle)}"></div><div class="handwriting-remote-action" id="handwritingRemoteAction" hidden><span>${page.remoteHint}</span><button id="handwritingRemoteLookup" type="button">${page.remoteAction}</button></div><article class="handwriting-result" id="handwritingResult" hidden><strong class="handwriting-result-character" id="handwritingResultCharacter">韓</strong><div class="handwriting-result-content"><h3>${page.resultTitle}</h3><dl><div><dt>${page.labels.reading}</dt><dd id="handwritingResultPinyin"></dd></div><div><dt>${page.labels.strokes}</dt><dd id="handwritingResultStrokes"></dd></div><div><dt>${page.labels.unicode}</dt><dd id="handwritingResultUnicode"></dd></div></dl><nav class="handwriting-result-actions"><button id="handwritingCopy" type="button">${page.copy}</button><a class="primary-action" id="handwritingStrokeLink" href="/korean-hanja-dictionary/">${page.dictionary}</a><a id="handwritingPinyinLink" href="/korean-name-hanja/">${page.name}</a><a id="handwritingStructureLink" href="/chinese-character-lookup/">${page.structure}</a></nav></div></article></section></div><p class="handwriting-source-note">${page.source}</p></section>` };
}

function converterTool(page, locale) {
  const { choicesTitle, choicesEmpty, dictionary, ...choiceMessages } = converterLabels[locale];
  const messages = { idle: page.outputPlaceholder, loading: page.runtime.loading, loadingProgress: page.runtime.loadingProgress, loaded: page.runtime.loaded, ready: page.runtime.converted, pending: page.runtime.conversionPending, error: page.runtime.error, copied: page.runtime.copied, copyFailed: page.runtime.copyFailed, ...choiceMessages, ...dictionary.messages };
  const dictionaryHtml = `<details class="korean-converter-dictionary"><summary><span>${dictionary.title}</span><span id="koreanConverterDictionaryCount">${dictionary.count.replace("{enabled}", "0").replace("{total}", "0")}</span></summary><div class="korean-converter-dictionary-body"><p>${dictionary.note}</p><form id="koreanConverterDictionaryForm"><label for="koreanConverterDictionaryHangul"><span>${dictionary.hangulLabel}</span><input id="koreanConverterDictionaryHangul" type="text" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(dictionary.hangulPlaceholder)}" /></label><span class="korean-converter-dictionary-arrow" aria-hidden="true">→</span><label for="koreanConverterDictionaryHanja"><span>${dictionary.hanjaLabel}</span><input id="koreanConverterDictionaryHanja" type="text" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(dictionary.hanjaPlaceholder)}" /></label><button class="primary-action" type="submit">${dictionary.add}</button></form><p id="koreanConverterDictionaryStatus" role="status" aria-live="polite"></p><p id="koreanConverterDictionaryEmpty">${dictionary.empty}</p><ul id="koreanConverterDictionaryList"></ul><div class="korean-converter-dictionary-footer"><button id="koreanConverterDictionaryClear" type="button" hidden>${dictionary.clear}</button></div></div></details>`;
  return { datasets: bodyMessages(messages), html: `<section class="standalone-tool korean-converter-tool" aria-labelledby="koreanConverterToolTitle"><div class="standalone-tool-head"><div><p class="section-kicker">LIBHANGUL DICTIONARY · BROWSER LOCAL</p><h2 id="koreanConverterToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="koreanConverterStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.outputPlaceholder}</span></div></div><div class="korean-converter-controls"><div class="segmented-control" role="radiogroup" aria-label="${page.heading}"><button type="button" class="is-active" data-korean-direction="hangul-to-hanja" role="radio" aria-checked="true">${page.directions[0]}</button><button type="button" data-korean-direction="hanja-to-hangul" role="radio" aria-checked="false">${page.directions[1]}</button></div><label><span>${page.modeLabel}</span><select id="koreanConverterMode"><option value="replace">${page.modes[0]}</option><option value="hangul-hanja">${page.modes[1]}</option><option value="hanja-hangul">${page.modes[2]}</option></select></label></div><div class="korean-converter-editors"><label><span>${page.inputLabel}</span><textarea id="koreanConverterInput" rows="12" placeholder="${escapeHtml(page.inputPlaceholder)}"></textarea></label><label><span>${page.outputLabel}</span><textarea id="koreanConverterOutput" rows="12" readonly placeholder="${escapeHtml(page.outputPlaceholder)}"></textarea></label></div><div class="korean-converter-actions"><button class="primary-action" id="koreanConverterSubmit" type="button">${page.convert}</button><button id="koreanConverterSample" type="button">${page.sample}</button><button id="koreanConverterClear" type="button">${page.clear}</button><button id="koreanConverterCopy" type="button">${page.copy}</button></div>${dictionaryHtml}<div class="kanji-dictionary-progress" id="koreanConverterProgress" hidden><span><span id="koreanConverterProgressBar"></span></span><strong id="koreanConverterProgressText"></strong></div><section class="korean-converter-choices-panel" aria-labelledby="koreanConverterChoicesTitle"><h3 id="koreanConverterChoicesTitle">${choicesTitle}</h3><p id="koreanConverterChoicesEmpty">${choicesEmpty}</p><div id="koreanConverterChoices"></div></section><p class="kanji-dictionary-source">${page.source}</p></section>` };
}

function namesTool(page) {
  const messages = { idle: page.resultEmpty, ...commonRuntimeMessages(page.runtime) };
  const quickSearches = page.quickSearches?.length
    ? `<div class="korean-name-quick-searches"><span>${page.quickSearchLabel}</span>${page.quickSearches.map((query) => `<button type="button" data-korean-name-query="${query}">${query}</button>`).join("")}</div>`
    : "";
  return { datasets: `${bodyMessages(messages)} data-copy-label="${escapeHtml(page.copy)}" data-dictionary-label="${escapeHtml(page.dictionary)}"`, html: `<section class="standalone-tool korean-name-tool" aria-labelledby="koreanNameToolTitle"><div class="standalone-tool-head"><div><p class="section-kicker">KOREAN COURT · PERSONAL-NAME HANJA</p><h2 id="koreanNameToolTitle">${page.toolTitle}</h2></div><div class="status-pill" id="koreanNameStatus" role="status" aria-live="polite"><span class="status-dot"></span><span>${page.resultEmpty}</span></div></div><form class="korean-name-form" id="koreanNameForm"><label for="koreanNameQuery"><span>${page.queryLabel}</span><input id="koreanNameQuery" type="search" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(page.placeholder)}" /></label><div><button class="primary-action" type="submit">${page.search}</button><button id="koreanNameClear" type="button">${page.clear}</button></div></form>${quickSearches}<div class="kanji-dictionary-progress" id="koreanNameProgress" hidden><span><span id="koreanNameProgressBar"></span></span><strong id="koreanNameProgressText"></strong></div><section class="korean-name-results-panel" aria-labelledby="koreanNameResultsTitle"><div class="panel-topline"><h3 id="koreanNameResultsTitle">${page.resultsTitle}</h3><span id="koreanNameSummary"></span></div><p id="koreanNameEmpty">${page.resultEmpty}</p><div class="korean-name-results" id="koreanNameResults"></div></section><p class="kanji-dictionary-source">${page.source} <a href="https://efamily.scourt.go.kr/cs/CsBltnWrtList.do?bltnbordId=0000010" rel="noopener noreferrer">Official Korean court lookup</a></p></section>` };
}

function buildPage(locale, slug, definition) {
  const meta = locales[locale];
  const page = { ...definition.content[locale], ...marketEnhancements[`${slug}:${locale}`], type: definition.type, runtime: meta.runtime };
  const canonical = `${origin}${localPath(locale, slug)}`;
  const alternateLinks = Object.entries(locales).map(([key, item]) => `<link rel="alternate" hreflang="${item.hreflang}" href="${origin}${localPath(key, slug)}" />`).join("");
  const localeOptions = Object.entries(locales).map(([key, item]) => `<option value="${key}"${key === locale ? " selected" : ""}>${item.label}</option>`).join("");
  const tool = definition.type === "dictionary" ? dictionaryTool(page) : definition.type === "handwriting" ? handwritingTool(page) : definition.type === "converter" ? converterTool(page, locale) : namesTool(page);
  const scripts = definition.type === "handwriting" ? `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin /><script defer src="/korean-hanja-data.js"></script><script defer src="/handwriting-recognition.js"></script>` : definition.type === "dictionary" ? `<script defer src="/korean-hanja-data.js"></script><script defer src="/korean-hanja-dictionary.js"></script>` : definition.type === "converter" ? `<script defer src="/korean-hanja-data.js"></script><script defer src="/hangul-hanja-converter.js"></script>` : `<script defer src="/korean-hanja-data.js"></script><script defer src="/korean-name-hanja.js"></script>`;
  const related = relatedLinks[locale].map(([target, label]) => `<a href="${localPath(locale, target)}"${target === slug ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  if (visibleMetadataLength(page.title) > 90) throw new Error(`${slug}/${locale} title exceeds 90 characters`);
  const descriptionLength = [...page.description].length;
  if (descriptionLength < 150 || descriptionLength > 160) {
    throw new Error(`${slug}/${locale} description has ${descriptionLength} characters`);
  }
  return `<!doctype html><html lang="${meta.lang}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#07120f" /><link rel="icon" href="/favicon.svg" type="image/svg+xml" /><link rel="apple-touch-icon" href="/apple-touch-icon.png" /><meta name="description" content="${escapeHtml(page.description)}" /><title>${escapeHtml(page.title)}</title><link rel="canonical" href="${canonical}" />${alternateLinks}<link rel="alternate" hreflang="x-default" href="${origin}${localPath("zh-CN", slug)}" /><script src="/locale-redirect.js"></script><link rel="stylesheet" href="/styles.min.css" />${scripts}<!-- seo-schema:start --><script type="application/ld+json">${JSON.stringify(buildSchema(locale, slug, page))}</script><!-- seo-schema:end --></head><body data-tool-page="${slug}" data-page-slug="${slug}" data-locale="${locale}" data-locale-prefix="${localPath(locale)}" data-locale-paths="${localePaths}" data-empty-value="—"${tool.datasets}><a class="skip-nav" href="#main">${meta.skip}</a><header class="site-header" aria-label="${meta.header}"><a class="brand" href="${localPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">韓</span><span>JianFan.app</span></a><nav class="top-actions" aria-label="${meta.nav}"><a class="nav-link" href="${localPath(locale)}">${meta.home}</a><label class="language-picker"><span>${meta.language}</span><select id="localeSelect" aria-label="${meta.language}">${localeOptions}</select></label></nav></header><main id="main"><section class="tool-hero korean-tool-hero" aria-labelledby="pageTitle"><div><p class="section-kicker">${page.eyebrow}</p><h1 id="pageTitle">${page.heading}</h1><p class="lede">${page.lede}</p></div><div class="korean-hero-signal" aria-hidden="true"><span>HANGUL</span><strong>${definition.type === "converter" ? "한 ⇄ 韓" : "韓"}</strong><b>HANJA</b></div></section>${tool.html}<section class="seo-band standalone-info" aria-labelledby="koreanFeatureTitle"><div class="section-heading"><p class="section-kicker">${page.eyebrow}</p><h2 id="koreanFeatureTitle">${page.featureTitle}</h2><p class="seo-intro">${page.featureIntro}</p></div><div class="seo-grid">${page.cards.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>${marketExamples(page)}${marketPaths(page, locale)}<section class="pinyin-howto" aria-labelledby="koreanHowTitle"><h2 id="koreanHowTitle">${page.howTitle}</h2><ol>${page.steps.map((step) => `<li>${step}</li>`).join("")}</ol></section><section class="pinyin-faq" aria-labelledby="koreanFaqTitle"><h2 id="koreanFaqTitle">FAQ</h2>${page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</section><p class="section-kicker pinyin-related-kicker">${meta.related}</p><nav class="landing-links" aria-label="${meta.relatedAria}">${related}</nav></section></main><footer class="site-footer"><p>${meta.footerText}</p><nav class="footer-links" aria-label="${meta.footer}"><a href="${localPath(locale, "about")}">${meta.about}</a><a href="${localPath(locale, "contact")}">${meta.contact}</a><a href="${localPath(locale, "privacy")}">${meta.privacy}</a></nav></footer></body></html>`;
}

for (const [slug, definition] of Object.entries(pages)) {
  for (const locale of Object.keys(locales)) {
    const directory = path.join(root, locales[locale].prefix, slug);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), `${buildPage(locale, slug, definition)}\n`);
  }
}

console.log("Generated 20 multilingual Korean Hanja tool pages.");
