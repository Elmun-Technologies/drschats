import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export function TrustStats() {
  const t = useTranslations("home.trust");
  const stats = [
    { value: "50 000+", key: "customers" },
    { value: "4.8★", key: "rating" },
    { value: "1–3", key: "delivery" },
    { value: "120+", key: "products" },
  ] as const;

  return (
    <section className="border-t border-line py-20">
      <Container>
        <Reveal>
          <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
            {t("title")}
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.key} index={i} className="text-center">
              <div className="font-display text-4xl font-bold text-accent sm:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-muted">
                {t(`stats.${s.key}`)}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
