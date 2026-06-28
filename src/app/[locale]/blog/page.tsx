import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getArticles } from "@/lib/content/blog.sanity";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ArticleCard } from "@/components/blog/ArticleCard";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildPageMetadata({ locale, path: "/blog", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
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

        <div className="mb-32 mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
