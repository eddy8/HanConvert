(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HanCharacterLookupCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const operatorArity = new Map([
    ["⿰", 2], ["⿱", 2], ["⿲", 3], ["⿳", 3],
    ["⿴", 2], ["⿵", 2], ["⿶", 2], ["⿷", 2],
    ["⿸", 2], ["⿹", 2], ["⿺", 2], ["⿻", 2],
    ["⿼", 2], ["⿽", 2], ["⿾", 1], ["⿿", 1]
  ]);

  const structureKeys = new Map([
    ["⿰", "leftRight"], ["⿱", "topBottom"], ["⿲", "leftMiddleRight"], ["⿳", "topMiddleBottom"],
    ["⿴", "fullEnclosure"], ["⿵", "topEnclosure"], ["⿶", "bottomEnclosure"], ["⿷", "leftEnclosure"],
    ["⿸", "upperLeftEnclosure"], ["⿹", "upperRightEnclosure"], ["⿺", "lowerLeftEnclosure"],
    ["⿻", "overlaid"], ["⿼", "rightEnclosure"], ["⿽", "lowerRightEnclosure"],
    ["⿾", "horizontalReflection"], ["⿿", "rotation"]
  ]);

  function extractHanCharacters(value, limit = 12) {
    return [...new Set([...String(value).matchAll(/\p{Script=Han}/gu)].map((match) => match[0]))].slice(0, limit);
  }

  function parseIds(value) {
    const characters = Array.from(String(value || ""));
    let cursor = 0;

    function parseNode(path = []) {
      const character = characters[cursor++];
      if (!character) return null;
      const arity = operatorArity.get(character) || 0;
      const node = { value: character, path, children: [] };
      for (let index = 0; index < arity; index += 1) {
        const child = parseNode([...path, index]);
        if (child) node.children.push(child);
      }
      return node;
    }

    const root = parseNode([]);
    return root && cursor === characters.length ? root : null;
  }

  function decodeMatches(value) {
    if (!value) return [];
    return String(value).split(",").map((item) => {
      if (item === "x") return null;
      if (item === "r") return [];
      return Array.from(item, (digit) => Number.parseInt(digit, 10));
    });
  }

  function pathStartsWith(candidate, prefix) {
    if (!Array.isArray(candidate) || candidate.length < prefix.length) return false;
    return prefix.every((value, index) => candidate[index] === value);
  }

  function strokeBelongsToPath(match, path) {
    if (!path.length) return true;
    return pathStartsWith(match, path);
  }

  function structureKey(operator) {
    return structureKeys.get(operator) || "single";
  }

  function shardName(character) {
    const codePoint = Array.from(String(character || ""))[0]?.codePointAt(0);
    return Number.isInteger(codePoint) ? (codePoint >> 8).toString(16).padStart(2, "0") : "";
  }

  function formatCodePoint(character) {
    const codePoint = Array.from(String(character || ""))[0]?.codePointAt(0);
    return Number.isInteger(codePoint) ? `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}` : "-";
  }

  function findNode(root, path) {
    let node = root;
    for (const index of path) node = node?.children?.[index];
    return node || null;
  }

  return {
    decodeMatches,
    extractHanCharacters,
    findNode,
    formatCodePoint,
    operatorArity,
    parseIds,
    pathStartsWith,
    shardName,
    strokeBelongsToPath,
    structureKey
  };
});
