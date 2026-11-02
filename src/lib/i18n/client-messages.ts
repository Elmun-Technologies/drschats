/*
  The slice of the message file the browser needs. Server components read the
  full file through `getRequestConfig`; only client components read what the
  layout hands `NextIntlClientProvider`, and that object is serialised into
  every page's RSC payload. Sending all of it cost ~100 KB per page, most of it
  SEO copy, legal pages and info pages no client component ever reads.

  A path is a namespace (`"cart"`) or a dotted sub-tree (`"pages.v3.partners"`).
  `client-messages.test.ts` walks every module reachable from a `"use client"`
  file and fails if one of them calls `useTranslations` with a namespace not
  covered here — add the namespace to this list, never widen it to "all".
*/
export const CLIENT_MESSAGE_PATHS = [
  "account",
  "blog.v3",
  "cart",
  "categoryNames",
  "checkout",
  "common",
  "contact",
  "cookie",
  "countdown",
  "delivery",
  "emailPreferences",
  "exit",
  "experts",
  "header",
  "health",
  "home",
  "nav",
  "outOfStock",
  "pages.v3.contact",
  "pages.v3.partners",
  "popups",
  "product",
  "profile",
  "programs",
  "quiz",
  "shop",
  "socialProof",
  "subscription",
  "track",
  "upsell",
  "wishlist",
] as const;

type Tree = { [key: string]: unknown };

export function pickMessages<T extends object>(messages: T, paths: readonly string[] = CLIENT_MESSAGE_PATHS): T {
  const out: Tree = {};
  for (const path of paths) {
    const parts = path.split(".");
    let from: unknown = messages;
    let to = out;
    for (let i = 0; i < parts.length; i++) {
      if (!from || typeof from !== "object" || !(parts[i] in from)) break;
      from = (from as Tree)[parts[i]];
      if (i === parts.length - 1) to[parts[i]] = from;
      else to = (to[parts[i]] ??= {}) as Tree;
    }
  }
  return out as T;
}
