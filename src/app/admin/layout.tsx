import "@/styles/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/db/client";
import { AdminLocaleProvider } from "@/lib/admin/i18n/client";
import { readAdminLocale } from "@/lib/admin/i18n/server";

/*
  The shop's own admin panel. Outside the [locale] tree and the i18n
  middleware: its language (uz / ru) is the admin's own cookie, provided here
  so the sign-in pages and the error screen read it too. Without a database
  there is nothing to manage, so the whole area answers 404 — the same rule as
  /studio and the demo account area.
*/
export const metadata: Metadata = {
  title: { default: "govita — admin", template: "%s · govita admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  if (!isDbConfigured) notFound();
  const locale = await readAdminLocale();
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased"><AdminLocaleProvider locale={locale}>{children}</AdminLocaleProvider></body>
    </html>
  );
}
