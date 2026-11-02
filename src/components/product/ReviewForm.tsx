"use client";

import { useId, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitReview } from "@/app/actions/reviews";
import { normalizeUzPhone } from "@/lib/phone";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/*
  «Sharh yozish» on the product page. Inline, not a dialog: the form opens in
  the reviews section. A review is stored for moderation and appears only
  after the team approves it — the confirmation says exactly that.
*/
export function ReviewForm({ slug, cta }: { slug: string; cta: string }) {
  const t = useTranslations("product.v3.reviewForm");
  const locale = useLocale() as "uz" | "ru";
  const id = useId();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const author = String(form.get("author") ?? "").trim();
    const text = String(form.get("text") ?? "").trim();
    const phone = String(form.get("phone") ?? "");
    if (!rating) return setError(t("errorRating"));
    if (author.length < 2) return setError(t("errorName"));
    if (!normalizeUzPhone(phone)) return setError(t("errorPhone"));
    if (text.length < 10) return setError(t("errorText"));
    setError(null);
    setState("sending");
    const res = await submitReview({ slug, rating, author, text, phone, locale }).catch(() => ({ ok: false as const, error: "unavailable" as const }));
    if (res.ok) {
      setState("sent");
      return;
    }
    setState("idle");
    setError(t(`error.${res.error}`));
  }

  if (state === "sent") {
    return (
      <p role="status" className="rounded-[16px] bg-bg px-4 py-3 text-base font-medium text-ink">
        {t("sent")}
      </p>
    );
  }

  if (!open) {
    return (
      <Button type="button" className="h-11 lg:h-12" onClick={() => setOpen(true)} aria-expanded={false} aria-controls={`${id}-form`}>
        {cta}
      </Button>
    );
  }

  return (
    <form id={`${id}-form`} onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-3.5 rounded-[20px] bg-bg p-4 lg:p-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-ink-2">{t("rating")}</legend>
        <div role="radiogroup" aria-label={t("rating")} className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={t("stars", { count: n })}
              onClick={() => setRating(n)}
              className="grid h-11 w-11 place-items-center rounded-[12px] hover:bg-tile"
            >
              <svg viewBox="0 0 24 24" aria-hidden className={cn("h-7 w-7", n <= rating ? "fill-ink" : "fill-none")} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3.5 lg:grid-cols-2">
        <Field label={t("name")} htmlFor={`${id}-author`}>
          <input id={`${id}-author`} name="author" maxLength={60} autoComplete="given-name" className={inputClass} />
        </Field>
        <Field label={t("phone")} htmlFor={`${id}-phone`}>
          <input id={`${id}-phone`} name="phone" inputMode="tel" autoComplete="tel" placeholder="+998" aria-describedby={`${id}-phone-hint`} className={inputClass} />
        </Field>
      </div>
      <p id={`${id}-phone-hint`} className="-mt-2 text-[13px] text-muted">{t("phoneHint")}</p>
      <Field label={t("text")} htmlFor={`${id}-text`}>
        <textarea id={`${id}-text`} name="text" rows={4} maxLength={2000} className={cn(inputClass, "h-auto py-3")} />
      </Field>
      {error && (
        <p role="alert" className="text-sm font-medium text-red">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={state === "sending"}>
          {state === "sending" ? t("sending") : t("submit")}
        </Button>
        <span className="text-[13px] text-muted">{t("moderation")}</span>
      </div>
    </form>
  );
}
