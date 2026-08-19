import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { AnimatedCounter } from "@/components/visual/AnimatedCounter";

export function TrustStats() {
  const t = useTranslations("home.trust");
  const stats = [
    { value: 50000, suffix: "+", key: "customers" },
    { value: 4.8, decimals: 1, suffix: "★", key: "rating" },
    { value: 48, suffix: "h", key: "delivery" },
    { value: 120, suffix: "+", key: "products" },
  ] as const;

  return (
    <section className="relative overflow-hidden border-t border-line py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(31,209,123,0.08),transparent_70%)]" />
      <Container>
        <Reveal>
          <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
            {t("title")}
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.key} index={i} className="text-center">
              <div className="font-display text-5xl font-bold text-gradient sm:text-6xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={"decimals" in s ? s.decimals : 0} />
              </div>
              <div className="mt-3 text-sm text-muted">{t(`stats.${s.key}`)}</div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
