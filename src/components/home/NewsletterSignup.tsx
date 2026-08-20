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
    <section className="border-t border-line/30 bg-ink py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-deep via-brand-deep to-accent p-8 sm:p-14 border border-gold/30 shadow-2xl shadow-brand-deep/40 text-white">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-block rounded-full bg-gold/20 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold border border-gold/30 mb-4">
                👑 VIP Salomatlik Klubi
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white drop-shadow-md">
                10% Chegirma va Shifokorlar Maslahatini Oling
              </h2>
              <p className="mt-4 text-base text-surface-2/90 leading-relaxed max-w-xl">
                VIP klubimizga a&apos;zo bo&apos;ling — haftalik yopiq chegirmalar, shifokorlar tayyorlagan salomatlik ko&apos;rsatmalari hamda yangi kelgan BADlar haqida birinchilardan bo&apos;lib xabar oling.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("telegram_click", { source: "home" })}
                  className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold/15 backdrop-blur-md px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-gold transition-all duration-300 hover:bg-gold hover:text-brand-deep hover:scale-105 shadow-lg"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.608c-.15.675-.546.84-1.107.522l-3.063-2.257-1.478 1.42c-.163.163-.3.3-.617.3l.22-3.118 5.67-5.12c.247-.22-.054-.342-.383-.122L7.04 14.572l-3.007-.94c-.653-.204-.666-.653.137-.966l11.732-4.522c.545-.197 1.02.133.66.104z" />
                  </svg>
                  <span>Telegram kanalimizga qo&apos;shilish</span>
                </a>
              </div>
            </div>

            <div>
              {state === "done" ? (
                <div className="rounded-3xl border border-gold/40 bg-gold/10 p-8 text-center backdrop-blur-md">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-brand-deep text-2xl font-bold mx-auto mb-3">
                    ✓
                  </span>
                  <p className="font-display text-xl font-extrabold text-white">Tabriklaymiz! Siz VIP klubdasiz</p>
                  <p className="mt-2 text-sm text-surface-2/80">Pochtangizga promo-kod va tasdiqlash xati yuborildi.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur-md shadow-xl">
                  <label htmlFor="newsletter-email" className="block text-xs font-extrabold uppercase tracking-widest text-gold mb-3">
                    Elektron pochtangizni kiriting:
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      autoComplete="email"
                      className="flex-1 rounded-2xl border border-white/20 bg-brand-deep/80 px-5 py-4 text-sm font-semibold text-white placeholder-white/50 outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                    <button
                      type="submit"
                      disabled={state === "loading"}
                      className="rounded-2xl bg-gold px-8 py-4 text-xs font-extrabold uppercase tracking-widest text-brand-deep shadow-xl shadow-gold/20 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-60 shrink-0"
                    >
                      {state === "loading" ? "…" : "A&apos;zo bo&apos;lish ➔"}
                    </button>
                  </div>

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
                    <p role="alert" className="mt-3 text-xs font-bold text-rose-400">
                      {t("error")}
                    </p>
                  )}
                  <p className="mt-4 text-[11px] text-white/50">
                    * Spam yuborilmaydi. Istalgan vaqtda bir tugma bilan obunani bekor qilishingiz mumkin.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
