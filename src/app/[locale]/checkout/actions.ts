"use server";

import { shopflow } from "@/lib/shopflow";
import { orderRequestSchema } from "@/lib/shopflow/schemas";
import type { OrderRequest, OrderResult } from "@/lib/shopflow/types";

/**
 * Server action: validate the zayavka and forward it to Shopflow. Validation
 * happens server-side so a malformed client payload can never reach the API.
 */
export async function submitOrder(payload: OrderRequest): Promise<OrderResult> {
  const parsed = orderRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: "Invalid order payload." };
  }
  try {
    return await shopflow.createOrder(parsed.data as OrderRequest);
  } catch (err) {
    console.error("[checkout] createOrder failed", err);
    return { ok: false, message: "Could not submit order. Please try again." };
  }
}
