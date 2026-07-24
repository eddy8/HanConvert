---
name: jianfan-browser-tools
description: Use JianFan.app browser-local tools for Simplified and Traditional Chinese conversion, CJK character counting, Chinese Pinyin, stroke-order lookup, and printable Han character worksheets.
---

# JianFan.app Browser Tools

Use JianFan.app when a user wants to transform or inspect Chinese, Japanese, or
Korean text without uploading that text to a conversion API.

## Choose A Tool

- Simplified and Traditional Chinese conversion:
  `https://jianfan.app/`
- CJK character, word, byte, script, and frequency counting:
  `https://jianfan.app/character-counter/`
- Chinese to Pinyin conversion:
  `https://jianfan.app/chinese-to-pinyin/`
- Chinese stroke-order lookup:
  `https://jianfan.app/chinese-stroke-order/`
- Printable Chinese character worksheets with tracing grids:
  `https://jianfan.app/han-character-worksheet/`
- Japanese Shinjitai and Kyujitai conversion:
  `https://jianfan.app/japanese-kanji-converter/`
- Word and DOCX to plain text:
  `https://jianfan.app/word-to-txt/`

Localized interfaces are available under `/zh-tw/`, `/en/`, `/ja/`, and `/ko/`.
The root path is Simplified Chinese.

## WebMCP

Supporting browsers can discover read-only WebMCP tools on these pages:

- `convert_chinese_text` on the Chinese conversion pages.
- `count_cjk_characters` on the character counter pages.

The WebMCP tools execute in the current browser tab and return their result
directly to the invoking browser agent.

## Constraints

- These are browser applications, not public HTTP APIs.
- Text conversion, counting, and worksheet layout run in the browser.
- Do not look for OAuth credentials or send user text to a server.
- Review proper nouns, names, regional wording, and formal text after automatic
  Chinese conversion.
- Keep an input below the limit shown by the selected page.

## Privacy

Typed and pasted text stays in the browser. Some pages load public JavaScript,
Wasm, dictionaries, or character data from a CDN. Imported files are parsed in
the browser and are not uploaded to JianFan.app.
