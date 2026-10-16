import "server-only";

import { eq } from "drizzle-orm";
import { BRAND } from "@/lib/brand";
import { analyticsIdsFromEnvironment, sanitizeAnalyticsIds, type AnalyticsIds } from "@/lib/analytics/config";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { integrationSettings } from "@/lib/db/schema";
import { decryptIntegrationValue, encryptIntegrationValue, isIntegrationEncryptionConfigured } from "./crypto";

export const INTEGRATION_SETTING_KEYS = [
  "operator.botToken",
  "operator.chatId",
  "email.apiKey",
  "analytics.gtmId",
  "analytics.ga4Id",
  "analytics.metaPixelId",
  "analytics.yandexMetrikaId",
  "email.from",
  "email.replyTo",
] as const;

export type IntegrationSettingKey = (typeof INTEGRATION_SETTING_KEYS)[number];
export type IntegrationSettingUpdates = Partial<Record<IntegrationSettingKey, string | null>>;
export type IntegrationStoreStatus = "ready" | "database-unconfigured" | "database-error" | "encryption-key-missing" | "decrypt-error";

export interface RuntimeIntegrationSettings {
  operatorBotToken: string;
  operatorChatId: string;
  resendApiKey: string;
  emailFrom: string;
  emailReplyTo: string;
  analytics: AnalyticsIds;
}

interface LoadedSettings {
  settings: RuntimeIntegrationSettings;
  storedKeys: Set<IntegrationSettingKey>;
  storeStatus: IntegrationStoreStatus;
}

const DEFAULT_EMAIL_FROM = `${BRAND.name} <no-reply@govita.uz>`;
const DEFAULT_EMAIL_REPLY_TO = BRAND.contact.email;
const ENV_ANALYTICS_IDS = analyticsIdsFromEnvironment();

const ENVIRONMENT: Record<IntegrationSettingKey, string> = {
  "operator.botToken": process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "",
  "operator.chatId": process.env.TELEGRAM_CHAT_ID?.trim() ?? "",
  "email.apiKey": process.env.RESEND_API_KEY?.trim() ?? "",
  "analytics.gtmId": ENV_ANALYTICS_IDS.gtm,
  "analytics.ga4Id": ENV_ANALYTICS_IDS.ga4,
  "analytics.metaPixelId": ENV_ANALYTICS_IDS.metaPixel,
  "analytics.yandexMetrikaId": ENV_ANALYTICS_IDS.yandexMetrika,
  "email.from": process.env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM,
  "email.replyTo": process.env.EMAIL_REPLY_TO?.trim() || DEFAULT_EMAIL_REPLY_TO,
};

function isSettingKey(value: string): value is IntegrationSettingKey {
  return (INTEGRATION_SETTING_KEYS as readonly string[]).includes(value);
}

async function loadStoredSettings(): Promise<{
  values: Partial<Record<IntegrationSettingKey, string>>;
  keys: Set<IntegrationSettingKey>;
  status: IntegrationStoreStatus;
}> {
  if (!isDbConfigured) return { values: {}, keys: new Set(), status: "database-unconfigured" };

  let rows: { key: string; ciphertext: string }[];
  try {
    rows = await getDb().select({ key: integrationSettings.key, ciphertext: integrationSettings.ciphertext }).from(integrationSettings);
  } catch {
    // An unapplied migration should not take checkout or email delivery down;
    // environment configuration remains the safe fallback until it is applied.
    return { values: {}, keys: new Set(), status: "database-error" };
  }

  const keys = new Set(rows.map((row) => row.key).filter(isSettingKey));
  if (rows.length > 0 && !isIntegrationEncryptionConfigured()) {
    return { values: {}, keys, status: "encryption-key-missing" };
  }

  const values: Partial<Record<IntegrationSettingKey, string>> = {};
  try {
    for (const row of rows) {
      if (!isSettingKey(row.key)) continue;
      values[row.key] = decryptIntegrationValue(row.ciphertext, row.key);
    }
  } catch {
    // A wrong key or altered ciphertext must never be treated as usable data.
    return { values: {}, keys, status: "decrypt-error" };
  }
  return { values, keys, status: "ready" };
}

function adminAnalyticsAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ANALYTICS_CSP_BUILD_ENABLED === "on";
}

