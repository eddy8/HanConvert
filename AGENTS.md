# JianFan.app Repository Instructions

## Project Scope

- This repository is a static, browser-first collection of Chinese, Japanese, and Korean character tools.
- Simplified Chinese uses the site root. Other locales use `/zh-tw/`, `/en/`, `/ja/`, and `/ko/`.
- Desktop browsers are the primary usage environment, but every public page must remain usable on mobile.
- Prefer client-side processing. Clearly disclose any feature that sends data to a remote API.

## Localization

- Write the initial visible copy and SEO content directly into every localized static `index.html` file. Do not rely on JavaScript to translate or replace it after page load.
- Keep shared static HTML, `app.js` localization data, structured data, and related tests in sync.
- Use natural, locally familiar wording. Do not translate SEO keywords or interface copy literally when that would sound unnatural.
- Before creating or substantially optimizing a feature page, research real search terminology and relevant competitors for each target market.
- Conversion examples must match the selected conversion direction and source script, not the interface language.

## SEO Requirements

- Every public tool must have complete localized pages for all five supported locales unless the owner explicitly limits its market.
- Add or verify the canonical URL, all `hreflang` alternates, `x-default`, localized structured data, sitemap entry, and crawlable internal links. Use `zh-Hans` for Simplified Chinese and `zh-Hant` for Traditional Chinese; reserve `zh-CN` for HTML `lang`, application locale identifiers, and structured-data language values where appropriate.
- Apply these localized `<title>` length ranges (sized so the core term stays visible before search engines truncate the title at roughly 600px):
  - English: 30-60 characters.
  - Simplified Chinese, Traditional Chinese, and Japanese: 10-30 characters.
  - Korean: 10-34 characters, because word spaces render narrower than Hangul.
- Treat the minimum as a floor against empty titles, not a target. A short, exact title such as `簡体字 繁体字 変換ツール` is better than a padded one.
- Measure these localized `<title>` ranges only from the page-specific text before the fixed ` | JianFan.app` suffix. The brand suffix does not consume the localized title-length budget.
- Keep the complete `<title>`, including the brand suffix, at no more than 90 visible Unicode characters.
- Derive every new or modified page title in this order:
  - Put the highest-volume, most precise core search term first.
  - Optionally add a useful long-tail search need after ` - ` only when it naturally covers a distinct secondary search intent.
  - End with the exact official brand suffix ` | JianFan.app` so titles remain consistent across the site.
- Use either `Core keyword | JianFan.app` or `Core keyword - Long-tail need | JianFan.app`. The long-tail segment is optional, not a required title component; never invent one merely to reach a length target. Never remove or alter the brand suffix to meet a length limit; shorten lower-priority wording instead.
- Do not replace an established broad core keyword with a narrower long-tail phrase merely to satisfy the length range. Preserve the exact high-value core term first, then shorten or remove lower-priority qualifiers.
- Apply these localized meta description length ranges:
  - English: 120-160 characters.
  - Simplified Chinese, Traditional Chinese, and Japanese: 65-90 characters.
  - Korean: 65-90 Hangul/Hanja characters.
- Measure metadata length from the final visible Unicode text with `[...value].length`, including spaces and punctuation. Do not pad copy unnaturally merely to reach a range.
- Put the core search term and the main reason to click (free, no upload, the specific result the user gets) in the first 50 characters of a CJK description or the first 100 characters of an English description, because search engines truncate snippets.
- Write the sitemap `<lastmod>` only from the date a page's visible content actually changed. Never bulk-refresh it, and never leave it stale after a real content change.

## Data-Driven SEO Workflow

- Base keyword and page decisions on real data, and use each source for what it can show:
  - Market demand decides which terms a page should target. Find it with search-engine autocomplete and related searches (Baidu, Bing, Google, Naver, and Yahoo! JAPAN for each market), keyword tools, and the wording of competitor pages that rank for the target query.
  - Google Search Console and Bing Webmaster Tools data for this site decide priorities and measure results: snippet fixes, striking-distance queries, and before/after attribution. Bing currently sends far more traffic than Google, and its data also reflects Copilot and ChatGPT search visibility.
