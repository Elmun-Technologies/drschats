import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  applyFilters,
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

  it("counts a price range as one active filter", () => {
    expect(activeFilterCount({ ...EMPTY_FILTERS, min: 1, max: 2, sale: true })).toBe(2);
  });
});

describe("productBrand", () => {
  it("reads the brand from the slug prefix", () => {
    expect(productBrand("dr-frei-antistress-magniy-20")?.name).toBe("Dr. Frei");
    expect(productBrand("swiss-energy-vitamin-c-20")?.slug).toBe("swiss-energy");
    expect(productBrand("unknown-thing")).toBeNull();
  });
});
