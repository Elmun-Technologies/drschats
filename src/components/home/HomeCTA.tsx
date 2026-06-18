import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";

export function HomeCTA() {
  const t = useTranslations("home.cta");
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent to-emerald-600 px-8 py-16 text-center sm:px-16 sm:py-24">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold/30 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
                {t("title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/90">{t("subtitle")}</p>
              <Link
                href="/products"
                className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-accent-strong transition-transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                {t("button")}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
