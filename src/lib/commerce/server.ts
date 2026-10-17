import "server-only";

import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";
import {
  COMMERCE_SECTIONS,
  COMMERCE_SETTINGS_KEY,
  defaultCommerceSettings,
  parseStoredCommerceSettings,
  type CommerceSection,
  type CommerceSettings,
  type StoredCommerceSettings,
} from "./settings";

/*
  The commerce rules as stored in site_settings (`commerce.rules`), one JSON
  value. Pages and the order action read the cached copy; saving revalidates
  SITE_SETTINGS_TAG, so the cart, the PDP and the checkout action see the new
  numbers on the next request — no rebuild, no restart.
*/

async function readStored(): Promise<StoredCommerceSettings> {
  if (!isDbConfigured) return { settings: defaultCommerceSettings(), meta: {} };
  try {
    const [row] = await getDb()
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, COMMERCE_SETTINGS_KEY))
      .limit(1);
    return parseStoredCommerceSettings(row?.value);
  } catch (err) {
    console.error("[commerce] settings read failed — using defaults:", (err as Error).message);
    return { settings: defaultCommerceSettings(), meta: {} };
  }
}

const cachedSettings = unstable_cache(async () => (await readStored()).settings, ["commerce-settings-v1"], {
  tags: [SITE_SETTINGS_TAG],
  revalidate: 300,
});

/** The effective rules, cached — for pages, layouts and the checkout action. */
export async function getCommerceSettings(): Promise<CommerceSettings> {
  return cachedSettings();
}

/** Uncached, with audit meta — for the admin screen, which must show what was just saved. */
export const readCommerceSettings = readStored;

/** The sections present in the stored value, each already valid. */
function savedSections(raw: string | null | undefined): Partial<CommerceSettings> {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw) as { settings?: Record<string, unknown> };
    const present = v?.settings && typeof v.settings === "object" ? v.settings : {};
    const full = parseStoredCommerceSettings(raw).settings;
    const out: Partial<CommerceSettings> = {};
    for (const section of COMMERCE_SECTIONS) {
      if (section in present) (out as Record<string, unknown>)[section] = full[section];
    }
    return out;
  } catch {
    return {};
  }
}

/** Replace one section (or reset it with `null`) and record who did it. */
export async function saveCommerceSection<K extends CommerceSection>(
  section: K,
  value: CommerceSettings[K] | null,
  admin: { id: number; label: string },
): Promise<void> {
  const db = getDb();
  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, COMMERCE_SETTINGS_KEY))
      .for("update")
      .limit(1);
    const current = parseStoredCommerceSettings(row?.value);
    /*
      Only the sections an admin saved are written; a reset removes its
      section, so it follows the defaults again — including the deploy env's
      cut-off, should that change later.
    */
    const settings: Partial<CommerceSettings> = { ...savedSections(row?.value) };
    if (value === null) delete settings[section];
    else settings[section] = value;
    const meta = { ...current.meta, [section]: { by: admin.label, at: new Date().toISOString() } };
    const json = JSON.stringify({ settings, meta });
    await tx
      .insert(siteSettings)
      .values({ key: COMMERCE_SETTINGS_KEY, value: json, updatedBy: admin.id })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: json, updatedBy: admin.id, updatedAt: new Date() } });
  });
}
