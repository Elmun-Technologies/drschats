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
    <div className="pt-10">
      <Container>
        <header className="max-w-2xl">
          <Reveal>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">{t("title")}</h1>
          </Reveal>
          <Reveal index={1}>
            <p className="mt-6 text-xl text-muted">{t("subtitle")}</p>
          </Reveal>
        </header>

        {/* Knowledge Center taxonomy — each section is its own landing page. */}
        {categoryKeys.length > 0 && (
          <nav aria-label={t("categoriesTitle")} className="mt-8">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {categoryKeys.map((key) => (
                <Link
                  key={key}
                  href={`/blog/category/${key}`}
                  className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent-strong"
                >
                  {t(`categories.${key}`)}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Featured article */}
        {featured && (
          <Reveal className="mt-14">
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative block overflow-hidden rounded-[2.5rem] border border-white/10 bg-brand-deep transition-all duration-700 hover:shadow-2xl hover:shadow-brand-deep/30 aspect-[16/9] md:aspect-[2/1] lg:aspect-[21/9]"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/80 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-12 lg:p-16">
                <div className="mb-6">
                  <Badge tone="accent" className="bg-gold/20 text-gold backdrop-blur-md border-none px-4 py-1.5 text-sm">
                    {featured.category}
                  </Badge>
                </div>
                <div className="max-w-4xl">
                  <p className="mb-4 text-sm font-bold uppercase tracking-widest text-white/60">
                    {t("minRead", { min: featured.readingMinutes })}
                  </p>
                  <h2 className="font-display text-3xl font-extrabold leading-tight text-white transition-colors group-hover:text-gold drop-shadow-md sm:text-4xl md:text-5xl lg:text-6xl">
                    {featured.title}
                  </h2>
                  <p className="mt-6 line-clamp-2 max-w-2xl text-lg font-medium text-white/80 drop-shadow-sm md:text-xl">
                    {featured.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Rest of articles */}
        <div className="mb-32 mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
