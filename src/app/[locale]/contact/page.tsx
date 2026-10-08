import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { BRAND, WHATSAPP_URL } from "@/lib/brand";
import { Link } from "@/lib/i18n/navigation";
import { InfoHeader, InfoShell } from "@/components/info/InfoShell";
import { ContactForm } from "@/components/info/LeadForms";
import { cn } from "@/lib/utils";
import { staticPageMetadata } from "@/lib/seo/page-meta";
import { JsonLd, localBusinessLd } from "@/lib/seo/jsonld";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "contact", "/contact");
}

const ARROW = (
  <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.v3");

  const cards = [
    { label: t("contact.phone"), value: BRAND.contact.phone, href: `tel:${BRAND.contact.phoneHref}`, hint: t("contact.hours"), dark: true },
    { label: t("contact.email"), value: BRAND.contact.email, href: `mailto:${BRAND.contact.email}`, hint: t("contact.emailHint"), dark: false },
    { label: t("contact.address"), value: t("contact.city"), href: null, hint: t("contact.country"), dark: false },
  ];
  const topics = [
    { key: "orders", href: BRAND.social.telegram, cta: t("contact.telegram"), external: true },
    { key: "advice", href: BRAND.social.telegram, cta: t("contact.telegram"), external: true },
    { key: "whatsapp", href: WHATSAPP_URL, cta: "WhatsApp", external: true },
  ] as const;
  const kinds = ["pharmacy", "distribution", "corporate"] as const;

  return (
    <InfoShell active="contact" crumb={t("nav.contact")}>
      <JsonLd data={localBusinessLd()} />
      <InfoHeader title={t("contact.title")} lead={t("contact.lead")} />

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={cn("flex flex-col gap-1 rounded-[20px] p-5 lg:min-h-[200px] lg:p-6", c.dark ? "bg-dark-panel text-white" : "bg-tile")}
          >
            <span className={cn("text-[15px]", c.dark ? "text-on-dark-2" : "text-ink-2")}>{c.label}</span>
            {c.href ? (
              <a href={c.href} className="break-words text-[22px] font-bold leading-7 hover:underline lg:text-[26px] lg:leading-8">{c.value}</a>
            ) : (
              <span className="text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{c.value}</span>
            )}
            <span className={cn("mt-auto pt-3 text-[15px]", c.dark ? "text-on-dark-2" : "text-ink-2")}>{c.hint}</span>
          </div>
        ))}
      </div>

      <section aria-labelledby="contact-topics" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="contact-topics" className="text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{t("contact.topicsTitle")}</h2>
          <p className="text-[15px] text-ink-2">{t("contact.topicsLead")}</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {topics.map((topic) => (
            <div key={topic.key} className="flex flex-col gap-1.5 rounded-[20px] border border-line p-5">
              <h3 className="text-lg font-bold">{t(`contact.topics.${topic.key}.title`)}</h3>
              <p className="text-[15px] leading-[22px] text-ink-2">{t(`contact.topics.${topic.key}.text`)}</p>
              <a href={topic.href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-semibold hover:underline">
                {topic.cta}
                {ARROW}
              </a>
            </div>
          ))}
          {kinds.map((k) => (
            <div key={k} className="flex flex-col gap-1.5 rounded-[20px] border border-line p-5">
              <h3 className="text-lg font-bold">{t(`partners.kinds.${k}.title`)}</h3>
              <p className="text-[15px] leading-[22px] text-ink-2">{t(`partners.kinds.${k}.text`)}</p>
              <Link href="/partners" className="mt-1 inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-semibold hover:underline">
                {t("contact.more")}
                {ARROW}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="contact-form" className="flex flex-col gap-5 rounded-[20px] border border-line p-5 lg:p-8">
        <h2 id="contact-form" className="text-[22px] font-bold leading-7 lg:text-[26px]">{t("contact.formTitle")}</h2>
        <ContactForm />
      </section>
    </InfoShell>
  );
}
