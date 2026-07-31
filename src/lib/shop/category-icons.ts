/*
  Category glyphs, keyed by a fragment of the slug rather than the whole slug.

  The catalogue is the backend's to name: it may ship `vitamins`, `vitamins-d`
  or `daily-vitamins` and all three should get the vitamin icon. Matching on a
  contained fragment keeps new categories working without a code change, and
  anything unrecognised falls back to a plain box.
*/
const CATEGORY_ICONS: Record<string, string> = {
  vitamins: "M12 2a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 01-10 0v-1H6a3 3 0 010-6h1V7a5 5 0 015-5zM9 7v8M15 7v8",
  minerals: "M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z",
  omega: "M2 12c2-4 4-6 6-6s4 4 8 4-4 6-8 6-6-2-6-4zM18 6a2 2 0 100 4 2 2 0 000-4z",
  probiotics: "M12 2C8 2 5 5 5 9s3 8 7 8 7-4 7-8-3-7-7-7zM9 9h6M12 6v6",
  immunity: "M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5l2-5z",
  beauty: "M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4zM8 13a8 8 0 0010 2M6 15a8 8 0 0112 0",
  sports: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  kids: "M8 7a4 4 0 108 0M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2M12 11v4M10 13h4",
  sleep: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  weight: "M12 3a3 3 0 100 6 3 3 0 000-6zM3 20s2-5 9-5 9 5 9 5M6 14l2 6M18 14l-2 6",
  heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z",
  joints: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
};

const FALLBACK_ICON = "M9 3h6l1 4h3a1 1 0 011 1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8a1 1 0 011-1h3l1-4z";

export function getCategoryIcon(slug: string): string {
  const key = Object.keys(CATEGORY_ICONS).find((k) => slug.toLowerCase().includes(k));
  return key ? CATEGORY_ICONS[key] : FALLBACK_ICON;
}
