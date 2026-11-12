import { SUBJECTS, type KeywordSubject, type SubjectKind } from "./subjects";
import { guessSubject, normalizeKeyword, type KeywordLang } from "./generate";

/*
  Demand per subject: the Planner numbers summed over every way people ask
  for it (three scripts, buying and question forms), set against what the
  shop has — products in stock, a page that answers the question — and what
  visitors typed into the site's own search.
*/

export interface StatRow {
  keyword: string;
  lang: KeywordLang;
  subject: string | null;
  kind: string | null;
  intent: string | null;
  avg: number | null;
  ranged: boolean;
  competition: "low" | "medium" | "high" | null;
  bidLow: number | null;
  bidHigh: number | null;
  monthly: Record<string, number>;
  /** Planner's year-over-year change for the latest month, e.g. "179%". */
  yoyChange?: string | null;
}

export interface ShopProduct {
  slug: string;
  name: string;
  /** Name, brand and ingredient names in every language, lowercase. */
  text: string;
  inStock: boolean;
}

export interface SubjectDemand {
  id: string;
  label: string;
  kind: SubjectKind | "product" | "brand";
  total: number;
  byLang: Record<KeywordLang, number>;
  buy: number;
  info: number;
  keywords: number;
  top: { keyword: string; avg: number }[];
  /** Summed monthly searches, oldest first. */
  series: { month: string; searches: number }[];
  peak: string | null;
  competition: "low" | "medium" | "high" | null;
  products: { slug: string; name: string }[];
  productsOut: number;
  page: string | null;
  siteSearches: number;
  gap: "assortment" | "content" | null;
}

export function topicPathFor(subject: KeywordSubject, topicKinds: Record<string, "goal" | "symptom" | "vitamin">): string | null {
  if (subject.site?.path) return subject.site.path;
  if (subject.site?.topic) {
    const kind = topicKinds[subject.site.topic];
    if (kind) return `/${kind === "goal" ? "goals" : kind === "symptom" ? "symptoms" : "vitamins"}/${subject.site.topic}`;
  }
  if (subject.site?.category) return `/products/${subject.site.category}`;
  return null;
}

function matches(product: ShopProduct, terms: string[]): boolean {
  return terms.some((t) => {
    const term = t.toLowerCase();
    const at = product.text.indexOf(term);
    // Word start: "zinc" in "zinc citrate", not inside another word.
    return at >= 0 && (at === 0 || /[^\p{L}\p{N}]/u.test(product.text[at - 1] ?? " "));
  });
}

export function analyseDemand(
  stats: StatRow[],
  products: ShopProduct[],
  siteTerms: { term: string; count: number }[],
  topicKinds: Record<string, "goal" | "symptom" | "vitamin">,
): SubjectDemand[] {
  const bySubject = new Map<string, StatRow[]>();
  for (const row of stats) {
    const subject = row.subject ?? guessSubject(row.keyword)?.subject ?? null;
    if (!subject) continue;
    bySubject.set(subject, [...(bySubject.get(subject) ?? []), row]);
  }
  const searches = new Map<string, number>();
  for (const { term, count } of siteTerms) {
    const s = guessSubject(term)?.subject;
    if (s) searches.set(s, (searches.get(s) ?? 0) + count);
  }

  const known = new Set(SUBJECTS.map((s) => s.id));
  const out: SubjectDemand[] = [];
  const subjects: (KeywordSubject | { id: string; label: string; kind: "brand" | "product" })[] = [
    ...SUBJECTS,
    ...[...bySubject.keys()].filter((id) => !known.has(id)).map((id) => ({ id, label: id === "products" ? "Bizning mahsulotlar nomi bilan" : id.replace(/^brand-/, "").replace(/-/g, " "), kind: id === "products" ? ("product" as const) : ("brand" as const) })),
  ];

  for (const subject of subjects) {
    const rows = bySubject.get(subject.id) ?? [];
    const byLang: Record<KeywordLang, number> = { ru: 0, uz: 0, "uz-cyrl": 0 };
    let total = 0;
    let buy = 0;
    let info = 0;
    const months = new Map<string, number>();
    const comp = { low: 0, medium: 0, high: 0 };
    for (const r of rows) {
      const n = r.avg ?? 0;
      total += n;
      byLang[r.lang] += n;
      if (r.intent === "buy" || r.intent === "product" || r.intent === "brand") buy += n;
      if (r.intent === "info") info += n;
      if (r.competition) comp[r.competition] += n;
      for (const [m, v] of Object.entries(r.monthly ?? {})) months.set(m, (months.get(m) ?? 0) + v);
    }
    const series = [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, s]) => ({ month, searches: s }));
    const peak = series.length ? series.reduce((a, b) => (b.searches > a.searches ? b : a)).month : null;
    const competition = total ? ((Object.entries(comp).sort((a, b) => b[1] - a[1])[0][0]) as "low" | "medium" | "high") : null;

    const full = "ru" in subject ? subject : null;
    const terms = full?.site?.terms ?? [];
    const matched = terms.length ? products.filter((p) => matches(p, terms)) : [];
    const inStock = matched.filter((p) => p.inStock);
    const page = full ? topicPathFor(full, topicKinds) : null;
    const siteSearches = searches.get(subject.id) ?? 0;

    // A gap is worth naming only with real demand behind it.
    const sellable = subject.kind === "vitamin" || subject.kind === "mineral" || subject.kind === "supplement" || subject.kind === "form";
    const gap = total >= 100 && sellable && terms.length > 0 && inStock.length === 0 ? "assortment" : total >= 100 && !page && subject.kind !== "brand" && subject.kind !== "product" ? "content" : null;

    out.push({
      id: subject.id,
      label: subject.label,
      kind: subject.kind,
      total,
      byLang,
      buy,
      info,
      keywords: rows.length,
      top: rows.filter((r) => (r.avg ?? 0) > 0).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)).slice(0, 5).map((r) => ({ keyword: r.keyword, avg: r.avg ?? 0 })),
      series,
      peak,
      competition,
      products: inStock.slice(0, 4).map((p) => ({ slug: p.slug, name: p.name })),
      productsOut: matched.length - inStock.length,
      page,
      siteSearches,
      gap,
    });
  }
  return out.sort((a, b) => b.total - a.total || b.siteSearches - a.siteSearches);
}

export function normalizeTerm(term: string): string {
  return normalizeKeyword(term);
}
