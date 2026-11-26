import { describe, expect, it } from "vitest";
import { CatalogEngine } from "./engine";
import { ADULT_CATEGORY } from "./adult";
import { builtInCatalog } from "@/lib/shopflow/mock";
import { allAdultStrings, adultCopy } from "@/lib/content/adult";
import { BANNED_CLAIMS } from "@/lib/content/claims";
import { itemOf } from "@/lib/analytics/events";
import { audienceOf } from "@/lib/quiz/audience-fit";

const base = builtInCatalog.products.find((p) => p.inStock)!;
const condom = { ...base, id: "p-dolphi-test", slug: "dolphi-test", categorySlug: ADULT_CATEGORY };
const engine = new CatalogEngine(async () => ({ ...builtInCatalog, products: [...builtInCatalog.products, condom] }));

describe("the 18+ shelf stays apart", () => {
  it("is left out of every listing unless asked for", async () => {
    const all = await engine.getProducts({ locale: "uz", pageSize: 500, assortment: "all" });
    expect(all.items.some((p) => p.slug === condom.slug)).toBe(false);
    const found = await engine.getProducts({ locale: "uz", pageSize: 500, assortment: "all", search: "dolphi" });
    expect(found.items).toHaveLength(0);
  });

  it("shows on its own page and where the visitor already chose it", async () => {
    const shelf = await engine.getProducts({ locale: "uz", category: ADULT_CATEGORY, pageSize: 50 });
    expect(shelf.items.map((p) => p.slug)).toEqual([condom.slug]);
    const cart = await engine.getProducts({ locale: "uz", pageSize: 500, assortment: "all", adult: "include" });
    expect(cart.items.some((p) => p.slug === condom.slug)).toBe(true);
    expect(await engine.getProduct(condom.slug, "uz")).not.toBeNull();
  });

  it("is not a category in the shared list", async () => {
    const categories = await engine.getCategories("uz");
    expect(categories.some((c) => c.slug === ADULT_CATEGORY)).toBe(false);
  });

  it("pairs only with itself", () => {
    expect(audienceOf(condom)).toBe("adult");
  });

  it("never reaches analytics by name", () => {
    const item = itemOf({ ...condom, name: "Dolphi" });
    expect(item.item_name).toBe("18+");
    expect(item.item_id).not.toContain("dolphi");
    expect(itemOf({ slug: "x", name: "Dolphi", price: 1, adult: true }).item_name).toBe("18+");
  });
});

describe("18+ page copy", () => {
  it("makes no medical promise", () => {
    for (const text of allAdultStrings()) for (const re of BANNED_CLAIMS) expect(text, text).not.toMatch(re);
  });

  it("writes Uzbek with ʻ, not an ASCII apostrophe", () => {
    const uz = JSON.stringify(adultCopy("uz"));
    expect(uz).not.toMatch(/[oOgG]['’‘]/);
  });
});
