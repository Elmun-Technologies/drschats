import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
    <section className="relative border-t border-line py-28 sm:py-36">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          align="center"
        />
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p} index={i} className="h-full">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl">
                {/* Photographic Header */}
                <div className="relative h-48 w-full overflow-hidden bg-surface-2">
                  <Image
                    src={IMAGES[p]}
                    alt={t(`points.${p}.title`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-90" />
                </div>
                
                <div className="relative flex flex-1 flex-col p-8 pt-4">
                  <div className="mb-2 font-display text-sm font-bold text-accent-strong opacity-80">0{i + 1}</div>
                  <h3 className="font-display text-2xl font-bold">{t(`points.${p}.title`)}</h3>
                  <p className="mt-3 flex-1 text-muted">{t(`points.${p}.description`)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
