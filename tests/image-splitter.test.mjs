import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
require("../image-splitter.js");
const core = globalThis.ImageSplitterCore;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prefixes = ["", "zh-tw/", "en/", "ja/", "ko/"];

test("grid tiles cover the image exactly and differ by at most one pixel", () => {
  const grid = core.computeGrid({ width: 1000, height: 700, rows: 3, cols: 3 });
  assert.equal(grid.tiles.length, 9);
  assert.deepEqual(grid.frame, { x: 0, y: 0, width: 1000, height: 700 });
  const widths = grid.tiles.filter((tile) => tile.row === 0).map((tile) => tile.width);
  assert.equal(widths.reduce((a, b) => a + b), 1000);
  assert.ok(Math.max(...widths) - Math.min(...widths) <= 1);
  const last = grid.tiles.at(-1);
  assert.equal(last.x + last.width, 1000);
  assert.equal(last.y + last.height, 700);
});

test("square 3x3 grids crop to the center or pad around the image", () => {
  const cropped = core.computeGrid({ width: 1600, height: 1200, rows: 3, cols: 3, ratio: "1:1", fit: "crop" });
  assert.deepEqual(cropped.frame, { x: 200, y: 0, width: 1200, height: 1200 });
  assert.equal(cropped.tiles[0].width, 400);
  assert.equal(cropped.padded, false);
  const padded = core.computeGrid({ width: 1600, height: 1200, rows: 3, cols: 3, ratio: "1:1", fit: "pad" });
  assert.deepEqual(padded.frame, { x: 0, y: -200, width: 1600, height: 1600 });
  assert.equal(padded.padded, true);
  const carousel = core.computeGrid({ width: 4000, height: 1000, rows: 1, cols: 3, ratio: "4:5" });
  assert.equal(carousel.frame.width, 2400);
  assert.equal(carousel.tiles[0].width / carousel.tiles[0].height, 0.8);
});

test("clamps grid sizes and numbers Instagram mosaics from the last tile", () => {
  const grid = core.computeGrid({ width: 100, height: 100, rows: 99, cols: 0 });
  assert.equal(grid.rows, 10);
  assert.equal(grid.cols, 1);
  assert.equal(core.partNumber(8, 9, "instagram"), 1);
  assert.equal(core.partNumber(0, 9, "instagram"), 9);
  assert.equal(core.partNumber(0, 9, "reading"), 1);
  assert.equal(core.partFileName("photo", { index: 8, row: 2, col: 2 }, 9, "instagram", "png"), "photo_post01_r3c3.png");
  assert.equal(core.partFileName("long", { index: 0 }, 120, "reading", "jpg"), "long_001.jpg");
});

test("long images split by A4 ratio, equal parts or pixel height", () => {
  const a4 = core.computeSegments({ width: 1000, height: 5000, mode: "a4" });
  assert.equal(a4.segments.length, 4);
  assert.equal(a4.segments[0].height, Math.round(1000 * 297 / 210));
  assert.equal(a4.segments.reduce((sum, segment) => sum + segment.height, 0), 5000);
  const equal = core.computeSegments({ width: 800, height: 3001, mode: "count", value: 3 });
  assert.deepEqual(equal.segments.map((segment) => segment.height), [1000, 1001, 1000]);
  const pixels = core.computeSegments({ width: 800, height: 1000, mode: "pixels", value: 400 });
  assert.deepEqual(pixels.segments.map((segment) => segment.y), [0, 400, 800]);
  assert.equal(core.computeSegments({ width: 100, height: 100000, mode: "pixels", value: 64 }).tooMany, true);
});

test("smart cuts move to the nearest clean row without exceeding the target height", () => {
  assert.equal(core.pickCleanRow([9, 9, 0, 9, 0.1, 9], 5), 4);
  assert.equal(core.pickCleanRow([5, 5, 5], 1), 1);
  const calls = [];
  const result = core.computeSegments({
    width: 1000, height: 3000, mode: "a4",
    chooseCut: (lo, hi, ideal) => { calls.push([lo, hi, ideal]); return hi - 50; }
  });
  assert.ok(calls.every(([lo, hi, ideal]) => hi === ideal && lo < hi));
  assert.ok(result.segments.every((segment) => segment.height <= 1414));
  assert.equal(result.segments.reduce((sum, segment) => sum + segment.height, 0), 3000);
});

