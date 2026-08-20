import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getArticles } from "@/lib/content/blog.sanity";
import { usedCategoryKeys } from "@/lib/content/blog-categories";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/lib/i18n/navigation";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildPageMetadata({ locale, path: "/blog", title: `${t("title")} — Go Vita`, description: t("subtitle") });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const articles = await getArticles(locale);

  const [featured, ...rest] = articles;
  const categoryKeys = usedCategoryKeys(articles);

  return (
    <div className="min-h-screen">
      {/* Full-width Hero Header */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-brand-deep">
        <Image
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1400"
          alt="Blog & Knowledge Center"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep/90 to-transparent" />

        <Container className="absolute inset-0 flex flex-col justify-center">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-gold/20 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold border border-gold/30 mb-4">
              Bilimlar Markazi
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-surface-2/90 max-w-xl">{t("subtitle")}</p>
          </div>
        </Container>
      </section>

      <Container>
        {/* Knowledge Center taxonomy */}
        {categoryKeys.length > 0 && (
          <nav aria-label={t("categoriesTitle")} className="mt-10 mb-10 -mt-16 relative z-10">
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
              <Link
                href="/blog"
                className="shrink-0 rounded-full bg-gold px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-brand-deep shadow-lg transition-all hover:bg-white hover:scale-105"
              >
                Barchasi
              </Link>
              {categoryKeys.map((key) => (
                <Link
                  key={key}
                  href={`/blog/category/${key}`}
                  className="shrink-0 rounded-full border border-white/20 bg-brand-deep/80 backdrop-blur-md px-5 py-2.5 text-xs font-bold text-white transition-all hover:border-gold hover:text-gold hover:scale-105"
                >
                  {t(`categories.${key}`)}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Featured article */}
        {featured && (
          <Reveal>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Tavsiya etilgan maqola
              </span>
            </div>
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative block overflow-hidden rounded-[2.5rem] border border-white/10 bg-brand-deep transition-all duration-700 hover:shadow-2xl hover:shadow-brand-deep/30"
            >
              <div className="grid lg:grid-cols-2">
                <div className="relative aspect-[16/9] lg:aspect-auto lg:h-[400px]">
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-deep/50 lg:bg-gradient-to-r lg:from-transparent lg:to-brand-deep/30" />
                </div>
                <div className="relative flex flex-col justify-center p-8 lg:p-12">
                  <Badge tone="accent" className="mb-4 bg-gold/20 text-gold backdrop-blur-md border-none px-4 py-1.5 w-fit">
                    {featured.category}
                  </Badge>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">
                    {t("minRead", { min: featured.readingMinutes })}
                  </p>
                  <h2 className="font-display text-2xl lg:text-3xl font-extrabold leading-tight text-brand-deep transition-colors group-hover:text-gold">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-base text-muted line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gold transition-all group-hover:translate-x-1">
                    Maqolani o&apos;qish
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Rest of articles */}
        {rest.length > 0 && (
          <section className="mt-16 mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl font-extrabold text-brand-deep">
                Boshqa maqolalar
              </h2>
              <span className="text-xs font-bold text-muted">
                {rest.length} ta maqola
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
