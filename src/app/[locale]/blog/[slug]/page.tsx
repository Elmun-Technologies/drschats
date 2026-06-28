import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { getArticle, listArticleSlugs } from "@/lib/content/blog.sanity";
import { shopflow } from "@/lib/shopflow";
import type { Product } from "@/lib/shopflow/types";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, articleGraph, breadcrumbLd } from "@/lib/seo/jsonld";
import { reviewerForKey } from "@/lib/content/experts.sanity";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/animation/Reveal";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listArticleSlugs();
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
  const article = await getArticle(slug, locale);
  if (!article) return {};
  return buildPageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: `${article.title} — Alimkhanov`,
    description: article.excerpt,
    image: article.image,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticle(slug, locale);
  if (!article) notFound();

  const [t, related, reviewer, author] = await Promise.all([
    getTranslations("blog"),
    Promise.all(article.relatedProductSlugs.map((s) => shopflow.getProduct(s, locale))),
    reviewerForKey(slug, locale),
    reviewerForKey(`${slug}-author`, locale),
  ]);
  const relatedProducts = related.filter((p): p is Product => p !== null);
  const url = `${SITE_URL}/${locale}/blog/${slug}`;

  return (
    <article className="pt-10">
      <JsonLd
        data={articleGraph({
          title: article.title,
          description: article.excerpt,
          image: article.image,
          url,
          datePublished: article.date,
          dateModified: article.date,
          locale,
          author,
          reviewer,
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: t("title"), url: `${SITE_URL}/${locale}/blog` },
          { name: article.title, url },
        ])}
      />

      {/* Hero */}
      <Container size="narrow">
        <Link href="/blog" className="text-sm text-muted hover:text-accent">
          ← {t("backToBlog")}
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge tone="accent">{article.category}</Badge>
          <span className="text-sm text-faint">{t("minRead", { min: article.readingMinutes })}</span>
          {article.date && (
            <time className="text-sm text-faint" dateTime={article.date}>
              {new Date(article.date).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
            </time>
          )}
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 text-xl text-muted">{article.excerpt}</p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <ReviewedBy expert={reviewer} />
        </div>
      </Container>

      <Container size="narrow" className="mt-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-surface-2">
          <Image src={article.image} alt={article.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>
      </Container>

      {/* Body */}
      <Container size="narrow" className="py-16">
        <div className="space-y-12">
          {article.sections.map((section, i) => (
            <Reveal key={i} index={i}>
              <section>
                <h2 className="font-display text-2xl font-semibold tracking-tight">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((p, j) => (
                    <p key={j} className="text-lg leading-relaxed text-muted">{p}</p>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
        <Disclaimer variant="article" className="mt-12" />
      </Container>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-line py-20">
          <Container>
            <h2 className="mb-10 font-display text-3xl font-bold tracking-tight">{t("relatedProducts")}</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </article>
  );
}
