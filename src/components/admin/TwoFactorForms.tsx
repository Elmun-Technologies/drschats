"use client";

import Link from "next/link";
import { useActionState } from "react";
import { confirmTwoFactor, regenerateRecoveryCodes, type RecoveryState } from "@/app/admin/_actions/accounts";
import { Field, Notice, inputClass } from "./ui";
import { SubmitButton } from "./SubmitButton";

function Codes({ codes }: { codes: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-semibold text-ink">Tiklash kodlari — hozir saqlab qoʻying, ular qayta koʻrsatilmaydi:</p>
      <ul className="grid grid-cols-2 gap-2 rounded-[12px] bg-tile p-4 font-mono text-[15px] text-ink">
        {codes.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <p className="text-[13px] text-muted">Telefon yoʻqolsa, kirishda kod oʻrniga shulardan birini kiriting. Har biri bir marta ishlaydi.</p>
    </div>
  );
}

function CodeForm({ action, submit, pending }: { action: (s: RecoveryState, f: FormData) => Promise<RecoveryState>; submit: string; pending: string }) {
  const [state, formAction] = useActionState<RecoveryState, FormData>(action, undefined);
  if (state?.codes) {
    return (
      <div className="flex flex-col gap-3">
        {state.ok && <Notice tone="ok">{state.ok}</Notice>}
        <Codes codes={state.codes} />
        <Link href="/admin/security" className="text-[14px] font-semibold text-ink underline underline-offset-4">Saqlab oldim — davom etish</Link>
      </div>
    );
  }
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Ilovadagi kod" hint="6 raqam">
        <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,8}" maxLength={8} required className={inputClass} />
      </Field>
      <SubmitButton pendingLabel={pending}>{submit}</SubmitButton>
    </form>
  );
}

export function ConfirmTwoFactorForm() {
  return <CodeForm action={confirmTwoFactor} submit="Tasdiqlash va yoqish" pending="Tekshirilmoqda…" />;
}

export function RegenerateCodesForm() {
  return <CodeForm action={regenerateRecoveryCodes} submit="Yangi tiklash kodlari" pending="Yaratilmoqda…" />;
}
