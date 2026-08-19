import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { ProgramPageData } from "@/lib/content/program-loader";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { formatMoney } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { AddProgramButton } from "./AddProgramButton";
import { cn } from "@/lib/utils";

export async function ProgramTemplate({
  data,
  locale,
}: {
  data: ProgramPageData;
  locale: Locale;
}) {
  const t = await getTranslations("programs");
  const prod = await getTranslations("product");
  const { program, products, ingredients, topics, pricing, reviewer } = data;

  return (
    <div className="pt-8 pb-6">
      <Container>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-faint">
          <Link href="/" className="hover:text-fg">
            {prod("breadcrumbHome")}
          </Link>
          <span>/</span>
          <Link href="/programs" className="hover:text-fg">
            {t("plural")}
          </Link>
          <span>/</span>
          <span className="text-fg">{program.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent-strong">
                {t("duration", { days: program.durationDays })}
              </span>
              {program.discountPercent > 0 && (
                <span className="rounded-full bg-blue px-3 py-1 text-xs font-bold text-white">
                  −{program.discountPercent}%
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              {program.name}
            </h1>
            <p className="mt-4 text-lg text-muted">{program.headline}</p>
            <p className="mt-5 text-muted">{program.intro}</p>

            {reviewer && (
              <div className="mt-6">
                <ReviewedBy expert={reviewer} />
              </div>
            )}

            {program.forWhom.length > 0 && (
              <section aria-labelledby="program-for" className="mt-10">
                <h2 id="program-for" className="font-display text-xl font-bold tracking-tight">
                  {t("forWhom")}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {program.forWhom.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm font-medium text-fg">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <svg viewBox="0 0 20 20" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </header>

          {/* Price panel — sticky so the bundle price follows the reader. */}
          <aside className="rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
            <p className="text-sm text-muted">{t("bundlePrice")}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-extrabold text-accent-strong">
                {formatMoney(pricing.total, locale)}
              </span>
              {pricing.saved > 0 && (
                <span className="text-base text-faint line-through">
                  {formatMoney(pricing.subtotal, locale)}
                </span>
              )}
            </div>
            {pricing.saved > 0 && (
              <p className="mt-1 text-sm font-medium text-accent-strong">
                {t("youSave", { amount: formatMoney(pricing.saved, locale) })}
              </p>
            )}
            <p className="mt-4 text-sm text-muted">
              {t("includes", { count: products.length, days: program.durationDays })}
            </p>
            <AddProgramButton
              slug={program.slug}
              products={products}
              discountPercent={program.discountPercent}
              className="mt-5 w-full"
            />
            <p className="mt-3 text-xs text-faint">{t("cancelNote")}</p>
          </aside>
        </div>

        {products.length > 0 && (
          <section aria-labelledby="program-products" className="mt-20">
            <h2 id="program-products" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("whatsInside")}
            </h2>
            <div
              className={cn(
                "mt-6 grid grid-cols-2 gap-4",
                products.length >= 4 ? "lg:grid-cols-4" : products.length === 3 ? "lg:grid-cols-3" : "sm:max-w-xl lg:grid-cols-2",
              )}
            >
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {program.steps.length > 0 && (
          <section aria-labelledby="program-steps" className="mt-20">
            <h2 id="program-steps" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("howItWorks")}
            </h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {program.steps.map((step, i) => (
                <Reveal key={step.title} index={Math.min(i, 4)} as="li" className="h-full">
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent-strong">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </section>
        )}

        {ingredients.length > 0 && (
          <section aria-labelledby="program-nutrients" className="mt-20">
            <h2 id="program-nutrients" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("keyNutrients")}
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

        {program.faq.length > 0 && (
          <section aria-labelledby="program-faq" className="mt-20 max-w-3xl">
            <h2 id="program-faq" className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {prod("faq")}
            </h2>
            <FaqAccordion items={program.faq} />
          </section>
        )}

        {topics.length > 0 && (
          <section aria-labelledby="program-topics" className="mt-20">
            <h2 id="program-topics" className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("readMore")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`${TOPIC_BASE_PATH[topic.kind]}/${topic.slug}`}
                  className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent-strong"
                >
                  {topic.name}
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
