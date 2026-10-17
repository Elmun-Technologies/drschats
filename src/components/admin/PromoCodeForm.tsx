import { savePromoCode } from "@/app/admin/_actions/promocodes";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, inputClass } from "@/components/admin/ui";
import { toTashkentInput } from "@/lib/admin/product-form";
import type { promoCodes } from "@/lib/db/schema";

type PromoCode = typeof promoCodes.$inferSelect;
type ProductOption = { slug: string; name: string };

export function PromoCodeForm({ promo, products }: { promo?: PromoCode; products: ProductOption[] }) {
  const selected = new Set(promo?.productSlugs ?? []);
  return (
    <ActionForm action={savePromoCode} submitLabel={promo ? "Saqlash" : "Promokod yaratish"} className="grid gap-5 lg:grid-cols-2">
      {promo ? (
        <input type="hidden" name="original" value={promo.code} />
      ) : (
        <Field label="Kod" hint="Boʻsh qoldiring — GV-7K3P9Q kabi oʻqilishi oson kod yaratiladi. Oʻzingiz yozsangiz: lotin harflari, raqam va «-»." className="lg:col-span-2">
          <input name="code" maxLength={32} autoComplete="off" placeholder="Masalan, BAHOR15" className={`${inputClass} uppercase placeholder:normal-case`} />
        </Field>
      )}
      <Field label="Turi">
        <select name="kind" defaultValue={promo?.kind ?? "percent"} className={inputClass}>
          <option value="percent">Foiz chegirma</option>
          <option value="fixed">Qatʼiy summa (soʻm)</option>
        </select>
      </Field>
      <Field label="Qiymati" hint="Foiz: 1–90. Summa: soʻmda, mahsulotlar summasidan oshmaydi.">
        <input name="value" required inputMode="numeric" defaultValue={promo?.value ?? ""} className={inputClass} />
      </Field>
      <Field label="Minimal savat summasi, soʻm" hint="Taklif va aksiyalardan keyingi summa. Boʻsh — cheklovsiz.">
        <input name="minSubtotal" inputMode="numeric" defaultValue={promo?.minSubtotal ?? ""} className={inputClass} />
      </Field>
      <Field label="Umumiy limit" hint="Necha marta ishlatilishi mumkin. Boʻsh — cheksiz.">
        <input name="maxUses" inputMode="numeric" defaultValue={promo ? (promo.maxUses ?? "") : ""} className={inputClass} />
      </Field>
      <Field label="Bir telefon uchun limit">
        <input name="perPhoneLimit" inputMode="numeric" defaultValue={promo?.perPhoneLimit ?? 1} className={inputClass} />
      </Field>
      <Field label="Faqat shu telefon uchun" hint="Shaxsiy kod. Boʻsh — har kim ishlata oladi.">
        <input name="phone" inputMode="tel" defaultValue={promo?.phone9 ? `+998 ${promo.phone9}` : ""} placeholder="+998 90 123 45 67" className={inputClass} />
      </Field>
      <Field label="Boshlanishi" hint="Toshkent vaqti. Boʻsh — darhol">
        <input name="startsAt" type="datetime-local" defaultValue={toTashkentInput(promo?.startsAt)} className={inputClass} />
      </Field>
      <Field label="Tugashi" hint="Boʻsh — muddatsiz">
        <input name="endsAt" type="datetime-local" defaultValue={toTashkentInput(promo?.endsAt)} className={inputClass} />
      </Field>
      <Field label="Ichki izoh" hint="Mijozga koʻrinmaydi" className="lg:col-span-2">
        <input name="note" maxLength={300} defaultValue={promo?.note ?? ""} className={inputClass} />
      </Field>
      <label className="flex min-h-12 items-center gap-3 text-[15px] font-semibold text-ink">
        <input type="checkbox" name="active" defaultChecked={promo?.active ?? true} className="h-5 w-5 accent-ink" />
        Faol
      </label>
      <fieldset className="lg:col-span-2">
        <legend className="text-[14px] font-semibold text-ink">Qaysi mahsulotlarga</legend>
        <p className="mb-2 text-[13px] text-muted">Hech biri belgilanmasa — barcha mahsulotlarga. Taklif (upsell, dastur, sovgʻa) va obuna narxidagi qatorlarga promokod qoʻshilmaydi.</p>
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
