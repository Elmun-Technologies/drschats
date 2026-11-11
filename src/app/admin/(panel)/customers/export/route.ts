import { requireAdmin } from "@/lib/admin/session";
import { auditLog } from "@/lib/admin/audit";
import { customerLifecycle, listCustomers } from "@/lib/admin/customers";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { formatDateTime } from "@/lib/admin/order-labels";
import { t } from "@/lib/admin/i18n/server";

export const dynamic = "force-dynamic";

const LABEL = { new: "Yangi", repeat: "Qayta xarid", vip: "VIP", dormant: "Faolligi pasaygan" } as const;

export async function GET() {
  const admin = await requireAdmin("marketing");
  // Bulk personal data leaving the panel: always in the audit log.
  await auditLog(admin, "export.customers");
  const rows = await listCustomers(undefined, 50_000);
  return csvResponse(
    toCsv([
      [t("Ism"), t("Telefon"), t("Email"), t("Bosqich"), t("Buyurtmalar"), t("Jami xarid (soʻm)"), t("Oxirgi buyurtma")],
      ...rows.map((c) => [c.name, c.phone, c.email ?? "", t(LABEL[customerLifecycle(c)]), c.successfulOrderCount, c.lifetimeValue, formatDateTime(c.lastOrderAt)]),
    ]),
    "govita-mijozlar",
  );
}
