import Link from "next/link";
import { listWaitRequests, waitlistByProduct, waitlistCounts } from "@/lib/admin/waitlist";
import { cancelWaitRequestAction } from "@/app/admin/_actions/stock";
import { WAIT_KINDS, WAIT_STATUSES, type WaitKind, type WaitStatus } from "@/lib/db/schema";
import { Card, ChipNav, EmptyState, Metric, PageHeader, Pill, TableWrap, secondaryButtonClass, smallButtonClass, som, tableClass, tdClass, thClass, timeAgo } from "@/components/admin/ui";
import { NotifyNowButton, PhoneReveal } from "@/components/admin/catalog/WaitlistControls";
import { CatalogTabs } from "@/components/admin/catalog/CatalogTabs";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Kutayotganlar" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<WaitStatus, string> = { waiting: "Kutmoqda", notified: "Xabar berildi", cancelled: "Bekor qilingan" };
const KIND_LABEL: Record<WaitKind, string> = { restock: "Omborga kelishi", price_drop: "Narx tushishi" };
const VIA_LABEL: Record<string, string> = { telegram: "Telegram", sms: "SMS", operator: "operator qoʻngʻirogʻi", manual: "qoʻlda" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** "+998 90 ••• •• 67" — enough to tell two requests apart, not enough to call. */
function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 9) return "•••";
  return d.length === 12 ? `+${d.slice(0, 3)} ${d.slice(3, 5)} ••• •• ${d.slice(-2)}` : `••• •• ${d.slice(-2)}`;
}

