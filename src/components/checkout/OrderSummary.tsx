"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";
import { readLastOrder, type LastOrder } from "@/lib/orders/last-order";

/** The order just placed, from this tab's own summary (lib/orders/last-order.ts). Nothing when it is not there. */
export function OrderSummary({ order }: { order: string }) {
  const t = useTranslations("checkout.success");
  const locale = useLocale() as Locale;
  const [summary, setSummary] = useState<LastOrder | null>(null);
  useEffect(() => setSummary(readLastOrder(order)), [order]);
  if (!summary) return null;

  return (
    <section aria-labelledby="order-summary" className="flex flex-col gap-3 rounded-[20px] border border-line p-5 lg:p-8">
      <h2 id="order-summary" className="text-[19px] font-bold lg:text-2xl">{t("summaryTitle")}</h2>
      <ul className="flex flex-col gap-1.5">
        {summary.items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="flex justify-between gap-4 text-base leading-6 text-ink-2">
            <span className="min-w-0">{item.name}</span>
            <span className="shrink-0 tabular-nums">× {item.quantity}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <span className="text-base font-bold">{t("summaryTotal")}</span>
        <span className="text-xl font-bold tabular-nums">{formatMoney(summary.total, locale)}</span>
      </div>
      {(summary.method === "pickup" || summary.payment === "cod") && (
        <p className="text-sm leading-5 text-muted">
          {[summary.method === "pickup" && t("summaryPickup"), summary.payment === "cod" && t("summaryPayment")].filter(Boolean).join(" · ")}
        </p>
      )}
    </section>
  );
}
