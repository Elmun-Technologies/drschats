import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getQuizQuestions } from "@/lib/quiz/questions";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { QuizFlow } from "@/components/quiz/QuizFlow";
import { Disclaimer } from "@/components/legal/Disclaimer";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quiz" });
  return buildPageMetadata({
    locale,
    path: "/quiz",
    title: `${t("title")} — ${SITE_NAME}`,
    description: t("subtitle"),
  });
}

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ who?: string }>;
}) {
  const { locale } = await params;
  const { who } = await searchParams;
  setRequestLocale(locale);
  const questions = getQuizQuestions(locale);

  /* The home page offers the first question as its own set of cards, so
     arriving from one of those means it has already been answered — asking it
     again would make the shortcut cost a step instead of saving one. */
  const firstQuestion = questions[0];
  const preset =
    who && firstQuestion?.options.some((o) => o.id === who)
      ? { [firstQuestion.id]: [who] }
      : undefined;

  return (
    <div className="wrap pb-9 pt-2 lg:pb-20 lg:pt-10">
      <QuizFlow questions={questions} initialAnswers={preset} />
      <Disclaimer variant="product" className="mx-auto mt-8 max-w-[1032px] lg:mt-12" />
    </div>
  );
}
