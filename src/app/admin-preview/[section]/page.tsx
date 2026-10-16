import { notFound } from "next/navigation";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPreviewFrame } from "@/components/admin/AdminPreviewFrame";
import { CampaignLinkBuilder } from "@/components/admin/CampaignLinkBuilder";
import { IntegrationStatusCard } from "@/components/admin/IntegrationStatusCard";
import { SalesTrendChart } from "@/components/admin/SalesTrendChart";
import { Card, PageHeader, Pill } from "@/components/admin/ui";
import type { DailyMetric } from "@/lib/admin/metrics";
import { formatNumber } from "@/lib/utils";

type SectionKey =
  | "analytics"
  | "orders"
  | "funnel"
  | "customers"
  | "products"
  | "categories"
  | "brands"
  | "marketing"
  | "content"
  | "integrations"
  | "bot"
  | "users";

type DemoSection = {
  title: string;
  lead: string;
  metrics: Array<{ label: string; value: string; caption: string; icon: string }>;
  tableTitle: string;
  columns: string[];
  rows: string[][];
  note: string;
  highlights: Array<{ label: string; value: string }>;
};

const SECTIONS: Record<SectionKey, DemoSection> = {
  analytics: {
    title: "Analitika",
    lead: "Savdo va tashriflar bo‘yicha ko‘rsatkichlar. Barcha raqamlar faqat interfeys demosiga tegishli.",
    metrics: [
      { label: "Savdo summasi", value: "15 420 000 soʻm", caption: "7 kun · namuna", icon: "↗" },
      { label: "Buyurtmalar", value: "77", caption: "7 kun · namuna", icon: "#" },
      { label: "Oʻrtacha chek", value: "220 286 soʻm", caption: "Namuna hisob", icon: "◉" },
      { label: "Konversiya", value: "2,8%", caption: "Demo tashriflaridan", icon: "%" },
    ],
    tableTitle: "Kanal bo‘yicha namuna",
    columns: ["Kanal", "Tashrif", "Buyurtma", "Savdo"],
    rows: [
      ["Google", "1 240", "24", "5 870 000 soʻm"],
      ["Instagram", "980", "19", "4 160 000 soʻm"],
      ["Telegram", "640", "13", "2 740 000 soʻm"],
      ["Bevosita", "1 010", "21", "2 650 000 soʻm"],
    ],
    note: "Tashrif, konversiya va manbalar bu demo uchun qo‘lda kiritilgan. Google Analytics yoki buyurtmalar bazasidan maʼlumot olinmaydi.",
    highlights: [{ label: "Ko‘rilgan sahifalar", value: "4 870" }, { label: "Savatchaga qo‘shish", value: "184" }, { label: "Namuna davri", value: "7 kun" }],
  },
  orders: {
    title: "Buyurtmalar",
    lead: "Buyurtma ro‘yxati va holatlarini ko‘rish uchun namunaviy ish maydoni.",
    metrics: [
      { label: "Jami buyurtma", value: "77", caption: "7 kun · demo", icon: "#" },
      { label: "Yangi", value: "12", caption: "Namuna holat", icon: "＋" },
      { label: "Yetkazilgan", value: "34", caption: "Namuna holat", icon: "✓" },
      { label: "Bekor qilingan", value: "4", caption: "Namuna holat", icon: "×" },
    ],
    tableTitle: "Namuna buyurtmalar",
    columns: ["Buyurtma", "Mijoz", "Sana", "Holat", "Jami"],
    rows: [
      ["DEMO-1048", "Namuna mijoz 01", "15 okt, 10:42", "Yetkazilgan", "385 000 soʻm"],
      ["DEMO-1047", "Namuna mijoz 02", "15 okt, 09:18", "Yangi", "219 000 soʻm"],
      ["DEMO-1046", "Namuna mijoz 03", "14 okt, 18:31", "Yoʻlda", "510 000 soʻm"],
      ["DEMO-1045", "Namuna mijoz 04", "14 okt, 15:06", "Tasdiqlangan", "175 000 soʻm"],
    ],
    note: "Bu yozuvlar soxta namuna. Preview buyurtmani tasdiqlamaydi, statusni o‘zgartirmaydi va hech qanday maʼlumotni saqlamaydi.",
    highlights: [{ label: "Yangi", value: "12" }, { label: "Jarayonda", value: "27" }, { label: "Yetkazilgan", value: "34" }],
  },
  funnel: {
    title: "Savdo voronkasi",
    lead: "Buyurtmaning yaratilishidan yetkazilishigacha bo‘lgan bosqichlar — namunaviy hisob.",
    metrics: [
      { label: "Buyurtmalar", value: "77", caption: "Davr bo‘yicha · demo", icon: "#" },
      { label: "Faol ishlovda", value: "39", caption: "Demo hisob", icon: "◷" },
      { label: "Yetkazilgan", value: "34", caption: "Demo hisob", icon: "✓" },
      { label: "Yetkazilgan summa", value: "7 860 000 soʻm", caption: "Namuna", icon: "↗" },
    ],
    tableTitle: "Bosqichlar bo‘yicha namuna",
    columns: ["Bosqich", "Buyurtmalar", "Jami ulush", "Keyingi bosqichga"],
    rows: [
      ["Yangi", "77", "100%", "84%"],
      ["Tasdiqlangan", "65", "84%", "86%"],
      ["Yoʻlda", "56", "73%", "61%"],
      ["Yetkazilgan", "34", "44%", "—"],
    ],
    note: "Voronka ko‘rsatkichlari sintetik demo hisobdir. Haqiqiy buyurtma statuslari yoki kuryer maʼlumotlari bilan bog‘lanmagan.",
    highlights: [{ label: "Yangi → tasdiq", value: "84%" }, { label: "Tasdiq → yo‘lda", value: "86%" }, { label: "Umumiy yetkazish", value: "44%" }],
  },
  customers: {
    title: "Mijozlar",
    lead: "Mijoz segmentlari va qayta xaridlar uchun shaxsiy maʼlumotsiz demo ro‘yxat.",
    metrics: [
      { label: "Mijozlar", value: "58", caption: "Demo segment", icon: "♧" },
      { label: "Yangi", value: "18", caption: "Namuna", icon: "＋" },
      { label: "Qayta xarid", value: "22", caption: "Namuna", icon: "↻" },
      { label: "VIP", value: "7", caption: "Namuna", icon: "★" },
    ],
    tableTitle: "Namuna mijozlar",
    columns: ["Profil", "Segment", "Buyurtmalar", "Oxirgi faollik"],
    rows: [
      ["Namuna mijoz 01", "Qayta xarid", "4", "12 okt, 14:20"],
      ["Namuna mijoz 02", "Yangi", "1", "15 okt, 09:18"],
      ["Namuna mijoz 03", "VIP", "8", "14 okt, 18:31"],
      ["Namuna mijoz 04", "Faolligi pasaygan", "2", "2 okt, 11:05"],
    ],
    note: "Ism, telefon, manzil, izoh yoki haqiqiy profil maʼlumotlari ko‘rsatilmaydi. Demo mijozlari haqiqiy CRM yoki maʼlumotlar bazasiga ulanmagan.",
    highlights: [{ label: "Qayta xarid", value: "22" }, { label: "VIP", value: "7" }, { label: "Faolligi pasaygan", value: "11" }],
  },
  products: {
    title: "Mahsulotlar",
    lead: "Katalog holati va qoldiq ko‘rinishining statik namunasi.",
    metrics: [
      { label: "Mahsulotlar", value: "128", caption: "Demo katalog", icon: "□" },
      { label: "Faol", value: "116", caption: "Namuna", icon: "✓" },
      { label: "Kam qoldiq", value: "9", caption: "Namuna", icon: "!" },
      { label: "Kategoriya", value: "15", caption: "Demo katalog", icon: "▦" },
    ],
    tableTitle: "Namuna mahsulotlar",
    columns: ["SKU", "Mahsulot", "Kategoriya", "Narx", "Qoldiq"],
    rows: [
      ["DEMO-001", "Vitamin kompleksi — namuna", "Vitaminlar", "185 000 soʻm", "24"],
      ["DEMO-002", "Omega kompleksi — namuna", "Yurak salomatligi", "249 000 soʻm", "8"],
      ["DEMO-003", "Mineral kompleksi — namuna", "Minerallar", "139 000 soʻm", "0"],
      ["DEMO-004", "O‘simlik ekstrakti — namuna", "O‘simliklar", "172 000 soʻm", "16"],
    ],
    note: "Bu katalog faqat demo ko‘rinishi. Mahsulot narxi yoki qoldig‘ini tahrirlash, nashr qilish va saqlash amallari o‘chirilgan.",
    highlights: [{ label: "Faol", value: "116" }, { label: "Kam qoldiq", value: "9" }, { label: "Tugagan", value: "3" }],
  },
  categories: {
    title: "Kategoriyalar",
    lead: "Mahsulot katalogini guruhlash uchun namunaviy kategoriya ro‘yxati.",
    metrics: [
      { label: "Jami kategoriyalar", value: "15", caption: "Demo katalog", icon: "▦" },
      { label: "Asosiy", value: "5", caption: "Namuna", icon: "□" },
      { label: "Ichki", value: "10", caption: "Namuna", icon: "↳" },
      { label: "Bog‘langan mahsulot", value: "128", caption: "Demo hisob", icon: "◇" },
    ],
    tableTitle: "Namuna kategoriyalar",
    columns: ["Kategoriya", "Slug", "Mahsulotlar", "Holat"],
    rows: [
      ["Vitaminlar", "demo-vitamins", "32", "Faol · demo"],
      ["Minerallar", "demo-minerals", "24", "Faol · demo"],
      ["Yurak salomatligi", "demo-heart", "18", "Faol · demo"],
      ["O‘simliklar", "demo-herbs", "11", "Qoralama · demo"],
    ],
    note: "Namuna kategoriyalar hech qayerda saqlanmagan; bu sahifadagi boshqaruv elementlari o‘qish uchun mo‘ljallangan.",
    highlights: [{ label: "Faol", value: "12" }, { label: "Qoralama", value: "3" }, { label: "Namuna mahsulot", value: "128" }],
  },
  brands: {
    title: "Brendlar",
    lead: "Brend katalogi va unga biriktirilgan mahsulotlar uchun demo ko‘rinish.",
    metrics: [
      { label: "Brendlar", value: "18", caption: "Demo katalog", icon: "◇" },
      { label: "Mahsulot biriktirilgan", value: "15", caption: "Namuna", icon: "✓" },
      { label: "Ko‘rib chiqilmoqda", value: "3", caption: "Namuna", icon: "◷" },
      { label: "Bog‘langan mahsulot", value: "128", caption: "Demo hisob", icon: "□" },
    ],
    tableTitle: "Namuna brendlar",
    columns: ["Brend", "Mahsulotlar", "Katalog holati", "Manba"],
    rows: [
      ["Namuna brend A", "24", "Faol · demo", "Mahalliy preview"],
      ["Namuna brend B", "19", "Faol · demo", "Mahalliy preview"],
      ["Namuna brend C", "11", "Tekshiruv · demo", "Mahalliy preview"],
      ["Namuna brend D", "0", "Qoralama · demo", "Mahalliy preview"],
    ],
    note: "Brend nomlari va sonlar uydirma. Preview katalogga yozmaydi va haqiqiy do‘kon maʼlumotlariga murojaat qilmaydi.",
    highlights: [{ label: "Faol", value: "15" }, { label: "Qoralama", value: "3" }, { label: "Demo brend", value: "18" }],
  },
  marketing: {
    title: "Marketing",
    lead: "Kampaniya samaradorligi va UTM havola yaratish uchun namuna ish maydoni.",
    metrics: [
      { label: "Faol kampaniyalar", value: "4", caption: "Demo", icon: "↗" },
      { label: "Kanal xarajati", value: "2 400 000 soʻm", caption: "Namuna qiymat", icon: "₊" },
      { label: "Kampaniya buyurtmalari", value: "56", caption: "Demo hisob", icon: "#" },
      { label: "O‘rtacha ROAS", value: "3,2×", caption: "Namuna hisob", icon: "◎" },
    ],
    tableTitle: "Namuna kampaniyalar",
    columns: ["Kampaniya", "Kanal", "Holat", "Buyurtma", "Savdo"],
    rows: [
      ["demo-autumn-01", "Instagram", "Namuna", "19", "4 160 000 soʻm"],
      ["demo-search-02", "Google", "Namuna", "24", "5 870 000 soʻm"],
      ["demo-message-03", "Telegram", "Namuna", "13", "2 740 000 soʻm"],
    ],
    note: "Hisobot raqamlari namuna. UTM builder faqat brauzerda havola yasaydi; kampaniyani ishga tushirmaydi yoki saqlamaydi.",
    highlights: [{ label: "Google", value: "24 buyurtma" }, { label: "Instagram", value: "19 buyurtma" }, { label: "Telegram", value: "13 buyurtma" }],
  },
  content: {
    title: "Blog va kontent",
    lead: "Maqola holatlari va tahrir jarayoni uchun shaxsiy bo‘lmagan demo ro‘yxat.",
    metrics: [
      { label: "Maqolalar", value: "12", caption: "Demo kontent", icon: "▤" },
      { label: "Nashr qilingan", value: "8", caption: "Namuna", icon: "✓" },
      { label: "Qoralama", value: "3", caption: "Namuna", icon: "✎" },
      { label: "Rejalashtirilgan", value: "1", caption: "Namuna", icon: "◷" },
    ],
    tableTitle: "Namuna maqolalar",
    columns: ["Sarlavha", "Bo‘lim", "Holat", "Yangilangan"],
    rows: [
      ["Sog‘lom odatlar — namuna", "Salomatlik", "Nashr · demo", "14 okt, 12:00"],
      ["Vitaminlar bo‘yicha qo‘llanma", "Qo‘llanmalar", "Qoralama · demo", "13 okt, 15:30"],
      ["Mavsumiy tavsiyalar", "Yangiliklar", "Rejalashtirilgan · demo", "16 okt, 09:00"],
    ],
    note: "Maqola matni va statuslar misol uchun. Preview CMS/Sanity bilan ulanmagan va kontentni tahrir qilmaydi.",
    highlights: [{ label: "Nashr qilingan", value: "8" }, { label: "Qoralama", value: "3" }, { label: "Rejada", value: "1" }],
  },
  integrations: {
    title: "Integratsiyalar",
    lead: "Xizmatlar holatini ko‘rsatish uchun demo kartalar. Ulanish holati tekshirilmaydi.",
    metrics: [
      { label: "Ulanishlar", value: "6", caption: "Namuna ro‘yxat", icon: "↔" },
      { label: "Sozlangan", value: "2", caption: "Demo holat", icon: "✓" },
      { label: "Qo‘lda", value: "1", caption: "Demo holat", icon: "✎" },
      { label: "Rejada", value: "3", caption: "Demo holat", icon: "◷" },
    ],
    tableTitle: "Integratsiyalar holati",
    columns: ["Xizmat", "Yo‘nalish", "Namuna holat", "Izoh"],
    rows: [
      ["Google Analytics 4", "Analitika", "Demo ulangan", "Real ulanish emas"],
      ["Click / Payme", "To‘lov", "Rejada", "Gateway handoff va tasdiqlangan callback kerak"],
      ["BTS / Yandex", "Yetkazish", "Qo‘lda", "API demo qilinmagan"],
      ["SMS provayderi", "Xabarlar", "Rejada", "Provayder tanlanmagan"],
    ],
    note: "Hech qanday API kaliti, to‘lov yoki tashqi xizmatga ulanish yo‘q. Statuslar faqat dizayn namunasi.",
    highlights: [{ label: "API chaqiruvlari", value: "Yo‘q" }, { label: "Kalitlar", value: "Saqlanmagan" }, { label: "Demo holati", value: "Statik" }],
  },
  bot: {
    title: "Telegram klub",
    lead: "Telegram hamjamiyati va xabarlar boshqaruvi uchun namuna ko‘rsatkichlari.",
    metrics: [
      { label: "Aʼzolar", value: "246", caption: "Namuna", icon: "♧" },
      { label: "Yangi aʼzo", value: "18", caption: "7 kun · demo", icon: "＋" },
      { label: "Xabar yetkazildi", value: "97%", caption: "Demo foiz", icon: "✓" },
      { label: "Navbatda", value: "3", caption: "Namuna", icon: "◷" },
    ],
    tableTitle: "Namuna faollik",
    columns: ["Faollik", "Kanal", "Holat", "Vaqt"],
    rows: [
      ["Haftalik tavsiya — demo", "Telegram klub", "Namuna yuborildi", "15 okt, 10:00"],
      ["Yangi aʼzolar uchun xabar", "Bot", "Qoralama · demo", "14 okt, 16:20"],
      ["Kuzgi yangiliklar", "Telegram klub", "Rejada · demo", "16 okt, 09:30"],
    ],
    note: "Preview botga ulanmagan, xabar yubormaydi va aʼzolar haqidagi maʼlumotlarni olmaydi. Barcha sonlar uydirma.",
    highlights: [{ label: "Klub aʼzolari", value: "246" }, { label: "Namuna xabar", value: "3" }, { label: "Bot ulanishi", value: "Faol emas" }],
  },
  users: {
    title: "Administratorlar",
    lead: "Rollar va ruxsatlarni ko‘rsatadigan shaxsiy maʼlumotsiz demo ro‘yxat.",
    metrics: [
      { label: "Administratorlar", value: "4", caption: "Namuna", icon: "♧" },
      { label: "Faol sessiya", value: "2", caption: "Demo qiymat", icon: "●" },
      { label: "Rollar", value: "3", caption: "Namuna", icon: "◇" },
      { label: "Kutilayotgan taklif", value: "1", caption: "Namuna", icon: "＋" },
    ],
    tableTitle: "Namuna foydalanuvchilar",
    columns: ["Foydalanuvchi", "Rol", "Ruxsat doirasi", "Holat"],
    rows: [
      ["Namuna admin 01", "Administrator", "Barcha bo‘limlar · demo", "Faol · demo"],
      ["Namuna admin 02", "Operator", "Buyurtmalar · demo", "Faol · demo"],
      ["Namuna admin 03", "Muharrir", "Kontent · demo", "Faol · demo"],
      ["Namuna admin 04", "Operator", "Taklif yuborilgan · demo", "Kutilmoqda · demo"],
    ],
    note: "Bu sahifada haqiqiy foydalanuvchilar, email manzillar, ruxsatlar yoki sessiyalar yo‘q. Amaliyotlar o‘chirilgan.",
    highlights: [{ label: "Administrator", value: "1" }, { label: "Operator", value: "2" }, { label: "Muharrir", value: "1" }],
  },
};

