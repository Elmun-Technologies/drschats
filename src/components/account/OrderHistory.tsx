"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { api, ApiError, type AccountOrder } from "@/lib/api/client";
import { useSession } from "@/lib/auth/store";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";

type State =
  | { phase: "loading" }
  | { phase: "ready"; orders: AccountOrder[] }
  | { phase: "error"; message: string };

/*
  Order statuses come from the backend as stable slugs. They are translated
  here when a translation exists and shown raw when it does not, so a status
  the operations team adds later appears as itself rather than as a blank
  badge or a crash.
*/
const KNOWN_STATUSES = new Set(["new", "confirmed", "shipped", "delivered", "cancelled"]);

export function OrderHistory() {
  const t = useTranslations("account");
  const status = useTranslations("account.status");
  const locale = useLocale() as Locale;
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
        // An expired or revoked token should end the session rather than leave
        // the page insisting the customer is signed in.
        if (err instanceof ApiError && err.status === 401) {
          signOut();
          return;
        }
        setState({ phase: "error", message: t("errorOrders") });
      });

    return () => controller.abort();
  }, [token, signOut, t]);

  if (state.phase === "loading") {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
        {state.message}
      </p>
    );
  }

  if (state.orders.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
        <p className="text-muted">{t("noOrders")}</p>
        <Link
          href="/products"
          className="mt-4 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-brand-deep transition-colors hover:bg-accent-strong hover:text-ink"
        >
          {t("noOrdersCta")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {state.orders.map((order) => (
        <li key={order.orderId} className="rounded-2xl border border-line bg-ink p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-display text-base font-bold text-fg">{order.orderId}</span>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-strong">
              {KNOWN_STATUSES.has(order.status) ? status(order.status) : order.status}
            </span>
          </div>

          <p className="mt-1 text-xs text-faint">{formatDate(order.createdAt, locale)}</p>

          <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
            {order.items.map((item) => (
              <li key={item.slug} className="flex items-baseline justify-between gap-3 text-sm">
                <Link href={`/product/${item.slug}`} className="min-w-0 truncate text-fg hover:text-accent-strong">
                  {item.name}
                </Link>
                <span className="shrink-0 tabular-nums text-muted">
                  {item.quantity} × {formatMoney(item.unitPrice, locale)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 border-t border-line pt-3 text-right">
            <span className="text-sm text-muted">{t("orderTotal")}: </span>
            <b className="font-display text-lg font-extrabold tabular-nums text-fg">
              {formatMoney(order.total, locale)}
            </b>
          </p>
        </li>
      ))}
    </ul>
  );
}
