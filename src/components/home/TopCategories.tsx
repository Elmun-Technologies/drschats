import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animation/Reveal";
import type { Category } from "@/lib/shopflow/types";

/*
  Category photography, from our own shelf.

  These were Unsplash URLs, which meant the "Tibbiy qurilmalar" tile showed a
  laboratory and a stock vegetable basket stood in for a supplement category —
  images that belong to nobody and describe nothing. Each slug now maps to a
  photograph of a real product in that category; anything without one falls
  through to a typographic tile rather than to somebody else's picture.
*/
const CAT_IMAGES: Record<string, string> = {
  vitamins: "/products/dr-frei-gold-vitamins-20-2.webp",
  immunity: "/products/swiss-energy-immunovit-30-hero.webp",
  beauty: "/products/swiss-energy-nature-collagen.webp",
  kids: "/products/dr-frei-kids-multivitamins-20-3.webp",
  effervescent: "/products/swiss-energy-vitamin-c-20-2.webp",
  coffee: "/products/swiss-energy-coffee-crema-500g-hero.webp",
  "clinical-nutrition": "/products/delical-vanil-200ml-3.webp",
  minerals: "/products/swiss-energy-calcivit-30-hero.webp",
};

export function TopCategories({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");
  /*
    Read the whole hook map and look the slug up, rather than calling
    t(`hooks.${slug}`). A missing key in next-intl is not `undefined` — it is
    the key path itself, so `t(...) || t("hooks.default")` printed
    "home.categories.hooks.clinical-nutrition" on the tile.
  */
  const hooks = t.raw("hooks") as Record<string, string>;

  if (categories.length === 0) return null;

  return (
    <Section tone="surface" aria-labelledby="categories-heading">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          {/* Was a hardcoded Uzbek string, so the Russian home page said
              "Sog'liq yo'nalishlari" over Russian cards. */}
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-legacy-muted">{t("eyebrow")}</p>
          <h2 id="categories-heading" className="font-display text-2xl font-extrabold tracking-tight text-balance text-fg sm:text-3xl lg:text-4xl">{t("title")}
          </h2>
          <p className="mt-3 text-pretty text-base text-legacy-muted sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {categories.slice(0, 8).map((c, i) => {
            const bgImage = CAT_IMAGES[c.slug];
            const hook = hooks[c.slug] ?? hooks.default ?? c.name;
            
            return (
              <Reveal key={c.id} index={Math.min(i, 6)} as="div" className="h-full">
                <Link
                  href={`/products/${c.slug}`}
                  className="group relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-brand-deep transition-all duration-700 hover:shadow-[var(--shadow-legacy-pop)] md:aspect-[4/5]"
                >
                  <div className="absolute inset-0 z-0">
                    {/* No photo for this category yet → the tile stays a
                        typographic card rather than borrowing a stranger's
                        picture or showing an empty box. */}
                    {bgImage ? (
                      <Image
                        src={bgImage}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover opacity-85 transition-transform duration-1000 ease-out group- group-hover:opacity-100"
                      />
                    ) : (
                      <div className="h-full w-full bg-brand-deep" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/60 to-transparent opacity-95 transition-opacity duration-300 group-hover:opacity-90" />
                  </div>

                  {/* Top Hook Badge */}
                  <div className="relative z-10 p-5">
                    <span className="inline-block rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/20 shadow-sm">
                      {hook}
                    </span>
                  </div>
                  
                  {/* Bottom Title & CTA */}
                  <div className="relative z-10 flex flex-col p-6 text-left">
                    <span className="font-display text-xl font-extrabold text-white drop-shadow-md transition-colors duration-300 group-hover:text-accent-on-dark">
                      {c.name}
                    </span>
                    {/* "Katalogga o'tish" is navigation, not a purchase, so it
                        stays in the neutral palette — gold is reserved for
                        add-to-cart and checkout. */}
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/75 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
                      {t("cta")}
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 10h6M10 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
    </Section>
  );
}
