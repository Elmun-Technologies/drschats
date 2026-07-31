import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import { discountPercent } from "@/lib/shop/discounts";
import type { Product } from "@/lib/shopflow/types";

/*
  Sits high on the page on purpose. Bestsellers answer "what is good here?",
  which is a question people ask once they already trust the shop; discounts
  answer "why buy today?", which is the question a first-time visitor arrives
  with. The rail leads with the deepest cut so the strongest number is the
  first one seen.
*/
export function DiscountRail({ products }: { products: Product[] }) {
  const t = useTranslations("home.discounts");
  const common = useTranslations("common");

  if (products.length === 0) return null;

  const deepest = discountPercent(products[0]);

  return (
    <section className="border-t border-line bg-surface py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-danger">
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.5 7.5h.01M20.6 13.4L13.4 20.6a2 2 0 01-2.8 0l-7.2-7.2A2 2 0 013 12V5a2 2 0 012-2h7a2 2 0 011.4.6l7.2 7.2a2 2 0 010 2.6z" />
              </svg>
              {deepest > 0 ? t("eyebrow", { percent: deepest }) : t("eyebrowPlain")}
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>
          {/* Plain catalogue: the API's sort union has no "discount" option, and
              linking to a parameter the backend does not accept is a dead end. */}
          <Link href="/products" className={buttonVariants("secondary")}>
            {common("viewAll")}
          </Link>
        </div>

        <Carousel ariaLabel={t("title")}>
          {products.map((p, i) => (
            <div key={p.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
