import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("operator alerts", () => {
  it("fires only past the thresholds", async () => {
    const { alertsFor, FAILED_PER_HOUR_ALERT } = await import("./alerts");
    const calm = { failed1h: FAILED_PER_HOUR_ALERT, overdue: 0, unsentOperatorPings: 0 };
    expect(alertsFor(calm, { circuitOpen: false, recentErrors: false })).toEqual([]);
    const kinds = alertsFor({ failed1h: FAILED_PER_HOUR_ALERT + 1, overdue: 51, unsentOperatorPings: 2 }, { circuitOpen: true, recentErrors: false }).map((a) => a.kind);
    expect(kinds).toEqual(["outbox_failed", "outbox_overdue", "operator_pings", "catalog_fallback"]);
  });

  it("never puts a phone number in the text", async () => {
    const { alertsFor } = await import("./alerts");
    for (const a of alertsFor({ failed1h: 99, overdue: 99, unsentOperatorPings: 9 }, { circuitOpen: true, recentErrors: true })) {
      expect(a.text).not.toMatch(/\+?998\d{9}/);
    }
  });
});
