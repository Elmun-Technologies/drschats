import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getAllProducts } from "@/lib/shop/all-products";
import { upsellPool } from "@/lib/upsell/pool";

// Prices on this page feed the order total; keep them close to the catalogue.
export const revalidate = 300;

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

  // The pool the modal and the order action use, so every offer shown is one the server accepts.
  const [recommended, catalogue] = await Promise.all([
    upsellPool(locale),
    getAllProducts({ locale }),
  ]);
  // Today's prices, so a cart kept for weeks shows what the order will cost.
  const prices = Object.fromEntries(
    catalogue.items.map((p) => [p.id, { price: p.price, oldPrice: p.oldPrice, inStock: p.inStock }]),
  );

  return (
    <div className="wrap pb-9 pt-1 lg:pb-[72px] lg:pt-5">
      <CheckoutForm recommended={recommended} prices={prices} />
    </div>
  );
}
