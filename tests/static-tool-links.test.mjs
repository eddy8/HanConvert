import assert from "node:assert/strict";
import test from "node:test";
import { preserveSupplementalToolLinks } from "../scripts/static-tool-links.mjs";

test("keeps synchronized links and guide content through repeated generation", () => {
  const generated = '<main><nav class="landing-links"><a href="/tool/">Updated name</a><a href="/new/">New tool</a></nav>\n</main>';
  const existing = '<main><nav class="landing-links"><a href="/tool/">Old name</a><a href="/extra/">Extra tool</a><!-- lookup-link:start --><a href="/lookup/">Lookup</a><!-- lookup-link:end --></nav><!-- blog-guide-links:start --><section>Guide</section><!-- blog-guide-links:end -->\n</main>';
  const result = preserveSupplementalToolLinks(generated, existing);
  assert.match(result, /Updated name/);
  assert.doesNotMatch(result, /Old name/);
  assert.equal((result.match(/href="\/tool\/"/g) || []).length, 1);
  assert.match(result, /href="\/new\/"/);
  assert.match(result, /href="\/extra\/"/);
  assert.match(result, /<!-- lookup-link:start -->/);
  assert.match(result, /<section>Guide<\/section>/);
  assert.equal(preserveSupplementalToolLinks(generated, result), result);
});

test("retains every link when a template overlaps part of a synchronized group", () => {
  const generated = '<nav class="landing-links"><a href="/first/">Updated first</a></nav>';
  const existing = '<nav class="landing-links"><!-- tools:start --><a href="/first/">First</a><a href="/second/">Second</a><!-- tools:end --></nav>';
  const result = preserveSupplementalToolLinks(generated, existing);
  assert.equal((result.match(/href="\/first\/"/g) || []).length, 1);
  assert.equal((result.match(/href="\/second\/"/g) || []).length, 1);
  assert.match(result, /Updated first/);
  assert.equal(preserveSupplementalToolLinks(generated, result), result);
});
