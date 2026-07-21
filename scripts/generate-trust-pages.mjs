import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://jianfan.app";
const email = "admin@jianfan.app";

const locales = {
  "zh-CN": {
    prefix: "", lang: "zh-CN", label: "简体中文", home: "网站首页", skip: "跳到主要内容",
    about: "关于我们", contact: "联系我们", privacy: "隐私声明", language: "页面语言",
    footer: "JianFan.app 提供浏览器本地运行的中文与日文字符转换工具。"
  },
  "zh-TW": {
    prefix: "zh-tw/", lang: "zh-Hant", label: "繁體中文", home: "網站首頁", skip: "跳到主要內容",
    about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明", language: "頁面語言",
    footer: "JianFan.app 提供在瀏覽器本機運行的中文與日文字符轉換工具。"
  },
  en: {
    prefix: "en/", lang: "en", label: "English", home: "Home", skip: "Skip to main content",
    about: "About", contact: "Contact", privacy: "Privacy Statement", language: "Page language",
    footer: "JianFan.app provides browser-local Chinese and Japanese character conversion tools."
  },
  ja: {
    prefix: "ja/", lang: "ja", label: "日本語", home: "ホーム", skip: "メインコンテンツへ移動",
    about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明", language: "ページ言語",
    footer: "JianFan.app はブラウザー内で動作する中国語・日本語文字変換ツールです。"
  },
  ko: {
    prefix: "ko/", lang: "ko", label: "한국어", home: "홈", skip: "주요 내용으로 이동",
    about: "소개", contact: "문의", privacy: "개인정보 보호 안내", language: "페이지 언어",
    footer: "JianFan.app는 브라우저에서 실행되는 중국어·일본어 문자 변환 도구입니다."
  }
};

