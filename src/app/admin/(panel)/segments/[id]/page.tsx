import Link from "next/link";
import { notFound } from "next/navigation";
import { segmentById, segmentCounts, segmentMembers } from "@/lib/admin/segments";
import { sendSegmentCampaign } from "@/app/admin/_actions/marketing";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, EmptyState, Field, Metric, PageHeader, Pill, TableWrap, inputClass, linkClass, secondaryButtonClass, smallButtonClass, som, tableClass, tdClass, textareaClass, thClass, timeAgo } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Segment" };

const TEMPLATES: Record<string, string> = {
  "course-ending": "Assalomu alaykum, {ism}! Vitamin kursingiz tugash arafasida. Davom ettirish uchun buyurtmani shu yerda takrorlashingiz mumkin: govita.uz",
  "one-time": "Assalomu alaykum, {ism}! Go Vitaʼdan birinchi xaridingiz uchun rahmat. Sizga mos yangi mahsulotlarni koʻring: govita.uz",
  "lapsed-60": "{ism}, sizni sogʻindik! Go Vitaʼda yangi mahsulotlar va aksiyalar bor: govita.uz/uz/sale",
  lost: "{ism}, Go Vita sizni yana kutmoqda. Yangi aksiyalar: govita.uz/uz/sale",
  vip: "{ism}, siz Go Vitaʼning eng qadrli mijozlaridansiz. Siz uchun maxsus taklif: govita.uz",
  "new-7d": "{ism}, Go Vitaʼni tanlaganingiz uchun rahmat! Savollar boʻlsa, shu yerga yozing.",
  "abandoned-cart": "{ism}, savatingizda mahsulotlar qoldi. Buyurtmani yakunlash: govita.uz/uz/cart",
  "checkout-dropped": "{ism}, buyurtmangiz yakunlanmay qoldi. Yordam kerak boʻlsa, shu yerga yozing: govita.uz/uz/cart",
  browsers: "{ism}, siz koʻrgan mahsulotlar hali ham bor: govita.uz",
};

export default async function AdminSegmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const segment = segmentById(id);
  if (!segment) notFound();
  const [members, counts] = await Promise.all([segmentMembers(segment, 200), segmentCounts()]);
  const c = counts[segment.id];
  const isCustomers = segment.kind === "customers";

  return (
    <>
      <PageHeader eyebrow="Segmentlar va retarget" title={segment.title} lead={segment.description} actions={<Link href="/admin/segments" className={secondaryButtonClass}>← Barcha segmentlar</Link>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Auditoriya" value={formatNumber(c.size)} hint={isCustomers ? "mijoz" : "tashrif buyuruvchi"} />
        <Metric label={isCustomers ? "Telegramga ulangan" : "Telefoni maʼlum"} value={formatNumber(c.reachable)} hint="toʻgʻridan-toʻgʻri murojaat" />
        <Metric label={isCustomers ? "Jami xaridi" : "Savatlarda qolgan"} value={som(c.value)} />
        <Metric label="Tavsiya" value={<span className="text-[17px] leading-6">{segment.action}</span>} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card
          title="Auditoriya"
          lead={members.length === 200 ? "Birinchi 200 tasi — toʻliq roʻyxat eksportda" : undefined}
          actions={
            <div className="flex flex-wrap gap-2">
              <a href={`/admin/segments/${segment.id}/export?format=crm`} className={smallButtonClass}>CSV (jamoa uchun)</a>
              <a href={`/admin/segments/${segment.id}/export?format=meta`} className={smallButtonClass}>Meta auditoriya</a>
              <a href={`/admin/segments/${segment.id}/export?format=google`} className={smallButtonClass}>Google Customer Match</a>
            </div>
          }
        >
          {members.length === 0 ? (
            <EmptyState title="Hozircha bu segment boʻsh">Shartga mos kelgan odam paydo boʻlishi bilan roʻyxat oʻzi toʻladi.</EmptyState>
          ) : (
            <TableWrap>
              <table className={tableClass}>
                <thead><tr><th className={thClass}>Kim</th><th className={`${thClass} text-right`}>Buyurtmalar</th><th className={`${thClass} text-right`}>{isCustomers ? "Jami xarid" : "Savatda"}</th><th className={thClass}>{isCustomers ? "Oxirgi xarid" : "Oxirgi faollik"}</th><th className={thClass}>Telegram</th></tr></thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.key}>
                      <td className={tdClass}>
                        <Link href={isCustomers ? `/admin/customers/${m.key}` : `/admin/visitors/${m.key}`} className={linkClass}>{m.name ?? m.phone ?? `Mehmon ${m.key.slice(0, 6)}`}</Link>
                        {m.phone && m.name && <span className="block text-[13px] text-muted">{m.phone}</span>}
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(m.orders)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{som(m.value)}</td>
                      <td className={`${tdClass} whitespace-nowrap text-ink-2`}>{timeAgo(m.lastAt)}</td>
                      <td className={tdClass}>{m.telegramChatId ? <Pill tone="dark">ulangan</Pill> : <span className="text-muted">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Telegram orqali xabar" lead={`Faqat botga ulangan ${formatNumber(c.reachable)} kishiga boradi. {ism} — mijoz ismi bilan almashadi.`}>
            <ActionForm action={sendSegmentCampaign} submitLabel="Xabarni yuborish" className="flex flex-col gap-4">
              <input type="hidden" name="segment" value={segment.id} />
              <Field label="Kampaniya nomi">
                <input name="name" required maxLength={120} defaultValue={`${segment.title} — ${new Date().toLocaleDateString("ru-RU")}`} className={inputClass} />
              </Field>
              <Field label="Xabar" hint="1000 belgigacha. Havola qoʻshsangiz, UTM bilan qoʻshing — natija Analitikada koʻrinadi.">
                <textarea name="message" required rows={5} maxLength={1000} defaultValue={TEMPLATES[segment.id] ?? ""} className={textareaClass} />
              </Field>
              <label className="flex min-h-11 items-center gap-3 text-[14px] text-ink">
                <input type="checkbox" name="confirm" className="h-5 w-5 accent-ink" required />
                Yuborishni tasdiqlayman
              </label>
            </ActionForm>
          </Card>
          <Card title="Reklama kabinetida remarketing">
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-[14px] leading-5 text-ink-2">
              {isCustomers ? (
                <>
                  <li><b>Meta auditoriya</b> faylini Meta Ads Manager → Audiences → Custom Audience → Customer list ga yuklang.</li>
                  <li><b>Google Customer Match</b> faylini Google Ads → Audience manager → Customer list ga yuklang.</li>
                  <li>Telefon va email SHA-256 bilan xeshlangan — xom kontakt doʻkondan chiqmaydi.</li>
                </>
              ) : (
                <>
                  <li>Sayt <b>ViewContent</b>, <b>AddToCart</b>, <b>InitiateCheckout</b>, <b>Purchase</b> hodisalarini Meta Pixel va GA4 ga yuboradi.</li>
                  <li>Meta: Custom Audience → Website → «AddToCart, lekin Purchase emas, 30 kun» — shu segmentning nusxasi.</li>
                  <li>Google Ads: GA4 auditoriyasi «add_to_cart, purchase yoʻq» → remarketing kampaniyasi.</li>
                  <li>Pixel IDʼlari <Link href="/admin/integrations" className={linkClass}>Integratsiyalar</Link> boʻlimida.</li>
                </>
              )}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
