import type { Product } from "@/lib/shopflow/types";
import type { Expert } from "@/lib/content/experts";
import { SITE_NAME, SITE_URL } from "./metadata";
import { absoluteUrl } from "@/lib/config/site";
import type { Locale } from "@/lib/i18n/routing";
import { locales } from "@/lib/i18n/routing";
import { BRAND } from "@/lib/brand";
import { DEFAULT_PRICING, type PricingRules } from "@/lib/commerce/settings";
import { brandOf } from "@/lib/catalog/product-facts";
import { COMMERCE } from "@/lib/config/commerce";

/*
  Structured-data image URLs, made absolute.

  Google's Product rich result requires an absolute URL: a relative one is not
  resolved against the page, it is reported as invalid and the product loses
  the rich result. The catalogue serves its own photography from /products, so
  every URL arriving here is relative — but a Sanity or Shopflow image can be
  absolute already, and passing one of those through `absoluteUrl` would
  produce "https://www.govita.uz/https://cdn.sanity.io/…".

  og:image did not have this problem because it is built in metadata.ts, which
  always absolutizes. Only this path was missed.
*/
function structuredDataImage(url: string): string {
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

/*
  JSON for the inside of a <script> element. JSON.stringify leaves `<`, `>` and
  `&` alone, so a product name or an article from the admin or Sanity holding
  "</script>" or "<!--" ended the element early and the rest ran as HTML.
  Escaped as \u003c etc. the JSON parses to the same value. U+2028/U+2029
  are escaped too: legal in JSON, line terminators to older JS parsers.
*/
const SCRIPT_UNSAFE: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => SCRIPT_UNSAFE[c]);
}

/** Renders a JSON-LD <script> for rich results / AI agents. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

function personNode(expert: Expert) {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/experts/${expert.slug}#person`,
    name: expert.name,
    jobTitle: expert.title,
    url: `${SITE_URL}/experts/${expert.slug}`,
    sameAs: expert.sameAs,
    ...(expert.credentials && expert.credentials.length > 0
      ? {
          hasCredential: expert.credentials.map((c) => ({
            "@type": "EducationalOccupationalCredential",
            credentialCategory: c,
          })),
        }
      : {}),
  };
}

/*
  The Organization node, and the three things that were wrong with it.

  1. It published a phone number (+998-71-200-00-00) that appears nowhere else
     on the site — not the number in the header, the footer or any invoice. A
     structured-data contact that nobody answers is worse than none, so it now
     reads from BRAND like every other surface.
  2. It pointed `logo` at /brand/logo.png, a file that does not exist; the
     public/brand folder holds only a README. Google rejects a broken image in
     an Organization node, and an app icon is the honest substitute until a
     real logo file lands.
  3. It declared a Telegram bot handle that is not this shop's (drschatsstorebot).
     `sameAs` is a strongest-form identity claim — it now lists only the
     accounts BRAND actually owns.

  Legal identifiers are appended when configured: a STIR and a registered
  address are what makes a pharmacy's Organization node worth trusting.
*/
/*
  Descriptions in the page's own language.

  The Organization and WebSite nodes carried one Uzbek sentence, so the
  Russian home page shipped Uzbek structured data in the middle of an
  otherwise Russian document. Search engines read the JSON-LD exactly like
  body text.
*/
const ORG_DESCRIPTION: Record<string, string> = {
  uz: "Vitaminlar, biologik faol qoʻshimchalar va tibbiy mahsulotlarni Oʻzbekistonga rasmiy import qiluvchi va yetkazib beruvchi.",
  ru: "Официальный импорт витаминов, биологически активных добавок и медицинских товаров в Узбекистан.",
};

/** One list for Organization and Store: two different sets read as two different entities. */
export const SAME_AS = [BRAND.social.telegram, BRAND.social.instagram, BRAND.social.facebook];

/** The registered address in the page's language: the Russian pages had it in Latin. */
function postalAddress(locale: Locale) {
  const ru = locale === "ru" && BRAND.legal.addressRu;
  return {
    "@type": "PostalAddress",
    streetAddress: ru ? BRAND.legal.addressRu : BRAND.legal.address,
    addressCountry: "UZ",
    addressLocality: ru ? "Ташкент" : "Toshkent",
  };
}

