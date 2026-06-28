import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import type { Product } from "@/lib/shopflow/types";

export function ProductCarousel({ products }: { products: Product[] }) {
  const t = useTranslations("home.newArrivals");
  const common = useTranslations("common");

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold text-accent-strong">{t("eyebrow")}</p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-muted">{t("subtitle")}</p>
        </div>

        <Carousel ariaLabel={t("title")}>
          {products.map((p, i) => (
            <div key={p.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </Carousel>

        <div className="mt-10 text-center">
          <Link href="/products" className={buttonVariants("secondary")}>
            {common("viewAll")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
