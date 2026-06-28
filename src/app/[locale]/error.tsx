"use client";

import { useEffect } from "react";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <p className="text-5xl">😕</p>
      <h1 className="font-display text-2xl font-bold">Xatolik yuz berdi</h1>
      <p className="text-muted max-w-md">Sahifani yuklashda muammo chiqdi. Qayta urinib ko&apos;ring yoki bosh sahifaga qayting.</p>
      <div className="flex gap-3">
        <button onClick={reset} className={buttonVariants("primary")}>
          Qayta urinish
        </button>
        <Link href="/" className={buttonVariants("secondary")}>
          Bosh sahifa
        </Link>
      </div>
    </div>
  );
}
