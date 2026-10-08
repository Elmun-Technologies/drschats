"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { chipClass } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

/** "Ulashish: Telegram · Facebook · Havolani nusxalash" under an article. */
export function ShareRow({ url, title }: { url: string; title: string }) {
  const t = useTranslations("blog.v3");
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const chip = cn(chipClass(false), "h-11");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[15px] font-semibold">{t("share")}</span>
      <a className={chip} href={`https://t.me/share/url?url=${u}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
        Telegram
      </a>
      <a className={chip} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer">
        Facebook
      </a>
      <button
        type="button"
        className={chip}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard blocked: nothing to undo, the link is still in the address bar.
          }
        }}
      >
        {t("copyLink")}
      </button>
      <span aria-live="polite" className="text-sm text-ink-2">{copied ? t("copied") : ""}</span>
    </div>
  );
}
