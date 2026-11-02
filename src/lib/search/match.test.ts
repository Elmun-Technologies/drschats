import { describe, expect, it } from "vitest";
import { matchesQuery, searchKey } from "./match";

const vitaminC = ["Swiss Energy Vitamin C 20", "Shipuchi vitamin C, 1000 mg", "askorbin kislota"];
const magnesium = ["Dr. Frei Antistress Magniy 20", "Magniy va B6 vitaminlari"];

describe("searchKey", () => {
  it("drops apostrophes and transliterates Cyrillic", () => {
    expect(searchKey("Goʻzallik")).toBe("gozallik");
    expect(searchKey("go'zallik")).toBe("gozallik");
    expect(searchKey("Витамин Д")).toBe("vitamin d");
  });
});

describe("matchesQuery", () => {
  it("finds words in any order", () => {
    expect(matchesQuery(vitaminC, "c vitamin")).toBe(true);
  });

  it("forgives one typo in a long word", () => {
    expect(matchesQuery(vitaminC, "vitamn")).toBe(true);
    expect(matchesQuery(magnesium, "magnii")).toBe(true);
  });

  it("finds Latin text from a Cyrillic query", () => {
    expect(matchesQuery(magnesium, "магний")).toBe(true);
  });

  it("searches every field, e.g. the ingredient list", () => {
    expect(matchesQuery(vitaminC, "askorbin")).toBe(true);
  });

  it("does not stretch short words or unrelated queries", () => {
    expect(matchesQuery(vitaminC, "zink")).toBe(false);
    expect(matchesQuery(vitaminC, "d3")).toBe(false);
    expect(matchesQuery(magnesium, "vitamin c")).toBe(false);
    expect(matchesQuery(["Antistress"], "c")).toBe(false);
    expect(matchesQuery(magnesium, "b6")).toBe(true);
  });

  it("matches everything for an empty query", () => {
    expect(matchesQuery(vitaminC, "  ")).toBe(true);
  });
});
