import { describe, expect, it } from "vitest";
import { normalizePhone, segmentCsv, sha256, type SegmentMember } from "./segment-export";

const member = (over: Partial<SegmentMember> = {}): SegmentMember => ({
  key: "901234567", name: "Ali", phone: "+998 90 123-45-67", email: "Ali@Mail.uz", orders: 2, value: 150000, lastAt: new Date("2026-10-01"), telegramChatId: null, ...over,
});

describe("segment export", () => {
  it("normalises Uzbek phones to E.164 digits", () => {
    expect(normalizePhone("+998 90 123-45-67")).toBe("998901234567");
    expect(normalizePhone("901234567")).toBe("998901234567");
    expect(normalizePhone("12")).toBeNull();
  });

  it("hashes contacts for ad platforms and never ships them raw", () => {
    const meta = segmentCsv([member()], "meta");
    expect(meta).toContain(sha256("998901234567"));
    expect(meta).toContain(sha256("ali@mail.uz"));
    expect(meta).not.toContain("901234567,");
    const google = segmentCsv([member()], "google");
    expect(google).toContain(sha256("+998901234567"));
    expect(google.trim().endsWith(",UZ")).toBe(true);
  });

  it("keeps the CRM list readable and formula-safe", () => {
    const csv = segmentCsv([member({ name: "=HYPERLINK(1)" })], "crm");
    expect(csv).toContain("'=HYPERLINK(1)");
    expect(csv.startsWith("﻿")).toBe(true);
  });
});
