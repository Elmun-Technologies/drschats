import "server-only";

import { randomInt } from "node:crypto";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { loyaltyOtps } from "@/lib/db/schema";
import { resolveSmsProvider } from "@/lib/sms";
import { prepareSmsText } from "@/lib/sms/segments";
import { redactPhone } from "@/lib/privacy";
import { pointsBalance } from "./server";
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  TOKEN_TTL_MS,
  checkOtp,
  generateOtp,
  hashOtp,
  loyaltySecret,
  signRedeemToken,
  verifyRedeemToken,
  type RedeemToken,
} from "./otp";

/*
  The SMS code for spending points. Transactional: it answers the
  customer's own request in the cart, so marketing quiet hours and opt-outs
  do not apply — it goes straight to the gateway, not through the outbox.
  Limits: 3 codes per phone per hour (counted in the table, so it holds
  across machines) and 10 per IP per hour (in memory, the action checks it).
*/

export const CODES_PER_PHONE_HOUR = 3;

export type OtpRequestResult = { ok: true } | { ok: false; error: "no_sms" | "phone_limit" | "no_balance" | "failed" };

const OTP_TEXT = {
  uz: (code: string) => `Go Vita: ballarni ishlatish kodi ${code}. 5 daqiqa amal qiladi. Kodni hech kimga aytmang.`,
  ru: (code: string) => `Go Vita: код для списания баллов ${code}. Действует 5 минут. Никому его не сообщайте.`,
};

export async function requestRedeemCode(phone9: string, locale: "uz" | "ru", now = new Date()): Promise<OtpRequestResult> {
  const sms = await resolveSmsProvider().catch(() => null);
  if (!sms?.provider) return { ok: false, error: "no_sms" };
  if ((await pointsBalance(phone9, now)) <= 0) return { ok: false, error: "no_balance" };
  const db = getDb();
  const code = generateOtp(randomInt);
  const sent = await db.transaction(async (tx) => {
    // Serialised per phone, so two quick clicks cannot both pass the hourly limit.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`gv-otp:${phone9}`}))`);
    const [{ n }] = (await tx.execute(sql`
      select count(*)::int as n from loyalty_otps
      where phone9 = ${phone9} and created_at > ${new Date(now.getTime() - 3_600_000).toISOString()}::timestamptz`)) as unknown as { n: number }[];
    if (n >= CODES_PER_PHONE_HOUR) return false;
    await tx.insert(loyaltyOtps).values({ phone9, codeHash: hashOtp(phone9, code, loyaltySecret()), expiresAt: new Date(now.getTime() + OTP_TTL_MS) });
    return true;
  });
  if (!sent) return { ok: false, error: "phone_limit" };
  const text = prepareSmsText(OTP_TEXT[locale](code), { transliterate: sms.transliterate });
  const result = await sms.provider.send(`+998${phone9}`, text).catch((err: Error) => ({ ok: false as const, retryable: false, error: err.message }));
  if (!result.ok) {
    console.error(`[loyalty] code SMS to ${redactPhone(phone9)} failed:`, result.error);
    return { ok: false, error: "failed" };
  }
  return { ok: true };
}

export type OtpVerifyResult =
  | { ok: true; token: string; balance: number }
  | { ok: false; error: "wrong" | "expired" | "locked" | "no_code"; attemptsLeft?: number };

export async function verifyRedeemCode(phone9: string, typed: string, now = new Date()): Promise<OtpVerifyResult> {
  const db = getDb();
  const verdict = await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(loyaltyOtps)
      .where(and(eq(loyaltyOtps.phone9, phone9), gt(loyaltyOtps.createdAt, new Date(now.getTime() - 3_600_000))))
      .orderBy(desc(loyaltyOtps.createdAt), desc(loyaltyOtps.id))
      .limit(1)
      .for("update");
    if (!row) return { verdict: "no_code" as const, attempts: 0 };
    const v = checkOtp(row, phone9, typed, loyaltySecret(), now);
    if (v === "wrong") {
      await tx.update(loyaltyOtps).set({ attempts: sql`${loyaltyOtps.attempts} + 1` }).where(eq(loyaltyOtps.id, row.id));
      return { verdict: v, attempts: row.attempts + 1 };
    }
    if (v === "ok") await tx.update(loyaltyOtps).set({ consumedAt: now }).where(eq(loyaltyOtps.id, row.id));
    return { verdict: v, attempts: row.attempts };
  });
  if (verdict.verdict === "ok") {
    const balance = await pointsBalance(phone9, now);
    const token = signRedeemToken({ p: phone9, c: balance, e: now.getTime() + TOKEN_TTL_MS }, loyaltySecret());
    return { ok: true, token, balance };
  }
  if (verdict.verdict === "wrong") {
    const left = Math.max(0, OTP_MAX_ATTEMPTS - verdict.attempts);
    return left > 0 ? { ok: false, error: "wrong", attemptsLeft: left } : { ok: false, error: "locked" };
  }
  if (verdict.verdict === "used") return { ok: false, error: "no_code" };
  return { ok: false, error: verdict.verdict };
}

/** The token the cart sends with the order, verified for this phone. */
export function readRedeemToken(raw: string | null | undefined, phone9: string | null, now = new Date()): RedeemToken | null {
  if (!phone9) return null;
  const token = verifyRedeemToken(raw, loyaltySecret(), now);
  return token && token.p === phone9 ? token : null;
}
