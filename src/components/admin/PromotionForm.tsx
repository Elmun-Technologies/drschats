import { savePromotion } from "@/app/admin/_actions/marketing";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, inputClass, textareaClass } from "@/components/admin/ui";
import { toTashkentInput } from "@/lib/admin/product-form";
import type { promotions } from "@/lib/db/schema";

type Promotion = typeof promotions.$inferSelect;
type ProductOption = { slug: string; name: string; categorySlug: string | null };

export const PROMOTION_TYPE_LABEL: Record<Promotion["type"], string> = {
  percent_off: "Foizli chegirma",
  buy_x_get_y: "2 ta oling — 3-si sovgʻa",
  free_shipping_over: "Bepul yetkazish (summadan)",
};

export function PromotionForm({ promotion, products }: { promotion?: Promotion; products: ProductOption[] }) {
  const selected = new Set(promotion?.productSlugs ?? []);
  return (
    <ActionForm action={savePromotion} submitLabel={promotion ? "Saqlash" : "Aksiyani yaratish"} className="grid gap-5 lg:grid-cols-2">
      {promotion && <input type="hidden" name="id" value={promotion.id} />}
      <Field label="Turi" className="lg:col-span-2">
        <select name="type" defaultValue={promotion?.type ?? "percent_off"} className={inputClass}>
          {Object.entries(PROMOTION_TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="Sarlavha (oʻzbekcha)"><input name="uz.title" required maxLength={80} defaultValue={promotion?.title.uz} className={inputClass} /></Field>
      <Field label="Sarlavha (ruscha)"><input name="ru.title" required maxLength={80} defaultValue={promotion?.title.ru} className={inputClass} /></Field>
      <Field label="Tavsif (oʻzbekcha)"><textarea name="uz.description" rows={2} maxLength={240} defaultValue={promotion?.description.uz} className={textareaClass} /></Field>
      <Field label="Tavsif (ruscha)"><textarea name="ru.description" rows={2} maxLength={240} defaultValue={promotion?.description.ru} className={textareaClass} /></Field>
      <Field label="Chegirma foizi" hint="Faqat «Foizli chegirma» uchun, 1–90"><input name="percent" inputMode="numeric" defaultValue={promotion?.percent ?? ""} className={inputClass} /></Field>
      <Field label="Bepul yetkazish chegarasi, soʻm" hint="Faqat «Bepul yetkazish» uchun"><input name="threshold" inputMode="numeric" defaultValue={promotion?.threshold ?? ""} className={inputClass} /></Field>
      <Field label="Boshlanishi" hint="Toshkent vaqti. Boʻsh — darhol"><input name="startsAt" type="datetime-local" defaultValue={toTashkentInput(promotion?.startsAt)} className={inputClass} /></Field>
      <Field label="Tugashi" hint="Boʻsh — muddatsiz"><input name="endsAt" type="datetime-local" defaultValue={toTashkentInput(promotion?.endsAt)} className={inputClass} /></Field>
      <Field label="Tartib" hint="Kichik raqam — saytda oldinroq"><input name="sort" type="number" defaultValue={promotion?.sort ?? 0} className={inputClass} /></Field>
      <label className="flex min-h-12 items-center gap-3 self-end text-[15px] font-semibold text-ink">
        <input type="checkbox" name="active" defaultChecked={promotion?.active ?? true} className="h-5 w-5 accent-ink" />
        Faol
      </label>
      <fieldset className="lg:col-span-2">
        <legend className="text-[14px] font-semibold text-ink">Qaysi mahsulotlarga</legend>
        <p className="mb-2 text-[13px] text-muted">Hech biri belgilanmasa — barcha mahsulotlarga. Obuna va taklif narxidagi qatorlarga aksiya qoʻshilmaydi.</p>
        <div className="grid max-h-[340px] gap-1 overflow-y-auto rounded-[12px] border border-line-strong p-2 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <label key={p.slug} className="flex min-h-11 items-center gap-2.5 rounded-[8px] px-2 text-[14px] text-ink hover:bg-tile">
              <input type="checkbox" name="productSlugs" value={p.slug} defaultChecked={selected.has(p.slug)} className="h-[18px] w-[18px] shrink-0 accent-ink" />
              <span className="min-w-0 truncate">{p.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </ActionForm>
  );
}
