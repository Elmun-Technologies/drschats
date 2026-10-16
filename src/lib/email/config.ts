import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/config/site";
import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";

/*
  Email configuration resolves encrypted admin overrides first and deployment
  environment settings second. Missing keys remain a safe no-op; checkout must
  never fail because the mail provider is unavailable or unconfigured.
*/

export interface EmailConfiguration {
  apiKey: string;
  from: string;
  replyTo: string;
}

export async function getEmailConfig(): Promise<EmailConfiguration> {
  const settings = await getRuntimeIntegrationSettings();
  return {
    apiKey: settings.resendApiKey,
    from: settings.emailFrom || `${BRAND.name} <no-reply@govita.uz>`,
    replyTo: settings.emailReplyTo || BRAND.contact.email,
  };
}

export async function isEmailConfigured(): Promise<boolean> {
  return Boolean((await getEmailConfig()).apiKey);
}

/**
 * Absolute site origin, needed because every link in an email must be absolute.
 * Falls back to the production domain, not localhost.
 */
export function siteOrigin(): string {
  return SITE_URL;
}
