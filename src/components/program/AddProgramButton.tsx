"use client";

import { useTranslations } from "next-intl";
import type { Product } from "@/lib/shopflow/types";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { trackAddToCart, track } from "@/lib/analytics/events";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * The whole point of a programme: one action puts the set in the cart with the
 * bundle discount already on each line, so the cart total matches the price
 * shown on the programme page.
 */
export function AddProgramButton({
  slug,
  products,
  discountPercent,
  className,
}: {
  slug: string;
  products: Product[];
  discountPercent: number;
  className?: string;
}) {
  const t = useTranslations("programs");
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const notify = useToast((s) => s.notify);

  const available = products.filter((p) => p.inStock);
  if (available.length === 0) return null;

  function addProgram() {
    for (const product of available) {
      add(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.url ?? "",
          price: product.price,
          oldPrice: product.oldPrice,
          upsellDiscountPercent: discountPercent || undefined,
        },
        1,
        { silent: true },
      );
      trackAddToCart(product.slug, product.price, 1);
    }
    track("program_add", { program: slug, count: available.length, discount: discountPercent });
    notify();
    openCart();
  }

  return (
    <button type="button" onClick={addProgram} className={cn(buttonVariants("primary", "lg"), className)}>
      {t("addProgram", { count: available.length })}
    </button>
  );
}
