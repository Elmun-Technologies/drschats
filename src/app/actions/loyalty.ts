"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { clientIp, withinRateLimit } from "@/lib/rate-limit";
import { phone9Of } from "@/lib/promo/rules";
import { readLoyaltyRules, smsAvailable } from "@/lib/loyalty/settings";
import { pointsBalance } from "@/lib/loyalty/server";
import { requestRedeemCode, verifyRedeemCode } from "@/lib/loyalty/otp-server";
import { removeBirthday, saveBirthday } from "@/lib/birthday/server";
import { validDayMonth } from "@/lib/birthday/model";

/*
  The cart's points panel and the profile's birthday opt-in.

  Budgets per IP: the balance check is debounced while the phone is typed
  (40 / 10 min, like the first-order check); codes 10 per hour per IP on top
  of the 3 per phone per hour the table enforces; code checks 30 per 10 min
  (each code has its own 5 attempts — this stops one address cycling phones).
*/
const STATUS_RATE = { limit: 40, windowMs: 10 * 60_000 };
const CODE_IP_RATE = { limit: 10, windowMs: 60 * 60_000 };
const VERIFY_RATE = { limit: 30, windowMs: 10 * 60_000 };
const BIRTHDAY_RATE = { limit: 10, windowMs: 10 * 60_000 };

const phoneSchema = z.string().trim().min(7).max(20).regex(/^\+?[\d\s()-]+$/);

async function ip(): Promise<string> {
  return clientIp(await headers());
}

export type PointsStatus = { ok: true; balance: number; redeemable: boolean } | { ok: false; error: "off" | "rate_limited" | "invalid" };

/** The phone's balance, for the cart's "Sizda N ball bor" line. */
export async function pointsStatus(phone: string): Promise<PointsStatus> {
  if (!ORDERS_IN_DB) return { ok: false, error: "off" };
  const parsed = phoneSchema.safeParse(phone);
  const phone9 = parsed.success ? phone9Of(parsed.data) : null;
  if (!phone9) return { ok: false, error: "invalid" };
  if (!withinRateLimit("points-status", await ip(), STATUS_RATE)) return { ok: false, error: "rate_limited" };
  try {
    const rules = await readLoyaltyRules();
    if (!rules.enabled) return { ok: false, error: "off" };
    const [balance, sms] = await Promise.all([pointsBalance(phone9), smsAvailable()]);
    return { ok: true, balance, redeemable: sms };
  } catch (err) {
    console.error("[loyalty] status failed:", (err as Error).message);
    return { ok: false, error: "invalid" };
  }
}

export type SendCodeResult = { ok: true } | { ok: false; error: "off" | "rate_limited" | "phone_limit" | "no_sms" | "no_balance" | "invalid" | "failed" };

export async function sendPointsCode(input: { phone: string; locale: "uz" | "ru" }): Promise<SendCodeResult> {
  if (!ORDERS_IN_DB) return { ok: false, error: "off" };
  const parsed = phoneSchema.safeParse(input.phone);
  const phone9 = parsed.success ? phone9Of(parsed.data) : null;
  if (!phone9) return { ok: false, error: "invalid" };
  if (!withinRateLimit("points-code-ip", await ip(), CODE_IP_RATE)) return { ok: false, error: "rate_limited" };
  try {
    if (!(await readLoyaltyRules()).enabled) return { ok: false, error: "off" };
    return await requestRedeemCode(phone9, input.locale === "ru" ? "ru" : "uz");
  } catch (err) {
    console.error("[loyalty] code request failed:", (err as Error).message);
    return { ok: false, error: "failed" };
  }
}

export type ConfirmCodeResult =
  | { ok: true; token: string; balance: number }
  | { ok: false; error: "off" | "rate_limited" | "invalid" | "wrong" | "expired" | "locked" | "no_code"; attemptsLeft?: number };

export async function confirmPointsCode(input: { phone: string; code: string }): Promise<ConfirmCodeResult> {
  if (!ORDERS_IN_DB) return { ok: false, error: "off" };
  const parsed = phoneSchema.safeParse(input.phone);
  const phone9 = parsed.success ? phone9Of(parsed.data) : null;
  if (!phone9 || typeof input.code !== "string" || input.code.length > 12) return { ok: false, error: "invalid" };
  if (!withinRateLimit("points-verify", await ip(), VERIFY_RATE)) return { ok: false, error: "rate_limited" };
  try {
    if (!(await readLoyaltyRules()).enabled) return { ok: false, error: "off" };
    return await verifyRedeemCode(phone9, input.code);
  } catch (err) {
    console.error("[loyalty] code check failed:", (err as Error).message);
    return { ok: false, error: "invalid" };
  }
}

const birthdaySchema = z.object({
  phone: phoneSchema,
  name: z.string().trim().max(80).optional(),
  day: z.number().int(),
  month: z.number().int(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  locale: z.enum(["uz", "ru"]),
  consent: z.literal(true),
});

export type BirthdayResult = { ok: true } | { ok: false; error: "off" | "rate_limited" | "invalid" | "failed" };

/** The explicit opt-in: name, day/month (year optional), phone — stored only with the box ticked. */
export async function optInBirthday(input: z.input<typeof birthdaySchema>): Promise<BirthdayResult> {
  if (!ORDERS_IN_DB) return { ok: false, error: "off" };
  const parsed = birthdaySchema.safeParse(input);
  if (!parsed.success || !validDayMonth(parsed.data.day, parsed.data.month)) return { ok: false, error: "invalid" };
  const phone9 = phone9Of(parsed.data.phone);
  if (!phone9) return { ok: false, error: "invalid" };
  if (!withinRateLimit("birthday", await ip(), BIRTHDAY_RATE)) return { ok: false, error: "rate_limited" };
  try {
    if (!(await readLoyaltyRules()).birthday.enabled) return { ok: false, error: "off" };
    await saveBirthday({ phone9, name: parsed.data.name ?? null, day: parsed.data.day, month: parsed.data.month, year: parsed.data.year ?? null, locale: parsed.data.locale });
    return { ok: true };
  } catch (err) {
    console.error("[birthday] save failed:", (err as Error).message);
    return { ok: false, error: "failed" };
  }
}

/** Withdrawing consent deletes the row. Works even when the programme has since been switched off. */
export async function optOutBirthday(input: { phone: string }): Promise<BirthdayResult> {
  if (!ORDERS_IN_DB) return { ok: false, error: "off" };
  const parsed = phoneSchema.safeParse(input.phone);
  const phone9 = parsed.success ? phone9Of(parsed.data) : null;
  if (!phone9) return { ok: false, error: "invalid" };
  if (!withinRateLimit("birthday", await ip(), BIRTHDAY_RATE)) return { ok: false, error: "rate_limited" };
  try {
    await removeBirthday(phone9);
    return { ok: true };
  } catch (err) {
    console.error("[birthday] remove failed:", (err as Error).message);
    return { ok: false, error: "failed" };
  }
}
