import Link from "next/link";
import { REVIEW_STATUSES, type ReviewStatus } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { listReviews, reviewCounts } from "@/lib/reviews/server";
import { moderateReviewAction } from "@/app/admin/_actions/reviews";
import { Card, ChipNav, EmptyState, PageHeader, Pill, linkClass, secondaryButtonClass, smallButtonClass, timeAgo } from "@/components/admin/ui";

export const metadata = { title: "Sharhlar" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ReviewStatus, string> = { pending: "Tekshiruvda", approved: "Chop etilgan", rejected: "Rad etilgan" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/*
  The moderation queue for product reviews (lib/reviews). Nothing a customer
  writes reaches the site until it is approved here; only approved reviews
  count into a product's stars. Rejecting keeps the row (so a repeat can be
  recognised) but never shows it.
*/
export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  await requireAdmin();
  const param = first((await searchParams).status) ?? "pending";
  const status: ReviewStatus | "all" = param === "all" ? "all" : (REVIEW_STATUSES as readonly string[]).includes(param) ? (param as ReviewStatus) : "pending";
  const [counts, reviews] = await Promise.all([reviewCounts(), listReviews(status)]);

  return (
    <>
      <PageHeader
        title="Sharhlar"
        lead="Mahsulot sahifasida yozilgan sharhlar. Tasdiqlangani saytda chiqadi va mahsulot reytingiga qoʻshiladi; telefon saytda koʻrinmaydi. Tibbiy vaʼda, shaxsiy maʼlumot yoki reklama boʻlsa — rad eting."
      />
      <Card>
        <ChipNav
          label="Holat boʻyicha"
          className="mb-4"
          items={[
            ...REVIEW_STATUSES.map((s) => ({ href: `/admin/reviews?status=${s}`, label: STATUS_LABEL[s], active: status === s, count: counts[s] })),
            { href: "/admin/reviews?status=all", label: "Hammasi", active: status === "all" },
          ]}
        />
        {reviews.length === 0 ? (
          <EmptyState title={status === "pending" ? "Tekshiruvni kutayotgan sharh yoʻq" : "Sharh yoʻq"}>
            Mijoz mahsulot sahifasidagi «Sharh yozish» orqali yuborgan sharhlar shu yerda chiqadi.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 rounded-[16px] border border-line p-4">
                <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                  <span className="text-[15px] font-bold text-ink">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <a href={`/${r.locale}/product/${r.productSlug}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {r.productSlug}
                  </a>
                  <span>· {r.author}</span>
                  {r.phone9 && <span>· tel. ••• {r.phone9.slice(-4)}</span>}
                  {r.verified ? <Pill tone="dark">xarid qilgan</Pill> : <Pill tone="outline">buyurtmasi topilmadi</Pill>}
                  <Pill tone="muted">{STATUS_LABEL[r.status]}</Pill>
                  <span title={r.createdAt.toISOString()}>· {timeAgo(r.createdAt)}</span>
                  {r.moderatedBy && <span>· {r.moderatedBy}</span>}
                </div>
                <p className="whitespace-pre-line text-[15px] leading-[22px] text-ink">{r.text}</p>
                <div className="flex flex-wrap gap-2">
                  {r.status !== "approved" && (
                    <form action={moderateReviewAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button type="submit" className={smallButtonClass}>Tasdiqlash</button>
                    </form>
                  )}
                  {r.status !== "rejected" && (
                    <form action={moderateReviewAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button type="submit" className={secondaryButtonClass}>Rad etish</button>
                    </form>
                  )}
                  {r.phone9 && (
                    <Link href={`/admin/customers/${r.phone9}`} className={`${secondaryButtonClass}`}>
                      Mijoz
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
