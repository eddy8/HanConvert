import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const counterSource = await readFile(new URL("../character-counter.js", import.meta.url), "utf8");
const webMcpSource = await readFile(new URL("../webmcp.js", import.meta.url), "utf8");
const context = { Intl, TextEncoder };
context.globalThis = context;
vm.runInNewContext(counterSource, context);
vm.runInNewContext(webMcpSource, context);

const { createConverterTool, createCounterTool, registerTools } = context.JianFanWebMCP;

test("exposes browser-local Chinese conversion with an explicit config", async () => {
  const calls = [];
  const tool = createConverterTool({
    JianFanAgentTools: {
      convertChineseText: async (text, config) => {
        calls.push({ text, config });
        return "繁體";
      }
    }
  });

  assert.equal(await tool.execute({ text: "繁体", config: "s2t" }), "繁體");
  assert.deepEqual(calls, [{ text: "繁体", config: "s2t" }]);
  assert.equal(tool.annotations.readOnlyHint, true);
  await assert.rejects(() => tool.execute({ text: null }), /text must be a string/);
});

test("returns a compact CJK count without echoing input text", async () => {
  const tool = createCounterTool({ CharacterCounterCore: context.CharacterCounterCore });
  const response = JSON.parse(
    await tool.execute({
      text: "汉汉字。かな 한국 A",
      locale: "zh-CN",
      excludePunctuation: true
    })
  );

  assert.equal(response.categories.han, 3);
  assert.equal(response.categories.hiragana, 2);
  assert.equal(response.categories.hangul, 2);
  assert.equal(response.topCharacters[0].character, "汉");
  assert.equal(response.topCharacters.some((item) => item.character === "。"), false);
  assert.equal("text" in response, false);
});

test("registers tools with the current document.modelContext API", async () => {
  const registered = [];
  const environment = {
    document: {
      body: { dataset: { toolPage: "character-counter" } },
      modelContext: {
        registerTool: async (tool) => registered.push(tool)
      },
      querySelector: (selector) => (selector === "#converterTitle" ? {} : null)
    }
  };

  const tools = await registerTools(environment);
  assert.deepEqual(
    Array.from(tools, (tool) => tool.name),
    ["convert_chinese_text", "count_cjk_characters"]
  );
  assert.deepEqual(
    Array.from(registered, (tool) => tool.name),
    ["convert_chinese_text", "count_cjk_characters"]
  );
});

test("keeps the deprecated navigator.modelContext fallback for early scanners", async () => {
  let provided;
  const environment = {
    document: {
      body: { dataset: {} },
      querySelector: (selector) => (selector === "#converterTitle" ? {} : null)
    },
    navigator: {
      modelContext: {
        provideContext: async (contextValue) => {
          provided = contextValue;
        }
      }
    }
  };

  await registerTools(environment);
  assert.deepEqual(
    Array.from(provided.tools, (tool) => tool.name),
    ["convert_chinese_text"]
  );
});
