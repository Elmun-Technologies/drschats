"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { SHOW_SAMPLE_SOCIAL_PROOF } from "@/lib/content/sample-social-proof";

/*
  Three widgets sit in the layout but none of them can be seen on first paint:
  the cart drawer waits for a click, the exit-intent popup for the pointer to
  leave the window, the purchase toast for a 35-second timer. Shipping their
  code in the initial chunk costs every visitor bytes they will mostly never
  execute.

  They are therefore imported on the first idle callback — early enough that
  the drawer is ready long before anyone reaches the cart button, late enough
  that it never competes with first paint. `isOpen` is still honoured directly
  so a click inside that first idle window cannot leave the drawer unmounted.
*/

const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false },
);
const ExitIntentPopup = dynamic(
  () => import("@/components/exit-intent/ExitIntentPopup").then((m) => m.ExitIntentPopup),
  { ssr: false },
);
const LivePurchaseToast = dynamic(
  () => import("@/components/social-proof/LivePurchaseToast").then((m) => m.LivePurchaseToast),
  { ssr: false },
);

export function DeferredUi() {
  const [ready, setReady] = useState(false);
  const cartOpen = useCart((s) => s.isOpen);

  useEffect(() => {
    const schedule =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 200);
    const handle = schedule(() => setReady(true));

    return () => {
      if (typeof window.cancelIdleCallback === "function" && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, []);

  if (!ready && !cartOpen) return null;

  return (
    <>
      <CartDrawer />
      <ExitIntentPopup />
      {/* The toast narrates purchases nobody made until the flag says a demo
          deployment wants to see it working. Kept out of the dynamic import
          above so its bundle is not even fetched when it will never render. */}
      {SHOW_SAMPLE_SOCIAL_PROOF && <LivePurchaseToast />}
    </>
  );
}
