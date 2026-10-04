import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => Parameters<typeof Link>[0]["href"];
}

export function Pagination({ currentPage, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted hover:border-line-strong hover:text-fg">
          ‹
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-faint">…</span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors",
              p === currentPage
                ? "border-line-strong bg-surface-2 text-fg"
                : "border-line text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={buildHref(currentPage + 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted hover:border-line-strong hover:text-fg">
          ›
        </Link>
      )}
    </nav>
  );
}
