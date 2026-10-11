"use client";

import { useEffect } from "react";
import { onDeadline } from "@/lib/shop/deadline";
import { useCart } from "./store";

/**
 * Reprices the cart at the nearest sale end among its lines, so a cart or
 * checkout left open across the deadline shows (and submits) the price the
 * server will charge.
 */
export function useSaleClock() {
  const next = useCart((s) =>
    s.lines.reduce((min, l) => {
      const at = l.saleEndsAt ? Date.parse(l.saleEndsAt) : NaN;
      return Number.isFinite(at) && at < min ? at : min;
    }, Infinity),
  );
  useEffect(() => {
    if (next === Infinity) return;
    return onDeadline(next, () => useCart.getState().expireSales());
  }, [next]);
}
