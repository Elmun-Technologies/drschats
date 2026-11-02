"use server";

import { sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db/client";
import { verifyClickToken } from "@/lib/messaging/tokens";
import { shopflow } from "@/lib/shopflow";
import { cutoutOf } from "@/lib/catalog/product-facts";
import type { CartSnapshotItem } from "@/lib/db/schema";

/*
  An abandoned-cart message opened on another browser (most often Telegram's
  in-app one) used to land on an empty cart: the cart lives in localStorage.
  The click link (/r/<token>) passes its signed token on to /cart as
  `?restore=`; this reads that message's enrollment — the visitor's latest
  cart, else the snapshot the flow started with — and returns the lines at
  today's catalogue prices. Only products still sold come back.
*/

export interface RestoredLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  saleEndsAt?: string;
  stockQty?: number;
  quantity: number;
}

export async function restoreCart(token: string, locale: "uz" | "ru"): Promise<RestoredLine[]> {
  const id = verifyClickToken(token);
  if (!id || !isDbConfigured) return [];
  try {
    const [row] = (await getDb().execute(sql`
      select coalesce(v.cart_items, e.context->'cartItems') as items
      from outbound_messages m
      join flow_enrollments e on e.id = m.enrollment_id
      left join visitors v on v.id::text = e.context->>'visitorId' and v.cart_value > 0
      where m.id = ${id}
      limit 1`)) as unknown as { items: CartSnapshotItem[] | null }[];
    const items = Array.isArray(row?.items) ? row.items.filter((i) => typeof i?.slug === "string").slice(0, 20) : [];
    const lines = await Promise.all(
      items.map(async (item): Promise<RestoredLine | null> => {
        const p = await shopflow.getProduct(item.slug, locale).catch(() => null);
        if (!p || !p.inStock || p.assortment === "unlisted") return null;
        const quantity = Math.max(1, Math.min(99, Math.round(Number(item.quantity) || 1)));
        return {
          productId: p.id,
          slug: p.slug,
          name: p.name,
          image: cutoutOf(p) ?? p.images[0]?.url ?? "",
          price: p.price,
          oldPrice: p.oldPrice,
          saleEndsAt: p.saleEndsAt,
          stockQty: p.stock?.qty,
          quantity,
        };
      }),
    );
    return lines.filter((l): l is RestoredLine => l !== null);
  } catch (err) {
    console.error("[cart] restore failed:", (err as Error).message);
    return [];
  }
}
