"use client";

import { useActionState, type ReactNode } from "react";
import type { FormState } from "@/app/admin/_actions/catalog";
import { Notice } from "./ui";
import { SubmitButton } from "./SubmitButton";

/** A form bound to a server action that answers { ok } or { error }. */
export function ActionForm({
  action,
  children,
  submitLabel = "Saqlash",
  className,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);
  return (
    <form action={formAction} className={className}>
      {state?.error && <div className="col-span-full"><Notice tone="error">{state.error}</Notice></div>}
      {state?.ok && <div className="col-span-full"><Notice tone="ok">{state.ok}</Notice></div>}
      {children}
      <div className="col-span-full">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
