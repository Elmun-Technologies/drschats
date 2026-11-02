import { CARD_BRANDS, type PaymentBrandId } from "@/lib/config/payment-brands";

/*
  Which online payment methods the shop offers is a runtime fact now: the
  provider is switched on and its keys are entered in /admin/integrations,
  and only Payme and Click have a complete server-side flow (lib/payments:
  verified callbacks, idempotent transactions, the order marked paid in the
  same transaction). The list is read on the server
  (lib/payments/availability.ts) and handed to the pages and the checkout
  form; this module only holds the pure parts both sides share.

  Uzum has no flow yet and is never offered, whatever is configured.
*/

export type PaymentProviderId = "payme" | "click" | "uzum";
export type OnlineProviderId = "payme" | "click";
export type PaymentMethod = "online" | "cod";

export const ONLINE_PROVIDER_IDS: readonly OnlineProviderId[] = ["payme", "click"];

export const ONLINE_PROVIDER_LABELS: Record<OnlineProviderId, string> = { payme: "Payme", click: "Click" };

export function isOnlineProviderId(value: unknown): value is OnlineProviderId {
  return value === "payme" || value === "click";
}

/* Card-network marks appear only next to a provider that can actually take the card. */
export function paymentMarks(providers: readonly OnlineProviderId[]): PaymentBrandId[] {
  return providers.length ? [...providers, ...CARD_BRANDS] : [];
}
