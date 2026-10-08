import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Section } from "@/components/ui/Section";
import { Link } from "@/lib/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";
import { PHARMACY_CHAINS, PHARMACIES_VERIFIED_AT } from "@/lib/content/pharmacies";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.whereToBuy" });
  return buildPageMetadata({
    locale,
    path: "/where-to-buy",
    title: `${t("title")} — Go Vita`,
    description: t("subtitle"),
  });
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
    <div className="pb-4">
      <JsonLd
        data={breadcrumbLd([
          { name: t("crumb"), url: `${SITE_URL}/${locale}/where-to-buy` },
        ])}
      />

      <Section tone="ink" size="default">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-signal">{t("eyebrow")}</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-pretty text-lg text-legacy-muted">{t("subtitle")}</p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHARMACY_CHAINS.map((chain) => (
            <li key={chain.name} className="flex h-full flex-col rounded-2xl border border-legacy-line bg-surface p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl font-extrabold leading-snug text-brand-deep">{chain.name}</h2>
                {chain.branches ? (
                  <span className="shrink-0 rounded-full border border-legacy-line bg-surface-2 px-3 py-1 text-xs font-semibold tabular-nums text-legacy-muted">
                    {t("branchCount", { count: chain.branches })}
                  </span>
                ) : null}
              </div>

              {chain.note ? <p className="mt-2 text-sm text-legacy-muted">{chain.note[locale]}</p> : null}

              {chain.addresses?.length ? (
                <ul className="mt-4 space-y-2 border-t border-legacy-line pt-4">
                  {chain.addresses.map((branch, branchIndex) => (
                    <li key={`${chain.name}-${branchIndex}`} className="text-sm">
                      <span className="font-semibold text-fg">{branch.district[locale]}</span>
                      <span className="text-legacy-muted"> — {branch.address[locale]}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <a
                href={chain.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-extrabold uppercase tracking-widest text-legacy-muted transition-colors hover:text-fg"
              >
                {t("viewAllBranches")}
                <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-legacy-muted">
          {t("verifiedNote", { date: verified })}
        </p>
      </Section>

      <Section tone="surface" size="tight">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("notFoundTitle")}</h2>
            <p className="mt-3 text-pretty text-legacy-muted">{t("notFoundBody")}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/products" className={buttonVariants("primary")}>
              {t("orderOnline")}
            </Link>
            <Link href="/contact" className={buttonVariants("secondary")}>
              {t("askUs")}
            </Link>
          </div>
        </div>

        <p className="mt-8 text-sm text-legacy-muted">
          {t("b2bNote")}{" "}
          <a href={`mailto:${BRAND.contact.b2bEmail}`} className="font-semibold text-fg underline decoration-legacy-line-strong underline-offset-4">
            {BRAND.contact.b2bEmail}
          </a>
        </p>
      </Section>
    </div>
  );
}
