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

describe("readCatalogue", () => {
  /*
    rawCategories entries share the `{ slug, name: { uz, ru } }` shape with
    products. Letting one through would file a photo under a slug that has no
    product page — a mapping entry that renders nothing while looking fine.
  */
  const CATEGORY_SLUGS = [
    "vitamins", "immunity", "beauty", "kids", "effervescent",
    "minerals", "devices", "coffee", "nutrition", "skin",
  ];

  it("returns products only, never categories", () => {
    expect(catalogue.length).toBeGreaterThanOrEqual(19);
    expect(catalogue.filter((p) => CATEGORY_SLUGS.includes(p.slug))).toEqual([]);
  });

  it("does not file a category name as a product", () => {
    const { assignments: none, unmatchedFiles: rest } = matchFiles(["Витамины.jpg"], catalogue);
    expect(none.size).toBe(0);
    expect(rest).toEqual(["Витамины.jpg"]);
  });
});

/**
 * One realistic filename per catalogue product, the way they arrive from the
 * supplier folders. If a slug is renamed or a name is reworded, this fails
 * here rather than mis-filing a real photo later.
 */
const FULL_CATALOGUE_FIXTURE = [
  ["Delical Ваниль 200мл.jpg", "delical-vanil-200ml"],
  ["Delical Шоколад 200мл.jpg", "delical-shokolad-200ml"],
  ["Delical Абрикос 200мл.jpg", "delical-abrikos-200ml"],
  ["Swiss Energy Coffee Edel 250г.jpg", "swiss-energy-coffee-edel-250g"],
  ["Swiss Energy Coffee Edel 500г.jpg", "swiss-energy-coffee-edel-500g"],
  ["Swiss Energy Coffee Crema 500г.jpg", "swiss-energy-coffee-crema-500g"],
  ["Swiss Energy Coffee Crema 250г.jpg", "swiss-energy-coffee-crema-250g"],
  ["Swiss Energy Hair Nail Skin 30.jpg", "swiss-energy-hair-nail-skin-30"],
  ["Dr Frei Turbo Base Ингалятор.jpg", "dr-frei-turbo-base-ingalyator"],
  ["Peano Бальзам 30г.jpg", "peano-balzam-30g"],
  ["Swiss Energy Visiovit 30.jpg", "swiss-energy-visiovit-30"],
  ["Swiss Energy ImmunoVit 30.jpg", "swiss-energy-immunovit-30"],
  ["Dr Frei A20 Тонометр.jpg", "dr-frei-tonometr-a20"],
  ["Dr Frei Multivitamins Biotin 20.jpg", "dr-frei-multivitamins-biotin-20"],
  ["Hamdard Safi Экс 200мл.jpg", "hamdard-safi-eks1-200ml"],
  ["Dr Frei Gold Витамины 20.jpg", "dr-frei-gold-vitamins-20"],
  ["Dr Frei Kids Мультивитамины 20.jpg", "dr-frei-kids-multivitamins-20"],
  ["Swiss Energy Витамин С 550мг 20.jpg", "swiss-energy-vitamin-c-20"],
  ["Dr Frei Антистресс Магний B6 20.jpg", "dr-frei-antistress-magniy-20"],
  ["Swiss Energy Calcivit Кальцивит 30.jpg", "swiss-energy-calcivit-30"],
  ["Swiss Energy NeuroForce Нейрофорс 30.jpg", "swiss-energy-neuroforce-30"],
  ["Swiss Energy Potenton Потентон 30.jpg", "swiss-energy-potenton-30"],
  ["Swiss Energy Prenatal Forte Пренаталь 60.jpg", "swiss-energy-prenatal-forte-60"],
  ["Аминоморин Форте 30.jpg", "aminomorin-forte-30"],
  ["Swiss Energy Nature Collagen Коллаген.jpg", "swiss-energy-nature-collagen"],
  ["Swiss Energy Coffee Mokka 500г.jpg", "swiss-energy-coffee-mokka-500g"],
  ["Dr Frei Термометр T10.jpg", "dr-frei-thermometer-t10"],
  ["Dr Frei Термометр T30 kids.jpg", "dr-frei-thermometer-t30"],
  ["HIEW пластырь от жара 16.jpg", "hiew-cooling-plaster-16"],
  ["Dr Frei Turbo Lex Турболекс Ингалятор.jpg", "dr-frei-turbo-lex-ingalyator"],
];

describe("full catalogue matching", () => {
  const { assignments, unmatchedFiles } = matchFiles(
    FULL_CATALOGUE_FIXTURE.map(([file]) => file),
    catalogue,
  );

  const slugFor = (file) =>
    [...assignments.entries()].find(([, ms]) => ms.some((m) => m.name === file))?.[0];

  it.each(FULL_CATALOGUE_FIXTURE)("files %s under %s", (file, want) => {
    expect(slugFor(file)).toBe(want);
  });

  it("leaves nothing unmatched and covers every product", () => {
    expect(unmatchedFiles).toEqual([]);
    expect(assignments.size).toBe(FULL_CATALOGUE_FIXTURE.length);
  });

  it("keeps the 250g and 500g coffee variants apart", () => {
    expect(slugFor("Swiss Energy Coffee Edel 250г.jpg")).toBe("swiss-energy-coffee-edel-250g");
    expect(slugFor("Swiss Energy Coffee Edel 500г.jpg")).toBe("swiss-energy-coffee-edel-500g");
    expect(slugFor("Swiss Energy Coffee Crema 250г.jpg")).toBe("swiss-energy-coffee-crema-250g");
    expect(slugFor("Swiss Energy Coffee Crema 500г.jpg")).toBe("swiss-energy-coffee-crema-500g");
  });
});
