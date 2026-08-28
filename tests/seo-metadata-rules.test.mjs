import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  decodeHtmlText,
  getMetadataLengthRange,
  getTitleContent,
  LOCALIZED_METADATA_PATHS,
  SEO_TITLE_SUFFIX,
  visibleMetadataLength,
  visibleTitleContentLength
} from "../scripts/seo-metadata-rules.mjs";
import { getPageContext } from "../scripts/static-localization-lib.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("enforces localized title and description ranges for managed pages", async () => {
  for (const relativePath of LOCALIZED_METADATA_PATHS) {
    const html = await readFile(path.join(projectRoot, relativePath), "utf8");
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
    assert.ok(title, `${relativePath} title`);
    assert.ok(description, `${relativePath} description`);
    assert.ok(title.endsWith(SEO_TITLE_SUFFIX), `${relativePath} title brand suffix`);

    const { locale } = getPageContext(relativePath);
    const titleLength = visibleTitleContentLength(title);
    const descriptionLength = visibleMetadataLength(description);
    const [titleMin, titleMax] = getMetadataLengthRange(locale, "title");
    const [descriptionMin, descriptionMax] = getMetadataLengthRange(locale, "description");
    assert.ok(titleLength >= titleMin && titleLength <= titleMax, `${relativePath} title length ${titleLength}`);
    assert.ok(
      descriptionLength >= descriptionMin && descriptionLength <= descriptionMax,
      `${relativePath} description length ${descriptionLength}`
    );

    const schemaText = html.match(
      /<!-- seo-schema:start -->[\s\S]*?<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    )?.[1];
    assert.ok(schemaText, `${relativePath} structured data`);
    const schema = JSON.parse(schemaText);
    const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [schema];
    const primaryTypes = new Set(["WebApplication", "WebPage", "AboutPage", "ContactPage", "CollectionPage"]);
    const primary = graph.find((entry) => {
      const types = Array.isArray(entry["@type"]) ? entry["@type"] : [entry["@type"]];
      return types.some((type) => primaryTypes.has(type));
    });
    const breadcrumb = graph.find((entry) => entry["@type"] === "BreadcrumbList");
    const expectedName = getTitleContent(title);
    assert.equal(primary?.name, expectedName, `${relativePath} structured-data name`);
    assert.equal(primary?.description, decodeHtmlText(description), `${relativePath} structured-data description`);
    assert.equal(breadcrumb?.itemListElement?.at(-1)?.name, expectedName, `${relativePath} breadcrumb name`);
  }
});

test("counts decoded HTML entities as visible characters", () => {
  assert.equal(visibleMetadataLength("A &amp; B"), 5);
  assert.equal(visibleMetadataLength("&#x6F22;&#23383;"), 2);
});
