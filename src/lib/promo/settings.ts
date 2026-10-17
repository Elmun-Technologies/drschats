import "server-only";

import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { COMMERCE } from "@/lib/config/commerce";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";
import type { FirstOrderSetting } from "./rules";

/*
  The first-order discount's switch and percent, managed on /admin/promocodes
  and stored as JSON in site_settings (`discount.firstOrder`). Without a row
  the shop's standing rule applies (COMMERCE.discounts.firstOrderPercent).
*/

export const FIRST_ORDER_KEY = "discount.firstOrder";

export const DEFAULT_FIRST_ORDER: FirstOrderSetting = { enabled: true, percent: COMMERCE.discounts.firstOrderPercent };

export function parseFirstOrderSetting(raw: string | null | undefined): FirstOrderSetting {
  if (!raw) return DEFAULT_FIRST_ORDER;
  try {
    const v = JSON.parse(raw) as Partial<FirstOrderSetting>;
    const percent = Number(v.percent);
    return {
      enabled: v.enabled !== false,
      percent: Number.isInteger(percent) && percent >= 1 && percent <= 50 ? percent : DEFAULT_FIRST_ORDER.percent,
    };
  } catch {
    return DEFAULT_FIRST_ORDER;
  }
}

async function read(): Promise<FirstOrderSetting> {
  if (!isDbConfigured) return DEFAULT_FIRST_ORDER;
  try {
    const [row] = await getDb().select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, FIRST_ORDER_KEY)).limit(1);
    return parseFirstOrderSetting(row?.value);
  } catch {
    return DEFAULT_FIRST_ORDER;
  }
}

/** Cached for pages (the welcome card, the cart); saving revalidates SITE_SETTINGS_TAG. */
export const getFirstOrderSetting = unstable_cache(read, ["first-order-v1"], { tags: [SITE_SETTINGS_TAG], revalidate: 300 });

/** Uncached, for the admin screen and the order transaction. */
export const readFirstOrderSetting = read;

export async function saveFirstOrderSetting(setting: FirstOrderSetting, adminUserId: number) {
  const value = JSON.stringify(setting);
  await getDb()
    .insert(siteSettings)
    .values({ key: FIRST_ORDER_KEY, value, updatedBy: adminUserId })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy: adminUserId, updatedAt: new Date() } });
}
