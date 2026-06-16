import { describe, it, expect } from "vitest";
import { computeTotals, DEFAULT_SHIPPING, type CartLine } from "./pricing";
import type { Promotion } from "@/lib/shopflow/types";

const line = (over: Partial<CartLine> = {}): CartLine => ({
  productId: "p1",
  slug: "p1",
  name: "Test",
  image: "",
  price: 100000,
  quantity: 1,
  ...over,
});

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
