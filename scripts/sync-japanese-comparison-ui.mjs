import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markerStart = "          <!-- japanese-comparison:start -->";
const markerEnd = "          <!-- japanese-comparison:end -->";

const pages = [
  {
    file: "japanese-kanji-converter/index.html",
    text: {
      description: "在线日文新字体旧字体转换工具，支持新字体转旧字体、旧字体转新字体、变化字高亮和新旧字体对照表，文本在浏览器本地处理。",
      kicker: "字形变化",
      title: "旧字体高亮与新旧字体对照",
      legend: "高亮表示转换后发生变化的日文汉字",
      empty: "完成日文新字体与旧字体转换后，这里会显示高亮结果和去重后的字体对照表。",
      preview: "高亮结果",
      table: "新旧字体对照表",
      source: "新字体",
      target: "旧字体",
      count: "出现次数",
      tableLabel: "日文新字体与旧字体转换对照表",
      featureFlowTitle: "变化字高亮与对照",
      featureFlowBody: "转换后自动高亮发生变化的旧汉字或新字体，并按出现次数生成去重对照表。",
      seoRegionTitle: "旧字体高亮和对照表",
      seoRegionBody: "转换完成后可查看变化字高亮与新旧字体对照表，适合逐字校对旧汉字和现代字形。"
    }
  },
  {
    file: "zh-tw/japanese-kanji-converter/index.html",
    text: {
      description: "線上日文新字體舊字體轉換工具，支援新字體轉舊字體、舊字體轉新字體、變化字高亮與新舊字體對照表，文字在瀏覽器本機處理。",
      kicker: "字形變化",
      title: "舊字體高亮與新舊字體對照",
      legend: "高亮表示轉換後發生變化的日文漢字",
      empty: "完成日文新字體與舊字體轉換後，這裡會顯示高亮結果和去重後的字體對照表。",
      preview: "高亮結果",
      table: "新舊字體對照表",
      source: "新字體",
      target: "舊字體",
      count: "出現次數",
      tableLabel: "日文新字體與舊字體轉換對照表",
      featureFlowTitle: "變化字高亮與對照",
      featureFlowBody: "轉換後自動高亮發生變化的舊漢字或新字體，並依出現次數產生去重對照表。",
      seoRegionTitle: "舊字體高亮和對照表",
      seoRegionBody: "轉換完成後可查看變化字高亮與新舊字體對照表，適合逐字校對舊漢字和現代字形。"
    }
  },
  {
    file: "en/japanese-kanji-converter/index.html",
    text: {
      description: "Convert Japanese Shinjitai and Kyujitai both ways, highlight changed kanji, and review a deduplicated comparison table. Processing stays in your browser.",
      kicker: "Glyph changes",
      title: "Highlighted Kyujitai changes and comparison",
      legend: "Highlight marks Japanese kanji changed by the conversion",
      empty: "Convert between Shinjitai and Kyujitai to see a highlighted result and a deduplicated glyph comparison table.",
      preview: "Highlighted result",
      table: "Shinjitai and Kyujitai comparison",
      source: "Shinjitai",
      target: "Kyujitai",
      count: "Occurrences",
      tableLabel: "Japanese Shinjitai and Kyujitai conversion comparison",
      featureFlowTitle: "Highlight and compare changes",
      featureFlowBody: "Changed Shinjitai or Kyujitai are highlighted automatically and collected in a deduplicated table with occurrence counts.",
      seoRegionTitle: "Highlighted kanji comparison",
      seoRegionBody: "Review changed kanji in context and use the Shinjitai–Kyujitai comparison table for character-by-character checking."
    }
  },
  {
    file: "ja/japanese-kanji-converter/index.html",
    text: {
      description: "旧字体 新字体 変換と旧漢字変換に対応。変更箇所をハイライトし、新旧字体対照表を自動作成。テキストはブラウザー内で処理します。",
      kicker: "字形の変更",
      title: "旧字体のハイライトと新旧字体の比較",
      legend: "変換された日本語の漢字をハイライト表示",
      empty: "新字体と旧字体を変換すると、変更箇所のハイライトと重複を除いた字形比較表が表示されます。",
      preview: "ハイライト結果",
      table: "新字体・旧字体の比較表",
      source: "新字体",
      target: "旧字体",
      count: "出現回数",
      tableLabel: "日本語の新字体と旧字体の変換比較表",
      featureFlowTitle: "変更箇所をハイライト",
      featureFlowBody: "変換された旧字体・新字体を本文中で強調し、出現回数付きの新旧字体対照表にまとめます。",
      seoRegionTitle: "新旧字体対照表",
      seoRegionBody: "変換後の変更箇所をハイライト表示し、新字体と旧字体の対応を重複なしの比較表で一文字ずつ確認できます。"
    }
  },
  {
    file: "ko/japanese-kanji-converter/index.html",
    text: {
      description: "일본 신자체와 구자체를 양방향으로 변환하고 변경 한자를 강조 표시하며 중복 없는 대조표를 제공합니다. 텍스트는 브라우저에서 처리됩니다.",
      kicker: "글자 모양 변경",
      title: "구자체 강조 표시와 신구자체 대조",
      legend: "변환으로 달라진 일본 한자를 강조 표시",
      empty: "일본 신자체와 구자체를 변환하면 변경 부분 강조 결과와 중복을 제거한 글자 대조표가 표시됩니다.",
      preview: "강조 결과",
      table: "신자체·구자체 대조표",
      source: "신자체",
      target: "구자체",
      count: "등장 횟수",
      tableLabel: "일본 신자체와 구자체 변환 대조표",
      featureFlowTitle: "변경 한자 강조와 대조",
      featureFlowBody: "변환된 신자체 또는 구자체를 본문에서 강조하고 등장 횟수와 함께 중복 없는 대조표로 정리합니다.",
      seoRegionTitle: "신구자체 강조 대조표",
      seoRegionBody: "변환 후 달라진 한자를 강조 결과와 신자체·구자체 대조표에서 글자별로 확인할 수 있습니다."
    }
  }
];

