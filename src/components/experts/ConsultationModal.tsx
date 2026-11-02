"use client";

import { useState } from "react";
import { submitConsultationRequest, type LeadResult } from "@/app/actions/leads";
import { useDialog } from "@/lib/ui/useDialog";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Expert } from "@/lib/content/experts.sanity";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";

/*
  Booking a consultation with an expert. Reachable only from an expert page,
  and there are none while `rawExperts` is empty. The request goes to the
  operator's Telegram group (app/actions/leads.ts); when that channel is not
  configured or does not take it, the form says so and gives the phone number
  instead of a "sent" nobody will act on.
*/

export function ConsultationModal({
  expert,
  buttonText,
}: {
  expert: Expert;
  buttonText?: string;
  variant?: "primary" | "secondary" | "outline";
}) {
  const t = useTranslations("experts");
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<"telegram" | "phone">("telegram");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const tp = useTranslations("pages.v3.partners");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<Exclude<LeadResult, { ok: true }>["error"] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setFailure(null);
    const result = await submitConsultationRequest({ expert: expert.name, name, phone, method }).catch(
      (): LeadResult => ({ ok: false, error: "unavailable" }),
    );
    setSending(false);
    if (result.ok) setSubmitted(true);
    else setFailure(result.error);
  }

  function handleClose() {
    setIsOpen(false);
    setSubmitted(false);
    setFailure(null);
    setName("");
    setPhone("");
  }
  const dialogRef = useDialog<HTMLDivElement>(isOpen, handleClose);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          buttonVariants("secondary"),
          "w-full justify-center gap-2",
        )}
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{buttonText || t("bookConsultation")}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-title"
            tabIndex={-1}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-bg p-6 sm:p-8 shadow-pop"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label={t("close")}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-tile text-ink-2 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>

            <div className="flex items-center gap-4 border-b border-line pb-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-line">
                <Image src={expert.image} alt={expert.name} fill className="object-cover" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-ink">
                  {t("consultModalTitle")}
                </span>
                <h3 id="consult-title" className="text-lg font-bold">{expert.name}</h3>
                <p className="text-xs text-ink-2 truncate">{expert.title}</p>
              </div>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tile text-ink">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold">{t("successTitle")}</h4>
                <p className="mt-2 text-sm text-ink-2 leading-relaxed">{t("successMsg")}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={BRAND.social.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants("secondary"), "w-full justify-center gap-2")}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                    {t("telegramCta")}
                  </a>
                  <button type="button" onClick={handleClose} className={cn(buttonVariants("secondary"), "w-full justify-center")}>
                    {t("close")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <p className="text-xs text-ink-2">{t("consultModalSub")}</p>

                {/* Method selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod("telegram")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all",
                      method === "telegram"
                        ? "border-line bg-tile text-ink"
                        : "border-line bg-tile text-ink-2",
                    )}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                    {t("methodTelegram")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("phone")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all",
                      method === "phone"
                        ? "border-line bg-tile text-ink"
                        : "border-line bg-tile text-ink-2",
                    )}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {t("methodPhone")}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">{t("nameLabel")}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="w-full rounded-xl border border-line bg-tile px-4 py-2.5 text-sm font-medium focus:border-line focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">{t("phoneLabel")}</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("phonePlaceholder")}
                    className="w-full rounded-xl border border-line bg-tile px-4 py-2.5 text-sm font-medium focus:border-line focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                  />
                </div>

                {failure && (
                  <p role="alert" className="rounded-sm bg-red/10 px-4 py-3 text-[15px] font-medium text-red">
                    {failure === "invalid" ? tp("errorInvalid") : failure === "rate_limited" ? tp("errorLimit") : tp("errorUnavailable", { phone: BRAND.contact.phone })}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className={cn(buttonVariants("secondary"), "w-full justify-center py-3")}
                >
                  {t("submitBooking")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
