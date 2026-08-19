import type { Locale } from "@/lib/i18n/routing";
import { shopflow } from "@/lib/shopflow";
import type { Product } from "@/lib/shopflow/types";
import { getIngredients } from "@/lib/content/ingredients.sanity";
import type { Ingredient } from "@/lib/content/ingredients.sanity";
import { reviewerForKey } from "@/lib/content/experts.sanity";
import type { Expert } from "@/lib/content/experts.sanity";
import { getHealthTopics } from "@/lib/content/health-topics.sanity";
import type { HealthTopic } from "@/lib/content/health-topics";
import { getProgram, getPrograms } from "@/lib/content/programs.sanity";
import type { Program } from "@/lib/content/programs";

export const PROGRAM_IMAGES: Record<string, string> = {
  "immunity-30": "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=600",
  "stress-recovery": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=600",
  "beauty-skin-hair": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600",
  "kids-growth": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600",
  "default": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600",
};

export function getProgramImage(slug: string): string {
  return PROGRAM_IMAGES[slug] || PROGRAM_IMAGES.default;
}

const POOL_SIZE = 100;
const MAX_PROGRAM_PRODUCTS = 6;

export interface ProgramPricing {
  /** Sum of the products' current prices. */
  subtotal: number;
  /** What the bundle costs after the programme discount. */
  total: number;
  saved: number;
}

export interface ProgramPageData {
  program: Program;
  products: Product[];
  ingredients: Ingredient[];
  topics: HealthTopic[];
  pricing: ProgramPricing;
  reviewer: Expert;
}

export function priceProgram(products: Product[], discountPercent: number): ProgramPricing {
  const subtotal = products.reduce((sum, p) => sum + p.price, 0);
  const total = Math.round(subtotal * (1 - discountPercent / 100));
  return { subtotal, total, saved: subtotal - total };
}

/** Pinned products first; the programme's categories fill the remaining slots. */
export function selectProgramProducts(program: Program, pool: Product[]): Product[] {
  const pinned = program.productSlugs
    .map((slug) => pool.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  if (pinned.length >= MAX_PROGRAM_PRODUCTS) return pinned.slice(0, MAX_PROGRAM_PRODUCTS);

  const taken = new Set(pinned.map((p) => p.slug));
  const filler = pool
    .filter(
      (p) =>
        !taken.has(p.slug) &&
        p.categorySlug != null &&
        program.categorySlugs.includes(p.categorySlug),
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, MAX_PROGRAM_PRODUCTS - pinned.length);

  return [...pinned, ...filler];
}

export async function loadProgramPage(
  slug: string,
  locale: Locale,
): Promise<ProgramPageData | null> {
  const program = await getProgram(slug, locale);
  if (!program) return null;

  const [pool, allIngredients, allTopics, reviewer] = await Promise.all([
    shopflow.getProducts({ locale, pageSize: POOL_SIZE }),
    getIngredients(locale),
    getHealthTopics(locale),
    reviewerForKey(program.slug, locale),
  ]);

  const products = selectProgramProducts(program, pool.items);
  const wantedIngredients = new Set(program.ingredientSlugs);
  const wantedTopics = new Set(program.topicSlugs);

  return {
    program,
    products,
    ingredients: allIngredients.filter((i) => wantedIngredients.has(i.slug)),
    topics: allTopics.filter((t) => wantedTopics.has(t.slug)),
    pricing: priceProgram(products, program.discountPercent),
    reviewer,
  };
}

/** Index page: every programme with just enough data for its card. */
export async function loadProgramIndex(locale: Locale) {
  const [programs, pool] = await Promise.all([
    getPrograms(locale),
    shopflow.getProducts({ locale, pageSize: POOL_SIZE }),
  ]);

  return programs.map((program) => {
    const products = selectProgramProducts(program, pool.items);
    return {
      program,
      products,
      pricing: priceProgram(products, program.discountPercent),
    };
  });
}
