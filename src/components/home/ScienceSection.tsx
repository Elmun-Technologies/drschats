import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animation/Reveal";

const icons: Record<string, string> = {
  tested: "M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z",
  transparent: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 9a3 3 0 100 6 3 3 0 000-6z",
  absorb: "M12 3v18M5 10l7 7 7-7",
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
              <div className="group relative h-full overflow-hidden rounded-3xl border border-line bg-surface p-10 transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-transform duration-500 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icons[p]} />
                    </svg>
                  </div>
                  <div className="mb-2 font-display text-sm font-semibold text-faint">0{i + 1}</div>
                  <h3 className="font-display text-2xl font-semibold">{t(`points.${p}.title`)}</h3>
                  <p className="mt-3 text-muted">{t(`points.${p}.description`)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
