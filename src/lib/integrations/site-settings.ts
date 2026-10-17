import "server-only";

import { unstable_cache } from "next/cache";
import { inArray, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";

/*
  Public, non-secret settings the team manages in /admin/integrations:
  analytics IDs, the Webvisor switch and search-engine verification codes.
  They end up in the page anyway, so they are stored in plain text — no
  encryption key needed to turn analytics on. Secrets (bot tokens, API keys)
  stay in integration_settings, encrypted.
*/

export const SITE_SETTINGS_TAG = "site-settings";

export const PUBLIC_SETTING_KEYS = [
  "analytics.gtmId",
  "analytics.ga4Id",
  "analytics.metaPixelId",
  "analytics.yandexMetrikaId",
  "analytics.webvisor",
  "verify.google",
  "verify.yandex",
  "verify.bing",
  "sms.transliterate",
] as const;

export type PublicSettingKey = (typeof PUBLIC_SETTING_KEYS)[number];
export type PublicSettings = Partial<Record<PublicSettingKey, string>>;

async function read(): Promise<PublicSettings> {
  if (!isDbConfigured) return {};
  try {
    const rows = await getDb()
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)
      .where(inArray(siteSettings.key, [...PUBLIC_SETTING_KEYS]));
    return Object.fromEntries(rows.map((row) => [row.key, row.value])) as PublicSettings;
  } catch {
    return {};
  }
}

export const getPublicSettings = unstable_cache(read, ["site-settings-v1"], { tags: [SITE_SETTINGS_TAG], revalidate: 300 });

/** Uncached read for the admin screen, which must show what was just saved. */
export const readPublicSettings = read;

export async function savePublicSettings(updates: Partial<Record<PublicSettingKey, string | null>>, adminUserId: number) {
  const db = getDb();
  await db.transaction(async (tx) => {
    for (const [key, value] of Object.entries(updates) as [PublicSettingKey, string | null][]) {
      if (!value) {
        await tx.execute(sql`delete from site_settings where key = ${key}`);
        continue;
      }
      await tx
        .insert(siteSettings)
        .values({ key, value, updatedBy: adminUserId })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedBy: adminUserId, updatedAt: new Date() } });
    }
  });
}

const VERIFICATION_RE = /^[A-Za-z0-9_-]{6,120}$/;

/** A pasted `<meta … content="…">` tag or the bare code — both reduce to the code. */
export function verificationCode(raw: string): string {
  const text = raw.trim();
  const fromTag = text.match(/content\s*=\s*["']([^"']+)["']/i)?.[1] ?? text;
  return VERIFICATION_RE.test(fromTag) ? fromTag : "";
}
