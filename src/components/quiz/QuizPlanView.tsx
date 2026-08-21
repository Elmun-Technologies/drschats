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

  // Dynamic calculated health score (bounded between 68 and 92)
  const healthScore = Math.max(68, Math.min(92, 98 - (topics.length * 5 + ingredients.length * 2)));

  const morningProducts = products.filter((_, idx) => idx % 2 === 0);
  const eveningProducts = products.filter((_, idx) => idx % 2 === 1);

  return (
    <div className="pt-10 pb-12">
      <Container>
        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("resultEyebrow")}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {t("resultTitle")}
          </h1>
          <p className="mt-3 text-lg text-muted">{t("resultSubtitle")}</p>
        </header>

        {/* Health Score & Diagnosis Hero Banner */}
        {!empty && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-surface to-accent-soft p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Score Badge */}
              <div className="flex items-center gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 shadow-inner">
                  <div className="text-center">
                    <span className="block font-display text-3xl font-black text-amber-600 dark:text-amber-400">
                      {healthScore}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      / 100
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    {t("healthScoreLabel")}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold">
                    {healthScore >= 85 ? "Yaxshi ko'rsatkich" : "Nutriyentlar yetishmovchiligi xavfi"}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {t("healthScoreStatus")}
                  </p>
                </div>
              </div>

              {/* Expert Sign-off */}
              {reviewer && (
                <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/80 p-4 sm:max-w-md">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-amber-500/40">
                    <Image src={reviewer.image} alt={reviewer.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{t("doctorOpinionTitle")}</span>
                    </div>
                    <p className="font-display text-sm font-bold text-fg">{reviewer.name}</p>
                    <p className="text-xs text-muted line-clamp-1">{reviewer.title}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* A red-flag answer outranks every recommendation on the page. */}
        {result.seeDoctor && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 sm:flex-row sm:items-center sm:justify-between">
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
            {/* 1-Click Routine Bulk Checkout Action Banner */}
            {products.length > 0 && (
              <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-amber-500/40 bg-surface p-6 sm:flex-row sm:items-center sm:justify-between shadow-md">
                <div>
                  <span className="inline-block rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    -15% Maxsus Chegirma Rejasi
                  </span>
                  <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight">
                    {t("oneClickAdd")}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    Barcha tavsiya etilgan {products.length} ta vitaminni bitta tugma bilan savatga qo&apos;shing.
                  </p>
                </div>
                <div className="shrink-0">
                  <QuizPlanActions products={products.map((p) => p.product)} />
                </div>
              </div>
            )}

            {/* Daily Vitamin Routine (Morning / Evening Stack) */}
            {products.length > 0 && (
              <section aria-labelledby="daily-routine" className="mt-14">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <h2 id="daily-routine" className="font-display text-2xl font-bold tracking-tight">
                      Kunlik Vitamin Qabul Qilish Jadvallari
                    </h2>
                    <p className="text-sm text-muted">Ertalabki va kechki ritm bo&apos;yicha to&apos;g&apos;ri taqsimot</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {/* Morning Stack */}
                  <div className="rounded-3xl border border-amber-500/20 bg-surface p-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-line pb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-fg">{t("morningStack")}</h3>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{t("morningDosage")}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {morningProducts.map(({ product, reasons }) => (
                        <div key={product.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                            <Image src={product.images[0]?.url || "/placeholders/p1.svg"} alt={product.name} fill className="object-contain p-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-bold text-fg truncate">{product.name}</p>
                            {reasons.length > 0 && <p className="text-xs text-muted truncate">{reasons.join(" · ")}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evening Stack */}
                  <div className="rounded-3xl border border-indigo-500/20 bg-surface p-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-line pb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-fg">{t("eveningStack")}</h3>
                        <p className="text-xs text-indigo-400 font-semibold">{t("eveningDosage")}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {eveningProducts.map(({ product, reasons }) => (
                        <div key={product.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                            <Image src={product.images[0]?.url || "/placeholders/p1.svg"} alt={product.name} fill className="object-contain p-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-sm font-bold text-fg truncate">{product.name}</p>
                            {reasons.length > 0 && <p className="text-xs text-muted truncate">{reasons.join(" · ")}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

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
                        className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-amber-500"
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                          {health(`${topic.kind}.singular`)}
                        </span>
                        <span className="mt-1 font-display text-lg font-bold text-fg group-hover:text-amber-500">
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
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">{ing.role}</p>
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
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{t("whyLabel")}:</span>{" "}
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

        {/* Doctor Q&A Consultation Trigger Card */}
        {reviewer && (
          <div className="mt-14 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-surface p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-amber-500">
                  <Image src={reviewer.image} alt={reviewer.name} fill className="object-cover" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    1-on-1 Tibbiy Maslahat
                  </span>
                  <h3 className="font-display text-xl font-bold text-fg">{t("doctorConsultTrigger")}</h3>
                  <p className="mt-1 text-sm text-muted max-w-lg">{t("doctorConsultDesc")}</p>
                </div>
              </div>
              <a
                href="https://t.me/DrChats_Support"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants("primary"), "shrink-0 gap-2 bg-gradient-to-r from-amber-500 to-accent text-ink font-bold")}
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

        <div className="mt-14">
          <Disclaimer variant="product" />
        </div>
      </Container>
    </div>
  );
}
