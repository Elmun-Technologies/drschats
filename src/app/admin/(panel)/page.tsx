import Link from "next/link";
import { catalogCounts, importBuiltInCatalog } from "@/app/admin/_actions/catalog";
import { listOrders, orderStats } from "@/lib/admin/queries";
import { STATUS_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { isStorageConfigured } from "@/lib/admin/storage";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, PageHeader, Pill } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Bosh sahifa" };

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <>
      <span className="text-sm text-muted">{label}</span>
      <span className="text-[28px] font-bold leading-9">{value}</span>
    </>
  );
  return href ? (
    <Link href={href} className="flex flex-col gap-1 rounded-[20px] bg-bg p-5 hover:bg-bg/80">{body}</Link>
  ) : (
    <div className="flex flex-col gap-1 rounded-[20px] bg-bg p-5">{body}</div>
  );
}

export default async function AdminDashboard() {
  const [stats, counts, recent] = await Promise.all([orderStats(), catalogCounts(), listOrders({ limit: 8 })]);

  return (
    <>
      <PageHeader title="Bosh sahifa" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Bugungi buyurtmalar" value={String(stats.today)} href="/admin/orders" />
        <Stat label="Ochiq buyurtmalar" value={String(stats.open)} href="/admin/orders?status=new" />
        <Stat label="7 kunlik buyurtmalar" value={String(stats.week)} />
        <Stat label="7 kunlik tushum" value={`${formatNumber(stats.weekRevenue)} soʻm`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card title="Oxirgi buyurtmalar" actions={<Link href="/admin/orders" className="text-[15px] font-semibold underline">Hammasi</Link>}>
          {recent.length === 0 ? (
            <p className="text-[15px] text-ink-2">Hali buyurtma yoʻq. Saytdagi har bir buyurtma shu yerga tushadi.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.number}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 hover:bg-tile/60">
                    <span className="font-semibold">{o.number}</span>
                    <span className="min-w-0 flex-1 truncate text-[15px]">{o.customer.name}</span>
                    <span className="text-[13px] text-muted">{formatDateTime(o.createdAt)}</span>
                    <Pill tone={o.status === "new" ? "dark" : "neutral"}>{STATUS_LABEL[o.status]}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Katalog">
            <dl className="grid grid-cols-2 gap-2 text-[15px]">
              <dt className="text-ink-2">Mahsulotlar</dt><dd className="text-right font-semibold">{counts.products}</dd>
              <dt className="text-ink-2">Yashirin / tugagan</dt><dd className="text-right font-semibold">{counts.hidden}</dd>
              <dt className="text-ink-2">Kategoriyalar</dt><dd className="text-right font-semibold">{counts.categories}</dd>
              <dt className="text-ink-2">Brendlar</dt><dd className="text-right font-semibold">{counts.brands}</dd>
            </dl>
            {counts.products === 0 && (
              <p className="mt-3 text-[13px] text-muted">Baza boʻsh — sayt hozir oʻrnatilgan katalogni koʻrsatyapti. Import qilgach, katalog shu paneldan boshqariladi.</p>
            )}
          </Card>
          <Card title="Oʻrnatilgan katalogni import qilish">
            <p className="mb-3 text-[13px] text-muted">Saytdagi mavjud mahsulot, kategoriya va brendlarni bazaga koʻchiradi. Takror bosish xavfsiz — bor yozuvlar oʻzgarmaydi.</p>
            <ActionForm action={importBuiltInCatalog} submitLabel="Import qilish" className="flex flex-col gap-3">
              <span />
            </ActionForm>
          </Card>
          {!isStorageConfigured && (
            <Card title="Rasm saqlash">
              <p className="text-[13px] text-muted">Tigris sozlanmagan — rasmlar URL orqali kiritiladi. Sozlash: docs/ADMIN.md.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
