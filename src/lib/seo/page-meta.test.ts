import { describe, expect, it } from "vitest";
import uz from "@/messages/uz.json";
import ru from "@/messages/ru.json";
import { CATEGORY_SEO } from "@/lib/content/category-seo";
import { clampDescription, DESCRIPTION_MAX } from "./page-meta";

const MESSAGES = { uz, ru };

describe("clampDescription", () => {
  it("keeps short copy and collapses whitespace", () => {
    expect(clampDescription("  Vitaminlar   va BAD ")).toBe("Vitaminlar va BAD");
  });

  it("cuts long copy at a word boundary within the limit", () => {
    const long = "soʻz ".repeat(80);
    const out = clampDescription(long);
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });
});

describe("search titles", () => {
  // Typical-length real names per page type.
  const sample = {
    product: "Swiss Energy Prenatal Forte 60",
    category: "Shipuchi tabletkalar",
    brand: "Swiss Energy",
    program: "30 kunlik immunitet",
  };

  for (const [locale, m] of Object.entries(MESSAGES)) {
    it(`${locale}: templated titles stay readable in a result (≤ 70 chars for a typical name)`, () => {
      for (const key of ["product", "category", "brand", "program"] as const) {
        const title = m.meta.seo[key].replace("{name}", sample[key]);
        expect(title.length, `${key}: ${title}`).toBeLessThanOrEqual(70);
      }
    });

    it(`${locale}: every static page has a title ≤ 70 and a description of 70–${DESCRIPTION_MAX}`, () => {
      for (const [key, page] of Object.entries(m.meta.pages)) {
        expect(page.title.length, key).toBeLessThanOrEqual(70);
        // Templated values ({hours}, {free}…) are short numbers; measure with them stripped.
        const len = page.description.replace(/\{\w+\}/g, "000").length;
        expect(len, key).toBeGreaterThanOrEqual(70);
        expect(len, key).toBeLessThanOrEqual(DESCRIPTION_MAX);
      }
    });
  }

  it("uz and ru describe the same static pages", () => {
    expect(Object.keys(uz.meta.pages).sort()).toEqual(Object.keys(ru.meta.pages).sort());
  });
});

describe("category copy", () => {
  it("has both languages for every shelf", () => {
    for (const [slug, copy] of Object.entries(CATEGORY_SEO)) {
      expect(copy.uz.length, slug).toBeGreaterThan(0);
      expect(copy.ru.length, slug).toBe(copy.uz.length);
    }
  });

  it("writes Uzbek oʻ/gʻ with U+02BB, not an ASCII apostrophe", () => {
    for (const [slug, copy] of Object.entries(CATEGORY_SEO)) {
      for (const p of copy.uz) expect(p, slug).not.toMatch(/[og]'/i);
    }
  });

  it("makes no medical promise", () => {
    const banned = /davolaydi|kamaytiradi|100% natija|излечива|вылечи|100% результат/i;
    for (const copy of Object.values(CATEGORY_SEO)) {
      for (const p of [...copy.uz, ...copy.ru]) expect(p).not.toMatch(banned);
    }
  });
});
