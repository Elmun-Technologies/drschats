import Link from "next/link";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { readLoyaltyRules, smsAvailable } from "@/lib/loyalty/settings";
import { loyaltyStats } from "@/lib/loyalty/server";
import { referralRewardKind, RULE_LIMITS } from "@/lib/loyalty/model";
import { referralStats } from "@/lib/referral/server";
import { birthdayStats } from "@/lib/birthday/server";
import { saveBirthdayRules, saveCashbackRules, saveReferralRules } from "@/app/admin/_actions/loyalty";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, EmptyState, Field, Metric, Notice, PageHeader, Pill, SectionTitle, TableWrap, inputClass, linkClass, som, somShort, tableClass, tdClass, thClass } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Sodiqlik" };

const L = RULE_LIMITS;

function Toggle({ name, defaultChecked, children }: { name: string; defaultChecked: boolean; children: React.ReactNode }) {
  return (
    <label className="col-span-full flex min-h-12 items-center gap-3 text-[15px] font-semibold text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-5 accent-ink" />
      {children}
    </label>
  );
}

async function birthdayFlow(): Promise<{ id: string; active: boolean } | null> {
  try {
    const [row] = (await getDb().execute(sql`select id, active from flows where trigger = 'birthday' order by id limit 1`)) as unknown as { id: string; active: boolean }[];
    return row ?? null;
  } catch {
    return null;
  }
}

