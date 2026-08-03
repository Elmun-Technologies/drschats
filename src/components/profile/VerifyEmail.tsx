"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { useSession } from "@/lib/auth/store";
import { useProfile } from "@/lib/profile/store";
import { sendAccountVerification } from "@/app/actions/accountEmail";

type State = "idle" | "sending" | "sent" | "error";

/*
  Proving the address belongs to the account.

  Signing in is a phone and a code, so there is no registration form for an
  address to be confirmed on — it is added here instead, and this is where it
  gets proved. Until the link is clicked the address is a claim: the account
  keeps it, the marketing queue ignores it.

  Only shown to someone signed in, because the link binds the address to a user
  id and there is no user to bind it to otherwise.
*/
export function VerifyEmail() {
  const t = useTranslations("profile.details");
  const locale = useLocale() as Locale;
  const user = useSession((s) => s.user);
  const email = useProfile((s) => s.profile.email);
  const name = useProfile((s) => s.profile.name);
  const [state, setState] = useState<State>("idle");

  if (!user || !email) return null;

  async function verify() {
    if (!user || !email) return;
    setState("sending");
    const result = await sendAccountVerification({ userId: user.id, email, name, locale });
    setState(result.ok ? "sent" : "error");
  }

  return (
    <div>
      <button
        type="button"
        onClick={verify}
        disabled={state === "sending"}
        className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent-strong disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {t("verify")}
      </button>
      <p aria-live="polite" className="mt-2 text-xs">
        {state === "sending" && <span className="text-muted">{t("verifySending")}</span>}
        {state === "sent" && (
          <span className="font-medium text-accent-strong">{t("verifySent", { email })}</span>
        )}
        {state === "error" && <span className="text-danger">{t("verifyError")}</span>}
      </p>
    </div>
  );
}
