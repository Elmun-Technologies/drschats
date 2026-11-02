import { describe, expect, it } from "vitest";
import { buildKeywordList, guessSubject, keywordIndex, languageOf, normalizeKeyword, toPlannerCsv } from "./generate";
import { SUBJECTS } from "./subjects";

describe("keyword list", () => {
  const rows = buildKeywordList([{ name: { uz: "Swiss Energy Calcivit", ru: "Swiss Energy Кальцивит" }, brand: "Swiss Energy" }]);

  it("covers every non-brand subject in Russian, Uzbek Latin and Uzbek Cyrillic", () => {
    for (const s of SUBJECTS.filter((x) => x.kind !== "brand")) {
      const langs = new Set(rows.filter((r) => r.subject === s.id).map((r) => r.lang));
      expect([...langs].sort(), s.id).toEqual(["ru", "uz", "uz-cyrl"]);
    }
  });

  it("has buying and question forms and stays inside Planner's limit, without duplicates", () => {
    expect(rows.find((r) => r.keyword === "витамин д3 купить в ташкенте")?.intent).toBe("buy");
    expect(rows.find((r) => r.keyword === "magniy narxi")?.lang).toBe("uz");
    expect(rows.find((r) => r.keyword === "магний нархи")?.lang).toBe("uz-cyrl");
    expect(rows.find((r) => r.keyword === "vitamin d3 yetishmasligi belgilari")?.intent).toBe("info");
    expect(rows.some((r) => r.keyword === "swiss energy narxi")).toBe(true);
    expect(rows.length).toBeGreaterThan(800);
    expect(rows.length).toBeLessThan(10_000);
    expect(new Set(rows.map((r) => r.keyword)).size).toBe(rows.length);
  });

  it("writes a one-column CSV", () => {
    const csv = toPlannerCsv(rows.slice(0, 3));
    expect(csv.split("\n")[0]).toBe("Keyword");
    expect(csv.trim().split("\n")).toHaveLength(4);
  });

  it("reads a Planner idea back to its subject and language", () => {
    expect(guessSubject("витамин д3 для детей капли")?.subject).toBe("vitamin-d");
    expect(guessSubject("omega 3 qaysi biri yaxshi")?.subject).toBe("omega-3");
    expect(guessSubject("ремонт телефона")).toBeNull();
    // Planner returns Uzbek apostrophes as spaces.
    expect(keywordIndex(rows).get("soch to kilishi")?.subject).toBe("sym-hair-loss");
    expect(guessSubject("bo g im og rig i davolash")?.subject).toBe("sym-joint-pain");
    expect(languageOf("магний нархи")).toBe("uz-cyrl");
    expect(languageOf("магний купить")).toBe("ru");
    expect(languageOf("magniy narxi")).toBe("uz");
    expect(normalizeKeyword("  Bo‘g‘im  OG'RIG'I! ")).toBe("bo'g'im og'rig'i");
  });
});
