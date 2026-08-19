"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { useProfile } from "@/lib/profile/store";
import { requestEmailOptIn } from "@/app/actions/emailOptIn";
import { telegramConnectUrl } from "@/lib/notifications/telegram-link";
import { track } from "@/lib/analytics/events";

type EmailState = "idle" | "sending" | "sent" | "error";

/*
  Consent, one channel at a time.

  Turning email on does not start sending email: it sends one confirmation
  message and waits. Until that link is clicked the address is unconfirmed and
  the marketing queue skips it. That is what makes the switch honest, and it is
  also what keeps a mistyped address — or someone else's — from being signed up
  by whoever is holding the phone.
*/
export function ConsentPanel() {
  const t = useTranslations("profile.consent");
  const locale = useLocale() as Locale;
  const profile = useProfile((s) => s.profile);
  const setConsent = useProfile((s) => s.setConsent);
  const [emailState, setEmailState] = useState<EmailState>("idle");

  const telegramUrl = telegramConnectUrl();

  async function toggleEmail(next: boolean) {
    setConsent({ email: next });
    track(next ? "consent_email_granted" : "consent_email_withdrawn", {});
    if (!next || !profile.email) {
      setEmailState("idle");
      return;
    }

    setEmailState("sending");
    const result = await requestEmailOptIn({
      email: profile.email,
      name: profile.name,
      locale,
    });
    setEmailState(result.ok ? "sent" : "error");
  }

  return (
    <section aria-labelledby="profile-consent">
      <h2 id="profile-consent" className="font-display text-lg font-bold tracking-tight">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t("description")}</p>

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-4">
          <input
            type="checkbox"
            checked={profile.consents.email}
            onChange={(e) => toggleEmail(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
          <span>
            <span className="block font-semibold text-fg">{t("email")}</span>
            <span className="mt-0.5 block text-sm text-muted">{t("emailNote")}</span>
            {profile.consents.email && !profile.email && (
              <span className="mt-2 block text-sm font-medium text-danger">{t("emailMissing")}</span>
            )}
            <span aria-live="polite" className="mt-2 block text-sm">
              {emailState === "sending" && <span className="text-muted">{t("emailSending")}</span>}
              {emailState === "sent" && (
                <span className="font-medium text-accent-strong">
                  {t("emailSent", { email: profile.email ?? "" })}
                </span>
              )}
              {emailState === "error" && <span className="text-danger">{t("emailError")}</span>}
            </span>
          </span>
        </label>

        {telegramUrl && (
          <label className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-4">
            <input
              type="checkbox"
              checked={profile.consents.telegram}
              onChange={(e) => {
                setConsent({ telegram: e.target.checked });
                track(e.target.checked ? "consent_telegram_granted" : "consent_telegram_withdrawn", {});
              }}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            <span>
              <span className="block font-semibold text-fg">{t("telegram")}</span>
              <span className="mt-0.5 block text-sm text-muted">{t("telegramNote")}</span>
              {profile.consents.telegram && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("telegram_connect_click", { source: "profile" })}
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent-strong underline-offset-4 hover:underline"
                >
                  {t("telegramConnect")}
                </a>
              )}
            </span>
          </label>
        )}
      </div>

      <p className="mt-3 text-xs text-faint">{t("legal")}</p>
    </section>
  );
}
