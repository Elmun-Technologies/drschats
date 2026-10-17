import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { addAdmin, changePassword, removeAdmin } from "@/app/admin/_actions/orders";
import { logoutEverywhere } from "@/app/admin/_actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/password";
import { formatDateTime } from "@/lib/admin/order-labels";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, PageHeader, dangerButtonClass, inputClass, secondaryButtonClass } from "@/components/admin/ui";

export const metadata = { title: "Administratorlar" };

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const rows = await getDb()
    .select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, lastLoginAt: adminUsers.lastLoginAt })
    .from(adminUsers)
    .orderBy(asc(adminUsers.id));
  return (
    <>
      <PageHeader title="Administratorlar" lead="Panelga kira oladigan xodimlar. Hamma administratorning huquqlari bir xil." />
      <div className="flex flex-col gap-4">
        <Card>
          <ul className="divide-y divide-line">
            {rows.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="block text-[15px] font-semibold">{u.name}{u.id === me.id && " (siz)"}</span>
                  <span className="text-[13px] text-muted">{u.email} · oxirgi kirish: {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}</span>
                </span>
                {u.id !== me.id && (
                  <form action={removeAdmin}>
                    <input type="hidden" name="id" value={u.id} />
                    <button type="submit" className={dangerButtonClass}>Oʻchirish</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Mening parolim" lead="Parol almashtirilganda boshqa qurilmalardagi sessiyalar yopiladi.">
          <ActionForm action={changePassword} submitLabel="Parolni almashtirish" className="grid gap-4 lg:grid-cols-2">
            <Field label="Joriy parol"><input name="current" type="password" autoComplete="current-password" required className={inputClass} /></Field>
            <Field label="Yangi parol" hint={`Kamida ${MIN_PASSWORD_LENGTH} belgi`}><input name="next" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required className={inputClass} /></Field>
          </ActionForm>
          <form action={logoutEverywhere} className="mt-4 border-t border-line pt-4">
            <button type="submit" className={secondaryButtonClass}>Barcha qurilmalardan chiqish</button>
          </form>
        </Card>
        <Card title="Yangi administrator">
          <ActionForm action={addAdmin} className="grid gap-4 lg:grid-cols-3">
            <Field label="Ism"><input name="name" required className={inputClass} /></Field>
            <Field label="Email"><input name="email" type="email" required className={inputClass} /></Field>
            <Field label="Parol" hint={`Kamida ${MIN_PASSWORD_LENGTH} belgi`}><input name="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} required className={inputClass} /></Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
