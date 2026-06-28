import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getExperts } from "@/lib/content/experts.sanity";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experts" });
  return buildPageMetadata({ locale, path: "/experts", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function ExpertsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, experts] = await Promise.all([getTranslations("experts"), getExperts(locale)]);

  return (
    <div className="pt-10">
      <Container>
        <header className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-strong">{t("badge")}</p>
          <Reveal>
            <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">{t("title")}</h1>
          </Reveal>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </header>

        <div className="mb-32 mt-14 grid gap-6 md:grid-cols-3">
          {experts.map((e, i) => (
            <Reveal key={e.id} index={i}>
              <Link
                href={`/experts/${e.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink transition-all duration-300 hover:border-accent hover:shadow-[0_18px_44px_-24px_rgba(15,26,20,0.3)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image src={e.image} alt={e.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-bold group-hover:text-accent-strong">{e.name}</h2>
                  <p className="mt-1 text-sm text-accent-strong">{e.title}</p>
                  <p className="mt-3 line-clamp-3 text-sm text-muted">{e.bio}</p>
                  {e.credentials.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {e.credentials.slice(0, 3).map((c) => (
                        <span key={c} className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
