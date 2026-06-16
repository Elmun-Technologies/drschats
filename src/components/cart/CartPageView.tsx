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
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <p className="text-lg text-muted">{t("empty")}</p>
        <Link href="/products" className={buttonVariants("primary")}>
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 pb-32 lg:grid-cols-[1.4fr_1fr]">
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
                <button onClick={() => remove(l.productId)} className="text-faint hover:text-danger" aria-label={t("remove")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <span className="mt-1 text-accent">{formatMoney(l.price, locale)}</span>
              <div className="mt-auto flex items-center gap-2">
                <button onClick={() => setQuantity(l.productId, l.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:border-accent">−</button>
                <span className="w-8 text-center">{l.quantity}</span>
                <button onClick={() => setQuantity(l.productId, l.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:border-accent">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="space-y-2 text-sm">
            <Row label={t("subtotal")} value={formatMoney(totals.subtotal, locale)} />
            {totals.discount > 0 && <Row label={t("discount")} value={`−${formatMoney(totals.discount, locale)}`} accent />}
            <Row label={t("shipping")} value={totals.shipping === 0 ? t("free") : formatMoney(totals.shipping, locale)} />
            <div className="flex items-center justify-between border-t border-line pt-3 text-base font-semibold">
              <span>{t("total")}</span>
              <span>{formatMoney(totals.total, locale)}</span>
            </div>
          </div>
          <Link href="/checkout" className={buttonVariants("primary", "lg") + " mt-6 w-full"}>
            {t("checkout")}
          </Link>
          <Link href="/products" className="mt-3 block text-center text-sm text-muted hover:text-fg">
            {t("continue")}
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={accent ? "text-accent" : "text-fg"}>{value}</span>
    </div>
  );
}
