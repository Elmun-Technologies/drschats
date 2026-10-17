/*
  One slug rule for every admin form (products, categories). Pure, so the
  client forms and the server actions agree on what an empty slug becomes.
*/
const CYRILLIC: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h" };

/** "Swiss Energy Omega-3 30" → "swiss-energy-omega-3-30"; Uzbek and Russian letters folded to Latin. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ʻʼ‘’'`]/g, "")
    .replace(/[а-яёўқғҳ]/g, (ch) => CYRILLIC[ch] ?? "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}
