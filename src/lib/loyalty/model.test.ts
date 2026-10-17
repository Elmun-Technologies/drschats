import { describe, expect, it } from "vitest";
import { DEFAULT_LOYALTY_RULES, coerceLoyaltyRules, earnFor, lotExpiry, maxRedeemable, parseLoyaltyRules, paidGoods, referralRewardKind } from "./model";
import { applyAdjustment, applyPoints, discountAdjustment, pointsSpent } from "@/lib/promo/rules";

describe("loyalty rules", () => {
  it("is off by default and on a broken value", () => {
    expect(DEFAULT_LOYALTY_RULES.enabled).toBe(false);
    expect(DEFAULT_LOYALTY_RULES.referral.enabled).toBe(false);
    expect(DEFAULT_LOYALTY_RULES.birthday.enabled).toBe(false);
    expect(parseLoyaltyRules("{oops")).toEqual(DEFAULT_LOYALTY_RULES);
    expect(parseLoyaltyRules(null)).toEqual(DEFAULT_LOYALTY_RULES);
    expect(DEFAULT_LOYALTY_RULES).toMatchObject({ earnPercent: 3, maxSharePercent: 30, expiryDays: 180 });
  });

  it("falls back field by field and never to 'on'", () => {
    const r = coerceLoyaltyRules({ enabled: "yes", earnPercent: 500, maxSharePercent: 50, referral: { enabled: true, friendPercent: 0 } });
    expect(r.enabled).toBe(false);
    expect(r.earnPercent).toBe(3);
    expect(r.maxSharePercent).toBe(50);
    expect(r.referral.enabled).toBe(true);
    expect(r.referral.friendPercent).toBe(10);
  });

  it("pays the referrer in points only while cashback is on", () => {
    expect(referralRewardKind({ ...DEFAULT_LOYALTY_RULES, enabled: true })).toBe("points");
    expect(referralRewardKind(DEFAULT_LOYALTY_RULES)).toBe("promo");
    expect(referralRewardKind({ ...DEFAULT_LOYALTY_RULES, enabled: true, referral: { ...DEFAULT_LOYALTY_RULES.referral, reward: "promo" } })).toBe("promo");
  });
});

describe("earning", () => {
  const on = { enabled: true, earnPercent: 3, minOrder: 0 };
  it("earns a percent of paid goods, never of shipping", () => {
    expect(paidGoods({ total: 125_000, shipping: 25_000 })).toBe(100_000);
    expect(earnFor({ total: 125_000, shipping: 25_000 }, on)).toBe(3000);
    expect(earnFor({ total: 100_333, shipping: 0 }, on)).toBe(3009);
  });
  it("earns nothing when off or below the minimum", () => {
    expect(earnFor({ total: 100_000, shipping: 0 }, { ...on, enabled: false })).toBe(0);
    expect(earnFor({ total: 99_000, shipping: 0 }, { ...on, minOrder: 100_000 })).toBe(0);
    expect(earnFor({ total: 100_000, shipping: 0 }, { ...on, minOrder: 100_000 })).toBe(3000);
  });
  it("gives a lot its end date", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(lotExpiry(now, 180)?.toISOString()).toBe("2026-06-30T00:00:00.000Z");
    expect(lotExpiry(now, 0)).toBeNull();
  });
});

describe("maxRedeemable", () => {
  it("is the smallest of balance, share cap and token cap", () => {
    expect(maxRedeemable({ balance: 50_000, goods: 100_000, maxSharePercent: 30 })).toBe(30_000);
    expect(maxRedeemable({ balance: 12_000, goods: 100_000, maxSharePercent: 30 })).toBe(12_000);
    expect(maxRedeemable({ balance: 50_000, goods: 100_000, maxSharePercent: 30, cap: 8_000 })).toBe(8_000);
    expect(maxRedeemable({ balance: 50_000, goods: 99_999, maxSharePercent: 30 })).toBe(29_999);
  });
  it("is zero without balance or goods", () => {
    expect(maxRedeemable({ balance: 0, goods: 100_000, maxSharePercent: 30 })).toBe(0);
    expect(maxRedeemable({ balance: -500, goods: 100_000, maxSharePercent: 30 })).toBe(0);
    expect(maxRedeemable({ balance: 5_000, goods: 0, maxSharePercent: 30 })).toBe(0);
  });
});

describe("points in the totals", () => {
  const base = { subtotal: 200_000, discount: 0, shipping: 25_000, total: 225_000 };
  it("come after the discount, lower total but not discount, and never pay shipping", () => {
    const discounted = applyAdjustment(base, { kind: "promo", code: "GV-AAAAAA", amount: 20_000 });
    const goods = paidGoods(discounted);
    expect(goods).toBe(180_000);
    const points = maxRedeemable({ balance: 100_000, goods, maxSharePercent: 30 });
    const final = applyPoints(discounted, points);
    expect(final.total).toBe(225_000 - 20_000 - 54_000);
    expect(final.discount).toBe(20_000);
    expect(final.adjustments?.map((a) => a.kind)).toEqual(["promo", "points"]);
    expect(discountAdjustment(final.adjustments)?.kind).toBe("promo");
    expect(pointsSpent(final.adjustments)).toBe(54_000);
    expect(applyPoints(base, 10_000_000).total).toBe(base.shipping);
  });
  it("stack with no discount at all", () => {
    const final = applyPoints(base, 1000);
    expect(final.adjustments).toEqual([{ kind: "points", amount: 1000 }]);
    expect(discountAdjustment(final.adjustments)).toBeNull();
  });
});
