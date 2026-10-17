import { describe, expect, it } from "vitest";
import type { Promotion } from "@/lib/shopflow/types";
import {
  CODE_ALPHABET,
  applyAdjustment,
  chooseAdjustment,
  eligibleSubtotal,
  evaluatePromo,
  firstOrderDiscount,
  generatePromoCode,
  lineAfterPromotions,
  normalizePromoCode,
  phone9Of,
  promoDiscount,
  subtotalAfterOffers,
  type PromoDefinition,
  type PromoLine,
} from "./rules";

const line = (over: Partial<PromoLine> = {}): PromoLine => ({ slug: "a", price: 100_000, quantity: 1, ...over });

const def = (over: Partial<PromoDefinition> = {}): PromoDefinition => ({
  code: "GV-TEST22",
  kind: "percent",
  value: 10,
  minSubtotal: null,
  maxUses: null,
  uses: 0,
  perPhoneLimit: 1,
  phone9: null,
  productSlugs: null,
  startsAt: null,
  endsAt: null,
  active: true,
  ...over,
});

const now = new Date("2026-10-17T10:00:00Z");
const percentOff = (percent: number, productSlugs?: string[]): Promotion => ({ id: "p", type: "percent_off", percent, title: "", description: "", productSlugs });
const twoPlusOne: Promotion = { id: "b", type: "buy_x_get_y", title: "", description: "" };

describe("normalizePromoCode", () => {
  it("upper-cases, strips spaces and folds dashes", () => {
    expect(normalizePromoCode("  gv-7k3p9q ")).toBe("GV-7K3P9Q");
    expect(normalizePromoCode("gv – 7k3p9q")).toBe("GV-7K3P9Q");
    expect(normalizePromoCode("ｇｖ７")).toBe("GV7");
  });
  it("rejects what cannot be a code", () => {
    expect(normalizePromoCode("")).toBeNull();
    expect(normalizePromoCode("ab")).toBeNull();
    expect(normalizePromoCode("-ABC")).toBeNull();
    expect(normalizePromoCode("GV_123")).toBeNull();
    expect(normalizePromoCode("A".repeat(33))).toBeNull();
    expect(normalizePromoCode(undefined)).toBeNull();
  });
});

describe("phone9Of", () => {
  it("matches one customer across formats", () => {
    expect(phone9Of("+998 90 123-45-67")).toBe("901234567");
    expect(phone9Of("90 123 45 67")).toBe("901234567");
    expect(phone9Of("12345")).toBeNull();
  });
});

describe("eligible subtotal", () => {
  it("skips offer and subscription lines", () => {
    const lines = [line(), line({ slug: "b", upsellDiscountPercent: 15 }), line({ slug: "c", subscription: { intervalDays: 30 } })];
    expect(eligibleSubtotal(lines, [])).toBe(100_000);
  });
  it("keeps to the product scope", () => {
    const lines = [line(), line({ slug: "b", price: 50_000 })];
    expect(eligibleSubtotal(lines, [], ["b"])).toBe(50_000);
    expect(eligibleSubtotal(lines, [], [])).toBe(150_000);
  });
  it("takes site promotions off first", () => {
    expect(lineAfterPromotions(line({ quantity: 3 }), [twoPlusOne])).toBe(200_000);
    expect(lineAfterPromotions(line(), [percentOff(20)])).toBe(80_000);
    expect(lineAfterPromotions(line(), [percentOff(20, ["zzz"])])).toBe(100_000);
  });
  it("measures the basket after line offers for min_subtotal", () => {
    const lines = [line(), line({ slug: "b", upsellDiscountPercent: 10 })];
    expect(subtotalAfterOffers(lines, [])).toBe(190_000);
  });
});

describe("promoDiscount", () => {
  it("is a share of the base for percent codes", () => {
    expect(promoDiscount({ kind: "percent", value: 15 }, 200_000)).toBe(30_000);
  });
  it("caps a fixed code at the base", () => {
    expect(promoDiscount({ kind: "fixed", value: 50_000 }, 30_000)).toBe(30_000);
    expect(promoDiscount({ kind: "fixed", value: 50_000 }, 0)).toBe(0);
  });
});

