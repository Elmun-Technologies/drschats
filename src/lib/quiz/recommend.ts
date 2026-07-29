import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { shopflow } from "@/lib/shopflow";
import { getIngredients } from "@/lib/content/ingredients.sanity";
import type { Ingredient } from "@/lib/content/ingredients.sanity";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import type { HealthTopic } from "@/lib/content/health-topics";
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
 * Products are scored from two exact sources rather than fuzzy text matching:
 * the ingredient guide knows which products contain an ingredient
 * (`inProducts`), and each health topic knows its pinned products and
 * categories. Every point a product earns is therefore attributable, which is
 * what lets the result page show *why* something was suggested.
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

  const scores = new Map<string, number>();
  const reasons = new Map<string, Set<string>>();

  const credit = (slug: string, weight: number, reason: string) => {
    scores.set(slug, (scores.get(slug) ?? 0) + weight);
    if (!reasons.has(slug)) reasons.set(slug, new Set());
    reasons.get(slug)!.add(reason);
  };

  for (const ingredient of allIngredients) {
    const weight = result.ingredients[ingredient.slug] ?? 0;
    if (weight <= 0) continue;
    for (const productSlug of ingredient.inProducts) {
      credit(productSlug, weight * 2, ingredient.name);
    }
  }

  for (const topic of allTopics) {
    const weight = result.topics[topic.slug] ?? 0;
    if (weight <= 0) continue;
    for (const productSlug of topic.productSlugs) {
      credit(productSlug, weight * 2, topic.name);
    }
    if (topic.categorySlugs.length > 0) {
      for (const product of pool.items) {
        if (product.categorySlug && topic.categorySlugs.includes(product.categorySlug)) {
          credit(product.slug, weight, topic.name);
        }
      }
    }
  }

  const products = pool.items
    .map((product) => {
      const base = scores.get(product.slug) ?? 0;
      if (base <= 0) return null;
      // Quality and availability break ties between equally relevant products.
      const score = base + (product.rating / 5) * 0.8 - (product.inStock ? 0 : 2);
      return { product, score, reasons: [...(reasons.get(product.slug) ?? [])].slice(0, 3) };
    })
    .filter((entry): entry is { product: Product; score: number; reasons: string[] } => entry !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PRODUCTS)
    .map(({ product, reasons: why }) => ({ product, reasons: why }));

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
