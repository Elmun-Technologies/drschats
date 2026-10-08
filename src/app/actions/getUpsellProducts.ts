"use server";

import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { upsellPool } from "@/lib/upsell/pool";

export async function getUpsellProducts(locale: Locale): Promise<Product[]> {
  return upsellPool(locale);
}
