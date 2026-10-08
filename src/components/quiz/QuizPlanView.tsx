import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import type { QuizPlan } from "@/lib/quiz/recommend";
import type { Expert } from "@/lib/content/experts.sanity";
import { TOPIC_BASE_PATH } from "@/lib/content/health-topics";
import { COMMERCE } from "@/lib/config/commerce";
import { FIRST_ORDER_PERCENT, RECURRING_PERCENT } from "@/lib/subscription/plans";
import { Link } from "@/lib/i18n/navigation";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { buttonVariants } from "@/components/ui/Button";
import { chipClass } from "@/components/ui/Chip";
import { QuizAddOne, QuizPlanActions } from "./QuizPlanActions";
import { cn, formatMoney } from "@/lib/utils";
import { cutoutOf, unitPriceOf } from "@/lib/catalog/product-facts";

/*
  The quiz result. Design: QuizResultV3.

  Two things used to sit on this page that the shop had no right to print: a
  "health score" out of 100 that was arithmetic on the visitor's own answers,
  and a morning/evening dosing plan split by array index. Both are gone. What
  is left is what the shop can defend: the directions the answers point at,
  and the products, each with the reason it was surfaced ("Nega") and the
  manufacturer's own one-line description ("Izoh"). Instructions for taking a
  product live on its page, where the manufacturer's text is.
*/
export async function QuizPlanView({
  plan,
  reviewer,
  audience,
  locale,
}: {
  plan: QuizPlan;
  reviewer?: Expert | null;
  /** "Ayolga, 18–35" — the visitor's own answers, as a chip. */
  audience?: string;
  locale: Locale;
}) {
  const t = await getTranslations("quiz");
  const tv = await getTranslations("quiz.v3");
  const tc = await getTranslations("common");
  const { result, topics, products } = plan;

  const empty = products.length === 0 && topics.length === 0;
  const available = products.filter((p) => p.product.inStock);
  const total = available.reduce((sum, p) => sum + p.product.price, 0);

  const doctor = (
    <div className="flex flex-col gap-4 rounded-[20px] bg-tile p-5 lg:flex-row lg:items-center lg:gap-5 lg:px-8 lg:py-7">
      <span aria-hidden className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bg lg:flex">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="text-lg font-bold lg:text-[20px]">{t("doctorTitle")}</h2>
        <p className="text-[15px] leading-[22px] text-ink-2 lg:text-base lg:leading-6">
          {result.seeDoctor ? t("doctorBody") : tv("doctorGeneral")}
        </p>
      </div>
      <Link href="/contact" className={cn(buttonVariants("secondary"), "shrink-0 self-start lg:self-center")}>
        {tv("doctorContact")}
      </Link>
    </div>
  );

  return (
    <div className="wrap flex flex-col gap-8 pb-9 pt-4 lg:gap-12 lg:pb-20 lg:pt-8">
      {/* A red-flag answer comes first — before any button that puts the plan
          in the cart, so nobody reaches checkout without reading it. */}
      {result.seeDoctor && doctor}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <div className="flex flex-col gap-3 lg:gap-4">
          <span className="text-[15px] font-semibold text-ink-2">{t("resultEyebrow")}</span>
          <h1 className="text-[28px] font-bold leading-[34px] lg:text-[44px] lg:leading-[50px]">{t("resultTitle")}</h1>
          <p className="max-w-[760px] text-base leading-6 text-ink-2 lg:text-[17px] lg:leading-[26px]">{t("resultSubtitle")}</p>
          {(topics.length > 0 || audience) && (
            <div className="mt-2 flex flex-col gap-3 lg:mt-4">
              <h2 className="text-[17px] font-bold">{t("focusTitle")}</h2>
              <ul className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <li key={topic.slug}>
                    <Link href={`${TOPIC_BASE_PATH[topic.kind]}/${topic.slug}`} className={cn(chipClass(true), "h-11 hover:bg-black")}>
                      {topic.name}
                    </Link>
                  </li>
                ))}
                {audience && (
                  <li className={cn(chipClass(false), "h-11 hover:bg-tile")}>{audience}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {available.length > 0 && (
          <div className="flex flex-col gap-3 rounded-[24px] bg-dark-panel p-6 text-white lg:p-7">
            <span className="text-sm text-on-dark-2">{tv("planLabel", { count: available.length })}</span>
            <span className="text-[30px] font-bold leading-9 lg:text-[34px] lg:leading-10">{formatMoney(total, locale)}</span>
            <p className="text-[15px] leading-[22px] text-on-dark-2">
              {tv("planNote", {
                first: FIRST_ORDER_PERCENT,
                next: RECURRING_PERCENT,
                free: formatMoney(COMMERCE.freeShippingOver, locale),
              })}
            </p>
            <QuizPlanActions products={products.map((p) => p.product)} className="mt-2 w-full" />
            <Link href="/quiz" className="inline-flex min-h-11 items-center self-center text-[15px] font-semibold underline underline-offset-4">
              {t("retake")}
            </Link>
          </div>
        )}
      </div>

      {empty ? (
        <div className="flex flex-col items-center gap-5 rounded-[20px] bg-tile p-8 text-center lg:p-10">
          <p className="text-base text-ink-2">{t("resultEmpty")}</p>
          <Link href="/quiz" className={buttonVariants("primary")}>
            {t("retake")}
          </Link>
        </div>
      ) : (
        products.length > 0 && (
          <section aria-labelledby="plan-products" className="flex flex-col gap-4 lg:gap-5">
            <div className="flex flex-col gap-1.5">
              <h2 id="plan-products" className="text-[22px] font-bold leading-7 lg:text-[28px] lg:leading-[34px]">
                {t("productsTitle")}
              </h2>
              <p className="text-[15px] leading-[22px] text-ink-2">
                {t("productsSubtitle")}. {t("reviewedNote")}.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {products.map(({ product, reasons }) => {
                const image = cutoutOf(product) ?? product.images[0]?.url;
                const perUnit = unitPriceOf(product);
                return (
                  <li
                    key={product.id}
                    className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-4 rounded-[20px] border border-line p-4 lg:grid-cols-[140px_minmax(0,1fr)_220px] lg:items-center lg:gap-x-6 lg:p-5"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      aria-label={product.name}
                      className="relative h-[88px] w-[88px] rounded-[16px] bg-tile lg:h-[140px] lg:w-[140px]"
                    >
                      {image && <Image src={image} alt="" fill sizes="140px" className="object-contain p-[9%]" />}
                    </Link>
                    <div className="flex min-w-0 flex-col gap-2">
                      <Link href={`/product/${product.slug}`} className="text-[17px] font-bold leading-6 hover:underline lg:text-[19px]">
                        {product.name}
                      </Link>
                      {reasons.length > 0 && (
                        <p className="text-sm leading-5 text-ink-2 lg:text-[15px] lg:leading-[22px]">
                          <span className="font-semibold text-ink">{t("whyLabel")}:</span> {reasons.join(" · ")}
                        </p>
                      )}
                      {product.tagline && (
                        <p className="text-sm leading-5 text-ink-2">
                          <span className="font-semibold text-ink">{t("guidanceLabel")}:</span> {product.tagline}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center gap-4 lg:col-span-1 lg:flex-col lg:items-stretch lg:gap-3">
                      <div className="flex flex-1 flex-col">
                        <span className="text-[20px] font-bold leading-6 lg:text-[22px] lg:leading-7">{formatMoney(product.price, locale)}</span>
                        {perUnit && (
                          <span className="text-[13px] text-muted">
                            {tc("perUnit", {
                              price: formatMoney(perUnit.amount, locale),
                              unit: tc(perUnit.unit === "tablet" ? "unitTablet" : "unitCapsule"),
                            })}
                          </span>
                        )}
                      </div>
                      <div className="w-[140px] lg:w-full">
                        <QuizAddOne product={product} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )
      )}

      {!result.seeDoctor && doctor}

      {/* Renders only when a verified expert is on file. See lib/content/experts. */}
      {reviewer && (
        <div className="flex items-center gap-4 rounded-[20px] border border-line p-5">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-tile">
            <Image src={reviewer.image} alt={reviewer.name} fill sizes="56px" className="object-cover" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-ink-2">{t("doctorOpinionTitle")}</span>
            <span className="text-base font-bold">{reviewer.name}</span>
            <span className="text-sm text-muted">{reviewer.title}</span>
          </span>
        </div>
      )}

      <Disclaimer variant="product" />
    </div>
  );
}
