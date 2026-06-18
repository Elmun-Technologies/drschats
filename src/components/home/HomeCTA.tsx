import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";

export function HomeCTA() {
  const t = useTranslations("home.cta");
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-balance sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t("subtitle")}</p>
            <Link href="/products" className={buttonVariants("primary", "lg") + " mt-9"}>
              {t("button")}
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
