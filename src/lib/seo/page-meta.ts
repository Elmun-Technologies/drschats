import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import type { HealthTopicKind } from "@/lib/content/health-topics";
import { COMMERCE } from "@/lib/config/commerce";
import { formatMoney, formatNumber } from "@/lib/utils";
import { buildPageMetadata } from "./metadata";

/*
  Search-result copy for every indexable page type, in one place.

  Titles carry the query people actually type — "<thing> narxi / sotib olish",
  "<thing> купить в Ташкенте, цена" — instead of the bare product or section
  name, which matched nothing a buyer searches for. The wording lives in
  `meta.seo` / `meta.pages` (uz + ru); this module only fills the numbers, so
  a price or delivery promise in a snippet is always the one the page shows.
*/

/** Google shows ~155–160 characters; longer copy is cut mid-word by the engine instead of by us. */
export const DESCRIPTION_MAX = 160;

export function clampDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
}

/** A tagline ends with its own full stop; the template adds one. */
function sentence(text: string) {
  return text.trim().replace(/[.!…]+$/, "");
}

function delivery() {
  return {
    hours: String(COMMERCE.delivery.tashkent.hours),
    free: formatNumber(COMMERCE.freeShippingOver),
    fee: formatNumber(COMMERCE.shippingFee),
  };
}

async function regionsLabel(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "meta.seo" });
  return t("regions");
}

export type StaticPageKey =
  | "about" | "contact" | "delivery" | "payment" | "guarantee" | "requisites" | "licenses"
  | "blog" | "brands" | "loyalty" | "reviews" | "whereToBuy" | "offer" | "sale"
  | "goals" | "symptoms" | "vitamins" | "programs";

export async function staticPageMetadata(locale: Locale, key: StaticPageKey, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta.pages" });
  const values = { ...delivery(), regions: await regionsLabel(locale) };
  return buildPageMetadata({
    locale,
    path,
    title: t(`${key}.title`),
    description: clampDescription(t(`${key}.description`, values)),
  });
}

export async function productMetadata(product: Product, locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta.seo" });
  return buildPageMetadata({
    locale,
    path: `/product/${product.slug}`,
    title: t("product", { name: product.name }),
    description: clampDescription(
      t("productDescription", {
        name: product.name,
        tagline: sentence(product.tagline),
        price: formatMoney(product.price, locale),
        regions: await regionsLabel(locale),
        ...delivery(),
      }),
    ),
    image: product.images[0]?.url,
    type: "product",
  });
}

/** Category and brand listings share the "N items from X" description. */
function listingFacts(products: Product[], locale: Locale) {
  const min = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
  return { count: String(products.length), min: formatMoney(min, locale) };
}

export async function listingMetadata({
  locale,
  kind,
  name,
  path,
  products,
  fallbackDescription,
  filtered,
}: {
  locale: Locale;
  kind: "category" | "brand";
  name: string;
  path: string;
  products: Product[];
  fallbackDescription: string;
  /** Sorted, filtered or paged views are the same shelf; only the clean URL is indexed. */
  filtered: boolean;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta.seo" });
  const description =
    products.length > 0
      ? t(`${kind}Description`, { name, ...listingFacts(products, locale), ...delivery() })
      : fallbackDescription;
  return buildPageMetadata({
    locale,
    path,
    title: t(kind, { name }),
    description: clampDescription(description),
    noindex: filtered,
  });
}

export async function topicTitle(locale: Locale, kind: HealthTopicKind, name: string) {
  const t = await getTranslations({ locale, namespace: "meta.seo" });
  return t(kind, { name });
}

export async function seoTitle(locale: Locale, key: "program" | "blogCategory" | "blogArticle", values: Record<string, string>) {
  const t = await getTranslations({ locale, namespace: "meta.seo" });
  return t(key, values);
}

export async function blogCategoryDescription(locale: Locale, name: string) {
  const t = await getTranslations({ locale, namespace: "meta.seo" });
  return t("blogCategoryDescription", { name });
}
