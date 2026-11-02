import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { HealthTopic } from "@/lib/content/health-topics";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import { isNavigable, populatedTopicPaths } from "@/lib/content/nav-sections";
import type { Ingredient } from "@/lib/content/ingredients.sanity";
import type { Expert } from "@/lib/content/experts.sanity";
import type { Product } from "@/lib/shopflow/types";
import { shopflow } from "@/lib/shopflow";
import { isStocked } from "@/lib/shop/categories";
import { Link } from "@/lib/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { chipClass } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import { ingredientTopicSlug } from "./topic-links";

/** Products shown right under the intro; the rest follow the article. */
const LEAD_PRODUCTS = 4;
const MAX_PRODUCTS = 8;

const H2 = "text-[22px] font-bold leading-7 lg:text-h-section";

/*
  A goal, symptom or vitamin page (27 of them), on V3 tokens: `wrap`, the
  28/36 page title, 20px cards, chips. What someone came for comes first —
  the products for this topic sit right under the intro, with the topic's own
  catalogue shelf and the quiz one tap away; the article follows.
*/
export async function HealthTopicTemplate({
  topic,
  products,
  ingredients,
  related,
  reviewer,
  locale,
}: {
  topic: HealthTopic;
  products: Product[];
  ingredients: Ingredient[];
  related: HealthTopic[];
  reviewer?: Expert | null;
  locale: Locale;
}) {
  const t = await getTranslations("health");
  const prod = await getTranslations("product");
  const quiz = await getTranslations("shop.v3");
  const [populatedPaths, categories, vitamins] = await Promise.all([
    populatedTopicPaths(),
    shopflow.getCategories(locale).catch(() => []),
    getHealthTopics(locale, "vitamin").catch(() => []),
  ]);

  const shown = products.slice(0, MAX_PRODUCTS);
  const lead = shown.slice(0, LEAD_PRODUCTS);
  const more = shown.slice(LEAD_PRODUCTS);
  // The topic's own shelf, not the whole catalogue — when it exists and has something on it.
  const shelf = topic.categorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .find((c) => c && isStocked(c));
  const vitaminSlugs = new Set(vitamins.map((v) => v.slug));
  const vitaminHref = (ing: Ingredient) => {
    const slug = ingredientTopicSlug(ing.slug);
    return vitaminSlugs.has(slug) && !(topic.kind === "vitamin" && topic.slug === slug) ? `${TOPIC_BASE_PATH.vitamin}/${slug}` : null;
  };

  const quizTile = (
    <Link href="/quiz" className="flex flex-col gap-2 rounded-[20px] bg-tile p-5 transition-colors hover:bg-tile-hover lg:p-6">
      <span className="text-[17px] font-bold leading-[22px]">{quiz("quizTitle")}</span>
      <span className="text-[15px] leading-[22px] text-ink-2">{quiz("quizText")}</span>
      <span className="mt-1 inline-flex items-center gap-1.5 text-[15px] font-semibold">
        {quiz("quizCta")}
        <Arrow />
      </span>
    </Link>
  );

  return (
    <div className="wrap flex flex-col gap-8 pb-9 pt-1 lg:gap-14 lg:pb-[72px] lg:pt-5">
      <div className="flex flex-col gap-3 lg:gap-5">
        <nav aria-label={prod("breadcrumb")} className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted lg:text-sm">
          <Link href="/" className="inline-flex min-h-6 items-center hover:text-ink">{prod("breadcrumbHome")}</Link>
          <span aria-hidden>/</span>
          <Link href={TOPIC_BASE_PATH[topic.kind]} className="inline-flex min-h-6 items-center hover:text-ink">
            {t(`${topic.kind}.plural`)}
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-ink">{topic.name}</span>
        </nav>

        <header className="flex max-w-[820px] flex-col gap-2 lg:gap-3">
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted lg:text-sm">{t(`${topic.kind}.singular`)}</span>
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page">{topic.name}</h1>
          <p className="text-[17px] font-semibold leading-[24px] text-ink lg:text-[19px] lg:leading-[28px]">{topic.headline}</p>
          <p className="text-[15px] leading-[22px] text-ink-2 lg:text-lead">{topic.intro}</p>
        </header>

        {reviewer && <ReviewedBy expert={reviewer} />}
      </div>

      {lead.length > 0 && (
        <section aria-labelledby="topic-products" className="flex flex-col gap-3.5 lg:gap-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 id="topic-products" className={H2}>{t("relatedProducts")}</h2>
            <Link
              href={shelf ? `/products/${shelf.slug}` : "/products"}
              className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold hover:underline lg:text-base"
            >
              {shelf ? t("shelfLink", { name: shelf.name }) : t("topicIndex.viewProducts")}
              <Arrow />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-3 md:gap-x-3 md:gap-y-6 xl:grid-cols-4">
            {lead.map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {topic.bullets.length > 0 && (
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
          {topic.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 rounded-[20px] bg-tile p-4 text-[15px] font-medium leading-[22px] lg:p-5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg">
                <svg viewBox="0 0 20 20" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {b}
            </li>
          ))}
        </ul>
      )}

      <div className={cn("grid gap-8", topic.sections.length > 0 && "lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12")}>
        {topic.sections.length > 0 && (
          <article className="flex max-w-[820px] flex-col gap-8">
            {topic.sections.map((section) => (
              <section key={section.title} className="flex flex-col gap-2.5">
                <h2 className={H2}>{section.title}</h2>
                <p className="text-[15px] leading-[22px] text-ink-2 lg:text-lead">{section.body}</p>
              </section>
            ))}
          </article>
        )}

        <aside className={cn("flex flex-col gap-4", topic.sections.length > 0 ? "lg:sticky lg:top-[calc(var(--header-sticky)+16px)]" : "lg:max-w-[820px]")}>
          {ingredients.length > 0 && (
            <div className="flex flex-col gap-4 rounded-[20px] border border-line p-5 lg:p-6">
              <h2 className="text-title font-bold">{t("keyIngredients")}</h2>
              <ul className="flex flex-col gap-4">
                {ingredients.map((ing) => {
                  const href = vitaminHref(ing);
                  return (
                    <li key={ing.slug} className="flex flex-col gap-0.5">
                      {href ? (
                        <Link href={href} className="inline-flex min-h-6 items-center self-start text-[15px] font-semibold underline-offset-2 hover:underline">
                          {ing.name}
                        </Link>
                      ) : (
                        <span className="text-[15px] font-semibold">{ing.name}</span>
                      )}
                      <span className="text-[13px] font-semibold text-muted">{ing.role}</span>
                      <span className="text-sm leading-5 text-ink-2">{ing.description}</span>
                    </li>
                  );
                })}
              </ul>
              {/* Dropped while the vitamin family has no pages — an "all vitamins"
                  link into an empty index is worse than no link. */}
              {topic.kind !== "vitamin" && isNavigable("/vitamins", populatedPaths) && (
                <Link href="/vitamins" className="inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-semibold hover:underline">
                  {t("allVitamins")}
                  <Arrow />
                </Link>
              )}
            </div>
          )}
          {quizTile}
        </aside>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="topic-more" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="topic-more" className={H2}>{t("moreProducts")}</h2>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-3 md:gap-x-3 md:gap-y-6 xl:grid-cols-4">
            {more.map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard product={p} index={LEAD_PRODUCTS + i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {topic.faq.length > 0 && (
        <section aria-labelledby="topic-faq" className="flex max-w-[820px] flex-col gap-3.5 lg:gap-6">
          <h2 id="topic-faq" className={H2}>{prod("faq")}</h2>
          <FaqAccordion items={topic.faq} />
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="topic-related" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="topic-related" className={H2}>{t("relatedTopics")}</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r.slug} href={`${TOPIC_BASE_PATH[r.kind]}/${r.slug}`} className={chipClass()}>
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Disclaimer variant="product" />
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
