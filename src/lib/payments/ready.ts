import { ONLINE_PROVIDER_IDS, type OnlineProviderId } from "@/lib/config/payments";

export interface ProviderSettings {
  payme: { enabled: boolean; testMode: boolean; merchantId: string; key: string; testKey: string };
  click: { enabled: boolean; serviceId: string; merchantId: string; secretKey: string };
}

/*
  A provider is offered when it is switched on, its keys are present, and
  orders live in our database (a payment must find its order, and the order
  must be marked paid in the same transaction). Payme's key is the sandbox one
  in test mode.
*/
export function readyProviders(settings: ProviderSettings, ordersInDb: boolean): OnlineProviderId[] {
  if (!ordersInDb) return [];
  const ready: Record<OnlineProviderId, boolean> = {
    payme: settings.payme.enabled && Boolean(settings.payme.merchantId && (settings.payme.testMode ? settings.payme.testKey : settings.payme.key)),
    click: settings.click.enabled && Boolean(settings.click.serviceId && settings.click.merchantId && settings.click.secretKey),
  };
  return ONLINE_PROVIDER_IDS.filter((id) => ready[id]);
}
