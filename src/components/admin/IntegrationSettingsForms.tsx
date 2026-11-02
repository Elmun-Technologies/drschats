import type { ReactNode } from "react";
import { saveAnalyticsIntegration, saveClickIntegration, saveEmailIntegration, saveFiscalSettings, savePaymeIntegration, saveOperatorIntegration, saveSmsIntegration, saveVerificationCodes, sendResendTestEmail, sendTestSms, testOperatorTelegramConnection } from "@/app/admin/_actions/integrations";
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

export function SmsForm({ overview }: { overview: IntegrationAdminOverview }) {
  const sms = overview.sms;
  const passwordHint = sms.passwordConfigured
    ? sms.passwordManagedInAdmin ? "Shifrlangan holda saqlangan va qayta koʻrsatilmaydi." : "Deploy sozlamasidan (ESKIZ_PASSWORD) olinmoqda."
    : "Parol sozlanmagan.";
  return (
    <Card
      title="SMS — Eskiz"
      lead="Avtomatlashtirish va kampaniyalar Telegram ulanmagan mijozga SMS yuboradi. Har bir SMS oxirida «STOP» havolasi, 21:00–09:00 (Toshkent) yuborilmaydi."
      actions={<Status on={sms.configured || sms.fake} label={sms.fake ? "Sinov rejimi" : undefined} />}
    >
      {sms.fake && <div className="mb-4"><Notice>SMS_FAKE=1: SMS haqiqatda yuborilmaydi, faqat «Xabarlar» jurnaliga yoziladi. Live deployʼda bu bayroq eʼtiborga olinmaydi.</Notice></div>}
      {!overview.encryptionConfigured && <div className="mb-4"><Notice>Parolni panelda saqlash uchun deployʼda INTEGRATION_ENCRYPTION_KEY kerak (openssl rand -hex 32).</Notice></div>}
      <ActionForm action={saveSmsIntegration} submitLabel="Saqlash" className="flex flex-col gap-4">
        <Field label="Eskiz hisobi (email)" hint="notify.eskiz.uz kabinetiga kiradigan email.">
          <input name="email" type="email" defaultValue={sms.email} autoComplete="off" placeholder="info@govita.uz" className={inputClass} />
        </Field>
        <Field label="Parol" hint={passwordHint}>
          <input name="password" type="password" autoComplete="new-password" spellCheck={false} className={inputClass} />
        </Field>
        <Field label="Yuboruvchi nomi (Nickname)" hint="Boʻsh boʻlsa 4546 — Eskizning umumiy raqami. «GoVita» nomi Eskiz va operatorlar tasdiqlagandan keyin ishlaydi.">
          <input name="sender" defaultValue={sms.sender} maxLength={11} autoComplete="off" placeholder="4546" className={inputClass} />
        </Field>
        <label className="flex min-h-11 items-start gap-3 text-[14px] leading-5 text-ink">
          <input type="checkbox" name="transliterate" defaultChecked={sms.transliterate} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
          <span>Oʻzbekcha ʻ va ʼ belgilarini oddiy apostrofga almashtirish — lotin matni GSM-7 da qoladi: bitta SMS 70 emas, 160 belgi.</span>
        </label>
        {sms.emailManagedInAdmin && <ClearOverride name="clearEmail" label="Paneldagi emailni oʻchirish" />}
        {sms.passwordManagedInAdmin && <ClearOverride name="clearPassword" label="Paneldagi parolni oʻchirish" />}
        {sms.senderManagedInAdmin && <ClearOverride name="clearSender" label="Paneldagi yuboruvchi nomini oʻchirish" />}
      </ActionForm>
      <div className="mt-4 border-t border-line pt-4">
        <ActionForm action={sendTestSms} submitLabel="Test SMS yuborish" className="flex flex-col gap-3">
          <Field label="Kimga" hint="Bitta SMS, marketing emas, jurnalga yozilmaydi.">
            <input name="testPhone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+998 90 123 45 67" className={inputClass} />
          </Field>
          <Field label="Matn" hint="Shablonlar tasdiqlanmaguncha Eskiz faqat «Bu Eskiz dan test» matnini qabul qiladi.">
            <input name="testText" defaultValue="Bu Eskiz dan test" maxLength={300} className={inputClass} />
          </Field>
        </ActionForm>
      </div>
    </Card>
  );
}

