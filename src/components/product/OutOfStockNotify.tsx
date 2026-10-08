"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifyRestock } from "@/app/actions/notifyRestock";
import { track } from "@/lib/analytics/events";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { inputClass } from "@/components/ui/Field";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function OutOfStockNotify({ productId, productName }: { productId: string; productName: string }) {
  const t = useTranslations("outOfStock");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "failed">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 7 || state === "loading") return;
    setState("loading");

    let result;
    try {
      result = await notifyRestock(productId, productName, phone);
    } catch {
      // A server action can throw on a network drop. Treat it like any other
      // failure: say so, and let the person try again rather than leaving the
      // form stuck on its spinner.
      result = { ok: false as const, error: "unavailable" as const };
    }

    /*
      Analytics only records a request that was actually recorded. Firing
      `restock_notify` on a dropped submission would put demand in the report
      that nobody is going to fulfil, and the number would then be used to
      decide what to restock.
    */
    if (result.ok) {
      track("restock_notify", { product_id: productId, value: 0 });
      setState("sent");
    } else {
      setState("failed");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-[20px] bg-tile px-5 py-4 text-center">
        <p className="text-[15px] font-semibold text-ink">{t("success")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-tile px-5 py-4">
      <label htmlFor="restock-phone" className="mb-3 block text-[15px] text-ink-2">
        {t("notify")}
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          id="restock-phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (state === "failed") setState("idle");
          }}
          placeholder={t("phone")}
          inputMode="tel"
          autoComplete="tel"
          required
          minLength={9}
          aria-describedby={state === "failed" ? "restock-error" : undefined}
          aria-invalid={state === "failed" || undefined}
          className={cn(inputClass, "min-w-0 flex-1")}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className={buttonVariants("primary", "md")}
        >
          {state === "loading" ? t("submitting") : t("submit")}
        </button>
      </form>
      {/*
        Told plainly, and in the same place as the field. A form that thanks
        someone for a request it dropped is worse than one that admits it could
        not take it: the first teaches them not to come back.
      */}
      {state === "failed" && (
        <span id="restock-error" className="mt-3 block">
          <ErrorNote>{t("error")}</ErrorNote>
        </span>
      )}
    </div>
  );
}
