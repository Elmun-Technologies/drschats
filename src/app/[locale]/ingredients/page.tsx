import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/routing";
import { getIngredients, getSynergy } from "@/lib/content/ingredients";
import { shopflow } from "@/lib/shopflow";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { Disclaimer } from "@/components/legal/Disclaimer";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ingredients_page" });
  return buildPageMetadata({ locale, path: "/ingredients", title: `${t("title")} — Alimkhanov`, description: t("subtitle") });
}

export default async function IngredientsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, products] = await Promise.all([
    getTranslations("ingredients_page"),
    shopflow.getProducts({ locale, pageSize: 100 }),
  ]);
  const ingredients = getIngredients(locale);
  const synergy = getSynergy(locale);
  const nameBySlug = new Map(products.items.map((p) => [p.slug, p.name]));

  return (
    <div className="pt-10">
      <Container>
        <header className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-strong">{t("badge")}</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </header>

        {/* Alphabetical ingredient index */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ing, i) => (
            <Reveal key={ing.slug} index={Math.min(i, 6)} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-line bg-ink p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold">{ing.name}</h2>
                  <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-strong">{ing.role}</span>
                </div>
                <p className="mt-3 flex-1 text-sm text-muted">{ing.description}</p>
                {ing.inProducts.length > 0 && (
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">{t("foundIn")}</p>
                    <div className="flex flex-wrap gap-2">
                      {ing.inProducts.map((slug) => (
                        <Link key={slug} href={`/product/${slug}`} className="rounded-full border border-line px-3 py-1 text-xs text-fg transition-colors hover:border-accent hover:text-accent-strong">
                          {nameBySlug.get(slug) ?? slug}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Synergy / compatibility */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("synergyTitle")}</h2>
          <p className="mt-2 text-muted">{t("synergyDesc")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {synergy.map((s, i) => (
              <Reveal key={i} index={i}>
                <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${s.type === "boost" ? "bg-accent-soft text-accent-strong" : "bg-gold/15 text-gold"}`}>
                    {s.type === "boost" ? "+" : "−"}
                  </span>
                  <div>
                    <p className="font-semibold text-fg">
                      {s.a} <span className="text-faint">{s.type === "boost" ? "+" : "×"}</span> {s.b}
                      <span className={`ml-2 text-xs font-semibold ${s.type === "boost" ? "text-accent-strong" : "text-gold"}`}>
                        {s.type === "boost" ? t("boost") : t("block")}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted">{s.note}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* COA */}
        <section className="mt-16 rounded-2xl border border-line bg-surface p-8">
          <h2 className="font-display text-xl font-bold">{t("coaTitle")}</h2>
          <p className="mt-3 max-w-2xl text-muted">{t("coaDesc")}</p>
        </section>

        <div className="mb-32 mt-12">
          <Disclaimer variant="article" />
        </div>
      </Container>
    </div>
  );
}
