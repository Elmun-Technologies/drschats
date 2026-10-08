"use server";

import { headers } from "next/headers";
import { shopflow } from "@/lib/shopflow";
import { orderRequestSchema } from "@/lib/shopflow/schemas";
import { repriceOrder } from "@/lib/cart/reprice";
import { ONLINE_PROVIDERS } from "@/lib/config/payments";
import type { OrderRequest, OrderResult } from "@/lib/shopflow/types";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { notifyOperator } from "@/lib/notifications/operator";
import { siteOrigin } from "@/lib/email/config";
import { sendCampaign } from "@/lib/email/send";
import { requestEmailOptIn } from "@/app/actions/emailOptIn";
import { formatMoney } from "@/lib/utils";

const RATE = { limit: 10, windowMs: 10 * 60 * 1000 };

async function notifyOperatorOfOrder(order: OrderRequest, orderId: string) {
  const items = order.items
    .map((i) => `  • ${i.name} × ${i.quantity}${i.upsellDiscountPercent ? ` (−${i.upsellDiscountPercent}%)` : ""}${i.subscription ? ` · obuna ${i.subscription.intervalDays} kun` : ""}`)
    .join("\n");
  const text = [
    `🛒 Yangi buyurtma #${orderId}`,
    `👤 ${order.customer.name} — ${order.customer.phone}`,
    order.customer.email ? `✉️ ${order.customer.email}` : "",
    `📍 ${order.delivery.region}, ${order.delivery.address}`,
    `🚚 ${order.delivery.method}`,
    order.payment
      ? `💳 ${order.payment.method === "online" ? `Onlayn to'lov: ${order.payment.provider}` : "Yetkazishda to'lov"}`
      : "",
    `\n${items}`,
    order.totals.discount > 0 ? `🏷 Chegirma: ${formatMoney(order.totals.discount, "uz")}` : "",
    `🚚 Yetkazish: ${formatMoney(order.totals.shipping, "uz")}`,
    `💰 Jami: ${formatMoney(order.totals.total, "uz")}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Plain text: a "_" or "*" in a customer's name or address would make
  // Telegram reject a Markdown message, and the order would never reach anyone.
  await notifyOperator(text);
}

/**
 * The customer's copy of the order.
 *
 * Transactional, so it goes out on the strength of the order itself and does
 * not consult any marketing consent — and carries no unsubscribe link, because
 * there is nothing here to unsubscribe from.
 */
async function emailOrderConfirmation(order: OrderRequest, orderId: string) {
  const email = order.customer.email;
  if (!email) return;

  await sendCampaign({
    to: email,
    locale: order.locale,
    campaign: {
      type: "order",
      orderId,
      customerName: order.customer.name,
      items: order.items.map((item) => ({
        name: `${item.name} × ${item.quantity}`,
        url: `${siteOrigin()}/${order.locale}/product/${item.slug}`,
        price: formatMoney(item.unitPrice * item.quantity, order.locale),
      })),
      total: formatMoney(order.totals.total, order.locale),
      orderUrl: `${siteOrigin()}/${order.locale}/checkout/success?order=${encodeURIComponent(orderId)}`,
    },
  });
}

export type OrderError = "rate_limited" | "invalid" | "unknown_product" | "out_of_stock" | "invalid_offer" | "payment_unavailable" | "failed";

export async function submitOrder(payload: OrderRequest): Promise<OrderResult & { error?: OrderError; total?: number }> {
  const hdrs = await headers();
  if (!withinRateLimit("checkout", clientIp(hdrs), RATE)) {
    return { ok: false, error: "rate_limited" };
  }

  const parsed = orderRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }
  const request = parsed.data as OrderRequest;

  // An online payment needs a provider the shop is actually connected to.
  if (request.payment?.method === "online" && !ONLINE_PROVIDERS.some((p) => p.id === request.payment?.provider)) {
    return { ok: false, error: "payment_unavailable" };
  }

  try {
    /*
      Prices, discounts and totals are the server's, not the browser's: each
      product is read from the catalogue and the order is priced again
      (lib/cart/reprice.ts). The request only says what to buy.
    */
    const slugs = [...new Set(request.items.map((i) => i.slug))];
    const [products, promotions] = await Promise.all([
      Promise.all(slugs.map((slug) => shopflow.getProduct(slug, request.locale))),
      shopflow.getPromotions(request.locale).catch(() => []),
    ]);
    const priced = repriceOrder(request, products.filter((p): p is NonNullable<typeof p> => p !== null), promotions);
    if (!priced.ok) return { ok: false, error: priced.error };
    const order = priced.order;

    const result = await shopflow.createOrder(order);
    if (result.ok && result.orderId) {
      /*
        All three awaited, not fire-and-forget. A serverless function is frozen
        the moment the response is returned, so anything still in flight at that
        point is dropped — an order confirmation that races the shutdown is one
        that never arrives, and the customer is left with nothing but a success
        page. Promise.all keeps them concurrent, which is the part that matters
        for latency; the await is what makes them actually happen.

        None of the three can fail the order: notifyOperator and sendCampaign
        both swallow their own errors, and requestEmailOptIn records a
        preference that is worth less than the sale already made.
      */
      await Promise.all([
        notifyOperatorOfOrder(order, result.orderId),
        emailOrderConfirmation(order, result.orderId),
        order.customer.email && order.customer.marketingOptIn
          ? requestEmailOptIn({
              email: order.customer.email,
              name: order.customer.name,
              locale: order.locale,
              source: "checkout",
            })
          : Promise.resolve(),
      ]);
      return { ...result, total: order.totals.total };
    }
    return { ...result, error: result.ok ? undefined : "failed" };
  } catch (err) {
    console.error("[checkout] createOrder failed", err instanceof Error ? err.message : "unknown error");
    return { ok: false, error: "failed" };
  }
}