export default async function WaitlistPage({ searchParams }: { searchParams: Promise<{ status?: string | string[]; kind?: string | string[] }> }) {
  const params = await searchParams;
  const statusParam = first(params.status) ?? "waiting";
  const status = statusParam === "all" ? undefined : (WAIT_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as WaitStatus) : "waiting";
  const kindParam = first(params.kind);
  const kind = (WAIT_KINDS as readonly string[]).includes(kindParam ?? "") ? (kindParam as WaitKind) : undefined;
  const [counts, byProduct, requests] = await Promise.all([waitlistCounts(), waitlistByProduct(), listWaitRequests({ status, kind })]);

  const href = (next: { status?: string; kind?: string | null }) => {
    const search = new URLSearchParams();
    const s = next.status ?? (status ?? "all");
    if (s !== "waiting") search.set("status", s);
    const k = next.kind === null ? undefined : (next.kind ?? kind);
    if (k) search.set("kind", k);
    const text = search.toString();
    return `/admin/waitlist${text ? `?${text}` : ""}`;
  };
  const exportHref = `/admin/waitlist/export${status || kind ? `?${new URLSearchParams({ ...(status ? { status } : { status: "all" }), ...(kind ? { kind } : {}) })}` : "?status=all"}`;

  return (
    <>
      <CatalogTabs active="waitlist" />
      <PageHeader
        title="Kutayotganlar"
        lead="Mahsulot omborga kelishini yoki narxi tushishini kutayotgan mijozlar. Mahsulot sotuvga qaytganda yoki narxi tushganda xabar avtomatik ketadi: Telegram klubga bogʻlanganlarga — botdan, qolganlar roʻyxati operatorga qoʻngʻiroq uchun."
        actions={<a href={exportHref} className={secondaryButtonClass}>CSV yuklab olish</a>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Omborga kelishini kutmoqda" value={formatNumber(counts.restock)} />
        <Metric label="Narx tushishini kutmoqda" value={formatNumber(counts.priceDrop)} />
        <Metric label="Xabar berildi (30 kun)" value={formatNumber(counts.notified30)} />
        <Metric label="Shundan Telegram orqali" value={formatNumber(counts.telegram30)} hint="qolgani — operator qoʻngʻirogʻi" />
      </div>

      <Card title="Mahsulotlar boʻyicha" lead="«Hozir xabar yuborish» — mahsulot sotuvda boʻlsa omborni kutayotganlarga, narxi kutilgan narxdan past boʻlsa narxni kutayotganlarga yuboradi" className="mb-5">
        {byProduct.length === 0 ? (
          <EmptyState title="Hozir hech kim kutmayapti">Mahsulot sahifasidagi «Xabar ber» va «Narxi tushsa xabar bering» soʻrovlari shu yerda chiqadi.</EmptyState>
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Mahsulot</th>
                  <th className={thClass}>Holati</th>
                  <th className={`${thClass} text-right`}>Omborni kutmoqda</th>
                  <th className={`${thClass} text-right`}>Narxni kutmoqda</th>
                  <th className={thClass}>Oxirgi soʻrov</th>
                  <th className={`${thClass} text-right`}><span className="sr-only">Amal</span></th>
                </tr>
              </thead>
              <tbody>
                {byProduct.map((p) => {
                  const due = (p.inStock && p.restock > 0) || (p.inStock && p.priceDue > 0);
                  return (
                    <tr key={p.id}>
                      <td className={tdClass}>
                        <Link href={`/admin/products/${encodeURIComponent(p.id)}`} className="font-semibold text-ink underline-offset-4 hover:underline">{p.name}</Link>
                        <span className="block text-[13px] text-muted">{som(p.price)}</span>
                      </td>
                      <td className={tdClass}>
                        {p.unlisted ? (
                          <Pill tone="muted">sotuvdan olingan</Pill>
                        ) : p.inStock ? (
                          <Pill tone="neutral">{p.stockQty != null ? `sotuvda · ${p.stockQty} ta` : "sotuvda"}</Pill>
                        ) : (
                          <Pill tone="outline">tugagan</Pill>
                        )}
                      </td>
                      <td className={`${tdClass} text-right font-semibold tabular-nums`}>{p.restock || "—"}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>
                        <span className="font-semibold">{p.priceDrop || "—"}</span>
                        {p.priceDue > 0 && <span className="block text-[13px] text-muted">{p.priceDue} tasi uchun narx tushgan</span>}
                      </td>
                      <td className={`${tdClass} text-ink-2`} title={p.lastAt.toISOString()}>{timeAgo(p.lastAt)}</td>
                      <td className={`${tdClass} text-right`}>
                        <NotifyNowButton productId={p.id} disabled={!due || p.unlisted} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <Card title="Soʻrovlar">
        <div className="mb-4 flex flex-col gap-2">
          <ChipNav
            label="Holat boʻyicha"
            items={[
              ...WAIT_STATUSES.map((s) => ({ href: href({ status: s }), label: STATUS_LABEL[s], active: status === s })),
              { href: href({ status: "all" }), label: "Hammasi", active: !status },
            ]}
          />
          <ChipNav
            label="Turi boʻyicha"
            items={[
              { href: href({ kind: null }), label: "Barcha turlar", active: !kind },
              ...WAIT_KINDS.map((k) => ({ href: href({ kind: k }), label: KIND_LABEL[k], active: kind === k })),
            ]}
          />
        </div>
        {requests.length === 0 ? (
          <EmptyState title="Soʻrov yoʻq" />
        ) : (
          <TableWrap>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Qachon</th>
                  <th className={thClass}>Mahsulot</th>
                  <th className={thClass}>Turi</th>
                  <th className={thClass}>Telefon</th>
                  <th className={thClass}>Holat</th>
                  <th className={`${thClass} text-right`}><span className="sr-only">Amal</span></th>
                </tr>
              </thead>
              <tbody>
                {requests.map(({ r, name }) => (
                  <tr key={r.id}>
                    <td className={`${tdClass} text-ink-2`} title={r.createdAt.toISOString()}>{timeAgo(r.createdAt)}</td>
                    <td className={tdClass}>
                      <Link href={`/admin/products/${encodeURIComponent(r.productId)}`} className="font-semibold text-ink underline-offset-4 hover:underline">{name || r.productSlug}</Link>
                    </td>
                    <td className={tdClass}>
                      {KIND_LABEL[r.kind]}
                      {r.kind === "price_drop" && r.targetPrice != null && <span className="block text-[13px] text-muted">{som(r.targetPrice)} dan arzon</span>}
                    </td>
                    <td className={tdClass}>
                      <PhoneReveal masked={maskPhone(r.phone)} full={r.phone} />
                      <span className="block text-[13px] text-muted">{r.locale}{r.telegramChatId ? " · Telegram klubda" : ""}</span>
                    </td>
                    <td className={tdClass}>
                      <Pill tone={r.status === "waiting" ? "dark" : r.status === "notified" ? "neutral" : "muted"}>{STATUS_LABEL[r.status]}</Pill>
                      {r.notifiedAt && (
                        <span className="mt-1 block text-[13px] text-muted">
                          {r.notifiedVia ? VIA_LABEL[r.notifiedVia] : ""} · {timeAgo(r.notifiedAt)}
                        </span>
                      )}
                    </td>
                    <td className={`${tdClass} text-right`}>
                      {r.status === "waiting" && (
                        <form action={cancelWaitRequestAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" className={smallButtonClass}>Bekor qilish</button>
                        </form>
                      )}
                    </td>
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