const pages = {
  about: {
    type: "AboutPage",
    content: {
      "zh-CN": {
        title: "关于 JianFan.app - 简繁与日文汉字转换工具",
        description: "了解 JianFan.app 的工具用途、本地处理方式、OpenCC 技术基础、内容维护原则和联系信息。",
        eyebrow: "关于 JianFan.app", heading: "让文字转换简单、透明、可核验",
        lede: "JianFan.app 是面向普通用户的在线中文简繁与日文汉字转换工具。网站以 jianfan.app 为官方域名，并公开说明功能边界、数据处理方式与联系方式。",
        sections: [
          ["我们提供什么", "网站提供简体中文、繁体中文、台湾与香港地区字词，以及日文新旧字体、日中汉字和日文字符查询工具。所有核心功能无需注册即可使用。"],
          ["浏览器本地处理", "转换和文件文字提取主要在当前浏览器中完成，输入文字、文件内容和转换结果不会发送到 JianFan.app 后端处理。自定义词库也只保存在当前浏览器。"],
          ["技术基础与限制", "中文与日文汉字转换能力基于 OpenCC。自动字形转换不能替代翻译、编辑或专业审校；姓名、地名、法律和正式出版内容仍应结合权威资料人工确认。"],
          ["内容维护", "我们会根据功能变化、用户反馈和数据处理方式更新页面说明、隐私声明与工具提示，并在重要页面保留明确的用途与限制说明。"],
          ["联系 JianFan.app", `如需报告转换问题、提供产品建议或咨询隐私与版权事项，请访问联系我们页面，或发送邮件至 ${email}。`]
        ]
      },
      "zh-TW": {
        title: "關於 JianFan.app - 簡繁與日文漢字轉換工具",
        description: "了解 JianFan.app 的工具用途、本機處理方式、OpenCC 技術基礎、內容維護原則和聯絡資訊。",
        eyebrow: "關於 JianFan.app", heading: "讓文字轉換簡單、透明、可核驗",
        lede: "JianFan.app 是面向一般使用者的線上中文簡繁與日文漢字轉換工具。網站以 jianfan.app 為官方網域，並公開說明功能界線、資料處理方式與聯絡資訊。",
        sections: [
          ["我們提供什麼", "網站提供簡體中文、繁體中文、台灣與香港地區字詞，以及日文新舊字體、日中漢字和日文字元查找工具。所有核心功能不需註冊即可使用。"],
          ["瀏覽器本機處理", "轉換和檔案文字擷取主要在目前瀏覽器中完成，輸入文字、檔案內容和轉換結果不會傳送到 JianFan.app 後端處理。自訂詞庫也只保存在目前瀏覽器。"],
          ["技術基礎與限制", "中文與日文漢字轉換能力基於 OpenCC。自動字形轉換不能取代翻譯、編輯或專業校對；姓名、地名、法律和正式出版內容仍應搭配權威資料人工確認。"],
          ["內容維護", "我們會依功能變化、使用者意見和資料處理方式更新頁面說明、隱私聲明與工具提示，並在重要頁面保留明確的用途與限制說明。"],
          ["聯絡 JianFan.app", `如需回報轉換問題、提供產品建議或詢問隱私與著作權事項，請前往聯絡我們頁面，或寄信至 ${email}。`]
        ]
      },
      en: {
        title: "About JianFan.app - Chinese and Japanese Character Tools",
        description: "Learn what JianFan.app provides, how browser-local processing works, its OpenCC foundation, maintenance principles, and contact details.",
        eyebrow: "About JianFan.app", heading: "Character conversion with clear boundaries",
        lede: "JianFan.app is an online Simplified Chinese, Traditional Chinese, and Japanese kanji utility for everyday users. jianfan.app is the official domain, with public information about scope, data handling, and contact details.",
        sections: [
          ["What we provide", "The site covers Simplified and Traditional Chinese, Taiwan and Hong Kong wording, Japanese Shinjitai and Kyujitai, Japanese-Chinese kanji comparison, and Japanese character lookup. Core tools require no account."],
          ["Browser-local processing", "Conversion and document text extraction run primarily in your current browser. Input text, file content, and results are not sent to a JianFan.app backend for processing. Custom dictionary entries also stay in the browser."],
          ["Technology and limits", "Chinese and Japanese kanji conversion is powered by OpenCC. Automated glyph conversion is not translation or professional editing; names, places, legal text, and publication copy should be checked against authoritative sources."],
          ["Content maintenance", "We update page explanations, privacy information, and tool guidance when functionality or data handling changes and when user feedback identifies a useful correction."],
          ["Contact JianFan.app", `To report a conversion issue, suggest an improvement, or ask about privacy and copyright, visit the Contact page or email ${email}.`]
        ]
      },
      ja: {
        title: "JianFan.app について - 中国語・日本語漢字変換ツール",
        description: "JianFan.app の機能、ブラウザー内処理、OpenCC の技術基盤、運用方針、お問い合わせ先を紹介します。",
        eyebrow: "JianFan.app について", heading: "用途と限界が明確な文字変換ツール",
        lede: "JianFan.app は一般利用者向けの中国語簡体字・繁体字と日本語漢字のオンライン変換ツールです。jianfan.app を公式ドメインとし、機能範囲、データ処理方法、連絡先を公開しています。",
        sections: [
          ["提供する機能", "簡体字・繁体字、台湾・香港の字詞、日本語の新字体・旧字体、日中漢字比較、日本語文字検索を提供しています。主要機能はアカウント登録なしで利用できます。"],
          ["ブラウザー内で処理", "変換と文書からのテキスト抽出は主に現在のブラウザー内で行われます。入力文、ファイル内容、変換結果を JianFan.app のバックエンドへ送信して処理することはありません。カスタム辞書もブラウザー内に保存されます。"],
          ["技術基盤と限界", "中国語と日本語漢字の変換は OpenCC を基にしています。自動字形変換は翻訳や専門校閲ではありません。氏名、地名、法務文書、出版物は信頼できる資料で確認してください。"],
          ["情報の更新", "機能やデータ処理方法の変更、利用者からの指摘に応じて、ページ説明、プライバシー情報、ツール内の注意事項を更新します。"],
          ["お問い合わせ", `変換結果の問題、改善提案、プライバシー・著作権に関するご連絡は、お問い合わせページまたは ${email} までお送りください。`]
        ]
      },
      ko: {
        title: "JianFan.app 소개 - 중국어·일본어 한자 변환 도구",
        description: "JianFan.app의 기능, 브라우저 로컬 처리, OpenCC 기술 기반, 콘텐츠 관리 원칙과 연락처를 확인하세요.",
        eyebrow: "JianFan.app 소개", heading: "용도와 한계가 분명한 문자 변환 도구",
        lede: "JianFan.app는 일반 사용자를 위한 중국어 간체·번체와 일본어 한자 온라인 변환 도구입니다. jianfan.app를 공식 도메인으로 사용하며 기능 범위, 데이터 처리 방식과 연락처를 공개합니다.",
        sections: [
          ["제공 기능", "간체·번체, 대만·홍콩 지역 표현, 일본 신자체·구자체, 일본·중국 한자 비교와 일본어 문자 검색을 제공합니다. 핵심 기능은 가입 없이 사용할 수 있습니다."],
          ["브라우저 로컬 처리", "변환과 문서 텍스트 추출은 주로 현재 브라우저에서 실행됩니다. 입력 텍스트, 파일 내용과 결과를 JianFan.app 백엔드로 보내 처리하지 않습니다. 사용자 사전도 브라우저에만 저장됩니다."],
          ["기술 기반과 한계", "중국어와 일본어 한자 변환은 OpenCC 기반입니다. 자동 글자 변환은 번역이나 전문 교정이 아니므로 이름, 지명, 법률 문서와 출판 원고는 권위 있는 자료로 확인해야 합니다."],
          ["콘텐츠 관리", "기능이나 데이터 처리 방식이 바뀌거나 사용자 피드백으로 수정이 필요할 때 페이지 설명, 개인정보 안내와 도구 도움말을 업데이트합니다."],
          ["JianFan.app 문의", `변환 오류 제보, 개선 제안, 개인정보·저작권 문의는 문의 페이지 또는 ${email}로 보내 주세요.`]
        ]
      }
    }
  },
  contact: {
    type: "ContactPage",
    content: {
      "zh-CN": {
        title: "联系 JianFan.app - 意见反馈与问题报告",
        description: `通过 ${email} 联系 JianFan.app，反馈转换问题、功能建议、隐私、安全、无障碍和版权事项。`,
        eyebrow: "联系我们", heading: "联系 JianFan.app",
        lede: "欢迎反馈转换结果、页面体验和功能建议。请通过下面的官方邮箱联系我们。",
        emailLabel: "联系邮箱", emailNote: "我们会查看与网站功能、隐私、安全、无障碍和版权相关的邮件。",
        sections: [
          ["怎样描述问题", "请附上页面地址、转换方向、浏览器类型和可公开的最小示例，这有助于我们复现问题。"],
          ["请勿发送敏感内容", "不要在邮件中发送身份证件、账户密码、未公开商业文件、医疗或财务资料，以及其他不适合交给第三方邮件服务处理的信息。"],
          ["适合联系的事项", "转换错误与字词建议、页面或无障碍问题、隐私与安全疑问、OpenCC 或其他资源的署名与版权事项。"]
        ]
      },
      "zh-TW": {
        title: "聯絡 JianFan.app - 意見回饋與問題回報",
        description: `透過 ${email} 聯絡 JianFan.app，回報轉換問題、功能建議、隱私、安全、無障礙和著作權事項。`,
        eyebrow: "聯絡我們", heading: "聯絡 JianFan.app",
        lede: "歡迎回報轉換結果、頁面體驗和功能建議。請透過下方官方信箱與我們聯絡。",
        emailLabel: "聯絡信箱", emailNote: "我們會查看與網站功能、隱私、安全、無障礙和著作權相關的郵件。",
        sections: [
          ["如何描述問題", "請附上頁面網址、轉換方向、瀏覽器類型和可公開的最小範例，這有助於我們重現問題。"],
          ["請勿寄送敏感內容", "請勿在郵件中傳送身分證件、帳戶密碼、未公開商業文件、醫療或財務資料，以及其他不適合交由第三方郵件服務處理的資訊。"],
          ["適合聯絡的事項", "轉換錯誤與字詞建議、頁面或無障礙問題、隱私與安全疑問、OpenCC 或其他資源的標示與著作權事項。"]
        ]
      },
      en: {
        title: "Contact JianFan.app - Feedback and Issue Reports",
        description: `Contact JianFan.app at ${email} about conversion issues, feature suggestions, privacy, security, accessibility, or copyright.`,
        eyebrow: "Contact", heading: "Contact JianFan.app",
        lede: "Feedback about conversion results, page usability, and feature ideas is welcome. Use the official email address below.",
        emailLabel: "Email", emailNote: "We review messages related to site functionality, privacy, security, accessibility, and copyright.",
        sections: [
          ["How to report an issue", "Include the page URL, conversion direction, browser type, and the smallest non-sensitive example you can share. This helps us reproduce the problem."],
          ["Do not send sensitive content", "Do not email identity documents, passwords, confidential business files, medical or financial records, or other information unsuitable for third-party email services."],
          ["Good reasons to contact us", "Conversion corrections and wording suggestions, page or accessibility problems, privacy and security questions, and attribution or copyright matters involving OpenCC or other resources."]
        ]
      },
      ja: {
        title: "JianFan.app お問い合わせ - ご意見・不具合報告",
        description: `${email} から JianFan.app へ、変換の問題、機能提案、プライバシー、セキュリティ、アクセシビリティ、著作権について連絡できます。`,
        eyebrow: "お問い合わせ", heading: "JianFan.app へのお問い合わせ",
        lede: "変換結果、ページの使いやすさ、機能の提案をお寄せください。以下の公式メールアドレスからご連絡いただけます。",
        emailLabel: "メールアドレス", emailNote: "機能、プライバシー、セキュリティ、アクセシビリティ、著作権に関するメールを確認します。",
        sections: [
          ["問題を報告する際の情報", "ページ URL、変換方向、ブラウザーの種類、公開可能な最小限の例を添えてください。問題の再現に役立ちます。"],
          ["機密情報を送らないでください", "身分証明書、パスワード、非公開の業務文書、医療・財務情報など、第三者のメールサービスで扱うべきでない情報は送信しないでください。"],
          ["お問い合わせいただける内容", "変換結果や字詞の修正提案、ページ・アクセシビリティの問題、プライバシー・セキュリティ、OpenCC やその他素材の表記・著作権に関する事項。"]
        ]
      },
      ko: {
        title: "JianFan.app 문의 - 의견 및 오류 제보",
        description: `${email}로 JianFan.app에 변환 문제, 기능 제안, 개인정보, 보안, 접근성 및 저작권 관련 내용을 문의하세요.`,
        eyebrow: "문의", heading: "JianFan.app 문의",
        lede: "변환 결과, 페이지 사용성, 기능 제안을 보내 주세요. 아래 공식 이메일 주소로 연락할 수 있습니다.",
        emailLabel: "이메일", emailNote: "사이트 기능, 개인정보, 보안, 접근성과 저작권 관련 메일을 확인합니다.",
        sections: [
          ["문제 제보 방법", "페이지 주소, 변환 방향, 브라우저 종류와 공개 가능한 최소 예시를 포함하면 문제를 재현하는 데 도움이 됩니다."],
          ["민감한 내용은 보내지 마세요", "신분증, 비밀번호, 비공개 업무 문서, 의료·금융 자료 또는 제3자 이메일 서비스에서 처리하기 부적절한 정보는 보내지 마세요."],
          ["문의 가능한 내용", "변환 오류와 단어 제안, 페이지 및 접근성 문제, 개인정보와 보안 질문, OpenCC 또는 기타 리소스의 출처 표시와 저작권 문제."]
        ]
      }
    }
  }
};

