import Link from "next/link";
import { PAYMENT_PROVIDERS } from "@/lib/config/payments";
import { IntegrationStatusCard, type IntegrationState } from "@/components/admin/IntegrationStatusCard";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { IntegrationSettingsForms } from "@/components/admin/IntegrationSettingsForms";
import { getIntegrationAdminOverview } from "@/lib/integrations/settings";

export const metadata = { title: "Integratsiyalar" };

function Icon({ kind }: { kind: string }) {
  const labels: Record<string, string> = { gtm: "G", ga: "GA", ym: "Я", meta: "M", payme: "P", click: "C", courier: "↗", sms: "SMS", email: "@", telegram: "✈", cms: "S" };
  return <span aria-hidden="true" className="text-[12px] font-extrabold tracking-[-0.05em]">{labels[kind] ?? "↗"}</span>;
}

function configured(value?: string) {
  return Boolean(value?.trim());
}

function stateFor(isConfigured: boolean): IntegrationState {
  // A key being present is not a live provider health check.
  return isConfigured ? "configured" : "planned";
}

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  const overview = await getIntegrationAdminOverview();
  const { gtm, ga4, yandexMetrika: metrika, metaPixel: meta } = overview.analytics;
  const telegramClub = process.env.BOT_API_KEY && process.env.TELEGRAM_CLUB_BOT_TOKEN;
  const sanity = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder";
  const configuredCount = [gtm, ga4, metrika, meta, overview.email.configured, overview.operator.configured, telegramClub, ...PAYMENT_PROVIDERS.map((provider) => provider.configured), sanity].filter(Boolean).length;
  const totalCount = 8 + PAYMENT_PROVIDERS.length;

  return (
    <>
      <PageHeader title="Integratsiyalar" lead="Analitika ID’lari, operator Telegram va Resend Email’ni panelda boshqaring; toʻlov merchant ID’si borligi esa toʻliq gateway ulanishi yoki checkout yoqilganini anglatmaydi." />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#e4e6e8] bg-[#f1f3f0] px-4 py-3.5">
        <div><p className="text-[12px] font-bold text-[#0f2d24]">Ulanishlar reyestri</p><p className="mt-1 text-[10px] text-[#63686e]">Panelda saqlanadigan operator/email sozlamalari va deploy konfiguratsiyasidagi xizmatlar alohida ko‘rsatiladi. Status kalit mavjudligini bildiradi — live API sinovi emas.</p></div>
        <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-[#0f2d24]">{configuredCount} / {totalCount} sozlangan</span>
      </div>

      {(!overview.databaseConfigured || !overview.encryptionConfigured || overview.storeStatus !== "ready") && (
        <div className="mb-4 space-y-2">
          {!overview.databaseConfigured && <Notice tone="error">Paneldan integratsiya sozlamalarini saqlash uchun production database (DATABASE_URL) va admin migration’lari kerak.</Notice>}
          {overview.databaseConfigured && !overview.encryptionConfigured && <Notice tone="error">Shifrlangan sozlamalarni yoqish uchun deploy muhitida INTEGRATION_ENCRYPTION_KEY ni sozlang. Kalit 64 ta hex belgidan iborat bo‘lsin (masalan, openssl rand -hex 32 buyrug‘i natijasi).</Notice>}
          {overview.databaseConfigured && overview.storeStatus === "database-error" && <Notice tone="error">Integratsiya sozlamalari jadvalini o‘qib bo‘lmadi. 0005_admin_integration_settings.sql migration qo‘llanganini tekshiring.</Notice>}
          {overview.databaseConfigured && (overview.storeStatus === "encryption-key-missing" || overview.storeStatus === "decrypt-error") && <Notice tone="error">Saqlangan shifrlangan sozlamalarni ochib bo‘lmadi. INTEGRATION_ENCRYPTION_KEY qiymati saqlash paytidagi kalit bilan bir xil ekanini tekshiring; maxfiy kalit yo‘qolsa, panelda saqlangan qiymatlarni qayta kiritish kerak bo‘ladi.</Notice>}
        </div>
      )}

      <section className="mb-6">
        <div className="mb-3"><h2 className="text-[12px] font-bold text-[#44494e]">Go Vita panelidan sozlash</h2><p className="mt-1 text-[10px] leading-4 text-[#63686e]">Analytics ID’lari va Resend / Telegram operator sozlamalari runtime’da qo‘llanadi. Maxfiy qiymatlar AES-256-GCM bilan shifrlanib bazada saqlanadi; browser’ga faqat ommaviy analytics ID’lari beriladi.</p></div>
        <IntegrationSettingsForms overview={overview} />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-[12px] font-bold text-[#44494e]">Analitika va reklama</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <IntegrationStatusCard name="Google Tag Manager" category="Analitika" description="Sayt eventlarini GTM orqali Google va boshqa teglariga uzatadi." state={stateFor(configured(gtm))} detail={gtm ? `ID: ${gtm} · ${overview.analyticsManagedInAdmin.gtm ? "admin paneli" : "deploy sozlamasi"}` : "GTM ID’ni admin paneli yoki deploy sozlamasida kiriting."} icon={<Icon kind="gtm" />} />
          <IntegrationStatusCard name="Google Analytics 4" category="Analitika" description="Tashriflar, sessiyalar va sayt ichidagi eventlarni o‘lchaydi." state={stateFor(configured(ga4))} detail={ga4 ? `Measurement ID: ${ga4} · ${overview.analyticsManagedInAdmin.ga4 ? "admin paneli" : "deploy sozlamasi"}` : "GA4 ID’ni admin paneli yoki deploy sozlamasida kiriting."} icon={<Icon kind="ga" />} />
          <IntegrationStatusCard name="Yandex Metrika" category="Analitika" description="Yandex qidiruv trafikini va konversiyalarni kuzatadi." state={stateFor(configured(metrika))} detail={metrika ? `Counter ID: ${metrika} · ${overview.analyticsManagedInAdmin.yandexMetrika ? "admin paneli" : "deploy sozlamasi"}` : "Metrika ID’ni admin paneli yoki deploy sozlamasida kiriting."} icon={<Icon kind="ym" />} />
          <IntegrationStatusCard name="Meta Pixel" category="Reklama" description="Meta Ads uchun ViewContent, AddToCart va Purchase eventlari." state={stateFor(configured(meta))} detail={meta ? `Pixel ID: ${meta} · ${overview.analyticsManagedInAdmin.metaPixel ? "admin paneli" : "deploy sozlamasi"}` : "Meta Pixel ID’ni admin paneli yoki deploy sozlamasida kiriting."} icon={<Icon kind="meta" />} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-[12px] font-bold text-[#44494e]">Toʻlovlar</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PAYMENT_PROVIDERS.map((provider) => <IntegrationStatusCard key={provider.id} name={provider.label} category="Toʻlov provayderi" description={`${provider.label} merchant ID’si va toʻliq payment flow holati.`} state={provider.configured ? "configured" : "planned"} detail={provider.configured ? "End-to-end oqim kodda yoqilgan; provayder credentials va real callback’ni alohida tekshiring." : provider.merchantIdConfigured ? "Merchant ID bor, ammo gateway handoff va tasdiqlangan payment callback hali yoʻq. Checkout ataylab oʻchirilgan." : `NEXT_PUBLIC_${provider.id.toUpperCase()}_MERCHANT_ID yoʻq; qoʻshishning oʻzi ham checkout’ni yoqmaydi — toʻliq integratsiya kerak.`} icon={<Icon kind={provider.id} />} />)}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-[12px] font-bold text-[#44494e]">Yetkazib berish</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <IntegrationStatusCard name="BTS Post" category="Kuryer / viloyatlar" description="Viloyatlarga buyurtma yetkazish." state="manual" detail="Sayt matnida BTS yetkazish usuli ko‘rsatiladi; tracking yoki API orqali status sinxronlash hozir ulanmagan." icon={<Icon kind="courier" />} />
          <IntegrationStatusCard name="Yandex Dostavka" category="Kuryer / Toshkent" description="Toshkent shahridagi buyurtmalar uchun yetkazish." state="manual" detail="Operator buyurtmani qoʻlda boshqaradi. Kuryer API credentials mavjud emas." icon={<Icon kind="courier" />} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-[12px] font-bold text-[#44494e]">Mijoz bilan aloqa va kontent</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <IntegrationStatusCard name="SMS provayderi" category="SMS" description="Buyurtma holati va marketing xabarlarini SMS orqali yuborish." state="planned" detail="Hozir SMS provayder tanlanmagan va SMS xabar joʻnatilmaydi. Provayder, shablon va rozilik oqimi aniqlangach ulanadi." icon={<Icon kind="sms" />} />
          <IntegrationStatusCard name="Resend Email" category="Email" description="Buyurtma tasdigʻi, obuna va marketing xatlari." state={stateFor(overview.email.configured)} detail={overview.email.configured ? `API key ${overview.email.apiKeyManagedInAdmin ? "admin panelida" : "deploy sozlamasida"} bor. Domen SPF / DKIM / DMARC yozuvlarini tekshiring.` : "Admin panelida API key kiriting yoki deploy sozlamasini sozlang."} icon={<Icon kind="email" />} />
          <IntegrationStatusCard name="Telegram" category="Operator / mijozlar" description="Operator bildirishnomalari, klub boti va Mini App." state={stateFor(overview.operator.configured || Boolean(telegramClub))} detail={overview.operator.configured ? `Operator bot va chat ID sozlangan (${overview.operator.botTokenManagedInAdmin ? "admin panelida" : "deploy sozlamasida"}).` : telegramClub ? "Klub bot konfiguratsiyasi mavjud; operator chat alohida sozlanmagan." : "Operator bildirishnomalari uchun bot tokeni va chat ID kiriting."} icon={<Icon kind="telegram" />} />
          <IntegrationStatusCard name="Sanity CMS" category="Kontent" description="Blog va tahrirlanadigan kontent uchun CMS." state={stateFor(Boolean(sanity))} detail={sanity ? "Project ID mavjud. Studio production’da yoqilganligini tekshiring." : "Server sozlamalari: NEXT_PUBLIC_SANITY_PROJECT_ID va SANITY_API_TOKEN"} icon={<Icon kind="cms" />} />
        </div>
      </section>

      <Card title="Panel ichida boshqarish" className="mb-4">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/admin/marketing", icon: "UTM", title: "Marketing", text: "Kampaniya havolalari va buyurtma manbalari" },
            { href: "/admin/bot", icon: "TG", title: "Telegram klub", text: "Bot sozlamalari, aʼzolar va xabarlar" },
            { href: "/admin/content", icon: "CMS", title: "Blog va kontent", text: "Maqolalar holati va CMSʼga o‘tish" },
            { href: "/admin/orders?status=new", icon: "↗", title: "Yetkazish va buyurtmalar", text: "Statuslar, izohlar va mijozga xizmat" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group flex min-h-[86px] items-start gap-3 rounded-sm border border-line bg-white p-3 transition hover:border-forest/25 hover:bg-[#fbfcfa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20">
              <span className="grid h-9 min-w-9 place-items-center rounded-sm bg-tile px-1 text-[9px] font-bold text-forest">{item.icon}</span>
              <span className="min-w-0"><span className="block text-[12px] font-semibold text-ink">{item.title}</span><span className="mt-1 block text-[10px] leading-4 text-muted">{item.text}</span></span>
            </Link>
          ))}
        </div>
      </Card>

      <Card title="Maxfiylik va joriy cheklovlar">
        <p className="max-w-4xl text-[11px] leading-5 text-muted">Analitika ID’lari, operator Telegram va Resend sozlamalarini panelda boshqarish mumkin; maxfiy kalitlar ochiq ko‘rsatilmaydi. Runtime analytics uchun ADMIN_ANALYTICS_CSP=on bilan bir marta qayta build kerak. To‘lov merchant sozlamalari, Sanity project va klub botining o‘zaro kalitlari deploy konfiguratsiyasida qoladi. SMS provayderi, BTS va Yandex kuryer API ulanishlari ishga tushmagan; merchant ID o‘z-o‘zidan real checkout oqimini anglatmaydi.</p>
      </Card>
    </>
  );
}
