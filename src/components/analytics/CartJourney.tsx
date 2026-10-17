"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/store";
import { lineTotal } from "@/lib/cart/pricing";
import { journeyCart } from "@/lib/journey/client";

/*
  Keeps the visitor's cart in the admin's journey view, so an abandoned cart
  shows what was in it. Fires on changes only, not on the first hydration.
*/
export function CartJourney() {
  useEffect(
    () =>
      useCart.subscribe((state, previous) => {
        if (state.lines === previous.lines) return;
        journeyCart({
          value: state.lines.reduce((sum, l) => sum + lineTotal(l), 0),
          items: state.lines.slice(0, 50).map((l) => ({ slug: l.slug, name: l.name.slice(0, 200), quantity: l.quantity, price: l.price })),
        });
      }),
    [],
  );
  return null;
}
