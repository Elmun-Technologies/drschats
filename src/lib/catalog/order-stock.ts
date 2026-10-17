import { revalidatePath, revalidateTag } from "next/cache";
import type { OrderStatus } from "@/lib/db/schema";
import { afterProductChange } from "@/lib/notify/waitlist";
import { CATALOG_TAG } from "./db";
import { orderIdOf, reapplyOrderStock, restoreOrderStock, type StockChange } from "./stock";

/**
 * An order's status changed in the admin panel. Cancelling gives its units
 * back (once — see restoreOrderStock); re-opening a cancelled order takes
 * them again. A product that comes back from 0 tells its waitlist. Never
 * throws: the status change itself has happened.
 */
export async function syncOrderStock(orderNumber: string, from: OrderStatus, to: OrderStatus): Promise<void> {
  if (from === to || (to !== "cancelled" && from !== "cancelled")) return;
  try {
    const id = await orderIdOf(orderNumber);
    if (!id) return;
    const changes: StockChange[] = to === "cancelled" ? await restoreOrderStock(id) : await reapplyOrderStock(id);
    if (changes.length === 0) return;
    revalidateTag(CATALOG_TAG);
    revalidatePath("/", "layout");
    for (const c of changes) {
      if (c.before === 0 && c.after > 0) {
        await afterProductChange(c.productId, { inStock: false, price: 0 }, { inStock: true, price: 0 });
      }
    }
  } catch (err) {
    console.error(`[stock] order ${orderNumber} ${from}→${to} not applied:`, (err as Error).message);
  }
}
