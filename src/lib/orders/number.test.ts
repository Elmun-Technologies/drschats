import { describe, expect, it } from "vitest";
import { displayOrderNumber } from "./number";

describe("displayOrderNumber", () => {
  it("keeps the prefix the operator and the admin panel use", () => {
    expect(displayOrderNumber("GV-000001")).toBe("GV-000001");
    expect(displayOrderNumber("GV-000123")).toBe("GV-000123");
  });

  it("returns null for a missing number instead of an empty label", () => {
    expect(displayOrderNumber(null)).toBeNull();
    expect(displayOrderNumber(undefined)).toBeNull();
    expect(displayOrderNumber("  ")).toBeNull();
  });

  it("caps a hostile query-string value", () => {
    expect(displayOrderNumber("GV-" + "9".repeat(80))).toHaveLength(24);
  });
});
