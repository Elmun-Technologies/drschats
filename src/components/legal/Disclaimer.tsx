import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Law-mandated БАД warning (UZ "Reklama to'g'risida" qonuni, art. 35):
 * every page selling/advertising a supplement must carry a clear, contrasting
 * "Dori vositasi emas" notice. Use `variant="product"` on product pages and
 * `variant="article"` on editorial content.
 */
export function Disclaimer({
  variant = "product",
  className,
}: {
  variant?: "product" | "article";
  className?: string;
}) {
  const t = useTranslations("legal");
  const text = variant === "article" ? t("articleDisclaimer") : t("warning");

  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4M12 17h.01M10.3 3.86l-8.5 14.7A1.5 1.5 0 003.1 21h17.8a1.5 1.5 0 001.3-2.44l-8.5-14.7a1.5 1.5 0 00-2.6 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-medium text-fg">{text}</p>
    </div>
  );
}
