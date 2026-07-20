import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_CUSTOM_DICTIONARY_ENTRIES,
  normalizeCustomDictionaryEntries,
  prepareCustomDictionaryConversion
} from "../custom-dictionary.mjs";

const OpenCCMock = {
  CustomConverter(pairs) {
    const sortedPairs = [...pairs].sort((left, right) => right[0].length - left[0].length);
    return (input) => {
      let output = "";
      let index = 0;

      while (index < input.length) {
        const pair = sortedPairs.find(([source]) => input.startsWith(source, index));
        if (pair) {
          output += pair[1];
          index += pair[0].length;
        } else {
          output += input[index];
          index += 1;
        }
      }

      return output;
    };
  }
};

test("normalizes entries, keeps the latest duplicate, and respects the limit", () => {
  const rawEntries = [
    null,
    { id: "one", source: " 软件 ", target: " 軟體 " },
    { id: "two", source: "软件", target: "軟件", enabled: false },
    ...Array.from({ length: MAX_CUSTOM_DICTIONARY_ENTRIES + 20 }, (_, index) => ({
      source: `词条${index}`,
      target: `詞條${index}`
    }))
  ];

  const entries = normalizeCustomDictionaryEntries(rawEntries);
  assert.equal(entries.length, MAX_CUSTOM_DICTIONARY_ENTRIES);
  assert.deepEqual(entries[0], { id: "two", source: "软件", target: "軟件", enabled: false });
});

test("protects custom targets from the normal conversion pass", () => {
  const prepared = prepareCustomDictionaryConversion(
    OpenCCMock,
    [
      { source: "软件", target: "軟體", enabled: true },
      { source: "JianFan.app", target: "JianFan.app", enabled: true }
    ],
    "软件、JianFan.app 和汉字"
  );
  const normalResult = prepared.text.replaceAll("汉", "漢").replaceAll("字", "字");

  assert.equal(prepared.restore(normalResult), "軟體、JianFan.app 和漢字");
});

test("uses longest custom terms first", () => {
  const prepared = prepareCustomDictionaryConversion(
    OpenCCMock,
    [
      { source: "智能", target: "智慧", enabled: true },
      { source: "人工智能", target: "AI", enabled: true }
    ],
    "人工智能和智能"
  );

  assert.equal(prepared.restore(prepared.text), "AI和智慧");
});

test("preserves private-use characters already present in the input", () => {
  const originalPrivateUseCharacter = "\uE000";
  const prepared = prepareCustomDictionaryConversion(
    OpenCCMock,
    [{ source: "软件", target: "軟體", enabled: true }],
    `${originalPrivateUseCharacter}软件`
  );

  assert.equal(prepared.restore(prepared.text), `${originalPrivateUseCharacter}軟體`);
});

test("ignores disabled custom terms", () => {
  const prepared = prepareCustomDictionaryConversion(
    OpenCCMock,
    [{ source: "软件", target: "軟體", enabled: false }],
    "软件"
  );

  assert.equal(prepared.text, "软件");
  assert.equal(prepared.restore("軟件"), "軟件");
});
