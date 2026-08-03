"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { subscribeToNewsletter } from "@/app/actions/subscribe";
import { track } from "@/lib/analytics/events";
import { Container } from "@/components/ui/Container";
import { BRAND } from "@/lib/brand";

const TELEGRAM_URL = BRAND.social.telegram;

export function NewsletterSignup() {
  const t = useTranslations("home.newsletter");
  const locale = useLocale() as Locale;
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    const result = await subscribeToNewsletter({ email, company, locale });
    if (result.ok) {
      track("newsletter_subscribe", {});
      setState("done");
      setEmail("");
    } else {
      setState("error");
    }
  }

  return (
    <section className="border-t border-line bg-surface py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold text-accent-strong">{t("eyebrow")}</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("telegram_click", { source: "home" })}
              className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-ink px-5 py-3 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent-strong"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-accent" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.608c-.15.675-.546.84-1.107.522l-3.063-2.257-1.478 1.42c-.163.163-.3.3-.617.3l.22-3.118 5.67-5.12c.247-.22-.054-.342-.383-.122L7.04 14.572l-3.007-.94c-.653-.204-.666-.653.137-.966l11.732-4.522c.545-.197 1.02.133.66.104z" />
              </svg>
              {t("telegram")}
            </a>
          </div>

          <div>
            {state === "done" ? (
              <div className="rounded-2xl border border-accent/40 bg-accent/10 px-6 py-8 text-center">
                <p className="font-display text-lg font-bold text-accent-strong">{t("success")}</p>
                <p className="mt-1 text-sm text-muted">{t("successNote")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-ink p-6">
                <label htmlFor="newsletter-email" className="text-sm font-medium text-fg">
                  {t("label")}
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("placeholder")}
                    autoComplete="email"
                    className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-accent-strong disabled:opacity-60"
                  >
                    {state === "loading" ? "…" : t("submit")}
                  </button>
                </div>

                {/* Honeypot — hidden from people, irresistible to bots. */}
                <input
                  type="text"
                  name="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                {state === "error" && (
                  <p role="alert" className="mt-3 text-sm text-danger">
                    {t("error")}
                  </p>
                )}
                <p className="mt-3 text-xs text-faint">{t("privacy")}</p>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
