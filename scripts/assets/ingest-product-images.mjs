#!/usr/bin/env node
/**
 * Real product photo ingestion.
 *
 * The storefront ships with AI-generated stand-in photography. Real photos
 * arrive as a loose pile of files — often with Russian names, spaces and
 * "(1)" gallery suffixes. This script turns that pile into:
 *
 *   public/products/<slug>.jpg          — normalized, URL-safe files
 *   src/lib/content/product-photos.ts   — slug -> photo URL[] mapping
 *   scripts/assets/ingest-report.json   — what matched what, and what did not
 *
 * src/lib/brand.ts imports the mapping as BRAND.productImageOverrides, which
 * src/lib/shopflow/mock.ts already honours, so wiring is automatic.
 *
 * Usage
 *   node scripts/assets/ingest-product-images.mjs            # dry run (default)
 *   node scripts/assets/ingest-product-images.mjs --write
 *   node scripts/assets/ingest-product-images.mjs --inbox path/to/folder --write
 *
 * Files that do not match a catalogue product are left untouched in the inbox
 * and listed in the report: inventing a product page from a filename is a
 * guess, so that decision stays with a human.
 */

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..", "..");
export const DEFAULT_INBOX = path.join(ROOT, "public", "products", "inbox");
export const OUT_DIR = path.join(ROOT, "public", "products");
export const MAPPING_FILE = path.join(ROOT, "src", "lib", "content", "product-photos.ts");
export const REPORT_FILE = path.join(ROOT, "scripts", "assets", "ingest-report.json");
export const CATALOG_FILE = path.join(ROOT, "src", "lib", "shopflow", "mock.ts");

export const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/* ── transliteration ─────────────────────────────────────────────────────── */

/** Cyrillic -> latin, so "Витамин С.jpg" still yields a URL-safe slug. */
const CYRILLIC = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  і: "i", ї: "i", є: "ye", ґ: "g", ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

/**
 * Cyrillic letters that are typographic lookalikes of a different latin
 * letter. A *standalone* one in a product name is virtually always the latin
 * original: "Витамин С" is Vitamin C (the Russian letter reads as "es"), and
 * "А20" is model A20. Only isolated letters are remapped, so real Russian
 * words still transliterate normally.
 */
const HOMOGLYPH = { а: "a", в: "b", е: "e", к: "k", м: "m", н: "h", о: "o", р: "p", с: "c", т: "t", у: "y", х: "x" };

/** Uzbek latin orthography with no clean ASCII equivalent. */
const UZ_LATIN = [["oʻ", "o"], ["o'", "o"], ["gʻ", "g"], ["g'", "g"], ["ʼ", ""], ["’", ""]];

export function transliterate(value) {
  let out = value.toLowerCase();
  for (const [from, to] of UZ_LATIN) out = out.split(from).join(to);
  out = out.replace(
    /(^|[^a-zа-яёіїєґўқғҳ])([авекмнорпстух])(?=[^a-zа-яёіїєґўқғҳ]|$)/g,
    (_m, before, ch) => before + HOMOGLYPH[ch],
  );
  return out.replace(/[а-яёіїєґўқғҳ]/g, (ch) => CYRILLIC[ch] ?? "");
}

/** "Swiss Energy Vitamin C 550mg 20.jpg" -> "swiss-energy-vitamin-c-550mg-20" */
export function slugify(value) {
  return transliterate(value)
    .replace(/\.(jpe?g|png|webp|avif)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Words that carry no identifying weight. */
const NOISE = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "photo", "foto", "rasm", "image",
  "img", "original", "copy", "final", "new", "yangi", "sifatli", "hd",
  "thumb", "preview", "main", "asosiy", "the", "and", "for", "of",
]);

export function tokens(value) {
  return new Set(
    transliterate(value)
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 1 && !NOISE.has(t) && !/^\d+$/.test(t)),
  );
}

/** Trailing "(1)", "_2", "-03" = gallery position for the same product. */
export function splitVariant(name) {
  const base = name.replace(/\.[^.]+$/, "");
  const m = base.match(/^(.*?)[\s_-]*(?:\((\d{1,2})\)|(\d{1,2}))$/);
  if (m && m[1].trim()) return { base: m[1], variant: Number(m[2] ?? m[3]) };
  return { base, variant: 1 };
}

