"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import {
  api,
  ApiError,
  type AccountSubscription,
  type SubscriptionStatus,
} from "@/lib/api/client";
import { useSession } from "@/lib/auth/store";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/routing";
import { SUBSCRIPTION_INTERVALS } from "@/lib/subscription/plans";
import { track } from "@/lib/analytics/events";

type State =
  | { phase: "loading" }
  | { phase: "ready"; subscriptions: AccountSubscription[] }
  | { phase: "error"; message: string };

/*
  Managing a subscription, with every control the product page promised.

  Pause, skip one delivery, change the rhythm, cancel — all here, all one
  click, none of them behind a phone call. The promise made in the buy box is
  the reason someone subscribed; hiding the controls afterwards would make that
  promise the most expensive sentence on the site.
*/
export function MySubscriptions() {
  const t = useTranslations("subscription.manage");
  const locale = useLocale() as Locale;
  const token = useSession((s) => s.token);
  const signOut = useSession((s) => s.signOut);
  const [state, setState] = useState<State>({ phase: "loading" });
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    api
      .mySubscriptions(token, controller.signal)
      .then((subscriptions) => setState({ phase: "ready", subscriptions }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) {
          signOut();
          return;
        }
        setState({ phase: "error", message: t("error") });
      });

    return () => controller.abort();
  }, [token, signOut, t]);

  async function change(
    id: number,
    body: { status?: SubscriptionStatus; intervalDays?: number; skipNext?: boolean },
  ) {
    if (!token) return;
    setBusyId(id);
    try {
      const updated = await api.updateSubscription(token, id, body);
      setState((current) =>
        current.phase === "ready"
          ? {
              phase: "ready",
              subscriptions: current.subscriptions.map((s) => (s.id === id ? updated : s)),
            }
          : current,
      );
      track("subscription_updated", { ...body });
    } catch {
      setState({ phase: "error", message: t("error") });
    } finally {
      setBusyId(null);
    }
  }

  if (state.phase === "loading") {
    return <div aria-busy="true" className="h-28 animate-pulse rounded-2xl bg-surface" />;
  }

  if (state.phase === "error") {
    return (
      <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
        {state.message}
      </p>
    );
  }

  if (state.subscriptions.length === 0) {
    return (
      <div className="rounded-2xl border border-legacy-line bg-surface px-6 py-10 text-center">
        <p className="text-legacy-muted">{t("empty")}</p>
        <Link
          href="/products"
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-bold text-legacy-ink transition-colors hover:bg-accent-strong hover:text-legacy-ink"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {state.subscriptions.map((subscription) => {
        const busy = busyId === subscription.id;
        const cancelled = subscription.status === "cancelled";
        const intervalId = `subscription-interval-${subscription.id}`;

        return (
          <li key={subscription.id} className="rounded-2xl border border-legacy-line bg-legacy-ink p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-fg">
                {t(`status.${subscription.status}`)}
              </span>
              {subscription.nextDeliveryAt && !cancelled && (
                <span className="text-sm text-legacy-muted">
                  {t("next", { date: formatDate(subscription.nextDeliveryAt, locale) })}
                </span>
              )}
            </div>

            <ul className="mt-3 space-y-1.5 border-t border-legacy-line pt-3">
              {subscription.items.map((item) => (
                <li key={item.slug} className="flex items-baseline justify-between gap-3 text-sm">
                  <Link href={`/product/${item.slug}`} className="min-w-0 truncate text-fg hover:text-fg">
                    {item.name}
                  </Link>
                  <span className="shrink-0 tabular-nums text-legacy-muted">
                    {item.quantity} × {formatMoney(item.unitPrice, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-3 border-t border-legacy-line pt-3 text-right">
              <span className="text-sm text-legacy-muted">{t("perDelivery")}: </span>
              <b className="font-display text-lg font-extrabold tabular-nums text-fg">
                {formatMoney(subscription.total, locale)}
              </b>
            </p>

            {!cancelled && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-legacy-line pt-4">
                <label htmlFor={intervalId} className="text-sm text-legacy-muted">
                  {t("interval")}
                </label>
                <select
                  id={intervalId}
                  value={subscription.intervalDays}
                  disabled={busy}
                  onChange={(e) => change(subscription.id, { intervalDays: Number(e.target.value) })}
                  className="h-11 rounded-full border border-legacy-line bg-surface px-4 text-sm font-medium outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-signal"
                >
                  {SUBSCRIPTION_INTERVALS.map((days) => (
                    <option key={days} value={days}>
                      {t("everyDays", { days })}
                    </option>
                  ))}
                </select>

                <Action onClick={() => change(subscription.id, { skipNext: true })} disabled={busy}>
                  {t("skip")}
                </Action>

                {subscription.status === "active" ? (
                  <Action onClick={() => change(subscription.id, { status: "paused" })} disabled={busy}>
                    {t("pause")}
                  </Action>
                ) : (
                  <Action onClick={() => change(subscription.id, { status: "active" })} disabled={busy}>
                    {t("resume")}
                  </Action>
                )}

                <Action
                  onClick={() => change(subscription.id, { status: "cancelled" })}
                  disabled={busy}
                  danger
                >
                  {t("cancel")}
                </Action>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Action({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal disabled:opacity-50 ${
        danger
          ? "border-legacy-line text-legacy-muted hover:border-danger hover:text-danger"
          : "border-legacy-line text-fg hover:border-legacy-line-strong hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
