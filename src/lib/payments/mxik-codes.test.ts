import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { rawProducts } from "@/lib/shopflow/mock";

const sql = readFileSync(join(process.cwd(), "db/migrations/0035_mxik_codes.sql"), "utf8");
const rows = [...sql.matchAll(/\('([a-z0-9-]+)', '([^']*)'\)/g)].map((m) => ({ slug: m[1], mxik: m[2] }));

describe("0035 MXIK codes", () => {
  it("fills real catalogue products with 17-digit codes", () => {
    const slugs = new Set(rawProducts.map((p) => p.slug));
    expect(rows.length).toBe(21);
    for (const r of rows) {
      expect(slugs.has(r.slug), r.slug).toBe(true);
      expect(r.mxik, r.slug).toMatch(/^\d{17}$/);
    }
    expect(new Set(rows.map((r) => r.slug)).size).toBe(rows.length);
  });

  it("never overwrites a code typed in the admin", () => {
    expect(sql).toMatch(/and p\.mxik_code is null/);
  });
});
