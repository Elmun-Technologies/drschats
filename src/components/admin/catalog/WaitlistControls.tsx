"use client";

import { useActionState, useState } from "react";
import { notifyWaitlistNow } from "@/app/admin/_actions/stock";
import type { FormState } from "@/app/admin/_actions/catalog";
import { smallButtonClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/* Masked in the list; the full number only for the request someone opens. */
export function PhoneReveal({ masked, full }: { masked: string; full: string }) {
  const [shown, setShown] = useState(false);
  if (shown) {
    return (
      <a href={`tel:+${full.replace(/\D/g, "")}`} className="inline-flex min-h-11 items-center font-semibold tabular-nums text-ink underline-offset-4 hover:underline">
        +{full.replace(/\D/g, "")}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      aria-label={`Telefon raqamini koʻrsatish (${masked})`}
      className="inline-flex min-h-11 items-center gap-2 rounded-[8px] tabular-nums text-ink-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
    >
      {masked}
      <span className="text-[13px] font-semibold text-ink underline underline-offset-4">koʻrsatish</span>
    </button>
  );
}

/* "Hozir xabar yuborish" for one product; the answer says who was told and how. */
export function NotifyNowButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(notifyWaitlistNow, undefined);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="productId" value={productId} />
      <button type="submit" disabled={pending || disabled} className={cn(smallButtonClass, "bg-ink text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-tile disabled:text-muted")}>
        {pending ? "Yuborilmoqda…" : "Hozir xabar yuborish"}
      </button>
      {(state?.ok || state?.error) && (
        <p role="status" className={cn("max-w-[280px] text-right text-[13px] leading-[17px]", state.error ? "text-red" : "text-ink-2")}>
          {state.ok ?? state.error}
        </p>
      )}
    </form>
  );
}
