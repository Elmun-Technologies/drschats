import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { QuizPlan } from "@/lib/quiz/recommend";
import type { Expert } from "@/lib/content/experts.sanity";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ProductCard } from "@/components/product/ProductCard";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { buttonVariants } from "@/components/ui/Button";
import { QuizPlanActions } from "./QuizPlanActions";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

/*
  The quiz result.

  Two things used to sit on this page that the shop had no right to print:

  1. A "health score" out of 100. It was arithmetic on the visitor's own
     answers — `98 − topics × 5 − ingredients × 2`, clamped to 68–92 so it
     never looked extreme — with the verdict switched between "Yaxshi
     ko'rsatkich" and "Nutriyentlar yetishmovchiligi xavfi". Neither the
     number nor the deficiency warning came from a doctor, a test or any
     measurement; the "-15% Maxsus Chegirma Rejasi" badge on the same page
     gave the whole thing away as a discount hook dressed as a diagnosis.

  2. A morning/evening dosing plan. The split was `idx % 2` over the product
     array — every other product was assigned to evening, in list order, with
     "1 tablet after food" printed beside it. That is dosing advice invented by
     an array index.

  Both are gone. What is left is what the shop can defend: the questions the
  visitor answered, the topics and nutrients those answers point at, and the
  products, each with the reason it was surfaced. Product instructions live on
  the product page, where the manufacturer's own text is.
*/
export async function QuizPlanView({
  plan,
  reviewer,
  locale,
}: {
  plan: QuizPlan;
  reviewer?: Expert | null;
  locale: Locale;
}) {
  const t = await getTranslations("quiz");
  const health = await getTranslations("health");
  const { result, topics, ingredients, products } = plan;

  const empty = products.length === 0 && topics.length === 0;

  return (
    <div className="pt-10 pb-12">
      <Container>
        <header className="max-w-3xl">
          {/* Trust colour, not gold: this badge is about the process, not a price. */}
          <div className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal-soft px-4 py-1.5 text-xs font-semibold text-signal">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("resultEyebrow")}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {t("resultTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-legacy-muted text-pretty">{t("resultSubtitle")}</p>
        </header>

        {/* Renders only when a verified expert is on file. See lib/content/experts. */}
        {reviewer && (
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-signal/25 bg-signal-soft/60 p-4 sm:max-w-md">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-signal/30">
              <Image src={reviewer.image} alt={reviewer.name} fill sizes="56px" className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-signal">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{t("doctorOpinionTitle")}</span>
              </div>
              <p className="font-display text-sm font-bold text-fg">{reviewer.name}</p>
              <p className="line-clamp-1 text-xs text-legacy-muted">{reviewer.title}</p>
            </div>
          </div>
        )}

        {/* A red-flag answer outranks every recommendation on the page. This is
            advice to stop and see a human, so it wears the health colour, not
            the discount colour. */}
        {result.seeDoctor && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-signal/30 bg-signal-soft p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-display text-lg font-bold text-fg">{t("doctorTitle")}</p>
              <p className="mt-1 text-sm text-legacy-muted text-pretty">{t("doctorBody")}</p>
            </div>
            <Link href="/experts" className={cn(buttonVariants("secondary"), "shrink-0")}>
              {t("doctorCta")}
            </Link>
          </div>
        )}

        {empty ? (
          <div className="mt-12 rounded-2xl border border-legacy-line bg-surface p-10 text-center">
            <p className="text-legacy-muted">{t("resultEmpty")}</p>
            <Link href="/quiz" className={cn(buttonVariants("secondary"), "mt-6")}>
              {t("retake")}
            </Link>
          </div>
        ) : (
          <>
            {/* One action for the whole set. Gold belongs here: this button
                puts things in the cart. */}
            {products.length > 0 && (
              <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-legacy-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-extrabold tracking-tight">{t("oneClickAdd", { count: products.length })}
                  </h2>
                  <p className="mt-1 text-sm text-legacy-muted text-pretty">{t("oneClickAddBody", { count: products.length })}</p>
                </div>
                <div className="shrink-0">
                  <QuizPlanActions products={products.map((p) => p.product)} />
                </div>
              </div>
            )}

            {topics.length > 0 && (
              <section aria-labelledby="plan-focus" className="mt-12 sm:mt-14">
                <h2 id="plan-focus" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl sm:text-3xl">{t("focusTitle")}
                </h2>
                <p className="mt-2 text-legacy-muted text-pretty">{t("focusSubtitle")}</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                  {topics.map((topic, i) => (
                    <Reveal key={topic.slug} index={Math.min(i, 4)} as="li" className="h-full">
                      <Link
                        href={`${TOPIC_BASE_PATH[topic.kind]}/${topic.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-legacy-line bg-surface p-5 transition-colors hover:border-legacy-line-strong"
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-legacy-muted">
                          {health(`${topic.kind}.singular`)}
                        </span>
                        <span className="mt-1 font-display text-lg font-bold text-fg group-hover:text-signal">
                          {topic.name}
                        </span>
                        <span className="mt-2 line-clamp-3 text-sm text-legacy-muted">{topic.headline}</span>
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              </section>
            )}

            {ingredients.length > 0 && (
              <section aria-labelledby="plan-nutrients" className="mt-12 sm:mt-14">
                <h2 id="plan-nutrients" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl sm:text-3xl">{t("nutrientsTitle")}
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {ingredients.map((ing) => (
                    <li key={ing.slug} className="rounded-2xl border border-legacy-line bg-surface p-5">
                      <p className="font-display text-base font-bold text-fg">{ing.name}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-signal">{ing.role}</p>
                      <p className="mt-2 text-sm text-legacy-muted">{ing.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {products.length > 0 && (
              <section aria-labelledby="plan-products" className="mt-12 sm:mt-14">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 id="plan-products" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl sm:text-3xl">{t("productsTitle")}
                    </h2>
                    <p className="mt-2 text-legacy-muted">{t("productsSubtitle")}</p>
                  </div>
                  <QuizPlanActions products={products.map((p) => p.product)} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {products.map(({ product, reasons }, i) => (
                    <div key={product.id} className="flex flex-col gap-2">
                      <ProductCard product={product} index={i} />
                      {reasons.length > 0 && (
                        <p className="px-1 text-xs text-legacy-muted">
                          <span className="font-semibold text-fg">{t("whyLabel")}:</span>{" "}
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

        {/*
          The consultation card. It showed a doctor's face and promised a
          "1-on-1 medical consultation" while no doctor was on file. It now
          renders only when a verified expert exists (`reviewer` is null until
          then — see lib/content/experts.ts) and sends the visitor to the public
          Go Vita channel, never the corporate account.
        */}
        {reviewer && (
          <div className="mt-12 rounded-2xl border border-legacy-line bg-surface p-6 sm:mt-14 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-signal/30">
                  <Image src={reviewer.image} alt={reviewer.name} fill sizes="56px" className="object-cover" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-signal">
                    {t("doctorConsultLabel")}
                  </span>
                  <h3 className="font-display text-lg font-bold text-fg">{t("doctorConsultTrigger")}</h3>
                  <p className="mt-1 max-w-lg text-sm text-legacy-muted">{t("doctorConsultDesc")}</p>
                </div>
              </div>
              <a
                href={BRAND.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants("secondary"), "shrink-0 gap-2")}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                {t("doctorConsultCta")}
              </a>
            </div>
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

        <div className="mt-12 sm:mt-14">
          <Disclaimer variant="product" />
        </div>
      </Container>
    </div>
  );
}
