import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { botCarts, botOrderKeys, type BotCartLine, type OrderSource } from "@/lib/db/schema";
import { shopflow } from "@/lib/shopflow";
import type { OrderRequest, Product, Promotion } from "@/lib/shopflow/types";
import { repriceOrder } from "@/lib/cart/reprice";
import { computeTotals, lineQtyCap, MAX_LINE_QTY } from "@/lib/cart/pricing";
import { cutoutOf, unitOf } from "@/lib/catalog/product-facts";
import { lowStockLeft } from "@/lib/catalog/stock-rules";
import { getCommerceSettings } from "@/lib/commerce/server";
import { pricingRulesOf } from "@/lib/commerce/settings";
import { applyAdjustment, phone9Of, type PromoReason } from "@/lib/promo/rules";
import { placeOrder, promoLinesOf, quoteDiscounts, type DiscountQuote } from "@/lib/promo/server";
import { announceOrderStatus, attachOrderChat, linkOf, memberLocale } from "@/lib/bot/store";
import { earnLaterLine, both, joinLines } from "@/lib/loyalty/messages";
import { notifyOperatorOfOrder } from "@/lib/orders/notify";
import { linkBotOrderToVisitor } from "@/lib/journey/collect";
import { siteOrigin } from "@/lib/email/config";

/*
  The bot's shop, server side.

  The bot is stateless: a cart is a row here, and every read of it resolves
  the products from the catalogue the admin panel manages. A cart row stores
  a slug and a quantity — never a price. Checkout runs the same
  `repriceOrder()` and `placeOrder()` as the website, so promotions, the
  first-order discount, promo codes, tracked stock and cashback behave
  identically and the order lands in the same `orders` table.
*/

export type BotLocale = "uz" | "ru";

export interface BotProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  stockLeft: number | null;
  image: string | null;
  unit: string | null;
}

export interface BotProductCard extends BotProduct {
  description: string;
  highlights: string[];
  images: string[];
  /** Real price drop from the catalogue, not an invented "was" price. */
  discountPercent: number;
}

export interface BotCategory {
  slug: string;
  name: string;
  count: number;
}

export interface BotCatalog {
  locale: BotLocale;
  categories: BotCategory[];
  items: BotProduct[];
  total: number;
  page: number;
  pages: number;
}

export interface BotCartViewLine extends BotProduct {
  qty: number;
  lineTotal: number;
  qtyCap: number;
}

export interface BotQuote {
  locale: BotLocale;
  lines: BotCartViewLine[];
  issues: { slug: string; name: string; reason: "missing" | "out_of_stock" }[];
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    itemCount: number;
    freeShippingRemaining: number;
    freeShippingThreshold: number;
  };
  promo: { code: string | null; ok: boolean; reason?: PromoReason; discount?: number };
  firstOrder: DiscountQuote["firstOrder"];
  /** The one order-level discount that will be applied. */
  adjustment: DiscountQuote["applied"];
}

const IMAGE_ORIGIN = () => siteOrigin().replace(/\/$/, "");

function absolute(image: string | undefined | null): string | null {
  if (!image) return null;
  return image.startsWith("http") ? image : `${IMAGE_ORIGIN()}${image.startsWith("/") ? "" : "/"}${image}`;
}

function productImage(p: Product): string | null {
  return absolute(cutoutOf(p) ?? p.images[0]?.url);
}

function summaryOf(p: Product): BotProduct {
  const stockLeft = p.stock ? lowStockLeft(p.stock) : null;
  const unit = unitOf(p);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    price: p.price,
    ...(p.oldPrice && p.oldPrice > p.price ? { oldPrice: p.oldPrice } : {}),
    inStock: p.inStock && p.assortment !== "unlisted",
    stockLeft,
    image: productImage(p),
    unit: unit ? `${unit.count} ${unit.unit === "capsule" ? "kapsula" : "tabletka"}` : null,
  };
}

function cardOf(p: Product): BotProductCard {
  const base = summaryOf(p);
  const discountPercent = base.oldPrice ? Math.round(((base.oldPrice - base.price) / base.oldPrice) * 100) : 0;
  return {
    ...base,
    description: p.description,
    highlights: p.highlights.slice(0, 3),
    images: p.images.map((i) => absolute(i.url)).filter((u): u is string => Boolean(u)),
    discountPercent,
  };
}

/* ── Catalogue ───────────────────────────────────────────────────────────── */

