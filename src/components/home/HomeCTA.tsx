import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

export function HomeCTA() {
  const t = useTranslations("home.cta");
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-8 py-16 text-center sm:px-16 sm:py-24">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {t("title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t("subtitle")}</p>
              <Link href="/products" className={buttonVariants("primary", "lg") + " mt-10"}>
                {t("button")}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
