import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildPageMetadata({ locale, path: "/contact", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const cards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5a2 2 0 012-2h2l2 5-2 1a12 12 0 005 5l1-2 5 2v2a2 2 0 01-2 2A16 16 0 013 5z" />
        </svg>
      ),
      label: t("phone"),
      value: "+998 71 200 00 00",
      href: "tel:+998712000000",
      hint: t("workHours"),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7L12 13 2 7" />
        </svg>
      ),
      label: t("email"),
      value: "info@alimkhanov.com",
      href: "mailto:info@alimkhanov.com",
      hint: t("emailHint"),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
      label: t("address"),
      value: t("addressValue"),
      href: null,
      hint: null,
    },
  ];

  return (
    <div className="pt-10">
      <Container size="narrow">
        <Reveal>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">{t("title")}</h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-6 text-xl text-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-12 space-y-4">
          {cards.map((card, i) => (
            <Reveal key={i} index={i}>
              <div className="flex items-center gap-5 rounded-2xl border border-line bg-surface p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                  {card.icon}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-faint">{card.label}</p>
                  {card.href ? (
                    <a href={card.href} className="mt-1 block text-lg font-semibold text-fg hover:text-accent">
                      {card.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-fg">{card.value}</p>
                  )}
                  {card.hint && <p className="mt-0.5 text-sm text-muted">{card.hint}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Telegram CTA */}
        <Reveal index={3}>
          <a
            href="https://t.me/alimkhanov_pharm"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-4 rounded-2xl border border-[#2AABEE]/30 bg-[#2AABEE]/5 p-6 transition-colors hover:border-[#2AABEE]/60"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2AABEE]/10 text-[#2AABEE]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.608c-.15.675-.546.84-1.107.522l-3.063-2.257-1.478 1.42c-.163.163-.3.3-.617.3l.22-3.118 5.67-5.12c.247-.22-.054-.342-.383-.122L7.04 14.572l-3.007-.94c-.653-.204-.666-.653.137-.966l11.732-4.522c.545-.197 1.02.133.66.104z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-fg">{t("telegramTitle")}</p>
              <p className="mt-0.5 text-sm text-muted">{t("telegramHint")}</p>
            </div>
            <svg viewBox="0 0 24 24" className="ml-auto h-5 w-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </Reveal>

        <div className="mb-32" />
      </Container>
    </div>
  );
}
