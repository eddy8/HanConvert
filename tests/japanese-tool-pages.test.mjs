import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const locales = [
  ["zh-CN", "", "常见日本汉字、简体字与繁体字对照", "把中文汉字转换成日本汉字，就是翻译成日语吗？"],
  ["zh-TW", "zh-tw", "常見日本漢字、簡體字與繁體字對照", "把中文漢字轉成日本漢字，就是翻譯成日文嗎？"],
  ["en", "en", "Common Japanese, Simplified, and Traditional forms", "Does converting Chinese characters to Japanese Kanji translate the text into Japanese?"],
  ["ja", "ja", "日本語漢字・簡体字・繁体字の代表的な違い", "中国語の漢字を日本の漢字に変換すると、日本語訳になりますか？"],
  ["ko", "ko", "일본 한자·간체·번체의 대표 글자 비교", "중국 한자를 일본 한자로 바꾸면 일본어 번역이 되나요?"]
];

test("Japanese-Chinese converter pages include localized examples and FAQ schema", async () => {
  for (const [locale, prefix, exampleTitle, firstQuestion] of locales) {
    const html = await readFile(path.join(projectRoot, prefix, "japanese-chinese-kanji-converter", "index.html"), "utf8");
    assert.ok(html.includes(exampleTitle), `${locale} example section`);
    assert.ok(html.includes(firstQuestion), `${locale} localized FAQ`);
    assert.equal((html.match(/<details>/g) || []).length, 5, `${locale} visible FAQ count`);
    assert.equal((html.match(/<tr><td lang="ja">/g) || []).length, 4, `${locale} comparison example count`);

    const schemaSource = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)?.[1];
    assert.ok(schemaSource, `${locale} structured data`);
    const schema = JSON.parse(schemaSource);
    const faq = schema["@graph"].find((item) => item["@type"] === "FAQPage");
    assert.equal(faq?.mainEntity.length, 5, `${locale} FAQPage entries`);
    assert.equal(faq.mainEntity[0].name, firstQuestion, `${locale} visible and structured FAQ stay aligned`);
  }
});
