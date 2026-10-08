import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { InfoHeader, InfoShell } from "@/components/info/InfoShell";
import { staticPageMetadata } from "@/lib/seo/page-meta";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "offer", "/offer");
}

/*
  The public offer is a contract; its wording has to come from a lawyer, not
  from a template. Until it does, the page says so and points at the rules the
  site already applies, rather than showing a tagline under a legal heading.
*/
export default async function OfferPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const f = await getTranslations("footer");
  const t = await getTranslations("pages.v3");
  const links = [
    { href: "/delivery", label: t("nav.delivery") },
    { href: "/payment", label: t("nav.payment") },
    { href: "/guarantee", label: t("nav.guarantee") },
    { href: "/loyalty", label: t("nav.loyalty") },
    { href: "/privacy", label: f("privacy") },
    { href: "/requisites", label: t("about.reqTitle") },
  ];

  return (
    <InfoShell crumb={f("offer")}>
      <InfoHeader title={f("offer")} lead={t("offerPending")} />
      <nav aria-label={t("offerLinks")}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex min-h-14 items-center justify-between rounded-[16px] bg-tile px-5 text-base font-semibold hover:bg-tile-hover">
                {l.label}
                <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </InfoShell>
  );
}
