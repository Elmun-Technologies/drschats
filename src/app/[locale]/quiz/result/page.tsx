import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildQuizPlan, decodeAnswers } from "@/lib/quiz/recommend";
import { reviewerForKey } from "@/lib/content/experts.sanity";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { QuizPlanView } from "@/components/quiz/QuizPlanView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quiz" });
  return {
    ...buildPageMetadata({
      locale,
      path: "/quiz/result",
      title: `${t("resultTitle")} — ${SITE_NAME}`,
      description: t("resultSubtitle"),
    }),
    // A personal plan is not a search result — keep it out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function QuizResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ a?: string }>;
}) {
  const [{ locale }, { a }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const answers = decodeAnswers(a);
  const [plan, reviewer] = await Promise.all([
    buildQuizPlan(answers, locale),
    reviewerForKey("quiz", locale),
  ]);

  return <QuizPlanView plan={plan} reviewer={reviewer} locale={locale} />;
}
