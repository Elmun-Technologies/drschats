"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Promotion } from "@/lib/shopflow/types";

const PromotionsContext = createContext<Promotion[]>([]);

/** Server layout fetches active promotions once and feeds them to the client. */
export function PromotionsProvider({
  promotions,
  children,
}: {
  promotions: Promotion[];
  children: ReactNode;
}) {
  return (
    <PromotionsContext.Provider value={promotions}>
      {children}
    </PromotionsContext.Provider>
  );
}

export function usePromotions() {
  return useContext(PromotionsContext);
}
