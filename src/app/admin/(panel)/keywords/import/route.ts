import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/session";
import { auditLog } from "@/lib/admin/audit";
import { decodePlannerFile, parsePlannerExport } from "@/lib/keywords/planner-import";
import { importPlannerFile } from "@/lib/keywords/store";

export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024;

/*
  The Keyword Planner export upload. A route rather than a server action:
  a year of monthly columns for a few thousand keywords is several MB of
  UTF-16, beyond what server actions accept.
*/
export async function POST(request: Request) {
  const admin = await requireAdmin("analytics");
  const back = (q: string) => NextResponse.redirect(new URL(`/admin/keywords?${q}`, request.url), 303);
  // Same-origin only: the session cookie is SameSite=Strict, this is the second check.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return back("error=origin");

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return back("error=empty");
  if (file.size > MAX_BYTES) return back("error=size");
  try {
    const parsed = parsePlannerExport(decodePlannerFile(new Uint8Array(await file.arrayBuffer())));
    if (parsed.rows.length === 0) return back("error=rows");
    const result = await importPlannerFile(parsed, file.name, admin.id);
    await auditLog(admin, "keywords.import", file.name.slice(0, 80), { rows: result.rows, matched: result.matched });
    return back(`imported=${result.rows}&matched=${result.matched}`);
  } catch (err) {
    console.error("[keywords] import failed:", (err as Error).message);
    return back("error=format");
  }
}
