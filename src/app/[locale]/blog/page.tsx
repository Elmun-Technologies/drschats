import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getArticles } from "@/lib/content/blog.sanity";
import { usedCategoryKeys } from "@/lib/content/blog-categories";
import { BlogIndex } from "@/components/blog/BlogIndex";

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

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const articles = await getArticles(locale);
  return (
    <BlogIndex
      locale={locale}
      articles={articles}
      categories={usedCategoryKeys(articles)}
      title={t("title")}
      lead={t("subtitle")}
    />
  );
}
