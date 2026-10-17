"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/admin/_actions/catalog";
import { saveCommerceSettings } from "@/app/admin/_actions/commerce";
import type { CommerceSection } from "@/lib/commerce/settings";
import { Notice, buttonClass, secondaryButtonClass } from "./ui";

function Buttons() {
  const { pending, data } = useFormStatus();
  const resetting = pending && data?.get("intent") === "reset";
  return (
    <div className="col-span-full flex flex-wrap gap-2">
      <button type="submit" name="intent" value="save" disabled={pending} className={buttonClass}>
        {pending && !resetting ? "Saqlanmoqda…" : "Saqlash"}
      </button>
      <button
        type="submit"
        name="intent"
        value="reset"
        disabled={pending}
        formNoValidate
        onClick={(e) => {
          if (!window.confirm("Bu boʻlim standart qiymatlarga qaytarilsinmi?")) e.preventDefault();
        }}
        className={secondaryButtonClass}
      >
        {resetting ? "Tiklanmoqda…" : "Standartga qaytarish"}
      </button>
    </div>
  );
}

/** One card of /admin/commerce: its fields, "Saqlash" and "Standartga qaytarish". */
export function CommerceCardForm({ section, children, className }: { section: CommerceSection; children: ReactNode; className?: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveCommerceSettings, undefined);
  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="section" value={section} />
      {state?.error && <div className="col-span-full"><Notice tone="error">{state.error}</Notice></div>}
      {state?.ok && <div className="col-span-full"><Notice tone="ok">{state.ok}</Notice></div>}
      {children}
      <Buttons />
    </form>
  );
}
