import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const locales = {
  "zh-CN": { source: "index.html", prefix: "", lang: "zh-CN" },
  "zh-TW": { source: "zh-tw/index.html", prefix: "zh-tw/", lang: "zh-Hant" },
  en: { source: "en/index.html", prefix: "en/", lang: "en" },
  ja: { source: "ja/index.html", prefix: "ja/", lang: "ja" },
  ko: { source: "ko/index.html", prefix: "ko/", lang: "ko" }
};

const pages = {
  "simplified-to-traditional": {
    defaultConfig: "s2t",
    content: {
      "zh-CN": {
        title: "简体转繁体 - 在线简体字转繁体字转换器 | JianFan.app",
        description: "在线将简体中文转换为繁体中文，支持通用繁体、台湾正体、香港繁体与地区用词。文本在浏览器本地处理，转换能力基于 OpenCC。",
        eyebrow: "简体字转繁体字",
        heading: "简体转繁体在线转换",
        lede: "粘贴简体中文即可转换为繁体中文。本页默认选择简体转繁体，也可进一步切换到台湾正体、香港繁体和地区用词模式。",
        seoKicker: "简体转繁体",
        seoTitle: "在线简体字转繁体字转换器",
        seoIntro: "这个页面面向简体转繁体、简体字转繁体字、简体中文转繁体中文等高频需求。输入内容后即可获得繁体结果，适合文章、字幕、社媒文案、产品说明与日常沟通。",
        seoCoreTitle: "默认简体转繁体",
        seoCoreBody: "打开页面即选择通用简体转繁体模式，粘贴内容后可以直接转换和复制。",
        seoRegionTitle: "台湾与香港繁体",
        seoRegionBody: "面向特定地区发布时，可切换为台湾正体或香港繁体，并按需处理地区用词。",
        seoUseCaseTitle: "浏览器本地处理",
        seoUseCaseBody: "文字不需要上传到服务器；品牌名、专有名词和正式文本仍建议在发布前人工校对。"
      },
      "zh-TW": {
        title: "簡體轉繁體 - 線上簡體字轉繁體字轉換器 | JianFan.app",
        description: "線上將簡體中文轉換為繁體中文，支援通用繁體、台灣正體、香港繁體與地區用詞，文字在瀏覽器本機處理。",
        eyebrow: "簡體字轉繁體字",
        heading: "簡體轉繁體線上轉換",
        lede: "貼上簡體中文即可轉換為繁體中文。本頁預設選擇簡體轉繁體，也可切換至台灣正體、香港繁體和地區用詞模式。",
        seoKicker: "簡體轉繁體",
        seoTitle: "線上簡體字轉繁體字轉換器",
        seoIntro: "適合簡體轉繁體、簡體字轉繁體字與中文內容在地化。可用於文章、字幕、社群文案、產品說明與日常溝通。",
        seoCoreTitle: "預設簡體轉繁體",
        seoCoreBody: "開啟頁面即選擇通用簡體轉繁體模式，貼上內容後即可轉換和複製。",
        seoRegionTitle: "台灣與香港繁體",
        seoRegionBody: "面向特定地區發布時，可切換為台灣正體或香港繁體，並按需處理地區用詞。",
        seoUseCaseTitle: "瀏覽器本機處理",
        seoUseCaseBody: "文字不需上傳至伺服器；品牌名、專有名詞和正式文字仍建議人工校對。"
      },
      en: {
        title: "Simplified to Traditional Chinese Converter Online | JianFan.app",
        description: "Convert Simplified Chinese to Traditional Chinese online, including Taiwan and Hong Kong variants. Text is processed locally in your browser.",
        eyebrow: "Simplified to Traditional Chinese",
        heading: "Simplified to Traditional Chinese Converter",
        lede: "Paste Simplified Chinese and convert it instantly. Standard Traditional is selected by default, with Taiwan and Hong Kong options available.",
        seoKicker: "Simplified to Traditional",
        seoTitle: "Online Simplified Chinese to Traditional Chinese converter",
        seoIntro: "Use this page for articles, subtitles, social posts, product copy, documentation, and everyday Chinese text conversion.",
        seoCoreTitle: "Correct direction by default",
        seoCoreBody: "The page opens with Simplified to Traditional Chinese selected, ready for paste-and-convert use.",
        seoRegionTitle: "Taiwan and Hong Kong options",
        seoRegionBody: "Choose a regional character and phrase mode when publishing for a specific audience.",
        seoUseCaseTitle: "Local browser processing",
        seoUseCaseBody: "Text stays in the browser. Review brand names, proper nouns, and formal content before publishing."
      },
      ja: {
        title: "簡体字から繁体字への変換ツール | JianFan.app",
        description: "中国語の簡体字を繁体字へオンライン変換。台湾繁体字、香港繁体字、地域別表現にも対応し、ブラウザー内で処理します。",
        eyebrow: "簡体字から繁体字",
        heading: "簡体字から繁体字へのオンライン変換",
        lede: "中国語の簡体字テキストを貼り付けるだけで繁体字へ変換できます。台湾・香港向けのモードも選択できます。",
        seoKicker: "簡体字 繁体字 変換",
        seoTitle: "中国語の簡体字を繁体字へ変換",
        seoIntro: "記事、字幕、SNS、製品説明、資料などの中国語テキストを簡体字から繁体字へ変換できます。",
        seoCoreTitle: "変換方向を初期選択",
        seoCoreBody: "ページを開くと簡体字から繁体字への変換モードが選択されています。",
        seoRegionTitle: "地域別モード",
        seoRegionBody: "対象読者に合わせて台湾向けまたは香港向けの表記へ切り替えられます。",
        seoUseCaseTitle: "ブラウザー内で処理",
        seoUseCaseBody: "固有名詞、ブランド名、正式文書は変換後も確認してください。"
      },
      ko: {
        title: "중국어 간체를 번체로 변환 | JianFan.app",
        description: "중국어 간체를 번체로 온라인 변환합니다. 대만 번체, 홍콩 번체, 지역 표현 모드를 지원하며 브라우저에서 처리합니다.",
        eyebrow: "간체를 번체로",
        heading: "중국어 간체 번체 변환기",
        lede: "중국어 간체 텍스트를 붙여 넣으면 번체로 바로 변환합니다. 대만과 홍콩용 번체 모드도 선택할 수 있습니다.",
        seoKicker: "간체 번체 변환",
        seoTitle: "온라인 중국어 간체 번체 변환기",
        seoIntro: "글, 자막, 소셜 게시물, 제품 설명, 문서 등 중국어 텍스트를 간체에서 번체로 변환할 수 있습니다.",
        seoCoreTitle: "변환 방향 기본 선택",
        seoCoreBody: "페이지를 열면 간체에서 번체로 변환하는 모드가 선택되어 있습니다.",
        seoRegionTitle: "대만·홍콩 모드",
        seoRegionBody: "대상 독자에 따라 대만 또는 홍콩 번체와 지역 표현을 선택할 수 있습니다.",
        seoUseCaseTitle: "브라우저 로컬 처리",
        seoUseCaseBody: "고유명사, 브랜드명, 공식 문서는 변환 후에도 검토하세요."
      }
    }
  },
  "traditional-to-simplified": {
    defaultConfig: "t2s",
    content: {
      "zh-CN": {
        title: "繁体转简体 - 在线繁体字转简体字转换器 | JianFan.app",
        description: "在线将繁体中文转换为简体中文，支持通用繁体、台湾正体和香港繁体转简体。文本在浏览器本地处理，转换能力基于 OpenCC。",
        eyebrow: "繁体字转简体字",
        heading: "繁体转简体在线转换",
        lede: "粘贴繁体中文即可转换为简体中文。本页默认选择繁体转简体，也可处理台湾正体、香港繁体和地区用词。",
        seoKicker: "繁体转简体",
        seoTitle: "在线繁体字转简体字转换器",
        seoIntro: "这个页面面向繁体转简体、繁体字转简体字、繁体中文转简体中文等高频需求。适合阅读资料、整理字幕、改写文案、处理网页内容与日常沟通。",
        seoCoreTitle: "默认繁体转简体",
        seoCoreBody: "打开页面即选择通用繁体转简体模式，粘贴内容后可直接获得简体结果。",
        seoRegionTitle: "台湾与香港来源",
        seoRegionBody: "来源明确时，可选择台湾正体或香港繁体转简体，并处理部分地区词汇。",
        seoUseCaseTitle: "浏览器本地处理",
        seoUseCaseBody: "文字不需要上传到服务器；正式文件、专有名词和语境相关内容仍建议人工复核。"
      },
      "zh-TW": {
        title: "繁體轉簡體 - 線上繁體字轉簡體字轉換器 | JianFan.app",
        description: "線上將繁體中文轉換為簡體中文，支援台灣正體和香港繁體轉簡體，文字在瀏覽器本機處理。",
        eyebrow: "繁體字轉簡體字",
        heading: "繁體轉簡體線上轉換",
        lede: "貼上繁體中文即可轉換為簡體中文。本頁預設選擇繁體轉簡體，也可處理台灣正體、香港繁體與地區用詞。",
        seoKicker: "繁體轉簡體",
        seoTitle: "線上繁體字轉簡體字轉換器",
        seoIntro: "適合繁體轉簡體、繁體字轉簡體字與繁體中文內容轉換，可用於閱讀資料、字幕、文案和網頁內容。",
        seoCoreTitle: "預設繁體轉簡體",
        seoCoreBody: "開啟頁面即選擇通用繁體轉簡體模式，貼上內容後可直接取得簡體結果。",
        seoRegionTitle: "台灣與香港來源",
        seoRegionBody: "來源明確時，可選擇台灣正體或香港繁體轉簡體，並處理部分地區詞彙。",
        seoUseCaseTitle: "瀏覽器本機處理",
        seoUseCaseBody: "文字不需上傳至伺服器；正式文件、專有名詞和語境相關內容仍建議人工複核。"
      },
      en: {
        title: "Traditional to Simplified Chinese Converter Online | JianFan.app",
        description: "Convert Traditional Chinese to Simplified Chinese online, including Taiwan and Hong Kong source text. Processing stays in your browser.",
        eyebrow: "Traditional to Simplified Chinese",
        heading: "Traditional to Simplified Chinese Converter",
        lede: "Paste Traditional Chinese and convert it instantly. Standard Traditional to Simplified is selected by default, with regional source modes available.",
        seoKicker: "Traditional to Simplified",
        seoTitle: "Online Traditional Chinese to Simplified Chinese converter",
        seoIntro: "Use this page for reading material, subtitles, social posts, product copy, documentation, and everyday Chinese text conversion.",
        seoCoreTitle: "Correct direction by default",
        seoCoreBody: "The page opens with Traditional to Simplified Chinese selected, ready for paste-and-convert use.",
        seoRegionTitle: "Taiwan and Hong Kong sources",
        seoRegionBody: "Select a regional source mode when the original text uses Taiwan or Hong Kong wording.",
        seoUseCaseTitle: "Local browser processing",
        seoUseCaseBody: "Text stays in the browser. Review proper nouns, brands, and formal content before publishing."
      },
      ja: {
        title: "繁体字から簡体字への変換ツール | JianFan.app",
        description: "中国語の繁体字を簡体字へオンライン変換。台湾・香港の繁体字と地域別表現にも対応し、ブラウザー内で処理します。",
        eyebrow: "繁体字から簡体字",
        heading: "繁体字から簡体字へのオンライン変換",
        lede: "中国語の繁体字テキストを貼り付けるだけで簡体字へ変換できます。台湾・香港由来の表現にも対応します。",
        seoKicker: "繁体字 簡体字 変換",
        seoTitle: "中国語の繁体字を簡体字へ変換",
        seoIntro: "資料、字幕、SNS、製品説明、Web コンテンツなどを繁体字から簡体字へ変換できます。",
        seoCoreTitle: "変換方向を初期選択",
        seoCoreBody: "ページを開くと繁体字から簡体字への変換モードが選択されています。",
        seoRegionTitle: "地域別の原文",
        seoRegionBody: "台湾または香港の用語を含む原文向けのモードも選択できます。",
        seoUseCaseTitle: "ブラウザー内で処理",
        seoUseCaseBody: "固有名詞、ブランド名、正式文書は変換後も確認してください。"
      },
      ko: {
        title: "중국어 번체를 간체로 변환 | JianFan.app",
        description: "중국어 번체를 간체로 온라인 변환합니다. 대만·홍콩 번체와 지역 표현을 지원하며 브라우저에서 처리합니다.",
        eyebrow: "번체를 간체로",
        heading: "중국어 번체 간체 변환기",
        lede: "중국어 번체 텍스트를 붙여 넣으면 간체로 바로 변환합니다. 대만과 홍콩 원문용 모드도 선택할 수 있습니다.",
        seoKicker: "번체 간체 변환",
        seoTitle: "온라인 중국어 번체 간체 변환기",
        seoIntro: "자료, 자막, 소셜 게시물, 제품 설명, 웹 콘텐츠 등 중국어 텍스트를 번체에서 간체로 변환할 수 있습니다.",
        seoCoreTitle: "변환 방향 기본 선택",
        seoCoreBody: "페이지를 열면 번체에서 간체로 변환하는 모드가 선택되어 있습니다.",
        seoRegionTitle: "대만·홍콩 원문",
        seoRegionBody: "대만 또는 홍콩 지역 용어가 포함된 원문용 모드도 선택할 수 있습니다.",
        seoUseCaseTitle: "브라우저 로컬 처리",
        seoUseCaseBody: "고유명사, 브랜드명, 공식 문서는 변환 후에도 검토하세요."
      }
    }
  }
};

