import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { getArticle, getArticles, listArticleSlugs } from "@/lib/content/blog.sanity";
import { shopflow } from "@/lib/shopflow";
import type { Product } from "@/lib/shopflow/types";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, articleGraph, breadcrumbLd } from "@/lib/seo/jsonld";
import { reviewerForKey } from "@/lib/content/experts.sanity";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { Link } from "@/lib/i18n/navigation";
import { productCutout } from "@/lib/content/product-cutouts";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { ShareRow } from "@/components/blog/ShareRow";
import { clampDescription, seoTitle } from "@/lib/seo/page-meta";

export const revalidate = 60;
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
    title: await seoTitle(locale, "blogArticle", { title: article.title }),
    description: clampDescription(article.excerpt),
    image: article.image,
    type: "article",
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

  const [t, tp, related, reviewer, author, all] = await Promise.all([
    getTranslations("blog"),
    getTranslations("pages.v3"),
    Promise.all(article.relatedProductSlugs.map((s) => shopflow.getProduct(s, locale))),
    reviewerForKey(slug, locale),
    reviewerForKey(`${slug}-author`, locale),
    getArticles(locale),
  ]);
  const others = all.filter((a) => a.slug !== slug).slice(0, 2);
  const relatedProducts = related.filter((p): p is Product => p !== null);
  const url = `${SITE_URL}/${locale}/blog/${slug}`;

  return (
    <article>
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

      <div className="wrap flex flex-col gap-8 pb-10 pt-3 lg:gap-12 lg:pb-20 lg:pt-6">
        <nav aria-label={t("title")} className="hidden text-sm text-ink-2 lg:block">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-ink">{tp("nav.home")}</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/blog" className="hover:text-ink">{t("title")}</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="truncate text-ink">{article.title}</li>
          </ol>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-6 lg:max-w-[760px]">
            <header className="flex flex-col gap-3 lg:gap-4">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted">
                <span className="inline-flex h-7 items-center rounded-pill bg-chip-strong px-2.5 font-semibold text-ink">#{article.category}</span>
                {article.date && <time dateTime={article.date}>{formatDate(article.date, locale)}</time>}
                <span>· {t("minRead", { min: article.readingMinutes })}</span>
              </span>
              <h1 className="text-[28px] font-bold leading-[34px] lg:text-[40px] lg:leading-[46px]">{article.title}</h1>
              <p className="text-[17px] leading-[26px] text-ink-2 lg:text-lg lg:leading-7">{article.excerpt}</p>
              {reviewer && <ReviewedBy expert={reviewer} />}
            </header>

            <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] bg-tile">
              <Image src={article.image} alt="" fill priority sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
            </div>

            {article.sections.map((section, i) => (
              <section key={i} className="flex flex-col gap-3">
                <h2 className="text-[22px] font-bold leading-7 lg:text-[26px] lg:leading-8">{section.heading}</h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-base leading-[26px] text-ink-2 lg:text-[17px] lg:leading-7">{p}</p>
                ))}
              </section>
            ))}

            <Disclaimer variant="article" />
            <ShareRow url={url} title={article.title} />
          </div>

          {relatedProducts.length > 0 && (
            <aside aria-labelledby="article-related" className="flex flex-col gap-3 lg:sticky lg:top-[calc(var(--header-sticky)+24px)]">
              <h2 id="article-related" className="text-lg font-bold">{t("relatedProducts")}</h2>
              <ul className="flex flex-col gap-2.5">
                {relatedProducts.map((p) => {
                  const image = productCutout(p.slug) ?? p.images[0]?.url;
                  return (
                    <li key={p.id}>
                      <Link href={`/product/${p.slug}`} className="flex items-center gap-3.5 rounded-[16px] border border-line p-2.5 hover:border-line-strong">
                        <span className="relative h-16 w-16 shrink-0 rounded-[12px] bg-tile">
                          {image && <Image src={image} alt="" fill sizes="64px" className="object-contain p-1.5" />}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-[15px]">{p.name}</span>
                          <span className="text-base font-bold">{formatMoney(p.price, locale)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link href="/products" className={cn(buttonVariants("primary"), "w-full")}>{t("v3.allProducts")}</Link>
            </aside>
          )}
        </div>

        {others.length > 0 && (
          <section aria-labelledby="article-more" className="flex flex-col gap-4 lg:gap-5">
            <div className="flex items-center justify-between gap-4">
              <h2 id="article-more" className="text-[22px] font-bold leading-7 lg:text-[26px]">{t("v3.more")}</h2>
              <Link href="/blog" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold hover:underline">
                {t("backToBlog")}
                <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
            <ul className="grid gap-4 lg:grid-cols-2 lg:gap-8">
              {others.map((a) => (
                <li key={a.slug}>
                  <Link href={`/blog/${a.slug}`} className="group flex items-center gap-4 lg:gap-5">
                    <span className="relative h-24 w-32 shrink-0 overflow-hidden rounded-[16px] bg-tile lg:h-[120px] lg:w-[170px]">
                      <Image src={a.image} alt="" fill sizes="170px" className="object-cover" />
                    </span>
                    <span className="flex flex-col gap-1">
                      {a.date && <time dateTime={a.date} className="text-[13px] text-muted">{formatDate(a.date, locale)}</time>}
                      <span className="text-lg font-bold leading-6 group-hover:underline">{a.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
