// Bumped with the rebrand: activation deletes every other cache, including the
// old one that could hold error responses (see the cache-first branch).
const CACHE_NAME = "govita-v2";
const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Server actions (the order form, sign-up forms) are POSTs: never touch them.
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Network-first for API and Next.js data
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data/")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets
  if (request.destination === "image" || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ?? fetch(request).then((res) => {
          // Only a good response is worth keeping: a cached 404 or 500 would
          // show as a broken image on that device for good.
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
      )
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
