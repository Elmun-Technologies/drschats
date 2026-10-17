import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { loyaltySecret } from "./otp";

/*
  What the success page may say about an order's points and the customer's
  referral code. The page knows only the order number from its URL, and order
  numbers are sequential, so it must not look the customer up by it. The
  order action signs what it knows instead (`?k=`), and the page shows only a
  receipt it can verify — nobody can read another customer's code by editing
  the number.
*/

export interface LoyaltyReceipt {
  /** Order number. */
  o: string;
  /** Points the order will earn when delivered (0 — none). */
  e: number;
  /** Points spent on it. */
  s: number;
  /** The customer's referral code, when they have one and the programme is on. */
  r?: string;
}

function sign(body: string): string {
  return createHmac("sha256", loyaltySecret()).update(`govita:loyalty-receipt:v1:${body}`).digest("base64url").slice(0, 22);
}

export function signReceipt(receipt: LoyaltyReceipt): string {
  const body = Buffer.from(JSON.stringify(receipt)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readReceipt(raw: string | null | undefined, orderNumber: string | null): LoyaltyReceipt | null {
  if (!raw || !orderNumber || raw.length > 600) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const r = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as LoyaltyReceipt;
    if (r.o !== orderNumber || !Number.isInteger(r.e) || r.e < 0 || !Number.isInteger(r.s) || r.s < 0) return null;
    if (r.r !== undefined && !/^GV[A-Z2-9]{6}$/.test(r.r)) return null;
    return r;
  } catch {
    return null;
  }
}
