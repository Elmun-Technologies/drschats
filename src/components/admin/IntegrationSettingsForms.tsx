import type { ReactNode } from "react";
import { saveAnalyticsIntegration, saveClickIntegration, saveEmailIntegration, saveFiscalSettings, savePaymeIntegration, saveOperatorIntegration, saveSmsIntegration, saveVerificationCodes, sendResendTestEmail, sendTestSms, testOperatorTelegramConnection } from "@/app/admin/_actions/integrations";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, Notice, Pill, inputClass } from "@/components/admin/ui";
import type { IntegrationAdminOverview } from "@/lib/integrations/settings";
import { t } from "@/lib/admin/i18n/server";

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
    <Card title={t("Analitika va reklama teglari")} lead={t("ID kiritib saqlang — teg saytning barcha sahifalariga oʻzi qoʻyiladi. Kod yozish yoki qayta deploy shart emas.")}>
      {!overview.analyticsCspReady && <div className="mb-4"><Notice tone="error">{t("Bu build analitika hostlarini xavfsizlik siyosatida (CSP) ochmagan. fly.tomlʼda ADMIN_ANALYTICS_CSP=on yoqilgan — keyingi deployʼdan keyin bu yerda saqlash ishlaydi.")}</Notice></div>}
      <ActionForm action={saveAnalyticsIntegration} submitLabel={t("Saqlash")} className="grid gap-3 md:grid-cols-2">
        <Vendor title={t("Google Analytics 4")} status={<Status on={Boolean(a.ga4)} />} hint={<>{t("GA4 → Admin → Data streams →")} <b>{t("Measurement ID")}</b> {t("(G-…).")} <External href="https://analytics.google.com/">{t("Ochish")}</External></>}>
          <input name="ga4" defaultValue={a.ga4} placeholder={t("G-XXXXXXXXXX")} autoComplete="off" aria-label={t("GA4 Measurement ID")} className={inputClass} />
        </Vendor>
        <Vendor title={t("Google Tag Manager")} status={<Status on={Boolean(a.gtm)} />} hint={<>{t("Container ID (GTM-…). GTM boʻlsa, GA4 ni GTM ichida sozlash ham mumkin.")} <External href="https://tagmanager.google.com/">{t("Ochish")}</External></>}>
          <input name="gtm" defaultValue={a.gtm} placeholder={t("GTM-XXXXXXX")} autoComplete="off" aria-label={t("GTM Container ID")} className={inputClass} />
        </Vendor>
        <Vendor title={t("Yandex Metrika")} status={<Status on={Boolean(a.yandexMetrika)} />} hint={<>{t("Hisoblagich raqami (faqat raqamlar). Buyurtma «order_submitted» maqsadi sifatida yuboriladi.")} <External href="https://metrika.yandex.uz/">{t("Ochish")}</External></>}>
          <input name="yandexMetrika" defaultValue={a.yandexMetrika} inputMode="numeric" placeholder="98765432" autoComplete="off" aria-label={t("Yandex Metrika ID")} className={inputClass} />
          <label className="flex min-h-11 items-center gap-3 text-[14px] font-semibold text-ink">
            <input type="checkbox" name="webvisor" defaultChecked={overview.webvisor} className="h-5 w-5 accent-ink" />
            {t("Vebvizor (sessiya yozuvlari)")}
          </label>
        </Vendor>
        <Vendor title={t("Meta Pixel")} status={<Status on={Boolean(a.metaPixel)} />} hint={<>{t("Events Manager → Pixel ID. Savat, checkout va xarid hodisalari avtomatik yuboriladi.")} <External href="https://business.facebook.com/events_manager2">{t("Ochish")}</External></>}>
          <input name="metaPixel" defaultValue={a.metaPixel} inputMode="numeric" placeholder="1234567890123456" autoComplete="off" aria-label={t("Meta Pixel ID")} className={inputClass} />
        </Vendor>
      </ActionForm>
    </Card>
  );
}

