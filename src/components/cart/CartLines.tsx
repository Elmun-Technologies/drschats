"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { bonusUnitsNeeded, lineListTotal, lineQtyCap, lineTotal, type CartLine } from "@/lib/cart/pricing";
import type { UpsellStep } from "@/lib/upsell/ladder";
import { useCart } from "@/lib/cart/store";
import { usePromotions } from "@/lib/cart/promotions-context";
import { useWishlist } from "@/lib/wishlist/store";
import { track, trackAddToWishlist } from "@/lib/analytics/events";
import { COMMERCE } from "@/lib/config/commerce";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { productBrand } from "@/lib/content/product-brands";
import { productCutout } from "@/lib/content/product-cutouts";
import { PRODUCT_UNITS } from "@/lib/content/product-units";
import { DiscountBadge } from "@/components/ui/Price";
import { cutoutOf } from "@/lib/catalog/product-facts";

/*
  Design: CartV3 / CartMobileV3 line list and the "Buyurtmangizga qoʻshing"
  row. Quantity stops at 1 — the store reads 0 as "remove", and one press too
  many used to delete a product with nothing to undo it; removing is its own
  labelled control.
*/
export function CartLines({ lines, upsells }: { lines: CartLine[]; upsells: UpsellStep[] }) {
  const t = useTranslations("cart.v3");
  const tc = useTranslations("checkout");

  return (
    <div className="flex flex-col lg:rounded-[20px] lg:border lg:border-line lg:px-6 lg:py-1">
      <ul>
        {lines.map((l) => (
          <Line key={l.lineId} line={l} />
        ))}
      </ul>
      {upsells.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-4 lg:gap-3.5 lg:pb-6 lg:pt-[22px]">
          <h2 className="text-[17px] font-bold lg:text-lg">{tc("upsellTitle")}</h2>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-2.5 lg:px-0">
            {upsells.map((step) => (
              <UpsellOffer key={step.product.id} step={step} label={t("addFor", { name: step.product.name })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Line({ line: l }: { line: CartLine }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("cart.v3");
  const tc = useTranslations("checkout");
  const ts = useTranslations("subscription");
  const common = useTranslations("common");
  const tp = useTranslations("product.v3");
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const bonus = bonusUnitsNeeded(l, usePromotions()) > 0 && l.quantity < lineQtyCap(l);
  const toggleWish = useWishlist((s) => s.toggle);
  const saved = useWishlist((s) => s.items.includes(l.productId));

  const image = productCutout(l.slug) ?? l.image;
  const brand = productBrand(l.slug);
  const pack = PRODUCT_UNITS[l.slug];
  const meta = [brand?.name, pack && `${pack.count} ${common(pack.unit === "tablet" ? "unitTablet" : "unitCapsule")}`]
    .filter(Boolean)
    .join(" · ");
  const total = lineTotal(l);
  const before = lineListTotal(l);

  const wish = () => {
    toggleWish(l.productId);
    if (saved) track("remove_from_wishlist", { item_id: l.slug });
    else trackAddToWishlist({ item_id: l.slug, item_name: l.name, price: l.price });
  };

  return (
    <li className="grid grid-cols-[92px_minmax(0,1fr)] gap-3.5 border-b border-line py-4 lg:grid-cols-[112px_minmax(0,1fr)_132px_150px] lg:items-start lg:gap-[18px] lg:py-[22px]">
      {/* Out of the tab order: the name link below goes to the same page. */}
      <Link href={`/product/${l.slug}`} aria-label={l.name} tabIndex={-1} className="relative h-[92px] w-[92px] rounded-[16px] bg-tile lg:h-28 lg:w-28">
        {image && <Image src={image} alt="" fill sizes="112px" className="object-contain p-2" />}
      </Link>

      <div className="flex min-w-0 flex-col gap-1 lg:gap-1.5">
        <div className="flex items-baseline gap-1.5 lg:hidden">
          <span className="text-lg font-bold">{formatMoney(total, locale)}</span>
          {before && <span className="text-[13px] text-muted line-through">{formatNumber(before)}</span>}
        </div>
        <Link href={`/product/${l.slug}`} className="text-[15px] leading-5 hover:underline lg:text-[17px] lg:font-medium lg:leading-[23px]">
          {l.name}
        </Link>
        {meta && <span className="hidden text-sm text-muted lg:block">{meta}</span>}
        {l.soldOut && <span role="status" className="text-sm font-semibold text-red">{common("outOfStock")}</span>}
        {bonus && (
          <button
            type="button"
            onClick={() => setQuantity(l.lineId, l.quantity + 1)}
            className="inline-flex min-h-11 items-center self-start text-sm font-semibold underline underline-offset-2 hover:no-underline"
          >
            {t("bonusNudge")}
          </button>
        )}
        {l.subscription && (
          <span className="text-sm font-semibold">{ts("everyDays", { days: l.subscription.intervalDays })}</span>
        )}
        <span className="hidden items-center gap-1.5 text-sm text-ink-2 lg:flex">
          <Icon d={ICON.truck} className="h-4 w-4" />
          {t("deliveryEta", { hours: COMMERCE.delivery.tashkent.hours })}
        </span>

        <div className="mt-1.5 flex items-center justify-between lg:hidden">
          <Stepper line={l} small />
          <div className="flex text-ink-2">
            <IconButton label={t("favoriteFor", { name: l.name })} onClick={wish} pressed={saved} d={ICON.heart} filled={saved} />
            <IconButton label={tc("removeFor", { name: l.name })} onClick={() => remove(l.lineId)} d={ICON.trash} />
          </div>
        </div>

        <div className="mt-1.5 hidden gap-5 lg:flex">
          <TextButton onClick={wish} pressed={saved} d={ICON.heart} filled={saved}>
            {tp("favorite")}
          </TextButton>
          <TextButton onClick={() => remove(l.lineId)} d={ICON.trash} label={tc("removeFor", { name: l.name })}>
            {tc("remove")}
          </TextButton>
        </div>
      </div>

      <div className="hidden lg:block">
        <Stepper line={l} />
      </div>
      <div className="hidden flex-col items-end gap-0.5 lg:flex">
        <span className="whitespace-nowrap text-xl font-bold">{formatMoney(total, locale)}</span>
        {before && <span className="text-sm text-muted line-through">{formatNumber(before)}</span>}
        {l.quantity > 1 && <span className="text-[13px] text-muted">{t("each", { price: formatMoney(Math.round(total / l.quantity), locale) })}</span>}
      </div>
    </li>
  );
}

function Stepper({ line, small = false }: { line: CartLine; small?: boolean }) {
  const tc = useTranslations("checkout");
  const common = useTranslations("common");
  const setQuantity = useCart((s) => s.setQuantity);
  return (
    <div
      role="group"
      aria-label={common("quantity")}
      className={cn("flex items-center justify-between rounded-sm bg-tile", small ? "h-11 w-[124px]" : "h-12")}
    >
      <button
        type="button"
        onClick={() => setQuantity(line.lineId, line.quantity - 1)}
        disabled={line.quantity <= 1}
        aria-label={tc("decreaseFor", { name: line.name })}
        className="flex h-full w-11 items-center justify-center text-xl font-medium disabled:opacity-40"
      >
        −
      </button>
      <span aria-live="polite" className="text-base font-bold tabular-nums">
        {line.quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity(line.lineId, line.quantity + 1)}
        disabled={line.quantity >= lineQtyCap(line)}
        aria-label={tc("increaseFor", { name: line.name })}
        className="flex h-full w-11 items-center justify-center text-xl font-medium disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

function UpsellOffer({ step, label }: { step: UpsellStep; label: string }) {
  const locale = useLocale() as Locale;
  const tc = useTranslations("checkout");
  const add = useCart((s) => s.add);
  const image = cutoutOf(step.product) ?? step.product.images[0]?.url;
  const free = step.stepType === "free_gift";

  return (
    <div className="flex w-60 shrink-0 items-center gap-2.5 rounded-[16px] bg-tile p-2.5 lg:w-auto lg:gap-3 lg:p-3">
      <span className="relative h-14 w-14 shrink-0 rounded-[12px] bg-bg lg:h-[60px] lg:w-[60px]">
        {image && <Image src={image} alt="" fill sizes="60px" className="object-contain p-1.5" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span title={step.product.name} className="line-clamp-2 text-sm leading-[18px]">{step.product.name}</span>
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="whitespace-nowrap text-[15px] font-bold lg:text-base">{free ? tc("upsellFree") : formatMoney(step.discountedPrice, locale)}</span>
          {!free && <DiscountBadge percent={step.discountPercent} />}
        </span>
      </div>
      <button
        type="button"
        aria-label={label}
        onClick={() =>
          add({
            productId: step.product.id,
            slug: step.product.slug,
            name: step.product.name,
            image: step.product.images[0]?.url ?? "",
            price: step.product.price,
            oldPrice: step.product.oldPrice,
            upsellDiscountPercent: step.discountPercent,
          })
        }
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-ink text-xl font-medium text-white transition-colors hover:bg-black"
      >
        +
      </button>
    </div>
  );
}

function IconButton({ label, onClick, d, pressed, filled }: { label: string; onClick: () => void; d: string; pressed?: boolean; filled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="flex h-11 w-11 items-center justify-center hover:text-ink"
    >
      <Icon d={d} className="h-6 w-6" filled={filled} />
    </button>
  );
}

function TextButton({
  onClick,
  d,
  pressed,
  filled,
  label,
  children,
}: {
  onClick: () => void;
  d: string;
  pressed?: boolean;
  filled?: boolean;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      className="inline-flex min-h-6 items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
    >
      <Icon d={d} className="h-4 w-4" filled={filled} />
      {children}
    </button>
  );
}

function Icon({ d, className, filled }: { d: string; className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICON = {
  truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
};
