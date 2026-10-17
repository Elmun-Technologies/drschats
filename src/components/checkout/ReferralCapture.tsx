"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePromoCode } from "@/lib/promo/store";
import { normalizePromoCode } from "@/lib/promo/rules";
import { isReferralCode } from "@/lib/referral/rules";

/*
  A friend's share link (`?ref=GV7K3P9Q`, lib/referral) pre-fills the cart's
  promo field. Only the code is kept; the server decides at the cart and
  again at the order whether it applies (first order, not your own code).
  A code the customer typed themselves is not replaced.
*/
export function ReferralCapture() {
  const params = useSearchParams();
  const ref = params.get("ref");
  useEffect(() => {
    const code = normalizePromoCode(ref);
    if (!code || !isReferralCode(code)) return;
    const { code: current, setCode } = usePromoCode.getState();
    if (!current) setCode(code);
  }, [ref]);
  return null;
}