describe("evaluatePromo", () => {
  const ctx = { lines: [line({ quantity: 2 })], promotions: [], now };

  it("prices a valid code", () => {
    expect(evaluatePromo(def(), ctx)).toEqual({ ok: true, code: "GV-TEST22", discount: 20_000, eligibleSubtotal: 200_000 });
  });
  it("names an unknown code", () => {
    expect(evaluatePromo(null, ctx)).toEqual({ ok: false, reason: "not_found" });
  });
  it("respects active and dates", () => {
    expect(evaluatePromo(def({ active: false }), ctx)).toMatchObject({ reason: "inactive" });
    expect(evaluatePromo(def({ startsAt: new Date("2026-10-18T00:00:00Z") }), ctx)).toMatchObject({ reason: "not_started" });
    expect(evaluatePromo(def({ endsAt: new Date("2026-10-17T10:00:00Z") }), ctx)).toMatchObject({ reason: "expired" });
    expect(evaluatePromo(def({ endsAt: new Date("2026-10-17T10:00:01Z") }), ctx).ok).toBe(true);
  });
  it("stops at max uses", () => {
    expect(evaluatePromo(def({ maxUses: 1, uses: 1 }), ctx)).toMatchObject({ reason: "exhausted" });
    expect(evaluatePromo(def({ maxUses: 2, uses: 1 }), ctx).ok).toBe(true);
  });
  it("applies the per-phone limit only once the phone is known", () => {
    expect(evaluatePromo(def(), { ...ctx, phoneUses: 1 }).ok).toBe(true);
    expect(evaluatePromo(def(), { ...ctx, phone9: "901234567", phoneUses: 1 })).toMatchObject({ reason: "already_used" });
    expect(evaluatePromo(def({ perPhoneLimit: 3 }), { ...ctx, phone9: "901234567", phoneUses: 2 }).ok).toBe(true);
  });
  it("binds a personal code to its phone", () => {
    const personal = def({ phone9: "901234567" });
    expect(evaluatePromo(personal, { ...ctx, phone9: "909999999" })).toMatchObject({ reason: "wrong_phone" });
    expect(evaluatePromo(personal, { ...ctx, phone9: "901234567" }).ok).toBe(true);
    expect(evaluatePromo(personal, ctx).ok).toBe(true);
  });
  it("says how much is missing below the minimum", () => {
    expect(evaluatePromo(def({ minSubtotal: 250_000 }), ctx)).toEqual({ ok: false, reason: "min_subtotal", minSubtotal: 250_000, remaining: 50_000 });
    expect(evaluatePromo(def({ minSubtotal: 200_000 }), ctx).ok).toBe(true);
  });
  it("refuses a cart with nothing it may discount", () => {
    expect(evaluatePromo(def({ productSlugs: ["other"] }), ctx)).toMatchObject({ reason: "not_applicable" });
    expect(evaluatePromo(def(), { ...ctx, lines: [line({ upsellDiscountPercent: 10 })] })).toMatchObject({ reason: "not_applicable" });
    expect(evaluatePromo(def(), { ...ctx, lines: [line({ subscription: { intervalDays: 30 } })] })).toMatchObject({ reason: "not_applicable" });
  });
  it("does not stack on offer lines in a mixed cart", () => {
    const lines = [line(), line({ slug: "b", upsellDiscountPercent: 20 })];
    expect(evaluatePromo(def({ value: 50 }), { ...ctx, lines })).toMatchObject({ ok: true, discount: 50_000 });
  });
  it("discounts what a line costs after a site promotion", () => {
    const lines = [line({ quantity: 3 })];
    expect(evaluatePromo(def(), { ...ctx, lines, promotions: [twoPlusOne] })).toMatchObject({ ok: true, discount: 20_000 });
  });
  it("caps a fixed code at the scoped lines", () => {
    const lines = [line({ slug: "a", price: 30_000 }), line({ slug: "b", price: 500_000 })];
    expect(evaluatePromo(def({ kind: "fixed", value: 50_000, productSlugs: ["a"] }), { ...ctx, lines })).toMatchObject({ ok: true, discount: 30_000 });
  });
});

describe("first order vs promo", () => {
  it("prices the first-order discount on discountable lines", () => {
    expect(firstOrderDiscount([line(), line({ slug: "b", upsellDiscountPercent: 15 })], [], 10)).toBe(10_000);
    expect(firstOrderDiscount([line()], [], 0)).toBe(0);
  });
  it("applies the larger one", () => {
    expect(chooseAdjustment({ code: "X", discount: 15_000 }, { percent: 10, amount: 10_000 })).toEqual({ kind: "promo", code: "X", amount: 15_000 });
    expect(chooseAdjustment({ code: "X", discount: 5_000 }, { percent: 10, amount: 10_000 })).toEqual({ kind: "first_order", percent: 10, amount: 10_000 });
  });
  it("gives a tie to the first order so the code is kept", () => {
    expect(chooseAdjustment({ code: "X", discount: 10_000 }, { percent: 10, amount: 10_000 })).toMatchObject({ kind: "first_order" });
  });
  it("handles either alone, or neither", () => {
    expect(chooseAdjustment({ code: "X", discount: 1 }, null)).toMatchObject({ kind: "promo" });
    expect(chooseAdjustment(null, { percent: 10, amount: 1 })).toMatchObject({ kind: "first_order" });
    expect(chooseAdjustment(null, { percent: 10, amount: 0 })).toBeNull();
    expect(chooseAdjustment(null, null)).toBeNull();
  });
});

describe("applyAdjustment", () => {
  const totals = { subtotal: 200_000, discount: 0, shipping: 30_000, total: 230_000 };
  it("folds the discount in and keeps shipping", () => {
    expect(applyAdjustment(totals, { kind: "promo", code: "X", amount: 20_000 })).toEqual({
      subtotal: 200_000,
      discount: 20_000,
      shipping: 30_000,
      total: 210_000,
      adjustments: [{ kind: "promo", code: "X", amount: 20_000 }],
    });
  });
  it("never takes the goods below zero", () => {
    expect(applyAdjustment(totals, { kind: "promo", code: "X", amount: 999_999 }).total).toBe(30_000);
  });
  it("leaves totals alone without an adjustment", () => {
    expect(applyAdjustment(totals, null)).toBe(totals);
  });
});

describe("generatePromoCode", () => {
  it("uses only unambiguous characters", () => {
    expect(CODE_ALPHABET).not.toMatch(/[01OIL]/);
    let i = 0;
    const code = generatePromoCode(() => i++ % CODE_ALPHABET.length);
    expect(code).toBe("GV-ABCDEF");
    expect(normalizePromoCode(code)).toBe(code);
  });
  it("supports a bare code and other prefixes", () => {
    expect(generatePromoCode(() => 0, "", 8)).toBe("AAAAAAAA");
    expect(generatePromoCode(() => 30, "BD")).toBe("BD-999999");
  });
});
