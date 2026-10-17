export type SmsSendResult = { ok: true; id: string | null } | { ok: false; retryable: boolean; error: string };

/** One SMS gateway. `phoneE164` is "+998XXXXXXXXX" (other formats with 9+ digits are accepted). */
export interface SmsProvider {
  readonly name: string;
  send(phoneE164: string, text: string): Promise<SmsSendResult>;
}
