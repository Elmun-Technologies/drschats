"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[80svh] items-center pt-10">
      <Container size="narrow">
        <div className="text-center">
          <div className="relative inline-block">
            <p className="font-display text-[120px] font-extrabold leading-none tracking-tight text-accent/10 sm:text-[180px]">
              404
            </p>
            <p className="absolute inset-0 flex items-center justify-center font-display text-[120px] font-extrabold leading-none tracking-tight text-accent sm:text-[180px]" aria-hidden>
              404
            </p>
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-fg sm:text-3xl">
            {t("notFoundTitle")}
          </h1>
          <p className="mt-3 text-muted">
            {t("notFoundDesc")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:bg-accent-strong"
            >
              {t("notFoundHome")}
            </Link>
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-6 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
            >
              {t("notFoundShop")}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
