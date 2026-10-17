"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { checkCartPromo, type CartPromoInput, type CartPromoQuote } from "@/app/actions/promo";
import { usePromoCode } from "@/lib/promo/store";
import type { CartLine } from "@/lib/cart/pricing";
import type { Locale } from "@/lib/i18n/routing";

type OkQuote = Extract<CartPromoQuote, { ok: true }>;
export type PromoFailure = { reason: string; remaining?: number; minSubtotal?: number };

/** Errors that depend on the cart, not the code: the code stays, and starts working once the cart qualifies. */
const CART_DEPENDENT = new Set(["min_subtotal", "not_applicable"]);

const DEBOUNCE_MS = 600;

function itemsOf(lines: CartLine[]): CartPromoInput["items"] {
  return lines.map((l) => ({ slug: l.slug, quantity: l.quantity, upsellDiscountPercent: l.upsellDiscountPercent, subscription: l.subscription }));
}

/**
 * The cart's order-level discount, as the server prices it: the applied promo
 * code (kept in `govita-promo`) and the automatic first-order discount once a
 * full phone number is typed. Re-asked, debounced, whenever the lines, the
 * phone or the code change; a stale answer never overwrites a newer one.
 */
export function useCartDiscount({ enabled, lines, phone, locale }: { enabled: boolean; lines: CartLine[]; phone: string; locale: Locale }) {
  const code = usePromoCode((s) => s.code);
  const setCode = usePromoCode((s) => s.setCode);
  const [quote, setQuote] = useState<OkQuote | null>(null);
  const [failure, setFailure] = useState<PromoFailure | null>(null);
  const [pending, setPending] = useState(false);
  const seq = useRef(0);

  const digits = phone.replace(/\D/g, "");
  const phone9 = digits.length >= 9 ? digits.slice(-9) : "";
  const linesKey = lines.map((l) => `${l.lineId}x${l.quantity}`).join(",");
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const ask = useCallback(
    async (withCode: string | null) => {
      const current = linesRef.current;
      if (current.length === 0) return null;
      const id = ++seq.current;
      const res = await checkCartPromo({ code: withCode ?? undefined, phone: phone9 || undefined, locale, items: itemsOf(current) }).catch(
        () => ({ ok: false, error: "invalid" }) as const,
      );
      return id === seq.current ? res : null;
    },
    [phone9, locale],
  );

  useEffect(() => {
    if (!enabled || lines.length === 0 || (!code && !phone9)) {
      seq.current++;
      setQuote(null);
      return;
    }
    const timer = window.setTimeout(async () => {
      const res = await ask(code);
      if (!res) return;
      if (!res.ok) {
        setQuote(null);
        // The code stays in the field but is not sent with the order; say so instead of showing it as applied.
        if (code) setFailure({ reason: res.error === "rate_limited" ? "rate_limited" : "failed" });
        return;
      }
      setQuote(res);
      if (res.promo && !res.promo.ok) {
        setFailure({ reason: res.promo.reason, remaining: res.promo.remaining, minSubtotal: res.promo.minSubtotal });
        if (!CART_DEPENDENT.has(res.promo.reason)) setCode(null);
      } else if (res.promo?.ok) setFailure(null);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // linesKey stands for the lines; the ref holds their current value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, code, phone9, linesKey, ask, setCode]);

  /** Check a typed code now; it is kept only if the server accepts it (or would, once the cart qualifies). */
  const apply = useCallback(
    async (raw: string) => {
      const typed = raw.trim();
      if (!typed) return;
      setPending(true);
      setFailure(null);
      const res = await ask(typed);
      setPending(false);
      if (!res) return;
      if (!res.ok) {
        setFailure({ reason: res.error === "rate_limited" ? "rate_limited" : "failed" });
        return;
      }
      setQuote(res);
      if (res.promo?.ok) {
        setCode(res.promo.code);
      } else if (res.promo) {
        setFailure({ reason: res.promo.reason, remaining: res.promo.remaining, minSubtotal: res.promo.minSubtotal });
        if (CART_DEPENDENT.has(res.promo.reason) && res.promo.code) setCode(res.promo.code);
      }
    },
    [ask, setCode],
  );

  const remove = useCallback(() => {
    setCode(null);
    setFailure(null);
  }, [setCode]);

  /** The server refused the code at order time: drop it and say why. */
  const reject = useCallback(
    (reason: string) => {
      setCode(null);
      setFailure({ reason });
    },
    [setCode],
  );

  const promoOk = quote?.promo?.ok ? quote.promo : null;
  const applied = enabled && quote?.applied && !((quote.applied.kind === "promo" || quote.applied.kind === "referral") && quote.applied.code !== code) ? quote.applied : null;
  return {
    code,
    quote,
    failure,
    pending,
    apply,
    remove,
    reject,
    /** The code to send with the order: only one the server just accepted. */
    orderCode: promoOk && promoOk.code === code ? code : undefined,
    applied,
  };
}