export default async function AdminLoyaltyPage() {
  const [rules, stats, referral, birthdays, sms, flow] = await Promise.all([
    readLoyaltyRules(),
    loyaltyStats(),
    referralStats(),
    birthdayStats(),
    smsAvailable(),
    birthdayFlow(),
  ]);
  const rewardKind = referralRewardKind(rules);

  return (
    <>
      <PageHeader
        eyebrow="Marketing"
        title="Sodiqlik"
        lead="Keshbek ballari, doʻstni taklif qilish va tugʻilgan kun sovgʻasi. Hammasi sukut boʻyicha oʻchiq; yoqilganda savat, buyurtma, Telegram xabari va /loyalty sahifasi shu raqamlarni oʻqiydi."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Hozirgi majburiyat" value={somShort(stats.outstanding)} hint={`${formatNumber(stats.holders)} mijozda ball bor`} />
        <Metric label="Berilgan ball" value={somShort(stats.issued)} hint={`30 kunda: ${som(stats.issued30)}`} />
        <Metric label="Ishlatilgan ball" value={somShort(stats.redeemed)} hint={`30 kunda: ${som(stats.redeemed30)} · ${formatNumber(stats.ordersWithPoints30)} ta buyurtma`} />
        <Metric label="Muddati tugagan" value={somShort(stats.expired)} hint={stats.reversed ? `bekor qilish: ${som(stats.reversed)}` : "bekor qilishsiz"} />
      </div>

      {rules.enabled && !sms && (
        <div className="mb-4">
          <Notice>
            SMS sozlanmagan — ballarni ishlatish savatda koʻrinmaydi (telefon egasini SMS kod bilan tasdiqlab boʻlmaydi). Ball yigʻilishi davom etadi.{" "}
            <Link href="/admin/integrations" className={linkClass}>SMS ni sozlash</Link>
          </Notice>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card
          title="Keshbek ballari"
          lead="Buyurtma «Yetkazildi» boʻlganda toʻlangan mahsulot summasidan (chegirma va ballardan keyin, yetkazishsiz) foiz ball beriladi — bir buyurtmaga bir marta. Bekor qilinsa ball qaytarib olinadi, ishlatilgan ball mijozga qaytariladi."
        >
          <ActionForm action={saveCashbackRules} className="grid gap-4 sm:grid-cols-2">
            <Toggle name="enabled" defaultChecked={rules.enabled}>Keshbek yoqilgan</Toggle>
            <Field label="Keshbek, %" hint={`${L.earnPercent[0]}–${L.earnPercent[1]}`}>
              <input name="earnPercent" inputMode="numeric" required defaultValue={rules.earnPercent} className={inputClass} />
            </Field>
            <Field label="Minimal buyurtma, soʻm" hint="0 — har qanday buyurtma">
              <input name="minOrder" inputMode="numeric" required defaultValue={rules.minOrder} className={inputClass} />
            </Field>
            <Field label="Ball bilan toʻlash, % gacha" hint="Chegirmalardan keyingi mahsulot summasidan">
              <input name="maxSharePercent" inputMode="numeric" required defaultValue={rules.maxSharePercent} className={inputClass} />
            </Field>
            <Field label="Amal qilish muddati, kun" hint="0 — muddatsiz">
              <input name="expiryDays" inputMode="numeric" required defaultValue={rules.expiryDays} className={inputClass} />
            </Field>
          </ActionForm>
        </Card>

        <Card
          id="referral"
          title="Doʻstni taklif qilish"
          lead="Yetkazilgan buyurtmasi bor mijoz GV + 6 belgili kod oladi (muvaffaqiyat sahifasi va Telegram). Doʻsti uni savatdagi promokod maydoniga yozsa — birinchi buyurtmasiga chegirma; buyurtma yetkazilganda taklif qilganga mukofot. Oʻz kodini ishlatib boʻlmaydi."
        >
          <ActionForm action={saveReferralRules} className="grid gap-4 sm:grid-cols-2">
            <Toggle name="enabled" defaultChecked={rules.referral.enabled}>Taklif dasturi yoqilgan</Toggle>
            <Field label="Doʻst chegirmasi, %" hint="Faqat birinchi buyurtmaga">
              <input name="friendPercent" inputMode="numeric" required defaultValue={rules.referral.friendPercent} className={inputClass} />
            </Field>
            <Field label="Mukofot turi" hint={rules.enabled ? undefined : "Keshbek oʻchiq — ball oʻrniga promokod beriladi"}>
              <select name="reward" defaultValue={rules.referral.reward} className={inputClass}>
                <option value="points">Ball</option>
                <option value="promo">Shaxsiy promokod</option>
              </select>
            </Field>
            <Field label="Mukofot, ball">
              <input name="rewardPoints" inputMode="numeric" required defaultValue={rules.referral.rewardPoints} className={inputClass} />
            </Field>
            <Field label="Mukofot promokod, %" hint="60 kun amal qiladi">
              <input name="rewardPercent" inputMode="numeric" required defaultValue={rules.referral.rewardPercent} className={inputClass} />
            </Field>
            <Field label="Oyiga mukofot, ta gacha" hint="Bir taklif qiluvchiga">
              <input name="monthlyCap" inputMode="numeric" required defaultValue={rules.referral.monthlyCap} className={inputClass} />
            </Field>
          </ActionForm>
          <p className="mt-3 text-[13px] text-muted">
            Hozir mukofot: <b className="text-ink">{rewardKind === "points" ? `${formatNumber(rules.referral.rewardPoints)} ball` : `−${rules.referral.rewardPercent}% promokod`}</b>
          </p>
        </Card>

        <Card
          title="Tugʻilgan kun sovgʻasi"
          lead="Yoqilsa /profile sahifasida aniq rozilik bilan «Tugʻilgan kunimda sovgʻa olishni xohlayman» chiqadi (ism, kun/oy, telefon). Tabrik «Avtomatlashtirish» boʻlimidagi «Tugʻilgan kun» oqimi orqali, yiliga bir marta, faqat avval buyurtma bergan raqamlarga ketadi."
        >
          <ActionForm action={saveBirthdayRules} className="grid gap-4 sm:grid-cols-2">
            <Toggle name="enabled" defaultChecked={rules.birthday.enabled}>Profilda rozilik formasi koʻrinadi</Toggle>
            <Field label="Necha kun oldin" hint={`${L.daysBefore[0]}–${L.daysBefore[1]}`}>
              <input name="daysBefore" inputMode="numeric" required defaultValue={rules.birthday.daysBefore} className={inputClass} />
            </Field>
          </ActionForm>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[14px]">
            <span>Rozilik bergan: <b className="tabular-nums">{formatNumber(birthdays.total)}</b></span>
            <span className="text-muted">·</span>
            <span>30 kunda tugʻilgan kun: <b className="tabular-nums">{formatNumber(birthdays.next30)}</b></span>
            <span className="text-muted">·</span>
            {flow ? (
              <Link href={`/admin/flows/${flow.id}`} className={linkClass}>
                Oqim: <Pill tone={flow.active ? "dark" : "muted"}>{flow.active ? "yoqilgan" : "oʻchiq"}</Pill>
              </Link>
            ) : (
              <span className="text-muted">Oqim server ishga tushganda yaratiladi</span>
            )}
          </div>
        </Card>
      </div>

      <SectionTitle>Tavsiyalar</SectionTitle>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Kodi bor mijozlar" value={formatNumber(referral.codes)} />
        <Metric label="Doʻst buyurtmalari" value={formatNumber(referral.referrals - referral.cancelled)} hint={`${formatNumber(referral.pending)} ta yetkazilishi kutilmoqda`} />
        <Metric label="Mukofot berildi" value={formatNumber(referral.rewarded)} hint={referral.capped ? `${formatNumber(referral.capped)} ta oylik limitdan oshgan` : "limitga yetmagan"} />
        <Metric label="Doʻstlar tushumi" value={somShort(referral.revenue)} hint={`chegirma: ${som(referral.discount)}`} />
      </div>
      <Card title="Eng faol taklif qiluvchilar">
        {referral.top.length === 0 ? (
          <EmptyState title="Hali tavsiya yoʻq">Kod birinchi yetkazilgan buyurtmadan keyin beriladi; doʻst uni savatdagi promokod maydoniga yozadi.</EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Mijoz</th>
                  <th className={thClass}>Kod</th>
                  <th className={`${thClass} text-right`}>Doʻstlar</th>
                  <th className={`${thClass} text-right`}>Mukofot</th>
                  <th className={`${thClass} text-right`}>Tushum</th>
                </tr>
              </thead>
              <tbody>
                {referral.top.map((r) => (
                  <tr key={r.code}>
                    <td className={tdClass}>
                      <Link href={`/admin/customers/${r.phone9}`} className={linkClass}>{r.name || `+998 ${r.phone9}`}</Link>
                    </td>
                    <td className={`${tdClass} font-semibold tracking-wide`}>{r.code}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(r.referrals)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(r.rewarded)}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{som(r.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
