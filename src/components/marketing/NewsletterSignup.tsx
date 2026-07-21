"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { subscribeNewsletter } from "@/app/actions/subscribeNewsletter";

const emailSchema = z.string().email();

interface NewsletterSignupProps {
  variant?: "band" | "compact";
}

export function NewsletterSignup({ variant = "band" }: NewsletterSignupProps) {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const compact = variant === "compact";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailSchema.safeParse(email).success) {
      setError(t("errorEmail"));
      return;
    }

    setSubmitting(true);
    const res = await subscribeNewsletter(email);
    setSubmitting(false);

    if (res.ok) {
      setSuccess(true);
      setEmail("");
    } else {
      setError(t("errorGeneric"));
    }
  }

  const inner = (
    <div className={cn("flex flex-col", compact ? "gap-3" : "gap-5")}>
      <div className={compact ? "" : "max-w-xl"}>
        <h2
          className={cn(
            "font-display font-bold",
            compact ? "text-lg text-white" : "text-2xl text-fg sm:text-3xl",
          )}
        >
          {t("title")}
        </h2>
        <p className={cn(compact ? "mt-1.5 text-sm text-white/60" : "mt-3 text-base text-muted")}>
          {t("subtitle")}
        </p>
      </div>

      {success ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-full border border-accent/30 bg-accent-soft/50 px-5 py-3",
            compact ? "" : "w-fit",
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <span>
            <span className={cn("block text-sm font-semibold", compact ? "text-white" : "text-fg")}>{t("successTitle")}</span>
            <span className={cn("block text-xs", compact ? "text-white/60" : "text-muted")}>{t("successText")}</span>
          </span>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <div
            className={cn(
              "flex gap-2",
              compact ? "flex-col" : "flex-col sm:flex-row sm:items-center",
            )}
          >
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              className={cn(
                "h-14 flex-1 rounded-full border px-6 text-sm outline-none transition-colors focus:border-accent",
                compact
                  ? "h-12 border-white/15 bg-white/5 px-5 text-white placeholder:text-white/40"
                  : "border-line bg-surface-2 text-fg placeholder:text-faint",
              )}
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                buttonVariants("primary", compact ? "md" : "lg"),
                compact ? "w-full" : "shrink-0",
              )}
            >
              {submitting ? t("submitting") : t("button")}
            </button>
          </div>
          {error && <p className="px-2 text-xs text-danger">{error}</p>}
          <p className={cn("px-2", compact ? "text-[11px] text-white/40" : "text-xs text-faint")}>
            {t("privacyNote")}
          </p>
        </form>
      )}
    </div>
  );

  if (compact) return inner;

  return (
    <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft/60 via-surface to-surface p-8 sm:p-12">
      {inner}
    </section>
  );
}
