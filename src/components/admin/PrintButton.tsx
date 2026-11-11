"use client";

import { buttonClass } from "./ui";
import { useT } from "@/lib/admin/i18n/client";

export function PrintButton() {
  const t = useT();
  return (
    <button type="button" onClick={() => window.print()} className={`${buttonClass} print:hidden`}>
      {t("Chop etish")}
    </button>
  );
}
