import { requireAdmin } from "@/lib/admin/session";
import { listWaitRequests } from "@/lib/admin/waitlist";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { WAIT_KINDS, WAIT_STATUSES, type WaitKind, type WaitStatus } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/* The waitlist as a spreadsheet — for the team that calls. Full numbers: it is the call list. */
export async function GET(req: Request) {
  await requireAdmin();
  const params = new URL(req.url).searchParams;
  const s = params.get("status") ?? "waiting";
  const k = params.get("kind") ?? "";
  const status = (WAIT_STATUSES as readonly string[]).includes(s) ? (s as WaitStatus) : undefined;
  const kind = (WAIT_KINDS as readonly string[]).includes(k) ? (k as WaitKind) : undefined;
  const rows = await listWaitRequests({ status, kind, limit: 50_000 });
  return csvResponse(
    toCsv([
      ["id", "sana", "mahsulot", "slug", "turi", "kutilgan_narx", "joriy_narx", "telefon", "til", "telegram", "holat", "kanal", "xabar_sanasi"],
      ...rows.map(({ r, name, price }) => [
        r.id,
        r.createdAt.toISOString(),
        name ?? "",
        r.productSlug,
        r.kind,
        r.targetPrice,
        price,
        r.phone.replace(/\D/g, ""),
        r.locale,
        r.telegramChatId ? "ha" : "",
        r.status,
        r.notifiedVia ?? "",
        r.notifiedAt?.toISOString() ?? "",
      ]),
    ]),
    "govita-kutayotganlar",
  );
}
