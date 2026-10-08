"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifyRestock } from "@/app/actions/notifyRestock";
import { track } from "@/lib/analytics/events";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/*
  "Tell me when it is here" — for a product that is out of stock, and for a
  search that found nothing (then `productId` is the query). Both land in the
  operator's Telegram through `notifyRestock`.
*/
export function OutOfStockNotify({
  productId,
  productName,
  label,
  submitLabel,
  event = "restock_notify",
  bare = false,
}: {
  productId: string;
  productName: string;
  /** Text above the field; the out-of-stock sentence by default. */
  label?: string;
  submitLabel?: string;
  event?: string;
  /** No panel around it — the caller already draws one. */
  bare?: boolean;
}) {
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
      track(event, { product_id: productId, value: 0 });
      setState("sent");
    } else {
      setState("failed");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className={cn("text-[15px] font-semibold", !bare && "rounded-[20px] bg-tile px-5 py-4")}>
        {t("success")}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", !bare && "rounded-[20px] bg-tile px-5 py-4")}>
      {label !== "" && (
        <label htmlFor={`notify-${productId}`} className="text-[15px] leading-[22px] text-ink-2">
          {label ?? t("notify")}
        </label>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`notify-${productId}`}
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
          aria-label={label === "" ? t("phone") : undefined}
          aria-describedby={state === "failed" ? "restock-error" : undefined}
          aria-invalid={state === "failed" || undefined}
          className={cn(inputClass, "min-w-0 flex-1")}
        />
        <Button type="submit" disabled={state === "loading"} className="h-[52px] shrink-0">
          {state === "loading" ? t("submitting") : (submitLabel ?? t("submit"))}
        </Button>
      </form>
      {/*
        Told plainly, and in the same place as the field. A form that thanks
        someone for a request it dropped is worse than one that admits it could
        not take it: the first teaches them not to come back.
      */}
      {state === "failed" && (
        <span id="restock-error" className="block">
          <ErrorNote>{t("error")}</ErrorNote>
        </span>
      )}
    </div>
  );
}
