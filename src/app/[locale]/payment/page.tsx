import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, faqLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { PageHero } from "@/components/page/PageHero";
import { FaqSection } from "@/components/page/FaqSection";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.payment" });
  return buildPageMetadata({ locale, path: "/payment", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

const METHOD_ICONS: Record<number, string> = {
  0: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
  1: "M17 9V7a5 5 0 00-10 0v2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2h-2zm-6 0V7a3 3 0 016 0v2H7zm5 5v2h-4v-2h4z",
  2: "M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v2h16V6H4zm0 5v5h16v-5H4zm3 2h4v2H7v-2z",
  3: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const METHOD_COLORS = [
  "border-[#00B9F2]/30 bg-[#00B9F2]/8",
  "border-[#00AAEE]/30 bg-[#00AAEE]/8",
  "border-accent/30 bg-accent-soft",
  "border-gold/30 bg-gold/10",
];

const ICON_COLORS = ["text-[#00B9F2]", "text-[#00AAEE]", "text-accent", "text-gold"];

export default async function PaymentPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.payment");
  const dt = await getTranslations("pages");
  const methods = t.raw("methods") as { title: string; text: string; meta: string }[];
  const faq = t.raw("faq") as { question: string; answer: string }[];

  return (
    <div className="pb-24">
      <JsonLd data={faqLd(faq)} />
      <JsonLd data={breadcrumbLd([{ name: t("crumb"), url: `${SITE_URL}/${locale}/payment` }])} />
      <PageHero crumb={t("crumb")} eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Container className="mt-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m, i) => (
            <Reveal key={m.title} index={i}>
              <div className={`flex h-full flex-col rounded-2xl border p-6 ${METHOD_COLORS[i] ?? "border-line bg-surface"}`}>
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ink/40 ${ICON_COLORS[i] ?? "text-fg"}`}>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d={METHOD_ICONS[i] ?? ""} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="mb-2 w-fit rounded-full bg-ink/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                  {m.meta}
                </span>
                <h3 className="font-display text-lg font-bold text-fg">{m.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Security note */}
        <Reveal className="mt-10">
          <div className="flex items-start gap-4 rounded-2xl border border-accent/30 bg-accent-soft p-6">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="font-semibold text-fg">{t("secureTitle")}</p>
              <p className="mt-1 text-sm text-muted">{t("secureNote")}</p>
            </div>
          </div>
        </Reveal>
      </Container>

      <FaqSection heading={dt("deliveryFaqTitle")} items={faq} />
    </div>
  );
}
