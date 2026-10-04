import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { Expert } from "@/lib/content/experts";

/** E-E-A-T "Reviewed by" badge linking to the expert's credentialed profile. */
export function ReviewedBy({ expert }: { expert: Expert }) {
  const t = useTranslations("product");
  return (
    <Link
      href={`/experts/${expert.slug}`}
      className="group inline-flex items-center gap-3 rounded-full border border-signal/25 bg-signal-soft/70 px-3 py-2 transition-colors hover:border-signal/50"
    >
      <span className="relative h-8 w-8 overflow-hidden rounded-full bg-surface-2">
        <Image src={expert.image} alt={expert.name} fill sizes="32px" className="object-cover" />
      </span>
      <span className="text-left">
        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-signal">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("reviewedBy")}
        </span>
        <span className="block text-sm font-semibold text-fg group-hover:text-signal">{expert.name}</span>
      </span>
    </Link>
  );
}
