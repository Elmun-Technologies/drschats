import { CARD_BRANDS, type PaymentBrandId } from "@/lib/config/payment-brands";

/*
  Merchant IDs do not implement a payment integration. A provider may be offered
  only after this app can hand the customer off to the gateway, verify an
  authenticated payment callback, and update the order safely. None of the
  Payme, Click, or Uzum flows is implemented yet, so this list intentionally
  stays empty and checkout remains cash-on-delivery only—even if an ID exists.

  Add a provider here only alongside its complete server-side integration,
  verified callback handling, idempotent order updates, and tests. Never enable
  checkout from the presence of an environment variable alone.
*/

export type PaymentProviderId = "payme" | "click" | "uzum";
export type PaymentMethod = "online" | "cod";

export interface PaymentProvider {
  id: PaymentProviderId;
  label: string;
  /** A public merchant identifier is present in build/deploy configuration. */
  merchantIdConfigured: boolean;
  /** The full payment flow is implemented and the provider can be offered. */
  configured: boolean;
}

const PROVIDERS_WITH_END_TO_END_FLOW: readonly PaymentProviderId[] = [];

function provider(id: PaymentProviderId, label: string, envValue: string | undefined): PaymentProvider {
  const merchantIdConfigured = Boolean(envValue?.trim());
  const configured = merchantIdConfigured && PROVIDERS_WITH_END_TO_END_FLOW.includes(id);
  return { id, label, merchantIdConfigured, configured };
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  provider("payme", "Payme", process.env.NEXT_PUBLIC_PAYME_MERCHANT_ID),
  provider("click", "Click", process.env.NEXT_PUBLIC_CLICK_MERCHANT_ID),
  provider("uzum", "Uzum", process.env.NEXT_PUBLIC_UZUM_MERCHANT_ID),
];

export const ONLINE_PROVIDERS = PAYMENT_PROVIDERS.filter((p) => p.configured);

/** True only when a complete, verified online-payment flow is enabled. */
export function onlinePaymentAvailable(): boolean {
  return ONLINE_PROVIDERS.length > 0;
}

/** The checkout server action uses the same allowlist as the customer-facing UI. */
export function isOnlineProviderAvailable(providerId?: PaymentProviderId): boolean {
  return ONLINE_PROVIDERS.some((provider) => provider.id === providerId);
}

/*
  Card-network marks are shown only when at least one online provider has a
  complete flow. Until then, no card brand is advertised as an accepted method.
*/
export const ONLINE_PAYMENT_MARKS: PaymentBrandId[] = ONLINE_PROVIDERS.length
  ? [...ONLINE_PROVIDERS.map((p) => p.id), ...CARD_BRANDS]
  : [];
