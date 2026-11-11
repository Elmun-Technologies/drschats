import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ADMIN_ROLES, adminUsers } from "@/lib/db/schema";
import { requireAdmin, twoFactorRequired } from "@/lib/admin/session";
import { addAdmin, removeAdmin, resetAdminTwoFactor, setAdminRole, setRequireTwoFactor } from "@/app/admin/_actions/accounts";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/password";
import { formatDateTime } from "@/lib/admin/order-labels";
import { ROLE_HINT, ROLE_LABEL, isAdminRole } from "@/lib/admin/roles";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, PageHeader, Pill, dangerButtonClass, inputClass, linkClass, secondaryButtonClass } from "@/components/admin/ui";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Administratorlar");
export const dynamic = "force-dynamic";

function RoleSelect({ name = "role", value }: { name?: string; value: string }) {
  return (
    <select name={name} defaultValue={value} className={inputClass} aria-label={t("Rol")}>
      {ADMIN_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
    </select>
  );
}

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const [rows, required] = await Promise.all([
    getDb()
      .select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, lastLoginAt: adminUsers.lastLoginAt, role: adminUsers.role, totpEnabledAt: adminUsers.totpEnabledAt })
      .from(adminUsers)
      .orderBy(asc(adminUsers.id)),
    twoFactorRequired(),
  ]);
  return (
    <>
      <PageHeader
        title={t("Administratorlar")}
        lead={<>{t("Panelga kira oladigan xodimlar va ularning roli. Oʻz parolingiz va ikki bosqichli kirish —")} <Link href="/admin/security" className={linkClass}>{t("Xavfsizlik")}</Link>{t("; kim nima qilgani —")} <Link href="/admin/audit" className={linkClass}>{t("Audit jurnali")}</Link>.</>}
      />
      <div className="flex flex-col gap-4">
        <Card>
          <ul className="divide-y divide-line">
            {rows.map((u) => {
              const role = isAdminRole(u.role) ? u.role : "operator";
              return (
                <li key={u.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                      {u.name}{u.id === me.id && " (siz)"}
                      <Pill tone={role === "owner" ? "dark" : "neutral"}>{ROLE_LABEL[role]}</Pill>
                      <Pill tone={u.totpEnabledAt ? "dark" : "outline"}>{u.totpEnabledAt ? "2FA yoqilgan" : "2FA yoʻq"}</Pill>
                    </span>
                    <span className="text-[13px] text-muted">{u.email} {t("· oxirgi kirish:")} {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}</span>
                  </span>
                  {u.id !== me.id && (
                    <span className="flex flex-wrap items-end gap-2">
                      <ActionForm action={setAdminRole} submitLabel={t("Rolni saqlash")} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="id" value={u.id} />
                        <RoleSelect value={role} />
                      </ActionForm>
                      {u.totpEnabledAt && (
                        <form action={resetAdminTwoFactor}>
                          <input type="hidden" name="id" value={u.id} />
                          <button type="submit" className={secondaryButtonClass} title={t("Telefon va tiklash kodlari yoʻqolgan boʻlsa")}>{t("2FA ni tiklash")}</button>
                        </form>
                      )}
                      <form action={removeAdmin}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className={dangerButtonClass}>{t("Oʻchirish")}</button>
                      </form>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title={t("Rollar")}>
          <ul className="flex flex-col gap-2 text-[14px] leading-5 text-ink-2">
            {ADMIN_ROLES.map((r) => <li key={r}><b className="text-ink">{ROLE_LABEL[r]}</b> — {ROLE_HINT[r]}</li>)}
          </ul>
          <p className="mt-3 text-[13px] text-muted">{t("Rol oʻzgarsa, oʻsha administratorning ochiq sessiyalari yopiladi. Kamida bitta «Egasi» doim qoladi.")}</p>
        </Card>

        <Card title={t("Ikki bosqichli kirish — hamma uchun")} lead={t("Yoqilsa, 2FA yoqmagan administrator panelda faqat «Xavfsizlik» sahifasini koʻradi, toki uni sozlamaguncha.")}>
          <ActionForm action={setRequireTwoFactor} className="flex flex-col gap-4">
            <label className="flex min-h-11 items-center gap-3 text-[14px] text-ink">
              <input type="checkbox" name="require" defaultChecked={required} className="h-5 w-5 accent-ink" />
              {t("Barcha administratorlar uchun majburiy")}
            </label>
          </ActionForm>
        </Card>

        <Card title={t("Yangi administrator")} lead={t("Kamroq huquq bilan boshlang — kerak boʻlsa keyin oshiriladi.")}>
          <ActionForm action={addAdmin} className="grid gap-4 lg:grid-cols-4">
            <Field label={t("Ism")}><input name="name" required className={inputClass} /></Field>
            <Field label={t("Email")}><input name="email" type="email" required className={inputClass} /></Field>
            <Field label={t("Parol")} hint={`Kamida ${MIN_PASSWORD_LENGTH} belgi`}><input name="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required className={inputClass} /></Field>
            <Field label={t("Rol")}><RoleSelect value="operator" /></Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
