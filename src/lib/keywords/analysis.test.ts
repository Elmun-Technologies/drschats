import { describe, expect, it } from "vitest";
import { analyseDemand, type StatRow } from "./analysis";

const row = (keyword: string, avg: number, extra: Partial<StatRow> = {}): StatRow => ({
  keyword, lang: "ru", subject: null, kind: null, intent: "base", avg, ranged: false, competition: "low", bidLow: null, bidHigh: null, monthly: {}, ...extra,
});

describe("analyseDemand", () => {
  const products = [
    { slug: "calcivit", name: "Calcivit", text: "swiss energy calcivit kalsiy vitamin d3 кальций", inStock: true },
    { slug: "old-zinc", name: "Zinc", text: "zinc rux цинк", inStock: false },
  ];
  const result = analyseDemand(
    [
      row("витамин д3", 2000, { subject: "vitamin-d", monthly: { "2025-11": 1500, "2026-01": 2600 } }),
      row("vitamin d3 narxi", 300, { subject: "vitamin-d", lang: "uz", intent: "buy" }),
      row("цинк купить", 900, { intent: "buy" }),
      row("лютеин для глаз", 400, { subject: "lutein" }),
    ],
    products,
    [{ term: "d3 vitamini", count: 7 }],
    { "vitamin-d3": "vitamin", zinc: "vitamin" },
  );
  const by = Object.fromEntries(result.map((r) => [r.id, r]));

  it("sums demand per subject across languages and intents", () => {
    expect(by["vitamin-d"]).toMatchObject({ total: 2300, buy: 300, keywords: 2, peak: "2026-01", page: "/vitamins/vitamin-d3", siteSearches: 7 });
    expect(by["vitamin-d"].byLang).toEqual({ ru: 2000, uz: 300, "uz-cyrl": 0 });
    expect(by["vitamin-d"].products.map((p) => p.slug)).toEqual(["calcivit"]);
    expect(result[0].id).toBe("vitamin-d");
  });

  it("assigns an unlabelled Planner idea by name and flags gaps", () => {
    expect(by.zinc.total).toBe(900);
    expect(by.zinc).toMatchObject({ productsOut: 1, gap: "assortment" });
    expect(by.lutein.gap).toBe("assortment");
  });
});
