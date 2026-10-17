import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { banners } from "@/lib/db/schema";
import { deleteBanner, toggleBanner } from "@/app/admin/_actions/storefront";
import { PLACEMENT_LABEL, SCHEDULE_LABEL, scheduleStatus, type ScheduleStatus } from "@/lib/merch/model";
import { formatDateTime } from "@/lib/admin/order-labels";
import { StorefrontTabs } from "@/components/admin/storefront/StorefrontTabs";
import { Card, EmptyState, Notice, PageHeader, Pill, TableWrap, buttonClass, linkClass, smallButtonClass, tableClass, tdClass, thClass, type PillTone } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Vitrina" };

const TONE: Record<ScheduleStatus, PillTone> = { live: "dark", scheduled: "outline", ended: "muted", off: "muted" };
const isLocal = (src: string) => src.startsWith("/") && !src.startsWith("//");

export default async function StorefrontBannersPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const params = await searchParams;
  const rows = await getDb().select().from(banners).orderBy(asc(banners.placement), asc(banners.sort), asc(banners.id));
  const now = Date.now();
  const liveHero = rows.some((b) => b.placement === "hero" && scheduleStatus(b, now) === "live");

  return (
    <>
      <PageHeader
        title="Vitrina"
        lead="Saytda nima koʻrinishini shu yerdan boshqarasiz: bannerlar, eʼlon qatori va bugungi taklif. Saqlash bilan sayt darhol yangilanadi; rejalashtirilgan banner oʻz vaqtida oʻzi chiqadi va tugaganda oʻzi yoʻqoladi."
        actions={<Link href="/admin/storefront/banners/new" className={buttonClass}>+ Yangi banner</Link>}
      />
      <StorefrontTabs active="banners" />
      {params.saved && <div className="mb-4"><Notice tone="ok">Banner saqlandi.</Notice></div>}
      {params.deleted && <div className="mb-4"><Notice tone="ok">Banner oʻchirildi.</Notice></div>}
      {!liveHero && (
        <div className="mb-4">
          <Notice>Hozir faol slayder banneri yoʻq — bosh sahifada oʻrnatilgan slaydlar (ImmunoVit, Vitamin C, Prenatal Forte) koʻrinadi. Bosh sahifa hech qachon boʻsh qolmaydi.</Notice>
        </div>
      )}

      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Hali banner yoʻq" action={<Link href="/admin/storefront/banners/new" className={buttonClass}>Birinchi bannerni yaratish</Link>}>
            Bosh sahifa slayderi, header ostidagi ingichka qator yoki katalog sahifalari uchun banner qoʻshing. Muddat va taymerni ham shu yerda belgilaysiz.
          </EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Banner</th>
                  <th className={thClass}>Joyi</th>
                  <th className={thClass}>Muddat (Toshkent)</th>
                  <th className={thClass}>Holat</th>
                  <th className={`${thClass} text-right`}>Bosishlar</th>
                  <th className={thClass}><span className="sr-only">Amallar</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const status = scheduleStatus(b, now);
                  return (
                    <tr key={b.id}>
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <span className={`relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[12px] ${b.theme === "dark" ? "bg-dark-panel" : "bg-tile"}`}>
                            {b.image ? (
                              <Image src={b.image} alt="" fill sizes="56px" unoptimized={!isLocal(b.image)} className="object-contain p-1.5" />
                            ) : (
                              <span className={`text-[12px] ${b.theme === "dark" ? "text-on-dark-2" : "text-muted"}`}>Rasmsiz</span>
                            )}
                          </span>
                          <span className="min-w-0">
                            <Link href={`/admin/storefront/banners/${b.id}`} className={linkClass}>{b.title.uz}</Link>
                            <span className="block truncate text-[13px] text-muted">{b.href}</span>
                          </span>
                        </div>
                      </td>
                      <td className={`${tdClass} text-ink-2`}>{PLACEMENT_LABEL[b.placement]}</td>
                      <td className={`${tdClass} whitespace-nowrap text-[13px] text-ink-2`}>
                        {b.startsAt ? formatDateTime(b.startsAt) : "darhol"} — {b.endsAt ? formatDateTime(b.endsAt) : "muddatsiz"}
                        {b.showCountdown && <span className="block text-muted">taymer bilan</span>}
                      </td>
                      <td className={tdClass}><Pill tone={TONE[status]}>{SCHEDULE_LABEL[status]}</Pill></td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(b.clicks)}</td>
                      <td className={tdClass}>
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/storefront/banners/${b.id}`} className={smallButtonClass}>Tahrirlash</Link>
                          <form action={toggleBanner}>
                            <input type="hidden" name="id" value={b.id} />
                            <button type="submit" className={smallButtonClass}>{b.active ? "Oʻchirish" : "Yoqish"}</button>
                          </form>
                          <form action={deleteBanner}>
                            <input type="hidden" name="id" value={b.id} />
                            <button type="submit" aria-label={`«${b.title.uz}» bannerini oʻchirib tashlash`} className="inline-flex h-11 items-center rounded-[12px] px-3 text-[14px] font-semibold text-red hover:bg-tile">
                              Oʻchirib tashlash
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
