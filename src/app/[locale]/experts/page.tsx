import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getExperts } from "@/lib/content/experts.sanity";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";

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
  // No real specialists on file: the section does not exist (sitemap agrees).
  if (experts.length === 0) notFound();

  return (
    <div className="pt-10">
      <Container>
        <header className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-ink-2">{t("eyebrow")}</p>
          <Reveal>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{t("title")}</h1>
          </Reveal>
          <p className="mt-4 text-lg text-ink-2">{t("subtitle")}</p>
        </header>

        {/*
          No cards until there are real people to put in them.

          This page used to show three doctors with photographs, credentials and
          an "online" dot. None of them existed: the names, the years of
          experience and the profile links were written for the template, and
          the review attribution on every product page pointed at one of them.

          The block that replaces them says what is true today — the content is
          written from the manufacturers' own instructions and reviewed against
          them — and what it will take to publish a face here.
        */}
        {experts.some((e) => e.isDemo) && (
          <section className="mt-10 rounded-2xl border border-line/25 bg-tile p-6 sm:p-8">
            <h2 className="text-lg font-bold text-ink">{t("demoNoticeTitle")}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-2">{t("demoNoticeBody")}</p>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-line bg-bg p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold tracking-tight">{t("emptyTitle")}</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-2">{t("emptyBody")}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {(t.raw("requirements") as string[]).map((item, i) => (
              <Reveal key={item} index={i} as="li">
                <div className="flex h-full items-start gap-3 rounded-xl border border-line bg-bg p-4">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tile text-[11px] font-bold text-ink">✓</span>
                  <p className="text-sm leading-relaxed text-ink">{item}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <a
            href={`mailto:${BRAND.contact.b2bEmail}?subject=Ekspertlar kengashi`}
            className={buttonVariants("secondary") + " mt-8"}
          >
            {t("joinCta")}
          </a>
        </section>

        {experts.length > 0 && (
          <div className="mb-32 mt-14 grid gap-8 md:grid-cols-3">
            {experts.map((e, i) => (
              <Reveal key={e.id} index={i}>
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-bg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-tile">
                    <Image src={e.image} alt={e.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                    {e.isDemo && (
                      <span className="absolute left-3 top-3 rounded-full border border-line bg-bg/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-2 backdrop-blur-sm">
                        {t("demoChip")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-bold text-ink">{e.name}</h2>
                    <p className="mt-1 text-sm font-medium text-ink">{e.title}</p>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-2">{e.bio}</p>
                    <Link href={`/experts/${e.slug}`} className="mt-4 text-sm font-semibold text-ink">
                      {t("readMore")}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

      </Container>
    </div>
  );
}
