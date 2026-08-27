import { SCENARIO_LOCALES, SCENARIO_PAGES } from "./scenario-pseo-data.mjs";

const headings = Object.freeze({
  "zh-CN": Object.freeze({ file: "按文件格式选择简繁转换", kanji: "按方向选择中日汉字转换", worksheet: "按练习方式制作汉字练习纸" }),
  "zh-TW": Object.freeze({ file: "依檔案格式選擇簡繁轉換", kanji: "依方向選擇日中漢字轉換", worksheet: "依練習方式製作國字練習紙" }),
  en: Object.freeze({ file: "Choose a Chinese file-conversion workflow", kanji: "Choose a Chinese-Japanese Kanji direction", worksheet: "Choose a Chinese worksheet format" }),
  ja: Object.freeze({ file: "ファイル形式から中国語変換を選ぶ", kanji: "変換方向から日中漢字ツールを選ぶ", worksheet: "用途から漢字練習プリントを選ぶ" }),
  ko: Object.freeze({ file: "파일 형식별 중국어 변환", kanji: "방향별 일본·중국 한자 변환", worksheet: "용도별 한자 연습지 만들기" })
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildScenarioCluster(locale, category, options = {}) {
  const prefix = SCENARIO_LOCALES[locale].prefix;
  const scenarios = SCENARIO_PAGES.filter((scenario) => scenario.category === category);
  const headingId = options.headingId || `${category}ScenarioLinksTitle`;
  const links = scenarios.map((scenario) => {
    const page = scenario.localized[locale];
    return `          <a href="/${prefix}${scenario.slug}/"><span>${escapeHtml(page.name)}</span><small>${escapeHtml(scenario.badge)}</small></a>`;
  }).join("\n");
  return `      <!-- scenario-pseo-links:start -->
      <section class="scenario-cluster" aria-labelledby="${headingId}">
        <div><p class="section-kicker">SCENARIO GUIDES</p><h2 id="${headingId}">${escapeHtml(headings[locale][category])}</h2></div>
        <nav class="scenario-cluster-links" aria-label="${escapeHtml(headings[locale][category])}">
${links}
        </nav>
      </section>
      <!-- scenario-pseo-links:end -->`;
}
