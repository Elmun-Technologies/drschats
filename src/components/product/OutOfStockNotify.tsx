"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifyRestock } from "@/app/actions/notifyRestock";
import { track } from "@/lib/analytics/events";

export function OutOfStockNotify({ productId, productName }: { productId: string; productName: string }) {
  const t = useTranslations("outOfStock");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 7) return;
    setLoading(true);
    await notifyRestock(productId, productName, phone);
    track("restock_notify", { product_id: productId, phone });
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-accent">{t("success")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-2 px-5 py-4">
      <p className="mb-3 text-sm text-muted">{t("notify")}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phone")}
          inputMode="tel"
          className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-60 hover:bg-accent-strong"
        >
          {loading ? "..." : t("submit")}
        </button>
      </form>
    </div>
  );
}
