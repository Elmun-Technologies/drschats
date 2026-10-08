import { shopflow } from "@/lib/shopflow";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";

/*
  The products the upsell ladder may offer. One read for every place that
  builds or checks a ladder — the modal, the cart page and the order action —
  so an offer the customer saw is always one the server accepts. Core range
  only: add-ons and withdrawn products are not what a ladder should push.
*/
export async function upsellPool(locale: Locale): Promise<Product[]> {
  const { items } = await shopflow.getProducts({ locale, sort: "popular", pageSize: 30, assortment: "core" });
  return items.filter((p) => p.inStock);
}
