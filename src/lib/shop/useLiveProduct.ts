"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/shopflow/types";
import { livePrice } from "./sale";

/**
 * The product with the price it sells at now. When its sale ends while the
 * page is open, the component re-renders at that moment with the old price
 * back — the price shown and the price added to the cart never outlive the
 * countdown.
 */
export function useLiveProduct(product: Product): Product {
  const [, setTick] = useState(0);
  const endsAt = product.saleEndsAt ? Date.parse(product.saleEndsAt) : NaN;

  useEffect(() => {
    if (!Number.isFinite(endsAt)) return;
    const wait = endsAt - Date.now();
    if (wait <= 0) return setTick((n) => n + 1);
    // setTimeout caps at ~24.8 days; a later end re-arms on the next render.
    const timer = window.setTimeout(() => setTick((n) => n + 1), Math.min(wait + 50, 2 ** 31 - 1));
    return () => window.clearTimeout(timer);
  }, [endsAt]);

  const live = livePrice(product);
  return live.price === product.price ? product : { ...product, ...live, saleEndsAt: undefined };
}
