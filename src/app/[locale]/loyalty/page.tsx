import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "loyalty" });
  return buildPageMetadata({ locale, path: "/loyalty", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function LoyaltyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("loyalty");

  const points = [t("pointsNew"), t("pointsStandard"), t("pointsPromo")];

  return (
    <div className="pt-10">
      <Container>
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </header>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-line bg-ink p-8">
              <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-strong">15%</span>
              <h2 className="mt-4 font-display text-2xl font-bold">{t("privilegedTitle")}</h2>
              <p className="mt-3 text-muted">{t("privilegedDesc")}</p>
              <p className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm text-muted">{t("privilegedClub")}</p>
            </div>
          </Reveal>

          <Reveal index={1}>
            <div className="flex h-full flex-col rounded-3xl border border-line bg-ink p-8">
              <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold">B2B</span>
              <h2 className="mt-4 font-display text-2xl font-bold">{t("consultantTitle")}</h2>
              <p className="mt-3 text-muted">{t("consultantDesc")}</p>
              <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-fg">{t("consultantLegal")}</p>
            </div>
          </Reveal>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">{t("pointsTitle")}</h2>
          <p className="mt-3 max-w-2xl text-muted">{t("pointsDesc")}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {points.map((p, i) => (
              <Reveal key={p} index={i}>
                <div className="rounded-2xl border border-line bg-surface p-5 text-sm font-medium text-fg">{p}</div>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="mb-32 mt-12">
          <Link href="/contact" className={buttonVariants("primary", "lg")}>
            {t("cta")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
