"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClass, secondaryButtonClass } from "@/components/admin/ui";
import { useT } from "@/lib/admin/i18n/client";

/* A failed admin page keeps the panel's look and offers a retry instead of Next's bare error screen. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => {
    console.error("[admin]", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-[28px] font-bold leading-9">{t("Sahifani ochib boʻlmadi")}</h1>
      <p className="text-[15px] leading-6 text-ink-2">
        {t("Server xatosi. Qayta urinib koʻring; takrorlansa, vaqtini va shu kodni dasturchiga yuboring:")}{" "}
        <code className="rounded-sm bg-tile px-1.5 py-0.5 text-[13px]">{error.digest ?? "—"}</code>
      </p>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={reset} className={buttonClass}>
          {t("Qayta urinish")}
        </button>
        <Link href="/admin" className={secondaryButtonClass}>
          {t("Bosh panel")}
        </Link>
      </div>
    </main>
  );
}
