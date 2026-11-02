"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { useCart } from "@/lib/cart/store";
import { rememberOrder, type RememberedOrder } from "@/lib/orders/last-order";
import { Button } from "@/components/ui/Button";

export interface ReorderLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Today's catalogue price — never the old order's. */
  price: number;
  oldPrice?: number;
  saleEndsAt?: string;
  quantity: number;
}

/*
  «Takrorlash»: the order's products go back into the cart at today's prices
  (offer discounts and subscriptions are not carried over — the cart and the
  server price them afresh), then the cart opens. Lines no longer sold are
  left out by the page.
*/
export function ReorderButton({ lines }: { lines: ReorderLine[] }) {
  const t = useTranslations("track");
  const router = useRouter();
  const add = useCart((s) => s.add);
  if (lines.length === 0) return null;
  return (
    <Button
      type="button"
      onClick={() => {
        for (const { quantity, ...line } of lines) add(line, quantity, { silent: true });
        router.push("/cart");
      }}
    >
      {t("reorder")}
    </Button>
  );
}

/*
  An order opened from its SMS or Telegram link joins «Buyurtmalarim» in this
  browser, like one placed here — the signed link is all the list keeps.
*/
export function RememberOrder({ entry }: { entry: Omit<RememberedOrder, "at"> & { at: string } }) {
  useEffect(() => {
    rememberOrder(entry);
  }, [entry]);
  return null;
}
