import { requireAdmin } from "@/lib/admin/session";
import { segmentById, segmentMembers } from "@/lib/admin/segments";
import { segmentCsv, type ExportFormat } from "@/lib/admin/segment-export";

export const dynamic = "force-dynamic";

const FORMATS: ExportFormat[] = ["crm", "meta", "google"];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const segment = segmentById(id);
  if (!segment) return new Response("Not found", { status: 404 });
  const format = (new URL(req.url).searchParams.get("format") ?? "crm") as ExportFormat;
  if (!FORMATS.includes(format)) return new Response("Bad format", { status: 400 });
  const csv = segmentCsv(await segmentMembers(segment, 50_000), format);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="govita-${segment.id}-${format}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
