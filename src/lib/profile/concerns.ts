import type { Locale } from "@/lib/i18n/routing";
import { getQuizQuestions, type QuizOption } from "@/lib/quiz/questions";

/*
  The profile's goal picker reuses the consultant's "what bothers you most"
  question rather than owning a list of its own.

  Two reasons. The weights behind each option have been reviewed once, for the
  quiz, and a second hand-maintained list would drift away from them within a
  release. And the labels are already translated in both locales, so a goal a
  visitor picks on /profile reads identically to the one they picked in the
  consultant — which matters, because it is the same claim about themselves.
*/

const CONCERNS_QUESTION_ID = "concerns";

export function concernOptions(locale: Locale): QuizOption[] {
  return getQuizQuestions(locale).find((q) => q.id === CONCERNS_QUESTION_ID)?.options ?? [];
}

export interface ConcernSignals {
  /** Topic slugs, strongest first. */
  topics: string[];
  /** Ingredient slugs, strongest first. */
  ingredients: string[];
}

function ranked(weights: Record<string, number>): string[] {
  return Object.entries(weights)
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);
}

/** Sum the weights of the chosen options, exactly as the quiz engine does. */
export function signalsFromConcerns(optionIds: string[], locale: Locale): ConcernSignals {
  const options = concernOptions(locale);
  const topics: Record<string, number> = {};
  const ingredients: Record<string, number> = {};

  for (const id of optionIds) {
    const option = options.find((o) => o.id === id);
    if (!option) continue;
    for (const [slug, weight] of Object.entries(option.topics ?? {})) {
      topics[slug] = (topics[slug] ?? 0) + weight;
    }
    for (const [slug, weight] of Object.entries(option.ingredients ?? {})) {
      ingredients[slug] = (ingredients[slug] ?? 0) + weight;
    }
  }

  return { topics: ranked(topics), ingredients: ranked(ingredients) };
}
