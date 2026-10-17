import type { ReactNode } from "react";
import { saveAnalyticsIntegration, saveEmailIntegration, saveOperatorIntegration, saveVerificationCodes, sendResendTestEmail, testOperatorTelegramConnection } from "@/app/admin/_actions/integrations";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, Notice, Pill, inputClass } from "@/components/admin/ui";
import type { IntegrationAdminOverview } from "@/lib/integrations/settings";

export function Status({ on, label = on ? "Ulangan" : "Ulanmagan" }: { on: boolean; label?: string }) {
  return <Pill tone={on ? "dark" : "outline"}>{label}</Pill>;
}

function External({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-4">{children} ↗</a>;
}

function Vendor({ title, status, hint, children }: { title: string; status: ReactNode; hint: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-[16px] bg-tile p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[15px] font-bold text-ink">{title}</span>
        {status}
      </div>
      {children}
      <p className="text-[13px] leading-[18px] text-muted">{hint}</p>
    </div>
  );
}

function ClearOverride({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-[14px] text-ink-2">
      <input name={name} type="checkbox" className="h-5 w-5 accent-ink" />
      <span>{label}</span>
    </label>
  );
}

export function AnalyticsForm({ overview }: { overview: IntegrationAdminOverview }) {
  const a = overview.analytics;
  return (
    <Card title="Analitika va reklama teglari" lead="ID kiritib saqlang — teg saytning barcha sahifalariga oʻzi qoʻyiladi. Kod yozish yoki qayta deploy shart emas.">
      {!overview.analyticsCspReady && <div className="mb-4"><Notice tone="error">Bu build analitika hostlarini xavfsizlik siyosatida (CSP) ochmagan. fly.tomlʼda ADMIN_ANALYTICS_CSP=on yoqilgan — keyingi deployʼdan keyin bu yerda saqlash ishlaydi.</Notice></div>}
      <ActionForm action={saveAnalyticsIntegration} submitLabel="Saqlash" className="grid gap-3 md:grid-cols-2">
        <Vendor title="Google Analytics 4" status={<Status on={Boolean(a.ga4)} />} hint={<>GA4 → Admin → Data streams → <b>Measurement ID</b> (G-…). <External href="https://analytics.google.com/">Ochish</External></>}>
          <input name="ga4" defaultValue={a.ga4} placeholder="G-XXXXXXXXXX" autoComplete="off" aria-label="GA4 Measurement ID" className={inputClass} />
        </Vendor>
        <Vendor title="Google Tag Manager" status={<Status on={Boolean(a.gtm)} />} hint={<>Container ID (GTM-…). GTM boʻlsa, GA4 ni GTM ichida sozlash ham mumkin. <External href="https://tagmanager.google.com/">Ochish</External></>}>
          <input name="gtm" defaultValue={a.gtm} placeholder="GTM-XXXXXXX" autoComplete="off" aria-label="GTM Container ID" className={inputClass} />
        </Vendor>
        <Vendor title="Yandex Metrika" status={<Status on={Boolean(a.yandexMetrika)} />} hint={<>Hisoblagich raqami (faqat raqamlar). Buyurtma «order_submitted» maqsadi sifatida yuboriladi. <External href="https://metrika.yandex.uz/">Ochish</External></>}>
          <input name="yandexMetrika" defaultValue={a.yandexMetrika} inputMode="numeric" placeholder="98765432" autoComplete="off" aria-label="Yandex Metrika ID" className={inputClass} />
          <label className="flex min-h-11 items-center gap-3 text-[14px] font-semibold text-ink">
            <input type="checkbox" name="webvisor" defaultChecked={overview.webvisor} className="h-5 w-5 accent-ink" />
            Vebvizor (sessiya yozuvlari)
          </label>
        </Vendor>
        <Vendor title="Meta Pixel" status={<Status on={Boolean(a.metaPixel)} />} hint={<>Events Manager → Pixel ID. Savat, checkout va xarid hodisalari avtomatik yuboriladi. <External href="https://business.facebook.com/events_manager2">Ochish</External></>}>
          <input name="metaPixel" defaultValue={a.metaPixel} inputMode="numeric" placeholder="1234567890123456" autoComplete="off" aria-label="Meta Pixel ID" className={inputClass} />
        </Vendor>
      </ActionForm>
    </Card>
  );
}

export function VerificationForm({ overview, siteUrl }: { overview: IntegrationAdminOverview; siteUrl: string }) {
  const v = overview.verification;
  return (
    <Card title="Qidiruv tizimlari" lead="Saytga egalikni tasdiqlash. Konsoldagi «HTML-teg» usulini tanlang va tegni yoki faqat content kodini shu yerga joylang.">
      <ActionForm action={saveVerificationCodes} submitLabel="Saqlash" className="grid gap-3 md:grid-cols-3">
        <Vendor title="Google Search Console" status={<Status on={Boolean(v.google)} label={v.google ? "Kod qoʻyilgan" : "Kod yoʻq"} />} hint={<>Mulk qoʻshing → «HTML tag». <External href="https://search.google.com/search-console">Ochish</External></>}>
          <input name="google" defaultValue={v.google} placeholder='<meta name="google-site-verification" …>' autoComplete="off" aria-label="Google tasdiqlash kodi" className={inputClass} />
        </Vendor>
        <Vendor title="Yandex Webmaster" status={<Status on={Boolean(v.yandex)} label={v.yandex ? "Kod qoʻyilgan" : "Kod yoʻq"} />} hint={<>Sayt qoʻshing → «Meta-teg». <External href="https://webmaster.yandex.uz/">Ochish</External></>}>
          <input name="yandex" defaultValue={v.yandex} placeholder='<meta name="yandex-verification" …>' autoComplete="off" aria-label="Yandex tasdiqlash kodi" className={inputClass} />
        </Vendor>
        <Vendor title="Bing Webmaster" status={<Status on={Boolean(v.bing)} label={v.bing ? "Kod qoʻyilgan" : "Kod yoʻq"} />} hint={<>«HTML Meta Tag» usuli (ixtiyoriy). <External href="https://www.bing.com/webmasters">Ochish</External></>}>
          <input name="bing" defaultValue={v.bing} placeholder='<meta name="msvalidate.01" …>' autoComplete="off" aria-label="Bing tasdiqlash kodi" className={inputClass} />
        </Vendor>
      </ActionForm>
      <div className="mt-4 rounded-[16px] border border-line p-4 text-[14px] leading-6 text-ink-2">
        Tasdiqlangandan keyin konsolga sayt xaritasini qoʻshing: <code className="rounded-[6px] bg-tile px-1.5 py-0.5 text-ink">{siteUrl}/sitemap.xml</code> — unda uz va ru sahifalar, mahsulotlar va rasmlar bor.
      </div>
    </Card>
  );
}

export function MessagingForms({ overview }: { overview: IntegrationAdminOverview }) {
  const operatorTokenHint = overview.operator.botTokenConfigured
    ? overview.operator.botTokenManagedInAdmin ? "Panelda shifrlangan holda saqlangan. Almashtirish uchun yangisini kiriting." : "Deploy sozlamasidan olinmoqda. Almashtirish uchun yangisini kiriting."
    : "Bot tokeni sozlanmagan.";
  const emailKeyHint = overview.email.apiKeyConfigured
    ? overview.email.apiKeyManagedInAdmin ? "Shifrlangan holda saqlangan va qayta koʻrsatilmaydi." : "Deploy sozlamasidan olinmoqda."
    : "Resend API kaliti sozlanmagan.";
  const needsKey = !overview.encryptionConfigured;
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card title="Telegram — operator xabarlari" lead="Har bir yangi buyurtma, murojaat va «omborga kelsa xabar bering» soʻrovi shu chatga keladi." actions={<Status on={overview.operator.configured} />}>
        {needsKey && <div className="mb-4"><Notice>Maxfiy kalitlarni panelda saqlash uchun deployʼda INTEGRATION_ENCRYPTION_KEY kerak (openssl rand -hex 32).</Notice></div>}
        <ActionForm action={saveOperatorIntegration} submitLabel="Saqlash" className="flex flex-col gap-4">
          <Field label="Bot tokeni" hint={operatorTokenHint}>
            <input name="botToken" type="password" autoComplete="new-password" spellCheck={false} placeholder="123456789:AA…" className={inputClass} />
          </Field>
          <Field label="Operator chat ID" hint="Guruh uchun odatda -100… bilan boshlanadi.">
            <input name="chatId" inputMode="numeric" defaultValue={overview.operator.chatId} placeholder="-1001234567890" className={inputClass} />
          </Field>
          {overview.operator.botTokenManagedInAdmin && <ClearOverride name="clearBotToken" label="Paneldagi tokenni oʻchirish" />}
          {overview.operator.chatIdManagedInAdmin && <ClearOverride name="clearChatId" label="Paneldagi chat ID ni oʻchirish" />}
        </ActionForm>
        <div className="mt-4 border-t border-line pt-4">
          <ActionForm action={testOperatorTelegramConnection} submitLabel="Ulanishni tekshirish" className="flex flex-col gap-3">
            <p className="text-[13px] text-muted">Token va botning chatni koʻra olishini tekshiradi; xabar yuborilmaydi.</p>
          </ActionForm>
        </div>
      </Card>
      <Card title="Email — Resend" lead="Buyurtma tasdigʻi va obuna xatlari. Yuboruvchi domen Resendʼda tasdiqlangan boʻlsin (SPF, DKIM, DMARC)." actions={<Status on={overview.email.configured} />}>
        <ActionForm action={saveEmailIntegration} submitLabel="Saqlash" className="flex flex-col gap-4">
          <Field label="Resend API kaliti" hint={emailKeyHint}>
            <input name="apiKey" type="password" autoComplete="new-password" spellCheck={false} placeholder="re_…" className={inputClass} />
          </Field>
          <Field label="Yuboruvchi (From)" hint="Masalan: Go Vita <no-reply@govita.uz>">
            <input name="from" defaultValue={overview.email.from} autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Javob manzili (Reply-to)">
            <input name="replyTo" type="email" defaultValue={overview.email.replyTo} autoComplete="email" className={inputClass} />
          </Field>
          {overview.email.apiKeyManagedInAdmin && <ClearOverride name="clearApiKey" label="Paneldagi API kalitni oʻchirish" />}
          {overview.email.fromManagedInAdmin && <ClearOverride name="clearFrom" label="Paneldagi yuboruvchini oʻchirish" />}
          {overview.email.replyToManagedInAdmin && <ClearOverride name="clearReplyTo" label="Paneldagi javob manzilini oʻchirish" />}
        </ActionForm>
        <div className="mt-4 border-t border-line pt-4">
          <ActionForm action={sendResendTestEmail} submitLabel="Test xatini yuborish" className="flex flex-col gap-3">
            <Field label="Kimga">
              <input name="testRecipient" type="email" autoComplete="email" required placeholder="siz@govita.uz" className={inputClass} />
            </Field>
          </ActionForm>
        </div>
      </Card>
    </div>
  );
}
