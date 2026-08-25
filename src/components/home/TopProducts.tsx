"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/shopflow/types";
import { Container } from "@/components/ui/Container";
import { StarRating } from "@/components/ui/StarRating";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const ENV_IMAGES = [
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800", // Dark green leaves
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800", // Abstract dark liquid
  "https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&q=80&w=800", // Deep amber sunset
];

export function TopProducts({ products }: { products: Product[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("home.top");
  const common = useTranslations("common");
  const add = useCart((s) => s.add);
  const items = products.slice(0, 3);

  return (
    <section className="bg-ink py-24 sm:py-32 border-t border-line/30">
      <Container>
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-gold/15 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-gold-ink border border-gold/30 mb-3">
            Top Tavsiyalar
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-brand-deep">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-muted">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((p, i) => {
            const featured = i === 1;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[2rem] min-h-[700px]",
                  featured ? "lg:-mt-6 lg:min-h-[740px] shadow-2xl shadow-brand-deep/20" : "shadow-xl shadow-brand-deep/10"
                )}
              >
                {/* Background Environment Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={ENV_IMAGES[i]}
                    alt="Background"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>

                {/* Darkening scrim: a real ancestor of every foreground element
                    below (not a sibling), so the white text sitting on it reads
                    as "on a gradient" rather than falling through to the
                    section's own porcelain background. */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-t from-brand-deep via-brand-deep/80 to-transparent">
                  <div className="absolute inset-0 bg-black/20" />

                  {featured && p.reviewCount > 0 && (
                    <span className="absolute right-6 top-6 z-20 rounded-full bg-gold/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-deep backdrop-blur-md">
                      ★ {common("reviews", { count: p.reviewCount })}
                    </span>
                  )}

                  {/* Floating Product Image & Title */}
                  <div className="relative z-10 flex flex-1 flex-col items-center justify-start pt-12 px-6">
                    <span className="mb-6 text-center font-display text-2xl font-extrabold text-white drop-shadow-md">
                      {p.name}
                    </span>
                    <div className="relative h-64 w-48 rounded-2xl bg-surface-2/60 p-4 flex items-center justify-center shadow-lg transition-transform duration-700 ease-out group-hover:-translate-y-2">
                      {p.images[0]?.url && (
                        <Image src={p.images[0].url} alt={p.name} fill sizes="200px" className="object-contain transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                  </div>

                  {/* Glassmorphic Details Card */}
                  <div className="relative z-20 mx-4 mb-4 flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <StarRating rating={p.rating} />
                      <div className="text-right">
                        {p.oldPrice && (
                          <span className="mr-2 text-sm text-white/50 line-through">{formatMoney(p.oldPrice, locale)}</span>
                        )}
                        <span className="font-display text-2xl font-bold text-white">{formatMoney(p.price, locale)}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-white/70">{t("includes")}</p>
                    <ul className="mt-3 flex-1 space-y-2.5">
                      {p.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-3 text-sm text-white/90">
                          <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="10" cy="10" r="9" className="opacity-20" />
                            <path d="M6 10l2.5 2.5L14 7.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {h}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => {
                          add({
                            productId: p.id,
                            slug: p.slug,
                            name: p.name,
                            image: p.images[0]?.url ?? "",
                            price: p.price,
                            oldPrice: p.oldPrice,
                          });
                          trackAddToCart(p.slug, p.price, 1);
                        }}
                        className={cn(
                          "w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300",
                          featured
                            ? "bg-gold text-brand-deep hover:bg-white"
                            : "bg-white text-brand-deep hover:bg-gold hover:text-brand-deep",
                        )}
                      >
                        {t("buy")}
                      </button>
                      <Link
                        href={`/product/${p.slug}`}
                        className="block w-full rounded-full border border-white/20 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-white/40 hover:bg-white/10"
                      >
                        {t("learn")}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
