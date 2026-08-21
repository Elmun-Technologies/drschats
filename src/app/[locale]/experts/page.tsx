import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getExperts } from "@/lib/content/experts.sanity";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { ConsultationModal } from "@/components/experts/ConsultationModal";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experts" });
  return buildPageMetadata({ locale, path: "/experts", title: `${t("title")} — Go Vita`, description: t("subtitle") });
}

export default async function ExpertsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, experts] = await Promise.all([getTranslations("experts"), getExperts(locale)]);

  const yearsMap: Record<string, string> = {
    "exp-alimov": "15+ yil tajriba",
    "exp-karimova": "10+ yil tajriba",
    "exp-yusupov": "12+ yil tajriba",
  };

  return (
    <div className="pt-10">
      <Container>
        <header className="max-w-2xl">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest">{t("eyebrow")}</p>
          <Reveal>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{t("title")}</h1>
          </Reveal>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </header>

        <div className="mb-32 mt-14 grid gap-8 md:grid-cols-3">
          {experts.map((e, i) => (
            <Reveal key={e.id} index={i}>
              <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                  <Image src={e.image} alt={e.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  {/* Status Badge */}
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>{t("onlineStatus")}</span>
                  </div>

                  {/* Experience Tag */}
                  <div className="absolute right-3 top-3 rounded-full border border-amber-500/40 bg-amber-500/90 px-3 py-1 text-[11px] font-bold text-ink shadow-sm">
                    {yearsMap[e.id] || "10+ yil tajriba"}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  {/* Rating & Review counter */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                    <span>★</span>
                    <span>{t("rating")}</span>
                  </div>

                  <Link href={`/experts/${e.slug}`}>
                    <h2 className="mt-2 font-display text-xl font-bold group-hover:text-amber-500 transition-colors">{e.name}</h2>
                  </Link>
                  <p className="mt-1 text-xs font-bold text-amber-600 dark:text-amber-400">{e.title}</p>
                  
                  <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted leading-relaxed">{e.bio}</p>

                  {e.credentials.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {e.credentials.slice(0, 3).map((c) => (
                        <span key={c} className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 border-t border-line pt-4">
                    <ConsultationModal expert={e} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