export function organizationNode(locale: Locale = "uz") {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    description: `${BRAND.name} — ${ORG_DESCRIPTION[locale] ?? ORG_DESCRIPTION.uz}`,
    // STIR is a taxpayer number, not a VAT registration: schema.org taxID.
    ...(BRAND.legal.stir ? { taxID: BRAND.legal.stir } : {}),
    address: postalAddress(locale),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BRAND.contact.phone,
      email: BRAND.contact.email,
      contactType: "customer service",
      areaServed: "UZ",
      availableLanguage: ["Uzbek", "Russian"],
    },
    sameAs: SAME_AS,
  };
}

export function organizationLd(locale: Locale = "uz") {
  return { "@context": "https://schema.org", ...organizationNode(locale) };
}

/*
  The last day a sale price holds, as a Tashkent calendar date — only when the
  admin set a real end ("Aksiya tugashi" or the deal of the day). A sale with no
  end, or no sale at all, claims nothing: an invented date is what got
  priceValidUntil removed before.
*/
export function priceValidUntil(product: Pick<Product, "price" | "oldPrice" | "saleEndsAt">, now = Date.now()): string | undefined {
  if (!product.saleEndsAt || !product.oldPrice || product.oldPrice <= product.price) return undefined;
  const end = Date.parse(product.saleEndsAt);
  if (!Number.isFinite(end) || end <= now) return undefined;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(end);
}

/*
  The shop's own return terms, as /guarantee states them: unopened packs within
  COMMERCE.returns.unopenedWindowDays, money back in full. Return fees and the
  method are not stated anywhere on the site, so they are not claimed here.
*/
export function merchantReturnPolicyNode(locale: Locale) {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "UZ",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: COMMERCE.returns.unopenedWindowDays,
    itemCondition: "https://schema.org/NewCondition",
    refundType: "https://schema.org/FullRefund",
    merchantReturnLink: `${SITE_URL}/${locale}/guarantee`,
  };
}

/*
  Two promises, as /delivery makes them: Tashkent within
  COMMERCE.delivery.tashkent.hours (0–1 day in transit), the rest of the
  country in 1–3 days. One country-wide 1–3 day node understated the city,
  where most orders go. Tashkent city is UZ-TK in ISO 3166-2.
*/
export function shippingDetailsNodes(price: number, pricing: Pick<PricingRules, "freeShippingOver" | "shippingFee">) {
  const rate = {
    "@type": "MonetaryAmount",
    // What one unit actually costs to ship: free only above the threshold.
    value: price >= pricing.freeShippingOver ? 0 : pricing.shippingFee,
    currency: "UZS",
  };
  const days = (min: number, max: number) => ({ "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" });
  const cityDays = Math.max(1, Math.ceil(COMMERCE.delivery.tashkent.hours / 24));
  return [
    {
      "@type": "OfferShippingDetails",
      shippingRate: rate,
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "UZ", addressRegion: "UZ-TK" },
      deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: days(0, 0), transitTime: days(0, cityDays) },
    },
    {
      "@type": "OfferShippingDetails",
      shippingRate: rate,
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "UZ" },
      deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: days(0, 1), transitTime: days(1, 3) },
    },
  ];
}

/**
 * Product page graph: MedicalWebPage (with author + reviewedBy) + Product +
 * Organization — the YMYL-grade structured-data model. `reviewer` and `author`
 * power the E-E-A-T `reviewedBy` signal that search engines and AI agents read.
 */
export function productGraph({
  product,
  locale,
  reviewer,
  author,
  datePublished,
  dateModified,
  pricing = DEFAULT_PRICING,
}: {
  product: Product;
  locale: Locale;
  /** The admin's commerce rules (threshold, courier fee) — what one unit really costs to ship. */
  pricing?: Pick<PricingRules, "freeShippingOver" | "shippingFee">;
  /** Null while the review board is empty — see content/experts.ts. */
  reviewer: Expert | null;
  author: Expert | null;
  datePublished?: string;
  dateModified?: string;
}) {
  const url = `${SITE_URL}/${locale}/product/${product.slug}`;
  const brand = brandOf(product);
  const validUntil = priceValidUntil(product);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${product.name} — Go Vita`,
        description: product.tagline,
        inLanguage: locale,
        // Only real dates: a fixed placeholder told crawlers every page was edited the same day.
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified ? { dateModified } : {}),
        isPartOf: { "@id": `${SITE_URL}/#organization` },
        ...(author ? { author: personNode(author) } : {}),
        ...(reviewer ? { reviewedBy: personNode(reviewer) } : {}),
      },
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        image: product.images.map((i) => structuredDataImage(i.url)),
        description: product.description || product.tagline,
        sku: product.id,
        // The maker, not the shop: "Go Vita" as the brand of a Swiss Energy pack was a false claim.
        ...(brand ? { brand: { "@type": "Brand", name: brand.name } } : {}),
        /*
          Only claimed when there is something to claim. A product with no
          reviews yet must not carry an AggregateRating node: zero stars out
          of zero reviews is invalid structured data, and inventing the
          numbers to fill it is what Google's policy calls a manual action.
        */
        ...(product.rating > 0 && product.reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
            }
          : {}),
        offers: {
          "@type": "Offer",
          priceCurrency: "UZS",
          price: product.price,
          ...(validUntil ? { priceValidUntil: validUntil } : {}),
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url,
          seller: { "@id": `${SITE_URL}/#organization` },
          hasMerchantReturnPolicy: merchantReturnPolicyNode(locale),
          shippingDetails: shippingDetailsNodes(product.price, pricing),
        },
      },
      organizationNode(locale),
    ],
  };
}

