import { z } from "zod";
import { isAllowedImageUrl } from "@/lib/security/csp";
import type { Locale } from "@/lib/i18n/routing";
import { locales } from "@/lib/i18n/routing";
import type { ProductContent } from "@/lib/db/schema";
import type { FaqItem, IngredientRow, ProductBenefit } from "@/lib/shopflow/types";

/*
  The product form ↔ database row codec. Pure, so the round trip is tested
  against every built-in product (product-form.test.ts): importing the
  catalogue and saving a product untouched must not change a single field.

  Lists are edited as plain lines — one item per line, columns split by " | ":
    benefits     title | description | icon
    ingredients  name | amount | daily value
    faq          question | answer
  A form an operator can fill on a phone beats a nested editor that needs a
  manual.
*/
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEP = " | ";

const lines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

const cols = (line: string) => line.split("|").map((c) => c.trim());

export function listToText(items: string[]): string {
  return items.join("\n");
}

export function benefitsToText(items: ProductBenefit[]): string {
  return items.map((b) => [b.title, b.description, b.icon].filter((v) => v != null && v !== "").join(SEP)).join("\n");
}

export function textToBenefits(text: string): ProductBenefit[] {
  return lines(text).map((l) => {
    const [title, description = "", icon] = cols(l);
    return icon ? { icon, title, description } : { title, description };
  });
}

export function ingredientsToText(items: IngredientRow[]): string {
  return items.map((i) => [i.name, i.amount, i.dailyValue].filter((v) => v != null && v !== "").join(SEP)).join("\n");
}

export function textToIngredients(text: string): IngredientRow[] {
  return lines(text).map((l) => {
    const [name, amount = "", dailyValue] = cols(l);
    return dailyValue ? { name, amount, dailyValue } : { name, amount };
  });
}

export function faqToText(items: FaqItem[]): string {
  return items.map((f) => `${f.question}${SEP}${f.answer}`).join("\n");
}

export function textToFaq(text: string): FaqItem[] {
  return lines(text).map((l) => {
    const [question, ...rest] = cols(l);
    return { question, answer: rest.join(" | ") };
  });
}

const TEXT_FIELDS = ["name", "tagline", "description", "howToUse", "servings", "origin"] as const;

/** Form field names for one locale's copy, e.g. "uz.name". */
export function contentToForm(content: ProductContent): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of locales) {
    for (const f of TEXT_FIELDS) out[`${l}.${f}`] = content[f][l] ?? "";
    out[`${l}.highlights`] = listToText(content.highlights[l] ?? []);
    out[`${l}.badges`] = listToText(content.badges[l] ?? []);
    out[`${l}.searchAliases`] = listToText(content.searchAliases?.[l] ?? []);
    out[`${l}.benefits`] = benefitsToText(content.benefits[l] ?? []);
    out[`${l}.ingredients`] = ingredientsToText(content.ingredients[l] ?? []);
    out[`${l}.faq`] = faqToText(content.faq[l] ?? []);
  }
  return out;
}

function perLocale<T>(read: (l: Locale) => T): Record<Locale, T> {
  return Object.fromEntries(locales.map((l) => [l, read(l)])) as Record<Locale, T>;
}

export function formToContent(form: Record<string, string>): ProductContent {
  const get = (k: string) => (form[k] ?? "").trim();
  const text = (f: (typeof TEXT_FIELDS)[number]) => perLocale((l) => get(`${l}.${f}`));
  const aliases = perLocale((l) => lines(get(`${l}.searchAliases`)));
  return {
    name: text("name"),
    tagline: text("tagline"),
    description: text("description"),
    howToUse: text("howToUse"),
    servings: text("servings"),
    origin: text("origin"),
    highlights: perLocale((l) => lines(get(`${l}.highlights`))),
    badges: perLocale((l) => lines(get(`${l}.badges`))),
    ...(Object.values(aliases).some((a) => a.length > 0) ? { searchAliases: aliases } : {}),
    benefits: perLocale((l) => textToBenefits(get(`${l}.benefits`))),
    ingredients: perLocale((l) => textToIngredients(get(`${l}.ingredients`))),
    faq: perLocale((l) => textToFaq(get(`${l}.faq`))),
  };
}

const money = z.coerce.number().int().min(0).max(100_000_000);

export const productFieldsSchema = z
  .object({
    slug: z.string().trim().regex(SLUG_RE, "slug: faqat kichik lotin harflari, raqam va «-»"),
    categorySlug: z.string().trim().min(1, "Kategoriyani tanlang"),
    brandSlug: z.string().trim().optional(),
    price: money,
    oldPrice: z.union([z.literal(""), money]).optional(),
    inStock: z.string().optional(),
    kind: z.enum(["core", "addon", "unlisted"]),
    sort: z.coerce.number().int().min(-10000).max(10000).default(0),
    images: z.string().optional(),
    cutout: z.string().trim().optional(),
    unitCount: z.union([z.literal(""), z.coerce.number().int().min(1).max(1000)]).optional(),
    unitKind: z.enum(["", "tablet", "capsule"]).optional(),
    "uz.name": z.string().trim().min(2, "Nomi (uz) majburiy"),
    "ru.name": z.string().trim().min(2, "Nomi (ru) majburiy"),
  })
  .passthrough()
  .refine((d) => d.oldPrice === "" || d.oldPrice == null || d.oldPrice > d.price, {
    message: "Eski narx joriy narxdan katta boʻlishi kerak (yoki boʻsh)",
    path: ["oldPrice"],
  });

/** Image URLs the site can actually render (own files or an allowlisted host); the rest are dropped. */
export function parseImages(text: string | undefined): string[] {
  return lines(text ?? "").filter(isAllowedImageUrl);
}
