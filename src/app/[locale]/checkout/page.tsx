import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { ...buildPageMetadata({ locale, path: "/checkout", title: t("title"), description: t("title") }), robots: { index: false } };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [recommended, t] = await Promise.all([
    shopflow.getProducts({ locale, sort: "popular", pageSize: 20 }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20 })),
    getTranslations("checkout"),
  ]);

  return (
    <div className="pt-10">
      <Container>
        <h1 className="mb-10 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <div className="pb-32">
          <CheckoutForm recommended={recommended.items} />
        </div>
      </Container>
    </div>
  );
}
