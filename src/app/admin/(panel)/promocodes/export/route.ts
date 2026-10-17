import { requireAdmin } from "@/lib/admin/session";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { SOURCE_LABEL, listPromoCodes, parsePromoFilter, promoValueLabel } from "@/lib/admin/promocodes";
import { PROMO_SOURCES, type PromoSource } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/** The codes on screen (or one generated batch) as CSV — the input for an SMS or Telegram send-out. */
export async function GET(req: Request) {
  await requireAdmin();
  const params = new URL(req.url).searchParams;
  const sourceParam = params.get("source") ?? "";
  const source = (PROMO_SOURCES as readonly string[]).includes(sourceParam) ? (sourceParam as PromoSource) : null;
  const batch = params.get("batch")?.trim() || null;
  const rows = await listPromoCodes({ filter: parsePromoFilter(params.get("filter")), source, q: params.get("q") ?? "", batch, limit: 5000 });
  const csv = toCsv([
    ["code", "discount", "min_subtotal", "uses", "max_uses", "phone", "ends_at", "source", "campaign", "note"],
    ...rows.map((r) => [
      r.code,
      promoValueLabel(r.kind, r.value),
      r.minSubtotal,
      r.uses,
      r.maxUses,
      r.phone9 ? `+998${r.phone9}` : "",
      r.endsAt ? r.endsAt.toISOString() : "",
      SOURCE_LABEL[r.source],
      r.campaignId,
      r.note,
    ]),
  ]);
  return csvResponse(csv, batch ? `govita-promo-${batch}` : "govita-promokodlar");
}
