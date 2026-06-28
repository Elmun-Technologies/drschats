"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: diff === 0,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer({ targetDate, label }: { targetDate: Date | string; label?: string }) {
  const t = useTranslations("countdown");
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(getTimeLeft(target));
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || time.expired) return null;

  const units = time.days > 0
    ? [{ v: time.days, l: t("days") }, { v: time.hours, l: t("hours") }, { v: time.minutes, l: t("minutes") }]
    : [{ v: time.hours, l: t("hours") }, { v: time.minutes, l: t("minutes") }, { v: time.seconds, l: t("seconds") }];

  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm font-medium">{label}</span>}
      <div className="flex items-center gap-1.5">
        {units.map(({ v, l }, i) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className="flex flex-col items-center">
              <span className="font-display text-lg font-bold tabular-nums leading-none">{pad(v)}</span>
              <span className="text-[9px] uppercase tracking-wider text-faint">{l}</span>
            </span>
            {i < units.length - 1 && <span className="font-bold text-accent">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
