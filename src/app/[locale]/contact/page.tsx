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

  const items = [
    { label: t("phone"), value: "+998 71 200 00 00", href: "tel:+998712000000" },
    { label: t("email"), value: "info@alimkhanov.com", href: "mailto:info@alimkhanov.com" },
    { label: t("address"), value: t("addressValue") },
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
        <div className="mb-32 mt-12 space-y-4">
          {items.map((it, i) => (
            <Reveal key={it.label} index={i}>
              <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-6 py-5">
                <span className="text-muted">{it.label}</span>
                {it.href ? (
                  <a href={it.href} className="font-medium text-fg hover:text-accent">
                    {it.value}
                  </a>
                ) : (
                  <span className="font-medium text-fg">{it.value}</span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
