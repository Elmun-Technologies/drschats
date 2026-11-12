import { describe, expect, it } from "vitest";
import { keywordLevel, languageTotals, levelSummary, monthlyTotals, percentOf, subjectLevel, trends, type ReportRow } from "./report";

const row = (keyword: string, avg: number | null, extra: Partial<ReportRow> = {}): ReportRow => ({ keyword, avg, lang: "ru", monthly: {}, ...extra });

describe("keyword report", () => {
  it("bands keywords and subjects by monthly searches", () => {
    expect([keywordLevel(6600), keywordLevel(1000), keywordLevel(999), keywordLevel(100), keywordLevel(99), keywordLevel(10), keywordLevel(9), keywordLevel(null)]).toEqual(["high", "high", "medium", "medium", "low", "low", "none", "none"]);
    expect([subjectLevel(30440), subjectLevel(5000), subjectLevel(4999), subjectLevel(1000), subjectLevel(999), subjectLevel(100), subjectLevel(99)]).toEqual(["high", "high", "medium", "medium", "low", "low", "none"]);
  });

  it("sums keywords and searches per level and per language", () => {
    const rows = [row("омега 3", 5400), row("omega 3", 6600, { lang: "uz" }), row("магний", 2400), row("aevit", 720, { lang: "uz" }), row("x", 40, { lang: "uz-cyrl" }), row("y", null)];
    expect(levelSummary(rows)).toEqual({ high: { keywords: 3, searches: 14400 }, medium: { keywords: 1, searches: 720 }, low: { keywords: 1, searches: 40 }, none: { keywords: 1, searches: 0 } });
    expect(languageTotals(rows)).toEqual({ ru: 7800, uz: 7320, "uz-cyrl": 40 });
  });

  it("adds the months of every keyword, oldest first", () => {
    const rows = [row("a", 10, { monthly: { "2026-01": 5, "2025-12": 3 } }), row("b", 10, { monthly: { "2026-01": 2 } })];
    expect(monthlyTotals(rows)).toEqual([{ month: "2025-12", searches: 3 }, { month: "2026-01", searches: 7 }]);
  });

  it("reads Planner's change column and keeps small keywords out of the trends", () => {
    expect([percentOf("179%"), percentOf("-47%"), percentOf("0%"), percentOf("∞"), percentOf(""), percentOf(null)]).toEqual([179, -47, 0, null, null, null]);
    const { rising, falling } = trends([
      row("магний цитрат", 6600, { yoyChange: "179%" }),
      row("ashvaganda", 1900, { yoyChange: "177%" }),
      row("tiny", 40, { yoyChange: "900%" }),
      row("витамин д", 2900, { yoyChange: "-47%" }),
      row("flat", 3000, { yoyChange: "10%" }),
      row("new", 500, { yoyChange: "∞" }),
    ]);
    expect(rising.map((r) => r.keyword)).toEqual(["магний цитрат", "ashvaganda"]);
    expect(falling).toEqual([{ keyword: "витамин д", avg: 2900, yoy: -47 }]);
  });
});
