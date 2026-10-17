/*
  The pictures that already ship with the site (public/), as the admin image
  picker shows them. Pure: the server lists the files (repo-images.server.ts),
  the client filters and ranks — so the picker works without Tigris.
*/

export type RepoImageKind = "photo" | "cutout" | "stock";

export interface RepoImage {
  /** Site path, e.g. "/products/aminomorin-forte-30-4.webp". */
  src: string;
  /** File name without folder, e.g. "aminomorin-forte-30-4.webp". */
  name: string;
  kind: RepoImageKind;
}

export const REPO_IMAGE_KINDS: Record<RepoImageKind, string> = {
  photo: "Mahsulot fotosi",
  cutout: "Kesma (fonsiz)",
  stock: "Stok foto",
};

/** Folders under public/ and what each holds. Only files directly inside are listed. */
export const REPO_IMAGE_DIRS: { dir: string; kind: RepoImageKind; match: RegExp }[] = [
  { dir: "products", kind: "photo", match: /\.(webp|jpe?g|png|avif)$/i },
  { dir: "images/products", kind: "cutout", match: /^c-.+\.png$/i },
  { dir: "images/stock", kind: "stock", match: /^st-.+\.(webp|jpe?g|png|avif)$/i },
];

/** "c-swiss-energy-calcivit-30-hero.png" → "swiss-energy-calcivit-30-hero" */
export function stemOf(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/^(c|st)-/, "");
}

/**
 * Search by file name (any part, spaces or dashes), optional kind; files that
 * belong to `slug` come first — the picker for "Omega-3" opens on Omega-3's
 * own pictures.
 */
export function filterRepoImages(list: readonly RepoImage[], { query = "", kind, slug }: { query?: string; kind?: RepoImageKind; slug?: string }): RepoImage[] {
  const words = query.toLowerCase().split(/[\s\-_]+/).filter(Boolean);
  const hits = list.filter((img) => {
    if (kind && img.kind !== kind) return false;
    const name = img.name.toLowerCase();
    return words.every((w) => name.includes(w));
  });
  if (!slug) return hits;
  return [...hits.filter((img) => belongsTo(img, slug)), ...hits.filter((img) => !belongsTo(img, slug))];
}

/** True when the file is named after this product slug. */
export function belongsTo(img: RepoImage, slug: string): boolean {
  if (!slug) return false;
  const stem = stemOf(img.name);
  return stem === slug || stem.startsWith(`${slug}-`);
}
