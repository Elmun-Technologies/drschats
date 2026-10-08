import type { Product } from "@/lib/shopflow/types";
import type { Expert } from "@/lib/content/experts";
import { SITE_NAME, SITE_URL } from "./metadata";
import { absoluteUrl } from "@/lib/config/site";
import type { Locale } from "@/lib/i18n/routing";
import { locales } from "@/lib/i18n/routing";
import { BRAND } from "@/lib/brand";
import { COMMERCE } from "@/lib/config/commerce";
import { brandOf } from "@/lib/catalog/product-facts";

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

/** Renders a JSON-LD <script> for rich results / AI agents. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
  uz: "Vitaminlar, biologik faol qo'shimchalar va tibbiy mahsulotlarni O'zbekistonga rasmiy import qiluvchi va yetkazib beruvchi.",
  ru: "Официальный импорт витаминов, биологически активных добавок и медицинских товаров в Узбекистан.",
};

export function organizationNode(locale: Locale = "uz") {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    description: `${BRAND.name} — ${ORG_DESCRIPTION[locale] ?? ORG_DESCRIPTION.uz}`,
    ...(BRAND.legal.stir ? { vatID: BRAND.legal.stir } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.legal.address,
      addressCountry: "UZ",
      addressLocality: "Toshkent",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BRAND.contact.phone,
      email: BRAND.contact.email,
      contactType: "customer service",
      areaServed: "UZ",
      availableLanguage: ["Uzbek", "Russian"],
    },
    sameAs: [BRAND.social.telegram, BRAND.social.instagram, BRAND.social.facebook],
  };
}

export function organizationLd(locale: Locale = "uz") {
  return { "@context": "https://schema.org", ...organizationNode(locale) };
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
}: {
  product: Product;
  locale: Locale;
  /** Null while the review board is empty — see content/experts.ts. */
  reviewer: Expert | null;
  author: Expert | null;
  datePublished?: string;
  dateModified?: string;
}) {
  const url = `${SITE_URL}/${locale}/product/${product.slug}`;
  const brand = brandOf(product);
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
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url,
          seller: { "@id": `${SITE_URL}/#organization` },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              // What one unit actually costs to ship: free only above the threshold.
              value: product.price >= COMMERCE.freeShippingOver ? 0 : COMMERCE.shippingFee,
              currency: "UZS",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "UZ",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
            },
          },
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
  dateModified: string;
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
        datePublished,
        dateModified,
        isPartOf: { "@id": `${SITE_URL}/#organization` },
        ...(author ? { author: personNode(author) } : {}),
        ...(reviewer ? { reviewedBy: personNode(reviewer) } : {}),
        publisher: { "@id": `${SITE_URL}/#organization` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "h2", ".article-excerpt"],
        },
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

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
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
    isPartOf: { "@id": `${SITE_URL}/#website` },
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

/** WebSite node with SearchAction — enables Google Sitelinks Search Box. */
export function websiteLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: ORG_DESCRIPTION[locale] ?? ORG_DESCRIPTION.uz,
    inLanguage: locales as unknown as string[],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** LocalBusiness node for Google local search and Maps integration. */
export function localBusinessLd() {
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
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.legal.address,
      addressCountry: "UZ",
      addressLocality: "Toshkent",
      addressRegion: "Toshkent",
    },
    areaServed: {
      "@type": "Country",
      name: "Uzbekistan",
    },
    sameAs: [BRAND.social.telegram, BRAND.social.instagram],
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}
