"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import { usePromotions } from "@/lib/cart/promotions-context";
import { computeTotals } from "@/lib/cart/pricing";
import { formatMoney } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

export function CartPageView() {
  const locale = useLocale() as Locale;
  const t = useTranslations("cart");
  const { lines, setQuantity, remove } = useCart();
  const promotions = usePromotions();
  const totals = computeTotals(lines, promotions);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-2">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-muted" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-display text-xl font-bold text-fg">{t("empty")}</p>
          <p className="mt-1 text-sm text-muted">{t("emptyHint")}</p>
        </div>
        <Link href="/products" className={buttonVariants("primary", "lg")}>
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  const freeShippingPct = totals.freeShippingThreshold > 0
    ? Math.min(100, Math.round(((totals.subtotal - totals.discount) / totals.freeShippingThreshold) * 100))
    : 0;

  return (
    <div className="grid gap-10 pb-32 lg:grid-cols-[1.4fr_1fr]">
      {/* Lines */}
      <div>
        {/* Free shipping progress */}
        {totals.freeShippingThreshold > 0 && (
          <div className="mb-6 rounded-2xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-fg">
                {totals.freeShippingRemaining === 0
                  ? t("freeShippingUnlocked")
                  : t("freeShippingProgress", { amount: formatMoney(totals.freeShippingRemaining, locale) })}
              </span>
              <span className="text-xs text-muted">{freeShippingPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${freeShippingPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="divide-y divide-line border-y border-line">
          {lines.map((l) => (
            <div key={l.productId} className="flex gap-4 py-5">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {l.image && <Image src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/product/${l.slug}`} className="font-medium text-fg hover:text-accent">
                    {l.name}
                  </Link>
                  <button onClick={() => remove(l.productId)} className="shrink-0 text-faint hover:text-danger" aria-label={t("remove")}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <span className="mt-1 text-sm font-semibold text-accent">{formatMoney(l.price, locale)}</span>
                {l.oldPrice && (
                  <span className="text-xs text-faint line-through">{formatMoney(l.oldPrice, locale)}</span>
                )}
                <div className="mt-auto flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(l.productId, l.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:border-accent"
                  >−</button>
                  <span className="w-8 text-center text-sm font-medium">{l.quantity}</span>
                  <button
                    onClick={() => setQuantity(l.productId, l.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:border-accent"
                  >+</button>
                  <span className="ml-auto text-sm font-semibold text-fg">
                    {formatMoney(l.price * l.quantity, locale)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link href="/products" className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12.5 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("continue")}
        </Link>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 font-display text-lg font-bold">{t("summary")}</h2>
          <div className="space-y-2 text-sm">
            <Row label={t("subtotal")} value={formatMoney(totals.subtotal, locale)} />
            {totals.discount > 0 && <Row label={t("discount")} value={`−${formatMoney(totals.discount, locale)}`} accent />}
            <Row label={t("shipping")} value={totals.shipping === 0 ? t("free") : formatMoney(totals.shipping, locale)} />
            <div className="flex items-center justify-between border-t border-line pt-3 text-base font-bold">
              <span>{t("total")}</span>
              <span>{formatMoney(totals.total, locale)}</span>
            </div>
          </div>
          <Link href="/checkout" className={buttonVariants("primary", "lg") + " mt-5 w-full"}>
            {t("checkout")}
          </Link>

          {/* Trust signals */}
          <div className="mt-5 space-y-2.5 border-t border-line pt-4">
            {[
              { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: t("trustGuarantee") },
              { icon: "M5 12h14M12 5l7 7-7 7", label: t("trustDelivery") },
              { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: t("trustSecure") },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-xs text-muted">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={accent ? "font-medium text-accent" : "text-fg"}>{value}</span>
    </div>
  );
}
