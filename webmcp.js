(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.JianFanWebMCP = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const MAX_INPUT_CHARACTERS = 3000000;
  const CONVERSION_CONFIGS = [
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
  const LOCALES = ["zh-CN", "zh-TW", "en", "ja", "ko"];
  let registrationPromise;

  function requireText(value) {
    if (typeof value !== "string") throw new TypeError("text must be a string");
    if (value.length > MAX_INPUT_CHARACTERS) {
      throw new RangeError(`text exceeds the ${MAX_INPUT_CHARACTERS} character limit`);
    }
    return value;
  }

  function createConverterTool(environment = root) {
    return {
      name: "convert_chinese_text",
      title: "Convert Chinese text",
      description:
        "Convert Simplified Chinese, Traditional Chinese, Taiwan or Hong Kong variants, and Japanese Shinjitai or Kyujitai locally in this browser tab.",
      inputSchema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            maxLength: MAX_INPUT_CHARACTERS,
            description: "Text to convert. It stays in the current browser tab."
          },
          config: {
            type: "string",
            enum: CONVERSION_CONFIGS,
            default: "s2t",
            description: "OpenCC conversion direction."
          }
        },
        required: ["text"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true
      },
      execute: async ({ text, config = "s2t" } = {}) => {
        const agentTools = environment.JianFanAgentTools;
        if (typeof agentTools?.convertChineseText !== "function") {
          throw new Error("The browser-local conversion engine is not ready.");
        }
        return agentTools.convertChineseText(requireText(text), config);
      }
    };
  }

  function createCounterTool(environment = root) {
    return {
      name: "count_cjk_characters",
      title: "Count CJK characters",
      description:
        "Count Unicode characters, words, sentences, lines and UTF-8 bytes, with Han, kana, Hangul, Latin and frequency breakdowns, locally in this browser tab.",
      inputSchema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            maxLength: MAX_INPUT_CHARACTERS,
            description: "Chinese, Japanese, Korean or mixed-language text to analyze."
          },
          locale: {
            type: "string",
            enum: LOCALES,
            default: "zh-CN",
            description: "Locale used for word and sentence boundary detection."
          },
          excludePunctuation: {
            type: "boolean",
            default: false,
            description: "Exclude punctuation and symbols from the frequency list."
          }
        },
        required: ["text"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true
      },
      execute: async ({ text, locale = "zh-CN", excludePunctuation = false } = {}) => {
        const counter = environment.CharacterCounterCore;
        if (typeof counter?.analyzeText !== "function") {
          throw new Error("The browser-local character counter is not ready.");
        }
        const result = counter.analyzeText(requireText(text), locale);
        return JSON.stringify({
          characters: result.characters,
          charactersNoWhitespace: result.charactersNoWhitespace,
          words: result.words,
          sentences: result.sentences,
          paragraphs: result.paragraphs,
          lines: result.lines,
          bytes: result.bytes,
          uniqueCharacters: result.uniqueCharacters,
          categories: result.categories,
          topCharacters: counter.filterFrequency(result.frequency, {
            excludePunctuation: Boolean(excludePunctuation),
            limit: 20
          })
        });
      }
    };
  }

  function getApplicableTools(environment = root) {
    const document = environment.document;
    if (!document) return [];

    const tools = [];
    if (document.querySelector?.("#converterTitle")) tools.push(createConverterTool(environment));
    if (document.body?.dataset?.toolPage === "character-counter") tools.push(createCounterTool(environment));
    return tools;
  }

  async function registerTools(environment = root) {
    const tools = getApplicableTools(environment);
    if (!tools.length) return [];

    const currentContext = environment.document?.modelContext;
    if (typeof currentContext?.registerTool === "function") {
      await Promise.all(tools.map((tool) => currentContext.registerTool(tool)));
      return tools;
    }

    const legacyContext = environment.navigator?.modelContext;
    if (typeof legacyContext?.provideContext === "function") {
      await legacyContext.provideContext({ tools });
      return tools;
    }

    return [];
  }

  function autoRegister(environment = root) {
    if (!registrationPromise) {
      registrationPromise = registerTools(environment).catch((error) => {
        registrationPromise = undefined;
        environment.console?.warn?.("WebMCP tool registration failed.", error);
        return [];
      });
    }
    return registrationPromise;
  }

  if (root.document) autoRegister(root);

  return {
    CONVERSION_CONFIGS,
    LOCALES,
    MAX_INPUT_CHARACTERS,
    autoRegister,
    createConverterTool,
    createCounterTool,
    getApplicableTools,
    registerTools
  };
});
