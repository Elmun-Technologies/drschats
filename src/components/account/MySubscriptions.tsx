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
import Image from "next/image";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { productCutout } from "@/lib/content/product-cutouts";
import { buttonVariants } from "@/components/ui/Button";
import { AccountShell } from "./AccountShell";
import { AccountView } from "./AccountView";
import type { Locale } from "@/lib/i18n/routing";
import { FIRST_ORDER_PERCENT, RECURRING_PERCENT, SUBSCRIPTION_INTERVALS } from "@/lib/subscription/plans";
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
  const tv = useTranslations("account.v3");
  const locale = useLocale() as Locale;
  const token = useSession((s) => s.token);
  const signOut = useSession((s) => s.signOut);
  const [state, setState] = useState<State>({ phase: "loading" });
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);

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
    return <div aria-busy="true" className="h-56 animate-pulse rounded-[20px] bg-tile" />;
  }

  if (state.phase === "error") {
    return (
      <p role="alert" className="rounded-[20px] bg-red/10 px-4 py-3 text-sm font-medium text-red">
        {state.message}
      </p>
    );
  }

  if (state.subscriptions.length === 0) {
    return <p className="rounded-[20px] bg-tile px-6 py-8 text-center text-base text-ink-2">{t("empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3 lg:gap-4">
      {state.subscriptions.map((subscription) => {
        const busy = busyId === subscription.id;
        const cancelled = subscription.status === "cancelled";
        const first = subscription.items[0];
        const image = first ? productCutout(first.slug) : undefined;
        const name = subscription.items.map((i) => i.name).join(", ");

        return (
          <li key={subscription.id} className="flex flex-col gap-5 rounded-[20px] border border-line p-5 lg:gap-[22px] lg:p-7">
            <div className="flex items-center gap-4 lg:gap-5">
              <span className="relative h-20 w-20 shrink-0 rounded-[18px] bg-tile lg:h-24 lg:w-24">
                {image && <Image src={image} alt="" fill sizes="96px" className="object-contain p-2" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {first ? (
                    <Link href={`/product/${first.slug}`} className="text-lg font-bold hover:underline lg:text-xl">{name}</Link>
                  ) : (
                    <span className="text-lg font-bold lg:text-xl">{name}</span>
                  )}
                  <span
                    className={cn(
                      "inline-flex h-[26px] items-center rounded-pill px-2.5 text-[13px] font-semibold",
                      subscription.status === "active" ? "bg-ink text-white" : "bg-chip-strong text-ink",
                    )}
                  >
                    {t(`status.${subscription.status}`)}
                  </span>
                </span>
                <span className="text-base leading-6 text-ink-2">
                  {cancelled
                    ? tv("cancelledNote")
                    : subscription.status === "paused"
                      ? tv("pausedNote")
                      : subscription.nextDeliveryAt
                        ? t("next", { date: formatDate(subscription.nextDeliveryAt, locale) })
                        : null}
                </span>
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-[16px] bg-tile px-5 py-[18px] lg:grid-cols-3">
              <KeyValue label={t("perDelivery")} value={formatMoney(subscription.total, locale)} />
              <KeyValue label={tv("discount")} value={`−${RECURRING_PERCENT}%`} />
              <KeyValue label={t("interval")} value={t("everyDays", { days: subscription.intervalDays })} />
            </dl>

            {!cancelled && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {subscription.status === "active" && (
                    <>
                      <Action onClick={() => change(subscription.id, { skipNext: true })} disabled={busy} tone="light">
                        {t("skip")}
                      </Action>
                      <Action onClick={() => setEditing(editing === subscription.id ? null : subscription.id)} disabled={busy} tone="light" pressed={editing === subscription.id}>
                        {tv("changeInterval")}
                      </Action>
                      <Action onClick={() => change(subscription.id, { status: "paused" })} disabled={busy}>
                        {t("pause")}
                      </Action>
                    </>
                  )}
                  {subscription.status === "paused" && (
                    <Action onClick={() => change(subscription.id, { status: "active" })} disabled={busy} tone="primary">
                      {t("resume")}
                    </Action>
                  )}
                  <Action onClick={() => change(subscription.id, { status: "cancelled" })} disabled={busy}>
                    {t("cancel")}
                  </Action>
                </div>
                {editing === subscription.id && (
                  <div role="group" aria-label={t("interval")} className="flex flex-wrap gap-1.5">
                    {SUBSCRIPTION_INTERVALS.map((days) => (
                      <button
                        key={days}
                        type="button"
                        aria-pressed={days === subscription.intervalDays}
                        disabled={busy}
                        onClick={() => {
                          setEditing(null);
                          if (days !== subscription.intervalDays) change(subscription.id, { intervalDays: days });
                        }}
                        className={cn(
                          "h-11 rounded-sm px-4 text-[15px] font-medium transition-colors disabled:opacity-50",
                          days === subscription.intervalDays ? "bg-ink text-white" : "bg-tile hover:bg-tile-hover",
                        )}
                      >
                        {t("everyDays", { days })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* Design: SubscriptionsV3 — the list inside the account layout. */
export function SubscriptionsView() {
  const t = useTranslations("subscription.manage");
  const tv = useTranslations("account.v3");
  const token = useSession((s) => s.token);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (!token) return <AccountView />;

  return (
    <AccountShell active="subs">
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">{t("title")}</h1>
        <p className="text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">
          {tv("subsLead", { first: FIRST_ORDER_PERCENT, recurring: RECURRING_PERCENT })}
        </p>
      </div>
      <MySubscriptions />
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-tile p-5 lg:px-7 lg:py-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">{tv("newSubTitle")}</h2>
          <p className="text-base leading-6 text-ink-2">{tv("newSubText")}</p>
        </div>
        <Link href="/products" className={buttonVariants("primary")}>{t("emptyCta")}</Link>
      </div>
    </AccountShell>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="text-base font-bold">{value}</dd>
    </div>
  );
}

function Action({
  children,
  onClick,
  disabled,
  tone = "outline",
  pressed,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "primary" | "light" | "outline";
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={cn(buttonVariants(tone === "primary" ? "primary" : tone === "light" ? "light" : "secondary"), "h-11 px-4 text-[15px]")}
    >
      {children}
    </button>
  );
}
