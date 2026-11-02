import { fold } from "./fold";

/*
  Catalogue search without a search engine. It used to be one exact substring,
  so "vitamn", "c vitamin" (word order), "витамин д" on the Uzbek site or a
  search by ingredient found nothing. Now:
  - every word of the query must be found, in any order;
  - Cyrillic is transliterated, so either alphabet finds either;
  - a word of five letters or more may be one typo away from a word in the text.
  Pure and small enough for every request; a real engine replaces it later.
*/

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
  ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

/** Lower-case Latin key: apostrophes dropped, Cyrillic transliterated, punctuation to spaces. */
export function searchKey(text: string): string {
  return fold(text)
    .replace(/[Ѐ-ӿ]/g, (ch) => CYRILLIC[ch] ?? ch)
    .replace(/'/g, "")
    .replace(/[^a-z0-9%+]+/g, " ")
    .trim();
}

function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function tokenFound(token: string, text: string, words: string[]): boolean {
  // "c", "d3", "b6": a short word must start a word, or "c" would match every "c" in the text.
  if (token.length < 3) return words.some((w) => w.startsWith(token));
  if (text.includes(token)) return true;
  if (token.length < 5) return false;
  // A typo in a whole word, or in the start of a longer one ("magni" → "magniy").
  return words.some((w) => withinOneEdit(token, w) || (w.length > token.length && withinOneEdit(token, w.slice(0, token.length))));
}

/** True when every word of `query` is found in at least one of `fields`. */
export function matchesQuery(fields: string[], query: string): boolean {
  const tokens = searchKey(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  const text = fields.map(searchKey).join(" ");
  const words = text.split(" ");
  return tokens.every((t) => tokenFound(t, text, words));
}
