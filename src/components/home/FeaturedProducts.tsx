import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import type { Product } from "@/lib/shopflow/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const t = useTranslations("home.bestsellers");
  const common = useTranslations("common");
  return (
    <section className="border-t border-line bg-surface py-20 sm:py-24">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">{t("title")}</h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>
          <Link href="/products" className={buttonVariants("secondary")}>
            {common("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
