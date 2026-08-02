(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KoreanHanjaData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CHARACTER_URL = "/data/korean-hanja/index.json";
  const WORD_URL = "/data/korean-hanja/words.json";
  const NAME_URL = "/data/korean-hanja/name-use.json";
  const HAN_PATTERN = /^\p{Script=Han}$/u;
  const HANGUL_PATTERN = /^[가-힣]$/u;
  let characterPromise;
  let wordPromise;
  let namePromise;

  async function parseResponse(response, onProgress) {
    if (!response.ok) throw new Error(`Korean Hanja data request failed: ${response.status}`);
    const total = Number(response.headers.get("content-length")) || 0;
    if (!response.body?.getReader) return response.json();
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
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function loadUrl(url, currentPromise, onProgress, fetchFn = globalThis.fetch) {
    if (currentPromise) return currentPromise;
    if (typeof fetchFn !== "function") return Promise.reject(new Error("Fetch is unavailable"));
    return fetchFn(url, { cache: "no-cache" }).then((response) => parseResponse(response, onProgress));
  }

  function loadCharacters(options = {}) {
    if (!characterPromise) {
      characterPromise = loadUrl(CHARACTER_URL, characterPromise, options.onProgress, options.fetch)
        .catch((error) => {
          characterPromise = undefined;
          throw error;
        });
    }
    return characterPromise;
  }

  function loadWords(options = {}) {
    if (!wordPromise) {
      wordPromise = loadUrl(WORD_URL, wordPromise, options.onProgress, options.fetch)
        .catch((error) => {
          wordPromise = undefined;
          throw error;
        });
    }
    return wordPromise;
  }

  function loadNames(options = {}) {
    if (!namePromise) {
      namePromise = loadUrl(NAME_URL, namePromise, options.onProgress, options.fetch)
        .catch((error) => {
          namePromise = undefined;
          throw error;
        });
    }
    return namePromise;
  }

  function buildRecordMap(payload) {
    return new Map((payload?.records || []).map((record) => [record.character, record]));
  }

  function normalizeKorean(value) {
    return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("ko");
  }

  function searchRecords(records, options = {}) {
    const query = normalizeKorean(options.query);
    const radical = String(options.radical || "");
    const strokes = Number(options.strokes) || 0;
    const nameOnly = Boolean(options.nameOnly);
    const limit = Math.max(1, Math.min(200, Number(options.limit) || 80));
    return (records || [])
      .filter((record) => {
        if (nameOnly && !record.nameUse) return false;
        if (radical && record.radical !== radical) return false;
        if (strokes && record.strokes !== strokes) return false;
        if (!query) return nameOnly || radical || strokes;
        if (record.character === query) return true;
        if (record.readings?.some((reading) => reading.includes(query))) return true;
        if (record.nameReadings?.some((reading) => reading.includes(query))) return true;
        if (record.glosses?.some((gloss) => normalizeKorean(gloss).includes(query))) return true;
        return normalizeKorean(record.definition).includes(query);
      })
      .sort((left, right) => {
        const leftExact = left.character === query || left.readings?.includes(query) ? 0 : 1;
        const rightExact = right.character === query || right.readings?.includes(query) ? 0 : 1;
        const leftName = left.nameUse ? 0 : 1;
        const rightName = right.nameUse ? 0 : 1;
        return leftExact - rightExact || leftName - rightName || (left.strokes || 99) - (right.strokes || 99) || left.character.localeCompare(right.character, "ko");
      })
      .slice(0, limit);
  }

  function longestMatch(text, start, maximumLength, lookup) {
    const characters = Array.from(text);
    for (let length = Math.min(maximumLength, characters.length - start); length > 0; length -= 1) {
      const token = characters.slice(start, start + length).join("");
      const value = lookup(token);
      if (value) return { token, value, length };
    }
    return null;
  }

  function convertHangulToHanja(text, words, options = {}) {
    const input = String(text || "");
    const characters = Array.from(input);
    const mode = options.mode || "replace";
    const selections = options.selections || {};
    const allowSingleCharacter = characters.length === 1 && HANGUL_PATTERN.test(characters[0]);
    const choices = [];
    let output = "";
    for (let index = 0; index < characters.length;) {
      if (!HANGUL_PATTERN.test(characters[index])) {
        output += characters[index];
        index += 1;
        continue;
      }
      const match = longestMatch(input, index, 8, (token) => words?.[token]);
      if (!match) {
        output += characters[index];
        index += 1;
        continue;
      }
      if (match.length === 1 && !allowSingleCharacter) {
        output += characters[index];
        index += 1;
        continue;
      }
      const selected = match.value.length === 1
        ? match.value[0]
        : match.value.includes(selections[match.token])
          ? selections[match.token]
          : match.token;
      output += selected === match.token
        ? match.token
        : mode === "parentheses"
          ? `${match.token}(${selected})`
          : selected;
      choices.push({ source: match.token, selected, candidates: match.value });
      index += match.length;
    }
    return { output, choices };
  }

  function buildReverseWords(words) {
    const reverse = new Map();
    for (const [hangul, candidates] of Object.entries(words || {})) {
      for (const hanja of candidates) {
        const current = reverse.get(hanja);
        if (!current || normalizeInitialSoundLaw(current) === hangul) reverse.set(hanja, hangul);
      }
    }
    return reverse;
  }

  function normalizeInitialSoundLaw(word) {
    const characters = Array.from(String(word || ""));
    if (!characters.length) return "";
    const codePoint = characters[0].codePointAt(0);
    if (codePoint < 0xac00 || codePoint > 0xd7a3) return characters.join("");
    const syllableIndex = codePoint - 0xac00;
    const initial = Math.floor(syllableIndex / 588);
    const vowel = Math.floor((syllableIndex % 588) / 28);
    const iOrYVowels = new Set([2, 3, 6, 7, 12, 17, 20]);
    let normalizedInitial = initial;
    if (initial === 5) normalizedInitial = iOrYVowels.has(vowel) ? 11 : 2;
    if (initial === 2 && iOrYVowels.has(vowel)) normalizedInitial = 11;
    if (normalizedInitial === initial) return characters.join("");
    characters[0] = String.fromCodePoint(0xac00 + normalizedInitial * 588 + (syllableIndex % 588));
    return characters.join("");
  }

  function convertHanjaToHangul(text, reverseWords, options = {}) {
    const input = String(text || "");
    const characters = Array.from(input);
    const mode = options.mode || "replace";
    let output = "";
    for (let index = 0; index < characters.length;) {
      if (!HAN_PATTERN.test(characters[index])) {
        output += characters[index];
        index += 1;
        continue;
      }
      const match = longestMatch(input, index, 8, (token) => reverseWords?.get(token));
      if (!match) {
        output += characters[index];
        index += 1;
        continue;
      }
      output += mode === "parentheses" ? `${match.token}(${match.value})` : match.value;
      index += match.length;
    }
    return output;
  }

  return {
    CHARACTER_URL,
    NAME_URL,
    WORD_URL,
    buildRecordMap,
    buildReverseWords,
    convertHangulToHanja,
    convertHanjaToHangul,
    loadCharacters,
    loadNames,
    loadWords,
    normalizeInitialSoundLaw,
    normalizeKorean,
    searchRecords
  };
});
