"use client";

import { useActionState } from "react";
import { login, setupFirstAdmin, type AuthState } from "@/app/admin/_actions/auth";
import { Field, Notice, inputClass } from "./ui";
import { SubmitButton } from "./SubmitButton";

export function LoginForm() {
  const [state, action] = useActionState<AuthState, FormData>(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label="Parol">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <SubmitButton pendingLabel="Tekshirilmoqda…">Kirish</SubmitButton>
    </form>
  );
}

export function SetupForm({ minPassword }: { minPassword: number }) {
  const [state, action] = useActionState<AuthState, FormData>(setupFirstAdmin, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Sozlash kaliti" hint="ADMIN_SETUP_TOKEN — server sozlamalaridagi qiymat">
        <input name="token" type="password" required className={inputClass} />
      </Field>
      <Field label="Ism">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label="Parol" hint={`Kamida ${minPassword} belgi`}>
        <input name="password" type="password" autoComplete="new-password" minLength={minPassword} required className={inputClass} />
      </Field>
      <SubmitButton pendingLabel="Yaratilmoqda…">Administratorni yaratish</SubmitButton>
    </form>
  );
}
