import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wellKnownRoot = path.join(projectRoot, ".well-known", "agent-skills");
const skillName = "jianfan-browser-tools";
const skillRelativeUrl = `/.well-known/agent-skills/${skillName}/SKILL.md`;
const skillPath = path.join(wellKnownRoot, skillName, "SKILL.md");
const indexPath = path.join(wellKnownRoot, "index.json");
const serviceLinks = `    <link rel="service-desc" href="/.well-known/agent-skills/index.json" type="application/json" />
    <link rel="service-doc" href="${skillRelativeUrl}" type="text/markdown" />`;
const homePages = new Set(["index.html", "zh-tw/index.html", "en/index.html", "ja/index.html", "ko/index.html"]);

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

function addWebMcpScript(html) {
  if (html.includes('src="/webmcp.js"')) return html;
  if (html.includes('src="/app.js"')) {
    return html.replace(
      '    <script type="module" src="/app.js"></script>',
      '    <script type="module" src="/app.js"></script>\n    <script defer src="/webmcp.js"></script>'
    );
  }
  if (html.includes('src="/character-counter.js"')) {
    return html.replace(
      '    <script defer src="/character-counter.js"></script>',
      '    <script defer src="/character-counter.js"></script>\n    <script defer src="/webmcp.js"></script>'
    );
  }
  return html;
}

function addServiceLinks(html) {
  if (html.includes('rel="service-desc"')) return html;
  return html.replace(
    '    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
    `    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />\n${serviceLinks}`
  );
}

await mkdir(wellKnownRoot, { recursive: true });
const skillBytes = await readFile(skillPath);
const digest = createHash("sha256").update(skillBytes).digest("hex");
const index = {
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      name: skillName,
      type: "skill-md",
      description: "Use JianFan.app browser-local tools for Simplified and Traditional Chinese conversion, CJK character counting, Chinese Pinyin, stroke-order lookup, and printable Han character worksheets.",
      url: skillRelativeUrl,
      digest: `sha256:${digest}`
    }
  ]
};
await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);

let updatedPages = 0;
for (const filePath of await findHtmlFiles(projectRoot)) {
  const relativePath = path.relative(projectRoot, filePath).split(path.sep).join("/");
  const source = await readFile(filePath, "utf8");
  let updated = source;
  if (source.includes('id="converterTitle"') || source.includes('data-tool-page="character-counter"')) {
    updated = addWebMcpScript(updated);
  }
  if (homePages.has(relativePath)) updated = addServiceLinks(updated);
  if (updated !== source) {
    await writeFile(filePath, updated);
    updatedPages += 1;
  }
}

console.log(`Updated agent discovery index and ${updatedPages} HTML pages.`);
