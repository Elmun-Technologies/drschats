import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { getExpert, listExpertSlugs } from "@/lib/content/experts.sanity";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listExpertSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const expert = await getExpert(slug, locale);
  if (!expert) return {};
  return buildPageMetadata({
    locale,
    path: `/experts/${slug}`,
    title: `${expert.name} — ${expert.title}`,
    description: expert.bio,
    image: expert.image,
  });
}

export default async function ExpertPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const expert = await getExpert(slug, locale);
  if (!expert) notFound();
  const t = await getTranslations("experts");

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/${locale}/experts/${slug}#person`,
    name: expert.name,
    jobTitle: expert.title,
    description: expert.bio,
    image: `${SITE_URL}${expert.image}`,
    worksFor: { "@type": "MedicalOrganization", name: expert.worksFor },
    knowsAbout: ["dietary supplements", "nutrition", "vitamins"],
    sameAs: expert.sameAs,
  };

  return (
    <div className="pt-10">
      <JsonLd data={personLd} />
      <Container size="narrow">
        <Link href="/experts" className="text-sm text-muted hover:text-accent">
          ← {t("back")}
        </Link>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-3xl border border-line bg-surface shadow-lg">
            <Image src={expert.image} alt={expert.name} fill sizes="160px" className="object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-accent-strong">{t("badge")}</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{expert.name}</h1>
            <p className="mt-1 text-lg text-muted">{expert.title}</p>
            {expert.worksFor && (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4" />
                </svg>
                {expert.worksFor}
              </p>
            )}
          </div>
        </div>

        <p className="mt-8 text-lg leading-relaxed text-muted">{expert.bio}</p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">{t("credentials")}</h2>
          <ul className="mt-4 space-y-3">
            {expert.credentials.map((c) => (
              <li key={c} className="flex items-start gap-3 text-fg">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </section>

        {expert.sameAs.length > 0 && (
          <section className="mb-32 mt-10">
            <h2 className="font-display text-xl font-semibold">{t("profiles")}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {expert.sameAs.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent-strong"
                >
                  {new URL(url).hostname.replace("www.", "")}
                </a>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
