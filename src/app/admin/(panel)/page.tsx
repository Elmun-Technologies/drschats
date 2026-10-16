import Link from "next/link";
import { importBuiltInCatalog, catalogCounts } from "@/app/admin/_actions/catalog";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminRangeFilter } from "@/components/admin/AdminRangeFilter";
import { Card, PageHeader, Pill, buttonClass, secondaryButtonClass } from "@/components/admin/ui";
import { SalesTrendChart } from "@/components/admin/SalesTrendChart";
import { getOrderMetrics, REPORT_RANGES, type ReportRange } from "@/lib/admin/metrics";
import { STATUS_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Bosh sahifa" };

function Icon({ name }: { name: "cash" | "orders" | "basket" | "people" }) {
  const paths = {
    cash: <><path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 17V6.5A2.5 2.5 0 0 1 6 4h11" /><path d="M17 12h3.5M7 15h.01" /></>,
    orders: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
    basket: <><path d="M4 8h16l-1.5 12h-13z" /><path d="m8 8 4-5 4 5M9 12v4M15 12v4" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3 2.5-4.5 5.5-4.5s5 1.5 5.5 4.5" /><path d="M16 11a3 3 0 0 0 0-6M17 15c2 .4 3.2 1.7 3.5 4" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[18px] w-[18px]">{paths[name]}</svg>;
}

function rangeValue(raw?: string): ReportRange {
  const value = Number(raw);
  return (REPORT_RANGES as readonly number[]).includes(value) ? (value as ReportRange) : 30;
}

function DeltaCaption({ current, previous }: { current: number; previous: number }) {
  if (!previous) return <span>Oldingi davrda buyurtma yoʻq</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  return <span>oldingi davrga nisbatan {change >= 0 ? "+" : ""}{change}%</span>;
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = rangeValue((await searchParams).range);
  const [metrics, counts] = await Promise.all([getOrderMetrics(range), catalogCounts()]);
  const current = metrics.current;
  const previous = metrics.previous;

  return (
    <>
      <PageHeader
        title="Boshqaruv paneli"
        lead="Go Vita doʻkonidagi savdo, buyurtmalar va mijozlar holati."
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <AdminRangeFilter range={range} basePath="/admin" />
            <Link href="/admin/products/new" className={buttonClass}>+ Mahsulot</Link>
          </div>
        )}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminMetricCard label="Bekor qilinmagan buyurtma summasi" value={`${formatNumber(current.revenue)} soʻm`} caption={<DeltaCaption current={current.revenue} previous={previous.revenue} />} delta={{ current: current.revenue, previous: previous.revenue }} icon={<Icon name="cash" />} />
        <AdminMetricCard label="Buyurtmalar" value={formatNumber(current.orderCount)} caption={<DeltaCaption current={current.orderCount} previous={previous.orderCount} />} delta={{ current: current.orderCount, previous: previous.orderCount }} icon={<Icon name="orders" />} />
        <AdminMetricCard label="Oʻrtacha chek" value={`${formatNumber(current.averageOrder)} soʻm`} caption="Bekor qilinganlar hisoblanmadi" icon={<Icon name="basket" />} />
        <AdminMetricCard label="Mijozlar" value={formatNumber(current.customerCount)} caption="Davr ichida buyurtma bergan noyob mijozlar" delta={{ current: current.customerCount, previous: previous.customerCount }} icon={<Icon name="people" />} />
      </div>

      <section aria-labelledby="quick-actions-title" className="mb-5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <h2 id="quick-actions-title" className="text-[13px] font-semibold text-ink">Tezkor ishlar</h2>
          <span className="text-[10px] text-muted">Ko‘p ishlatiladigan bo‘limlar</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
          {[
            { href: "/admin/orders?status=new", icon: "#", label: "Yangi buyurtmalar", hint: `${current.statusCounts.new} ta ko‘rib chiqish kerak`, attention: current.statusCounts.new > 0 },
            { href: "/admin/products/new", icon: "+", label: "Mahsulot qo‘shish", hint: "Narx, qoldiq va rasmlar", attention: false },
            { href: "/admin/customers", icon: "♧", label: "Mijozlar", hint: "Qidiruv va xarid tarixi", attention: false },
            { href: "/admin/bot", icon: "↗", label: "Telegram klub", hint: "Aʼzolar va xabarlar", attention: false },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group flex min-h-[76px] items-center gap-3 rounded-sm border border-line bg-white px-3.5 py-3 transition hover:border-forest/25 hover:bg-[#fbfcfa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm text-[14px] font-semibold ${item.attention ? "bg-[#fbf6eb] text-[#806a3e]" : "bg-tile text-forest"}`}>{item.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-ink">{item.label}</span>
                <span className="mt-1 block truncate text-[10px] text-muted">{item.hint}</span>
              </span>
              <span aria-hidden="true" className="text-[12px] text-muted transition group-hover:translate-x-0.5 group-hover:text-forest">→</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <SalesTrendChart data={current.daily} />
        <Card title="Buyurtma bosqichlari" actions={<Link href="/admin/funnel" className="text-[11px] font-semibold text-[#0f2d24] hover:underline">Voronkani koʻrish ↗</Link>}>
          <div className="space-y-3">
            {([
              ["new", "Yangi", current.statusCounts.new],
              ["confirmed", "Tasdiqlangan", current.statusCounts.confirmed],
              ["shipped", "Yoʻlda", current.statusCounts.shipped],
              ["delivered", "Yetkazilgan", current.statusCounts.delivered],
            ] as const).map(([status, label, value]) => (
              <div key={status} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[12px] text-[#44494e]"><span className={`h-2 w-2 rounded-full ${status === "new" ? "bg-[#0f2d24]" : status === "confirmed" ? "bg-[#0f2d24]" : status === "shipped" ? "bg-[#806a3e]" : "bg-[#0f2d24]"}`} />{label}</span>
                <span className="text-[13px] font-bold tabular-nums text-[#0f2d24]">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-sm bg-[#f1f3f0] p-3.5">
            <div className="flex items-center justify-between text-[11px]"><span className="font-medium text-[#44494e]">Yetkazilgan buyurtmalar</span><span className="font-bold text-[#0f2d24]">{current.orderCount ? Math.round((current.deliveredCount / current.orderCount) * 100) : 0}%</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1f3f0]"><div className="h-full rounded-full bg-[#0f2d24]" style={{ width: `${current.orderCount ? Math.round((current.deliveredCount / current.orderCount) * 100) : 0}%` }} /></div>
            <p className="mt-2 text-[10px] leading-4 text-[#63686e]">Faqat tanlangan davrda yaratilgan buyurtmalar. Bosqichlar buyurtma holatiga qarab hisoblanadi.</p>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <Card title="Soʻnggi buyurtmalar" actions={<Link href="/admin/orders" className={secondaryButtonClass}>Barchasini koʻrish <span aria-hidden="true">↗</span></Link>}>
          {current.recentOrders.length === 0 ? (
            <div className="rounded-sm bg-[#f1f3f0] px-4 py-8 text-center">
              <p className="text-[13px] font-semibold text-[#44494e]">Tanlangan davrda buyurtma yoʻq</p>
              <p className="mt-1 text-[11px] text-[#63686e]">Buyurtma kelganda holati va mijoz maʼlumoti shu yerda koʻrinadi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-left">
                <thead><tr className="border-b border-[#e4e6e8] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#63686e]"><th className="pb-3 pr-3">Buyurtma</th><th className="pb-3 pr-3">Mijoz</th><th className="pb-3 pr-3">Sana</th><th className="pb-3 pr-3">Holat</th><th className="pb-3 text-right">Jami</th></tr></thead>
                <tbody className="divide-y divide-[#f1f3f0]">
                  {current.recentOrders.slice(0, 6).map((order) => (
                    <tr key={order.number ?? order.createdAt.toISOString()} className="group text-[12px]">
                      <td className="py-3 pr-3"><Link href={`/admin/orders/${order.number}`} className="font-bold text-[#0f2d24] hover:underline">{order.number}</Link></td>
                      <td className="max-w-[170px] truncate py-3 pr-3 font-medium text-[#44494e]">{order.customer.name}</td>
                      <td className="whitespace-nowrap py-3 pr-3 text-[#63686e]">{formatDateTime(order.createdAt)}</td>
                      <td className="py-3 pr-3"><Pill tone={order.status === "new" ? "dark" : order.status === "cancelled" ? "red" : "neutral"}>{STATUS_LABEL[order.status]}</Pill></td>
                      <td className="whitespace-nowrap py-3 text-right font-bold tabular-nums text-[#44494e]">{formatNumber(order.total)} soʻm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Buyurtma manbalari" actions={<Link href="/admin/marketing" className="text-[11px] font-semibold text-[#0f2d24] hover:underline">Marketing ↗</Link>}>
          {current.sources.length ? (
            <ul className="divide-y divide-[#e4e6e8]">
              {current.sources.slice(0, 5).map((source) => (
                <li key={source.name} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0"><span className="block truncate text-[12px] font-semibold text-[#44494e]">{source.name}</span><span className="mt-0.5 block text-[10px] text-[#63686e]">{source.orders} ta buyurtma</span></span>
                  <span className="shrink-0 text-right text-[12px] font-bold text-[#0f2d24]">{formatNumber(source.revenue)} <span className="text-[10px] font-medium text-[#63686e]">soʻm</span></span>
                </li>
              ))}
            </ul>
          ) : <p className="rounded-sm bg-[#f1f3f0] px-4 py-6 text-center text-[12px] text-[#63686e]">Manba bilan bogʻlangan buyurtmalar hali yoʻq.</p>}
          <p className="mt-3 text-[10px] leading-4 text-[#63686e]">Manba UTM, reklama click ID yoki tashqi havoladan yozilgan buyurtmalarga asoslanadi.</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Card title="Eng koʻp sotilgan mahsulotlar">
          {current.topProducts.length ? <ul className="divide-y divide-[#e4e6e8]">
            {current.topProducts.map((product, index) => (
              <li key={product.slug} className="flex items-center gap-3 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-[#f1f3f0] text-[11px] font-bold text-[#0f2d24]">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold text-[#0f2d24]">{product.name}</span><span className="mt-0.5 block text-[10px] text-[#63686e]">{product.quantity} dona sotilgan</span></span>
                <span className="shrink-0 text-[12px] font-bold text-[#0f2d24]">{formatNumber(product.revenue)} soʻm</span>
              </li>
            ))}
          </ul> : <p className="text-[12px] text-[#63686e]">Mahsulotlar boʻyicha maʼlumot buyurtma tushgach koʻrinadi.</p>}
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="Katalog holati" actions={<Link href="/admin/products" className="text-[11px] font-semibold text-[#0f2d24] hover:underline">Katalog ↗</Link>}>
            <div className="grid grid-cols-2 gap-2">
              {[["Mahsulot", counts.products], ["Kategoriyalar", counts.categories], ["Brendlar", counts.brands], ["Yashirin / tugagan", counts.hidden]].map(([label, value]) => <div key={label} className="rounded-sm bg-[#f1f3f0] p-3"><p className="text-[10px] text-[#63686e]">{label}</p><p className="mt-1 text-[18px] font-bold text-[#0f2d24]">{value}</p></div>)}
            </div>
            {counts.products === 0 && <p className="mt-3 text-[11px] leading-4 text-[#63686e]">Katalog hali bazaga import qilinmagan. Import mavjud mahsulotlarni olib kiradi.</p>}
          </Card>
          {counts.products === 0 && <Card title="Boshlash uchun katalog importi">
            <p className="mb-3 text-[11px] leading-4 text-[#63686e]">Saytdagi o‘rnatilgan mahsulot, kategoriya va brendlar bazaga ko‘chadi. Bor yozuvlar o‘zgarmaydi.</p>
            <ActionForm action={importBuiltInCatalog} submitLabel="Katalogni import qilish" className="flex flex-col gap-2"><span /></ActionForm>
          </Card>}
        </div>
      </div>
    </>
  );
}
