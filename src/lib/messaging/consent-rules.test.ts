import { describe, expect, it } from "vitest";
import { smsConsentAllows } from "./consent-rules";

describe("advertising SMS consent (law in force 2026-11-01)", () => {
  const consents = new Set(["901234567"]);

  it("needs prior consent for a marketing SMS", () => {
    expect(smsConsentAllows({ kind: "marketing", requested: false, phone9: "901234567" }, consents)).toBe(true);
    expect(smsConsentAllows({ kind: "marketing", requested: false, phone9: "907654321" }, consents)).toBe(false);
    expect(smsConsentAllows({ kind: "marketing", requested: false, phone9: null }, consents)).toBe(false);
  });

  it("lets an order SMS through: it is not advertising", () => {
    expect(smsConsentAllows({ kind: "transactional", requested: false, phone9: "907654321" }, consents)).toBe(true);
  });

  it("lets a message the customer asked for through (restock request)", () => {
    expect(smsConsentAllows({ kind: "marketing", requested: true, phone9: "907654321" }, consents)).toBe(true);
  });
});
