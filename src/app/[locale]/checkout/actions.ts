"use server";

import { headers } from "next/headers";
import { shopflow } from "@/lib/shopflow";
import { orderRequestSchema } from "@/lib/shopflow/schemas";
import type { OrderRequest, OrderResult } from "@/lib/shopflow/types";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { notifyOperator } from "@/lib/notifications/operator";
import { siteOrigin } from "@/lib/email/config";
import { sendCampaign } from "@/lib/email/send";
import { requestEmailOptIn } from "@/app/actions/emailOptIn";
import { formatMoney } from "@/lib/utils";

const RATE = { limit: 10, windowMs: 10 * 60 * 1000 };

async function notifyOperatorOfOrder(order: OrderRequest, orderId: string) {
  const items = order.items.map((i) => `  • ${i.name} × ${i.quantity}`).join("\n");
  const text = [
    `🛒 *Yangi buyurtma #${orderId}*`,
    `👤 ${order.customer.name} — ${order.customer.phone}`,
    order.customer.email ? `✉️ ${order.customer.email}` : "",
    `📍 ${order.delivery.region}, ${order.delivery.address}`,
    `🚚 ${order.delivery.method}`,
    order.payment
      ? `💳 ${order.payment.method === "online" ? `Onlayn to'lov: ${order.payment.provider}` : "Yetkazishda to'lov"}`
      : "",
    `\n${items}`,
    `\n💰 Jami: ${order.totals.total.toLocaleString()} so'm`,
  ]
    .filter(Boolean)
    .join("\n");

  await notifyOperator(text, { markdown: true });
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

export async function submitOrder(payload: OrderRequest): Promise<OrderResult> {
  const hdrs = await headers();
  if (!withinRateLimit("checkout", clientIp(hdrs), RATE)) {
    return { ok: false, message: "Too many requests. Please try again later." };
  }

  const parsed = orderRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: "Invalid order payload." };
  }

  try {
    const order = parsed.data as OrderRequest;
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
    }
    return result;
  } catch (err) {
    console.error("[checkout] createOrder failed", err);
    return { ok: false, message: "Could not submit order. Please try again." };
  }
}
