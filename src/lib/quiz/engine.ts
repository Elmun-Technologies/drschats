import type { QuizQuestion } from "./questions";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export type QuizAnswers = Record<string, string[]>;

export interface QuizScores {
  topics: Record<string, number>;
  ingredients: Record<string, number>;
  /** True when an answer warrants talking to a doctor or pharmacist first. */
  seeDoctor: boolean;
}

export interface QuizResult extends QuizScores {
  /** Topic slugs, strongest first. */
  rankedTopics: string[];
  /** Ingredient slugs, strongest first. */
  rankedIngredients: string[];
  answeredCount: number;
}

/**
 * Sum the weights carried by every selected option.
 * Pure: the same answers always produce the same plan, and every number in the
 * result can be traced back to a specific answer.
 */
export function scoreAnswers(questions: QuizQuestion[], answers: QuizAnswers): QuizScores {
  const topics: Record<string, number> = {};
  const ingredients: Record<string, number> = {};
  let seeDoctor = false;

  for (const question of questions) {
    const selected = answers[question.id] ?? [];
    for (const optionId of selected) {
      const option = question.options.find((o) => o.id === optionId);
      if (!option) continue;

      for (const [slug, weight] of Object.entries(option.topics ?? {})) {
        topics[slug] = (topics[slug] ?? 0) + weight;
      }
      for (const [slug, weight] of Object.entries(option.ingredients ?? {})) {
        ingredients[slug] = (ingredients[slug] ?? 0) + weight;
      }
      if (option.seeDoctor) seeDoctor = true;
    }
  }

  return { topics, ingredients, seeDoctor };
}

function rank(scores: Record<string, number>): string[] {
  return Object.entries(scores)
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);
}

export function buildQuizResult(questions: QuizQuestion[], answers: QuizAnswers): QuizResult {
  const scores = scoreAnswers(questions, answers);
  return {
    ...scores,
    rankedTopics: rank(scores.topics),
    rankedIngredients: rank(scores.ingredients),
    answeredCount: Object.values(answers).filter((v) => v.length > 0).length,
  };
}

const STORAGE_KEY = STORAGE_KEYS.quiz;

export interface StoredQuiz {
  answers: QuizAnswers;
  rankedTopics: string[];
  rankedIngredients: string[];
  seeDoctor: boolean;
  savedAt: number;
}

/** Results older than this are ignored — lifestyle answers go stale. */
const TTL_MS = 90 * 24 * 60 * 60 * 1000;

export function saveQuiz(answers: QuizAnswers, result: QuizResult) {
  if (typeof window === "undefined") return;
  const payload: StoredQuiz = {
    answers,
    rankedTopics: result.rankedTopics,
    rankedIngredients: result.rankedIngredients,
    seeDoctor: result.seeDoctor,
    savedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Private mode / quota — the quiz still works, it just is not remembered.
  }
}

export function loadQuiz(): StoredQuiz | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredQuiz;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearQuiz() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
