import type { ShopflowClient } from "./types";
import { MockShopflowClient } from "./mock";
import { CatalogEngine } from "@/lib/catalog/engine";
import { loadDbCatalog, saveOrderToDb } from "@/lib/catalog/db";
import { isDbConfigured } from "@/lib/db/client";
import { HttpShopflowClient } from "./http";
import { withResilientReads } from "./resilient";

export * from "./types";
export { listAllSlugs } from "./mock";

/*
  Factory: the whole app imports `shopflow` from here and only ever depends on
  the ShopflowClient interface.

  The built-in catalogue is the source unless CATALOG_SOURCE=shopflow is set
  explicitly. It used to follow SHOPFLOW_MODE, and production still carried a
  stale SHOPFLOW_MODE=http from an early setup: once the code honoured it, every
  read went to an API that does not exist and the live site lost its products,
  categories and menus at once. A switch that empties the shop must be one
  nobody can flip by accident.
*/
let client: ShopflowClient | null = null;

const USE_SHOPFLOW = process.env.CATALOG_SOURCE === "shopflow";

if (!USE_SHOPFLOW && process.env.SHOPFLOW_MODE === "http") {
  console.warn("[catalog] SHOPFLOW_MODE=http is ignored — the built-in catalogue is used. Set CATALOG_SOURCE=shopflow to switch.");
}

/*
  Order of preference: an explicit external Shopflow, then the admin-managed
  database (DATABASE_URL), then the built-in catalogue.
*/
export function getShopflow(): ShopflowClient {
  if (client) return client;
  client = withResilientReads(
    USE_SHOPFLOW
      ? new HttpShopflowClient()
      : isDbConfigured
        ? new CatalogEngine(loadDbCatalog, saveOrderToDb)
        : new MockShopflowClient(),
  );
  return client;
}

export const shopflow = getShopflow();

/**
 * True when no system keeps the order: no external Shopflow and no database.
 * The checkout then treats the operator's Telegram message as the only record.
 */
export const SHOPFLOW_IS_MOCK = !USE_SHOPFLOW && !isDbConfigured;
