import type { Locale } from "@/lib/i18n/routing";
import type {
  Category,
  Product,
  Promotion,
  ShopflowClient,
  ProductListParams,
  ProductListResult,
  UpsellOffer,
  OrderRequest,
  OrderResult,
} from "./types";
import {
  categorySchema,
  productSchema,
  productListResultSchema,
  promotionSchema,
  upsellOfferSchema,
  orderResultSchema,
} from "./schemas";
import { z } from "zod";

/*
  Real Shopflow adapter.

  The Shopflow platform is built; the API spec/docs are pending. The endpoint
  paths below are placeholders — adjust them to the documented routes when the
  spec arrives. Everything else (validation, error handling, the contract the
  rest of the app depends on) is already in place, so wiring up the real API is
  a localized change to this file only.
*/

const BASE = process.env.SHOPFLOW_API_URL ?? "";
const KEY = process.env.SHOPFLOW_API_KEY ?? "";

async function api<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
      ...init?.headers,
    },
    // Products/categories can be cached & revalidated; orders use POST (no cache).
    next: init?.method === "POST" ? undefined : { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Shopflow API ${path} failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return schema.parse(json);
}

export class HttpShopflowClient implements ShopflowClient {
  async getCategories(locale: Locale): Promise<Category[]> {
    return api(`/api/v1/categories?locale=${locale}`, z.array(categorySchema));
  }

  async getProducts(params: ProductListParams): Promise<ProductListResult> {
    const q = new URLSearchParams();
    q.set("locale", params.locale);
    if (params.category) q.set("category", params.category);
    if (params.search) q.set("search", params.search);
    if (params.origin) q.set("origin", params.origin);
    if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
    if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
    if (params.sort) q.set("sort", params.sort);
    if (params.page) q.set("page", String(params.page));
    if (params.pageSize) q.set("pageSize", String(params.pageSize));
    return api(`/api/v1/products?${q.toString()}`, productListResultSchema);
  }

  async getProduct(slug: string, locale: Locale): Promise<Product | null> {
    try {
      return await api(`/api/v1/products/${slug}?locale=${locale}`, productSchema);
    } catch {
      return null;
    }
  }

  async getUpsells(productId: string, locale: Locale): Promise<UpsellOffer[]> {
    return api(
      `/api/v1/products/${productId}/upsells?locale=${locale}`,
      z.array(upsellOfferSchema),
    );
  }

  async getPromotions(locale: Locale): Promise<Promotion[]> {
    return api(`/api/v1/promotions?locale=${locale}`, z.array(promotionSchema));
  }

  async createOrder(payload: OrderRequest): Promise<OrderResult> {
    return api(`/api/v1/orders`, orderResultSchema, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}
