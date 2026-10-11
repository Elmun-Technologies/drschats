import { describe, expect, it, vi } from "vitest";
import { livePrice } from "./sale";
import { onDeadline } from "./deadline";

describe("livePrice", () => {
  const p = { price: 79_000, oldPrice: 89_000, saleEndsAt: "2026-10-12T10:00:00Z" };
  it("keeps the sale before its end", () => {
    expect(livePrice(p, Date.parse("2026-10-12T09:59:59Z"))).toEqual({ price: 79_000, oldPrice: 89_000 });
  });
  it("returns to the old price at the end", () => {
    expect(livePrice(p, Date.parse("2026-10-12T10:00:00Z"))).toEqual({ price: 89_000, oldPrice: undefined });
  });
  it("leaves a sale without an end date alone", () => {
    expect(livePrice({ price: 1, oldPrice: 2 }, 0)).toEqual({ price: 1, oldPrice: 2 });
  });
});

describe("onDeadline", () => {
  it("re-arms past the setTimeout ceiling and fires once at the deadline", () => {
    vi.useFakeTimers({ now: 0 });
    const fn = vi.fn();
    onDeadline(40 * 24 * 3600_000, fn);
    vi.advanceTimersByTime(25 * 24 * 3600_000);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(15 * 24 * 3600_000 + 100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
