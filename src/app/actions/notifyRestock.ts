"use server";

import { track } from "@/lib/analytics/events";

export async function notifyRestock(productId: string, productName: string, phone: string) {
  // Log to dataLayer / GTM via server-side event (client fires its own track)
  // In production this could also send to a CRM or backend webhook
  console.log(`[restock-notify] productId=${productId} phone=${phone}`);
  return { ok: true };
}
