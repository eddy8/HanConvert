import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const require = createRequire(import.meta.url);
require("../password-generator.js");
const core = globalThis.PasswordGeneratorCore;
const onlySymbols = { uppercase: false, lowercase: false, numbers: false, symbols: true, specialCharacters: "!?", count: 1 };

test("generates three passwords by default", () => {
  assert.equal(core.DEFAULTS.count, 3);
  assert.equal(core.createGenerator().generate(webcrypto).length, 3);
});

test("every selected character class is present after all exclusions", () => {
  const generator = core.createGenerator({ length: 16, count: 100, specialCharacters: "!@#$", excludedCharacters: "Ab2!", excludeSimilar: true, noAdjacentRepeat: true });
  const passwords = generator.generate(webcrypto);
  assert.equal(new Set(passwords).size, 100);
  for (const password of passwords) {
    assert.equal([...password].length, 16);
    for (const pattern of [/[A-Z]/u, /[a-z]/u, /[0-9]/u, /[@#$]/u]) assert.match(password, pattern);
    assert.doesNotMatch(password, /[Ab2!Il1O0o|]/u);
    assert.doesNotMatch(password, /(.)\1/u);
  }
});

test("all enabled class combinations work, including numeric-only passwords", () => {
  const keys = ["uppercase", "lowercase", "numbers", "symbols"];
  for (let mask = 1; mask < 16; mask += 1) {
    const options = Object.fromEntries(keys.map((key, bit) => [key, Boolean(mask & (1 << bit))]));
    const generator = core.createGenerator({ ...options, length: 8, count: 5 });
    for (const password of generator.generate(webcrypto)) {
      for (const group of generator.config.groups) assert.ok([...password].some((char) => group.chars.includes(char)));
      assert.ok([...password].every((char) => generator.config.groups.some((group) => group.chars.includes(char))));
    }
  }
});

test("custom Unicode symbols are deduplicated and counted by code point", () => {
  const generator = core.createGenerator({ ...onlySymbols, specialCharacters: "§§€😀", excludedCharacters: "€", length: 6, count: 2, noAdjacentRepeat: true });
  assert.equal(generator.config.poolSize, 2);
  assert.deepEqual(new Set(generator.generate(webcrypto)), new Set(["§😀§😀§😀", "😀§😀§😀§"]));
});

test("unranking covers exactly the valid space without bias or missing sequences", () => {
  const options = { uppercase: true, lowercase: false, numbers: true, symbols: false, excludedCharacters: "BCDEFGHIJKLMNOPQRSTUVWXYZ23456789", length: 4, count: 1 };
  for (const noAdjacentRepeat of [false, true]) {
    const generator = core.createGenerator({ ...options, noAdjacentRepeat });
    const expected = [];
    function walk(value) {
      if (value.length === 4) {
        if (value.includes("A") && /[01]/u.test(value) && (!noAdjacentRepeat || !/(.)\1/u.test(value))) expected.push(value);
        return;
      }
      for (const character of "A01") walk(value + character);
    }
    walk("");
    assert.equal(generator.total, BigInt(expected.length));
    const actual = Array.from({ length: Number(generator.total) }, (_, index) => generator.at(BigInt(index)));
    assert.deepEqual(new Set(actual), new Set(expected));
    assert.equal(actual.length, new Set(actual).size);
  }
});

test("a whole small space can be sampled without repeated passwords", () => {
  const generator = core.createGenerator({ ...onlySymbols, length: 2, count: 4 });
  assert.deepEqual(new Set(generator.generate(webcrypto)), new Set(["!!", "!?", "?!", "??"]));
  assert.throws(() => core.createGenerator({ ...onlySymbols, length: 8, count: 3, noAdjacentRepeat: true }).generate(webcrypto), { code: "notEnoughCombinations", available: "2" });
});

test("invalid or impossible rules fail explicitly rather than silently relaxing constraints", () => {
  for (const [options, code] of [
    [{ length: 0 }, "invalidLength"], [{ length: 129 }, "invalidLength"], [{ length: 4.5 }, "invalidLength"],
    [{ count: 0 }, "invalidCount"], [{ count: 101 }, "invalidCount"],
    [{ uppercase: false, lowercase: false, numbers: false, symbols: false }, "noGroups"],
    [{ length: 3 }, "tooShort"], [{ specialCharacters: "" }, "emptyGroup"],
    [{ specialCharacters: "a!" }, "invalidSymbols"], [{ specialCharacters: "! " }, "invalidSymbols"],
    [{ excludedCharacters: "0123456789" }, "emptyGroup"],
    [{ ...onlySymbols, specialCharacters: "!", length: 4, noAdjacentRepeat: true }, "impossibleRepeat"]
  ]) assert.throws(() => core.createGenerator(options), { code });
});

test("rejection sampling rejects out-of-range values and never falls back to insecure randomness", () => {
  let calls = 0;
  const cryptoSource = { getRandomValues(bytes) { bytes[0] = calls++ === 0 ? 255 : 9; return bytes; } };
  assert.equal(core.randomBelow(10n, cryptoSource), 9n);
  assert.equal(calls, 2);
  assert.throws(() => core.createGenerator().generate(null), { code: "cryptoUnavailable" });
  assert.throws(() => core.randomBelow(2n, {}), { code: "cryptoUnavailable" });
});

test("supports maximum length and batch size with consecutive-repeat exclusion", () => {
  const generator = core.createGenerator({ length: 128, count: 100, noAdjacentRepeat: true });
  const passwords = generator.generate(webcrypto);
  assert.equal(passwords.length, 100);
  assert.equal(new Set(passwords).size, 100);
  for (const password of passwords) { assert.equal(password.length, 128); assert.doesNotMatch(password, /(.)\1/u); }
  assert.ok(generator.entropy > 700);
});

test("static locale pages and schemas describe mandatory class coverage", async () => {
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    const html = await readFile(new URL(`../${prefix}password-generator/index.html`, import.meta.url), "utf8");
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)[1]);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/u)[1];
    const app = schema["@graph"].find((item) => item["@type"] === "WebApplication");
    assert.equal(canonical, `https://jianfan.app/${prefix}password-generator/`);
    assert.equal(app.url, canonical);
    assert.equal(schema["@graph"].find((item) => item["@type"] === "FAQPage").mainEntity.length, 6);
    assert.equal(schema["@graph"].find((item) => item["@type"] === "HowTo").step.length, 3);
    assert.equal(html.match(/hreflang=/gu).length, 6);
    assert.match(html, /src="\/password-generator\.js"/u);
    assert.doesNotMatch(html, /name="(?:requireEach|coverage)"/u);
    assert.match(html, /name="noAdjacentRepeat"/u);
    assert.match(html, /id="passwordCount"[^>]*value="3"/u);
    const homepage = await readFile(new URL(`../${prefix}index.html`, import.meta.url), "utf8");
    assert.ok(homepage.includes(`href="/${prefix}password-generator/"`));
    const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`));
  }
});
