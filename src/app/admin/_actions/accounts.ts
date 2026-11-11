"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { ADMIN_ROLES, adminUsers } from "@/lib/db/schema";
import { requireAdmin, setSessionCookie } from "@/lib/admin/session";
import { ADMIN_TABLE_LOCK } from "@/lib/admin/accounts";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/admin/password";
import { generateRecoveryCodes, generateTotpSecret, hashRecoveryCode, verifyTotp } from "@/lib/admin/totp";
import { openTotpSecret, sealTotpSecret } from "@/lib/admin/totp-store";
import { auditLog } from "@/lib/admin/audit";
import { savePublicSettings } from "@/lib/integrations/site-settings";
import type { FormState } from "./catalog";
import { t } from "@/lib/admin/i18n/server";

/* ---------- administrators (owner) ---------- */

const adminSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(200),
  role: z.enum(ADMIN_ROLES),
});

export async function addAdmin(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin("users");
  const parsed = adminSchema.safeParse({ ...Object.fromEntries(form), role: form.get("role") || "operator" });
  if (!parsed.success) return { error: t("Maydonlarni tekshiring: parol kamida {n} belgi.", { n: MIN_PASSWORD_LENGTH }) };
  const db = getDb();
  const [exists] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  if (exists) return { error: t("Bu email bilan administrator bor.") };
  const [row] = await db
    .insert(adminUsers)
    .values({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password), role: parsed.data.role })
    .returning({ id: adminUsers.id });
  await auditLog(me, "admin.add", parsed.data.email, { id: row.id, role: parsed.data.role });
  revalidatePath("/admin/users");
  return { ok: t("Administrator qoʻshildi.") };
}

/** Owners left after removing or demoting `id` — the panel must never be left without one. */
async function ownersWithout(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0], id: number): Promise<number> {
  const [{ n }] = (await tx.execute(sql`select count(*)::int as n from admin_users where role = 'owner' and id <> ${id}`)) as unknown as { n: number }[];
  return Number(n);
}

export async function removeAdmin(form: FormData) {
  const me = await requireAdmin("users");
  const id = Number(form.get("id"));
  // Never yourself, and never the last owner — two owners removing each other at once must not leave none.
  if (Number.isInteger(id) && id !== me.id) {
    const removed = await getDb().transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(${ADMIN_TABLE_LOCK})`);
      if ((await ownersWithout(tx, id)) < 1) return null;
      const [row] = await tx.delete(adminUsers).where(eq(adminUsers.id, id)).returning({ email: adminUsers.email });
      return row ?? null;
    });
    if (removed) await auditLog(me, "admin.remove", removed.email, { id });
  }
  revalidatePath("/admin/users");
}

const roleSchema = z.object({ id: z.coerce.number().int().positive(), role: z.enum(ADMIN_ROLES) });

export async function setAdminRole(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin("users");
  const parsed = roleSchema.safeParse({ id: form.get("id"), role: form.get("role") });
  if (!parsed.success) return { error: t("Rolni tanlang.") };
  if (parsed.data.id === me.id) return { error: t("Oʻz rolingizni oʻzgartira olmaysiz — buni boshqa egasi qiladi.") };
  const result = await getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${ADMIN_TABLE_LOCK})`);
    if (parsed.data.role !== "owner" && (await ownersWithout(tx, parsed.data.id)) < 1) return "last-owner" as const;
    // A new role takes effect at once: the admin's open sessions end.
    const [row] = await tx
      .update(adminUsers)
      .set({ role: parsed.data.role, sessionEpoch: sql`${adminUsers.sessionEpoch} + 1` })
      .where(eq(adminUsers.id, parsed.data.id))
      .returning({ email: adminUsers.email });
    return row ?? null;
  });
  if (result === "last-owner") return { error: t("Kamida bitta egasi qolishi kerak.") };
  if (!result) return { error: t("Administrator topilmadi.") };
  await auditLog(me, "admin.role", result.email, { id: parsed.data.id, role: parsed.data.role });
  revalidatePath("/admin/users");
  return { ok: t("Rol oʻzgardi. Uning ochiq sessiyalari yopildi.") };
}

/** For an admin who lost both the phone and the recovery codes: 2FA off, sessions closed; they enrol again. */
export async function resetAdminTwoFactor(form: FormData) {
  const me = await requireAdmin("users");
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id === me.id) return;
  const [row] = await getDb()
    .update(adminUsers)
    .set({ totpSecret: null, totpEnabledAt: null, totpLastStep: null, recoveryCodes: null, sessionEpoch: sql`${adminUsers.sessionEpoch} + 1` })
    .where(eq(adminUsers.id, id))
    .returning({ email: adminUsers.email });
  if (row) await auditLog(me, "admin.2fa_reset", row.email, { id });
  revalidatePath("/admin/users");
}

export async function setRequireTwoFactor(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin("users");
  const on = form.get("require") === "on";
  if (on && !me.twoFactor) return { error: t("Avval oʻzingiz uchun ikki bosqichli kirishni yoqing (Xavfsizlik sahifasi).") };
  await savePublicSettings({ "admin.require2fa": on ? "on" : null }, me.id);
  await auditLog(me, "admin.require2fa", null, { on });
  revalidatePath("/admin/users");
  return { ok: on ? t("Endi har bir administrator ikki bosqichli kirishni yoqmaguncha panelning faqat Xavfsizlik sahifasini koʻradi.") : t("Majburiy ikki bosqichli kirish oʻchirildi.") };
}

