import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { shopflow } from "@/lib/shopflow";
import { getIngredients } from "@/lib/content/ingredients.sanity";
import type { Ingredient } from "@/lib/content/ingredients.sanity";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import type { HealthTopic } from "@/lib/content/health-topics";
import { scoreCatalogue } from "@/lib/personalization/catalogue";
import { getQuizQuestions } from "./questions";
import { buildQuizResult, type QuizAnswers, type QuizResult } from "./engine";

const POOL_SIZE = 100;
const MAX_PRODUCTS = 6;
const MAX_TOPICS = 4;
const MAX_INGREDIENTS = 5;

export interface QuizPlan {
  result: QuizResult;
  topics: HealthTopic[];
  ingredients: Ingredient[];
  products: { product: Product; reasons: string[] }[];
}

/**
 * Turn scored answers into a concrete plan.
 *
 * The product scoring itself lives in `personalization/catalogue` because the
 * saved profile needs exactly the same rules; here the answers only decide the
 * weights that go in.
 */
export async function buildQuizPlan(answers: QuizAnswers, locale: Locale): Promise<QuizPlan> {
  const questions = getQuizQuestions(locale);
  const result = buildQuizResult(questions, answers);

  const [pool, allIngredients, allTopics] = await Promise.all([
    shopflow.getProducts({ locale, pageSize: POOL_SIZE }),
    getIngredients(locale),
    getHealthTopics(locale),
  ]);

  const topics = result.rankedTopics
    .map((slug) => allTopics.find((t) => t.slug === slug))
    .filter((t): t is HealthTopic => Boolean(t))
    .slice(0, MAX_TOPICS);

  const ingredients = result.rankedIngredients
    .map((slug) => allIngredients.find((i) => i.slug === slug))
    .filter((i): i is Ingredient => Boolean(i))
    .slice(0, MAX_INGREDIENTS);

  const products = scoreCatalogue(pool.items, allTopics, allIngredients, {
    topics: result.topics,
    ingredients: result.ingredients,
  })
    .slice(0, MAX_PRODUCTS)
    .map(({ product, reasons }) => ({ product, reasons }));

  return { result, topics, ingredients, products };
}

/*
  Answers travel in the URL so a plan is shareable and the result page can be
  rendered on the server with the full product objects, instead of shipping the
  whole catalogue to the browser.

  Format: `questionId.option1_option2~questionId.option`
*/
export function encodeAnswers(answers: QuizAnswers): string {
  return Object.entries(answers)
    .filter(([, options]) => options.length > 0)
    .map(([id, options]) => `${id}.${options.join("_")}`)
    .join("~");
}

export function decodeAnswers(encoded: string | undefined): QuizAnswers {
  if (!encoded) return {};
  const answers: QuizAnswers = {};
  for (const part of encoded.split("~")) {
    const separator = part.indexOf(".");
    if (separator < 1) continue;
    const id = part.slice(0, separator);
    const options = part.slice(separator + 1).split("_").filter(Boolean);
    if (options.length > 0) answers[id] = options;
  }
  return answers;
}
