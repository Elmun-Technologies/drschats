"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCutoff, msUntilCutoff, parseCutoff } from "@/lib/config/delivery-cutoff";
import { useCommerce } from "@/lib/commerce/context";
import { cn } from "@/lib/utils";

/**
 * "Order before 16:00 — 1 h 25 min left". The cut-off is the admin's
 * (/admin/commerce, read at request time — no rebuild); the deploy env
 * NEXT_PUBLIC_DELIVERY_CUTOFF is only its default. Renders nothing without a
 * configured cut-off or after it.
 */
export function DeliveryCutoff({ className }: { className?: string }) {
  const t = useTranslations("countdown");
  const raw = useCommerce().delivery.cutoff;
  const cutoff = parseCutoff(raw);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const parsed = parseCutoff(raw);
    if (!parsed) return;
    const update = () => setLeft(msUntilCutoff(parsed, new Date()));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [raw]);

  if (!cutoff || left === null) return null;
  const minutes = Math.ceil(left / 60_000);
  return (
    <p className={cn("text-sm text-ink-2", className)}>
      {t.rich("cutoff", {
        time: formatCutoff(cutoff),
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60,
        b: (chunks) => <b className="font-semibold text-ink">{chunks}</b>,
      })}
    </p>
  );
}
