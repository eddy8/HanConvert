import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../word-to-txt-tool.js", import.meta.url), "utf8");
const context = {};
context.globalThis = context;
vm.runInNewContext(source, context);
const {
  MAX_FILE_SIZE_BYTES,
  createUniqueTxtFilenames,
  toTxtFilename,
  validateFileDescriptor
} = context.WordToTxtCore;

test("converts Word filenames to TXT filenames", () => {
  assert.equal(toTxtFilename("report.docx"), "report.txt");
  assert.equal(toTxtFilename("draft.v2.DOCX"), "draft.v2.txt");
});

test("validates DOCX extension and file size", () => {
  assert.equal(validateFileDescriptor("report.docx", 1024), "");
  assert.equal(validateFileDescriptor("legacy.doc", 1024), "unsupported");
  assert.equal(validateFileDescriptor("large.docx", MAX_FILE_SIZE_BYTES + 1), "tooLarge");
});

test("creates unique TXT names for duplicate Word filenames", () => {
  assert.deepEqual(Array.from(createUniqueTxtFilenames(["report.docx", "report.DOCX", "report.docx"])), [
    "report.txt",
    "report-2.txt",
    "report-3.txt"
  ]);
});
