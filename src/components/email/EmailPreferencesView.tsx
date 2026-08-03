"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import { updateEmailPreference } from "@/app/actions/emailPreferences";
import { requestEmailOptIn } from "@/app/actions/emailOptIn";
import { useProfile } from "@/lib/profile/store";

export type PreferenceStatus =
  | "confirmed"
  | "unsubscribed"
  | "verified"
  | "verify-pending"
  | "invalid"
  | null;

interface Props {
  status: PreferenceStatus;
  token?: string;
  email?: string;
}

type Busy = "idle" | "working" | "done" | "error";

/*
  One page for every state a mailing link can land in.

  Confirming, unsubscribing and verifying an account address all end here
  rather than on three near-identical pages, because from the reader's side
  they are the same moment: they clicked something in an email and want to know
  what happened, with the controls to change it right there.
*/
export function EmailPreferencesView({ status, token, email }: Props) {
  const t = useTranslations("emailPreferences");
  const locale = useLocale() as Locale;
  const setConsent = useProfile((s) => s.setConsent);
  const [busy, setBusy] = useState<Busy>("idle");
  const [resubscribeEmail, setResubscribeEmail] = useState(email ?? "");

  async function setSubscribed(subscribed: boolean) {
    if (!token) return;
    setBusy("working");
    const result = await updateEmailPreference({ token, subscribed, locale });
    // Keep this browser's own consent flag in step, so /profile does not go on
    // showing "email on" after the reader turned it off from their inbox.
    if (result.ok) setConsent({ email: subscribed });
    setBusy(result.ok ? "done" : "error");
  }

  async function resendOptIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy("working");
    const result = await requestEmailOptIn({
      email: resubscribeEmail,
      locale,
      source: "preferences",
    });
    setBusy(result.ok ? "done" : "error");
  }

  return (
    <Container className="py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>

        {status && (
          <p
            role="status"
            className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
              status === "invalid"
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-accent/40 bg-accent-soft text-fg"
            }`}
          >
            {t(`status.${status}`)}
          </p>
        )}

        {token ? (
          <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-lg font-bold tracking-tight">{t("manage.title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("manage.description")}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={() => setSubscribed(true)} disabled={busy === "working"}>
                {t("manage.subscribe")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSubscribed(false)}
                disabled={busy === "working"}
              >
                {t("manage.unsubscribe")}
              </Button>
            </div>

            <p aria-live="polite" className="mt-4 text-sm">
              {busy === "done" && <span className="font-medium text-accent-strong">{t("saved")}</span>}
              {busy === "error" && <span className="text-danger">{t("error")}</span>}
            </p>
          </section>
        ) : (
          <form onSubmit={resendOptIn} className="mt-8 rounded-2xl border border-line bg-surface p-6">
            <label htmlFor="preferences-email" className="text-sm font-medium text-fg">
              {t("resubscribe.label")}
            </label>
            <p className="mt-1 text-sm text-muted">{t("resubscribe.description")}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="preferences-email"
                type="email"
                required
                autoComplete="email"
                value={resubscribeEmail}
                onChange={(e) => setResubscribeEmail(e.target.value)}
                className="flex-1 rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button type="submit" disabled={busy === "working"}>
                {t("resubscribe.submit")}
              </Button>
            </div>
            <p aria-live="polite" className="mt-4 text-sm">
              {busy === "done" && (
                <span className="font-medium text-accent-strong">{t("resubscribe.sent")}</span>
              )}
              {busy === "error" && <span className="text-danger">{t("error")}</span>}
            </p>
          </form>
        )}

        <p className="mt-8 text-sm text-muted">
          {t("profileHint")}{" "}
          <Link href="/profile" className="font-semibold text-accent-strong underline-offset-4 hover:underline">
            {t("profileLink")}
          </Link>
        </p>
      </div>
    </Container>
  );
}