/* ── catalogue ───────────────────────────────────────────────────────────── */

/**
 * Reads slug + display names for the PRODUCTS in mock.ts, so the matcher
 * cannot drift from the real catalogue.
 *
 * Scoped to the rawProducts array deliberately: rawCategories entries have the
 * same `{ slug, name: { uz, ru } }` shape, and matching one of those would file
 * a photo under a slug that has no product page — a mapping entry that renders
 * nothing and looks like success.
 */
export async function readCatalogue(file = CATALOG_FILE) {
  const src = await fs.readFile(file, "utf8");
  const start = src.indexOf("const rawProducts: RawProduct[] = [");
  if (start === -1) throw new Error(`rawProducts array not found in ${file}`);
  const end = src.indexOf("\n];", start);
  const block = src.slice(start, end === -1 ? src.length : end);

  const products = [];
  const re = /slug:\s*"([a-z0-9-]+)",[\s\S]{0,2000}?name:\s*\{\s*uz:\s*"([^"]+)",\s*ru:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block))) products.push({ slug: m[1], uz: m[2], ru: m[3] });
  return products;
}

/** Every token that identifies a product: its slug parts plus both names. */
export function productTokens(product) {
  return new Set([...product.slug.split("-"), ...tokens(product.uz), ...tokens(product.ru)]);
}

/**
 * How many catalogue products a token appears in, counted by substring.
 *
 * Substring rather than exact match on purpose: the catalogue spells the same
 * idea as "vitamin", "vitamins" and "multivitamins", and an exact count would
 * call the singular form unique to one product. "vitamin" is generic,
 * "immunovit" belongs to exactly one product — that difference is what lets a
 * single shared word be either proof or noise.
 */
export function tokenFrequencies(catalogue) {
  const haystacks = catalogue.map((p) =>
    [p.slug, transliterate(p.uz), transliterate(p.ru)].join(" "),
  );
  const cache = new Map();
  return {
    count(token) {
      if (!cache.has(token)) {
        cache.set(token, haystacks.filter((h) => h.includes(token)).length);
      }
      return cache.get(token);
    },
  };
}

/**
 * Overlap score. Tokens that appear in the product slug count double: a
 * filename that literally contains the slug is far stronger evidence than one
 * that merely shares a display-name word with half the catalogue.
 */
export function score(fileTokens, product, df) {
  const slugTokens = new Set(product.slug.split("-").filter((t) => t.length > 1));
  const nameTokens = new Set([...tokens(product.uz), ...tokens(product.ru)]);
  let hits = 0;
  let weighted = 0;
  let uniqueHits = 0;
  const matched = [];
  for (const t of fileTokens) {
    if (slugTokens.has(t)) { hits += 1; weighted += 2; }
    else if (nameTokens.has(t)) { hits += 1; weighted += 1; }
    else continue;
    matched.push(t);
    if (!df || df.count(t) === 1) uniqueHits += 1;
  }
  const union = new Set([...fileTokens, ...slugTokens, ...nameTokens]).size;
  return { hits, weighted, uniqueHits, matched, jaccard: union ? weighted / union : 0 };
}

/* ── matching ────────────────────────────────────────────────────────────── */

/**
 * Maps inbox filenames onto catalogue products.
 *
 * Grouping happens on the de-varianted base name, so "Vitamin C (1).jpg" and
 * "Vitamin C (2).jpg" become one product's gallery rather than two rival
 * matches. A match needs two shared tokens, or a single token that belongs to
 * exactly one catalogue product — one generic shared word ("vitamin") is not
 * evidence.
 *
 * @returns {{ assignments: Map<string, {name: string, variant: number}[]>, unmatchedFiles: string[] }}
 */
