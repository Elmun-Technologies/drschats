"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { forgetOrder, readOrders, type RememberedOrder } from "@/lib/orders/last-order";
import { buttonVariants } from "@/components/ui/Button";
import { cn, formatDate, formatMoney } from "@/lib/utils";

/*
  «Buyurtmalarim» from this browser's memory (lib/orders/last-order.ts): each
  row opens the order's signed tracking page — status, «Takrorlash», cancel
  while it is still being prepared. Nothing is fetched until a row is opened.
*/
export function MyOrders() {
  const t = useTranslations("track.orders");
  const locale = useLocale() as Locale;
  const [orders, setOrders] = useState<RememberedOrder[] | null>(null);
  useEffect(() => setOrders(readOrders()), []);

  if (orders === null) return <div className="min-h-[200px]" />;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] bg-tile p-5 lg:p-8">
        <p className="text-base leading-6 text-ink-2">{t("empty")}</p>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/track" className={buttonVariants("primary")}>{t("find")}</Link>
          <Link href="/products" className={buttonVariants("secondary")}>{t("shop")}</Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((o) => (
        <li key={o.order} className="flex flex-col gap-3 rounded-[20px] border border-line p-4 lg:flex-row lg:items-center lg:gap-6 lg:p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[17px] font-bold">№{o.order}</span>
            <span className="text-sm text-muted">
              {formatDate(o.at, locale)} · {formatMoney(o.total, locale)}
            </span>
            <span className="line-clamp-2 text-[15px] text-ink-2">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/track/${o.track}`} className={buttonVariants("primary")}>
              {t("open")}
            </Link>
            <button
              type="button"
              onClick={() => {
                forgetOrder(o.order);
                setOrders(readOrders());
              }}
              aria-label={t("forgetLabel", { order: o.order })}
              className={cn(buttonVariants("ghost"), "bg-transparent")}
            >
              {t("forget")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
