import type { ReactNode } from "react";
import Link from "next/link";
import { readCommerceSettings } from "@/lib/commerce/server";
import { LADDER_PERCENT_CHOICES, LIMITS, POPUP_IDS, defaultCommerceSettings, envCutoff, type CommerceSection, type LocalizedText, type PopupId, type SectionMeta } from "@/lib/commerce/settings";
import { shopflow } from "@/lib/shopflow";
import { formatDateTime } from "@/lib/admin/order-labels";
import { CommerceCardForm } from "@/components/admin/CommerceCardForm";
import { Card, Field, Notice, PageHeader, Pill, inputClass, linkClass, som } from "@/components/admin/ui";

export const metadata = { title: "Savdo qoidalari" };

/*
  Savdo qoidalari — the commerce rules the storefront prices and quotes with:
  delivery, the upsell ladder, Subscribe & Save, the marketing popups and the
  cart's free-shipping suggestions. Stored in site_settings (`commerce.rules`);
  the defaults are the code constants, so nothing changes until a card is
  saved. Every card says what customers will see and who changed it last.
*/

function Audit({ meta }: { meta: SectionMeta | undefined }) {
  if (!meta) return <p className="col-span-full text-[13px] text-muted">Standart qiymatlar — hali oʻzgartirilmagan.</p>;
  const at = new Date(meta.at);
  return (
    <p className="col-span-full text-[13px] text-muted">
      Oxirgi oʻzgartirgan: <span className="font-semibold text-ink-2">{meta.by}</span>, {Number.isNaN(at.getTime()) ? meta.at : formatDateTime(at)}
    </p>
  );
}

function Preview({ children }: { children: ReactNode }) {
  return (
    <div className="col-span-full rounded-[12px] bg-tile px-4 py-3 text-[14px] leading-5 text-ink-2">
      <span className="font-semibold text-ink">Mijoz koʻradi: </span>
      {children}
    </div>
  );
}

