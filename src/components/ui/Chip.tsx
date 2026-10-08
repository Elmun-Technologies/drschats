import type { ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/*
  Filter and tag chip (design: kit `.chip`, `.chip.on`). A link when it
  navigates (filters are URLs here), a button when it toggles in place.
*/
export function chipClass(active = false) {
  return cn(
    "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-4 text-[15px] font-medium transition-colors",
    active ? "bg-ink text-white" : "bg-tile text-ink hover:bg-tile-hover",
  );
}

export function Chip({
  href,
  active = false,
  count,
  onClick,
  className,
  children,
}: {
  href?: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const body = (
    <>
      {children}
      {count != null && (
        <small className={cn("text-sm font-normal", active ? "text-on-dark-2" : "text-muted")}>{count}</small>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} aria-current={active ? "true" : undefined} className={cn(chipClass(active), className)}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn(chipClass(active), className)}>
      {body}
    </button>
  );
}
