import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import type { Category } from "@/lib/shopflow/types";

const ICON = "M9 3h6l1 4h3a1 1 0 011 1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8a1 1 0 011-1h3l1-4z M12 11v4M10 13h4";

/** HealthMart-style circular category row. */
export function TopCategories({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");
  return (
    <section className="bg-ink py-16">
      <Container>
        <h2 className="mb-10 text-center font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{t("title")}</h2>
        <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 sm:gap-x-10">
          {categories.slice(0, 8).map((c, i) => (
            <Reveal key={c.id} index={Math.min(i, 6)}>
              <Link href={`/products/${c.slug}`} className="group flex w-24 flex-col items-center gap-3 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface transition-colors group-hover:bg-accent-soft">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-fg transition-colors group-hover:text-accent-strong" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICON} />
                  </svg>
                </span>
                <span className="text-sm font-semibold leading-tight text-fg group-hover:text-accent-strong">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
