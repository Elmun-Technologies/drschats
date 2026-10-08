"use client";

import { useTranslations } from "next-intl";
import type { Product } from "@/lib/shopflow/types";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { track } from "@/lib/analytics/events";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function line(product: Product) {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0]?.url ?? "",
    price: product.price,
    oldPrice: product.oldPrice,
  };
}

/** "Add the whole plan" — the single action the result page is built around. */
export function QuizPlanActions({ products, className }: { products: Product[]; className?: string }) {
  const t = useTranslations("quiz");
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const notify = useToast((s) => s.notify);

  const available = products.filter((p) => p.inStock);
  if (available.length === 0) return null;

  function addAll() {
    for (const product of available) {
      add(line(product), 1, { silent: true });
    }
    track("quiz_plan_add_all", { count: available.length });
    notify();
    openCart();
  }

  return (
    <button
      type="button"
      onClick={addAll}
      className={cn(
        buttonVariants("primary", "lg"),
        "bg-bg text-ink hover:bg-tile hover:text-ink focus-visible:ring-white focus-visible:ring-offset-dark-panel",
        className,
      )}
    >
      {t("addPlan", { count: available.length })}
    </button>
  );
}

/** One product from the plan. `add` raises its own toast. */
export function QuizAddOne({ product }: { product: Product }) {
  const t = useTranslations("common");
  const add = useCart((s) => s.add);

  return (
    <button
      type="button"
      disabled={!product.inStock}
      onClick={() => {
        add(line(product));
      }}
      className={cn(buttonVariants("light"), "w-full disabled:opacity-100 disabled:text-muted")}
    >
      {product.inStock ? t("addToCartShort") : t("outOfStock")}
    </button>
  );
}
