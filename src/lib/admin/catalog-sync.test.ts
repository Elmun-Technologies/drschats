import { describe, expect, it } from "vitest";
import { catalogDiff, dismissKeysOf, parseDismissed, resolveCategorySlug, type BuiltInCatalog, type CatalogSnapshot } from "./catalog-sync";
import { slugify } from "./slugify";
import { belongsTo, filterRepoImages, type RepoImage } from "./repo-images";
import { rawCategories, rawProducts } from "@/lib/shopflow/mock";
import { PRODUCT_PHOTOS } from "@/lib/content/product-photos";
import { PRODUCT_CUTOUTS } from "@/lib/content/product-cutouts";

const builtIn: BuiltInCatalog = {
  products: [
    { id: "p-a", slug: "a", name: "A", categorySlug: "vit", images: ["/products/a-1.webp"], cutout: "/images/products/c-a.png" },
    { id: "p-b", slug: "b", name: "B", categorySlug: "vit", images: ["/products/b-1.webp"], cutout: null },
    { id: "p-c", slug: "c", name: "C", categorySlug: "min", images: [], cutout: null },
  ],
  categories: [
    { id: "cat-vit", slug: "vit", name: "Vit", image: "/images/products/c-a.png" },
    { id: "cat-min", slug: "min", name: "Min", image: null },
  ],
  brands: [{ slug: "swiss", name: "Swiss" }, { slug: "frei", name: "Frei" }],
};

const empty: CatalogSnapshot = { products: [], categories: [], brands: [] };

describe("catalogDiff", () => {
  it("reports everything missing for an empty database", () => {
    const diff = catalogDiff(builtIn, empty);
    expect(diff.missingProducts.map((p) => p.slug)).toEqual(["a", "b", "c"]);
    expect(diff.missingCategories.map((c) => c.slug)).toEqual(["vit", "min"]);
    expect(diff.missingBrands.map((b) => b.slug)).toEqual(["swiss", "frei"]);
    expect(diff.pending).toBe(7);
    expect(diff.backfillProducts).toEqual([]);
  });

  it("counts a row as present by slug or by id (a renamed product is not missing)", () => {
    const diff = catalogDiff(builtIn, {
      products: [
        { id: "p-a", slug: "a-renamed", images: ["/x.webp"], cutout: null },
        { id: "p-other", slug: "b", images: ["/y.webp"], cutout: null },
      ],
      categories: [{ id: "cat-vit", slug: "vitaminlar", image: "/z.png" }],
      brands: [{ slug: "swiss" }],
    });
    expect(diff.missingProducts.map((p) => p.slug)).toEqual(["c"]);
    expect(diff.missingCategories.map((c) => c.slug)).toEqual(["min"]);
    expect(diff.missingBrands.map((b) => b.slug)).toEqual(["frei"]);
  });

  it("backfills only rows with neither photos nor cutout, matched by slug", () => {
    const diff = catalogDiff(builtIn, {
      ...empty,
      products: [
        { id: "x1", slug: "a", images: [], cutout: null },
        { id: "x2", slug: "b", images: ["/own.webp"], cutout: null },
        { id: "x3", slug: "c", images: [], cutout: null },
        { id: "x4", slug: "hand-made", images: [], cutout: null },
      ],
    });
    expect(diff.backfillProducts).toEqual([{ slug: "a", images: ["/products/a-1.webp"], cutout: "/images/products/c-a.png" }]);
  });

  it("never backfills a product that has a cutout but no photos", () => {
    const diff = catalogDiff(builtIn, { ...empty, products: [{ id: "x", slug: "a", images: [], cutout: "/mine.png" }] });
    expect(diff.backfillProducts).toEqual([]);
  });

  it("backfills a category image only when it is empty", () => {
    const diff = catalogDiff(builtIn, {
      ...empty,
      categories: [
        { id: "cat-vit", slug: "vit", image: null },
        { id: "cat-min", slug: "min", image: null },
      ],
    });
    expect(diff.backfillCategories).toEqual([{ slug: "vit", image: "/images/products/c-a.png" }]);
  });

  it("dismissed items stay listed but stop counting as pending", () => {
    const first = catalogDiff(builtIn, empty);
    const dismissed = dismissKeysOf(first);
    expect(catalogDiff(builtIn, empty, dismissed).pending).toBe(0);
    expect(catalogDiff(builtIn, empty, dismissed).missingProducts).toHaveLength(3);
  });
});

