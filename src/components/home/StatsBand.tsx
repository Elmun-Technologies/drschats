import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { AnimatedCounter } from "@/components/visual/AnimatedCounter";

export function StatsBand() {
  const t = useTranslations("home.trust");
  const stats = [
    { value: 50000, suffix: "+", key: "customers" },
    { value: 120, suffix: "+", key: "products" },
    { value: 48, suffix: "h", key: "delivery" },
    { value: 4.8, decimals: 1, suffix: "★", key: "rating" },
  ] as const;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="mb-14 max-w-2xl font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.key} index={i}>
              <div className="border-t-2 border-fg pt-5">
                <div className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                  <AnimatedCounter value={s.value} suffix={s.suffix} decimals={"decimals" in s ? s.decimals : 0} />
                </div>
                <div className="mt-2 text-sm text-muted">{t(`stats.${s.key}`)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
