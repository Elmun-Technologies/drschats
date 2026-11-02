import { SUBJECTS, type KeywordSubject, type SubjectKind } from "./subjects";
import { uzLatinToCyrillic } from "./translit";

/*
  The keyword list for Google Keyword Planner ("Get search volume and
  forecasts" → upload file). Every subject in three scripts, the primary name
  with buying and question modifiers, plus each catalogue brand and product.
  Planner accepts up to 10 000 keywords per file; the list stays well below.
*/

export type KeywordLang = "ru" | "uz" | "uz-cyrl";
export type KeywordIntent = "base" | "buy" | "info" | "brand" | "product";

export interface KeywordRow {
  keyword: string;
  lang: KeywordLang;
  intent: KeywordIntent;
  subject: string;
  kind: SubjectKind | "product";
}

const BUY: Record<KeywordLang, string[]> = {
  ru: ["купить", "цена", "купить в ташкенте", "аптека", "цена в ташкенте"],
  uz: ["narxi", "sotib olish", "dorixona", "toshkent", "narxi toshkentda"],
  "uz-cyrl": ["нархи", "сотиб олиш", "дорихона"],
};

const INFO: Record<KeywordLang, string[]> = {
  ru: ["для чего", "польза", "дефицит симптомы", "как принимать", "в каких продуктах", "норма"],
  uz: ["nima uchun kerak", "foydasi", "yetishmasligi belgilari", "qanday ichiladi", "qaysi mahsulotlarda bor"],
  "uz-cyrl": ["нима учун керак", "фойдаси", "етишмаслиги белгилари"],
};

const BEST: Record<KeywordLang, string[]> = {
  ru: ["какие лучше", "купить"],
  uz: ["qaysi yaxshi", "narxi"],
  "uz-cyrl": ["қайси яхши"],
};

const INFO_KINDS = new Set<SubjectKind>(["vitamin", "mineral", "supplement"]);
const BUY_KINDS = new Set<SubjectKind>(["vitamin", "mineral", "supplement", "category", "brand", "form"]);

export function normalizeKeyword(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[ʻʼ‘’`]/g, "'")
    .replace(/[^\p{L}\p{N}' +-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The key two spellings of one search share. Keyword Planner hands Uzbek
 * apostrophes back as spaces ("soch to'kilishi" → "soch to kilishi"), so
 * matching ignores them.
 */
export function matchKey(text: string): string {
  return normalizeKeyword(text).replace(/'/g, " ").replace(/\s+/g, " ").trim();
}

function namesOf(subject: KeywordSubject): Record<KeywordLang, string[]> {
  // Foreign brand names are not typed in Uzbek Cyrillic; their Cyrillic form is the Russian one.
  const cyr = subject.kind === "brand" ? (subject.uzCyr ?? []) : [...subject.uz.map(uzLatinToCyrillic), ...(subject.uzCyr ?? [])];
  return { ru: subject.ru, uz: subject.uz, "uz-cyrl": cyr };
}

export interface CatalogueEntry {
  name: { uz: string; ru: string };
  brand?: string | null;
}

export function buildKeywordList(catalogue: CatalogueEntry[] = []): KeywordRow[] {
  const rows = new Map<string, KeywordRow>();
  const add = (keyword: string, lang: KeywordLang, intent: KeywordIntent, subject: string, kind: KeywordRow["kind"]) => {
    const k = normalizeKeyword(keyword);
    if (k.length < 2 || k.split(" ").length > 10 || rows.has(k)) return;
    rows.set(k, { keyword: k, lang, intent, subject, kind });
  };

  for (const s of SUBJECTS) {
    const names = namesOf(s);
    for (const lang of ["ru", "uz", "uz-cyrl"] as const) {
      const [primary, ...synonyms] = names[lang];
      if (!primary) continue;
      add(primary, lang, s.kind === "brand" ? "brand" : "base", s.id, s.kind);
      for (const syn of synonyms) add(syn, lang, s.kind === "brand" ? "brand" : "base", s.id, s.kind);
      if (BUY_KINDS.has(s.kind)) for (const m of BUY[lang]) add(`${primary} ${m}`, lang, "buy", s.id, s.kind);
      if (INFO_KINDS.has(s.kind)) for (const m of INFO[lang]) add(`${primary} ${m}`, lang, "info", s.id, s.kind);
      if (s.kind === "goal" || s.kind === "audience") for (const m of BEST[lang]) add(`${primary} ${m}`, lang, "buy", s.id, s.kind);
    }
  }

  // The shop's own brands and products: does anyone search for them by name?
  const brands = new Set<string>();
  for (const p of catalogue) {
    if (p.brand) brands.add(p.brand.trim());
    add(p.name.ru, "ru", "product", "products", "product");
    add(`${p.name.ru} купить`, "ru", "product", "products", "product");
    add(p.name.uz, "uz", "product", "products", "product");
    add(`${p.name.uz} narxi`, "uz", "product", "products", "product");
  }
  for (const b of brands) {
    const id = `brand-${normalizeKeyword(b).replace(/[^a-z0-9]+/g, "-")}`;
    add(b, "uz", "brand", id, "brand");
    add(`${b} купить`, "ru", "brand", id, "brand");
    add(`${b} narxi`, "uz", "brand", id, "brand");
  }
  return [...rows.values()];
}

/** The keyword → subject map, for reading Planner results back. */
export function keywordIndex(rows: KeywordRow[]): Map<string, KeywordRow> {
  return new Map(rows.map((r) => [matchKey(r.keyword), r]));
}

/**
 * A Planner keyword that is not on our list ("keyword ideas"): the subject
 * whose name it contains, longest name first, or null.
 */
export function guessSubject(keyword: string): { subject: string; kind: SubjectKind } | null {
  const k = ` ${matchKey(keyword)} `;
  let best: { subject: string; kind: SubjectKind; len: number } | null = null;
  for (const s of SUBJECTS) {
    const names = namesOf(s);
    for (const n of [...names.ru, ...names.uz, ...names["uz-cyrl"]]) {
      const name = matchKey(n);
      if (name.length >= 3 && k.includes(` ${name}`) && (!best || name.length > best.len)) best = { subject: s.id, kind: s.kind, len: name.length };
    }
  }
  return best ? { subject: best.subject, kind: best.kind } : null;
}

export function languageOf(keyword: string): KeywordLang {
  if (/[ўқғҳ]/i.test(keyword)) return "uz-cyrl";
  if (/[а-яё]/i.test(keyword)) return /(^|[^\p{L}])(нархи|учун|сотиб|дорихона|витамини|яхши|керак)($|[^\p{L}])/iu.test(keyword) ? "uz-cyrl" : "ru";
  return "uz";
}

export function toPlannerCsv(rows: KeywordRow[]): string {
  return ["Keyword", ...rows.map((r) => (/[",\n]/.test(r.keyword) ? `"${r.keyword.replace(/"/g, '""')}"` : r.keyword))].join("\n") + "\n";
}
