import Link from "next/link";
import { customerLifecycle, listCustomers } from "@/lib/admin/customers";
import { formatDateTime } from "@/lib/admin/order-labels";
import { Card, PageHeader, inputClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Mijozlar" };

function phoneMask(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 ? `+${digits.slice(0, -9)} ${digits.slice(-9, -6)} ${digits.slice(-6, -3)} ${digits.slice(-3)}` : phone;
}

function LifecyclePill({ stage }: { stage: ReturnType<typeof customerLifecycle> }) {
  const labels = { new: "Yangi", repeat: "Qayta xarid", vip: "VIP", dormant: "Faolligi pasaygan" };
  const classes = { new: "bg-[#f1f3f0] text-[#44494e]", repeat: "bg-[#f1f3f0] text-[#0f2d24]", vip: "bg-[#fbf6eb] text-[#806a3e]", dormant: "bg-[#fdf0ef] text-[#c8161d]" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${classes[stage]}`}>{labels[stage]}</span>;
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const customers = await listCustomers(q);
  const today = Date.now();
  const returning = customers.filter((customer) => customer.successfulOrderCount > 1).length;
  const vip = customers.filter((customer) => customerLifecycle(customer, today) === "vip").length;
  const dormant = customers.filter((customer) => customerLifecycle(customer, today) === "dormant").length;

  return (
    <>
      <PageHeader title="Mijozlar" lead="Buyurtmalarda ko‘rsatilgan telefon raqami bo‘yicha birlashtirilgan mijozlar. Profil maʼlumotlari faqat admin jamoasiga ko‘rinadi." />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[["Roʻyxatdagi mijoz", customers.length], ["Qayta xarid qilgan", returning], ["VIP · 1 mln+ yoki 3 xarid", vip], ["Faolligi pasaygan · 60+ kun", dormant]].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#e4e6e8] bg-white p-4 shadow-[0_2px_10px_rgba(23,25,27,0.035)]"><p className="text-[11px] text-[#63686e]">{label}</p><p className="mt-2 text-[23px] font-bold tracking-[-0.04em] text-[#0f2d24]">{value}</p></div>
        ))}
      </div>

      <Card title="Mijozlar roʻyxati" actions={<span className="text-[10px] text-[#63686e]">{customers.length}{customers.length === 250 ? "+" : ""} ta koʻrsatilmoqda</span>}>
        <form role="search" action="/admin/customers" className="mb-4 flex flex-wrap gap-2">
          <input name="q" defaultValue={q} placeholder="Ism, telefon yoki email boʻyicha qidirish" aria-label="Mijozlarni qidirish" className={`${inputClass} max-w-[460px]`} />
          <button type="submit" className="inline-flex h-11 items-center justify-center rounded-sm bg-[#0f2d24] px-4 text-[12px] font-semibold text-white hover:bg-[#09231a]">Qidirish</button>
          {q && <Link href="/admin/customers" className="inline-flex h-11 items-center px-3 text-[12px] font-semibold text-[#44494e] hover:underline">Tozalash</Link>}
        </form>

        {customers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead><tr className="border-b border-[#e4e6e8] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#63686e]"><th className="pb-3">Mijoz</th><th className="pb-3">Buyurtmalar</th><th className="pb-3">Buyurtmalar summasi</th><th className="pb-3">Soʻnggi faollik</th><th className="pb-3">Bosqich</th><th className="pb-3 text-right">Koʻrish</th></tr></thead>
              <tbody className="divide-y divide-[#f1f3f0]">
                {customers.map((customer) => (
                  <tr key={customer.phone9} className="text-[12px]">
                    <td className="py-3.5 pr-3"><Link href={`/admin/customers/${customer.phone9}`} className="block font-semibold text-[#0f2d24] hover:underline">{customer.name}</Link><span className="mt-0.5 block text-[10px] text-[#63686e]">{phoneMask(customer.phone)}{customer.email ? ` · ${customer.email}` : ""}</span></td>
                    <td className="py-3.5 pr-3"><span className="font-semibold text-[#44494e]">{customer.orderCount}</span>{customer.orderCount > 1 && <span className="ml-1 text-[10px] text-[#0f2d24]">qayta</span>}</td>
                    <td className="whitespace-nowrap py-3.5 pr-3 font-semibold text-[#0f2d24]">{formatNumber(customer.lifetimeValue)} soʻm</td>
                    <td className="whitespace-nowrap py-3.5 pr-3 text-[#63686e]">{formatDateTime(customer.lastOrderAt)}</td>
                    <td className="py-3.5 pr-3"><LifecyclePill stage={customerLifecycle(customer, today)} /></td>
                    <td className="py-3.5 text-right"><Link href={`/admin/customers/${customer.phone9}`} aria-label={`${customer.name} profilini ochish`} className="inline-flex h-8 items-center rounded-sm border border-[#e4e6e8] px-3 text-[10px] font-semibold text-[#0f2d24] hover:bg-[#f1f3f0]">Profil ↗</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-sm bg-[#f1f3f0] px-4 py-10 text-center"><p className="text-[13px] font-semibold text-[#44494e]">{q ? "Mijoz topilmadi" : "Hozircha mijozlar yoʻq"}</p><p className="mt-1 text-[11px] text-[#63686e]">{q ? "Qidiruv soʻzini yoki telefon raqamini tekshiring." : "Sayt orqali birinchi buyurtma kelganda mijoz profili avtomatik yaratiladi."}</p></div>
        )}
      </Card>

      <p className="mt-4 text-[10px] leading-4 text-[#63686e]">Roʻyxat oxirgi 250 ta noyob telefon raqamini ko‘rsatadi. Bosqichlar xarid maʼlumotidan avtomatik hisoblanadi: yangi → qayta xarid → VIP; 60 kundan ortiq buyurtmasiz qolgan mijoz “faolligi pasaygan”ga o‘tadi. Xarid summasiga bekor qilinganlar kiritilmaydi. Tibbiy maʼlumot saqlamang.</p>
    </>
  );
}
