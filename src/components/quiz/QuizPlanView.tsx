import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { QuizPlan } from "@/lib/quiz/recommend";
import type { Expert } from "@/lib/content/experts.sanity";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ProductCard } from "@/components/product/ProductCard";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { buttonVariants } from "@/components/ui/Button";
import { QuizPlanActions } from "./QuizPlanActions";
import { cn } from "@/lib/utils";

export async function QuizPlanView({
  plan,
  reviewer,
  locale,
}: {
  plan: QuizPlan;
  reviewer?: Expert;
  locale: Locale;
}) {
  const t = await getTranslations("quiz");
  const health = await getTranslations("health");
  const { result, topics, ingredients, products } = plan;

  const empty = products.length === 0 && topics.length === 0;

  return (
    <div className="pt-10 pb-6">
      <Container>
        <header className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong">
            {t("resultEyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {t("resultTitle")}
          </h1>
          <p className="mt-4 text-lg text-muted">{t("resultSubtitle")}</p>
        </header>

        {/* A red-flag answer outranks every recommendation on the page. */}
        {result.seeDoctor && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-gold/40 bg-gold/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-display text-lg font-bold text-fg">{t("doctorTitle")}</p>
              <p className="mt-1 text-sm text-muted">{t("doctorBody")}</p>
            </div>
            <Link href="/experts" className={cn(buttonVariants("primary"), "shrink-0")}>
              {t("doctorCta")}
            </Link>
          </div>
        )}

        {empty ? (
          <div className="mt-12 rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-muted">{t("resultEmpty")}</p>
            <Link href="/quiz" className={cn(buttonVariants("secondary"), "mt-6")}>
              {t("retake")}
            </Link>
          </div>
        ) : (
          <>
            {topics.length > 0 && (
              <section aria-labelledby="plan-focus" className="mt-14">
                <h2 id="plan-focus" className="font-display text-2xl font-bold tracking-tight">
                  {t("focusTitle")}
                </h2>
                <p className="mt-2 text-muted">{t("focusSubtitle")}</p>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {topics.map((topic, i) => (
                    <Reveal key={topic.slug} index={Math.min(i, 4)} as="li" className="h-full">
                      <Link
                        href={`${TOPIC_BASE_PATH[topic.kind]}/${topic.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent-strong">
                          {health(`${topic.kind}.singular`)}
                        </span>
                        <span className="mt-1 font-display text-lg font-bold text-fg group-hover:text-accent-strong">
                          {topic.name}
                        </span>
                        <span className="mt-2 line-clamp-3 text-sm text-muted">{topic.headline}</span>
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              </section>
            )}

            {ingredients.length > 0 && (
              <section aria-labelledby="plan-nutrients" className="mt-14">
                <h2 id="plan-nutrients" className="font-display text-2xl font-bold tracking-tight">
                  {t("nutrientsTitle")}
                </h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ingredients.map((ing) => (
                    <li key={ing.slug} className="rounded-2xl border border-line bg-surface p-5">
                      <p className="font-display text-base font-bold text-fg">{ing.name}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">{ing.role}</p>
                      <p className="mt-2 text-sm text-muted">{ing.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {products.length > 0 && (
              <section aria-labelledby="plan-products" className="mt-14">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 id="plan-products" className="font-display text-2xl font-bold tracking-tight">
                      {t("productsTitle")}
                    </h2>
                    <p className="mt-2 text-muted">{t("productsSubtitle")}</p>
                  </div>
                  <QuizPlanActions products={products.map((p) => p.product)} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {products.map(({ product, reasons }, i) => (
                    <div key={product.id} className="flex flex-col gap-2">
                      <ProductCard product={product} index={i} />
                      {reasons.length > 0 && (
                        <p className="px-1 text-xs text-faint">
                          <span className="font-semibold text-accent-strong">{t("whyLabel")}:</span>{" "}
                          {reasons.join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {reviewer && (
          <div className="mt-14">
            <p className="mb-3 text-sm text-muted">{t("reviewedNote")}</p>
            <ReviewedBy expert={reviewer} />
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/quiz" className={buttonVariants("secondary")}>
            {t("retake")}
          </Link>
          <Link href="/products" className={buttonVariants("secondary")}>
            {t("browseAll")}
          </Link>
        </div>

        <div className="mt-14">
          <Disclaimer variant="product" />
        </div>
      </Container>
    </div>
  );
}
