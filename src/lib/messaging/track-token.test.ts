import { describe, expect, it } from "vitest";
import { orderTrackToken, verifyOrderTrackToken } from "./tokens";

describe("order tracking token", () => {
  it("round-trips the order number", () => {
    const token = orderTrackToken("GV-000123");
    expect(token).toMatch(/^GV-000123\.[A-Za-z0-9_-]{12}$/);
    expect(verifyOrderTrackToken(token)).toBe("GV-000123");
  });

  it("does not open a neighbouring order", () => {
    const sig = orderTrackToken("GV-000123").split(".")[1];
    expect(verifyOrderTrackToken(`GV-000124.${sig}`)).toBeNull();
  });

  it("refuses junk", () => {
    for (const bad of [null, undefined, "", "GV-000123", "GV-000123.short", "gv-000123.AAAAAAAAAAAA", "../x.AAAAAAAAAAAA"]) {
      expect(verifyOrderTrackToken(bad)).toBeNull();
    }
  });
});
