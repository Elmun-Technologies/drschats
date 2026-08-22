import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

const IMAGES: Record<string, string> = {
  tested: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800",
  transparent: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800",
  absorb: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800",
};

export function ScienceSection() {
  const t = useTranslations("home.science");
  const points = ["tested", "transparent", "absorb"] as const;

  return (
    <section className="relative border-t border-line/30 bg-ink py-24 sm:py-32">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block rounded-full bg-gold/15 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold-ink border border-gold/30 mb-3">
            {t("eyebrow")}
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-deep">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-muted">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p} index={i} className="h-full">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-t-[4.5rem] rounded-b-[1.5rem] border border-white/10 bg-brand-deep transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-deep/30">
                {/* Photographic Header */}
                <div className="relative h-56 w-full overflow-hidden bg-brand-deep">
                  <Image
                    src={IMAGES[p]}
                    alt={t(`points.${p}.title`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-85 transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/50 to-transparent" />
                  
                  <span className="absolute top-4 left-4 rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-brand-deep shadow-md">
                    0{i + 1}
                  </span>
                </div>
                
                <div className="relative flex flex-1 flex-col p-8 pt-2">
                  <h3 className="font-display text-2xl font-extrabold text-white transition-colors group-hover:text-gold">
                    {t(`points.${p}.title`)}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-surface-2/80 leading-relaxed">
                    {t(`points.${p}.description`)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
