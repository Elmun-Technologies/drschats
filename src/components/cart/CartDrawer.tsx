"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { useCart } from "@/lib/cart/store";
import { useSaleClock } from "@/lib/cart/useSaleClock";
import { useDialog } from "@/lib/ui/useDialog";
import { usePromotions } from "@/lib/cart/promotions-context";
import { computeTotals, lineQtyCap, lineListTotal, lineTotal } from "@/lib/cart/pricing";
import { usePricingRules } from "@/lib/commerce/context";
import { formatMoney } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { UpsellLadderModal } from "@/components/upsell/UpsellLadderModal";
import { UpsellSavingsBar } from "@/components/upsell/UpsellSavingsBar";

export function CartDrawer() {
  const locale = useLocale() as Locale;
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const ts = useTranslations("subscription");
  const tco = useTranslations("checkout");
  const { lines, isOpen, close, setQuantity, remove } = useCart();
  useSaleClock();
  const promotions = usePromotions();
  const pricing = usePricingRules();
  const totals = computeTotals(lines, promotions, { rules: pricing });
  const dialogRef = useDialog<HTMLElement>(isOpen, close);

  return (
    <>
    <UpsellLadderModal />
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-bg"
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5 bg-bg text-ink">
              <h2 id="cart-drawer-title" className="text-[19px] font-bold text-ink">{t("title")}</h2>
              <button type="button" onClick={close} aria-label={tc("close")} className="grid h-11 w-11 place-items-center rounded-full bg-tile text-ink-2 hover:bg-tile-hover hover:text-ink">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tile">
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-muted" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <p className="text-ink-2">{t("empty")}</p>
                <Link href="/products" onClick={close} className={buttonVariants("primary")}>
                  {t("emptyCta")}
                </Link>
              </div>
            ) : (
              <>
                {totals.freeShippingThreshold > 0 && (
                  <div className="border-b border-line/60 bg-tile px-6 py-4">
                    <p className="mb-2 text-xs font-bold text-ink">
                      {totals.freeShippingRemaining > 0
                        ? t("freeShippingProgress", { amount: formatMoney(totals.freeShippingRemaining, locale) })
                        : t("freeShippingUnlocked")}
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-line/60">
                      <div
                        className="h-full rounded-full bg-ink transition-[width] duration-700 ease-out"
                        style={{
                          width: `${Math.min(100, ((totals.freeShippingThreshold - totals.freeShippingRemaining) / totals.freeShippingThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
                  {lines.map((l) => (
                    <div key={l.lineId} className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] bg-tile">
                        {l.image && <Image src={l.image} alt={l.name} fill sizes="80px" className="object-contain p-2" />}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-ink">{l.name}</p>
                          <button type="button" onClick={() => remove(l.lineId)} className="-mr-3 -mt-3 grid h-11 w-11 shrink-0 place-items-center text-muted hover:text-ink" aria-label={t("remove")}>
                            <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-1 text-[15px] font-bold text-ink">{formatMoney(lineTotal(l), locale)}</p>
                        {lineListTotal(l) && (
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-[13px] text-muted line-through">{formatMoney(lineListTotal(l)!, locale)}</span>
                            <span className="rounded-full bg-red px-2 py-0.5 text-[12px] font-semibold leading-4 text-white">
                              −{Math.round((1 - lineTotal(l) / lineListTotal(l)!) * 100)}%
                            </span>
                          </div>
                        )}
                        {l.soldOut && <p role="status" className="mt-0.5 text-xs font-semibold text-red">{tc("outOfStock")}</p>}
                        {l.subscription && (
                          <p className="mt-0.5 text-xs font-semibold text-ink">
                            {ts("everyDays", { days: l.subscription.intervalDays })}
                          </p>
                        )}
                        <div className="mt-auto flex items-center gap-2 pt-2">
                          <QtyButton label={tco("decreaseFor", { name: l.name })} disabled={l.quantity <= 1} onClick={() => setQuantity(l.lineId, l.quantity - 1)}>−</QtyButton>
                          <span className="w-7 text-center text-[15px] font-semibold tabular-nums">{l.quantity}</span>
                          <QtyButton label={tco("increaseFor", { name: l.name })} disabled={l.quantity >= lineQtyCap(l)} onClick={() => setQuantity(l.lineId, l.quantity + 1)}>+</QtyButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <UpsellSavingsBar />
                <footer className="space-y-3 border-t border-line px-6 py-5">
                  <Row label={t("subtotal")} value={formatMoney(totals.subtotal, locale)} />
                  {totals.discount > 0 && (
                    <Row label={t("discount")} value={`−${formatMoney(totals.discount, locale)}`} accent />
                  )}
                  <Row
                    label={t("shipping")}
                    value={totals.shipping === 0 ? t("free") : formatMoney(totals.shipping, locale)}
                  />
                  <div className="flex items-center justify-between border-t border-line pt-3 text-[17px] font-bold">
                    <span>{t("total")}</span>
                    <span>{formatMoney(totals.total, locale)}</span>
                  </div>
                  {/* What the repeating part costs next time, before anyone has
                      committed to it — not after the second charge. */}
                  {totals.hasSubscription && (
                    <p className="text-xs text-ink-2">
                      {ts("recurringSummary", { amount: formatMoney(totals.recurringTotal, locale) })}
                    </p>
                  )}
                  {(() => {
                    const totalSavings = lines.reduce((acc, l) => acc + ((l.oldPrice ?? l.price) - l.price) * l.quantity, 0) + totals.discount;
                    if (totalSavings > 0) {
                      return (
                        <div className="mt-2 rounded-xl border border-line/25 bg-tile p-2.5 text-center">
                          <p className="text-xs font-semibold text-ink">
                            {t("savings", { amount: formatMoney(totalSavings, locale) })}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <Link
                    href="/cart"
                    onClick={close}
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
    </>
  );
}

function QtyButton({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-tile text-lg text-ink transition-colors hover:bg-tile-hover disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-2">{label}</span>
      <span className={accent ? "font-semibold text-ink" : "text-ink-2"}>{value}</span>
    </div>
  );
}
