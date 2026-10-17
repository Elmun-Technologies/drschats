import Link from "next/link";
import { customerLoyalty } from "@/lib/loyalty/server";
import { existingReferralCode } from "@/lib/referral/server";
import { birthdayOf } from "@/lib/birthday/server";
import { adjustCustomerPoints } from "@/app/admin/_actions/loyalty";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Field, Pill, inputClass, linkClass } from "@/components/admin/ui";
import { formatDate, formatDateTime } from "@/lib/admin/order-labels";
import type { LedgerKind } from "@/lib/db/schema";
import { formatNumber } from "@/lib/utils";

const KIND_LABEL: Record<LedgerKind, string> = {
  earn: "Keshbek",
  redeem: "Ishlatildi",
  expire: "Muddati tugadi",
  adjust: "Qoʻlda / tavsiya",
  reverse: "Bekor qilish",
};

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];

/* The customer page's points card: balance, what expires soon, the ledger, a manual correction (note required). */
export async function CustomerLoyalty({ phone9 }: { phone9: string }) {
  const [{ state, entries }, code, birthday] = await Promise.all([customerLoyalty(phone9), existingReferralCode(phone9), birthdayOf(phone9)]);
  const soon = state.expiringSoon.reduce((s, e) => s + e.amount, 0);
  return (
    <Card title="Sodiqlik" lead="Ballar (1 ball = 1 soʻm), tavsiya kodi va tugʻilgan kun roziligi." actions={<Link href="/admin/loyalty" className={linkClass}>Sozlamalar</Link>}>
      <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="text-[13px] text-muted">Balans</p>
          <p className="text-[26px] font-bold tabular-nums">{formatNumber(state.balance)} ball</p>
        </div>
        {soon > 0 && (
          <p className="text-[13px] text-ink-2">
            30 kunda tugaydi: <b className="tabular-nums">{formatNumber(soon)}</b> ({formatDate(state.expiringSoon[0].at)} dan)
          </p>
        )}
      </div>
      <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]">
        <dt className="text-muted">Tavsiya kodi</dt>
        <dd className="font-semibold">{code ?? <span className="font-normal text-muted">birinchi yetkazilgan buyurtmadan keyin</span>}</dd>
        <dt className="text-muted">Tugʻilgan kun</dt>
        <dd>
          {birthday ? (
            <>
              {birthday.day} {MONTHS[birthday.month - 1]}
              {birthday.year ? ` ${birthday.year}` : ""} <span className="text-muted">· rozilik {formatDate(birthday.consentAt)}</span>
            </>
          ) : (
            <span className="text-muted">rozilik yoʻq</span>
          )}
        </dd>
      </dl>

      {entries.length > 0 ? (
        <ul className="mb-4 flex max-h-[320px] flex-col divide-y divide-line overflow-y-auto">
          {entries.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 py-2.5 text-[14px]">
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <Pill tone={e.delta > 0 ? "dark" : "muted"}>{KIND_LABEL[e.kind]}</Pill>
                  {e.orderNumber && <Link href={`/admin/orders/${e.orderNumber}`} className={linkClass}>{e.orderNumber}</Link>}
                </span>
                <span className="mt-1 block text-[13px] text-muted">
                  {formatDateTime(e.createdAt)}
                  {e.note ? ` · ${e.note}` : ""}
                  {e.adminName ? ` · ${e.adminName}` : ""}
                  {e.expiresAt && e.delta > 0 ? ` · ${formatDate(e.expiresAt)} gacha` : ""}
                </span>
              </span>
              <span className={`shrink-0 font-semibold tabular-nums ${e.delta > 0 ? "text-ink" : "text-ink-2"}`}>
                {e.delta > 0 ? "+" : "−"}
                {formatNumber(Math.abs(e.delta))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-[14px] text-muted">Hali ball harakati yoʻq.</p>
      )}

      <ActionForm action={adjustCustomerPoints} submitLabel="Balansni tuzatish" className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
        <input type="hidden" name="phone9" value={phone9} />
        <Field label="Ball" hint="Manfiy — ayirish">
          <input name="delta" inputMode="numeric" required placeholder="5000" className={inputClass} />
        </Field>
        <Field label="Izoh (majburiy)">
          <input name="note" required minLength={3} maxLength={300} placeholder="Masalan: kechikkan yetkazish uchun" className={inputClass} />
        </Field>
      </ActionForm>
    </Card>
  );
}
