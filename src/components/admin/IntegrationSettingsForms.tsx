import { saveAnalyticsIntegration, saveEmailIntegration, saveOperatorIntegration, sendResendTestEmail, testOperatorTelegramConnection } from "@/app/admin/_actions/integrations";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, Notice, inputClass } from "@/components/admin/ui";
import type { IntegrationAdminOverview } from "@/lib/integrations/settings";

function ClearOverride({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-start gap-2 text-[11px] leading-4 text-muted">
      <input name={name} type="checkbox" className="mt-0.5 accent-[#0f2d24]" />
      <span>{label}</span>
    </label>
  );
}

export function IntegrationSettingsForms({ overview }: { overview: IntegrationAdminOverview }) {
  const operatorTokenHint = overview.operator.botTokenConfigured
    ? overview.operator.botTokenManagedInAdmin
      ? "Panelda shifrlangan holda saqlangan. Almashtirish uchun yangi token kiriting."
      : "Deploy muhitidan olinmoqda. Panel orqali almashtirish uchun yangi token kiriting."
    : "Bot token sozlanmagan.";
  const emailKeyHint = overview.email.apiKeyConfigured
    ? overview.email.apiKeyManagedInAdmin
      ? "Kalit shifrlangan holda saqlangan va qayta koʻrsatilmaydi. Almashtirish uchun yangi kalit kiriting."
      : "Deploy muhitidan olinmoqda. Panel orqali almashtirish uchun yangi kalit kiriting."
    : "Resend API kaliti hali sozlanmagan.";

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card title="Sayt analitikasi" className="h-full xl:col-span-2">
        <p className="mb-4 text-[11px] leading-5 text-muted">GTM, GA4, Meta Pixel va Yandex Metrika ID’larini shu paneldan almashtiring. ID’lar ommaviy bo‘ladi, lekin noto‘g‘ri ID o‘rniga faqat provider formatiga mos qiymat qabul qilinadi.</p>
        {!overview.analyticsCspReady && <div className="mb-4"><Notice tone="error">Production build CSP’da runtime analytics origin’lari yo‘q. Deploy/build sozlamasiga ADMIN_ANALYTICS_CSP=on qo‘shib qayta build qiling; ungacha ID’larni deploy sozlamasida boshqaring.</Notice></div>}
        <ActionForm action={saveAnalyticsIntegration} submitLabel="Analitika ID’larini saqlash" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Google Tag Manager" hint={overview.analyticsManagedInAdmin.gtm ? "Panel qiymati; bo‘sh qoldirib saqlash deploy fallback’ga qaytaradi." : "ID formati: GTM-…; panelda saqlash deploy qiymatini almashtiradi."}>
            <input name="gtm" type="text" defaultValue={overview.analytics.gtm} placeholder="GTM-ABC123" autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Google Analytics 4" hint={overview.analyticsManagedInAdmin.ga4 ? "Panel qiymati; bo‘sh qoldirib saqlash deploy fallback’ga qaytaradi." : "ID formati: G-…; panelda saqlash deploy qiymatini almashtiradi."}>
            <input name="ga4" type="text" defaultValue={overview.analytics.ga4} placeholder="G-ABC123" autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Meta Pixel" hint={overview.analyticsManagedInAdmin.metaPixel ? "Panel qiymati; bo‘sh qoldirib saqlash deploy fallback’ga qaytaradi." : "Faqat raqamli Pixel ID."}>
            <input name="metaPixel" type="text" inputMode="numeric" defaultValue={overview.analytics.metaPixel} placeholder="1234567890" autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Yandex Metrika" hint={overview.analyticsManagedInAdmin.yandexMetrika ? "Panel qiymati; bo‘sh qoldirib saqlash deploy fallback’ga qaytaradi." : "Faqat raqamli counter ID."}>
            <input name="yandexMetrika" type="text" inputMode="numeric" defaultValue={overview.analytics.yandexMetrika} placeholder="987654321" autoComplete="off" className={inputClass} />
          </Field>
        </ActionForm>
        <p className="mt-3 text-[10px] leading-4 text-muted">Production’da bir marta ADMIN_ANALYTICS_CSP=on bilan build qilish kerak. CSP faqat shu to‘rtta vendorning aniq hostlarini ruxsatlaydi; ID o‘zgarganda qayta deploy shart emas.</p>
      </Card>

      <Card title="Telegram operator bot" className="h-full">
        <p className="mb-4 text-[11px] leading-5 text-muted">Buyurtma, murojaat va qayta mavjud bo‘lish so‘rovlari shu bot orqali operator chatiga yuboriladi. Token va chat ID bazada shifrlanadi; token sahifada qayta ko‘rsatilmaydi.</p>
        <ActionForm action={saveOperatorIntegration} submitLabel="Telegram sozlamalarini saqlash" className="flex flex-col gap-4">
          <Field label="Bot token" hint={operatorTokenHint}>
            <input name="botToken" type="password" autoComplete="new-password" spellCheck={false} placeholder="123456789:…" className={inputClass} />
          </Field>
          <Field label="Operator chat ID" hint="Guruh yoki kanal uchun odatda -100… bilan boshlanadi.">
            <input name="chatId" type="text" inputMode="numeric" defaultValue={overview.operator.chatId} placeholder="-1001234567890" className={inputClass} />
          </Field>
          {overview.operator.botTokenManagedInAdmin && <ClearOverride name="clearBotToken" label="Panelda saqlangan bot tokenini oʻchirish (deploy env qiymati boʻlsa, u davom etadi)." />}
          {overview.operator.chatIdManagedInAdmin && <ClearOverride name="clearChatId" label="Panelda saqlangan chat IDni oʻchirish (deploy env qiymati boʻlsa, u davom etadi)." />}
        </ActionForm>
        <div className="mt-4 border-t border-line pt-4">
          <ActionForm action={testOperatorTelegramConnection} submitLabel="Telegram ulanishini tekshirish" className="flex flex-col gap-3">
            <p className="text-[10px] leading-4 text-muted">Tokenni va botning chatni koʻra olishini tekshiradi. Test xabari yuborilmaydi; yuborish huquqi alohida tasdiqlanmaydi.</p>
          </ActionForm>
        </div>
      </Card>

      <Card title="Resend email" className="h-full">
        <p className="mb-4 text-[11px] leading-5 text-muted">Buyurtma tasdig‘i va obuna xatlari Resend orqali yuboriladi. API key bazada shifrlanadi; yuboruvchi domen Resend’da tasdiqlangan bo‘lishi va SPF, DKIM hamda DMARC yozuvlari sozlanishi kerak.</p>
        <ActionForm action={saveEmailIntegration} submitLabel="Email sozlamalarini saqlash" className="flex flex-col gap-4">
          <Field label="Resend API key" hint={emailKeyHint}>
            <input name="apiKey" type="password" autoComplete="new-password" spellCheck={false} placeholder="re_…" className={inputClass} />
          </Field>
          <Field label="Yuboruvchi (From)" hint="Masalan: Go Vita <no-reply@govita.uz>">
            <input name="from" type="text" defaultValue={overview.email.from} autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Javob manzili (Reply-to)">
            <input name="replyTo" type="email" defaultValue={overview.email.replyTo} autoComplete="email" className={inputClass} />
          </Field>
          {overview.email.apiKeyManagedInAdmin && <ClearOverride name="clearApiKey" label="Panelda saqlangan API keyni oʻchirish (deploy env qiymati boʻlsa, u davom etadi)." />}
          {overview.email.fromManagedInAdmin && <ClearOverride name="clearFrom" label="Paneldagi yuboruvchi manzilini oʻchirish va deploy sozlamasiga qaytish." />}
          {overview.email.replyToManagedInAdmin && <ClearOverride name="clearReplyTo" label="Paneldagi javob manzilini oʻchirish va deploy sozlamasiga qaytish." />}
        </ActionForm>
        <div className="mt-4 border-t border-line pt-4">
          <ActionForm action={sendResendTestEmail} submitLabel="Test xatini yuborish" className="flex flex-col gap-3">
            <Field label="Test qabul qiluvchi email">
              <input name="testRecipient" type="email" autoComplete="email" required placeholder="sizning@email.uz" className={inputClass} />
            </Field>
            <p className="text-[10px] leading-4 text-muted">Faqat siz kiritgan manzilga bitta oddiy test xati yuboriladi; marketing kampaniyasi emas. Resend “qabul qilindi” desa, bu inboxga yetganini kafolatlamaydi.</p>
          </ActionForm>
        </div>
      </Card>
    </div>
  );
}
