import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { MyOrders } from "@/components/track/MyOrders";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "track.orders" });
  // Personal to the browser that opens it: nothing to index.
  return { title: t("title"), robots: { index: false, follow: false } };
}

/*
  «Buyurtmalarim» for a shop without customer accounts: the orders this
  browser placed or opened from a link (MyOrders). The tab bar's last tab
  leads here while the account area is off.
*/
export default async function MyOrdersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("track.orders");
  return (
    <div className="wrap flex max-w-[860px] flex-col gap-5 pb-12 pt-6 lg:gap-7 lg:pb-20 lg:pt-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-[36px] lg:leading-[42px]">{t("title")}</h1>
        <p className="text-base leading-6 text-ink-2 lg:text-[17px]">{t("lead")}</p>
      </div>
      <MyOrders />
      <p className="text-[15px] text-ink-2">
        {t.rich("profile", { link: (chunks) => <Link href="/profile" className="font-semibold text-ink underline">{chunks}</Link> })}
      </p>
    </div>
  );
}
