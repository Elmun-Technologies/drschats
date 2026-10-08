"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { api, ApiError, type OtpRequestResult } from "@/lib/api/client";
import { useSession } from "@/lib/auth/store";
import { track } from "@/lib/analytics/events";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Button, buttonVariants } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { telegramConnectUrl } from "@/lib/notifications/telegram-link";

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
  const tv = useTranslations("account.v3");
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

  // The bot's own link when the backend handed one over, otherwise the
  // configured bot — or nothing, rather than a link to the wrong account.
  const botUrl = telegramLink ?? telegramConnectUrl();

  return (
    <div className="flex flex-col gap-5 rounded-[20px] lg:border lg:border-line lg:p-10 lg:shadow-buybox">
      <div aria-hidden className="flex gap-1.5">
        <span className="h-1 flex-1 rounded-full bg-ink" />
        <span className={cn("h-1 flex-1 rounded-full", step === "phone" ? "bg-chip-strong" : "bg-ink")} />
      </div>
      <h1 className="text-[28px] font-bold leading-[34px] lg:text-[32px] lg:leading-[38px]">
        {step === "code" ? tv("codeTitle") : t("title")}
      </h1>

      {step === "phone" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void askForCode();
          }}
          className="flex flex-col gap-4"
        >
          <p className="text-base leading-6 text-ink-2">{t("otpIntro")}</p>
          <div className="flex flex-col gap-2">
            <label htmlFor="account-phone" className="text-sm font-medium text-ink-2">
              {t("phone")}
            </label>
            <input
              id="account-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+998 90 123 45 67"
              required
              className={cn(inputClass, "h-14 text-lg")}
            />
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" size="lg" disabled={busy} className="h-14 rounded-[14px]">
            {busy ? "…" : t("otpCta")}
          </Button>
        </form>
      )}

      {step === "link" && (
        <div className="flex flex-col gap-4">
          <p className="text-base leading-6 text-ink-2">{t("linkIntro")}</p>
          {telegramLink ? (
            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className={cn(buttonClass, "h-14 rounded-[14px]")}>
              {t("linkCta")}
            </a>
          ) : (
            <ErrorNote>{t("errorNoBot")}</ErrorNote>
          )}
          <p className="text-sm leading-5 text-muted">{t("linkHint")}</p>
          <button type="button" onClick={() => setStep("code")} className="min-h-11 self-start text-[15px] font-semibold hover:underline">
            {t("linkDone")}
          </button>
        </div>
      )}

      {step === "code" && (
        <form onSubmit={submitCode} className="flex flex-col gap-5">
          <p className="text-base leading-6 text-ink-2">{t("codeIntro", { phone })}</p>
          {/* One real input, drawn as six boxes: paste, autofill and the
              keyboard all work as on any field. */}
          <div className="relative w-fit">
            <div aria-hidden className="flex gap-2 lg:gap-2.5">
              {Array.from({ length: CODE_LENGTH }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-[60px] w-12 items-center justify-center rounded-[14px] border-[1.5px] text-2xl font-bold sm:h-[72px] sm:w-16 sm:text-[28px]",
                    i < code.length || i === code.length ? "border-ink" : "border-line-strong",
                    i === code.length && "border-2",
                  )}
                >
                  {code[i] ?? ""}
                </span>
              ))}
            </div>
            <input
              ref={codeRef}
              id="account-code"
              aria-label={t("code")}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={CODE_LENGTH}
              required
              className="absolute inset-0 h-full w-full rounded-[14px] bg-transparent text-transparent caret-transparent outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4"
            />
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button type="submit" size="lg" disabled={busy || code.length < CODE_LENGTH} className="h-14 rounded-[14px]">
            {busy ? "…" : t("codeCta")}
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              className="min-h-11 font-semibold hover:underline"
            >
              {t("changePhone")}
            </button>
            <button
              type="button"
              disabled={secondsLeft > 0 || busy}
              onClick={() => void askForCode(true)}
              className="min-h-11 font-semibold hover:underline disabled:font-normal disabled:text-muted disabled:no-underline"
            >
              {secondsLeft > 0 ? t("resendIn", { seconds: secondsLeft }) : t("resend")}
            </button>
          </div>
        </form>
      )}

      {step !== "link" && (
        <div className="flex flex-col gap-2 rounded-[16px] bg-tile px-[18px] py-4 lg:px-5 lg:py-[18px]">
          <span className="text-[15px] font-bold">{tv("codeHelpTitle")}</span>
          <span className="text-sm leading-5 text-[#2E3236]">{t("linkIntro")}</span>
          {botUrl && (
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants("secondary"), "mt-1 h-11 self-start bg-transparent")}
            >
              {t("linkCta")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const buttonClass = buttonVariants("primary", "lg");
