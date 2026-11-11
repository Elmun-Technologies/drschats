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
import { configStatus } from "@/lib/ops/config-status";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Integratsiyalar");
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
  const [overview, health, online, noFiscal, system] = await Promise.all([getIntegrationAdminOverview(), journeyHealth(), readOnlineProviders(), missingFiscal(), configStatus()]);
  const ready = { payme: online.includes("payme"), click: online.includes("click") };
  const a = overview.analytics;
  const telegramClub = Boolean(process.env.BOT_API_KEY && process.env.TELEGRAM_CLUB_BOT_TOKEN);
  const sanity = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder");
  const items = [a.ga4, a.gtm, a.yandexMetrika, a.metaPixel, overview.verification.google, overview.verification.yandex, overview.operator.configured, overview.email.configured, overview.sms.configured, ready.payme, ready.click];
  const connected = items.filter(Boolean).length;

  return (
    <>
      <PageHeader
        title={t("Integratsiyalar")}
        lead={t("Analitika, reklama teglari, qidiruv tizimlari va xabar kanallari — hammasi shu yerda ulanadi. ID kiritib saqlash kifoya: sayt oʻzi yangilanadi.")}
        actions={<span className="rounded-[12px] bg-tile px-4 py-3 text-[15px] font-semibold text-ink">{t("{n} / {total} ulangan", { n: connected, total: items.length })}</span>}
      />
      {overview.storeStatus === "database-error" && <div className="mb-4"><Notice tone="error">{t("Sozlamalar jadvalini oʻqib boʻlmadi — bazada migratsiyalar qoʻllanganini tekshiring.")}</Notice></div>}
      {(overview.storeStatus === "encryption-key-missing" || overview.storeStatus === "decrypt-error") && <div className="mb-4"><Notice tone="error">{t("Shifrlangan sozlamalarni ochib boʻlmadi: INTEGRATION_ENCRYPTION_KEY saqlash paytidagi bilan bir xil emas. Maxfiy kalitlarni qayta kiriting.")}</Notice></div>}

      <div className="flex flex-col gap-4">
        <AnalyticsForm overview={overview} />
        <VerificationForm overview={overview} siteUrl={SITE_URL} />
      </div>

      <SectionTitle>{t("Onlayn toʻlov")}</SectionTitle>
      {ready.payme && noFiscal > 0 && <div className="mb-4"><Notice>{t("{n} ta sotuvdagi mahsulotda MXIK yoki qadoq kodi yoʻq — ular bor buyurtmada Payme chekni maʼlumotsiz chiqaradi.", { n: formatNumber(noFiscal) })} <Link href="/admin/products" className={linkClass}>{t("Kodlarni mahsulotlarda kiriting.")}</Link></Notice></div>}
      <PaymentForms overview={overview} siteUrl={SITE_URL} ready={ready} ordersInDb={ORDERS_IN_DB} />

      <SectionTitle>{t("Xabar kanallari")}</SectionTitle>
      <MessagingForms overview={overview} />
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SmsForm overview={overview} />
        <Card title={t("Xabar qoidalari")} lead={t("Avtomatlashtirish va kampaniyalar uchun bir xil — kodda yozilgan, oʻchirib boʻlmaydi.")}>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-[14px] leading-5 text-ink-2">
            <li>{t("18:00–09:00 (Toshkent) hech qanday marketing xabari ketmaydi — navbat ertalab 09:00 ga suriladi (2026-11-01 dan reklama SMS va qoʻngʻiroqlari shu vaqtda taqiqlangan).")}</li>
            <li>{t("Reklama SMS faqat oldindan rozilik bergan raqamga ketadi (savatdagi belgi); rozilik yoʻq boʻlsa xabar «rozilik yoʻq» bilan oʻtkaziladi. Yuboruvchi pd.gov.uz reyestrida roʻyxatdan oʻtgan boʻlishi kerak.")}</li>
            <li>{t("Har bir SMS oxirida «STOP» havolasi, Telegram xabarida «oʻchirish» tugmasi. Obunadan chiqqanlarga boshqa yuborilmaydi.")}</li>
            <li>{t("Telegram ulangan mijozga — Telegram (bepul), boʻlmasa SMS. Telefoni nomaʼlum tashrif buyuruvchi faqat retarget auditoriyasida.")}</li>
            <li>{t("Shaxsiy promokod xabar ketayotgan paytda beriladi; havola bosilishi va kod orqali buyurtmalar natijalarda koʻrinadi.")}</li>
          </ul>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
            <Link href="/admin/flows" className={linkClass}>{t("Avtomatlashtirish →")}</Link>
            <Link href="/admin/messages" className={linkClass}>{t("Xabarlar jurnali →")}</Link>
          </p>
        </Card>
      </div>

      <SectionTitle>{t("Tizim holati")}</SectionTitle>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t("Sozlamalar")} lead={t("Muhit oʻzgaruvchilari va panel birga — nima yoqilgan, nima yoʻq. Qiymatlar koʻrsatilmaydi. Sogʻliq tekshiruvi: /api/health.")}>
          <ul className="divide-y divide-line">
            {system.items.map((item) => <Row key={item.name} name={t(item.name)} detail={t(item.detail)} on={item.on} />)}
          </ul>
          {system.issues.length > 0 && <div className="mt-3"><Notice tone="error">{t("Notoʻgʻri qiymat:")} {system.issues.join("; ")}</Notice></div>}
        </Card>
        <Card title={t("Fon ishlari va CSP")} lead={t("Xabarlar navbati, buyurtma xabarlari va brauzer xavfsizlik siyosati buzilishlari (soʻnggi 7 kun).")}>
          {system.worker ? (
            <ul className="divide-y divide-line">
              <Row name={t("Navbat kechikishi")} detail={t("{sec} s · 10 daqiqadan ortiq kutayotgan: {n}", { sec: formatNumber(system.worker.lagSec), n: formatNumber(system.worker.overdue) })} on={system.worker.overdue === 0} label={system.worker.overdue === 0 ? t("Joyida") : t("Orqada")} />
              <Row name={t("Soʻnggi soatda yuborilmagan")} detail={t("{n} ta xabar", { n: formatNumber(system.worker.failed1h) })} on={system.worker.failed1h === 0} label={system.worker.failed1h === 0 ? t("Yoʻq") : t("Bor")} />
              <Row name={t("Yetib bormagan buyurtma xabarlari")} detail={t("{n} ta (24 soat)", { n: formatNumber(system.worker.unsentOperatorPings) })} on={system.worker.unsentOperatorPings === 0} label={system.worker.unsentOperatorPings === 0 ? t("Yoʻq") : t("Bor")} />
            </ul>
          ) : <p className="text-[14px] text-muted">{t("Baza ulanmagan — fon ishlari yoʻq.")}</p>}
          {system.csp.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-[13px] text-ink-2">
              {system.csp.map((r) => <li key={`${r.directive}:${r.blocked}`} className="flex justify-between gap-3"><span className="min-w-0 truncate">{r.directive} · {r.blocked}</span><span className="font-semibold text-ink">{formatNumber(r.count)}</span></li>)}
            </ul>
          ) : <p className="mt-3 border-t border-line pt-3 text-[13px] text-muted">{t("CSP buzilishi qayd etilmagan.")}</p>}
        </Card>
      </div>

      <SectionTitle>{t("Boshqa ulanishlar")}</SectionTitle>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t("Saytning oʻz kuzatuvi")} lead={t("Mijozlar yoʻli, voronka va segmentlar shu maʼlumotdan quriladi. Sozlash talab qilinmaydi.")}>
          <ul className="divide-y divide-line">
            <Row name={t("Birinchi tomon kuzatuv")} detail={health.last ? t("Oxirgi 24 soatda {n} ta hodisa", { n: formatNumber(health.day) }) : t("Hali hodisa kelmagan — yangi buildʼdan keyin boshlanadi")} on={health.day > 0} label={health.day > 0 ? t("Ishlayapti") : t("Kutilmoqda")} />
            <Row name={t("Telegram klub boti")} detail={t("Mini App, aʼzolar, kampaniyalar")} on={telegramClub} />
            <Row name="Sanity CMS" detail={t("Blog va kontent")} on={sanity} />
          </ul>
          <p className="mt-3 text-[13px] text-muted">{t("Klub boti sozlamalari:")} <Link href="/admin/bot" className={linkClass}>{t("Telegram klub")}</Link>.</p>
        </Card>
        <Card title={t("Yetkazish")} lead={t("Kuryer xizmatlari")}>
          <ul className="divide-y divide-line">
            <Row name="BTS Express" detail={t("Operator qoʻlda boshqaradi — API ulanmagan")} on={false} label={t("Qoʻlda")} />
            <Row name="Yandex Dostavka" detail={t("Operator qoʻlda boshqaradi — API ulanmagan")} on={false} label={t("Qoʻlda")} />
          </ul>
        </Card>
      </div>
    </>
  );
}
