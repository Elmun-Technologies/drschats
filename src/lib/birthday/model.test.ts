import { describe, expect, it } from "vitest";
import { birthdayAnchor, birthdayIn, nextBirthday, validDayMonth } from "./model";

describe("birthday dates", () => {
  it("validates day and month (29 Feb allowed)", () => {
    expect(validDayMonth(29, 2)).toBe(true);
    expect(validDayMonth(30, 2)).toBe(false);
    expect(validDayMonth(31, 4)).toBe(false);
    expect(validDayMonth(31, 12)).toBe(true);
    expect(validDayMonth(0, 1)).toBe(false);
  });

  it("is midnight in Tashkent", () => {
    expect(birthdayIn(2026, 20, 10).toISOString()).toBe("2026-10-19T19:00:00.000Z");
  });

  it("celebrates 29 February on the 28th in other years", () => {
    expect(birthdayIn(2027, 29, 2).toISOString()).toBe("2027-02-27T19:00:00.000Z");
    expect(birthdayIn(2028, 29, 2).toISOString()).toBe("2028-02-28T19:00:00.000Z");
  });

  it("finds the next occurrence, today included", () => {
    const now = new Date("2026-10-17T10:00:00Z");
    expect(nextBirthday(17, 10, now).year).toBe(2026);
    expect(nextBirthday(16, 10, now).year).toBe(2027);
    expect(nextBirthday(1, 1, now).year).toBe(2027);
  });

  it("anchors the flow N days before, cycle = the birthday's year", () => {
    const now = new Date("2026-10-17T10:00:00Z");
    const a = birthdayAnchor(20, 10, 3, now);
    expect(a.cycle).toBe("2026");
    expect(a.anchor.toISOString()).toBe("2026-10-16T19:00:00.000Z");
    // A birthday inside the lead window still belongs to this year.
    expect(birthdayAnchor(18, 10, 3, now).cycle).toBe("2026");
    // Just after New Year, early-January birthdays are next year's cycle.
    expect(birthdayAnchor(2, 1, 3, new Date("2026-12-31T10:00:00Z")).cycle).toBe("2027");
  });
});
