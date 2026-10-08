import type { Product } from "@/lib/shopflow/types";
import type { QuizAnswers } from "./engine";

/*
  Who a product may be recommended to.

  The scoring engine only knows topics and ingredients, so on its own it
  offered a prenatal complex to a woman of 18–35 who never said she was
  pregnant, and a men's formula to the same visitor — both score well on
  "energy". Recommendations are about people before they are about nutrients,
  so the "who" answer filters the pool before anything is scored:

  - a product made for one audience is offered only to that audience;
  - a child is offered only children's products, and an expectant mother only
    prenatal ones — for both, anything else is a question for their doctor,
    which the result page already says.
*/
const ONLY_FOR: Record<string, string[]> = {
  "swiss-energy-prenatal-forte-60": ["expectant"],
  "swiss-energy-potenton-30": ["self-man"],
  "dr-frei-kids-multivitamins-20": ["child"],
};

const RESTRICTED_AUDIENCE: Record<string, (p: Product) => boolean> = {
  child: (p) => p.categorySlug === "kids" || ONLY_FOR[p.slug]?.includes("child") === true,
  expectant: (p) => ONLY_FOR[p.slug]?.includes("expectant") === true,
};

export function fitsAudience(product: Product, answers: QuizAnswers): boolean {
  const who = answers.who?.[0];
  if (who && RESTRICTED_AUDIENCE[who]) return RESTRICTED_AUDIENCE[who](product);
  const only = ONLY_FOR[product.slug];
  return !only || (who !== undefined && only.includes(who));
}

/**
 * The audience a product is made for, or null for a general-adult product.
 * Rails beside a product keep to its audience: a children's complex next to a
 * men's formula, or the other way round, is not a recommendation.
 */
export function audienceOf(product: Pick<Product, "slug" | "categorySlug">): string | null {
  if (product.categorySlug === "kids") return "child";
  return ONLY_FOR[product.slug]?.[0] ?? null;
}

/** True when the "who" answer limits the plan to products made for that audience. */
export function isRestrictedAudience(answers: QuizAnswers): boolean {
  const who = answers.who?.[0];
  return who !== undefined && who in RESTRICTED_AUDIENCE;
}