function localizedPath(locale, slug = "") {
  const prefix = locales[locale].prefix;
  return `/${prefix}${slug ? `${slug}/` : ""}`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function buildAlternates(slug) {
  return [
    ["zh-CN", "zh-CN"], ["zh-Hant", "zh-TW"], ["en", "en"], ["ja", "ja"], ["ko", "ko"], ["x-default", "zh-CN"]
  ].map(([hreflang, locale]) => `    <link rel="alternate" hreflang="${hreflang}" href="${origin}${localizedPath(locale, slug)}" />`).join("\n");
}

function buildSchema(locale, slug, page, content) {
  const url = `${origin}${localizedPath(locale, slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization", "@id": `${origin}/#organization`, name: "JianFan.app", url: `${origin}/`,
        email, logo: `${origin}/apple-touch-icon.png`, contactPoint: { "@type": "ContactPoint", email, contactType: "customer support", availableLanguage: ["zh-CN", "zh-Hant", "en", "ja", "ko"] }
      },
      {
        "@type": page.type, "@id": `${url}#webpage`, url, name: content.heading, description: content.description,
        inLanguage: locales[locale].lang, isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "JianFan.app", url: `${origin}/` },
        about: { "@id": `${origin}/#organization` }, mainEntity: { "@id": `${origin}/#organization` }
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
          { "@type": "ListItem", position: 1, name: locales[locale].home, item: `${origin}${localizedPath(locale)}` },
          { "@type": "ListItem", position: 2, name: content.heading, item: url }
        ]
      }
    ]
  };
}

