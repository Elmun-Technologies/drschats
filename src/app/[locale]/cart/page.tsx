import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Container } from "@/components/ui/Container";
import { CartPageView } from "@/components/cart/CartPageView";

export const metadata: Metadata = { robots: { index: false } };

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");
  return (
    <div className="pt-10">
      <Container>
        <h1 className="mb-10 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <CartPageView />
      </Container>
    </div>
  );
}
