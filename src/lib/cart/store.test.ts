import { describe, it, expect, beforeEach } from "vitest";
import { useCart } from "./store";
import type { CartLine } from "./pricing";

const product = (over: Partial<CartLine> = {}) => ({
  productId: "p1",
  slug: "vitamin-d3",
  name: "Vitamin D3",
  image: "",
  price: 100000,
  ...over,
});

beforeEach(() => {
  useCart.setState({ lines: [], isOpen: false, _savedAt: 0 });
});

describe("cart lines", () => {
  it("merges repeat adds of the same product in the same mode", () => {
    useCart.getState().add(product(), 2, { silent: true });
    useCart.getState().add(product(), 1, { silent: true });

    const { lines } = useCart.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("keeps a one-off and a subscription of the same product apart", () => {
    useCart.getState().add(product(), 1, { silent: true });
    useCart
      .getState()
      .add(product({ subscription: { intervalDays: 30 } }), 1, { silent: true });

    const { lines } = useCart.getState();
    expect(lines).toHaveLength(2);
    // The one-off line must not have been quietly turned into a subscription.
    expect(lines[0].subscription).toBeUndefined();
    expect(lines[1].subscription).toEqual({ intervalDays: 30 });
  });

  it("does not merge two different delivery rhythms", () => {
    useCart.getState().add(product({ subscription: { intervalDays: 30 } }), 1, { silent: true });
    useCart.getState().add(product({ subscription: { intervalDays: 90 } }), 1, { silent: true });

    expect(useCart.getState().lines.map((l) => l.subscription?.intervalDays)).toEqual([30, 90]);
  });

  it("removes only the line asked for", () => {
    useCart.getState().add(product(), 1, { silent: true });
    useCart
      .getState()
      .add(product({ subscription: { intervalDays: 30 } }), 1, { silent: true });

    const subscribed = useCart.getState().lines.find((l) => l.subscription)!;
    useCart.getState().remove(subscribed.lineId);

    const { lines } = useCart.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].subscription).toBeUndefined();
  });

  it("changes the quantity of one line without touching the other", () => {
    useCart.getState().add(product(), 1, { silent: true });
    useCart
      .getState()
      .add(product({ subscription: { intervalDays: 30 } }), 1, { silent: true });

    const [oneOff, subscribed] = useCart.getState().lines;
    useCart.getState().setQuantity(subscribed.lineId, 4);

    const lines = useCart.getState().lines;
    expect(lines.find((l) => l.lineId === oneOff.lineId)!.quantity).toBe(1);
    expect(lines.find((l) => l.lineId === subscribed.lineId)!.quantity).toBe(4);
  });

  it("treats quantity zero as a removal", () => {
    useCart.getState().add(product(), 1, { silent: true });
    useCart.getState().setQuantity(useCart.getState().lines[0].lineId, 0);
    expect(useCart.getState().lines).toEqual([]);
  });
});

describe("syncPrices", () => {
  it("updates stale prices", () => {
    useCart.getState().add(product(), 1, { silent: true });
    useCart.getState().syncPrices({ p1: { price: 120000, oldPrice: 150000, inStock: true } });
    expect(useCart.getState().lines[0]).toMatchObject({ productId: "p1", price: 120000, oldPrice: 150000 });
  });

  it("never removes a line, so a failed catalogue read cannot empty the cart", () => {
    useCart.getState().add(product(), 1, { silent: true });
    useCart.getState().add(product({ productId: "p2", slug: "p2" }), 1, { silent: true });
    useCart.getState().syncPrices({});
    expect(useCart.getState().lines).toHaveLength(2);
  });
});

describe("offer lines", () => {
  it("keeps a product at an offer price apart from the same product at full price", () => {
    useCart.getState().add(product(), 1, { silent: true });
    useCart.getState().add(product({ upsellDiscountPercent: 15 }), 1, { silent: true });

    const { lines } = useCart.getState();
    expect(lines).toHaveLength(2);
    expect(lines.map((l) => l.upsellDiscountPercent)).toEqual([undefined, 15]);
  });

  it("holds a free gift at one unit and an offer line at three", () => {
    useCart.getState().add(product({ productId: "a", price: 200000 }), 1, { silent: true });
    useCart.getState().add(product({ productId: "b", upsellDiscountPercent: 10 }), 1, { silent: true });
    useCart.getState().add(product({ productId: "c", upsellDiscountPercent: 15 }), 1, { silent: true });
    useCart.getState().add(product({ productId: "g", price: 20000, upsellDiscountPercent: 100 }), 1, { silent: true });

    const gift = useCart.getState().lines.find((l) => l.productId === "g")!;
    useCart.getState().setQuantity(gift.lineId, 2);
    expect(useCart.getState().lines.find((l) => l.productId === "g")?.quantity).toBe(1);

    const offer = useCart.getState().lines.find((l) => l.productId === "b")!;
    useCart.getState().setQuantity(offer.lineId, 10);
    expect(useCart.getState().lines.find((l) => l.productId === "b")?.quantity).toBe(3);
  });

  it("drops the free gift once the steps that earned it are gone", () => {
    useCart.getState().add(product({ productId: "a", price: 200000 }), 1, { silent: true });
    useCart.getState().add(product({ productId: "b", upsellDiscountPercent: 10 }), 1, { silent: true });
    useCart.getState().add(product({ productId: "c", upsellDiscountPercent: 15 }), 1, { silent: true });
    useCart.getState().add(product({ productId: "g", price: 20000, upsellDiscountPercent: 100 }), 1, { silent: true });
    expect(useCart.getState().lines).toHaveLength(4);

    const step = useCart.getState().lines.find((l) => l.productId === "c")!;
    useCart.getState().remove(step.lineId);
    expect(useCart.getState().lines.map((l) => l.productId)).toEqual(["a", "b"]);
  });

  it("flags a sold-out product instead of removing it", () => {
    useCart.getState().add(product(), 1, { silent: true });
    useCart.getState().syncPrices({ p1: { price: 100000, inStock: false } });
    expect(useCart.getState().lines[0].soldOut).toBe(true);
    useCart.getState().syncPrices({ p1: { price: 100000, inStock: true } });
    expect(useCart.getState().lines[0].soldOut).toBeUndefined();
  });
});
