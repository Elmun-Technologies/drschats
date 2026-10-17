import Link from "next/link";
import { notFound } from "next/navigation";
import { STAGE_LABEL, STAGE_ORDER, stageRank } from "@/lib/journey/model";
import { getVisitor } from "@/lib/admin/crm";
import { Timeline } from "@/components/admin/Timeline";
import { DEVICE_LABEL } from "@/lib/admin/event-labels";
import { STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/order-labels";
import { Card, Metric, PageHeader, Pill, linkClass, secondaryButtonClass, som, timeAgo } from "@/components/admin/ui";
import { cn, formatNumber } from "@/lib/utils";

export const metadata = { title: "Tashrif buyuruvchi" };

export default async function AdminVisitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getVisitor(id);
  if (!data) notFound();
  const { visitor: v, events, orders, otherDevices } = data;
  const title = v.name ?? (v.phone9 ? `+998 ${v.phone9}` : `Mehmon ${v.id.slice(0, 6)}`);
  const touch = v.firstTouch;

  return (
    <>
      <PageHeader
        eyebrow="Mijozlar yoʻli"
        title={title}
        lead={`Birinchi marta ${formatDateTime(v.firstSeenAt)} · oxirgi faollik ${timeAgo(v.lastSeenAt)}`}
        actions={<>
          {v.phone9 && <Link href={`/admin/customers/${v.phone9}`} className={secondaryButtonClass}>Mijoz profili</Link>}
          <Link href="/admin/visitors" className={secondaryButtonClass}>← Roʻyxat</Link>
        </>}
      />

      <ol aria-label="Bosqichlar" className="mb-5 grid grid-cols-5 gap-1.5">
        {STAGE_ORDER.map((stage) => {
          const reached = stageRank(stage) <= stageRank(v.stage);
          return (
            <li key={stage} className={cn("rounded-[12px] px-1.5 py-2.5 text-center text-[12px] font-semibold leading-4 [overflow-wrap:anywhere] sm:px-2 sm:text-[13px]", reached ? "bg-ink text-white" : "bg-tile text-muted")}>
              {STAGE_LABEL[stage]}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Tashriflar" value={formatNumber(v.sessions)} hint={`${formatNumber(v.pageViews)} sahifa`} />
        <Metric label="Buyurtmalar" value={formatNumber(orders.length)} hint={v.lastOrderAt ? `oxirgisi ${timeAgo(v.lastOrderAt)}` : "hali yoʻq"} />
        <Metric label="Savatda hozir" value={v.cartValue > 0 ? som(v.cartValue) : "—"} hint={v.cartAt ? timeAgo(v.cartAt) : undefined} />
        <Metric label="Qurilma" value={v.device ? DEVICE_LABEL[v.device] : "—"} hint={v.locale ? `til: ${v.locale}` : undefined} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title="Harakatlar tarixi" lead="Har bir tashrif alohida, eng yangisi tepada">
          <Timeline events={events} />
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="Qayerdan keldi">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]">
              <dt className="text-muted">Kanal</dt><dd className="font-semibold">{v.channel}</dd>
              {touch?.source && <><dt className="text-muted">utm_source</dt><dd>{touch.source}</dd></>}
              {touch?.medium && <><dt className="text-muted">utm_medium</dt><dd>{touch.medium}</dd></>}
              {touch?.campaign && <><dt className="text-muted">Kampaniya</dt><dd>{touch.campaign}</dd></>}
              {touch?.referrer && <><dt className="text-muted">Havola</dt><dd>{touch.referrer}</dd></>}
              {touch?.clickId && <><dt className="text-muted">Reklama ID</dt><dd className="truncate">{touch.clickId.split(":")[0]}</dd></>}
              {touch?.landing && <><dt className="text-muted">Kirish sahifasi</dt><dd className="break-all">{touch.landing}</dd></>}
            </dl>
          </Card>
          {v.cartItems.length > 0 && (
            <Card title="Savatdagi mahsulotlar" lead={v.cartAt ? `Yangilangan: ${formatDateTime(v.cartAt)}` : undefined}>
              <ul className="divide-y divide-line">
                {v.cartItems.map((item) => (
                  <li key={item.slug} className="flex justify-between gap-3 py-2.5 text-[14px]">
                    <span className="min-w-0 truncate">{item.name} <span className="text-muted">× {item.quantity}</span></span>
                    <span className="shrink-0 font-semibold tabular-nums">{som(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title="Buyurtmalar">
            {orders.length === 0 ? (
              <p className="text-[14px] text-muted">Hali buyurtma bermagan.</p>
            ) : (
              <ul className="divide-y divide-line">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span><Link href={`/admin/orders/${o.number}`} className={linkClass}>{o.number}</Link><span className="block text-[13px] text-muted">{formatDateTime(o.createdAt)}</span></span>
                    <span className="flex items-center gap-2"><Pill tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Pill><b className="tabular-nums">{som(o.total)}</b></span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {otherDevices.length > 0 && (
            <Card title="Shu mijozning boshqa qurilmalari">
              <ul className="flex flex-col gap-2 text-[14px]">
                {otherDevices.map((d) => (
                  <li key={d.id}><Link href={`/admin/visitors/${d.id}`} className={linkClass}>{d.device ? DEVICE_LABEL[d.device] : "Qurilma"}</Link> <span className="text-muted">· {timeAgo(d.lastSeenAt)}</span></li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