export function matchFiles(files, catalogue) {
  const groups = new Map();
  for (const name of files) {
    const { base, variant } = splitVariant(name);
    const key = slugify(base) || slugify(name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ name, variant });
  }

  const assignments = new Map();
  const unmatchedFiles = [];
  const df = tokenFrequencies(catalogue);

  for (const [groupKey, members] of groups) {
    const ranked = catalogue
      .map((p) => ({ product: p, ...score(tokens(groupKey), p, df) }))
      .filter((r) => r.hits > 0)
      .sort((a, b) => b.weighted - a.weighted || b.jaccard - a.jaccard);

    /* Two shared words, or one word that belongs to this product alone. A
       single generic word ("vitamin", "delical") identifies nothing. */
    const best = ranked[0];
    if (!best || !(best.hits >= 2 || best.uniqueHits >= 1)) {
      for (const m of members) unmatchedFiles.push(m.name);
      continue;
    }

    const slug = best.product.slug;
    if (!assignments.has(slug)) assignments.set(slug, []);
    assignments.get(slug).push(...[...members].sort((a, b) => a.variant - b.variant));
  }

  return { assignments, unmatchedFiles };
}

/** Normalized output filenames + public URLs, and the copy jobs to perform. */
export function planOutput(assignments, inbox, outDir = OUT_DIR) {
  const mapping = {};
  const copies = [];
  for (const [slug, members] of assignments) {
    mapping[slug] = members.map((member, i) => {
      const ext = path.extname(member.name).toLowerCase();
      const outName = members.length > 1 ? `${slug}-${i + 1}${ext}` : `${slug}${ext}`;
      copies.push({ from: path.join(inbox, member.name), to: path.join(outDir, outName) });
      return `/products/${outName}`;
    });
  }
  return { mapping, copies };
}

/* ── generated files ─────────────────────────────────────────────────────── */

export function renderMappingSource(mapping) {
  const body = Object.keys(mapping)
    .sort()
    .map((k) => `  "${k}": ${JSON.stringify(mapping[k])},`)
    .join("\n");
  return `/**
 * Real product photography, keyed by product slug.
 *
 * GENERATED by scripts/assets/ingest-product-images.mjs — do not edit by hand.
 * Consumed by src/lib/brand.ts (BRAND.productImageOverrides), which
 * src/lib/shopflow/mock.ts applies over the placeholder imagery.
 */
export const PRODUCT_PHOTOS: Record<string, string[]> = {
${body}
};
`;
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const inboxIdx = args.indexOf("--inbox");
  const inbox = inboxIdx >= 0 ? path.resolve(args[inboxIdx + 1]) : DEFAULT_INBOX;

  if (!existsSync(inbox)) {
    console.error(`Inbox not found: ${inbox}`);
    process.exit(1);
  }

  const files = (await fs.readdir(inbox, { withFileTypes: true }))
    .filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();

  if (!files.length) {
    console.error(`No images in ${inbox}`);
    process.exit(1);
  }

  const catalogue = await readCatalogue();
  const { assignments, unmatchedFiles } = matchFiles(files, catalogue);
  const { mapping, copies } = planOutput(assignments, inbox);

  if (write) {
    await fs.mkdir(OUT_DIR, { recursive: true });
    await Promise.all(copies.map((c) => fs.copyFile(c.from, c.to)));
    await fs.mkdir(path.dirname(MAPPING_FILE), { recursive: true });
    await fs.writeFile(MAPPING_FILE, renderMappingSource(mapping));
    await fs.writeFile(
      REPORT_FILE,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          inbox: path.relative(ROOT, inbox),
          inboxFiles: files.length,
          matchedProducts: assignments.size,
          filesAssigned: copies.length,
          unmatched: unmatchedFiles.length,
          assignments: [...assignments.entries()].map(([slug, members]) => ({
            slug,
            photos: members.map((m) => m.name),
          })),
          unmatchedFiles,
        },
        null,
        2,
      )}\n`,
    );
  }

  console.log(
    `\n${write ? "WROTE" : "DRY RUN"} — ${files.length} file(s) in inbox, ` +
      `${assignments.size} product(s) matched, ${unmatchedFiles.length} unmatched\n`,
  );
  for (const [slug, members] of assignments) {
    console.log(`  ✓ ${slug}`);
    for (const m of members) console.log(`      ← ${m.name}`);
  }
  if (unmatchedFiles.length) {
    console.log("\n  Unmatched (left in inbox, needs a human):");
    for (const f of unmatchedFiles) console.log(`  ✗ ${f}`);
  }
  console.log("");
  if (!write) console.log("Re-run with --write to apply.\n");
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
