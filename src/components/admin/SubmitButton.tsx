"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { buttonClass } from "./ui";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/admin/i18n/client";

export function SubmitButton({ children, pendingLabel, className }: { children: ReactNode; pendingLabel?: string; className?: string }) {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(buttonClass, className)}>
      {pending ? pendingLabel ?? t("Saqlanmoqda…") : children}
    </button>
  );
}
