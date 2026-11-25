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
    assert.equal(schema["@graph"].find((item) => item["@type"] === "FAQPage").mainEntity.length, 10);
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

const testWordlist = Array.from({ length: 7776 }, (_, index) => `w${index.toString(26).replace(/[0-9]/gu, (digit) => "abcdefghij"[digit])}`);

test("memorable passphrases use whole words, the chosen separator and the exact entropy", () => {
  const generator = core.createPassphraseGenerator({ words: 5, count: 20, separator: "-", capitalize: true, includeNumber: true }, testWordlist);
  assert.ok(Math.abs(generator.entropy - (5 * Math.log2(7776) + Math.log2(50))) < 1e-9);
  const passphrases = generator.generate(webcrypto);
  assert.equal(new Set(passphrases).size, 20);
  for (const passphrase of passphrases) {
    const words = passphrase.split("-");
    assert.equal(words.length, 5);
    assert.equal(words.filter((word) => /\d$/u.test(word)).length, 1);
    for (const word of words) assert.match(word, /^[A-Z][a-z]+\d?$/u);
  }
  const plain = core.createPassphraseGenerator({ words: 6, count: 1, separator: " ", capitalize: false, includeNumber: false }, testWordlist);
  assert.ok(Math.abs(plain.entropy - 6 * Math.log2(7776)) < 1e-9);
  assert.match(plain.generate(webcrypto)[0], /^[a-z]+(?: [a-z]+){5}$/u);
  assert.throws(() => core.createPassphraseGenerator({ words: 2 }, testWordlist), { code: "invalidWords" });
  assert.throws(() => core.createPassphraseGenerator({ separator: "/" }, testWordlist), { code: "invalidSeparator" });
  assert.throws(() => core.createPassphraseGenerator({}, ["a", "b"]), { code: "wordlistFailed" });
});

test("loads the EFF wordlist from a pinned CDN build with SRI", async () => {
  assert.equal(core.WORDLIST.url, "https://cdn.jsdmirror.cn/npm/@wordlist/english-eff@1.0.1/dist/data/long.json");
  assert.match(core.WORDLIST.integrity, /^sha384-[A-Za-z0-9+/]{64}$/u);
  const source = await readFile(new URL("../password-generator.js", import.meta.url), "utf8");
  assert.match(source, /fetch\(core\.WORDLIST\.url, \{ integrity: core\.WORDLIST\.integrity/u);
});

test("reads pasted site password rules in all five interface languages", () => {
  const cases = [
    ["新密码:6-16位的小写字母+数字组合", { length: 16, uppercase: false, lowercase: true, numbers: true, symbols: false }],
    ["密码长度8~20位，须包含大小写字母、数字和特殊字符", { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true }],
    ["密码为6位纯数字", { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false }],
    ["至少8位，不能包含特殊字符", { length: 20, symbols: false }],
    ["8-16碼，須包含英文字母與數字", { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: false }],
    ["Password must be 8-64 characters and include at least one uppercase letter, one lowercase letter, one number and one special character (!@#$%^&*)", { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true, specialCharacters: "!@#$%^&*" }],
    ["At least 12 characters, no symbols", { length: 20, symbols: false }],
    ["半角英数字8文字以上16文字以内", { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: false }],
    ["パスワードは数字のみ4桁", { length: 4, uppercase: false, lowercase: false, numbers: true, symbols: false }],
    ["영문, 숫자, 특수문자 조합 8~16자", { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true }],
    ["特殊字符仅限 ~!@#$%^&*，长度10-20位，需包含大写字母、小写字母、数字", { length: 20, specialCharacters: "~!@#$%^&*" }],
    ["允许的符号：!@#$%^&*()_+", { symbols: true, specialCharacters: "!@#$%^&*()_+" }]
  ];
  for (const [text, expected] of cases) {
    const parsed = core.parseRequirements(text);
    for (const [key, value] of Object.entries(expected)) assert.equal(parsed[key], value, `${text} → ${key}`);
  }
  assert.equal(core.parseRequirements("允许的符号：!@#$%^&*()_+").uppercase, undefined);
  assert.equal(core.parseRequirements("hello world"), null);
});

test("pages offer the memorable-word mode, pasted rules and the PIN preset in every locale", async () => {
  for (const prefix of ["", "zh-tw/", "en/", "ja/", "ko/"]) {
    const html = await readFile(new URL(`../${prefix}password-generator/index.html`, import.meta.url), "utf8");
    assert.match(html, /data-password-mode="characters"[\s\S]*data-password-mode="words"/u, prefix || "zh-CN");
    assert.match(html, /id="passwordRules" type="text"/u);
    assert.match(html, /data-password-preset="pin"/u);
    assert.match(html, /id="passwordWords" name="words" type="number" min="3" max="12" value="5"/u);
    assert.match(html, /<select id="passwordSeparator" name="separator">/u);
    assert.match(html, /NIST SP 800-63B-4/u);
    const messages = JSON.parse(html.match(/<script type="application\/json" id="passwordMessages">([\s\S]*?)<\/script>/u)[1]);
    for (const key of ["wordlistLoading", "wordsSummary", "rulesApplied", "rulesNotFound"]) assert.ok(messages[key], `${prefix} ${key}`);
    for (const key of ["invalidWords", "invalidSeparator", "wordlistFailed"]) assert.ok(messages.errors[key], `${prefix} ${key}`);
  }
});
