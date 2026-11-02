import "server-only";

import { headers } from "next/headers";
import { getDb } from "@/lib/db/client";
import { adminAuditLog } from "@/lib/db/schema";
import { clientIp } from "@/lib/rate-limit";

/*
  Who changed what in the panel. Written after the change succeeded; a
  failure to write the log is reported but never undoes the change or fails
  the action — the shop must not stop because a log row did not land.
  Never put secrets or customer contact data in `detail`.
*/
export async function auditLog(
  admin: { id: number; email: string } | null,
  action: string,
  target?: string | null,
  detail?: Record<string, unknown> | null,
): Promise<void> {
  try {
    let ip: string | null = null;
    try {
      ip = clientIp(await headers());
    } catch {
      ip = null;
    }
    await getDb().insert(adminAuditLog).values({
      adminUserId: admin?.id ?? null,
      adminEmail: admin?.email ?? null,
      action,
      target: target ?? null,
      detail: detail ?? null,
      ip,
    });
  } catch (err) {
    console.error("[admin-audit] not written:", action, (err as Error).message);
  }
}

/** What a form was about — its id, slug, code or number — for the log's "object" column. */
export function auditTarget(form: FormData): string | null {
  for (const key of ["id", "slug", "code", "number", "productId", "segment"]) {
    const value = form.get(key);
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 80);
  }
  return null;
}
