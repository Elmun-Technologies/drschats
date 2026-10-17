"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

/* The customer's referral code with copy and share (Web Share API where there is one, else the link is copied). */
export function ShareCode({ code, link, message }: { code: string; link: string; message: string }) {
  const t = useTranslations("checkout.success.loyalty");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const copy = async (text: string, what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard refused: the code stays on screen to copy by hand */
    }
  };

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: message, url: link });
        return;
      } catch {
        /* cancelled — nothing to do */
        return;
      }
    }
    await copy(message, "link");
  };

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
      <span className="inline-flex h-12 items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-line-strong bg-bg px-5 text-xl font-bold tracking-[0.12em] tabular-nums">
        {code}
      </span>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => copy(code, "code")} className={cn(buttonVariants("light", "md"), "h-12 rounded-[14px]")} aria-live="polite">
          {copied === "code" ? t("copied") : t("copy")}
        </button>
        <button type="button" onClick={share} className={cn(buttonVariants("primary", "md"), "h-12 rounded-[14px]")} aria-live="polite">
          {copied === "link" ? t("copied") : t("share")}
        </button>
      </div>
    </div>
  );
}
