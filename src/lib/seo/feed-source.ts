import { isLocale, type Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { getAllProducts } from "@/lib/shop/all-products";
import type { Category, Product } from "@/lib/shopflow/types";

/** `?lang=ru` picks the Russian names and links; otherwise the feed's own default. */
export function feedLocale(request: Request, fallback: Locale): Locale {
  const lang = new URL(request.url).searchParams.get("lang");
  return isLocale(lang) ? lang : fallback;
}

export async function feedCatalogue(locale: Locale): Promise<{ products: Product[]; categories: Category[] }> {
  const [listing, categories] = await Promise.all([
    getAllProducts({ locale, sort: "popular" }),
    shopflow.getCategories(locale).catch(() => [] as Category[]),
  ]);
  return { products: listing.items, categories };
}

/* Merchant Center and Yandex fetch a few times a day; an hour of CDN cache is plenty fresh. */
export const FEED_CACHE = "public, max-age=900, s-maxage=3600, stale-while-revalidate=600";
