import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { ProgramPageData } from "@/lib/content/program-loader";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { formatMoney } from "@/lib/utils";
import { Link } from "@/lib/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { ReviewedBy } from "@/components/product/ReviewedBy";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { chipClass } from "@/components/ui/Chip";
import { DiscountBadge } from "@/components/ui/Price";
import { AddProgramButton } from "./AddProgramButton";

const H2 = "text-[22px] font-bold leading-7 lg:text-h-section";

/*
  A 30-day programme on V3 tokens. The bundle — its products and the one
  price with «Savatga» — is the first thing on the page; who it is for, how
  it runs and the nutrients follow.
*/
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
    <div className="wrap flex flex-col gap-8 pb-9 pt-1 lg:gap-14 lg:pb-[72px] lg:pt-5">
      <div className="flex flex-col gap-3 lg:gap-5">
        <nav aria-label={prod("breadcrumb")} className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted lg:text-sm">
          <Link href="/" className="inline-flex min-h-6 items-center hover:text-ink">{prod("breadcrumbHome")}</Link>
          <span aria-hidden>/</span>
          <Link href="/programs" className="inline-flex min-h-6 items-center hover:text-ink">{t("plural")}</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-ink">{program.name}</span>
        </nav>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
          <header className="flex flex-col gap-2 lg:gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-pill bg-tile px-2.5 text-[13px] font-semibold">
                {t("duration", { days: program.durationDays })}
              </span>
              <DiscountBadge percent={program.discountPercent} />
            </div>
            <h1 className="text-[28px] font-bold leading-[34px] lg:text-h-page">{program.name}</h1>
            <p className="text-[17px] font-semibold leading-[24px] lg:text-[19px] lg:leading-[28px]">{program.headline}</p>
            <p className="text-[15px] leading-[22px] text-ink-2 lg:text-lead">{program.intro}</p>
            {reviewer && <ReviewedBy expert={reviewer} />}
          </header>

          {/* Price panel — sticky so the bundle price follows the reader. */}
          <aside className="flex flex-col gap-1 rounded-[20px] border border-line p-5 lg:sticky lg:top-[calc(var(--header-sticky)+16px)] lg:p-6">
            <span className="text-sm text-ink-2">{t("bundlePrice")}</span>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-[28px] font-bold leading-[34px] lg:text-[34px] lg:leading-[40px]">{formatMoney(pricing.total, locale)}</span>
              {pricing.saved > 0 && <span className="text-base text-muted line-through">{formatMoney(pricing.subtotal, locale)}</span>}
            </div>
            {pricing.saved > 0 && (
              <span className="text-sm font-semibold">{t("youSave", { amount: formatMoney(pricing.saved, locale) })}</span>
            )}
            <span className="mt-3 text-sm text-ink-2">{t("includes", { count: products.length, days: program.durationDays })}</span>
            <AddProgramButton slug={program.slug} products={products} discountPercent={program.discountPercent} className="mt-4 w-full" />
            <span className="mt-2 text-[13px] text-muted">{t("cancelNote")}</span>
          </aside>
        </div>
      </div>

      {products.length > 0 && (
        <section aria-labelledby="program-products" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="program-products" className={H2}>{t("whatsInside")}</h2>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 md:grid-cols-3 md:gap-x-3 md:gap-y-6 xl:grid-cols-4">
            {products.map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {program.forWhom.length > 0 && (
        <section aria-labelledby="program-for" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="program-for" className={H2}>{t("forWhom")}</h2>
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
            {program.forWhom.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-[20px] bg-tile p-4 text-[15px] font-medium leading-[22px] lg:p-5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg">
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

      {program.steps.length > 0 && (
        <section aria-labelledby="program-steps" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="program-steps" className={H2}>{t("howItWorks")}</h2>
          <ol className="grid gap-3 md:grid-cols-3 lg:gap-4">
            {program.steps.map((step, i) => (
              <li key={step.title} className="flex h-full flex-col gap-2 rounded-[20px] border border-line p-5 lg:p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tile text-sm font-bold">{i + 1}</span>
                <h3 className="mt-2 text-title font-bold">{step.title}</h3>
                <p className="text-[15px] leading-[22px] text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {ingredients.length > 0 && (
        <section aria-labelledby="program-nutrients" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="program-nutrients" className={H2}>{t("keyNutrients")}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {ingredients.map((ing) => (
              <li key={ing.slug} className="flex flex-col gap-0.5 rounded-[20px] border border-line p-5">
                <span className="text-base font-bold">{ing.name}</span>
                <span className="text-[13px] font-semibold text-muted">{ing.role}</span>
                <span className="mt-1.5 text-sm leading-5 text-ink-2">{ing.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {program.faq.length > 0 && (
        <section aria-labelledby="program-faq" className="flex max-w-[820px] flex-col gap-3.5 lg:gap-6">
          <h2 id="program-faq" className={H2}>{prod("faq")}</h2>
          <FaqAccordion items={program.faq} />
        </section>
      )}

      {topics.length > 0 && (
        <section aria-labelledby="program-topics" className="flex flex-col gap-3.5 lg:gap-6">
          <h2 id="program-topics" className={H2}>{t("readMore")}</h2>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Link key={topic.slug} href={`${TOPIC_BASE_PATH[topic.kind]}/${topic.slug}`} className={chipClass()}>
                {topic.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Disclaimer variant="product" />
    </div>
  );
}
