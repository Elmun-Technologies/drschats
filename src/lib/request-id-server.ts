import "server-only";

import { headers } from "next/headers";
import { REQUEST_ID_HEADER } from "./request-id";

/** This request's id, or "-" outside a request (the worker, boot). */
export async function currentRequestId(): Promise<string> {
  try {
    return (await headers()).get(REQUEST_ID_HEADER) ?? "-";
  } catch {
    return "-";
  }
}

/**
 * One line for a server error, with the request id. Only the error message —
 * never the request body, a phone or an address (lib/privacy.ts).
 */
export async function logServerError(scope: string, err: unknown, extra?: string): Promise<void> {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "unknown error";
  console.error(`[${scope}] rid=${await currentRequestId()}${extra ? ` ${extra}` : ""}: ${message}`);
}
