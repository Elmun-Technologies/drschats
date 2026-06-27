import "@/styles/globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sora, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { routing, isLocale, localeHtmlLang, type Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { PromotionsProvider } from "@/lib/cart/promotions-context";
import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Toaster } from "@/components/ui/Toaster";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";
import { Analytics } from "@/components/analytics/Analytics";
import { SITE_URL } from "@/lib/seo/metadata";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const promotions = await shopflow.getPromotions(locale as Locale);

  return (
    <html lang={localeHtmlLang[locale as Locale]} className={`${sora.variable} ${manrope.variable}`}>
      <body className="grain min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <PromotionsProvider promotions={promotions}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
            >
              {locale === "ru" ? "К содержимому" : locale === "en" ? "Skip to content" : "Asosiy qismga o‘tish"}
            </a>
            <ScrollProgress />
            <SmoothScroll>
              <Header />
              <main id="main-content">{children}</main>
              <Footer />
              <CartDrawer />
              <CookieConsent />
              <Toaster />
              <BackToTop />
            </SmoothScroll>
          </PromotionsProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
