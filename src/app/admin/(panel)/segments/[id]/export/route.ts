import { requireAdmin } from "@/lib/admin/session";
import { auditLog } from "@/lib/admin/audit";
import { segmentById, segmentMembers } from "@/lib/admin/segments";
import { segmentCsv, type ExportFormat } from "@/lib/admin/segment-export";
import { optedOutPhones } from "@/lib/messaging/optout";
import { t } from "@/lib/admin/i18n/server";

export const dynamic = "force-dynamic";

const FORMATS: ExportFormat[] = ["crm", "meta", "google"];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin("marketing");
  // Bulk personal data leaving the panel: always in the audit log.
  await auditLog(admin, "export.segment");
  const { id } = await params;
  const segment = segmentById(id);
  if (!segment) return new Response("Not found", { status: 404 });
  const format = (new URL(req.url).searchParams.get("format") ?? "crm") as ExportFormat;
  if (!FORMATS.includes(format)) return new Response("Bad format", { status: 400 });
  const [members, optedOut] = await Promise.all([segmentMembers(segment, 50_000), optedOutPhones()]);
  const csv = segmentCsv(members, format, optedOut, (uz) => t(uz));
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="govita-${segment.id}-${format}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