export async function botCatalog(input: {
  locale: BotLocale;
  category?: string | null;
  q?: string | null;
  page?: number;
}): Promise<BotCatalog> {
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const pageSize = 6;
  const [categories, list] = await Promise.all([
    shopflow.getCategories(input.locale),
    shopflow.getProducts({
      locale: input.locale,
      assortment: "listed",
      pageSize,
      page,
      ...(input.category ? { category: input.category } : {}),
      ...(input.q?.trim() ? { search: input.q.trim().slice(0, 60) } : {}),
    }),
  ]);
  return {
    locale: input.locale,
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, count: c.productCount ?? 0 })),
    items: list.items.map(summaryOf),
    total: list.total,
    page: list.page,
    pages: Math.max(1, Math.ceil(list.total / list.pageSize)),
  };
}

export async function botProduct(slug: string, locale: BotLocale): Promise<BotProductCard | null> {
  const product = await shopflow.getProduct(slug, locale);
  if (!product || product.assortment === "unlisted") return null;
  return cardOf(product);
}

export async function botCategories(locale: BotLocale): Promise<BotCategory[]> {
  const categories = await shopflow.getCategories(locale);
  return categories.map((c) => ({ slug: c.slug, name: c.name, count: c.productCount ?? 0 }));
}

/* ── Cart storage ────────────────────────────────────────────────────────── */

export interface StoredCart {
  lines: BotCartLine[];
  promoCode: string | null;
  locale: BotLocale;
}

export async function readBotCart(chatId: number): Promise<StoredCart> {
  const [row] = await getDb().select().from(botCarts).where(eq(botCarts.chatId, chatId)).limit(1);
  return {
    lines: row?.lines ?? [],
    promoCode: row?.promoCode ?? null,
    locale: row?.locale ?? ((await memberLocale(chatId)) ?? "uz"),
  };
}

async function saveBotCart(chatId: number, cart: StoredCart): Promise<void> {
  const db = getDb();
  await db
    .insert(botCarts)
    .values({ chatId, lines: cart.lines, promoCode: cart.promoCode, locale: cart.locale, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: botCarts.chatId,
      set: { lines: cart.lines, promoCode: cart.promoCode, locale: cart.locale, updatedAt: new Date() },
    });
}

/** The stored language, available before a phone is linked (bot_carts/bot_members). */
export async function botLocale(chatId: number): Promise<BotLocale> {
  const [row] = await getDb().select({ locale: botCarts.locale }).from(botCarts).where(eq(botCarts.chatId, chatId)).limit(1);
  return row?.locale ?? ((await memberLocale(chatId)) ?? "uz");
}

export async function setBotLocale(chatId: number, locale: BotLocale): Promise<void> {
  await getDb()
    .insert(botCarts)
    .values({ chatId, lines: [], locale })
    .onConflictDoUpdate({ target: botCarts.chatId, set: { locale } });
  await getDb().execute(sql`update bot_members set locale = ${locale} where chat_id = ${chatId}`);
}

/** Adds units to a line (or sets it), capped by the line rule and real stock. */
export async function setCartQuantity(chatId: number, slug: string, qty: number): Promise<StoredCart> {
  const cart = await readBotCart(chatId);
  const product = await shopflow.getProduct(slug, cart.locale);
  if (!product || product.assortment === "unlisted") return cart;
  const cap = lineQtyCap({ upsellDiscountPercent: undefined, stockQty: product.stock?.qty });
  const next = Math.max(0, Math.min(cap, Math.floor(qty)));
  const lines = cart.lines.filter((l) => l.slug !== slug);
  if (next > 0) lines.push({ slug, qty: next });
  const saved = { ...cart, lines: lines.slice(0, 50) };
  await saveBotCart(chatId, saved);
  return saved;
}

export async function addToCart(chatId: number, slug: string, add = 1): Promise<{ cart: StoredCart; added: boolean; reason?: "out_of_stock" | "qty_cap" }> {
  const cart = await readBotCart(chatId);
  const current = cart.lines.find((l) => l.slug === slug)?.qty ?? 0;
  const product = await shopflow.getProduct(slug, cart.locale);
  if (!product || product.assortment === "unlisted" || !product.inStock) return { cart, added: false, reason: "out_of_stock" };
  const cap = Math.min(MAX_LINE_QTY, lineQtyCap({ upsellDiscountPercent: undefined, stockQty: product.stock?.qty }));
  if (current >= cap) return { cart, added: false, reason: "qty_cap" };
  const next = await setCartQuantity(chatId, slug, current + add);
  return { cart: next, added: true };
}

