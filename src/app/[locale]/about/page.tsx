import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, organizationLd, breadcrumbLd } from "@/lib/seo/jsonld";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { COMMERCE } from "@/lib/config/commerce";
import { getAllProducts } from "@/lib/shop/all-products";
import { productBrand } from "@/lib/content/product-brands";
import { Link } from "@/lib/i18n/navigation";
import { InfoShell } from "@/components/info/InfoShell";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return buildPageMetadata({ locale, path: "/about", title: `${t("title")} — Go Vita`, description: t("subtitle") });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.v3");

  // Counted from the live catalogue, so the numbers cannot drift from it.
  const catalogue = await getAllProducts({ locale });
  const brands = [...new Set(catalogue.items.map((p) => productBrand(p.slug)?.name).filter((n): n is string => Boolean(n)))];
  const hours = COMMERCE.delivery.tashkent.hours;
  const days = COMMERCE.returns.unopenedWindowDays;
  const stats = [
    { value: String(brands.length), label: t("about.statBrands") },
    { value: String(catalogue.total), label: t("about.statProducts") },
    { value: t("about.hours", { hours }), label: t("about.statDelivery") },
    { value: t("about.days", { days }), label: t("about.statReturns") },
  ];
  const values = t.raw("about.values") as { title: string; text: string }[];
  const path = (t.raw("about.path") as { title: string; text: string }[]).map((s) => ({
    ...s,
    text: s.text.replace("{hours}", String(hours)),
  }));
  const pending = t("about.pending");
  const requisites = [
    { label: t("about.reqName"), value: BRAND.legalName },
    { label: t("about.reqImporter"), value: BRAND.legal.importer },
    { label: t("about.reqAddress"), value: locale === "ru" ? BRAND.legal.addressRu : BRAND.legal.address },
    { label: t("about.reqStir"), value: BRAND.legal.stir },
    { label: t("about.reqLicence"), value: BRAND.legal.licence || pending },
    { label: t("about.reqPhone"), value: BRAND.contact.phone, href: `tel:${BRAND.contact.phoneHref}` },
    { label: t("about.reqEmail"), value: BRAND.contact.email, href: `mailto:${BRAND.contact.email}` },
  ];

  return (
    <InfoShell active="about" crumb={t("nav.about")}>
      <JsonLd data={organizationLd(locale)} />
      <JsonLd data={breadcrumbLd([{ name: t("nav.about"), url: `${SITE_URL}/${locale}/about` }])} />

      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
        <div className="flex flex-col gap-3 lg:gap-4">
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-[44px] lg:leading-[50px]">{BRAND.name}</h1>
          <p className="text-[17px] leading-[26px] text-ink-2 lg:text-lg">{t("about.lead")}</p>
          <p className="text-[15px] leading-6 text-ink-2 lg:text-base">
            {t("about.body", { brands: brands.join(", "), importer: BRAND.legal.importer })}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] lg:aspect-auto lg:h-[314px]">
          <Image src="/images/stock/st-pharmacist-shelf.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse gap-1 rounded-[20px] bg-tile p-5 lg:p-6">
            <dt className="text-sm text-ink-2">{s.label}</dt>
            <dd className="text-[26px] font-bold leading-8 lg:text-[34px] lg:leading-10">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2 rounded-[24px] bg-dark-panel p-6 text-white lg:px-9 lg:py-8">
        <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-on-dark-2">{t("about.missionLabel")}</span>
        <p className="text-xl font-bold leading-7 lg:text-[28px] lg:leading-9">{t("about.mission")}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {values.map((v) => (
          <div key={v.title} className="flex flex-col gap-2 rounded-[20px] border border-line p-5 lg:p-6">
            <h2 className="text-xl font-bold">{v.title}</h2>
            <p className="text-[15px] leading-[22px] text-ink-2">{v.text}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="about-path" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="about-path" className="text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{t("about.pathTitle")}</h2>
          <p className="text-[15px] text-ink-2">{t("about.pathLead")}</p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {path.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-2 rounded-[20px] bg-tile p-5">
              <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white">{i + 1}</span>
              <h3 className="mt-1 text-base font-bold">{s.title}</h3>
              <p className="text-sm leading-5 text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="about-req" className="flex flex-col gap-3 rounded-[20px] border border-line p-5 lg:p-7">
        <h2 id="about-req" className="text-[22px] font-bold leading-7">{t("about.reqTitle")}</h2>
        <dl className="flex flex-col">
          {requisites.map((r) => (
            <div key={r.label} className="flex flex-col gap-1 border-b border-line py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <dt className="text-[15px] text-ink-2">{r.label}</dt>
              <dd className="text-[15px] font-semibold sm:text-right">
                {r.href ? <a href={r.href} className="hover:underline">{r.value}</a> : r.value}
              </dd>
            </div>
          ))}
        </dl>
        <Link href="/requisites" className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold underline underline-offset-4">
          {t("about.reqAll")}
        </Link>
      </section>
    </InfoShell>
  );
}
