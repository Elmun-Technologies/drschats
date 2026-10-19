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

/**
 * initData when this tab is a Telegram Mini App, else undefined.
 *
 * Reads the launch URL first: the shell and the checkout can mount in either
 * order, and neither may see "not a Mini App" just because the other has not
 * stored the hash yet.
 */
export function telegramInitData(): string | undefined {
  try {
    return captureInitData() ?? undefined;
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

/*
  The official Telegram SDK, loaded only when the tab really is a Mini App.

  The bridge above (`postEvent`) is enough to say "ready" and "expand", but
  the native BackButton and MainButton are *events from* Telegram, and those
  need the SDK's webview bridge. It is fetched lazily, never for a visitor in
  a browser. The CSP allows telegram.org only when the club bot is configured
  (lib/security/csp.ts).
*/

export interface TelegramWebApp {
  initData: string;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string | undefined>;
  version: string;
  ready(): void;
  expand(): void;
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
  disableVerticalSwipes?(): void;
  enableClosingConfirmation?(): void;
  openLink?(url: string): void;
  BackButton?: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  MainButton?: {
    text: string;
    isVisible: boolean;
    isEnabled: boolean;
    setText(text: string): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
    selectionChanged(): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

const SDK_URL = "https://telegram.org/js/telegram-web-app.js";
let sdkPromise: Promise<TelegramWebApp | null> | null = null;

/** Loads telegram-web-app.js once, resolving null outside Telegram or on failure. */
export function loadTelegramWebApp(timeoutMs = 4000): Promise<TelegramWebApp | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Telegram?.WebApp) return Promise.resolve(window.Telegram.WebApp);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    const done = (app: TelegramWebApp | null) => resolve(app);
    if (existing) {
      existing.addEventListener("load", () => done(window.Telegram?.WebApp ?? null), { once: true });
      existing.addEventListener("error", () => done(null), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    const timer = window.setTimeout(() => done(window.Telegram?.WebApp ?? null), timeoutMs);
    script.onload = () => {
      window.clearTimeout(timer);
      done(window.Telegram?.WebApp ?? null);
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      done(null);
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

/** True once the launch URL or session has produced Telegram's signed initData. */
export function isMiniApp(): boolean {
  return Boolean(telegramInitData());
}

/** A short vibration where Telegram supports it; silently nothing elsewhere. */
export function haptic(kind: "tap" | "success" | "error" | "select"): void {
  const app = typeof window === "undefined" ? undefined : window.Telegram?.WebApp;
  const h = app?.HapticFeedback;
  if (!h) return;
  try {
    if (kind === "success" || kind === "error") h.notificationOccurred(kind);
    else if (kind === "select") h.selectionChanged();
    else h.impactOccurred("light");
  } catch {
    // An old client without haptics must not break the click.
  }
}
