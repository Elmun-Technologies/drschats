import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { LoyaltyJourney } from "@/components/loyalty/LoyaltyJourney";
import { BRAND } from "@/lib/brand";
import { COMMERCE, thousands } from "@/lib/config/commerce";

export const revalidate = 3600;

/*
  One discount system, on one page.

  This page used to carry a second, invented one: Standard / Silver / Gold tiers
  at 5 / 10 / 15% unlocked by 500 000 and 1 500 000 so'm of spending, plus a
  points scheme with three point-to-so'm rates. None of it existed anywhere in
  the code — the cart has never applied a tier discount — so a customer who
  reached "Silver" would have been told they had a 10% discount that no order
  form would honour.

  What is left is what the storefront actually implements, with the numbers
  read from src/lib/config/commerce.ts so the page cannot drift from the till:
  the first-order discount, Subscribe & Save, and the VIP club's free shipping.
  The partner programme stays, as a contractual B2B arrangement, because that
  is what it is.
*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "loyalty" });
  return buildPageMetadata({
    locale,
    path: "/loyalty",
    title: `${t("title")} — Go Vita`,
    description: t("subtitle"),
  });
}

export default async function LoyaltyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("loyalty");

  const { discounts, freeShippingOver } = COMMERCE;
  const amountLabel = thousands(freeShippingOver);

  const journey = [
    { title: t("journeyRegisterTitle"), description: t("journeyRegisterText"), icon: "profile" as const },
    { title: t("journeyBuyTitle"), description: t("journeyBuyText"), icon: "product" as const },
    { title: t("journeyRewardsTitle"), description: t("journeyRewardsText"), icon: "rewards" as const },
  ];

  /*
    The three programs are read as raw arrays and interpolated here rather than
    through message keys. It keeps the numbers in one place (COMMERCE) while the
    wording stays in the translation files — a tier card that quotes a
    percentage nobody's checkout applies is exactly the bug this page fixes.
  */
  const fill = (template: string, vars: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, key: string) =>
      key in vars ? String(vars[key]) : `{${key}}`,
    );

  const freeLabel = t("programsFree");
  // Every value is a string so the three shapes can sit in one array.
  const programVars: Record<string, string>[] = [
    { first: String(discounts.firstOrderPercent) },
    {
      first: String(discounts.subscriptionFirstPercent),
      recurring: String(discounts.subscriptionRecurringPercent),
    },
    { free: freeLabel, amount: amountLabel },
  ];
  const programs = (t.raw("programs") as { badge: string; title: string; text: string; note: string }[]).map(
    (program, index) => ({
      badge: fill(program.badge, programVars[index]),
      title: program.title,
      text: fill(program.text, programVars[index]),
      note: fill(program.note, programVars[index]),
    }),
  );

  const rules = (t.raw("rules") as string[]).map((rule) => fill(rule, { amount: amountLabel }));

  return (
    <div className="pb-24 sm:pb-32">
      <LoyaltyJourney
        title={t("journeyTitle")}
        subtitle={t("journeySubtitle")}
        cta={t("cta")}
        steps={journey}
      />

      <Container>
        <section aria-labelledby="loyalty-programs-title" className="border-t border-legacy-line pt-16 sm:pt-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-legacy-muted">{t("title")}</p>
              <h2 id="loyalty-programs-title" className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("programsTitle")}
              </h2>
              <p className="mt-4 text-legacy-muted">{t("programsDesc")}</p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {programs.map((program, index) => (
              <Reveal key={program.title} index={index} className="h-full">
                <article className="flex h-full min-h-56 flex-col rounded-2xl border border-legacy-line bg-surface p-7">
                  <span className="w-fit rounded-full border border-legacy-line-strong bg-legacy-ink px-3 py-1.5 text-xs font-extrabold tabular-nums text-brand-deep">
                    {program.badge}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-extrabold text-fg">{program.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-legacy-muted">{program.text}</p>
                  <p className="mt-5 rounded-xl border border-legacy-line bg-legacy-ink p-3.5 text-xs leading-relaxed text-legacy-muted">
                    {program.note}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section aria-labelledby="loyalty-rules-title" className="mt-16 rounded-2xl border border-legacy-line bg-surface-2/60 px-6 py-10 sm:mt-20 sm:px-10">
          <Reveal>
            <h2 id="loyalty-rules-title" className="font-display text-2xl font-extrabold tracking-tight">{t("rulesTitle")}
            </h2>
          </Reveal>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {rules.map((rule, index) => (
              <Reveal key={rule} index={index} as="li">
                <div className="flex h-full items-start gap-3 rounded-xl border border-legacy-line bg-legacy-ink p-4">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-soft text-[11px] font-bold text-signal">
                    ✓
                  </span>
                  <p className="text-sm leading-relaxed text-fg">{rule}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="mt-16 sm:mt-20">
          <Reveal>
            <div className="rounded-2xl border border-legacy-line bg-legacy-ink p-8 sm:p-10">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">{t("partnersTitle")}</h2>
              <p className="mt-3 max-w-3xl leading-relaxed text-legacy-muted">{t("partnersText")}</p>
              <a
                href={`mailto:${BRAND.contact.b2bEmail}`}
                className={buttonVariants("secondary") + " mt-6"}
              >
                {t("partnersCta")}
              </a>
            </div>
          </Reveal>
        </section>

        <Reveal>
          <div className="mt-12 flex justify-center">
            <Link href="/products" className={buttonVariants("dark", "lg")}>
              {t("cta")}
            </Link>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
