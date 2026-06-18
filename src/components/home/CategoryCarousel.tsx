import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";
import type { Category } from "@/lib/shopflow/types";

export function CategoryCarousel({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");

  return (
    <section className="bg-surface py-20 sm:py-24">
      <Container>
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-muted">{t("subtitle")}</p>
        </div>

        <Carousel ariaLabel={t("title")}>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products/${c.slug}`}
              className="group relative flex h-[380px] w-[300px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl sm:w-[340px]"
            >
              <Image
                src={c.image ?? ""}
                alt={c.name}
                fill
                sizes="340px"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="relative p-6">
                <h3 className="font-display text-2xl font-bold text-white">{c.name}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-white/85">
                  {c.productCount} →
                </span>
              </div>
            </Link>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
