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
