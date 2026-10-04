/*
  Payment providers, and whether we can actually take a payment yet.

  The checkout used to print a row of provider names ("Click", "Payme",
  "Uzcard", "Humo") that carried no merchant credentials and started no
  payment: the order form collected a phone number and an operator rang back to
  arrange the money. Advertising that a shop takes Payme when nothing is wired
  to Payme is the sort of thing a payment provider notices.

  Each provider below switches itself on from the environment. Until a merchant
  id is present the option is rendered as "coming soon" and is not selectable —
  so the checkout can never promise a payment route the shop cannot complete.
  With a merchant id set, the customer picks a provider, the order is written
  with that choice, and the provider's own page finishes the payment without a
  confirmation call.
*/

export type PaymentProviderId = "payme" | "click" | "uzum";
export type PaymentMethod = "online" | "cod";

export interface PaymentProvider {
  id: PaymentProviderId;
  label: string;
  /** Merchant identifier from the provider's dashboard. */
  merchantId: string;
  configured: boolean;
}

function provider(id: PaymentProviderId, label: string, envValue: string | undefined): PaymentProvider {
  const merchantId = (envValue ?? "").trim();
  return { id, label, merchantId, configured: merchantId.length > 0 };
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  provider("payme", "Payme", process.env.NEXT_PUBLIC_PAYME_MERCHANT_ID),
  provider("click", "Click", process.env.NEXT_PUBLIC_CLICK_MERCHANT_ID),
  provider("uzum", "Uzum", process.env.NEXT_PUBLIC_UZUM_MERCHANT_ID),
];

export const ONLINE_PROVIDERS = PAYMENT_PROVIDERS.filter((p) => p.configured);

/** True when at least one online provider can take a payment today. */
export function onlinePaymentAvailable(): boolean {
  return ONLINE_PROVIDERS.length > 0;
}
