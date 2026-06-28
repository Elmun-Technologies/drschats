"use client";

import { useTranslations } from "next-intl";
import { useToast } from "@/lib/ui/toast";

export function ShareButton({ name }: { name: string }) {
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
      onClick={handleShare}
      aria-label={t("share")}
      className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" strokeLinecap="round" />
      </svg>
      {t("share")}
    </button>
  );
}
