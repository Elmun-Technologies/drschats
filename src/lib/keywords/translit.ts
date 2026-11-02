/*
  Uzbek Latin → Uzbek Cyrillic, for search phrases. Many people in
  Uzbekistan still search in Cyrillic Uzbek ("витамин нархи"), so every
  Uzbek keyword is offered in both scripts. Phrases only — not a general
  transliterator (no Russian loan-word exceptions beyond "ts").
*/
const PAIRS: [RegExp, string][] = [
  [/o['ʻʼ‘’`]/g, "ў"],
  [/g['ʻʼ‘’`]/g, "ғ"],
  [/sh/g, "ш"],
  [/ch/g, "ч"],
  [/yo/g, "ё"],
  [/yu/g, "ю"],
  [/ya/g, "я"],
  [/ye/g, "е"],
  [/ts/g, "ц"],
  [/['ʻʼ‘’`]/g, "ъ"],
];

const SINGLE: Record<string, string> = {
  a: "а", b: "б", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к", l: "л", m: "м",
  n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т", u: "у", v: "в", x: "х", y: "й", z: "з", c: "с", w: "в",
};

export function uzLatinToCyrillic(phrase: string): string {
  let s = phrase.toLowerCase();
  for (const [re, to] of PAIRS) s = s.replace(re, to);
  // A word-initial "e" is "э" in Cyrillic Uzbek (energiya → энергия).
  s = s.replace(/(^|[\s-])e/g, "$1э");
  return [...s].map((ch) => SINGLE[ch] ?? ch).join("");
}
