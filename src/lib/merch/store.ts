import "server-only";

import { unstable_cache } from "next/cache";
import { and, asc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { banners, siteSettings, type BannerPlacement } from "@/lib/db/schema";
import { loadDeals } from "@/lib/catalog/db";
import { currentDeal } from "@/lib/catalog/deals";
import { ORDERS_IN_DB, shopflow } from "@/lib/shopflow";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import {
  ANNOUNCEMENTS_KEY,
  inWindow,
  liveAnnouncements,
  parseAnnouncements,
  safeHref,
  type StoreAnnouncement,
  type StoreBanner,
} from "./model";

/*
  Storefront reads of what the team sets in admin → Vitrina. Every read is
  cached under MERCH_TAG (the admin's saves drop it) and fails quiet: without
  a database, or with one that cannot answer, the site draws its built-in
  hero slides and utility row — never an empty hero.

  The cache holds every banner that has not ended; which ones show is
  decided per render with the clock of that render, so a scheduled banner
  appears at its start without anyone saving anything.
*/
export const MERCH_TAG = "merch";

type BannerRow = typeof banners.$inferSelect;

async function readBanners(): Promise<BannerRow[]> {
  if (!isDbConfigured) return [];
  try {
    return await getDb()
      .select()
      .from(banners)
      .where(and(eq(banners.active, true), or(isNull(banners.endsAt), gt(banners.endsAt, sql`now()`))))
      .orderBy(asc(banners.sort), asc(banners.id));
  } catch (err) {
    console.error("[merch] banners read failed — built-in hero:", (err as Error).message);
    return [];
  }
}

/* Dates do not survive unstable_cache's JSON round trip, so the cache holds ISO strings. */
type CachedBanner = Omit<BannerRow, "startsAt" | "endsAt" | "createdAt" | "updatedAt"> & { startsAt: string | null; endsAt: string | null };

const cachedBanners = unstable_cache(
  async (): Promise<CachedBanner[]> =>
    (await readBanners()).map(({ createdAt: _c, updatedAt: _u, ...b }) => ({
      ...b,
      startsAt: b.startsAt?.toISOString() ?? null,
      endsAt: b.endsAt?.toISOString() ?? null,
    })),
  ["merch-banners-v1"],
  { tags: [MERCH_TAG], revalidate: 300 },
);

export async function getBanners(placement: BannerPlacement, locale: Locale, now = Date.now()): Promise<StoreBanner[]> {
  const rows = await cachedBanners().catch(() => [] as CachedBanner[]);
  return rows
    .filter((b) => b.placement === placement && inWindow(b, now) && b.title[locale]?.trim())
    .flatMap((b) => {
      const href = safeHref(b.href);
      if (!href) return [];
      return [{
        id: b.id,
        title: b.title[locale].trim(),
        subtitle: b.subtitle[locale]?.trim() ?? "",
        cta: b.cta[locale]?.trim() ?? "",
        href,
        image: b.image || null,
        imageMobile: b.imageMobile || null,
        theme: b.theme,
        countdownTo: b.showCountdown && b.endsAt ? b.endsAt : null,
        endsAt: b.endsAt,
      }];
    });
}

const cachedAnnouncements = unstable_cache(
  async (): Promise<string | null> => {
    if (!isDbConfigured) return null;
    try {
      const [row] = await getDb().select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, ANNOUNCEMENTS_KEY));
      return row?.value ?? null;
    } catch {
      return null;
    }
  },
  ["merch-announcements-v1"],
  { tags: [MERCH_TAG], revalidate: 300 },
);

export async function getAnnouncements(locale: Locale, now = Date.now()): Promise<StoreAnnouncement[]> {
  return liveAnnouncements(parseAnnouncements(await cachedAnnouncements().catch(() => null)), locale, now);
}

/**
 * The deal of the day running right now, with its product priced through the
 * catalogue engine (so the card shows exactly what checkout charges). Null
 * when none runs, when the catalogue is not the database, or when the deal
 * would not lower the price (the product then sells as usual).
 */
export async function getDealOfDay(locale: Locale, now = Date.now()): Promise<{ product: Product; endsAt: string } | null> {
  if (!ORDERS_IN_DB) return null;
  const deal = currentDeal(await loadDeals().catch(() => []), now);
  if (!deal) return null;
  const product = await shopflow.getProduct(deal.productSlug, locale).catch(() => null);
  if (!product || !product.inStock || product.assortment === "unlisted") return null;
  if (!product.oldPrice || product.oldPrice <= product.price || product.saleEndsAt !== deal.endsAt) return null;
  return { product, endsAt: deal.endsAt };
}
