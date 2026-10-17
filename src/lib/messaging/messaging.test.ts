import { describe, expect, it } from "vitest";
import { isQuietHours, nextSendWindow, tashkentHour } from "./quiet-hours";
import { cartSummary, finalizeText, firstName, formatExpiry, formatSum, renderTemplate, usedPlaceholders, withOptOut } from "./template";
import { clickToken, stopToken, verifyClickToken, verifyStopToken } from "./tokens";

describe("quiet hours (Tashkent, UTC+5)", () => {
  it("knows the Tashkent hour", () => {
    expect(tashkentHour(new Date("2026-10-17T04:00:00Z"))).toBe(9);
    expect(tashkentHour(new Date("2026-10-17T19:30:00Z"))).toBe(0);
  });

  it("is quiet from 21:00 to 09:00", () => {
    expect(isQuietHours(new Date("2026-10-17T15:59:00Z"))).toBe(false); // 20:59
    expect(isQuietHours(new Date("2026-10-17T16:00:00Z"))).toBe(true); // 21:00
    expect(isQuietHours(new Date("2026-10-17T03:59:00Z"))).toBe(true); // 08:59
    expect(isQuietHours(new Date("2026-10-17T04:00:00Z"))).toBe(false); // 09:00
  });

  it("defers an evening message to 09:00 the next day", () => {
    expect(nextSendWindow(new Date("2026-10-17T17:30:00Z")).toISOString()).toBe("2026-10-18T04:00:00.000Z");
  });

  it("defers a night message to 09:00 the same Tashkent day", () => {
    // 23:30 UTC on the 17th is 04:30 on the 18th in Tashkent.
    expect(nextSendWindow(new Date("2026-10-17T23:30:00Z")).toISOString()).toBe("2026-10-18T04:00:00.000Z");
    expect(nextSendWindow(new Date("2026-10-17T20:00:00Z")).toISOString()).toBe("2026-10-18T04:00:00.000Z");
  });

  it("leaves a daytime moment as it is", () => {
    const noon = new Date("2026-10-17T07:00:00Z");
    expect(nextSendWindow(noon)).toBe(noon);
  });

  it("crosses month and year ends", () => {
    expect(nextSendWindow(new Date("2026-12-31T18:00:00Z")).toISOString()).toBe("2027-01-01T04:00:00.000Z");
  });
});

describe("templates", () => {
  it("fills known values and keeps the send-time placeholders", () => {
    const queued = renderTemplate("{ism}, savatda {savat} ({summa}). Kod: {kod} — {havola}", { ism: "Malika", savat: "Omega-3", summa: "79 000 soʻm" });
    expect(queued).toBe("Malika, savatda Omega-3 (79 000 soʻm). Kod: {kod} — {havola}");
    expect(finalizeText(queued, { kod: "GV-1", havola: "govita.uz/r/1-x" })).toBe("Malika, savatda Omega-3 (79 000 soʻm). Kod: GV-1 — govita.uz/r/1-x");
  });

  it("removes missing placeholders cleanly", () => {
    expect(finalizeText("{ism}, savatingiz ({summa}) kutmoqda: {havola}", { ism: "Ali", havola: "x" })).toBe("Ali, savatingiz kutmoqda: x");
    expect(finalizeText("Kod {kod} , rahmat", {})).toBe("Kod, rahmat");
  });

  it("does not touch unknown braces", () => {
    expect(renderTemplate("{foo} {ism}", { ism: "A" })).toBe("{foo} A");
    expect(usedPlaceholders("{ism} {kod} {ism} {foo}")).toEqual(["ism", "kod"]);
  });

  it("formats names, sums, carts and expiry", () => {
    expect(firstName("  Malika Karimova ", "uz")).toBe("Malika");
    expect(firstName(null, "uz")).toBe("doʻstim");
    expect(firstName("", "ru")).toBe("друг");
    expect(formatSum(1245000, "uz")).toBe("1 245 000 soʻm");
    expect(formatSum(79000, "ru")).toBe("79 000 сум");
    expect(cartSummary([{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }], "uz")).toBe("A, B va yana 2 ta");
    expect(cartSummary([{ name: "A" }, { name: "B" }, { name: "C" }], "ru")).toBe("A, B и ещё 1");
    expect(cartSummary([], "uz")).toBe("");
    expect(formatExpiry(new Date("2026-10-19T18:59:00Z"))).toBe("19.10, 23:59");
  });

  it("appends the opt-out line per channel", () => {
    expect(withOptOut("Salom", "sms", "govita.uz/s/x", "uz")).toBe("Salom\nSTOP: govita.uz/s/x");
    expect(withOptOut("Привет", "telegram", "u", "ru")).toBe("Привет\n\nОтписаться: u");
  });
});

describe("signed message links", () => {
  it("round-trips a click token and rejects a forged one", () => {
    const token = clickToken(12345);
    expect(verifyClickToken(token)).toBe(12345);
    expect(verifyClickToken(token.replace(/^[0-9a-z]+/, "zzz"))).toBeNull();
    expect(verifyClickToken("abc")).toBeNull();
  });

  it("round-trips a stop token with channel and locale, 15 characters long", () => {
    for (const payload of [
      { phone9: "901234567", channel: "sms", locale: "uz" },
      { phone9: "001234567", channel: "telegram", locale: "ru" },
      { phone9: "999999999", channel: "sms", locale: "ru" },
    ] as const) {
      const token = stopToken(payload);
      expect(token).toHaveLength(15);
      expect(token).not.toContain(payload.phone9);
      expect(verifyStopToken(token)).toEqual(payload);
    }
  });

  it("rejects a tampered stop token", () => {
    const token = stopToken({ phone9: "901234567", channel: "sms", locale: "uz" });
    const flipped = token.slice(0, 14) + (token[14] === "A" ? "B" : "A");
    expect(verifyStopToken(flipped)).toBeNull();
    expect(verifyStopToken("short")).toBeNull();
    expect(verifyStopToken(null)).toBeNull();
  });
});
