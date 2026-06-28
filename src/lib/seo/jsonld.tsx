import type { Product } from "@/lib/shopflow/types";
import type { Expert } from "@/lib/content/experts";
import { SITE_NAME, SITE_URL } from "./metadata";
import type { Locale } from "@/lib/i18n/routing";
import { locales } from "@/lib/i18n/routing";

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
  };
}

/** Authoritative Organization node — reused across the graph. */
export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Alimkhanov Pharm Group",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    description:
      "Alimkhanov — premium vitamins and dietary supplements distributor in Uzbekistan.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+998-71-200-00-00",
      contactType: "customer service",
      areaServed: "UZ",
      availableLanguage: ["Uzbek", "Russian", "English"],
    },
    sameAs: ["https://t.me/", "https://instagram.com/", "https://facebook.com/"],
  };
}

export function organizationLd() {
  return { "@context": "https://schema.org", ...organizationNode() };
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
  reviewer: Expert;
  author: Expert;
  datePublished?: string;
  dateModified?: string;
}) {
  const url = `${SITE_URL}/${locale}/product/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${product.name} — Alimkhanov`,
        description: product.tagline,
        inLanguage: locale,
        datePublished: datePublished ?? "2025-01-01T09:00:00+05:00",
        dateModified: dateModified ?? "2026-06-27T09:00:00+05:00",
        isPartOf: { "@id": `${SITE_URL}/#organization` },
        author: personNode(author),
        reviewedBy: personNode(reviewer),
      },
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        image: product.images.map((i) => i.url),
        description: product.tagline,
        sku: product.id,
        brand: { "@type": "Brand", name: SITE_NAME },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "UZS",
          price: product.price,
          priceValidUntil: "2027-12-31",
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url,
        },
      },
      organizationNode(),
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
  author: Expert;
  reviewer: Expert;
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
        image: [image],
        inLanguage: locale,
        datePublished,
        dateModified,
        isPartOf: { "@id": `${SITE_URL}/#organization` },
        author: personNode(author),
        reviewedBy: personNode(reviewer),
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      organizationNode(),
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

/** WebSite node with SearchAction — enables Google Sitelinks Search Box. */
export function websiteLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description:
      "Premium vitamins and dietary supplements distributor in Uzbekistan. Lab-tested, certified quality.",
    inLanguage: locales as unknown as string[],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** LocalBusiness node for Google local search and Maps integration. */
export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "PharmacyOrDrugstore"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: "Alimkhanov Pharm Group",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    image: `${SITE_URL}/brand/logo.png`,
    telephone: "+998-71-200-00-00",
    email: "info@alimkhanov.com",
    priceRange: "$$",
    openingHours: "Mo-Sa 09:00-18:00",
    address: {
      "@type": "PostalAddress",
      addressCountry: "UZ",
      addressLocality: "Toshkent",
      addressRegion: "Toshkent",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.2995,
      longitude: 69.2401,
    },
    areaServed: {
      "@type": "Country",
      name: "Uzbekistan",
    },
    sameAs: ["https://t.me/", "https://instagram.com/", "https://facebook.com/"],
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}
