"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const KEY = STORAGE_KEYS.cookieConsent;

export function CookieConsent() {
  const t = useTranslations("cookie");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(var(--bottom-nav)+0.75rem)] z-50 mx-auto max-w-3xl rounded-2xl border border-line bg-ink p-4 shadow-2xl sm:flex sm:items-center sm:gap-4">
      <p className="text-sm text-muted">
        {t("text")}{" "}
        <Link href="/privacy" className="text-accent-strong underline">
          {t("more")}
        </Link>
      </p>
      <button
        onClick={() => {
          localStorage.setItem(KEY, "1");
          setShow(false);
        }}
        className="mt-3 w-full shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-accent-strong hover:text-ink sm:mt-0 sm:w-auto"
      >
        {t("accept")}
      </button>
    </div>
  );
}
