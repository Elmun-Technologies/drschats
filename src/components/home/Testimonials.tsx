import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { StarRating } from "@/components/ui/StarRating";
import { buttonVariants } from "@/components/ui/Button";
import type { Product } from "@/lib/shopflow/types";

export function Testimonials({ products }: { products: Product[] }) {
  const t = useTranslations("home.voices");

  const quotes = products
    .flatMap((p) => p.reviews.map((r) => ({ ...r, product: p.name })))
    .slice(0, 5);
  const tiles = ["/placeholders/p3.svg", "/placeholders/p1.svg", "/placeholders/p4.svg", "/placeholders/p5.svg"];

  return (
    <section className="bg-surface py-20 sm:py-24">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-muted">{t("subtitle")}</p>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          <ImageTile src={tiles[0]} className="aspect-[3/4]" />
          {quotes[0] && <Quote q={quotes[0]} member={t("member")} />}
          {quotes[1] && <Quote q={quotes[1]} member={t("member")} highlight />}
          <ImageTile src={tiles[1]} className="aspect-square" />
          <StatCard />
          {quotes[2] && <Quote q={quotes[2]} member={t("member")} />}
          <ImageTile src={tiles[2]} className="aspect-[4/5]" />
          {quotes[3] && <Quote q={quotes[3]} member={t("member")} />}
          <JoinCard label={t("join")} />
          {quotes[4] && <Quote q={quotes[4]} member={t("member")} />}
          <ImageTile src={tiles[3]} className="aspect-square" />
        </div>
      </Container>
    </section>
  );
}

function Quote({
  q,
  member,
  highlight,
}: {
  q: { text: string; author: string; rating: number };
  member: string;
  highlight?: boolean;
}) {
  return (
    <figure
      className={`rounded-3xl border border-line p-6 ${highlight ? "bg-accent text-ink" : "bg-ink"}`}
    >
      {!highlight && <StarRating rating={q.rating} />}
      <blockquote className={`mt-3 font-display text-lg font-semibold leading-snug ${highlight ? "text-ink" : "text-fg"}`}>
        “{q.text}”
      </blockquote>
      <figcaption className={`mt-4 text-sm ${highlight ? "text-ink/80" : "text-muted"}`}>
        <span className="font-semibold">{q.author}</span> · {member}
      </figcaption>
    </figure>
  );
}

function ImageTile({ src, className }: { src: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      <Image src={src} alt="" fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
    </div>
  );
}

function StatCard() {
  return (
    <div className="rounded-3xl border border-line bg-ink p-6 text-center">
      <div className="font-display text-5xl font-extrabold text-gradient">4.6★</div>
      <p className="mt-2 text-sm text-muted">3M+</p>
    </div>
  );
}

function JoinCard({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-accent to-emerald-600 p-8 text-center">
      <p className="font-display text-2xl font-bold text-white">Alimkhanov</p>
      <Link href="/products" className={buttonVariants("primary") + " bg-white text-accent-strong hover:bg-white"}>
        {label}
      </Link>
    </div>
  );
}