const directionLinks = [
  '          <a href="/simplified-to-traditional/" data-route="simplified-to-traditional" data-i18n="linkS2T">简体转繁体</a>',
  '          <a href="/traditional-to-simplified/" data-route="traditional-to-simplified" data-i18n="linkT2S">繁体转简体</a>'
].join("\n");

function setText(html, key, value) {
  const pattern = new RegExp(`(<[^>]+data-i18n="${key}"[^>]*>)[\\s\\S]*?(<\\/[^>]+>)`);
  return html.replace(pattern, `$1${value}$2`);
}

function localizedPath(locale, slug) {
  const prefix = locales[locale].prefix;
  return `/${prefix}${slug}/`;
}

function preparePage(source, slug, locale, page) {
  const content = page.content[locale];
  let html = source
    .replace(/<html lang="[^"]+">/, `<html lang="${locales[locale].lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${content.title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta\n      name="description"\n      content="${content.description}"\n    />`
    )
    .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${localizedPath(locale, slug)}" />`);

  const alternateLocales = {
    "zh-CN": "zh-CN",
    "zh-Hant": "zh-TW",
    en: "en",
    ja: "ja",
    ko: "ko",
    "x-default": "zh-CN"
  };

  for (const [hreflang, alternateLocale] of Object.entries(alternateLocales)) {
    html = html.replace(
      new RegExp(`<link rel="alternate" hreflang="${hreflang}" href="[^"]+" \\/>`),
      `<link rel="alternate" hreflang="${hreflang}" href="${localizedPath(alternateLocale, slug)}" />`
    );
  }

  const replacements = {
    eyebrow: content.eyebrow,
    title: content.heading,
    lede: content.lede,
    seoKicker: content.seoKicker,
    seoTitle: content.seoTitle,
    seoIntro: content.seoIntro,
    seoCoreTitle: content.seoCoreTitle,
    seoCoreBody: content.seoCoreBody,
    seoRegionTitle: content.seoRegionTitle,
    seoRegionBody: content.seoRegionBody,
    seoUseCaseTitle: content.seoUseCaseTitle,
    seoUseCaseBody: content.seoUseCaseBody
  };

  for (const [key, value] of Object.entries(replacements)) html = setText(html, key, value);

  if (page.defaultConfig === "t2s") {
    html = html
      .replace(
        'class="mode-card is-active" type="button" data-config="s2t" role="radio" aria-checked="true"',
        'class="mode-card" type="button" data-config="s2t" role="radio" aria-checked="false"'
      )
      .replace(
        'class="mode-card" type="button" data-config="t2s" role="radio" aria-checked="false"',
        'class="mode-card is-active" type="button" data-config="t2s" role="radio" aria-checked="true"'
      )
      .replace('<option value="t2s" data-i18n="modeT2S">', '<option value="t2s" data-i18n="modeT2S" selected>');
  }

  return html;
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(entryPath)));
    if (entry.isFile() && entry.name === "index.html") files.push(entryPath);
  }
  return files;
}

for (const htmlPath of await findHtmlFiles(projectRoot)) {
  const html = await readFile(htmlPath, "utf8");
  if (!html.includes('id="converterTitle"') || html.includes('data-route="simplified-to-traditional"')) continue;
  const updated = html.replace(
    '          <a href="/taiwan-traditional/" data-route="taiwan-traditional" data-i18n="linkTaiwan">',
    `${directionLinks}\n          <a href="/taiwan-traditional/" data-route="taiwan-traditional" data-i18n="linkTaiwan">`
  );
  await writeFile(htmlPath, updated);
}

for (const [slug, page] of Object.entries(pages)) {
  for (const [locale, localeData] of Object.entries(locales)) {
    const source = await readFile(path.join(projectRoot, localeData.source), "utf8");
    const destination = path.join(projectRoot, localeData.prefix, slug, "index.html");
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, preparePage(source, slug, locale, page));
  }
}

