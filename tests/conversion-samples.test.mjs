import test from "node:test";
import assert from "node:assert/strict";

import { CONVERSION_SAMPLES, getConversionSample } from "../conversion-samples.js";

const supportedConfigs = [
  "s2t",
  "t2s",
  "s2tw",
  "s2twp",
  "s2hk",
  "s2hkp",
  "tw2s",
  "tw2sp",
  "hk2s",
  "hk2sp",
  "t2tw",
  "tw2t",
  "t2hk",
  "hk2t",
  "jp2t",
  "t2jp"
];

test("provides a source-language sample for every conversion config", () => {
  assert.deepEqual(Object.keys(CONVERSION_SAMPLES).sort(), supportedConfigs.sort());
  for (const config of supportedConfigs) {
    assert.ok(getConversionSample(config).length > 20, `${config} should have a useful sample`);
  }
});

test("uses samples based on conversion direction instead of interface locale", () => {
  assert.match(getConversionSample("s2t"), /软件.*鼠标.*网络/);
  assert.match(getConversionSample("t2s"), /軟件.*鼠標.*網絡/);
  assert.match(getConversionSample("tw2s"), /軟體.*滑鼠.*網路.*計程車/);
  assert.match(getConversionSample("hk2s"), /軟件.*滑鼠.*網絡.*的士/);
});

test("uses modern and old Japanese forms for the two Japanese directions", () => {
  assert.match(getConversionSample("jp2t"), /国、学、会、広、読、気、体、戦/);
  assert.match(getConversionSample("t2jp"), /國、學、會、廣、讀、氣、體、戰/);
});

test("falls back to the Simplified Chinese sample for an unknown config", () => {
  assert.equal(getConversionSample("unknown"), getConversionSample("s2t"));
});
