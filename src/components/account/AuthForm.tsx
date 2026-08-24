"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { api, ApiError, type OtpRequestResult } from "@/lib/api/client";
import { useSession } from "@/lib/auth/store";
import { track } from "@/lib/analytics/events";

/*
  Sign-in is a phone and a code — no password, and no separate registration.
  The phone is the identity, the code proves it, so a first visit and a return
  visit are the same two screens.

  There is a third screen because Telegram makes one unavoidable: a bot cannot
  message a phone number it has never spoken to. Until someone has started the
  bot and shared their contact there is nowhere to send a code, so instead of
  failing we hand them the link that fixes it.
*/
type Step = "phone" | "link" | "code";

const CODE_LENGTH = 6;

export function AuthForm() {
  const t = useTranslations("account");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const signIn = useSession((s) => s.signIn);
  const codeRef = useRef<HTMLInputElement>(null);

  // Move focus to whichever field the new step is asking about, so the flow
  // stays usable without a mouse and a screen reader lands in the right place.
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  function describe(err: unknown): string {
    if (!(err instanceof ApiError)) return t("errorGeneric");
    // The API answers with stable reason codes rather than prose, so the
    // wording lives here where it can be translated.
    const known: Record<string, string> = {
      invalid_phone: t("errorPhone"),
      invalid_code: t("errorCode"),
      cooldown: t("errorCooldown"),
      too_many_requests: t("errorTooMany"),
      delivery_failed: t("errorDelivery"),
    };
    return known[err.message] ?? t("errorGeneric");
  }

  async function askForCode(resend = false) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result: OtpRequestResult = await api.requestOtp({ phone });
      if (result.status === "link_required") {
        setTelegramLink(result.telegramLink);
        setStep("link");
      } else {
        setStep("code");
        setSecondsLeft(60);
        if (!resend) track("otp_requested", {});
      }
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { accessToken } = await api.verifyOtp({ phone, code });
      const user = await api.me(accessToken);
      signIn(accessToken, user);
      track("login", {});
    } catch (err) {
      setError(describe(err));
      setCode("");
      codeRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-line bg-ink p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold text-fg">{t("title")}</h2>

      {step === "phone" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void askForCode();
          }}
          className="mt-5 flex flex-col gap-4"
        >
          <p className="text-sm text-muted">{t("otpIntro")}</p>
          <Field
            id="account-phone"
            label={t("phone")}
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
            placeholder="+998 90 123 45 67"
            required
          />
          {error && <ErrorNote>{error}</ErrorNote>}
          <SubmitButton busy={busy}>{t("otpCta")}</SubmitButton>
        </form>
      )}

      {step === "link" && (
        <div className="mt-5 flex flex-col gap-4">
          <p className="text-sm text-muted">{t("linkIntro")}</p>
          {telegramLink ? (
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent px-6 py-3 text-center text-sm font-bold text-brand-deep transition-colors hover:bg-accent-strong hover:text-ink"
            >
              {t("linkCta")}
            </a>
          ) : (
            <ErrorNote>{t("errorNoBot")}</ErrorNote>
          )}
          <p className="text-xs leading-relaxed text-faint">{t("linkHint")}</p>
          <button
            type="button"
            onClick={() => setStep("code")}
            className="text-sm font-semibold text-accent-strong hover:underline"
          >
            {t("linkDone")}
          </button>
        </div>
      )}

      {step === "code" && (
        <form onSubmit={submitCode} className="mt-5 flex flex-col gap-4">
          <p className="text-sm text-muted">{t("codeIntro", { phone })}</p>
          <Field
            ref={codeRef}
            id="account-code"
            label={t("code")}
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, CODE_LENGTH))}
            // one-time-code lets both iOS and Android offer the code from the
            // notification, which is most of the reason this flow feels quick.
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="123456"
            required
          />
          {error && <ErrorNote>{error}</ErrorNote>}
          <SubmitButton busy={busy} disabled={code.length < CODE_LENGTH}>
            {t("codeCta")}
          </SubmitButton>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              className="font-semibold text-muted hover:text-fg"
            >
              {t("changePhone")}
            </button>
            <button
              type="button"
              disabled={secondsLeft > 0 || busy}
              onClick={() => void askForCode(true)}
              className="font-semibold text-accent-strong hover:underline disabled:text-faint disabled:no-underline"
            >
              {secondsLeft > 0 ? t("resendIn", { seconds: secondsLeft }) : t("resend")}
            </button>
          </div>
        </form>
      )}

      <p className="mt-5 text-xs leading-relaxed text-faint">{t("guestNote")}</p>
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
      {children}
    </p>
  );
}

function SubmitButton({
  busy,
  disabled,
  children,
}: {
  busy: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-brand-deep transition-colors hover:bg-accent-strong hover:text-ink disabled:opacity-60"
    >
      {busy ? "…" : children}
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  hint,
  ref,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  ref?: React.Ref<HTMLInputElement>;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id" | "ref">) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-faint">
          {hint}
        </p>
      )}
    </div>
  );
}
