import type { WaitChannel, WaitKind } from "@/lib/db/schema";

/*
  The waitlist's delivery contract. A channel takes one message and says
  whether it accepted it; the dispatcher (waitlist.ts) tries the customer
  channels in order and hands whatever none of them took to the operator,
  who calls. A new channel (SMS in the next phase) is one more Notifier in
  `customerChannels()` — nothing else changes.
*/

export interface WaitMessage {
  requestId: number;
  kind: WaitKind;
  locale: "uz" | "ru";
  /** Normalised (998XXXXXXXXX when Uzbek) — for SMS and the operator's call list. */
  phone: string;
  phone9: string;
  /** Known Telegram chat (stored with the request or linked since); null = look it up. */
  chatId: number | null;
  productName: string;
  price: number;
  /** The price the customer saw when asking (price_drop). */
  before: number | null;
  /** Product page with UTM tags. */
  url: string;
}

export type Outcome = { ok: true } | { ok: false; reason: "not_configured" | "no_recipient" | "failed" };

export interface Notifier {
  readonly channel: Exclude<WaitChannel, "operator" | "manual">;
  send(message: WaitMessage): Promise<Outcome>;
}

/** The last resort: one message to the shop listing who to call. */
export interface FallbackNotifier {
  readonly channel: "operator";
  sendAll(messages: WaitMessage[]): Promise<Outcome>;
}
