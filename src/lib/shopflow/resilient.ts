import type { Locale } from "@/lib/i18n/routing";
import type {
  Category,
  OrderRequest,
  OrderResult,
  Product,
  ProductListParams,
  ProductListResult,
  Promotion,
  ShopflowClient,
  UpsellOffer,
} from "./types";

/*
  Read-path resilience.

  Every catalog read used to propagate its error straight into the React tree.
  One slow or malformed Shopflow response therefore took down whole pages at
  runtime (the shop rendered the global error boundary) and aborted the
  production build during prerendering — a storefront that cannot show a
  catalog should still show its header, navigation and contact details.

  So reads degrade to an empty result and log the cause; the pages already
  handle empty data with their own empty states. Writes are NOT wrapped:
  a failed order must reach the caller.
*/

function report(operation: string, error: unknown) {
  console.error(`[shopflow] ${operation} failed:`, error);
}

export function withResilientReads(client: ShopflowClient): ShopflowClient {
  return {
    async getCategories(locale: Locale): Promise<Category[]> {
      try {
        return await client.getCategories(locale);
      } catch (error) {
        report("getCategories", error);
        return [];
      }
    },

    async getProducts(params: ProductListParams): Promise<ProductListResult> {
      try {
        return await client.getProducts(params);
      } catch (error) {
        report("getProducts", error);
        return { items: [], total: 0, page: params.page ?? 1, pageSize: params.pageSize ?? 0 };
      }
    },

    async getProduct(slug: string, locale: Locale): Promise<Product | null> {
      try {
        return await client.getProduct(slug, locale);
      } catch (error) {
        report("getProduct", error);
        return null;
      }
    },

    async getUpsells(productId: string, locale: Locale): Promise<UpsellOffer[]> {
      try {
        return await client.getUpsells(productId, locale);
      } catch (error) {
        report("getUpsells", error);
        return [];
      }
    },

    async getPromotions(locale: Locale): Promise<Promotion[]> {
      try {
        return await client.getPromotions(locale);
      } catch (error) {
        report("getPromotions", error);
        return [];
      }
    },

    createOrder(payload: OrderRequest): Promise<OrderResult> {
      return client.createOrder(payload);
    },
  };
}
