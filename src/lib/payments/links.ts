import "server-only";

import { SITE_URL } from "@/lib/config/site";
import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { orderTrackToken } from "@/lib/messaging/tokens";
import type { OnlineProviderId } from "@/lib/config/payments";
import { readOnlineProviders } from "./availability";
import { clickPayUrl } from "./click";
import { paymeCheckoutUrl } from "./payme";

/** Where the gateway sends the customer back: the order's tracking page, which shows the payment status. */
export function paymentReturnUrl(number: string, locale: string): string {
  return `${SITE_URL}/${locale === "ru" ? "ru" : "uz"}/track/${orderTrackToken(number)}`;
}

/**
 * The gateway page for an order, or null when the provider is not ready.
 * Built on the server from the order's saved total — never from the browser.
 */
export async function paymentUrl(provider: OnlineProviderId, order: { number: string; total: number; locale: string }): Promise<string | null> {
  if (!(await readOnlineProviders()).includes(provider)) return null;
  const { payme, click } = await getRuntimeIntegrationSettings();
  const returnUrl = paymentReturnUrl(order.number, order.locale);
  if (provider === "payme") {
    return paymeCheckoutUrl({
      merchantId: payme.merchantId,
      account: payme.account,
      orderNumber: order.number,
      amount: order.total * 100,
      locale: order.locale === "ru" ? "ru" : "uz",
      returnUrl,
      testMode: payme.testMode,
    });
  }
  return clickPayUrl({ serviceId: click.serviceId, merchantId: click.merchantId, orderNumber: order.number, amount: order.total, returnUrl });
}
