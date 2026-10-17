import { requireAdmin } from "@/lib/admin/session";
import { customerLifecycle, listCustomers } from "@/lib/admin/customers";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { formatDateTime } from "@/lib/admin/order-labels";

export const dynamic = "force-dynamic";

const LABEL = { new: "Yangi", repeat: "Qayta xarid", vip: "VIP", dormant: "Faolligi pasaygan" } as const;

export async function GET() {
  await requireAdmin();
  const rows = await listCustomers(undefined, 50_000);
  return csvResponse(
    toCsv([
      ["Ism", "Telefon", "Email", "Bosqich", "Buyurtmalar", "Jami xarid (soʻm)", "Oxirgi buyurtma"],
      ...rows.map((c) => [c.name, c.phone, c.email ?? "", LABEL[customerLifecycle(c)], c.successfulOrderCount, c.lifetimeValue, formatDateTime(c.lastOrderAt)]),
    ]),
    "govita-mijozlar",
  );
}
