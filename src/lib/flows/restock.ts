import { enrollSubject } from "./engine";

/*
  The hook for "tell me when it is back in stock" requests (lib/notify/, the
  stock-quantity work). When a product returns, its notifier calls this for
  each waiting customer; the customer is enrolled in the "restock" flow and
  gets its message through the same outbox — Telegram if linked, else SMS,
  quiet hours, opt-out, the click link and attribution included.

  Returns false when the flow is switched off (or has no steps), so the
  caller can fall back to its own channel (e.g. the operator); "duplicate"
  counts as handled — the customer was already told about this restock.
*/

export interface RestockMessage {
  phone: string;
  productSlug: string;
  productName: string;
  locale?: "uz" | "ru";
  name?: string | null;
  /** Identifies the restock event, so one arrival notifies a customer once. Defaults to the day. */
  restockId?: string;
}

export async function enqueueRestockMessage(input: RestockMessage): Promise<boolean> {
  const phone9 = input.phone.replace(/\D/g, "").slice(-9);
  if (phone9.length !== 9) return false;
  const day = new Date().toISOString().slice(0, 10);
  const outcome = await enrollSubject({
    flowId: "restock",
    subject: phone9,
    cycle: `${input.productSlug}:${input.restockId ?? day}`.slice(0, 120),
    context: {
      name: input.name ?? null,
      locale: input.locale ?? "uz",
      productName: input.productName,
      link: `/product/${input.productSlug}`,
    },
  });
  return outcome !== "inactive";
}
