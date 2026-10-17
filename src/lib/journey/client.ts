import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { VisitorEventType } from "@/lib/db/schema";

/*
  Browser half of the first-party journey (server: app/api/t). Events are
  batched for a moment and sent with sendBeacon, so tracking never delays a
  click or a navigation. The visitor id lives in an httpOnly cookie the
  server sets; this side only knows its session.
*/

type ClientEvent = { type: Exclude<VisitorEventType, "purchase">; path?: string; slug?: string; value?: number; term?: string };
type Cart = { value: number; items: { slug: string; name: string; quantity: number; price: number }[] };

const SESSION_IDLE_MS = 30 * 60 * 1000;
const FLUSH_MS = 1200;
// A click that moves the journey is sent at once: the next tap is often a navigation.
const URGENT = new Set<ClientEvent["type"]>(["page_view", "add_to_cart", "remove_from_cart", "begin_checkout"]);

let queue: ClientEvent[] = [];
let pendingCart: Cart | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function disabled(): boolean {
  return typeof window === "undefined" || typeof document === "undefined" || navigator.webdriver === true;
}

type Session = { sid: string; at: number; entry?: { landing: string; referrer: string } };

/*
  The session remembers how it began — landing URL and outside referrer — and
  every batch carries it. Sending it only once lost the source whenever that
  first beacon died with a fast navigation.
*/
function session(): Session {
  const now = Date.now();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.journey);
    const saved = raw ? (JSON.parse(raw) as Session) : null;
    const current: Session =
      saved?.sid && saved.at && now - saved.at < SESSION_IDLE_MS
        ? { ...saved, at: now }
        : { sid: crypto.randomUUID().replace(/-/g, ""), at: now, entry: { landing: location.href, referrer: document.referrer } };
    sessionStorage.setItem(STORAGE_KEYS.journey, JSON.stringify(current));
    return current;
  } catch {
    return { sid: "nostorage00", at: now };
  }
}

function locale(): "uz" | "ru" | undefined {
  const lang = document.documentElement.lang.slice(0, 2);
  return lang === "ru" || lang === "uz" ? lang : undefined;
}

function flush() {
  timer = null;
  if (queue.length === 0 && !pendingCart) return;
  const { sid, entry } = session();
  const body = JSON.stringify({
    sid,
    locale: locale(),
    ...(entry ? { entry } : {}),
    events: queue.splice(0, 25),
    ...(pendingCart ? { cart: pendingCart } : {}),
  });
  pendingCart = null;
  const blob = new Blob([body], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/t", blob)) {
    fetch("/api/t", { method: "POST", body, keepalive: true, credentials: "same-origin", headers: { "Content-Type": "application/json" } }).catch(() => {});
  }
  if (queue.length > 0) schedule();
}

function schedule() {
  if (!listening) {
    listening = true;
    addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }
  if (!timer) timer = setTimeout(flush, FLUSH_MS);
}

export function journey(event: ClientEvent) {
  if (disabled()) return;
  session();
  queue.push(event);
  schedule();
  if (URGENT.has(event.type)) queueMicrotask(flush);
}

export function journeyPage(path: string) {
  journey({ type: "page_view", path });
}

/** The cart as it is now; the latest snapshot wins. */
export function journeyCart(cart: Cart) {
  if (disabled()) return;
  session();
  pendingCart = cart;
  schedule();
}
