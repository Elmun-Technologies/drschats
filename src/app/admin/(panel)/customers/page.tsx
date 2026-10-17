import Link from "next/link";
import { customerLifecycle, listCustomers, type CustomerLifecycle } from "@/lib/admin/customers";
import { daysSince } from "@/lib/journey/model";
import { Card, ChipNav, EmptyState, PageHeader, Pill, TableWrap, buttonClass, inputClass, linkClass, secondaryButtonClass, som, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Mijozlar" };

const LIFECYCLE: Record<CustomerLifecycle, { label: string; tone: "neutral" | "outline" | "dark" | "muted" }> = {
  new: { label: "Yangi", tone: "neutral" },
  repeat: { label: "Qayta xarid", tone: "outline" },
  vip: { label: "VIP", tone: "dark" },
  dormant: { label: "Faolligi pasaygan", tone: "muted" },
};

function phoneMask(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 ? `+998 ${digits.slice(-9, -7)} ${digits.slice(-7, -4)} ${digits.slice(-4, -2)} ${digits.slice(-2)}` : phone;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; stage?: string | string[] }> }) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const stageParam = first(params.stage);
  const stage = stageParam && stageParam in LIFECYCLE ? (stageParam as CustomerLifecycle) : null;
  const all = (await listCustomers(q)).map((c) => ({ ...c, lifecycle: customerLifecycle(c) }));
  const rows = stage ? all.filter((c) => c.lifecycle === stage) : all;
  const counts = Object.fromEntries((Object.keys(LIFECYCLE) as CustomerLifecycle[]).map((key) => [key, all.filter((c) => c.lifecycle === key).length]));
  const href = (next: CustomerLifecycle | null) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (next) search.set("stage", next);
    const text = search.toString();
    return `/admin/customers${text ? `?${text}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Mijozlar"
        lead="Buyurtma bergan har bir mijoz, telefon raqami boʻyicha birlashtirilgan: qancha xarid qildi, oxirgi marta qachon va hozir qaysi bosqichda."
        actions={<Link href="/admin/segments" className={secondaryButtonClass}>Segmentlar va retarget</Link>}
      />
      <form role="search" action="/admin/customers" className="mb-4 flex flex-wrap gap-2">
        {stage && <input type="hidden" name="stage" value={stage} />}
        <input name="q" defaultValue={q} placeholder="Ism, telefon yoki email" aria-label="Mijozni qidirish" className={`${inputClass} max-w-[420px]`} />
        <button type="submit" className={buttonClass}>Qidirish</button>
        {q && <Link href={href(stage)} className={secondaryButtonClass}>Tozalash</Link>}
      </form>
      <ChipNav
        label="Mijoz bosqichi"
        className="mb-4"
        items={[
          { href: href(null), label: "Hammasi", active: stage === null, count: all.length },
          ...(Object.keys(LIFECYCLE) as CustomerLifecycle[]).map((key) => ({ href: href(key), label: LIFECYCLE[key].label, active: stage === key, count: counts[key] })),
        ]}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Mijoz topilmadi">Birinchi buyurtma tushishi bilan mijoz shu yerda paydo boʻladi.</EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Mijoz</th>
                  <th className={thClass}>Bosqich</th>
                  <th className={`${thClass} text-right`}>Buyurtmalar</th>
                  <th className={`${thClass} text-right`}>Jami xarid</th>
                  <th className={`${thClass} text-right`}>Oxirgi xariddan beri</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const days = daysSince(c.lastOrderAt);
                  return (
                    <tr key={c.phone9}>
                      <td className={tdClass}>
                        <Link href={`/admin/customers/${c.phone9}`} className={linkClass}>{c.name}</Link>
                        <span className="block text-[13px] text-muted">{phoneMask(c.phone)}{c.email ? ` · ${c.email}` : ""}</span>
                      </td>
                      <td className={tdClass}><Pill tone={LIFECYCLE[c.lifecycle].tone}>{LIFECYCLE[c.lifecycle].label}</Pill></td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(c.successfulOrderCount)}{c.orderCount > c.successfulOrderCount && <span className="block text-[13px] text-muted">+{c.orderCount - c.successfulOrderCount} bekor</span>}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{som(c.lifetimeValue)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{days === 0 ? "bugun" : `${days} kun`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
        {all.length === 250 && <p className="mt-3 text-[13px] text-muted">Eng soʻnggi 250 ta mijoz koʻrsatildi — aniq mijozni qidiruv orqali toping.</p>}
      </Card>
    </>
  );
}
