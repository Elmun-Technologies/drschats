import { bigserial, boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
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
});
