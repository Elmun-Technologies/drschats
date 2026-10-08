import { describe, expect, it } from "vitest";
import type { OrderRequest, Product } from "@/lib/shopflow/types";
import { repriceOrder, type OfferContext } from "./reprice";
import { DEFAULT_SHIPPING } from "./pricing";

const product = (id: string, price: number, inStock = true) =>
  ({ id, slug: `p-${id}`, name: `Product ${id}`, price, inStock }) as unknown as Product;

const ALL: OfferContext = { programs: new Map(), rail: new Map(), ladderPool: new Set(["p-a", "p-b", "p-c", "p-d"]) };

const catalogue = [product("a", 100_000), product("b", 50_000), product("c", 40_000), product("d", 9_000), product("x", 70_000, false)];

function order(items: OrderRequest["items"], method: "courier" | "pickup" = "courier"): OrderRequest {
  return {
    customer: { name: "Ali", phone: "+998901234567" },
    delivery: { region: "tashkentCity", address: "Chilonzor 1", method },
    items,
    appliedUpsells: [],
    appliedPromotions: [],
    totals: { subtotal: 1, discount: 0, shipping: 0, total: 1 },
    locale: "uz",
  };
}
const item = (id: string, quantity = 1, extra: Partial<OrderRequest["items"][number]> = {}) => ({
  productId: id,
  slug: `p-${id}`,
  name: "whatever the browser said",
  quantity,
  unitPrice: 1,
  ...extra,
});

describe("repriceOrder", () => {
  it("prices every line from the catalogue, not from the request", () => {
    const r = repriceOrder(order([item("a", 2)]), catalogue, []);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.items[0].unitPrice).toBe(100_000);
    expect(r.order.items[0].name).toBe("Product a");
    expect(r.order.totals.subtotal).toBe(200_000);
    expect(r.order.totals.total).toBe(200_000 + DEFAULT_SHIPPING);
  });

  it("charges no shipping for pickup", () => {
    const r = repriceOrder(order([item("b")], "pickup"), catalogue, []);
    expect(r.ok && r.order.totals.shipping).toBe(0);
  });

  it("rejects unknown, mismatched and out-of-stock products", () => {
    expect(repriceOrder(order([item("zzz")]), catalogue, [])).toEqual({ ok: false, error: "unknown_product" });
    expect(repriceOrder(order([{ ...item("a"), slug: "p-b" }]), catalogue, [])).toEqual({ ok: false, error: "unknown_product" });
    expect(repriceOrder(order([item("x")]), catalogue, [])).toEqual({ ok: false, error: "out_of_stock" });
  });

  it("accepts the offer discounts the site makes and rejects invented ones", () => {
    const ok = repriceOrder(order([item("a"), item("b", 1, { upsellDiscountPercent: 15 })]), catalogue, [], ALL);
    expect(ok.ok && ok.order.totals.discount).toBe(7_500);
    expect(repriceOrder(order([item("b", 1, { upsellDiscountPercent: 90 })]), catalogue, [])).toEqual({ ok: false, error: "invalid_offer" });
  });

  it("allows a free item only as the last ladder step", () => {
    const ladder = [
      item("a"),
      item("b", 1, { upsellDiscountPercent: 10 }),
      item("c", 1, { upsellDiscountPercent: 15 }),
      item("d", 1, { upsellDiscountPercent: 100 }),
    ];
    expect(repriceOrder(order(ladder), catalogue, [], ALL).ok).toBe(true);
    expect(repriceOrder(order([item("a"), item("b", 1, { upsellDiscountPercent: 100 })]), catalogue, [], ALL)).toEqual({ ok: false, error: "invalid_offer" });
    const tooDear = [...ladder.slice(0, 3), item("a", 1, { upsellDiscountPercent: 100 })];
    expect(repriceOrder(order(tooDear), catalogue, [], ALL)).toEqual({ ok: false, error: "invalid_offer" });
    const twoUnits = [...ladder.slice(0, 3), item("d", 2, { upsellDiscountPercent: 100 })];
    expect(repriceOrder(order(twoUnits), catalogue, [], ALL)).toEqual({ ok: false, error: "invalid_offer" });
  });

  it("rejects a ladder discount with nothing bought at full price", () => {
    expect(repriceOrder(order([item("b", 1, { upsellDiscountPercent: 20 })]), catalogue, [], ALL)).toEqual({ ok: false, error: "invalid_offer" });
  });

  it("accepts ladder steps only for products in the ladder pool", () => {
    const pool: OfferContext = { programs: new Map(), rail: new Map(), ladderPool: new Set(["p-b", "p-c"]) };
    const twice = [item("a"), item("b", 1, { upsellDiscountPercent: 10 }), item("c", 1, { upsellDiscountPercent: 10 })];
    expect(repriceOrder(order(twice), catalogue, [], pool).ok).toBe(true);
    expect(repriceOrder(order([item("a"), item("d", 1, { upsellDiscountPercent: 20 })]), catalogue, [], pool)).toEqual({ ok: false, error: "invalid_offer" });
  });

  it("accepts programme and rail discounts only where the shop offers them", () => {
    const offers: OfferContext = {
      programs: new Map([["p-b", new Set([12])], ["p-c", new Set([12])]]),
      rail: new Map([["p-d", new Set([15])]]),
      ladderPool: new Set(["p-b"]),
    };
    const program = [item("b", 1, { upsellDiscountPercent: 12 }), item("c", 1, { upsellDiscountPercent: 12 })];
    expect(repriceOrder(order(program), catalogue, [], offers).ok).toBe(true);
    expect(repriceOrder(order([item("a", 1, { upsellDiscountPercent: 12 })]), catalogue, [], offers)).toEqual({ ok: false, error: "invalid_offer" });
    const rail = [item("a"), item("d", 1, { upsellDiscountPercent: 15 }), item("b", 1, { upsellDiscountPercent: 15 })];
    // d is a rail offer, b takes the one ladder −15% step.
    expect(repriceOrder(order(rail), catalogue, [], offers).ok).toBe(true);
  });
});
