import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { Product } from "@/lib/shopflow/types";

export function Breadcrumb({ product }: { product: Product }) {
  const t = useTranslations("product");
  const nav = useTranslations("nav");

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-faint">
      <Link href="/" className="hover:text-fg">
        {t("breadcrumbHome")}
      </Link>
      <span>/</span>
      <Link href="/products" className="hover:text-fg">
        {nav("shop")}
      </Link>
      <span>/</span>
      <Link href={`/products/${product.categorySlug}`} className="hover:text-fg">
        {product.categorySlug}
      </Link>
      <span>/</span>
      <span className="text-fg">{product.name}</span>
    </nav>
  );
}
