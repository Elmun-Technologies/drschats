import Link from "next/link";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ORDERS_IN_DB } from "@/lib/shopflow";
import { readOnlineProviders } from "@/lib/payments/availability";
import { getIntegrationAdminOverview } from "@/lib/integrations/settings";
import { SITE_URL } from "@/lib/config/site";
import { AnalyticsForm, MessagingForms, PaymentForms, SmsForm, Status, VerificationForm } from "@/components/admin/IntegrationSettingsForms";
import { Card, Notice, PageHeader, SectionTitle, linkClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin/session";

export const metadata = { title: "Integratsiyalar" };
export const dynamic = "force-dynamic";

/** Products on sale without the fiscal codes Payme's receipt needs. */
async function missingFiscal(): Promise<number> {
  try {
    const rows = (await getDb().execute(sql`
      select count(*) as n from products where in_stock and (mxik_code is null or package_code is null)`)) as unknown as { n: string }[];
    return Number(rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}

async function journeyHealth() {
  try {
    const rows = (await getDb().execute(sql`
      select count(*) filter (where created_at > now() - interval '24 hours') as day,
             max(created_at) as last
      from visitor_events`)) as unknown as { day: string; last: string | null }[];
    return { day: Number(rows[0]?.day ?? 0), last: rows[0]?.last ? new Date(rows[0].last) : null };
  } catch {
    return { day: 0, last: null };
  }
}

function Row({ name, detail, on, label }: { name: string; detail: string; on: boolean; label?: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <span className="min-w-0"><span className="block text-[15px] font-semibold text-ink">{name}</span><span className="block text-[13px] leading-[18px] text-muted">{detail}</span></span>
      <Status on={on} label={label} />
    </li>
  );
}

export default async function AdminIntegrationsPage() {
  await requireAdmin();
  const [overview, health, online, noFiscal] = await Promise.all([getIntegrationAdminOverview(), journeyHealth(), readOnlineProviders(), missingFiscal()]);
  const ready = { payme: online.includes("payme"), click: online.includes("click") };
  const a = overview.analytics;
  const telegramClub = Boolean(process.env.BOT_API_KEY && process.env.TELEGRAM_CLUB_BOT_TOKEN);
  const sanity = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder");
  const items = [a.ga4, a.gtm, a.yandexMetrika, a.metaPixel, overview.verification.google, overview.verification.yandex, overview.operator.configured, overview.email.configured, overview.sms.configured, ready.payme, ready.click];
  const connected = items.filter(Boolean).length;

  return (
    <>
      <PageHeader
        title="Integratsiyalar"
        lead="Analitika, reklama teglari, qidiruv tizimlari va xabar kanallari — hammasi shu yerda ulanadi. ID kiritib saqlash kifoya: sayt oʻzi yangilanadi."
        actions={<span className="rounded-[12px] bg-tile px-4 py-3 text-[15px] font-semibold text-ink">{connected} / {items.length} ulangan</span>}
      />
      {overview.storeStatus === "database-error" && <div className="mb-4"><Notice tone="error">Sozlamalar jadvalini oʻqib boʻlmadi — bazada migratsiyalar qoʻllanganini tekshiring.</Notice></div>}
      {(overview.storeStatus === "encryption-key-missing" || overview.storeStatus === "decrypt-error") && <div className="mb-4"><Notice tone="error">Shifrlangan sozlamalarni ochib boʻlmadi: INTEGRATION_ENCRYPTION_KEY saqlash paytidagi bilan bir xil emas. Maxfiy kalitlarni qayta kiriting.</Notice></div>}

      <div className="flex flex-col gap-4">
        <AnalyticsForm overview={overview} />
        <VerificationForm overview={overview} siteUrl={SITE_URL} />
      </div>

      <SectionTitle>Onlayn toʻlov</SectionTitle>
      {ready.payme && noFiscal > 0 && <div className="mb-4"><Notice>{formatNumber(noFiscal)} ta sotuvdagi mahsulotda MXIK yoki qadoq kodi yoʻq — ular bor buyurtmada Payme chekni maʼlumotsiz chiqaradi. Kodlarni <Link href="/admin/products" className={linkClass}>mahsulotlarda</Link> kiriting.</Notice></div>}
      <PaymentForms overview={overview} siteUrl={SITE_URL} ready={ready} ordersInDb={ORDERS_IN_DB} />

      <SectionTitle>Xabar kanallari</SectionTitle>
      <MessagingForms overview={overview} />
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SmsForm overview={overview} />
        <Card title="Xabar qoidalari" lead="Avtomatlashtirish va kampaniyalar uchun bir xil — kodda yozilgan, oʻchirib boʻlmaydi.">
          <ul className="flex list-disc flex-col gap-2 pl-5 text-[14px] leading-5 text-ink-2">
            <li>21:00–09:00 (Toshkent) hech qanday marketing xabari ketmaydi — navbat ertalab 09:00 ga suriladi.</li>
            <li>Har bir SMS oxirida «STOP» havolasi, Telegram xabarida «oʻchirish» tugmasi. Obunadan chiqqanlarga boshqa yuborilmaydi.</li>
            <li>Telegram ulangan mijozga — Telegram (bepul), boʻlmasa SMS. Telefoni nomaʼlum tashrif buyuruvchi faqat retarget auditoriyasida.</li>
            <li>Shaxsiy promokod xabar ketayotgan paytda beriladi; havola bosilishi va kod orqali buyurtmalar natijalarda koʻrinadi.</li>
          </ul>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
            <Link href="/admin/flows" className={linkClass}>Avtomatlashtirish →</Link>
            <Link href="/admin/messages" className={linkClass}>Xabarlar jurnali →</Link>
          </p>
        </Card>
      </div>

      <SectionTitle>Boshqa ulanishlar</SectionTitle>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Saytning oʻz kuzatuvi" lead="Mijozlar yoʻli, voronka va segmentlar shu maʼlumotdan quriladi. Sozlash talab qilinmaydi.">
          <ul className="divide-y divide-line">
            <Row name="Birinchi tomon kuzatuv" detail={health.last ? `Oxirgi 24 soatda ${formatNumber(health.day)} ta hodisa` : "Hali hodisa kelmagan — yangi buildʼdan keyin boshlanadi"} on={health.day > 0} label={health.day > 0 ? "Ishlayapti" : "Kutilmoqda"} />
            <Row name="Telegram klub boti" detail="Mini App, aʼzolar, kampaniyalar" on={telegramClub} />
            <Row name="Sanity CMS" detail="Blog va kontent" on={sanity} />
          </ul>
          <p className="mt-3 text-[13px] text-muted">Klub boti sozlamalari: <Link href="/admin/bot" className={linkClass}>Telegram klub</Link>.</p>
        </Card>
        <Card title="Yetkazish" lead="Kuryer xizmatlari">
          <ul className="divide-y divide-line">
            <Row name="BTS Express" detail="Operator qoʻlda boshqaradi — API ulanmagan" on={false} label="Qoʻlda" />
            <Row name="Yandex Dostavka" detail="Operator qoʻlda boshqaradi — API ulanmagan" on={false} label="Qoʻlda" />
          </ul>
        </Card>
      </div>
    </>
  );
}
