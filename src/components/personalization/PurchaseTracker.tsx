"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/personalization/tracker";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export function PurchaseTracker() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.cart);
      if (!raw) return;
      const cart = JSON.parse(raw) as { state?: { lines?: { slug: string; name?: string }[] } };
      const items = cart?.state?.lines?.map((l) => ({ slug: l.slug, name: l.name })) ?? [];
      if (items.length > 0) trackPurchase(items);
    } catch {
      // ignore
    }
  }, []);

  return null;
}
