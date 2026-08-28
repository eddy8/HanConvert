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
- Apply these localized `<title>` length ranges:
  - English: 50-65 characters.
  - Simplified Chinese, Traditional Chinese, and Japanese: 22-35 characters.
  - Korean: 22-35 Hangul/Hanja characters.
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
- Run `node scripts/audit-static-content.mjs` after adding, removing, or substantially changing static page content.
- Run `git diff --check` before finishing.
- For UI or interaction changes, test the actual page in a browser at desktop and mobile widths. Check the console, text wrapping, overflow, layout stability, and the complete primary workflow.
- This repository has no root `package.json`; do not use `npm test` as the site test command.

## Change Discipline

- Do not remove established page content, keywords, routes, or features unless the owner explicitly requests it.
- Do not change privacy statements as a side effect of unrelated work.
- Do not add backend processing to a browser-local feature without explicit approval.
- When a required check cannot be run, state that clearly in the final report.
