import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import type { Category } from "@/lib/shopflow/types";

const CATEGORY_ICONS: Record<string, string> = {
  vitamins:
    "M12 2a5 5 0 015 5v1h1a3 3 0 010 6h-1v1a5 5 0 01-10 0v-1H6a3 3 0 010-6h1V7a5 5 0 015-5zM9 7v8M15 7v8",
  minerals:
    "M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z",
  omega:
    "M2 12c2-4 4-6 6-6s4 4 8 4-4 6-8 6-6-2-6-4zM18 6a2 2 0 100 4 2 2 0 000-4z",
  probiotics:
    "M12 2C8 2 5 5 5 9s3 8 7 8 7-4 7-8-3-7-7-7zM9 9h6M12 6v6",
  immunity:
    "M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5l2-5z",
  beauty:
    "M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4zM8 13a8 8 0 0010 2M6 15a8 8 0 0112 0",
  sports:
    "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  kids:
    "M8 7a4 4 0 108 0M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2M12 11v4M10 13h4",
  sleep:
    "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  weight:
    "M12 3a3 3 0 100 6 3 3 0 000-6zM3 20s2-5 9-5 9 5 9 5M6 14l2 6M18 14l-2 6",
  heart:
    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z",
  joints:
    "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
};

function getCategoryIcon(slug: string): string {
  const key = Object.keys(CATEGORY_ICONS).find((k) => slug.toLowerCase().includes(k));
  return (
    key
      ? CATEGORY_ICONS[key]
      : "M9 3h6l1 4h3a1 1 0 011 1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8a1 1 0 011-1h3l1-4z"
  );
}

export function TopCategories({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");
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