describe("resolveCategorySlug", () => {
  const cats = [{ id: "cat-vit", slug: "vit" }];
  it("keeps the slug when the database has it", () => {
    expect(resolveCategorySlug("vit", cats, [{ id: "cat-vit", slug: "vit" }])).toBe("vit");
  });
  it("follows a renamed category by id", () => {
    expect(resolveCategorySlug("vit", cats, [{ id: "cat-vit", slug: "vitaminlar" }])).toBe("vitaminlar");
  });
  it("gives null instead of a dangling foreign key", () => {
    expect(resolveCategorySlug("vit", cats, [])).toBeNull();
  });
});

describe("parseDismissed", () => {
  it("tolerates junk", () => {
    expect(parseDismissed(null)).toEqual([]);
    expect(parseDismissed("not json")).toEqual([]);
    expect(parseDismissed('["p:a", 3, "c:b"]')).toEqual(["p:a", "c:b"]);
  });
});

describe("the real built-in catalogue", () => {
  it("every built-in product has photos to bring into the panel", () => {
    const withoutPhotos = rawProducts.filter((p) => !PRODUCT_PHOTOS[p.slug]?.length).map((p) => p.slug);
    expect(withoutPhotos).toEqual([]);
  });
  it("every built-in product's category is a built-in category", () => {
    const slugs = new Set(rawCategories.map((c) => c.slug));
    expect(rawProducts.filter((p) => !slugs.has(p.categorySlug)).map((p) => p.slug)).toEqual([]);
  });
  it("cutouts point at c-*.png files", () => {
    for (const src of Object.values(PRODUCT_CUTOUTS)) expect(src).toMatch(/^\/images\/products\/c-.+\.png$/);
  });
});

describe("slugify", () => {
  it("folds Uzbek apostrophes and Cyrillic", () => {
    expect(slugify("Goʻzallik va teri")).toBe("gozallik-va-teri");
    expect(slugify("Витамины для детей")).toBe("vitamini-dlya-detey");
    expect(slugify("  Swiss Energy Omega-3 30 ")).toBe("swiss-energy-omega-3-30");
    expect(slugify("---")).toBe("");
  });
});

describe("repo image picker", () => {
  const list: RepoImage[] = [
    { src: "/products/b-1.webp", name: "b-1.webp", kind: "photo" },
    { src: "/products/omega-3-30-1.webp", name: "omega-3-30-1.webp", kind: "photo" },
    { src: "/products/omega-3-300-1.webp", name: "omega-3-300-1.webp", kind: "photo" },
    { src: "/images/products/c-omega-3-30-1.png", name: "c-omega-3-30-1.png", kind: "cutout" },
  ];
  it("searches by words and kind", () => {
    expect(filterRepoImages(list, { query: "omega 30" }).map((i) => i.name)).toEqual(["omega-3-30-1.webp", "omega-3-300-1.webp", "c-omega-3-30-1.png"]);
    expect(filterRepoImages(list, { kind: "cutout" }).map((i) => i.name)).toEqual(["c-omega-3-30-1.png"]);
  });
  it("puts the product's own files first, without matching a longer slug", () => {
    expect(filterRepoImages(list, { slug: "omega-3-30" }).map((i) => i.name)).toEqual(["omega-3-30-1.webp", "c-omega-3-30-1.png", "b-1.webp", "omega-3-300-1.webp"]);
    expect(belongsTo(list[2], "omega-3-30")).toBe(false);
  });
});
