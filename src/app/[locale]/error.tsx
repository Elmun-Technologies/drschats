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
    <div className="wrap flex min-h-[60vh] flex-col items-start justify-center gap-4 py-12">
      <h1 className="text-[28px] font-bold leading-[34px] lg:text-[36px] lg:leading-[42px]">{t("errorTitle")}</h1>
      <p className="max-w-md text-base leading-6 text-ink-2">{t("errorDesc")}</p>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={reset} className={buttonVariants("primary")}>
          {t("errorRetry")}
        </button>
        <Link href="/" className={buttonVariants("secondary")}>
          {t("errorHome")}
        </Link>
      </div>
    </div>
  );
}
