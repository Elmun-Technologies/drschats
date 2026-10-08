import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { ...buildPageMetadata({ locale, path: "/cart", title: t("title"), description: t("title") }), robots: { index: false } };
}

/*
  Design: CartV3 — the cart and the order form on one page. /checkout
  redirects here, so older links and the drawer's button keep working.
*/
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // The same pool /checkout gave the upsell ladder, so its offers do not change.
  const recommended = await shopflow.getProducts({ locale, sort: "popular", pageSize: 20 });

  return (
    <div className="wrap pb-9 pt-1 lg:pb-[72px] lg:pt-5">
      <CheckoutForm recommended={recommended.items} />
    </div>
  );
}
