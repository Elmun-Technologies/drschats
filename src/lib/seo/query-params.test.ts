import { describe, expect, it } from "vitest";
import { BRAND_VARIANT_PARAMS, CATALOG_VARIANT_PARAMS, isTrackingParam, isVariantQuery } from "./query-params";
import type { FilterParams } from "@/lib/shop/catalog-filters";

describe("isVariantQuery", () => {
  it("keeps the clean URL indexable", () => {
    expect(isVariantQuery({}, CATALOG_VARIANT_PARAMS)).toBe(false);
  });

  it("ignores ad, analytics and referral markers", () => {
    const query = {
      utm_source: "telegram", utm_medium: "cpc", utm_campaign: "autumn", utm_content: "a", utm_term: "b",
      gclid: "x", yclid: "y", fbclid: "z", ttclid: "t", ref: "partner",
    };
    expect(isVariantQuery(query, CATALOG_VARIANT_PARAMS)).toBe(false);
    expect(isVariantQuery(query, BRAND_VARIANT_PARAMS)).toBe(false);
  });

  it("ignores parameters the page does not read", () => {
    expect(isVariantQuery({ foo: "bar" }, CATALOG_VARIANT_PARAMS)).toBe(false);
    expect(isVariantQuery({ sort: "price-asc" }, BRAND_VARIANT_PARAMS)).toBe(false);
  });

  it("marks sort, search, paging and filters as variants, also next to tracking params", () => {
    for (const key of CATALOG_VARIANT_PARAMS) {
      expect(isVariantQuery({ [key]: "1", utm_source: "x" }, CATALOG_VARIANT_PARAMS), key).toBe(true);
    }
    expect(isVariantQuery({ form: "tablet" }, BRAND_VARIANT_PARAMS)).toBe(true);
    expect(isVariantQuery({ brand: ["a", "b"] }, CATALOG_VARIANT_PARAMS)).toBe(true);
  });

  it("treats an empty value as absent", () => {
    expect(isVariantQuery({ sort: "", page: [""] }, CATALOG_VARIANT_PARAMS)).toBe(false);
  });

  it("covers every filter the catalogue parses", () => {
    const filters: Record<keyof Required<FilterParams>, true> = {
      stock: true, sale: true, ending: true, brand: true, form: true, origin: true, goal: true, min: true, max: true,
    };
    for (const key of Object.keys(filters)) expect(CATALOG_VARIANT_PARAMS).toContain(key);
  });
});

describe("isTrackingParam", () => {
  it("recognises any utm_* and click ids, case-insensitively", () => {
    for (const key of ["utm_source", "UTM_Campaign", "utm_whatever", "gclid", "yclid", "fbclid", "ttclid", "ref"]) {
      expect(isTrackingParam(key), key).toBe(true);
    }
    expect(isTrackingParam("sort")).toBe(false);
  });
});
