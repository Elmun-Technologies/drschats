import { describe, expect, it } from "vitest";
import {
  matchFiles,
  planOutput,
  readCatalogue,
  slugify,
  splitVariant,
} from "./ingest-product-images.mjs";

/**
 * These run against the real catalogue in src/lib/shopflow/mock.ts, so a slug
 * rename breaks the test instead of silently mis-filing product photography.
 */
const catalogue = await readCatalogue();

describe("slugify", () => {
  it("transliterates Cyrillic product names into URL-safe slugs", () => {
    expect(slugify("Swiss Energy Витамин С 550мг 20.jpg")).toBe(
      "swiss-energy-vitamin-c-550mg-20",
    );
    expect(slugify("Dr Frei Тонометр A20.jpg")).toBe("dr-frei-tonometr-a20");
    expect(slugify("Hamdard SAFI-Экс 200мл.jpg")).toBe("hamdard-safi-eks-200ml");
  });

  it("normalizes Uzbek latin orthography", () => {
    expect(slugify("Boʻgʻimlar uchun.jpg")).toBe("bogimlar-uchun");
  });
});

describe("splitVariant", () => {
  it("reads gallery suffixes", () => {
    expect(splitVariant("Vitamin C (1).jpg")).toMatchObject({ variant: 1 });
    expect(splitVariant("Vitamin C (2).jpg")).toMatchObject({ variant: 2 });
    expect(splitVariant("Vitamin C_03.jpg")).toMatchObject({ variant: 3 });
    expect(splitVariant("Vitamin C.jpg").variant).toBe(1);
  });
});

describe("matchFiles", () => {
  const names = [
    "Swiss Energy Витамин С 550мг 20.jpg",
    "Swiss Energy Витамин С 550мг 20 (1).jpg",
    "Dr Frei Тонометр A20.jpg",
    "Delical Ваниль 200мл.jpg",
    "Dr Frei Турбо Бейс Ингалятор.jpg",
    "Peano Бальзам 30г.jpg",
    "Hamdard SAFI-Экс 200мл.jpg",
    "Неизвестный препарат XYZ.jpg",
  ];

  const { assignments, unmatchedFiles } = matchFiles(names, catalogue);

  it("maps Russian filenames onto the right catalogue products", () => {
    expect([...assignments.keys()].sort()).toEqual([
      "delical-vanil-200ml",
      "dr-frei-tonometr-a20",
      "dr-frei-turbo-base-ingalyator",
      "hamdard-safi-eks1-200ml",
      "peano-balzam-30g",
      "swiss-energy-vitamin-c-20",
    ]);
  });

  it("groups gallery variants under one product", () => {
    expect(assignments.get("swiss-energy-vitamin-c-20")).toHaveLength(2);
  });

  it("leaves anything it cannot identify unmatched rather than guessing", () => {
    expect(unmatchedFiles).toEqual(["Неизвестный препарат XYZ.jpg"]);
  });

  it("does not match a product on one generic shared word alone", () => {
    const { assignments: none, unmatchedFiles: rest } = matchFiles(
      ["Просто витамин.jpg"],
      catalogue,
    );
    expect(none.size).toBe(0);
    expect(rest).toHaveLength(1);
  });

  it("does not pick between sibling products on a shared brand alone", () => {
    const { assignments: none, unmatchedFiles: rest } = matchFiles(["Delical.jpg"], catalogue);
    expect(none.size).toBe(0);
    expect(rest).toEqual(["Delical.jpg"]);
  });

  it("matches a rare single word that belongs to one product", () => {
    const { assignments: one } = matchFiles(["ImmunoVit.jpg"], catalogue);
    expect([...one.keys()]).toEqual(["swiss-energy-immunovit-30"]);
  });

  it("treats a standalone Cyrillic lookalike letter as the latin original", () => {
    // "Витамин С" is Vitamin C — the Cyrillic letter reads as "es".
    expect(slugify("Витамин С.jpg")).toBe("vitamin-c");
    const { assignments: one } = matchFiles(["Витамин С.jpg"], catalogue);
    expect([...one.keys()]).toEqual(["swiss-energy-vitamin-c-20"]);
  });
});

describe("planOutput", () => {
  it("names single photos by slug and galleries by position", () => {
    const { assignments } = matchFiles(
      ["Peano Бальзам 30г.jpg", "Swiss Energy Vitamin C 20.jpg", "Swiss Energy Vitamin C 20 (2).jpg"],
      catalogue,
    );
    const { mapping } = planOutput(assignments, "/inbox");
    expect(mapping["peano-balzam-30g"]).toEqual(["/products/peano-balzam-30g.jpg"]);
    expect(mapping["swiss-energy-vitamin-c-20"]).toEqual([
      "/products/swiss-energy-vitamin-c-20-1.jpg",
      "/products/swiss-energy-vitamin-c-20-2.jpg",
    ]);
  });
});