function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked: boolean; hint?: string }) {
  return (
    <label className="col-span-full flex min-h-11 items-start gap-3 text-[15px] text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 shrink-0 accent-ink" />
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold">{label}</span>
        {hint && <span className="text-[13px] leading-[17px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}

function TextPair({ name, label, value, placeholder, multiline }: { name: string; label: string; value: LocalizedText; placeholder: LocalizedText; multiline?: boolean }) {
  return (
    <>
      {(["uz", "ru"] as const).map((lang) => (
        <Field key={lang} label={`${label} (${lang})`} hint="Boʻsh — standart matn">
          {multiline ? (
            <textarea name={`${name}.${lang}`} defaultValue={value[lang]} maxLength={LIMITS.text} placeholder={placeholder[lang]} rows={2} className={`${inputClass} h-auto min-h-[72px] py-3 leading-6`} />
          ) : (
            <input name={`${name}.${lang}`} defaultValue={value[lang]} maxLength={LIMITS.text} placeholder={placeholder[lang]} className={inputClass} />
          )}
        </Field>
      ))}
    </>
  );
}

const grid = "grid gap-4 sm:grid-cols-2";

const POPUP_COPY: Record<PopupId, { title: string; when: string; delayLabel: string; textNote: string; placeholder: { title: LocalizedText; body: LocalizedText } }> = {
  welcome: {
    title: "Xush kelibsiz (birinchi buyurtma chegirmasi)",
    when: "Sahifada shuncha soniya turganda yoki yarmi aylantirilganda.",
    delayLabel: "Kechikish, soniya",
    textNote: "{percent} — chegirma foizi bilan almashtiriladi.",
    placeholder: {
      title: { uz: "Birinchi buyurtmaga −{percent}%", ru: "−{percent}% на первый заказ" },
      body: { uz: "Standart matn", ru: "Стандартный текст" },
    },
  },
  exit: {
    title: "Chiqishda (desktop)",
    when: "Koʻrsatkich oyna tepasiga chiqqanda; sahifa ochilgandan shuncha soniya oʻtib yoqiladi.",
    delayLabel: "Yoqilish kechikishi, soniya",
    textNote: "Matn savat boʻsh boʻlganda (Telegram taklifi) koʻrsatiladi; savat boʻlsa — savat va jami.",
    placeholder: { title: { uz: "Standart sarlavha", ru: "Стандартный заголовок" }, body: { uz: "Standart matn", ru: "Стандартный текст" } },
  },
  quiz: {
    title: "Test taklifi (burchak kartasi)",
    when: "3-sahifadan keyin, shuncha soniya oʻtib. Testni oʻtgan mijozga chiqmaydi.",
    delayLabel: "Kechikish, soniya",
    textNote: "",
    placeholder: { title: { uz: "Standart sarlavha", ru: "Стандартный заголовок" }, body: { uz: "Standart matn", ru: "Стандартный текст" } },
  },
};

export default async function AdminCommercePage() {
  const [{ settings, meta }, promotions] = await Promise.all([readCommerceSettings(), shopflow.getPromotions("uz").catch(() => [])]);
  const defaults = defaultCommerceSettings();
  const { delivery, ladder, subscription, cart, popups } = settings;
  const lowerPromo = promotions
    .filter((p) => p.type === "free_shipping_over" && p.threshold != null && p.threshold < delivery.freeShippingOver)
    .sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0))[0];
  const effectiveFree = lowerPromo?.threshold ?? delivery.freeShippingOver;
  const env = envCutoff();
  const defaultsNote = (section: CommerceSection, text: string) => (meta[section] ? `Standart: ${text}` : undefined);

  return (
    <>
      <PageHeader
        title="Savdo qoidalari"
        lead="Yetkazish narxi va bepul yetkazish chegarasi, upsell zinapoyasi, obuna chegirmalari, pop-up oynalar va savat takliflari. Savat va server bir xil qiymatlarni oʻqiydi — buyurtma narxi saqlangan qoidalar boʻyicha qayta hisoblanadi. Saqlash saytni darhol yangilaydi, qayta build kerak emas."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card id="delivery" title="Yetkazish" lead="Toshkent boʻylab kuryer narxi va bepul yetkazish chegarasi butun saytda bitta: savat, mahsulot sahifasi, «Yetkazish» sahifasi, SEO matnlari.">
          <CommerceCardForm section="delivery" className={grid}>
            <Field label="Bepul yetkazish, soʻmdan" hint={defaultsNote("delivery", som(defaults.delivery.freeShippingOver)) ?? "0 — har doim bepul"}>
              <input name="freeShippingOver" inputMode="numeric" required defaultValue={delivery.freeShippingOver} className={inputClass} />
            </Field>
            <Field label="Kuryer narxi, soʻm" hint={defaultsNote("delivery", som(defaults.delivery.courierFee)) ?? "Chegaradan past buyurtmaga"}>
              <input name="courierFee" inputMode="numeric" required defaultValue={delivery.courierFee} className={inputClass} />
            </Field>
            <Field label="Bugun yetkazish chegarasi (Toshkent vaqti)" hint={`SS:DD, boʻsh — taymer yoʻq.${env ? ` Deploy standarti: ${env}` : ""}`}>
              <input name="cutoff" defaultValue={delivery.cutoff} placeholder="16:00" pattern="\d{1,2}:\d{2}" className={inputClass} />
            </Field>
            <div className="hidden sm:block" aria-hidden />
            <TextPair name="regionsNote" label="Viloyatlarga muddat" value={delivery.regionsNote} placeholder={{ uz: "1–3 kun", ru: "1–3 дня" }} />
            {lowerPromo && (
              <div className="col-span-full">
                <Notice>
                  «{lowerPromo.title}» aksiyasi faol: bepul yetkazish undan {som(lowerPromo.threshold ?? 0)}dan qoʻllanadi (pastrogʻi yutadi).{" "}
                  <Link href="/admin/promotions" className={linkClass}>Aksiyalar</Link>
                </Notice>
              </div>
            )}
            <Preview>
              {effectiveFree === 0 ? "Yetkazish har doim bepul" : <>«Bepul yetkazish {som(effectiveFree)}dan» · kuryer {som(delivery.courierFee)}</>}
              {delivery.cutoff ? <> · «{delivery.cutoff} gacha buyurtma bering» taymeri</> : " · taymer yoʻq"}
            </Preview>
            <Audit meta={meta.delivery} />
          </CommerceCardForm>
        </Card>

        <Card id="ladder" title="Upsell zinapoyasi" lead="Savatga birinchi mahsulot qoʻshilganda bir-bir taklif qilinadi; savat sahifasida — pullik qadamlar. Server faqat shu foizlarni qabul qiladi.">
          <CommerceCardForm section="ladder" className={grid}>
            <Toggle name="enabled" label="Zinapoya yoqilgan" defaultChecked={ladder.enabled} />
            {(["p1", "p2", "p3"] as const).map((name, i) => (
              <Field key={name} label={i === 2 ? "3-qadam (sovgʻa boʻlmasa), %" : `${i + 1}-qadam, %`} hint={i === 2 ? "Har bir qadam oldingisidan katta" : undefined}>
                <select name={name} defaultValue={ladder.percents[i]} className={inputClass}>
                  {LADDER_PERCENT_CHOICES.map((p) => (
                    <option key={p} value={p}>−{p}%</option>
                  ))}
                </select>
              </Field>
            ))}
            <Toggle
              name="freeGift"
              label="3-qadam — bepul sovgʻa"
              hint="1 dona, oldingi ikki qadam tejaganidan qimmat boʻlmagan mahsulot. Oʻchirilsa 3-qadam doim foizli."
              defaultChecked={ladder.freeGift}
            />
            <Preview>
              {ladder.enabled
                ? <>−{ladder.percents[0]}% → −{ladder.percents[1]}% → {ladder.freeGift ? `bepul sovgʻa yoki −${ladder.percents[2]}%` : `−${ladder.percents[2]}%`}</>
                : "Zinapoya koʻrsatilmaydi"}
            </Preview>
            <Audit meta={meta.ladder} />
          </CommerceCardForm>
        </Card>

        <Card id="subscription" title="Obuna (Subscribe & Save)" lead="Birinchi yetkazishda va keyingilarida chegirma. Mahsulot sahifasi, savat, kabinet va server bir xil foizni oʻqiydi.">
          <CommerceCardForm section="subscription" className={grid}>
            <Field label="Birinchi yetkazish, %" hint={`0–${LIMITS.subscriptionPercent.max}`}>
              <input name="firstPercent" inputMode="numeric" required defaultValue={subscription.firstPercent} className={inputClass} />
            </Field>
            <Field label="Keyingi yetkazishlar, %" hint="Birinchisidan kam emas">
              <input name="recurringPercent" inputMode="numeric" required defaultValue={subscription.recurringPercent} className={inputClass} />
            </Field>
            <Preview>«Obuna: bugun −{subscription.firstPercent}%, keyingi yetkazishlarda −{subscription.recurringPercent}%»</Preview>
            <Audit meta={meta.subscription} />
          </CommerceCardForm>
        </Card>

        <Card id="cart" title="Savat takliflari" lead="Bepul yetkazishgacha oz qolganda savatda shu farqni yolgʻiz yopadigan mahsulotlar koʻrsatiladi.">
          <CommerceCardForm section="cart" className={grid}>
            <Field label="Koʻrsatish chegarasi, soʻm" hint="Bepul yetkazishgacha shuncha yoki kamroq qolsa. 0 — oʻchirilgan">
              <input name="gapWindow" inputMode="numeric" required defaultValue={cart.gapWindow} className={inputClass} />
            </Field>
            <Preview>
              {cart.gapWindow > 0 ? <>Bepul yetkazishgacha {som(cart.gapWindow)} yoki kamroq qolsa — 3 tagacha mos mahsulot</> : "Takliflar koʻrsatilmaydi"}
            </Preview>
            <Audit meta={meta.cart} />
          </CommerceCardForm>
        </Card>
      </div>

      <div className="mt-4">
        <Card id="popups" title="Pop-up'lar" lead="Bir vaqtda bittadan, sessiyada bittadan koʻp emas; savat, buyurtma, test, kabinet va profil sahifalarida chiqmaydi. Yopilgandan keyin «qayta koʻrsatish» kuni oʻtguncha qaytmaydi.">
          <CommerceCardForm section="popups" className="grid gap-6">
            {POPUP_IDS.map((id) => {
              const rule = popups[id];
              const copy = POPUP_COPY[id];
              return (
                <fieldset key={id} className="grid gap-4 rounded-[16px] border border-line p-4 sm:grid-cols-2 sm:p-5">
                  <legend className="px-1 text-[16px] font-bold text-ink">{copy.title}</legend>
                  <div className="col-span-full flex flex-wrap items-center gap-2">
                    <Pill tone={rule.enabled ? "dark" : "muted"}>{rule.enabled ? "Yoqilgan" : "Oʻchirilgan"}</Pill>
                    <span className="text-[13px] text-muted">{copy.when}</span>
                  </div>
                  <Toggle name={`${id}.enabled`} label="Koʻrsatish" defaultChecked={rule.enabled} />
                  <Field label={copy.delayLabel} hint={`Standart: ${defaults.popups[id].delaySeconds}`}>
                    <input name={`${id}.delaySeconds`} inputMode="numeric" required defaultValue={rule.delaySeconds} className={inputClass} />
                  </Field>
                  <Field label="Qayta koʻrsatish, kun" hint={`Standart: ${defaults.popups[id].cooldownDays}`}>
                    <input name={`${id}.cooldownDays`} inputMode="numeric" required defaultValue={rule.cooldownDays} className={inputClass} />
                  </Field>
                  <TextPair name={`${id}.title`} label="Sarlavha" value={rule.title} placeholder={copy.placeholder.title} />
                  <TextPair name={`${id}.body`} label="Matn" value={rule.body} placeholder={copy.placeholder.body} multiline />
                  {copy.textNote && <p className="col-span-full text-[13px] text-muted">{copy.textNote}</p>}
                </fieldset>
              );
            })}
            <Preview>
              {POPUP_IDS.map((id) => `${POPUP_COPY[id].title.split(" (")[0]}: ${popups[id].enabled ? `${popups[id].delaySeconds} s, ${popups[id].cooldownDays} kunda bir` : "oʻchirilgan"}`).join(" · ")}
            </Preview>
            <Audit meta={meta.popups} />
          </CommerceCardForm>
        </Card>
      </div>
    </>
  );
}
