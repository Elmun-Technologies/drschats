"use server";

import { cookies, headers } from "next/headers";
import { ORDERS_IN_DB, SHOPFLOW_IS_MOCK, shopflow } from "@/lib/shopflow";
import { verifyInitData } from "@/lib/bot/webapp";
import { announceOrderStatus, attachOrderChat } from "@/lib/bot/store";
import { isLiveDeployment } from "@/lib/config/live";
import { isOperatorChannelConfigured } from "@/lib/notifications/operator";
import { orderRequestSchema } from "@/lib/shopflow/schemas";
import { repriceOrder, type OfferContext } from "@/lib/cart/reprice";
import { lineTotal } from "@/lib/cart/pricing";
import { getPrograms } from "@/lib/content/programs";
import { isOnlineProviderAvailable } from "@/lib/config/payments";
import type { OrderRequest, OrderResult, Product } from "@/lib/shopflow/types";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/email/config";
import { sendCampaign } from "@/lib/email/send";
import { requestEmailOptIn } from "@/app/actions/emailOptIn";
import { formatMoney } from "@/lib/utils";
import { upsellPool } from "@/lib/upsell/pool";
import { getCommerceSettings } from "@/lib/commerce/server";
import { pricingRulesOf } from "@/lib/commerce/settings";
import { linkOrderToVisitor, visitorIdFrom, VISITOR_COOKIE } from "@/lib/journey/collect";
import { placeOrder } from "@/lib/promo/server";
import { discountAdjustment, phone9Of, pointsSpent, type PromoReason } from "@/lib/promo/rules";
import { notifyOperatorOfOrder } from "@/lib/orders/notify";
import { readLoyaltyRules } from "@/lib/loyalty/settings";
import { signReceipt } from "@/lib/loyalty/receipt";
import { both, earnLaterLine, joinLines, spentLine } from "@/lib/loyalty/messages";
import { ensureReferralCode } from "@/lib/referral/server";

const RATE = { limit: 10, windowMs: 10 * 60 * 1000 };

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
        price: formatMoney(lineTotal({ price: item.unitPrice, quantity: item.quantity, upsellDiscountPercent: item.upsellDiscountPercent }), order.locale),
      })),
      total: formatMoney(order.totals.total, order.locale),
      orderUrl: `${siteOrigin()}/${order.locale}/checkout/success?order=${encodeURIComponent(orderId)}`,
    },
  });
}

/*
  The offers this order could have come from: programmes (static content) and
  the product-page upsell rail beside each full-price line. Read from the same
  sources the pages that made the offers read, so a discount is accepted only
  where the shop actually showed it.
*/
async function offerContext(order: OrderRequest, products: Product[]): Promise<OfferContext> {
  const programs = new Map<string, Set<number>>();
  for (const program of getPrograms(order.locale)) {
    if (!program.discountPercent) continue;
    for (const slug of program.productSlugs) {
      if (!programs.has(slug)) programs.set(slug, new Set());
      programs.get(slug)!.add(program.discountPercent);
    }
  }

  const rail = new Map<string, Set<number>>();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const anchors = order.items.filter((i) => !i.upsellDiscountPercent).map((i) => bySlug.get(i.slug)?.id).filter(Boolean) as string[];
  const [lists, pool] = await Promise.all([
    Promise.all(anchors.map((id) => shopflow.getUpsells(id, order.locale).catch(() => []))),
    upsellPool(order.locale).catch(() => [] as Product[]),
  ]);
  for (const offer of lists.flat()) {
    if (!rail.has(offer.product.slug)) rail.set(offer.product.slug, new Set());
    rail.get(offer.product.slug)!.add(offer.discountPercent);
  }
  const ladderPool = new Set(pool.map((p) => p.slug));
  return { programs, rail, ladderPool };
}

/*
  The club bot's "order received" message. An order placed inside the
  Telegram Mini App carries signed initData: its chat id is kept on the order
  so the customer is told about every status change there. Orders from the
  website reach Telegram too when their phone is linked to the bot.
*/
async function clubBotReceipt(
  orderId: string,
  user: ReturnType<typeof verifyInitData>,
  loyalty: { earn: number; spent: number },
): Promise<void> {
  if (!ORDERS_IN_DB) return;
  try {
    if (user) await attachOrderChat(orderId, user.id);
    const extra = joinLines(
      loyalty.spent > 0 ? both((l) => spentLine(loyalty.spent, l)) : null,
      loyalty.earn > 0 ? both((l) => earnLaterLine(loyalty.earn, l)) : null,
    );
    await announceOrderStatus(orderId, "new", extra);
  } catch (err) {
    console.error("[checkout] club bot receipt failed:", (err as Error).message);
  }
}

/*
  The success page's signed note about this order's points and the
  customer's referral code (lib/loyalty/receipt.ts). A code exists only for a
  phone with a delivered order — a first-time customer gets theirs after delivery.
*/
async function loyaltyReceipt(orderId: string, order: OrderRequest, earn: number): Promise<string | undefined> {
  try {
    const rules = await readLoyaltyRules();
    const phone9 = phone9Of(order.customer.phone);
    const code = rules.referral.enabled && phone9 ? await ensureReferralCode(phone9) : null;
    const spent = pointsSpent(order.totals.adjustments);
    if (!earn && !spent && !code) return undefined;
    return signReceipt({ o: orderId, e: earn, s: spent, ...(code ? { r: code } : {}) });
  } catch (err) {
    console.error("[checkout] loyalty receipt skipped:", (err as Error).message);
    return undefined;
  }
}

export type OrderError =
  | "rate_limited" | "invalid" | "unknown_product" | "out_of_stock" | "insufficient_stock" | "invalid_offer" | "payment_unavailable" | "promo_invalid" | "points_invalid" | "failed";

