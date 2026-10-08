import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { getAllProducts } from "@/lib/shop/all-products";
import { assertAccountAreaExists } from "@/lib/account/gate";
import { OrderDetail } from "@/components/account/OrderDetail";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: Locale; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "account.v3" });
  return {
    ...buildPageMetadata({ locale, path: `/account/orders/${id}`, title: `${t("orderNo", { id: decodeURIComponent(id) })} — ${SITE_NAME}`, description: t("details") }),
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  assertAccountAreaExists();
  // The catalogue, so "Buyurtmani takrorlash" can put real products back in the cart.
  const pool = await getAllProducts({ locale }).catch(() => ({ items: [] }));
  return <OrderDetail orderId={decodeURIComponent(id)} catalogue={pool.items} />;
}