async function loadEffectiveSettings(): Promise<LoadedSettings> {
  const stored = await loadStoredSettings();
  const usableStoredValues = stored.status === "ready" ? stored.values : {};
  const value = (key: IntegrationSettingKey) => usableStoredValues[key] ?? ENVIRONMENT[key];
  const analyticsValue = (key: IntegrationSettingKey) => adminAnalyticsAllowed() ? value(key) : ENVIRONMENT[key];
  return {
    settings: {
      operatorBotToken: value("operator.botToken"),
      operatorChatId: value("operator.chatId"),
      resendApiKey: value("email.apiKey"),
      emailFrom: value("email.from"),
      emailReplyTo: value("email.replyTo"),
      analytics: sanitizeAnalyticsIds({
        gtm: analyticsValue("analytics.gtmId"),
        ga4: analyticsValue("analytics.ga4Id"),
        metaPixel: analyticsValue("analytics.metaPixelId"),
        yandexMetrika: analyticsValue("analytics.yandexMetrikaId"),
      }),
    },
    storedKeys: stored.keys,
    storeStatus: stored.status,
  };
}

/** Effective server-side settings: encrypted admin overrides, then deployment env. */
export async function getRuntimeIntegrationSettings(): Promise<RuntimeIntegrationSettings> {
  return (await loadEffectiveSettings()).settings;
}

export interface IntegrationAdminOverview {
  databaseConfigured: boolean;
  encryptionConfigured: boolean;
  storeStatus: IntegrationStoreStatus;
  operator: {
    configured: boolean;
    botTokenConfigured: boolean;
    botTokenManagedInAdmin: boolean;
    chatId: string;
    chatIdManagedInAdmin: boolean;
  };
  email: {
    configured: boolean;
    apiKeyConfigured: boolean;
    apiKeyManagedInAdmin: boolean;
    from: string;
    fromManagedInAdmin: boolean;
    replyTo: string;
    replyToManagedInAdmin: boolean;
  };
  analytics: AnalyticsIds;
  analyticsManagedInAdmin: Record<keyof AnalyticsIds, boolean>;
  analyticsCspReady: boolean;
}

/** Safe-to-render status only. Secret values are deliberately not returned. */
export async function getIntegrationAdminOverview(): Promise<IntegrationAdminOverview> {
  const loaded = await loadEffectiveSettings();
  const settings = loaded.settings;
  const adminOverride = (key: IntegrationSettingKey) => loaded.storeStatus === "ready" && loaded.storedKeys.has(key) && (!key.startsWith("analytics.") || adminAnalyticsAllowed());
  return {
    databaseConfigured: isDbConfigured,
    encryptionConfigured: isIntegrationEncryptionConfigured(),
    storeStatus: loaded.storeStatus,
    operator: {
      configured: Boolean(settings.operatorBotToken && settings.operatorChatId),
      botTokenConfigured: Boolean(settings.operatorBotToken),
      botTokenManagedInAdmin: adminOverride("operator.botToken"),
      chatId: settings.operatorChatId,
      chatIdManagedInAdmin: adminOverride("operator.chatId"),
    },
    email: {
      configured: Boolean(settings.resendApiKey),
      apiKeyConfigured: Boolean(settings.resendApiKey),
      apiKeyManagedInAdmin: adminOverride("email.apiKey"),
      from: settings.emailFrom,
      fromManagedInAdmin: adminOverride("email.from"),
      replyTo: settings.emailReplyTo,
      replyToManagedInAdmin: adminOverride("email.replyTo"),
    },
    analytics: settings.analytics,
    analyticsManagedInAdmin: {
      gtm: adminOverride("analytics.gtmId"),
      ga4: adminOverride("analytics.ga4Id"),
      metaPixel: adminOverride("analytics.metaPixelId"),
      yandexMetrika: adminOverride("analytics.yandexMetrikaId"),
    },
    // CSP is baked at build time; analytics settings can be changed in-panel
    // only when this build explicitly allowed all supported vendor origins.
    analyticsCspReady: adminAnalyticsAllowed(),
  };
}

/** Saves or removes encrypted admin overrides as one transaction. */
export async function saveIntegrationSettings(updates: IntegrationSettingUpdates, adminUserId: number): Promise<void> {
  if (!isDbConfigured) throw new Error("DATABASE_URL is not configured");
  if (!isIntegrationEncryptionConfigured()) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY is missing or invalid");
  }

  const db = getDb();
  await db.transaction(async (tx) => {
    for (const [key, value] of Object.entries(updates) as [IntegrationSettingKey, string | null][]) {
      if (value === null) {
        await tx.delete(integrationSettings).where(eq(integrationSettings.key, key));
        continue;
      }
      const ciphertext = encryptIntegrationValue(value, key);
      await tx
        .insert(integrationSettings)
        .values({ key, ciphertext, updatedBy: adminUserId })
        .onConflictDoUpdate({
          target: integrationSettings.key,
          set: { ciphertext, updatedBy: adminUserId, updatedAt: new Date() },
        });
    }
  });
}
