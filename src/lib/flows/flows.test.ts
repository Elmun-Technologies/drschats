import { describe, expect, it } from "vitest";
import { DEFAULT_FLOWS } from "./defaults";
import { enrollmentWindow, pickStep, retryDelayMinutes, stepDueAt } from "./schedule";
import { formatDelay, parseSteps, stepsSchema } from "./types";
import { usedPlaceholders } from "@/lib/messaging/template";

const anchor = new Date("2026-10-10T08:00:00Z");
const at = (minutes: number) => new Date(anchor.getTime() + minutes * 60_000);
const steps = [{ delayMinutes: 60 }, { delayMinutes: 1440 }, { delayMinutes: 4320 }];

describe("pickStep", () => {
  it("waits until the first step is due", () => {
    expect(pickStep(steps, anchor, 0, at(30))).toEqual({ send: null, skipped: [], next: { step: 0, at: at(60) } });
  });

  it("sends the due step and schedules the next", () => {
    expect(pickStep(steps, anchor, 0, at(61))).toEqual({ send: 0, skipped: [], next: { step: 1, at: at(1440) } });
    expect(pickStep(steps, anchor, 2, at(5000))).toEqual({ send: 2, skipped: [], next: null });
  });

  it("skips stale steps instead of sending a burst", () => {
    expect(pickStep(steps, anchor, 0, at(5000))).toEqual({ send: 2, skipped: [0, 1], next: null });
    expect(pickStep(steps, anchor, 0, at(2000))).toEqual({ send: 1, skipped: [0], next: { step: 2, at: at(4320) } });
  });

  it("is finished past the last step", () => {
    expect(pickStep(steps, anchor, 3, at(9999))).toEqual({ send: null, skipped: [], next: null });
  });
});

describe("enrollmentWindow", () => {
  it("enrolls recent anchors whose first step is due", () => {
    const now = new Date("2026-10-17T12:00:00Z");
    const { from, to } = enrollmentWindow("cart_abandoned", 60, now);
    expect(to.toISOString()).toBe("2026-10-17T11:00:00.000Z");
    expect(from.toISOString()).toBe("2026-10-15T11:00:00.000Z");
  });

  it("does not reach back into history for lapsed customers", () => {
    const now = new Date("2026-10-17T12:00:00Z");
    const { from, to } = enrollmentWindow("lapsed", 60 * 1440, now);
    expect((to.getTime() - from.getTime()) / 86_400_000).toBe(7);
  });

  it("dues a step from the anchor", () => {
    expect(stepDueAt({ delayMinutes: 90 }, anchor).toISOString()).toBe("2026-10-10T09:30:00.000Z");
  });
});

describe("steps", () => {
  it("validates and sorts by delay", () => {
    const valid = DEFAULT_FLOWS[0].steps;
    expect(parseSteps([...valid].reverse()).map((s) => s.delayMinutes)).toEqual([60, 1440, 4320]);
    expect(parseSteps([{ delayMinutes: -1 }])).toEqual([]);
    expect(parseSteps("nope")).toEqual([]);
    expect(stepsSchema.safeParse([{ ...valid[0], promo: { kind: "percent", value: 95, ttlHours: 24 } }]).success).toBe(false);
  });

  it("seeds five valid playbook flows whose promo steps mention the code", () => {
    expect(DEFAULT_FLOWS.map((f) => f.id)).toEqual(["cart-abandoned", "first-purchase", "course-ending", "lapsed", "restock"]);
    for (const flow of DEFAULT_FLOWS) {
      expect(stepsSchema.safeParse(flow.steps).success).toBe(true);
      for (const step of flow.steps) {
        for (const text of [step.text.uz, step.text.ru]) {
          expect(usedPlaceholders(text)).toContain("havola");
          if (step.promo) expect(usedPlaceholders(text)).toEqual(expect.arrayContaining(["kod", "muddat"]));
          expect(text).not.toMatch(/davolaydi|лечит|100%/i);
        }
        expect(step.text.uz).not.toMatch(/[og]'/);
      }
    }
  });

  it("formats delays", () => {
    expect(formatDelay(0)).toBe("darhol");
    expect(formatDelay(60)).toBe("1 soat");
    expect(formatDelay(4320)).toBe("3 kun");
    expect(formatDelay(45)).toBe("45 daqiqa");
  });

  it("backs off retries", () => {
    expect(retryDelayMinutes(1)).toBe(5);
    expect(retryDelayMinutes(2)).toBe(30);
  });
});
