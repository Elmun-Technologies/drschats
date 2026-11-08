"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { signOutCustomer } from "@/app/actions/customer";
import { cn } from "@/lib/utils";
import { SESSION_EVENT } from "@/lib/config/telegram-login";

export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations("account.tg");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signOutCustomer().catch(() => null);
        window.dispatchEvent(new Event(SESSION_EVENT));
        router.refresh();
      }}
      className={cn("flex min-h-11 items-center gap-3 text-left text-base text-ink-2 hover:text-ink", className)}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
      </svg>
      {t("signOut")}
    </button>
  );
}

export function CopyCode({ code }: { code: string }) {
  const t = useTranslations("account.tg");
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          // No clipboard permission: the code is on screen to copy by hand.
        }
      }}
      className="flex h-11 items-center justify-center rounded-sm border border-line-strong bg-bg px-4 text-[15px] font-semibold"
    >
      <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
    </button>
  );
}
