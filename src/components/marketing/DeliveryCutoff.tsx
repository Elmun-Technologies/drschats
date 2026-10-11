"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DELIVERY_CUTOFF, formatCutoff, msUntilCutoff } from "@/lib/config/delivery-cutoff";
import { cn } from "@/lib/utils";

/** "Order before 16:00 — 1 h 25 min left". Renders nothing without a configured cut-off or after it. */
export function DeliveryCutoff({ className }: { className?: string }) {
  const t = useTranslations("countdown");
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!DELIVERY_CUTOFF) return;
    const cutoff = DELIVERY_CUTOFF;
    const update = () => setLeft(msUntilCutoff(cutoff, new Date()));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!DELIVERY_CUTOFF || left === null) return null;
  const minutes = Math.ceil(left / 60_000);
  return (
    <p className={cn("text-sm text-ink-2", className)}>
      {t.rich("cutoff", {
        time: formatCutoff(DELIVERY_CUTOFF),
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60,
        b: (chunks) => <b className="font-semibold text-ink">{chunks}</b>,
      })}
    </p>
  );
}
