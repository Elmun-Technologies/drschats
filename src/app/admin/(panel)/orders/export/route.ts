import { requireAdmin } from "@/lib/admin/session";
import { ORDER_PERIODS, listOrders, periodStart, type OrderPeriod } from "@/lib/admin/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";
import { DELIVERY_LABEL, STATUS_LABEL, formatDateTime } from "@/lib/admin/order-labels";
import { describeAttribution } from "@/lib/analytics/attribution";
import { csvResponse, toCsv } from "@/lib/admin/csv";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await requireAdmin();
  const params = new URL(req.url).searchParams;
  const status = params.get("status");
  const period = params.get("period") ?? "all";
  const rows = await listOrders({
    status: (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? (status as OrderStatus) : undefined,
    q: params.get("q") ?? undefined,
    from: period in ORDER_PERIODS ? periodStart(period as OrderPeriod) : undefined,
    limit: 20_000,
  });
  return csvResponse(
    toCsv([
      ["Raqam", "Sana", "Holat", "Ism", "Telefon", "Email", "Hudud", "Manzil", "Usul", "Mahsulotlar", "Dona", "Chegirma", "Yetkazish", "Jami", "Manba"],
      ...rows.map((o) => [
        o.number,
        formatDateTime(o.createdAt),
        STATUS_LABEL[o.status],
        o.customer.name,
        o.customer.phone,
        o.customer.email ?? "",
        o.delivery.region,
        o.delivery.address,
        DELIVERY_LABEL[o.delivery.method] ?? o.delivery.method,
        o.items.map((i) => `${i.name} × ${i.quantity}`).join("; "),
        o.items.reduce((sum, i) => sum + i.quantity, 0),
        o.totals.discount,
        o.totals.shipping,
        o.total,
        describeAttribution(o.attribution ?? undefined) || "Bevosita",
      ]),
    ]),
    "govita-buyurtmalar",
  );
}
