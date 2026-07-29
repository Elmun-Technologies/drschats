import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { HealthTopic } from "@/lib/content/health-topics";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import type { Ingredient } from "@/lib/content/ingredients.sanity";
import type { Expert } from "@/lib/content/experts.sanity";
import type { Product } from "@/lib/shopflow/types";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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
  reviewer?: Expert;
  locale: Locale;
}) {
  const t = await getTranslations("health");
  const nav = await getTranslations("nav");
  const prod = await getTranslations("product");
  const shown = products.slice(0, 8);

  return (
    <div className="pt-8 pb-6">
      <Container>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-faint">
          <Link href="/" className="hover:text-fg">
            {prod("breadcrumbHome")}
          </Link>
          <span>/</span>
          <Link href={TOPIC_BASE_PATH[topic.kind]} className="hover:text-fg">
            {t(`${topic.kind}.plural`)}
          </Link>
          <span>/</span>
          <span className="text-fg">{topic.name}</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong">
            {t(`${topic.kind}.singular`)}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {topic.name}
          </h1>
          <p className="mt-4 text-lg text-muted">{topic.headline}</p>
          <p className="mt-5 text-muted">{topic.intro}</p>
        </header>

        {reviewer && (
          <div className="mt-6">
            <ReviewedBy expert={reviewer} />
          </div>
        )}

        {topic.bullets.length > 0 && (
          <Reveal className="mt-10">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topic.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-xl border border-line bg-surface p-5 text-sm font-medium text-fg"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <svg viewBox="0 0 20 20" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {topic.sections.length > 0 && (
          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <article className="space-y-10">
              {topic.sections.map((section) => (
                <Reveal key={section.title}>
                  <section>
                    <h2 className="font-display text-2xl font-bold tracking-tight">{section.title}</h2>
                    <p className="mt-3 text-muted">{section.body}</p>
                  </section>
                </Reveal>
              ))}
            </article>

            {ingredients.length > 0 && (
              <aside className="rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
                <h2 className="font-display text-lg font-bold">{t("keyIngredients")}</h2>
                <ul className="mt-4 space-y-4">
                  {ingredients.map((ing) => (
                    <li key={ing.slug}>
                      <p className="text-sm font-semibold text-fg">{ing.name}</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-accent-strong">{ing.role}</p>
                      <p className="mt-1 text-sm text-muted">{ing.description}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/vitamins" className="mt-5 inline-flex text-sm font-semibold text-accent-strong hover:underline">
                  {t("allVitamins")} →
                </Link>
              </aside>
            )}
          </div>
        )}

        {products.length > 0 && (
          <section aria-labelledby="topic-products" className="mt-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 id="topic-products" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {t("relatedProducts")}
              </h2>
              <Link href="/products" className={buttonVariants("secondary")}>
                {nav("shop")}
              </Link>
            </div>
            {/* A topic can match a single product; a fixed 4-up grid would
                leave three empty columns, so the track follows the count. */}
            <div
              className={cn(
                "grid grid-cols-2 gap-4",
                shown.length >= 4 ? "lg:grid-cols-4" : shown.length === 3 ? "lg:grid-cols-3" : "sm:max-w-xl lg:grid-cols-2",
              )}
            >
              {shown.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {topic.faq.length > 0 && (
          <section aria-labelledby="topic-faq" className="mt-20 max-w-3xl">
            <h2 id="topic-faq" className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {prod("faq")}
            </h2>
            <FaqAccordion items={topic.faq} />
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="topic-related" className="mt-20">
            <h2 id="topic-related" className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("relatedTopics")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`${TOPIC_BASE_PATH[r.kind]}/${r.slug}`}
                  className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent-strong"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16">
          <Disclaimer variant="product" />
        </div>
      </Container>
    </div>
  );
}
