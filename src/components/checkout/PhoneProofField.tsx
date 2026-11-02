"use client";

import { useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { confirmPhoneCode, sendPhoneCode } from "@/app/actions/loyalty";

/*
  The first-order discount is automatic only for a phone proven by an SMS
  code (lib/promo/server.ts → phoneProven): anyone can type a stranger's
  number, and whether that number has ordered before is not the page's to
  tell. Shown in "auto" mode once a full number is typed and not yet proven;
  the token goes with the discount preview and with the order.
*/

type Step = "offer" | "code";

export function PhoneProofField({ phone, percent, onProven }: { phone: string; percent: number; onProven: (phone9: string, token: string) => void }) {
  const t = useTranslations("cart.v3.points");
  const tp = useTranslations("cart.v3.phoneProof");
  const locale = useLocale() as Locale;
  const digits = phone.replace(/\D/g, "");
  const phone9 = digits.length >= 9 ? digits.slice(-9) : "";
  const [step, setStep] = useState<Step>("offer");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const inputId = useId();
  const statusId = `${inputId}-status`;

  // A new number starts over.
  useEffect(() => {
    setStep("offer");
    setCode("");
    setError(null);
    setInfo(null);
  }, [phone9]);

  if (!phone9) return null;

  const send = async () => {
    setPending(true);
    setError(null);
    const res = await sendPhoneCode({ phone: phone9, locale }).catch(() => ({ ok: false as const, error: "failed" as const }));
    setPending(false);
    if (res.ok) {
      setStep("code");
      setCode("");
      setInfo(t("sent"));
      return;
    }
    setError(res.error === "phone_limit" || res.error === "rate_limited" ? t(`errors.${res.error}`) : t("errors.failed"));
  };

  const confirm = async () => {
    if (code.length !== 6) return;
    setPending(true);
    setError(null);
    const res = await confirmPhoneCode({ phone: phone9, code }).catch(() => ({ ok: false as const, error: "invalid" as const }));
    setPending(false);
    if (res.ok) {
      onProven(phone9, res.token);
      return;
    }
    if (res.error === "wrong") setError(t("errors.wrong", { left: res.attemptsLeft ?? 0 }));
    else if (res.error === "locked" || res.error === "expired" || res.error === "no_code" || res.error === "rate_limited") setError(t(`errors.${res.error}`));
    else setError(t("errors.failed"));
  };

  return (
    <div className="flex flex-col gap-2 rounded-[16px] bg-tile px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="text-[15px] font-semibold">{tp("title", { percent })}</span>
        {step === "offer" && (
          <Button type="button" variant="primary" size="md" className="h-11 px-4" onClick={send} disabled={pending}>
            {pending ? t("sending") : tp("send")}
          </Button>
        )}
      </div>
      {step === "offer" && <p className="text-[13px] leading-[18px] text-ink-2">{tp("why")}</p>}
      {step === "code" && (
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-sm font-medium text-ink-2">
            {t("codeLabel")}
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void confirm();
                }
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              aria-invalid={error ? true : undefined}
              aria-describedby={statusId}
              className={cn(inputClass, "h-12 min-w-0 flex-1 bg-bg tracking-[0.3em]")}
            />
            <Button type="button" variant="primary" size="md" className="shrink-0 px-5" onClick={confirm} disabled={pending || code.length !== 6}>
              {pending ? t("checking") : t("confirm")}
            </Button>
          </div>
          <button
            type="button"
            onClick={send}
            disabled={pending}
            className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-ink underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-60"
          >
            {t("resend")}
          </button>
        </div>
      )}
      <p id={statusId} aria-live="polite" className={cn("text-sm", error ? "font-medium text-red" : "text-ink-2", !error && !info && "sr-only")}>
        {error ?? info ?? ""}
      </p>
    </div>
  );
}