function Check({ name, defaultChecked, children }: { name: string; defaultChecked: boolean; children: ReactNode }) {
  return (
    <label className="flex min-h-11 items-start gap-3 text-[14px] leading-5 text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
      <span>{children}</span>
    </label>
  );
}

function Endpoint({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-semibold text-ink-2">{label}</span>
      <code className="break-all rounded-[12px] bg-tile px-3 py-2 text-[13px] text-ink">{url}</code>
    </div>
  );
}

function secretHint(configured: boolean, inAdmin: boolean, env: string): string {
  if (!configured) return "Kiritilmagan.";
  return inAdmin ? "Shifrlangan holda saqlangan va qayta koʻrsatilmaydi. Almashtirish uchun yangisini kiriting." : `Deploy sozlamasidan (${env}) olinmoqda.`;
}

export function PaymentForms({ overview, siteUrl, ready, ordersInDb }: { overview: IntegrationAdminOverview; siteUrl: string; ready: { payme: boolean; click: boolean }; ordersInDb: boolean }) {
  const { payme, click, fiscal } = overview;
  const status = (on: boolean, enabled: boolean, test = false) => <Status on={on} label={on ? (test ? "Test rejimi" : "Ishlayapti") : enabled ? "Kalit yetishmaydi" : "Oʻchiq"} />;
  return (
    <>
      {!ordersInDb && <div className="mb-4"><Notice tone="error">Onlayn toʻlov buyurtmalar bazada saqlanganda ishlaydi (DATABASE_URL). Hozir checkoutʼda faqat naqd pul.</Notice></div>}
      {!overview.encryptionConfigured && <div className="mb-4"><Notice>Kalitlarni panelda saqlash uchun deployʼda INTEGRATION_ENCRYPTION_KEY kerak (openssl rand -hex 32).</Notice></div>}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Payme" lead="Payme Business → Kassa. Kalitlar shifrlangan holda saqlanadi; mijoz Payme sahifasida toʻlaydi va buyurtma sahifasiga qaytadi." actions={status(ready.payme, payme.enabled, payme.testMode)}>
          <ActionForm action={savePaymeIntegration} submitLabel="Saqlash" className="flex flex-col gap-4">
            <Field label="Merchant ID (kassa ID)" hint="Payme Business → Kassa → Sozlamalar.">
              <input name="merchantId" defaultValue={payme.merchantId} autoComplete="off" spellCheck={false} placeholder="5e730e8e0b852a417aa49ceb" className={inputClass} />
            </Field>
            <Field label="Kassa kaliti (Key)" hint={secretHint(payme.keyConfigured, payme.keyManagedInAdmin, "PAYME_KEY")}>
              <input name="key" type="password" autoComplete="new-password" spellCheck={false} className={inputClass} />
            </Field>
            <Field label="Test kaliti (Test key)" hint={secretHint(payme.testKeyConfigured, payme.testKeyManagedInAdmin, "PAYME_TEST_KEY")}>
              <input name="testKey" type="password" autoComplete="new-password" spellCheck={false} className={inputClass} />
            </Field>
            <Field label="Hisob maydoni (account)" hint="Kassa sozlamasidagi «Rekvizitlar» maydoni nomi. Odatda order_id.">
              <input name="account" defaultValue={payme.account} autoComplete="off" spellCheck={false} placeholder="order_id" className={inputClass} />
            </Field>
            <Check name="testMode" defaultChecked={payme.testMode}>Test rejimi — test.paycom.uz va test kaliti. Haqiqiy pul yechilmaydi; Payme «Pesochnitsa»sidan tekshirish uchun.</Check>
            <Check name="enabled" defaultChecked={payme.enabled}>Checkoutʼda Payme orqali toʻlashni yoqish</Check>
            {payme.keyManagedInAdmin && <ClearOverride name="clearKey" label="Paneldagi kassa kalitini oʻchirish" />}
            {payme.testKeyManagedInAdmin && <ClearOverride name="clearTestKey" label="Paneldagi test kalitini oʻchirish" />}
          </ActionForm>
          <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            <Endpoint label="Payme kabinetiga kiriting — Endpoint URL" url={`${siteUrl}/api/payments/payme`} />
            <p className="text-[13px] leading-[18px] text-muted">Payme ushbu manzilga CheckPerformTransaction, CreateTransaction, PerformTransaction, CancelTransaction, CheckTransaction, GetStatement soʻrovlarini yuboradi. Toʻlangan buyurtma «Toʻlangan» boʻladi va operatorga Telegram xabari ketadi. Qaytarish (refund) Payme kabinetidan qilinadi — yetkazilgan buyurtmani qaytarib boʻlmaydi.</p>
          </div>
        </Card>

        <Card title="Click" lead="merchant.click.uz → Servis sozlamalari. Mijoz Click sahifasida toʻlaydi va buyurtma sahifasiga qaytadi." actions={status(ready.click, click.enabled)}>
          <ActionForm action={saveClickIntegration} submitLabel="Saqlash" className="flex flex-col gap-4">
            <Field label="Service ID">
              <input name="serviceId" defaultValue={click.serviceId} inputMode="numeric" autoComplete="off" placeholder="12345" className={inputClass} />
            </Field>
            <Field label="Merchant ID">
              <input name="merchantId" defaultValue={click.merchantId} inputMode="numeric" autoComplete="off" placeholder="6789" className={inputClass} />
            </Field>
            <Field label="Secret key" hint={secretHint(click.secretKeyConfigured, click.secretKeyManagedInAdmin, "CLICK_SECRET_KEY")}>
              <input name="secretKey" type="password" autoComplete="new-password" spellCheck={false} className={inputClass} />
            </Field>
            <Check name="enabled" defaultChecked={click.enabled}>Checkoutʼda Click orqali toʻlashni yoqish</Check>
            {click.secretKeyManagedInAdmin && <ClearOverride name="clearSecretKey" label="Paneldagi Secret keyʼni oʻchirish" />}
          </ActionForm>
          <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            <Endpoint label="Prepare URL" url={`${siteUrl}/api/payments/click/prepare`} />
            <Endpoint label="Complete URL" url={`${siteUrl}/api/payments/click/complete`} />
            <p className="text-[13px] leading-[18px] text-muted">Har soʻrovning md5 imzosi Secret key bilan tekshiriladi; summa buyurtma jamiga teng boʻlmasa toʻlov rad etiladi.</p>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Fiskal chek (Payme)" lead="Payme har toʻlovga soliq chekini chiqaradi. Har mahsulotning MXIK (IKPU) va qadoq kodi mahsulot formasida («Fiskal chek») kiritiladi; bu yerda — yetkazib berish xizmati va QQS.">
          <ActionForm action={saveFiscalSettings} submitLabel="Saqlash" className="grid gap-4 md:grid-cols-3">
            <Field label="Yetkazish MXIK kodi" hint="17 raqam, tasnif.soliq.uz">
              <input name="shippingMxik" defaultValue={fiscal.shippingMxik} inputMode="numeric" maxLength={17} autoComplete="off" className={inputClass} />
            </Field>
            <Field label="Yetkazish qadoq kodi">
              <input name="shippingPackage" defaultValue={fiscal.shippingPackage} inputMode="numeric" autoComplete="off" className={inputClass} />
            </Field>
            <Field label="QQS, %" hint="QQS toʻlovchisi boʻlmasangiz 0.">
              <input name="vatPercent" defaultValue={String(fiscal.vatPercent)} inputMode="numeric" maxLength={3} autoComplete="off" className={inputClass} />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