export async function clearCart(chatId: number): Promise<void> {
  const cart = await readBotCart(chatId);
  await saveBotCart(chatId, { ...cart, lines: [], promoCode: null });
}

export async function setCartPromo(chatId: number, rawCode: string | null): Promise<void> {
  const cart = await readBotCart(chatId);
  await saveBotCart(chatId, { ...cart, promoCode: rawCode?.trim().slice(0, 40) || null });
}

/* ── Pricing ─────────────────────────────────────────────────────────────── */

async function resolveLines(cart: StoredCart) {
  const products = await Promise.all(cart.lines.map((l) => shopflow.getProduct(l.slug, cart.locale).catch(() => null)));
  const issues: BotQuote["issues"] = [];
  const priced: { product: Product; qty: number }[] = [];
  for (let i = 0; i < cart.lines.length; i++) {
    const line = cart.lines[i];
    const product = products[i];
    if (!product || product.assortment === "unlisted") {
      issues.push({ slug: line.slug, name: line.slug, reason: "missing" });
      continue;
    }
    if (!product.inStock) {
      issues.push({ slug: line.slug, name: product.name, reason: "out_of_stock" });
      continue;
    }
    priced.push({ product, qty: line.qty });
  }
  return { issues, priced };
}

function requestOf(
  priced: { product: Product; qty: number }[],
  locale: BotLocale,
  method: "courier" | "pickup",
  customer: { name: string; phone: string },
  promoCode: string | null,
  source: OrderSource,
): OrderRequest {
  return {
    customer,
    delivery: { region: "", address: "", method },
    payment: { method: "cod" },
    items: priced.map(({ product, qty }) => ({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      quantity: qty,
      unitPrice: product.price,
    })),
    appliedUpsells: [],
    appliedPromotions: [],
    totals: { subtotal: 0, discount: 0, shipping: 0, total: 0 },
    ...(promoCode ? { promoCode } : {}),
    locale,
    source,
  };
}

export async function quoteBotCart(input: {
  chatId: number;
  locale?: BotLocale;
  method?: "courier" | "pickup";
  promoCode?: string | null;
}): Promise<BotQuote> {
  const cart = await readBotCart(input.chatId);
  const locale = input.locale ?? cart.locale;
  const method = input.method ?? "courier";
  const code = input.promoCode === undefined ? cart.promoCode : input.promoCode;
  const link = await linkOf(input.chatId);
  const phone = link?.phone ? `+${link.phone}` : "";

  const { issues, priced } = await resolveLines(cart);
  const [promotions, commerce] = await Promise.all([
    shopflow.getPromotions(locale).catch(() => [] as Promotion[]),
    getCommerceSettings(),
  ]);
  const rules = { pricing: pricingRulesOf(commerce), ladder: commerce.ladder };
  const pricedOrder = repriceOrder(requestOf(priced, locale, method, { name: "", phone }, code, "telegram_bot"), priced.map((p) => p.product), promotions, { programs: new Map(), rail: new Map(), ladderPool: new Set() }, rules);
  if (!pricedOrder.ok) {
    // Every line was already checked above; this can only be a rule the lines broke.
    return {
      locale,
      lines: [],
      issues: [{ slug: pricedOrder.slug ?? "", name: pricedOrder.slug ?? "", reason: "out_of_stock" }],
      totals: { subtotal: 0, discount: 0, shipping: 0, total: 0, itemCount: 0, freeShippingRemaining: 0, freeShippingThreshold: rules.pricing.freeShippingOver },
      promo: { code: null, ok: false },
      firstOrder: { state: "off", percent: 0, amount: 0 },
      adjustment: null,
    };
  }
  const discount = await quoteDiscounts({
    lines: promoLinesOf(pricedOrder.order.items),
    promotions,
    code,
    phone: phone || null,
  });
  const base = computeTotals(
    pricedOrder.order.items.map((i) => ({
      lineId: i.productId,
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      image: "",
      price: i.unitPrice,
      quantity: i.quantity,
    })),
    promotions,
    { pickup: method === "pickup", rules: rules.pricing },
  );
  // repriceOrder already put the line offers, promotions and shipping into
  // these totals; only the order-level discount is missing at this point.
  const adjusted = applyAdjustment(pricedOrder.order.totals, discount.applied);

  const lines: BotCartViewLine[] = priced.map(({ product, qty }) => ({
    ...summaryOf(product),
    qty,
    lineTotal: product.price * qty,
    qtyCap: Math.min(MAX_LINE_QTY, lineQtyCap({ upsellDiscountPercent: undefined, stockQty: product.stock?.qty })),
  }));

  return {
    locale,
    lines,
    issues,
    totals: {
      subtotal: adjusted.subtotal,
      discount: adjusted.discount,
      shipping: adjusted.shipping,
      total: adjusted.total,
      itemCount: base.itemCount,
      freeShippingRemaining: method === "pickup" ? 0 : base.freeShippingRemaining,
      freeShippingThreshold: base.freeShippingThreshold,
    },
    promo: {
      code: discount.promo?.code ?? (code || null),
      ok: Boolean(discount.promo?.ok),
      ...(discount.promo && !discount.promo.ok ? { reason: discount.promo.reason } : {}),
      ...(discount.promo?.ok ? { discount: discount.promo.discount } : {}),
    },
    firstOrder: discount.firstOrder,
    adjustment: discount.applied,
  };
}

