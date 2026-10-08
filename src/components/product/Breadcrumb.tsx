import { useMessages, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { Product } from "@/lib/shopflow/types";

/*
  Category names, translated.

  The middle crumb used to print `product.categorySlug` — the raw English slug,
  so a Russian product page read "Главная / Каталог / nutrition / Delical" and
  the link under it pointed at a category page that could be empty. The names
  now come from messages, keyed by the same slug the link uses.
*/
export function Breadcrumb({ product }: { product: Product }) {
  const t = useTranslations("product");
  const nav = useTranslations("nav");
  const categoryNames = (useMessages().categoryNames ?? {}) as Record<string, string>;
  const slug = product.categorySlug ?? "";
  const categoryName = categoryNames[slug] ?? slug;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
      <Link href="/" className="hover:text-ink">
        {t("breadcrumbHome")}
      </Link>
      <span>/</span>
      <Link href="/products" className="hover:text-ink">
        {nav("shop")}
      </Link>
      <span>/</span>
      <Link href={`/products/${slug}`} className="hover:text-ink">
        {categoryName}
      </Link>
      <span>/</span>
      <span className="text-ink">{product.name}</span>
    </nav>
  );
}
