import Link from "next/link";
import { ActionForm } from "@/components/admin/ActionForm";
import { BotTabs } from "@/components/admin/BotTabs";
import { Card, Field, Metric, Notice, PageHeader, inputClass, somShort, textareaClass } from "@/components/admin/ui";
import { broadcastAction, saveClub } from "@/app/admin/_actions/bot";
import { MIN_BOT_KEY_LENGTH } from "@/lib/bot/auth";
import { MENU_BUTTONS } from "@/lib/bot/config";
import { clubOverview, getClubConfig } from "@/lib/bot/store";
import { SEGMENTS, segmentCounts } from "@/lib/admin/segments";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Telegram klub" };

/** The panel speaks the same words the bot's own menu uses (shop.py, t(locale, key)). */
const MENU_LABEL: Record<(typeof MENU_BUTTONS)[number], string> = {
  miniApp: "Mini App (Doʻkon)",
  catalog: "Katalog",
  search: "Qidiruv",
  cart: "Savat",
  orders: "Buyurtmalarim",
  promo: "Aksiyalar",
  help: "Yordam",
};

export default async function AdminBotPage() {
  const [stats, club, counts] = await Promise.all([clubOverview(), getClubConfig(), segmentCounts()]);
  const botSegments = SEGMENTS.filter((s) => s.kind === "bot");
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
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Salomlashuv (oʻzbekcha)" hint="Yangi mijoz /start bosganda shu matn chiqadi">
                <textarea name="greetingUz" defaultValue={club.greeting.uz} maxLength={600} rows={3} className={textareaClass} />
              </Field>
              <Field label="Приветствие (русский)" hint="Пустое поле — встроенный текст">
                <textarea name="greetingRu" defaultValue={club.greeting.ru} maxLength={600} rows={3} className={textareaClass} />
              </Field>
            </div>
            <Field label="Ish vaqti">
              <input name="supportHours" defaultValue={club.supportHours} maxLength={120} className={inputClass} />
            </Field>
            <fieldset className="grid gap-2">
              <legend className="text-[14px] font-semibold text-ink">Menyu tugmalari</legend>
              <p className="text-[13px] leading-5 text-muted">
                Botning asosiy menyusida koʻrinadigan tugmalar. Hech biri qolmasa, bot standart menyuni koʻrsatadi.
              </p>
              <div className="grid gap-1 sm:grid-cols-2">
                {MENU_BUTTONS.map((key) => (
                  <label key={key} className="flex min-h-11 items-center gap-3 text-[15px]">
                    <input type="checkbox" name={`menu.${key}`} defaultChecked={club.menu[key]} className="h-5 w-5 accent-ink" />
                    {MENU_LABEL[key]}
                  </label>
                ))}
              </div>
            </fieldset>
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

      <div className="mt-6">
        <Card
          title="Segmental kampaniyalar"
          lead="Barcha aʼzolarga emas — tanlangan guruhga Telegramda yozing. Har bir xabar navbat, tungi soat (21:00–09:00) va opt-out qoidalaridan oʻtadi."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {botSegments.map((segment) => (
              <Link
                key={segment.id}
                href={`/admin/segments/${segment.id}`}
                className="flex flex-col rounded-[16px] bg-tile p-4 transition-colors hover:bg-tile-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-semibold text-ink">{segment.title}</span>
                  <span className="text-[22px] font-bold leading-7 tabular-nums text-ink">{formatNumber(counts[segment.id]?.reachable ?? 0)}</span>
                </span>
                <span className="mt-1 flex-1 text-[13px] leading-5 text-ink-2">{segment.description}</span>
                <span className="mt-3 text-[13px] font-semibold text-ink">→ Xabar yuborish</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
