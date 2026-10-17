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

export function useRemaining(endsAt: string, tickMs: number) {
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

/** Milliseconds left → whole days and an "hh:mm:ss" clock for the rest. */
export function splitLeft(left: number): { days: number; clock: string } {
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    clock: `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`,
  };
}

/** Product page: "Aksiya tugashiga: 2 kun 05:12:33". */
export function SaleCountdown({
  endsAt,
  className,
  onDark = false,
  as: Tag = "p",
}: {
  endsAt: string;
  className?: string;
  onDark?: boolean;
  /** "span" inside a link or another inline box. */
  as?: "p" | "span";
}) {
  const t = useTranslations("countdown");
  const left = useRemaining(endsAt, 1000);
  if (left === null || left <= 0) return null;
  const { days, clock } = splitLeft(left);
  return (
    <Tag className={cn("flex flex-wrap items-center gap-x-2 text-sm", onDark ? "text-on-dark-2" : "text-ink-2", className)}>
      <span>{t("label")}</span>
      <span className={cn("font-bold tabular-nums", onDark ? "text-white" : "text-ink")}>
        {days > 0 && `${days} ${t("days")} `}
        {clock}
      </span>
    </Tag>
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
