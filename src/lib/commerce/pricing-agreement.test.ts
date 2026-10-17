import { describe, expect, it } from "vitest";
import type { OrderRequest, Product, Promotion } from "@/lib/shopflow/types";
import { cartLineId, computeTotals, type CartLine } from "@/lib/cart/pricing";
import { repriceOrder, type OfferContext } from "@/lib/cart/reprice";
import { buildUpsellLadder } from "@/lib/upsell/ladder";
import { coerceCommerceSettings, pricingRulesOf, type CommerceSettings } from "./settings";

/*
  The cart (computeTotals in the browser, fed by useCommerce) and the checkout
  action (repriceOrder on the server, fed by getCommerceSettings) must price a
  cart the same way under ANY admin settings — not just the defaults. A small
  deterministic generator walks many carts × several rule sets.
*/

const catalogue: Product[] = [
  { id: "a", slug: "p-a", name: "A", price: 120_000, oldPrice: undefined, inStock: true, rating: 4.9, categorySlug: "c1" },
  { id: "b", slug: "p-b", name: "B", price: 79_000, inStock: true, rating: 4.7, categorySlug: "c2" },
  { id: "c", slug: "p-c", name: "C", price: 45_500, inStock: true, rating: 4.5, categorySlug: "c1" },
  { id: "d", slug: "p-d", name: "D", price: 9_900, inStock: true, rating: 4.1, categorySlug: "c3" },
  { id: "e", slug: "p-e", name: "E", price: 310_000, inStock: true, rating: 4.0, categorySlug: "c2" },
].map((p) => ({ images: [], badges: [], assortment: "core", ...p }) as unknown as Product);
const byId = new Map(catalogue.map((p) => [p.id, p]));

const POOL: OfferContext = { programs: new Map(), rail: new Map(), ladderPool: new Set(catalogue.map((p) => p.slug)) };

const PROMOS: Promotion[][] = [
  [],
  [{ id: "bonus", type: "buy_x_get_y", title: "", description: "" } as Promotion],
  [{ id: "ship", type: "free_shipping_over", threshold: 200_000, title: "", description: "" } as Promotion],
  [{ id: "pct", type: "percent_off", percent: 7, productSlugs: ["p-a", "p-c"], title: "", description: "" } as Promotion],
];

const RULE_SETS: CommerceSettings[] = [
  coerceCommerceSettings({}),
  coerceCommerceSettings({ delivery: { freeShippingOver: 250_000, courierFee: 25_000 } }),
  coerceCommerceSettings({ delivery: { freeShippingOver: 0, courierFee: 45_000 }, subscription: { firstPercent: 5, recurringPercent: 20 } }),
  coerceCommerceSettings({ delivery: { freeShippingOver: 1_000_000, courierFee: 0 }, subscription: { firstPercent: 0, recurringPercent: 0 } }),
  coerceCommerceSettings({ delivery: { freeShippingOver: 99_000, courierFee: 19_000 }, subscription: { firstPercent: 25, recurringPercent: 30 } }),
];

/** Park–Miller: the same carts on every run. */
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function randomCart(next: () => number): CartLine[] {
  const lines: CartLine[] = [];
  const count = 1 + Math.floor(next() * 4);
  for (const p of [...catalogue].sort(() => next() - 0.5).slice(0, count)) {
    const subscription = next() < 0.3 ? { intervalDays: [30, 45, 60, 90][Math.floor(next() * 4)] } : undefined;
    lines.push({
      lineId: cartLineId(p.id, subscription),
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: "",
      price: p.price,
      quantity: 1 + Math.floor(next() * 5),
      subscription,
    });
  }
  return lines;
}

function orderOf(lines: CartLine[], pickup: boolean, browserTotals = { subtotal: 1, discount: 0, shipping: 0, total: 1 }): OrderRequest {
  return {
    customer: { name: "Ali", phone: "+998901234567" },
    delivery: { region: "tashkentCity", address: "Chilonzor 1", method: pickup ? "pickup" : "courier" },
    items: lines.map((l) => ({ productId: l.productId, slug: l.slug, name: "x", quantity: l.quantity, unitPrice: 1, subscription: l.subscription, upsellDiscountPercent: l.upsellDiscountPercent })),
    appliedUpsells: [],
    appliedPromotions: [],
    totals: browserTotals,
    locale: "uz",
  };
}

