/*
  Ingredient guide slug → vitamin topic slug, where the two names differ.
  An ingredient links to its /vitamins page only when that page exists.
*/
const INGREDIENT_TOPIC: Record<string, string> = {
  "epa-dha": "omega-3",
};

export function ingredientTopicSlug(ingredientSlug: string): string {
  return INGREDIENT_TOPIC[ingredientSlug] ?? ingredientSlug;
}
