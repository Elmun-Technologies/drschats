import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getQuizQuestions } from "@/lib/quiz/questions";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
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
  const t = await getTranslations("quiz");
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
    <div className="pt-10 pb-6">
      <Container>
        <header className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Dr. Chats Sun&apos;iy Intellekt va Tibbiy Konsilium Diagnostikasi</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </header>

        <div className="mt-12">
          <QuizFlow questions={questions} initialAnswers={preset} />
        </div>

        <div className="mx-auto mt-14 max-w-2xl">
          <Disclaimer variant="product" />
        </div>
      </Container>
    </div>
  );
}
