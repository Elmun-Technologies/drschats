"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/personalization/tracker";

export function PurchaseTracker() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("alimkhanov-cart");
      if (!raw) return;
      const cart = JSON.parse(raw) as { state?: { lines?: { slug: string }[] } };
      const slugs = cart?.state?.lines?.map((l) => l.slug) ?? [];
      if (slugs.length > 0) trackPurchase(slugs);
    } catch {
      // ignore
    }
  }, []);

  return null;
}
