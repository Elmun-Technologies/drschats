import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import type { Category } from "@/lib/shopflow/types";

/** Swiss-style category section: accent eyebrow, two-column intro, then a dense
 *  grid of clean white tiles (image + label) ending in a "view all" tile. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal>
          <p className="text-sm font-semibold text-accent-strong">{t("eyebrow")}</p>
        </Reveal>
        <div className="mt-3 grid gap-6 lg:grid-cols-2 lg:items-end">
          <Reveal index={1}>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl">
              {t("title")}
            </h2>
          </Reveal>
          <Reveal index={2}>
            <p className="text-muted lg:pb-2">{t("lead")}</p>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Reveal key={c.id} index={Math.min(i, 6)} className="h-full">
              <Link
                href={`/products/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink p-3 transition-all duration-300 hover:border-accent hover:shadow-[0_14px_36px_-22px_rgba(15,26,20,0.3)]"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                  <Image
                    src={c.image ?? ""}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 18vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="flex flex-1 items-center justify-center px-2 py-4 text-center font-display text-sm font-semibold text-fg">
                  {c.name}
                </span>
              </Link>
            </Reveal>
          ))}

          <Reveal index={6} className="h-full">
            <Link
              href="/products"
              className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface p-6 text-center transition-colors hover:border-accent hover:text-accent-strong"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-ink">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-display text-sm font-semibold">{t("viewAll")}</span>
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
