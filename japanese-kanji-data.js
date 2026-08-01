(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.JapaneseKanjiData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DATA_URL = "/data/japanese-kanji/index.json";
  let dataPromise;

  function katakanaToHiragana(value) {
    return Array.from(String(value || ""), (character) => {
      const codePoint = character.codePointAt(0);
      return codePoint >= 0x30a1 && codePoint <= 0x30f6
        ? String.fromCodePoint(codePoint - 0x60)
        : character;
    }).join("");
  }

  function normalizeReading(value) {
    return katakanaToHiragana(value)
      .normalize("NFKC")
      .toLocaleLowerCase("ja")
      .replace(/[.・\-\s]/gu, "");
  }

  function worksheetReadings(record) {
    if (!record) return [];
    const readings = [];
    if (record.onReadings?.length) readings.push(`音 ${record.onReadings.join("・")}`);
    if (record.kunReadings?.length) readings.push(`訓 ${record.kunReadings.join("・")}`);
    return readings;
  }

  function buildRecordMap(payload) {
    return new Map((payload?.records || []).map((record) => [record.character, record]));
  }

  function searchRecords(records, options = {}) {
    const query = String(options.query || "").trim();
    const normalizedQuery = normalizeReading(query);
    const queryCharacters = new Set(Array.from(query).filter((character) => /\p{Script=Han}/u.test(character)));
    const radical = Number(options.radical) || 0;
    const strokes = Number(options.strokes) || 0;
    const grade = Number(options.grade) || 0;
    const limit = Math.max(1, Math.min(200, Number(options.limit) || 80));

    return (records || [])
      .filter((record) => {
        if (radical && record.radical !== radical) return false;
        if (strokes && !record.strokeCounts?.includes(strokes)) return false;
        if (grade && record.grade !== grade) return false;
        if (!query) return radical || strokes || grade;
        if (queryCharacters.has(record.character)) return true;
        if (record.components?.some((component) => queryCharacters.has(component))) return true;
        const readings = [...(record.onReadings || []), ...(record.kunReadings || []), ...(record.nanori || [])];
        if (readings.some((reading) => normalizeReading(reading).includes(normalizedQuery))) return true;
        return record.meanings?.some((meaning) => meaning.toLocaleLowerCase("en").includes(query.toLocaleLowerCase("en")));
      })
      .sort((left, right) => {
        const leftExact = queryCharacters.has(left.character) ? 0 : 1;
        const rightExact = queryCharacters.has(right.character) ? 0 : 1;
        return leftExact - rightExact || (left.frequency || 999999) - (right.frequency || 999999) || left.character.localeCompare(right.character, "ja");
      })
      .slice(0, limit);
  }

  async function parseResponse(response, onProgress) {
    if (!response.ok) throw new Error(`Japanese Kanji data request failed: ${response.status}`);
    const total = Number(response.headers.get("content-length")) || 0;
    if (!response.body?.getReader) {
      onProgress?.({ loaded: total, total, percent: total ? 100 : 0 });
      return response.json();
    }
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress?.({ loaded, total, percent: total ? Math.round((loaded / total) * 100) : 0 });
    }
    const bytes = new Uint8Array(loaded);
    let offset = 0;
    chunks.forEach((chunk) => {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function load(options = {}) {
    if (!dataPromise) {
      const fetchFn = options.fetch || globalThis.fetch;
      if (typeof fetchFn !== "function") return Promise.reject(new Error("Fetch is unavailable"));
      dataPromise = fetchFn(DATA_URL, { cache: "force-cache" })
        .then((response) => parseResponse(response, options.onProgress))
        .catch((error) => {
          dataPromise = undefined;
          throw error;
        });
    }
    return dataPromise;
  }

  return { DATA_URL, buildRecordMap, katakanaToHiragana, load, normalizeReading, searchRecords, worksheetReadings };
});
