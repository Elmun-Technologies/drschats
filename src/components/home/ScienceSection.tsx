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
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          align="center"
        />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p} index={i} className="h-full">
              <div className="group h-full rounded-2xl border border-line bg-surface p-8 transition-colors duration-300 hover:border-accent/40">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icons[p]} />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold">{t(`points.${p}.title`)}</h3>
                <p className="mt-3 text-muted">{t(`points.${p}.description`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
