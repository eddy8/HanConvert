import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
require("../image-redaction.js");
const core = globalThis.ImageRedactionCore;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("normalizes reverse-drawn redaction rectangles within image bounds", () => {
  assert.deepEqual(core.normalizeRect(0.8, 0.7, -0.5, -0.4), { x: 0.30000000000000004, y: 0.29999999999999993, width: 0.5, height: 0.4 });
  assert.deepEqual(core.normalizeRect(-0.2, -0.1, 0.4, 0.3), { x: 0, y: 0, width: 0.2, height: 0.19999999999999998 });
});

test("validates payment-card candidates with the Luhn checksum", () => {
  assert.equal(core.isLuhnValid("4111 1111 1111 1111"), true);
  assert.equal(core.isLuhnValid("4111 1111 1111 1112"), false);
  assert.equal(core.classifySensitiveText("4111 1111 1111 1111"), "card");
});

test("classifies common sensitive text patterns without treating every number as private", () => {
  assert.equal(core.classifySensitiveText("name@example.com"), "email");
  assert.equal(core.classifySensitiveText("second@example.com"), "email");
  assert.equal(core.classifySensitiveText("192.168.1.24"), "network");
  assert.equal(core.classifySensitiveText("10.0.0.8"), "network");
  assert.equal(core.classifySensitiveText("+86 138 0013 8000"), "phone");
  assert.equal(core.classifySensitiveText("20260921"), null);
});

test("extracts OCR word boxes and returns normalized privacy suggestions", () => {
  const data = {
    blocks: [{ paragraphs: [{ lines: [{ text: "Email name@example.com", words: [
      { text: "Email", bbox: { x0: 10, y0: 20, x1: 70, y1: 45 } },
      { text: "name@example.com", bbox: { x0: 80, y0: 20, x1: 260, y1: 45 } }
    ] }] }] }]
  };
  const results = core.detectSensitiveTextRegions(data, 400, 200);
  assert.ok(results.some((item) => item.category === "email"));
  assert.ok(results.every((item) => item.rect.x >= 0 && item.rect.x + item.rect.width <= 1));
});

test("downscales oversized images while preserving their aspect ratio", () => {
  const result = core.calculateOutputSize(12000, 9000);
  assert.ok(result.width <= core.MAX_IMAGE_EDGE);
  assert.ok(result.width * result.height <= core.MAX_IMAGE_PIXELS);
  assert.ok(Math.abs(result.width / result.height - 4 / 3) < 0.001);
});

test("samples the already-redacted canvas when effects overlap", async () => {
  const script = await readFile(path.join(projectRoot, "image-redaction.js"), "utf8");
  assert.match(script, /captureRegion\(ctx, x, y, w, h\)/u);
  assert.doesNotMatch(script, /applyRegion\(ctx, source,/u);
  assert.match(script, /updateSelection && region && region\.effect !== effect/u);
});

test("ships five localized static pages with editor, AI review, schema and sitemap entries", async () => {
  const prefixes = ["", "zh-tw/", "en/", "ja/", "ko/"];
  for (const prefix of prefixes) {
    const html = await readFile(path.join(projectRoot, prefix, "image-redaction", "index.html"), "utf8");
    assert.match(html, /data-tool-page="image-redaction"/u);
    assert.match(html, /src="\/image-redaction\.js"/u);
    assert.match(html, /id="redactionCanvas"/u);
    assert.match(html, /id="redactionAiRun"/u);
    assert.match(html, /"@type": "HowTo"/u);
    assert.match(html, /"@type": "FAQPage"/u);
    assert.equal(html.match(/hreflang=/gu)?.length, 6);
  }
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  assert.equal((sitemap.match(/<loc>https:\/\/jianfan\.app\/(?:zh-tw\/|en\/|ja\/|ko\/)?image-redaction\/<\/loc>/gu) || []).length, 5);

  for (const prefix of prefixes) {
    const home = await readFile(path.join(projectRoot, prefix, "index.html"), "utf8");
    const photoOcr = await readFile(path.join(projectRoot, prefix, "photo-chinese-character-recognition", "index.html"), "utf8");
    assert.match(home, /data-route="image-redaction"/u);
    assert.match(photoOcr, /data-route="image-redaction"/u);
  }
});

test("blurs with StackBlur instead of canvas filters, which Safari does not reliably apply", async () => {
  const source = await readFile(path.join(projectRoot, "image-redaction.js"), "utf8");
  assert.doesNotMatch(source, /\.filter\s*=\s*`?blur/u);
  assert.match(source, /StackBlur\.imageDataRGBA\(pixels, 0, 0, w, h,/u);
  assert.equal(core.stackBlurRadius(8.3), 17);
  assert.equal(core.stackBlurRadius(500), 254);
  assert.equal(core.stackBlurRadius(0), 2);
});

test("loads StackBlur from a pinned CDN build and the face model from this site", async () => {
  const source = await readFile(path.join(projectRoot, "image-redaction.js"), "utf8");
  assert.match(source, /const modelUrl = "\/vendor\/mediapipe\/blaze_face_short_range\.tflite";/u);
  assert.doesNotMatch(source, /modelUrl = "https:\/\/storage\.googleapis\.com/u);
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    const html = await readFile(path.join(projectRoot, prefix, "image-redaction", "index.html"), "utf8");
    assert.match(html, /<script defer src="https:\/\/cdn\.jsdelivr\.net\/npm\/stackblur-canvas@3\.0\.1\/dist\/stackblur\.min\.js" integrity="sha384-[^"]+" crossorigin="anonymous"><\/script>\n    <script defer src="\/image-redaction\.js">/u, prefix || "zh-CN");
    assert.match(html, /id="redactionCopy"/u);
    assert.match(html, /class="redaction-mobile-bar"/u);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)[1]);
    assert.equal(schema["@graph"].find((item) => item["@type"] === "FAQPage").mainEntity.length, 9, prefix || "zh-CN");
  }
});

test("brush strokes get padded bounds and the pages offer a box/brush tool switch", async () => {
  const rect = core.strokeBounds([[0.2, 0.3], [0.4, 0.35]], 0.1, 0.16);
  assert.ok(Math.abs(rect.x - 0.15) < 1e-9 && Math.abs(rect.y - 0.22) < 1e-9);
  assert.ok(Math.abs(rect.width - 0.3) < 1e-9 && Math.abs(rect.height - 0.21) < 1e-9);
  assert.equal(core.strokeBounds([], 0.1, 0.1), null);
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    const html = await readFile(path.join(projectRoot, prefix, "image-redaction", "index.html"), "utf8");
    assert.match(html, /data-redaction-tool="rect"[\s\S]*data-redaction-tool="brush"/u, prefix || "zh-CN");
    assert.match(html, /id="redactionBrushSize" type="range"/u);
    assert.match(html, /"brushHint":"/u);
  }
});
