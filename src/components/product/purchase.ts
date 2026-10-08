import { useCallback } from "react";
import { create } from "zustand";
import type { Product } from "@/lib/shopflow/types";
import { useCart } from "@/lib/cart/store";
import { track } from "@/lib/analytics/events";
import { DEFAULT_INTERVAL, type IntervalDays } from "@/lib/subscription/plans";

export type PurchaseMode = "one-time" | "subscription";

export const MAX_QTY = 20;

/*
  The buy box's choice, shared with the two other "add" buttons on the page:
  the phone's fixed bar and the desktop mini card. All three add the same
  thing, so picking a subscription in the box and pressing the bar adds a
  subscription. Not persisted — it belongs to this visit of this page.
*/
interface PurchaseState {
  productId: string | null;
  mode: PurchaseMode;
  intervalDays: IntervalDays;
  qty: number;
  reset: (productId: string) => void;
  setMode: (mode: PurchaseMode) => void;
  setIntervalDays: (days: IntervalDays) => void;
  setQty: (qty: number) => void;
}

export const usePurchase = create<PurchaseState>((set) => ({
  productId: null,
  mode: "one-time",
  intervalDays: DEFAULT_INTERVAL,
  qty: 1,
  reset: (productId) =>
    set((s) => (s.productId === productId ? s : { productId, mode: "one-time", intervalDays: DEFAULT_INTERVAL, qty: 1 })),
  setMode: (mode) => set({ mode }),
  setIntervalDays: (intervalDays) => set({ intervalDays }),
  setQty: (qty) => set({ qty: Math.max(1, Math.min(MAX_QTY, qty)) }),
}));

export function useAddToCart(product: Product) {
  const add = useCart((s) => s.add);
  return useCallback(() => {
    const { mode, intervalDays, qty } = usePurchase.getState();
    const subscribing = mode === "subscription";
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url ?? "",
        price: product.price,
        oldPrice: product.oldPrice,
        subscription: subscribing ? { intervalDays } : undefined,
      },
      qty,
    );
    if (subscribing) {
      track("subscription_add_to_cart", { slug: product.slug, intervalDays });
    }
  }, [add, product]);
}
