import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import type { Product, Review } from "@/lib/shopflow/types";
import { getCustomerStories, toYouTubeEmbed } from "@/lib/content/stories.sanity";
import type { CustomerStory } from "@/lib/content/stories.sanity";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { StarRating } from "@/components/ui/StarRating";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { buttonVariants } from "@/components/ui/Button";

export const revalidate = 3600;

const MAX_PRODUCT_REVIEWS = 24;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  return buildPageMetadata({
    locale,
    path: "/reviews",
    title: `${t("title")} — ${SITE_NAME}`,
    description: t("subtitle"),
  });
}

interface ProductReview extends Review {
  product: Product;
}

/** Every product review in one place, newest first. */
function collectProductReviews(products: Product[]): ProductReview[] {
  return products
    .flatMap((product) => product.reviews.map((review) => ({ ...review, product })))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, MAX_PRODUCT_REVIEWS);
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, pool, stories] = await Promise.all([
    getTranslations("reviews"),
    shopflow.getProducts({ locale, pageSize: 100 }),
    getCustomerStories(locale),
  ]);

  const productReviews = collectProductReviews(pool.items);
  const rated = pool.items.filter((p) => p.rating > 0);
  const average =
    rated.length > 0 ? rated.reduce((sum, p) => sum + p.rating, 0) / rated.length : 0;
  const totalReviews = pool.items.reduce((sum, p) => sum + (p.reviewCount || 0), 0);

  return (
    <div className="pt-10 pb-6">
      <Container>
        <header className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>

          {average > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
              <span className="font-display text-3xl font-extrabold text-fg">
                {average.toFixed(1)}
              </span>
              <StarRating rating={average} />
              {totalReviews > 0 && (
                <span className="text-sm text-muted">{t("basedOn", { count: totalReviews })}</span>
              )}
            </div>
          )}
        </header>

        {stories.length > 0 && (
          <section aria-labelledby="stories" className="mt-16">
            <h2 id="stories" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("storiesTitle")}
            </h2>
            <ul className="mt-6 grid gap-6 lg:grid-cols-2">
              {stories.map((story, i) => (
                <Reveal key={story.slug} index={Math.min(i, 4)} as="li" className="h-full">
                  <StoryCard story={story} kindLabel={t(`kind.${story.kind}`)} />
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="product-reviews" className="mt-16">
          <h2 id="product-reviews" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("productReviewsTitle")}
          </h2>

          {productReviews.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-line bg-surface p-10 text-center">
              <p className="text-muted">{t("empty")}</p>
              <Link href="/products" className={`${buttonVariants("secondary")} mt-6`}>
                {t("browse")}
              </Link>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productReviews.map((review, i) => (
                <Reveal key={`${review.product.slug}-${review.author}-${i}`} index={Math.min(i, 6)} as="li" className="h-full">
                  <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6">
                    <div className="flex items-center justify-between gap-3">
                      <StarRating rating={review.rating} />
                      {review.date && <time className="text-xs text-faint">{review.date}</time>}
                    </div>
                    <blockquote className="mt-4 flex-1 text-muted">
                      &ldquo;{review.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 border-t border-line pt-3">
                      <span className="block text-sm font-medium text-fg">{review.author}</span>
                      <Link
                        href={`/product/${review.product.slug}`}
                        className="mt-1 block text-xs text-accent-strong hover:underline"
                      >
                        {review.product.name}
                      </Link>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-16">
          <Disclaimer variant="product" />
        </div>
      </Container>
    </div>
  );
}

function StoryCard({ story, kindLabel }: { story: CustomerStory; kindLabel: string }) {
  const embed = story.videoUrl ? toYouTubeEmbed(story.videoUrl) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      {embed && (
        <div className="relative aspect-video w-full bg-surface-2">
          <iframe
            src={embed}
            title={story.author}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      )}

      {!embed && story.beforeImage && story.afterImage && (
        <div className="grid grid-cols-2 gap-px bg-line">
          {[story.beforeImage, story.afterImage].map((src, i) => (
            <div key={src} className="relative aspect-square bg-surface-2">
              <Image src={src} alt="" fill sizes="(max-width: 1024px) 50vw, 300px" className="object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-semibold text-fg">
                {i === 0 ? "1" : "2"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-strong">
          {kindLabel}
        </span>
        {story.rating != null && <StarRating rating={story.rating} className="mt-3" />}
        <blockquote className="mt-3 flex-1 text-muted">&ldquo;{story.quote}&rdquo;</blockquote>
        <figcaption className="mt-4 border-t border-line pt-3 text-sm font-medium text-fg">
          {story.author}
          {story.city && <span className="text-muted"> — {story.city}</span>}
        </figcaption>
      </div>
    </article>
  );
}
