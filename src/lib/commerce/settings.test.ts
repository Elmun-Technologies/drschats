import { describe, expect, it } from "vitest";
import { COMMERCE } from "@/lib/config/commerce";
import {
  DEFAULT_COMMERCE_SETTINGS,
  coerceCommerceSettings,
  defaultCommerceSettings,
  ladderPercentsAccepted,
  localizedOr,
  normalizeCutoff,
  parseStoredCommerceSettings,
  pricingRulesOf,
} from "./settings";
import { parseCommerceSection } from "./form";

describe("commerce settings defaults", () => {
  it("are today's constants exactly", () => {
    const d = defaultCommerceSettings();
    expect(d.delivery.freeShippingOver).toBe(COMMERCE.freeShippingOver);
    expect(d.delivery.courierFee).toBe(COMMERCE.shippingFee);
    expect(d.subscription).toEqual({
      firstPercent: COMMERCE.discounts.subscriptionFirstPercent,
      recurringPercent: COMMERCE.discounts.subscriptionRecurringPercent,
    });
    expect(d.ladder).toEqual({ enabled: true, percents: [10, 15, 20], freeGift: true });
    expect(d.cart.gapWindow).toBe(150_000);
    expect(d.popups.welcome).toMatchObject({ enabled: true, delaySeconds: 20, cooldownDays: 30 });
    expect(d.popups.exit).toMatchObject({ enabled: true, delaySeconds: 4, cooldownDays: 3 });
    expect(d.popups.quiz).toMatchObject({ enabled: true, delaySeconds: 4, cooldownDays: 7 });
    expect([...ladderPercentsAccepted(d.ladder)].sort((a, b) => a - b)).toEqual([10, 15, 20, 100]);
  });
});

describe("parseStoredCommerceSettings", () => {
  it("falls back to the defaults on no row, bad JSON or the wrong shape", () => {
    for (const raw of [null, undefined, "", "{not json", "[]", "42", '"text"', "null"]) {
      expect(parseStoredCommerceSettings(raw).settings).toEqual(DEFAULT_COMMERCE_SETTINGS);
    }
  });

  it("keeps the valid fields and drops each bad one to its own default", () => {
    const raw = JSON.stringify({
      settings: {
        delivery: { freeShippingOver: 250_000, courierFee: -5, cutoff: "25:00", regionsNote: { uz: "2–4 kun", ru: 7 } },
        ladder: { enabled: false, percents: [20, 15, 10], freeGift: "yes" },
        subscription: { firstPercent: 20, recurringPercent: 10 },
        cart: { gapWindow: "100000" },
        popups: { welcome: { enabled: false, delaySeconds: 1e9, cooldownDays: 2.5 }, exit: "off" },
      },
      meta: { delivery: { by: "Ali", at: "2026-10-17T10:00:00.000Z" }, ladder: { by: 3 } },
    });
    const { settings, meta } = parseStoredCommerceSettings(raw);
    expect(settings.delivery).toEqual({ freeShippingOver: 250_000, courierFee: 30_000, cutoff: DEFAULT_COMMERCE_SETTINGS.delivery.cutoff, regionsNote: { uz: "2–4 kun", ru: "" } });
    expect(settings.ladder).toEqual({ enabled: false, percents: [10, 15, 20], freeGift: true });
    // A later delivery may never cost more than the first.
    expect(settings.subscription).toEqual(DEFAULT_COMMERCE_SETTINGS.subscription);
    expect(settings.cart.gapWindow).toBe(100_000);
    expect(settings.popups.welcome).toMatchObject({ enabled: false, delaySeconds: 20, cooldownDays: 30 });
    expect(settings.popups.exit).toEqual(DEFAULT_COMMERCE_SETTINGS.popups.exit);
    expect(meta).toEqual({ delivery: { by: "Ali", at: "2026-10-17T10:00:00.000Z" } });
  });

  it("rejects ladder percents outside the safe set", () => {
    expect(coerceCommerceSettings({ ladder: { percents: [10, 15, 90] } }).ladder.percents).toEqual([10, 15, 20]);
    expect(coerceCommerceSettings({ ladder: { percents: [5, 12, 30] } }).ladder.percents).toEqual([5, 12, 30]);
  });

  it("derives the pricing rules and the accepted ladder percents from one value", () => {
    const s = coerceCommerceSettings({ delivery: { freeShippingOver: 250_000, courierFee: 25_000 }, ladder: { percents: [5, 12, 25], freeGift: false } });
    expect(pricingRulesOf(s)).toEqual({ freeShippingOver: 250_000, shippingFee: 25_000, subscriptionFirstPercent: 10, subscriptionRecurringPercent: 15 });
    expect([...ladderPercentsAccepted(s.ladder)].sort((a, b) => a - b)).toEqual([5, 12, 25]);
    expect(ladderPercentsAccepted({ ...s.ladder, enabled: false }).size).toBe(0);
  });
});

describe("helpers", () => {
  it("normalizes the cut-off", () => {
    expect(normalizeCutoff("9:30")).toBe("09:30");
    expect(normalizeCutoff(" 18:00 ")).toBe("18:00");
    expect(normalizeCutoff("")).toBe("");
    expect(normalizeCutoff("24:00")).toBeNull();
    expect(normalizeCutoff("6pm")).toBeNull();
  });

  it("uses an override only when one was written", () => {
    expect(localizedOr({ uz: "2–4 kun", ru: "" }, "uz", "1–3 kun")).toBe("2–4 kun");
    expect(localizedOr({ uz: "2–4 kun", ru: "  " }, "ru", "1–3 дня")).toBe("1–3 дня");
  });
});

describe("admin form", () => {
  it("accepts spaced thousands and an empty cut-off", () => {
    const r = parseCommerceSection("delivery", { freeShippingOver: "250 000", courierFee: "25000", cutoff: "", "regionsNote.uz": "", "regionsNote.ru": "" });
    expect(r).toEqual({ ok: true, value: { freeShippingOver: 250_000, courierFee: 25_000, cutoff: "", regionsNote: { uz: "", ru: "" } } });
  });

  it("refuses negative or non-numeric amounts, bad times and out-of-order ladders", () => {
    expect(parseCommerceSection("delivery", { freeShippingOver: "-1", courierFee: "0", cutoff: "" }).ok).toBe(false);
    expect(parseCommerceSection("delivery", { freeShippingOver: "abc", courierFee: "0", cutoff: "" }).ok).toBe(false);
    expect(parseCommerceSection("delivery", { freeShippingOver: "0", courierFee: "0", cutoff: "26:10" }).ok).toBe(false);
    expect(parseCommerceSection("ladder", { p1: "15", p2: "10", p3: "20", enabled: "on" }).ok).toBe(false);
    expect(parseCommerceSection("ladder", { p1: "10", p2: "15", p3: "40", enabled: "on" }).ok).toBe(false);
    expect(parseCommerceSection("subscription", { firstPercent: "20", recurringPercent: "10" }).ok).toBe(false);
    expect(parseCommerceSection("subscription", { firstPercent: "10", recurringPercent: "60" }).ok).toBe(false);
  });

  it("reads unchecked boxes as off", () => {
    const r = parseCommerceSection("ladder", { p1: "5", p2: "12", p3: "25" });
    expect(r).toEqual({ ok: true, value: { enabled: false, percents: [5, 12, 25], freeGift: false } });
  });
});
