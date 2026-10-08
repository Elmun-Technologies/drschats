"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import type { Product } from "@/lib/shopflow/types";
import { BRAND } from "@/lib/brand";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { useSession } from "@/lib/auth/store";
import { useCart } from "@/lib/cart/store";
import { productCutout } from "@/lib/content/product-cutouts";
import { ORDER_STEPS, orderStepIndex } from "@/lib/account/orders";
import { Button, buttonVariants } from "@/components/ui/Button";
import { AccountShell } from "./AccountShell";
import { AccountView } from "./AccountView";
import { StatusBadge, useMyOrders } from "./OrderHistory";

/*
  Design: OrderDetailV3. The order comes from the same list endpoint as the
  account page — the backend has no per-order route — so the page shows what
  that record holds: status, date, lines and total. The timeline marks the
  current step; it has no per-step times because the backend keeps none.
*/
export function OrderDetail({ orderId, catalogue }: { orderId: string; catalogue: Product[] }) {
  const token = useSession((s) => s.token);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (!token) return <AccountView />;
  return <Detail orderId={orderId} catalogue={catalogue} />;
}

function Detail({ orderId, catalogue }: { orderId: string; catalogue: Product[] }) {
  const tv = useTranslations("account.v3");
  const ts = useTranslations("account.status");
  const locale = useLocale() as Locale;
  const state = useMyOrders();
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);

  const order = state.phase === "ready" ? state.orders.find((o) => o.orderId === orderId) : undefined;
  const back = (
    <Link href="/account" className="inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] text-ink-2 hover:text-ink">
      <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {tv("back")}
    </Link>
  );

  if (state.phase !== "ready" || !order) {
    return (
      <AccountShell active="orders">
        {back}
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{tv("orderNo", { id: orderId })}</h1>
        {state.phase === "loading" ? (
          <div aria-busy="true" className="h-64 animate-pulse rounded-[20px] bg-tile" />
        ) : (
          <p role="alert" className="rounded-[20px] bg-tile px-5 py-4 text-base text-ink-2">
            {state.phase === "error" ? state.message : tv("notFound")}
          </p>
        )}
      </AccountShell>
    );
  }

  const step = orderStepIndex(order.status);
  const itemsSum = order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const bySlug = new Map(catalogue.map((p) => [p.slug, p]));
  const repeatable = order.items.filter((i) => bySlug.get(i.slug)?.inStock);

  function repeat() {
    for (const line of repeatable) {
      const p = bySlug.get(line.slug)!;
      add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? "", price: p.price, oldPrice: p.oldPrice }, line.quantity, { silent: true });
    }
    openCart();
  }

  return (
    <AccountShell active="orders">
      {back}
      <div className="-mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{tv("orderNo", { id: order.orderId })}</h1>
          <span className="text-base text-ink-2">{formatDate(order.createdAt, locale)}</span>
        </div>
        <StatusBadge status={order.status} large />
      </div>

      {step >= 0 && (
        <ol className="grid grid-cols-4 gap-1 rounded-[20px] border border-line p-4 lg:px-8 lg:py-7">
          {ORDER_STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined} className="relative flex flex-col gap-2 lg:gap-2.5">
              {i < ORDER_STEPS.length - 1 && (
                <span aria-hidden className={cn("absolute left-[18px] right-[-4px] top-[16px] h-[3px] lg:top-[17px]", i < step ? "bg-ink" : "bg-chip-strong")} />
              )}
              <span
                aria-hidden
                className={cn(
                  "relative z-[1] flex h-9 w-9 items-center justify-center rounded-full",
                  i < step || (i === step && s === "delivered") ? "bg-ink text-white" : i === step ? "border-[3px] border-ink bg-bg" : "bg-chip-strong",
                )}
              >
                {(i < step || (i === step && s === "delivered")) && (
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </span>
              <span className={cn("text-[13px] leading-4 lg:text-base lg:leading-5", i <= step ? "font-bold" : "text-muted")}>
                {ts(s)}
              </span>
              {i === 0 && <span className="hidden text-sm text-muted lg:block">{formatDate(order.createdAt, locale)}</span>}
            </li>
          ))}
        </ol>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className="rounded-[20px] border border-line px-4 py-1 lg:px-7 lg:py-2">
          {order.items.map((line, i) => {
            const image = productCutout(line.slug) ?? bySlug.get(line.slug)?.images[0]?.url;
            return (
              <li key={`${line.slug}-${i}`} className={cn("flex items-center gap-4 py-4 lg:py-[18px]", i < order.items.length - 1 && "border-b border-line")}>
                <span className="relative h-16 w-16 shrink-0 rounded-[16px] bg-tile lg:h-[84px] lg:w-[84px]">
                  {image && <Image src={image} alt="" fill sizes="84px" className="object-contain p-2" />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link href={`/product/${line.slug}`} className="text-[15px] font-medium hover:underline lg:text-base">{line.name}</Link>
                  <span className="text-sm text-muted">{tv("qty", { qty: line.quantity, price: formatMoney(line.unitPrice, locale) })}</span>
                </span>
                <span className="whitespace-nowrap text-base font-bold lg:text-lg">{formatMoney(line.unitPrice * line.quantity, locale)}</span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-tile p-5 text-[15px] lg:p-6">
          <span className="flex justify-between gap-3">
            <span className="text-ink-2">{tv("itemsSum")}</span>
            <span>{formatMoney(itemsSum, locale)}</span>
          </span>
          <span className="flex justify-between gap-3 border-t border-[#DCDFDB] pt-2.5 text-[22px] font-bold">
            <span>{tv("total")}</span>
            <span>{formatMoney(order.total, locale)}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <a href={BRAND.social.telegram} target="_blank" rel="noopener noreferrer" className={buttonVariants("primary")}>
          {tv("telegram")}
        </a>
        {repeatable.length > 0 && (
          <Button variant="secondary" onClick={repeat}>
            {tv("repeat")}
          </Button>
        )}
        <Link href="/guarantee" className={buttonVariants("secondary")}>{tv("returns")}</Link>
        <Link href="/contact" className={cn(buttonVariants("ghost"), "bg-transparent")}>{tv("operator")}</Link>
      </div>
    </AccountShell>
  );
}
