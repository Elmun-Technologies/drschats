import { z } from "zod";
import { TICKET_CATEGORIES } from "@/lib/db/schema";
import * as store from "./store";
import * as shop from "./shop";
import { withinRateLimit } from "@/lib/rate-limit";

/*
  The API the club bot (govita-vip-bot, production mode) calls. Paths and
  shapes are the bot's contract (bot/remote.py) — `GOVITA_API_URL` points at
  https://<site>/api/bot. Every customer resource is resolved from the chat
  id Telegram gave the bot, never from anything the customer typed.
*/

export interface ApiResponse {
  status: number;
  body: unknown;
}

const ok = (body: unknown, status = 200): ApiResponse => ({ status, body });
const fail = (status: number, error: string): ApiResponse => ({ status, body: { error } });

const chatIdSchema = z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER);

const memberSchema = z.object({
  locale: z.enum(["uz", "ru"]).default("uz"),
  // Deep-link payloads are attacker-chosen; a bad one is dropped, not an error.
  source: z.string().optional().transform((s) => (s && /^[A-Za-z0-9_-]{1,64}$/.test(s) ? s : undefined)),
});

const contactSchema = z.object({
  telegramUserId: z.number().int().positive(),
  contactUserId: z.number().int().positive(),
  chatId: z.number().int().positive(),
  phone: z.string().min(9).max(32),
  name: z.string().max(120).optional(),
  username: z.string().max(64).nullish(),
});

const ticketSchema = z.object({
  category: z.enum(TICKET_CATEGORIES).default("operator"),
  text: z.string().trim().min(1).max(3000),
});

const claimSchema = z.object({ limit: z.number().int().min(1).max(25).default(10) });

const localeSchema = z.enum(["uz", "ru"]).default("uz");
const cartSchema = z.object({ chatId: chatIdSchema, locale: localeSchema.optional() });
const cartLineSchema = z.object({
  chatId: chatIdSchema,
  slug: z.string().trim().min(1).max(160),
  qty: z.number().int().min(0).max(99),
  locale: localeSchema.optional(),
});
const addSchema = z.object({
  chatId: chatIdSchema,
  slug: z.string().trim().min(1).max(160),
  qty: z.number().int().min(1).max(99).default(1),
});
const promoCartSchema = z.object({
  chatId: chatIdSchema,
  code: z.string().trim().max(40),
  locale: localeSchema.optional(),
});
const quoteSchema = z.object({
  chatId: chatIdSchema,
  locale: localeSchema.optional(),
  method: z.enum(["courier", "pickup"]).default("courier"),
  promoCode: z.string().trim().max(40).nullish(),
});
const orderSchema = z.object({
  chatId: chatIdSchema,
  locale: localeSchema.default("uz"),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  method: z.enum(["courier", "pickup"]),
  region: z.string().trim().max(60).default(""),
  address: z.string().trim().min(3).max(300),
  note: z.string().trim().max(1000).optional(),
  promoCode: z.string().trim().max(40).nullish(),
  idempotencyKey: z.string().min(8).max(128),
});
const reorderSchema = z.object({
  chatId: chatIdSchema,
  orderNumber: z.string().regex(/^GV-\d{1,12}$/),
  locale: localeSchema.optional(),
});
const localeBodySchema = z.object({ chatId: chatIdSchema, locale: z.enum(["uz", "ru"]) });

const receiptSchema = z.discriminatedUnion("result", [
  z.object({ leaseToken: z.string().min(16).max(64), result: z.literal("sent") }),
  z.object({ leaseToken: z.string().min(16).max(64), result: z.literal("blocked") }),
  z.object({ leaseToken: z.string().min(16).max(64), result: z.literal("retry"), retryAfter: z.number().int().min(1).max(86400).default(60) }),
  // Telegram refused it for good (too long, bad markup, chat gone). Retrying
  // the same payload cannot succeed, so it is recorded immediately, with the
  // reason, instead of being retried eight times.
  z.object({ leaseToken: z.string().min(16).max(64), result: z.literal("failed"), error: z.string().trim().max(300).optional() }),
]);

