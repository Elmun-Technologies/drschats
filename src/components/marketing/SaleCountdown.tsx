"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/*
  Time left on a sale that has a real end date (set in the admin panel). The
  server renders nothing time-dependent — the clock starts after mount, so the
  HTML never disagrees with the browser — and at zero it disappears; the
  catalogue already reprices the product once the date has passed.
*/
const pad = (n: number) => String(n).padStart(2, "0");

function useRemaining(endsAt: string, tickMs: number) {
  const end = Date.parse(endsAt);
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setLeft(Math.max(0, end - Date.now()));
    update();
    const timer = window.setInterval(update, tickMs);
    return () => window.clearInterval(timer);
  }, [end, tickMs]);
  return left;
}

/** Product page: "Aksiya tugashiga: 2 kun 05:12:33". */
export function SaleCountdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const t = useTranslations("countdown");
  const left = useRemaining(endsAt, 1000);
  if (left === null || left <= 0) return null;
  const s = Math.floor(left / 1000);
  const days = Math.floor(s / 86400);
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-sm text-ink-2", className)}>
      <span>{t("label")}</span>
      <span className="font-bold tabular-nums text-ink">
        {days > 0 && `${days} ${t("days")} `}
        {clock}
      </span>
    </p>
  );
}

/** Product card: "2 kun qoldi" / "5 soat qoldi". Updates once a minute. */
export function SaleCountdownChip({ endsAt, className }: { endsAt: string; className?: string }) {
  const t = useTranslations("countdown");
  const left = useRemaining(endsAt, 60_000);
  if (left === null || left <= 0) return null;
  const hours = Math.floor(left / 3_600_000);
  const text = hours >= 48 ? t("daysLeft", { count: Math.floor(hours / 24) }) : t("hoursLeft", { count: Math.max(1, hours) });
  return <span className={cn("text-[13px] font-semibold text-red", className)}>{text}</span>;
}
