(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KoreanHanjaData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CHARACTER_URL = "/data/korean-hanja/index.json";
  const WORD_URL = "/data/korean-hanja/words.json";
  const REVERSE_WORD_URL = "/data/korean-hanja/reverse-words.json";
  const NAME_URL = "/data/korean-hanja/name-use.json";
  const PERSONAL_DICTIONARY_STORAGE_KEY = "jianfan-korean-hanja-dictionary-v1";
  const MAX_PERSONAL_DICTIONARY_ENTRIES = 200;
  const MAX_PERSONAL_DICTIONARY_TERM_LENGTH = 80;
  const HAN_PATTERN = /^\p{Script=Han}$/u;
  const HANGUL_PATTERN = /^[가-힣]$/u;
  const HAN_CONTENT_PATTERN = /\p{Script=Han}/u;
  const HANGUL_CONTENT_PATTERN = /[가-힣]/u;
  let characterPromise;
  let wordPromise;
  let reverseWordPromise;
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

  function loadReverseWords(options = {}) {
    if (!reverseWordPromise) {
      reverseWordPromise = loadUrl(REVERSE_WORD_URL, reverseWordPromise, options.onProgress, options.fetch)
        .catch((error) => {
          reverseWordPromise = undefined;
          throw error;
        });
    }
    return reverseWordPromise;
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

  function buildCandidateDetails(choice, candidate, records) {
    const recordMap = records instanceof Map ? records : buildRecordMap(records);
    const hanja = choice?.direction === "hanja-to-hangul" ? String(choice.source || "") : String(candidate || "");
    const hangul = choice?.direction === "hanja-to-hangul" ? String(candidate || "") : String(choice?.source || "");
    const hanjaCharacters = Array.from(hanja);
    const hangulCharacters = Array.from(hangul);
    const alignReadings = hanjaCharacters.length === hangulCharacters.length;
    const items = hanjaCharacters.map((character, index) => {
      const record = recordMap.get(character);
      const reading = alignReadings ? hangulCharacters[index] : "";
      const readingIndex = reading ? record?.readings?.indexOf(reading) ?? -1 : -1;
      const glossGroup = readingIndex >= 0 ? record?.glosses?.[readingIndex] : record?.glosses?.[0];
      const gloss = String(glossGroup || "").split(/\s*,\s*/u)[0];
      return {
        character,
        reading: reading || record?.readings?.[0] || "",
        gloss,
        radical: record?.radical || "",
        strokes: Number(record?.strokes) || 0
      };
    });
    return {
      items,
      summary: items.map((item) => `${item.character} ${item.gloss || item.reading}`.trim()).join(" · ")
    };
  }

  function normalizePersonalDictionaryEntries(value) {
    if (!Array.isArray(value)) return [];
    const entries = [];
    const hangulIndexes = new Map();
    for (const rawEntry of value) {
      if (!rawEntry || typeof rawEntry !== "object") continue;
      const hangul = String(rawEntry.hangul || "").normalize("NFC").trim();
      const hanja = String(rawEntry.hanja || "").normalize("NFC").trim();
      if (!hangul || !hanja || !HANGUL_CONTENT_PATTERN.test(hangul) || !HAN_CONTENT_PATTERN.test(hanja)) continue;
      if (Array.from(hangul).length > MAX_PERSONAL_DICTIONARY_TERM_LENGTH || Array.from(hanja).length > MAX_PERSONAL_DICTIONARY_TERM_LENGTH) continue;
      const entry = {
        id: typeof rawEntry.id === "string" && rawEntry.id ? rawEntry.id : `korean-dictionary-${entries.length + 1}`,
        hangul,
        hanja,
        enabled: rawEntry.enabled !== false
      };
      if (hangulIndexes.has(hangul)) {
        entries[hangulIndexes.get(hangul)] = entry;
        continue;
      }
      hangulIndexes.set(hangul, entries.length);
      entries.push(entry);
      if (entries.length >= MAX_PERSONAL_DICTIONARY_ENTRIES) break;
    }
    return entries;
  }

  function buildPersonalWords(entries) {
    const words = Object.create(null);
    for (const entry of normalizePersonalDictionaryEntries(entries)) {
      if (entry.enabled) words[entry.hangul] = [entry.hanja];
    }
    return words;
  }

  function buildPersonalReverseWords(entries) {
    const reverse = new Map();
    for (const entry of normalizePersonalDictionaryEntries(entries)) {
      if (!entry.enabled) continue;
      const readings = reverse.get(entry.hanja) || [];
      const reading = normalizeInitialSoundLaw(entry.hangul);
      if (!readings.includes(reading)) readings.push(reading);
      reverse.set(entry.hanja, readings);
    }
    return reverse;
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

  function createChoiceId(direction, start, length, source) {
    return `${direction}:${start}:${start + length}:${source}`;
  }

  function getOptionValue(options, key) {
    if (options instanceof Map) return options.get(key);
    return Object.prototype.hasOwnProperty.call(options || {}, key) ? options[key] : undefined;
  }

  function resolveChoice(candidates, selections, id, source) {
    if (candidates.length === 1) return { selected: candidates[0], resolved: true };
    const occurrenceSelection = getOptionValue(selections, id);
    const legacySelection = occurrenceSelection === undefined ? getOptionValue(selections, source) : undefined;
    const requested = occurrenceSelection === undefined ? legacySelection : occurrenceSelection;
    if (requested === source) return { selected: source, resolved: true };
    if (candidates.includes(requested)) return { selected: requested, resolved: true };
    return { selected: source, resolved: false };
  }

  function findSplitRange(splitRanges, characters, index) {
    const ranges = splitRanges instanceof Map
      ? [...splitRanges.values()]
      : Array.isArray(splitRanges)
        ? splitRanges
        : Object.values(splitRanges || {});
    return ranges.find((range) => {
      if (!range || index < range.start || index >= range.end) return false;
      return characters.slice(range.start, range.end).join("") === range.source;
    });
  }

  function formatConversion(source, selected, mode, direction) {
    if (selected === source) return source;
    if (mode === "parentheses") return `${source}(${selected})`;
    const hangul = direction === "hangul-to-hanja" ? source : selected;
    const hanja = direction === "hangul-to-hanja" ? selected : source;
    if (mode === "hangul-hanja") return `${hangul}(${hanja})`;
    if (mode === "hanja-hangul") return `${hanja}(${hangul})`;
    return selected;
  }

  function convertHangulToHanja(text, words, options = {}) {
    const input = String(text || "");
    const characters = Array.from(input);
    const mode = options.mode || "replace";
    const selections = options.selections || {};
    const personalWords = options.personalWords || {};
    const allowSingleCharacter = characters.length === 1 && HANGUL_PATTERN.test(characters[0]);
    const choices = [];
    let output = "";
    for (let index = 0; index < characters.length;) {
      if (!HANGUL_PATTERN.test(characters[index])) {
        output += characters[index];
        index += 1;
        continue;
      }
      const splitRange = findSplitRange(options.splitRanges, characters, index);
      const maximumLength = splitRange ? 1 : 8;
      const match = longestMatch(input, index, maximumLength, (token) => personalWords?.[token])
        || longestMatch(input, index, maximumLength, (token) => words?.[token]);
      if (!match) {
        output += characters[index];
        index += 1;
        continue;
      }
      if (match.length === 1 && !allowSingleCharacter && !splitRange) {
        output += characters[index];
        index += 1;
        continue;
      }
      const id = createChoiceId("hangul-to-hanja", index, match.length, match.token);
      const resolution = resolveChoice(match.value, selections, id, match.token);
      output += formatConversion(match.token, resolution.selected, mode, "hangul-to-hanja");
      choices.push({
        id,
        direction: "hangul-to-hanja",
        start: index,
        end: index + match.length,
        source: match.token,
        selected: resolution.selected,
        resolved: resolution.resolved,
        candidates: match.value
      });
      index += match.length;
    }
    return { output, choices };
  }

  function buildReverseWords(words) {
    const reverse = new Map();
    for (const [hangul, candidates] of Object.entries(words || {})) {
      for (const hanja of candidates) {
        const reading = normalizeInitialSoundLaw(hangul);
        const readings = reverse.get(hanja) || [];
        if (!readings.includes(reading)) readings.push(reading);
        reverse.set(hanja, readings);
      }
    }
    return reverse;
  }

  function lookupReading(dictionary, token) {
    if (dictionary instanceof Map) return dictionary.get(token);
    return dictionary?.[token];
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
    const selections = options.selections || {};
    const personalReverseWords = options.personalReverseWords;
    const choices = [];
    let output = "";
    for (let index = 0; index < characters.length;) {
      if (!HAN_PATTERN.test(characters[index])) {
        output += characters[index];
        index += 1;
        continue;
      }
      const splitRange = findSplitRange(options.splitRanges, characters, index);
      const maximumLength = splitRange ? 1 : 8;
      const match = longestMatch(input, index, maximumLength, (token) => lookupReading(personalReverseWords, token))
        || longestMatch(input, index, maximumLength, (token) => lookupReading(reverseWords, token));
      if (!match) {
        output += characters[index];
        index += 1;
        continue;
      }
      const candidates = Array.isArray(match.value) ? match.value : [match.value];
      const id = createChoiceId("hanja-to-hangul", index, match.length, match.token);
      const resolution = resolveChoice(candidates, selections, id, match.token);
      output += formatConversion(match.token, resolution.selected, mode, "hanja-to-hangul");
      choices.push({
        id,
        direction: "hanja-to-hangul",
        start: index,
        end: index + match.length,
        source: match.token,
        selected: resolution.selected,
        resolved: resolution.resolved,
        candidates
      });
      index += match.length;
    }
    return { output, choices };
  }

  return {
    CHARACTER_URL,
    MAX_PERSONAL_DICTIONARY_ENTRIES,
    MAX_PERSONAL_DICTIONARY_TERM_LENGTH,
    NAME_URL,
    PERSONAL_DICTIONARY_STORAGE_KEY,
    REVERSE_WORD_URL,
    WORD_URL,
    buildCandidateDetails,
    buildPersonalReverseWords,
    buildPersonalWords,
    buildRecordMap,
    buildReverseWords,
    convertHangulToHanja,
    convertHanjaToHangul,
    loadCharacters,
    loadNames,
    loadReverseWords,
    loadWords,
    normalizeInitialSoundLaw,
    normalizeKorean,
    normalizePersonalDictionaryEntries,
    searchRecords
  };
});
