import { ActionForm } from "@/components/admin/ActionForm";
import { BotTabs } from "@/components/admin/BotTabs";
import { Card, Field, Metric, Notice, PageHeader, inputClass, somShort, textareaClass } from "@/components/admin/ui";
import { broadcastAction, saveClub } from "@/app/admin/_actions/bot";
import { MIN_BOT_KEY_LENGTH } from "@/lib/bot/auth";
import { clubOverview, getClubConfig } from "@/lib/bot/store";

export const metadata = { title: "Telegram klub" };

export default async function AdminBotPage() {
  const [stats, club] = await Promise.all([clubOverview(), getClubConfig()]);
  const keyReady = (process.env.BOT_API_KEY?.length ?? 0) >= MIN_BOT_KEY_LENGTH;
  const miniAppReady = Boolean(process.env.TELEGRAM_CLUB_BOT_TOKEN);

  const tiles = [
    { label: "Aʼzolar", value: stats.members, hint: `${stats.blocked} tasi botni bloklagan` },
    { label: "Raqami bogʻlangan", value: stats.linked },
    { label: "Ochiq murojaatlar", value: stats.openTickets },
    { label: "Botdan (30 kun)", value: stats.botOrders30d },
    { label: "Mini App (30 kun)", value: stats.miniOrders30d, hint: `${stats.siteOrders30d} ta saytdan · ${somShort(stats.botRevenue30d)}` },
    { label: "Navbatda", value: stats.pendingJobs, hint: stats.failedJobs ? `${stats.failedJobs} tasi yuborilmadi` : undefined },
  ];

  return (
    <>
      <PageHeader title="Telegram klub" lead="Bot, Mini App doʻkon va klub aʼzolari" />
      <BotTabs active="/admin/bot" />
      {!keyReady && (
        <div className="mb-4">
          <Notice>
            Bot hali ulanmagan: <code>BOT_API_KEY</code> ({MIN_BOT_KEY_LENGTH}+ belgi) oʻrnatilmagan. Qadamlar — docs/BOT-ADMIN.md.
          </Notice>
        </div>
      )}
      {!miniAppReady && (
        <div className="mb-4">
          <Notice>
            Mini App buyurtmalari Telegram akkauntiga bogʻlanmaydi: <code>TELEGRAM_CLUB_BOT_TOKEN</code> oʻrnatilmagan.
          </Notice>
        </div>
      )}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => <Metric key={t.label} label={t.label} value={t.value} hint={t.hint} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Sozlamalar">
          <ActionForm action={saveClub} className="grid gap-4">
            <label className="flex min-h-11 items-center gap-3 text-[15px]">
              <input type="checkbox" name="enabled" defaultChecked={club.enabled} className="h-5 w-5 accent-ink" />
              Buyurtma holati xabarlari yoqilgan
            </label>
            <Field label="Klub nomi">
              <input name="clubName" defaultValue={club.clubName} required maxLength={120} className={inputClass} />
            </Field>
            <Field label="Doʻkon manzili (Mini App)" hint="Botdagi «Doʻkon» tugmasi shu sahifani Telegram ichida ochadi">
              <input name="shopUrl" type="url" defaultValue={club.shopUrl} required className={inputClass} />
            </Field>
            <Field label="Operator telefoni">
              <input name="supportPhone" defaultValue={club.supportPhone} maxLength={40} className={inputClass} />
            </Field>
            <Field label="Ish vaqti">
              <input name="supportHours" defaultValue={club.supportHours} maxLength={120} className={inputClass} />
            </Field>
          </ActionForm>
        </Card>

        <Card title="Klubga xabar">
          <p className="mb-4 text-[15px] text-ink-2">
            Botni bloklamagan barcha {stats.members - stats.blocked} aʼzoga yuboriladi. Bot soniyasiga bitta xabar yuboradi.
          </p>
          <ActionForm action={broadcastAction} submitLabel="Yuborish" className="grid gap-4">
            <Field label="Matn" hint="1000 belgigacha. Tibbiy vaʼda yozmang.">
              <textarea name="text" required maxLength={1000} className={textareaClass} />
            </Field>
            <label className="flex min-h-11 items-center gap-3 text-[15px]">
              <input type="checkbox" name="confirm" required className="h-5 w-5 accent-ink" />
              Hammaga yuborishni tasdiqlayman
            </label>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
