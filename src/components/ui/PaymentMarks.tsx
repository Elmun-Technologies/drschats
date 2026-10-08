import Image from "next/image";
import { PAYMENT_BRANDS, type PaymentBrandId } from "@/lib/config/payment-brands";
import { cn } from "@/lib/utils";

type Size = "sm" | "md";

const CHIP: Record<Size, string> = {
  sm: "h-8 rounded-[8px] px-2.5 text-[13px]",
  md: "h-10 rounded-[10px] px-3 text-[15px]",
};
const SCALE: Record<Size, number> = { sm: 0.8, md: 1 };

/**
 * One payment brand as a chip: the network's own mark when the file exists,
 * otherwise its name in bold. The name is always the accessible label.
 */
export function PaymentMark({ id, size = "md", className }: { id: PaymentBrandId; size?: Size; className?: string }) {
  const brand = PAYMENT_BRANDS[id];
  const h = Math.round(brand.h * SCALE[size]);
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center bg-bg font-bold text-ink", CHIP[size], className)}>
      {brand.src ? (
        <Image
          src={brand.src}
          alt={brand.label}
          width={Math.round(h * brand.ratio)}
          height={h}
          unoptimized
          className="block"
          style={{ height: h, width: "auto" }}
        />
      ) : (
        brand.label
      )}
    </span>
  );
}

export function PaymentMarks({
  ids,
  size = "md",
  label,
  className,
  chipClassName,
}: {
  ids: PaymentBrandId[];
  size?: Size;
  /** Accessible name for the group, e.g. "Toʻlov usullari". */
  label?: string;
  className?: string;
  chipClassName?: string;
}) {
  if (ids.length === 0) return null;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap items-center gap-2", className)}>
      {ids.map((id) => (
        <li key={id} className="flex">
          <PaymentMark id={id} size={size} className={chipClassName} />
        </li>
      ))}
    </ul>
  );
}