/** Blog article graph with author + medical reviewer. */
export function articleGraph({
  title,
  description,
  image,
  url,
  datePublished,
  dateModified,
  locale,
  author,
  reviewer,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  /** Only a real edit date; absent when the source keeps none (a copy of datePublished says nothing). */
  dateModified?: string;
  locale: Locale;
  author: Expert | null;
  reviewer: Expert | null;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalWebPage", "Article"],
        "@id": `${url}#webpage`,
        url,
        headline: title,
        description,
        image: [structuredDataImage(image)],
        inLanguage: locale,
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified && dateModified !== datePublished ? { dateModified } : {}),
        isPartOf: { "@id": `${SITE_URL}/#organization` },
        // No named expert yet: the shop wrote it, and Google's Article result wants an author.
        author: author ? personNode(author) : { "@id": `${SITE_URL}/#organization` },
        ...(reviewer ? { reviewedBy: personNode(reviewer) } : {}),
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      organizationNode(locale),
    ],
  };
}

export function faqLd(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function itemListLd(name: string, items: { name: string; description?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.description ? { description: it.description } : {}),
    })),
  };
}

const HOME_CRUMB: Record<Locale, string> = { uz: "Bosh sahifa", ru: "Главная" };

/**
 * The trail always starts at the home page of the URL's locale: a one-item
 * list ("Kafolat") is not a trail, and Google drops it.
 */
export function breadcrumbLd(items: { name: string; url: string }[]) {
  const locale = (items[0]?.url.slice(SITE_URL.length).split("/")[1] ?? "") as Locale;
  const home = `${SITE_URL}/${locale}`;
  const trail = HOME_CRUMB[locale] && items[0]?.url !== home ? [{ name: HOME_CRUMB[locale], url: home }, ...items] : items;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/**
 * A catalogue shelf: the listing as an ItemList of product URLs, so the
 * category page is read as the hub its products hang off.
 */
export function collectionLd({ name, url, products }: { name: string; url: string; products: { name: string; slug: string }[] }) {
  const locale = url.slice(SITE_URL.length).split("/")[1];
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name,
    inLanguage: locale,
    // Inline, not a bare @id: the WebSite node is only printed on the home page.
    isPartOf: websiteNode(),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${locale}/product/${p.slug}`,
        name: p.name,
      })),
    },
  };
}

function websiteNode() {
  return { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME };
}

/*
  The site name for results. No SearchAction: Google retired the sitelinks
  search box (2024) and nothing else reads it.
*/
export function websiteLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    ...websiteNode(),
    description: ORG_DESCRIPTION[locale] ?? ORG_DESCRIPTION.uz,
    inLanguage: locales as unknown as string[],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** LocalBusiness node for Google local search and Maps integration. */
export function localBusinessLd(locale: Locale = "uz") {
  return {
    "@context": "https://schema.org",
    // A shop, not a pharmacy: PharmacyOrDrugstore claims a licence the site does not show yet.
    "@type": "Store",
    "@id": `${SITE_URL}/#localbusiness`,
    name: BRAND.name,
    url: SITE_URL,
    image: `${SITE_URL}/icons/icon-512.png`,
    telephone: BRAND.contact.phone,
    email: BRAND.contact.email,
    priceRange: "$$",
    openingHours: "Mo-Sa 09:00-18:00",
    address: { ...postalAddress(locale), addressRegion: locale === "ru" ? "Ташкент" : "Toshkent" },
    areaServed: {
      "@type": "Country",
      name: "Uzbekistan",
    },
    sameAs: SAME_AS,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}
