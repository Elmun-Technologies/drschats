import "server-only";

import { randomBytes, timingSafeEqual } from "node:crypto";

/*
  Cache invalidation from the background worker.

  revalidateTag/revalidatePath only work inside a request (Next keeps the
  incremental cache in the request's store); called from the worker's timer
  they throw. So the worker asks its own server: a POST to
  /api/internal/revalidate on 127.0.0.1, authorised by a random token that
  exists only in this process's memory — nothing outside the process can
  know it, and it changes on every restart.
*/

type Holder = { __govitaInternalToken?: string };
const holder = globalThis as unknown as Holder;

export function internalToken(): string {
  if (!holder.__govitaInternalToken) holder.__govitaInternalToken = randomBytes(24).toString("base64url");
  return holder.__govitaInternalToken;
}

export function internalTokenMatches(given: string | null): boolean {
  const expected = holder.__govitaInternalToken;
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface RevalidateRequest {
  tags?: string[];
  /** [path, "layout" | "page"] */
  paths?: [string, "layout" | "page"][];
}

/** Ask this server to revalidate; never throws. */
export async function revalidateFromWorker(request: RevalidateRequest): Promise<boolean> {
  const port = process.env.PORT || "3000";
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/internal/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-token": internalToken() },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (err) {
    console.error("[revalidate] worker request failed:", (err as Error).message);
    return false;
  }
}
