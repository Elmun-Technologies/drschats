import "server-only";

import { ORDERS_IN_DB } from "@/lib/shopflow";
import { COMMERCE } from "@/lib/config/commerce";
import { getFirstOrderSetting } from "./settings";
import type { FirstOrderOffer } from "./rules";

/** What pages may promise about the first-order discount (see `FirstOrderOffer`). */
export async function firstOrderOffer(): Promise<FirstOrderOffer> {
  if (!ORDERS_IN_DB) return { mode: "operator", percent: COMMERCE.discounts.firstOrderPercent };
  const setting = await getFirstOrderSetting();
  return setting.enabled ? { mode: "auto", percent: setting.percent } : { mode: "off", percent: setting.percent };
}

/** Promo codes need orders in our own database: that is where they are counted. */
export const PROMO_CODES_ENABLED = ORDERS_IN_DB;
