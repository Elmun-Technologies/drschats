import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOW_STOCK_AT,
  adjustedQty,
  cancelRestores,
  dueRequests,
  isLowStock,
  lowStockLeft,
  parseLowStockAt,
  phone9Of,
  quantitiesByProduct,
  reopenTakes,
  stockCap,
  stockLabel,
} from "./stock-rules";
import { lineQtyCap } from "@/lib/cart/pricing";

describe("lowStockLeft", () => {
  it("says nothing for an untracked product", () => {
    expect(lowStockLeft(undefined)).toBeNull();
    expect(lowStockLeft(null)).toBeNull();
  });
  it("names the real count only at or under the threshold", () => {
    expect(lowStockLeft({ qty: 3, lowAt: 5 })).toBe(3);
    expect(lowStockLeft({ qty: 5, lowAt: 5 })).toBe(5);
    expect(lowStockLeft({ qty: 6, lowAt: 5 })).toBeNull();
  });
  it("never says «0 ta qoldi»", () => {
    expect(lowStockLeft({ qty: 0, lowAt: 5 })).toBeNull();
  });
});

describe("parseLowStockAt", () => {
  it("falls back to the default on anything but a sane integer", () => {
    expect(parseLowStockAt("8")).toBe(8);
    expect(parseLowStockAt(undefined)).toBe(DEFAULT_LOW_STOCK_AT);
    expect(parseLowStockAt("0")).toBe(DEFAULT_LOW_STOCK_AT);
    expect(parseLowStockAt("2.5")).toBe(DEFAULT_LOW_STOCK_AT);
    expect(parseLowStockAt("abc")).toBe(DEFAULT_LOW_STOCK_AT);
  });
});

describe("caps", () => {
  it("stockCap limits only a tracked count", () => {
    expect(stockCap(20, undefined)).toBe(20);
    expect(stockCap(20, 3)).toBe(3);
    expect(stockCap(20, 50)).toBe(20);
  });
  it("a cart line never exceeds the tracked count, and is never emptied by it", () => {
    expect(lineQtyCap({})).toBe(99);
    expect(lineQtyCap({ stockQty: 4 })).toBe(4);
    expect(lineQtyCap({ stockQty: 0 })).toBe(1);
    expect(lineQtyCap({ upsellDiscountPercent: 15, stockQty: 10 })).toBe(3);
    expect(lineQtyCap({ upsellDiscountPercent: 100, stockQty: 10 })).toBe(1);
  });
});

describe("quantitiesByProduct", () => {
  it("sums lines of one product and sorts by id (one lock order, no deadlocks)", () => {
    expect(
      quantitiesByProduct([
        { productId: "p-b", quantity: 1 },
        { productId: "p-a", quantity: 2 },
        { productId: "p-b", quantity: 3 },
      ]),
    ).toEqual([
      ["p-a", 2],
      ["p-b", 4],
    ]);
  });
});

describe("cancel and re-open", () => {
  const order = [
    { productId: "p-a", delta: -2, reason: "order" },
    { productId: "p-b", delta: -1, reason: "order" },
  ];
  it("a cancel gives back exactly what the order took", () => {
    expect(cancelRestores(order)).toEqual([
      ["p-a", 2],
      ["p-b", 1],
    ]);
  });
  it("a second cancel gives back nothing", () => {
    const cancelled = [...order, { productId: "p-a", delta: 2, reason: "cancel" }, { productId: "p-b", delta: 1, reason: "cancel" }];
    expect(cancelRestores(cancelled)).toEqual([]);
  });
  it("re-opening takes again only what was given back", () => {
    expect(reopenTakes(order)).toEqual([]);
    const cancelled = [...order, { productId: "p-a", delta: 2, reason: "cancel" }, { productId: "p-b", delta: 1, reason: "cancel" }];
    expect(reopenTakes(cancelled)).toEqual([
      ["p-a", 2],
      ["p-b", 1],
    ]);
  });
});

describe("admin adjustments", () => {
  it("adds, subtracts and sets, never below zero", () => {
    expect(adjustedQty(10, "delta", 5)).toBe(15);
    expect(adjustedQty(10, "delta", -12)).toBe(0);
    expect(adjustedQty(null, "delta", 4)).toBe(4);
    expect(adjustedQty(10, "set", 3)).toBe(3);
  });
  it("labels the list pill", () => {
    expect(stockLabel(null, 5).label).toBe("kuzatilmaydi");
    expect(stockLabel(0, 5).label).toBe("tugagan");
    expect(stockLabel(3, 5).label).toBe("kam: 3");
    expect(stockLabel(12, 5).label).toBe("12 ta");
    expect(isLowStock(null, 5)).toBe(false);
    expect(isLowStock(0, 5)).toBe(true);
    expect(isLowStock(6, 5)).toBe(false);
  });
});

describe("dueRequests", () => {
  const requests = [
    { id: 1, kind: "restock" as const, targetPrice: null },
    { id: 2, kind: "price_drop" as const, targetPrice: 100_000 },
    { id: 3, kind: "price_drop" as const, targetPrice: 80_000 },
  ];
  it("nothing is due while the product cannot be bought", () => {
    expect(dueRequests(requests, { inStock: false, price: 50_000 })).toEqual([]);
  });
  it("back in stock answers restock; a price under what they saw answers price_drop", () => {
    expect(dueRequests(requests, { inStock: true, price: 90_000 }).map((r) => r.id)).toEqual([1, 2]);
    expect(dueRequests(requests, { inStock: true, price: 100_000 }).map((r) => r.id)).toEqual([1]);
  });
});

describe("phone9Of", () => {
  it("matches every way a number is typed", () => {
    expect(phone9Of("+998 90 123 45 67")).toBe("901234567");
    expect(phone9Of("90 123-45-67")).toBe("901234567");
    expect(phone9Of("12345")).toBeNull();
  });
});
