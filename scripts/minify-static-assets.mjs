import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform, version as esbuildVersion } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectRoot, "scripts", "minified-assets.json");
const checkOnly = process.argv.includes("--check");
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--check");

if (unknownArguments.length > 0) {
  throw new Error(`Unknown argument${unknownArguments.length === 1 ? "" : "s"}: ${unknownArguments.join(", ")}`);
}

const assetDefinitions = [
  {
    source: "styles.css",
    output: "styles.min.css",
    options: {
      loader: "css",
      minify: true,
      charset: "utf8",
      legalComments: "none",
      sourcefile: "styles.css"
    }
  }
];

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

function updatePublicAssetReferences(html) {
  return html
    .replace(/href=(['"])\/styles\.css\1/g, 'href=$1/styles.min.css$1')
    .replace(/src=(['"])\/app\.min\.js\1/g, 'src=$1/app.js$1');
}

async function buildAssets() {
  const builtAssets = [];

  for (const definition of assetDefinitions) {
    const sourcePath = path.join(projectRoot, definition.source);
    const sourceContent = await readFile(sourcePath, "utf8");
    const result = await transform(sourceContent, definition.options);
    const outputContent = result.code;

    builtAssets.push({
      ...definition,
      sourceContent,
      outputContent,
      metadata: {
        source: definition.source,
        output: definition.output,
        sourceBytes: Buffer.byteLength(sourceContent),
        outputBytes: Buffer.byteLength(outputContent),
        sourceSha256: sha256(sourceContent),
        outputSha256: sha256(outputContent)
      }
    });
  }

  return builtAssets;
}

async function expectedManifest(builtAssets) {
  return `${JSON.stringify(
    {
      generatedBy: `esbuild@${esbuildVersion}`,
      assets: builtAssets.map(({ metadata }) => metadata)
    },
    null,
    2
  )}\n`;
}

async function assertCurrent(builtAssets, manifestContent) {
  const staleFiles = [];

  for (const asset of builtAssets) {
    const currentOutput = await readFile(path.join(projectRoot, asset.output), "utf8").catch(() => null);
    if (currentOutput !== asset.outputContent) staleFiles.push(asset.output);
  }

  const currentManifest = await readFile(manifestPath, "utf8").catch(() => null);
  if (currentManifest !== manifestContent) staleFiles.push(path.relative(projectRoot, manifestPath));

  for (const htmlPath of await findHtmlFiles(projectRoot)) {
    const html = await readFile(htmlPath, "utf8");
    if (updatePublicAssetReferences(html) !== html) {
      staleFiles.push(path.relative(projectRoot, htmlPath));
    }
  }

  if (staleFiles.length > 0) {
    throw new Error(
      `Minified assets are out of date:\n${staleFiles.map((file) => `- ${file}`).join("\n")}\n` +
        "Run: node scripts/minify-static-assets.mjs"
    );
  }
}

async function writeAssets(builtAssets, manifestContent) {
  for (const asset of builtAssets) {
    await writeFile(path.join(projectRoot, asset.output), asset.outputContent);
  }
  await writeFile(manifestPath, manifestContent);

  let updatedPages = 0;
  for (const htmlPath of await findHtmlFiles(projectRoot)) {
    const html = await readFile(htmlPath, "utf8");
    const updatedHtml = updatePublicAssetReferences(html);
    if (updatedHtml === html) continue;
    await writeFile(htmlPath, updatedHtml);
    updatedPages += 1;
  }

  return updatedPages;
}

const builtAssets = await buildAssets();
const manifestContent = await expectedManifest(builtAssets);

if (checkOnly) {
  await assertCurrent(builtAssets, manifestContent);
  console.log("Minified assets and page references are current.");
} else {
  const updatedPages = await writeAssets(builtAssets, manifestContent);
  for (const { metadata } of builtAssets) {
    const reduction = Math.round((1 - metadata.outputBytes / metadata.sourceBytes) * 100);
    console.log(`${metadata.source} -> ${metadata.output} (${reduction}% smaller)`);
  }
  console.log(`Updated asset references in ${updatedPages} generated page(s).`);
}
