"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/shopflow/types";
import { onDeadline } from "./deadline";
import { saleOver } from "./sale";

/**
 * The product with the price it sells at now. When its sale ends while the
 * page is open, the component re-renders at that moment with the old price
 * back — the price shown and the price added to the cart never outlive the
 * countdown. The returned object is stable between renders, so effects keyed
 * on it (view tracking) run once per change, not once per render.
 */
export function useLiveProduct(product: Product): Product {
  const [over, setOver] = useState(() => saleOver(product));
  const endsAt = product.saleEndsAt ? Date.parse(product.saleEndsAt) : NaN;

  useEffect(() => {
    setOver(saleOver(product));
    if (!Number.isFinite(endsAt) || !product.oldPrice) return;
    return onDeadline(endsAt, () => setOver(true));
  }, [product, endsAt]);

  return useMemo(
    () => (over && product.oldPrice ? { ...product, price: product.oldPrice, oldPrice: undefined, saleEndsAt: undefined } : product),
    [over, product],
  );
}
