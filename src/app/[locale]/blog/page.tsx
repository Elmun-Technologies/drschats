import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getArticles } from "@/lib/content/blog.sanity";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/lib/i18n/navigation";

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

  const [featured, ...rest] = articles;

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

        {/* Featured article */}
        {featured && (
          <Reveal className="mt-14">
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-line-strong md:grid-cols-[1.4fr_1fr]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-2 md:aspect-auto md:min-h-[420px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(max-width:768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute left-5 top-5">
                  <Badge tone="accent">{featured.category}</Badge>
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <p className="text-xs text-faint">{t("minRead", { min: featured.readingMinutes })}</p>
                <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-fg transition-colors group-hover:text-accent sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 line-clamp-3 text-muted">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  {t("readMore")} →
                </span>
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
