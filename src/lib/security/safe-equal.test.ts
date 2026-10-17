import { describe, expect, it } from "vitest";
import { matchesSecret, safeEqual } from "./safe-equal";

describe("safeEqual", () => {
  it("compares strings of any length", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("matchesSecret", () => {
  it("never matches when the secret is unset or empty", () => {
    expect(matchesSecret(undefined, undefined)).toBe(false);
    expect(matchesSecret("", "")).toBe(false);
    expect(matchesSecret(undefined, "")).toBe(false);
  });

  it("matches only the configured string", () => {
    expect(matchesSecret("s3cret", "s3cret")).toBe(true);
    expect(matchesSecret("nope", "s3cret")).toBe(false);
    expect(matchesSecret(42, "s3cret")).toBe(false);
  });
});
