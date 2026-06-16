import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import type { Product } from "@/lib/shopflow/types";

export function BestSellers({ products }: { products: Product[] }) {
  const t = useTranslations("home.bestsellers");
  const common = useTranslations("common");

  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t("subtitle")} title={t("title")} />
          <Link href="/products" className={buttonVariants("secondary")}>
            {common("viewAll")}
          </Link>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
