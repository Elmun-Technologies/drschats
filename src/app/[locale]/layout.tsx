import "@/styles/globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages, getTranslations } from "next-intl/server";
import { routing, isLocale, localeHtmlLang, type Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { PromotionsProvider } from "@/lib/cart/promotions-context";
import { populatedTopicPaths } from "@/lib/content/nav-sections";
import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { DeferredUi } from "@/components/layout/DeferredUi";
import { Toaster } from "@/components/ui/Toaster";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { BackToTop } from "@/components/ui/BackToTop";
import { Analytics } from "@/components/analytics/Analytics";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, websiteLd, localBusinessLd } from "@/lib/seo/jsonld";
import { MobileBottomNav } from "@/components/nav/MobileBottomNav";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";

const exo2 = localFont({
  src: [
    { path: "../../fonts/exo2/exo2-regular.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/exo2/exo2-medium.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/exo2/exo2-semibold.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/exo2/exo2-bold.woff2", weight: "700", style: "normal" },
    { path: "../../fonts/exo2/exo2-extrabold.woff2", weight: "800", style: "normal" },
    { path: "../../fonts/exo2/exo2-black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-exo2",
  display: "swap",
  // Six weight files share this declaration; preloading would fetch all of
  // them on every page even though most routes only render one or two.
  preload: false,
});

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

  // Categories are layout data now that the header's catalogue menu lists
  // them; the read is cached and revalidated like the promotions beside it.
  const [messages, promotions, categories, topicPaths, tc] = await Promise.all([
    getMessages(),
    shopflow.getPromotions(locale as Locale).catch(() => []),
    shopflow.getCategories(locale as Locale).catch(() => []),
    populatedTopicPaths(),
    getTranslations("common"),
  ]);

  return (
    <html lang={localeHtmlLang[locale as Locale]} className={exo2.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2d2a25" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="grain min-h-screen antialiased">
        <JsonLd data={websiteLd(locale as Locale)} />
        <JsonLd data={localBusinessLd()} />
        <NextIntlClientProvider messages={messages}>
          <PromotionsProvider promotions={promotions}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-deep"
            >
              {tc("skipToContent")}
            </a>
            <ScrollProgress />
            <SmoothScroll>
              <Header categories={categories} topicPaths={topicPaths} />
              {/* The tab bar is fixed, so its height is reserved twice: here, so
                  the seam between main and footer never rests under it, and
                  again at the end of the footer, which is what actually runs
                  beneath it when scrolled to the bottom. */}
              <main id="main-content" className="pb-[var(--bottom-nav)]">{children}</main>
              <Footer topicPaths={topicPaths} />
              <CookieConsent />
              <Toaster />
              <BackToTop />
              <MobileBottomNav />
              <DeferredUi />
            </SmoothScroll>
          </PromotionsProvider>
        </NextIntlClientProvider>
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
