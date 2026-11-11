"use client";

import { useActionState } from "react";
import { login, setupFirstAdmin, verifySecondFactor, type AuthState } from "@/app/admin/_actions/auth";
import { Field, Notice, inputClass } from "./ui";
import { SubmitButton } from "./SubmitButton";
import { useT } from "@/lib/admin/i18n/client";

export function LoginForm() {
  const t = useT();
  const [state, action] = useActionState<AuthState, FormData>(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <Field label={t("Email")}>
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label={t("Parol")}>
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <SubmitButton pendingLabel={t("Tekshirilmoqda…")}>{t("Kirish")}</SubmitButton>
    </form>
  );
}

export function SetupForm({ minPassword }: { minPassword: number }) {
  const t = useT();
  const [state, action] = useActionState<AuthState, FormData>(setupFirstAdmin, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <Field label={t("Sozlash kaliti")} hint={t("ADMIN_SETUP_TOKEN — server sozlamalaridagi qiymat")}>
        <input name="token" type="password" required className={inputClass} />
      </Field>
      <Field label={t("Ism")}>
        <input name="name" required className={inputClass} />
      </Field>
      <Field label={t("Email")}>
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label={t("Parol")} hint={t("Kamida {n} belgi", { n: minPassword })}>
        <input name="password" type="password" autoComplete="new-password" minLength={minPassword} required className={inputClass} />
      </Field>
      <SubmitButton pendingLabel={t("Yaratilmoqda…")}>{t("Administratorni yaratish")}</SubmitButton>
    </form>
  );
}

export function VerifyForm() {
  const t = useT();
  const [state, action] = useActionState<AuthState, FormData>(verifySecondFactor, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <Field label={t("Kod")} hint={t("6 raqam yoki xxxxx-xxxxx tiklash kodi")}>
        <input name="code" inputMode="text" autoComplete="one-time-code" autoFocus required maxLength={20} spellCheck={false} className={inputClass} />
      </Field>
      <SubmitButton pendingLabel={t("Tekshirilmoqda…")}>{t("Kirish")}</SubmitButton>
    </form>
  );
}
