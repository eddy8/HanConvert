import assert from "node:assert/strict";
import test from "node:test";
import { experimentMetadataFindings, isExperimentPage } from "../scripts/static-page-policy.mjs";

const experiment = `<html><head><title>2048</title><meta name="description" content="Play 2048 locally."><meta name="robots" content="noindex, nofollow"><link rel="canonical" href="https://jianfan.app/2048/example/"></head><body data-experiment-page="2048"></body></html>`;

test("experiments require an explicit body marker, not just a noindex tag", () => {
  assert.equal(isExperimentPage(experiment), true);
  assert.equal(isExperimentPage(experiment.replace(' data-experiment-page="2048"', "")), false);
});

test("non-indexed experiments still require accurate page metadata", () => {
  assert.deepEqual(experimentMetadataFindings("2048/example/index.html", experiment), []);
  assert.deepEqual(experimentMetadataFindings("2048\\example\\index.html", experiment), []);
  const incomplete = experiment.replace('content="noindex, nofollow"', 'content="index, follow"')
    .replace('href="https://jianfan.app/2048/example/"', 'href="https://jianfan.app/"')
    .replace('<meta name="description" content="Play 2048 locally.">', "");
  assert.deepEqual(experimentMetadataFindings("2048/example/index.html", incomplete), [
    "canonical must be https://jianfan.app/2048/example/",
    "experiment must declare noindex",
    "missing description"
  ]);
});
