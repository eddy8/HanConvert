import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../japanese-reading-client.js", import.meta.url), "utf8");

class FakeWorker {
  constructor(path) {
    this.path = path;
    this.listeners = new Map();
    this.messages = [];
    this.terminated = false;
    FakeWorker.instance = this;
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  postMessage(message) {
    this.messages.push(message);
  }

  emit(type, data) {
    this.listeners.get(type)?.({ data });
  }

  terminate() {
    this.terminated = true;
  }
}

const context = { Worker: FakeWorker };
context.globalThis = context;
vm.runInNewContext(source, context);

test("sends conversion work to the shared Japanese reading worker", async () => {
  const client = context.JapaneseReadingClient.createClient();
  const progress = [];
  const promise = client.convert(
    { value: "日本語", format: "hiragana", dictionaryPaths: ["https://example.test/dict/"] },
    (value) => progress.push(value)
  );
  const request = FakeWorker.instance.messages[0];

  assert.equal(FakeWorker.instance.path, "/japanese-reading-worker.js");
  assert.equal(request.value, "日本語");
  FakeWorker.instance.emit("message", {
    type: "progress",
    id: request.id,
    progress: { stage: "dictionary", completed: 3, total: 12 }
  });
  FakeWorker.instance.emit("message", { type: "result", id: request.id, result: "にほんご" });

  assert.equal(await promise, "にほんご");
  assert.equal(progress[0].completed, 3);
  client.close();
  assert.equal(FakeWorker.instance.terminated, true);
});

test("rejects a worker error with its public error code", async () => {
  const client = context.JapaneseReadingClient.createClient();
  const promise = client.convert({ value: "漢字", format: "furigana" });
  const request = FakeWorker.instance.messages[0];
  FakeWorker.instance.emit("message", {
    type: "error",
    id: request.id,
    code: "DICTIONARY_UNAVAILABLE",
    message: "dictionary failed"
  });

  await assert.rejects(promise, (error) => error.code === "DICTIONARY_UNAVAILABLE");
});

test("pins the documented Kuroshiro, analyzer, and Kuromoji dictionary files", async () => {
  const workerSource = await readFile(new URL("../japanese-reading-worker.js", import.meta.url), "utf8");
  assert.match(workerSource, /kuroshiro@1\.2\.0/);
  assert.match(workerSource, /kuroshiro-analyzer-kuromoji@1\.1\.0/);
  assert.match(workerSource, /base\.dat\.gz/);
  assert.match(workerSource, /unk_pos\.dat\.gz/);
  assert.doesNotMatch(workerSource, /\?v=/);
});
