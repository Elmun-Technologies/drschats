"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { usePromotions } from "@/lib/cart/promotions-context";
import { computeTotals } from "@/lib/cart/pricing";
import { formatMoney } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { trackBeginCheckout } from "@/lib/analytics/events";

export function CartDrawer() {
  const locale = useLocale() as Locale;
  const t = useTranslations("cart");
  const { lines, isOpen, close, setQuantity, remove } = useCart();
  const promotions = usePromotions();
  const totals = computeTotals(lines, promotions);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-surface"
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-lg font-semibold">{t("title")}</h2>
              <button onClick={close} aria-label={t("remove")} className="text-muted hover:text-fg">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-muted">{t("empty")}</p>
                <Link href="/products" onClick={close} className={buttonVariants("primary")}>
                  {t("emptyCta")}
                </Link>
              </div>
            ) : (
              <>
                {totals.freeShippingThreshold > 0 && (
                  <div className="border-b border-line px-6 py-4">
                    <p className="mb-2 text-xs text-muted">
                      {totals.freeShippingRemaining > 0
                        ? t("freeShippingProgress", { amount: formatMoney(totals.freeShippingRemaining, locale) })
                        : t("freeShippingUnlocked")}
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((totals.subtotal) / totals.freeShippingThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {lines.map((l) => (
                    <div key={l.productId} className="flex gap-3">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                        {l.image && <Image src={l.image} alt={l.name} fill sizes="64px" className="object-cover" />}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-fg">{l.name}</p>
                          <button onClick={() => remove(l.productId)} className="text-faint hover:text-danger" aria-label={t("remove")}>
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-accent">{formatMoney(l.price, locale)}</p>
                        <div className="mt-auto flex items-center gap-2 pt-2">
                          <QtyButton onClick={() => setQuantity(l.productId, l.quantity - 1)}>−</QtyButton>
                          <span className="w-6 text-center text-sm">{l.quantity}</span>
                          <QtyButton onClick={() => setQuantity(l.productId, l.quantity + 1)}>+</QtyButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="space-y-3 border-t border-line px-6 py-5">
                  <Row label={t("subtotal")} value={formatMoney(totals.subtotal, locale)} />
                  {totals.discount > 0 && (
                    <Row label={t("discount")} value={`−${formatMoney(totals.discount, locale)}`} accent />
                  )}
                  <Row
                    label={t("shipping")}
                    value={totals.shipping === 0 ? t("free") : formatMoney(totals.shipping, locale)}
                  />
                  <div className="flex items-center justify-between border-t border-line pt-3 text-base font-semibold">
                    <span>{t("total")}</span>
                    <span>{formatMoney(totals.total, locale)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => {
                      close();
                      trackBeginCheckout(totals.total);
                    }}
                    className={buttonVariants("primary", "lg") + " w-full"}
                  >
                    {t("checkout")}
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-fg transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={accent ? "text-accent" : "text-fg"}>{value}</span>
    </div>
  );
}
