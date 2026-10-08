import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/shopflow/types";
import { fitsAudience } from "./audience-fit";

const p = (slug: string, categorySlug = "vitamins") => ({ slug, categorySlug }) as Product;
const prenatal = p("swiss-energy-prenatal-forte-60");
const potenton = p("swiss-energy-potenton-30");
const kids = p("dr-frei-kids-multivitamins-20", "kids");
const general = p("swiss-energy-immunovit-30", "immunity");

describe("fitsAudience", () => {
  it("keeps audience-specific products away from everyone else", () => {
    const woman = { who: ["self-woman"] };
    expect(fitsAudience(prenatal, woman)).toBe(false);
    expect(fitsAudience(potenton, woman)).toBe(false);
    expect(fitsAudience(kids, woman)).toBe(false);
    expect(fitsAudience(general, woman)).toBe(true);
  });

  it("offers a man's formula to a man", () => {
    expect(fitsAudience(potenton, { who: ["self-man"] })).toBe(true);
  });

  it("offers a child only children's products", () => {
    expect(fitsAudience(kids, { who: ["child"] })).toBe(true);
    expect(fitsAudience(general, { who: ["child"] })).toBe(false);
  });

  it("offers an expectant mother only prenatal products", () => {
    expect(fitsAudience(prenatal, { who: ["expectant"] })).toBe(true);
    expect(fitsAudience(general, { who: ["expectant"] })).toBe(false);
  });

  it("treats a skipped audience question as 'not for a specific audience'", () => {
    expect(fitsAudience(general, {})).toBe(true);
    expect(fitsAudience(prenatal, {})).toBe(false);
  });
});
