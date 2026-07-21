const hiraganaSpec = `
ぁ:xa あ:a ぃ:xi い:i ぅ:xu う:u ぇ:xe え:e ぉ:xo お:o
か:ka が:ga き:ki ぎ:gi く:ku ぐ:gu け:ke げ:ge こ:ko ご:go
さ:sa ざ:za し:shi じ:ji す:su ず:zu せ:se ぜ:ze そ:so ぞ:zo
た:ta だ:da ち:chi ぢ:ji っ:xtsu つ:tsu づ:zu て:te で:de と:to ど:do
な:na に:ni ぬ:nu ね:ne の:no
は:ha ば:ba ぱ:pa ひ:hi び:bi ぴ:pi ふ:fu ぶ:bu ぷ:pu へ:he べ:be ぺ:pe ほ:ho ぼ:bo ぽ:po
ま:ma み:mi む:mu め:me も:mo
ゃ:xya や:ya ゅ:xyu ゆ:yu ょ:xyo よ:yo
ら:ra り:ri る:ru れ:re ろ:ro
ゎ:xwa わ:wa ゐ:wi ゑ:we を:wo ん:n ゔ:vu ゕ:xka ゖ:xke ゝ:iteration ゞ:voiced-iteration
`;

const halfwidthSpec = `
｡:period ｢:open-bracket ｣:close-bracket ､:comma ･:middle-dot ｰ:long-vowel
ｦ:wo ｧ:xa ｨ:xi ｩ:xu ｪ:xe ｫ:xo ｬ:xya ｭ:xyu ｮ:xyo ｯ:xtsu
ｱ:a ｲ:i ｳ:u ｴ:e ｵ:o ｶ:ka ｷ:ki ｸ:ku ｹ:ke ｺ:ko
ｻ:sa ｼ:shi ｽ:su ｾ:se ｿ:so ﾀ:ta ﾁ:chi ﾂ:tsu ﾃ:te ﾄ:to
ﾅ:na ﾆ:ni ﾇ:nu ﾈ:ne ﾉ:no ﾊ:ha ﾋ:hi ﾌ:fu ﾍ:he ﾎ:ho
ﾏ:ma ﾐ:mi ﾑ:mu ﾒ:me ﾓ:mo ﾔ:ya ﾕ:yu ﾖ:yo
ﾗ:ra ﾘ:ri ﾙ:ru ﾚ:re ﾛ:ro ﾜ:wa ﾝ:n ﾞ:voiced-mark ﾟ:semi-voiced-mark
`;

const symbolSpec = `
々:iteration-mark 〆:shime 〇:zero ヽ:katakana-iteration ヾ:voiced-katakana-iteration
・:middle-dot ー:long-vowel 〜:wave-dash ゛:voiced-mark ゜:semi-voiced-mark
「:corner-open 」:corner-close 『:double-corner-open 』:double-corner-close
【:lenticular-open 】:lenticular-close 〒:postal-mark ※:reference-mark 〃:ditto-mark
㊗:congratulations ㊙:secret ㋿:reiwa ㍻:heisei ㍼:showa ㍽:taisho ㍾:meiji
♨:hot-spring ⛩:shrine
`;

function parseSpec(spec) {
  return spec.trim().split(/\s+/).map((token) => {
    const separator = token.indexOf(":");
    return { character: token.slice(0, separator), reading: token.slice(separator + 1) };
  });
}

function hiraganaToKatakana(character) {
  const codePoint = character.codePointAt(0);
  if (codePoint >= 0x3041 && codePoint <= 0x3096) return String.fromCodePoint(codePoint + 0x60);
  return character;
}

const hiragana = parseSpec(hiraganaSpec);
const katakana = hiragana.map((entry) => ({
  character: hiraganaToKatakana(entry.character),
  reading: entry.reading
}));

export const JAPANESE_CHARACTER_CATEGORIES = [
  { id: "hiragana", entries: hiragana },
  { id: "katakana", entries: katakana },
  { id: "halfwidth", entries: parseSpec(halfwidthSpec) },
  { id: "symbols", entries: parseSpec(symbolSpec) }
];

export function filterJapaneseCharacters(entries, queryValue) {
  const query = normalizeSearch(queryValue);
  if (!query) return [...entries];
  return entries.filter((entry) => normalizeSearch(`${entry.character} ${entry.reading}`).includes(query));
}

function normalizeSearch(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase();
}