- Search-console data shows only queries the site already ranks for. A term missing from it is not evidence that nobody searches for it. The page may be unindexed, the term may be absent from the Title and copy, or the page may rank too low to receive impressions. Never drop a term with clear demand elsewhere, or decline to target it, only because the site's own data lacks it.
- Study the pages that rank above JianFan.app for a target query. Identify the user pain points they answer and the ones they miss, and cover the missing ones with working tool features or concrete answers, not paraphrased copy.
- Serve long-tail and audience-specific queries in the existing page's overview and FAQ first. Create a new page only when the intent is clearly distinct (a different task, audience, or result), search data shows demand, and the page can provide unique, useful content beyond a template swap.
- Gate page growth on indexing health. While Google indexes fewer than about half of the sitemap URLs, do not add batches of generated pages. Improve, merge, or `noindex` thin pages first.
- Every generated page must pass a uniqueness bar: a distinct primary query, a distinct overview, at least several page-specific FAQ answers, and working examples that match the page's intent.
- Review search data regularly. Prioritize pages with high impressions and low CTR (snippet problem) and pages ranking in positions 4-15 (content and internal-link problem). Diagnose pages that are crawled but not indexed or discovered but not indexed, then improve, consolidate, or remove them.
- Keep search-data snapshots in the git-ignored `.seo-data/<YYYY-MM-DD>/` folder, never in published paths. Pull Bing data with `node scripts/seo-fetch-bing.mjs` (API key in `BING_WEBMASTER_API_KEY` or `.seo-data/bing-api-key`; never commit, log, or paste the key). Save the Search Console tables there in the formats described in `scripts/seo-import-snapshot.mjs`, then run `node scripts/seo-import-snapshot.mjs <date>` and `node scripts/seo-report.mjs`. The report lists snippet fixes, striking-distance queries, pages proven on Bing but missing from Google, sections with no visibility, and before/after metrics for pages changed since the previous snapshot.
- Optimize for AI answer engines (GEO) as well as rankings. Microsoft Copilot, ChatGPT search, Perplexity, and similar engines quote pages that state answers directly. Every high-traffic tool page should open its explanatory content with a one- or two-sentence direct answer. It should include concrete, verifiable facts and examples (character mappings, regional vocabulary, standards, limits) and carry a visible FAQ with matching `FAQPage` structured data in all five locales.
- The Simplified/Traditional converter pages (home, simplified-to-traditional, traditional-to-simplified, taiwan-traditional, hong-kong-traditional) render their FAQ from `scripts/converter-faq-data.mjs`. Edit that file, run `node scripts/sync-converter-faq.mjs`, and verify every conversion example in the live converter before publishing it. `node --test` runs the script's `--check`.
- Track GEO in Bing Webmaster Tools "AI Performance". Save grounding queries as `bing-ai-queries.tsv` (query, citations, share) and cited pages as `bing-ai-pages.tsv` in each snapshot. Prioritize queries with many citations but a low citation share.
- Keep `llms.txt` generated: run `node scripts/generate-llms-txt.mjs` after adding a tool or changing English titles or descriptions. `node --test` runs its `--check`. Do not block AI search or answer crawlers in `robots.txt` or at the CDN; the `Content-Signal` header already permits search and AI input.
- After deploying content changes, run `node scripts/submit-indexnow.mjs --dry-run`, then submit without `--dry-run` so Bing and other IndexNow engines recrawl the changed URLs. Never change or remove the root IndexNow key file.
- Preserve useful existing keywords when optimizing a page. Add missing search intent naturally instead of replacing established coverage or stuffing keywords.
- Keep Title, meta description, H1, introductory copy, FAQ, and structured data aligned with the page's actual primary function.
- After adding a feature, review whether related pages, navigation, sitemap, structured data, or SEO copy also need updates.
- Do not create query-parameter duplicates as indexable landing pages when a clean directory URL exists.
- The page's meta title should be highly consistent in theme with the H1 heading on the page.

## Static Assets and Dependencies

- Do not append version query parameters such as `?v=` or `?version=` to static asset URLs.
- CDN dependencies are allowed. Do not replace a valid CDN integration merely because a local development browser blocks it.
- Before using an external library, read its current official documentation and verify that the required API and exports actually exist. Do not implement from memory or assumptions.
- Browser entry modules must use hosting-portable MIME types and file extensions. Do not import local `.mjs` files from public browser entry points.
- Prefer mature open-source libraries for established parsing, conversion, handwriting, typography, and document-processing behavior.
- Avoid adding large generated files or binary assets without first confirming that they are intentional and necessary.

## Implementation Rules

- Keep the core tool visible and usable without unnecessary scrolling on common desktop viewports.
- Preserve the existing wide, compact, work-focused interface unless a task explicitly changes the design direction.
- Do not expose implementation details that non-technical users do not need.
- Process very long conversion input in bounded chunks so OpenCC/Wasm cannot exhaust memory. Apply user-facing size limits where needed.
- Validate all generated paths and localized links. Temporary directory names and placeholder URLs must never ship.
- Keep changes scoped and preserve unrelated user modifications in a dirty worktree.

## Verification

- Reproduce reported bugs through the real user workflow before changing code whenever feasible.
- Run `node --check <edited-file.js>` for each edited JavaScript entry file.
- Run the complete repository test suite with `node --test`.
- Run `node scripts/validate-seo.mjs` after changing HTML, routes, localization, metadata, structured data, internal links, or the sitemap.
- Run `node scripts/sync-sitemap-lastmod.mjs` after changing any page's title, meta description, or main content. It dates only pages whose indexable content changed; `node --test` runs its `--check`.
- For metadata-only changes, edit the source module and replace the exact old text in the affected HTML instead of rerunning full generators, because most generators and sync scripts do not reproduce the committed formatting. Only scripts that document `--check` can verify themselves.
- Run `node scripts/audit-static-content.mjs` after adding, removing, or substantially changing static page content.
- Every page carries the categorized tool directory from `scripts/site-tool-directory-data.mjs` (in the footer, and below the converter on the five home pages). The same script writes in-copy links from `scripts/contextual-tool-links-data.mjs`: when page copy tells the reader to use another tool, add a rule there instead of hand-editing the HTML. After adding a tool or page, add the tool to the directory data in all five locales and run `node scripts/sync-site-tool-directory.mjs`. `node --test` runs its `--check`; generators that write pages should pass their output through `withSiteDirectory`.
- Run `git diff --check` before finishing.
- For UI or interaction changes, test the actual page in a browser at desktop and mobile widths. Check the console, text wrapping, overflow, layout stability, and the complete primary workflow.
- This repository has no root `package.json`; do not use `npm test` as the site test command.

## Change Discipline

- Do not remove established page content, keywords, routes, or features unless the owner explicitly requests it.
- Do not change privacy statements as a side effect of unrelated work.
- Do not add backend processing to a browser-local feature without explicit approval.
- When a required check cannot be run, state that clearly in the final report.
