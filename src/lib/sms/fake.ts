import { isLiveDeployment } from "@/lib/config/live";
import { redactPhone } from "@/lib/privacy";
import { countSms } from "./segments";
import type { SmsProvider, SmsSendResult } from "./types";

/*
  A pretend gateway for local end-to-end runs: SMS_FAKE=1 makes every send
  succeed without leaving the machine. The text itself is already stored on
  the outbound_messages row, so the log line carries only a masked number.

  It can never be on where customers are: on a live deployment
  (GOVITA_PRODUCTION=1 / Vercel production) the flag is ignored and the real
  provider — or none — is used.
*/

export function smsFakeEnabled(): boolean {
  return process.env.SMS_FAKE === "1" && !isLiveDeployment();
}

let counter = 0;

export class FakeSmsProvider implements SmsProvider {
  readonly name = "fake";
  async send(phoneE164: string, text: string): Promise<SmsSendResult> {
    const { parts, encoding } = countSms(text);
    counter += 1;
    console.log(`[sms:fake] → ${redactPhone(phoneE164)} · ${parts} part(s) ${encoding}`);
    return { ok: true, id: `fake-${Date.now()}-${counter}` };
  }
}
