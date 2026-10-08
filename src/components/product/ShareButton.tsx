"use client";

import { useTranslations } from "next-intl";
import { useToast } from "@/lib/ui/toast";

export function ShareButton({ name, showLabel = false, className = "" }: { name: string; showLabel?: boolean; className?: string }) {
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
      aria-label={showLabel ? undefined : t("share")}
      className={`flex items-center justify-center gap-1.5 text-ink transition-colors hover:text-ink-2 ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />
      </svg>
      {showLabel && <span className="text-ink-2">{t("share")}</span>}
    </button>
  );
}
