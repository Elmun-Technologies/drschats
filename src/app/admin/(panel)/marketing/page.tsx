import Link from "next/link";
import { CampaignLinkBuilder } from "@/components/admin/CampaignLinkBuilder";
import { Card, PageHeader } from "@/components/admin/ui";
import { getOrderMetrics } from "@/lib/admin/metrics";
import { formatNumber } from "@/lib/utils";
import { getIntegrationAdminOverview } from "@/lib/integrations/settings";

export const metadata = { title: "Marketing" };

function Status({ ready, yes = "Faol", no = "Sozlanmagan" }: { ready: boolean; yes?: string; no?: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold ${ready ? "bg-[#f1f3f0] text-[#0f2d24]" : "bg-[#f1f3f0] text-[#63686e]"}`}><span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-[#0f2d24]" : "bg-[#63686e]"}`} />{ready ? yes : no}</span>;
}

export default async function AdminMarketingPage() {
  const [metrics, integrations] = await Promise.all([getOrderMetrics(30), getIntegrationAdminOverview()]);
  const emailReady = integrations.email.configured;
  const telegramReady = integrations.operator.configured;
  const clubReady = Boolean(process.env.BOT_API_KEY && process.env.TELEGRAM_CLUB_BOT_TOKEN);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.govita.uz";

  return (
    <>
      <PageHeader title="Marketing" lead="Reklama kampaniyalari uchun UTM havolalar yarating va buyurtmalar bo‘yicha manba natijalarini kuzating." />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-md border border-[#e4e6e8] bg-white p-4"><div className="flex items-center justify-between"><p className="text-[11px] font-semibold text-[#44494e]">Email kampaniyalari</p><Status ready={emailReady} yes="Provayder sozlangan" /></div><p className="mt-2 text-[10px] leading-4 text-[#63686e]">{emailReady ? `Resend kaliti ${integrations.email.apiKeyManagedInAdmin ? "admin panelida" : "deploy sozlamasida"} mavjud. Mijoz roziligi va mavjud kampaniya qoidalari asosida yuboriladi.` : "Integratsiyalar bo‘limida Resend API kalitini kiriting — ungacha email yuborilmaydi."}</p></article>
        <article className="rounded-md border border-[#e4e6e8] bg-white p-4"><div className="flex items-center justify-between"><p className="text-[11px] font-semibold text-[#44494e]">Telegram operator xabarlari</p><Status ready={telegramReady} yes="Sozlangan" /></div><p className="mt-2 text-[10px] leading-4 text-[#63686e]">Buyurtma xabarlari va formalar operator chatiga yuborilishi uchun bot tokeni hamda chat ID kerak.</p></article>
        <article className="rounded-md border border-[#e4e6e8] bg-white p-4"><div className="flex items-center justify-between"><p className="text-[11px] font-semibold text-[#44494e]">SMS marketing</p><Status ready={false} yes="Ulangan" no="Hozircha ulanmagan" /></div><p className="mt-2 text-[10px] leading-4 text-[#63686e]">SMS provayder tanlanmagan. Integratsiya qoʻshilgach, rozilik va obunani bekor qilish oqimi ham boshqariladi.</p></article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <CampaignLinkBuilder baseUrl={baseUrl} />
        <Card title="Oxirgi 30 kun · trafik manbasi" actions={<Link href="/admin/analytics" className="text-[10px] font-semibold text-[#0f2d24] hover:underline">Analitikani ochish ↗</Link>}>
          {metrics.current.sources.length ? <ul className="divide-y divide-[#e4e6e8]">
            {metrics.current.sources.map((source) => (
              <li key={source.name} className="flex items-center gap-3 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-[#f1f3f0] text-[10px] font-bold text-[#0f2d24]">{source.name.slice(0, 2).toUpperCase()}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-[#44494e]">{source.name}</span><span className="mt-0.5 block text-[9px] text-[#63686e]">{source.orders} buyurtma</span></span>
                <span className="shrink-0 text-right text-[11px] font-bold text-[#0f2d24]">{formatNumber(source.revenue)} <span className="text-[9px] font-medium text-[#63686e]">soʻm</span></span>
              </li>
            ))}
          </ul> : <div className="rounded-sm bg-[#f1f3f0] px-4 py-7 text-center"><p className="text-[12px] font-semibold text-[#44494e]">Manba maʼlumoti yoʻq</p><p className="mt-1 text-[10px] text-[#63686e]">UTM havolasidan kelgan buyurtmalar shu yerda ko‘rinadi.</p></div>}
          <div className="mt-4 rounded-sm bg-[#f1f3f0] p-3 text-[10px] leading-4 text-[#63686e]">Buyurtma manbasi UTM va reklama click ID orqali saqlanadi. Kampaniya xarajati integratsiyasi yoʻqligi uchun ROAS hisoblanmaydi.</div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Mavjud mijoz kanallari">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-sm bg-[#f1f3f0] p-3"><div><p className="text-[11px] font-semibold text-[#44494e]">Telegram klub</p><p className="mt-0.5 text-[9px] text-[#63686e]">Broadcast va murojaatlarni boshqarish</p></div><Status ready={clubReady} /></div>
            <div className="flex items-center justify-between gap-3 rounded-sm bg-[#f1f3f0] p-3"><div><p className="text-[11px] font-semibold text-[#44494e]">Email / rozilik</p><p className="mt-0.5 text-[9px] text-[#63686e]">Obuna tasdiqlash va email kampaniyalari</p></div><Status ready={emailReady} /></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Link href="/admin/bot" className="inline-flex h-9 items-center rounded-sm bg-[#0f2d24] px-3 text-[10px] font-semibold text-white hover:bg-[#09231a]">Telegramni boshqarish</Link><Link href="/admin/integrations" className="inline-flex h-9 items-center rounded-sm border border-[#e4e6e8] bg-white px-3 text-[10px] font-semibold text-[#44494e] hover:bg-[#f1f3f0]">Barcha integratsiyalar</Link></div>
        </Card>
        <Card title="Kampaniya nazorati">
          <div className="space-y-2 text-[10px] leading-4 text-[#44494e]">
            <p className="flex gap-2"><span className="font-bold text-[#0f2d24]">01</span><span>Har bir reklama uchun alohida UTM kampaniya nomi ishlating.</span></p>
            <p className="flex gap-2"><span className="font-bold text-[#0f2d24]">02</span><span>Buyurtma bazasida birinchi va soʻnggi trafik tegishi saqlanadi.</span></p>
            <p className="flex gap-2"><span className="font-bold text-[#0f2d24]">03</span><span>SMS joʻnatish hozircha oʻchirilgan — provayder ulanmaguncha mijozlarga SMS ketmaydi.</span></p>
          </div>
        </Card>
      </div>
    </>
  );
}
