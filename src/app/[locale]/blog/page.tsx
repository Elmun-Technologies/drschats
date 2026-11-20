import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getArticles } from "@/lib/content/blog.sanity";
import { usedCategoryKeys } from "@/lib/content/blog-categories";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { staticPageMetadata } from "@/lib/seo/page-meta";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbLd, itemListLd } from "@/lib/seo/jsonld";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "blog", "/blog");
}

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const articles = await getArticles(locale);
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: t("title"), url: `${SITE_URL}/${locale}/blog` }])} />
      <JsonLd data={itemListLd(t("title"), articles.map((a) => ({ name: a.title, description: a.excerpt })))} />
      <BlogIndex
        locale={locale}
        articles={articles}
        categories={usedCategoryKeys(articles)}
        title={t("title")}
        lead={t("subtitle")}
      />
    </>
  );
}
