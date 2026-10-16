import { notFound } from "next/navigation";
import { AdminPreviewFrame } from "@/components/admin/AdminPreviewFrame";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { CampaignLinkBuilder } from "@/components/admin/CampaignLinkBuilder";
import { IntegrationStatusCard } from "@/components/admin/IntegrationStatusCard";
import { SalesTrendChart } from "@/components/admin/SalesTrendChart";
import { Card, PageHeader, Pill } from "@/components/admin/ui";
import type { DailyMetric } from "@/lib/admin/metrics";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin panel demo · Go Vita" };

const DEMO_DAILY: DailyMetric[] = [
  { date: "2026-10-09", label: "9 okt", orders: 8, revenue: 1_480_000 },
  { date: "2026-10-10", label: "10 okt", orders: 11, revenue: 2_210_000 },
  { date: "2026-10-11", label: "11 okt", orders: 7, revenue: 1_160_000 },
  { date: "2026-10-12", label: "12 okt", orders: 13, revenue: 2_740_000 },
  { date: "2026-10-13", label: "13 okt", orders: 10, revenue: 1_920_000 },
  { date: "2026-10-14", label: "14 okt", orders: 16, revenue: 3_380_000 },
  { date: "2026-10-15", label: "15 okt", orders: 12, revenue: 2_530_000 },
];

function MetricIcon({ children }: { children: string }) {
  return <span aria-hidden="true" className="text-[17px] font-bold">{children}</span>;
}

