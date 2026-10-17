import { describe, expect, it } from "vitest";
import { countSms, isGsm7, prepareSmsText } from "./segments";

describe("countSms", () => {
  it("fits 160 GSM-7 characters in one part", () => {
    expect(countSms("a".repeat(160))).toMatchObject({ encoding: "GSM-7", parts: 1, remaining: 0 });
    expect(countSms("a".repeat(161))).toMatchObject({ encoding: "GSM-7", parts: 2, perPart: 153 });
    expect(countSms("a".repeat(306)).parts).toBe(2);
    expect(countSms("a".repeat(307)).parts).toBe(3);
  });

  it("counts extended characters as two septets", () => {
    expect(countSms("€".repeat(80))).toMatchObject({ encoding: "GSM-7", length: 160, parts: 1 });
    expect(countSms("[" + "a".repeat(159)).parts).toBe(2);
  });

  it("switches to UCS-2 for Cyrillic and the Uzbek ʻ", () => {
    expect(countSms("Привет").encoding).toBe("UCS-2");
    expect(countSms("soʻm").encoding).toBe("UCS-2");
    expect(countSms("я".repeat(70))).toMatchObject({ parts: 1 });
    expect(countSms("я".repeat(71))).toMatchObject({ parts: 2, perPart: 67 });
    expect(countSms("я".repeat(134)).parts).toBe(2);
    expect(countSms("я".repeat(135)).parts).toBe(3);
  });

  it("is zero parts for an empty text", () => {
    expect(countSms("").parts).toBe(0);
  });
});

describe("prepareSmsText", () => {
  it("keeps Uzbek letters unless transliteration is on", () => {
    expect(prepareSmsText("Toʻlov — soʻm", { transliterate: false })).toBe("Toʻlov - soʻm");
    const plain = prepareSmsText("Toʻlov — soʻm, taʼm", { transliterate: true });
    expect(plain).toBe("To'lov - so'm, ta'm");
    expect(isGsm7(plain)).toBe(true);
  });

  it("replaces smart quotes and ellipsis", () => {
    expect(prepareSmsText("«Go Vita»… “ok”", { transliterate: false })).toBe('"Go Vita"... "ok"');
  });
});
