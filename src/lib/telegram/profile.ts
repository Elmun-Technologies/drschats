import { verifyInitData } from "@/lib/bot/webapp";
import { linkOf } from "@/lib/bot/store";

/*
  What the Mini App may know about the customer it is already talking to.

  The phone comes from telegram_links — the number the customer shared with
  the bot through Telegram's own contact button — never from the page. The
  initData signature is checked on every call, so a copied string from another
  account does not turn into somebody else's profile.
*/

export interface MiniAppProfile {
  name: string;
  /** `+998…` when the chat has linked a number through the bot, else null. */
  phone: string | null;
}

export async function miniAppProfile(initData: string | undefined): Promise<MiniAppProfile | null> {
  const user = verifyInitData(initData);
  if (!user) return null;
  let link = null;
  try {
    link = await linkOf(user.id);
  } catch {
    // Without a database there is nothing to link; the form stays editable.
    return { name: user.firstName ?? "", phone: null };
  }
  return {
    name: link?.name || user.firstName || "",
    phone: link?.phone ? `+${link.phone}` : null,
  };
}
