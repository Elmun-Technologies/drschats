import { describe, expect, it } from "vitest";
import { suggestTerms } from "./suggest";

const catalogue = ["Swiss Energy", "Dr. Frei", "Delical", "Magniy B6", "Kollagen", "Omega-3", "Vitamin C"];

describe("suggestTerms", () => {
  it("finds the catalogue word behind a misspelling", () => {
    expect(suggestTerms("kolagenn", catalogue)[0]).toBe("Kollagen");
    expect(suggestTerms("swis enrgy", catalogue)[0]).toBe("Swiss Energy");
    expect(suggestTerms("деликал", catalogue)[0]).toBe("Delical");
  });

  it("suggests nothing for a word that is nowhere near", () => {
    expect(suggestTerms("televizor", catalogue)).toEqual([]);
    expect(suggestTerms("ab", catalogue)).toEqual([]);
  });
});
