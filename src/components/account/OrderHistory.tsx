"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { api, ApiError, type AccountOrder } from "@/lib/api/client";
import { useSession } from "@/lib/auth/store";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { productCutout } from "@/lib/content/product-cutouts";
import { isOrderActive, KNOWN_ORDER_STATUSES } from "@/lib/account/orders";
import { buttonVariants } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import type { Locale } from "@/lib/i18n/routing";

type State =
  | { phase: "loading" }
  | { phase: "ready"; orders: AccountOrder[] }
  | { phase: "error"; message: string };

type Filter = "all" | "active" | "done";

/** Loads the signed-in customer's orders; an expired token ends the session. */
export function useMyOrders(): State {
  const t = useTranslations("account");
  const token = useSession((s) => s.token);
  const signOut = useSession((s) => s.signOut);
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    api
      .myOrders(token, controller.signal)
      .then((orders) => setState({ phase: "ready", orders }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) {
          signOut();
          return;
        }
        setState({ phase: "error", message: t("errorOrders") });
      });
    return () => controller.abort();
  }, [token, signOut, t]);

  return state;
}

/* Design: AccountV3 "Buyurtmalarim" — filter chips and one card per order. */
export function OrderHistory() {
  const t = useTranslations("account");
  const tv = useTranslations("account.v3");
  const state = useMyOrders();
  const [filter, setFilter] = useState<Filter>("all");

  const orders = state.phase === "ready" ? state.orders : [];
  const shown = orders.filter((o) => (filter === "all" ? true : filter === "active" ? isOrderActive(o.status) : o.status === "delivered"));

  return (
    <section aria-labelledby="account-orders" className="flex flex-col gap-3 lg:gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="account-orders" className="text-[21px] font-bold lg:text-[26px]">{t("orders")}</h2>
        {orders.length > 1 && (
          <div role="group" aria-label={t("orders")} className="flex gap-1.5">
            <Chip active={filter === "all"} onClick={() => setFilter("all")} className="h-11 lg:h-9">{tv("filterAll")}</Chip>
            <Chip active={filter === "active"} onClick={() => setFilter("active")} className="h-11 lg:h-9">{tv("filterActive")}</Chip>
            <Chip active={filter === "done"} onClick={() => setFilter("done")} className="h-11 lg:h-9">{tv("filterDone")}</Chip>
          </div>
        )}
      </div>

      {state.phase === "loading" && (
        <div aria-busy="true" className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[20px] bg-tile" />
          ))}
        </div>
      )}
      {state.phase === "error" && (
        <p role="alert" className="rounded-[20px] bg-red/10 px-4 py-3 text-sm font-medium text-red">{state.message}</p>
      )}
      {state.phase === "ready" && orders.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-[20px] bg-tile px-6 py-10 text-center">
          <p className="text-base text-ink-2">{t("noOrders")}</p>
          <Link href="/products" className={buttonVariants("primary")}>{t("noOrdersCta")}</Link>
        </div>
      )}
      {shown.map((order) => (
        <OrderCard key={order.orderId} order={order} />
      ))}
    </section>
  );
}

function OrderCard({ order }: { order: AccountOrder }) {
  const tv = useTranslations("account.v3");
  const locale = useLocale() as Locale;
  const images = order.items.map((i) => productCutout(i.slug)).filter((s): s is string => Boolean(s)).slice(0, 4);

  return (
    <Link
      href={`/account/orders/${encodeURIComponent(order.orderId)}`}
      className="flex flex-col gap-2.5 rounded-[20px] border border-line p-4 transition-colors hover:border-ink lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-4 lg:px-6 lg:py-[22px]"
    >
      <div className="flex flex-col gap-2.5 lg:gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3.5 gap-y-1 lg:justify-start">
          <span className="text-base font-bold lg:text-lg">№ {order.orderId}</span>
          <span className="hidden text-sm text-muted lg:inline">{formatDate(order.createdAt, locale)}</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5 lg:gap-2">
            {images.map((src) => (
              <span key={src} className="relative h-12 w-12 rounded-[10px] bg-tile lg:h-14 lg:w-14 lg:rounded-sm">
                <Image src={src} alt="" fill sizes="56px" className="object-contain p-1" />
              </span>
            ))}
          </div>
          <span className="flex flex-col items-end lg:hidden">
            <span className="text-[17px] font-bold">{formatMoney(order.total, locale)}</span>
            <span className="text-[13px] text-muted">{formatDate(order.createdAt, locale)}</span>
          </span>
        </div>
      </div>
      <div className="hidden flex-col items-end gap-2 lg:flex">
        <span className="text-xl font-bold">{formatMoney(order.total, locale)}</span>
        <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold">
          {tv("details")}
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export function StatusBadge({ status, large = false }: { status: string; large?: boolean }) {
  const t = useTranslations("account.status");
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-pill font-semibold",
        large ? "h-9 px-4 text-[15px]" : "h-[26px] px-2.5 text-[13px]",
        status === "shipped" ? "bg-ink text-white" : status === "cancelled" ? "bg-red/10 text-red" : "bg-chip-strong text-ink",
      )}
    >
      {KNOWN_ORDER_STATUSES.has(status) ? t(status as "new") : status}
    </span>
  );
}
