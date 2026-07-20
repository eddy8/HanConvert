export const DEFAULT_JAPANESE_PREVIEW_LIMIT = 20000;
export const DEFAULT_JAPANESE_PAIR_LIMIT = 200;

const MAX_GREEDY_ALIGNMENT_CHARACTERS = 100000;
const ALIGNMENT_LOOKAHEAD = 24;

export function analyzeCharacterChanges(sourceValue, targetValue, options = {}) {
  const source = String(sourceValue ?? "");
  const target = String(targetValue ?? "");
  const previewLimit = normalizeLimit(options.previewLimit, DEFAULT_JAPANESE_PREVIEW_LIMIT);
  const pairLimit = normalizeLimit(options.pairLimit, DEFAULT_JAPANESE_PAIR_LIMIT);
  const state = createAnalysisState(previewLimit);

  if (source.length === target.length) {
    analyzeAlignedText(source, target, state);
  } else if (source.length + target.length <= MAX_GREEDY_ALIGNMENT_CHARACTERS) {
    analyzeWithLookahead(source, target, state);
  } else {
    analyzeLargeUnalignedText(source, target, state);
  }

  return {
    segments: state.segments,
    pairs: [...state.pairCounts.values()].slice(0, pairLimit),
    totalChanges: state.totalChanges,
    uniqueChanges: state.pairCounts.size,
    previewTruncated: state.targetCharacterCount > previewLimit,
    pairsTruncated: state.pairCounts.size > pairLimit,
    alignmentLimited: state.alignmentLimited
  };
}

function normalizeLimit(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function createAnalysisState(previewLimit) {
  return {
    previewLimit,
    previewCharacterCount: 0,
    targetCharacterCount: 0,
    totalChanges: 0,
    pairCounts: new Map(),
    segments: [],
    alignmentLimited: false
  };
}

function analyzeAlignedText(source, target, state) {
  const sourceIterator = source[Symbol.iterator]();
  const targetIterator = target[Symbol.iterator]();

  while (true) {
    const sourcePart = sourceIterator.next();
    const targetPart = targetIterator.next();
    if (sourcePart.done || targetPart.done) {
      if (sourcePart.done !== targetPart.done) state.alignmentLimited = true;
      return;
    }

    const changed = sourcePart.value !== targetPart.value;
    if (changed) recordPair(state, sourcePart.value, targetPart.value);
    appendPreview(state, targetPart.value, changed);
  }
}

function analyzeWithLookahead(source, target, state) {
  const sourceCharacters = [...source];
  const targetCharacters = [...target];
  let sourceIndex = 0;
  let targetIndex = 0;

  while (sourceIndex < sourceCharacters.length || targetIndex < targetCharacters.length) {
    const sourceCharacter = sourceCharacters[sourceIndex];
    const targetCharacter = targetCharacters[targetIndex];

    if (sourceCharacter !== undefined && sourceCharacter === targetCharacter) {
      appendPreview(state, targetCharacter, false);
      sourceIndex += 1;
      targetIndex += 1;
      continue;
    }

    const nextMatch = findNextMatch(sourceCharacters, targetCharacters, sourceIndex, targetIndex);
    const sourceEnd = nextMatch ? sourceIndex + nextMatch.sourceOffset : sourceCharacters.length;
    const targetEnd = nextMatch ? targetIndex + nextMatch.targetOffset : targetCharacters.length;
    const changedSource = sourceCharacters.slice(sourceIndex, sourceEnd).join("");
    const changedTarget = targetCharacters.slice(targetIndex, targetEnd).join("");

    recordPair(state, changedSource, changedTarget);
    appendPreview(state, changedTarget, true);
    sourceIndex = sourceEnd;
    targetIndex = targetEnd;
  }
}

function findNextMatch(source, target, sourceIndex, targetIndex) {
  const sourceLimit = Math.min(source.length - sourceIndex, ALIGNMENT_LOOKAHEAD);
  const targetLimit = Math.min(target.length - targetIndex, ALIGNMENT_LOOKAHEAD);

  for (let distance = 1; distance <= sourceLimit + targetLimit; distance += 1) {
    const minimumSourceOffset = Math.max(0, distance - targetLimit);
    const maximumSourceOffset = Math.min(sourceLimit, distance);

    for (let sourceOffset = minimumSourceOffset; sourceOffset <= maximumSourceOffset; sourceOffset += 1) {
      const targetOffset = distance - sourceOffset;
      if (sourceOffset === 0 && targetOffset === 0) continue;
      if (source[sourceIndex + sourceOffset] === target[targetIndex + targetOffset]) {
        return { sourceOffset, targetOffset };
      }
    }
  }

  return null;
}

function analyzeLargeUnalignedText(source, target, state) {
  state.alignmentLimited = true;
  let targetCount = 0;
  for (const character of target) {
    targetCount += 1;
    appendPreview(state, character, false);
  }
  state.targetCharacterCount = targetCount;

  if (source !== target) {
    state.totalChanges = 1;
    state.pairCounts.set("large-unaligned-change", { source: "", target: "", count: 1 });
  }
}

function recordPair(state, source, target) {
  state.totalChanges += 1;
  const key = `${source}\u0000${target}`;
  const existing = state.pairCounts.get(key);
  if (existing) {
    existing.count += 1;
    return;
  }
  state.pairCounts.set(key, { source, target, count: 1 });
}

function appendPreview(state, text, changed) {
  for (const character of text) {
    state.targetCharacterCount += 1;
    if (state.previewCharacterCount >= state.previewLimit) continue;

    const previous = state.segments.at(-1);
    if (previous?.changed === changed) {
      previous.text += character;
    } else {
      state.segments.push({ text: character, changed });
    }
    state.previewCharacterCount += 1;
  }
}
