import { describe, expect, it } from "vitest";
import { ageInMonths, childStageIndex, parseIsoDate, trimesterOf, weekFromDueDate } from "./stages";

const d = (s: string) => parseIsoDate(s)!;

describe("parseIsoDate", () => {
  it("reads a date input value", () => {
    expect(d("2026-03-01").getDate()).toBe(1);
  });
  it("rejects impossible and malformed dates", () => {
    expect(parseIsoDate("2026-02-30")).toBeNull();
    expect(parseIsoDate("01.03.2026")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
  });
});

describe("weekFromDueDate", () => {
  it("is week 1 right after the last period", () => {
    // due 280 days after 2026-01-01
    expect(weekFromDueDate(d("2026-10-08"), d("2026-01-01"))).toBe(1);
  });
  it("is week 40 on the due date", () => {
    expect(weekFromDueDate(d("2026-10-08"), d("2026-10-08"))).toBe(40);
  });
  it("changes week at the start of the day, not at noon", () => {
    // 2026-01-15 is exactly 14 days after the period: week 2 already at 08:00
    expect(weekFromDueDate(d("2026-10-08"), new Date(2026, 0, 15, 8))).toBe(2);
  });
  it("is null before conception and two weeks after the due date", () => {
    expect(weekFromDueDate(d("2026-10-08"), d("2025-12-20"))).toBeNull();
    expect(weekFromDueDate(d("2026-10-08"), d("2026-10-30"))).toBeNull();
  });
});

describe("trimesterOf", () => {
  it("splits at weeks 13 and 27", () => {
    expect([1, 13, 14, 27, 28, 40].map(trimesterOf)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

describe("ageInMonths", () => {
  it("counts whole months", () => {
    expect(ageInMonths(d("2026-01-15"), d("2026-03-14"))).toBe(1);
    expect(ageInMonths(d("2026-01-15"), d("2026-03-15"))).toBe(2);
  });
  it("accepts a birth earlier today", () => {
    expect(ageInMonths(d("2026-04-01"), new Date(2026, 3, 1, 7))).toBe(0);
  });
  it("is null for a birth date in the future", () => {
    expect(ageInMonths(d("2026-05-01"), d("2026-04-01"))).toBeNull();
  });
});

describe("childStageIndex", () => {
  it("maps months to stages and stops at three years", () => {
    expect([0, 1, 3, 6, 9, 12, 24, 35].map(childStageIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 6]);
    expect(childStageIndex(36)).toBeNull();
  });
});
