import { describe, expect, it } from "vitest";
import { normalizePromoCode, chooseAdjustment } from "@/lib/promo/rules";
import { evaluateReferral, generateReferralCode, isReferralCode, referralLink, rewardAllowed, tashkentMonthStart } from "./rules";

const ok = { enabled: true, ownerPhone9: "901111111", phone9: "902222222", previousOrders: 0, alreadyReferred: false };

describe("referral codes", () => {
  it("look like GV + 6 readable characters and never like a promo code", () => {
    const code = generateReferralCode(() => 0);
    expect(code).toBe("GVAAAAAA");
    expect(isReferralCode(code)).toBe(true);
    expect(isReferralCode("GV-AAAAAA")).toBe(false);
    expect(isReferralCode("GVAAAAA0")).toBe(false); // 0 is not in the readable alphabet
    expect(isReferralCode("GVAAAAAI")).toBe(false);
    expect(normalizePromoCode(" gv7k3p9q ")).toBe("GV7K3P9Q");
    expect(isReferralCode(normalizePromoCode(" gv7k3p9q "))).toBe(true);
  });

  it("share as a link that pre-fills the cart", () => {
    expect(referralLink("https://www.govita.uz/", "ru", "GV7K3P9Q")).toBe("https://www.govita.uz/ru?ref=GV7K3P9Q");
  });
});

describe("evaluateReferral", () => {
  it("accepts a new phone with someone else's code", () => {
    expect(evaluateReferral(ok)).toEqual({ ok: true });
  });
  it("refuses your own code", () => {
    expect(evaluateReferral({ ...ok, phone9: ok.ownerPhone9 })).toEqual({ ok: false, reason: "self" });
  });
  it("is for the first order only, once per referred phone", () => {
    expect(evaluateReferral({ ...ok, previousOrders: 1 })).toEqual({ ok: false, reason: "not_first" });
    expect(evaluateReferral({ ...ok, alreadyReferred: true })).toEqual({ ok: false, reason: "already_referred" });
  });
  it("needs the programme on and a real code", () => {
    expect(evaluateReferral({ ...ok, enabled: false })).toEqual({ ok: false, reason: "off" });
    expect(evaluateReferral({ ...ok, ownerPhone9: null })).toEqual({ ok: false, reason: "not_found" });
    expect(evaluateReferral({ ...ok, phone9: null })).toEqual({ ok: false, reason: "needs_phone" });
  });
});

describe("rewards", () => {
  it("are capped per month", () => {
    expect(rewardAllowed(9, 10)).toBe(true);
    expect(rewardAllowed(10, 10)).toBe(false);
  });
  it("count months in Tashkent time", () => {
    // 31 Oct 20:00 UTC is already 1 Nov in Tashkent.
    expect(tashkentMonthStart(new Date("2026-10-31T20:00:00Z")).toISOString()).toBe("2026-10-31T19:00:00.000Z");
    expect(tashkentMonthStart(new Date("2026-10-15T10:00:00Z")).toISOString()).toBe("2026-09-30T19:00:00.000Z");
  });
  it("the friend's discount competes with the first-order one like a promo code", () => {
    expect(chooseAdjustment({ code: "GVAAAAAA", discount: 15_000, referralPercent: 15 }, { percent: 10, amount: 10_000 })).toEqual({
      kind: "referral",
      code: "GVAAAAAA",
      percent: 15,
      amount: 15_000,
    });
    expect(chooseAdjustment({ code: "GVAAAAAA", discount: 10_000, referralPercent: 10 }, { percent: 10, amount: 10_000 })?.kind).toBe("first_order");
  });
});
