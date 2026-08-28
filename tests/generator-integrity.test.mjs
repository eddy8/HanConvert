import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const script of [
  "scripts/generate-direction-pages.mjs",
  "scripts/generate-kanji-to-romaji-pages.mjs",
  "scripts/generate-word-to-txt-pages.mjs"
]) {
  test(`${script} preserves current canonical URLs, structured data, and navigation`, async () => {
    const result = await execFileAsync(process.execPath, [script, "--check"], { cwd: projectRoot });
    assert.equal(result.stderr, "");
  });
}
