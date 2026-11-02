import { describe, expect, it } from "vitest";
import { formatUzPhone, normalizeUzPhone } from "./phone";

describe("normalizeUzPhone", () => {
  it.each([
    ["+998901234567", "+998901234567"],
    ["998901234567", "+998901234567"],
    ["+998 90 123-45-67", "+998901234567"],
    ["(90) 123 45 67", "+998901234567"],
    ["901234567", "+998901234567"],
    ["  +998 71 200 70 80 ", "+998712007080"],
  ])("accepts %s", (raw, expected) => {
    expect(normalizeUzPhone(raw)).toBe(expected);
  });

  it.each(["1234567", "12345678", "+7 900 123 45 67", "99890123456", "+9989012345678", "012345678", "90 123 45 67 a", ""])(
    "refuses %s",
    (raw) => {
      expect(normalizeUzPhone(raw)).toBeNull();
    },
  );
});

describe("formatUzPhone", () => {
  it("groups the nine digits after the country code", () => {
    expect(formatUzPhone("+998901234567")).toBe("+998 90 123 45 67");
  });
});
