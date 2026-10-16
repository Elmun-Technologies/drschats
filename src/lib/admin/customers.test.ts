import { describe, expect, it } from "vitest";
import { customerLifecycle } from "./customers";

const now = new Date("2026-10-15T00:00:00.000Z").getTime();

const customer = (overrides: Partial<{ successfulOrderCount: number; lifetimeValue: number; lastOrderAt: Date }> = {}) => ({
  successfulOrderCount: 1,
  lifetimeValue: 120_000,
  lastOrderAt: new Date("2026-10-01T00:00:00.000Z"),
  ...overrides,
});

describe("automatic customer lifecycle segments", () => {
  it("starts a recent first-time buyer in the new stage", () => {
    expect(customerLifecycle(customer(), now)).toBe("new");
  });

  it("moves a second-time buyer into repeat automatically", () => {
    expect(customerLifecycle(customer({ successfulOrderCount: 2 }), now)).toBe("repeat");
  });

  it("marks high-value or frequent recent customers as VIP", () => {
    expect(customerLifecycle(customer({ successfulOrderCount: 3 }), now)).toBe("vip");
    expect(customerLifecycle(customer({ lifetimeValue: 1_000_000 }), now)).toBe("vip");
  });

  it("moves a customer without an order for sixty days into dormant", () => {
    expect(customerLifecycle(customer({ lastOrderAt: new Date("2026-08-01T00:00:00.000Z") }), now)).toBe("dormant");
  });
});
