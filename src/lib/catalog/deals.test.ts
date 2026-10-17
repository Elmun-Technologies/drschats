import { describe, expect, it } from "vitest";
import { currentDeal, dealPrice, discounted, type RawDeal } from "./deals";
import { livePrice } from "@/lib/shop/sale";

const now = Date.parse("2026-10-17T10:00:00Z");
const at = (h: number) => new Date(now + h * 3_600_000).toISOString();
const deal = (over: Partial<RawDeal> = {}): RawDeal => ({
  id: 1,
  productSlug: "omega-3",
  percent: 20,
  price: null,
  startsAt: at(-1),
  endsAt: at(5),
  ...over,
});
const product = { slug: "omega-3", price: 100_000 };

describe("deal of the day pricing", () => {
  it("applies only inside its window", () => {
    expect(dealPrice(product, [deal()], now)).toEqual({ price: 80_000, oldPrice: 100_000, saleEndsAt: at(5) });
    expect(dealPrice(product, [deal({ startsAt: at(1) })], now)).toEqual({ price: 100_000, oldPrice: undefined, saleEndsAt: undefined });
    expect(dealPrice(product, [deal({ endsAt: at(0) })], now).price).toBe(100_000);
  });

  it("starts on time from a list read before its start — no write needed", () => {
    const scheduled = [deal({ startsAt: at(2), endsAt: at(6) })];
    expect(dealPrice(product, scheduled, now).price).toBe(100_000);
    expect(dealPrice(product, scheduled, now + 2 * 3_600_000).price).toBe(80_000);
    expect(dealPrice(product, scheduled, now + 6 * 3_600_000).price).toBe(100_000);
  });

  it("touches only its own product", () => {
    expect(dealPrice({ slug: "other", price: 50_000 }, [deal()], now)).toEqual({ price: 50_000, oldPrice: undefined, saleEndsAt: undefined });
  });

  it("strikes through the price the product sold at right before, never an invented one", () => {
    const onSale = { ...product, price: 90_000, oldPrice: 120_000, saleEndsAt: at(48) };
    expect(dealPrice(onSale, [deal()], now)).toEqual({ price: 72_000, oldPrice: 90_000, saleEndsAt: at(5) });
  });

  it("reverts in the browser at its end through the same livePrice the cart uses", () => {
    const during = dealPrice(product, [deal()], now);
    expect(livePrice(during, now + 6 * 3_600_000)).toEqual({ price: 100_000, oldPrice: undefined });
  });

  it("uses a fixed price only when it lowers the price", () => {
    expect(dealPrice(product, [deal({ percent: null, price: 75_000 })], now).price).toBe(75_000);
    expect(dealPrice(product, [deal({ percent: null, price: 100_000 })], now)).toEqual({ price: 100_000, oldPrice: undefined, saleEndsAt: undefined });
  });

  it("rounds a percent to whole hundreds of soʻm", () => {
    expect(discounted(79_900, { percent: 15, price: null })).toBe(67_900);
    expect(discounted(100, { percent: 1, price: null })).toBeNull();
  });

  it("keeps an expired product sale reverted underneath", () => {
    const expired = { ...product, price: 70_000, oldPrice: 100_000, saleEndsAt: at(-3) };
    expect(dealPrice(expired, [], now)).toEqual({ price: 100_000, oldPrice: undefined, saleEndsAt: undefined });
  });

  it("finds the running deal among scheduled ones", () => {
    const list = [deal({ id: 1, startsAt: at(-10), endsAt: at(-5) }), deal({ id: 2 }), deal({ id: 3, startsAt: at(5), endsAt: at(10) })];
    expect(currentDeal(list, now)?.id).toBe(2);
    expect(currentDeal([], now)).toBeNull();
    expect(currentDeal(undefined, now)).toBeNull();
  });
});
