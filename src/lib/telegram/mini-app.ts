import { STORAGE_KEYS } from "@/lib/storage-keys";

/*
  The shop opened inside Telegram as a Mini App (the club bot's "Doʻkon"
  button). Telegram appends `#tgWebAppData=<initData>` to the first URL; the
  site keeps it for the tab so the order form can send it, and the server
  checks Telegram's signature (lib/bot/webapp.ts) — nothing here is trusted.

  Events are posted the way Telegram's own telegram-web-app.js does, so the
  site needs no third-party script (and no CSP exception for one).
*/

declare global {
  interface Window {
    TelegramWebviewProxy?: { postEvent: (type: string, data: string) => void };
  }
}

/** Reads initData from the launch URL once and keeps it for the tab. */
export function captureInitData(): string | null {
  try {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const data = hash.get("tgWebAppData");
    if (data) sessionStorage.setItem(STORAGE_KEYS.telegram, data);
    return data ?? sessionStorage.getItem(STORAGE_KEYS.telegram);
  } catch {
    return null;
  }
}

/** initData when this tab is a Telegram Mini App, else undefined. */
export function telegramInitData(): string | undefined {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.telegram) ?? undefined;
  } catch {
    return undefined;
  }
}

export function postEvent(type: string, data: Record<string, unknown> = {}): void {
  const payload = JSON.stringify(data);
  try {
    if (window.TelegramWebviewProxy) {
      window.TelegramWebviewProxy.postEvent(type, payload);
    } else if (window.parent !== window) {
      // Telegram Web hosts the app in an iframe and listens for this message.
      window.parent.postMessage(JSON.stringify({ eventType: type, eventData: data }), "*");
    }
  } catch {
    // Outside Telegram, or an old client: the shop works the same without it.
  }
}
