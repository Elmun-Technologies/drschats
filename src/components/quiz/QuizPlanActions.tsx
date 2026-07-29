"use client";

import { useTranslations } from "next-intl";
import type { Product } from "@/lib/shopflow/types";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { trackAddToCart, track } from "@/lib/analytics/events";
import { buttonVariants } from "@/components/ui/Button";

/** "Add the whole plan" — the single action the result page is built around. */
export function QuizPlanActions({ products }: { products: Product[] }) {
  const t = useTranslations("quiz");
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const notify = useToast((s) => s.notify);

  if (products.length === 0) return null;

  function addAll() {
    for (const product of products) {
      if (!product.inStock) continue;
      add(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.url ?? "",
          price: product.price,
          oldPrice: product.oldPrice,
        },
        1,
      );
      trackAddToCart(product.slug, product.price, 1);
    }
    track("quiz_plan_add_all", { count: products.filter((p) => p.inStock).length });
    notify();
    openCart();
  }

  return (
    <button type="button" onClick={addAll} className={buttonVariants("primary")}>
      {t("addPlan", { count: products.filter((p) => p.inStock).length })}
    </button>
  );
}
