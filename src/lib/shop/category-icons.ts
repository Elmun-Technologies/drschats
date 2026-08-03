/*
  Category glyphs, keyed by a fragment of the slug rather than the whole slug.

  The catalogue is the backend's to name: it may ship `vitamins`, `vitamins-d`
  or `daily-vitamins` and all three should get the vitamin icon. Matching on a
  contained fragment keeps new categories working without a code change, and
  anything unrecognised falls back to a plain box.
*/
const CATEGORY_ICONS: Record<string, string> = {
  vitamins: "M12 2a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 01-10 0v-1H6a3 3 0 010-6h1V7a5 5 0 015-5zM9 7v8M15 7v8",
  // A gem, not the star it used to be — that was the same glyph as immunity,
  // so two categories in the same row drew identical icons.
  minerals: "M8 3h8l4 6-8 12L4 9l4-6zM4 9h16",
  omega: "M2 12c2-4 4-6 6-6s4 4 8 4-4 6-8 6-6-2-6-4zM18 6a2 2 0 100 4 2 2 0 000-4z",
  probiotics: "M12 2C8 2 5 5 5 9s3 8 7 8 7-4 7-8-3-7-7-7zM9 9h6M12 6v6",
  immunity: "M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5l8-3zM9 11.5l2 2 4-4",
  beauty: "M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4zM8 13a8 8 0 0010 2M6 15a8 8 0 0112 0",
  // The catalogue's remaining categories. Without these, half the category row
  // fell through to one shopping-bag glyph.
  effervescent: "M7 7h10l-1 13a2 2 0 01-2 2h-4a2 2 0 01-2-2L7 7zM9.5 14h5M12 11.5v5M10.5 4h.01M14 2.5h.01M8.5 2.5h.01",
  devices: "M3 4h18v11H3zM8 19h8M12 15v4M7 9.5h2.2l1.4-2.8 1.9 5.6 1.3-2.8H17",
  coffee: "M4 8h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5V8zM17 9h1.5a2.5 2.5 0 010 5H17M7 2.5v2M11 2.5v2M15 2.5v2",
  nutrition: "M3 11h18a9 9 0 01-18 0zM2 21h20M9 7c0-1.2.6-1.9 1.2-2.5M14 7c0-1.2.6-1.9 1.2-2.5",
  skin: "M12 2.7c3.5 4 5.5 6.9 5.5 9.6a5.5 5.5 0 11-11 0c0-2.7 2-5.6 5.5-9.6zM9.5 13.5a2.5 2.5 0 002.5 2.5",
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
