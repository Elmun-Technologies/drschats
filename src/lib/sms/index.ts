import "server-only";

import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { EskizProvider } from "./eskiz";
import { FakeSmsProvider, smsFakeEnabled } from "./fake";
import type { SmsProvider } from "./types";

export type { SmsProvider, SmsSendResult } from "./types";

export interface ResolvedSms {
  provider: SmsProvider | null;
  transliterate: boolean;
}

/**
 * The SMS gateway in force: the fake one for local runs, Eskiz when its
 * account is saved in /admin/integrations (or ESKIZ_* env), otherwise none —
 * and a message that needs SMS is then skipped, not queued forever.
 */
export async function resolveSmsProvider(): Promise<ResolvedSms> {
  const { sms } = await getRuntimeIntegrationSettings();
  if (smsFakeEnabled()) return { provider: new FakeSmsProvider(), transliterate: sms.transliterate };
  if (!sms.email || !sms.password) return { provider: null, transliterate: sms.transliterate };
  return { provider: new EskizProvider({ email: sms.email, password: sms.password, sender: sms.sender }), transliterate: sms.transliterate };
}
