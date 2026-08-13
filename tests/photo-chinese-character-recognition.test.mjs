import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const browserSource = await readFile(new URL("../photo-chinese-character-recognition.js", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../photo-chinese-character-recognition/index.html", import.meta.url), "utf8");
const pinyinSource = await readFile(new URL("../pinyin-tool.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(browserSource, context);
const api = context.PhotoChineseCharacterRecognitionApi;

test("parseSuccess accepts the documented OCR response", () => {
  assert.equal(api.parseSuccess({ text: "孙" }), "孙");
  assert.equal(api.parseSuccess({ text: "孙悟空" }), "孙悟空");
  assert.equal(api.parseSuccess({ text: "孙悟空\n大闹天宫" }), "孙悟空\n大闹天宫");
  assert.equal(api.parseSuccess('{"text":" 孙 "}'), "孙");
});

test("parseSuccess rejects empty results and text without Han characters", () => {
  assert.throws(() => api.parseSuccess({ text: "" }), /可用的汉字文本/);
  assert.throws(() => api.parseSuccess({ text: "ABC 123" }), /可用的汉字文本/);
  assert.throws(() => api.parseSuccess("not json"), /无法解析/);
});

test("parseError prefers the service error message", () => {
  assert.equal(
    api.parseError({ error: { code: "HANZI_NOT_RECOGNIZED", message: "未能识别出一个明确的汉字" } }, 422),
    "未能识别出一个明确的汉字"
  );
  assert.equal(api.parseError(null, 413), "图片超过大小限制");
});

test("429 responses display the fixed localized rate-limit dialog", () => {
  assert.match(browserSource, /response\.status === 429/);
  assert.match(browserSource, /response\.status === 429\s*\? message\("rateLimited"\)/);
  assert.doesNotMatch(browserSource, /getServiceErrorMessage/);
  assert.match(browserSource, /showErrorDialog\(errorMessage\)/);
  assert.match(pageSource, /<dialog class="photo-ocr-error-dialog" id="photoOcrErrorDialog"/);
  assert.match(pageSource, /"rateLimited":"请求次数过多，请稍后重试"/);
});

test("the formal tool uploads one processed image using the OCR API contract", () => {
  assert.match(browserSource, /const OCR_URL = "https:\/\/jianfan\.app\/api\/ocr\/text"/);
  assert.doesNotMatch(browserSource, /localhost:8787/);
  assert.match(browserSource, /Authorization: window\.atob\(OCR_AUTHORIZATION\)/);
  assert.match(browserSource, /const OCR_AUTHORIZATION = "QmVhcmVyIGdlbWluaQ=="/);
  assert.doesNotMatch(browserSource, new RegExp(["Bearer", "gemini"].join(" ")));
  assert.match(browserSource, /form\.append\("image", selectedFile, selectedFile\.name\)/);
  assert.equal(browserSource.match(/form\.append\("image"/g)?.length, 1);
  assert.doesNotMatch(browserSource, /Worker|processImage|encodeStrokes|\/api\/hwr\//);
});

test("the formal tool compresses large photos before upload", () => {
  assert.match(browserSource, /const MAX_SOURCE_BYTES = 24 \* 1024 \* 1024/);
  assert.match(browserSource, /const MAX_PROCESSED_IMAGE_BYTES = 2 \* 1024 \* 1024/);
  assert.doesNotMatch(browserSource, /MAX_UPLOAD_BYTES|TARGET_UPLOAD_BYTES|5 \* 1024 \* 1024/);
  assert.match(browserSource, /await compressImage\(image, sourceFile, crop\)/);
  assert.match(browserSource, /canvas\.toBlob\(/);
  assert.match(browserSource, /"image\/jpeg"/);
});

test("findContentBounds trims a plain border while preserving padding", () => {
  const width = 100;
  const height = 80;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    data[offset] = 250;
    data[offset + 1] = 248;
    data[offset + 2] = 220;
    data[offset + 3] = 255;
  }
  for (let y = 20; y < 65; y += 1) {
    for (let x = 30; x < 72; x += 1) {
      if (x > 37 && x < 65 && y > 26 && y < 58) continue;
      const offset = (y * width + x) * 4;
      data[offset] = 12;
      data[offset + 1] = 12;
      data[offset + 2] = 12;
    }
  }

  const bounds = api.findContentBounds({ width, height, data });
  assert.equal(bounds.cropped, true);
  assert.ok(bounds.x > 10 && bounds.x < 30);
  assert.ok(bounds.y > 5 && bounds.y < 20);
  assert.ok(bounds.x + bounds.width > 72 && bounds.x + bounds.width < 90);
  assert.ok(bounds.y + bounds.height > 65 && bounds.y + bounds.height < 78);
});

test("findContentBounds leaves a uniform image unchanged", () => {
  const width = 40;
  const height = 40;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  const bounds = api.findContentBounds({ width, height, data });
  assert.deepEqual({ ...bounds }, { x: 0, y: 0, width, height, cropped: false });
});

test("the page targets online photo Chinese character recognition", () => {
  assert.match(pageSource, /PHOTO \/ OCR/);
  assert.match(pageSource, /<h1 id="pageTitle">在线拍照汉字识别<\/h1>/);
  assert.match(pageSource, /图片会先在浏览器中自动裁剪并压缩/);
  assert.doesNotMatch(pageSource, /noindex|Demo|EXPERIMENTAL/);
  assert.doesNotMatch(pageSource, /PHOTO TO STROKES|轨迹坐标|字迹提取强度/);
});

test("recognized text exposes clickable Hanzi details and the Pinyin converter", () => {
  assert.match(browserSource, /className = "photo-ocr-text-character"/);
  assert.match(browserSource, /selectResultCharacter\(character, button\)/);
  assert.match(browserSource, /chinese-to-pinyin\/\?text=/);
  assert.match(browserSource, /hanzi-writer-data/);
  assert.match(pageSource, /id="photoPinyinText"[^>]*>整段转拼音<\/a>/);
  assert.match(pageSource, /id="photoCharacterDetail"/);
  assert.match(pinyinSource, /parameters\.get\("text"\)/);
});

test("all five formal pages contain static localized primary headings", async () => {
  const pages = [
    ["../photo-chinese-character-recognition/index.html", "在线拍照汉字识别"],
    ["../zh-tw/photo-chinese-character-recognition/index.html", "線上拍照漢字辨識"],
    ["../en/photo-chinese-character-recognition/index.html", "Chinese Character Recognition from Photo"],
    ["../ja/photo-chinese-character-recognition/index.html", "写真から中国語の漢字を認識"],
    ["../ko/photo-chinese-character-recognition/index.html", "사진으로 중국 한자 인식"]
  ];
  for (const [path, heading] of pages) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.ok(source.includes(`<h1 id="pageTitle">${heading}</h1>`), path);
  }
});

test("all localized pages cover researched photo OCR and image-to-text intent", async () => {
  const pages = [
    ["../photo-chinese-character-recognition/index.html", ["图片转文字", "图片文字识别", "图片提取文字"]],
    ["../zh-tw/photo-chinese-character-recognition/index.html", ["圖片轉文字", "圖片文字辨識", "從圖片擷取文字"]],
    ["../en/photo-chinese-character-recognition/index.html", ["Chinese OCR Online", "image-to-text", "Chinese image-to-text"]],
    ["../ja/photo-chinese-character-recognition/index.html", ["中国語画像OCR", "画像テキスト化", "画像から文字起こし"]],
    ["../ko/photo-chinese-character-recognition/index.html", ["중국어 이미지 OCR", "이미지 텍스트 추출", "사진으로 한자 찾기"]]
  ];
  for (const [path, terms] of pages) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    const visibleBody = source.slice(source.indexOf("<body")).toLocaleLowerCase();
    for (const term of terms) {
      assert.ok(visibleBody.includes(term.toLocaleLowerCase()), `${path} visible body is missing ${term}`);
    }
  }
});

test("all localized pages ask for another image when processing cannot reach 2 MB", async () => {
  const pages = [
    "../photo-chinese-character-recognition/index.html",
    "../zh-tw/photo-chinese-character-recognition/index.html",
    "../en/photo-chinese-character-recognition/index.html",
    "../ja/photo-chinese-character-recognition/index.html",
    "../ko/photo-chinese-character-recognition/index.html"
  ];
  for (const path of pages) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(source, /2 MB/);
    assert.doesNotMatch(source, /5 MB/);
  }
});
