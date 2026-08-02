"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api, ApiError } from "@/lib/api/client";
import { useSession } from "@/lib/auth/store";
import { track } from "@/lib/analytics/events";

type Mode = "login" | "register";

const MIN_PASSWORD = 8;

export function AuthForm() {
  const t = useTranslations("account");
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signIn = useSession((s) => s.signIn);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const { accessToken } =
        mode === "login"
          ? await api.login({ phone, password })
          : await api.register({ name, phone, password });

      const user = await api.me(accessToken);
      signIn(accessToken, user);
      track(mode === "login" ? "login" : "sign_up", {});
    } catch (err) {
      // The API's own message is the useful one — "Invalid phone or password",
      // "Phone already registered" — so it is shown rather than replaced with a
      // generic failure that tells the customer nothing.
      setError(
        err instanceof ApiError && err.message ? err.message : t("errorGeneric"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-line bg-ink p-6 sm:p-8">
      <div role="tablist" aria-label={t("title")} className="mb-6 flex gap-1 rounded-full bg-surface p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              mode === m ? "bg-accent text-white" : "text-muted hover:text-fg"
            }`}
          >
            {t(m)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <Field
            id="account-name"
            label={t("name")}
            value={name}
            onChange={setName}
            autoComplete="name"
            required
            minLength={2}
          />
        )}

        <Field
          id="account-phone"
          label={t("phone")}
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          required
        />

        <Field
          id="account-password"
          label={t("password")}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "register" ? MIN_PASSWORD : undefined}
          hint={mode === "register" ? t("passwordHint", { count: MIN_PASSWORD }) : undefined}
        />

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {busy ? "…" : t(mode === "login" ? "loginCta" : "registerCta")}
        </button>
      </form>

      <p className="mt-5 text-xs leading-relaxed text-faint">{t("guestNote")}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  hint,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      <input
        id={id}
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
