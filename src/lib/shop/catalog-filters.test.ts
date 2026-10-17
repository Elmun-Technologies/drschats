import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  ENDING_WINDOW_MS,
  activeFilterCount,
  applyFilters,
  endingSoon,
  promotedSlugs,
  sortByEnding,
  facetCounts,
  filtersToQuery,
  parseFilters,
  type ProductFacts,
} from "./catalog-filters";
import { productBrand } from "@/lib/content/product-brands";

const fact = (id: string, over: Partial<ProductFacts>): ProductFacts => ({
  id,
  price: 100_000,
  inStock: true,
  sale: false,
  ending: false,
  brand: "swiss-energy",
  origin: "Shveytsariya",
  form: "capsule",
  goals: [],
  ...over,
});

const pool = [
  fact("a", { sale: true, brand: "dr-frei", form: "tablet", price: 79_000 }),
  fact("b", { brand: "swiss-energy", goals: ["immunity"] }),
  fact("c", { brand: "swiss-energy", inStock: false, price: 265_950 }),
  fact("d", { brand: "aminomorin", origin: "Yaponiya", price: 189_000 }),
];

describe("applyFilters", () => {
  it("combines groups with AND and options within a group with OR", () => {
    const f = { ...EMPTY_FILTERS, brands: ["swiss-energy", "aminomorin"], stock: true };
    expect(applyFilters(pool, f).map((p) => p.id)).toEqual(["b", "d"]);
  });

  it("applies the price range inclusively", () => {
    const f = { ...EMPTY_FILTERS, min: 79_000, max: 100_000 };
    expect(applyFilters(pool, f).map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("filters by health goal", () => {
    expect(applyFilters(pool, { ...EMPTY_FILTERS, goal: "immunity" }).map((p) => p.id)).toEqual(["b"]);
  });
});

describe("facetCounts", () => {
  it("counts an option with every other group applied but not its own", () => {
    const counts = facetCounts(pool, { ...EMPTY_FILTERS, brands: ["dr-frei"], stock: true });
    // Brand counts ignore the brand selection, so siblings stay selectable.
    expect(counts.brands).toEqual([
      { value: "swiss-energy", count: 1 },
      { value: "dr-frei", count: 1 },
      { value: "aminomorin", count: 1 },
    ]);
    // Sale counts apply the brand selection.
    expect(counts.sale).toBe(1);
    expect(counts.stock).toBe(1);
  });

  it("keeps options that drop to zero so the list does not jump", () => {
    const counts = facetCounts(pool, { ...EMPTY_FILTERS, sale: true });
    expect(counts.origins).toEqual([
      { value: "Shveytsariya", count: 1 },
      { value: "Yaponiya", count: 0 },
    ]);
  });
});

describe("URL round trip", () => {
  it("parses what it writes", () => {
    const f = { ...EMPTY_FILTERS, stock: true, brands: ["dr-frei", "peano"], forms: ["tablet" as const], min: 50_000 };
    expect(parseFilters(filtersToQuery(f))).toEqual(f);
  });

  it("ignores unknown forms and bad numbers", () => {
    const f = parseFilters({ form: "powder,capsule", min: "-5", max: "abc" });
    expect(f.forms).toEqual(["capsule"]);
    expect(f.min).toBeNull();
    expect(f.max).toBeNull();
  });

  it("reads the old single origin value", () => {
    expect(parseFilters({ origin: "Shveytsariya" }).origins).toEqual(["Shveytsariya"]);
  });

  it("survives repeated query parameters", () => {
    const f = parseFilters({ brand: ["a", "b"], goal: ["x", "y"], min: ["10", "20"], stock: ["1", "0"] });
    expect(f.brands).toEqual(["a", "b"]);
    expect(f.goal).toBe("x");
    expect(f.min).toBe(10);
    expect(f.stock).toBe(true);
  });

  it("counts a price range as one active filter", () => {
    expect(activeFilterCount({ ...EMPTY_FILTERS, min: 1, max: 2, sale: true })).toBe(2);
  });
});

describe("Aksiyada / Tez tugaydi", () => {
  const now = Date.parse("2026-10-17T12:00:00Z");
  const inHours = (h: number) => new Date(now + h * 3_600_000).toISOString();

  it("marks a real sale ending within 72 hours, and nothing else", () => {
    expect(endingSoon({ price: 80, oldPrice: 100, saleEndsAt: inHours(5) }, now)).toBe(true);
    expect(endingSoon({ price: 80, oldPrice: 100, saleEndsAt: inHours(72) }, now)).toBe(true);
    expect(endingSoon({ price: 80, oldPrice: 100, saleEndsAt: inHours(73) }, now)).toBe(false);
    expect(endingSoon({ price: 80, oldPrice: 100, saleEndsAt: inHours(-1) }, now)).toBe(false);
    // An end date without a real old price is not a sale.
    expect(endingSoon({ price: 80, saleEndsAt: inHours(5) }, now)).toBe(false);
    expect(endingSoon({ price: 80, oldPrice: 100 }, now)).toBe(false);
    expect(ENDING_WINDOW_MS).toBe(72 * 3_600_000);
  });

  it("counts products named by a running 2+1 or percent promotion, not whole-cart ones", () => {
    const slugs = promotedSlugs([
      { type: "buy_x_get_y", productSlugs: ["a", "b"] },
      { type: "percent_off", productSlugs: ["c"] },
      { type: "percent_off" },
      { type: "free_shipping_over", productSlugs: ["z"] },
    ]);
    expect([...slugs].sort()).toEqual(["a", "b", "c"]);
  });

  it("sorts the soonest real end first and keeps the rest in order", () => {
    const items = [
      { id: "plain", price: 10 },
      { id: "late", price: 8, oldPrice: 10, saleEndsAt: inHours(48) },
      { id: "expired", price: 8, oldPrice: 10, saleEndsAt: inHours(-2) },
      { id: "soon", price: 8, oldPrice: 10, saleEndsAt: inHours(2) },
      { id: "open", price: 8, oldPrice: 10 },
    ];
    expect(sortByEnding(items, now).map((p) => p.id)).toEqual(["soon", "late", "plain", "expired", "open"]);
  });

  it("filters, counts and round-trips the ending flag", () => {
    const facts = [fact("x", { sale: true, ending: true }), fact("y", { sale: true }), fact("z", {})];
    const f = { ...EMPTY_FILTERS, ending: true };
    expect(applyFilters(facts, f).map((p) => p.id)).toEqual(["x"]);
    expect(facetCounts(facts, EMPTY_FILTERS).ending).toBe(1);
    expect(filtersToQuery(f)).toEqual({ ending: "1" });
    expect(parseFilters({ ending: "1", sale: "1" })).toEqual({ ...EMPTY_FILTERS, ending: true, sale: true });
    expect(activeFilterCount(f)).toBe(1);
  });
});

describe("productBrand", () => {
  it("reads the brand from the slug prefix", () => {
    expect(productBrand("dr-frei-antistress-magniy-20")?.name).toBe("Dr. Frei");
    expect(productBrand("swiss-energy-vitamin-c-20")?.slug).toBe("swiss-energy");
    expect(productBrand("unknown-thing")).toBeNull();
  });
});