const DEMO_DAILY: DailyMetric[] = [
  { date: "2026-10-09", label: "9 okt", orders: 8, revenue: 1_480_000 },
  { date: "2026-10-10", label: "10 okt", orders: 11, revenue: 2_210_000 },
  { date: "2026-10-11", label: "11 okt", orders: 7, revenue: 1_160_000 },
  { date: "2026-10-12", label: "12 okt", orders: 13, revenue: 2_740_000 },
  { date: "2026-10-13", label: "13 okt", orders: 10, revenue: 1_920_000 },
  { date: "2026-10-14", label: "14 okt", orders: 16, revenue: 3_380_000 },
  { date: "2026-10-15", label: "15 okt", orders: 12, revenue: 2_530_000 },
];

function MetricIcon({ children }: { children: string }) {
  return <span aria-hidden="true" className="text-[17px] font-bold">{children}</span>;
}

function DataTable({ section }: { section: DemoSection }) {
  return (
    <Card title={section.tableTitle}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-[#e4e6e8] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#63686e]">
              {section.columns.map((column) => <th key={column} className="pb-3 pr-4 last:pr-0">{column}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f3f0]">
            {section.rows.map((row, rowIndex) => (
              <tr key={`${section.title}-${rowIndex}`} className="text-[11px] text-[#44494e]">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className={`py-3 pr-4 last:pr-0 ${cellIndex === 0 ? "font-bold text-[#0f2d24]" : ""}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[10px] text-[#63686e]">Namuna maʼlumot · faqat ko‘rinish uchun</p>
    </Card>
  );
}

function DemoHighlights({ section }: { section: DemoSection }) {
  return (
    <Card title="Namuna ko‘rsatkichlar">
      <ul className="divide-y divide-[#e4e6e8]">
        {section.highlights.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3 py-3">
            <span className="text-[11px] text-[#44494e]">{item.label}</span>
            <span className="text-[12px] font-bold text-[#0f2d24]">{item.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-sm bg-[#f1f3f0] p-3 text-[10px] leading-4 text-[#63686e]">Haqiqiy maʼlumot yuklanmadi. Preview ichidagi amallar hech narsani o‘zgartirmaydi.</div>
    </Card>
  );
}

function IntegrationsDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <IntegrationStatusCard name="Google Analytics 4" category="Analitika" description="Tashriflar va sayt eventlari." state="connected" detail="Statik demo status — real ulanish emas." icon={<MetricIcon>GA</MetricIcon>} />
      <IntegrationStatusCard name="Click / Payme" category="Toʻlov" description="Online toʻlovlar." state="planned" detail="Haqiqiy merchant kalitlari ulanmagan." icon={<MetricIcon>₿</MetricIcon>} />
      <IntegrationStatusCard name="BTS / Yandex" category="Yetkazib berish" description="Kuryer statuslari va tracking." state="manual" detail="Demo holat — API chaqirilmaydi." icon={<MetricIcon>↗</MetricIcon>} />
      <IntegrationStatusCard name="SMS provayderi" category="Xabarlar" description="Buyurtma xabarlari va kampaniyalar." state="planned" detail="Provayder sozlanmagan." icon={<MetricIcon>SMS</MetricIcon>} />
    </div>
  );
}

export default async function AdminPreviewSectionPage({ params }: { params: Promise<{ section: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();

  const { section: rawSection } = await params;
  const section = SECTIONS[rawSection as SectionKey];
  if (!section) notFound();

  return (
    <AdminPreviewFrame>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageHeader title={section.title} lead={section.lead} />
        <Pill>Namuna · DEMO</Pill>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {section.metrics.map((metric) => (
          <AdminMetricCard key={metric.label} label={metric.label} value={metric.value} caption={metric.caption} icon={<MetricIcon>{metric.icon}</MetricIcon>} />
        ))}
      </div>

      {rawSection === "analytics" && <div className="mb-4"><SalesTrendChart data={DEMO_DAILY} /></div>}
      {rawSection === "integrations" ? (
        <div className="mb-4"><IntegrationsDemo /></div>
      ) : rawSection === "marketing" ? (
        <div className="mb-4"><CampaignLinkBuilder baseUrl="https://www.govita.uz" /></div>
      ) : rawSection === "funnel" ? (
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          {section.rows.map((row, index) => {
            const value = Number(row[1]);
            const maximum = Number(section.rows[0][1]);
            const width = Math.round((value / maximum) * 100);
            return (
              <Card key={row[0]}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#63686e]">{String(index + 1).padStart(2, "0")} · {row[0]}</p>
                <p className="mt-2 text-[24px] font-bold tracking-[-0.04em] text-[#0f2d24]">{formatNumber(value)}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4e6e8]"><div className="h-full rounded-full bg-[#0f2d24]" style={{ width: `${width}%` }} /></div>
                <p className="mt-2 text-[10px] text-[#63686e]">{row[2]} buyurtma ulushi · namuna</p>
              </Card>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <DataTable section={section} />
        <DemoHighlights section={section} />
      </div>
      <p className="mt-4 rounded-sm border border-[#e4e6e8] bg-[#f1f3f0] p-4 text-[11px] leading-5 text-[#63686e]">{section.note}</p>
    </AdminPreviewFrame>
  );
}
