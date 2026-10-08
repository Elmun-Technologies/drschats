"use client";

import { useTranslations } from "next-intl";
import { useToast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

/** Native share sheet where there is one, otherwise the link to the clipboard. */
export function ShareButton({ name, iconOnly = false, className }: { name: string; iconOnly?: boolean; className?: string }) {
  const t = useTranslations("common");
  const notify = useToast((s) => s.notify);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: name, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      notify();
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={iconOnly ? t("share") : undefined}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <svg viewBox="0 0 24 24" aria-hidden className={iconOnly ? "h-6 w-6" : "h-[18px] w-[18px]"} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v7h16v-7M12 3v12M7 8l5-5 5 5" />
      </svg>
      {!iconOnly && t("share")}
    </button>
  );
}
