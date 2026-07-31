import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import type { Category } from "@/lib/shopflow/types";
import { getCategoryIcon } from "@/lib/shop/category-icons";

export function TopCategories({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");

  if (categories.length === 0) return null;

  return (
    <section className="bg-ink py-16">
      <Container>
        <h2 className="mb-10 text-center font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 sm:gap-x-10">
          {categories.slice(0, 8).map((c, i) => (
            <Reveal key={c.id} index={Math.min(i, 6)}>
              <Link
                href={`/products/${c.slug}`}
                className="group flex w-24 flex-col items-center gap-3 text-center"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface transition-colors group-hover:bg-accent-soft">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 text-fg transition-colors group-hover:text-accent-strong"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={getCategoryIcon(c.slug)} />
                  </svg>
                </span>
                <span className="text-sm font-semibold leading-tight text-fg group-hover:text-accent-strong">
                  {c.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
