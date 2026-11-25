"use client";

import type { Product } from "@/lib/shopflow/types";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { track } from "@/lib/analytics/events";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** "Add the whole set" on an audience page; one toast and the cart opens. */
export function BundleAddAll({ products, label, list, className }: { products: Product[]; label: string; list: string; className?: string }) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const notify = useToast((s) => s.notify);

  const available = products.filter((p) => p.inStock);
  if (available.length === 0) return null;

  function addAll() {
    for (const p of available) {
      add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? "", price: p.price, oldPrice: p.oldPrice, saleEndsAt: p.saleEndsAt, stockQty: p.stock?.qty }, 1, { silent: true });
    }
    track("topic_bundle_add_all", { list, count: available.length });
    notify();
    openCart();
  }

  return (
    <button type="button" onClick={addAll} className={cn(buttonVariants("primary", "lg"), "w-full", className)}>
      {label}
    </button>
  );
}
