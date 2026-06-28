"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { useUpsell } from "@/lib/upsell/store";
import { buildUpsellLadder } from "@/lib/upsell/ladder";
import { getUpsellProducts } from "@/app/actions/getUpsellProducts";
import { formatMoney } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics/events";

export function UpsellLadderModal() {
  const locale = useLocale() as Locale;
  const t = useTranslations("upsell");
  const { lines, add } = useCart();
  const { steps, currentStep, isOpen, cumulativeSavings, shown, openLadder, nextStep, skipStep, closeLadder } = useUpsell();
  const prevLength = useRef(lines.length);

  // Watch for new items added to cart → trigger ladder once per session
  useEffect(() => {
    const current = lines.length;
    if (current > prevLength.current && !shown && current === 1) {
      // First item added — fetch products and build ladder
      getUpsellProducts(locale).then((products) => {
        const ladder = buildUpsellLadder(lines, products);
        if (ladder.length >= 2) {
          // Small delay so cart toast settles first
          setTimeout(() => openLadder(ladder), 600);
        }
      });
    }
    prevLength.current = current;
  }, [lines.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const step = steps[currentStep];
  if (!step) return null;

  const isFreeGift = step.stepType === "free_gift";
  const totalSteps = steps.length;
  const displaySavings = cumulativeSavings;

  function handleAccept() {
    add(
      {
        productId: step.product.id,
        slug: step.product.slug,
        name: step.product.name,
        image: step.product.images[0]?.url ?? "",
        price: step.product.price,
        oldPrice: step.product.oldPrice,
        upsellDiscountPercent: step.discountPercent,
      },
      1,
    );
    trackAddToCart(step.product.slug, step.discountedPrice, 1);
    nextStep(step.savedAmount);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLadder}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-0 z-[61] mx-auto max-w-sm sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className={`overflow-hidden rounded-2xl border shadow-2xl ${isFreeGift ? "border-amber-400/60 bg-gradient-to-b from-amber-950 to-ink" : "border-line bg-surface"}`}>
              {/* Header */}
              <div className={`px-5 py-4 ${isFreeGift ? "bg-amber-500/10" : "bg-surface-2"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFreeGift ? (
                      <span className="text-xl">🎁</span>
                    ) : (
                      <span className="text-base font-semibold text-accent">
                        {t("stepOf", { step: currentStep + 1, total: totalSteps })}
                      </span>
                    )}
                    {isFreeGift && (
                      <span className="font-display text-sm font-bold uppercase tracking-widest text-amber-400">
                        {t("freeGiftTitle")}
                      </span>
                    )}
                  </div>
                  <button onClick={closeLadder} className="text-faint hover:text-fg">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Savings display */}
                {displaySavings > 0 && (
                  <motion.p
                    key={displaySavings}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 text-sm font-semibold ${isFreeGift ? "text-amber-400" : "text-accent"}`}
                  >
                    {isFreeGift
                      ? t("freeGiftCovered", { amount: formatMoney(displaySavings, locale) })
                      : t("savedSoFar", { amount: formatMoney(displaySavings, locale) })}
                  </motion.p>
                )}
                {!isFreeGift && displaySavings === 0 && (
                  <p className="mt-1 text-sm text-muted">{t("growSavings")}</p>
                )}
              </div>

              {/* Product */}
              <div className="flex gap-4 px-5 py-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  <Image
                    src={step.product.images[0]?.url ?? ""}
                    alt={step.product.name}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                  {isFreeGift && (
                    <div className="absolute inset-0 flex items-center justify-center bg-amber-500/20">
                      <span className="text-2xl">🎁</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-xs text-muted">{step.reason}</p>
                  <p className="mt-0.5 font-medium text-fg">{step.product.name}</p>

                  {/* Stars */}
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs text-amber-400">{"★".repeat(Math.round(step.product.rating))}</span>
                    <span className="text-xs text-faint">{step.product.reviewCount}</span>
                  </div>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm text-faint line-through">
                      {formatMoney(step.product.price, locale)}
                    </span>
                    {isFreeGift ? (
                      <span className="font-display text-lg font-bold text-amber-400">
                        {t("freeLabel")}
                      </span>
                    ) : (
                      <>
                        <span className="font-display text-base font-bold text-accent-strong">
                          {formatMoney(step.discountedPrice, locale)}
                        </span>
                        <span className="rounded bg-accent/20 px-1.5 py-0.5 text-xs font-bold text-accent">
                          −{step.discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Free gift coverage bar */}
              {isFreeGift && displaySavings > 0 && (
                <div className="px-5 pb-3">
                  <div className="flex justify-between text-xs text-faint mb-1">
                    <span>{t("savedSoFar", { amount: formatMoney(displaySavings, locale) })}</span>
                    <span>{formatMoney(step.product.price, locale)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (displaySavings / step.product.price) * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={handleAccept}
                  className={`flex-1 rounded-full py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isFreeGift
                      ? "bg-amber-400 text-ink hover:bg-amber-300"
                      : "bg-accent text-ink hover:bg-accent-strong"
                  }`}
                >
                  {isFreeGift ? t("freeGiftCta") : t("accept")}
                </button>
                <button
                  onClick={skipStep}
                  className="rounded-full border border-line px-4 py-3 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  {t("skip")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
