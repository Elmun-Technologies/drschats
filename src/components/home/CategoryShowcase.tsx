import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animation/Reveal";
import type { Category } from "@/lib/shopflow/types";

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");

  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t("subtitle")} title={t("title")} />
        <div className="mt-14 grid auto-rows-[260px] grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal
              key={c.id}
              index={i}
              className={i === 0 ? "col-span-2 row-span-2 lg:row-span-2" : ""}
            >
              <Link
                href={`/products/${c.slug}`}
                className="group relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border border-line p-6"
              >
                <Image
                  src={c.image ?? ""}
                  alt={c.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover grayscale-[0.3] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:grayscale-0"
                />
                {/* accent duotone + depth so placeholder imagery reads as intentional */}
                <div className="absolute inset-0 bg-accent/20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_120%,rgba(31,209,123,0.35),transparent_60%)]" />
                <div className="relative">
                  <h3 className="font-display text-xl font-semibold text-fg">{c.name}</h3>
                  {i === 0 && c.description && (
                    <p className="mt-2 max-w-sm text-sm text-muted">{c.description}</p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {c.productCount} →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
