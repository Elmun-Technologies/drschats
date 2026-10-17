import { bigint, bigserial, boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { L, RawProduct } from "@/lib/shopflow/mock";
import type { OrderRequest } from "@/lib/shopflow/types";

/*
  Mirrors db/migrations/*.sql — the SQL files are the source of truth and
  are what runs; this file only types the queries. Change both together.
*/

/** The localised half of a product: everything a shopper reads in their language. */
export type ProductContent = Pick<
  RawProduct,
  | "name" | "tagline" | "description" | "highlights" | "benefits" | "ingredients"
  | "howToUse" | "faq" | "badges" | "servings" | "origin" | "searchAliases"
>;

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").$type<L>().notNull(),
  description: jsonb("description").$type<L>().notNull(),
  image: text("image"),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const brands = pgTable("brands", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  categorySlug: text("category_slug"),
  brandSlug: text("brand_slug"),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  saleEndsAt: timestamp("sale_ends_at", { withTimezone: true }),
  inStock: boolean("in_stock").notNull().default(true),
  kind: text("kind").$type<"core" | "addon" | "unlisted">().notNull().default("core"),
  sort: integer("sort").notNull().default(0),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  cutout: text("cutout"),
  unit: jsonb("unit").$type<{ count: number; unit: "tablet" | "capsule" } | null>(),
  content: jsonb("content").$type<ProductContent>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = pgTable("orders", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  number: text("number"),
  status: text("status").$type<OrderStatus>().notNull().default("new"),
  total: integer("total").notNull(),
  customer: jsonb("customer").$type<OrderRequest["customer"]>().notNull(),
  delivery: jsonb("delivery").$type<OrderRequest["delivery"]>().notNull(),
  payment: jsonb("payment").$type<OrderRequest["payment"]>(),
  items: jsonb("items").$type<OrderRequest["items"]>().notNull(),
  totals: jsonb("totals").$type<OrderRequest["totals"]>().notNull(),
  locale: text("locale").notNull(),
  attribution: jsonb("attribution").$type<OrderRequest["attribution"]>(),
  adminNote: text("admin_note"),
  telegramChatId: bigint("telegram_chat_id", { mode: "number" }),
  visitorId: uuid("visitor_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  sessionEpoch: integer("session_epoch").notNull().default(0),
});

/** Internal service notes; never store health or payment-card data here. */
export const adminCustomerNotes = pgTable("admin_customer_notes", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  phone9: text("phone9").notNull(),
  adminUserId: integer("admin_user_id").references(() => adminUsers.id, { onDelete: "set null" }),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Server-only integration overrides; ciphertext is AES-256-GCM encrypted. */
export const integrationSettings = pgTable("integration_settings", {
  key: text("key").primaryKey(),
  ciphertext: text("ciphertext").notNull(),
  updatedBy: integer("updated_by").references(() => adminUsers.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* Telegram club bot — db/migrations/0003_telegram_club.sql */

export const botConfig = pgTable("bot_config", {
  id: integer("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const botMembers = pgTable("bot_members", {
  chatId: bigint("chat_id", { mode: "number" }).primaryKey(),
  locale: text("locale").$type<"uz" | "ru">().notNull().default("uz"),
  source: text("source"),
  blockedAt: timestamp("blocked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const telegramLinks = pgTable("telegram_links", {
  chatId: bigint("chat_id", { mode: "number" }).primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  username: text("username"),
  linkedAt: timestamp("linked_at", { withTimezone: true }).notNull().defaultNow(),
});

export const TICKET_CATEGORIES = ["operator", "consult", "return", "club-conflict"] as const;
export const TICKET_STATUSES = ["open", "answered", "closed"] as const;

export const botTickets = pgTable("bot_tickets", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  chatId: bigint("chat_id", { mode: "number" }).notNull(),
  category: text("category").$type<(typeof TICKET_CATEGORIES)[number]>().notNull(),
  text: text("text").notNull(),
  status: text("status").$type<(typeof TICKET_STATUSES)[number]>().notNull().default("open"),
  reply: text("reply"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
});

export type BotJobPayload = {
  text: string;
  buttons?: { text: string; callback_data?: string; url?: string; web_app?: { url: string } }[][];
};
export const JOB_STATUSES = ["pending", "leased", "sent", "failed", "blocked"] as const;

export const botJobs = pgTable("bot_jobs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  dedupeKey: text("dedupe_key").notNull().unique(),
  chatId: bigint("chat_id", { mode: "number" }).notNull(),
  kind: text("kind").notNull(),
  payload: jsonb("payload").$type<BotJobPayload>().notNull(),
  status: text("status").$type<(typeof JOB_STATUSES)[number]>().notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull().defaultNow(),
  leaseToken: text("lease_token"),
  leasedUntil: timestamp("leased_until", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const botOrderEvents = pgTable("bot_order_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  orderId: bigint("order_id", { mode: "number" }).notNull(),
  status: text("status").$type<OrderStatus>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* CRM and marketing — db/migrations/0006_crm_marketing.sql */

export const VISITOR_STAGES = ["visit", "product", "cart", "checkout", "customer"] as const;
export type VisitorStage = (typeof VISITOR_STAGES)[number];

export type Touch = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  clickId?: string;
  referrer?: string;
  landing?: string;
};

export type CartSnapshotItem = { slug: string; name: string; quantity: number; price: number };

export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey(),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  sessions: integer("sessions").notNull().default(1),
  lastSession: text("last_session"),
  pageViews: integer("page_views").notNull().default(0),
  locale: text("locale"),
  device: text("device").$type<"mobile" | "tablet" | "desktop">(),
  firstTouch: jsonb("first_touch").$type<Touch>(),
  lastTouch: jsonb("last_touch").$type<Touch>(),
  stage: text("stage").$type<VisitorStage>().notNull().default("visit"),
  cartValue: integer("cart_value").notNull().default(0),
  cartItems: jsonb("cart_items").$type<CartSnapshotItem[]>().notNull().default([]),
  cartAt: timestamp("cart_at", { withTimezone: true }),
  phone9: text("phone9"),
  name: text("name"),
  ordersCount: integer("orders_count").notNull().default(0),
  lastOrderAt: timestamp("last_order_at", { withTimezone: true }),
});

export const VISITOR_EVENT_TYPES = [
  "page_view", "view_item", "add_to_cart", "remove_from_cart", "view_cart",
  "begin_checkout", "purchase", "search", "add_to_wishlist", "quiz_complete",
] as const;
export type VisitorEventType = (typeof VISITOR_EVENT_TYPES)[number];

export const visitorEvents = pgTable("visitor_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  visitorId: uuid("visitor_id").notNull(),
  sessionId: text("session_id").notNull(),
  type: text("type").$type<VisitorEventType>().notNull(),
  path: text("path"),
  productSlug: text("product_slug"),
  value: integer("value"),
  meta: jsonb("meta").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: text("id").primaryKey(),
  type: text("type").$type<"percent_off" | "buy_x_get_y" | "free_shipping_over">().notNull(),
  title: jsonb("title").$type<L>().notNull(),
  description: jsonb("description").$type<L>().notNull(),
  percent: integer("percent"),
  threshold: integer("threshold"),
  productSlugs: jsonb("product_slugs").$type<string[] | null>(),
  active: boolean("active").notNull().default(true),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  channel: text("channel").$type<"telegram">().notNull(),
  segment: text("segment").notNull(),
  message: text("message").notNull(),
  status: text("status").$type<"draft" | "sent">().notNull().default("draft"),
  audience: integer("audience").notNull().default(0),
  queued: integer("queued").notNull().default(0),
  createdBy: integer("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedBy: integer("updated_by").references(() => adminUsers.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
