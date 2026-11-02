import { describe, expect, it } from "vitest";
import { cutoffDelivery, msUntilCutoff, parseCutoff } from "./delivery-cutoff";

describe("delivery cut-off", () => {
  it("parses HH:MM and rejects anything else", () => {
    expect(parseCutoff("16:00")).toEqual({ hour: 16, minute: 0 });
    expect(parseCutoff("25:00")).toBeNull();
    expect(parseCutoff("")).toBeNull();
  });

  it("counts down in Tashkent time and stops at the cut-off", () => {
    const cutoff = { hour: 16, minute: 0 };
    // 09:30 UTC = 14:30 Tashkent → 1h30m left.
    expect(msUntilCutoff(cutoff, new Date("2026-10-12T09:30:00Z"))).toBe(90 * 60_000);
    // 11:00 UTC = 16:00 Tashkent → passed.
    expect(msUntilCutoff(cutoff, new Date("2026-10-12T11:00:00Z"))).toBeNull();
  });
});

describe("cutoffDelivery", () => {
  // Tashkent is UTC+5: 07:00 UTC is 12:00 there.
  it("is tomorrow on weekdays", () => {
    expect(cutoffDelivery(new Date("2026-11-02T07:00:00Z"))).toBe("tomorrow"); // Monday
    expect(cutoffDelivery(new Date("2026-11-06T07:00:00Z"))).toBe("tomorrow"); // Friday
  });

  it("is Monday on Saturday", () => {
    expect(cutoffDelivery(new Date("2026-11-07T07:00:00Z"))).toBe("monday");
  });

  it("has no timer on Sunday, by Tashkent's calendar", () => {
    expect(cutoffDelivery(new Date("2026-11-08T07:00:00Z"))).toBeNull();
    // 21:00 UTC Saturday is already 02:00 Sunday in Tashkent.
    expect(cutoffDelivery(new Date("2026-11-07T21:00:00Z"))).toBeNull();
  });
});
