/*
  The read-out of a Planner import as a report: how much of the demand sits in
  a few keywords, which months are busy, and which keywords are rising or
  falling. Pure, so the admin page and its tests read the same numbers.
*/

export type DemandLevel = "high" | "medium" | "low" | "none";

/** A keyword's monthly searches: 1 000+, 100–999, 10–99, under 10. */
export function keywordLevel(avg: number | null | undefined): DemandLevel {
  const n = avg ?? 0;
  if (n >= 1000) return "high";
  if (n >= 100) return "medium";
  if (n >= 10) return "low";
  return "none";
}

/** A subject sums many keywords, so its bands are wider: 5 000+, 1 000–4 999, 100–999, under 100. */
export function subjectLevel(total: number): DemandLevel {
  if (total >= 5000) return "high";
  if (total >= 1000) return "medium";
  if (total >= 100) return "low";
  return "none";
}

export interface ReportRow {
  keyword: string;
  avg: number | null;
  lang: "ru" | "uz" | "uz-cyrl";
  yoyChange?: string | null;
  monthly: Record<string, number>;
}

export const LEVELS: DemandLevel[] = ["high", "medium", "low", "none"];

export function levelSummary(rows: ReportRow[]): Record<DemandLevel, { keywords: number; searches: number }> {
  const out = { high: { keywords: 0, searches: 0 }, medium: { keywords: 0, searches: 0 }, low: { keywords: 0, searches: 0 }, none: { keywords: 0, searches: 0 } };
  for (const r of rows) {
    const level = keywordLevel(r.avg);
    out[level].keywords++;
    out[level].searches += r.avg ?? 0;
  }
  return out;
}

export function languageTotals(rows: ReportRow[]): Record<ReportRow["lang"], number> {
  const out = { ru: 0, uz: 0, "uz-cyrl": 0 };
  for (const r of rows) out[r.lang] += r.avg ?? 0;
  return out;
}

/** All keywords summed per month, oldest first. */
export function monthlyTotals(rows: ReportRow[]): { month: string; searches: number }[] {
  const months = new Map<string, number>();
  for (const r of rows) for (const [m, v] of Object.entries(r.monthly ?? {})) months.set(m, (months.get(m) ?? 0) + v);
  return [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, searches]) => ({ month, searches }));
}

/** Planner writes the change as "179%", "-47%", "0%" or "∞"; only a finite number counts. */
export function percentOf(change: string | null | undefined): number | null {
  const m = /^\s*([+-]?\d+(?:[.,]\d+)?)\s*%\s*$/.exec(change ?? "");
  return m ? Number(m[1].replace(",", ".")) : null;
}

/**
 * Keywords with real volume that moved most against the same month a year
 * earlier. A small keyword doubling from 20 to 40 says nothing, so the floor
 * keeps those out.
 */
export function trends(rows: ReportRow[], { minSearches = 200, limit = 15 } = {}) {
  const moved = rows
    .filter((r) => (r.avg ?? 0) >= minSearches)
    .map((r) => ({ keyword: r.keyword, avg: r.avg ?? 0, yoy: percentOf(r.yoyChange) }))
    .filter((r): r is { keyword: string; avg: number; yoy: number } => r.yoy !== null);
  return {
    rising: moved.filter((r) => r.yoy >= 50).sort((a, b) => b.yoy - a.yoy || b.avg - a.avg).slice(0, limit),
    falling: moved.filter((r) => r.yoy <= -30).sort((a, b) => a.yoy - b.yoy || b.avg - a.avg).slice(0, limit),
  };
}
