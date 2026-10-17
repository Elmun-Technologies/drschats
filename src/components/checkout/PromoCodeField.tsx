"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import type { PromoFailure } from "./useCartDiscount";

/*
  The cart's promo-code field. Collapsed to a link until asked for, as most
  orders have no code. It lives inside the order <form>, so Enter applies the
  code instead of submitting the order, and the button is type="button".
*/
export function PromoCodeField({
  code,
  amount,
  failure,
  pending,
  onApply,
  onRemove,
}: {
  /** The applied code, if any. */
  code: string | null;
  /** What the applied code takes off right now (0 while it does not qualify, or loses to the first-order discount). */
  amount: number | null;
  failure: PromoFailure | null;
  pending: boolean;
  onApply: (code: string) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("cart.v3.promo");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputId = useId();
  const statusId = `${inputId}-status`;

  const errorText = failure
    ? failure.reason === "min_subtotal"
      ? t("errors.min_subtotal", { min: formatMoney(failure.minSubtotal ?? 0, locale), amount: formatMoney(failure.remaining ?? 0, locale) })
      : t(`errors.${failure.reason}` as "errors.failed")
    : null;

  const apply = () => {
    if (value.trim()) onApply(value);
  };

  return (
    <div className="flex flex-col gap-2">
      {code ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-sm border-[1.5px] border-line-strong bg-bg px-3.5 text-[15px]">
            <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13 13 20 4 11V4h7z" />
              <circle cx="8" cy="8" r="1" />
            </svg>
            <span className="truncate font-semibold tracking-wide">{code}</span>
            {amount ? <span className="ml-auto shrink-0 font-semibold text-red">−{formatMoney(amount, locale)}</span> : null}
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={t("remove", { code })}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-ink-2 transition-colors hover:bg-tile-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      ) : open ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-sm font-medium text-ink-2">
            {t("label")}
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
              placeholder={t("placeholder")}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={40}
              aria-invalid={failure ? true : undefined}
              aria-describedby={statusId}
              className={cn(inputClass, "h-12 min-w-0 flex-1 uppercase placeholder:normal-case")}
            />
            <Button type="button" variant="primary" size="md" className="shrink-0 px-5" onClick={apply} disabled={pending || !value.trim()}>
              {pending ? t("checking") : t("apply")}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold text-ink underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          {t("toggle")}
        </button>
      )}
      <p id={statusId} aria-live="polite" className={cn("text-sm", errorText ? "text-red" : "text-ink-2", !errorText && !code && "sr-only")}>
        {errorText ?? (code && amount ? t("applied", { code, amount: formatMoney(amount, locale) }) : "")}
      </p>
      {(open || code) && <p className="text-[13px] leading-[18px] text-muted">{t("note")}</p>}
    </div>
  );
}
