import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { LegalPage } from "@/components/legal/LegalPage";

export const revalidate = 3600;

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  const ch = await getTranslations("checkout");
  return <LegalPage title={t("delivery")} body={`${ch("paymentNote")}\n\n${ch("operatorNote")}`} />;
}
