"use client";

import { useState } from "react";
import { smallButtonClass } from "./ui";
import { useT } from "@/lib/admin/i18n/client";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const t = useT();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={smallButtonClass}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          setDone(false);
        }
      }}
    >
      <span aria-live="polite">{done ? t("Nusxalandi") : label ?? t("Nusxalash")}</span>
    </button>
  );
}
