import "server-only";

import { unstable_cache } from "next/cache";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { getRuntimeIntegrationSettings } from "@/lib/integrations/settings";
import { SITE_SETTINGS_TAG } from "@/lib/integrations/site-settings";
import type { OnlineProviderId } from "@/lib/config/payments";
import { readyProviders } from "./ready";

/** Uncached — the checkout action and the gateway callbacks. */
export async function readOnlineProviders(): Promise<OnlineProviderId[]> {
  try {
    return readyProviders(await getRuntimeIntegrationSettings(), ORDERS_IN_DB);
  } catch {
    return [];
  }
}

/** Cached for pages (footer, product, payment info); saving the integrations screen revalidates it. */
export const getOnlineProviders = unstable_cache(readOnlineProviders, ["online-providers-v1"], { tags: [SITE_SETTINGS_TAG], revalidate: 300 });
