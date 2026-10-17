import "server-only";

import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { resolveSmsProvider } from "@/lib/sms";
import { DEFAULT_LOYALTY_RULES, LOYALTY_OFF, LOYALTY_RULES_KEY, parseLoyaltyRules, type LoyaltyRules, type PublicLoyalty } from "./model";

/*
  `loyalty.rules` in site_settings. Pages read the cached copy (saving
  revalidates SITE_SETTINGS_TAG); the order transaction and the admin screen
  read it uncached. Without orders in our database there is nothing to count
  points against, so the programme is off whatever the row says.
*/

async function read(): Promise<LoyaltyRules> {
  if (!isDbConfigured || !ORDERS_IN_DB) return DEFAULT_LOYALTY_RULES;
  try {
    const [row] = await getDb().select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, LOYALTY_RULES_KEY)).limit(1);
    return parseLoyaltyRules(row?.value);
  } catch (err) {
    console.error("[loyalty] settings read failed — programme off:", (err as Error).message);
    return DEFAULT_LOYALTY_RULES;
  }
}

export const getLoyaltyRules = unstable_cache(read, ["loyalty-rules-v1"], { tags: [SITE_SETTINGS_TAG], revalidate: 300 });

/** Uncached — the order transaction, status changes and the admin screen. */
export const readLoyaltyRules = read;

export async function saveLoyaltyRules(rules: LoyaltyRules, adminUserId: number): Promise<void> {
  const value = JSON.stringify(rules);
  await getDb()
    .insert(siteSettings)
    .values({ key: LOYALTY_RULES_KEY, value, updatedBy: adminUserId })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy: adminUserId, updatedAt: new Date() } });
}

/** Whether a code can be texted — spending points needs one. */
export async function smsAvailable(): Promise<boolean> {
  try {
    return Boolean((await resolveSmsProvider()).provider);
  } catch {
    return false;
  }
}

/** The part of the rules client components may see. */
export async function publicLoyalty(options: { cached?: boolean } = {}): Promise<PublicLoyalty> {
  const rules = options.cached === false ? await read() : await getLoyaltyRules();
  if (!rules.enabled && !rules.referral.enabled && !rules.birthday.enabled) return LOYALTY_OFF;
  return {
    enabled: rules.enabled,
    earnPercent: rules.enabled ? rules.earnPercent : 0,
    minOrder: rules.minOrder,
    maxSharePercent: rules.enabled ? rules.maxSharePercent : 0,
    redeemable: rules.enabled ? await smsAvailable() : false,
    referral: { enabled: rules.referral.enabled, friendPercent: rules.referral.enabled ? rules.referral.friendPercent : 0 },
    birthday: { enabled: rules.birthday.enabled },
  };
}
