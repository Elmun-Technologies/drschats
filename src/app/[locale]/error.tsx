"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <p className="text-5xl">😕</p>
      <h1 className="font-display text-2xl font-bold">{t("errorTitle")}</h1>
      <p className="text-muted max-w-md">{t("errorDesc")}</p>
      <div className="flex gap-3">
        <button onClick={reset} className={buttonVariants("primary")}>
          {t("errorRetry")}
        </button>
        <Link href="/" className={buttonVariants("secondary")}>
          {t("errorHome")}
        </Link>
      </div>
    </div>
  );
}
