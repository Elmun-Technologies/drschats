import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

/** Swiss-style "highest quality" numbered list with a calm side image. */
export function QualityList() {
  const t = useTranslations("home.science");
  const points = ["tested", "transparent", "absorb"] as const;

  return (
    <section className="border-t border-line bg-surface py-20 sm:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
              <Image src="/placeholders/p4.svg" alt="" fill sizes="(max-width:1024px) 90vw, 560px" className="object-cover" />
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">{t("eyebrow")}</p>
            </Reveal>
            <Reveal index={1}>
              <h2 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
                {t("title")}
              </h2>
            </Reveal>

            <div className="mt-10 divide-y divide-line border-y border-line">
              {points.map((p, i) => (
                <Reveal key={p} index={i + 2}>
                  <div className="flex items-start gap-5 py-6">
                    <span className="font-display text-xl font-bold text-accent">0{i + 1}</span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{t(`points.${p}.title`)}</h3>
                      <p className="mt-1 text-muted">{t(`points.${p}.description`)}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
