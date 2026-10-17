"use server";

import { redirect } from "next/navigation";
import { isDbConfigured } from "@/lib/db/client";
import { recordOptOut } from "@/lib/messaging/optout";
import { verifyStopToken } from "@/lib/messaging/tokens";

/*
  The "stop" button on /[locale]/stop/[token]. The signed token is the
  authorisation, exactly like the email unsubscribe link: no account, no
  phone confirmation — stopping messages must be easier than receiving them.
*/
export async function stopMarketingMessages(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const scope = form.get("scope") === "all" ? "all" : "channel";
  const payload = verifyStopToken(token);
  if (!payload || !isDbConfigured) redirect("/");
  try {
    await recordOptOut(payload.phone9, scope === "all" ? "all" : payload.channel, `link:${payload.channel}`);
  } catch (err) {
    console.error("[optout] not recorded:", (err as Error).message);
    redirect(`/${payload.locale}/stop/${token}?error=1`);
  }
  redirect(`/${payload.locale}/stop/${token}?done=${scope}`);
}
