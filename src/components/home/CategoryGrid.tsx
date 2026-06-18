import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import type { Category } from "@/lib/shopflow/types";

/** Swiss-style clean category grid: minimal white tiles, image + label. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Reveal key={c.id} index={i} className="h-full">
              <Link
                href={`/products/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-ink transition-all duration-300 hover:border-accent hover:shadow-[0_14px_36px_-22px_rgba(15,26,20,0.3)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image
                    src={c.image ?? ""}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-1 px-3 py-4 text-center">
                  <span className="font-display text-sm font-semibold text-fg">{c.name}</span>
                  <span className="text-xs text-faint">{c.productCount}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