describe("client and server agree on every cart under custom commerce rules", () => {
  it("over a few hundred generated carts", () => {
    const next = rng(42);
    let checked = 0;
    for (let i = 0; i < 60; i++) {
      const lines = randomCart(next);
      for (const settings of RULE_SETS) {
        const rules = pricingRulesOf(settings);
        for (const promotions of PROMOS) {
          const pickup = next() < 0.2;
          const client = computeTotals(lines, promotions, { pickup, rules });
          const server = repriceOrder(orderOf(lines, pickup), catalogue, promotions, POOL, { pricing: rules, ladder: settings.ladder });
          expect(server.ok).toBe(true);
          if (!server.ok) continue;
          expect(server.order.totals).toEqual({ subtotal: client.subtotal, discount: client.discount, shipping: client.shipping, total: client.total });
          checked++;
        }
      }
    }
    expect(checked).toBe(60 * RULE_SETS.length * PROMOS.length);
  });

  it("charges the admin's fee below the admin's threshold and nothing above it", () => {
    const rules = pricingRulesOf(coerceCommerceSettings({ delivery: { freeShippingOver: 250_000, courierFee: 25_000 } }));
    const line = (qty: number): CartLine[] => [{ lineId: "b", productId: "b", slug: "p-b", name: "B", image: "", price: 79_000, quantity: qty }];
    expect(computeTotals(line(3), [], { rules })).toMatchObject({ subtotal: 237_000, shipping: 25_000, total: 262_000, freeShippingRemaining: 13_000, freeShippingThreshold: 250_000 });
    expect(computeTotals(line(4), [], { rules })).toMatchObject({ subtotal: 316_000, shipping: 0, total: 316_000 });
    // The defaults stay what they were: 30 000 below 300 000.
    expect(computeTotals(line(3))).toMatchObject({ shipping: 30_000, freeShippingThreshold: 300_000 });
  });

  it("ignores whatever totals the browser sent", () => {
    const settings = RULE_SETS[1];
    const lines = [{ lineId: "a", productId: "a", slug: "p-a", name: "A", image: "", price: 120_000, quantity: 1 }];
    const r = repriceOrder(orderOf(lines, false, { subtotal: 120_000, discount: 0, shipping: 0, total: 120_000 }), catalogue, [], POOL, {
      pricing: pricingRulesOf(settings),
      ladder: settings.ladder,
    });
    expect(r.ok && r.order.totals).toEqual({ subtotal: 120_000, discount: 0, shipping: 25_000, total: 145_000 });
  });
});

describe("the ladder the cart builds is the ladder the server accepts", () => {
  const base: CartLine[] = [{ lineId: "e", productId: "e", slug: "p-e", name: "E", image: "", price: 310_000, quantity: 1 }];
  const accept = (settings: CommerceSettings, steps: { productId: string; percent: number }[]) =>
    repriceOrder(
      orderOf([
        ...base,
        ...steps.map((s) => ({ lineId: cartLineId(s.productId, undefined, s.percent), productId: s.productId, slug: byId.get(s.productId)!.slug, name: "", image: "", price: 0, quantity: 1, upsellDiscountPercent: s.percent })),
      ], false),
      catalogue,
      [],
      POOL,
      { pricing: pricingRulesOf(settings), ladder: settings.ladder },
    );

  for (const settings of [
    coerceCommerceSettings({}),
    coerceCommerceSettings({ ladder: { percents: [5, 12, 25], freeGift: false } }),
    coerceCommerceSettings({ ladder: { percents: [12, 20, 30], freeGift: true } }),
  ]) {
    it(`accepts every step at ${settings.ladder.percents.join("/")}${settings.ladder.freeGift ? " + gift" : ""}`, () => {
      const steps = buildUpsellLadder(base, catalogue, settings.ladder);
      expect(steps.length).toBe(3);
      if (!settings.ladder.freeGift) expect(steps.every((s) => s.stepType === "standard")).toBe(true);
      expect(steps.map((s) => s.discountPercent).filter((p) => p < 100)).toEqual(
        settings.ladder.percents.slice(0, steps.filter((s) => s.discountPercent < 100).length),
      );
      expect(accept(settings, steps.map((s) => ({ productId: s.product.id, percent: s.discountPercent }))).ok).toBe(true);
    });
  }

  it("refuses a percent the current settings do not offer, and every step when the ladder is off", () => {
    const changed = coerceCommerceSettings({ ladder: { percents: [5, 12, 25] } });
    expect(accept(changed, [{ productId: "b", percent: 10 }])).toMatchObject({ ok: false, error: "invalid_offer", slug: "p-b" });
    const off = coerceCommerceSettings({ ladder: { enabled: false } });
    expect(buildUpsellLadder(base, catalogue, off.ladder)).toEqual([]);
    expect(accept(off, [{ productId: "b", percent: 10 }])).toMatchObject({ ok: false, error: "invalid_offer" });
  });
});
