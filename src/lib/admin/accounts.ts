import { count } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";

/** Plain server module: read by the login page, never exposed as a server action. */
export async function adminCount(): Promise<number> {
  const [row] = await getDb().select({ n: count() }).from(adminUsers);
  return row?.n ?? 0;
}

/** Serialises "how many admins are there" checks with the writes that depend on them. */
export const ADMIN_TABLE_LOCK = 7_340_002;