export function VerificationForm({ overview, siteUrl }: { overview: IntegrationAdminOverview; siteUrl: string }) {
  const v = overview.verification;
  return (
    <Card title={t("Qidiruv tizimlari")} lead={t("Saytga egalikni tasdiqlash. Konsoldagi «HTML-teg» usulini tanlang va tegni yoki faqat content kodini shu yerga joylang.")}>
      <ActionForm action={saveVerificationCodes} submitLabel={t("Saqlash")} className="grid gap-3 md:grid-cols-3">
        <Vendor title={t("Google Search Console")} status={<Status on={Boolean(v.google)} label={v.google ? "Kod qoʻyilgan" : "Kod yoʻq"} />} hint={<>{t("Mulk qoʻshing → «HTML tag».")} <External href="https://search.google.com/search-console">{t("Ochish")}</External></>}>
          <input name="google" defaultValue={v.google} placeholder={t("<meta name=\"google-site-verification\" …>")} autoComplete="off" aria-label={t("Google tasdiqlash kodi")} className={inputClass} />
        </Vendor>
        <Vendor title={t("Yandex Webmaster")} status={<Status on={Boolean(v.yandex)} label={v.yandex ? "Kod qoʻyilgan" : "Kod yoʻq"} />} hint={<>{t("Sayt qoʻshing → «Meta-teg».")} <External href="https://webmaster.yandex.uz/">{t("Ochish")}</External></>}>
          <input name="yandex" defaultValue={v.yandex} placeholder={t("<meta name=\"yandex-verification\" …>")} autoComplete="off" aria-label={t("Yandex tasdiqlash kodi")} className={inputClass} />
        </Vendor>
        <Vendor title={t("Bing Webmaster")} status={<Status on={Boolean(v.bing)} label={v.bing ? "Kod qoʻyilgan" : "Kod yoʻq"} />} hint={<>{t("«HTML Meta Tag» usuli (ixtiyoriy).")} <External href="https://www.bing.com/webmasters">{t("Ochish")}</External></>}>
          <input name="bing" defaultValue={v.bing} placeholder={t("<meta name=\"msvalidate.01\" …>")} autoComplete="off" aria-label={t("Bing tasdiqlash kodi")} className={inputClass} />
        </Vendor>
      </ActionForm>
      <div className="mt-4 rounded-[16px] border border-line p-4 text-[14px] leading-6 text-ink-2">
        {t("Tasdiqlangandan keyin konsolga sayt xaritasini qoʻshing:")} <code className="rounded-[6px] bg-tile px-1.5 py-0.5 text-ink">{siteUrl}/sitemap.xml</code> {t("— unda uz va ru sahifalar, mahsulotlar va rasmlar bor.")}
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
      <Card title={t("Telegram — operator xabarlari")} lead={t("Har bir yangi buyurtma, murojaat va «omborga kelsa xabar bering» soʻrovi shu chatga keladi.")} actions={<Status on={overview.operator.configured} />}>
        {needsKey && <div className="mb-4"><Notice>{t("Maxfiy kalitlarni panelda saqlash uchun deployʼda INTEGRATION_ENCRYPTION_KEY kerak (openssl rand -hex 32).")}</Notice></div>}
        <ActionForm action={saveOperatorIntegration} submitLabel={t("Saqlash")} className="flex flex-col gap-4">
          <Field label={t("Bot tokeni")} hint={operatorTokenHint}>
            <input name="botToken" type="password" autoComplete="new-password" spellCheck={false} placeholder={t("123456789:AA…")} className={inputClass} />
          </Field>
          <Field label={t("Operator chat ID")} hint={t("Guruh uchun odatda -100… bilan boshlanadi.")}>
            <input name="chatId" inputMode="numeric" defaultValue={overview.operator.chatId} placeholder="-1001234567890" className={inputClass} />
          </Field>
          {overview.operator.botTokenManagedInAdmin && <ClearOverride name="clearBotToken" label={t("Paneldagi tokenni oʻchirish")} />}
          {overview.operator.chatIdManagedInAdmin && <ClearOverride name="clearChatId" label={t("Paneldagi chat ID ni oʻchirish")} />}
        </ActionForm>
        <div className="mt-4 border-t border-line pt-4">
          <ActionForm action={testOperatorTelegramConnection} submitLabel={t("Ulanishni tekshirish")} className="flex flex-col gap-3">
            <p className="text-[13px] text-muted">{t("Token va botning chatni koʻra olishini tekshiradi; xabar yuborilmaydi.")}</p>
          </ActionForm>
        </div>
      </Card>
      <Card title={t("Email — Resend")} lead={t("Buyurtma tasdigʻi va obuna xatlari. Yuboruvchi domen Resendʼda tasdiqlangan boʻlsin (SPF, DKIM, DMARC).")} actions={<Status on={overview.email.configured} />}>
        <ActionForm action={saveEmailIntegration} submitLabel={t("Saqlash")} className="flex flex-col gap-4">
          <Field label={t("Resend API kaliti")} hint={emailKeyHint}>
            <input name="apiKey" type="password" autoComplete="new-password" spellCheck={false} placeholder={t("re_…")} className={inputClass} />
          </Field>
          <Field label={t("Yuboruvchi (From)")} hint={t("Masalan: Go Vita <no-reply@govita.uz>")}>
            <input name="from" defaultValue={overview.email.from} autoComplete="off" className={inputClass} />
          </Field>
          <Field label={t("Javob manzili (Reply-to)")}>
            <input name="replyTo" type="email" defaultValue={overview.email.replyTo} autoComplete="email" className={inputClass} />
          </Field>
          {overview.email.apiKeyManagedInAdmin && <ClearOverride name="clearApiKey" label={t("Paneldagi API kalitni oʻchirish")} />}
          {overview.email.fromManagedInAdmin && <ClearOverride name="clearFrom" label={t("Paneldagi yuboruvchini oʻchirish")} />}
          {overview.email.replyToManagedInAdmin && <ClearOverride name="clearReplyTo" label={t("Paneldagi javob manzilini oʻchirish")} />}
        </ActionForm>
        <div className="mt-4 border-t border-line pt-4">
          <ActionForm action={sendResendTestEmail} submitLabel={t("Test xatini yuborish")} className="flex flex-col gap-3">
            <Field label={t("Kimga")}>
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
      title={t("SMS — Eskiz")}
      lead={t("Avtomatlashtirish va kampaniyalar Telegram ulanmagan mijozga SMS yuboradi. Reklama SMS faqat roziligini bergan mijozga ketadi (savatdagi belgi), oxirida «STOP» havolasi, 18:00–09:00 (Toshkent) yuborilmaydi. Yuboruvchi pd.gov.uz (shaxsga doir maʼlumotlar bazalari reyestri) da roʻyxatdan oʻtgan boʻlishi shart.")}
      actions={<Status on={sms.configured || sms.fake} label={sms.fake ? "Sinov rejimi" : undefined} />}
    >
      {sms.fake && <div className="mb-4"><Notice>{t("SMS_FAKE=1: SMS haqiqatda yuborilmaydi, faqat «Xabarlar» jurnaliga yoziladi. Live deployʼda bu bayroq eʼtiborga olinmaydi.")}</Notice></div>}
      {!overview.encryptionConfigured && <div className="mb-4"><Notice>{t("Parolni panelda saqlash uchun deployʼda INTEGRATION_ENCRYPTION_KEY kerak (openssl rand -hex 32).")}</Notice></div>}
      <ActionForm action={saveSmsIntegration} submitLabel={t("Saqlash")} className="flex flex-col gap-4">
        <Field label={t("Eskiz hisobi (email)")} hint={t("notify.eskiz.uz kabinetiga kiradigan email.")}>
          <input name="email" type="email" defaultValue={sms.email} autoComplete="off" placeholder="info@govita.uz" className={inputClass} />
        </Field>
        <Field label={t("Parol")} hint={passwordHint}>
          <input name="password" type="password" autoComplete="new-password" spellCheck={false} className={inputClass} />
        </Field>
        <Field label={t("Yuboruvchi nomi (Nickname)")} hint={t("Boʻsh boʻlsa 4546 — Eskizning umumiy raqami. «GoVita» nomi Eskiz va operatorlar tasdiqlagandan keyin ishlaydi.")}>
          <input name="sender" defaultValue={sms.sender} maxLength={11} autoComplete="off" placeholder="4546" className={inputClass} />
        </Field>
        <label className="flex min-h-11 items-start gap-3 text-[14px] leading-5 text-ink">
          <input type="checkbox" name="transliterate" defaultChecked={sms.transliterate} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
          <span>{t("Oʻzbekcha ʻ va ʼ belgilarini oddiy apostrofga almashtirish — lotin matni GSM-7 da qoladi: bitta SMS 70 emas, 160 belgi.")}</span>
        </label>
        {sms.emailManagedInAdmin && <ClearOverride name="clearEmail" label={t("Paneldagi emailni oʻchirish")} />}
        {sms.passwordManagedInAdmin && <ClearOverride name="clearPassword" label={t("Paneldagi parolni oʻchirish")} />}
        {sms.senderManagedInAdmin && <ClearOverride name="clearSender" label={t("Paneldagi yuboruvchi nomini oʻchirish")} />}
      </ActionForm>
      <div className="mt-4 border-t border-line pt-4">
        <ActionForm action={sendTestSms} submitLabel={t("Test SMS yuborish")} className="flex flex-col gap-3">
          <Field label={t("Kimga")} hint={t("Bitta SMS, marketing emas, jurnalga yozilmaydi.")}>
            <input name="testPhone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+998 90 123 45 67" className={inputClass} />
          </Field>
          <Field label={t("Matn")} hint={t("Shablonlar tasdiqlanmaguncha Eskiz faqat «Bu Eskiz dan test» matnini qabul qiladi.")}>
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
      {!ordersInDb && <div className="mb-4"><Notice tone="error">{t("Onlayn toʻlov buyurtmalar bazada saqlanganda ishlaydi (DATABASE_URL). Hozir checkoutʼda faqat naqd pul.")}</Notice></div>}
      {!overview.encryptionConfigured && <div className="mb-4"><Notice>{t("Kalitlarni panelda saqlash uchun deployʼda INTEGRATION_ENCRYPTION_KEY kerak (openssl rand -hex 32).")}</Notice></div>}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t("Payme")} lead={t("Payme Business → Kassa. Kalitlar shifrlangan holda saqlanadi; mijoz Payme sahifasida toʻlaydi va buyurtma sahifasiga qaytadi.")} actions={status(ready.payme, payme.enabled, payme.testMode)}>
          <ActionForm action={savePaymeIntegration} submitLabel={t("Saqlash")} className="flex flex-col gap-4">
            <Field label={t("Merchant ID (kassa ID)")} hint={t("Payme Business → Kassa → Sozlamalar.")}>
              <input name="merchantId" defaultValue={payme.merchantId} autoComplete="off" spellCheck={false} placeholder="5e730e8e0b852a417aa49ceb" className={inputClass} />
            </Field>
            <Field label={t("Kassa kaliti (Key)")} hint={secretHint(payme.keyConfigured, payme.keyManagedInAdmin, "PAYME_KEY")}>
              <input name="key" type="password" autoComplete="new-password" spellCheck={false} className={inputClass} />
            </Field>
            <Field label={t("Test kaliti (Test key)")} hint={secretHint(payme.testKeyConfigured, payme.testKeyManagedInAdmin, "PAYME_TEST_KEY")}>
              <input name="testKey" type="password" autoComplete="new-password" spellCheck={false} className={inputClass} />
            </Field>
            <Field label={t("Hisob maydoni (account)")} hint={t("Kassa sozlamasidagi «Rekvizitlar» maydoni nomi. Odatda order_id.")}>
              <input name="account" defaultValue={payme.account} autoComplete="off" spellCheck={false} placeholder="order_id" className={inputClass} />
            </Field>
            <Check name="testMode" defaultChecked={payme.testMode}>{t("Test rejimi — test.paycom.uz va test kaliti. Haqiqiy pul yechilmaydi; Payme «Pesochnitsa»sidan tekshirish uchun.")}</Check>
            <Check name="enabled" defaultChecked={payme.enabled}>{t("Checkoutʼda Payme orqali toʻlashni yoqish")}</Check>
            {payme.keyManagedInAdmin && <ClearOverride name="clearKey" label={t("Paneldagi kassa kalitini oʻchirish")} />}
            {payme.testKeyManagedInAdmin && <ClearOverride name="clearTestKey" label={t("Paneldagi test kalitini oʻchirish")} />}
          </ActionForm>
          <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            <Endpoint label={t("Payme kabinetiga kiriting — Endpoint URL")} url={`${siteUrl}/api/payments/payme`} />
            <p className="text-[13px] leading-[18px] text-muted">{t("Payme ushbu manzilga CheckPerformTransaction, CreateTransaction, PerformTransaction, CancelTransaction, CheckTransaction, GetStatement soʻrovlarini yuboradi. Toʻlangan buyurtma «Toʻlangan» boʻladi va operatorga Telegram xabari ketadi. Qaytarish (refund) Payme kabinetidan qilinadi — yetkazilgan buyurtmani qaytarib boʻlmaydi.")}</p>
          </div>
        </Card>

        <Card title={t("Click")} lead={t("merchant.click.uz → Servis sozlamalari. Mijoz Click sahifasida toʻlaydi va buyurtma sahifasiga qaytadi.")} actions={status(ready.click, click.enabled)}>
          <ActionForm action={saveClickIntegration} submitLabel={t("Saqlash")} className="flex flex-col gap-4">
            <Field label={t("Service ID")}>
              <input name="serviceId" defaultValue={click.serviceId} inputMode="numeric" autoComplete="off" placeholder="12345" className={inputClass} />
            </Field>
            <Field label={t("Merchant ID")}>
              <input name="merchantId" defaultValue={click.merchantId} inputMode="numeric" autoComplete="off" placeholder="6789" className={inputClass} />
            </Field>
            <Field label={t("Secret key")} hint={secretHint(click.secretKeyConfigured, click.secretKeyManagedInAdmin, "CLICK_SECRET_KEY")}>
              <input name="secretKey" type="password" autoComplete="new-password" spellCheck={false} className={inputClass} />
            </Field>
            <Check name="enabled" defaultChecked={click.enabled}>{t("Checkoutʼda Click orqali toʻlashni yoqish")}</Check>
            {click.secretKeyManagedInAdmin && <ClearOverride name="clearSecretKey" label={t("Paneldagi Secret keyʼni oʻchirish")} />}
          </ActionForm>
          <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            <Endpoint label={t("Prepare URL")} url={`${siteUrl}/api/payments/click/prepare`} />
            <Endpoint label={t("Complete URL")} url={`${siteUrl}/api/payments/click/complete`} />
            <p className="text-[13px] leading-[18px] text-muted">{t("Har soʻrovning md5 imzosi Secret key bilan tekshiriladi; summa buyurtma jamiga teng boʻlmasa toʻlov rad etiladi.")}</p>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card title={t("Fiskal chek (Payme)")} lead={t("Payme har toʻlovga soliq chekini chiqaradi. Har mahsulotning MXIK (IKPU) va qadoq kodi mahsulot formasida («Fiskal chek») kiritiladi; bu yerda — yetkazib berish xizmati va QQS.")}>
          <ActionForm action={saveFiscalSettings} submitLabel={t("Saqlash")} className="grid gap-4 md:grid-cols-3">
            <Field label={t("Yetkazish MXIK kodi")} hint={t("17 raqam, tasnif.soliq.uz")}>
              <input name="shippingMxik" defaultValue={fiscal.shippingMxik} inputMode="numeric" maxLength={17} autoComplete="off" className={inputClass} />
            </Field>
            <Field label={t("Yetkazish qadoq kodi")}>
              <input name="shippingPackage" defaultValue={fiscal.shippingPackage} inputMode="numeric" autoComplete="off" className={inputClass} />
            </Field>
            <Field label={t("QQS, %")} hint={t("QQS toʻlovchisi boʻlmasangiz 0.")}>
              <input name="vatPercent" defaultValue={String(fiscal.vatPercent)} inputMode="numeric" maxLength={3} autoComplete="off" className={inputClass} />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