function buildComparisonSection(text) {
  return `${markerStart}
          <section class="japanese-comparison" id="japaneseComparison" aria-labelledby="japaneseComparisonTitle">
            <div class="japanese-comparison-head">
              <div>
                <p class="section-kicker" data-i18n="japaneseComparisonKicker">${text.kicker}</p>
                <h3 id="japaneseComparisonTitle" data-i18n="japaneseComparisonTitle">${text.title}</h3>
                <p id="japaneseComparisonSummary" class="japanese-comparison-summary" aria-live="polite"></p>
              </div>
              <div class="japanese-comparison-legend">
                <span aria-hidden="true"></span>
                <span data-i18n="japaneseComparisonLegend">${text.legend}</span>
              </div>
            </div>

            <p class="japanese-comparison-empty" id="japaneseComparisonEmpty" data-i18n="japaneseComparisonEmpty">
              ${text.empty}
            </p>

            <div class="japanese-comparison-results" id="japaneseComparisonResults" hidden>
              <div class="japanese-highlight-panel">
                <p class="japanese-comparison-label" data-i18n="japaneseHighlightTitle">${text.preview}</p>
                <div class="japanese-highlight-preview" id="japaneseHighlightPreview" tabindex="0"></div>
                <p class="japanese-comparison-note" id="japanesePreviewNote" hidden></p>
              </div>

              <div class="japanese-table-panel">
                <p class="japanese-comparison-label" data-i18n="japaneseTableTitle">${text.table}</p>
                <div class="japanese-table-scroll">
                  <table
                    class="japanese-comparison-table"
                    data-i18n-attr="aria-label:japaneseTableLabel"
                    aria-label="${text.tableLabel}"
                  >
                    <thead>
                      <tr>
                        <th id="japaneseSourceHeading" scope="col">${text.source}</th>
                        <th id="japaneseTargetHeading" scope="col">${text.target}</th>
                        <th scope="col" data-i18n="japaneseCountHeading">${text.count}</th>
                      </tr>
                    </thead>
                    <tbody id="japaneseComparisonBody"></tbody>
                  </table>
                </div>
                <p class="japanese-comparison-note" id="japanesePairsNote" hidden></p>
              </div>
            </div>
          </section>
${markerEnd}`;
}

function setText(html, key, value) {
  const pattern = new RegExp(`(<[^>]+data-i18n="${key}"[^>]*>)[\\s\\S]*?(<\\/[^>]+>)`);
  return html.replace(pattern, `$1${value}$2`);
}

for (const page of pages) {
  const filePath = path.join(projectRoot, page.file);
  const source = await readFile(filePath, "utf8");
  const section = buildComparisonSection(page.text);
  let updated;

  if (source.includes(markerStart) && source.includes(markerEnd)) {
    const pattern = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`);
    updated = source.replace(pattern, section);
  } else {
    const anchor = '        </div>\n      </section>\n\n      <section class="feature-band"';
    if (!source.includes(anchor)) throw new Error(`Could not find converter anchor in ${page.file}`);
    updated = source.replace(
      anchor,
      `        </div>\n\n${section}\n      </section>\n\n      <section class="feature-band"`
    );
  }

  updated = updated.replace(
    /(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/,
    `$1${page.text.description}$2`
  );
  updated = setText(updated, "featureFlowTitle", page.text.featureFlowTitle);
  updated = setText(updated, "featureFlowBody", page.text.featureFlowBody);
  updated = setText(updated, "seoRegionTitle", page.text.seoRegionTitle);
  updated = setText(updated, "seoRegionBody", page.text.seoRegionBody);

  await writeFile(filePath, updated);
}

console.log(`Updated ${pages.length} Japanese converter pages.`);