export default function AdminPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <AdminPreviewFrame>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Boshqaruv paneli" lead="Savdo, buyurtmalar, mijozlar va marketing uchun yagona ish maydoni." />
        <span className="mb-6 rounded-sm border border-[#e4e6e8] bg-white px-3 py-2 text-[10px] font-semibold text-[#63686e]">Namuna · 7 kun</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AdminMetricCard label="Bekor qilinmagan buyurtma summasi" value="15 420 000 soʻm" caption="Oldingi davrga nisbatan +18% · demo" delta={{ current: 15420000, previous: 13068000 }} icon={<MetricIcon>↗</MetricIcon>} />
        <AdminMetricCard label="Buyurtmalar" value="77" caption="Oxirgi 7 kun · demo" delta={{ current: 77, previous: 64 }} icon={<MetricIcon>#</MetricIcon>} />
        <AdminMetricCard label="Oʻrtacha chek" value="220 286 soʻm" caption="Bekor qilinganlar chiqarilgan · demo" icon={<MetricIcon>◉</MetricIcon>} />
        <AdminMetricCard label="Mijozlar" value="58" caption="Davr ichida buyurtma qilganlar · demo" delta={{ current: 58, previous: 51 }} icon={<MetricIcon>♧</MetricIcon>} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <SalesTrendChart data={DEMO_DAILY} />
        <Card title="Buyurtma bosqichlari">
          <div className="space-y-4">
            {[["Yangi", 12, "bg-[#0f2d24]"], ["Tasdiqlangan", 18, "bg-[#0f2d24]"], ["Yoʻlda", 9, "bg-[#806a3e]"], ["Yetkazilgan", 34, "bg-[#0f2d24]"]] .map(([label, value, color]) => (
              <div key={label as string} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-[12px] text-[#44494e]"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</span><span className="text-[13px] font-bold text-[#0f2d24]">{value}</span></div>
            ))}
          </div>
          <div className="mt-5 rounded-sm bg-[#f1f3f0] p-3 text-[10px] leading-4 text-[#63686e]">Bu demo taxtasi real admin’da buyurtma statuslari bilan to‘ldiriladi. Kuryer statusi API ulanmaguncha qo‘lda boshqariladi.</div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <Card title="Soʻnggi buyurtmalar">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[530px] text-left">
              <thead><tr className="border-b border-[#e4e6e8] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#63686e]"><th className="pb-3 pr-3">Buyurtma</th><th className="pb-3 pr-3">Mijoz</th><th className="pb-3 pr-3">Holat</th><th className="pb-3 text-right">Summa</th></tr></thead>
              <tbody className="divide-y divide-[#f1f3f0]">
                {[["DEMO-1048", "Namuna mijoz 01", "Yetkazilgan", 385000], ["DEMO-1047", "Namuna mijoz 02", "Yangi", 219000], ["DEMO-1046", "Namuna mijoz 03", "Yoʻlda", 510000], ["DEMO-1045", "Namuna mijoz 04", "Tasdiqlangan", 175000]].map(([number, name, status, total]) => (
                  <tr key={number} className="text-[11px]"><td className="py-3 pr-3 font-bold text-[#0f2d24]">{number}</td><td className="py-3 pr-3 font-medium text-[#44494e]">{name}</td><td className="py-3 pr-3"><Pill tone={status === "Yangi" ? "dark" : "neutral"}>{status}</Pill></td><td className="py-3 text-right font-bold text-[#44494e]">{formatNumber(Number(total))} soʻm</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] text-[#63686e]">Faqat ko‘rinish namunasi — maʼlumotlar soxta.</p>
        </Card>
        <Card title="Buyurtma manbalari">
          <ul className="divide-y divide-[#e4e6e8]">
            {[["Google", 24, 5_870_000], ["Instagram", 19, 4_160_000], ["Telegram", 13, 2_740_000], ["Bevosita", 21, 2_650_000]].map(([source, count, value]) => <li key={source} className="flex items-center justify-between gap-3 py-3"><span><span className="block text-[11px] font-semibold text-[#44494e]">{source}</span><span className="text-[9px] text-[#63686e]">{count} buyurtma</span></span><span className="text-[11px] font-bold text-[#0f2d24]">{formatNumber(Number(value))} soʻm</span></li>)}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section id="demo-marketing"><CampaignLinkBuilder baseUrl="https://www.govita.uz" /></section>
        <Card title="Mijozlar bosqichi">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[["Yangi", 18], ["Qayta xarid", 22], ["VIP", 7], ["Faolligi pasaygan", 11]].map(([label, value]) => <div key={label} className="rounded-sm bg-[#f1f3f0] p-3"><p className="text-[9px] text-[#63686e]">{label}</p><p className="mt-1 text-[18px] font-bold text-[#0f2d24]">{value}</p></div>)}
          </div>
          <p className="mt-3 text-[10px] leading-4 text-[#63686e]">Haqiqiy panelda segmentlar buyurtma tarixidan avtomatik hisoblanadi; jamoa izohlari profilga biriktiriladi.</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IntegrationStatusCard name="Google Analytics 4" category="Analitika" description="Tashriflar va sayt eventlari." state="connected" detail="Demo status — haqiqiy ulanish emas." icon={<MetricIcon>GA</MetricIcon>} />
        <IntegrationStatusCard name="Click / Payme" category="Toʻlov" description="Online toʻlovlar." state="planned" detail="Haqiqiy merchant kalitlari va provider callback kerak." icon={<MetricIcon>₿</MetricIcon>} />
        <IntegrationStatusCard name="BTS / Yandex" category="Yetkazib berish" description="Kuryer statuslari va tracking." state="manual" detail="Demo ko‘rinishi — API hali ulanmagan." icon={<MetricIcon>↗</MetricIcon>} />
        <IntegrationStatusCard name="SMS provayderi" category="Xabarlar" description="Buyurtma xabarlari va kampaniyalar." state="planned" detail="Provayder tanlangach ulash mumkin." icon={<MetricIcon>SMS</MetricIcon>} />
      </div>

      <Card title="Katalog va blog boshqaruvi" className="mt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-sm bg-[#f1f3f0] p-3"><p className="text-[10px] text-[#63686e]">Mahsulotlar</p><p className="mt-1 text-[18px] font-bold text-[#0f2d24]">128 <span className="text-[10px] font-medium">demo</span></p></div>
          <div className="rounded-sm bg-[#f1f3f0] p-3"><p className="text-[10px] text-[#63686e]">Kategoriyalar</p><p className="mt-1 text-[18px] font-bold text-[#0f2d24]">15 <span className="text-[10px] font-medium">demo</span></p></div>
          <div className="rounded-sm bg-[#f1f3f0] p-3"><p className="text-[10px] text-[#63686e]">Blog maqolalari</p><p className="mt-1 text-[18px] font-bold text-[#0f2d24]">3 <span className="text-[10px] font-medium">demo</span></p></div>
        </div>
        <p className="mt-3 text-[10px] leading-4 text-[#63686e]">Haqiqiy katalog boshqaruvi mavjud; blog tahriri esa hozir Sanity CMS konfiguratsiyasiga bogʻliq.</p>
      </Card>
    </AdminPreviewFrame>
  );
}
