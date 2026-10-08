import "@/styles/globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { MobileBottomNav } from "@/components/nav/MobileBottomNav";
import { toMenuDeal } from "@/components/layout/menu-deal";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { RouteAnalytics } from "@/components/analytics/RouteAnalytics";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/*
  Search Console / Yandex.Webmaster ownership tokens. Set in the deploy's env;
  an unset one emits nothing rather than an empty tag.
*/
const verification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.YANDEX_VERIFICATION ? { yandex: process.env.YANDEX_VERIFICATION } : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification,
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
  const [messages, promotions, categories, topicPaths, tc, deals] = await Promise.all([
    getMessages(),
    shopflow.getPromotions(locale as Locale).catch(() => []),
    shopflow.getCategories(locale as Locale).catch(() => []),
    populatedTopicPaths(),
    getTranslations("common"),
    shopflow
      .getProducts({ locale: locale as Locale, assortment: "core", sort: "deals", pageSize: 1 })
      .catch(() => null),
  ]);
  const weeklyDeal = toMenuDeal(deals?.items[0]);

  return (
    <html lang={localeHtmlLang[locale as Locale]}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Latin Onest and the wordmark face are on every first paint; the
            other subsets load only when a page needs their characters. */}
        <link rel="preload" href="/fonts/onest-v11/onest-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/playfair-v40/playfair-500-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="grain min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <PromotionsProvider promotions={promotions}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              {tc("skipToContent")}
            </a>
            <ScrollProgress />
            <SmoothScroll>
              <Header categories={categories} topicPaths={topicPaths} deal={weeklyDeal} />
              {/* The tab bar is fixed, so its height is reserved twice: here, so
                  the seam between main and footer never rests under it, and
                  again at the end of the footer, which is what actually runs
                  beneath it when scrolled to the bottom. */}
              <main id="main-content" className="pb-[var(--bottom-nav)]">{children}</main>
              <Footer categories={categories} topicPaths={topicPaths} />
              <CookieConsent />
              <Toaster />
              <BackToTop />
              <MobileBottomNav categories={categories} topicPaths={topicPaths} />
              <DeferredUi />
            </SmoothScroll>
          </PromotionsProvider>
        </NextIntlClientProvider>
        <Analytics />
        <RouteAnalytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
