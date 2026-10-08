import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { InfoHeader, InfoShell } from "@/components/info/InfoShell";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";
import { PHARMACY_CHAINS, PHARMACIES_VERIFIED_AT } from "@/lib/content/pharmacies";
import { staticPageMetadata } from "@/lib/seo/page-meta";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "whereToBuy", "/where-to-buy");
}

/*
  "Where can I buy this?" — the question a supplement shopper asks before they
  trust a web shop, and the client's answer: eleven pharmacy chains across
  Tashkent.

  Two honest choices shape this page:

  - the addresses shown are the ones that could be checked against public
    listings, marked with the date they were read, and each card links to the
    chain's live branch list rather than to our own frozen copy of it;
  - there is no map of our own. A map needs coordinates, coordinates need a
    survey, and a pin dropped by hand would be exactly the kind of invented
    detail this site removed everywhere else.
*/
export default async function WhereToBuyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.whereToBuy");

  const verified = PHARMACIES_VERIFIED_AT.split("-").reverse().join(".");

  return (
    <InfoShell active="partners" crumb={t("crumb")}>
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/where-to-buy` }])} />
      <InfoHeader title={t("title")} lead={t("subtitle")} />

      <ul className="grid gap-3 sm:grid-cols-2 lg:gap-4">
        {PHARMACY_CHAINS.map((chain) => (
          <li key={chain.name} className="flex h-full flex-col gap-3 rounded-[20px] border border-line p-5 lg:p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold leading-7">{chain.name}</h2>
              {chain.branches ? (
                <span className="inline-flex h-7 shrink-0 items-center rounded-pill bg-tile px-2.5 text-[13px] font-semibold tabular-nums">
                  {t("branchCount", { count: chain.branches })}
                </span>
              ) : null}
            </div>
            {chain.note ? <p className="text-[15px] text-ink-2">{chain.note[locale]}</p> : null}
            {chain.addresses?.length ? (
              <ul className="flex flex-col gap-2 border-t border-line pt-3">
                {chain.addresses.map((branch, branchIndex) => (
                  <li key={`${chain.name}-${branchIndex}`} className="text-sm leading-5">
                    <span className="font-semibold">{branch.district[locale]}</span>
                    <span className="text-ink-2"> — {branch.address[locale]}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <a
              href={chain.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-semibold hover:underline"
            >
              {t("viewAllBranches")}
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">{t("verifiedNote", { date: verified })}</p>

      <div className="flex flex-col gap-4 rounded-[20px] bg-tile p-5 lg:flex-row lg:items-center lg:justify-between lg:p-7">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold">{t("notFoundTitle")}</h2>
          <p className="text-[15px] leading-[22px] text-ink-2">{t("notFoundBody")}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/products" className={buttonVariants("primary")}>{t("orderOnline")}</Link>
          <Link href="/contact" className={cn(buttonVariants("secondary"))}>{t("askUs")}</Link>
        </div>
      </div>
      <p className="text-sm text-ink-2">
        {t("b2bNote")}{" "}
        <a href={`mailto:${BRAND.contact.b2bEmail}`} className="font-semibold text-ink underline underline-offset-4">
          {BRAND.contact.b2bEmail}
        </a>
      </p>
    </InfoShell>
  );
}
