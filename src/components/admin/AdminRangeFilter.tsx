import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReportRange } from "@/lib/admin/metrics";

const options: Array<{ value: ReportRange; label: string }> = [
  { value: 7, label: "7 kun" },
  { value: 30, label: "30 kun" },
  { value: 90, label: "90 kun" },
];

export function AdminRangeFilter({ range, basePath }: { range: ReportRange; basePath: string }) {
  return (
    <nav aria-label="Hisobot davri" className="inline-flex rounded-sm border border-line bg-white p-1">
      {options.map((option) => (
        <Link
          key={option.value}
          href={`${basePath}?range=${option.value}`}
          aria-current={range === option.value ? "page" : undefined}
          className={cn(
            "inline-flex h-8 items-center rounded-sm px-3 text-[11px] font-semibold transition-colors",
            range === option.value ? "bg-forest text-white" : "text-muted hover:bg-tile hover:text-ink",
          )}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
