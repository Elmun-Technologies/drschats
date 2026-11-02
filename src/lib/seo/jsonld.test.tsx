import { describe, expect, it } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd, articleGraph, breadcrumbLd, collectionLd, localBusinessLd, organizationNode, priceValidUntil, productGraph, serializeJsonLd } from "./jsonld";
import { SITE_URL } from "./metadata";
import { COMMERCE } from "@/lib/config/commerce";
import type { Product } from "@/lib/shopflow/types";

describe("serializeJsonLd", () => {
  const hostile = { name: "</script><script>alert(1)</script> <!-- & \u2028\u2029" };

  it("cannot close the script element or open a comment", () => {
    const out = serializeJsonLd(hostile);
    expect(out).not.toMatch(/[<>&\u2028\u2029]/);
    expect(out).toContain("\\u003c/script\\u003e");
  });

  it("parses back to the same value", () => {
    expect(JSON.parse(serializeJsonLd(hostile))).toEqual(hostile);
  });

  it("renders one intact script element", () => {
    // Vitest compiles JSX with the classic runtime and has no React global; Next uses the automatic one.
    (globalThis as { React?: typeof React }).React = React;
    const html = renderToStaticMarkup(<JsonLd data={hostile} />);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain("<!--");
  });
});

const product = {
  id: "p1",
  slug: "test-product",
  name: "Test",
  tagline: "Tagline",
  description: "Description",
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
} as unknown as Product;

function offerOf(graph: ReturnType<typeof productGraph>) {
  const node = graph["@graph"].find((n) => (n as { "@type": unknown })["@type"] === "Product") as { offers: Record<string, unknown> };
  return node.offers;
}

describe("priceValidUntil", () => {
  const now = Date.parse("2026-11-02T10:00:00Z");

  it("is absent without a real sale end", () => {
    expect(priceValidUntil(product, now)).toBeUndefined();
    expect(priceValidUntil({ ...product, oldPrice: 100_000 }, now)).toBeUndefined();
    expect(priceValidUntil({ ...product, saleEndsAt: "2026-11-05T00:00:00Z" }, now)).toBeUndefined();
  });

  it("is absent once the sale has ended", () => {
    expect(priceValidUntil({ ...product, oldPrice: 100_000, saleEndsAt: "2026-11-01T00:00:00Z" }, now)).toBeUndefined();
  });

  it("is the Tashkent calendar day of a real end", () => {
    // 20:30 UTC is 01:30 the next day in Tashkent (UTC+5).
    expect(priceValidUntil({ ...product, oldPrice: 100_000, saleEndsAt: "2026-11-05T20:30:00Z" }, now)).toBe("2026-11-06");
  });
});

describe("productGraph offer", () => {
  it("claims no priceValidUntil for a product without a sale end", () => {
    expect(offerOf(productGraph({ product, locale: "uz", reviewer: null, author: null }))).not.toHaveProperty("priceValidUntil");
  });

  it("states the shop's own return window", () => {
    const offer = offerOf(productGraph({ product, locale: "ru", reviewer: null, author: null }));
    expect(offer.hasMerchantReturnPolicy).toMatchObject({
      "@type": "MerchantReturnPolicy",
      applicableCountry: "UZ",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: COMMERCE.returns.unopenedWindowDays,
      merchantReturnLink: `${SITE_URL}/ru/guarantee`,
    });
  });
});

describe("articleGraph", () => {
  const base = {
    title: "T",
    description: "D",
    image: "/images/stock/st-cat-capsules.webp",
    url: `${SITE_URL}/uz/blog/x`,
    datePublished: "2026-05-20",
    locale: "uz" as const,
    reviewer: null,
  };
  const page = (g: ReturnType<typeof articleGraph>) => g["@graph"][0] as Record<string, unknown>;

  it("names the organisation as author when there is no expert", () => {
    const node = page(articleGraph({ ...base, author: null }));
    expect(node.author).toEqual({ "@id": `${SITE_URL}/#organization` });
    expect(node.publisher).toEqual({ "@id": `${SITE_URL}/#organization` });
  });

  it("claims no dateModified without a real edit date", () => {
    expect(page(articleGraph({ ...base, author: null }))).not.toHaveProperty("dateModified");
    expect(page(articleGraph({ ...base, author: null, dateModified: "2026-06-01" })).dateModified).toBe("2026-06-01");
  });
});

describe("breadcrumbLd", () => {
  it("starts the trail at the home page of the URL's locale", () => {
    const ld = breadcrumbLd([{ name: "Kafolat", url: `${SITE_URL}/uz/guarantee` }]);
    expect(ld.itemListElement.map((i) => i.name)).toEqual(["Bosh sahifa", "Kafolat"]);
    expect(ld.itemListElement[0].item).toBe(`${SITE_URL}/uz`);
  });

  it("does not repeat a home crumb the caller already gave", () => {
    const ld = breadcrumbLd([
      { name: "Главная", url: `${SITE_URL}/ru` },
      { name: "Каталог", url: `${SITE_URL}/ru/products` },
    ]);
    expect(ld.itemListElement).toHaveLength(2);
  });
});

describe("shared nodes", () => {
  it("Organization and Store name the same profiles", () => {
    expect(localBusinessLd("uz").sameAs).toEqual(organizationNode("uz").sameAs);
  });

  it("states Tashkent and the regions as two shipping promises", () => {
    const shipping = offerOf(productGraph({ product, locale: "uz", reviewer: null, author: null })).shippingDetails as {
      shippingDestination: { addressRegion?: string };
      deliveryTime: { transitTime: { maxValue: number } };
    }[];
    expect(shipping).toHaveLength(2);
    expect(shipping[0].shippingDestination.addressRegion).toBe("UZ-TK");
    expect(shipping[0].deliveryTime.transitTime.maxValue).toBeLessThan(shipping[1].deliveryTime.transitTime.maxValue);
  });

  it("collection pages hang off a WebSite node that is actually there", () => {
    const ld = collectionLd({ name: "X", url: `${SITE_URL}/uz/products/x`, products: [] });
    expect(ld.isPartOf).toMatchObject({ "@type": "WebSite", "@id": `${SITE_URL}/#website` });
  });
});
