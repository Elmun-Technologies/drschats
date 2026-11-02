import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/shopflow/types";
import { feedProducts, googleFeed, xmlEscape, yandexFeed } from "./feeds";

const base = {
  id: "p1",
  slug: "omega-3",
  name: "Omega <3> & co",
  tagline: "Tagline",
  description: "Description",
  categorySlug: "vitamins",
  price: 80_000,
  currency: "UZS",
  rating: 0,
  reviewCount: 0,
  inStock: true,
  images: [{ url: "/images/products/x.webp", alt: "" }],
  highlights: [],
  benefits: [],
  ingredients: [],
  howToUse: "",
  faq: [],
  reviews: [],
  badges: [],
  bespoke: false,
  assortment: "core",
  brand: { slug: "swiss-energy", name: "Swiss Energy" },
} as unknown as Product;

const categories = [{ id: "c1", slug: "vitamins", name: "Vitaminlar" }];
const now = new Date("2026-11-02T10:00:00Z");

describe("feedProducts", () => {
  it("keeps only listed, in-stock products with a price and a photo", () => {
    const list = [
      base,
      { ...base, id: "out", inStock: false },
      { ...base, id: "hidden", assortment: "unlisted" },
      { ...base, id: "nophoto", images: [] },
    ] as Product[];
    expect(feedProducts(list).map((p) => p.id)).toEqual(["p1"]);
  });
});

describe("googleFeed", () => {
  it("escapes text and states the real price without an invented GTIN", () => {
    const xml = googleFeed({ products: [base], categories, locale: "uz", now });
    expect(xml).toContain("<g:title>Omega &lt;3&gt; &amp; co</g:title>");
    expect(xml).toContain("<g:price>80000 UZS</g:price>");
    expect(xml).not.toContain("sale_price");
    expect(xml).toContain("<g:brand>Swiss Energy</g:brand>");
    expect(xml).toContain("<g:identifier_exists>no</g:identifier_exists>");
    expect(xml).not.toMatch(/gtin|mpn/);
    expect(xml).toMatch(/<g:link>https?:\/\/[^<]+\/uz\/product\/omega-3<\/g:link>/);
    expect(xml).toMatch(/<g:image_link>https?:\/\/[^<]+\/images\/products\/x\.webp<\/g:image_link>/);
  });

  it("lists a sale as the old price plus sale_price, with the real end only", () => {
    const sale = { ...base, price: 70_000, oldPrice: 90_000, saleEndsAt: "2026-11-05T19:00:00Z" };
    const xml = googleFeed({ products: [sale], categories, locale: "ru", now });
    expect(xml).toContain("<g:price>90000 UZS</g:price>");
    expect(xml).toContain("<g:sale_price>70000 UZS</g:sale_price>");
    expect(xml).toContain("<g:sale_price_effective_date>2026-11-02T10:00:00Z/2026-11-05T19:00:00Z</g:sale_price_effective_date>");
  });
});

describe("yandexFeed", () => {
  it("is a YML catalogue in UZS with price, oldprice and the used categories", () => {
    const sale = { ...base, price: 70_000, oldPrice: 90_000 };
    const xml = yandexFeed({ products: [sale], categories: [...categories, { id: "c2", slug: "empty", name: "Bo'sh" }], locale: "ru", now });
    expect(xml).toContain('<yml_catalog date="2026-11-02T15:00+05:00">');
    expect(xml).toContain('<currency id="UZS" rate="1"/>');
    expect(xml).toContain('<category id="1">Vitaminlar</category>');
    expect(xml).not.toContain("empty");
    expect(xml).toContain("<price>70000</price>");
    expect(xml).toContain("<oldprice>90000</oldprice>");
    expect(xml).toContain("<vendor>Swiss Energy</vendor>");
    expect(xml).toContain('<offer id="p1" available="true">');
  });
});

describe("xmlEscape", () => {
  it("drops control characters XML 1.0 cannot carry", () => {
    expect(xmlEscape("a\u0001b\tc")).toBe("ab\tc");
  });
});