export async function submitOrder(
  payload: OrderRequest,
): Promise<OrderResult & { error?: OrderError; total?: number; slug?: string; coupon?: string; promoReason?: PromoReason; receipt?: string }> {
  const hdrs = await headers();
  if (!withinRateLimit("checkout", clientIp(hdrs), RATE)) {
    return { ok: false, error: "rate_limited" };
  }

  const parsed = orderRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }
  const { telegram, ...request } = parsed.data as OrderRequest;
  /*
    A signed Mini App launch makes this a Telegram order: the chat id is kept
    on the order (status messages go there) and the source is set here, never
    from the payload. An unsigned `telegram` string changes nothing.
  */
  const telegramUser = verifyInitData(telegram);
  // The channel is decided here, never trusted from the payload: without a
  // signed Mini App launch a browser order is a site order.
  request.source = telegramUser ? "telegram_mini" : "site";
  if (telegramUser) {
    request.attribution = {
      ...(request.attribution ?? {}),
      utmSource: request.attribution?.utmSource || "telegram",
      utmMedium: request.attribution?.utmMedium || "mini_app",
    };
  }

  // Reject online payment unless the provider has a complete, verified flow.
  if (request.payment?.method === "online" && !isOnlineProviderAvailable(request.payment.provider)) {
    return { ok: false, error: "payment_unavailable" };
  }

  /*
    Without the real backend the operator's Telegram message is the only record
    of an order. On the live site an order that cannot reach anyone is refused
    up front, so the customer is told to call instead of being thanked for an
    order nobody will see.
  */
  const telegramIsTheRecord = SHOPFLOW_IS_MOCK && isLiveDeployment();
  if (telegramIsTheRecord && !(await isOperatorChannelConfigured())) {
    console.error("[checkout] refused: no order backend and no operator channel configured");
    return { ok: false, error: "failed" };
  }

  try {
    /*
      Prices, discounts and totals are the server's, not the browser's: each
      product is read from the catalogue and the order is priced again
      (lib/cart/reprice.ts). The request only says what to buy.
    */
    const slugs = [...new Set(request.items.map((i) => i.slug))];
    const [products, promotions, commerce] = await Promise.all([
      Promise.all(slugs.map((slug) => shopflow.getProduct(slug, request.locale))),
      shopflow.getPromotions(request.locale).catch(() => []),
      getCommerceSettings(),
    ]);
    const found = products.filter((p): p is NonNullable<typeof p> => p !== null);
    // The admin's commerce rules: the same cached value the cart was rendered with.
    const priced = repriceOrder(request, found, promotions, await offerContext(request, found), {
      pricing: pricingRulesOf(commerce),
      ladder: commerce.ladder,
    });
    if (!priced.ok) return { ok: false, error: priced.error, slug: priced.slug };
    let order = priced.order;

    /*
      Orders kept in our own database go through the promo transaction: the
      code is re-validated with its row locked and redeemed with the order,
      and the first-order discount is decided there too. An external backend
      or no backend at all takes the order as before, without codes.
    */
    let result: OrderResult;
    let pointsEarn = 0;
    if (ORDERS_IN_DB) {
      const placed = await placeOrder(order, promotions);
      if (!placed.ok) {
        if (placed.error === "points_invalid") return { ok: false, error: "points_invalid" };
        if (placed.error === "promo_invalid") return { ok: false, error: "promo_invalid", promoReason: placed.rejection.reason };
        if (placed.error === "insufficient_stock") return { ok: false, error: "insufficient_stock", slug: placed.slug, shortage: { slug: placed.slug, available: placed.available } };
        return { ok: false, error: "failed" };
      }
      order = placed.order;
      pointsEarn = placed.pointsEarn;
      result = { ok: true, orderId: placed.orderId };
    } else {
      order = { ...order, promoCode: undefined, pointsToken: undefined };
      result = await shopflow.createOrder(order);
    }
    if (result.ok && result.orderId) {
      /*
        Everything awaited, not fire-and-forget: a serverless function is frozen
        the moment the response is returned, so anything still in flight is
        dropped.

        The operator goes first. When Telegram is the only record of the order
        (no real backend yet), a failed delivery means there is no order, so the
        customer is told and no confirmation goes out. With the real backend the
        order already exists and a missed notification cannot undo it. Email
        and the opt-in swallow their own errors and never fail the order.
      */
      const delivered = await notifyOperatorOfOrder(order, result.orderId);
      if (telegramIsTheRecord && !delivered) {
        console.error(`[checkout] order ${result.orderId} not delivered to the operator channel`);
        return { ok: false, error: "failed" };
      }
      await Promise.all([
        ORDERS_IN_DB
          ? linkOrderToVisitor(visitorIdFrom((await cookies()).get(VISITOR_COOKIE)?.value), {
              number: result.orderId,
              total: order.totals.total,
              phone: order.customer.phone,
              name: order.customer.name,
              items: order.items,
            })
          : Promise.resolve(),
        clubBotReceipt(result.orderId, telegramUser, { earn: pointsEarn, spent: pointsSpent(order.totals.adjustments) }),
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
      const adjustment = discountAdjustment(order.totals.adjustments);
      return {
        ...result,
        total: order.totals.total,
        coupon: adjustment?.kind === "promo" || adjustment?.kind === "referral" ? adjustment.code : undefined,
        receipt: ORDERS_IN_DB ? await loyaltyReceipt(result.orderId, order, pointsEarn) : undefined,
      };
    }
    return { ...result, error: result.ok ? undefined : result.shortage ? "insufficient_stock" : "failed", slug: result.shortage?.slug };
  } catch (err) {
    console.error("[checkout] createOrder failed", err instanceof Error ? err.message : "unknown error");
    return { ok: false, error: "failed" };
  }
}