/* ── Checkout ────────────────────────────────────────────────────────────── */

export type BotOrderError =
  | "empty_cart"
  | "not_linked"
  | "invalid_name"
  | "invalid_address"
  | "invalid_region"
  | "out_of_stock"
  | "promo_invalid"
  | "pending"
  | "failed";

export interface BotOrderInput {
  chatId: number;
  locale: BotLocale;
  name: string;
  phone: string;
  method: "courier" | "pickup";
  region: string;
  address: string;
  note?: string;
  promoCode?: string | null;
  idempotencyKey: string;
}

export type BotOrderResult =
  | { ok: true; orderId: string; total: number; alreadyCreated: boolean }
  | { ok: false; error: BotOrderError; slug?: string; name?: string; reason?: PromoReason; available?: number };

/** Reserves one order per (chat, key); the row is removed if placement fails. */
async function reserveKey(chatId: number, key: string): Promise<{ fresh: true } | { fresh: false; orderNumber: string | null }> {
  const db = getDb();
  const inserted = await db
    .insert(botOrderKeys)
    .values({ chatId, key })
    .onConflictDoNothing({ target: [botOrderKeys.chatId, botOrderKeys.key] })
    .returning({ chatId: botOrderKeys.chatId });
  if (inserted.length > 0) return { fresh: true };
  // Another request holds the key: wait briefly for its order number.
  for (let i = 0; i < 10; i++) {
    const [row] = await db
      .select({ orderNumber: botOrderKeys.orderNumber })
      .from(botOrderKeys)
      .where(and(eq(botOrderKeys.chatId, chatId), eq(botOrderKeys.key, key)))
      .limit(1);
    if (row?.orderNumber) return { fresh: false, orderNumber: row.orderNumber };
    await new Promise((r) => setTimeout(r, 300));
  }
  return { fresh: false, orderNumber: null };
}

