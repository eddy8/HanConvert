import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function findHtmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(entryPath)));
    if (entry.isFile() && entry.name === "index.html") files.push(entryPath);
  }
  return files;
}

test("the minified stylesheet matches its source hash", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(projectRoot, "scripts", "minified-assets.json"), "utf8")
  );

  assert.match(manifest.generatedBy, /^esbuild@\d+\.\d+\.\d+$/);
  assert.deepEqual(
    manifest.assets.map(({ source, output }) => [source, output]),
    [["styles.css", "styles.min.css"]]
  );

  for (const asset of manifest.assets) {
    const source = await readFile(path.join(projectRoot, asset.source), "utf8");
    const output = await readFile(path.join(projectRoot, asset.output), "utf8");
    assert.equal(Buffer.byteLength(source), asset.sourceBytes, `${asset.source} byte count changed`);
    assert.equal(Buffer.byteLength(output), asset.outputBytes, `${asset.output} byte count changed`);
    assert.equal(sha256(source), asset.sourceSha256, `${asset.source} was not re-minified`);
    assert.equal(sha256(output), asset.outputSha256, `${asset.output} differs from the manifest`);
    assert.ok(asset.outputBytes < asset.sourceBytes, `${asset.output} should be smaller than its source`);
  }
});

test("generated pages use the minified stylesheet and source JavaScript module", async () => {
  const pages = await findHtmlFiles(projectRoot);
  let stylesheetReferences = 0;
  let appReferences = 0;

  for (const pagePath of pages) {
    const html = await readFile(pagePath, "utf8");
    const relativePath = path.relative(projectRoot, pagePath);
    assert.doesNotMatch(html, /href=['"]\/styles\.css['"]/, `${relativePath} uses styles.css`);
    assert.doesNotMatch(html, /src=['"]\/app\.min\.js['"]/, `${relativePath} uses app.min.js`);
    stylesheetReferences += (html.match(/href=['"]\/styles\.min\.css['"]/g) || []).length;
    appReferences += (html.match(/src=['"]\/app\.js['"]/g) || []).length;
  }

  assert.ok(stylesheetReferences > 0, "no page references styles.min.css");
  assert.ok(appReferences > 0, "no page references app.js");
});

test("page generators emit minified core asset references", async () => {
  const scriptNames = (await readdir(path.join(projectRoot, "scripts"))).filter(
    (name) => name.startsWith("generate-") && name.endsWith(".mjs")
  );

  for (const scriptName of scriptNames) {
    const source = await readFile(path.join(projectRoot, "scripts", scriptName), "utf8");
    assert.doesNotMatch(source, /href=['"]\/styles\.css['"]/, `${scriptName} emits styles.css`);
  }

  const agentSync = await readFile(path.join(projectRoot, "scripts", "sync-agent-discovery.mjs"), "utf8");
  const schemaSync = await readFile(path.join(projectRoot, "scripts", "sync-structured-data.mjs"), "utf8");
  assert.doesNotMatch(agentSync, /src=['"]\/app\.min\.js['"]/, "agent sync emits app.min.js");
  assert.match(schemaSync, /const appAsset = "\/app\.js";/);
});
