import { searchKey } from "./match";

/*
  «Balki siz … ni qidirgandirsiz?» for a search that found nothing. The
  candidates are the catalogue's own words (brand names, product names), so
  every suggestion leads to a result; the closest by edit distance per query
  word, and only when it is genuinely close (a third of the word at most).
*/

function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

/** Up to `limit` catalogue terms close to the query, best first. */
export function suggestTerms(query: string, candidates: string[], limit = 3): string[] {
  const words = searchKey(query).split(" ").filter((w) => w.length >= 3);
  if (words.length === 0) return [];
  const scored: { term: string; score: number }[] = [];
  const seen = new Set<string>();
  for (const term of candidates) {
    const key = searchKey(term);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const termWords = key.split(" ");
    let total = 0;
    let matched = 0;
    for (const w of words) {
      const best = Math.min(...termWords.map((t) => distance(w, t.slice(0, Math.max(w.length, t.length)))));
      if (best <= Math.max(1, Math.floor(w.length / 3))) {
        matched++;
        total += best;
      }
    }
    if (matched > 0) scored.push({ term, score: total - matched * 10 });
  }
  return scored.sort((a, b) => a.score - b.score || a.term.length - b.term.length).slice(0, limit).map((s) => s.term);
}
