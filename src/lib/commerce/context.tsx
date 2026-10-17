"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DEFAULT_COMMERCE_SETTINGS, pricingRulesOf, type CommerceSettings, type PricingRules } from "./settings";

const CommerceContext = createContext<CommerceSettings>(DEFAULT_COMMERCE_SETTINGS);

/** The server layout reads the commerce rules once (lib/commerce/server.ts) and hands them to the client here. */
export function CommerceProvider({ settings, children }: { settings: CommerceSettings; children: ReactNode }) {
  return <CommerceContext.Provider value={settings}>{children}</CommerceContext.Provider>;
}

export function useCommerce(): CommerceSettings {
  return useContext(CommerceContext);
}

/** The numbers `computeTotals` prices with — the same ones the checkout action uses on the server. */
export function usePricingRules(): PricingRules {
  const settings = useCommerce();
  return useMemo(() => pricingRulesOf(settings), [settings]);
}
