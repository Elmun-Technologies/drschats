"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { cn, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { confirmPointsCode, pointsStatus, sendPointsCode } from "@/app/actions/loyalty";
import { usePoints } from "@/lib/loyalty/store";

/*
  Spending cashback points in the cart. Once a full phone number is typed the
  balance is asked for; with points there, "Sizda N ball bor — ishlatish"
  sends a 6-digit SMS code to that number (anyone could type someone else's
  phone), and a correct code returns a short-lived token the order carries.
  The amount is the parent's to compute (balance, the share cap of the goods
  after discounts) and the server computes it again inside the order.

  Hidden entirely when SMS is not configured: points still accrue, they just
  cannot be spent yet.
*/

type Step = "idle" | "offer" | "code" | "verified";

const STATUS_DEBOUNCE_MS = 700;

export function PointsField({ phone, applied, maxSharePercent }: { phone: string; applied: number; maxSharePercent: number }) {
  const t = useTranslations("cart.v3.points");
  const locale = useLocale() as Locale;
  const digits = phone.replace(/\D/g, "");
  const phone9 = digits.length >= 9 ? digits.slice(-9) : "";
  const token = usePoints((s) => s.token);
  const tokenPhone = usePoints((s) => s.phone9);
  const use = usePoints((s) => s.use);
  const balanceVerified = usePoints((s) => s.balance);
  const verified = usePoints((s) => s.verified);
  const setUse = usePoints((s) => s.setUse);
  const clear = usePoints((s) => s.clear);

  const [balance, setBalance] = useState(0);
  const [step, setStep] = useState<Step>("idle");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const seq = useRef(0);
  const inputId = useId();
  const statusId = `${inputId}-status`;

  // A token proves one phone; a different number starts over.
  useEffect(() => {
    if (tokenPhone && tokenPhone !== phone9) clear();
  }, [tokenPhone, phone9, clear]);

  useEffect(() => {
    setError(null);
    setInfo(null);
    if (!phone9) {
      seq.current++;
      setStep("idle");
      return;
    }
    if (token && tokenPhone === phone9) {
      setStep("verified");
      return;
    }
    const id = ++seq.current;
    const timer = window.setTimeout(async () => {
      const res = await pointsStatus(phone9).catch(() => null);
      if (id !== seq.current || !res?.ok) return;
      setBalance(res.balance);
      setStep(res.balance > 0 && res.redeemable ? "offer" : "idle");
    }, STATUS_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [phone9, token, tokenPhone]);

  const send = async () => {
    setPending(true);
    setError(null);
    const res = await sendPointsCode({ phone: phone9, locale }).catch(() => ({ ok: false as const, error: "failed" as const }));
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
    if (code.replace(/\D/g, "").length !== 6) return;
    setPending(true);
    setError(null);
    const res = await confirmPointsCode({ phone: phone9, code }).catch(() => ({ ok: false as const, error: "invalid" as const }));
    setPending(false);
    if (res.ok) {
      verified(phone9, res.token, res.balance);
      setInfo(null);
      setStep("verified");
      return;
    }
    if (res.error === "wrong") setError(t("errors.wrong", { left: res.attemptsLeft ?? 0 }));
    else if (res.error === "locked" || res.error === "expired" || res.error === "no_code" || res.error === "rate_limited") setError(t(`errors.${res.error}`));
    else setError(t("errors.failed"));
  };

  if (step === "idle") return null;

  const shownBalance = step === "verified" ? balanceVerified : balance;

  return (
    <div className="flex flex-col gap-2 rounded-[16px] bg-tile px-4 py-3.5 lg:bg-tile">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="text-[15px] font-semibold">{t("have", { balance: formatNumber(shownBalance) })}</span>
        {step === "offer" && (
          <Button type="button" variant="primary" size="md" className="h-11 px-4" onClick={send} disabled={pending}>
            {pending ? t("sending") : t("use")}
          </Button>
        )}
        {step === "verified" && (
          <button
            type="button"
            onClick={() => setUse(!use)}
            className="inline-flex min-h-11 items-center text-[15px] font-semibold text-ink underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {use ? t("stop") : t("resume")}
          </button>
        )}
      </div>

      {step === "offer" && <p className="text-[13px] leading-[18px] text-ink-2">{t("why")}</p>}

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

      {step === "verified" && use && applied > 0 && (
        <p className="text-sm text-ink-2">{t("applied", { amount: formatNumber(applied), balance: formatNumber(balanceVerified) })}</p>
      )}
      {(step === "verified" || step === "offer") && maxSharePercent < 100 && <p className="text-[13px] leading-[18px] text-muted">{t("cap", { percent: maxSharePercent })}</p>}

      <p id={statusId} aria-live="polite" className={cn("text-sm", error ? "font-medium text-red" : "text-ink-2", !error && !info && "sr-only")}>
        {error ?? info ?? ""}
      </p>
    </div>
  );
}
