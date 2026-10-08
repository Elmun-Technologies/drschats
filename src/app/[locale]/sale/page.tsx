import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { shopflow } from "@/lib/shopflow";
import { BRAND } from "@/lib/brand";
import { COMMERCE } from "@/lib/config/commerce";
import { cn, formatMoney } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { byDeepestDiscount } from "@/lib/shop/discounts";
import { productCutout } from "@/lib/content/product-cutouts";
import { FIRST_ORDER_PERCENT, RECURRING_PERCENT } from "@/lib/subscription/plans";
import { ProductGrid } from "@/components/home/HomeBlocks";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop.sale" });
  return buildPageMetadata({ locale, path: "/sale", title: `${t("title")} — Go Vita`, description: t("lead") });
}

/*
  Design: SaleV3 / SaleMobileV3. Only offers the checkout really applies: the
  subscription discount, a buy_x_get_y promotion while the catalogue runs one,
  and the free-shipping threshold. The design's "Birinchi buyurtma −10%" card
  is left out — in `computeTotals` that −10% belongs to subscriptions only, so
  promising it to every first order would be a price the cart never charges.
*/
export default async function SalePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tp, td, listing, promotions] = await Promise.all([
    getTranslations("shop.sale"),
    getTranslations("product"),
    getTranslations("delivery"),
    shopflow.getProducts({ locale, sort: "popular", pageSize: 100, assortment: "core" }),
    shopflow.getPromotions(locale).catch(() => []),
  ]);

  const deals = byDeepestDiscount(
    [...listing.items].sort((a, b) => Number(!productCutout(a.slug)) - Number(!productCutout(b.slug))),
  );
  const bundle = promotions.find((p) => p.type === "buy_x_get_y");
  const free = formatMoney(COMMERCE.freeShippingOver, locale);

  const offers = [
    { big: `−${RECURRING_PERCENT}%`, title: t("subTitle"), text: t("subText", { first: FIRST_ORDER_PERCENT, recurring: RECURRING_PERCENT }), href: "/products", tone: "bg-dark-panel text-white", sub: "text-on-dark-2" },
    ...(bundle ? [{ big: "2+1", title: bundle.title, text: bundle.description, href: "/products", tone: "bg-yellow-banner", sub: "text-[#2E3236]" }] : []),
    { big: formatMoney(0, locale), title: t("freeTitle"), text: t("freeText", { amount: free }), href: "/delivery", tone: "bg-tile", sub: "text-[#2E3236]", small: true },
  ];

  return (
    <div className="wrap flex flex-col gap-5 pb-9 pt-1 lg:gap-10 lg:pb-[72px] lg:pt-5">
      <div className="flex flex-col gap-1.5 lg:gap-3.5">
        <nav aria-label={tp("breadcrumbHome")} className="hidden gap-2 text-sm text-muted lg:flex">
          <Link href="/" className="hover:text-ink">{tp("breadcrumbHome")}</Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{t("short")}</span>
        </nav>
        <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page lg:leading-[42px]">
          <span className="lg:hidden">{t("short")}</span>
          <span className="hidden lg:inline">{t("title")}</span>
        </h1>
        <p className="max-w-[760px] text-[15px] leading-[21px] text-ink-2 lg:text-[17px] lg:leading-[26px]">{t("lead")}</p>
      </div>

      <section className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0">
        {offers.map((o) => (
          <Link
            key={o.title}
            href={o.href}
            className={cn("flex min-h-[200px] w-64 shrink-0 flex-col gap-2 rounded-[28px] p-5 lg:min-h-[240px] lg:w-auto lg:gap-2.5 lg:p-7", o.tone)}
          >
            <span className={cn("font-bold tracking-[-0.03em]", o.small ? "text-[36px] leading-[44px] lg:text-[44px]" : "text-[44px] leading-[48px] lg:text-[56px] lg:leading-[56px]")}>
              {o.big}
            </span>
            <span className="mt-1 text-lg font-bold lg:mt-2 lg:text-[21px]">{o.title}</span>
            <span className={cn("text-sm leading-[19px] lg:text-[15px] lg:leading-[21px]", o.sub)}>{o.text}</span>
          </Link>
        ))}
      </section>

      <section aria-labelledby="sale-deals" className="flex flex-col gap-3.5 lg:gap-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="sale-deals" className="text-[22px] font-bold leading-7 lg:text-h-section lg:leading-9">{t("deals")}</h2>
          <span className="text-sm text-ink-2 lg:text-base">
            <span className="lg:hidden">{t("dealsShort", { count: deals.length })}</span>
            <span className="hidden lg:inline">{t("dealsCount", { count: deals.length })}</span>
          </span>
        </div>
        {deals.length > 0 ? (
          <ProductGrid products={deals} mobileLimit={deals.length} />
        ) : (
          <p className="rounded-[20px] bg-tile p-6 text-base text-ink-2">{t("empty")}</p>
        )}
      </section>

      <section className="hidden gap-4 lg:grid lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-[20px] border border-line p-8">
          <h2 className="text-2xl font-bold">{t("rulesTitle")}</h2>
          {[
            t("rule1", { amount: free }),
            t("rule2", { hours: COMMERCE.delivery.tashkent.hours, days: td("regionsTime") }),
            t("rule3"),
          ].map((rule) => (
            <p key={rule} className="flex gap-3 text-base leading-[23px]">
              <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5 9-10" />
              </svg>
              {rule}
            </p>
          ))}
        </div>
        <a
          href={BRAND.social.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-3 rounded-[20px] bg-dark-panel p-8 text-white"
        >
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-on-dark-2">{t("clubEyebrow")}</span>
          <span className="text-[26px] font-bold leading-8">{t("clubTitle")}</span>
          <span className="text-base leading-6 text-on-dark-2">{t("clubText")}</span>
          <span className="mt-auto inline-flex h-[52px] items-center self-start rounded-[14px] bg-bg px-7 text-[17px] font-semibold text-ink">
            {t("clubCta")}
          </span>
        </a>
      </section>
    </div>
  );
}
