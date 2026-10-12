import { z } from "zod";
import { TICKET_CATEGORIES } from "@/lib/db/schema";
import * as store from "./store";

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

const receiptSchema = z.discriminatedUnion("result", [
  z.object({ leaseToken: z.string().min(16).max(64), result: z.literal("sent") }),
  z.object({ leaseToken: z.string().min(16).max(64), result: z.literal("blocked") }),
  z.object({ leaseToken: z.string().min(16).max(64), result: z.literal("retry"), retryAfter: z.number().int().min(1).max(86400).default(60) }),
]);

export async function handleBotApi(method: string, path: string[], body: unknown, query: URLSearchParams): Promise<ApiResponse> {
  // "/customers/42/orders/GV-000007" → "/customers/:id/orders/:code"
  const route = `${method} /${path.map((p, i) => (i === 1 && /^\d+$/.test(p) ? ":id" : i === 3 ? ":code" : p)).join("/")}`;
  const id = (index: number) => chatIdSchema.safeParse(path[index]);

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
