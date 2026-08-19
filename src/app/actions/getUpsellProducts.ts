"use server";

import { shopflow } from "@/lib/shopflow";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";

export async function getUpsellProducts(locale: Locale): Promise<Product[]> {
  const result = await shopflow.getProducts({ locale, sort: "popular", pageSize: 30 });
  return result.items;
}
