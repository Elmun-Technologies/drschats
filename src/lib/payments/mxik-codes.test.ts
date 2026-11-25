import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { rawProducts } from "@/lib/shopflow/mock";

const read = (file: string) => readFileSync(join(process.cwd(), "db/migrations", file), "utf8");
const rowsOf = (sql: string) => [...sql.matchAll(/\('([a-z0-9-]+)', '([^']*)'\)/g)].map((m) => ({ slug: m[1], mxik: m[2] }));

const first = read("0035_mxik_codes.sql");
const recheck = read("0038_mxik_codes_2026_11_25.sql");

/* The codes the Dr Schatz price list (25.11.2026, column «ИКПУ») uses for what the shop sells. */
const LIST_CODES = new Set([
  "02106999028000000", // Биологически активные добавки к пище
  "09018001227000000", // тонометры
  "09018001229000000", // ингаляторы (прочие мед. инструменты)
  "09025001002000000", // термометры
  "03304999072000000", // пластырь косметический
]);

/* Catalogue products the list does not name: their code has to come from the accountant. */
const NOT_ON_LIST = [
  "swiss-energy-neuroforce-30",
  "aminomorin-forte-30",
  "peano-balzam-30g",
  "hamdard-safi-eks1-200ml",
  "swiss-energy-coffee-edel-250g",
  "swiss-energy-coffee-edel-500g",
  "swiss-energy-coffee-crema-250g",
  "swiss-energy-coffee-crema-500g",
  "swiss-energy-coffee-mokka-500g",
];

describe("MXIK codes (0035, re-checked in 0038)", () => {
  it("fills real catalogue products with 17-digit codes", () => {
    const slugs = new Set(rawProducts.map((p) => p.slug));
    for (const rows of [rowsOf(first), rowsOf(recheck)]) {
      expect(rows.length).toBe(21);
      for (const r of rows) {
        expect(slugs.has(r.slug), r.slug).toBe(true);
        expect(r.mxik, r.slug).toMatch(/^\d{17}$/);
      }
      expect(new Set(rows.map((r) => r.slug)).size).toBe(rows.length);
    }
  });

  it("0035 never overwrites a code typed in the admin", () => {
    expect(first).toMatch(/and p\.mxik_code is null/);
  });

  it("0038 sets the 25.11.2026 list's code wherever the product has another one", () => {
    expect(recheck).toMatch(/and p\.mxik_code is distinct from v\.mxik/);
    for (const r of rowsOf(recheck)) expect(LIST_CODES.has(r.mxik), r.slug).toBe(true);
    expect(rowsOf(recheck)).toEqual(rowsOf(first));
  });

  it("covers the whole catalogue except the products the list does not name", () => {
    const covered = new Set(rowsOf(recheck).map((r) => r.slug));
    const uncovered = rawProducts.map((p) => p.slug).filter((slug) => !covered.has(slug)).sort();
    expect(uncovered).toEqual([...NOT_ON_LIST].sort());
  });
});
