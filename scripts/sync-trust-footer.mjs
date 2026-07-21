import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const privacyMarkerStart = "          <!-- contact-privacy:start -->";
const privacyMarkerEnd = "          <!-- contact-privacy:end -->";

const locales = {
  "zh-CN": {
    prefix: "", about: "关于我们", contact: "联系我们", privacy: "隐私声明",
    privacyHeading: "通过邮件联系我们",
    privacyBody: "如果你主动发送邮件至 admin@jianfan.app，我们会收到你提供的邮箱地址和邮件内容。这些信息会由所使用的邮件服务处理，仅用于阅读、回复和处理相关事项。请勿通过邮件发送敏感文本或文件。",
    thirdPartyHeading: "第三方资源"
  },
  "zh-TW": {
    prefix: "zh-tw/", about: "關於我們", contact: "聯絡我們", privacy: "隱私聲明",
    privacyHeading: "透過郵件聯絡我們",
    privacyBody: "如果你主動寄信至 admin@jianfan.app，我們會收到你提供的電子郵件地址和郵件內容。這些資訊會由所使用的郵件服務處理，只用於閱讀、回覆和處理相關事項。請勿透過郵件傳送敏感文字或檔案。",
    thirdPartyHeading: "第三方資源"
  },
  en: {
    prefix: "en/", about: "About", contact: "Contact", privacy: "Privacy Statement",
    privacyHeading: "Contacting us by email",
    privacyBody: "If you email admin@jianfan.app, we receive the email address and message content you choose to provide. This information is processed by the email service we use and is used only to read, reply to, and handle the relevant request. Do not send sensitive text or files by email.",
    thirdPartyHeading: "Third-Party Resources"
  },
  ja: {
    prefix: "ja/", about: "JianFan.app について", contact: "お問い合わせ", privacy: "プライバシー声明",
    privacyHeading: "メールでのお問い合わせ",
    privacyBody: "admin@jianfan.app へメールを送信した場合、送信者が提供したメールアドレスと本文を受け取ります。これらの情報は利用するメールサービスで処理され、内容の確認、返信、関連事項への対応にのみ使用します。機密性の高い文章やファイルはメールで送信しないでください。",
    thirdPartyHeading: "第三者リソース"
  },
  ko: {
    prefix: "ko/", about: "소개", contact: "문의", privacy: "개인정보 보호 안내",
    privacyHeading: "이메일 문의",
    privacyBody: "admin@jianfan.app로 이메일을 보내면 사용자가 제공한 이메일 주소와 메시지 내용을 받습니다. 해당 정보는 이용 중인 이메일 서비스에서 처리되며 문의 내용을 읽고 답변하고 관련 요청을 처리하는 데만 사용합니다. 민감한 텍스트나 파일은 이메일로 보내지 마세요.",
    thirdPartyHeading: "외부 리소스"
  }
};

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

function getLocale(relativePath) {
  if (relativePath.startsWith("zh-tw/")) return "zh-TW";
  if (relativePath.startsWith("en/")) return "en";
  if (relativePath.startsWith("ja/")) return "ja";
  if (relativePath.startsWith("ko/")) return "ko";
  return "zh-CN";
}

function getSlug(relativePath) {
  const segments = relativePath.split(path.sep);
  if (["zh-tw", "en", "ja", "ko"].includes(segments[0])) segments.shift();
  return segments.length > 1 ? segments[0] : "";
}

function buildFooterNav(locale, activeSlug) {
  const content = locales[locale];
  const links = [["about", content.about], ["contact", content.contact], ["privacy", content.privacy]];
  return `<nav class="footer-links" aria-label="Footer">
${links.map(([slug, label]) => `        <a href="/${content.prefix}${slug}/"${slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`).join("\n")}
      </nav>`;
}

function buildPrivacyArticle(content) {
  return `${privacyMarkerStart}
          <article>
            <h2>${content.privacyHeading}</h2>
            <p>${content.privacyBody}</p>
          </article>
${privacyMarkerEnd}`;
}

let pageCount = 0;
for (const filePath of await findHtmlFiles(projectRoot)) {
  const relativePath = path.relative(projectRoot, filePath);
  const locale = getLocale(relativePath);
  const content = locales[locale];
  const slug = getSlug(relativePath);
  const source = await readFile(filePath, "utf8");
  let updated = source.replace(/<nav class="footer-links"[^>]*>[\s\S]*?<\/nav>/, buildFooterNav(locale, slug));

  if (slug === "privacy") {
    updated = updated
      .replace("7 月 20 日", "7 月 21 日")
      .replace("July 20, 2026", "July 21, 2026")
      .replace("2026년 7월 20일", "2026년 7월 21일");
    const article = buildPrivacyArticle(content);
    if (updated.includes(privacyMarkerStart)) {
      updated = updated.replace(new RegExp(`${privacyMarkerStart}[\\s\\S]*?${privacyMarkerEnd}`), article);
    } else {
      const anchor = `          <article>\n            <h2>${content.thirdPartyHeading}</h2>`;
      if (!updated.includes(anchor)) throw new Error(`Could not find privacy anchor in ${relativePath}`);
      updated = updated.replace(anchor, `${article}\n\n${anchor}`);
    }
  }

  await writeFile(filePath, updated);
  pageCount += 1;
}

console.log(`Updated trust links on ${pageCount} pages and added contact privacy disclosures.`);
