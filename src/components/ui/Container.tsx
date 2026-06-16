import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  const max = {
    default: "max-w-7xl",
    wide: "max-w-[1600px]",
    narrow: "max-w-3xl",
  }[size];
  return (
    <div className={cn("container-px mx-auto w-full", max, className)}>
      {children}
    </div>
  );
}
