import { describe, it, expect } from "vitest";
import { dueReminders, daysUntilAnniversary, COURSE_DAYS } from "./reminders";
import { emptyProfile, type HealthProfile } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function profileWith(over: Partial<HealthProfile>): HealthProfile {
  return { ...emptyProfile(), ...over };
}

describe("daysUntilAnniversary", () => {
  it("counts forward to a date later this year", () => {
    expect(daysUntilAnniversary(3, 20, new Date("2026-03-13T10:00:00Z"))).toBe(7);
  });

  it("returns 0 on the day itself, whatever the hour", () => {
    expect(daysUntilAnniversary(3, 13, new Date("2026-03-13T23:59:00Z"))).toBe(0);
  });

  it("wraps to next year once the date has passed", () => {
    expect(daysUntilAnniversary(1, 1, new Date("2026-12-30T00:00:00Z"))).toBe(2);
  });
});

describe("dueReminders — birthdays", () => {
  const now = new Date("2026-03-13T09:00:00Z");

  it("stays quiet outside the lead window", () => {
    const reminders = dueReminders({ profile: profileWith({ birthday: "1990-06-01" }), now });
    expect(reminders).toEqual([]);
  });

  it("fires within the lead window and names the age being turned", () => {
    const reminders = dueReminders({ profile: profileWith({ birthday: "1990-03-20" }), now });
    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({ kind: "birthday", daysUntil: 7, age: 36 });
  });

  it("does not invent an age when the year was not given", () => {
    const reminders = dueReminders({ profile: profileWith({ birthday: "03-15" }), now });
    expect(reminders[0].age).toBeUndefined();
  });

  it("gives the same occurrence the same id, so it is only sent once", () => {
    const profile = profileWith({ birthday: "1990-03-20" });
    const monday = dueReminders({ profile, now: new Date("2026-03-13T09:00:00Z") });
    const tuesday = dueReminders({ profile, now: new Date("2026-03-14T09:00:00Z") });
    expect(monday[0].id).toBe(tuesday[0].id);
  });

  it("covers household members, carrying their name through", () => {
    const profile = profileWith({
      household: [{ id: "m1", relation: "child", name: "Aziza", birthday: "2019-03-16" }],
    });
    const reminders = dueReminders({ profile, now });
    expect(reminders[0]).toMatchObject({ memberId: "m1", memberName: "Aziza", age: 7 });
  });
});

describe("dueReminders — children in the school season", () => {
  it("greets a school-age child before the school year starts", () => {
    const profile = profileWith({
      household: [{ id: "m1", relation: "child", name: "Aziza", birthday: "2018-05-04" }],
    });
    const kinds = dueReminders({ profile, now: new Date("2026-08-20T09:00:00Z") }).map((r) => r.kind);
    expect(kinds).toContain("child-season");
  });

  it("says nothing in March", () => {
    const profile = profileWith({
      household: [{ id: "m1", relation: "child", birthday: "2018-05-04" }],
    });
    const kinds = dueReminders({ profile, now: new Date("2026-03-13T09:00:00Z") }).map((r) => r.kind);
    expect(kinds).not.toContain("child-season");
  });

  it("skips a toddler, who has no school year", () => {
    const profile = profileWith({
      household: [{ id: "m1", relation: "child", birthday: "2024-05-04" }],
    });
    const kinds = dueReminders({ profile, now: new Date("2026-08-20T09:00:00Z") }).map((r) => r.kind);
    expect(kinds).not.toContain("child-season");
  });

  it("still reminds when the parent did not give a birth date", () => {
    const profile = profileWith({ household: [{ id: "m1", relation: "child", name: "Aziza" }] });
    const kinds = dueReminders({ profile, now: new Date("2026-08-20T09:00:00Z") }).map((r) => r.kind);
    expect(kinds).toContain("child-season");
  });
});

describe("dueReminders — reorder", () => {
  const now = new Date("2026-03-13T09:00:00Z");
  const daysAgo = (n: number) => now.getTime() - n * DAY_MS;

  it("waits until the course is nearly finished", () => {
    const reminders = dueReminders({
      profile: emptyProfile(),
      purchases: [{ slug: "vitamin-d3", ts: daysAgo(10) }],
      now,
    });
    expect(reminders).toEqual([]);
  });

  it("fires a few days before the pack runs out", () => {
    const reminders = dueReminders({
      profile: emptyProfile(),
      purchases: [{ slug: "vitamin-d3", ts: daysAgo(COURSE_DAYS - 3) }],
      now,
    });
    expect(reminders[0]).toMatchObject({ kind: "reorder", productSlug: "vitamin-d3", daysUntil: 3 });
  });

  it("counts from the latest purchase, so buying again restarts the course", () => {
    const reminders = dueReminders({
      profile: emptyProfile(),
      purchases: [
        { slug: "vitamin-d3", ts: daysAgo(40) },
        { slug: "vitamin-d3", ts: daysAgo(2) },
      ],
      now,
    });
    expect(reminders).toEqual([]);
  });

  it("gives up on a purchase nobody came back for", () => {
    const reminders = dueReminders({
      profile: emptyProfile(),
      purchases: [{ slug: "vitamin-d3", ts: daysAgo(200) }],
      now,
    });
    expect(reminders).toEqual([]);
  });
});

describe("dueReminders — stale quiz", () => {
  it("asks for a retake once the saved plan has expired", () => {
    const now = new Date("2026-03-13T09:00:00Z");
    const reminders = dueReminders({
      profile: emptyProfile(),
      quizSavedAt: now.getTime() - 100 * DAY_MS,
      now,
    });
    expect(reminders.map((r) => r.kind)).toContain("quiz-refresh");
  });
});
