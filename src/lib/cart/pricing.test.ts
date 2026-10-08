import { describe, it, expect } from "vitest";
import { bonusUnitsNeeded, cartLineId, computeTotals, DEFAULT_SHIPPING, type CartLine } from "./pricing";
import type { Promotion } from "@/lib/shopflow/types";
import {
  FIRST_ORDER_PERCENT,
  RECURRING_PERCENT,
  SUBSCRIPTION_FREE_SHIPPING_OVER,
} from "@/lib/subscription/plans";

const line = (over: Partial<CartLine> = {}): CartLine => {
  const productId = over.productId ?? "p1";
  return {
    lineId: cartLineId(productId, over.subscription),
    productId,
    slug: "p1",
    name: "Test",
    image: "",
    price: 100000,
    quantity: 1,
    ...over,
  };
};

const freeShipping: Promotion = {
  id: "ship",
  type: "free_shipping_over",
  threshold: 300000,
  title: "",
  description: "",
};

const buyXgetY: Promotion = {
  id: "bxgy",
  type: "buy_x_get_y",
  title: "",
  description: "",
};

describe("computeTotals", () => {
  it("computes subtotal and adds flat shipping below threshold", () => {
    const t = computeTotals([line({ quantity: 2 })], [freeShipping]);
    expect(t.subtotal).toBe(200000);
    expect(t.shipping).toBe(DEFAULT_SHIPPING);
    expect(t.freeShippingRemaining).toBe(100000);
    expect(t.total).toBe(200000 + DEFAULT_SHIPPING);
  });

  it("unlocks free shipping at/above threshold", () => {
    const t = computeTotals([line({ quantity: 3 })], [buyXgetY, freeShipping]);
    // buy 3 get 1 free => discount 100000; subtotal 300000; afterDiscount 200000
    expect(t.discount).toBe(100000);
    // afterDiscount 200000 < 300000 -> still charged shipping
    expect(t.shipping).toBe(DEFAULT_SHIPPING);
  });

  it("applies upsell line discount", () => {
    const t = computeTotals([line({ upsellDiscountPercent: 15 })]);
    expect(t.discount).toBe(15000);
    expect(t.total).toBe(100000 - 15000 + DEFAULT_SHIPPING);
  });

  it("is empty-safe", () => {
    const t = computeTotals([]);
    expect(t.subtotal).toBe(0);
    expect(t.shipping).toBe(0);
    expect(t.total).toBe(0);
    expect(t.itemCount).toBe(0);
  });

  it("buy-2-get-1 frees every third identical item", () => {
    const t = computeTotals([line({ quantity: 6, price: 50000 })], [buyXgetY]);
    expect(t.discount).toBe(2 * 50000);
  });
});

describe("computeTotals — subscriptions", () => {
  const subscribed = (over: Partial<CartLine> = {}) =>
    line({ subscription: { intervalDays: 30 }, ...over });

  it("charges the first-order discount today and quotes the recurring price", () => {
    const t = computeTotals([subscribed()]);
    expect(t.hasSubscription).toBe(true);
    expect(t.discount).toBe(100000 * (FIRST_ORDER_PERCENT / 100));
    expect(t.recurringTotal).toBe(100000 * (1 - RECURRING_PERCENT / 100));
  });

  it("counts quantity into both figures", () => {
    const t = computeTotals([subscribed({ quantity: 3 })]);
    expect(t.discount).toBe(300000 * (FIRST_ORDER_PERCENT / 100));
    expect(t.recurringTotal).toBe(300000 * (1 - RECURRING_PERCENT / 100));
  });

  it("does not stack with an upsell discount on the same line", () => {
    const t = computeTotals([subscribed({ upsellDiscountPercent: 20 })]);
    expect(t.discount).toBe(20000);
  });

  it("leaves one-off lines out of the recurring figure", () => {
    const t = computeTotals([subscribed(), line({ productId: "p2" })]);
    expect(t.subtotal).toBe(200000);
    expect(t.recurringTotal).toBe(100000 * (1 - RECURRING_PERCENT / 100));
  });

  it("lowers the free-shipping bar for a cart that repeats", () => {
    const t = computeTotals([subscribed({ quantity: 3 })]);
    expect(t.freeShippingThreshold).toBe(SUBSCRIPTION_FREE_SHIPPING_OVER);
    // 300 000 less the 10% first-order discount is still short of the bar.
    expect(t.shipping).toBe(DEFAULT_SHIPPING);
    expect(t.freeShippingRemaining).toBe(30000);
  });

  it("ships a large repeating order free", () => {
    const t = computeTotals([subscribed({ quantity: 4 })]);
    expect(t.shipping).toBe(0);
    expect(t.freeShippingRemaining).toBe(0);
  });

  it("keeps the promotion threshold when it is the lower of the two", () => {
    const generous = { ...freeShipping, threshold: 150000 };
    const t = computeTotals([subscribed({ quantity: 2 })], [generous]);
    expect(t.freeShippingThreshold).toBe(150000);
    expect(t.shipping).toBe(0);
  });

  it("reports nothing recurring for an ordinary cart", () => {
    const t = computeTotals([line()]);
    expect(t.hasSubscription).toBe(false);
    expect(t.recurringTotal).toBe(0);
  });
});

describe("promotion stacking", () => {
  const bonus = { id: "b", type: "buy_x_get_y" as const, title: "", description: "" };
  const line = (over: Partial<CartLine>): CartLine => ({
    lineId: "x",
    productId: "x",
    slug: "x",
    name: "x",
    image: "",
    price: 100_000,
    quantity: 3,
    ...over,
  });

  it("gives buy-2-get-1 only on lines without an offer of their own", () => {
    expect(computeTotals([line({})], [bonus]).discount).toBe(100_000);
    expect(computeTotals([line({ upsellDiscountPercent: 20 })], [bonus]).discount).toBe(60_000);
    expect(computeTotals([line({ subscription: { intervalDays: 30 } })], [bonus]).discount).toBe(30_000);
  });

  it("limits a promotion to its products when it names them", () => {
    expect(computeTotals([line({ slug: "other" })], [{ ...bonus, productSlugs: ["only-this"] }]).discount).toBe(0);
  });

  it("nudges toward the free unit at two of three", () => {
    expect(bonusUnitsNeeded(line({ quantity: 2 }), [bonus])).toBe(1);
    expect(bonusUnitsNeeded(line({ quantity: 3 }), [bonus])).toBe(0);
    expect(bonusUnitsNeeded(line({ quantity: 2, upsellDiscountPercent: 10 }), [bonus])).toBe(0);
  });
});
