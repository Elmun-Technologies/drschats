"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Price } from "@/components/ui/Price";
import { StarRating } from "@/components/ui/StarRating";
import { useCart } from "@/lib/cart/store";
import { useToast } from "@/lib/ui/toast";
import { trackAddToCart } from "@/lib/analytics/events";

/** Anchor rendered by BuyBox; the bar appears once it scrolls out of view. */
const CTA_ANCHOR_ID = "buybox-cta";

export function StickyBuyBar({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const add = useCart((s) => s.add);
  const notify = useToast((s) => s.notify);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(CTA_ANCHOR_ID);

    if (anchor && typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        },
        { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
      );
      observer.observe(anchor);
      return () => observer.disconnect();
    }

    let frame = 0;
    const sync = () => {
      frame = 0;
      setVisible(window.scrollY > 480);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    sync();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function handleAdd() {
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
    notify();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 top-0 z-40 border-b border-line bg-ink/95 shadow-lg backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
            <div className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-surface sm:block">
              <Image
                src={product.images[0]?.url ?? ""}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">{product.name}</p>
              <div className="hidden sm:block">
                <StarRating rating={product.rating} />
              </div>
            </div>

            <div className="shrink-0 whitespace-nowrap sm:hidden">
              <Price amount={product.price} locale={locale} size="sm" />
            </div>
            <div className="hidden shrink-0 whitespace-nowrap sm:block">
              <Price amount={product.price} oldAmount={product.oldPrice} locale={locale} size="sm" />
            </div>

            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-brand-deep transition-all hover:bg-accent-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50"
            >
              {product.inStock ? t("addToCart") : t("outOfStock")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
