import "@/styles/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/db/client";

/*
  The shop's own admin panel. Outside the [locale] tree (it is one language,
  Uzbek, for the team) and outside the i18n middleware. Without a database
  there is nothing to manage, so the whole area answers 404 — the same rule as
  /studio and the demo account area.
*/
export const metadata: Metadata = {
  title: { default: "Go Vita — admin", template: "%s · Go Vita admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  if (!isDbConfigured) notFound();
  return (
    <html lang="uz">
      <body className="min-h-screen bg-tile font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
