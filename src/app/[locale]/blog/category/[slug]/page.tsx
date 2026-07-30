import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getArticles } from "@/lib/content/blog.sanity";
import {
  BLOG_CATEGORY_KEYS,
  articlesInCategory,
  isBlogCategoryKey,
} from "@/lib/content/blog-categories";
import { buildPageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ArticleCard } from "@/components/blog/ArticleCard";

export const revalidate = 3600;

export function generateStaticParams() {
  return BLOG_CATEGORY_KEYS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isBlogCategoryKey(slug)) return {};
  const t = await getTranslations({ locale, namespace: "blog" });
  const label = t(`categories.${slug}`);
  return buildPageMetadata({
    locale,
    path: `/blog/category/${slug}`,
    title: `${label} — ${t("title")} | ${SITE_NAME}`,
    description: t("categorySubtitle", { category: label }),
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!isBlogCategoryKey(slug)) notFound();

  const [t, prod, articles] = await Promise.all([
    getTranslations("blog"),
    getTranslations("product"),
    getArticles(locale),
  ]);

  const inCategory = articlesInCategory(articles, slug);
  const label = t(`categories.${slug}`);

  return (
    <div className="pt-10 pb-24">
      <JsonLd
        data={breadcrumbLd([
          { name: prod("breadcrumbHome"), url: `${SITE_URL}/${locale}` },
          { name: t("title"), url: `${SITE_URL}/${locale}/blog` },
          { name: label, url: `${SITE_URL}/${locale}/blog/category/${slug}` },
        ])}
      />
      <Container>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-faint">
          <Link href="/" className="hover:text-fg">{prod("breadcrumbHome")}</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-fg">{t("title")}</Link>
          <span>/</span>
          <span className="text-fg">{label}</span>
        </nav>

        <header className="mt-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong">
            {t("title")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {label}
          </h1>
          <p className="mt-4 text-lg text-muted">{t("categorySubtitle", { category: label })}</p>
        </header>

        {inCategory.length === 0 ? (
          <p className="py-24 text-center text-muted">{t("categoryEmpty")}</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inCategory.map((article, i) => (
              <Reveal key={article.slug} index={Math.min(i, 6)}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