test("poster layout tiles A4 pages with overlap and reports size and dpi", () => {
  const poster = core.computePoster({ width: 4000, height: 3000, paper: "a4", orientation: "portrait", cols: 2, margin: 6, overlap: 8 });
  assert.equal(poster.printableWidth, 198);
  assert.equal(poster.posterWidth, 198 * 2 - 8);
  assert.equal(poster.rows, 2);
  assert.equal(poster.pages.length, 4);
  assert.deepEqual(poster.pages.map((page) => page.label), ["A1", "A2", "B1", "B2"]);
  const right = poster.pages[1];
  assert.ok(Math.abs(right.x + right.width - 4000) < 1e-6);
  assert.ok(Math.abs(poster.posterHeight - 3000 * (388 / 4000)) < 1e-9);
  assert.equal(poster.dpi, Math.round(4000 / (388 / 25.4)));
  assert.deepEqual(core.paperSize("a3", "landscape"), [420, 297]);
  assert.equal(core.computePoster({ width: 100, height: 100000, cols: 10 }).tooMany, true);
});

test("ships five localized pages with the tool, schema, sitemap and homepage links", async () => {
  for (const prefix of prefixes) {
    const html = await readFile(path.join(projectRoot, prefix, "image-splitter", "index.html"), "utf8");
    assert.match(html, /data-tool-page="image-splitter"/u);
    assert.match(html, /<link rel="stylesheet" href="\/image-splitter\.css" \/>/u);
    assert.match(html, /<script defer src="\/image-splitter\.js"><\/script>/u);
    for (const id of ["splitterCanvas", "splitterZip", "splitterPdf", "splitterShare", "splitterSmartCut", "splitterPosterCols"]) assert.match(html, new RegExp(`id="${id}"`, "u"), `${prefix || "zh-CN"} ${id}`);
    assert.equal(html.match(/data-splitter-mode="/gu)?.length, 3);
    assert.equal(html.match(/hreflang=/gu)?.length, 6);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)[1]);
    const faq = schema["@graph"].find((item) => item["@type"] === "FAQPage");
    assert.equal(faq.mainEntity.length, 9, prefix || "zh-CN");
    assert.equal(html.match(/<details>/gu)?.length, 9);
    assert.ok(schema["@graph"].some((item) => item["@type"] === "HowTo"));
    const messages = JSON.parse(html.match(/<script type="application\/json" id="imageSplitterMessages">([\s\S]*?)<\/script>/u)[1]);
    for (const key of ["gridSummary", "longSummary", "posterSummary", "libraryError", "shareTapAgain"]) assert.ok(messages[key], `${prefix || "zh-CN"} ${key}`);
    const home = await readFile(path.join(projectRoot, prefix, "index.html"), "utf8");
    assert.match(home, /data-route="image-splitter"/u);
    const redaction = await readFile(path.join(projectRoot, prefix, "image-redaction", "index.html"), "utf8");
    assert.match(redaction, new RegExp(`href="/${prefix}image-splitter/"`, "u"));
  }
  const sitemap = await readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
  assert.equal((sitemap.match(/<loc>https:\/\/jianfan\.app\/(?:zh-tw\/|en\/|ja\/|ko\/)?image-splitter\/<\/loc>/gu) || []).length, 5);
});

test("loads ZIP and PDF libraries lazily from pinned jsDelivr builds with SRI", async () => {
  const source = await readFile(path.join(projectRoot, "image-splitter.js"), "utf8");
  assert.match(source, /url: "https:\/\/cdn\.jsdmirror\.cn\/npm\/fflate@0\.8\.2\/umd\/index\.js", integrity: "sha384-[A-Za-z0-9+/=]+"/u);
  assert.match(source, /url: "https:\/\/cdn\.jsdmirror\.cn\/npm\/jspdf@4\.2\.1\/dist\/jspdf\.umd\.min\.js", integrity: "sha384-[A-Za-z0-9+/=]+"/u);
  assert.match(source, /script\.integrity = library\.integrity;/u);
  assert.match(source, /script\.crossOrigin = "anonymous";/u);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|sendBeacon/u);
});
