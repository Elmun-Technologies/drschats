import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getArticles } from "@/lib/content/blog.sanity";
import {
  BLOG_CATEGORY_KEYS,
  articlesInCategory,
  isBlogCategoryKey,
  usedCategoryKeys,
} from "@/lib/content/blog-categories";
import { buildPageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { BlogIndex } from "@/components/blog/BlogIndex";

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
  // An empty category is a dead end; the chips never link to one either.
  if (inCategory.length === 0) notFound();
  const label = t(`categories.${slug}`);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: prod("breadcrumbHome"), url: `${SITE_URL}/${locale}` },
          { name: t("title"), url: `${SITE_URL}/${locale}/blog` },
          { name: label, url: `${SITE_URL}/${locale}/blog/category/${slug}` },
        ])}
      />
      <BlogIndex
        locale={locale}
        articles={inCategory}
        categories={usedCategoryKeys(articles)}
        active={slug}
        title={label}
        lead={t("categorySubtitle", { category: label })}
      />
    </>
  );
}
