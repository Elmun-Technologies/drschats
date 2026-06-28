import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export interface GridCard {
  title: string;
  text?: string;
  meta?: string;
  image?: string;
}

const ph = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `/placeholders/p${(h % 6) + 1}.svg`;
};

/** Animated responsive card grid (images + title + text + optional meta). */
export function CardGrid({
  heading,
  items,
  columns = 3,
  withImage = true,
}: {
  heading?: string;
  items: GridCard[];
  columns?: 2 | 3 | 4;
  withImage?: boolean;
}) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <section className="py-12">
      <Container>
        {heading && (
          <Reveal>
            <h2 className="mb-8 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{heading}</h2>
          </Reveal>
        )}
        <div className={`grid grid-cols-1 gap-5 ${cols}`}>
          {items.map((c, i) => (
            <Reveal key={c.title + i} index={Math.min(i, 6)} className="h-full">
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_44px_-24px_rgba(15,26,20,0.3)]">
                {withImage && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                    <Image src={c.image ?? ph(c.title)} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  {c.meta && <span className="mb-2 w-fit rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-strong">{c.meta}</span>}
                  <h3 className="font-display text-lg font-bold text-fg group-hover:text-accent-strong">{c.title}</h3>
                  {c.text && <p className="mt-2 text-sm text-muted">{c.text}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
