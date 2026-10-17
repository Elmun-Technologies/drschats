import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { abHeadScript, abSlotCss, assignVariant, fnv1a, normalCdf, pairVariants, shownVariant, tashkentDay, twoProportionZ } from "./ab";

const ids = Array.from({ length: 4000 }, (_, i) => `visitor${i.toString(36).padStart(6, "0")}`);

describe("variant assignment", () => {
  it("is deterministic per visitor and experiment", () => {
    for (const id of ids.slice(0, 50)) expect(assignVariant(id, "hero-oct")).toBe(assignVariant(id, "hero-oct"));
  });

  it("splits close to 50/50", () => {
    const b = ids.filter((id) => assignVariant(id, "hero-oct") === "B").length;
    expect(b / ids.length).toBeGreaterThan(0.46);
    expect(b / ids.length).toBeLessThan(0.54);
  });

  it("is independent across experiments", () => {
    const same = ids.filter((id) => assignVariant(id, "hero-oct") === assignVariant(id, "strip-nov")).length;
    expect(same / ids.length).toBeGreaterThan(0.45);
    expect(same / ids.length).toBeLessThan(0.55);
  });

  it("uses standard 32-bit FNV-1a", () => {
    expect(fnv1a("")).toBe(0x811c9dc5);
    expect(fnv1a("a")).toBe(0xe40c292c);
  });
});

describe("the <head> script", () => {
  function run(cookie: string, keys: string[]): string | null {
    let attr: string | null = null;
    const document = { cookie, documentElement: { setAttribute: (_: string, v: string) => (attr = v) } };
    runInNewContext(abHeadScript(keys), { document, Math });
    return attr;
  }

  it("assigns exactly what the server-side function assigns", () => {
    for (const id of ids.slice(0, 300)) {
      const attr = run(`other=1; gv_ab=${id}; x=2`, ["hero-oct", "strip-nov"]);
      expect(attr).toBe(`hero-oct:${assignVariant(id, "hero-oct")} strip-nov:${assignVariant(id, "strip-nov")}`);
      expect(shownVariant(attr, "hero-oct")).toBe(assignVariant(id, "hero-oct"));
    }
  });

  it("does nothing without the cookie (everyone sees A) and drops malformed keys", () => {
    expect(run("other=1", ["hero-oct"])).toBeNull();
    expect(shownVariant(null, "hero-oct")).toBe("A");
    expect(abHeadScript(["ok-key", "</script><script>alert(1)", "BAD"])).not.toContain("alert");
  });

  it("CSS hides B by default and shows it only for B visitors", () => {
    const css = abSlotCss("hero-oct");
    expect(css).toContain('[data-ab-slot="hero-oct"]>[data-variant="B"]{display:none}');
    expect(css).toContain('html[data-ab~="hero-oct:B"] [data-ab-slot="hero-oct"]>[data-variant="A"]{display:none}');
    expect(abSlotCss("x\"}body{display:none")).toBe("");
  });
});

describe("two-proportion z-test", () => {
  it("normal CDF is accurate", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
  });

  it("says nothing below the minimum sample", () => {
    const t = twoProportionZ({ exposures: 50, clicks: 5 }, { exposures: 50, clicks: 20 });
    expect(t.enough).toBe(false);
    expect(t.significant).toBe(false);
    expect(t.winner).toBeNull();
  });

  it("finds a clear difference and names the winner", () => {
    const t = twoProportionZ({ exposures: 2000, clicks: 100 }, { exposures: 2000, clicks: 160 });
    expect(t.enough).toBe(true);
    expect(t.ctrA).toBeCloseTo(0.05);
    expect(t.ctrB).toBeCloseTo(0.08);
    expect(t.z).toBeGreaterThan(3);
    expect(t.p).toBeLessThan(0.01);
    expect(t.winner).toBe("B");
  });

  it("does not call noise a winner", () => {
    const t = twoProportionZ({ exposures: 1000, clicks: 50 }, { exposures: 1000, clicks: 55 });
    expect(t.enough).toBe(true);
    expect(t.significant).toBe(false);
    expect(t.p).toBeGreaterThan(0.05);
  });

  it("matches a textbook value", () => {
    // p1 = 0.10, p2 = 0.13, n = 1000 each: pooled 0.115, SE = √(0.115·0.885·2/1000) ≈ 0.014267 → z ≈ 2.1027, p ≈ 0.0355
    const t = twoProportionZ({ exposures: 1000, clicks: 100 }, { exposures: 1000, clicks: 130 });
    expect(t.z).toBeCloseTo(2.1027, 3);
    expect(t.p).toBeCloseTo(0.0355, 3);
  });
});

describe("pairVariants", () => {
  it("pairs both live variants and leaves a lone one as a plain banner", () => {
    const rows = [
      { id: 1, experiment: null, variant: null },
      { id: 2, experiment: "hero", variant: "A" as const },
      { id: 3, experiment: "hero", variant: "B" as const },
      { id: 4, experiment: "strip", variant: "B" as const },
    ];
    const { single, pairs } = pairVariants(rows);
    expect(pairs).toEqual([{ key: "hero", A: rows[1], B: rows[2] }]);
    expect(single.map((s) => s.id).sort()).toEqual([1, 4]);
  });
});

describe("tashkentDay", () => {
  it("counts days in Tashkent time", () => {
    expect(tashkentDay(new Date("2026-10-17T19:30:00Z"))).toBe("2026-10-18");
    expect(tashkentDay(new Date("2026-10-17T18:59:00Z"))).toBe("2026-10-17");
  });
});
