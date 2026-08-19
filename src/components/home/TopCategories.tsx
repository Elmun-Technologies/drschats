import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import type { Category } from "@/lib/shopflow/types";

const CAT_IMAGES: Record<string, string> = {
  "vitamins": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ad?auto=format&fit=crop&q=80&w=600", // Vitamins/pills
  "immunity": "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=600", // Fresh citrus/health
  "beauty": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600", // Spa/beauty
  "kids": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600", // Kids playing
  "effervescent": "https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&q=80&w=600", // Bubbling liquid
  "minerals": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600", // Healthy greens/nature
  "medical-devices": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600", // Medical lab/device
  "coffee": "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600", // Coffee beans
  "default": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600",
};

const CAT_HOOKS: Record<string, string> = {
  "vitamins": "Tana energiyasi & Imunitet",
  "immunity": "Mavsumiy himoya",
  "beauty": "Teri, soch & tirnoqlar",
  "kids": "O'sish va aqliy rivojlanish",
  "effervescent": "Tez so'riluvchi formulalar",
  "minerals": "Suyak va mushaklar mustahkamligi",
  "medical-devices": "Aniq va xavfsiz monitoring",
  "coffee": "Tabiiy energiya & antioksidantlar",
  "default": "Ekspertlar tomonidan saralangan",
};

export function TopCategories({ categories }: { categories: Category[] }) {
  const t = useTranslations("home.categories");

  if (categories.length === 0) return null;

  return (
    <section className="bg-ink py-20 sm:py-28 border-t border-line/30">
      <Container>
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-gold/15 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold-ink border border-gold/30 mb-3">
            Sog&apos;lik yo&apos;nalishlari
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-deep">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-muted">
            Sizning salomatlik maqsadingizga mos ravishda tibbiy testdan o&apos;tgan va tasdiqlangan kategoriyalar
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {categories.slice(0, 8).map((c, i) => {
            const bgImage = CAT_IMAGES[c.slug] || CAT_IMAGES.default;
            const hook = CAT_HOOKS[c.slug] || CAT_HOOKS.default;
            
            return (
              <Reveal key={c.id} index={Math.min(i, 6)} as="div" className="h-full">
                <Link
                  href={`/products/${c.slug}`}
                  className="group relative flex aspect-[3/4] md:aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-[2.25rem] bg-brand-deep transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-deep/30 border border-white/10"
                >
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src={bgImage}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover opacity-85 transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:opacity-100"
                    />
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
                    <span className="font-display text-xl font-extrabold text-white drop-shadow-md transition-colors duration-300 group-hover:text-gold">
                      {c.name}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold opacity-90 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
                      Katalogga o&apos;tish
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
      </Container>
    </section>
  );
}
