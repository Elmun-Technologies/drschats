import type { ShopflowClient } from "./types";
import { MockShopflowClient } from "./mock";
import { HttpShopflowClient } from "./http";
import { withResilientReads } from "./resilient";

export * from "./types";
export { listAllSlugs } from "./mock";

/*
  Factory: the whole app imports `shopflow` from here and only ever depends on
  the ShopflowClient interface. Flip SHOPFLOW_MODE=http (with API_URL/API_KEY)
  to switch from sample data to the real Shopflow platform — no other code
  changes required.
*/
let client: ShopflowClient | null = null;

export function getShopflow(): ShopflowClient {
  if (client) return client;
  // FORCE MOCK MODE FOR DEMO: 
  // const mode = process.env.SHOPFLOW_MODE ?? "mock";
  const mode: "mock" | "http" = "mock"; 
  client = withResilientReads(
    mode === "http" ? new HttpShopflowClient() : new MockShopflowClient(),
  );
  return client;
}

export const shopflow = getShopflow();
