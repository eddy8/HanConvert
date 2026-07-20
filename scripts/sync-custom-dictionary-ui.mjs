import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markerStart = "        <!-- custom-dictionary:start -->";
const markerEnd = "        <!-- custom-dictionary:end -->";
const customDictionaryMarkup = `${markerStart}
        <details class="custom-dictionary" id="customDictionary">
          <summary>
            <span data-i18n="customDictionarySummary">自定义词库</span>
            <span class="custom-dictionary-count" id="customDictionaryCount" aria-live="polite">0/0 条启用</span>
          </summary>
          <div class="custom-dictionary-body">
            <p class="custom-dictionary-note" data-i18n="customDictionaryLocalNote">
              词条只保存在当前浏览器。填写相同内容可保护品牌名和专有名词。
            </p>
            <form class="custom-dictionary-form" id="customDictionaryForm" novalidate>
              <label>
                <span data-i18n="customDictionarySourceLabel">转换前</span>
                <input
                  id="customDictionarySource"
                  type="text"
                  maxlength="200"
                  autocomplete="off"
                  data-i18n-attr="placeholder:customDictionarySourcePlaceholder"
                  placeholder="例如：人工智能"
                />
              </label>
              <span class="custom-dictionary-arrow" aria-hidden="true">→</span>
              <label>
                <span data-i18n="customDictionaryTargetLabel">转换后</span>
                <input
                  id="customDictionaryTarget"
                  type="text"
                  maxlength="200"
                  autocomplete="off"
                  data-i18n-attr="placeholder:customDictionaryTargetPlaceholder"
                  placeholder="例如：人工智慧"
                />
              </label>
              <button class="text-button custom-dictionary-add" type="submit" data-i18n="customDictionaryAdd">
                添加词条
              </button>
            </form>
            <p class="custom-dictionary-empty" id="customDictionaryEmpty" data-i18n="customDictionaryEmpty">
              还没有自定义词条
            </p>
            <ul class="custom-dictionary-list" id="customDictionaryList"></ul>
            <div class="custom-dictionary-footer">
              <p id="customDictionaryStatus" role="status" aria-live="polite"></p>
              <button
                class="text-button custom-dictionary-clear"
                id="customDictionaryClear"
                type="button"
                data-i18n="customDictionaryClear"
                hidden
              >
                清空词库
              </button>
            </div>
          </div>
        </details>
${markerEnd}`;

function indentBlock(block, spaces) {
  const indentation = " ".repeat(spaces);
  return block
    .split("\n")
    .map((line) => `${indentation}${line}`)
    .join("\n");
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
  let html = await readFile(htmlPath, "utf8");
  if (!html.includes('id="converterTitle"')) continue;

  const existingBlock = /        <!-- custom-dictionary:start -->[\s\S]*?        <!-- custom-dictionary:end -->/;
  if (existingBlock.test(html)) {
    html = html.replace(existingBlock, customDictionaryMarkup);
  } else {
    html = html.replace(
      /(<details class="advanced-options">[\s\S]*?<\/details>)/,
      `$1\n\n${customDictionaryMarkup}`
    );
  }

  if (!html.includes('class="converter-option-grid"')) {
    const advancedBlock = html.match(/        <details class="advanced-options">[\s\S]*?        <\/details>/)?.[0];
    const customBlock = html.match(existingBlock)?.[0];

    if (advancedBlock && customBlock) {
      const optionGrid = [
        '        <div class="converter-option-grid">',
        indentBlock(advancedBlock, 2),
        "",
        indentBlock(customBlock, 2),
        "        </div>"
      ].join("\n");
      html = html.replace(`${advancedBlock}\n\n${customBlock}`, optionGrid);
    }
  }

  await writeFile(htmlPath, html);
}
