import { describe, expect, it } from "vitest";
import { pricePerServing, subscriptionPricing } from "./plans";

describe("pricePerServing", () => {
  it("divides by the dose count when the pack is a countable dose", () => {
    expect(pricePerServing(120000, "30 kapsula")).toBe(4000);
    expect(pricePerServing(120000, "60 kapsula")).toBe(2000);
    expect(pricePerServing(118000, "20 tabletka")).toBe(5900);
    expect(pricePerServing(118000, "20 shipuchi tabletka")).toBe(5900);
    expect(pricePerServing(120000, "30 капсул")).toBe(4000);
  });

  it("refuses to invent a dose for weight, volume or a single item", () => {
    // These are what produced the old "502 so'm / porsiya" for a 118 000
    // so'm bottle: the number in the string was a volume, not a dose count.
    expect(pricePerServing(118000, "1 shisha · 200 ml")).toBeNull();
    expect(pricePerServing(118000, "200 ml")).toBeNull();
    expect(pricePerServing(110000, "250 g")).toBeNull();
    expect(pricePerServing(110000, "500 g")).toBeNull();
    expect(pricePerServing(242000, "1 dona")).toBeNull();
    expect(pricePerServing(242000, "1 dona, 2 yillik kafolat")).toBeNull();
    expect(pricePerServing(90000, "Kukun, banka")).toBeNull();
    expect(pricePerServing(90000, undefined)).toBeNull();
  });
});

describe("subscriptionPricing", () => {
  it("keeps the subscription discounts in one place", () => {
    const pricing = subscriptionPricing(100000);
    expect(pricing.firstPercent).toBe(10);
    expect(pricing.recurringPercent).toBe(15);
    expect(pricing.firstPrice).toBe(90000);
    expect(pricing.recurringPrice).toBe(85000);
  });
});
