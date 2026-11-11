import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { flows } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { ensureDefaultFlows } from "@/lib/flows/engine";
import { DEFAULT_FLOWS } from "@/lib/flows/defaults";
import { CHANNEL_LABELS, TRIGGER_INFO, formatDelay, isFlowTrigger, parseSteps } from "@/lib/flows/types";
import { conversion, flowEnrollmentStats, messageStats } from "@/lib/messaging/stats";
import { isQuietHours } from "@/lib/messaging/quiet-hours";
import { reachContext } from "@/lib/messaging/outbox";
import { toggleFlow, runMessagingNow, saveOrderSmsSettings } from "@/app/admin/_actions/flows";
import { readTransactionalSms } from "@/lib/sms/transactional-server";
import { orderSmsTemplates } from "@/lib/sms/transactional";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, EmptyState, Metric, Notice, PageHeader, Pill, linkClass, secondaryButtonClass, smallButtonClass, somShort } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";
import { adminTitle, t } from "@/lib/admin/i18n/server";

export const generateMetadata = () => adminTitle("Avtomatlashtirish");
export const dynamic = "force-dynamic";

export default async function AdminFlowsPage() {
  await requireAdmin();
  await ensureDefaultFlows().catch(() => 0);
  const order = (id: string) => { const i = DEFAULT_FLOWS.findIndex((f) => f.id === id); return i < 0 ? 99 : i; };
  const rows = (await getDb().select().from(flows).orderBy(asc(flows.createdAt), asc(flows.id))).sort((a, b) => order(a.id) - order(b.id));
  const keys = rows.map((f) => `flow-${f.id}`);
  const [stats30, enrollments, reach, orderSms] = await Promise.all([messageStats(keys, 30), flowEnrollmentStats(), reachContext(), readTransactionalSms()]);
  const totals = [...stats30.values()].reduce(
    (sum, s) => ({ sent: sum.sent + s.sent, clicked: sum.clicked + s.clicked, orders: sum.orders + s.orders, revenue: sum.revenue + s.revenue }),
    { sent: 0, clicked: 0, orders: 0, revenue: 0 },
  );
  const activeNow = [...enrollments.values()].reduce((sum, e) => sum + e.activeNow, 0);

  return (
    <>
      <PageHeader
        title={t("Avtomatlashtirish")}
        lead={t("Mijozning harakatiga javoban oʻzi yuboriladigan xabarlar: tashlab ketilgan savat, birinchi xariddan keyin, kurs tugashi, qaytarish. Telegram ulangan boʻlsa — Telegram, boʻlmasa SMS. Har biri sukut boʻyicha oʻchiq.")}
        actions={<Link href="/admin/messages" className={secondaryButtonClass}>{t("Xabarlar jurnali")}</Link>}
      />

      <div className="mb-4 flex flex-col gap-3">
        {!reach.smsAvailable && (
          <Notice>{t("SMS ulanmagan — Telegramga ulanmagan mijozlarga xabar ketmaydi (jurnalda «oʻtkazib yuborildi»).")} <Link href="/admin/integrations" className={linkClass}>{t("Integratsiyalar → SMS (Eskiz)")}</Link>.</Notice>
        )}
        {!reach.clubEnabled && <Notice>{t("Telegram klub oʻchiq — barcha xabarlar SMS orqali ketadi.")} <Link href="/admin/bot" className={linkClass}>{t("Telegram klub")}</Link>.</Notice>}
        {isQuietHours(new Date()) && <Notice>{t("Hozir kechki/tungi vaqt (18:00–09:00, Toshkent): yangi xabarlar ertalab 09:00 da ketadi.")}</Notice>}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label={t("Hozir oqimlarda")} value={formatNumber(activeNow)} hint="mijoz" />
        <Metric label={t("Yuborildi (30 kun)")} value={formatNumber(totals.sent)} hint={`${formatNumber(totals.clicked)} ta bosildi`} />
        <Metric label={t("Buyurtmalar (30 kun)")} value={formatNumber(totals.orders)} hint={t("kod yoki havola orqali")} />
        <Metric label={t("Tushum (30 kun)")} value={somShort(totals.revenue)} hint={`konversiya ${conversion(totals.orders, totals.sent)}`} />
      </div>

      <Card
        title={t("Buyurtma SMS'lari")}
        lead={t("Mijoz buyurtma berganda va operator holatini oʻzgartirganda. Telegram klubga ulangan mijozga bot yozadi, SMS ketmaydi. Marketing emas: STOP havolasi yoʻq, rad etganlarga ham ketadi, tunda ham yuboriladi.")}
        className="mt-4"
      >
        <ActionForm action={saveOrderSmsSettings} className="flex flex-col gap-3">
          <label className="flex min-h-11 items-center gap-3 text-[15px] text-ink">
            <input type="checkbox" name="orderPlaced" defaultChecked={orderSms.orderPlaced} className="h-5 w-5 accent-ink" />
            {t("Buyurtma qabul qilinganda")}
          </label>
          <label className="flex min-h-11 items-center gap-3 text-[15px] text-ink">
            <input type="checkbox" name="statusChanged" defaultChecked={orderSms.statusChanged} className="h-5 w-5 accent-ink" />
            {t("Holat oʻzgarganda (tasdiqlandi, yoʻlda, yetkazildi, bekor qilindi)")}
          </label>
          <Notice>
            {t("Eskiz har bir SMS matnini oldindan tasdiqlaydi. Yoqishdan oldin quyidagi shablonlarni my.eskiz.uz → SMS → Shablonlar boʻlimiga yuboring; tasdiqlanmagan matn yuborilmaydi va jurnalda «failed» boʻladi.")}
          </Notice>
          <details className="text-[14px] text-ink-2">
            <summary className="min-h-11 cursor-pointer py-2 font-semibold text-ink">{t("Shablonlar (uz / ru)")}</summary>
            <ul className="mt-2 flex flex-col gap-2">
              {orderSmsTemplates().map((tpl) => (
                <li key={tpl.status} className="rounded-[12px] bg-tile px-3 py-2">
                  <span className="block">{tpl.uz}</span>
                  <span lang="ru" className="block text-muted">{tpl.ru}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] text-muted">{"{number}"} {t("— buyurtma raqami,")} {"{havola}"} {t("— kuzatish havolasi,")} {"{phone}"} {t("— doʻkon telefoni.")}</p>
          </details>
        </ActionForm>
      </Card>

      <div className="mt-4 flex flex-col gap-4">
        {rows.length === 0 && <EmptyState title={t("Avtomatlashtirish yoʻq")}>{t("Bazada migratsiya 0010 qoʻllanganini tekshiring.")}</EmptyState>}
        {rows.map((flow) => {
          const steps = parseSteps(flow.steps);
          const info = isFlowTrigger(flow.trigger) ? TRIGGER_INFO[flow.trigger] : null;
          const s = stats30.get(`flow-${flow.id}`)!;
          const e = enrollments.get(flow.id);
          return (
            <Card key={flow.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[18px] font-bold leading-6 text-ink">
                      <Link href={`/admin/flows/${flow.id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded-[4px]">{flow.name}</Link>
                    </h2>
                    <Pill tone={flow.active ? "dark" : "outline"}>{flow.active ? "Yoqilgan" : "Oʻchiq"}</Pill>
                    {info && !info.ready && <Pill tone="muted">{t("Ulanmagan")}</Pill>}
                  </div>
                  <p className="mt-1 text-[14px] text-ink-2">
                    {info?.title ?? flow.trigger} · {steps.length} {t("ta qadam:")} {steps.map((st) => `${formatDelay(st.delayMinutes)}${st.promo ? ` (${st.promo.kind === "percent" ? `−${st.promo.value}%` : "kod"})` : ""}`).join(" → ")}
                  </p>
                  {steps[0] && <p className="mt-0.5 text-[13px] text-muted">{CHANNEL_LABELS[steps[0].channel]} {t("· muddat")} {info?.anchor}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/flows/${flow.id}`} className={smallButtonClass}>{t("Tahrirlash")}</Link>
                  <form action={toggleFlow}>
                    <input type="hidden" name="id" value={flow.id} />
                    <button type="submit" className={smallButtonClass} disabled={Boolean(info && !info.ready) && !flow.active}>
                      {flow.active ? "Oʻchirish" : "Yoqish"}
                    </button>
                  </form>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 xl:grid-cols-6">
                {[
                  ["Hozir oqimda", formatNumber(e?.activeNow ?? 0)],
                  ["Yuborildi, 30 kun", formatNumber(s.sent)],
                  ["Bosildi", `${formatNumber(s.clicked)}`],
                  ["Qaytdi (buyurtma)", formatNumber(e?.converted30 ?? 0)],
                  ["Kod / havola buyurtmasi", formatNumber(s.orders)],
                  ["Tushum", somShort(s.revenue)],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-[13px] text-muted">{label}</dt>
                    <dd className="mt-0.5 text-[17px] font-bold tabular-nums text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          );
        })}
      </div>

      <Card title={t("Hozir ishga tushirish")} lead={t("Ishchi har daqiqada yuboradi va har 5 daqiqada yangi ishtirokchilarni qidiradi. Kutmasdan tekshirish uchun:")} className="mt-4">
        <ActionForm action={runMessagingNow} submitLabel={t("Bir marta ishga tushirish")} className="flex flex-col gap-3">
          <p className="text-[13px] leading-5 text-muted">
            {t("«Qaytdi» — oqimga kirgandan keyin buyurtma bergan mijozlar (oqim ular uchun toʻxtaydi). «Kod / havola buyurtmasi» — shu oqim bergan promokod yoki xabardagi havola (utm_campaign=flow-…) orqali kelgan buyurtmalar.")}
          </p>
        </ActionForm>
      </Card>
    </>
  );
}