function buildLanguageLinks(locale, slug) {
  return Object.entries(locales).map(([id, item]) => (
    `          <a href="${localizedPath(id, slug)}"${id === locale ? ' aria-current="page"' : ""}>${item.label}</a>`
  )).join("\n");
}

function buildFooter(locale, activeSlug) {
  const meta = locales[locale];
  const links = [["about", meta.about], ["contact", meta.contact], ["privacy", meta.privacy]];
  return `    <footer class="site-footer">
      <p>${meta.footer}</p>
      <nav class="footer-links" aria-label="Footer">
${links.map(([slug, label]) => `        <a href="${localizedPath(locale, slug)}"${slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`).join("\n")}
      </nav>
    </footer>`;
}

function buildPage(locale, slug, page, content) {
  const meta = locales[locale];
  const canonical = `${origin}${localizedPath(locale, slug)}`;
  const isContact = slug === "contact";
  const emailBlock = isContact ? `
          <address class="contact-address">
            <span>${content.emailLabel}</span>
            <a href="mailto:${email}">${email}</a>
            <p>${content.emailNote}</p>
          </address>` : "";
  const sections = content.sections.map(([title, body], index) => {
    const linkedBody = index === content.sections.length - 1 && slug === "about"
      ? escapeHtml(body).replace(email, `<a href="mailto:${email}">${email}</a>`)
      : escapeHtml(body);
    return `          <article><h2>${escapeHtml(title)}</h2><p>${linkedBody}</p></article>`;
  }).join("\n");
  const schema = JSON.stringify(buildSchema(locale, slug, page, content), null, 2).split("\n").map((line) => `      ${line}`).join("\n");

  return `<!doctype html>
<html lang="${meta.lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#07120f" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="description" content="${escapeHtml(content.description)}" />
    <title>${escapeHtml(content.title)}</title>
    <link rel="canonical" href="${canonical}" />
${buildAlternates(slug)}
    <script src="/locale-redirect.js"></script>
    <link rel="stylesheet" href="/styles.css" />
    <!-- seo-schema:start -->
    <script type="application/ld+json">
${schema}
    </script>
    <!-- seo-schema:end -->
  </head>
  <body data-info-page="${slug}" data-locale="${locale}">
    <a class="skip-nav" href="#main">${meta.skip}</a>
    <header class="site-header" aria-label="Site header">
      <a class="brand" href="${localizedPath(locale)}" aria-label="JianFan.app"><span class="brand-mark" aria-hidden="true">漢</span><span class="brand-text">JianFan.app</span></a>
      <nav class="top-actions" aria-label="Primary">
        <a class="nav-link" href="${localizedPath(locale)}">${meta.home}</a>
        <div class="language-picker privacy-language-links" aria-label="${meta.language}">
${buildLanguageLinks(locale, slug)}
        </div>
      </nav>
    </header>
    <main id="main">
      <section class="hero-shell trust-hero" aria-labelledby="pageTitle">
        <div class="hero-copy"><p class="eyebrow">${content.eyebrow}</p><h1 id="pageTitle">${content.heading}</h1><p class="lede">${content.lede}</p></div>
      </section>
      <section class="feature-band privacy-band trust-band" aria-label="${content.heading}">
        <div class="privacy-content trust-content">${emailBlock}
${sections}
        </div>
      </section>
    </main>
${buildFooter(locale, slug)}
  </body>
</html>`;
}

for (const [slug, page] of Object.entries(pages)) {
  for (const locale of Object.keys(locales)) {
    const outputDirectory = path.join(projectRoot, locales[locale].prefix, slug);
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(path.join(outputDirectory, "index.html"), `${buildPage(locale, slug, page, page.content[locale])}\n`);
  }
}

console.log("Generated 10 multilingual About and Contact pages.");