export async function placeBotOrder(input: BotOrderInput): Promise<BotOrderResult> {
  const link = await linkOf(input.chatId);
  if (!link?.phone) return { ok: false, error: "not_linked" };
  const phone9 = phone9Of(link.phone);
  if (!phone9 || phone9 !== phone9Of(input.phone)) return { ok: false, error: "not_linked" };
  const name = input.name.trim().slice(0, 120);
  if (name.length < 2) return { ok: false, error: "invalid_name" };
  if (input.method === "courier" && input.region.trim().length < 2) return { ok: false, error: "invalid_region" };
  const address = input.address.trim().slice(0, 300);
  if (address.length < 3) return { ok: false, error: "invalid_address" };

  const reserved = await reserveKey(input.chatId, input.idempotencyKey);
  if (!reserved.fresh) {
    return reserved.orderNumber
      ? { ok: true, orderId: reserved.orderNumber, total: 0, alreadyCreated: true }
      : { ok: false, error: "pending" };
  }

  try {
    const cart = await readBotCart(input.chatId);
    const { issues, priced } = await resolveLines(cart);
    // A line that is no longer sold is more useful to explain than an empty cart.
    if (issues.length > 0) {
      await releaseKey(input.chatId, input.idempotencyKey);
      return { ok: false, error: "out_of_stock", slug: issues[0].slug, name: issues[0].name };
    }
    if (priced.length === 0) {
      await releaseKey(input.chatId, input.idempotencyKey);
      return { ok: false, error: "empty_cart" };
    }
    const locale = input.locale;
    const [promotions, commerce] = await Promise.all([shopflow.getPromotions(locale).catch(() => [] as Promotion[]), getCommerceSettings()]);
    const rules = { pricing: pricingRulesOf(commerce), ladder: commerce.ladder };
    const request = requestOf(
      priced,
      locale,
      input.method,
      { name, phone: `+${link.phone}` },
      // An explicit null means "no promo"; only an absent field falls back to the cart.
      input.promoCode === undefined ? cart.promoCode : input.promoCode,
      "telegram_bot",
    );
    request.delivery = {
      region: input.method === "pickup" ? "Toshkent" : input.region.trim().slice(0, 60),
      address,
      ...(input.note?.trim() ? { note: input.note.trim().slice(0, 1000) } : {}),
      method: input.method,
    };
    request.attribution = { utmSource: "telegram", utmMedium: "bot", utmCampaign: "native_shop" };

    const pricedOrder = repriceOrder(
      request,
      priced.map((p) => p.product),
      promotions,
      { programs: new Map(), rail: new Map(), ladderPool: new Set() },
      rules,
    );
    if (!pricedOrder.ok) {
      await releaseKey(input.chatId, input.idempotencyKey);
      return { ok: false, error: pricedOrder.error === "out_of_stock" ? "out_of_stock" : "failed", slug: pricedOrder.slug };
    }

    const placed = await placeOrder(pricedOrder.order, promotions);
    if (!placed.ok) {
      await releaseKey(input.chatId, input.idempotencyKey);
      if (placed.error === "promo_invalid") return { ok: false, error: "promo_invalid", reason: placed.rejection.reason };
      if (placed.error === "insufficient_stock") {
        const name = priced.find((p) => p.product.slug === placed.slug)?.product.name;
        return { ok: false, error: "out_of_stock", slug: placed.slug, ...(name ? { name } : {}), available: placed.available };
      }
      if (placed.error === "points_invalid") return { ok: false, error: "failed" };
      return { ok: false, error: "failed" };
    }

    await getDb()
      .update(botOrderKeys)
      .set({ orderNumber: placed.orderId })
      .where(and(eq(botOrderKeys.chatId, input.chatId), eq(botOrderKeys.key, input.idempotencyKey)));

    // The chat is the verified Telegram identity of this order.
    try {
      await attachOrderChat(placed.orderId, input.chatId);
      const extra = joinLines(
        placed.pointsEarn > 0 ? both((l) => earnLaterLine(placed.pointsEarn, l)) : null,
      );
      await announceOrderStatus(placed.orderId, "new", extra);
      await notifyOperatorOfOrder(placed.order, placed.orderId);
      await linkBotOrderToVisitor({
        number: placed.orderId,
        total: placed.order.totals.total,
        phone: placed.order.customer.phone,
        name: placed.order.customer.name,
        items: placed.order.items.map((i) => ({ slug: i.slug })),
      });
    } catch (err) {
      console.error("[bot-shop] order side effects failed:", (err as Error).message);
    }

    // The cart is emptied only once the order exists.
    await saveBotCart(input.chatId, { lines: [], promoCode: null, locale });
    return { ok: true, orderId: placed.orderId, total: placed.order.totals.total, alreadyCreated: false };
  } catch (err) {
    await releaseKey(input.chatId, input.idempotencyKey);
    console.error("[bot-shop] order failed:", (err as Error).message);
    return { ok: false, error: "failed" };
  }
}

async function releaseKey(chatId: number, key: string): Promise<void> {
  await getDb()
    .delete(botOrderKeys)
    .where(and(eq(botOrderKeys.chatId, chatId), eq(botOrderKeys.key, key), sql`${botOrderKeys.orderNumber} is null`));
}

/** Fills the cart from an earlier order, dropping anything no longer sold. */
export async function reorderToCart(chatId: number, lines: { slug: string; qty: number }[], locale: BotLocale): Promise<number> {
  const available = await Promise.all(lines.map((l) => shopflow.getProduct(l.slug, locale).catch(() => null)));
  const next: BotCartLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const product = available[i];
    if (!product || product.assortment === "unlisted" || !product.inStock) continue;
    const qty = Math.max(1, Math.min(MAX_LINE_QTY, lines[i].qty));
    next.push({ slug: lines[i].slug, qty });
  }
  await saveBotCart(chatId, { lines: next.slice(0, 50), promoCode: null, locale });
  return next.length;
}
