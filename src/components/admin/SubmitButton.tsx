"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { buttonClass } from "./ui";
import { cn } from "@/lib/utils";

export function SubmitButton({ children, pendingLabel = "Saqlanmoqda…", className }: { children: ReactNode; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(buttonClass, className)}>
      {pending ? pendingLabel : children}
    </button>
  );
}