export async function handleBotApi(method: string, path: string[], body: unknown, query: URLSearchParams): Promise<ApiResponse> {
  // "/customers/42/orders/GV-000007" → "/customers/:id/orders/:code"
  const route = `${method} /${path.map((p, i) => (i === 1 && /^\d+$/.test(p) ? ":id" : i === 3 ? ":code" : p)).join("/")}`;
  const id = (index: number) => chatIdSchema.safeParse(path[index]);

  // A slug is not numeric, so the generic mapper above leaves it as-is.
  if (method === "GET" && path[0] === "shop" && path[1] === "product" && path[2]) {
    const locale = localeSchema.safeParse(query.get("locale") ?? "uz");
    if (!locale.success || path[2].length > 160) return fail(422, "invalid");
    const product = await shop.botProduct(path[2], locale.data);
    return product
      ? ok({
          product,
          disclaimer: "Biologik faol qoʻshimcha. Dori vositasi emas. Qabul qilishdan oldin mutaxassis bilan maslahatlashing.",
        })
      : fail(404, "product_not_found");
  }

  switch (route) {
    case "GET /config":
      return ok(await store.getClubConfig());

    case "POST /contacts": {
      const p = contactSchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      // Only the user's own contact, in their own private chat, proves the number.
      if (p.data.contactUserId !== p.data.telegramUserId || p.data.chatId !== p.data.telegramUserId) {
        return fail(422, "contact_not_own_private_chat");
      }
      const r = await store.linkContact({ chatId: p.data.chatId, phone: p.data.phone, name: p.data.name, username: p.data.username ?? undefined });
      if (!r.ok) return fail(r.error === "invalid_phone" ? 422 : 409, r.error);
      return ok({ phone: r.phone, name: p.data.name ?? "", locale: (await store.memberLocale(p.data.chatId)) ?? "uz" });
    }

    case "POST /members/:id/start": {
      const chat = id(1);
      const p = memberSchema.safeParse(body ?? {});
      if (!chat.success || !p.success) return fail(422, "invalid");
      await store.startMember(chat.data, p.data.locale, p.data.source);
      return ok({ ok: true });
    }

    case "GET /customers/:id": {
      const chat = id(1);
      if (!chat.success) return fail(422, "invalid");
      const link = await store.linkOf(chat.data);
      if (!link) return fail(404, "customer_not_linked");
      return ok({ id: link.chatId, name: link.name ?? "", phone: link.phone, locale: (await store.memberLocale(chat.data)) ?? "uz" });
    }

    case "GET /customers/:id/orders": {
      const chat = id(1);
      if (!chat.success) return fail(422, "invalid");
      const limit = Math.min(50, Math.max(1, Number(query.get("limit")) || 5));
      const locale = (await store.memberLocale(chat.data)) ?? "uz";
      return ok({ items: await store.ordersFor(chat.data, limit, locale) });
    }

    case "GET /customers/:id/subscriptions":
      // Repeat deliveries are not run by the site yet (docs/BOT-ADMIN.md); the bot shows "none".
      return ok([]);

    case "POST /customers/:id/tickets": {
      const chat = id(1);
      const p = ticketSchema.safeParse(body);
      if (!chat.success || !p.success) return fail(422, "invalid");
      if (!(await store.memberLocale(chat.data))) return fail(404, "member_not_found");
      const t = await store.createTicket(chat.data, p.data.category, p.data.text);
      return ok({ id: t.id, status: "open" }, 201);
    }

    case "GET /customers/:id/orders/:code": {
      const chat = id(1);
      if (!chat.success || !/^GV-\d{1,12}$/.test(path[3])) return fail(404, "order_not_found");
      const order = await store.orderFor(chat.data, path[3], (await store.memberLocale(chat.data)) ?? "uz");
      return order ? ok(order) : fail(404, "order_not_found");
    }

    /* ── Shop: read ─────────────────────────────────────────────────────── */

    case "GET /shop/locale": {
      const p = z.object({ chatId: chatIdSchema }).safeParse({ chatId: query.get("chatId") });
      if (!p.success) return fail(422, "invalid");
      return ok({ locale: await shop.botLocale(p.data.chatId) });
    }

    case "GET /shop/categories": {
      const locale = localeSchema.safeParse(query.get("locale") ?? "uz");
      if (!locale.success) return fail(422, "invalid");
      return ok({ categories: await shop.botCategories(locale.data) });
    }

    case "GET /shop/catalog": {
      const locale = localeSchema.safeParse(query.get("locale") ?? "uz");
      if (!locale.success) return fail(422, "invalid");
      const page = Math.min(10_000, Math.max(1, Number(query.get("page")) || 1));
      return ok(
        await shop.botCatalog({
          locale: locale.data,
          category: query.get("category")?.slice(0, 80) || null,
          q: query.get("q")?.slice(0, 60) || null,
          page,
        }),
      );
    }

    case "GET /shop/cart": {
      const p = cartSchema.safeParse({ chatId: query.get("chatId"), ...(query.get("locale") ? { locale: query.get("locale") } : {}) });
      if (!p.success) return fail(422, "invalid");
      return ok(await shop.quoteBotCart({ chatId: p.data.chatId, locale: p.data.locale }));
    }

    /* ── Shop: cart ─────────────────────────────────────────────────────── */

    case "POST /shop/cart/add": {
      const p = addSchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      if (!withinRateLimit("bot-cart", String(p.data.chatId), { limit: 40, windowMs: 60_000 })) return fail(429, "rate_limited");
      const { added, reason } = await shop.addToCart(p.data.chatId, p.data.slug, p.data.qty);
      if (!added) return fail(409, reason === "qty_cap" ? "qty_cap" : "not_available");
      return ok(await shop.quoteBotCart({ chatId: p.data.chatId }), 201);
    }

    case "POST /shop/cart/set": {
      const p = cartLineSchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      if (!withinRateLimit("bot-cart", String(p.data.chatId), { limit: 60, windowMs: 60_000 })) return fail(429, "rate_limited");
      await shop.setCartQuantity(p.data.chatId, p.data.slug, p.data.qty);
      return ok(await shop.quoteBotCart({ chatId: p.data.chatId, locale: p.data.locale }));
    }

    case "POST /shop/cart/clear": {
      const p = cartSchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      await shop.clearCart(p.data.chatId);
      return ok(await shop.quoteBotCart({ chatId: p.data.chatId }));
    }

    case "POST /shop/promo": {
      const p = promoCartSchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      if (!withinRateLimit("bot-promo", String(p.data.chatId), { limit: 10, windowMs: 10 * 60_000 })) return fail(429, "rate_limited");
      await shop.setCartPromo(p.data.chatId, p.data.code || null);
      return ok(await shop.quoteBotCart({ chatId: p.data.chatId, locale: p.data.locale }));
    }

    /* ── Shop: checkout ─────────────────────────────────────────────────── */

    case "POST /shop/quote": {
      const p = quoteSchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      return ok(
        await shop.quoteBotCart({
          chatId: p.data.chatId,
          locale: p.data.locale,
          method: p.data.method,
          promoCode: p.data.promoCode === undefined ? undefined : p.data.promoCode,
        }),
      );
    }

    case "POST /shop/order": {
      const p = orderSchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      if (!withinRateLimit("bot-order", String(p.data.chatId), { limit: 6, windowMs: 10 * 60_000 })) return fail(429, "rate_limited");
      const result = await shop.placeBotOrder(p.data);
      if (!result.ok) {
        const status = result.error === "out_of_stock" ? 409 : result.error === "promo_invalid" ? 422 : result.error === "pending" ? 425 : result.error === "not_linked" ? 409 : 400;
        return {
          status,
          body: {
            error: result.error,
            ...(result.slug ? { slug: result.slug } : {}),
            ...(result.error === "out_of_stock" && result.name ? { name: result.name } : {}),
            ...(result.reason ? { reason: result.reason } : {}),
            ...(result.available != null ? { available: result.available } : {}),
          },
        };
      }
      return ok(result, result.alreadyCreated ? 200 : 201);
    }

    case "POST /shop/reorder": {
      const p = reorderSchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      const order = await store.orderFor(p.data.chatId, p.data.orderNumber, p.data.locale ?? "uz");
      if (!order) return fail(404, "order_not_found");
      const locale = p.data.locale ?? "uz";
      const added = await shop.reorderToCart(p.data.chatId, order.items.map((i) => ({ slug: i.slug, qty: i.qty })), locale);
      if (added === 0) return fail(409, "not_available");
      return ok(await shop.quoteBotCart({ chatId: p.data.chatId, locale }));
    }

    case "POST /shop/locale": {
      const p = localeBodySchema.safeParse(body);
      if (!p.success) return fail(422, "invalid");
      await shop.setBotLocale(p.data.chatId, p.data.locale);
      return ok({ ok: true, locale: p.data.locale });
    }

    /* ── Outbox ─────────────────────────────────────────────────────────── */

    case "POST /outbox/claim": {
      const p = claimSchema.safeParse(body ?? {});
      if (!p.success) return fail(422, "invalid");
      return ok({ items: await store.claimJobs(p.data.limit) });
    }

    case "POST /outbox/:id/receipt": {
      const job = id(1);
      const p = receiptSchema.safeParse(body);
      if (!job.success || !p.success) return fail(422, "invalid");
      const { leaseToken, ...r } = p.data;
      return (await store.receipt(job.data, leaseToken, r)) ? ok({ ok: true }) : fail(409, "invalid_lease");
    }
  }

  return fail(404, "not_found");
}
