import "server-only";

import { unstable_cache } from "next/cache";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";
import { COMMERCE } from "@/lib/config/commerce";
import { smsAvailable } from "@/lib/loyalty/settings";
import { getFirstOrderSetting } from "./settings";
import type { FirstOrderOffer } from "./rules";

/**
 * What pages may promise about the first-order discount (see `FirstOrderOffer`).
 *
 * "auto" needs a way to prove the phone (an SMS gateway for the cart's code,
 * lib/promo/server.ts → phoneProven): the discount is one per phone and any
 * number can be typed. Without SMS the operator applies it after the call.
 */
export async function firstOrderOffer(): Promise<FirstOrderOffer> {
  if (!ORDERS_IN_DB) return { mode: "operator", percent: COMMERCE.discounts.firstOrderPercent };
  const setting = await getFirstOrderSetting();
  if (!setting.enabled) return { mode: "off", percent: setting.percent };
  return { mode: (await smsConfigured()) ? "auto" : "operator", percent: setting.percent };
}

// The layout reads this on every page: cached, like the setting itself.
const smsConfigured = unstable_cache(() => smsAvailable(), ["sms-available-v1"], { tags: [SITE_SETTINGS_TAG], revalidate: 300 });

/** Promo codes need orders in our own database: that is where they are counted. */
export const PROMO_CODES_ENABLED = ORDERS_IN_DB;
