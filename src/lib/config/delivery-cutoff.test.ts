import { describe, expect, it } from "vitest";
import { msUntilCutoff, parseCutoff } from "./delivery-cutoff";

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
