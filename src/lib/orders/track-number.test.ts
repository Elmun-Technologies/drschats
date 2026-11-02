import { describe, expect, it } from "vitest";
import { normalizeOrderNumber } from "./track-number";

describe("normalizeOrderNumber", () => {
  it.each([
    ["GV-000123", "GV-000123"],
    ["gv-000123", "GV-000123"],
    ["GV 123", "GV-000123"],
    ["123", "GV-000123"],
    ["№ GV-000123", "GV-000123"],
    ["  GV000123 ", "GV-000123"],
    ["GV-1234567", "GV-1234567"],
  ])("reads %s", (input, expected) => {
    expect(normalizeOrderNumber(input)).toBe(expected);
  });

  it.each(["", "GV-", "AB-000123", "12a", "GV-000123; drop"])("refuses %s", (input) => {
    expect(normalizeOrderNumber(input)).toBeNull();
  });
});
