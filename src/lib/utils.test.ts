import { describe, expect, it } from "vitest";
import { cn, formatMoney, formatNumber } from "./utils";

describe("formatMoney", () => {
  it("groups thousands and uses the okina in Uzbek", () => {
    expect(formatMoney(79000, "uz")).toBe("79 000 soʻm");
    expect(formatMoney(1265950, "ru")).toBe("1 265 950 сум");
  });

  it("rounds", () => {
    expect(formatNumber(3949.6)).toBe("3 950");
  });
});

describe("cn", () => {
  it("keeps a V3 font size next to a text colour", () => {
    expect(cn("text-caption", "text-muted")).toBe("text-caption text-muted");
  });

  it("still lets a later font size win", () => {
    expect(cn("text-body", "text-caption")).toBe("text-caption");
  });
});