/* ---------- my account (every role) ---------- */

const passwordSchema = z.object({
  current: z.string().min(1, "Joriy parolni kiriting.").max(200),
  next: z.string().min(MIN_PASSWORD_LENGTH, "Yangi parol kamida {n} belgi boʻlsin.").max(200),
});

/* Changing the password signs out every other session of this admin. */
export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin("dashboard");
  const parsed = passwordSchema.safeParse({ current: form.get("current"), next: form.get("next") });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message;
    return { error: message ? t(message, { n: MIN_PASSWORD_LENGTH }) : t("Maydonlarni tekshiring.") };
  }
  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, me.id)).limit(1);
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) return { error: t("Joriy parol notoʻgʻri.") };
  const [updated] = await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(parsed.data.next), sessionEpoch: sql`${adminUsers.sessionEpoch} + 1` })
    .where(eq(adminUsers.id, me.id))
    .returning({ epoch: adminUsers.sessionEpoch });
  await setSessionCookie(me.id, updated.epoch);
  await auditLog(me, "account.password");
  return { ok: t("Parol almashtirildi. Boshqa qurilmalardagi sessiyalar yopildi.") };
}

export type RecoveryState = { error?: string; ok?: string; codes?: string[] } | undefined;

/** Step 1: a fresh secret, stored sealed but not yet active; the page shows its QR code. */
export async function startTwoFactor() {
  const me = await requireAdmin("dashboard");
  if (me.twoFactor) redirect("/admin/security");
  await getDb().update(adminUsers).set({ totpSecret: sealTotpSecret(generateTotpSecret(), me.id), totpEnabledAt: null }).where(eq(adminUsers.id, me.id));
  redirect("/admin/security?setup=1");
}

/** Step 2: the first code from the app turns it on and hands out ten recovery codes, shown once. */
export async function confirmTwoFactor(_: RecoveryState, form: FormData): Promise<RecoveryState> {
  const me = await requireAdmin("dashboard");
  const db = getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, me.id)).limit(1);
  if (!user?.totpSecret || user.totpEnabledAt) return { error: t("Sozlashni qaytadan boshlang.") };
  const secret = openTotpSecret(user.totpSecret, me.id);
  const step = secret ? verifyTotp(secret, String(form.get("code") ?? "")) : null;
  if (step === null) return { error: t("Kod mos kelmadi. Ilovadagi joriy 6 xonali kodni kiriting (telefon vaqti avtomatik boʻlsin).") };
  const codes = generateRecoveryCodes();
  await db
    .update(adminUsers)
    .set({ totpEnabledAt: new Date(), totpLastStep: step, recoveryCodes: codes.map(hashRecoveryCode) })
    .where(eq(adminUsers.id, me.id));
  await auditLog(me, "account.2fa_on");
  // No revalidatePath: re-rendering the page would swap this form out before the codes are seen.
  return { ok: t("Ikki bosqichli kirish yoqildi."), codes };
}

async function checkCode(me: { id: number }, code: string): Promise<boolean> {
  const [user] = await getDb().select().from(adminUsers).where(eq(adminUsers.id, me.id)).limit(1);
  if (!user?.totpSecret || !user.totpEnabledAt) return false;
  const secret = openTotpSecret(user.totpSecret, me.id);
  const step = secret ? verifyTotp(secret, code, { lastStep: user.totpLastStep }) : null;
  if (step === null) return false;
  await getDb().update(adminUsers).set({ totpLastStep: step }).where(eq(adminUsers.id, me.id));
  return true;
}

export async function regenerateRecoveryCodes(_: RecoveryState, form: FormData): Promise<RecoveryState> {
  const me = await requireAdmin("dashboard");
  if (!(await checkCode(me, String(form.get("code") ?? "")))) return { error: t("Ilovadagi joriy kodni kiriting.") };
  const codes = generateRecoveryCodes();
  await getDb().update(adminUsers).set({ recoveryCodes: codes.map(hashRecoveryCode) }).where(eq(adminUsers.id, me.id));
  await auditLog(me, "account.recovery_codes");
  return { ok: t("Yangi tiklash kodlari. Eskilari endi ishlamaydi."), codes };
}

export async function disableTwoFactor(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireAdmin("dashboard");
  const [user] = await getDb().select().from(adminUsers).where(eq(adminUsers.id, me.id)).limit(1);
  if (!user || !(await verifyPassword(String(form.get("password") ?? ""), user.passwordHash))) return { error: t("Parol notoʻgʻri.") };
  if (!(await checkCode(me, String(form.get("code") ?? "")))) return { error: t("Ilovadagi joriy kodni kiriting.") };
  await getDb()
    .update(adminUsers)
    .set({ totpSecret: null, totpEnabledAt: null, totpLastStep: null, recoveryCodes: null })
    .where(eq(adminUsers.id, me.id));
  await auditLog(me, "account.2fa_off");
  revalidatePath("/admin/security");
  return { ok: t("Ikki bosqichli kirish oʻchirildi.") };
}
